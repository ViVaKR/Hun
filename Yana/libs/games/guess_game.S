.include "section_macros.inc"

// [초기화된 변수]
// __DATA,__data
DATA_SECTION

// [읽기전용 변수/포인터 테이블]
// __DATA,__const
CONST_DATA_SECTION

// [읽기전용 상수 데이터]
//__TEXT,__const
CONST_SECTION

// [C-스타일 문자열 리터럴]
// __TEXT,__cstring,cstring_literals
CSTRING_SECTION

str_guess_start:        .asciz "Guess the number\n"
fmt_secret_num:         .asciz "The secret number is: %lld\n"
str_input_prompt:       .asciz "Please input your guess\n"
fmt_scan_input:         .asciz "%s"
fmt_scan_input_confirm: .asciz "입력한값: %lld\n"
fmt_print_guess:        .asciz "You guessed: %lld\n"
str_err_numeric:        .asciz "숫자만 입력하세요!\n"
str_too_small:          .asciz "Too small\n"
str_too_big:            .asciz "Too big!\n"
str_you_win:            .asciz "You win!\n"

str_add_number: .asciz "%lld + %lld = %lld\n"

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION
FUNC_START_FULL guess_game, 128
	
	// 시드 초기화 srand(time(NULL)) 구현부 추가
	mov x0, #0			// time(NULL)을 위한 인자 x0 에 0(NULL) 전달
	bl _time				// 현재 시간을 초 단위로 가져옴 -> x0에 결과 반환
	bl _srand 			// 가져온 시간 (x0)을 시드값으로 사용해 srand 호출

	mov x19, #5
	mov x20, #45
	add x21, x19, x20

	adrp x0, str_add_number@PAGE
	add  x0, x0, str_add_number@PAGEOFF
  
	sub sp, sp, #32
	stp x19, x20, [sp, #0]
	str x21, [sp, #16]
	bl  _printf 
	add sp, sp, #32
  
  // 
	adrp x0, str_guess_start@PAGE
	add  x0, x0, str_guess_start@PAGEOFF
  
	bl _printf

  // let secret_number = rand::random_range(1..=100);
  // 나머지(%) 연산의 수학적 도출
  // 정수 a 를 b 로 나눌때, 몫 q 와 나머지 r은 다음을 만족하도록 정의됨.
  // a = b * q + r
  // r = a - (b * q) 
  // 검증 17 % 5
  // q = 17 / 5 = 3
  // r = 17 - (5 * 3) == _rand() - (x2 * x1)
  // msub =>  rand() - (x2 * x1)
	bl   _rand      // x0, a (0 ~ 32767 난수 반환 -> x0)
	mov  x1, #100   // x1, b 
	udiv x2, x0, x1 // x2, q (a / b), 소숫점 버림
	msub x19, x2, x1, x0 // x0 - (x2 * x1) 나머지 구하기 
	add  x19, x19, #1
  
  // println!("The secret number is: {secret_number}");
	adrp x0, fmt_secret_num@PAGE
	add  x0, x0, fmt_secret_num@PAGEOFF
	sub  sp, sp, #16
	str  x19, [sp, #0]
	bl   _printf 
	add  sp, sp, #16

.L_loop_start:
	adrp x0, str_input_prompt@PAGE
	add  x0, x0, str_input_prompt@PAGEOFF
	bl   _printf 
  
  // io::stdin().read_line(&mut guess)...
	adrp x0, fmt_scan_input@PAGE
	add  x0, x0, fmt_scan_input@PAGEOFF
	add  x24, sp, #16 // 버퍼 위지 (sp + 16)
	mov  x1, x24	
	sub  sp, sp, #16
	str  x1, [sp, #0]
	bl   _scanf // scanf("%s", 버퍼) 호출
	add  sp, sp, #16
	
	// guess.trim().parse() 구현 (atoi 함수 사용)
	mov x0, x24
	bl  _atoi
	mov x20, x0  // x20 = 변환된 정수 (guess 값)
  
	// 단순 확인
	adrp x0, fmt_scan_input_confirm@PAGE
	add  x0, x0, fmt_scan_input_confirm@PAGEOFF
	mov  x1, x20
	sub  sp, sp, #16
	str  x1, [sp, #0]
	bl   _printf
	add  sp, sp, #16
	// 단순 확인 끝
	
	// 러스트의 Err(-) 예외 처리 
	// 단순히 0이하며 에러 처리
	cmp  x20, #0 
	b.gt .L_parse_success // 0 보다 크면 파싱 성공으로 간주
	
	// 에러 발생 시 : println!("숫자만입력하세요!"); continue;
	adrp x0, str_err_numeric@PAGE
	add  x0, x0, str_err_numeric@PAGEOFF
	
	bl _printf 
	b .L_loop_start		// 루프 처음오로 점프 (continue)

.L_parse_success:
	// println!("You guessed: {guess}");
	adrp x0, fmt_print_guess@PAGE
	add x0, x0, fmt_print_guess@PAGEOFF
	mov x1, x20
	sub sp, sp, #16
	str x1, [sp, #0]
	bl _printf 
	add sp, sp, #16
	
	// match guess.cmp(&secret_number)
	cmp x20, x19
	b.lt .L_too_small		// guess < secret_number
	b.gt .L_too_big			// guess > secret_number
	b .L_you_win				// guess == secret_number(Equal)
	

.L_too_small:
	// Ordering::Less => println!("Too small")
	adrp x0, str_too_small@PAGE
	add x0, x0, str_too_small@PAGEOFF
	bl _printf 	
	b .L_loop_start
.L_too_big:
	// Ordering::Equal => { println!("You win!"); break; }
	adrp x0, str_too_big@PAGE
	add x0, x0, str_too_big@PAGEOFF
	bl _printf 
	b .L_loop_start

.L_you_win:
	// Ordering::Equal => { println!("You win!"); break; }
	adrp x0, str_you_win@PAGE
	add x0, x0, str_you_win@PAGEOFF
	bl _printf
	FUNC_EXIT_FULL 128

FUNC_EXIT_FULL 128