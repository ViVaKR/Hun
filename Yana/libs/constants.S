.include "section_macros.inc"

// ====================================================
//  제목: 읽기 전용 상수 모음 (constants.S)
//  목적: C-String, 상수 테이블, 리터럴 통합 관리
// ====================================================


// ------------------------------------------------
// [문자열 리터럴] __TEXT,__cstring,cstring_literals
// printf 포맷 스트링 등 널 종료(null-terminated)
// 문자열 상수 전용 (읽기 전용)
// -----------------------------------------------
CSTRING_SECTION
.global _helloworld
.global _newline_str, _menu_format, _line_char, _fmt_demo, _fmt_qs
.global _label_before, _label_after, _format_str, _icon_heart, _menu_title
.global _input_prompt, _scanf_format, _err_format, _press_enter, _exit_message
.global _str_exit, _str_forloop, _str_csel, _str_welcome_rust, _str_if_else
.global _str_string_to_integer, _str_readline, _str_delegate, _str_function_call, _str_loop_int
.global _str_demo_madd, _str_console_writeline, _str_ldrb, _str_guess_game, _str_fib
.global _str_variable_size, _str_hanoi, _str_sum_numbers, _str_gcd, _str_is_palindrome
.global _str_quicksort, _str_adc, _str_madd, _str_msub, _str_sys_print, _str_sys_print_fmt
.global _str_rust_demo, _str_rust_demo_tup, _char_format, _char_len
.global _ldrb_sample_string, _fmt_loop, _fmt_sum, _fmt_for_loop
.global _fmt_sum_float, _fmt_loop_deciaml, _fmt_result_madd
.global _fmt_result_mod, _fmt_scanf_2, _input_prompt_numbers
.global _fmt_result, _fmt_delegate_add, _fmt_delegate_sub, _msg_input_error


// -------------- //
_input_prompt:         .asciz "\n🍒 원하는 메뉴를 선택하세요 🍒 ⇢ "
_input_prompt_numbers: .asciz "두 정수 입력: "

_fmt_scanf_2:      .asciz "%lld %lld"
_fmt_sum:          .asciz "%lld + %lld = %lld\n"
_fmt_sum_float:    .asciz "%.2f + %.2f = %.3f\n"
_fmt_for_loop:     .asciz "%lld 회 합계 %lld\n"
_fmt_loop:         .asciz "데이터 %lld 번째 값: %.3f\n"
_fmt_result:       .asciz "결과: %lld\n"
_fmt_result_madd:  .asciz "madd result: %lld\n"
_fmt_result_mod:   .asciz "%lld %% %lld = %lld\n"
_fmt_demo:         .asciz "total: %d, count: %d\n"
_fmt_qs:           .asciz "%lld "
_fmt_float:        .asciz "🍓 Float  (32-bit PI) : %.7f\n"
_fmt_double:       .asciz "🍒 Double (64-bit PI) : %.15lf\n"
_fmt_delegate_add: .asciz "%lld + %lld = %lld\n"
_fmt_delegate_sub: .asciz "%lld - %lld = %lld\n"

_msg_input_error: .asciz "잘못된 입력입니다.\n"

_list_format: .asciz "Index [%lld]: Value = %d\n"
_newline_str: .asciz "\n"

_menu_format: .asciz "%2d: %-15s"
_menu_title:  .asciz "😎 메뉴목록 😎 "
_line_char:   .asciz "👻"

_label_before: .asciz "\n정렬 전: "
_label_after:  .asciz "정렬 후: "

_icon_heart: .asciz "💖 "

_char_format:  .asciz "%c"
_char_len:     .asciz "\n총 문자수: %lld"
_scanf_format: .asciz "%d"
_err_format:   .asciz "잘못된 선택입니다. (선택범위: 1 ~ %d)\n"

_press_enter:        .asciz "\n🧚 엔터(Enter) 키를 누르면 메뉴로 돌아갑니다..."
_exit_message:       .asciz "\n👻 👻 👻 좋은 경험이었습니다. 다음에 또 멋지게 만나요!! 👻 👻 👻\n\n"
_helloworld:         .asciz "Hello, World! Fine Thanks And You?"
_ldrb_sample_string: .asciz "메모리에서 1바이트 읽기 데모 문자"

_str_exit:              .asciz "exit"
_str_forloop:           .asciz "for"
_str_csel:              .asciz "csel"
_str_welcome_rust:      .asciz "Rust Call 1"
_str_if_else:           .asciz "if else"
_str_string_to_integer: .asciz "str to int"
_str_readline:          .asciz "scanf"
_str_delegate:          .asciz "delegate"
_str_function_call:     .asciz "function"
_str_loop_int:          .asciz "loop"
_str_console_writeline: .asciz "writeline"
_str_ldrb:              .asciz "ldrb"
_str_guess_game:        .asciz "Guess"
_str_fib:               .asciz "Fibonacci"
_str_variable_size:     .asciz "Variable 1"
_str_hanoi:             .asciz "Hanoi"
_str_sum_numbers:       .asciz "Sum Numbers"
_str_gcd:               .asciz "GCD"
_str_is_palindrome:     .asciz "Palindrome"
_str_quicksort:         .asciz "Quick Sort"
_str_adc:               .asciz "ADC"
_str_madd:              .asciz "MADD 1"
_str_msub:              .asciz "MSUB"
_str_sys_print:         .asciz "sys print"
_str_sys_print_fmt:     .asciz "sys print fmt"
_str_rust_demo:         .asciz "rust println"
_str_rust_demo_tup:     .asciz "rust tuple"
_str_pi_print:          .asciz "PI Print"

// --- 읽기 전용 데이터 / 포인터 테이블 ---
CONST_DATA_SECTION
.global _menu_table, _menu_table_end
.global _delegate_add, _delegate_sub

_menu_table:
    .quad _menu_exit, _str_exit                      // 0
    .quad _menu_forloop, _str_forloop
    .quad _csel, _str_csel
    .quad _menu_welcome_rust, _str_welcome_rust
    .quad _if_else, _str_if_else
    .quad _string_to_number, _str_string_to_integer  // 5
    .quad _readline, _str_readline
    .quad _delegate, _str_delegate
    .quad _menu_function_call, _str_function_call
    .quad _menu_loop_int, _str_loop_int
    .quad _console_writeline, _str_console_writeline // 10
    .quad _mnemonic_ldrb, _str_ldrb
    .quad _guess_game, _str_guess_game
    .quad _fib_print, _str_fib
    .quad _variable_size, _str_variable_size
    .quad _hanoi, _str_hanoi                         // 15
    .quad _sum_of_numbers, _str_sum_numbers
    .quad _gcd, _str_gcd
    .quad _is_palindrome, _str_is_palindrome
    .quad _quicksort, _str_quicksort
    .quad _mnemonic_adc, _str_adc                    // 20
    .quad _mnemonic_madd, _str_madd
    .quad _mnemonic_msub, _str_msub
    .quad _run_sys_print, _str_sys_print
    .quad _run_sys_print_fmt, _str_sys_print_fmt
    .quad _demo, _str_rust_demo                      // 25
    .quad _demo_tuple, _str_rust_demo_tup
    .quad _pi_print, _str_pi_print
_menu_table_end:

_delegate_add: .quad _callback_add // 덧셈
_delegate_sub: .quad _callback_sub // 뺄셈


// ==================================
//  [constants.S] 부동소수점 상수 정의
// ==================================

// 4바이트 실수 상수 : float
LITERAL4_SECTION
.global _pi_float, _fmt_float

_pi_float:
  .float 3.1415927 // 32 비트 단정도 실수 (float)

// 8바이트 실수 상수 : double
LITERAL8_SECTION
.global _pi_double, _fmt_double

_pi_double:
  .double 3.141592653589793 // 64비트 배정밀도 실수 (double)
