.include "section_macros.inc"

CSTRING_SECTION
fmt_move: .asciz "원판 %lld:\t%c -> %c\n"

CODE_SECTION
// ----------------------------------------
// void hanoi(long long n, char from, char to, char via)
// 파라미터를 callee-saved 레지스터에 캐싱해서
// 재귀 호출(bl) 중에도 안전하게 보존
//
//   x19 = n     (남은 원판 개수)
//   x20 = from  (출발 기둥)
//   x21 = to    (도착 기둥)
//   x22 = via   (경유 기둥)
// ----------------------------------------
FUNC_START_FULL hanoi, 128          // 지역변수 없음 -> 96으로 충분

	mov x19, x0     // n
	mov x20, x1     // from
	mov x21, x2     // to
	mov x22, x3     // via

	cmp  x19, #0
	b.le .L_done            // n <= 0 이면 끝

  // 1) hanoi(n-1, from, via, to)  -- from에서 via로 (to를 경유지로 씀)
	sub x0, x19, #1
	mov x1, x20
	mov x2, x22
	mov x3, x21
	bl  _hanoi

    // 2) 현재 원판 이동 출력: "원판 n: from -> to"
	adrp x0, fmt_move@PAGE
	add  x0, x0, fmt_move@PAGEOFF
	sub  sp, sp, #32
	str  x19, [sp, #0]	   // %lld  --> long long (8바이트, offset 0)
	str  x20, [sp, #8]     // %c --> from 
	str  x21, [sp, #16]     // %c --> to
	bl   _printf
	add  sp, sp, #32

    // 3) hanoi(n-1, via, to, from)  -- via에서 to로 (from을 경유지로 씀)
	sub x0, x19, #1
	mov x1, x22
	mov x2, x21
	mov x3, x20
	bl  _hanoi

.L_done:
FUNC_EXIT_FULL 128