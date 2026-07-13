#!/usr/bin/env zsh

# 🔑 이 스크립트 파일이 실제로 어디 있는지부터 정확히 계산
SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="${SCRIPT_DIR}/.."
BUILD_DIR_XCODE="${PROJECT_ROOT}/build-xcode"

echo "⚡ [Yana 빌드 스크립트] 프로젝트 루트: ${PROJECT_ROOT}"

# 1. CMake 구성 (Configure) - Xcode용으로 단일화
cmake -G Xcode \
  -DCMAKE_ASM_COMPILER=/Users/viv/GitWorkspace/llvm-project/build/bin/llvm-mc \
  -S "${PROJECT_ROOT}" -B "${BUILD_DIR_XCODE}"

# 2. 🔑 실제 빌드 (타겟을 명확히 build-xcode로 지정!)
cmake --build "${BUILD_DIR_XCODE}" --config Debug

# 3. 빌드 성공 여부 확인 후 자동 실행 (Xcode 빌드는 Debug 폴더 아래에 생성됨)
EXECUTABLE="${BUILD_DIR_XCODE}/Debug/Yana"

if [[ -f "${EXECUTABLE}" ]]; then
    echo "✅ 빌드 완료! 실행 파일: ${EXECUTABLE}"
    echo "🚀 Yana 실행 중..."
    echo "---------------------------------------"
    "${EXECUTABLE}" # 👈 커맨드라인 바이너리는 직접 실행!
else
    echo "❌ 실행 파일을 찾을 수 없습니다: ${EXECUTABLE}"
    exit 1
fi

# --> 커맨드라인 검증 (매번 빠르게 확인할 때)
# 1. rm -rf build
# 2. cmake -B build -G "Unix Makefiles"
# 3. cmake --build build --config Debug

# --> Xcode/lldb 디버깅용
# 1. rm -rf build-xcode
# 2. cmake -B build-xcode -G Xcode
# 3. cmake --build build-xcode --config Debug

# --> Open project with XCode
# 4. open build-xcode/Yana.xcodeproj
