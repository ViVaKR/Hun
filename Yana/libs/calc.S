//  calc.s
//  Created by 김범준 on 7/6/26.

.global _add_numbers
.global _sub_numbers
.global _mul_numbers
.global _div_numbers

.align 2

_add_numbers:
    add x0, x0, x1
    ret

_sub_numbers:
    sub x0, x0, x1
    ret

_mul_numbers:
    mul x0, x0, x1
    ret

_div_numbers:
    sdiv x0, x0, x1
    ret
