# AESE, AESD, AESMC, AESIMC - AES 암호화 명령어 (Cryptographic Extension)

## Summary

**전제 조건**: ARMv8 Cryptographic Extension을 지원하는 CPU에서만 동작함. Apple Silicon(M시리즈)은 기본 지원함. NEON/SIMD 레지스터(V레지스터)를 사용하는 벡터 명령어임.

---

## 명령어 쌍 구조

**정확히 쌍으로 존재함.** AES 관련 명령어는 다음 4개로 구성됨:

| 니모닉 | 기능 |
|---|---|
| `AESE` | AES 단일 라운드 **암호화** (Encrypt) |
| `AESD` | AES 단일 라운드 **복호화** (Decrypt) |
| `AESMC` | AES Mix Columns (암호화용 열 혼합) |
| `AESIMC` | AES Inverse Mix Columns (복호화용 역열 혼합) |

**핵심 구조**: AES는 여러 라운드로 구성된 알고리즘이므로, 이 명령어들은 "AES 전체"를 한 번에 처리하는 게 아니라 **AES 알고리즘의 한 단계(라운드)** 만 처리함. 실제 AES-128/192/256 암호화를 완성하려면 이 명령어들을 여러 번 반복 호출하고 라운드 키를 매번 XOR해야 함.

---

## AESE (AES Single Round Encryption)

**문법**:
```asm
AESE Vd.16B, Vn.16B
```

**동작**:
1. `Vd` (현재 상태, State)와 `Vn` (라운드 키, RoundKey)를 XOR
2. SubBytes 단계 수행 (S-box 치환)
3. ShiftRows 단계 수행

**주의**: AESE 자체는 MixColumns를 포함하지 않음. MixColumns는 별도로 `AESMC` 호출해야 함.

---

## AESD (AES Single Round Decryption)

**문법**:
```asm
AESD Vd.16B, Vn.16B
```

**동작**:
1. `Vd`와 `Vn`을 XOR
2. Inverse ShiftRows 단계 수행
3. Inverse SubBytes 단계 수행

**AESE와의 관계**: 암호화의 역순 연산을 수행하는 대응 명령어. 복호화 알고리즘은 암호화의 각 단계를 역순·역연산으로 적용하는 구조이므로, AESD는 AESE의 정확한 대칭 쌍으로 설계됨.

---

## AESMC / AESIMC (Mix Columns 쌍)

| 니모닉 | 문법 | 용도 |
|---|---|---|
| `AESMC` | `AESMC Vd.16B, Vn.16B` | 암호화 라운드의 MixColumns 단계 |
| `AESIMC` | `AESIMC Vd.16B, Vn.16B` | 복호화 라운드의 InverseMixColumns 단계 |

**분리 이유**: AESE/AESD와 AESMC/AESIMC가 별도 명령어로 분리된 이유는, AES의 **마지막 라운드에는 MixColumns 단계가 없기 때문**임. 하드웨어 설계 시 유연성을 위해 분리해둔 구조임.

---

## 실전 사용 패턴 (1라운드 예시)

**암호화 라운드 예시**:
```asm
.text
_start:
    // v0 = 현재 state, v1 = round key
    ld1 {v0.16b}, [x0]      // state 로드
    ld1 {v1.16b}, [x1]      // round key 로드

    aese v0.16b, v1.16b      // SubBytes + ShiftRows (+ XOR roundkey)
    aesmc v0.16b, v0.16b      // MixColumns

    // 다음 라운드 키로 반복...
```

**복호화 라운드 예시**:
```asm
    aesd v0.16b, v1.16b      // Inverse ShiftRows + Inverse SubBytes (+ XOR roundkey)
    aesimc v0.16b, v0.16b     // Inverse MixColumns
```

---

## 왜 자주 안 보이는가

**이유**: 
- 일반 애플리케이션 코드에서는 컴파일러가 자동 생성하지 않음 (수동 최적화나 암호화 라이브러리 내부 구현에서만 등장)
- OpenSSL, LibreSSL, CommonCrypto 같은 저수준 암호화 라이브러리의 AES 구현부에서 성능 최적화 목적으로 사용됨
- 일반 유저 프로그램 어셈블리 분석 시에는 거의 마주치지 않고, 암호화 라이브러리 자체를 리버싱하거나 하드웨어 가속 AES 구현을 직접 작성할 때만 등장함

---

## 정리 대응표

| 암호화 계열 | 복호화 계열 |
|---|---|
| AESE (SubBytes+ShiftRows) | AESD (InvSubBytes+InvShiftRows) |
| AESMC (MixColumns) | AESIMC (InvMixColumns) |

두 계열은 완벽한 대칭 구조로 설계되어 있으며, 실제 AES-128 기준 10라운드(AES-256은 14라운드)를 반복하며 각 라운드마다 라운드 키를 갱신해 적용하는 방식으로 완전한 암복호화를 구성함.