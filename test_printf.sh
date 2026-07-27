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
# 무장한진입점(_main 역할), 글자(.asciz), @페이지, @페이지오프셋 수식어 검증
cat <<EOF > hello.s
코드영역
공개 무장한진입점
줄맞춤 2

인사말:
    글자 "안녕 세상아! (Hello, World!)\n\0"

무장한진입점:
    쌍으로저장  기본참조터, 돌아갈길, [참조쌓임터, #-16]!
    할당하기    기본참조터, 참조쌓임터

    페이지주소찾기  연산처_0, 인사말@페이지
    더하기          연산처_0, 연산처_0, 인사말@페이지오프셋
    부르기          _printf

    할당하기    연산처_0, 0
    쌍으로읽기  기본참조터, 돌아갈길, [참조쌓임터], #16
    돌아가기
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
