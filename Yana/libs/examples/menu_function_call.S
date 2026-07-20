// --------------------------
// 
// --------------------------

.include "section_macros.inc"
.global  _menu_function_call
BSS_SECTION
CONST_DATA_SECTION
DATA_SECTION
CONST_SECTION
CSTRING_SECTION
format_str: .asciz "%lld + %lld = %lld\n"

CODE_SECTION
_menu_function_call:
  // 프롤로그
	stp	x29, x30, [sp, #-48]!
	mov	x29, sp
	stp	x19, x20, [sp, #16]
	stp	x21, x22, [sp, #32]

  // 1. 호출할 함수에 던질 인자 세팅
	mov	x19, #102
	mov	x20, #125
  
	mov	x0, x19
	mov	x1, x20
	bl	_function_call
	mov	x21, x0           // 결과값을 x21 에저장
  
	adrp	x0, format_str@PAGE
	add	x0, x0, format_str@PAGEOFF
  
	sub	sp, sp, #32
	str	x19, [sp, #0]
	str	x20, [sp, #8]
	str	x21, [sp, #16]
	bl	_printf
	add	sp, sp, #32
 
	b	_terminate 
  
_function_call:
	add	x0, x0, x1
	ret	

_terminate:
  // 에필로그
	ldp	x19, x20, [sp, #16]
	ldp	x21, x22, [sp, #32]
	mov	x0, #0
	ldp	x29, x30, [sp], #48
  ret