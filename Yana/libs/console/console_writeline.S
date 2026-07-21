
.include "section_macros.inc"
.global  _console_writeline

CSTRING_SECTION
char_format: .asciz "%s" // 기호 1개 출력용 (%s 또는 %c)
newline:     .asciz "\n" // 줄바꿈

CODE_SECTION

_console_writeline:

	stp x29, x30, [sp, #-32]!
	mov x29, sp
	stp x19, x20, [sp, #16]
	
	mov x19, x0	

	adrp x0, char_format@PAGE
	add  x0, x0, char_format@PAGEOFF
	
	sub sp, sp, #16
	str x19, [sp, #0]
	bl  _printf 
	add sp, sp, #16
	sub x19, x19, #1

.L_writeline_end:
	adrp x0, newline@PAGE
	add  x0, x0, newline@PAGEOFF
	bl   _printf
  

	ldp x19, x20, [sp, #16]
	ldp x29, x30, [sp], #32
  ret