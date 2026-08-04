.include "section_macros.inc"
CODE_SECTION
FUNC_START_FULL if_else, 128
    
	// 지역변수 2개 공간
	sub sp, sp, #16
    
	// 안내 메시지
	adrp x0, _input_prompt_numbers@PAGE
	add  x0, x0, _input_prompt_numbers@PAGEOFF
	bl   _printf
    
	adrp x0, _fmt_scanf_2@PAGE
	add  x0, x0, _fmt_scanf_2@PAGEOFF
    
	add x1, sp, #0
	add x2, sp, #8
    
	sub sp, sp, #16
	stp x1, x2, [sp, #0]
	bl  _scanf
	add sp, sp, #16
    
	ldp  x21, x22, [sp, #0]
	cmp  x21, x22
	b.ne .L_else

.L_if:
	mul x10, x21, x22
	b   .L_end
.L_else:
	mov x10, #0
    
.L_end:
	adrp x0, _fmt_result@PAGE
	add  x0, x0, _fmt_result@PAGEOFF
	sub  sp, sp, #16
	str  x10, [sp, #0]
	bl   _printf
	add  sp, sp, #16
	
	// 지역변수 메모리 해제
	add sp, sp, #16
	mov x0, #0

FUNC_EXIT_FULL 128