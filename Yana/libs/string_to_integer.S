.include "section_macros.inc"
.global _string_to_integer

BSS_SECTION
CONST_DATA_SECTION
DATA_SECTION
CONST_SECTION
CSTRING_SECTION
CODE_SECTION
_string_to_integer:
  
  stp x29, x30, [sp, #-16]!
  mov x29, sp
  // 인자 :  x0 = 변환할 문자열의 시작 주소
   mov x1, #0     // x1: 최종 누적 숫자를 담을 방 (0으로 초기화)
   mov x2, #10    // x2: 10진수 계산을 위해 10을 저장

.L_loop_start:

.L_loop_end:
  
  ldp x29, x30, [sp], #16
  ret