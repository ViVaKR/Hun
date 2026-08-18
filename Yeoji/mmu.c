// mmu.c — 여지(Yeoji) OS MMU 점화
//
// 순서가 생명이다:
//   1. L1 테이블(1GB 블록 2개)을 메모리에 쓴다
//   2. MAIR_EL1  — "인덱스 0번은 Normal, 1번은 Device다" 사전 등록
//   3. TCR_EL1   — 39비트 가상주소, 4KB granule, TTBR1은 아예 꺼버림(EPD1=1)
//   4. TTBR0_EL1 — 방금 만든 L1 테이블 물리주소 등록
//   5. TLB 청소 + 배리어
//   6. SCTLR_EL1.M = 1  ← 이 순간 MMU가 켜진다
//
// 아이덴티티 매핑(가상==물리)이라서 6번을 켜는 순간에도 PC가 실행 중이던
// 주소가 그대로 유효하다 — 이게 "처음 MMU 켤 땐 반드시 identity map"인 이유.

#include "mmu.h"

// 페이지 테이블은 반드시 4KB(0x1000) 경계에 정렬되어야 한다.
// .bss에 놓이므로 boot.S의 __bss_start~__bss_end 청소 루프가 0으로 밀어준다.
__attribute__((aligned(4096))) static uint64_t l1_page_table[512];

extern void uart_puts(const char *s);

void mmu_init(void)
{
    // 1. L1 테이블 초기화 — 전부 invalid(0)로 시작 (bit0=0 → Fault)
    for (int i = 0; i < 512; i++)
    {
        l1_page_table[i] = 0;
    }

    // Entry[0]: 0x00000000 ~ 0x3FFFFFFF (1GB) → Device (GICD 0x08000000, GICC 0x08010000, UART 0x09000000)
    l1_page_table[0] = (uint64_t)0x00000000 | DEVICE_BLOCK_FLAGS;

    // Entry[1]: 0x40000000 ~ 0x7FFFFFFF (1GB) → Normal (커널 자신이 이 안에 삼)
    l1_page_table[1] = (uint64_t)0x40000000 | NORMAL_BLOCK_FLAGS;

    // 2. MAIR_EL1 — attr index 0 = Normal WB Cacheable(0xFF), index 1 = Device-nGnRnE(0x00)
    uint64_t mair = (0xFFULL << (8 * MT_NORMAL)) | (0x00ULL << (8 * MT_DEVICE_nGnRnE));

    // 3. TCR_EL1 조립
    //    T0SZ=25  → VA 크기 = 64-25 = 39비트 (L1이 1GB 단위를 커버하게 됨)
    //    IRGN0/ORGN0 = 01 (Write-Back)
    //    SH0 = 11 (Inner Shareable)
    //    TG0 = 00 (4KB granule)
    //    EPD1 = 1 (TTBR1 워크 자체를 비활성화 — 상위 주소 공간 아직 안 씀)
    //    IPS = 001 (36비트 물리주소, 64GB까지 — QEMU virt 기본 RAM 크기면 충분)
    uint64_t t0sz = 25ULL;
    uint64_t irgn0 = 1ULL << 8;
    uint64_t orgn0 = 1ULL << 10;
    uint64_t sh0 = 3ULL << 12;
    uint64_t tg0 = 0ULL << 14;
    uint64_t epd1 = 1ULL << 23;
    uint64_t ips = 1ULL << 32;

    uint64_t tcr = t0sz | irgn0 | orgn0 | sh0 | tg0 | epd1 | ips;

    __asm__ volatile("msr mair_el1, %0" ::"r"(mair));
    __asm__ volatile("msr tcr_el1, %0" ::"r"(tcr));
    __asm__ volatile("msr ttbr0_el1, %0" ::"r"((uint64_t)l1_page_table));
    __asm__ volatile("isb");

    // 4. TLB 청소 (콜드 부팅이라 원래 비어있어야 정상이지만, 방어적으로)
    __asm__ volatile("tlbi vmalle1");
    __asm__ volatile("dsb sy");
    __asm__ volatile("isb");

    // 5. SCTLR_EL1 읽어서 M(MMU) + C(D-Cache) + I(I-Cache) 비트만 켠다
    uint64_t sctlr;
    __asm__ volatile("mrs %0, sctlr_el1" : "=r"(sctlr));
    sctlr |= (1ULL << 0);  // M  — MMU 활성화, 이 줄이 실제 스위치
    sctlr |= (1ULL << 2);  // C  — 데이터 캐시 활성화
    sctlr |= (1ULL << 12); // I  — 명령어 캐시 활성화

    __asm__ volatile("dsb sy");
    __asm__ volatile("msr sctlr_el1, %0" ::"r"(sctlr));
    __asm__ volatile("isb"); // 이 시점부터 명령어 페치도 MMU를 통과한다

    uart_puts("[MMU] ✅ 가상주소 점화 완료 — 아이덴티티 매핑 2GB (Device 1GB + Normal 1GB)\n");
}
