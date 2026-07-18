#!/usr/bin/env zsh
set -e

# section_macros.inc 경로 주입(-I.)을 곁들여 어셈블리 파일들 컴파일
clang --target=aarch64-none-elf -ffreestanding -nostdlib -I. -c boot.S -o boot.o
clang --target=aarch64-none-elf -ffreestanding -nostdlib -I. -c func_table.S -o func_table.o # 똭! 새로 추가

# kernel.c 컴파일
clang --target=aarch64-none-elf -ffreestanding -nostdlib -c kernel.c -o kernel.o

# 세 개의 목적 파일을 하나로 우아하게 합체(링크)!
ld.lld -T link.ld boot.o func_table.o kernel.o -o kernel.elf

# QEMU 가동
qemu-system-aarch64 -M virt -cpu cortex-a72 -nographic -kernel kernel.elf
