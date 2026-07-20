.include "section_macros.inc"
.global  _menu_loop_int

CSTRING_SECTION

CODE_SECTION
 _menu_loop_in:
	stp	x29, x30, [sp, #-16]!
	mov	x29, sp

  

	ldp	x29, x30, [sp], #16
  ret