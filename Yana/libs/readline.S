.include "section_macros.inc"
.global _readline
BSS_SECTION
CONST_DATA_SECTION
DATA_SECTION
CONST_SECTION
CSTRING_SECTION
  prompt_readline: .asciz "합계를 구할 두 정수 입력: "
  prompt_readline_end:

  str_readline: .asciz "%lld %lld"

CODE_SECTION
_readline:

  // fp(x29, lr(x30) 저장 (8 + 8 + 16바이트)
  stp x29, x30, [sp, #-48]!
  mov x29, sp 
  stp x19, x20, [sp, #16] // scanf 입력값을 담을 안전 스택 주소 보존용
  
  // prompt_readline 출력 
  adrp x0, prompt_readline@PAGE
  add x0, x0, prompt_readline@PAGEOFF
  adrp x1, prompt_readline_end@PAGE
  add x1, x1, prompt_readline_end@PAGEOFf
  sub x1, x1, x0
  // bl _printf
  bl _to_print
  
  // scanf 호출 준비
  adrp x0, str_readline@PAGE
  add x0, x0, str_readline@PAGEOFF
  
  // sp+32, sp+40 지점을 scanf 의 안전입출력 버퍼로 사용하기
  add x19, sp, #32    // &a (안전지대)
  add x20, sp, #40    // &b (안전지대)
  
  sub sp, sp, #16     // Apple 가변인자 ABI: 인자를 스택에 올려야 함
  stp x19, x20, [sp]   // scanf 가 여기서 va_arg로 읽어감
  bl _scanf           // scanf 호출 (a 와 b 가 스택에 입력됨)
  add sp, sp, #16     // 스택 복원  

  // 3. 값을 로들해서 다음 연산 준비
  ldr x0, [sp, #32]      // a의 값을 로드
  ldr x1, [sp, #40]      // b의 값을 로그

  bl _calc_sum
  
  ldp x19, x20, [sp, #16]
  mov x0, #0
  ldp x29, x30, [sp], #48
  ret

/* 
조건 코드설명데이터 타입
EQ 같음 (Equal)공통
NE 같지 않음 (Not Equal)공통
GT 초과 (Greater Than)부호 있는 정수 (Signed)
GE 이상 (Greater Than or Equal)부호 있는 정수 (Signed)
LT 미만 (Less Than)부호 있는 정수 (Signed)
LE 이하 (Less Than or Equal)부호 있는 정수 (Signed)
HI 초과 (Higher)부호 없는 정수 (Unsigned)
HS / CS이상 (Higher or Same / Carry Set)부호 없는 정수 (Unsigned)
LO / CC미만 (Lower / Carry Clear)부호 없는 정수 (Unsigned)
LS 이하 (Lower or Same)부호 없는 정수 (Unsigned)

 */