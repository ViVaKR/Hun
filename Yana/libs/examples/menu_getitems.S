.include "section_macros.inc"
.global _menu_getitems

CODE_SECTION

_menu_getitems:

  stp x29, x30, [sp, #-32]!
  mov x29, sp
  stp x19, x20, [sp, #16]

  FUNC_EXIT_DEFAULT