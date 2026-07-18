.include "section_macros.inc"
.global _menu_if_else

DATA_SECTION
val_a: .quad 0
val_b: .quad 0

CSTRING_SECTION
prompt: .asciz "비교할 두 정수 입력 (예: 10 20): "
scanf_two: .asciz "%lld %lld"
str_format: .asciz "Result: %lld"

CODE_SECTION
// 비교 명령어로 NZCV 플래그 (상태 레지스터) 를 업데이트 후
// 조건이 맞지 않으면 else 블록 또는 endif 레이블로 점프(Branch)
_menu_if_else:

    stp x29, x30, [sp, #-16]!
    mov x29, sp

    // 프롬프트 출력
    adrp x0, prompt@PAGE
    add x0, x0, prompt@PAGEOFF
    bl _printf

    // 1. scanf("%lld %lld", &val_a, &val_b) 호출 준비
    adrp    x0, scanf_two@PAGE
    add     x0, x0, scanf_two@PAGEOFF
    adrp    x1, val_a@PAGE
    add     x1, x1, val_a@PAGEOFF
    adrp    x2, val_b@PAGE
    add     x2, x2, val_b@PAGEOFF

    sub sp, sp, #16
    str x1, [sp, #0]
    str x2, [sp, #8]
    bl _scanf
    add sp, sp, #16

    // x1, x2 레지스터는 _scanf 호출로 인해 값이 오염되었을 수 있으므로 다시 주소를 로드
    adrp    x9, val_a@PAGE
    ldr     x0, [x9, val_a@PAGEOFF]
    
    adrp    x9, val_b@PAGE
    ldr     x1, [x9, val_b@PAGEOFF]

    // if(x0 ==x1) { x2 = 1; } else { x2 = 2; }
    cmp x0, x1          // x0 와 x1 비교 (결과를 NZCV 플래그에 반영)
    b.ne .L_else

.L_if:
    mov x10, #100          // 조건이 참일 때 (x2 = 1)
    b .L_end            // else 블럭을 건너뛰기 위해 무조건 분기
.L_else:
    mov x10, #200          // 조건이 거짓일 때 실행 (x2 = 2)
.L_end:

  adrp x0, str_format@PAGE
  add x0, x0, str_format@PAGEOFF

  sub sp, sp, #16
  str x10, [sp, #0]
  bl _printf
  add sp, sp, #16

  mov x0, #0
  ldp x29, x30, [sp], #16
  ret