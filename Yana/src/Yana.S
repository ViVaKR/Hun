//  [훈] 프로젝트
//  Created by 김범준 on 2026.7.7

.include "section_macros.inc"
.global _main

DATA_SECTION
    user_input: .quad 0
BSS_SECTION
LITERAL4_SECTION
LITERAL8_SECTION
CSTRING_SECTION
format_str: .asciz "Hello, ARM64 Assembly! ==> %d\n"
menu_title: .asciz "\n=== Yana 메뉴 ===\n"
menu_format: .asciz "%d: %s\n" // 번호와 메뉴 이름을 동적으로 출력할 포맷
input_prompt: .asciz "원하는 메뉴를 선택하세요: "
scanf_format: .asciz "%d"

// 💡 사용자 눈높이에 맞춰 선택 범위를 1부터 출력하도록 포맷 변경!
str_forloop: .asciz "for loop 합계구하기"
str_csel: .asciz "csel 삼항연산"
str_welcome_rust: .asciz "Welcome Rust"
str_exit: .asciz "프로그램 종료"

err_format: .asciz "잘못된 선택입니다. (선택범위: 1 ~ %d)\n"

CONST_SECTION
CONST_DATA_SECTION
menu_table:
    //      함수주소                문자열주소
    .quad _menu_forloop,        str_forloop     // 1
    .quad _menu_csel,           str_csel        // 2
    .quad _menu_welcome_rust,    str_welcome_rust // 3
    .quad _menu_exit,           str_exit        // 
menu_table_end:

command_table:
    .quad _menu_forloop     // Yana 0, x10 + 0  (x19가 0일 때)
command_table_end:

CODE_SECTION
_main:

    // [프롤로그] 값 보존을 위해 Callee-saved 레지스터 사용 
    stp x29, x30, [sp, #-48]!
    stp x19, x20, [sp, #16]
    stp x21, x22, [sp, #32]
    mov x29, sp


    // 1. 메뉴 테이블 크기 및 개수 동적 계산 (구조체 크기 = 16바이트)
    adrp x10, menu_table@PAGE
    add x10, x10, menu_table@PAGEOFF
    adrp x11, menu_table_end@PAGE
    add x11, x11, menu_table_end@PAGEOFF

    // "끝 주소 - 시작 주소 = 전체 바이트 수", 그리고 "전체 바이트 수 ÷ 항목 하나의 크기 = 항목 개수"
    sub x12, x11, x10       // 전체 바이트 크기
    lsr x20, x12, #4        // x20 = 총메뉴 개수

.L_display_menu:
    // 타이틀 출력
    adrp x0, menu_title@PAGE
    add x0, x0, menu_title@PAGEOFF
    bl _printf

    // 메뉴 항목 루프 출력 설정
    mov x21, #0                         // x21 (루프 인덱스 i = 0)
    adrp x19, menu_table@PAGE
    add x19, x19, menu_table@PAGEOFF    // x19 = 배열 시작 주소

.L_loop_start:
    cmp x21, x20        // i == 총 개수?
    b.eq .L_ask_input   // 다 그렸으면 입력 받으러 이동

    // printf("%d: %s\n", i, menu_item.str_ptr);
    adrp x0, menu_format@PAGE
    add x0, x0, menu_format@PAGEOFF

    mov x1, x21         // 첫번째 인자: 인덱스 번호(%d)
    ldr x2, [x19, #8]   // 두번째 인자 : 

    sub sp, sp, #16

    add x1, x1, #1      // 번호를 1번부터 출력하기 위함.

    str x1, [sp, #0]
    str x2, [sp, #8]

    bl _printf

    add sp, sp, 16

    add x19, x19, #16       // 다음 구조체 항목으로 주소 이동 (16바이트 더하기)
    add x21, x21, #1        // i++

    b .L_loop_start

.L_ask_input:
    // 입력 프롬프트 출력
    adrp x0, input_prompt@PAGE
    add x0, x0, input_prompt@PAGEOFF
    bl _printf

    // 입력 받기
    adrp x0, scanf_format@PAGE
    add x0, x0, scanf_format@PAGEOFF
    adrp x1, user_input@PAGE
    add x1, x1, user_input@PAGEOFF

    sub sp, sp, #16
    str x1, [sp, #0]
    bl _scanf
    add sp, sp, #16

    // 입력값 로드
    adrp x10, user_input@PAGE
    add x10, x10, user_input@PAGEOFF
    ldr x22, [x10] // x22 = 사용자가 선택한 번호 (1, 2, 3 ...)

    // 동적 범위 검사 (Boundary Check)
    mov x10, x22            
    sub x10, x10, #1            // 디스플레이된 선택 번호에서 실제 인덱스로 표현하기 위한 조치
    cmp x10, x20                // x22 = 사용자가 선택한 번호
    b.hs .L_invalid_choice      // 범위를 벗어나면 에러 레이블로

    // 동적 함수 로드 및 실행
    adrp x10, menu_table@PAGE
    add x10, x10, menu_table@PAGEOFF

    // 구조체 크기가 16바이트 이므로, [시작주소 + (인덱스 * 16)]
    // lsl #4 가 곧 16을 곱하는 연산 이 됨
    sub x22, x22, #1                // 정확한 인덱스 로 환원
    add x10, x10, x22, lsl #4
    ldr x11, [x10]                  // 구조체의 첫 8바이트(함수 포인터)를 x11 에 로드
    blr x11                         // 함수 실행

    b .L_display_menu               // 실행 후 다시 메뉴판으로 리턴

.L_invalid_choice:
    adrp x0, err_format@PAGE
    add x0, x0, err_format@PAGEOFF

    sub sp, sp, #16

    sub x1, x20, #1             // 최대 인덱스 번호 계산 (개수 - 1)
    add x9, x1, #1
    str x9, [sp, #0]
    bl _printf
    add sp, sp, #16

    b .L_display_menu

_menu_exit:
    b .L_terminate

// -------------------------------------------------------------
// 종료 (에필로그 및 리턴)
// -------------------------------------------------------------
.L_terminate:
    mov x0, #0                      // 리턴값 0
    ldp x21, x22, [sp, #32]
    ldp x19, x20, [sp, #16]         // 보존 레지스터 복원
    ldp x29, x30, [sp], #48         // 프레임 포인터, 링크 레지스터 복원 및 스택 정리
    ret



/* 
    // 아규먼트 
    //b _argv

_argv:
    cmp x0, #2
    mov x19, #108
    b.lt .L_default

    ldr x0, [x1, #8]        // x0 = argv[1]
    bl _atoi                // atoi(argv[1]); 결과는 x0에 저장됨
    mov x19, x0             // 결과를 안전하게 x19(Calle-saved)에 보관

    // [배열 시작주소 계산]
    adrp x10, command_table@PAGE
    add x10, x10, command_table@PAGEOFF // x10 = command_table 시작 주소

    // [배열 끝 주소 계산]
    adrp x11, command_table_end@PAGE
    add x11, x11, command_table_end@PAGEOFF  // x11 = command_tabel 끝 주소

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
    add x0, x0, format_str@PAGEOFF
    
    sub sp, sp, #32
    str x19, [sp, #0]
    bl _printf
    add sp, sp, #32

    b .L_terminate



 */