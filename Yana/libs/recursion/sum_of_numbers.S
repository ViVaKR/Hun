
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
format_str: .asciz "합계: %lld\n"

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION
FUNC_START_FULL sum_of_numbers, 128

	mov x19, #10
	mov x20, #0
  
.L_rec:
  
	cmp  x19, #0
	b.eq .L_print
  
	add x20, x20, x19
	sub x19, x19, #1
	bl  .L_rec

.L_print:
	adrp x0, format_str@PAGE
	add  x0, x0, format_str@PAGEOFF
	sub  sp, sp, #16
	str  X20, [sp, #0]
	bl   _printf
	add  sp, sp, #16
  
FUNC_EXIT_FULL 128

// // Sum of Natural Numbers
// public static int SumOfNumbers(int number)
// {
//   if (number <= 1) return number;
//   return number + (SumOfNumbers(number - 1));
// }
