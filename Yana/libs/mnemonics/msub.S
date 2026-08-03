
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
fmt_message: .asciz "나머지 연산을 시행할 두수를 입력하세요: "
fmt_scanf:   .asciz "%lld %lld"

fmt_confirm: .asciz "첫번째 입력값: %lld, 두번째 입력값: %lld\n"

fmt_result: .asciz "%lld %% %lld = %lld\n"

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION
FUNC_START_FULL mnemonic_msub, 128
  
	// 1. [지역 변수 공간 확보]
	// sp를 16바이트 만큼 내려서 지역 변수 2개 (각 8바이트) 자리를 만듭니다.
	// [sp, #0] -> local_a (C 의 long long a)
	// [sp, #8] -> local_b (C 의 long long b)
	sub sp, sp, #16
  
	// 2. [안내 메시지 출력]
	adrp x0, fmt_message@PAGE
	add  x0, x0, fmt_message@PAGEOFF
	bl   _printf
  
	// 3. [scanf 호출] - Apple Silicon ABI 규칙 준수!
	// 포맷은 x0, 가변인자(지역 변수 주소들)는 스택으로 전달
	adrp x0, fmt_scanf@PAGE
	add  x0, x0, fmt_scanf@PAGEOFF
   
	add x1, sp, #0  // local_a 의 주소 sp + 0
	add x2, sp, #8  // local_b 의 주소 sp + 8
   
	sub sp, sp, #16       // scanf 가변인자 패싱용 임시 스택 공간
	stp x1, x2, [sp, #0]
	bl  _scanf
	add sp, sp, #16       // 임시 공간 복구
  
	// 4. [지역 변수에서 값 읽어오기]
	ldr x21, [sp, #0]  // local_a 값을 x21로 읽음
	ldr x22, [sp, #8]  // local_b 값을 x22로 읽음
  
	// 5. [printf 로 확인 출력]
	adrp x0, fmt_confirm@PAGE
	add  x0, x0, fmt_confirm@PAGEOFF
	mov  x1, x21                      // 스택 str 대신 레지스터 이동!
	mov  x2, x22
	sub  sp, sp, #16
	str  x21, [sp, #0]
	str  x22, [sp, #8]
	bl   _printf
	add  sp, sp, #16
	
	udiv x0, x21, x22      // 몫 계산
	msub x1, x0, x22, x21  // x21 -(x0 - x22), 나머지 계산
	
	mov  x25, x1
	adrp x0, fmt_result@PAGE
	add  x0, x0, fmt_result@PAGEOFF
	
	sub sp, sp, #32
	str x21, [sp, #0]
	str x22, [sp, #8]
	str x25, [sp, #16]
	bl  _printf
	add sp, sp, #32
  
	// 6. [지역 변수 메모리 해제]
	// 할당했던 16바이트 지역 변수 공간을 원상 복구 합니다.
	add sp, sp, #16

FUNC_EXIT_FULL 128