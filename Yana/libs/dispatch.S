.global _run_all_ops
.extern _add_numbers
.extern _sub_numbers
.extern _mul_numbers
.extern _div_numbers
.extern _printf
.align 2

_run_all_ops:
    stp x29, x30, [sp, #-32]!
    mov x29, sp
    stp x19, x20, [sp, #16]     // x19=인덱스(i), x20=반복횟수 보존용 콜리 세이브 레지스터

    mov x19, #0                 // i = 0
    mov x20, #4                 // 총 4개 연산

_op_loop:
    cmp x19, x20
    b.ge _op_loop_end            // i >= 4 이면 루프 종료

    // 테이블 주소 구하기
    adrp x9, _op_table@PAGE
    add  x9, x9, _op_table@PAGEOFF

    // x9 = &table[i]  (i * 8바이트, 함수 포인터는 8바이트)
    lsl x10, x19, #3             // i * 8
    ldr x11, [x9, x10]           // x11 = table[i] (함수 주소)

    mov x0, #20                  // a = 20
    mov x1, #4                   // b = 4

    mov x12, x0                  // printf용 임시 보존
    mov x13, x1

    blr x11                      // 🔑 다이나믹 호출! table[i](20, 4)

    // printf(format, i, a, b, result)
    sub sp, sp, #32
    str x19, [sp, #0]            // i
    str x12, [sp, #8]            // a
    str x13, [sp, #16]           // b
    str x0,  [sp, #24]           // result

    adrp x0, msg_format@PAGE
    add  x0, x0, msg_format@PAGEOFF
    bl _printf

    add sp, sp, #32

    add x19, x19, #1             // i++
    b _op_loop

_op_loop_end:
    ldp x19, x20, [sp, #16]
    ldp x29, x30, [sp], #32
    ret

.data
.align 3
// 🔑 함수 포인터 배열 (jump table) - C의 op_func table[4] = {...}에 대응
_op_table:
    .quad _add_numbers
    .quad _sub_numbers
    .quad _mul_numbers
    .quad _div_numbers

msg_format:
    .asciz "\xe2\x9a\x99\xef\xb8\x8f 연산[%lld]: %lld, %lld -> %lld\n"
