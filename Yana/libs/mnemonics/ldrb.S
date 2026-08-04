.include "section_macros.inc"
.global  _mnemonic_ldrb

CODE_SECTION
FUNC_START_FULL mnemonic_ldrb, 128

	adrp x19, _ldrb_sample_string@PAGE
	add  x19, x19, _ldrb_sample_string@PAGEOFF  // x19 = 현재 읽을 위치 (포인터)
  
	// 문자열 길이 구하기 초기화
	// .asciz 의 문자열 길이는
	// 오직 널 종료문자(\0) 를  만날 때 까지 한 바이트씩 직접 세어 보는 것이 유일함
	mov x21, #0
  
.L_char_loop:
	ldrb w20, [x19], #1    // 한글자 읽고 x19는 자동 + 1
	cbz  w20, .L_char_end  // 널 종료 문자(0)면 끝
	add  x21, x21, #1

	adrp x0, _char_format@PAGE
	add  x0, x0, _char_format@PAGEOFF

	mov x1, x20
	sub sp, sp, #16
	str x1, [sp, #0]
	bl  _printf
	add sp, sp, #16
  
	b .L_char_loop

.L_char_end:
  
	adrp x0, _char_len@PAGE
	add  x0, x0, _char_len@PAGEOFF
  
	mov x1, x21
	sub sp, sp, #16
	str x1, [sp, #0]
	bl  _printf
	add sp, sp, #16
  
	adrp x0, _newline_str@PAGE
	add  x0, x0, _newline_str@PAGEOFF
	bl   _printf

FUNC_EXIT_FULL 128