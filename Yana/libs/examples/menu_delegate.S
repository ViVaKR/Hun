.include "section_macros.inc"
.global _menu_delegate

BSS_SECTION
CONST_DATA_SECTION
delegate_add: .quad _callback_add
delegate_sub: .quad _callback_sub

DATA_SECTION
CONST_SECTION
CSTRING_SECTION
format_function_call: .asciz "[function call result] %d + %d = %d\n"
format_delegate:       .asciz "[Delegate Callback Result] 연산 결과: %d\n"

CODE_SECTION
_menu_delegate:
  // 프롤로그
  stp x29, x30, [sp, #-48]!
  mov x29, sp  
  stp x19, x20, [sp, #16]
  stp x21, x22, [sp, #32]
  
  
  # [상황]  x19, x20 의 데이터를 가지고 어떤 연산을 할지 '동적(콜백)'으로 결정하고 싶다. 
  mov x19, #143
  mov x20, #75

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


// Delegate / Callback (함수 포인터 호출 훈련)
// [ 모델링 : C# delegate ]
// using System;
// class Program
// {
//    // 1. 델리게이트(함수 포인터 형식) 선언
//    delegate int CalcDelegate(int a, int b);
//
//    static void Main()
//    {
//        int x19 = 30;
//        int x20 = 20;
//
//        // 2. __DATA,__const 세션에 주소 박아놓은 것처럼 함수 맵핑!
//        CalcDelegate delAddition = _callback_add;
//        CalcDelegate delSubtraction = _callback_sub;
//
//        // 3. blr x10 격발! (레지스터에 주소만 바꿔 끼우며 호출)
//        int result1 = delAddition(x19, x20);       // C# 내부적으로 함수 주소 찾아가 실행 (50)
//        Console.WriteLine($"[Result] {result1}");
//
//        int result2 = delSubtraction(x19, x20);    // 똑같은 변수인데 동작이 바뀜 (10)
//        Console.WriteLine($"[Result] {result2}");
//    }
//
//    // 델리게이트가 가리키는 실제 하위 부대(Callee)
//    static int _callback_add(int a, int b) => a + b;
//    static int _callback_sub(int a, int b) => a - b;
//}