.include "section_macros.inc"
.global  _menu_welcome_rust

CSTRING_SECTION

DATA_SECTION
to_print_message: .asciz "안녕! 러스트.\n"
to_print_message_end:

CODE_SECTION

_menu_welcome_rust:

	stp x29, x30, [sp, #-16]!
	mov x29, sp

	mov x0, #108
	bl  _welcome_rust

	adrp x0, to_print_message@PAGE
	add  x0, x0, to_print_message@PAGEOFF
	adrp x1, to_print_message_end@PAGE
	add  x1, x1, to_print_message_end@PAGEOFF 
	sub  x1, x1, x0

	bl _to_print

	mov x0, #0

	ldp x29, x30, [sp], #16

  ret