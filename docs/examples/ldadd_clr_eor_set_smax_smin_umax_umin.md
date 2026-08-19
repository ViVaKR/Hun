---
layout: default
---

# LDADD, LDCLR, LDEOR, LDSET
# LDSMAX, LDSMIN, LDUMAX, LDUMIN

> 원자적 메모리 연산 명령어 (Atomic Memory Operations, ARMv8.1-LSE)

## Summary

**전제**: 이 명령어군은 ARMv8.1 **LSE(Large System Extensions)** 확장에서 추가됨. Apple Silicon(M시리즈)은 기본 지원함. 멀티코어 환경에서 **read-modify-write를 하드웨어 레벨에서 원자적(atomic)으로 수행**하여, 락(lock) 없이도 스레드 세이프한 카운터·플래그 연산을 가능케 하는 명령어군임.

---

## 왜 "원자적"인가 — 기존 방식과의 비교

**LSE 이전 방식 (ARMv8.0)**: `LDXR`/`STXR` (Load-Exclusive / Store-Exclusive) 조합으로 소프트웨어 레벨 재시도 루프를 구성해야 했음:

```asm
retry:
    ldxr x0, [x1]          // 배타적 로드
    add  x0, x0, x2          // 값 증가
    stxr w3, x0, [x1]         // 배타적 저장 시도
    cbnz w3, retry             // 실패 시(경쟁 발생) 재시도
```

**LSE 방식**: 단 한 줄로 동일한 연산이 하드웨어 수준에서 원자적으로 처리됨:
```asm
ldadd x2, x0, [x1]     // [x1]의 값에 x2를 원자적으로 더하고, 이전 값을 x0에 반환
```

**핵심 차이**: 재시도 루프가 사라지므로 **경쟁(contention)이 심한 멀티코어 환경에서 성능이 크게 향상**됨. 이 때문에 최신 컴파일러는 C++ `std::atomic`이나 Objective-C `@synchronized`, 참조 카운팅(retain/release) 구현 시 LSE 명령어를 적극 활용함.

---

## 명령어 그룹 전체 구조

**핵심 패턴**: 연산 종류(ADD, CLR, EOR, SET, SMAX, SMIN, UMAX, UMIN)마다 **메모리 순서(ordering) 접미사**가 조합되어 여러 변형이 존재함.

### 연산 종류

| 니모닉 | 연산 | 의미 |
|---|---|---|
| `LDADD` | `[addr] += Xs` | 덧셈 |
| `LDCLR` | `[addr] &= ~Xs` | 비트 클리어 (AND NOT) |
| `LDEOR` | `[addr] ^= Xs` | 배타적 OR (XOR) |
| `LDSET` | `[addr] \|= Xs` | 비트 셋 (OR) |
| `LDSMAX` | `[addr] = max(signed)` | 부호 있는 최댓값 |
| `LDSMIN` | `[addr] = min(signed)` | 부호 있는 최솟값 |
| `LDUMAX` | `[addr] = max(unsigned)` | 부호 없는 최댓값 |
| `LDUMIN` | `[addr] = min(unsigned)` | 부호 없는 최솟값 |

**질문에서 빠진 부분 보충**: `LDUMAX`, `LDUMIN` (부호 없는 max/min 쌍)이 목록에서 누락되어 있어 추가함. `LDSMAX`/`LDSMIN`(signed)과 정확히 대칭되는 unsigned 버전임.

---

## 공통 문법

```asm
LD{op}{order} Xs, Xt, [Xn]
```

- `Xs`: 연산에 사용할 소스 값 (더할 값, 마스크 값 등)
- `Xt`: **연산 전(이전) 메모리 값**이 저장되는 목적 레지스터
- `Xn`: 메모리 주소가 담긴 레지스터

**중요한 특징**: `Xt`에는 **연산 후 결과가 아니라 연산 전 원래 값**이 저장됨. 이는 원자적 read-modify-write의 "read" 결과를 보존하기 위함임 (예: 기존 카운터 값을 알아야 하는 로직에 유용).

---

## 메모리 순서(Ordering) 접미사 — 자주 헷갈리는 부분

**핵심**: 각 연산에는 **4가지 메모리 순서 변형**이 존재함. 접미사가 없는 기본형과 A/L/AL이 붙는 형태로 구분됨.

| 접미사 | 의미 | 메모리 배리어 강도 |
|---|---|---|
| (없음) | Relaxed | 순서 보장 없음 (가장 빠름) |
| `A` | Acquire | 이후 메모리 접근이 이 연산보다 먼저 실행되지 않도록 보장 |
| `L` | Release | 이전 메모리 접근이 이 연산보다 늦게 실행되지 않도록 보장 |
| `AL` | Acquire-Release | 양쪽 모두 보장 (가장 강력, 가장 느림) |

**예시 (LDADD 기준 전체 변형)**:
```asm
ldadd   x2, x0, [x1]     // Relaxed
ldadda  x2, x0, [x1]     // Acquire
ldaddl  x2, x0, [x1]     // Release
ldaddal x2, x0, [x1]     // Acquire-Release
```

**동일한 패턴이 모든 연산에 적용됨**:
```
LDCLR  → LDCLR, LDCLRA, LDCLRL, LDCLRAL
LDEOR  → LDEOR, LDEORA, LDEORL, LDEORAL
LDSET  → LDSET, LDSETA, LDSETL, LDSETAL
LDSMAX → LDSMAX, LDSMAXA, LDSMAXL, LDSMAXAL
...
```

**선택 기준**: 락(lock) 구현이나 동기화 프리미티브에는 `AL`(가장 안전)을, 단순 통계 카운터처럼 순서가 중요하지 않은 경우에는 기본형(Relaxed, 가장 빠름)을 사용하는 것이 일반적임.

---

## 예제 코드 — 원자적 카운터 증가

```asm
.global _start
.align 2

.data
counter: .quad 0

.text
_start:
    adrp x1, counter@PAGE
    add  x1, x1, counter@PAGEOFF   // x1 = counter 주소

    mov x2, #1                        // 증가시킬 값

    ldadd x2, x0, [x1]                 // [counter] += 1, 이전 값을 x0에 저장
    // 이 시점에서 x0 = 증가 전 값, [counter] = 증가된 값

    mov x0, #0
    mov x16, #1
    svc #0x80
```

**멀티스레드 환경 활용**: 여러 스레드가 동시에 `ldadd x2, x0, [x1]`을 호출해도, 각 스레드는 서로 다른 "증가 전 값"을 반환받으며 최종 카운터 값은 항상 정확함 — 락(mutex) 없이도 스레드 세이프함이 하드웨어 레벨에서 보장됨.

---

## 파생 니모닉 — STADD 등 (결과값 불필요 시)

**패턴**: `Xt` 자리에 `XZR`(제로 레지스터)을 사용하면, 어셈블러가 자동으로 더 짧은 별칭(alias)인 `ST{op}` 형태로 표시함.

```asm
ldadd x2, xzr, [x1]     // 이전 값을 버림
// 위와 동일한 의미:
stadd x2, [x1]             // "저장만 하고 이전 값은 필요 없음"을 명시적으로 표현
```

**대응표**:

| LD 형태 (Xt=XZR) | ST 별칭 |
|---|---|
| `LDADD Xs, XZR, [Xn]` | `STADD Xs, [Xn]` |
| `LDCLR Xs, XZR, [Xn]` | `STCLR Xs, [Xn]` |
| `LDEOR Xs, XZR, [Xn]` | `STEOR Xs, [Xn]` |
| `LDSET Xs, XZR, [Xn]` | `STSET Xs, [Xn]` |

**용도**: 단순히 값을 원자적으로 갱신하기만 하고 이전 값이 필요 없는 경우(예: 로깅 카운터, 통계 누적) 코드 가독성 향상 목적으로 사용됨.

---

## 관련 원자적 명령어 — 함께 알아두면 좋은 것들

범위(LD류 범위)는 아니지만 같은 LSE 계열이라 실전에서 자주 짝지어 등장하는 명령어들임:

| 니모닉 | 기능 |
|---|---|
| `SWP` | 원자적 값 교체 (Swap) — `[addr] = Xs`, 이전 값을 `Xt`에 반환 |
| `CAS` | Compare and Swap — 조건부 원자적 교체, 락(lock) 구현의 핵심 |
| `CASP` | Compare and Swap Pair — 두 레지스터 쌍 단위 CAS |

**CAS 간단 예시** (락 구현 패턴):
```asm
mov x0, #0            // 예상 값(expected) = 0
mov x1, #1            // 새 값(new) = 1
cas x0, x1, [x2]       // [x2]가 0이면 1로 교체, 아니면 x0에 실제 현재값 반환
```

---

## 종합 정리표

| 연산 | 부호 있는(Signed) | 부호 없는(Unsigned) |
|---|---|---|
| 최댓값 | `LDSMAX` | `LDUMAX` |
| 최솟값 | `LDSMIN` | `LDUMIN` |

| 연산 계열 | 비트/산술 |
|---|---|
| `LDADD` | 덧셈 |
| `LDCLR` | AND NOT |
| `LDEOR` | XOR |
| `LDSET` | OR |

**최종 결론**: 이 명령어군의 핵심은 "연산 종류(8가지) × 메모리 순서(4가지) = 32가지 조합"으로 구성된 체계적 패밀리라는 점임. 실전에서는 멀티스레드 프로그램의 원자적 카운터, 스핀락, 참조 카운팅(ARC의 retain/release) 구현부에서 컴파일러가 자동 생성하는 형태로 가장 자주 관찰됨.