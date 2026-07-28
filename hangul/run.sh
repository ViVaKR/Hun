#!/usr/bin/env zsh
set -euo pipefail

# ── 경로 정의 (스크립트 자신의 위치 기준, CWD 무관) ──────────
SCRIPT_DIR=${0:A:h}
LLVM_ROOT=${LLVM_ROOT:-${HOME}/GitWorkspace/llvm-project}
LLVM_ROOT=${LLVM_ROOT:A}                    # ../../ 정리해서 깔끔한 절대경로로 정규화
LLVM_BUILD=${LLVM_ROOT}/build
CLANG=${LLVM_BUILD}/bin/clang
TARGET=aarch64-apple-darwin
SDKPATH=$(xcrun -sdk macosx --show-sdk-path)
# ──────────────────────────────────────────────────────────

echo "========================================="
echo "⚙️  한글 어셈블러 빌드를 시작합니다..."
echo "========================================="
ninja -C "$LLVM_BUILD" clang

echo ""
echo "========================================="
echo "🧪 한글 어셈블리 코드 검증 중..."
echo "========================================="

cat <<'EOF' > hello.s
.include "hun.macros.inc"

    글자구역
인사말:
    글자 "안녕하세요 반갑습니다. 멋진 한글어셈블리의 세상에 오신것을 환영합니다.! (Hello, World!)\n\0"

    코드구역
    문장시작 무장한진입점, 32

    페이지주소찾기  연산처_0, 인사말@페이지
    더하기          연산처_0, 연산처_0, 인사말@페이지오프셋
    부르기          _printf

    할당하기    연산처_0, 0
    문장끝 32
EOF

echo "--- [입력한 한글 어셈블리 코드] ---"
cat hello.s
echo "----------------------------------"

echo ""
echo "--- [어셈블 결과 (기계어 번역)] ---"
"$CLANG" --target=$TARGET -c hello.s -o hello.o
objdump -d hello.o
echo "----------------------------------"
echo "✅ clang - 검증 완료!"

"$CLANG" --target=$TARGET -isysroot "$SDKPATH" hello.o -o hello

echo "--- [실행 결과] ---"
./hello
echo "Exit Code: $?"
echo "----------------------------------"

rm -f ./hello hello.s hello.o