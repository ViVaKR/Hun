// PL011 UART 베이스 주소 (QEMU virt 머신 고정 주소)
#define UART0_BASE 0x09000000
volatile unsigned int *const UART0_DR = (unsigned int *)UART0_BASE;

void uart_putc(char c)
{
  *UART0_DR = c;
}

void uart_puts(const char *s)
{
  while (*s)
  {
    uart_putc(*s);
    s++;
  }
}

void kernel_main(void)
{
  uart_puts("YeoJi OS booting...\n");
  // 지금 단계
  // 나중에: uart_puts("여지 OS 부팅 중...\n");
  // UTF-8 인코딩만 잘 처리되면 바로 전환 가능

  while (1)
  {
    // 무한루프 - 커널이 여기 계속 머묾
  }
}