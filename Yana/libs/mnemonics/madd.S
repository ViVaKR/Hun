.include "section_macros.inc"

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION

// 사용 예 (1)
// 2차원 배열//행렬의 메모리 주소 계산 (가장 대표적인 사용처)
// 상황:
// x0 = 배열의 시작 주소 (Base Address + Col offset이 미리 합쳐진 상태)
// x1 = Row 인덱스
// x2 = Stride (한 행의 크기)
// x3 = x0 + (x1 * x2) -> Row * Stride 를 계산한 뒤 Base 주소에 바로 더함!
// 배열 접근 속도를 극대화 함 

// 사용 예 (2)
// 다항식 (Polynomial) 연산 및 그래픽스/AI계산 (Horner's Method)
// 게임 그래픽그(3D 벡터 연산), 신호 처리 (DSP),AI 신경망에서 
// 호너의 방법을 이용해 
// $a_0 + a_1 x + a_2 x^2 + \dots$ 
// 을 계산 할때

// 사용 예 3:
// 루프(Loop) 카운팅 및 64비트 누적합 (Accumulation)
// 배열의 모든 요소에 일정한 값을 곱한 뒤 전체 합을 구하는 연산 
// sum += a * b
// madd x0, x1, x2, x0
// x0 = x0 + (x1 * x2)
// 우아한 이유 : 곱셈 후 덧셈을 하기 위해 임시 레지스터를 새로 할당할 필요 없이
// x0 레지스터 하나로 자기 자신에게 누적 연산을 완성함. 

// 비밀 하나 : MUL x0, x1, x2 는 사실
// MADD x0, x1, x2, xzr
// 즉, ARM64 하드웨어 내부에서는 모든 곱셈이 MADD 기반으로 동작하고 있음.
FUNC_START_FULL mnemonic_madd, 128
  
	// 1. 초기화
	mov  x0, #0                       // x0(sum) = 0
	adrp x1, _madd_array@PAGE
	add  x1, x1, _madd_array@PAGEOFF
	mov  x2, #10                      // x2 (loop counter) = 10
	mov  x3, #4                       // x3 (factor) = 2

.L_loop:
	// 2. 배열에서 값 읽기 & 포인터 이동 (Post-index LDR)
	// x1 주소에서 8바이트 (64비트)를 읽어 x4 에저장한 뒤
	// x1 주소를 +8 자동 증가
	ldr x4, [x1], #8
  
	// 3. 우아함의 핵심, MADD 연산
	// x0 = x0 + (x4 * x3)
	// sum = sum + (array[i] * factor)
	madd x0, x4, x3, x0
  
	// 4. 루프 조건 확인 및 반복
	subs x2, x2, #1  // 루프 카운터 1감소 (x2--)
	b.ne .L_loop     // 카운터가 0이 아니면 loop 로 이동
	mov  x19, x0
.L_print_and_exit:
  
	adrp x0, _fmt_result_madd@PAGE
	add  x0, x0, _fmt_result_madd@PAGEOFF
  
	sub sp, sp, #16
	str x19, [sp, #0]
	bl  _printf
	add sp, sp, #16

FUNC_EXIT_FULL 128