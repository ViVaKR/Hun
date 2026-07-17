//  [훈] 프로젝트
//  Created by 김범준 on 2026.7.7

.include "section_macros.inc"
.global _main

DATA_SECTION
BSS_SECTION
LITERAL4_SECTION
LITERAL8_SECTION
CSTRING_SECTION
format_str: .asciz "Hello, ARM64 Assembly! ==> %d\n"
menu_title: .asciz "\n=== Yana 메뉴 ===\n"
menu_format: .asciz "%d: %s\n"              // 번호와 메뉴 이름을 동적으로 출력할 포맷
input_prompt: .asciz "원하는 메뉴를 선택하세요: "
scanf_format: .asciz "%d"
err_format: .asciz "잘못된 선택입니다. (선택범위: 0 ~ %d)\n"
str_forloop: .asciz "for loop 합계구하기"
str_getitems: .asciz "정수배열 요소 가져오기"
str_exit: .asciz "프로그램 종료"
CONST_SECTION
CONST_DATA_SECTION
menu_table:
    //      함수주소                문자열주소
    .quad _menu_forloop,        str_forloop     // [0]
    .quad _menu_getitems,       str_getitems    // [1]
    .quad _menu_exit,           str_exit        // [2]
menu_table_end:

command_table:
    .quad _menu_forloop     // Yana 0, x10 + 0  (x19가 0일 때)
command_table_end:

CODE_SECTION
_main:

    // [프롤로그] 값 보존을 위해 Callee-saved 레지스터 사용 
    stp x29, x30, [sp, #-48]!
    stp x19, x20, [sp, #16]
    stp x21, x22, [sp, #32]
    mov x29, sp

    // 1. 메뉴 테이블 크기 및 개수 동적 계산
    adrp x10, menu_table@PAGE
    add x10, x10, menu_table@PAGEOFF

    // "끝 주소 - 시작 주소 = 전체 바이트 수", 그리고 "전체 바이트 수 ÷ 항목 하나의 크기 = 항목 개수"


    // b _terminate

    // 아규먼트 
    //b _argv


_argv:
    cmp x0, #2
    mov x19, #108
    b.lt _default

    ldr x0, [x1, #8]        // x0 = argv[1]
    bl _atoi                // atoi(argv[1]); 결과는 x0에 저장됨
    mov x19, x0             // 결과를 안전하게 x19(Calle-saved)에 보관

    // [배열 시작주소 계산]
    adrp x10, command_table@PAGE
    add x10, x10, command_table@PAGEOFF // x10 = command_table 시작 주소

    // [배열 끝 주소 계산]
    adrp x11, command_table_end@PAGE
    add x11, x11, command_table_end@PAGEOFF  // x11 = command_tabel 끝 주소

    // [배열의 크기]
    sub x12, x11, x10

    // [배열의 갯수 계산]
    // 포인터 주소의 크기 : 8바이트
    // 배열의 갯수 = 배열의 크기 / 포인터 주소의 크기 2^3 (8바이트)
    lsr x12, x12, #3

    // 3. 64비트끼리 안전하게 범위 검사 (Boundary Check)
    // 범위검사 (Boundary Check) : 
    // 사용자가 입력한 아규먼트 값 과 배열의 총 갯수를 비교 
    cmp x19, x12             

    // x19 가 배열의 크기보다 크거나 같으면
    // hs: Higher or Same, 부호없는 비교
    //  _default 레이블로 점프
    b.hs _default

    // 진짜 함수 로드하기
    // x10 (테이블 시작 주소)에서 x19(인덱스) 만큼 8바이트씩(lsl #3) 떨어진 곳의 주소값을 읽기
    // (예) : x19 (입력값) 을 2로 하였을 때
    //       x10 의 주소가 0x1000 일때
    //       0x1000 + (2 * 2^3) => 0x1000 + 16 => 즉.. array[2] 의 요소를 호출하는 결과가 
    ldr x11, [x10, x19, lsl #3]

    // 목표 함수 실행!
    blr x11

    b _terminate

_default:
    // 3. 포맷 스트링 및 인자 준비 후 printf 호출
    adrp x0, format_str@PAGE  // 포맷 문자열 주소 로드
    add x0, x0, format_str@PAGEOFF
    
    sub sp, sp, #32
    str x19, [sp, #0]
    bl _printf
    add sp, sp, #32

    b _terminate


// -------------------------------------------------------------
// 종료 (에필로그 및 리턴)
// -------------------------------------------------------------
_terminate:
    mov x0, #0                      // 리턴값 0
    ldp x19, x20, [sp, #16]         // 보존 레지스터 복원
    ldp x29, x30, [sp], #32         // 프레임 포인터, 링크 레지스터 복원 및 스택 정리
    ret
