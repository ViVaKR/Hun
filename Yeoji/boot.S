.global _start
.section .text
_start:
    // 스택 포인터 설정 (링커스크립트에서 정의할 _stack_top)
    ldr x0, =_stack_top
    mov sp, x0
    bl kernel_main
1:  b 1b   // 무한루프 (커널이 끝나도 여기 머물기)