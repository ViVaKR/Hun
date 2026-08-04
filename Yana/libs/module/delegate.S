.include "section_macros.inc"

CODE_SECTION
FUNC_START_FULL delegate, 128

.L_begin_invoke:
	// 로컬 변수 2개 (long long)
	sub sp, sp, #16
	
	adrp x0, _input_prompt_numbers@PAGE
	add  x0, x0, _input_prompt_numbers@PAGEOFF
	bl   _printf
	
	adrp x0, _fmt_scanf_2@PAGE
	add  x0, x0, _fmt_scanf_2@PAGEOFF

	add x1, sp, #0  // &a
	add x2, sp, #8  // &b
	
	sub sp, sp, #16
	stp x1, x2, [sp, #0]
	bl  _scanf            // scanf 의 반환 타입은 32 비트 정수형(int) 임
	// scanf 가 인자 x1과 x2 두 곳에 성공적으로 값을 채워 넣었으면
	// 반환값 으로 2를 리턴함
	// 숫자 1개만 치고 문자를 치거나 이상하게 입력한 경우
	// 반환 값으로 1을 리턴함.
	// 시작 부터 문자를 치거나 에러가 난 경우 -> 반환값으로 0을 리턴함
	// 입력 스트림이 닫힌 경구 (CTRL + D / EOF) -> 반환값으로 -1(EOF)을 리턴함.
	add sp, sp, #16

	cmp  w0, #2        // 성공적으로 읽은 개수가 정확히 2개가 맞는가?
	b.ne .L_bad_input  // 2개가 아니라면 (0개, 1개, -1개등) 오류 처리로 이동하라

	ldp x19, x20, [sp, #0]

	// # ---------------------------
	// # 🔥 [덧셈 델리게이트 장전 및 격발]
	// # --------------------------
	adrp x9, _delegate_add@PAGE
	add  x9, x9, _delegate_add@PAGEOFF
  
	// 함수의 절대주소를 x10 레지스터로 인출 (포인터 역참조)
	ldr x10, [x9]
  
	mov x0, x19
	mov x1, x20

	// C# 의 delegate.Invoke() 숭내
	blr x10
	mov x21, x0
  
	adrp x0, _fmt_delegate_add@PAGE
	add  x0, x0, _fmt_delegate_add@PAGEOFF
  
	sub sp, sp, #32
	str x19, [sp, #0]
	str x20, [sp, #8]
	str x21, [sp, #16]
	bl  _printf
	add sp, sp, #32

	// # ---------------------------
	// # 🔥 [뺄셈 델리게이트 장전 및 격발]
	// # --------------------------

	adrp x9, _delegate_sub@PAGE
	add  x9, x9, _delegate_sub@PAGEOFF
	ldr  x10, [x9]
  
	mov x0, x19
	mov x1, x20

	blr x10      // _callback_sub 로 진격 다녀 오면 x0에 리턴값 담김.
	mov x21, x0  // x0 을 x21 에 백업
  
	// 출력
	adrp x0, _fmt_delegate_sub@PAGE
	add  x0, x0, _fmt_delegate_sub@PAGEOFF

	sub sp, sp, #32
	str x19, [sp, #0]
	str x20, [sp, #8]
	str x21, [sp, #16]
	bl  _printf
	add sp, sp, #32
  
	b .L_exit

.L_bad_input:

.L_bad_input_flush:
	bl _getchar
	
	// 1. 개행 문자 ('\n' = 10) 을 만나면 버퍼 청소완료
	cmp  w0, #10            // '\n' 만나면 정리 끝
	b.eq .L_bad_input_done

	// 2. EOF (Ctrl+D = -1) 를 만나면 루프 방지를 위해 프로그램 종료
	cmp  w0, #-1
	b.eq .L_exit
	
	// 3. 일반적인 잘못된 문자면 계속 비우기
	b .L_bad_input_flush

.L_bad_input_done:
	adrp x0, _msg_input_error@PAGE
	add  x0, x0, _msg_input_error@PAGEOFF
	bl   _printf
	b    .L_begin_invoke

.L_exit:
	add sp, sp, #16  // Alloc 했던 지역변수 스택 해제
	mov x0, #0       // 리턴값 0 (정상 종료)

FUNC_EXIT_FULL 128