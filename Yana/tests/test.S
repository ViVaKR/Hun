.global _test
.align 2

// x0와 x1 두개의 인자를 받아 더 큰 값을 x0에 담아 반환함
_test:
    cmp x0, x1          // x0와 x1 값을 비교 
    csel x0, x0, x1, ge // 만약 x0 >= x1 이면 x0 , 아니면 x1 
    ret                 // x0 을 가지고 함수 반환
