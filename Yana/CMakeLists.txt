cmake_minimum_required(VERSION 3.22)
project(Yana LANGUAGES ASM)

set(CMAKE_OSX_ARCHITECTURES "arm64" CACHE STRING "Build for Apple Silicon" FORCE)
set(CMAKE_BUILD_TYPE Debug)
set_property(GLOBAL PROPERTY USE_FOLDERS ON)
# -------------------------------------------------------------
# 🦀 Corrosion (Rust <-> CMake 연동)
# -------------------------------------------------------------

# 1. Corrosion 로드
include(FetchContent)
FetchContent_Declare(
    Corrosion
    GIT_REPOSITORY https://github.com/corrosion-rs/corrosion.git
    GIT_TAG v0.6.1
)
FetchContent_MakeAvailable(Corrosion)

# 2. Rust crate 임포트 (여기서 hun_core 타겟이 생성됨)
corrosion_import_crate(MANIFEST_PATH ${CMAKE_SOURCE_DIR}/../Applications/rust/hun_apps/hun_core/Cargo.toml)

# -------------------------------------------------------------
# 소스 파일 수집
# -------------------------------------------------------------
file(GLOB_RECURSE YANA_SOURCES CONFIGURE_DEPENDS
    "${CMAKE_SOURCE_DIR}/src/*.S"
    "${CMAKE_SOURCE_DIR}/src/*.s"
)
file(GLOB_RECURSE YANA_LIBS CONFIGURE_DEPENDS
    "${CMAKE_SOURCE_DIR}/libs/*.S"
)
file(GLOB_RECURSE YANA_TESTS CONFIGURE_DEPENDS
    "${CMAKE_SOURCE_DIR}/tests/*.S"
)

# 참고/문서용 (진짜 컴파일 안 하는 것들만!)
file(GLOB_RECURSE YANA_HEADERS CONFIGURE_DEPENDS
    "${CMAKE_SOURCE_DIR}/include/*.h" "${CMAKE_SOURCE_DIR}/include/*.inc"
)
file(GLOB_RECURSE YANA_DOCS CONFIGURE_DEPENDS
    "${CMAKE_SOURCE_DIR}/docs/*.md"
)
file(GLOB_RECURSE YANA_SCRIPTS CONFIGURE_DEPENDS
    "${CMAKE_SOURCE_DIR}/scripts/*.sh" "${CMAKE_SOURCE_DIR}/scripts/*.ps1"
)

# -------------------------------------------------------------
# 메인 실행파일: src + libs (실제 컴파일 대상)
#                + 헤더/문서/스크립트 (Navigator 표시용, 컴파일 X)
# -------------------------------------------------------------
add_executable(Yana
    ${YANA_SOURCES}
    ${YANA_LIBS}
    ${YANA_HEADERS}
    ${YANA_DOCS}
    ${YANA_SCRIPTS}
)

# 4. 링크 (hun_core는 이미 위에서 임포트된 타겟이니 바로 씀)
target_link_libraries(Yana PRIVATE hun_core)

# 🔑 진짜 "컴파일 안 함" 대상은 헤더/문서/스크립트뿐!
set_source_files_properties(
    ${YANA_HEADERS} ${YANA_DOCS} ${YANA_SCRIPTS}
    PROPERTIES HEADER_FILE_ONLY TRUE
)

# -------------------------------------------------------------
# 🔑 테스트는 별도 실행파일로 분리! (메인 바이너리에 안 섞임)
# -------------------------------------------------------------
if(YANA_TESTS)
    add_executable(YanaTests EXCLUDE_FROM_ALL ${YANA_TESTS})
    set_target_properties(YanaTests PROPERTIES FOLDER "Yana/Tests")
endif()

# -------------------------------------------------------------
# 🔑 Navigator 폴더 구조 반영 (전체 목록 다 포함!)
# -------------------------------------------------------------
source_group(
    TREE "${CMAKE_SOURCE_DIR}"
    FILES ${YANA_SOURCES} ${YANA_LIBS} ${YANA_TESTS}
          ${YANA_HEADERS} ${YANA_DOCS} ${YANA_SCRIPTS}
)

target_include_directories(Yana PRIVATE
    "${CMAKE_SOURCE_DIR}/include"
)

target_compile_options(Yana PRIVATE $<$<COMPILE_LANGUAGE:ASM>:-g>)
target_link_options(Yana PRIVATE 
    "-Wl,-no_warn_duplicate_libraries"
    "-Wl,-w" # 링커 경고 전체 무음 처리
)

set_target_properties(Yana PROPERTIES FOLDER "Yana")


# rm -rf build-xcode && cmake -B build-xcode -G Xcode && cmake --build build-xcode --config Debug