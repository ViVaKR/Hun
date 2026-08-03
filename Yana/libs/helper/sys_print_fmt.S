.include "section_macros.inc"

// [초기화된 변수]
// __DATA,__data
DATA_SECTION
// FfiArg 배열 구성 (Rust의 enum 구조체에 맞춰 값 전달)
// [ARg 1: 문자열 포인터 (enum tag 1 + ptr)], [Arg 2: 정수값 (enum tag 0 + 10)]
args_array:
  .quad 1       // Tag: Str(1)
  .quad arg_str // Pointer to "이순신 대제독"
  .quad 0       // Tag: Int (0)
  .quad 10      // Value: 10 (마하 10)


// [읽기전용 변수/포인터 테이블]
// __DATA,__const
CONST_DATA_SECTION

// [읽기전용 상수 데이터]
//__TEXT,__const
CONST_SECTION

// [C-스타일 문자열 리터럴]
// __TEXT,__cstring,cstring_literals
CSTRING_SECTION
fmt_msg: .asciz "반갑습니다 {} 님! 함선 속도는 마하 {} 입니다.\n"
arg_str: .asciz "이순신 대제독"

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION
FUNC_START_FULL run_sys_print_fmt, 128

	// x0 = 포맷 문자열 주소
	adrp x0, fmt_msg@PAGE
	add  x0, x0, fmt_msg@PAGEOFF

	// x1 = 인자 배열 (args_array) 주소
	adrp x1, args_array@PAGE
	add  x1, x1, args_array@PAGEOFF

	// x2 = 인자 갯수 (2개)
	mov x2, #2

	// Rust 동적 포맷팅 함수 호출
	bl _sys_print_fmt

FUNC_EXIT_FULL 128