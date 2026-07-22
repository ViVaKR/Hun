# MRS, MSR

## MRS (READ)

- `mrs x0, CurrentEL`
- Move Register from System register
- 시스템 레지스터를 읽어서 x0에 저장

## MSR (SET)

- `msr DAIF, x1`
- Move to System register from register
- x1의 값을 시스템 레지스터에 씀


### 1. 현재 예외 레벨 (Exception Level) 확인 - 부트코드 맨 첫 줄에 거의 항상 등장

>- `QEMU` virt 머신에 커널을 부팅시키면 보통 EL2(하이퍼바이저 레벨)에서 시작하는데, 
>- 커널 자체는 EL1에서 돌아야 하니 이걸 낮춰주는 코드가 boot.S 초반에 꼭 나옵니다.

```asm
mrs x0, CurrentEL       // 현재 CPU가 EL0~EL3 중 어디서 실행 중인지 읽기
lsr x0, x0, #2          // CurrentEL 레지스터는 2번 비트부터 값이 있어서 시프트 필요
cmp x0, #1
b.eq .L_in_el1          // EL1(커널 모드)이면 분기
```

### 2. 인터럽트 마스크(DAIF) 제어

```asm
msr DAIFSet, #0xf       // 모든 인터럽트(Debug, Abort, IRQ, FIQ) 잠그기
msr DAIFClr, #0xf       // 다시 풀기
```

### 3. 스택 포인터 설정(SP_EL1 등)

```asm
msr SPSel, #1           // "각 예외 레벨마다 자기 전용 SP를 쓰겠다" 설정
mov x0, #0x80000
msr SP_EL1, x0          // EL1용 스택 포인터를 직접 세팅 (일반 mov sp로는 못함)
```

### 4. MMU/캐시 켜기 전 시스템 제어 레지스터(SCRLR) 조작

```asm
mrs x0, SCTLR_EL1
orr x0, x0, #1           // MMU enable 비트 켜기
msr SCTLR_EL1, x0
```