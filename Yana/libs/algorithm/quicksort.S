.include "section_macros.inc"

// [초기화된 변수]
// __DATA,__data
DATA_SECTION
// quicksort_arr:
// 	.quad 3, 1, 7, 9, 5, 2, 6, 4, 8 // 8 byte * 9 = 72 byte
// quicksort_arr_end: // 배열의 끝 라벨

// [읽기전용 변수/포인터 테이블]
// __DATA,__const
CONST_DATA_SECTION

// [읽기전용 상수 데이터]
//__TEXT,__const
CONST_SECTION

// [C-스타일 문자열 리터럴]
// __TEXT,__cstring,cstring_literals
CSTRING_SECTION
fmt_qs: .asciz "%lld"

// [코드 구역]
// __TEXT,__text, regular, pure_instructions
CODE_SECTION
// ----------------------------------------
// long long partition(long long* arr, long long lo, long long hi)
// Lomuto 파티션: arr[hi]를 피벗으로 삼아
// 피벗보다 작거나 같은 값들을 왼쪽으로 몰아넣고
// 최종 피벗 위치(인덱스)를 반환
//
//   x19 = arr
//   x20 = lo
//   x21 = hi
//   x22 = pivot 값
//   x23 = i (작은 값들의 경계 인덱스)
//   x24 = j (스캔 인덱스)
// ----------------------------------------
FUNC_START_FULL partition, 96
	mov x19, x0  // arr
	mov x20, x1  // 0
	mov x21, x2  // 8
    
	// pivot = arr[hi]
	lsl x0, x21, #3
    // hi 인덱스 * 8바이트
	// x21 레지스터
	// 오른쪽 끝 인덱스 값 에 들어있는 숫자를
	// 왼쪽으로 3칸 시프트(Shift) 해서 그결과를 x0 에저장
	// 배열이 .quad (64비트 정수) 타입이므로
	// 원소 하나당 크기가 8바이트 임
	// 특정 인덱스(hi)에 있는
	// 실제 물리적 메모리 위치 (바이트주소) = (인덱스 * 원소의 바이트 크기)
	// x0 = hi * 8  (시작 주소로 부터 몇 바이트 떨어져 있는지 계산법)
    
	ldr x22, [x19, x0]
    // [x19, x0] (베이스주소 + 오프셋) 
    // 위 메모리 주소에 가서 거기에 들어 있는 실제 8바이트 데이터를 읽어(ldr) 
    // x22 레지스터(pivot 변수) 에 저장하라. 
    // x19 : 배열의 시작 주소 (arr 포인터)
    // [x19, x0] - Base plus offset addressing model
    // 시작 주소 + 오프셋을 더해서 
    // arr[hi]가 저장되어 있는 메모리 공간을 가리키게 됨
    
	sub x23, x20, #1  // i = lo - 1
	mov x24, x20      // j = lo
    
.L_part_loop:
	cmp  x24, x21
	b.ge .L_part_after_loop  // j >= hi 면 루프 종료
    
	lsl  x0, x24, #3
	ldr  x1, [x19, x0]     // arr[j]
	cmp  x1, x22
	b.gt .L_part_continue  // arr[j] > pivot 이면 그냥 넘어감
    
	// arr[j] <= pivot  -> i++ 하고 arr[i], arr[j] swap
	add x23, x23, #1
	lsl x2, x23, #3
	add x2, x19, x2   // &arr[i]
	add x3, x19, x0   // &arr[j] (x0 = j * 8)
	ldr x4, [x2]
	ldr x5, [x3]
	str x5, [x2]
	str x4, [x3]

.L_part_continue:
	add x24, x24, #1
	b   .L_part_loop

.L_part_after_loop:
	// 마지막으로 arr[i + 1] <-> arr[hi] swap (피벗을 제자리로)
	add x23, x23, #1  // x23 : 작은 값들의 경계 인덱스
	lsl x0, x23, #3
	add x0, x19, x0   // &arr[i + 1]
	lsl x1, x21, #3
	add x1, x19, x1   // &arr[hi]
	ldr x2, [x0]
	ldr x3, [x1]
	str x3, [x0]
	str x2, [x1]
    
	mov x0, x23  // 반환값: 피벗의 최종 인덱스
    
FUNC_EXIT_FULL 96

// ----------------------------------------
// void quicksort(long long* arr, long long lo, long long hi)
//
//   x19 = arr
//   x20 = lo
//   x21 = hi
//   x22 = p (파티션 결과 인덱스, 재귀 호출 사이에 보존 필요)
FUNC_START_FULL quicksort, 96
	mov x19, x0
	mov x20, x1
	mov x21, x2
    
	cmp  x20, x21
	b.ge .L_qs_done  // lo >= hi 면 정렬할 게 없음 (원소 0 ~ 1개)
    
	mov x0, x19
	mov x1, x20
	mov x2, x21
	bl  _partition
    
	mov x22, x0  // p = partition(...)
    
	// quicksort(arr, lo, p-1)
	mov x0, x19
	mov x1, x20
	sub x2, x22, #1
	bl  _quicksort
    
	// quicksort(arr, p+1, hi)
	mov x0, x19
	add x1, x22, #1
	mov x2, x21
	bl  _quicksort
    
.L_qs_done:
FUNC_EXIT_FULL 96