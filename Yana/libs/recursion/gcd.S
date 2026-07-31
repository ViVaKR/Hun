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
gcd_message: .asciz "최대공약수를 구할 두 수를 입력하세요: "
fmt_gcd:     .asciz "최대공약수: %lld\n"
fmt_scanf:   .asciz ""

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION

// 최대 공약수 구하기 24, 18
// x0 = dividend
// x1 = divisor
// udiv x2, x0, x1      // x0 / x1 (몫 계산)
// msub x3, x2, x1, x0 // x0 % x1 (나머지 계산)  

// ==========================================
// [1] 재귀로 동작하는 순수 GCD 서브루틴
// 입력: x0 = a, x1 = b
// 출력: x0 = 최대공약수 결과값
// ==========================================
FUNC_START_LIGHT get_gcd, 16
  
  // --- Base Case: if (b == 0) return a; ---
	cmp  x1, #0  // b 가 0인가?
	b.eq .L_gcd_done
  
  // --- 나머지 계산 : (a % b) ---
	udiv x2, x0, x1   // x2 = a / b (몫)
	msub x2, x2, x1, x0 // x2 = a - (몫 * b) -> 나머지(a % b)
  
  // --- 재귀 호출 인자 세팅: GetGCD(b, a % b) ---
  // 1. mov x0, x1과 mov x1, x2의 아름다움:
  //    - C# GetGCD(b, a % b)에서 괄호 안의 위치 교환이, 
  //      어셈블리에서는 레지스터 끼워 넣기 2줄(mov)로 눈에 보이게 일어난다는 점!
  // 2. 결과 리턴의 스무스함 (x0):Base Case (b == 0)가 되는 순간 
  //      $a$ 값(현재 x0)이 이미 x0에 들어있으므로, 
  //      별도의 복사 연산 없이 그냥 ret을 타고 퐁퐁퐁 빠져나옵니다.
  // 3. 재귀가 스택을 차곡차곡 쌓고 푸는 과정:
  //    24, 18 $\rightarrow$ 18, 6 $\rightarrow$ 6, 0 삼단계로 스택이 깊어졌다가, 
  //    6을 쥐고 탈출하는 전율을 직접 보여줄 수 있습니다!
	mov x0, x1  // 다음 a 자리 (x0)에 현재 b(x1) 를 대입
	mov x1, x2  // 다음 b 자리 (x1)에 현재 나머지 (x2)를 대입
  
	bl _get_gcd             // 재귀 호출 (결과는 x0로 되돌아옴)

.L_gcd_done:

FUNC_EXIT_LIGHT 16

FUNC_START_FULL gcd, 128
  
	adrp x0, gcd_message@PAGE
	add  x0, x0, gcd_message@PAGEOFF
	bl   _input_number
  // 인자 세팅: GetGCD(24, 18)
	// mov x0, #24          // 첫번째 인자 a = 24
	// mov x1, #18          // 두번째 인자 b = 18
  
	bl _get_gcd          // GCD 함수 호출 -> 최종 결과가 x0에 저장되어 돌아옴
  
  // printf("최대공약수: %lld\n", x0)
  // x0에 들어있는 연산 결과를 printf의 두 번째 인자(x1)로 옮겨주고,
  // 첫 번째 인자(x0)에는 포맷 문자열 주소를 넣습니다.
	mov  x1, x0       // 출력할 최대 공약수 값 
	adrp x0, fmt_gcd@PAGE
	add  x0, x0, fmt_gcd@PAGEOFF

	sub sp, sp, #16
	str x1, [sp, #0]
	bl  _printf
	add sp, sp, #16


FUNC_EXIT_FULL 128 

/*
// public static int GetGCD(int a, int b)
// {
//     // Base Case: 나머지가 0이 되면 b가 바로 최대공약수!
//     if (b == 0) return a;

//     // b와 (a를 b로 나눈 나머지)를 가지고 다시 재귀 호출
//     return GetGCD(b, a % b);
// }
// GetGCD(24, 18) -> GetGCD(18, 6) -> GetGCD(6, 0) -> 6 반환!

*/