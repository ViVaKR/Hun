//  Created by 김범준 on 2026. 7. 10
// =================================================================
//  제목: Apple Silicon (ARM64/macOS) 표준 사격훈련 교본소 (playground.s)
//  작성: 대제독의 민정기어 사령부
// =================================================================

.include "section_macros.inc"

// -------------------------------------------------------------
// [영역 1] 전역 심볼 선언 (Global Symbols)
// -------------------------------------------------------------
.global _playground

// -------------------------------------------------------------
// [문자열 리터럴] __TEXT,__cstring,cstring_literals
// printf 포맷 스트링 등 널 종료(null-terminated) 문자열 상수 전용 (읽기 전용)
// -------------------------------------------------------------
CSTRING_SECTION

format_str:           .asciz "%lld + %lld = %lld\n"
format_for_loop:      .asciz "%lld 회 합계 %lld\n"
float_format_str:     .asciz "%.2f + %.2f = %.3f\n"
loop_format:          .asciz "데이터 %lld 번째 값: %.3f\n"
loop_format_decimal:  .asciz "데이터 %lld 번째 값: %lld\n"
format_function_call: .asciz "[function call result] %d + %d = %d\n"
format_delegate:      .asciz "[Delegate Callback Result] 연산 결과: %d\n"
helloworld:           .asciz "Hello, World\n"
list_format:          .asciz "Index [%lld]: Value = %d\n"

// -------------------------------------------------------------
// [0으로 초기화된 변수] __DATA,__bss
// -------------------------------------------------------------
BSS_SECTION
// 예시 1 32비트(4바이트) 정수형 카운터 변수 공간 확보
// C언어 대응: int shoot_count = 0;
.align 2
shoot_count: .space 4 // 4바이트 크기 공간 확보 (실행 시 0으로 채워짐)

// 예시 2) 64비트(8바이트) 정밀 실수형 변수 공간 확보
// C언어 대응: double target_distance = 0.0;
.align 3
target_distance: .space 8 // 8바이트 크기 공간 확보

// 예시 3) 포인터 주소를 임시 저장할 64비트(8바이트) 공간 확보
// C언어 대응: void* current_callback = NULL;
.align 3
current_callback: .space 8 // ARM64 주소값은 무조건 8바이트!

// 예시 4) 사용자 입력이나 데이터를 임시로 담을 1024바이트 버퍼 대용량 공간
// C언어 대응: char input_buffer[1024] = {0,};
.align 3
                            // 대용량 버퍼는 8바이트 정렬해두면 CPU가 읽을 때 아주 쾌적함!
input_buffer: .space 1024 // 1024바이트(1KB) 통 크게 확보!
input_buffer_end:

// -------------------------------------------------------------
// [동적 링킹 시점 확정 상수] __DATA,__const
// -------------------------------------------------------------
CONST_DATA_SECTION

// -------------------------------------------------------------
// [초기화된 변수] __DATA,__data
// 실행 중 읽고 쓰기가 가능한 순수 전역/정적 변수 배열 공간
// -------------------------------------------------------------
DATA_SECTION

// 64비트 실수형(Double) 배열 공간 (8바이트 정렬)
.align  3
huge_data: .double 150.5, -23.45, 3.141592, 150.5, -23.45
huge_data_end:

// 32비트 정수형(int) 배열 공간 (4바이트 정렬)
.align 2
list_data: .int 1, 2, 3, 4, 5, 6, 7, 8, 9
list_data_end:

// -------------------------------------------------------------
// [코드 구역] __TEXT,__text
// -------------------------------------------------------------
CODE_SECTION

.align 2
_playground:
	stp x29, x30, [sp, #-96]!
	mov x29, sp

	stp x19, x20, [sp, #16]
	stp x21, x22, [sp, #32]
	stp x23, x24, [sp, #48]
	stp x25, x26, [sp, #64]
	stp x27, x28, [sp, #80]
    
	b _loop_float_start	


// Loop
_loop_float_start:
	adrp x19, huge_data@PAGE
	add  x19, x19, huge_data@PAGEOFF

	adrp x9, huge_data_end@PAGE
	add  x9, x9, huge_data_end@PAGEOFF
    // [준비물 2] 🚨 무식한 숫자 #3 대신 자동 계산된 상수(.equ)를 대입!
    // 이제 데이터 섹션에 .double을 100만 개 추가해도 이 코드는 손댈 필요가 없습니다!
    // mov x20,#3
    // mov x21, #1     // 몇 번째 출력인지 세어줄 카운터 (1부터 시작)
	sub x20, x9, x19       // 바이트 수 (런타임에 실제 주소 빼기 → 안전!)
	lsr x20, x20, #3       // ÷ 8 = 원소 개수
	mov x21, #1

	b _loop_float


// (2) Loop
_loop_float:
    // [필살기 작동] 현재 x19가 가리키는 주소에서 실수(8바이트)를 d0에 읽고,
    // x19 주소를 자동으로 +8 바이트 이동시킵니다! (다음 데이터를 바라봄)
	ldr d0, [x19], #8

    // printf 호출을 위한 스택 세팅 (애플 법령 준수)
    // 포맷 스트링 인자 배치: x0(포맷), 그 뒤로 가변 인자는 스택에!
	adrp x0, loop_format@PAGE
	add  x0, x0, loop_format@PAGEOFF

	sub sp, sp, #32
	str x21, [sp, #0]   // 첫 번째 %lld 자리에 들어갈 정수 (몇 번째인가?)
	str d0, [sp, #8]    // 두 번째 %.3f 자리에 들어갈 실수 값

	bl  _printf       //  출력
	add sp, sp, #32

    // 다음 바퀴를 위한 카운더 조절
	add x21, x21, #1    // 출력순서 + 1
	sub x20, x20, #1    // 남은횟수 - 1

    // [조건부 분기] 남은 횟수(x20)가 0이 아니면(Non-Zero) 다시 루프 처음으로 점프!
	cbnz x20, _loop_float
	b    _terminate

// 5. 부호가 있는 나눗셈
_calc_sdiv:
	mov   x9, #150
	mov   x10, #-23
	scvtf d0, x9        // x9(150) -> d0 (150.0)
	scvtf d1, x10       // x10 (-23) -> d1 (-23.0)
	fdiv  d2, d0, d1     // d2 = 150.0 / -23.0 (-6.5217...)
	b     _printf_float_demo

// 6. 덧셈
_calc_add:
    // 밖에서 계산을 열심히 수행함 (여기서 x9, x10, x11이 채워짐)
	mov x9, #120   // 첫번째 수
	mov x10, #34     // 두번째 수
	add x11, x9, x10   // x21 = 154 (합계)

	b _printf_demo

// -------------------------------------------------------------
// 1. Carry 관련 가산 (ADC, ADCS)
// -------------------------------------------------------------
_adc_demo:
    // C(Carry) 플래그를 세우기 위해 의도적으로 오버플로우 유도
	mov  x0, #0xFFFFFFFFFFFFFFFF
	adds x0, x0, #1            // 0xFF... + 1 = 0 이 되면서 Carry 발생 (C=1)

	mov x1, #5
	mov x2, #10
	adc x3, x1, x2             // x3 = x1 + x2 + Carry(1) = 16 이 됨!
	b   _extend_demo

// -------------------------------------------------------------
// 2. 비트 확장 연산 (ADD extended register, SXTB, SXTH, SXTW)
// -------------------------------------------------------------
_extend_demo:
	mov x0, #0xFF             // 8비트 부호 있는 값 -1에 해당 (0x000000FF)

    // SXTB (Signed Extend Byte): 8비트 부호 비트를 64비트 전체로 채움
	sxtb x1, w0                // x1은 0xFFFFFFFFFFFFFFFF (-1)이 됨

    // ADD와 결합해서 사용 (extended register)
	mov x2, #10
	add x3, x2, w0, sxtb       // x3 = 10 + (-1) = 9
	b   _bitfield_demo

// -------------------------------------------------------------
// 3. 비트필드 조작 (BFI, BFXIL, UBFIZ, UBFX)
// -------------------------------------------------------------
_bitfield_demo:
	mov x0, #0x1234

    // BFXIL (Bitfield Extract and Insert Low): x0의 비트 4부터 4개 비트를 x1의 하위로 추출
	bfxil x1, x0, #4, #4       // x1의 하위 4비트에 0x3이 들어감

    // BFI (Bitfield Insert): x1의 값을 x0의 특정 위치에 삽입
	mov x2, #0xF
	mov x3, #0x0000
	bfi x3, x2, #8, #4         // x3의 8번째 비트부터 4비트 공간에 0xF를 삽입 -> 0xF00이 됨
	b   _cond_compare_demo

// -------------------------------------------------------------
// 4. 조건부 비교 및 선택 (CCMP, CSEL, CSET)
// -------------------------------------------------------------
_cond_compare_demo:
	mov x0, #10
	mov x1, #20

	cmp x0, x1                 // x0 < x1 (결과: Less Than / LO)

    // CCMP (Conditional Compare): 이전 비교 결과가 참(LT)일 때만 x0와 10을 다시 비교
    // 참이 아니면 플래그를 지정한 값(nzcv)으로 강제 세팅
	ccmp x0, #10, #0, lt

    // CSEL (Conditional Select): EQ(같음) 조건이 참이면 x1을, 거짓이면 x0를 x2에 대입
	csel x2, x1, x0, eq        // x2 = x1 (20)이 됨

    // CSET (Conditional Set): LT 조건이 참이면 1, 거짓이면 0을 x3에 대입
	cset x3, lt                // x3 = 1

_ror_demo:
	mov x0, #0b11111111
	ror x0, x0, 4
	b   _terminate

_lsl_demo:

	mov x0, #0b00000001
	lsl x0, x0, #3

	b _terminate

_lsr_demo:
	mov x0, #0b00011000
	mov x1, x0
	lsr x1, x1, #2

	b _terminate

_mvn_demo:
	mov x0, #0b1101
	mvn x0, x0
	b   _terminate

_eor_demo:
	mov x0, #0b1111
	mov x1, #0b1010
	eor x2, x0, x1
	b   _terminate

_or_demo:
	mov x0, #0xFF
	mov x1, 43
	orr x2, x0, x1
	b   _terminate

_and_demo:
	mov x0, #0xFF
	mov x1, #0x34
	and x2, x0, x1
	b   _terminate


_printf_svc:

    // stdout
	mov x0, #1

    // ❌ 국경을 넘지 못해 에러가 난 흥부가 기가 막힐 코드
    // adr x1, helloworld      // address of 'hello world' string

    // ⚡ [해결] 애플의 보안 국경을 완벽하게 넘나드는 정석 두 줄 족보!
	adrp x1, helloworld@PAGE
	add  x1, x1, helloworld@PAGEOFF

	mov x2, #12             // length of 'hello world' string
	mov x16, #4             // 4 - write(int fd, user_addr_t cbuf, user_size_t nbyte); }

	svc 0
	b   _terminate

_printf_float_demo:
    // 1. 포맷 스트링의 주소는 여전히 첫 번째 정수 레지스터인 x0에 넣는다네.
	adrp x0, float_format_str@PAGE
	add  x0, x0, float_format_str@PAGEOFF

    // 2. printf의 실수형 인자 (%f)들은 d0, d1, d2 레지스터에 순서대로 매핑되어야 하네!
    // 다행히 위에서 연산 결과를 이미 d0, d1, d2에 순서대로 담아놓았기 때문에
    // 여기서는 따로 레지스터를 옮길 필요 없이 바로 호출하면 된다네!
    // (만약 순서가 꼬였다면 fmov d0, d_target 등으로 맞춰줘야 함)

    // 가변 인자 함수 규칙에 다라.. d레지스터의 값을 x 레지스터로 이동
	fmov x1, d0                 // d0(150.0)의 비트 값을 x1에 복사
	fmov x2, d1                 // d1(-23.0)의 비트 값을 x2에 복사
	fmov x3, d2                 // d2(-6.5217...)의 비트 값을 x3에 복사
	sub  sp, sp, #32
	str  x1, [sp, #0]
	str  x2, [sp, #8]
	str  x3, [sp, #16]

	bl  _printf
	add sp, sp, #32
	mov x0, #0
	b   _terminate

_printf_demo:

    // 2. printf C style 함수 호출 준비
    // AAPCS 규약에 따라:
    // x0: 첫번째 인자 (포맷 스트링의 주소)
    // x1: 두번째 인자 (포맷 스트링의 %d 자리에 들어갈 값)
	adrp x0, format_str@PAGE    // 포맷 스트링이 위치한 페이지 주소로드
	add  x0, x0, format_str@PAGEOFF  // 페이지 내의 오프셋 더해서 최종 주소 완성

	mov x1, x9                 // 첫 번째 %d에 들어갈 값 (120) -> x1
	mov x2, x10                // 두 번째 %d에 들어갈 값 (34) -> x2
	mov x3, x11                // 세 번째 %d에 들어갈 값 (154) -> x3

	sub sp, sp, #32
	str x1, [sp, #0]
	str x2, [sp, #8]
	str x3, [sp, #16]

    // 3. C  라이브러리의 printf 함수 호출
	bl _printf

	add sp, sp, #32
	mov x0, #0

	b _terminate

// -------------------------------------------------------------
// 6. 종료 (에필로그 및 리턴)
// -------------------------------------------------------------
_terminate:

    // -------------------------------------------------------------
    // [에필로그] 퇴근 준비! 역순으로 완벽하게 원상 복구
    // 1단계: 독서실 멤버들 그대로 복원
    // -------------------------------------------------------------
	ldp x19, x20, [sp, #16]
	ldp x21, x22, [sp, #32]
	ldp x23, x24, [sp, #48]
	ldp x25, x26, [sp, #64]
	ldp x27, x28, [sp, #80]

    // Main 함수의 반환값 (Exit Code 0)
	mov x0, #0
    // 🍏 [수정완료] 프롤로그의 #-96과 정확히 대칭되도록 #96으로 탈출!
    // FP, LR을 복원함과 동시에 스택을 깔끔하게 96바이트 위로 들어 올려 원상 복구합니다.
	ldp x29, x30, [sp], #96
    ret

