// ====================================================
//  [훈] 프로젝트
//  Created by 김범준
// ====================================================

.include "section_macros.inc"

CODE_SECTION
FUNC_START_FULL main, 128
  
	// 1. 메뉴 테이블 크기 및 개수 동적 계산 (구조체 크기 = 16바이트)
	adrp x10, _menu_table@PAGE
	add  x10, x10, _menu_table@PAGEOFF
	adrp x11, _menu_table_end@PAGE
	add  x11, x11, _menu_table_end@PAGEOFF

	// "끝 주소 - 시작 주소 = 전체 바이트 수"
	// 그리고, "전체 바이트 수 ÷ 항목 하나의 크기 = 항목 개수"
	sub x12, x11, x10  // 전체 바이트 크기
	lsr x20, x12, #4   // x20 = 총메뉴 개수
	mov x23, #0

// 타이틀 //
.L_repeat_heart:
	cmp  x23, #10
	b.eq .L_title
	cmp  x23, #21
	b.eq .L_display_menu

	adrp x0, _icon_heart@PAGE
	add  x0, x0, _icon_heart@PAGEOFF
	bl   _printf
	add  x23, x23, #1
	b    .L_repeat_heart

.L_title:
	adrp x0, _menu_title@PAGE
	add  x0, x0, _menu_title@PAGEOFF
	bl   _printf
	mov  x23, #11
	b    .L_repeat_heart

.L_display_menu:

	adrp x0, _newline_str@PAGE
	add  x0, x0, _newline_str@PAGEOFF
	bl   _printf

	// 메뉴 항목 루프 출력 설정
	mov  x21, #0                        // x21 (루프 인덱스 i = 0)
	adrp x19, _menu_table@PAGE          // 테스트
	add  x19, x19, _menu_table@PAGEOFF  // x19 = 배열 시작 주소
  
.L_loop_start:
	cmp  x21, x20                // i == 총 개수?
	b.eq .L_check_final_newline  // 다 그렸으면 무조건 최종 줄바꿈 하러 가기!

	// printf("%2d: %-15s\n", i, menu_item.str_ptr);
	adrp x0, _menu_format@PAGE
	add  x0, x0, _menu_format@PAGEOFF

	mov x1, x21        // 첫번째 인자: 인덱스 번호(%d)
	add x1, x1, #1     // 번호를 1번부터 출력하기 위함.
	ldr x2, [x19, #8]  // 두번째 인자 문자열 주소

	sub sp, sp, #16
	str x1, [sp, #0]
	str x2, [sp, #8]
	bl  _printf
	add sp, sp, #16

	// --------------------------------======================
	// ★ 핵심: 5개 출력할 때마다 줄바꿈 행진! (나머지 연산 최적화)
	// --------------------------------======================
	mov  x1, x21          // x21 (현재 인덱스 i = 0), x1 = 현재 인덱스 (0, 1, 2, 3...)
	add  x1, x1, #1       // x1 = 현재 출력된 메뉴 개수 (1, 2, 3, 4, 5...)
	mov  x2, #4           // 나누기 연산으로 5의 배수인지 검사
	udiv x3, x1, x2       // x3 = x1 / 5
	msub x4, x3, x2, x1   // x4 = x1 - (x3 * 5) -> 즉, 5로 나눈 나머지!
	cmp  x4, #0           // 5의 배수인가? 즉, 나머지가 0인가? (즉, 5번째 항목)
	b.ne .L_skip_newline  //  ❌ 나머지가 0이 아니면, 5의 배수가 아니면 옆으로 계속 붙여라
  
	// 5의 배수면 줄바꿈 쾅!
	adrp x0, _newline_str@PAGE
	add  x0, x0, _newline_str@PAGEOFF
	bl   _printf                       // 줄바꿈(\n) 을 쾅! (커서가 다음 줄 맨 앞으로 이동)
  
.L_skip_newline:
	add x19, x19, #16  // 16바이트 더하기 다음 구조체 항목으로 주소 이동 (16바이트 더하기)
	add x21, x21, #1   // i++
	b   .L_loop_start  // 루프 복귀

.L_next_item:
	// 핵심 다음 방으로 주소를 옮기고 인덱스를 증가 시킨 뒤 "다시 루프"
	add x19, x19, #16  // 16바이트 더하기, 다음 구조체 항목으로 주소 이동 (16바이트 )
	add x21, x21, #1   // i++
	b   .L_loop_start  // 루프 복귀 다시 루프 처음으로 ...

.L_check_final_newline:
	// 다 그렸으니 깔끔하게 줄바꿈 쾅! 해줘서 메뉴판과 프롬프트를 분리합니다.
	adrp x0, _newline_str@PAGE
	add  x0, x0, _newline_str@PAGEOFF
	bl   _printf
	b    .L_ask_input                  // 그러고 나서 입력 받으러 이동

.L_ask_input:
	// 입력 프롬프트 출력
	adrp x0, _input_prompt@PAGE
	add  x0, x0, _input_prompt@PAGEOFF
	bl   _printf

	// 입력 받기
	adrp x0, _scanf_format@PAGE
	add  x0, x0, _scanf_format@PAGEOFF
	adrp x1, _user_input@PAGE
	add  x1, x1, _user_input@PAGEOFF
    
	sub sp, sp, #16
	str x1, [sp, #0]
	bl  _scanf
	add sp, sp, #16
  
	// scanf 가 몇 개 필드를 성공적으로 읽었는지 체크
	cmp  w0, #-1       // EOF(CTRL + D) 면 아예 프로그램 종료, 32비트 int 반환값
	b.eq .L_terminate

	cmp  w0, #1
	b.ne .L_bad_input  // 입력요청이 한개인데 . 한개가 아니면?

	// 입력값 로드
	adrp x10, _user_input@PAGE
	add  x10, x10, _user_input@PAGEOFF
	ldr  x22, [x10]                     // x22 = 사용자가 선택한 번호 (1, 2, 3 ...)

	// 동적 범위 검사 (Boundary Check)
	mov  x10, x22
	sub  x10, x10, #1       // 디스플레이된 선택 번호에서 실제 인덱스로 표현하기 위한 조치
	cmp  x10, x20           // x10 = 사용자가 선택한 번호, x20 총 배열의 갯수
	b.hs .L_invalid_choice  // 범위를 벗어나면 에러 레이블로
  
	// exit 선택시
	cmp  x10, #0
	b.eq .L_terminate
  
	adrp x10, _menu_table@PAGE
	add  x10, x10, _menu_table@PAGEOFF

	// 구조체 크기가 16바이트 이므로, [시작주소 + (인덱스 * 16)]
	sub x22, x22, #1           // 정확한 인덱스 로 환원
	add x10, x10, x22, lsl #4  // x10 = x10 + (x22 * 16),
	ldr x11, [x10, #0]         // 구조체의 첫 8바이트(함수 포인터)를 x11 에 로드
	mov x23, x11               // 실행할 함수

	bl .L_insert_line  // ★ 상단 구분선 (새로 추가)

	// 💞 메뉴별 사전 설정 💞
	cmp  x22, #11              // Console.WriteLine() 모델링
	b.eq .L_console_writeline

	cmp  x22, #14    // _fib_print
	b.eq .L_run_fib

	cmp  x22, #16      // _hanoi
	b.eq .L_run_hanoi
  
	cmp  x22, #20           // _quicksort
	b.eq .L_exec_quicksort

	// ---- //
	b .L_exec

/* 메뉴선택 끝 */

.L_bad_input:
// scanf 가 소비하지 못한 문자들이 버퍼에 그대로 남아 있으므로
// 개행(\n) 을 만날 때 까지 강제로 다 읽어서 버퍼를 비워줌
.L_bad_input_flush:
	bl   _getchar
	cmp  w0, #10             // '\n' 만나면 정리 끝
	b.eq .L_bad_input_done
	cmp  w0, #-1
	b.eq .L_bad_input_done
	b    .L_bad_input_flush

.L_bad_input_done:
	adrp x0, _err_format@PAGE
	add  x0, x0, _err_format@PAGEOFF
  
	sub sp, sp, #16
	sub x1, x20, #1
	add x9, x1, #1
	str x9, [sp, #0]
	bl  _printf
	add sp, sp, #16
	b   .L_display_menu


// _quicksort
.L_exec_quicksort:
	adrp x25, _quicksort_arr@PAGE
	add  x25, x25, _quicksort_arr@PAGEOFF

	adrp x26, _quicksort_arr_end@PAGE
	add  x26, x26, _quicksort_arr_end@PAGEOFF

	sub x27, x26, x25  // 전체 바이트 크기
	lsr x28, x27, #3   // x28 = 원소 개수 (72 / 8 = 9)

	// ---- 정렬 전 배열 출력 ----
	adrp x0, _label_before@PAGE
	add  x0, x0, _label_before@PAGEOFF
	bl   _printf

	mov x0, x25       // arr
	mov x1, x28       // count
	bl  _print_array

	// ---- 퀵정렬 실행 ----
	mov x0, x25      // arr
	mov x1, #0       // lo
	sub x2, x28, #1  // hi = count - 1
	bl  _quicksort

	// ---- 정렬 후 배열 출력 ----
	adrp x0, _label_after@PAGE
	add  x0, x0, _label_after@PAGEOFF
	bl   _printf

	mov x0, x25
	mov x1, x28
	bl  _print_array

	bl .L_insert_line
	b  .L_flush_buffer

// _console_writeline
.L_console_writeline:
	adrp x0, _helloworld@PAGE
	add  x0, x0, _helloworld@PAGEOFF
	b    .L_exec

// (실행) 14. 피보나치 수열
.L_run_fib:
	mov x0, #13
	b   .L_exec

// (실행) 17. 하노이 탑
.L_run_hanoi:
	mov x0, #4
	mov x1, #'A'  // from = 'A' (0x41)
	mov x2, #'C'  // to   = 'C' (0x43)
	mov x3, #'B'  // via  = 'B' (0x42)
	b   .L_exec
  
// ------------------------------------------------//
.L_exec:
	blr x23
	bl  .L_insert_line
	b   .L_flush_buffer
// ------------------------------------------------// 

// 선긋기
.L_insert_line:
	stp x29, x30, [sp, #-32]!  // 호출 직전의 x30 (_main으로 돌아갈 주소)을  스택에 저장
	stp x19, x20, [sp, #16]
	mov x29, sp

	mov  x0, #35
	adrp x1, _line_char@PAGE
	add  x1, x1, _line_char@PAGEOFF
	bl   _console_line

	ldp x19, x20, [sp, #16]
	ldp x29, x30, [sp], #32
	ret                      // 진짜 서브루틴이 되도록 ret 추가

.L_flush_buffer:
	bl   _getchar
	cmp  w0, #10
	b.ne .L_flush_buffer
	cmp  w0, #-1          // 혹시 모를 EOF (파일끝) 처리
	b.eq .L_display_menu
  
	// 2단계: 버퍼가 완전히 깨끗해진 "지금" 안내 메시지를 띄우고 기다리기
	// ==========================================
	// ★ [검문소] 여기에 홀딩 로직을 똭 채워넣습니다!
	// ==========================================
	adrp x0, _press_enter@PAGE
	add  x0, x0, _press_enter@PAGEOFF
	bl   _printf

.L_wait_enter:
	bl   _getchar
	cmp  w0, #10        // 10은 아스키코드로 엔터('\n') 를 의미
	b.ne .L_wait_enter  // 엔터가 아니라 버퍼에 남은 잔여물이면 계속 읽어서 청소
	// =================================================================
	b .L_display_menu

.L_invalid_choice:
	adrp x0, _err_format@PAGE
	add  x0, x0, _err_format@PAGEOFF

	sub sp, sp, #16

	sub x1, x20, #1   // 최대 인덱스 번호 계산 (개수 - 1)
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
	adrp x0, _exit_message@PAGE
	add  x0, x0, _exit_message@PAGEOFF
	bl   _printf
	mov  x0, #0
  
FUNC_EXIT_FULL 128