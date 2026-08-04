.include "section_macros.inc"

// [C-스타일 문자열 리터럴]
// __TEXT,__cstring,cstring_literals
CSTRING_SECTION
// 10진수로 상위/하위 나누어 출력할때
fmt_128_dec: .asciz "128비트 결과 (상위: %lld, 하위; %lld)\n"

// 16진수로 128비트 전체를 붙여서 웅장하게 볼 때 (추천!)
fmt_128_hex: .asciz "128비트 결과 (HEX) --> 0x%016llX%016llX\n"

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION
FUNC_START_FULL mnemonic_adc, 128

	// --- [128비트 A 준비] ---
	// A = 0x0000_0000_0000_0001_FFFF_FFFF_FFFF_FFFF (상위: 1, 하위: F...F)
	movz x0, #0xFFFF
	movk x0, #0xFFFF, lsl #16
	movk x0, #0xFFFF, lsl #32
	movk x0, #0xFFFF, lsl #48  // A의 하위 64비트
	mov  x1, #1                // A의 상위 64비트
  
	// --- [128비트 B 준비] ---
	// B = 0x0000_0000_0000_0002 0000_0000_0000_0001 (상위: 2, 하위: 1)
	mov x2, #1  // B의 하위 64비트
	mov x3, #2  // B의 상위 64비트
  
	// --- [128비트 덧셈 수행] ---
	adds x4, x0, x2  // 하위끼리 덧셈 (FFFF...+ 1 = 0 이 되고 Carry 발생!)
	adc  x5, x1, x3  // 상위끼리 덧셈 + Carry (1 + 2 + 1 = 4)
  
  // 결과:
  // x4 (하위 64비트) = 0x0000_0000_0000_0000
  // x5 (상위 64비트) = 0x0000_0000_0000_0004
  // x0: Format String 주소
  // x1: 첫번째 인자 (%016llX -> 상위 64비트 x5)
  // x2: 두번째 인자 (%016llX -> 하위 64비트 x4)
  
	adrp x0, fmt_128_hex@PAGE
	add  x0, x0, fmt_128_hex@PAGEOFF
	sub  sp, sp, #16
	stp  x5, x4, [sp, #0]
	bl   _printf
	add  sp, sp, #16
	mov  x1, #0

FUNC_EXIT_FULL 128