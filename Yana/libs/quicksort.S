//  Created by 김범준 on 7/7/26.
//  퀵정렬 - 재귀 + 분할정복

.global _quicksort
.extern _printf
.align 2

// ============================================================
//  void quicksort(int *arr, const int left, const int right, char pos)
//  x0 = arr, w1 = left, w2 = right, w3 = pos (실제 사용 안 함, 시그니처만 맞춤)
// ============================================================
_quicksort:

    // 재귀 함수라 caller-saved 레지스터(x0~x18)는 bl 호출 후 보장 안 됨
    // → 로컬 변수 전부 callee-saved(x19~x24)에 담아서 재귀 호출을 버텨냄

    stp x29, x30, [sp, #-64]!
    mov x29, sp
    stp x19, x20, [sp, #16]
    stp x21, x22, [sp, #32]
    stp x23, x24, [sp, #48]

    mov x19, x0          // x19 = arr (포인터, 재귀 내내 안 변함)
    mov w20, w1          // w20 = left (원본 왼쪽 경계, 안 변함)
    mov w21, w2          // w21 = right (원본 오른쪽 경계, 안 변함)

    mov w22, w20         // w22 = pL (왼쪽 커서, 시작은 left)
    mov w23, w21         // w23 = pR (오른쪽 커서, 시작은 right)

    // pivot = arr[(pL + pR) / 2]
    add w9, w22, w23
    lsr w9, w9, #1               // 인덱스는 항상 양수라 lsr(논리 시프트)로 /2
    ldr w24, [x19, w9, sxtw #2]  // w24 = pivot  (sxtw #2 = 인덱스를 4바이트 스케일로 자동 확장)

_qs_do:
    // while (arr[pL] < pivot) pL++;
_qs_left_loop:
    ldr w9, [x19, w22, sxtw #2]
    cmp w9, w24
    b.ge _qs_left_done            // arr[pL] >= pivot 이면 탈출 (즉 < 일때만 계속)
    add w22, w22, #1
    b _qs_left_loop
_qs_left_done:

    // while (arr[pR] > pivot) pR--;
_qs_right_loop:
    ldr w9, [x19, w23, sxtw #2]
    cmp w9, w24
    b.le _qs_right_done           // arr[pR] <= pivot 이면 탈출
    sub w23, w23, #1
    b _qs_right_loop
_qs_right_done:

    // if (pL <= pR) { swap(arr[pL], arr[pR]); pL++; pR--; }
    cmp w22, w23
    b.gt _qs_no_swap

    ldr w9,  [x19, w22, sxtw #2]   // temp = arr[pL]
    ldr w10, [x19, w23, sxtw #2]   // arr[pR]
    str w10, [x19, w22, sxtw #2]   // arr[pL] = arr[pR]
    str w9,  [x19, w23, sxtw #2]   // arr[pR] = temp

    add w22, w22, #1               // pL++
    sub w23, w23, #1               // pR--

_qs_no_swap:
    cmp w22, w23
    b.le _qs_do                    // do-while(pL <= pR)

    // if (left < pR) QuickSort(arr, left, pR, 'L')
    cmp w20, w23
    b.ge _qs_skip_left
    mov x0, x19
    mov w1, w20
    mov w2, w23
    mov w3, #'L'
    bl _quicksort
_qs_skip_left:

    // if (right > pL) QuickSort(arr, pL, right, 'R')
    cmp w21, w22
    b.le _qs_skip_right
    mov x0, x19
    mov w1, w22
    mov w2, w21
    mov w3, #'R'
    bl _quicksort
_qs_skip_right:

    // epilogue - 저장했던 순서 역순으로 복원
    ldp x23, x24, [sp, #48]
    ldp x21, x22, [sp, #32]
    ldp x19, x20, [sp, #16]
    ldp x29, x30, [sp], #64
    ret


// ============================================================
//  void demo_quicksort(void)
//  테스트 배열 정렬 전/후 출력 데모
// ============================================================
_demo_quicksort:
    stp x29, x30, [sp, #-32]!
    mov x29, sp
    stp x19, x20, [sp, #16]

    // 정렬 전 출력
    adrp x0, before_msg@PAGE
    add x0, x0, before_msg@PAGEOFF
    bl _printf

    adrp x19, test_arr@PAGE
    add x19, x19, test_arr@PAGEOFF   // x19 = &test_arr[0]

    bl _print_arr

    // QuickSort(test_arr, 0, ARR_LEN - 1, 'S')
    mov x0, x19
    mov w1, #0
    mov w2, #8              // 배열 크기 9개 → 마지막 인덱스 8
    mov w3, #'S'
    bl _quicksort

    // 정렬 후 출력
    adrp x0, after_msg@PAGE
    add x0, x0, after_msg@PAGEOFF
    bl _printf

    bl _print_arr

    ldp x19, x20, [sp, #16]
    ldp x29, x30, [sp], #32
    ret


// ============================================================
//  void print_arr(void)  -- 내부 헬퍼, x19 = 배열 시작주소 유지된 상태에서 호출
// ============================================================
_print_arr:
    stp x29, x30, [sp, #-32]!
    mov x29, sp
    stp x20, x21, [sp, #16]

    mov w20, #0              // i = 0
    mov w21, #9              // 배열 길이 9

_pa_loop:
    cmp w20, w21
    b.ge _pa_done

    ldr w0, [x19, w20, sxtw #2]   // w0 = arr[i]
    mov x1, x0                     // printf 인자용 임시 보존
    sxtw x1, w0

    adrp x0, num_format@PAGE
    add x0, x0, num_format@PAGEOFF
    bl _printf

    add w20, w20, #1
    b _pa_loop

_pa_done:
    adrp x0, newline_format@PAGE
    add x0, x0, newline_format@PAGEOFF
    bl _printf

    ldp x20, x21, [sp, #16]
    ldp x29, x30, [sp], #32
    ret


.data
.align 3

// 테스트 배열: 3, 1, 7, 5, 5, 2, 6, 4, 8 (README 예시 데이터 그대로)
test_arr:
    .word 3, 1, 7, 5, 5, 2, 6, 4, 8

before_msg:
    .asciz "🔀 정렬 전: "

after_msg:
    .asciz "✅ 정렬 후: "

num_format:
    .asciz "%lld "

newline_format:
    .asciz "\n"
