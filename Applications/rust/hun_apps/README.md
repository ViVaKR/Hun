# Rust 


```bash

cargo new --lib hun_macro

# 1. 카고의 의존성 업그레이드 전용 확장 도구 설치 (최초 1회)
cargo install cargo-edit

# 2. 메이저 버전까지 싹 다 최신으로 갱신!
cargo upgrade

```

## 데이터 타입

러스트 는 정적 타입 언어
모든 변수의 타입은 컴파일 시점에 반드시 정해져 있어야 함.

스칼라 타입 : 하나의 값을 표현 함.
정수, 부동소수점, 부울린, 문자 등 네 가지 스칼라 타입을 갖고 있음.
arch : 아키텍처 에 따라 64bit -> 64bit, 32bit -> 32bit
hex: 0xff
octal: 0o77
binary: 0b1111_0000
byte(u8 only): b'A'

    integer overflow -> panic (오류가 발생하면서 프로그램이 종료되는 경우)
    오버플로우 발생 : 2의 보수 감싸기 (two's complement wrapping)
    해당 타입이 가질 수 있는 최댓값보다 더 큰 값은 허용되는 최솟값으로 돌아 감 (wrap around)
    u8 의 경우 256 -> 0, 257 -> 1
    감싸기 동작은 에러로 간주됨

    wrappint-add , wrappint_* 감싸기 동작
    checked_* : 오버플로우 -> None
    overflowing_* : 값과 함께 부울린 값 반환
    saturtion_* : 최대 혹은 최솟값 사이로 제한

    부동 소수점 : 기본 타입 은 f64, 비슷한 속도를 내면서도 더 정밀하기 때문
    f32 : 1 배수 정밀도 single-precision
    f64 : 2 배수 정밀도 double-precision
    
    bool : 1byte
    char : 4바이트, 유니코드 스칼라 값을 표현, U+0000 ~ U+D7EE, U+E000 ~ U+10FFFF
    
### 복합타입, Compound type

- 튜플 tuple : 다양한 타입의 여러 값을 묶어 하나의 복합 타입으로 만드는 일반적인 방법 

```rust
let tup: (i32, f64, u8) =(500, 6.4, 1);

let (x, y, z) = tup;

```

배열 array : 