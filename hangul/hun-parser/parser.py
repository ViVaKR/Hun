"""
한글어 파서
===========
문법 (EBNF 비슷하게):

    program    := statement*
    statement  := var_assign | print_stmt | if_stmt | repeat_stmt
    var_assign := "변수" IDENT "=" expr
    print_stmt := "출력" expr
    if_stmt    := "만약" expr "이면" "시작" statement* ("아니면" "시작" statement*)? "끝"
    repeat_stmt:= "반복" expr "번" "시작" statement* "끝"

    expr       := comparison
    comparison := additive (("==" | ">" | "<") additive)*
    additive   := term (("+" | "-") term)*
    term       := factor (("*" | "/") factor)*
    factor     := NUMBER | STRING | IDENT | "(" expr ")"
"""

from lexer import Token
from ast_nodes import (
    Program, VarAssign, Print, If, Repeat,
    BinOp, Num, Str, Ident,
)


class ParseError(Exception):
    pass


class Parser:
    def __init__(self, tokens: list[Token]):
        self.tokens = tokens
        self.pos = 0

    # ── 유틸리티 ─────────────────────────────────────────
    def peek(self) -> Token:
        return self.tokens[self.pos]

    def advance(self) -> Token:
        tok = self.tokens[self.pos]
        self.pos += 1
        return tok

    def check_keyword(self, word: str) -> bool:
        tok = self.peek()
        return tok.kind == "KEYWORD" and tok.value == word

    def expect_keyword(self, word: str) -> Token:
        if not self.check_keyword(word):
            tok = self.peek()
            raise ParseError(f"{tok.line}번째 줄: '{word}'가 필요한데 '{tok.value}'가 나왔습니다")
        return self.advance()

    def expect_kind(self, kind: str) -> Token:
        tok = self.peek()
        if tok.kind != kind:
            raise ParseError(f"{tok.line}번째 줄: {kind} 토큰이 필요한데 '{tok.value}'가 나왔습니다")
        return self.advance()

    # ── 최상위 ───────────────────────────────────────────
    def parse_program(self) -> Program:
        statements = []
        while self.peek().kind != "EOF":
            statements.append(self.parse_statement())
        return Program(statements)

    def parse_block_until(self, *stop_words: str) -> list:
        """다음 토큰이 stop_words 중 하나가 나올 때까지 문장을 계속 파싱"""
        statements = []
        while not any(self.check_keyword(w) for w in stop_words):
            if self.peek().kind == "EOF":
                raise ParseError("블록이 '끝'으로 닫히지 않았습니다")
            statements.append(self.parse_statement())
        return statements

    # ── 문장 ─────────────────────────────────────────────
    def parse_statement(self):
        if self.check_keyword("변수"):
            return self.parse_var_assign()
        if self.check_keyword("출력"):
            return self.parse_print()
        if self.check_keyword("만약"):
            return self.parse_if()
        if self.check_keyword("반복"):
            return self.parse_repeat()

        tok = self.peek()
        raise ParseError(f"{tok.line}번째 줄: 문장을 시작할 수 없는 토큰 '{tok.value}'")

    def parse_var_assign(self) -> VarAssign:
        self.expect_keyword("변수")
        name_tok = self.expect_kind("IDENT")
        self.expect_kind("EQ")
        expr = self.parse_expr()
        return VarAssign(name_tok.value, expr)

    def parse_print(self) -> Print:
        self.expect_keyword("출력")
        expr = self.parse_expr()
        return Print(expr)

    def parse_if(self) -> If:
        self.expect_keyword("만약")
        cond = self.parse_expr()
        self.expect_keyword("이면")
        self.expect_keyword("시작")
        then_block = self.parse_block_until("아니면", "끝")

        else_block = None
        if self.check_keyword("아니면"):
            self.advance()
            self.expect_keyword("시작")
            else_block = self.parse_block_until("끝")

        self.expect_keyword("끝")
        return If(cond, then_block, else_block)

    def parse_repeat(self) -> Repeat:
        self.expect_keyword("반복")
        count_expr = self.parse_expr()
        self.expect_keyword("번")
        self.expect_keyword("시작")
        body = self.parse_block_until("끝")
        self.expect_keyword("끝")
        return Repeat(count_expr, body)

    # ── 표현식 (연산자 우선순위: 비교 < 덧뺄셈 < 곱나눗셈) ──
    def parse_expr(self):
        return self.parse_comparison()

    def parse_comparison(self):
        left = self.parse_additive()
        while self.peek().kind in ("EQEQ", "GT", "LT"):
            op_tok = self.advance()
            op = {"EQEQ": "==", "GT": ">", "LT": "<"}[op_tok.kind]
            right = self.parse_additive()
            left = BinOp(op, left, right)
        return left

    def parse_additive(self):
        left = self.parse_term()
        while self.peek().kind in ("PLUS", "MINUS"):
            op_tok = self.advance()
            op = "+" if op_tok.kind == "PLUS" else "-"
            right = self.parse_term()
            left = BinOp(op, left, right)
        return left

    def parse_term(self):
        left = self.parse_factor()
        while self.peek().kind in ("STAR", "SLASH"):
            op_tok = self.advance()
            op = "*" if op_tok.kind == "STAR" else "/"
            right = self.parse_factor()
            left = BinOp(op, left, right)
        return left

    def parse_factor(self):
        tok = self.peek()
        if tok.kind == "NUMBER":
            self.advance()
            return Num(float(tok.value) if "." in tok.value else int(tok.value))
        if tok.kind == "STRING":
            self.advance()
            return Str(tok.value)
        if tok.kind == "IDENT":
            self.advance()
            return Ident(tok.value)
        if tok.kind == "LPAREN":
            self.advance()
            expr = self.parse_expr()
            self.expect_kind("RPAREN")
            return expr
        raise ParseError(f"{tok.line}번째 줄: 예상치 못한 토큰 '{tok.value}'")
