//  [훈] 프로젝트
//  Created by 김범준 on 2026.7.7

.include "section_macros.inc"
.global  _main

DATA_SECTION
user_input: .quad 0
BSS_SECTION
LITERAL4_SECTION
LITERAL8_SECTION
CONST_SECTION
CSTRING_SECTION

// %-25s: 문자열을 무조건 25칸 차지하게 하고 좌측 정렬해서 출력하기
menu_format: .asciz "%3d: %-15s"
newline_str: .asciz "\n"
line_char:   .asciz "👻"         // 간단 - mov w1, #'*'

format_str:   .asciz "Hello, ARM64 Assembly! ==> %d\n"
menu_title:   .asciz "\n 💖 💖 💖 💖 💖 💖 💖 💖 💖 💖 💖 💖 💖 😎 메뉴목록 😎 💖 💖 💖 💖 💖 💖 💖 💖 💖 💖 💖 💖 💖\n"
input_prompt: .asciz "\n🍒 원하는 메뉴를 선택하세요 🍒 ⇢ "
scanf_format: .asciz "%d"
err_format:   .asciz "잘못된 선택입니다. (선택범위: 1 ~ %d)\n"
press_enter:  .asciz "\n🧚 엔터(Enter) 키를 누르면 메뉴로 돌아갑니다..."
exit_message: .asciz "\n👻 👻 👻 좋은 경험이었습니다. 다음에 또 멋지게 만나요!! 👻 👻 👻\n\n"
helloworld:   .asciz "Hello, World! Fine Thanks And You?"

str_exit:              .asciz "exit"
str_forloop:           .asciz "for"
str_csel:              .asciz "csel"
str_welcome_rust:      .asciz "rust"
str_if_else:           .asciz "if"
str_string_to_integer: .asciz "str to int"
str_readline:          .asciz "scanf"
str_delegate:          .asciz "delegate"
str_function_call:     .asciz "function"
str_loop_int:          .asciz "loop"
str_demo_madd:         .asciz "madd"
str_console_writeline: .asciz "writeline"
str_ldrb:              .asciz "ldrb"

CONST_DATA_SECTION
menu_table:
    .quad _menu_exit, str_exit                      // 0
    .quad _menu_forloop, str_forloop                // 1
    .quad _menu_csel, str_csel                      // 2
    .quad _menu_welcome_rust, str_welcome_rust      // 3
    .quad _menu_if_else, str_if_else                // 4
    .quad _string_to_integer, str_string_to_integer // 5
    .quad _readline, str_readline                   // 6
    .quad _menu_delegate, str_delegate              // 7
		.quad _menu_function_call, str_function_call    // 8
		.quad _menu_loop_int, str_loop_int              // 9
		.quad _demo_madd, str_demo_madd                 // 10
		.quad _console_writeline, str_console_writeline // 11
		.quad _demo_ldrb, str_ldrb                      // 12
menu_table_end:

// .quad 는 8바이트 64비트를 의미함
// 한줄에 데이터가 2개씩 들어 있으므로 
// 8바이트(함수 주소) + 8바이트 (문자열 주소) = 각행은  총 16바이트 2^4
// x10 에 배열의 시작 주소가 저장 되어 있음
// x22 에 사용자가 선택한 메뉴 인덱스 번호 (0,1,2,3...) 
// lsl #4 : 인덱스 번호에 16(2^4) 곱하여 해당 메뉴를 찾는 로직 
command_table:
    .quad _menu_forloop
command_table_end:

CODE_SECTION

_main:

  // [프롤로그] 값 보존을 위해 Callee-saved 레지스터 사용 
	stp x29, x30, [sp, #-64]!
	stp x19, x20, [sp, #16]
	stp x21, x22, [sp, #32]
	stp x23, x24, [sp, #48]
	mov x29, sp
	
  // 1. 메뉴 테이블 크기 및 개수 동적 계산 (구조체 크기 = 16바이트)
	adrp x10, menu_table@PAGE
	add  x10, x10, menu_table@PAGEOFF
	adrp x11, menu_table_end@PAGE
	add  x11, x11, menu_table_end@PAGEOFF
	

  // "끝 주소 - 시작 주소 = 전체 바이트 수"
	// 그리고, "전체 바이트 수 ÷ 항목 하나의 크기 = 항목 개수"
	sub x12, x11, x10       // 전체 바이트 크기
	lsr x20, x12, #4        // x20 = 총메뉴 개수

.L_display_menu:
	// 타이틀 출력
	adrp x0, menu_title@PAGE
	add  x0, x0, menu_title@PAGEOFF
	bl   _printf

	// 메뉴 항목 루프 출력 설정
	mov  x21, #0 // x21 (루프 인덱스 i = 0)
	adrp x19, menu_table@PAGE
	add  x19, x19, menu_table@PAGEOFF    // x19 = 배열 시작 주소
	
.L_loop_start:
	cmp  x21, x20        // i == 총 개수?
	b.eq .L_check_final_newline		// 다 그렸으면 무조건 최종 줄바꿈 하러 가기!

  // printf("%2d: %-25s\n", i, menu_item.str_ptr);
	adrp x0, menu_format@PAGE
	add  x0, x0, menu_format@PAGEOFF

	mov x1, x21         // 첫번째 인자: 인덱스 번호(%d)
	add x1, x1, #1      // 번호를 1번부터 출력하기 위함.
	ldr x2, [x19, #8]   // 두번째 인자 문자열 주소

	sub sp, sp, #16
	str x1, [sp, #0]
	str x2, [sp, #8]
	bl  _printf
	add sp, sp, #16
	
	// --------------------------------======================
	// ★ 핵심: 5개 출력할 때마다 줄바꿈 행진! (나머지 연산 최적화)
	// --------------------------------======================
	mov  x1, x21  // x21 (현재 인덱스 i = 0), x1 = 현재 인덱스 (0, 1, 2, 3...)
	add  x1, x1, #1		// x1 = 현재 출력된 메뉴 개수 (1, 2, 3, 4, 5...)
	mov  x2, #5 	// 나누기 연산으로 5의 배수인지 검사
	udiv x3, x1, x2		// x3 = x1 / 5
	msub x4, x3, x2, x1		// x4 = x1 - (x3 * 5) -> 즉, 5로 나눈 나머지!
	
	cmp  x4, #0							// 5의 배수인가? 즉, 나머지가 0인가? (즉, 5번째 항목)
	b.ne .L_skip_newline		//  ❌ 나머지가 0이 아니면, 5의 배수가 아니면 옆으로 계속 붙여라 
	
	// 5의 배수면 대인배 처럼 줄바꿈 쾅!
	adrp x0, newline_str@PAGE
	add  x0, x0, newline_str@PAGEOFF
	bl   _printf              // 줄바꿈(\n) 을 쾅! (커서가 다음 줄 맨 앞으로 이동)
	// ★ 중요: 줄을 바꿨으니 아래 .L_skip_newline을 거치지 말고 
	// 공통 구간인 바로 주소 이동(.L_next_item) 레이블로 점프
	b .L_next_item
	
.L_skip_newline:
	add x19, x19, #16       // 16바이트 더하기 다음 구조체 항목으로 주소 이동 (16바이트 더하기)
	add x21, x21, #1        // i++
	b   .L_loop_start 				// 루프 복귀 

.L_next_item:
	// 핵심 다음 방으로 주소를 옮기고 인덱스를 증가 시킨 뒤 "다시 루프"
	add x19, x19, #16 // 16바이트 더하기, 다음 구조체 항목으로 주소 이동 (16바이트 )
	add x21, x21, #1	// i++
	b   .L_loop_start		// 루프 복귀 다시 루프 처음으로 ... 

.L_check_final_newline:
	// 다 그렸으니 깔끔하게 줄바꿈 쾅! 해줘서 메뉴판과 프롬프트를 분리합니다.
	adrp x0, newline_str@PAGE
	add  x0, x0, newline_str@PAGEOFF
	bl   _printf 
	b    .L_ask_input 										// 그러고 나서 입력 받으러 이동 	


.L_ask_input:
  // 입력 프롬프트 출력
	adrp x0, input_prompt@PAGE
	add  x0, x0, input_prompt@PAGEOFF
	bl   _printf

  // 입력 받기
	adrp x0, scanf_format@PAGE
	add  x0, x0, scanf_format@PAGEOFF
	adrp x1, user_input@PAGE
	add  x1, x1, user_input@PAGEOFF
    
	sub sp, sp, #16
	str x1, [sp, #0]
	bl  _scanf
	add sp, sp, #16

	// 입력값 로드
	adrp x10, user_input@PAGE
	add  x10, x10, user_input@PAGEOFF
	ldr  x22, [x10] // x22 = 사용자가 선택한 번호 (1, 2, 3 ...)

	// 동적 범위 검사 (Boundary Check)
	mov  x10, x22            
	sub  x10, x10, #1            // 디스플레이된 선택 번호에서 실제 인덱스로 표현하기 위한 조치
	cmp  x10, x20                // x10 = 사용자가 선택한 번호, x20 총 배열의 갯수
	b.hs .L_invalid_choice      // 범위를 벗어나면 에러 레이블로
	
	// exit 선택시
	cmp  x10, #0
	b.eq .L_terminate
	
	adrp x10, menu_table@PAGE
	add  x10, x10, menu_table@PAGEOFF

	// 구조체 크기가 16바이트 이므로, [시작주소 + (인덱스 * 16)]
	// lsl #4 가 곧 16을 곱하는 연산 이 됨
	sub x22, x22, #1                // 정확한 인덱스 로 환원
	add x10, x10, x22, lsl #4				// x10 = x10 + (x22 * 16), 
																	// (x22, lsl #4 ==> x22 * 16) + x10 ==> x10 에 저장
	ldr x11, [x10, #0]              // 구조체의 첫 8바이트(함수 포인터)를 x11 에 로드
																	// ldr x11, [x10, #8] x10 시작 주소에서 8바이트 떨어진 방의 값(글자 제목 주소)을 x11에 로드!
	mov x23, x11										// 실행할 함수

	bl .L_insert_line               // ★ 상단 구분선 (새로 추가)

	// ? 11. console writeline 실행
	cmp  x22, #11
	b.eq .L_console_writeline   
	
	// -->  
	b .L_exec

// (실행) 11. console writeline
.L_console_writeline:
	adrp x0, helloworld@PAGE
	add  x0, x0, helloworld@PAGEOFF
	b    .L_exec

// [ 함수 실행 ] //
.L_exec:
	blr x23                         // 함수 실행 완료
	bl  .L_insert_line
	b   .L_flush_buffer
	
/// 선긋기
.L_insert_line:
	stp x29, x30, [sp, #-32]! // 호출 직적의 x30 (_main으로 돌아갈 주소)을  스택에 저장
	stp x19, x20, [sp, #16]
	mov x29, sp

	mov  x0, #35
	adrp x1, line_char@PAGE
	add  x1, x1, line_char@PAGEOFF
	bl   _console_line	

	ldp x19, x20, [sp, #16]
	ldp x29, x30, [sp], #32
	ret // 진짜 서브루틴이 되도록 ret 추가

.L_flush_buffer:
	bl   _getchar
	cmp  x0, #10
	b.ne .L_flush_buffer
	cmp  x0, #-1 // 혹시 모를 EFO (파일끝) 처리
	b.eq .L_display_menu 
	
	// 2단계: 버퍼가 완전히 깨끗해진 "지금" 안내 메시지를 띄우고 기다리기
	// ==========================================
	// ★ [검문소] 여기에 홀딩 로직을 똭 채워넣습니다!
	// ==========================================
	adrp x0, press_enter@PAGE
	add  x0, x0, press_enter@PAGEOFF
	bl   _printf

.L_wait_enter:
	bl   _getchar
	cmp  x0, #10 	// 10은 아스키코드로 엔터('\n') 를 의미
	b.ne .L_wait_enter		// 엔터ㅌ가 아니라 버퍼에 남은 잔여물이면 계속 읽어서 청소
	// =================================================================
	b .L_display_menu

.L_invalid_choice:
	adrp x0, err_format@PAGE
	add  x0, x0, err_format@PAGEOFF

	sub sp, sp, #16

	sub x1, x20, #1             // 최대 인덱스 번호 계산 (개수 - 1)
	add x9, x1, #1
	str x9, [sp, #0]
	bl  _printf
	add sp, sp, #16

	b .L_display_menu

_menu_exit:
	b .L_terminate

// -------------------------------------------------------------
// 종료 (에필로그 및 리턴)
// -------------------------------------------------------------
.L_terminate:
	
	adrp x0, exit_message@PAGE
	add  x0, x0, exit_message@PAGEOFF
	
	bl _printf

	mov x0, #0                      // 리턴값 0
	ldp x19, x20, [sp, #16]         // 보존 레지스터 복원
	ldp x21, x22, [sp, #32]
	ldp x23, x24, [sp, #48]
	ldp x29, x30, [sp], #64         // 프레임 포인터, 링크 레지스터 복원 및 스택 정리
	ret

/* 
    // 아규먼트 
    //b _argv

_argv:
	cmp  x0, #2
	mov  x19, #108
	b.lt .L_default

	ldr x0, [x1, #8]        // x0 = argv[1]
	bl  _atoi                // atoi(argv[1]); 결과는 x0에 저장됨
	mov x19, x0             // 결과를 안전하게 x19(Calle-saved)에 보관

    // [배열 시작주소 계산]
	adrp x10, command_table@PAGE
	add  x10, x10, command_table@PAGEOFF // x10 = command_table 시작 주소

    // [배열 끝 주소 계산]
	adrp x11, command_table_end@PAGE
	add  x11, x11, command_table_end@PAGEOFF  // x11 = command_tabel 끝 주소

    // [배열의 크기]
	sub x12, x11, x10

    // [배열의 갯수 계산]
    // 포인터 주소의 크기 : 8바이트
    // 배열의 갯수 = 배열의 크기 / 포인터 주소의 크기 2^3 (8바이트)
	lsr x12, x12, #3

    // 3. 64비트끼리 안전하게 범위 검사 (Boundary Check)
    // 범위검사 (Boundary Check) : 
    // 사용자가 입력한 아규먼트 값 과 배열의 총 갯수를 비교 
	cmp x19, x12             

    // x19 가 배열의 크기보다 크거나 같으면
    // hs: Higher or Same, 부호없는 비교
    //  _default 레이블로 점프
	b.hs .L_default

    // 진짜 함수 로드하기
    // x10 (테이블 시작 주소)에서 x19(인덱스) 만큼 8바이트씩(lsl #3) 떨어진 곳의 주소값을 읽기
    // (예) : x19 (입력값) 을 2로 하였을 때
    //       x10 의 주소가 0x1000 일때
    //       0x1000 + (2 * 2^3) => 0x1000 + 16 => 즉.. array[2] 의 요소를 호출하는 결과가 
	ldr x11, [x10, x19, lsl #3]

    // 목표 함수 실행!
	blr x11

	b .L_terminate

.L_default:
    // 3. 포맷 스트링 및 인자 준비 후 printf 호출
	adrp x0, format_str@PAGE  // 포맷 문자열 주소 로드
	add  x0, x0, format_str@PAGEOFF
    
	sub sp, sp, #32
	str x19, [sp, #0]
	bl  _printf
	add sp, sp, #32

	b .L_terminate
*/