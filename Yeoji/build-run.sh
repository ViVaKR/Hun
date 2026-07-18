#!/usr/bin/env zsh
set -e

clang --target=aarch64-none-elf -ffreestanding -nostdlib -c boot.S -o boot.o

# kernel.c 다시 컴파일
clang --target=aarch64-none-elf -ffreestanding -nostdlib -c kernel.c -o kernel.o

# 다시 링크
ld.lld -T link.ld boot.o kernel.o -o kernel.elf

# QEMU 재실행
qemu-system-aarch64 -M virt -cpu cortex-a72 -nographic -kernel kernel.elf

# QENU 는 그냥 '프로세스'로 맥위에서 돌아가는 평범한 프로그램 중 하나
# kernel.elf 라는 파일을 읽엇 그 내용을 가상의 ARM64 보드에 부어 넣고 실행하는 것

# 종료 
# `CTRL + A`` 키보드 다 때고, 그다음 `X`

# 재실행 
# ./build-run.sh