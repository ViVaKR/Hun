
.include "../include/hun.macros.inc"

.global _test
.align 2

_test:
    push_pair x19, x20
    
    pop_pair x19, x20
    ret
