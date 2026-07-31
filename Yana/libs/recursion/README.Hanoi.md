
```C
hanoi(n, from, to, via):
    if n <= 0: return
    hanoi(n-1, from, via, to)   // ① 왼쪽 절반
    이동 출력(n, from, to)       // ② 지금 층 옮기기
    hanoi(n-1, via, to, from)   // ③ 오른쪽 절반
```