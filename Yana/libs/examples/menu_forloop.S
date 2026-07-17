.include "section_macros.inc"

.global _menu_forloop

CSTRING_SECTION
format_str: .asciz "%lld 회 합계 %lld\n"

CODE_SECTION

_menu_forloop:

  stp x29, x30, [sp, #-32]!
  mov x29, sp
  stp x19, x20, [sp, #16]

  mov x19, #0 // 누적합계
  mov x20, #1 // 루프카운터

  b _loop

_loop:
  cmp x20, #11
  b.ge _terminate
  add x19, x19, x20 // 합계 누적
  sub sp, sp, #32
  str x20, [sp, #0]
  str x19, [sp, #8]
  adrp x0, format_str@PAGE
  add x0, x0, format_str@PAGEOFF
  bl _printf
  add sp, sp, #32
  add x20, x20, #1
  b _loop

_terminate:
  ldp x19, x20, [sp, #16]
  ldp x29, x30, [sp], #32
  ret
