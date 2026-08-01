.include "section_macros.inc"

// [C-스타일 문자열 리터럴]
// __TEXT,__cstring,cstring_literals
CSTRING_SECTION
fmt_result: .asciz "분석 결과 --> %lld\n"
fmt_string: .asciz "받은 문자열: %s\n"
fmt_prompt: .asciz "회전문 검사를 해볼 문자열을 입력하세요: "
fmt_scan:   .asciz "%63s"                    // 버퍼(64) -1, null 자리 확보 필수
fmt_debug:  .asciz "left=%lld right=%lld\n"
CODE_SECTION
// ---------------------------------------------------
// [진입점] is_palindrome
// 입력 -> 확인 출력 -> \0 탐색(오른쪽 포인터) -> core 호출 -> 결과 출력
// 스택: 96(레지스터 풀백업) + 64(입력버퍼, %63s+null) = 160
// ---------------------------------------------------
FUNC_START_FULL is_palindrome, 208  // 128 + 64 = 192
  
	// 1. 안내 문구 출력
	adrp x0, fmt_prompt@PAGE
	add  x0, x0, fmt_prompt@PAGEOFF
	bl   _printf
  
  
	// 2. scanf 로 사용자 입력을 로컬 버퍼에 저장
	adrp x0, fmt_scan@PAGE
	add  x0, x0, fmt_scan@PAGEOFF
	add  x1, sp, #96               //  로컬 문자열 변수
	sub  sp, sp, #16
	str  x1, [sp, #0]
	bl   _scanf
	add  sp, sp, #16
  
	// 3. 입력값 확인 출력 (x19 에 버퍼 주소 보존 )
	add  x19, sp, #96
	adrp x0, fmt_string@PAGE
	add  x0, x0, fmt_string@PAGEOFF
	mov  x1, x19
	sub  sp, sp, #16
	str  x1, [sp, #0]
	bl   _printf
	add  sp, sp, #16

	// 4. '\0' 탐색 → 오른쪽 포인터(x20) 계산
	mov x20, x19

.L_find_end:
	ldrb w1, [x20]
	cbz  x1, .L_found_end
	add  x20, x20, #1
	b    .L_find_end

.L_found_end:
	sub x20, x20, #1
	// [임시 디버그] left/right 바이트값을 정수로 확인
	ldrb w2, [x19]
	ldrb w3, [x20]
	adrp x0, fmt_debug@PAGE
	add  x0, x0, fmt_debug@PAGEOFF
	mov  x1, x2
	mov  x2, x3
	sub  sp, sp, #16
	stp  x1, x2, [sp, #0]
	bl   _printf
	add  sp, sp, #16

	mov x0, x19
	mov x1, x20
	bl  _is_palindrome_core

	// 6. 결과 출력
	mov  x21, x0
	adrp x0, fmt_result@PAGE
	add  x0, x0, fmt_result@PAGEOFF
	mov  x1, x21
	sub  sp, sp, #16
	str  x1, [sp, #0]
	bl   _printf
	add  sp, sp, #16

FUNC_EXIT_FULL 208

// ---------------------------------------------------
// [코어] is_palindrome_core(x0 = left 포인터, x1 = right 포인터)
// 길이 대신 두 포인터의 관계(left >= right)로 base case 판단
// ---------------------------------------------------
FUNC_START is_palindrome_core, 64
  
	cmp  x0, x1          // left 포인터가 rigth 포인터를 앞질렀거나 만났으면
	b.ge .L_return_true  // (문자 0개 또는 1개 남음) -> 팰린드롬 확정
  
	ldrb w2, [x0]         // left 문자
	ldrb w3, [x1]         // right 문자
	cmp  w2, w3
	b.ne .L_return_false
  
	add x0, x0, #1           // left 포인터 한 칸 안으로
	sub x1, x1, #1           // right 포인터 한 칸 안으로
	bl  _is_palindrome_core
	b   .L_exit
  
.L_return_true:
	mov x0, #1
	b   .L_exit

.L_return_false:
	mov x0, #0

.L_exit:
FUNC_EXIT 64