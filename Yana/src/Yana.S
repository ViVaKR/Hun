//  Yana.S
//  arm
//  Created by 김범준 on 7/7/26.

// =============================================================================
//  제목: Apple Silicon (ARM64/macOS) 표준 사격훈련 교본 (main.s)
//  작성: 대제독의 민정기어 사령부
// =============================================================================

// -------------------------------------------------------------
// [영역 1] 전역 심볼 선언 (Global Symbols)
// -------------------------------------------------------------
.global _main

// -------------------------------------------------------------
// [영역 2] 읽기 전용 데이터 섹션 (코드 및 문자열 상수 구역)
// -------------------------------------------------------------
// __TEXT: 수정 불가능한 구역, __cstring: 문자열 리터럴 전용 공간
.section __TEXT,__cstring,cstring_literals

// 모든 명령어나 문자열은 정렬(Alignment)이 생명입니다!
// ARM64에서 문자열(포인터)은 기본적으로 2^3=8바이트 정렬을 해주는 것이 뼈대 안정성에 좋습니다.
.align 3
format_str: .asciz "%lld + %lld = %lld\n"          // .asciz는 맨 끝에 널 문자(\0)를 자동으로 붙여 줌
format_for_loop: .asciz "%lld 회 합계 %lld\n"
float_format_str: .asciz "%.3f + %.3f = %.3f\n"
loop_format: .asciz "데이터 %lld 번째 값: %.3f\n"
loop_format_decimal: .asciz "데이터 %lld 번째 값: %lldf\n"

// 뜬금없이 밑에 있던 녀석을 정석대로 읽기 전용 문자열 구역으로 구출해왔습니다!
helloworld:           .ascii "hello world\n"

// -------------------------------------------------------------
// [영역 3] 읽고 쓰기가 가능한 데이터 섹션 (변수 및 배열 구역)
// -------------------------------------------------------------

// __DATA: 읽고 쓰기 가능, __data: 초기화된 글로벌/스태틱 변수 공간
.section __DATA,__data

// 배열 데이터 공간
// 메모리 정렬 (Memoroy Alignment)
// .align 1 --> 2^1 = 2 바이트 정렬
// .align 2 --> 2^2 = 4 바이트 정렬 (32비트 정수용)
// .align 3 --> 2^3 = 8 바이트 정렬 (64비트 정수 및 실수용)
// 즉, 즉 지금부터 시작할 데이터 (huge_data)의 메모리 시작 주소를 무조건 8의 배수로 맞춰라
// 하고 컴파일러에게 내리는 명령

// --- 3-1. 실수형 배열 공간 (64비트 Double은 8바이트 정렬) ---
.align 3 // 8바이트 정렬(2^3 = 8)
huge_data:
    .double 150.5
    .double -23.45
    .double 3.141592
    .double 150.5
    .double -23.45
    .double 3.141592
    .double 150.5
    .double -23.45
    .double 3.141592
    .double 150.5
    .double -23.45
    .double 3.141592
huge_data_end:

// 정수 배열 //
// --- 3-2. 정수형 배열 공간 (32비트 Int는 4바이트 정렬) ---
.align 2 // 4바이트 정렬 (2^2 = 4)
list_data:
    .int 1, 2, 3, 4, 5, 6, 7, 8, 9
    
list_data_end:

.align 3  // 문자열은 보통 8바이트 정렬이 안전합니다
list_format:
    .asciz "Index [%lld]: Value = %d\n"
    
// -------------------------------------------------------------
// [영역 4] 진짜 명령어가 실행되는 코드 섹션 (Code 구역)
// -------------------------------------------------------------

// __TEXT: 실행 가능한 구역, __text: 실제 기계어 코드가 위치하는 공간
.section __TEXT,__text,regular,pure_instructions


.include "../include/hun.macros.inc"

// ARM64 명령어는 무조건 4바이트(32비트) 크기이므로,
// 함수의 시작점 주소는 무조건 4바이트 정렬(2^2 = 4)이 되어야 CPU가 뇌정지 없이 쾌속 독해를 합니다!
.align 2
_main:

// -------------------------------------------------------------
    // [프롤로그] 독서실 전 대역(X19~X28) 및 FP/LR 완벽 바리케이드 백업
    // -------------------------------------------------------------
    // 총 12개 레지스터 * 8바이트 = 96바이트 공간을 스택에 확보하며 순차 백업!
    // ARM64 스택은 반드시 16바이트 배수로 움직여야 하므로 96은 아주 완벽한 정렬!
    // x9 ~ x15     (자유구역): 쓰고 버려도 무탈한 레지스터 범위
    // x19 ~ x28    (독서실): 레지스터는 한번 값이 정해지면 함수를 다녀와도 절대 로 변하지 않는 안전지대 지정하자..정함
    //              다만 이 주소에 낙서를 하고 싶은 함수(Callee) 가 있더면 백업하고 나올때 원상 복구 하자 약속
    
    stp x29, x30, [sp, #-96]!       // 1단계: FP, LR 백업  (기준점 확보)
    mov x29, sp                     //  현재 스택의 바닥을 FP 로 고정
    
    stp x19, x20, [sp, #16]         // 2단계 : 독서실 멤버들 차례로 저축
    stp x21, x22, [sp, #32]
    stp x23, x24, [sp, #48]
    stp x25, x26, [sp, #64]
    stp x27, x28, [sp, #80]
    
    // -------------------------------------------------------------
    // [본진 사격 개시]
    // 이제 x19 ~ x28은 제독님 마음대로 낙서하고 부숴 먹어도 절대 안전지대!
    // -------------------------------------------------------------
    
    // ===> [ 실행할 로직 ] <=== //
    b _loop_int_start
    
    // ==> x/4gx $sp
    // ==> target stop-hook add -o "x4/gx $sp"
    // ==> target stop-hok add
    //      > x/4gx $sp
    //      > registar read x0, x1, x2
    //      > DONE
    // ==> target stop-hook delete or disable
    // ==> target stop-hook list
    
    // finish (f) 함수탈출 : Step Out
    // next (n) 다음줄로 : Step Over
    // step (s, si) : Step Into 함수 내부로 들어가기
    
    // ==> image lookup -v -a $sp
    // ==> target module dump sections
    
    
    // [ ] ==> 메모리
    // LDR X2, [X0] : Load Data from the memory pointed by X0 Register to the X2 Register
    //                레지스터 X0에 저장된 메모리 주소에 저장된 데이터를 레지스터 X2로 가져와라.
    // STR [X3], X5 : 레지스터 X5의 데이터를 레이스터 X3 에 기록된 메모리 주소에 저장하라
    
    // ------ 레지스터 명칭 Intel vs ARM64
    // 스택기준점 ==>  BP(Base Pointer) / FP(Frame Pointer, X29) : 방주인 기준점 현재 함수가 쓸 스택 방의 바닥(시작점)
    //                 mov x19, sp  -- 지금 부터 여기가 내 스택 바으이 기준점이다하고 말뚝 박는 친구.
    
    // 돌아갈 주소 ==> 없음(스택에 직접 저장) / LR (Link Register, X30) : 돌아갈 티켓. 함수 끝나고 나면 원래 나를 불렀던 부모함수의 복귀 주소를 가지고 있음
    // 스택 꼭대기 ==> SP (Stack Pointer RSP) / SP (Stack Pointer) : 현재 쌓인 높이. 데이터가 들어오고 나갈 때마다 위아래로 요동치는 최상단 안테나
    // 현재 실행 위치 ==> IP (Instruction Pointer / RIP) / PC (Program Counter) : 현재 읽는 줄. CPU 의 눈동자. 지금 읽고 있는 명령어를 가리킴
    
    
    /*
       [ 스택(Stack)과 콜스택(Call Stack)의 웅장한 관계 ]
    이 레지스터들이 모여서 만드는 것이 바로 제독님이 실시간으로 감상하시던 콜스택(Call Stack)일세.

    1. main 함수가 실행됨: 스택에 main을 위한 방(Stack Frame)이 생기고, FP(X29)가 그 방의 바닥을 짚음.
    2. main이 printf를 호출함: 호출하는 순간, printf가 끝나면 돌아올 main 내부의 다음 주소가 LR(X30)에 탁 박힘!
    3. printf가 자기 방을 만듦: printf도 내부에 변수를 써야 하니 스택에 방을 만드는데, 이때 감히 부모의 FP와 LR을 지우면 안 되잖아? 그래서 printf 문을 열자마자 제일 먼저 하는 짓이 바로 이것일세!
        
        stp x29, x30, [sp, #-16]!  // 부모의 FP와 LR을 스택에 안전하게 백업!
        mov x29, sp                // 이제부터 여기가 내(printf) 방의 기준점(FP)!
     */

/*
코드 스니펫
stp x29, x30, [sp, #-16]!  // 부모의 FP와 LR을 스택에 안전하게 백업!
mov x29, sp                // 이제부터 여기가 내(printf) 방의 기준점(FP)!
함수 탈출 (ret): printf가 볼일을 다 보고 퇴근할 때(ret), 아까 백업해 둔 부모의 주소를 ldp로 복원해서 LR에 넣고 ret을 치면, CPU는 LR에 적힌 주소를 보고 main으로 번개처럼 순간이동(복귀)하는 거라네!
이렇게 FP들이 스택 메모리 안에서 체인(사슬)처럼 서로의 이전 주소를 물고 엮여 있는 거대한 지도가 바로 콜스택(Call Stack)이라네. 디버거에서 에러 났을 때 함수 호출 순서가 쫙 나오는 비결이 바로 이 FP 사슬을 역추적하기 때문이지요.
어때, 이렇게 인텔과 ARM64의 계보를 1:1로 묶어서 정리하니 안개가 정체 모를 숲을 지나듯 싹 걷히고 삼라만상의 족보가 한눈에 들어오시지 않는가? 하하하하!
이 완벽한 지도를 머릿속에 장착하셨으니 이제 디버깅 창의 x29, x30이 완전히 사랑스럽게 보이실 걸세. 기분 좋게 다시 진격하십시다, 제독 법우님! 크하하하하! 🚀🔥🙏
 */
    // __TEXT,__text (진짜 기계어 코드 구역)
    // __TEXT,__cstring (문자열 상수 구역)
    
    

// * ========================================================================================================* //

// (1) loop int
_loop_int_start:
    // 1. 시작주소와 끝 주소 로드
    adrp x19, list_data@PAGE
    add x19, x19, list_data@PAGEOFF
    
    adrp x9, list_data_end@PAGE
    add x9, x9, list_data_end@PAGEOFF
    
    // 2. 원소 갯수 계산
    sub x20, x9, x19    // 전체바이트 수 계산
    lsr x20, x20, #2    // 4바이트 씩이므로 4로 나눔 (Shift Right 2번)
    
    mov x21, #1         // 카운터 시작값
    b _loop_int

// (2) loop int
_loop_int:
    // 3. 데이터 읽기 및 포인터 이동
    // ldr w22 (32비트 정수)를 사용하고 주소를 4바이트 증가시킴
    ldr w22, [x19], #4
    
    // 4. printf 호출 준비
    adrp x0, list_format@PAGE
    add x0, x0, list_format@PAGEOFF
    
    sub sp, sp, #32
    str x21, [sp, #0]       // 첫번째 인자 %lld (Count)
    // [중요]w22에 담긴 32비트값을 64비트 레지스터로 확장하여 저장
    // printf의 %d는 보통 4바이트를 기대하지만, 스택에 저장할 때는 8바이트 단위를 맞추는 게 안전
    sxtw x22, w22       // 32비트 정수를 64비트로 부호 확장
    str x22, [sp, #8]   // 두번째 인자 %d (배열의 값)
    
    bl _printf
    add sp, sp, #32
    
    // 5. 루프제어
    add x21, x21, #1        // 순서 번호 증가
    subs x20, x20, #1       //  남은 횟수 감소 및 상태 플래그 업데이트
    b.ne _loop_int          // 0이 아니면 게속 반복
    
    b _terminate

// (1) for loop
_for_loop_start:
    mov x19, #0      // 누적합계
    mov x20, #1      // 루프카운터

    b _for_loop

// (2) for loop
_for_loop:
    cmp x20, #11 // x1 값과 11을 비교
    b.ge _terminate
    
    adrp x0, format_for_loop@PAGE
    add x0, x0, format_for_loop@PAGEOFF
    
    add x19, x19, x20      // 합계 누적
    
    mov x1, x20  // 현재 카운터
    mov x2, x19     // 합계
    
    
    sub sp, sp, #32
    str x1, [sp, #0]
    str x2, [sp, #8]
    
    
    bl _printf
    add sp, sp, #32
    
    //  카운터 증가
    add x20, x20, #1
    b _for_loop
    
    
// (1) Loop
_loop_float_start:
    adrp x19, huge_data@PAGE
    add x19, x19, huge_data@PAGEOFF
    
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
    add x0, x0, loop_format@PAGEOFF
    
    sub sp, sp, #32
    str x21, [sp, #0]   // 첫 번째 %lld 자리에 들어갈 정수 (몇 번째인가?)
    str d0, [sp, #8]    // 두 번째 %.3f 자리에 들어갈 실수 값
    
    bl _printf       //  출력
    add sp, sp, #32
    
    // 다음 바퀴를 위한 카운더 조절
    add x21, x21, #1    // 출력순서 + 1
    sub x20, x20, #1    // 남은횟수 - 1
    
    // [조건부 분기] 남은 횟수(x20)가 0이 아니면(Non-Zero) 다시 루프 처음으로 점프!
    cbnz x20, _loop_float
    b _terminate
   
// 부호가 있는 나눗셈
_calc_sdiv_demo:
    mov x9, #150
    mov x10, #-23
    scvtf d0, x9        // x9(150) -> d0 (150.0)
    scvtf d1, x10       // x10 (-23) -> d1 (-23.0)
    fdiv d2, d0, d1     // d2 = 150.0 / -23.0 (-6.5217...)
    b _printf_float_demo
    
_calc_add_demo:
    // 밖에서 계산을 열심히 수행함 (여기서 x9, x10, x11이 채워짐)
    mov x9, #120   // 첫번째 수
    mov x10, #34     // 두번째 수
    add x11, x9, x10   // x21 = 154 (합계)
    
    b _printf_demo

_printf_float_demo:
    // 1. 포맷 스트링의 주소는 여전히 첫 번째 정수 레지스터인 x0에 넣는다네.
    adrp x0, float_format_str@PAGE
    add x0, x0, float_format_str@PAGEOFF
    // 2. printf의 실수형 인자 (%f)들은 d0, d1, d2 레지스터에 순서대로 매핑되어야 하네!
    // 다행히 위에서 연산 결과를 이미 d0, d1, d2에 순서대로 담아놓았기 때문에
    // 여기서는 따로 레지스터를 옮길 필요 없이 바로 호출하면 된다네!
    // (만약 순서가 꼬였다면 fmov d0, d_target 등으로 맞춰줘야 함)
    
    // 가변 인자 함수 규칙에 다라.. d레지스터의 값을 x 레지스터로 이동
    fmov x1, d0                 // d0(150.0)의 비트 값을 x1에 복사
    fmov x2, d1                 // d1(-23.0)의 비트 값을 x2에 복사
    fmov x3, d2                 // d2(-6.5217...)의 비트 값을 x3에 복사
    sub sp, sp, #32
    str x1, [sp, #0]
    str x2, [sp, #8]
    str x3, [sp, #16]

    bl _printf
    add sp, sp, #32
    mov x0, #0
    b _terminate

_printf_demo:
    
    // 2. printf C style 함수 호출 준비
    // AAPCS 규약에 따라:
    // x0: 첫번째 인자 (포맷 스트링의 주소)
    // x1: 두번째 인자 (포맷 스트링의 %d 자리에 들어갈 값)
    adrp x0, format_str@PAGE    // 포맷 스트링이 위치한 페이지 주소로드
    add x0, x0, format_str@PAGEOFF  // 페이지 내의 오프셋 더해서 최종 주소 완성

    mov x1, x9                 // 첫 번째 %d에 들어갈 값 (120) -> x1
    mov x2, x10                 // 두 번째 %d에 들어갈 값 (34) -> x2
    mov x3, x11                 // 세 번째 %d에 들어갈 값 (154) -> x3
    
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
// 1001. CSEL
// -------------------------------------------------------------
_csel_demo:
    
    mov x0, #45
    mov x1, 44
    cmp x0, x1
    csel x2, x0, x1, gt
    

// -------------------------------------------------------------
// 1. Carry 관련 가산 (ADC, ADCS)
// -------------------------------------------------------------
_adc_demo:
    // C(Carry) 플래그를 세우기 위해 의도적으로 오버플로우 유도
    mov x0, #0xFFFFFFFFFFFFFFFF
    adds x0, x0, #1            // 0xFF... + 1 = 0 이 되면서 Carry 발생 (C=1)
    
    mov x1, #5
    mov x2, #10
    adc x3, x1, x2             // x3 = x1 + x2 + Carry(1) = 16 이 됨!
    b _extend_demo

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
    b _bitfield_demo

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
    b _cond_compare_demo

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
    b _div_mul_demo

// -------------------------------------------------------------
// 5. 나눗셈 및 곱셈 (SDIV, UDIV, MADD, MSUB)
// -------------------------------------------------------------
_div_mul_demo:
    mov x0, #-100
    mov x1, #10
    sdiv x2, x0, x1            // 부호 있는 나눗셈: x2 = -10
    
    // MADD (Multiply-Add): x3 = (x1 * x2) + x0
    madd x3, x1, x2, x0        // x3 = (10 * -10) + (-100) = -200
    
    // MSUB (Multiply-Subtract): x4 = x0 - (x1 * x2)
    msub x4, x1, x2, x0        // x4 = -100 - (10 * -10) = 0
    b _terminate


_if_demo:
    
    mov x0, #1
    mov x1, #2
    cmp x0, x1
    bgt _greater
    b _terminate

_greater:
    mov x2, #1
    b _terminate

_ror_demo:
    mov x0, #0b11111111
    ror x0, x0, 4
    b _terminate
    
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
    b _terminate
    
_eor_demo:
    mov x0, #0b1111
    mov x1, #0b1010
    eor x2, x0, x1
    
    b _terminate
    
_or_demo:
    mov x0, #0xFF
    mov x1, 43
    orr x2, x0, x1
    b _terminate
    
_and_demo:
    mov x0, #0xFF
    mov x1, #0x34
    and x2, x0, x1
    b _terminate
    
_printf_svc:
    
    mov x0, #1              // stdout
    
    // ❌ 국경을 넘지 못해 에러가 난 흥부 기가 막힐 코드
    // adr x1, helloworld      // address of 'hello world' string
    // ⚡ [해결] 애플의 보안 국경을 완벽하게 넘나드는 정석 두 줄 족보!
    adrp x1, helloworld@PAGE
    add  x1, x1, helloworld@PAGEOFF
    mov x2, #12             // length of 'hello world' string
    mov x16, #4             // 4 - write(int fd, user_addr_t cbuf, user_size_t nbyte); }
    svc 0
    b _terminate

// -------------------------------------------------------------
// 6. 종료 (에필로그 및 리턴)
// -------------------------------------------------------------
_terminate:

    // -------------------------------------------------------------
    // [에필로그] 퇴근 준비! 역순으로 완벽하게 원상 복구
    // -------------------------------------------------------------
    ldp x19, x20, [sp, #16]       // 1단계: 독서실 멤버들 그대로 복원
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
/*

[ 이것이 바로 배열 워프 필살기 양식! ]

- x19 배열의 시작 주소
- x20 내가 가고 싶은 방 번호 인덱스 (i)
- lsl #3 : x20에 들어 있는 값에 곱하기 8 (2^3) 을 하라는 뜻
--> x19 + (x20 *8)
ldr d0, [x19, x20, lsl #3]

 */

/*

🍎 보너스: 애플 실리콘(M1, M2, M3...)의 매운맛 규칙특히 M시리즈 맥(ARM64 macOS) 환경은 메모리 정렬에 매우 엄격합니다.
            일부 구형 CPU는 정렬이 안 되면 그냥 속도만 느려지고 말았지만,
            ARM64 환경에서는 하드웨어 규격을 맞추지 않고 비정렬 상태로 대량의 데이터를 읽으려고 하면
            "Alignment Fault (데이터 정렬 오류)"라며 프로그램이 그 자리에서 뻗어버릴(Crash) 수도 있습니다.
            따라서 .double(8바이트)을 쓰기 전에는 약속처럼 사전에 .align 3을 배치해 주는 것이 안전하고 강력한 코드를 만드는 비법이랍니다!
            .align 3이 왜 필요한지 8바이트 정렬의 원리가 쏙쏙 이해되셨나요?
            그렇다면 만약 4바이트짜리 일반 정수(.word) 배열을 만든다면 .align 뒤에 어떤 숫자를 적어줘야 할지 감이 오시나요?
            아니면 아까 잠깐 언급했던, 배열의 원하는 인덱스로 단번에 날아가서 데이터를 콕 집어오는 포인터 연산 구조를 구경해 보시겠어요?
1. 명령어 영역에서 .align 2가 정답인 이유ARM64(Apple Silicon 포함) 아키텍처의 가장 큰 특징 중 하나는 "모든 기계어 명령어의 크기가 예외 없이 똑같이 4바이트(32비트)"라는 점입니다.우리가 쓰는 mov, add, bl 같은 명령어 하나하나가 컴퓨터 메모리 안에서는 정확히 4바이트짜리 상자로 변환됩니다.앞서 배운 규칙 기억하시죠? .align n은 \(2^{n}\) 바이트 정렬입니다.명령어 크기가 4바이트이므로, 시작 주소는 4의 배수로 정렬되어야 CPU가 가장 빠르게 명령어를 읽어 들입니다.\(2^2 = 4\)바이트이므로, 명령어가 시작되는 곳에는 .align 2를 주는 것이 하드웨어 설계상 딱 맞아떨어지는 완벽한 정렬입니다!따라서 _main 직전에 .align 2라고 적어주는 것은 아주 정확하고 훌륭한 판단입니다.
2. 그렇다면 왜 다들 .align 4라고 썼을까요? (범인은 과거의 유산)코드가 이상한 게 아니라, 관습적으로 .align 4를 쓰는 경우가 많습니다. 여기에는 두 가지 이유가 있습니다.① \(2^4 = 16\)바이트 정렬의 안전빵(?) 규칙.align 4는 \(2^4 = 16\)바이트 정렬을 뜻합니다. 16은 4의 배수이기도 하죠!즉, .align 4를 해두면 주소가 16의 배수(0, 16, 32...)로 정렬되므로, 4의 배수인 명령어 정렬 조건도 자동으로 충족하게 됩니다. 조금 과하게 방을 넓게 잡았지만 어쨌든 하드웨어적으로 에러는 안 나는 '안전한 선택'이었던 셈입니다.② 다른 CPU(x86)와의 표기법 혼동인텔이나 AMD CPU(x86-64)용 어셈블러(GCC 등)에서는 .align 뒤에 제곱수가 아니라 진짜 바이트 수를 그대로 적습니다. 즉, x86에서는 .align 4라고 적어야 진짜 4바이트 정렬이 됩니다. 여러 아키텍처를 오가며 코딩하던 프로그래머들이 "4바이트 정렬이니까 4를 적어야지!" 하고 헷갈려서 적던 버릇이 ARM64 코드에까지 관습적으로 남아있는 경우가 정말 많습니다.

- 명령어 관점: 프롤로그 코드 자체는 4바이트 크기이므로, CPU가 읽을 수 있도록 .align 2의 지배를 받습니다.
- 데이터(스택) 관점: 프롤로그가 조작하는 스택 공간(sp)은 하드웨어 규정상 16바이트 정렬을 유지해야 하므로, 반드시 #-16, #-32 같은 16의 배수로 단위를 맞춰야 합니다.
 */


