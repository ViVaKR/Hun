"""
한글어(HanGeulEo) 렉서
=====================
소스 코드 문자열을 토큰(Token) 리스트로 분해하는 첫 단계.
정규식으로 숫자/문자열/식별자(한글 포함)/연산자/키워드를 인식한다.
"""

import re
from dataclasses import dataclass

# 예약어: 파서가 이 단어들을 문법 구조로 취급한다
KEYWORDS = {"변수", "출력", "만약", "이면", "아니면", "반복", "번", "시작", "끝"}

# 토큰 정규식 (순서 중요: 긴 연산자를 짧은 것보다 먼저 검사)
TOKEN_SPEC = [
    ("NUMBER",   r"\d+(\.\d+)?"),
    ("STRING",   r'"[^"]*"'),
    # 한글 음절(\uAC00-\uD7A3) + 영문자 + 밑줄 + 숫자를 식별자로 허용
    ("IDENT",    r"[\uAC00-\uD7A3A-Za-z_][\uAC00-\uD7A3A-Za-z0-9_]*"),
    ("EQEQ",     r"=="),
    ("EQ",       r"="),
    ("GT",       r">"),
    ("LT",       r"<"),
    ("PLUS",     r"\+"),
    ("MINUS",    r"-"),
    ("STAR",     r"\*"),
    ("SLASH",    r"/"),
    ("LPAREN",   r"\("),
    ("RPAREN",   r"\)"),
    ("NEWLINE",  r"\n"),
    ("SKIP",     r"[ \t]+"),
    ("COMMENT",  r"#.*"),
]

MASTER_RE = re.compile("|".join(f"(?P<{name}>{pattern})" for name, pattern in TOKEN_SPEC))


@dataclass
class Token:
    kind: str      # 토큰 종류 (KEYWORD, IDENT, NUMBER, STRING, 연산자 이름...)
    value: str     # 원본 텍스트 값
    line: int      # 에러 메시지용 줄 번호


def tokenize(source: str) -> list[Token]:
    tokens: list[Token] = []
    line = 1
    pos = 0
    while pos < len(source):
        match = MASTER_RE.match(source, pos)
        if not match:
            raise SyntaxError(f"{line}번째 줄: 인식할 수 없는 문자 '{source[pos]}'")

        kind = match.lastgroup
        text = match.group()
        pos = match.end()

        if kind == "NEWLINE":
            line += 1
            continue
        if kind in ("SKIP", "COMMENT"):
            continue

        # 식별자가 예약어 목록에 있으면 종류를 KEYWORD로 승격
        if kind == "IDENT" and text in KEYWORDS:
            kind = "KEYWORD"

        if kind == "STRING":
            text = text[1:-1]  # 양쪽 큰따옴표 제거

        tokens.append(Token(kind, text, line))

    tokens.append(Token("EOF", "", line))
    return tokens
