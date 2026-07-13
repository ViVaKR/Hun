# 한글 명령어 세트 매크로

```asm

// [1. 데이터 및 사칙연산]

// mov
.macro 할당 레지스터, 값
    mov \레지스터, \값
.endm

// add
.macro 더하기 결과, 원본, 값
    add \결과, \원본, \값
.endm

// sub
.macro 빼기 결과, 원본, 값
    sub \결과, \원본, \값
.endm

// mul
.macro 곱하기 결과, 값1, 값2
    mul \결과, \값1, \값2
.endm

// sdiv
.macro 나누기 결과, 값1, 값2
    sdiv \결과, \값1, \값2
.endm

// cmp
.macro 비교 값1, 값2
    cmp \값1, \값2
.endm

// Branch : 아무조건 없이 지정한 라벨로 무조건 점프
.macro 분기 레이블
    b \레이블
.endm

// Branch Equal : 결과가 같으면 점프
.macro 같으면분기 레이블
    b.eq \레이블
.endm

// Branch Not Equeal : 결과가 같지 않으면 점프
.macro 다르면분기 레이블
    b.ne \레이블
.endm

// Branch with Link : 해당 함수로 점프 하면서 원래 내 고향
// 돌아올 주소를 lr (Link Register, x30) 에 자동 저장
.macro 부르기 레이블
    bl \레이블
.endm

// Return
// lr 레지스터에 적힌 주소로 점프하여 나를 호출 했던 원래 함수(또는 OS) 로 돌아감
.macro 복귀
    ret
.endm

// --- [3. 메모리 및 스택 복합 제어] ---

// Load Register
// 메모리에 있는 값을 레지스터로 가져옮
.macro 담기 레지스터, 주소
    ldr \레지스터, \주소
.endm

// Store Register
.macro 묻기 레지스터, 주소
    str \레지스터, \주소
.endm

// Store Pair (M1 Push)
.macro 쌍묻기 레1, 레2, 주소
    stp \레1, \레2, \주소
.endm

// Load Pair (M1 Pop)
.macro 쌍담기 레1, 레2, 주소
    ldp \레1, \레2, \주소
.endm

.macro 그리고 결과, 값1, 값2
    and \결과, \값1, \값2
.endm
.macro 또는 결과, 값1, 값2
    orr \결과, \값1, \값2
.endm
.macro 비트밀기 결과, 원본, 횟수
    lsl \결과, \원본, \횟수
.endm
.macro 주소찾기 레지스터, 레이블
    adrp \레지스터, \레이블@PAGE
    add \레지스터, \레지스터, \레이블@PAGEOFF
.endm

```
