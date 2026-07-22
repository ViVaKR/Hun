// bubble_sert.S

.include "section_macros.inc"
.global  _bubble_sort
BSS_SECTION
CONST_DATA_SECTION
DATA_SECTION
CONST_SECTION
CSTRING_SECTION
CODE_SECTION
_bubble_sort:
  // 프롤로그
	stp x29, x30, [sp, #-48]!
	mov x29, sp
	stp x19, x20, [sp, #16]
	stp x21, x22, [sp, #32]

	// stp q0, q1, [sp, #8]       // 이제 "16의 배수라야 하네" 경고가 떠야 정상 (예전엔 안 떴을 것)	
	// str q0, [sp, #4]           // 이제 오탐 없이 "16의 배수" 경고가 떠야 정상
	
	// mul v0.4s, v1.4s, v2.s[1]
	// // node -e "const {ENGLISH_MNEMONICS}=require('./mnemonics'); ... 위에서 쓴 대조 스크립트 그대로"
	// tst
	// neg 
	// br
	// asr
	// fneg
	// fsqrt
	// fabs
	// fmax 
	
	// fmin
	// tbz   
	// b.hs  
	// b.lo  
	// strb  
	// strh  
	// ldrsw 
	// uxtb  
	// uxth  
	// uxtw  
	
	

	  // 에필로그
	ldp x19, x20, [sp, #16]
	stp x21, x22, [sp, #32]
	mov x0, #0
	ldp x29, x30, [sp], #48
  ret