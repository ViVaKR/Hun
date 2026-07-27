.include "section_macros.inc"
CSTRING_SECTION
fib_result: .asciz "--> %lld\n"

CODE_SECTION
// =================================================================
// int fib(int n) { if (n<2) return n; return fib(n-1)+fib(n-2); }
// =================================================================

	FUNC_START_FULL fib, 128

    // -- 
	str  x0, [sp, #96]           // n 값을 스택에 백업 (재귀 호출 중 x0이 덮어써지므로)
	cmp  x0, #2
	b.lt _fib_base              // n < 2 이면 바로 리턴
    
    // fib(n-1) 구하기
	sub x0, x0, #1              // x0 = n - 1
	bl  _fib                    // x0 = fib(n-1)
	str x0, [sp, #104]          // fib(n-1) 결과를 안전구역(sp+104)에 임시저장

	ldr x0, [sp, #96]           // 아까 저장한 원래 n 값 복원 
	sub x0, x0, #2              // x0 = n-2
	bl  _fib                     // x0 = fib(n-2)
    
    // 두 값 합산
	ldr x1, [sp, #104]           // 임시저장 했던 fib(n-1) 꺼내기
	add x0, x0, x1              // x0 = fib(n-1) + fib(n-2)
    
    // 계산 완료 되었으니 안전하게 탈출 
	FUNC_EXIT_FULL 128

_fib_base:
	ldr x0, [sp, #96]           // n 그대로 리턴
    FUNC_EXIT_FULL 128


# - 이 코드로 할 훈련 포인트
# 1. br s -n _fib 걸고 c로 여러 번 멈춰가면서 몇 번째 호출인지 확인
# 2. bt 쳐서 스택이 얼마나 깊게 쌓였는지 시각적으로 확인 (fib(5)→fib(4)→fib(3)→fib(2) 이런 식으로)
# 3. memory read -f x -c 8 $sp로 스택에 쌓인 n값, fib(n-1) 임시값들이 실제로 어디 저장돼 있는지 헥스로 확인
# 4. frame select 1, frame select 2로 콜스택 오르내리며 각 프레임의 n 값 비교
# 5. 마지막에 _main으로 돌아왔을 때 x0 = 5 (fib(5)=5) 확인
