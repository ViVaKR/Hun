cmake_minimum_required(VERSION 3.25)
project(dharma ASM)

set(CMAKE_OSX_ARCHITECTURES "arm64")
set(CMAKE_BUILD_TYPE Debug)

include(FetchContent)
FetchContent_Declare(
    Corrosion
    GIT_REPOSITORY https://github.com/corrosion-rs/corrosion.git
    GIT_TAG v0.6
)
FetchContent_MakeAvailable(Corrosion)

corrosion_import_crate(MANIFEST_PATH ${CMAKE_SOURCE_DIR}/hun_apps/Cargo.toml)

add_executable(dharma dharma/main.S)
target_link_libraries(dharma PRIVATE hun_apps "-lSystem")