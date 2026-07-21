.include "section_macros.inc"
.global  _demo_ldrb

CSTRING_SECTION
helloworld:  .asciz "안녕친구"
char_len:    .asciz "\nlength: %lld"
char_format: .asciz "%c"
newline_str: .asciz "\n"

CODE_SECTION
_demo_ldrb:
	stp x29, x30, [sp, #-48]!
	mov x29, sp
	stp x19, x20, [sp, #16]
	stp x21, x22, [sp, #32]
  
	adrp x19, helloworld@PAGE
	add  x19, x19, helloworld@PAGEOFF // x19 = 현재 읽을 위치 (포인터)
  
  // 문자열 길이 구하기 초기화 
  // .asciz 의 문자열 길이는 
  // 오직 널 종료문자(\0) 를  만날 때 까지 한 바이트씩 직접 세어 보는 것이 유일함
	mov x21, #0 
  
.L_char_loop:
	ldrb w20, [x19], #1     // 한글자 읽고 x19는 자동 + 1
	cbz  w20, .L_char_end   // 널 종료 문자(0)면 끝 
	add  x21, x21, #1

	adrp x0, char_format@PAGE
	add  x0, x0, char_format@PAGEOFF

	mov x1, x20
	sub sp, sp, #16
	str x1, [sp, #0]
	bl  _printf
	add sp, sp, #16
  
	b .L_char_loop

.L_char_end:
  
	adrp x0, char_len@PAGE
	add  x0, x0, char_len@PAGEOFF
  
	mov x1, x21
	sub sp, sp, #16
	str x1, [sp, #0]
	bl  _printf
	add sp, sp, #16 
  
	adrp x0, newline_str@PAGE
	add  x0, x0, newline_str@PAGEOFF
	bl   _printf

	ldp x19, x20, [sp, #16]
	ldp x21, x22, [sp, #32]
	ldp x29, x30, [sp], #48

  ret