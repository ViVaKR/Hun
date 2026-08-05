.include "section_macros.inc"

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION
FUNC_START_FULL fib_print, 128
	
	// 로컬변수 선언
	sub sp, sp, #16

.L_begin_invoke:
	adrp x0, _msg_input_number_fib@PAGE
	add  x0, x0, _msg_input_number_fib@PAGEOFF
	bl   _printf
	
	adrp x0, _fmt_scanf_1@PAGE
	add  x0, x0, _fmt_scanf_1@PAGEOFF
	add  x1, sp, #0                    // &a
	
	sub sp, sp, #16
	str x1, [sp, #0]
	bl  _scanf
	add sp, sp, #16
	
	cmp  w0, #1
	b.ne .L_bad_input

.L_next_step:
	ldr x0, [sp, #0]
	mov x20, x0

	bl   _fib
	mov  x19, x0
	adrp x0, _fmt_fib_result@PAGE
	add  x0, x0, _fmt_fib_result@PAGEOFF
  
	sub sp, sp, #16
	str x20, [sp, #0]
	str x19, [sp, #8]
	bl  _printf
	add sp, sp, #16

	b .L_exit

.L_bad_input:
	// 공통 버퍼 청소 서브루틴 호출!
	bl _flush_stdin
	
	// EOF(-1)로 종료 되었는지 체크
	cmp  w0, #-1
	b.eq .L_exit
	
	// 일반 입력 오류였으면 안내 메시지 출력 후
	// 재입력 요청
	adrp x0, _msg_input_error@PAGE
	add  x0, x0, _msg_input_error@PAGEOFF
	bl   _printf
	b    .L_begin_invoke

.L_exit:
	// 변수 팝
	add sp, sp, #16

FUNC_EXIT_FULL 128