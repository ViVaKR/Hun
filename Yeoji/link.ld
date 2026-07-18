ENTRY(_start)
SECTIONS
{
    /* virt 머신의 RAM 시작 근처 */
    . = 0x40080000;   
    .text : { *(.text*) }
    .rodata : { *(.rodata*) }
    .data : { *(.data*) }
    .bss : { *(.bss*) }
    . = ALIGN(16);
    . += 0x4000;
    _stack_top = .;
}