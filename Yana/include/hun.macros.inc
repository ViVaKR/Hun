/* Define a macro to push two 64-bit registers onto the stack */
/* Usage in code */
/*
.global _start
_start:
    push_pair x19, x20             // Expands to: stp x19, x20, [sp, #-16]!
    
    // ... your code here ...
    
    pop_pair x19, x20              // Expands to: ldp x19, x20, [sp], #16
    ret
*/

.macro push_pair reg1, reg2
    stp \reg1, \reg2, [sp, #-16]!   // Decrement SP by 16 and store pair
.endm



/* Define a macro to pop two 64-bit registers off the stack */

.macro pop_pair reg1, reg2
    ldp \reg1, \reg2, [sp], #16    // Load pair and increment SP by 16
.endm

/* Absolute Value Macro */
/* Usage in code */
/*
_process_data:
    abs_val x0, x1                 // First invocation (uses labels 10 and 20)
    abs_val x2, x3                 // Second invocation (uses labels 11 and 21)
    ret
*/

.macro abs_val dest, src
    cmp     \src, #0               // Check if the source is negative
    b.ge    1f\@                   // If >= 0, jump forward to label 1
    neg     \dest, \src            // If negative, negate it
    b       2f\Detailed@           // Jump forward to label 2
1\@:
    mov     \dest, \src            // If positive, copy directly
2\@:
.endm
