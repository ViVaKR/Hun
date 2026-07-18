ENTRY(_start)
SECTIONS
{
    /* QEMU virt 머신의 커널 로드 주소 규격 */
    . = 0x40080000;   
    
    .text : { 
        KEEP(*(.text.boot)) // 🔑 boot.S의 _start 코드가 무조건 0x40080000 자리에 오도록 락(Lock)을 겁니다!
        *(.text*) 
    }
    .rodata : { *(.rodata*) }
    .data : { *(.data*) }
   
    .bss : {
        . = ALIGN(16);      /* 16바이트 정렬 원칙! */
        __bss_start = .;    /* 🔑 청소 시작 주소 심볼 선언! */
        *(.bss*)
        *(COMMON)
        . = ALIGN(16);      /* 끝날 때도 깔끔하게 16바이트 정렬 */
        __bss_end = .;      /* 🔑 청소 마감 주소 심볼 선언! */
    }
    
    . = ALIGN(16);
    . += 0x4000;        /* 16KB 스택 공간 확보 */
    _stack_top = .;     /* 상단 주소를 스택 포인터로 제공 */
}
