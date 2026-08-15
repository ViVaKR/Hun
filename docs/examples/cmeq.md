# CMEQ

## top

## 사용목적

`CMEQ` 같은 SIMD 비교 명령어는 "여러 데이터를 한 번에 비교해서 마스크를 만드는" 용도로 쓰임.

## 1. 조건부 선택 (Branchless Select)

분기(if문) 없이 조건에 따라 값을 선택할 때 씁니다. 분기 예측 실패(branch misprediction)를 피할 수 있어서 성능에 유리해요.

```c
// result = (a == b) ? x : y;  를 분기 없이 처리
uint32x4_t mask = vceqq_s32(a, b);      // CMEQ
int32x4_t result = vbslq_s32(mask, x, y); // BSL로 마스크 기반 선택
```

## 2. 문자열/메모리 검색 (memchr, strlen 등)

표준 라이브러리의 `strlen`, `memchr`, `strchr` 같은 함수들이 내부적으로 NEON을 써서 16바이트씩 한꺼번에 비교합니다.

```c
// 16바이트 청크에서 특정 문자(예: '\0')를 찾기
uint8x16_t chunk = vld1q_u8(ptr);
uint8x16_t zero_mask = vceqq_u8(chunk, vdupq_n_u8(0));
// zero_mask에서 0xFF인 위치가 곧 '\0' 위치
```

## 3. 필터링 / 조건 카운팅

배열에서 특정 조건을 만족하는 원소를 찾거나 개수를 셀 때 (DB 쿼리 필터, 이미지 마스킹 등).

```c
// 배열에서 특정 값과 같은 원소가 몇 개인지 빠르게 카운트
uint32x4_t eq = vceqq_s32(data, vdupq_n_s32(target));
```

## 4. 이미지/오디오 처리 (마스크 기반 픽셀 연산)

예: 크로마키(초록 배경 제거), 특정 색상 영역만 골라서 처리 등.

## 5. 정렬 알고리즘 / 비교 기반 최적화

SIMD 정렬(bitonic sort 등)에서 여러 원소를 동시에 비교해 교환 여부를 결정.

## 6. 해시맵/DB 엔진 (SIMD 기반 lookup)

Google의 SwissTable, Abseil, 그리고 여러 최신 DB 엔진들이 해시 버킷 매칭에 `CMEQ` 계열 명령어를 활용해서 룩업 속도를 크게 높입니다.

---

핵심은 **"if를 반복문 안에서 계속 도는 대신, 한 번에 여러 개 비교해서 마스크로 처리한다"**는 겁니다. 이렇게 하면 분기 오버헤드도 없고, 데이터 병렬성 덕분에 처리량이 훨씬 좋아져요.

---
