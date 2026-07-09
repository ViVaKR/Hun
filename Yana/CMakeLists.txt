cmake_minimum_required(VERSION 3.20)
project(Yana LANGUAGES ASM)

set(CMAKE_OSX_ARCHITECTURES "arm64" CACHE STRING "Build for Apple Silicon" FORCE)
set(CMAKE_BUILD_TYPE Debug)
set_property(GLOBAL PROPERTY USE_FOLDERS ON)

# -------------------------------------------------------------
# 소스 파일 수집 (src/ 아래 전부)
# -------------------------------------------------------------
file(GLOB_RECURSE YANA_SOURCES CONFIGURE_DEPENDS
    "${CMAKE_SOURCE_DIR}/src/*.S"
    "${CMAKE_SOURCE_DIR}/src/*.s"
)

# 참고용/문서용 파일들 (컴파일은 안 되지만 Xcode에 "보이게"만 등록)
file(GLOB_RECURSE YANA_HEADERS CONFIGURE_DEPENDS
    "${CMAKE_SOURCE_DIR}/include/*.h"
)
file(GLOB_RECURSE YANA_DOCS CONFIGURE_DEPENDS
    "${CMAKE_SOURCE_DIR}/docs/*.md"
)
file(GLOB_RECURSE YANA_LIBS CONFIGURE_DEPENDS
    "${CMAKE_SOURCE_DIR}/libs/*.S"
    "${CMAKE_SOURCE_DIR}/libs/*.c"
)
file(GLOB_RECURSE YANA_SCRIPTS CONFIGURE_DEPENDS
    "${CMAKE_SOURCE_DIR}/scripts/*.sh" 
    "${CMAKE_SOURCE_DIR}/scripts/*.ps1"
)

add_executable(Yana
    ${YANA_SOURCES}
    ${YANA_HEADERS}   # 헤더도 타겟에 넣어야 Xcode Navigator에 표시됨 (컴파일은 안 됨)
    ${YANA_DOCS}
    ${YANA_SCRIPTS}
    libs/fib.S
    tests/test.S
)

# 헤더/문서/스크립트는 빌드 시스템이 "컴파일 대상 아님"으로 인식하게 표시
set_source_files_properties(
    ${YANA_HEADERS} ${YANA_DOCS} ${YANA_SCRIPTS}
    PROPERTIES HEADER_FILE_ONLY TRUE
)

# -------------------------------------------------------------
# 🔑 핵심: 디스크 폴더 구조를 Xcode Navigator에 그대로 반영
# -------------------------------------------------------------
source_group(
    TREE "${CMAKE_SOURCE_DIR}"
    FILES ${YANA_SOURCES} ${YANA_HEADERS} ${YANA_DOCS} ${YANA_SCRIPTS}
)

target_include_directories(Yana PRIVATE
    "${CMAKE_SOURCE_DIR}/include"
)

target_compile_options(Yana PRIVATE $<$<COMPILE_LANGUAGE:ASM>:-g>)
target_link_options(Yana PRIVATE "-Wl,-no_warn_duplicate_libraries")

set_target_properties(Yana PROPERTIES FOLDER "Yana")