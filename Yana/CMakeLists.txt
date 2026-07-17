cmake_minimum_required(VERSION 3.22)

# 🔑 Corrosion과 시스템 링킹을 위해 C, CXX를 반드시 포함!
project(Yana LANGUAGES C CXX ASM)

set(CMAKE_OSX_ARCHITECTURES "arm64" CACHE STRING "Build for Apple Silicon" FORCE)

if(NOT CMAKE_BUILD_TYPE)
 set(CMAKE_BUILD_TYPE Debug)
endif()

set(YANA_ASSET_DIR ${CMAKE_SOURCE_DIR}/assets)

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
# 워크스페이스 전체를 임포트 (hun_core + hun_test_runner 둘 다 타겟으로 생성됨)
corrosion_import_crate(MANIFEST_PATH ${CMAKE_SOURCE_DIR}/../Applications/rust/hun_apps/Cargo.toml)
# corrosion_import_crate(MANIFEST_PATH ${CMAKE_SOURCE_DIR}/../Applications/rust/hun_apps/hun_core/Cargo.toml)
enable_testing()
add_test(NAME hun_asm_tests COMMAND hun_test_runner)
# -------------------------------------------------------------
# 소스 파일 수집 (현재는 편의상 GLOB 유지, CONFIGURE_DEPENDS 장착)
# -------------------------------------------------------------
file(GLOB_RECURSE YANA_SOURCES CONFIGURE_DEPENDS 
    "${CMAKE_SOURCE_DIR}/src/*.S" 
    "${CMAKE_SOURCE_DIR}/src/*.s"
)

file(GLOB_RECURSE YANA_LIBS CONFIGURE_DEPENDS 
    "${CMAKE_SOURCE_DIR}/libs/*.S" 
    "${CMAKE_SOURCE_DIR}/libs/*.s"
    "${CMAKE_SOURCE_DIR}/libs/*.asm"
    "${CMAKE_SOURCE_DIR}/libs/*.ASM"
)

file(GLOB_RECURSE YANA_TESTS CONFIGURE_DEPENDS 
    "${CMAKE_SOURCE_DIR}/tests/*.S" 
    "${CMAKE_SOURCE_DIR}/tests/*.s"
)

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

target_include_directories(Yana PRIVATE "${CMAKE_SOURCE_DIR}/include")

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

    # 공용 라이브러리(libs) 소스도 함께 빌드하거나 연결하고, Rust 크레이트도 링크해 주어야 함!
    target_link_libraries(YanaTests PRIVATE hun_core)

    # 필요하다면 include 경로도 추가
    target_include_directories(YanaTests PRIVATE "${CMAKE_SOURCE_DIR}/include")
endif()


# -------------------------------------------------------------
# Xcode Navigator 트리 구조 정화
# -------------------------------------------------------------
source_group(
    TREE "${CMAKE_SOURCE_DIR}"
    FILES ${YANA_SOURCES} ${YANA_LIBS} ${YANA_TESTS}
          ${YANA_HEADERS} ${YANA_DOCS} ${YANA_SCRIPTS}
)

# 디버깅 심볼 활성화 (-g)
# 디버그 빌드 시 자동으로 컴파일러와 어셈블러에 디버깅 심볼(-g)을 활성화
set(CMAKE_ASM_FLAGS_DEBUG "-g" CACHE STRING "ASM Debug Flags" FORCE)

target_compile_options(
    Yana PRIVATE
    $<$<AND:$<CONFIG:Debug>,$<COMPILE_LANGUAGE:ASM>>:-g>
)

# 🔑 Xcode가 오해하지 않도록 링커 인자를 개별 분리 처리!
target_link_options(Yana PRIVATE
    "-Wl,-no_warn_duplicate_libraries"
    "-Wl,-w"
)

set_target_properties(Yana PROPERTIES FOLDER "Yana")

# assets
file(GLOB_RECURSE YANA_ASSETS
    CONFIGURE_DEPENDS
    "${CMAKE_SOURCE_DIR}/assets/*"
)

source_group(
    TREE "${CMAKE_SOURCE_DIR}/assets"
    PREFIX "Assets"
    FILES ${YANA_ASSETS}
)

set_source_files_properties(
    ${YANA_ASSETS}
    PROPERTIES HEADER_FILE_ONLY TRUE
)

target_sources(Yana PRIVATE ${YANA_ASSETS})


# =============================================================================
# 🔑 [대제독의 Xcode 네비게이터 무결점 정화 신공]
# =============================================================================
if(TARGET hun_core)
    set_target_properties(hun_core PROPERTIES FOLDER "Rust_Cargo_Targets")
endif()

if(TARGET hun_test_runner)
    set_target_properties(hun_test_runner PROPERTIES FOLDER "Rust_Cargo_Targets")
endif()

foreach(rust_target
    _cargo-build_hun_core
    cargo-build_hun_core
    cargo-clean_hun_core
    cargo-prebuild_hun_core
    _cargo-build_hun_test_runner     # 추가!
    cargo-build_hun_test_runner      # 추가!
    cargo-clean_hun_test_runner      # 추가!
    cargo-prebuild_hun_test_runner   # 추가!
    cargo-clean
    cargo-prebuild
)

if(TARGET ${rust_target})
    set_target_properties(${rust_target} PROPERTIES FOLDER "Rust_Cargo_Targets")
endif()

endforeach()

if(TARGET corrosion)
    set_property(TARGET corrosion PROPERTIES FOLDER "CMake_Internal/Corrosion")
endif()

if(TARGET ALL_BUILD)
    set_property(TARGET ALL_BUILD PROPERTIES FOLDER "CMake_Internal")
endif()

if(TARGET ZERO_CHECK)
    set_property(TARGET ZERO_CHECK PROPERTIES FOLDER "CMake_Internal")
endif()

# assets 복사
add_custom_command(
    TARGET Yana POST_BUILD

    COMMAND
        ${CMAKE_COMMAND}
        -E copy_directory
        ${YANA_ASSET_DIR}
        $<TARGET_FILE_DIR:Yana>/assets

    COMMENT "Copying assets..."
)
