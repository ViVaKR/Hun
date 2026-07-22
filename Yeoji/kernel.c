#define UART0_BASE 0x09000000
volatile unsigned int *const UART0_DR = (unsigned int *)(UART0_BASE + 0x00);
volatile unsigned int *const UART0_FR = (unsigned int *)(UART0_BASE + 0x18);
#define UART_FR_RXFE 0x10

int test_global_variable;

extern long long _asm_get_current_el(void);
extern void asm_vector_branch(long long index, long long arg);
extern void asm_enable_timer(unsigned int ticks);
extern unsigned int asm_get_timer_freq(void);
extern void uart_puts(const char *s);
extern void _install_vectors(void);
extern void gic_init(void);

void uart_putc(char c); // ★ 정의는 뒤에 있어도, 미리 이렇게 원형만 알려주면 됨

static void uart_put_hex64(unsigned long long val)
{
  uart_puts("0x");
  for (int i = 60; i >= 0; i -= 4)
  {
    unsigned int nibble = (val >> i) & 0xF;
    uart_putc(nibble < 10 ? ('0' + nibble) : ('a' + nibble - 10));
  }
}

void uart_putc(char c) { *UART0_DR = c; } // 실제 정의는 원래 자리 그대로 둬도 OK

void uart_puts(const char *s)
{
  while (*s)
  {
    uart_putc(*s);
    s++;
  }
}

char uart_getc(void)
{
  while (*UART0_FR & UART_FR_RXFE)
  {
  }
  return (char)(*UART0_DR & 0xFF);
}

int baremetal_strcmp(const char *s1, const char *s2)
{
  while (*s1 && (*s1 == *s2))
  {
    s1++;
    s2++;
  }
  return *(unsigned char *)s1 - *(unsigned char *)s2;
}

void test_timer_heartbeat(void)
{
  uart_puts("\n⏳ [커널] 시스템 타이머 시동을 준비하네...\n");

  unsigned int freq = asm_get_timer_freq();
  asm_enable_timer(freq);
  uart_puts("⚡ [커널] 심장이 뛰기 시작했네! (타이머 On)\n");

  unsigned int loop_count = 0;

  while (1)
  {
    // 🔑 [정화 포인트] CPU 규격에 맞게 웅장한 64비트 방을 준비합니다!
    unsigned long long ctrl;

    // 수식어 %w0를 떼어내고, 순수한 %0으로 64비트 전체를 직격으로 긁어옵니다.
    __asm__ volatile("mrs %0, cntp_ctl_el0" : "=r"(ctrl));

    // 64비트 방에서 2번째 비트(ISTATUS)를 검사하는 것은 32비트 때와 완전히 동일합니다!
    if (ctrl & (1 << 2))
    {
      loop_count++;
      if (loop_count == 1)
        uart_puts("💓 [심장박동] 쿵... (1초 경과)\n");
      else if (loop_count == 2)
        uart_puts("💓 [심장박동] 쾅... (2초 경과)\n");
      else if (loop_count == 3)
      {
        uart_puts("💓 [심장박동] 쿠콰콰쾅! 타이머 제어 테스트 완료\n\n");
        break;
      }

      // 다음 1초를 위해 다시 타이머 재장전!
      asm_enable_timer(freq);
    }
  }
}

// -------------------------------------------------------------
// 🌟 [8순위 핵심] 공백을 분리하여 매개변수를 파싱하는 고급 쉘 엔진
// -------------------------------------------------------------
void yeoji_shell_execute(char *cmd_line)
{
  char *cmd = cmd_line;
  char *arg_str = "";
  long long arg_val = 0;

  // 🔑 포인터를 전진시키며 공백(' ')이 있는지 뒤적거립니다!
  char *p = cmd_line;
  while (*p)
  {
    if (*p == ' ')
    {
      *p = '\0';       // 공백 자리를 널 문자로 똭 쪼개서 앞 단어를 명령어로 고정!
      arg_str = p + 1; // 공백 바로 다음 주소를 인자(Argument) 문자열로 지정!
      break;
    }
    p++;
  }

  // 인자 문자열이 숫자인 경우 베어메탈 식 간이 atoi 연산 적용 (0~9 한자리 우선 방어)
  if (*arg_str >= '0' && *arg_str <= '9')
  {
    arg_val = *arg_str - '0';
  }

  // 명령어 해석 출발!
  if (baremetal_strcmp(cmd, "도움말") == 0)
  {
    uart_puts("\n========= [ 여지 OS 커맨드 쉘 도움말 ] =========\n");
    uart_puts("  * 도움말 - 명령어 목록 출력\n");
    uart_puts("  * 청소   - .bss 청소 상태 재확인\n");
    uart_puts("  * 바둑   - 어셈블리 연동 (예: '바둑 1' 치면 진짜 피보나치 계산!)\n");
    uart_puts("  * 종료   - 쉘을 닫고 안전하게 회군\n\n");
    uart_puts("==================================================\n\n");
  }
  else if (baremetal_strcmp(cmd, "help") == 0)
  {
    uart_puts("\n========= [ 여지 OS 커맨드 쉘 도움말 ] =========\n");
    uart_puts("  * 도움말 / help - 명령어 목록 출력\n");
    uart_puts("  * 청소 / clean  - .bss 청소 상태 재확인\n");
    uart_puts("  * 바둑   - 어셈블리 연동 (예: '바둑 1' 치면 진짜 피보나치 계산!)\n");
    uart_puts("  * 종료   - 쉘을 닫고 안전하게 회군\n\n");
    uart_puts("==================================================\n\n");
  }
  else if (baremetal_strcmp(cmd, "청소") == 0)
  {
    if (test_global_variable == 0)
    {
      uart_puts("\n✨ [쉘] 현재 메모리는 무결점 청정지역일세!\n\n");
    }
  }
  else if (baremetal_strcmp(cmd, "바둑") == 0)
  {
    uart_puts("\n♟️ [쉘] 어셈블리 주소 분기 코어를 매개변수와 함께 호출하네!\n");

    // 🚀 8, 9순위 결합 출격!
    // 명령어 인덱스는 1번(피보나치), 뒤의 인자 값(arg_val)을 통째로 어셈블리로 토스!
    // 만약 '바둑' 뒤에 숫자를 안 붙이고 그냥 치면 arg_val은 기본 0번(플레이그라운드)으로 자동 안착 처리되네.
    if (*arg_str != '\0')
    {
      asm_vector_branch(1, arg_val); // 피보나치 연산 코어 호출!
    }
    else
    {
      asm_vector_branch(0, 0); // 기본 플레이그라운드 호출!
    }
  }
  // 🔑 [신설 2] '종료' 명령어 활성화!
  else if (baremetal_strcmp(cmd, "종료") == 0)
  {
    uart_puts("\n🚪 [종료] Yeoji-Shell을 닫고 커널 본진으로 복귀하네.\n");
    uart_puts("💤 [시스템] CPU를 영원한 수면(WFE) 상태로 전환하네... 안녕!\n\n");

    // ⚡ 현재 쉘 함수를 즉시 탈출!
    return;
  }
  else if (baremetal_strcmp(cmd, "") == 0)
  {
  }
  else
  {
    uart_puts("\n❌ [오류] '");
    uart_puts(cmd);
    uart_puts("' 은(는) 알 수 없는 명령이네.\n\n");
  }
}

// x0=type, x1=ESR_EL1, x2=ELR_EL1, x3=FAR_EL1  (AAPCS64 인자 순서 그대로!)
void exc_c_handler(unsigned long long type, unsigned long long esr,
                   unsigned long long elr, unsigned long long far)
{
  uart_puts("\n\n💥 [예외 발생] ");
  switch (type)
  {
  case 1:
    uart_puts("동기(SYNC) 예외\n");
    break;
  case 2:
    uart_puts("IRQ (인터럽트)\n");
    break;
  case 3:
    uart_puts("FIQ\n");
    break;
  case 4:
    uart_puts("SError\n");
    break;
  default:
    uart_puts("잘못된 벡터 진입 (원래 안 써야 하는 그룹!)\n");
    break;
  }
  uart_puts("  ESR_EL1 = ");
  uart_put_hex64(esr);
  uart_puts("\n");
  uart_puts("  ELR_EL1 = ");
  uart_put_hex64(elr);
  uart_puts("\n");
  uart_puts("  FAR_EL1 = ");
  uart_put_hex64(far);
  uart_puts("\n");

  if (type != 2)
    uart_puts("\n⚠️  복구 불가능한 예외 — CPU 정지\n");
}

void kernel_main(void)
{
  uart_puts("여지 OS 부팅 중...\n");
  uart_puts("==================================================\n");
  uart_puts("   여지 OS (Yeoji OS) - v0.0.4 (8,9순위 완전체 결합)\n");
  uart_puts("==================================================\n\n");

  if (test_global_variable == 0)
  {
    uart_puts("[메모리 검증] ✅ .bss 영역이 0으로 완벽하게 무결점 청소되었습니다!\n");
  }
  else
  {
    uart_puts("[메모리 검증] ❌ 경보! 메모리에 쓰레기 값이 살아있습니다!\n");
  }

  long long el_level = _asm_get_current_el();

  // 권한 등급 출력 정화
  if (el_level == 1)
  {
    uart_puts("[권한 등급] 👑 현재 CPU 권한: EL1 (가장 안전하고 완벽한 커널 모드입니다!)\n");
  }
  else if (el_level == 2)
  {
    uart_puts("[권한 등급] 🕹️ 현재 CPU 권한: EL2 (하이퍼바이저 모드로 진입했습니다!)\n");
  }
  else if (el_level == 3)
  {
    uart_puts("[권한 등급] 🛡️ 현재 CPU 권한: EL3 (최고 존엄 보안 모드입니다!)\n");
  }
  else
  {
    uart_puts("[권한 등급] 👤 현재 CPU 권한: EL0 (유저 모드입니다. 커널 제어 불가!)\n");
  }
  uart_puts("\n");

  // "여지, 안녕!" UTF-8
  //  UTF-8 바이트가 그대로 잘 나가는지 확인
  uart_puts("\xEC\x97\xAC\xEC\xA7\x80, \xEC\x95\x88\xEB\x85\x95!\n");
  uart_puts("\n");
  uart_puts("Booted with no OS beneath us. Just Yeoji and the metal.\n");

  _install_vectors();
  uart_puts("[벡터] ✅ VBAR_EL1 등록 완료 — 예외 처리 준비 끝!\n\n");

  gic_init();
  asm_enable_timer(asm_get_timer_freq()); // 첫 타이머 장전

  // __asm__ volatile("svc #0"); // ★ 일부러 예외를 터뜨려서 진짜 잡히는지 확인
  // 🔑 [출격 완료] 쉘이 뜨기 전, 베어메탈의 심장박동을 먼저 요란하게 확인합니다!
  // test_timer_heartbeat();
  char cmd_buffer[128];
  int buf_idx = 0;

  uart_puts("Yeoji-Shell> ");

  while (1)
  {
    char input_char = uart_getc();

    if (input_char == '\r')
    {
      uart_putc('\r');
      uart_putc('\n');
      cmd_buffer[buf_idx] = '\0';

      // 🔑 주소 조작을 위해 포인터 변형이 가능하도록 버퍼 주소 전달!
      yeoji_shell_execute(cmd_buffer);

      buf_idx = 0;
      uart_puts("Yeoji-Shell> ");
    }
    else if (input_char == 127 || input_char == '\b')
    {
      if (buf_idx > 0)
      {
        buf_idx--;
        uart_putc('\b');
        uart_putc(' ');
        uart_putc('\b');
      }
    }
    else
    {
      if (buf_idx < 127)
      {
        cmd_buffer[buf_idx] = input_char;
        buf_idx++;
        uart_putc(input_char);
      }
    }
  } // 쉘의 while(1) 대루프가 끝나는 지점

  // [완벽할 종료 안착] 쉘 루프가 탈출되면 이곳으로 떨어짐
  while (1)
  {
    __asm__ volatile("wfe"); // CPU 를 저전력 절전 수면 상태로 동결![cite: 1]
  }
}
