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

bin_buffer: .zero 65 // 64개 비트 + 널문자 (\0)를 저장할 공간 (총 65바이트)

CSTRING_SECTION

// 출력 포맷 문자열
fmt_title:    .asciz "\n===[1단계] ARM64 비트 연산 및 2의 보수 검증 ===\n"
fmt_raw:      .asciz "원본 16진수 값        :0x%X\n"
fmt_signed:   .asciz "Signed 1 Byte (2의 보수) : %d\n"
fmt_unsigned: .asciz "Unsigned 1 Byte : %d\n"

fmt_binary: .asciz "2진수 부호확장 결과 : %s\n" // 문자열 출력

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
  
	// 2. test-byte (0xCB) 로드
	adrp x19, test_byte@PAGE
	add  x19, x19, test_byte@PAGEOFF
	ldrb w19, [x19]                   // 8바이트 통째로 말고, 딱 1바이트(byte) 만 == 읽어옴
  
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
	sxtb x20, W19  // w19 의 하위 비트를 부호 확장 하여 x20 에 저장
	
	// 2진수 변환 및 출력 로직 시작점
	// 버퍼 주소와 변환할 값 로드
	adrp x1, bin_buffer@PAGE
	add  x1, x1, bin_buffer@PAGEOFF  // x1 = 문자열을 채울 버퍼 포인터
	mov  x2, x20                     // x2 = 2진수로 변환할 원본 값 (x20 복사)
	mov  w3, #64                     // x3 = 카운터 (64회 반복)
  
.L_bin_loop:
	tst  x2, #(1 << 63)  // --> readme 설명 참조
	mov  w4, #'0'        // 기본 문자를 '0'으로 설정
	cset w5, ne          // 최상위 비트가 1(not equal) 이면 x5 = 1 , 아니면 0
	add  w4, w4, w5      // '0' + 0 = '0' / '0' + 1 = '1'
	strb w4, [x1], #1    // 버퍼에 '0' 또는 '1' 저장 후 포인터 +1 이동
	lsl  x2, x2, #1      // 원본 값을 왼쪽으로 1비트 시프트 (다음 비트 준비)
	
	subs w3, w3, #1   // 카운더 감소
	b.ne .L_bin_loop  // 64번 반복할 때까지 루프
	
	mov  w4, #0
	strb w4, [x1]  //  문자열의 끝을 알리는 널 무자 ('\0')
	
	// printf 로 생성된 2진수 문자열 출력
	// printf로 생성된 2진수 문자열 출력
	adrp x0, fmt_binary@PAGE
	add  x0, x0, fmt_binary@PAGEOFF  // 파라미터 1: 포맷 문자열
	adrp x1, bin_buffer@PAGE
	add  x1, x1, bin_buffer@PAGEOFF  // 파라미터 2: 완성된 2진수 문자열 버퍼
	
	sub sp, sp, #16
	str x1, [sp, #0]  // printf 호출을 위해 스택에 파라미터 저장
	bl  _printf
	add sp, sp, #16
	
	
	// 10진수 출력
	adrp x0, fmt_signed@PAGE
	add  x0, x0, fmt_signed@PAGEOFF
	sub  sp, sp, #16
	str  x20, [sp, #0]
	bl   _printf
	add  sp, sp, #16
	
	// 5. Unsigned 1 Byte 연산 (UXTB: Zero Extend Byte)
	// 상위 비트를 모두 0으로 채움 -> 203
	uxtb x21, w19  // w19 의 하위 8비트만 남기고 0으로 채움
	
	adrp x0, fmt_unsigned@PAGE
	add  x0, x0, fmt_unsigned@PAGEOFF
	
	adrp x0, fmt_unsigned@PAGE
	add  x0, x0, fmt_unsigned@PAGEOFF
	sub  sp, sp, #16
	str  X21, [sp, #0]
	bl   _printf
	add  sp, sp, #16

FUNC_EXIT 32

