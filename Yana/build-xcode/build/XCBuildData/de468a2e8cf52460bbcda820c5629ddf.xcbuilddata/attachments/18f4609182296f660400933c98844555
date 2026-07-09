#!/bin/sh
set -e
if test "$CONFIGURATION" = "Debug"; then :
  cd /Users/viv/GitWorkspace/Hun/Applications/rust/hun_apps/hun_core
  /opt/homebrew/bin/cmake -E env AR_aarch64-apple-darwin=/usr/bin/ar CORROSION_BUILD_DIR=/Users/viv/GitWorkspace/Hun/Yana/build-xcode CARGO_BUILD_RUSTC=/Users/viv/.rustup/toolchains/stable-aarch64-apple-darwin/bin/rustc /Users/viv/.rustup/toolchains/stable-aarch64-apple-darwin/bin/cargo rustc --lib --target=aarch64-apple-darwin --package hun_core --crate-type=staticlib --manifest-path /Users/viv/GitWorkspace/Hun/Applications/rust/hun_apps/hun_core/Cargo.toml --target-dir /Users/viv/GitWorkspace/Hun/Yana/build-xcode/Debug/cargo/hun_core_84915 -- -Cdefault-linker-libraries=yes
fi
if test "$CONFIGURATION" = "Release"; then :
  cd /Users/viv/GitWorkspace/Hun/Applications/rust/hun_apps/hun_core
  /opt/homebrew/bin/cmake -E env AR_aarch64-apple-darwin=/usr/bin/ar CORROSION_BUILD_DIR=/Users/viv/GitWorkspace/Hun/Yana/build-xcode CARGO_BUILD_RUSTC=/Users/viv/.rustup/toolchains/stable-aarch64-apple-darwin/bin/rustc /Users/viv/.rustup/toolchains/stable-aarch64-apple-darwin/bin/cargo rustc --lib --target=aarch64-apple-darwin --package hun_core --crate-type=staticlib --manifest-path /Users/viv/GitWorkspace/Hun/Applications/rust/hun_apps/hun_core/Cargo.toml --target-dir /Users/viv/GitWorkspace/Hun/Yana/build-xcode/Release/cargo/hun_core_84915 --release -- -Cdefault-linker-libraries=yes
fi
if test "$CONFIGURATION" = "MinSizeRel"; then :
  cd /Users/viv/GitWorkspace/Hun/Applications/rust/hun_apps/hun_core
  /opt/homebrew/bin/cmake -E env AR_aarch64-apple-darwin=/usr/bin/ar CORROSION_BUILD_DIR=/Users/viv/GitWorkspace/Hun/Yana/build-xcode CARGO_BUILD_RUSTC=/Users/viv/.rustup/toolchains/stable-aarch64-apple-darwin/bin/rustc /Users/viv/.rustup/toolchains/stable-aarch64-apple-darwin/bin/cargo rustc --lib --target=aarch64-apple-darwin --package hun_core --crate-type=staticlib --manifest-path /Users/viv/GitWorkspace/Hun/Applications/rust/hun_apps/hun_core/Cargo.toml --target-dir /Users/viv/GitWorkspace/Hun/Yana/build-xcode/MinSizeRel/cargo/hun_core_84915 --release -- -Cdefault-linker-libraries=yes
fi
if test "$CONFIGURATION" = "RelWithDebInfo"; then :
  cd /Users/viv/GitWorkspace/Hun/Applications/rust/hun_apps/hun_core
  /opt/homebrew/bin/cmake -E env AR_aarch64-apple-darwin=/usr/bin/ar CORROSION_BUILD_DIR=/Users/viv/GitWorkspace/Hun/Yana/build-xcode CARGO_BUILD_RUSTC=/Users/viv/.rustup/toolchains/stable-aarch64-apple-darwin/bin/rustc /Users/viv/.rustup/toolchains/stable-aarch64-apple-darwin/bin/cargo rustc --lib --target=aarch64-apple-darwin --package hun_core --crate-type=staticlib --manifest-path /Users/viv/GitWorkspace/Hun/Applications/rust/hun_apps/hun_core/Cargo.toml --target-dir /Users/viv/GitWorkspace/Hun/Yana/build-xcode/RelWithDebInfo/cargo/hun_core_84915 --release -- -Cdefault-linker-libraries=yes
fi

