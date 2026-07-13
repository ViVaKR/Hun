#!/usr/bin/env zsh

SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="${SCRIPT_DIR}/.."
BUILD_DIR_XCODE="${PROJECT_ROOT}/build-xcode"

echo "⚡ [Yana 빌드 스크립트] 프로젝트 루트: ${PROJECT_ROOT}"

# 1. CMake 구성 — llvm-mc 대신 우리가 빌드한 clang을 컴파일러로 지정!
cmake -G Xcode \
  -DCMAKE_ASM_COMPILER=/Users/viv/GitWorkspace/llvm-project/build/bin/clang \
  -DCMAKE_C_COMPILER=/Users/viv/GitWorkspace/llvm-project/build/bin/clang \
  -S "${PROJECT_ROOT}" -B "${BUILD_DIR_XCODE}"

# 2. 빌드 (자세히 보기 위해 verbose 옵션 추가)
cmake --build "${BUILD_DIR_XCODE}" --config Debug -- -verbose

EXECUTABLE="${BUILD_DIR_XCODE}/Debug/Yana"

if [[ -f "${EXECUTABLE}" ]]; then
    echo "✅ 빌드 완료! 실행 파일: ${EXECUTABLE}"
    echo "🚀 Yana 실행 중..."
    echo "---------------------------------------"
    "${EXECUTABLE}"
else
    echo "❌ 실행 파일을 찾을 수 없습니다: ${EXECUTABLE}"
    exit 1
fi
