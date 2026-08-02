.include "section_macros.inc"

// [초기화된 변수]
// __DATA,__data
DATA_SECTION

// [읽기전용 변수/포인터 테이블]
// __DATA,__const
CONST_DATA_SECTION

// [읽기전용 상수 데이터]
//__TEXT,__const
CONST_SECTION

// [C-스타일 문자열 리터럴]
// __TEXT,__cstring,cstring_literals
CSTRING_SECTION

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION
// ----------------------------------------
// long long string_to_number(char* str)
// 문자열을 long long 정수로 변환 (C의 atoll과 동일한 역할, 직접 구현)
//
// 처리 순서:
//   1) 맨 앞에 '-' 또는 '+' 부호가 있으면 기억해두고 한 칸 건너뜀
//   2) '0'~'9' 범위의 문자를 만나는 동안 계속:
//        결과 = 결과 * 10 + (문자 - '0')
//   3) 숫자가 아닌 문자(공백, NUL 등)를 만나면 즉시 멈춤
//   4) 마지막에 부호를 곱해서 반환
//
//   x19 = str (현재 읽고 있는 위치, 포인터 이동)
//   x20 = result (누적된 결과값)
//   x21 = sign (+1 또는 -1)
// ----------------------------------------
FUNC_START_FULL string_to_number, 96

	mov x19, x0  // str 시작주소
	mov x20, #0  // result = 0
	mov x21, #1  // sign = +1
  
  // 부호확인
	ldrb w0, [x19]  // 첫 글자 하나 읽기
  

FUNC_EXIT_FULL 96