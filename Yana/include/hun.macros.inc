/*  (1) Push two 64-bit registers onto the stack */

.macro push_pair reg1, reg2
    stp \reg1, \reg2, [sp, #-16]!   // Decrement SP by 16 and store pair
.endm


/* (2) Pop two 64-bit registers off the stack */

.macro pop_pair reg1, reg2
    ldp \reg1, \reg2, [sp], #16    // Load pair and increment SP by 16
.endm


