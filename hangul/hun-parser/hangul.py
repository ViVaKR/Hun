#!/usr/bin/env python3
"""
한글어 실행기
=============
사용법: python3 hangul.py 예제.han
"""

import sys

from lexer import tokenize
from parser import Parser, ParseError
from interpreter import Interpreter, HangulRuntimeError


def main():
    if len(sys.argv) != 2:
        print("사용법: python3 hangul.py <파일.han>")
        sys.exit(1)

    path = sys.argv[1]
    with open(path, encoding="utf-8") as f:
        source = f.read()

    try:
        tokens = tokenize(source)
        program = Parser(tokens).parse_program()
        Interpreter().run(program)
    except SyntaxError as e:
        print(f"[렉서 에러] {e}")
        sys.exit(1)
    except ParseError as e:
        print(f"[파서 에러] {e}")
        sys.exit(1)
    except HangulRuntimeError as e:
        print(f"[실행 에러] {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
