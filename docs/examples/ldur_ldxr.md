# LDUR / LDXR 계열 명령어 — Load 명령어군 정리

## Summary

**분류 안내**: `LDUR`과 `LDXR`은 완전히 다른 목적의 명령어군임. `LDUR`은 **주소 지정 방식**(addressing mode)의 특수 형태이고, `LDXR`은 **배타적 접근**(exclusive access)을 위한 동기화 명령어임. 함께 놓치기 쉬운 관련 명령어들도 모두 정리함.

---

## LDUR 

> Load Register Unscaled

**정의**: 오프셋에 **스케일링을 적용하지 않는(unscaled)** 기본 로드 명령어. 일반적인 `LDR`과 기능은 유사하나 오프셋 인코딩 방식이 다름.

### LDR vs LDUR — 오프셋 방식의 차이

**LDR (Scaled, Unsigned Offset)**:
```asm
LDR Xt, [Xn, #imm]
```
- 오프셋이 **접근 크기(access size)의 배수**로 자동 스케일링됨
- 64비트 로드 시 오프셋은 내부적으로 8배수 단위로 해석 (0, 8, 16, 24...)
- 항상 **양수(unsigned)** 오프셋만 가능
- 범위: 0 ~ 32760 (8바이트 단위 × 4095)

**LDUR (Unscaled, Signed Offset)**:
```asm
LDUR Xt, [Xn, #imm]
```
- 오프셋이 스케일링 없이 **바이트 단위 그대로** 적용됨
- **음수(signed) 오프셋 가능**: -256 ~ +255
- 정렬(alignment)되지 않은 임의 바이트 위치 접근 가능

**비교 예시**:
```asm
ldr  x0, [x1, #8]        // x1+8 위치에서 로드 (8의 배수만 가능)
ldur x0, [x1, #3]        // x1+3 위치에서 로드 (임의 바이트 오프셋 가능)
ldur x0, [x1, #-8]        // 음수 오프셋 — LDR로는 불가능, LDUR만 가능
```

**핵심 판단 기준**: 
- 오프셋이 **정렬된 배수값**이면서 **양수** → `LDR` (어셈블러가 자동 선택)
- 오프셋이 **음수**이거나 **정렬되지 않은 값**이면 → `LDUR` 필요

**실전 등장 배경**: 컴파일러가 스택 프레임에서 로컬 변수에 접근할 때, 오프셋이 정렬되지 않거나 음수인 경우가 흔해서 `LDUR`이 자주 등장함:
```asm
stur x0, [x29, #-8]     // 스택 프레임 내 로컬 변수 저장 (음수 오프셋)
ldur x0, [x29, #-8]     // 동일 위치에서 로드
```

---

## LDXR

> Load Exclusive Register

**정의**: **배타적 접근 모니터(exclusive monitor)** 를 설정하며 메모리에서 값을 로드하는 명령어. 이후 `STXR`(Store Exclusive)과 짝을 이루어 **lock-free 동기화**(CAS 유사 패턴)를 구현하는 데 사용됨.

**문법**:
```asm
LDXR Xt, [Xn]
```

**동작**:
1. `[Xn]` 주소의 값을 `Xt`에 로드
2. 해당 주소에 대한 **배타적 모니터를 활성화** (다른 코어가 같은 주소를 건드리면 모니터가 깨짐)

**짝 명령어 STXR과 함께 사용**:
```asm
retry:
    ldxr x0, [x1]           // 값 로드 + 배타적 모니터 설정
    add  x0, x0, #1           // 값 증가 (레지스터 내에서만 수행)
    stxr w2, x0, [x1]          // 배타적 저장 시도, w2에 성공(0)/실패(1) 결과
    cbnz w2, retry              // 실패 시(다른 코어가 끼어듦) 재시도
```

**이전 LSE 명령어 문서와의 연결**: 이 패턴이 바로 `LDADD` 같은 LSE 원자적 명령어가 나오기 전의 **소프트웨어 재시도 루프 방식**임. `LDXR`/`STXR`은 여전히 유효하지만, 단순 산술 연산이라면 `LDADD` 한 줄로 대체 가능함. `LDXR`/`STXR`은 **더 복잡한 조건부 갱신 로직**(단순 산술로 표현 안 되는 경우)에서 여전히 필요함.

---

## 놓치신 관련 명령어 — Exclusive 계열 전체

### LDAXR (Load-Acquire Exclusive)

**정의**: `LDXR`에 **Acquire 메모리 순서**가 추가된 버전.

```asm
LDAXR Xt, [Xn]
```

**차이점**: `LDXR`은 순서 보장이 없는 relaxed 접근이지만, `LDAXR`은 이 로드 이후의 메모리 접근이 이 명령어보다 먼저 실행되지 않도록 보장함 (락 획득 시 필수).

---

### STXR / STLXR (Store Exclusive 계열)

| 니모닉 | 순서 | 용도 |
|---|---|---|
| `STXR` | Relaxed | 배타적 저장, 순서 보장 없음 |
| `STLXR` | Release | 배타적 저장 + Release 순서 (락 해제 시 필수) |

```asm
STXR  Ws, Xt, [Xn]     // Ws = 성공(0)/실패(1) 결과
STLXR Ws, Xt, [Xn]
```

---

### LDAR / STLR (비배타적 Acquire/Release)

**정의**: 배타적 모니터 없이 **순수하게 메모리 순서만 보장**하는 단순 로드/스토어. Exclusive 계열과 혼동하기 쉬우나 재시도 루프 목적이 아님.

```asm
LDAR Xt, [Xn]      // Acquire 로드 (배타성 없음)
STLR Xt, [Xn]        // Release 스토어 (배타성 없음)
```

**용도**: C++ `std::atomic`의 `load(memory_order_acquire)` / `store(memory_order_release)` 구현에 직접 대응됨. 락(lock) 자체가 아니라 단순 원자적 플래그 읽기/쓰기에 사용됨.

---

### LDXP / STXP / LDAXP / STLXP (Pair 버전)

**정의**: 레지스터 **두 개(pair)** 를 동시에 배타적으로 로드/저장하는 확장판. 128비트(16바이트) 단위의 원자적 CAS 구현 등에 사용됨.

```asm
LDXP  Xt1, Xt2, [Xn]        // 두 레지스터에 동시 배타적 로드
STXP  Ws, Xt1, Xt2, [Xn]     // 두 레지스터를 동시 배타적 저장
LDAXP Xt1, Xt2, [Xn]        // Acquire 버전
STLXP Ws, Xt1, Xt2, [Xn]     // Release 버전
```

**실전 활용**: `CASP`(이전 문서에서 언급한 Compare-and-Swap Pair) 이전 시대의 대체 구현 방식, 또는 CASP가 지원되지 않는 상황에서 128비트 CAS를 소프트웨어 루프로 구성할 때 사용됨.

---

## 종합 정리표

| 명령어 | 배타성 | 메모리 순서 | 크기 | 용도 |
|---|---|---|---|---|
| `LDR` | 없음 | 없음 | 단일 레지스터 | 일반 로드 (scaled offset) |
| `LDUR` | 없음 | 없음 | 단일 레지스터 | 일반 로드 (unscaled offset) |
| `LDAR` | 없음 | Acquire | 단일 레지스터 | 원자적 읽기 (동기화 플래그) |
| `LDXR` | 있음 | 없음 | 단일 레지스터 | 배타적 로드 (재시도 루프용) |
| `LDAXR` | 있음 | Acquire | 단일 레지스터 | 배타적 로드 + 락 획득 |
| `LDXP` | 있음 | 없음 | 레지스터 쌍 | 128비트 배타적 로드 |
| `LDAXP` | 있음 | Acquire | 레지스터 쌍 | 128비트 배타적 로드 + 락 획득 |

---

## LDUR과 LDXR을 함께 정리하는 이유 — 실전 코드 리딩 시 혼동 방지

**핵심 구분 포인트**: 
- 이름에 **`U`가 붙으면** → Unscaled offset (주소 지정 방식 차이, 동기화와 무관)
- 이름에 **`X`가 붙으면** → Exclusive (배타적 접근, 락-프리 동기화 목적)
- 이름에 **`A`가 붙으면** → Acquire (메모리 순서 보장)
- 이름에 **`L`이 붙으면** → Release (메모리 순서 보장)

**조합 예시로 이해하기**:
```
LDAXR = LD + A(cquire) + X(clusive) + R(egister)
     = Acquire 순서를 보장하는 배타적 로드
```

이 접두/접미사 조합 규칙을 알면 `LDAPR`, `LDAPUR` 같은 낯선 변형을 마주쳐도 구조적으로 유추 가능함 (`LDAPR` = Load-Acquire RCpc, `LDAPUR` = 그 unscaled 버전 — ARMv8.3 이상에서 추가된 더 세밀한 순서 모델).