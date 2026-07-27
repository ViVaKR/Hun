.include "section_macros.inc"

// [초기화된 변수]
// __DATA,__data
DATA_SECTION

// [읽기전용 변수/포인터 테이블]
// __DATA,__const
CONST_DATA_SECTION
fib_result: .asciz "--> %lld\n"
// [읽기전용 상수 데이터]
//__TEXT,__const
CONST_SECTION

// [C-스타일 문자열 리터럴]
// __TEXT,__cstring,cstring_literals
CSTRING_SECTION

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION
	FUNC_START_FULL fib_print, 128

	bl             _fib
	mov            x19, x0
	adrp           x0, fib_result@PAGE
	add            x0, x0, fib_result@PAGEOFF
  
	sub            sp, sp, #16
	str            x19, [sp, #0]
	bl             _printf
	add            sp, sp, #16 
	FUNC_EXIT_FULL 128