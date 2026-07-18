#define UART0_BASE 0x09000000
volatile unsigned int *const UART0_DR = (unsigned int *)(UART0_BASE + 0x00);
volatile unsigned int *const UART0_FR = (unsigned int *)(UART0_BASE + 0x18);
#define UART_FR_RXFE 0x10

int test_global_variable;

extern long long _asm_get_current_el(void);
// 🔑 인자를 두 개(명령어 인덱스, 뒤의 서브 매개변수 값) 받도록 개조!
extern void asm_vector_branch(long long index, long long arg);

void uart_putc(char c) { *UART0_DR = c; }
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

  // 명령어 해석 대국 출발!
  if (baremetal_strcmp(cmd, "도움말") == 0)
  {
    uart_puts("\n========= [ 여지 OS 커맨드 쉘 도움말 ] =========\n");
    uart_puts("  * 도움말 - 명령어 목록 출력\n");
    uart_puts("  * 청소   - .bss 청소 상태 재확인\n");
    uart_puts("  * 바둑   - 어셈블리 연동 (예: '바둑 1' 치면 진짜 피보나치 계산!)\n");
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

void kernel_main(void)
{
  uart_puts("여지 OS 부팅 중...\n");
  uart_puts("==================================================\n");
  uart_puts("   여지 OS (Yeoji OS) - v0.0.3 (8,9순위 완전체 결합)\n");
  uart_puts("==================================================\n\n");

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
  }
}
