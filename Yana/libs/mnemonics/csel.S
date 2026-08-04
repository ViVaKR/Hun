.include "section_macros.inc"

CODE_SECTION
FUNC_START_FULL csel, 128
	
	// 지역변수 2개
	sub sp, sp, #16

	// 프롬프트 출력
	adrp x0, _input_prompt_numbers@PAGE
	add  x0, x0, _input_prompt_numbers@PAGEOFF
	bl   _printf

	adrp x0, _fmt_scanf_2@PAGE
	add  x0, x0, _fmt_scanf_2@PAGEOFF
	
	add x1, sp, #0  // &a, local a address : sp + 0
	add x2, sp, #8  // &b, local b address : sp + 8

	sub sp, sp, #16
	stp x1, x2, [sp, #0]
	bl  _scanf
	add sp, sp, #16
	
	ldp x21, x22, [sp, #0]

	cmp  x21, x22
	csel x0, x21, x22, ge
	mov  x9, x0

	sub  sp, sp, #16
	str  x9, [sp, #0]
	adrp x0, _fmt_result@PAGE
	add  x0, x0, _fmt_result@PAGEOFF
	bl   _printf
	add  sp, sp, #16
	
	// 지역변수 해제
	add sp, sp, #16

FUNC_EXIT_FULL 128