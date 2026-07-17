
## 🇰🇷 한글 어셈블리 렉서 지원 패치 (2026-07-10)

### 대상
`llvm/lib/MC/MCParser/AsmLexer.cpp`

### 수정 내용
1. `isIdentifierChar()` — 식별자 **이어지는** 문자로 UTF-8 멀티바이트(0x80 이상) 허용
2. `LexToken()`의 `default` case — 식별자 **첫** 문자로 UTF-8 멀티바이트 허용

두 곳 모두 `static_cast<unsigned char>(C) >= 0x80` 조건을 추가. `char`가 signed로 취급되는
환경(macOS/Linux)에서 UTF-8 한글 바이트가 음수로 해석되어 비교에 실패하는 문제를,
LLVM 기존 관례(`llvm::isASCII`)와 동일한 방식으로 안전하게 캐스팅하여 해결.

### 검증 완료 항목
- [x] 한글 레이블 (`가나다:`)
- [x] 한글 매크로 선언/매개변수 (`.macro 인사 이름`)
- [x] 한글 매크로 호출 (`인사 법우`)
- [x] 조건부 어셈블리 (`.if 최대값 > 50`)
- [x] 반복 (`.rept 3` / `.endr`)
- [x] 실제 오브젝트 파일 생성 → 링크 → 실행 (exit code 0)

### 빌드 커맨드 (재현용)

```bash
cmake -S llvm -B build -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DLLVM_ENABLE_PROJECTS="clang" \
    -DLLVM_TARGETS_TO_BUILD="AArch64" \
    -DCMAKE_EXPORT_COMPILE_COMMANDS=ON \
    -DLLVM_ENABLE_ASSERTIONS=ON

ninja -C build llvm-mc
```

### 패치 파일
[`docs/patches/hangul-lexer-support.patch`](./patches/hangul-lexer-support.patch)

### 아직 남은 것

- 타겟별 파서(AArch64AsmParser) 레벨 검증
- DWARF 디버그 정보 생성 시 한글 심볼 처리
- 링커(`lld`) 레벨 한글 심볼 인코딩 확인
- LLVM 자체 회귀 테스트(`ninja check-llvm-mc`) 통과 여부

