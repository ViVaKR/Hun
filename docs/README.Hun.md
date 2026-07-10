# Hun

## llvm project

```bash
cd llvm-project

# 1. configure
cmake -S llvm -B build -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DLLVM_ENABLE_PROJECTS="clang" \
    -DLLVM_TARGETS_TO_BUILD="AArch64" \
    -DCMAKE_EXPORT_COMPILE_COMMANDS=ON \
    -DLLVM_ENABLE_ASSERTIONS=ON

# [옵션 설명]
# -S llvm -B build소스는 llvm/ 서브폴더 안에, 빌드 산출물은 build/로 분리
# -G NinjaMakefiles보다 병렬 빌드가 훨씬 빠름. LLVM 공식도 Ninja 강력 추천
# LLVM_ENABLE_PROJECTS="clang"clang만 켜기. lldb, lld, mlir 등 지금 당장 안 쓰는 건 다 꺼서 빌드 시간 절약. AsmLexer.cpp 패치 검증엔 clang(정확히는 그 하위 llvm-mc)만 있으면 충분
# LLVM_TARGETS_TO_BUILD="AArch64"X86, RISC-V, ARM(32bit) 등 안 쓰는 백엔드 다 제외. 이거 하나로 빌드 시간이 체감상 절반 이하로 줄어
# CMAKE_EXPORT_COMPILE_COMMANDS=ONCLion/clangd가 include 경로 제대로 인식하게, 지난번 그 빨간줄 문제 방지
# LLVM_ENABLE_ASSERTIONS=ON렉서 패치 검증할 때 assert가 켜져 있어야 잘못된 상태를 바로 잡아줌. (배포용 빌드라면 꺼야 하지만 지금은 개발/검증 단계니 켜두는 게 안전)

# 2. 작은 것 부터 (시간 체크)
time ninja -C build llvm-mc

# 2-2. clang (필요시)
time ninja _C build clang

# 3. IDE 연결 
ln -s build/compile_commands.json .
```
