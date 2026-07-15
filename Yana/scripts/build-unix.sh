#!/usr/bin/env zsh

SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="${SCRIPT_DIR}/.."
BUILD_DIR_XCODE="${PROJECT_ROOT}/build-xcode"
BUILD_DIR_UNIX="${PROJECT_ROOT}/build"

echo
echo "⚡ [Yana 빌드 스크립트] 프로젝트 루트: ${PROJECT_ROOT}"
echo

echo "==========================="
echo "Run for Unix Makefiles"
echo "==========================="

cmake -B ${BUILD_DIR_UNIX} -S "${PROJECT_ROOT}" -G "Unix Makefiles"
cmake --build ${BUILD_DIR_UNIX} --config Debug
EXECFILE="${BUILD_DIR_UNIX}/Yana"

if [[ -f "${EXECFILE}" ]]; then
    echo "✅ 빌드 완료! 실행 파일: ${EXECFILE}"
    echo "🚀 Yana 실행 중..."
    echo "---------------------------------------"
    "${EXECFILE}"
else
    echo "❌ Unix 용 실행 파일을 찾을 수 없습니다: ${EXECFILE}"
    exit 1
fi

# --> en 
# 1. rm -rf build
# 2. cmake -B build -G "Unix Makefiles"
# 3. cmake --build build --config Debug

# --> ko
# cmake -B build -G "Unix Makefiles" -DCMAKE_ASM_COMPILER=/Users/viv/GitWorkspace/llvm-project/build/bin/clang  -DCMAKE_C_COMPILER=/Users/viv/GitWorkspace/llvm-project/build/bin/clang
# cmake --build build --config Debug