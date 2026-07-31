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
str_input:   .asciz "%lld %lld"
str_err_msg: .asciz "숫자로 두 개를 정확히 입력하셔야 합니다.: "

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION
FUNC_START_FULL input_number, 128

.L_retry_input:
  // 1. 프롬프트 메시지 출력 (전달받은 x0 출력)
	bl _printf
  
  // 2. scanf 호출 준비 (%lld %lld)
	adrp x0, str_input@PAGE
	add  x0, x0, str_input@PAGEOFF
  
	add x19, sp, #112 // 첫번째 숫자가 저장될 주소
	add x20, sp, #120 // 두 번째 숫자가 저장될 주소 

	sub sp, sp, #16
	stp x19, x20, [sp] // C 호출 규약상 x1, x2 위치에 저장됨 
	bl  _scanf 
	add sp, sp, #16
  
  // -------------------------------------------------------------
  // ★ [검문소] scanf 결과 검사!
  // scanf는 성공적으로 읽은 변수 개수를 x0에 리턴합니다.
  // 2개가 정상 입력되었으면 x0 == 2 입니다.
  // -------------------------------------------------------------
	cmp  x0, #2
	b.eq .L_input_success 

// =============================================================
// 🚨 [버퍼 청소기 작동] HelloWorld 같은 이상한 문자 버퍼 싹 비우기!
// 엔터('\n', 10)나 파일끝(EOF, -1)을 만날 때까지 getchar로 계속 읽어냄
// =============================================================
.L_flush_buffer:
	bl   _getchar
	cmp  x0, #10         // '\n' (엔터) 인가?
	b.eq .L_show_error
	cmp  x0, #-1         // EOF 인가?
	b.eq .L_show_error
	b    .L_flush_buffer   // 남은 문자 계속 비우기 

.L_show_error:
  // 경고 메시지 출력 후 다시 입력 받으로 이동
	adrp x0, str_err_msg@PAGE
	add  x0, x0, str_err_msg@PAGEOFF
	b    .L_retry_input  // 재입력 루프
  
.L_input_success:
  // 버퍼 청고: 성공했을 때도 혹시 뒤에 남은 엔터(\n) 버퍼를 깨끗이 비워둠

.L_flush_success_newline:
	bl   _getchar
	cmp  x0, #10
	b.ne .L_flush_success_newline

  // 저장된 두 값을 x0, x1에 담아서 뿜어냅니다!
	ldr x0, [sp, #112]
	ldr x1, [sp, #120]

FUNC_EXIT_FULL 128