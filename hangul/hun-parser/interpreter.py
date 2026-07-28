"""
한글어 인터프리터
==================
AST를 직접 순회하며 실행하는 가장 단순한 형태(tree-walking interpreter).
나중에 LLVM IR로 갈아탈 때는 이 파일 대신 codegen.py를 만들어서
같은 AST를 입력으로 받아 LLVM IR을 뱉도록 바꾸면 된다.
"""

from ast_nodes import (
    Program, VarAssign, Print, If, Repeat,
    BinOp, Num, Str, Ident,
)


class HangulRuntimeError(Exception):
    pass


class Interpreter:
    def __init__(self):
        self.env: dict[str, object] = {}

    def run(self, program: Program):
        for stmt in program.statements:
            self.exec_stmt(stmt)

    # ── 문장 실행 ────────────────────────────────────────
    def exec_stmt(self, stmt):
        if isinstance(stmt, VarAssign):
            self.env[stmt.name] = self.eval_expr(stmt.expr)
        elif isinstance(stmt, Print):
            print(self.eval_expr(stmt.expr))
        elif isinstance(stmt, If):
            if self.eval_expr(stmt.cond):
                for s in stmt.then_block:
                    self.exec_stmt(s)
            elif stmt.else_block is not None:
                for s in stmt.else_block:
                    self.exec_stmt(s)
        elif isinstance(stmt, Repeat):
            count = self.eval_expr(stmt.count_expr)
            for _ in range(int(count)):
                for s in stmt.body:
                    self.exec_stmt(s)
        else:
            raise HangulRuntimeError(f"알 수 없는 문장 타입: {stmt}")

    # ── 표현식 평가 ──────────────────────────────────────
    def eval_expr(self, expr):
        if isinstance(expr, Num):
            return expr.value
        if isinstance(expr, Str):
            return expr.value
        if isinstance(expr, Ident):
            if expr.name not in self.env:
                raise HangulRuntimeError(f"정의되지 않은 변수: '{expr.name}'")
            return self.env[expr.name]
        if isinstance(expr, BinOp):
            left = self.eval_expr(expr.left)
            right = self.eval_expr(expr.right)
            if expr.op == "+":
                return left + right
            if expr.op == "-":
                return left - right
            if expr.op == "*":
                return left * right
            if expr.op == "/":
                return left / right
            if expr.op == ">":
                return left > right
            if expr.op == "<":
                return left < right
            if expr.op == "==":
                return left == right
        raise HangulRuntimeError(f"알 수 없는 표현식: {expr}")
