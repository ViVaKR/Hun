.include "section_macros.inc"

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION
FUNC_START_FULL callback_add, 128
	add x0, x0, x1
FUNC_EXIT_FULL 128

FUNC_START_FULL callback_sub, 128
	sub x0, x0, x1

FUNC_EXIT_FULL 128