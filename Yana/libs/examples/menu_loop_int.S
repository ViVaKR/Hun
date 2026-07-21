.include "section_macros.inc"
.global  _menu_loop_int

CSTRING_SECTION

	list_format: .asciz "Index [%lld]: Value = %lld, Sum = %lld\n"

DATA_SECTION
list_data_int: .quad 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
list_data_int_end:

CODE_SECTION
_menu_loop_int:
	
	// 프롤로그 : x19 ~ x22 는 피호출자 저장 (Callee-saved) 레지스터 으므로
	// 스택에 안전하게하게 보관 
	// 총 48 바이트 공간을 할당
	stp x29, x30, [sp, #-64]!
	mov x29, sp
	stp x19, x20, [sp, #16]
	stp x21, x22, [sp, #32]
	stp x23, x24, [sp, #48]  // 누적합계로 쓸 x23 레지스터 대피 
	
	// 배열 포인터 및 개수 계산
	adrp x19, list_data_int@PAGE
	add  x19, x19, list_data_int@PAGEOFF
	
	adrp x9, list_data_int_end@PAGE
	add  x9, x9, list_data_int_end@PAGEOFF
	
	sub x20, x9, x19  // 전체 바이트 수 
	lsr x20, x20, #3  // 배열의 갯수  (8로 나누가 2^3)
	
	mov x21, #0				// 인덱스 시작값 = 1
	mov x23, #0 			// 누적합계 
	
.L_loop_int:
	// 배열 개수가 0이면 바로 탈출 (방어 코드)
	cbz x20, .L_ext

  // x19에서 값을 읽어 x22에 넣고 포인터 8바이트 이동
	ldr x22, [x19], #8
	
	add x23, x23, x22					// Sum = Sum + Value
	
	// printf 인자 세팅 (ARM64 규약 적용)	
	adrp x0, list_format@PAGE
	add  x0, x0, list_format@PAGEOFF	// x0 = 포맷 스트링 주소

	mov x1, x21						// x1 = 첫번째 인자 (Index)
	mov x2, x22						// x2 = 두번째 인자 (Value)	
	mov x3, x23						// x3 = Sum (누적합 레지스터를 바로 전달)
	
	sub sp, sp, #32
	str x1, [sp, #0]
	str x2, [sp, #8]
	str x3, [sp, #16]
	
	bl   _printf
	add  sp, sp, #32
	add  x21, x21, #1
	subs x20, x20, #1 // 배열의 갯수 차감 하기
	b.ne .L_loop_int
	
	b .L_ext
	
	add  x21, x21, #1			// 인덱스 + 1
	sub  x20, x20, #1			// 남은 개수 - 1 (s 를 붙여서 플래그 업데이트!)
	b.ne .L_loop_int			// 남은 갯수가 0이 아니면 반복

.L_ext:
	ldp x19, x20, [sp, #16]
	ldp x21, x22, [sp, #32]
	ldp x23, x24, [sp, #48]
	mov x0, #0
	ldp x29, x30, [sp], #64
  ret