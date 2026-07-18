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
  uart_puts("==========================================\n");
  uart_puts("   Yeoji OS - v0.0.1 (aarch64, baremetal)\n");
  uart_puts("==========================================\n");
  uart_puts("\n");
  uart_puts("  Hello, World!\n");
  uart_puts("  \xEC\x97\xAC\xEC\xA7\x80, \xEC\x95\x88\xEB\x85\x95!\n"); // "여지, 안녕!" UTF-8
  uart_puts("\n");
  uart_puts("Booted with no OS beneath us. Just Yeoji and the metal.\n");

  while (1)
  {
    // 무한루프 - 커널이 여기 계속 머묾
    /*
    1. `UART 입력 받기` — uart_getc() 만들어서 키보드로 친 글자를 다시 되돌려 찍기 (echo).
                        이게 되면 나중에 훈 어셈블리 scanf 대체 로직의 베어메탈 버전 첫 걸음.
    2. `.bss` 초기화 루프 — boot.S에 _start에서 .bss 구간을 0으로 밀어주는 코드 추가
                        (지금은 전역변수가 없어서 티 안 나지만, 곧 필요해짐)
    3. `Exception Level 확인` — 지금 QEMU가 EL1로 진입시켜주는지, EL2/EL3 개입 여부 확인 (나중에 인터럽트 벡터 세팅할 때 중요)
    4. `한글 문자열로 전환` — uart_puts("여지 OS 부팅 중...\n")로 바꿔서 UTF-8 바이트가 그대로 잘 나가는지 확인
                          (터미널 인코딩만 맞으면 바로 결행)
    */
  }
}