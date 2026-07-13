//  fib.s
//  Created by 김범준 on 7/7/26.
//  재귀 피보나치

.global _fib
.align 2

// =================================================================
// int fib(int n) { if (n<2) return n; return fib(n-1)+fib(n-2); }
// =================================================================

_fib:
    // 프롤로그: 이 함수는 재귀 호출을 하므로 반드시 lr(x30) 저장 필요
    stp x29, x30, [sp, #-32]! // fp, lr 저장 + n fib(n-1) 임시 보관용 16바이트 추가 확보
    mov x29, sp

    str x0, [sp, #16]           // n 값을 스택에 백업 (재귀 호출 중 x0이 덮어써지므로)

    cmp x0, #2
    b.lt _fib_base              // n < 2 이면 바로 리턴

    sub x0, x0, #1              // x0 = n - 1
    bl _fib                     // x0 = fib(n-1)
    str x0, [sp, #24]           // fib(n-1) 결과 임시저장

    ldr x0, [sp, #16]           // n  복원
    sub x0, x0, #2              // x0 = n-2
    bl _fib                     // x0 = fib(n-2)

    ldr x1, [sp, #24]           // 아까 저장한 fib(n-1) 꺼내기
    add x0, x0, x1              // x0 = fib(n-1) + fib(n-2)
    b _fib_end

_fib_base:
    ldr x0, [sp, #16]           // n 그대로 리턴

_fib_end:
    ldp x29, x30, [sp], #32     // 에필로그: fp, lr 복원
    ret


# - 이 코드로 할 훈련 포인트
# 1. br s -n _fib 걸고 c로 여러 번 멈춰가면서 몇 번째 호출인지 확인
# 2. bt 쳐서 스택이 얼마나 깊게 쌓였는지 시각적으로 확인 (fib(5)→fib(4)→fib(3)→fib(2) 이런 식으로)
# 3. memory read -f x -c 8 $sp로 스택에 쌓인 n값, fib(n-1) 임시값들이 실제로 어디 저장돼 있는지 헥스로 확인
# 4. frame select 1, frame select 2로 콜스택 오르내리며 각 프레임의 n 값 비교
# 5. 마지막에 _main으로 돌아왔을 때 x0 = 5 (fib(5)=5) 확인
