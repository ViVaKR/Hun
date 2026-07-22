#include "yeoji_section_macros.inc"

CODE_SECTION
.global vector_table_el1
.global _install_vectors
.extern exc_c_handler

// 레지스터 전체(x0~x30) 백업/복원 매크로 — C 핸들러가 뭘 건드려도 안전하게

.macro SAVE_ALL
	sub sp, sp, #256
	stp x0, x1, [sp, #16*0]
	stp x2, x3, [sp, #16*1]
	stp x4, x5, [sp, #16*2]
	stp x6, x7, [sp, #16*3]
	stp x8, x9, [sp, #16*4]
	stp x10, x11, [sp, #16*5]
	stp x12, x13, [sp, #16*6]
	stp x14, x15, [sp, #16*7]
	stp x16, x17, [sp, #16*8]
	stp x18, x19, [sp, #16*9]
	stp x20, x21, [sp, #16*10]
	stp x22, x23, [sp, #16*11]
	stp x24, x25, [sp, #16*12]
	stp x26, x27, [sp, #16*13]
	stp x28, x29, [sp, #16*14]
	str x30, [sp, #16*15]
.endm

.macro RESTORE_ALL
	ldp x0, x1, [sp, #16*0]
	ldp x2, x3, [sp, #16*1]
	ldp x4, x5, [sp, #16*2]
	ldp x6, x7, [sp, #16*3]
	ldp x8, x9, [sp, #16*4]
	ldp x10, x11, [sp, #16*5]
	ldp x12, x13, [sp, #16*6]
	ldp x14, x15, [sp, #16*7]
	ldp x16, x17, [sp, #16*8]
	ldp x18, x19, [sp, #16*9]
	ldp x20, x21, [sp, #16*10]
	ldp x22, x23, [sp, #16*11]
	ldp x24, x25, [sp, #16*12]
	ldp x26, x27, [sp, #16*13]
	ldp x28, x29, [sp, #16*14]
	ldr x30, [sp, #16*15]
	add sp, sp, #256
.endm

// 벡터 테이블은 반드시 2KB(0x800) 경계에 정렬되어야 함 (ARM 규격)
.align 11
vector_table_el1:

// ---- Group 0: Current EL, SP0 (안 씀) ----
.align 7
	b _v_invalid_sync
.align 7
	b _v_invalid_irq
.align 7
	b _v_invalid_fiq
.align 7
	b _v_invalid_serr

// ---- Group 1: Current EL, SPx ★ 지금 우리 EL1이 실제로 쓰는 그룹! ----
.align 7
	b _sync_handler
.align 7
	b _irq_handler
.align 7
	b _fiq_handler
.align 7
	b _serr_handler

// ---- Group 2: Lower EL, AArch64 (안 씀) ----
.align 7
	b _v_invalid_sync
.align 7
	b _v_invalid_irq
.align 7
	b _v_invalid_fiq
.align 7
	b _v_invalid_serr

// ---- Group 3: Lower EL, AArch32 (안 씀) ----
.align 7
	b _v_invalid_sync
.align 7
	b _v_invalid_irq
.align 7
	b _v_invalid_fiq
.align 7
	b _v_invalid_serr

// -------------------------------------------------------------
// 원래는 절대 안 걸려야 하는 벡터들 — 걸리면 설계 오류를 바로 알 수 있게
// 표식값을 다르게 남기고 공통 핸들러로 진입
// -------------------------------------------------------------
_v_invalid_sync: SAVE_ALL
	mov x0, #0xDEAD
	b   _exc_dispatch
_v_invalid_irq:  SAVE_ALL
	mov x0, #0xDEAE
	b   _exc_dispatch
_v_invalid_fiq:  SAVE_ALL
	mov x0, #0xDEAF
	b   _exc_dispatch
_v_invalid_serr: SAVE_ALL
	mov x0, #0xDEB0
	b   _exc_dispatch

// -------------------------------------------------------------
// 실제로 쓰는 4종 핸들러 (Current EL, SPx)
// -------------------------------------------------------------
_sync_handler:
  SAVE_ALL
	mov x0, #1      // type = SYNC
	b   _exc_dispatch

_irq_handler:
	SAVE_ALL
	bl irq_handler_c   // ★ GIC ack → 타이머 처리 → EOI까지 여기서 끝
	RESTORE_ALL
	eret // 원래 실행하던 곳으로 정상 복귀

_fiq_handler:
	SAVE_ALL
	mov x0, #3
	b   _exc_dispatch

_serr_handler:
	SAVE_ALL
	mov x0, #4
	b   _exc_dispatch

// -------------------------------------------------------------
// 공통 디스패처: ESR/ELR/FAR 긁어서 C 핸들러로 토스
// -------------------------------------------------------------
_exc_dispatch:
	mrs x1, esr_el1         // 왜 예외가 났는지 (원인 코드)
	mrs x2, elr_el1         // 예외 발생 당시 실행 중이던 명령어 주소
	mrs x3, far_el1         // (메모리 접근 오류라면) 문제의 주소
	bl  exc_c_handler
  
  // IRQ만 정상적으로 복귀. 나머지(SYNC/FIQ/SError)는 대부분 복구 불가능한 fault
	cmp  x0, #2
	b.ne _exc_halt
	RESTORE_ALL
	eret

_exc_halt:
	b .                   // 무한 정지 — 원인 파악 후 리셋
  
// -------------------------------------------------------------
// void _install_vectors(void);
// VBAR_EL1에 이 벡터 테이블의 주소를 등록
// -------------------------------------------------------------
_install_vectors:
	adrp x0, vector_table_el1
	add  x0, x0, :lo12:vector_table_el1
	msr  vbar_el1, x0
	isb  // ★ 필수! 명령어 파이프라인을 동기화해서 새 VBAR가 즉시 반영되게 함
	ret