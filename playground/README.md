# Advanced RISC Machine

## Compile

```bash
# 진입점이 `-start` 인경우 링커 옵션 전달
# `-Wl,-e,_start` : 링커 (ld)에 진입점을 _start 로 변경하라는 옵션 (-e _start)을 넘김
clang hello.s -o hello -Wl,-e,_start -nostartfiles

# 진입점이 `_main` 인 경우
clang hello.s -o hello
clang -arch arm64 hello.s -o hello

# `*.s` : assemble `as`, link `ld`
as hello.s -o hello.o
ld hello.o -o hello -l System -syslibroot `xcrun -sdk macosx --show-sdk-path` -e _main -arch arm64
ld hello.o -o hello -l System -syslibroot `xcrun -sdk macosx --show-sdk-path` -e _start -arch arm64

```

## Makefile

```makefile

main: main.o
	ld -o main main.o -lSystem -syslibroot `xcrun -sdk macosx --show-sdk-path` -e _start -arch arm64

main.o: main.s
	as -arch arm64 -o main.o main.s
```

```bash
# 진입점 _start
make helloworld

# 진입점 _main
make helloworld ENTRY=_main

# 
make run-helloworld

# 
make run-helloworld ENTRY=_main

```