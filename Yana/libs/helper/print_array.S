.include "section_macros.inc"

// [초기화된 변수]
// __DATA,__data
DATA_SECTION

// [읽기전용 변수/포인터 테이블]
// __DATA,__const
CONST_DATA_SECTION

// [읽기전용 상수 데이터]
//__TEXT,__const
CONST_SECTION

// [C-스타일 문자열 리터럴]
// __TEXT,__cstring,cstring_literals
CSTRING_SECTION
newline_str: .asciz "\n"
fmt_qs:      .asciz "%lld "
// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION
// ----------------------------------------
// void print_array_ll(long long* arr, long long count)
// arr를 "%lld " 형식으로 count개 출력하고 마지막에 개행
//
//   x19 = arr
//   x20 = count
//   x21 = i (인덱스)
// ----------------------------------------
FUNC_START_FULL print_array, 96

	mov x19, x0
	mov x20, x1
	mov x21, #0

.L_pa_loop:
	cmp  x21, x20
	b.ge .L_pa_done

	lsl x0, x21, #3
	ldr x1, [x19, x0]

	adrp x0, fmt_qs@PAGE
	add  x0, x0, fmt_qs@PAGEOFF
	sub  sp, sp, #16
	str  x1, [sp, #0]
	bl   _printf
	add  sp, sp, #16

	add x21, x21, #1
	b   .L_pa_loop

.L_pa_done:
	adrp x0, newline_str@PAGE
	add  x0, x0, newline_str@PAGEOFF
	bl   _printf

FUNC_EXIT_FULL 96