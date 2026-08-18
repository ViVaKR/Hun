// mmu.h — 여지(Yeoji) OS 최초의 MMU 뼈대
// 전략: QEMU virt 머신의 물리 메모리 배치가 1GB 단위로 깔끔하게 갈라지는 점을 이용해
//       L1 블록 디스크립터(1GB짜리) 딱 2개로 아이덴티티 매핑을 완성한다.
//
//   Entry[0] 0x00000000-0x3FFFFFFF  →  Device 메모리 (GICD/GICC/UART가 여기 삼)
//   Entry[1] 0x40000000-0x7FFFFFFF  →  Normal 메모리 (커널 코드/데이터/스택)
//
// 이후 힙/유저모드가 필요해지면 이 안을 4KB 페이지(L2/L3)로 잘게 쪼개면 됨.

#ifndef MMU_H
#define MMU_H

#include <stdint.h>

// ---- MAIR_EL1 attribute index ----
#define MT_NORMAL         0
#define MT_DEVICE_nGnRnE  1

// ---- 디스크립터 타입 (L1/L2 레벨 기준) ----
#define MM_TYPE_BLOCK     0x1   // bit[1:0] = 01 → 블록 디스크립터 (테이블 아님)
#define MM_TYPE_TABLE     0x3   // 나중에 4KB 페이지로 세분화할 때 사용

// ---- 공통 플래그 ----
#define MM_ACCESS_FLAG    (1ULL << 10)  // AF: 이거 안 세우면 첫 접근에서 Access Flag Fault
#define MM_UXN            (1ULL << 54)  // Unprivileged eXecute Never (EL0용, 지금은 EL0 없어도 습관적으로 세팅)
#define MM_PXN            (1ULL << 53)  // Privileged eXecute Never (Device 영역은 반드시 세울 것!)

// Normal 메모리(RAM): Inner Shareable, 실행 허용, 캐시 가능
#define NORMAL_BLOCK_FLAGS \
    (MM_TYPE_BLOCK | (MT_NORMAL << 2) | (3ULL << 8) /* SH=Inner */ | MM_ACCESS_FLAG)

// Device 메모리(GIC/UART): Non-shareable, 절대 실행 금지, 캐시 절대 금지
#define DEVICE_BLOCK_FLAGS \
    (MM_TYPE_BLOCK | (MT_DEVICE_nGnRnE << 2) | MM_ACCESS_FLAG | MM_PXN | MM_UXN)

void mmu_init(void);

#endif // MMU_H
