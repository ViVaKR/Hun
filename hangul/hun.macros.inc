// ====================================================
//  제목: 훈 한글 섹션 및 함수 제어 매크로 모음 (hun.macros.inc)
// ====================================================

.ifndef HUN_SECTION_MACROS_INC
.set    HUN_SECTION_MACROS_INC, 1

// --- [한글 구역 정의 매크로 뭉치] ---

매크로시작   코드구역
    코드영역
    .align 2
매크로끝

매크로시작   데이터구역
    데이터영역
.align 3
매크로끝

매크로시작   글자구역
    .section __TEXT, __cstring, cstring_literals
.align 3
매크로끝

매크로시작   보호상수구역
    .section __DATA, __const
.align 3
매크로끝

매크로시작   상수구역
    .section __TEXT, __const
.align 3
매크로끝

매크로시작   실수사구역
    .section __TEXT, __literal4, 4byte_literals
.align 2
매크로끝

매크로시작   실수팔구역
    .section __TEXT, __literal8, 8byte_literals
.align 3
매크로끝

매크로시작   빈변수구역
    .section __DATA, __bss
.align 3
매크로끝

매크로시작   공용예약구역
    .section __DATA, __common
매크로끝


// --- [우아한 함수 프롤로그 / 에필로그 제어] ---

// [풀 스펙] 무장문장시작 (독서실 x19~x28 전원 백업)
매크로시작 무장문장시작 name, stack_size
    .if \stack_size < 96
        .error "무장문장시작: 모든 독서실을 쓰려면 stack_size는 최소 96 이상이어야 합니다!"
    .endif
    
    공개 \name
    \name:                  // _\name: 에서 언더바(_) 제거
    stp     x29, x30, [sp, #-\stack_size]!
    mov     x29, sp
    
    stp     x19, x20, [sp, #16]
    stp     x21, x22, [sp, #32]
    stp     x23, x24, [sp, #48]
    stp     x25, x26, [sp, #64]
    stp     x27, x28, [sp, #80]
매크로끝

// [풀 스펙] 무장문장끝
매크로시작 무장문장끝 stack_size
    ldp     x19, x20, [sp, #16]
    ldp     x21, x22, [sp, #32]
    ldp     x23, x24, [sp, #48]
    ldp     x25, x26, [sp, #64]
    ldp     x27, x28, [sp, #80]
    
    ldp     x29, x30, [sp], #\stack_size
    ret
매크로끝

// [표준형] 문장시작
매크로시작 문장시작 name, stack_size
    .if    \stack_size < 32
        .error "문장시작: stack_size는 최소 32 이상이어야 합니다 (x19/x20 저장 공간 필요)"
    .endif
    공개 \name
    .align 2
    \name:                  // _\name: 에서 언더바(_) 제거하여 렉서 번역기가 작동하도록 함
	stp x29, x30, [sp, #-\stack_size]!
	mov x29, sp
	stp x19, x20, [sp, #16]
매크로끝

// [표준형] 문장끝
매크로시작 문장끝 stack_size
	ldp x19, x20, [sp, #16]
	ldp x29, x30, [sp], #\stack_size
    ret
매크로끝

// [경량형] 가벼운문장끝
매크로시작 가벼운문장끝 stack_size
	ldp x29, x30, [sp], #\stack_size
    ret
매크로끝

.endif
