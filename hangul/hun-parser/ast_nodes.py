"""
AST 노드 정의
=============
파서가 만들어내는 트리의 각 노드 타입.
전부 그냥 데이터 컨테이너 — 실제 동작은 interpreter.py 에서 처리한다.
"""

from dataclasses import dataclass


# ── 표현식(값을 만들어내는 것) ──────────────────────────────
@dataclass
class Num:
    value: float


@dataclass
class Str:
    value: str


@dataclass
class Ident:
    name: str


@dataclass
class BinOp:
    op: str        # '+', '-', '*', '/', '>', '<', '=='
    left: object
    right: object


# ── 문장(실행되는 동작) ─────────────────────────────────────
@dataclass
class VarAssign:
    name: str
    expr: object


@dataclass
class Print:
    expr: object


@dataclass
class If:
    cond: object
    then_block: list
    else_block: list | None


@dataclass
class Repeat:
    count_expr: object
    body: list


@dataclass
class Program:
    statements: list
