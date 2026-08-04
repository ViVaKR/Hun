.include "section_macros.inc"

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION
FUNC_START_FULL pi_print, 128

	// ================================================
	// 1. LITERAL4_SECTION (float) 상수를 불러와서 출력
	// ================================================
	// (1) _pi_float 메모리 주소 로드
	adrp x10, _pi_float@PAGE
	add  x10, x10, _pi_float@PAGEOFF
  
	// (2) 32 비트 float 값 로드 (s 레지스터 사용)
	ldr s0, [x10]  // 3.1415927 (float)
  
	// (3) printf 전달을 위해 float(s0) -> double(d0)로 정밀도 확장
	fcvt d0, s0  // d0 = (double)s0
  
	// (4) 포맷 문자열 로드 후 printf 호출
	adrp x0, _fmt_float@PAGE
	add  x0, x0, _fmt_float@PAGEOFF
	sub  sp, sp, #16
	str  d0, [sp, #0]
	bl   _printf
	add  sp, sp, #16
  
	mov x0, #0

FUNC_EXIT_FULL 128