.include "section_macros.inc"

DATA_SECTION

// .byte  0xCB     // 8비트  -> ldrb+sxtb(또는 ldrsb) 테스트 대상 O
// .hword 0xCB     // 16비트 -> ldrh+sxth(또는 ldrsh) 테스트 대상 O  (참고로 .short도 동의어인 어셈블러 있음)
// .word  0xCB     // 32비트 -> 그냥 203 (양수), sxtw 테스트 안 됨
// .quad  0xCB     // 64비트 -> 그냥 203 (양수), 애초에 확장할 이유 자체가 없음
// 데스트 데이터 (0xCB)
test_byte:  .byte  0xCB // 8bit, 1byte
test_hword: .hword 0xCB // 16bit, 2byte
test_word:  .word  0xCB // 32bit, 4byte
test_quad:  .quad  0xCB // 64bit, 8byte

CSTRING_SECTION

// 출력 포맷 문자열
fmt_title:    .asciz "\n===[1단계] ARM64 비트 연산 및 2의 보수 검증 ===\n"
fmt_raw:      .asciz "원본 16진수 값        :0x%X\n"
fmt_signed:   .asciz "Signed 1 Byte (2의 보수) : %d\n"
fmt_unsigned: .asciz "Unsigned 1 Byte : %d\n"

CODE_SECTION
// ------------------------------------------------------
// 함수: VariableSizeTest
// 기능: 0xCB의 Signed/Unsigned 확장 연산을 수행하고 결과를 출력함
// ------------------------------------------------------
FUNC_START variable_size, 32

  // 1. 타이틀 출력
	adrp x0, fmt_title@PAGE
	add  x0, x0, fmt_title@PAGEOFF
	bl   _printf
  
  // 2. test-val (0xCB) 로드
	adrp x19, test_val@PAGE
	add  x19, x19, test_val@PAGEOFF
	ldr  x19, [x19] // x19 = 0xCB
  
  // 3. 원본 16진수 출력
	adrp x0, fmt_raw@PAGE
	add  x0, x0, fmt_raw@PAGEOFF
	sub  sp, sp, #16
	str  x19, [sp, #0]
	bl   _printf
	add  sp, sp, #16
  
  // 4. Signed 1 Byte 연산 (SXTB: Sign Extend Byte)
  // 0xCB (1100 1011) 의 최상위 비트(1) 를 64비트로 전체로 부호 확장 -> -53
  // 1100 1011 -> 0011 0100 + 1 (2의보수) = 11 0101 -> 32 + 16 + 4 + 1 -> -53
	sxtb x20, W19            // w19 의 하위 비트를 부호 확장 하여 x20 에 저장
  sxt
  

  

FUNC_EXIT 32