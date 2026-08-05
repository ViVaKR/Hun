// ====================================================
//  [quicksort.S] 퀵 정렬 & Lomuto 파티션 모듈
// ====================================================
.include "section_macros.inc"

CODE_SECTION

// ----------------------------------------
// long long partition(long long* arr, long long lo, long long hi)
// ----------------------------------------
FUNC_START_FULL partition, 96

	mov x19, x0  // x19 = arr
	mov x20, x1  // x20 = lo
	mov x21, x2  // x21 = hi
    
	// pivot = arr[hi]
	ldr x22, [x19, x21, lsl #3]  // x22 = arr[hi]
    
	sub x23, x20, #1  // x23 = i (lo - 1)
	mov x24, x20      // x24 = j (lo)
    
.L_part_loop:
	cmp  x24, x21
	b.ge .L_part_after_loop  // j >= hi 면 루프 종료
    
	// x1 = arr[j]
	ldr  x1, [x19, x24, lsl #3]
	cmp  x1, x22
	b.gt .L_part_continue        // arr[j] > pivot 이면 스킵
    
	// arr[j] <= pivot -> i++ 하고 swap(arr[i], arr[j])
	add x23, x23, #1
  
	// 안전하게 직접 인덱스 기반으로 교환 (메모리 오버플로우 방지)
	ldr x4, [x19, x23, lsl #3]  // x4 = arr[i]
	ldr x5, [x19, x24, lsl #3]  // x5 = arr[j]
	str x5, [x19, x23, lsl #3]  // arr[i] = arr[j]
	str x4, [x19, x24, lsl #3]  // arr[j] = arr[i]

.L_part_continue:
	add x24, x24, #1
	b   .L_part_loop

.L_part_after_loop:
	// 피벗을 제자리로: swap(arr[i + 1], arr[hi])
	add x23, x23, #1
  
	ldr x2, [x19, x23, lsl #3]  // x2 = arr[i + 1]
	ldr x3, [x19, x21, lsl #3]  // x3 = arr[hi]
	str x3, [x19, x23, lsl #3]  // arr[i + 1] = arr[hi]
	str x2, [x19, x21, lsl #3]  // arr[hi] = arr[i + 1]
    
	mov x0, x23  // 반환값: 피벗의 최종 위치 (p)
    
FUNC_EXIT_FULL 96

// ----------------------------------------
// void quicksort(long long* arr, long long lo, long long hi)
// ----------------------------------------
FUNC_START_FULL quicksort, 96

	mov x19, x0  // x19 = arr
	mov x20, x1  // x20 = lo
	mov x21, x2  // x21 = hi
    
	// 종료 조건: lo >= hi
	cmp  x20, x21
	b.ge .L_qs_done
    
	// 1. partition(arr, lo, hi)
	mov x0, x19
	mov x1, x20
	mov x2, x21
	bl  _partition
    
	mov x22, x0  // x22 = p (피벗 위치)
    
	// 2. quicksort(arr, lo, p - 1)
	// [안전장치] p - 1 이 lo 보다 작아지면 재귀 스킵! (음수 범위 방지)
	sub  x2, x22, #1
	cmp  x20, x2
	b.gt .L_skip_left
  
	mov x0, x19
	mov x1, x20
	bl  _quicksort

.L_skip_left:
	// 3. quicksort(arr, p + 1, hi)
	// [안전장치] p + 1 이 hi 보다 크면 재귀 스킵!
	add  x1, x22, #1
	cmp  x1, x21
	b.gt .L_qs_done
  
	mov x0, x19
	mov x2, x21
	bl  _quicksort
    
.L_qs_done:

FUNC_EXIT_FULL 96