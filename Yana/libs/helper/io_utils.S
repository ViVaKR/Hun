//  [훈] 프로젝트 - 공용 입출력 유틸리티
//  io_utils.S
//
//  scanf / getchar 를 직접 쓸 때 반복적으로 발생했던 3가지 버그를
//  이 파일 안에서 딱 한 번만 정확하게 처리하고, 나머지 코드는
//  전부 이 서브루틴들을 "조립"만 하도록 만든다.
//
//  잡았던 버그들:
//   1) scanf 반환값(x0)을 체크 안 하면, 잘못된 문자 입력 시
//      버퍼가 안 비워져서 무한루프에 빠짐
//   2) EOF(-1) 체크를 "1이 아니면 실패" 조건보다 나중에 두면
//      EOF도 그냥 "실패"로 뭉개져서 절대 안 걸림 -> EOF는 먼저 체크
//   3) scanf/getchar는 int(32비트)를 반환하므로 x0이 아니라
//      반드시 w0으로 비교해야 함 (x0으로 -1을 비교하면 상위 32비트
//      쓰레기값 때문에 거의 항상 거짓이 됨)
//
//  사용 규약 (모든 read_* 함수 공통):
//    x0 = 값 (또는 첫 번째 반환값)
//    x1 = 상태 코드
//         1  -> 성공
//         0  -> 형식 오류 (버퍼에 쓰레기 남아있으니 flush_line 호출 필요)
//        -1  -> EOF (Ctrl+D 등, 더 읽을 게 없음 -> 보통 프로그램 종료 처리)
// ============================================================

.include "section_macros.inc"

CSTRING_SECTION
scanf_fmt_lld: .asciz "%lld"
scanf_fmt_s:   .asciz "%255s" // read_string 전용: 최대 255자 + NUL

CODE_SECTION

// ----------------------------------------
// void flush_line(void)
// 입력 버퍼에서 개행('\n') 또는 EOF를 만날 때까지 강제로 다 읽어서 비움.
// scanf가 형식 오류(상태 0)로 실패했을 때, 남아있는 쓰레기 문자를
// 반드시 이 함수로 청소한 뒤 다음 입력을 받아야 무한루프를 피할 수 있음.
// ----------------------------------------
FUNC_START_FULL flush_line, 96
.L_fl_loop:
	bl   _getchar
	cmp  w0, #10     // '\n' 만나면 정상 종료 (w0! x0 아님)
	b.eq .L_fl_done
	cmp  w0, #-1     // EOF 만나면 종료 (더 읽을 게 없음)
	b.eq .L_fl_done
	b    .L_fl_loop
.L_fl_done:
FUNC_EXIT_FULL 96


// ----------------------------------------
// (long long value, long long status) read_long(void)
// "%lld" 로 정수 하나를 안전하게 읽음.
//
// 반환:
//   x0 = 읽은 값 (실패/EOF 시 0, 의미 없음 -> 반드시 x1 먼저 확인)
//   x1 = 상태 코드 (1 성공 / 0 형식오류 / -1 EOF)
//
// 주의: 상태가 0이면 호출자가 반드시 flush_line()을 호출해야 함.
//       (이 함수는 청소까지 책임지지 않음 - 읽기 전담)
// ----------------------------------------
FUNC_START_FULL read_long, 112
	adrp x0, scanf_fmt_lld@PAGE
	add  x0, x0, scanf_fmt_lld@PAGEOFF  // "%lld"
	add  x1, x29, #96                   // 지역변수 슬롯 (저장 레지스터 영역 위, 96~103)

	sub sp, sp, #16
	str x1, [sp, #0]
	bl  _scanf
	add sp, sp, #16

	// ★ EOF부터 먼저 체크! (순서 중요 - 늦게 두면 절대 안 걸림)
	cmp  w0, #-1
	b.eq .L_rl_eof

	cmp  w0, #1
	b.ne .L_rl_fail

	// 성공: 읽은 값을 로드해서 반환
	ldr x0, [x29, #96]
	mov x1, #1
	b   .L_rl_ret

.L_rl_fail:
	mov x0, #0
	mov x1, #0
	b   .L_rl_ret

.L_rl_eof:
	mov x0, #0
	mov x1, #-1

.L_rl_ret:
FUNC_EXIT_FULL 112


// ----------------------------------------
// long long read_string(char* buf)
// "%255s" 로 공백 전까지 한 단어를 안전하게 읽음 (버퍼 오버플로우 방지).
//
// 인자:
//   x0 = buf (호출자가 미리 준비한 버퍼 주소, 최소 256바이트 확보 필수!)
//
// 반환:
//   x0 = 상태 코드 (1 성공 / 0 형식오류 / -1 EOF)
//        (문자열 자체는 buf에 이미 채워져 있으므로 값 반환은 따로 없음)
// ----------------------------------------
FUNC_START_FULL read_string, 96
	mov x19, x0  // buf 주소 보관

	adrp x0, scanf_fmt_s@PAGE
	add  x0, x0, scanf_fmt_s@PAGEOFF
	mov  x1, x19

	sub sp, sp, #16
	str x1, [sp, #0]
	bl  _scanf
	add sp, sp, #16

	cmp  w0, #-1
	b.eq .L_rs_eof

	cmp  w0, #1
	b.ne .L_rs_fail

	mov x0, #1
	b   .L_rs_ret

.L_rs_fail:
	mov x0, #0
	b   .L_rs_ret

.L_rs_eof:
	mov x0, #-1

.L_rs_ret:
FUNC_EXIT_FULL 96


// ========================================================================
// 사용 예시 (_main 등에서 이렇게 조립만 하면 됨)
// ========================================================================
//
// .L_ask_input:
// 	adrp x0, input_prompt@PAGE
// 	add  x0, x0, input_prompt@PAGEOFF
// 	bl   _printf
//
// 	bl   _read_long           // x0 = 값, x1 = 상태
// 	mov  x22, x0               // 값 보관 (필요한 레지스터에)
//
// 	cmp  x1, #-1
// 	b.eq .L_terminate           // EOF -> 프로그램 종료
//
// 	cmp  x1, #1
// 	b.eq .L_input_valid          // 성공 -> 검증 단계로
//
// 	// 형식 오류: 청소하고 에러 처리
// 	bl   _flush_line
// 	b    .L_invalid_choice
//
// .L_input_valid:
// 	// (기존 범위 검사 로직: x22 사용)
// 	...
//
// ------------------------------------------------------------------------
// 문자열 입력이 필요할 때:
//
// 	adrp x0, some_buffer@PAGE      // 256바이트 이상 확보된 버퍼
// 	add  x0, x0, some_buffer@PAGEOFF
// 	bl   _read_string                // x0 = 상태
//
// 	cmp  x0, #-1
// 	b.eq .L_terminate
// 	cmp  x0, #1
// 	b.ne .L_bad_input                 // 형식 오류 시 flush_line은
// 	                                    // read_string 내부 scanf 특성상
// 	                                    // 보통 불필요하지만, 안전하게
// 	                                    // bl _flush_line 추가해도 무방
// ========================================================================
