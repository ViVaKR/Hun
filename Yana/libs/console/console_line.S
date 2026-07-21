
.include "section_macros.inc"
.global  _console_line

CSTRING_SECTION
char_format: .asciz "%s" // 기호 1개 출력용 (%s 또는 %c)
newline:     .asciz "\n" // 줄바꿈

CODE_SECTION
_console_line:
	stp x29, x30, [sp, #-32]!
	stp x19, x20, [sp, #16]
	mov x29, sp

	mov x19, x0
	mov x20, x1

.L_line_loop:
	cmp  x19, #0
	b.eq .L_line_end
  
	adrp x0, char_format@PAGE
	add  x0, x0, char_format@PAGEOFF
	mov  x1, x20
	sub  sp, sp, #16
	str  x1, [sp, #0]
	bl   _printf 
	add  sp, sp, #16

	sub x19, x19, #1
	b   .L_line_loop

.L_line_end:
	adrp x0, newline@PAGE
	add  x0, x0, newline@PAGEOFF
	bl   _printf

	ldp x19, x20, [sp, #16]
	ldp x29, x30, [sp], #32
  ret