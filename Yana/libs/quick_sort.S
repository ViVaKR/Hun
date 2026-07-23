
.include "section_macros.inc"
.global  _quick_sort
BSS_SECTION
CONST_DATA_SECTION
DATA_SECTION
CONST_SECTION
CSTRING_SECTION
CODE_SECTION
_quick_sort:
  // 프롤로그
	stp x29, x30, [sp, #-48]!
	mov x29, sp
	stp x19, x20, [sp, #16]
	adrp
  // 에필로그
	ldp x19, x20, [sp, #16]
	mov x0, #0
	ldp x29, x30, [sp], #48
  ret
	
_