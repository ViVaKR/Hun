.include "section_macros.inc"
.global _menu_welcome_rust

CODE_SECTION

_menu_welcome_rust:
  stp x29, x30, [sp, #16]!
  mov x29, sp

  mov x0, #108
  bl _call_from_dharma
  mov x0, #0

  ldp x29, x30, [sp], #16

  ret