# LLVM PROJECT for Hun

## Git Clone `llvm-project`

```bash
git clone https://github.com/llvm/llvm-project.git
du -sh llvm-project/

# 기타 진실의 방 명령
git rev-parse HEAD
git count-objectts -vH
cat .gitmodules 2>/dev/null && echo "서브모듈 정의 있음" || echo "❌ .gitmodules 파일 자체가 없음"
git log --oneline -1
git rm -rf --chced .
du -sh .git

# 기타 공격목표 파일 찾기 예시
find . -path "*AsmLexer.cpp"
find ~/llvm-project -path "*/MC/MCParser/AsmLexer.cpp"
```

### Build

```bash
cmake -S llvm -B build -G Ninja \
    -DLLVM_ENABLE_PROJECTS="clang" \
    -DLLVM_TARGETS_TO_BUILD="AArch64" \
    -DCMAKE_BUILD_TYPE=Release \
    -DLLVM_PARALLEL_LINK_JOBS=2 \
    -DCMAKE_EXPORT_COMPILE_COMMANDS=ON

ninja -C build
```

### '훈' 타켓파일 목록

- llvm-project/llvm/lib/MC/MCParser/AsmLexer.cpp
  - static bool isIdentityfierChar(char C, bool AllowAt, bool AllowHash); 