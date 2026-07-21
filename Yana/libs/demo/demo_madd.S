.include "section_macros.inc"
.global  _demo_madd

BSS_SECTION
CONST_DATA_SECTION
DATA_SECTION
CONST_SECTION
CSTRING_SECTION
CODE_SECTION

_demo_madd:
  // 프롤로그
	stp x29, x30, [sp, #-48]!
	mov x29, sp
	stp x19, x20, [sp, #16]

	mov x0, #-100
	mov x1, #10
  
	sdiv x2, x0, x1         // -10
	madd x3, x1, x2, x0     // x3 = (10 * -10) + -100 = -200
	msub x4, x1, x2, x0     // x4 = (10 * -10) - -100 = 0

  // 에필로그
	ldp x19, x20, [sp, #16]
	mov x0, #0
	ldp x29, x30, [sp], #48
  ret