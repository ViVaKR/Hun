# MADD / MSUB 계열 — 곱셈-덧셈 결합 명령어군

## Summary

**정의**: 곱셈과 덧셈(또는 뺄셈)을 **한 명령어로 결합**하여 수행하는 FMA(Fused Multiply-Add) 계열 명령어. 특히 `MSUB`는 **나머지(remainder) 연산 구현의 핵심 부품**

---

## MADD 

> Multiply-Add

**정의**: `Xd = Xa + (Xn × Xm)` — 곱셈 결과를 더함.

**문법**:

```asm
MADD Xd, Xn, Xm, Xa
```

**예시**:
```asm
mov x0, #3
mov x1, #4
mov x2, #10

madd x3, x0, x1, x2      // x3 = x2 + (x0 × x1) = 10 + 12 = 22
```

---

## MSUB 

> Multiply-Subtract

**정의**: `Xd = Xa - (Xn × Xm)` — 곱셈 결과를 뺌. **나머지 연산의 핵심 부품**임.

**문법**:
```asm
MSUB Xd, Xn, Xm, Xa
```

**예시**:
```asm
mov x0, #3
mov x1, #4
mov x2, #20

msub x3, x0, x1, x2      // x3 = x2 - (x0 × x1) = 20 - 12 = 8
```

---

## 나머지(Remainder/Modulo) 연산 구현 — 핵심 질문 답변

**중요한 사실**: ARM64에는 **나머지 연산 전용 명령어가 존재하지 않음**. `x % y`를 직접 계산하는 `MOD`류 명령어는 없으며, 대신 **나눗셈 후 MSUB로 역산**하는 2단계 조합으로 구현함.

**수학적 원리**:
```
remainder = dividend - (quotient × divisor)
```

**구현 절차**:
1. `SDIV`(signed) 또는 `UDIV`(unsigned)로 몫(quotient) 계산
2. `MSUB`로 `dividend - (quotient × divisor)` 계산 → 나머지

**예시 — signed 나머지 연산 (`a % b`)**:
```asm
.global _start
.align 2

.text
_start:
    mov x0, #17          // dividend (a)
    mov x1, #5             // divisor (b)

    sdiv x2, x0, x1          // x2 = quotient = 17 / 5 = 3
    msub x3, x2, x1, x0      // x3 = x0 - (x2 × x1) = 17 - (3×5) = 2
    // x3 = 2  (17 % 5 = 2)

    mov x0, #0
    mov x16, #1
    svc #0x80
```

**unsigned 버전 (`UDIV` 사용)**:
```asm
udiv x2, x0, x1          // unsigned 몫
msub x3, x2, x1, x0        // 나머지 계산은 signed/unsigned 동일한 MSUB 사용
```

**핵심 정리**: C언어의 `%` 연산자를 컴파일하면, 어셈블리 레벨에서는 항상 `SDIV`(또는 `UDIV`) + `MSUB` **2줄 조합**으로 변환됨. 이 패턴을 알아두면 디스어셈블된 코드에서 "SDIV 다음에 바로 MSUB가 나오면 이건 나머지 연산이구나"라고 즉시 판단 가능함.

---

## MNEG 

> Multiply-Negate — 별칭

**정의**: `Xd = -(Xn × Xm)` — MSUB에서 `Xa`를 0으로 고정한 형태의 별칭(alias).

```asm
MNEG Xd, Xn, Xm
```

**실체**: `MSUB Xd, Xn, Xm, XZR`와 동일함.

```asm
mov x0, #3
mov x1, #4
mneg x2, x0, x1              // x2 = -(3×4) = -12
```

---

## MUL

> 순수 곱셈 (Accumulate 없는 버전)

**정의**: 덧셈/뺄셈 없이 순수 곱셈만 수행하는 명령어. 사실은 MADD의 별칭임.

```asm
MUL Xd, Xn, Xm
```

**실체**: `MADD Xd, Xn, Xm, XZR`와 동일함 (Xa 자리에 제로 레지스터).

```asm
mov x0, #6
mov x1, #7
mul x2, x0, x1                // x2 = 6 × 7 = 42 (= madd x2, x0, x1, xzr)
```

---

## 관련 명령어 — Long/High Multiply 계열

**배경**: 64비트 × 64비트 곱셈의 진짜 수학적 결과는 최대 **128비트**가 될 수 있음. 하지만 레지스터는 64비트뿐이므로, 결과의 "하위 64비트"와 "상위 64비트"를 따로 계산하는 명령어가 필요함.

### SMULL

### UMULL 

> 32×32 → 64비트 확장 곱셈

**정의**: 32비트 두 값을 곱해 64비트 결과를 정확하게(overflow 없이) 얻는 명령어.

```asm
SMULL Xd, Wn, Wm      // signed: Xd = (int64)Wn × (int64)Wm
UMULL Xd, Wn, Wm      // unsigned: Xd = (uint64)Wn × (uint64)Wm
```

**용도**: 32비트 곱셈에서 오버플로우가 우려될 때, 결과를 64비트로 안전하게 받는 목적.

---

### SMADDL / SMSUBL / UMADDL / UMSUBL

> Long + Accumulate 결합

**정의**: `SMULL`/`UMULL`에 누적(Add/Sub)까지 결합한 버전.

| 니모닉 | 연산 |
|---|---|
| `SMADDL` | `Xd = Xa + (signed)(Wn × Wm)` |
| `SMSUBL` | `Xd = Xa - (signed)(Wn × Wm)` |
| `UMADDL` | `Xd = Xa + (unsigned)(Wn × Wm)` |
| `UMSUBL` | `Xd = Xa - (unsigned)(Wn × Wm)` |

```asm
smaddl x0, w1, w2, x3     // x0 = x3 + (signed 64비트 확장된 w1×w2)
```

**실전 활용**: 32비트 정수 연산이 많은 알고리즘(체크섬, 해시 계산)에서 중간 결과 오버플로우를 방지하면서 누적 계산할 때 사용됨.

---

### SMULH 

### UMULH 

> 128비트 곱셈의 상위 64비트

**정의**: 64비트 × 64비트 곱셈의 진짜 128비트 결과 중 **상위(high) 64비트**만 얻는 명령어.

```asm
SMULH Xd, Xn, Xm      // signed 128비트 곱셈의 상위 64비트
UMULH Xd, Xn, Xm      // unsigned 128비트 곱셈의 상위 64비트
```

**하위 64비트는 어떻게?**: 하위 64비트는 그냥 일반 `MUL`(오버플로우 무시)로 얻으면 됨. 즉, **128비트 곱셈 전체 결과가 필요하면 `MUL`(하위)과 `SMULH`/`UMULH`(상위) 두 개를 함께 사용**해야 함.

```asm
mul   x0, x1, x2         // 128비트 결과의 하위 64비트
umulh x3, x1, x2          // 128비트 결과의 상위 64비트
// {x3:x0}가 완전한 128비트 곱셈 결과
```

**용도**: 128비트 정수 연산, 암호화 알고리즘(RSA, 큰 수 곱셈), 해시 함수 등 정밀한 대수(big number) 연산에서 필수적으로 사용됨.

---

## 종합 정리표

| 니모닉 | 연산 | 비고 |
|---|---|---|
| `MUL` | `Xn × Xm` | MADD의 별칭(Xa=XZR) |
| `MADD` | `Xa + Xn×Xm` | 기본 FMA |
| `MSUB` | `Xa - Xn×Xm` | **나머지 연산의 핵심** |
| `MNEG` | `-(Xn×Xm)` | MSUB의 별칭(Xa=XZR) |
| `SMULL` / `UMULL` | 32×32→64비트 | 확장 곱셈 |
| `SMADDL` / `UMADDL` | 32×32→64비트 + 누적 | 확장 곱셈+덧셈 |
| `SMSUBL` / `UMSUBL` | 32×32→64비트 - 누적 | 확장 곱셈+뺄셈 |
| `SMULH` / `UMULH` | 64×64 결과의 상위64비트 | 128비트 곱셈용 |

---

## 나머지 연산 최종 요약 (핵심 재확인)

```
a % b 를 계산하려면:

SDIV(or UDIV) quotient, a, b     // 몫 계산
MSUB remainder, quotient, b, a    // remainder = a - (quotient × b)
```

**결론**: `MSUB`는 단순히 "곱셈+뺄셈"이라는 범용 명령어이지만, ARM64가 별도의 나머지 연산자를 두지 않은 설계 철학상, **사실상 나머지 연산 구현의 표준 관용구(idiom)** 로 자리잡은 명령어임. 디스어셈블된 코드에서 `SDIV` 바로 다음 줄에 동일 레지스터를 인자로 하는 `MSUB`가 나오면, 이는 거의 100% C언어의 `%` 연산자가 컴파일된 결과라고 판단해도 무방함.