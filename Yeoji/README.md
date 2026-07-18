# 여지 (Yeoji)

> 화엄경 십지품의 "여지(如地)" — 대지와 같이, 좋은 것과 나쁜 것을 가리지 않고 모두 품어
> 그 위에 만물이 자라게 하는 바탕. OS라는 존재의 본질과 닮았다고 생각해 이름 지었습니다.

한글 어셈블리 프로젝트 [훈닉스(Hunix)](../Yana)에서 시작된 여정이, macOS 유저스페이스를 벗어나
**OS도 커널도 없는 맨 하드웨어(bare metal) 위**로 처음 발을 뗀 프로젝트입니다.

개발 단계에서는 로마자 표기 `Yeoji`를 사용하고, 완성 단계에서는 한글 이름 `여지`를 그대로
브랜드로 사용할 예정입니다. 버전이 올라가도 이름은 바뀌지 않고, 내부 버전 번호만 갱신합니다.

## 지금 여기까지 (v0.0.1)

- `aarch64-none-elf` 타겟으로 QEMU `virt` 머신 위에 직접 부팅하는 최소 커널
- OS, 부트로더, libc 없이 `_start` → `kernel_main` 까지 순수 어셈블리 + C로 진입
- PL011 UART(`0x09000000`)에 직접 바이트를 써서 화면에 "Hello, World!" 출력 성공

```
==========================================
   Yeoji OS - v0.0.1 (aarch64, baremetal)
==========================================

  Hello, World!
  여지, 안녕!

Booted with no OS beneath us. Just Yeoji and the metal.
```

## 빌드 & 실행

```bash
clang --target=aarch64-none-elf -ffreestanding -nostdlib -c boot.S -o boot.o
clang --target=aarch64-none-elf -ffreestanding -nostdlib -c kernel.c -o kernel.o
ld.lld -T link.ld boot.o kernel.o -o kernel.elf
qemu-system-aarch64 -M virt -cpu cortex-a72 -nographic -kernel kernel.elf
```

`Ctrl+A` 다음 `X` 로 QEMU를 종료할 수 있습니다.

## 구조

```
Yeoji/
├── boot.S      # _start, 스택 설정, kernel_main 호출
├── kernel.c    # UART 드라이버 + kernel_main
├── link.ld     # 링커 스크립트 (QEMU virt 머신 RAM 배치)
└── README.md
```

## 왜 별도 프로젝트인가

> 기존 `Yana/`(훈닉스의 macOS 유저스페이스 실험장)와는 타겟 트리플, 바이너리 포맷,
> 실행 권한 레벨이 전부 다름.

| | Yana | Yeoji |
|---|---|---|
| 타겟 | `arm64-apple-macos` | `aarch64-none-elf` |
| 바이너리 | Mach-O | ELF |
| 실행 환경 | EL0 (유저 권한, libSystem 사용) | EL1 (커널 권한, 하드웨어 직접 제어) |

`Yana`에서 검증한 한글 어셈블리 니모닉 문법(`할당하기`→`mov`, `분기실행`→`bl` 등)이
여물면, 이 커널에 그대로 이식하는 것이 장기 목표입니다.

## 다음 단계 (예정)

- [ ] UART 입력(`uart_getc`) — 키보드 echo
- [ ] `.bss` 섹션 초기화 루프
- [ ] Exception Level / 인터럽트 벡터 테이블
- [ ] 한글 어셈블리 니모닉 커널 이식

---

## QEMU 

> QEMU 가상 머신에 ARM64 어셈블리 커널 코드를 얹어 실제로 구동(부팅)할 때 
> 한 방에 각 잡을 수 있는 초경량 QEMU ARM64 부팅 명령 플래그

```bash
# M1 맥북의 하드웨어 가속(hvf)을 받아 가상 ARM64 환경을 초고속으로 띄우는 신공!
qemu-system-aarch64 \
  -M virt \
  -cpu host \
  -accel hvf \
  -m 1024 \
  -nographic \
  -kernel 무결점_커널_바이너리.bin

# 그래픽 화면까지 QEMU로 직접 띄워 테스트할 때 
# -nographic을 빼고 -display cocoas 같은 맥 전용 옵션을 달아주면 미려한 창이 똭 튀어나옴 
```

---

### 나무아미타불 🙏
