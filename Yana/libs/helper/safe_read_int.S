//  [훈] 프로젝트 - 공용 헬퍼 함수
//  safe_read_int.S
//
//  ============================================================
//  📌 왜 이 함수가 필요한가?
//  ============================================================
//  scanf("%lld", ...)는 숫자가 아닌 문자(예: "hello")를 만나면
//  1) 변수에 값을 쓰지 않고
//  2) 실패한 입력을 버퍼에서 "소비하지 않은 채" 그대로 남겨둔다.
//
//  버퍼를 청소하지 않고 다시 scanf를 호출하면, 남아있던 문자를
//  또 읽으려다 또 실패하는 일이 반복된다. (입력 단어 개수만큼 반복됨)
//
//  이 함수는 그 문제를 한 곳에서 해결해서, 어떤 메뉴/데모에서든
//  "bl _safe_read_int" 한 줄만 부르면 항상 안전하게 정수를 받는다.
//  ============================================================
 
.include "section_macros.inc"

// [초기화된 변수]
// __DATA,__data
DATA_SECTION

// [읽기전용 변수/포인터 테이블]
// __DATA,__const
CONST_DATA_SECTION
fmt_scan_int_local:    .asciz "%lld"
err_invalid_num_local: .asciz "숫자만 입력하세요\n"

// [읽기전용 상수 데이터]
//__TEXT,__const
CONST_SECTION

// [C-스타일 문자열 리터럴]
// __TEXT,__cstring,cstring_literals
CSTRING_SECTION

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION
// ----------------------------------------
// long long safe_read_int(void)
//
// 유효한 정수가 입력될 때까지 반복해서 물어보고,
// x0 에 결과값을 담아 리턴한다.
//
// 사용 예:
//     bl  _safe_read_int
//     mov x20, x0          // x20 = 사용자가 입력한 유효한 정수
//
// 지역변수 레이아웃 (FP 기준):
//   [x29, #96] : num (사용자가 입력한 값을 임시로 담는 8바이트 공간)
//
// 사용 레지스터:
//   x19 = num 지역변수의 '주소' (callee-saved라 bl 여러 번 거쳐도 안전)
// ----------------------------------------
.equ NUM_OFFSET, 96  // 96 (고정 프레임) 부터가 지역변수 시작 위치
.equ FRAME_SIZE, 112 // 96 + 8(quad 1개) = 104 -> 16 바이트 정렬위해 112
FUNC_START_FULL func_name, FRAME_SIZE

  // 지역 변수 num의 주소를 한 번만 계산해서 x19에 캐싱
  // (scanf/printf/getchar 를 몇번 호출해도 x19는 안전하게 보존됨)
	add x19, x29, #NUM_OFFSET  // FP _ 96

.L_safe_read_retry:
  // scanf("lld, &num")
	adrp x0, fmt_scan_int_local@PAGE
	add  x0, x0, fmt_scan_int_local@PAGEOFF
	mov  x1, x19
	sub  sp, sp, #16
	str  x1, [sp, #0]
	bl   _scanf
	add  sp, sp, #16
  
  // scanf 리턴값 확인: 성공적으로 변환한 개수가 1이어야 정상
	cmp  x0, #1
	b.ne .L_safe_read_flush // 1 이 아니면 실패 -> 버퍼 청소 후 재시도
  
  // 성공: 지역변수에서 값을 읽어서 리턴 준비
	ldr x0, [x19] 
	b   .L_safe_read_done

.L_safe_read_flush:
    // ★ 핵심: 실패한 입력을 버퍼에서 개행('\n')이 나올 때까지 싹 비운다.
    //         이게 없으면 실패한 문자가 계속 재사용되어 같은 에러가 반복됨.

.L_safe_read_clear_loop:
	bl   _getchar
	cmp  x0, #10 // 10 = '\n' 아스키 코드
	b.eq .L_safe_read_clear_done
	cmp  x0, #-1 // EOF 방어 (파일 끝/입력 스트림 종료)
	b.ne .L_safe_read_clear_loop
 
.L_safe_read_clear_done:
	adrp x0, err_invalid_num_local@PAGE
	add  x0, x0, err_invalid_num_local@PAGEOFF
	bl   _printf
  
	b .L_safe_read_retry  // 처음 부터 다시 물어봄
  
.L_safe_read_done:
FUNC_EXIT_FULL FRAME_SIZE