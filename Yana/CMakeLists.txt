cmake_minimum_required(VERSION 3.22)

# 🔑 [야단치기 1번 해결] Corrosion과 시스템 링킹을 위해 C, CXX를 반드시 포함!
project(Yana LANGUAGES C CXX ASM)

set(CMAKE_OSX_ARCHITECTURES "arm64" CACHE STRING "Build for Apple Silicon" FORCE)
set(CMAKE_BUILD_TYPE Debug)
set_property(GLOBAL PROPERTY USE_FOLDERS ON)

# -------------------------------------------------------------
# 🦀 Corrosion (Rust <-> CMake 연동)
# -------------------------------------------------------------
include(FetchContent)
FetchContent_Declare(
    Corrosion
    GIT_REPOSITORY https://github.com/corrosion-rs/corrosion.git
    GIT_TAG v0.6.1
)
FetchContent_MakeAvailable(Corrosion)

# Rust crate 임포트 (hun_core 타겟 생성)
corrosion_import_crate(MANIFEST_PATH ${CMAKE_SOURCE_DIR}/../Applications/rust/hun_apps/hun_core/Cargo.toml)

# -------------------------------------------------------------
# 소스 파일 수집 (현재는 편의상 GLOB 유지, CONFIGURE_DEPENDS 장착)
# -------------------------------------------------------------
file(GLOB_RECURSE YANA_SOURCES CONFIGURE_DEPENDS "${CMAKE_SOURCE_DIR}/src/*.S" "${CMAKE_SOURCE_DIR}/src/*.s")
file(GLOB_RECURSE YANA_LIBS CONFIGURE_DEPENDS "${CMAKE_SOURCE_DIR}/libs/*.S" "${CMAKE_SOURCE_DIR}/libs/*.s")
file(GLOB_RECURSE YANA_TESTS CONFIGURE_DEPENDS "${CMAKE_SOURCE_DIR}/tests/*.S" "${CMAKE_SOURCE_DIR}/tests/*.s")

# 참고/문서용 (컴파일 제외 대상)
file(GLOB_RECURSE YANA_HEADERS CONFIGURE_DEPENDS "${CMAKE_SOURCE_DIR}/include/*.h" "${CMAKE_SOURCE_DIR}/include/*.inc")
file(GLOB_RECURSE YANA_DOCS CONFIGURE_DEPENDS "${CMAKE_SOURCE_DIR}/docs/*.md")
file(GLOB_RECURSE YANA_SCRIPTS CONFIGURE_DEPENDS "${CMAKE_SOURCE_DIR}/scripts/*.sh" "${CMAKE_SOURCE_DIR}/scripts/*.ps1")

# -------------------------------------------------------------
# 메인 실행파일 구성
# -------------------------------------------------------------
add_executable(Yana
    ${YANA_SOURCES}
    ${YANA_LIBS}
    ${YANA_HEADERS}
    ${YANA_DOCS}
    ${YANA_SCRIPTS}
)

# Rust의 hun_core 라이브러리와 결합
target_link_libraries(Yana PRIVATE hun_core)

# 🔑 비컴파일 대상 명확히 격리
set_source_files_properties(
    ${YANA_HEADERS} ${YANA_DOCS} ${YANA_SCRIPTS}
    PROPERTIES HEADER_FILE_ONLY TRUE
)

# -------------------------------------------------------------
# 테스트 빌드 분리
# -------------------------------------------------------------
if(YANA_TESTS)
    add_executable(YanaTests EXCLUDE_FROM_ALL ${YANA_TESTS})
    set_target_properties(YanaTests PROPERTIES FOLDER "Yana/Tests")
endif()

# -------------------------------------------------------------
# Xcode Navigator 트리 구조 정화
# -------------------------------------------------------------
source_group(
    TREE "${CMAKE_SOURCE_DIR}"
    FILES ${YANA_SOURCES} ${YANA_LIBS} ${YANA_TESTS}
          ${YANA_HEADERS} ${YANA_DOCS} ${YANA_SCRIPTS}
)

target_include_directories(Yana PRIVATE "${CMAKE_SOURCE_DIR}/include")

# 디버깅 심볼 활성화 (-g)
target_compile_options(Yana PRIVATE $<$<COMPILE_LANGUAGE:ASM>:-g>)

# 🔑 [야단치기 3번 해결] Xcode가 오해하지 않도록 링커 인자를 개별 분리 처리!
target_link_options(Yana PRIVATE 
    "-Wl,-no_warn_duplicate_libraries"
    "-Wl,-w"
)

set_target_properties(Yana PROPERTIES FOLDER "Yana")

# =============================================================================
# 🔑 [대제독의 Xcode 네비게이터 무결점 정화 신공]
# =============================================================================
if(TARGET hun_core)
    set_target_properties(hun_core PROPERTIES FOLDER "Rust_Cargo_Targets")
endif()

foreach(rust_target 
    _cargo-build_hun_core
    cargo-build_hun_core
    cargo-clean_hun_core 
    cargo-prebuild_hun_core 
    cargo-clean 
    cargo-prebuild
)
    if(TARGET ${rust_target})
        set_target_properties(${rust_target} PROPERTIES FOLDER "Rust_Cargo_Targets")
    endif()
endforeach()

if(TARGET ALL_BUILD)
    set_property(TARGET ALL_BUILD PROPERTIES FOLDER "CMake_Internal")
endif()
if(TARGET ZERO_CHECK)
    set_property(TARGET ZERO_CHECK PROPERTIES FOLDER "CMake_Internal")
endif()