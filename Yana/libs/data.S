.include "section_macros.inc"

// --------------------------------------------------
// [초기화된 변수] __DATA,__data
// 실행 중 읽고 쓰기가 가능한 순수 전역/정적 변수 배열 공간
// --------------------------------------------------
DATA_SECTION

.global _user_input, _quicksort_arr, _quicksort_arr_end
.global _huge_data, _huge_data_end, _list_data, _list_data_end
.global _madd_array

_user_input: .quad 0
_madd_array: .quad 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

_quicksort_arr: 
	.quad 3, 1, 7, 9, 5, 2, 6, 4, 8 // 8 byte * 9 = 72 byte
_quicksort_arr_end: // 배열의 끝 라벨

// 64비트 실수형(Double) 배열 공간 (8바이트 정렬)
_huge_data: .double 150.5, -23.45, 3.141592, 150.5, -23.45
_huge_data_end:

// 32비트 정수형(int) 배열 공간 (4바이트 정렬)
.align 2
_list_data: .int 1, 2, 3, 4, 5, 6, 7, 8, 9
_list_data_end:


// --------------------------------
// [0으로 초기화된 변수] __DATA,__bss
// --------------------------------
BSS_SECTION
.global _short_count, _target_distance, _current_callback
.global _input_buffer, _input_buffer_end

// 예시 1 32비트(4바이트) 정수형 카운터 변수 공간 확보
// C언어 대응: int shoot_count = 0;
_shoot_count: .space 4 // 4바이트 크기 공간 확보 (실행 시 0으로 채워짐)

// 예시 2) 64비트(8바이트) 정밀 실수형 변수 공간 확보
// C언어 대응: double target_distance = 0.0;
_target_distance: .space 8 // 8바이트 크기 공간 확보

// 예시 3) 포인터 주소를 임시 저장할 64비트(8바이트) 공간 확보
// C언어 대응: void* current_callback = NULL;
_current_callback: .space 8 // ARM64 주소값은 무조건 8바이트!

// 예시 4) 사용자 입력이나 데이터를 임시로 담을 1024바이트 버퍼 대용량 공간
// C언어 대응: char input_buffer[1024] = {0,};
// 대용량 버퍼는 8바이트 정렬해두면 CPU가 읽을 때 아주 쾌적함!
_input_buffer: .space 1024 // 1024바이트(1KB) 통 크게 확보!
_input_buffer_end: