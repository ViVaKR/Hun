.include "section_macros.inc"
.global _menu_csel

// =========================================================================
// 1. 문자열 리터럴 섹션 (읽기 전용: 정적 문자열 상수가 들어가는 곳)
// =========================================================================
CSTRING_SECTION
prompt_two: .asciz "비교할 두 정수 입력 (예: 10 20): "
scanf_two:  .asciz "%lld %lld"
msg_format: .asciz "최대값 %lld\n"

// ===================================================
// 2. 데이터 섹션 (읽기/쓰기 가능: 초기값이 있는 변수가 들어가는 곳)
// ===================================================
DATA_SECTION
val_a:      .quad 0
val_b:      .quad 0

CODE_SECTION
_menu_csel:
    stp x29, x30, [sp, #-16]!
    mov x29, sp

    // 프롬프트 출력
    adrp x0, prompt_two@PAGE
    add x0, x0, prompt_two@PAGEOFF
    bl _printf

    // scanf("%lld %lld", &val_a, &val_b)
    adrp x0, scanf_two@PAGE
    add x0, x0, scanf_two@PAGEOFF
    adrp x1, val_a@PAGE
    add x1, x1, val_a@PAGEOFF
    adrp x2, val_b@PAGE
    add x2, x2, val_b@PAGEOFF

    sub sp, sp, #16
    str x1, [sp, #0]
    str x2, [sp, #8]
    bl _scanf
    add sp, sp, #16

    // 값 로드해서 csel 수행
    adrp x9, val_a@PAGE
    // add x9, x9, val_a@PAGEOFF
    ldr x0, [x9, val_a@PAGEOFF]

    adrp x9, val_b@PAGE
    // add x9, x9, val_b@PAGEOFF
    ldr x1, [x9, val_b@PAGEOFF]

    cmp x0, x1
    csel x0, x0, x1, ge
    mov x9, x0

    sub sp, sp, #16
    str x9, [sp, #0]
    adrp x0, msg_format@PAGE
    add x0, x0, msg_format@PAGEOFF
    bl _printf
    add sp, sp, #16

    ldp x29, x30, [sp], #16
    ret