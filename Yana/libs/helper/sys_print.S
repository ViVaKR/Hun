
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
message: .asciz "안녕하세요 반갑습니다.\n"

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION
FUNC_START_FULL run_sys_print, 128

	adrp x0, message@PAGE
	add  x0, x0, message@PAGEOFF
  
	bl _sys_print

FUNC_EXIT_FULL 128