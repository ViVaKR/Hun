.include "section_macros.inc"

CSTRING_SECTION
fmt_move:  .asciz "원판 %lld:\t%c -> %c\n"
fmt_total: .asciz "\n총 이동 횟수: %lld 회\n"

DATA_SECTION
move_count: .quad 0

CODE_SECTION
// ----------------------------------------
// void hanoi(long long n, char from, char to, char via)
// 바깥에서 호출되는 "진입점" -- 카운터 초기화 + 재귀 실행 + 총합 출력
// ----------------------------------------
FUNC_START_FULL hanoi, 128

	// 재귀 시작 전에 카운터 리셋
	adrp x9, move_count@PAGE
	add  x9, x9, move_count@PAGEOFF
	str  xzr, [x9]              // move_count = 0, Zero Register
															// x9 이 가리키는 메모리 주소에 64비트 0을 저장
	bl _hanoi_rec              // 실제 재귀는 내부 함수가 담당

	// 재귀가 완전히 끝난 뒤(가장 바깥쪽으로 복귀한 뒤) 총합 출력
	adrp x9, move_count@PAGE
	add  x9, x9, move_count@PAGEOFF
	ldr  x1, [x9]
	
	adrp x0, fmt_total@PAGE
	add  x0, x0, fmt_total@PAGEOFF
	sub  sp, sp, #16
	str  x1, [sp, #0]
	bl   _printf
	add  sp, sp, #16

FUNC_EXIT_FULL 128


// ----------------------------------------
// void hanoi_rec(long long n, char from, char to, char via)
// 실제 재귀 로직 -- 기존 hanoi 몸통 그대로
//
//   x19 = n     (남은 원판 개수)
//   x20 = from  (출발 기둥)
//   x21 = to    (도착 기둥)
//   x22 = via   (경유 기둥)
// ----------------------------------------
FUNC_START_FULL hanoi_rec, 128
	
	// hanoi(x19, x20(from), x21(to), x22(via));
	mov x19, x0     // n
	mov x20, x1     // from
	mov x21, x2     // to
	mov x22, x3     // via

	cmp  x19, #0
	b.le .L_done            // n <= 0 이면 끝

  // 1) hanoi(n-1, x1(from), x2(via), x3(to))
	sub x0, x19, #1 // n-1
	mov x1, x20			// from
	mov x2, x22			// via
	mov x3, x21			// to
	bl  _hanoi_rec

  // 2) 현재 원판 이동 출력 + 카운터 증가
	// printf("원판 %lld: %c(from) --> %c(to)"); 
	adrp x0, fmt_move@PAGE
	add  x0, x0, fmt_move@PAGEOFF
	sub  sp, sp, #32
	str  x19, [sp, #0]	    // %lld
	str  x20, [sp, #8]      // %c --> from
	str  x21, [sp, #16]     // %c --> to
	bl   _printf
	add  sp, sp, #32

	// move_count++
	adrp x9, move_count@PAGE
	add  x9, x9, move_count@PAGEOFF
	ldr  x10, [x9]
	add  x10, x10, #1
	str  x10, [x9]

    // 3) hanoi(n-1, via, to, from)
	sub x0, x19, #1 // n-1
	mov x1, x22			// via
	mov x2, x21			// to
	mov x3, x20			// from
	bl  _hanoi_rec

.L_done:
FUNC_EXIT_FULL 128