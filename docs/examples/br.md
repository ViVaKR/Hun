# BR 명령어 (Branch to Register)

## Summary

**정의**: 레지스터에 담긴 주소로 **무조건 분기**하되, **복귀 주소를 저장하지 않는(Link 없음)** 명령어. 즉, `B`(라벨 분기)의 레지스터 버전이자, `BLR`에서 "Link" 기능만 뺀 형태.

---

## 문법

```asm
BR Xn
```

- `Xn`: 분기할 목표 주소가 담긴 레지스터

**동작**: `PC = Xn` — 그 이상도 이하도 아님. LR(X30)은 전혀 건드리지 않음.

---

## 왜 처음 보셨을 가능성이 높은가

**핵심 이유**: `BR`은 "함수를 호출"하는 상황에서는 거의 쓰이지 않음. 함수 호출은 반드시 복귀해야 하므로 `BL`/`BLR`(Link 있음)이 필요하지만, `BR`은 **"돌아올 필요가 없는 분기"** 전용이기 때문에 일반적인 함수 호출 코드에서는 자연스럽게 등장하지 않음.

---

## B / BL / BLR / BR 종합 비교 — 이전 문서와 연결

| 니모닉 | Link(복귀주소 저장) | 목표 지정 | 복귀 전제 |
|---|---|---|---|
| `B` | 안 함 | 라벨 | 안 함 (단순 분기) |
| `BL` | 함 | 라벨 | 함 (함수 호출) |
| `BLR` | 함 | 레지스터 | 함 (동적 함수 호출) |
| `BR` | **안 함** | 레지스터 | **안 함** (동적 무조건 분기) |

**직관적 정리**: `BR`은 `B`의 관계가 `BLR`이 `BL`과 갖는 관계와 동일함 — "목표 주소를 라벨이 아니라 레지스터로 지정한다"는 점만 다름. `B`처럼 돌아올 생각이 없는 분기이되, 목표가 컴파일 시점에 고정되지 않고 런타임에 결정되는 상황에서 사용됨.

---

## 실전 활용 1 — Switch/Jump Table (분기 테이블)

**가장 대표적인 용도**: C언어의 `switch`문이 케이스가 많을 때, 컴파일러가 **점프 테이블(jump table)** 방식으로 최적화하며 이때 `BR`이 등장함.

```c
// C 코드
switch (x) {
    case 0: /* ... */ break;
    case 1: /* ... */ break;
    case 2: /* ... */ break;
    // ...
}
```

```asm
    // x0 = switch 변수 값
    adrp x1, jump_table@PAGE
    add  x1, x1, jump_table@PAGEOFF   // 테이블 베이스 주소

    ldr  x2, [x1, x0, lsl #3]           // x0번째 항목(8바이트 주소값) 로드
    br   x2                              // 해당 case 코드로 무조건 분기 (복귀 없음)

case_0:
    // case 0 처리
    b end_switch

case_1:
    // case 1 처리
    b end_switch

case_2:
    // case 2 처리
    b end_switch

end_switch:
    // switch 이후 코드

jump_table:
    .quad case_0
    .quad case_1
    .quad case_2
```

**핵심 포인트**: `switch`문 자체는 함수 호출이 아니므로 복귀 주소를 저장할 필요가 없음 — 그래서 `BLR`이 아니라 `BR`이 정확히 맞는 선택임.

---

## 실전 활용 2 — Tail Call (꼬리 호출) 최적화

**정의**: 함수 A의 마지막 동작이 함수 B를 호출하고 그 결과를 그대로 반환하는 경우, 컴파일러는 A의 스택 프레임을 정리한 뒤 B로 **점프**(호출이 아니라)하는 방식으로 최적화함.

```c
// C 코드
int wrapper(int x) {
    return actual_function(x);   // 마지막 동작이 바로 반환
}
```

**최적화 없는 버전 (BL 사용, 비효율적)**:
```asm
wrapper:
    stp x29, x30, [sp, #-16]!
    bl  actual_function            // 호출 (LR 저장됨)
    ldp x29, x30, [sp], #16
    ret                             // wrapper의 복귀
```

**Tail call 최적화 버전 (BR 또는 B 사용)**:
```asm
wrapper:
    // 스택 프레임 정리 불필요(애초에 안 만들었다면)
    adrp x1, actual_function@PAGE
    add  x1, x1, actual_function@PAGEOFF
    br   x1                            // actual_function으로 그냥 점프
    // actual_function이 ret 하면 wrapper의 호출자에게 바로 복귀됨
```

**동작 원리**: `wrapper`는 자기 자신의 LR을 그대로 유지한 채 `actual_function`으로 넘어가고, `actual_function`이 `ret`하면 곧바로 `wrapper`를 호출했던 원래 호출자에게 복귀함 — 중간 단계(wrapper로의 복귀)가 완전히 생략되어 스택 사용량과 명령어 수가 줄어듦.

---

## 놓치신 관련 명령어 — RET와의 관계

**흥미로운 사실**: `RET`도 개념적으로는 `BR`의 특수한 형태에 가까움.

```asm
RET          // = BR X30 (LR로 분기, 오퍼랜드 생략 시 기본값이 X30)
RET Xn       // 명시적으로 다른 레지스터로 분기하는 것도 가능(드묾)
```

**차이**: `RET`은 프로세서에게 "이것은 함수 복귀다"라는 **힌트(hint)** 를 제공함. 최신 CPU는 이 힌트를 이용해 **Return Address Predictor(복귀 주소 예측기)** 를 활용한 분기 예측 최적화를 수행함. 반면 `BR`은 이런 힌트 없이 순수하게 "레지스터로 분기"만 의미하므로, 프로세서 입장에서는 예측하기 더 어려운 일반 간접 분기(indirect branch)로 취급됨.

**실전 함의**: 함수에서 복귀할 때는 반드시 `RET`을 써야 하며(설령 `BR X30`과 기능적으로 동일해 보여도), 컴파일러는 절대 이 상황에 `BR`을 대신 쓰지 않음 — 분기 예측 성능 차이가 실제로 크기 때문임.

---

## Apple Silicon 맥락 — 포인터 인증(PAC)과의 연결

**참고 사항**: Apple Silicon은 보안 강화를 위해 **포인터 인증(Pointer Authentication, PAC)** 기능을 지원하며, 이와 관련된 `BR`의 인증 버전이 존재함.

| 명령어 | 의미 |
|---|---|
| `BRAA` | Branch Register, Authenticate with key A |
| `BRAB` | Branch Register, Authenticate with key B |
| `BRAAZ` / `BRABZ` | 위와 동일하나 modifier가 0으로 고정된 버전 |

**개념**: 함수 포인터나 vtable 항목이 변조(공격)되지 않았는지 암호학적으로 검증한 후에만 분기를 수행하는 보안 강화 버전. iOS/macOS의 return-oriented programming(ROP) 공격 방어 메커니즘의 일부로, 실제 컴파일된 바이너리(특히 Objective-C/Swift의 동적 디스패치 코드)에서 순수 `BR` 대신 `BRAA`/`BRAB` 형태가 자주 관찰됨.

```asm
// 개념적 예시 (실제 modifier 레지스터 사용법은 더 복잡함)
braa x0, x1     // x0 주소를 x1을 modifier로 인증한 후 분기
```

**결론적으로**: 최신 Apple Silicon 바이너리를 직접 리버싱하다 보면, 교과서적인 순수 `BR`보다 이 PAC 인증 버전들을 더 자주 마주치게 될 가능성이 높음 — 이는 Apple의 보안 강화 정책이 반영된 결과임.

---

## 종합 정리

| 상황 | 사용 명령어 |
|---|---|
| 정적 함수 호출 | `BL` |
| 동적 함수 호출(함수포인터, vtable) | `BLR` (또는 PAC 버전 `BLRAA`/`BLRAB`) |
| Switch/점프 테이블 | `BR` |
| Tail call 최적화 | `BR` (또는 단순 `B`) |
| 함수에서 복귀 | `RET` (개념상 `BR X30`이지만 반드시 RET 힌트 사용) |
| 보안 강화된 동적 분기(Apple Silicon) | `BRAA`/`BRAB` 등 PAC 버전 |

**최종 결론**: `BR`이 낯설게 느껴지는 것은 지극히 정상적인 관찰임. 일반적인 함수 호출 흐름에서는 항상 "복귀"가 전제되므로 `BL`/`BLR`이 압도적으로 많이 쓰이고, `BR`은 "복귀할 필요가 없는 특수한 분기 상황"(switch문, tail call)에서만 선택적으로 등장하는 명령어이기 때문임.