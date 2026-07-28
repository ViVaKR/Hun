#!/usr/bin/env zsh

set -e

echo "========================================="
echo "⚙️  한글 어셈블러 빌드를 시작합니다..."
echo "========================================="
ninja -C ../llvm-project/build clang

echo ""
echo "========================================="
echo "🧪 한글 어셈블리 코드 검증 중..."
echo "========================================="

# 1. 헬로우 월드 한글 어셈블리 코드 작성
# 매크로시작/끝 기반의 hun.macros.inc 인클루드 방식 검증
cat <<EOF > hello.s
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
../llvm-project/build/bin/clang --target=aarch64-apple-darwin -c hello.s -o hello.o

objdump -d hello.o
echo "----------------------------------"

echo "✅ clang - 검증 완료!"

# 2. 링크 진행
../llvm-project/build/bin/clang --target=aarch64-apple-darwin -isysroot $(xcrun -sdk macosx --show-sdk-path) hello.o -o hello

echo "--- [실행 결과] ---"
./hello
echo "Exit Code: $?"
echo "----------------------------------"

# 임시 파일 정리
rm -f ./hello hello.s hello.o
