//  chain.s
//  Created by 김범준 on 7/7/26.
//  5개 콜스택 데모

.global _chains
.align 2

_chain_func:
    stp x29, x30, [sp, #-16]!
    mov x29, sp
    add x0, x0, #5
    bl _chain_func2
    ldp x29, x30, [sp], #16
    ret

_chain_func2:
    stp x29, x30, [sp, #-16]!
    mov x29, sp
    add x0, x0, #4

    bl _chain_func3
    ldp x29, x30, [sp], #16
    ret

_chain_func3:
    stp x29, x30, [sp, #-16]!
    mov x29, sp
    add x0, x0, #3

    bl _chain_func4
    ldp x29, x30, [sp], #16
    ret

_chain_func4:
    stp x29, x30, [sp, #-16]!
    mov x29, sp
    add x0, x0, #2

    bl _chain_func5
    ldp x29, x30, [sp], #16
    ret

_chain_func5:
    stp x29, x30, [sp, #-16]!
    mov x29, sp

    // 여기서 x0 = 10 + 5 + 4 + 3 + 2 = 24 리턴 체인 시작
    ldp x29, x30, [sp], #16
    ret
