.include "section_macros.inc"
.global _menu_delegate

BSS_SECTION
CONST_DATA_SECTION
delegate_add: .quad _callback_add // 덧셈
delegate_sub: .quad _callback_sub // 뺄셈

DATA_SECTION
CONST_SECTION
CSTRING_SECTION
format_function_call:  .asciz "[function call result] %d + %d = %d\n"
format_delegate:       .asciz "[Delegate Callback Result] 연산 결과: %d\n"

CODE_SECTION
_menu_delegate:
  // 프롤로그
  stp x29, x30, [sp, #-48]!
  mov x29, sp  
  stp x19, x20, [sp, #16]
  stp x21, x22, [sp, #32]
  
  
  // [상황]  x19, x20 의 데이터를 가지고 
  // 어떤 연산을 할지 '동적(콜백)'으로 결정하고 싶다. 
  mov x19, #143
  mov x20, #75

  // # ---------------------------
  // # 🔥 [덧셈 델리게이트 장전 및 격발]
  // # --------------------------
  adrp x9, delegate_add@PAGE
  add x9, x9, delegate_add@PAGEOFF
  
  // 함수의 절대주소를 x10 레지스터로 인출 (포인터 역참조)
  ldr x10, [x9]
  
  mov x0, x19
  mov x1, x20

  // C# 의 delegate.Invoke() 숭내
  blr x10
  mov x21, x0 
  
  adrp x0, format_delegate@PAGE
  add x0, x0, format_delegate@PAGEOFF
  
  sub sp, sp, #16
  str x21, [sp, #0]
  bl _printf
  add sp, sp, #16

  // # ---------------------------
  // # 🔥 [뺄셈 델리게이트 장전 및 격발]
  // # --------------------------
  mov x19, #100
  mov x20, #75

  adrp x9, delegate_sub@PAGE
  add x9, x9, delegate_sub@PAGEOFF
  ldr x10, [x9]
  
  mov x0, x19
  mov x1, x20
  blr x10     // _callback_sub 로 진격 다녀 오면 x0에 리턴값 담김.
  mov x21, x0 // x0 을 x21 에 백업
  
  // 출력
  adrp x0, format_delegate@PAGE
  add x0, x0, format_delegate@PAGEOFF
  sub sp, sp, #16
  str x21, [sp, #0] // x21 에 백업된 리턴값을, printf 아규먼트 x0 으로 저장
  bl _printf
  add sp, sp, #16
  
  b .L_terminate
 
_callback_add:
  add x0, x0, x1
  ret

_callback_sub:
  sub x0, x0, x1
  ret

.L_terminate:
  // 에필로그
  ldp x19, x20,[sp, #16]
  ldp x21, x22, [sp, #32]
  mov x0, #0
  ldp x29, x30, [sp], #48
  ret