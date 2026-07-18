#include "yeoji_section_macros.inc"

CONST_DATA_SECTION
.align 3
command_table:
    .quad routine_playground    // 인덱스 0: 플레이그라운드
    .quad routine_fib           // 인덱스 1: 진짜 피보나치 실행!
    .quad routine_quicksort     // 인덱스 2: 퀵정렬
command_table_end:

CODE_SECTION
.align 2

.global asm_vector_branch
.extern uart_puts
.extern uart_putc

// -------------------------------------------------------------
// void asm_vector_branch(long long index, long long arg);
// 입력: 
//   x0 = 명령어 인덱스 (0, 1, 2)
//   x1 = 쉘에서 발라낸 추가 매개변수 숫자 (예: 피보나치 반복 횟수)
// -------------------------------------------------------------
asm_vector_branch:
    stp     x29, x30, [sp, #-48]!
    mov     x29, sp
    stp     x19, x20, [sp, #16]

    mov     x19, x0     // x19 = 인덱스
    mov     x20, x1     // x20 = 매개변수 인자 (진짜 연산용!)

    // Boundary Check
    adrp    x10, command_table
    add     x10, x10, :lo12:command_table
    adrp    x11, command_table_end
    add     x11, x11, :lo12:command_table_end

    sub     x12, x11, x10
    lsr     x12, x12, #3

    cmp     x19, x12
    b.hs    _branch_done

    // 🔑 주소 분기 신공!
    ldr     x11, [x10, x19, lsl #3]
    
    // 타겟 루틴으로 가기 전에, 매개변수(x20)를 첫 번째 인자(x0) 자리에 채워 넘깁니다!
    mov     x0, x20
    blr     x11

_branch_done:
    ldp     x19, x20, [sp, #16]
    ldp     x29, x30, [sp], #48
    ret

// -------------------------------------------------------------
// 1. 플레이그라운드 루틴
// -------------------------------------------------------------
routine_playground:
    stp     x29, x30, [sp, #-16]!
    adrp    x0, play_msg
    add     x0, x0, :lo12:play_msg
    bl      uart_puts
    ldp     x29, x30, [sp], #16
    ret

// -------------------------------------------------------------
// 2. 🔑 [9순위 핵심] 진짜 피보나치 계산 알고리즘 엔진
// 입력: x0 = 반복할 횟수 (N)
// -------------------------------------------------------------
routine_fib:
    stp     x29, x30, [sp, #-32]!
    stp     x19, x20, [sp, #16]
    
    mov     x19, x0             // x19 = 반복할 카운트 (N)

    // 타이틀 먼저 출력
    adrp    x0, fib_msg
    add     x0, x0, :lo12:fib_msg
    bl      uart_puts

    // 초기화: F(0) = 0, F(1) = 1
    mov     x0, #0              // x0 = 이전 첫번째 수
    mov     x1, #1              // x1 = 이전 두번째 수
    mov     x2, #0              // x2 = 현재 루프 카운트

_fib_loop:
    cmp     x2, x19
    b.ge    _fib_loop_done      // 카운트 다 채우면 루프 끝!

    // 🔑 피보나치 더하기 연산: x3 = x0 + x1
    add     x3, x0, x1
    
    // 다음 루프를 위해 값 한 칸씩 전진 스위치
    mov     x0, x1
    mov     x1, x3

    add     x2, x2, #1          // 카운트 증가
    b       _fib_loop

_fib_loop_done:
    // 🔍 계산된 결과 값(x0)을 한 자리 정수(0~9)로 가정하고 문자로 변환하여 화면에 찍기!
    // 아스키코드 변환: 숫자 + '0'(0x30)
    add     w0, w0, #0x30
    bl      uart_putc           // 결과 숫자 출력!

    adrp    x0, newline_msg
    add     x0, x0, :lo12:newline_msg
    bl      uart_puts

    ldp     x19, x20, [sp, #16]
    ldp     x29, x30, [sp], #32
    ret

// -------------------------------------------------------------
// 3. 퀵정렬 루틴
// -------------------------------------------------------------
routine_quicksort:
    stp     x29, x30, [sp, #-16]!
    adrp    x0, quick_msg
    add     x0, x0, :lo12:quick_msg
    bl      uart_puts
    ldp     x29, x30, [sp], #16
    ret

CSTRING_SECTION
.align 3
play_msg:    .asciz "\n 🚀 [어셈블리] -> 플레이그라운드 활성화!\n\n"
fib_msg:     .asciz "\n 📊 [어셈블리 진짜 수열 연산 결과] ==> 연산된 피보나치 수: "
quick_msg:   .asciz "\n 🎯 [어셈블리] -> 퀵정렬 알고리즘 완료!\n\n"
newline_msg: .asciz "\n\n"
