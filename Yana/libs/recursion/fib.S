.include "section_macros.inc"
CODE_SECTION

// =================================================================
// int fib(int n) { if (n<2) return n; return fib(n-1)+fib(n-2); }
// long fib(long n)  -- 메모이제이션(동적 계획법) 적용 버전
// =================================================================
FUNC_START_FULL fib, 128

	// n 값을 스택에 백업 (재귀 호출 중 x0이 덮어써지므로)
	str x0, [sp, #96]
	
	// -----------------------------------------------------------
	// ★ 1단계: 캐시 조회 (범위 체크 후 이미 구해놓은 값이면 바로 리턴!)
	// -----------------------------------------------------------
	cmp  x0, #128
	b.hs .L_compute  // n >= 128 이면 캐시 범위 밖이니 그냥 계산
	cmp  x0, #0
	b.lt .L_compute  // n < 0 이면 이것도 그냥 계산 (비정상 입력 방어)

		
	adrp x9, _fib_memo_valid@PAGE
	add  x9, x9, _fib_memo_valid@PAGEOFF

	// ldrb = "load register byte", 즉 1바이트만 읽어서 32 (w10)에 넣는 명령
	// x9 = 배열의 시작 주소
	// x0 = 현재 우리가 물어보고 있는 n (함수 진입 시 그대로 들고 있음)
	// [x9, x0] = "x9 + x0" 위치의 1바이트 -> 즉 valid[n]
	// w10 = valid[n]
	ldrb w10, [x9, x0]
	
	// cbz = "compare and branch if zero"
	// w10 (즉 valid[n]) 이 0이면 .L_compute 로 점프 진짜 계산을 시작
	// 0 이 아니면 (=1 이면, 이미 계산해 놨다는 뜻) 이줄을 그냥 통과
	cbz w10, .L_compute
	
	// 이번엔 진짜 결과값이 담긴 _fib_memo_val 배열주소를 구함 
	
	adrp x9, _fib_memo_val@PAGE
	add  x9, x9, _fib_memo_val@PAGEOFF
	// .quad(8바이트) 단위 배열 이므로
	// n 번째 원소 주소는 --> 주소 + n * 8 , 그래서 lsl #3 (왼쪽으로 3비트 시프트 = x8)
	// [x9, x0, lsl #3] 은 "스케일드 인덱스 주소 지정 " 문법
	// x9 + (x0 << 3)
	// x0 이 곧 이 함수의 반환값 (ARM64 호출규약: 함수 리턴값은 x0 에 담아서 돌려줌)
	// x0 = val[n]
	ldr x0, [x9, x0, lsl #3]

// fib(n) 진입
//   ├─ 캐시에 있나? (valid[n] == 1?)
//   │    ├─ YES → val[n] 꺼내서 x0에 넣고 → FUNC_EXIT_FULL (여기서 함수 끝! 재귀 안 탐)
//   │    └─ NO  → cbz가 .L_compute로 점프해서 아래로 이어짐
//   │
//   └─ .L_compute: (여기부터가 "진짜 계산" 구간)
// 	재귀 호출로 fib(n-1), fib(n-2) 구하고, 더하고, 캐시에 저장하고, 리턴

// 즉 함수 안에 출구가 두 개인 이유 //

// 빠른 출구: 캐시에 있으면 곧바로 여기서 ret (재귀 호출 자체를 아예 안 함! 이게 메모이제이션의 핵심 — "이미 아는 답을 또 계산하지 않기")
// 느린 출구: 캐시에 없으면 .L_compute 아래로 흘러가서 원래 하던 재귀 계산을 다 하고, 저 아래 .L_store_and_return 이후에 있는 또 다른 FUNC_EXIT_FULL 128로 리턴

// 정리하면 이 함수에는 FUNC_EXIT_FULL 128이 두 군데 있는데, 하나는 "캐시 히트 시 즉시 컷"용이고, 다른 하나는 "실제로 계산 다 하고 저장한 후"용이에요. cbz 명령이 두 갈래 길을 가르는 신호등 역할을 하는 거고요.

// 이게 없으면 어떻게 될까요? 캐시에 값이 있어도 무조건 .L_compute로 흘러가서 fib(n-1), fib(n-2)를 또 재귀 호출하게 되니, 캐시를 만든 의미가 없어져요. 즉 이 조기 탈출 한 줄이 O(2ⁿ) → O(n)으로 바꿔주는 진짜 마법 지점입니다!
FUNC_EXIT_FULL 128 // 여기서 바로 리턴

// -----------------------------------------------------------
// ★ 2단계: 캐시 없으면 실제 계산 (기존 재귀 로직)
// -----------------------------------------------------------
.L_compute:
	cmp  x0, #2
	b.lt .L_fib_base  // n < 2 이면 바로 리턴
    
	// fib(n-1) 구하기
	sub x0, x0, #1      // x0 = n - 1
	bl  _fib            // x0 = fib(n-1) ★ 캐시에 있으면 여기서 바로 컷!
	str x0, [sp, #104]  // fib(n-1) 결과를 안전구역(sp+104)에 임시저장

	ldr x0, [sp, #96]  // 아까 저장한 원래 n 값 복원
	sub x0, x0, #2     // x0 = n-2
	bl  _fib           // x0 = fib(n-2)  ★ 이것도 캐시에 있으면 바로 컷!
    
	// 두 값 합산
	ldr x1, [sp, #104]  // 임시저장 했던 fib(n-1) 꺼내기
	add x0, x0, x1      // x0 = fib(n-1) + fib(n-2)

	b .L_store_and_return

.L_fib_base:
	ldr x0, [sp, #96]  // n 그대로 리턴 (0 또는 1)

// -------------------------------------
// ★ 3단계: 계산 결과를 캐시에 저장하고 리턴
// -------------------------------------
.L_store_and_return:
	ldr  x11, [sp, #96]  // x11 = n
	cmp  x11, #128
	b.hs .L_skip_store   // 범위 밖이면 캐시 저장 스킵
	cmp  x11, #0
	b.lt .L_skip_store
	
	adrp x9, _fib_memo_val@PAGE
	add  x9, x9, _fib_memo_val@PAGEOFF
	str  x0, [x9, x11, lsl #3]          // val[n] = 결과값 저장
	
	adrp x9, _fib_memo_valid@PAGE
	add  x9, x9, _fib_memo_valid@PAGEOFF
	mov  w10, #1
	strb w10, [x9, x11]                   // valid[n] = 1 로 마킹


.L_skip_store:	

FUNC_EXIT_FULL 128


# - 이 코드로 할 훈련 포인트
# 1. br s -n _fib 걸고 c로 여러 번 멈춰가면서 몇 번째 호출인지 확인
# 2. bt 쳐서 스택이 얼마나 깊게 쌓였는지 시각적으로 확인 (fib(5)→fib(4)→fib(3)→fib(2) 이런 식으로)
# 3. memory read -f x -c 8 $sp로 스택에 쌓인 n값, fib(n-1) 임시값들이 실제로 어디 저장돼 있는지 헥스로 확인
# 4. frame select 1, frame select 2로 콜스택 오르내리며 각 프레임의 n 값 비교
# 5. 마지막에 _main으로 돌아왔을 때 x0 = 5 (fib(5)=5) 확인
