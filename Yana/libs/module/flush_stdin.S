// ====================================================
// [입력 버퍼 청소 공통 서브루틴]
// - 반환값 (w0):
//     0 : 정상 청소 완료 ('\n' 만남)
//    -1 : EOF 만나서 스트림 닫힘 (Ctrl + D)
// ====================================================

.global _flush_stdin
_flush_stdin:
	stp x29, x30, [sp, #-16]!
	mov x29, sp
  
.L_flush_loop:
	bl _getchar
  
	// 1. 개행문자 ('\n' = 10) 를 만나면 청소끝
	cmp  w0, #10
	b.eq .L_flush_success
  
  // 2. EOF(-1)를 만나면 종료 상태로 탈출 !
	cmp  w0, #-1
	b.eq .L_flush_eof

.L_flush_success:
	mov w0, #0        // 성공 코드 0반환
	b   .L_flush_end

.L_flush_eof:
	mov w0, #-1

.L_flush_end:
	ldp x29, x30, [sp], #16
	ret