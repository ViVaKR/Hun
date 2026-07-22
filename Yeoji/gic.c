#define GICD_BASE 0x08000000
#define GICC_BASE 0x08010000
volatile unsigned int *const GICD_CTLR = (unsigned int *)(GICD_BASE + 0x000);
volatile unsigned int *const GICD_ISENABLER0 = (unsigned int *)(GICD_BASE + 0x100);

volatile unsigned int *const GICC_CTLR = (unsigned int *)(GICC_BASE + 0x000);
volatile unsigned int *const GICC_PMR = (unsigned int *)(GICC_BASE + 0x004);
volatile unsigned int *const GICC_IAR = (unsigned int *)(GICC_BASE + 0x00C);
volatile unsigned int *const GICC_EOIR = (unsigned int *)(GICC_BASE + 0x010);

// QEMU virt: EL1 비보안 물리 타이머(cntp)는 PPI #30에 배선되어 있음
#define TIMER_PPI_ID 30

extern void uart_puts(const char *s);
extern void asm_enable_timer(unsigned int ticks);
extern unsigned int asm_get_timer_freq(void);
extern void enable_irq(void); // boot.S에 추가할 msr daifclr 래퍼

static unsigned int heartbeat_count = 0;

void gic_init(void)
{
  *GICD_CTLR = 1;                          // 1. Distributor 전체 스위치 On
  *GICC_PMR = 0xFF;                        // 2. 우선순위 마스크 전부 허용
  *GICC_CTLR = 1;                          // 3. 이 코어의 CPU Interface 스위치 On
  *GICD_ISENABLER0 = (1u << TIMER_PPI_ID); // 4. PPI #30(타이머) 개별 활성화

  enable_irq(); // 5. CPU 레벨 IRQ 마스크 해제 (PSTATE.I = 0)
  uart_puts("[GIC] ✅ GICv2 초기화 완료 — 타이머 IRQ 활성화!\n");
}

// _irq_handler(vectors.S)에서 직접 호출됨
void irq_handler_c(void)
{
  unsigned int irq_id = *GICC_IAR & 0x3FF;

  if (irq_id == TIMER_PPI_ID)
  {
    heartbeat_count++;
    if (heartbeat_count % 5 == 0) // 5초에 한 번만 출력 — 셸 입력 방해 안 하게
      uart_puts("💓\n");
    asm_enable_timer(asm_get_timer_freq());
  }

  *GICC_EOIR = irq_id;
}

// void irq_handler_c(void)
// {
//   unsigned int irq_id = *GICC_IAR & 0x3FF; // "누가 울렸는지" ID 확인 (Acknowledge)
//   if (irq_id == TIMER_PPI_ID)
//   {
//     heartbeat_count++;
//     uart_puts("💓 [IRQ 하트비트] 진짜 인터럽트로 심장이 뜁니다!\n");
//     asm_enable_timer(asm_get_timer_freq()); // 다음 1초를 위해 재장전
//   }

//   *GICC_EOIR = irq_id; // "처리 끝났다" 통보 (End Of Interrupt) — 이거 빼먹으면 재발화 안 됨!
// }