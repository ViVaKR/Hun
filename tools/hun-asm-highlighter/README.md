# Hun ARM64 Assembly Highlighter

[![Version](https://img.shields.io/visual-studio-marketplace/v/buddham-hq.hun-asm-highlighter)](https://marketplace.visualstudio.com/items?itemName=buddham-hq.hun-asm-highlighter)
[![📖 Mnemonic Dictionary](https://img.shields.io/badge/📖_Mnemonic_Dictionary-224_instructions-brightgreen)](https://vivakr.github.io/Hun/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

A VS Code extension for **AArch64 / ARM64 assembly** development — built for the [Hun](https://github.com/ViVaKR/Hun) project, and just as useful for anyone writing plain, standard ARM64 assembly.

It gives you rich syntax highlighting, IntelliSense (hover + autocomplete) for the full AArch64 instruction set, lightweight static diagnostics that catch real encoding mistakes before you assemble, code formatting, snippets for common patterns, and Go to Definition / Outline for label navigation. Korean-mnemonic support (`할당`, `더함`, `적재`...) is included as an optional layer on top — you can use the extension for pure standard ARM64 assembly without ever touching it.

## Features

- **Syntax highlighting** for the full standard AArch64 mnemonic set — data movement, arithmetic, logic, branches, floating-point/NEON, atomics, pointer authentication, and system instructions
- **Register highlighting**: `x0`–`x30`, `w0`–`w30`, `sp`, `lr`, `fp`, plus FP/SIMD registers `d`/`q`/`s`/`h`/`v` with vector element/lane syntax (`v0.4s`, `v1.2d[0]`)
- **Hover documentation**: point at any mnemonic to see its full name, syntax, and a description
- **Autocomplete (IntelliSense)** across the entire instruction set, with duplicate-free, consistently-described suggestions
- **Document formatting**: aligns operands into clean columns, with an optional mode for vertically aligning data-section directives (`.asciz`, etc.)
- **Diagnostics** that catch real AArch64 encoding rules, not just typos — see below
- **Go to Definition & Outline** for jumping straight to label definitions and browsing all labels in a file
- **Workspace-wide symbol index**: functions and labels defined in any file in your project are visible everywhere — in autocomplete, Go to Definition, and the new Ctrl+T (Go to Symbol in Workspace) search. Built once on activation and kept live via a file watcher, so it stays fast even as the project grows
- **Debugging integration**: registers a `launch.json` configuration provider for the `lldb` debug type, backed by the bundled [CodeLLDB](https://github.com/vadimcn/vscode-lldb) dependency. Press F5 with no `launch.json` in the workspace and it auto-detects your build system and sets a breakpoint at `main` for you — see [Debugging](#debugging-via-codelldb) below
- **Snippets** for common boilerplate (function prologues, printf/scanf variadic calls, loops, etc.)
- Built-in directive highlighting (`.section`, `.global`, `.macro`, ...), hex/binary/decimal constants, comments, and strings
- Support for custom section macros (`CODE_SECTION`, `DATA_SECTION`, `BSS_SECTION`, ...) used by the Hun build system
- Optional Korean-mnemonic recognition (`할당`, `더함`, `적재`, ...) and Korean-language labels, for developers working in the Hun ecosystem
- **Dual-Architecture Sovereignty (ARM64 & RISC-V)**: Fully decouples from the constraints of a single architecture. Open a `.riscv` or `.v` file, and the extension instantly morphs into a pristine RISC-V environment.
- **RISC-V Language ID (`hun-riscv`)**: Native recognition for `.riscv` and `.v` extensions with isolated syntax maps, duplicate-free IntelliSense, and targeted formatting rules.

### Diagnostics in detail

- `ldp`/`stp` offset alignment and encodable-range checks
  - e.g. `ldp x29, x30, [sp], #15` → flagged for not being a multiple of 8
- `ldr`/`str` offset alignment and range checks (covers both unsigned-offset and pre/post-index addressing forms)
- Detection of nonexistent register names (`x31`, `w99`, etc.)
- Register-width mismatch warnings (pairing an `x` register with a `w` register)
- Light hints for lowercase mnemonics that look like assembly instructions but aren't in the known instruction list
- **Stack alignment (16-byte) checks**: flags `sub sp, sp, #N` / `add sp, sp, #N` and prologue `stp x29, x30, [sp, #-N]!` when N isn't a multiple of 16. AArch64 requires `sp` to stay 16-byte aligned at every function-call boundary; violating this may not crash immediately, but will as soon as the function calls another function with `bl`.
- **Local label (`.L_`) reference integrity**: warns when a branch (`b`, `bl`, `cbz`, `cbnz`, `tbz`, `tbnz`, `b.eq`, etc.) references a `.L_`-prefixed label that isn't defined anywhere in the file. Local labels can't cross file boundaries by definition, so this check can be fully confident. Global labels (e.g. `_menu_forloop`) may live in another file or external libc, so they're intentionally left to Go to Definition's workspace-wide search instead.

> Diagnostics currently emulate assembler rules with regular expressions. A future goal is to call the patched `llvm-mc`/`clang` directly and use the real assembler's own judgment.

### Hover & autocomplete

- Hovering over any mnemonic — standard or Korean-aliased — shows its canonical name and description
- Full instruction-set autocomplete, in both English and (optionally) Korean

### Go to Definition, Outline & Workspace Symbols

- **Go to Definition (F12 / Cmd+Click)**: jump straight from a label reference to its definition, resolved instantly from a live workspace-wide symbol index — no per-click rescanning, even in larger projects.
  - `.L_`-prefixed local labels are searched for within the current file only (by definition, they can't exist elsewhere).
  - Other (global) labels resolve from anywhere in the workspace. External libc symbols like `_printf` won't resolve, which is expected.
- **Ctrl+T / Cmd+T — Go to Symbol in Workspace**: search every function/label across the entire project by name.
- **Outline panel / Ctrl+Shift+O**: shows every label in the current file as a tree, with global (function) labels and `.L_` local (control-flow) labels marked with distinct icons.

### Debugging (via CodeLLDB)

Installing this extension also installs [CodeLLDB](https://github.com/vadimcn/vscode-lldb) — the actual [Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/) implementation that talks to `lldb` and drives VS Code's breakpoint/step/variable UI. This extension doesn't reimplement a debugger; it registers a `DebugConfigurationProvider` for CodeLLDB's `lldb` type and wires it up automatically for assembly projects.

- **Zero-config F5 debugging**: if you press **Run and Debug (F5)** with no `launch.json` in the workspace, the executable path is auto-detected:
  1. **Zig** (`build.zig` present) — reads the `.name = "..."` field of your `addExecutable` call and points at `zig-out/bin/<name>`.
  2. **CMake** (`CMakeLists.txt` present) — reads the target name from `add_executable(...)`; if `build/CMakeCache.txt` exists, also reads `CMAKE_BUILD_TYPE` to account for generators (e.g. Xcode) that nest a `Debug/`/`Release/` subfolder.
  3. Falls back to `${workspaceFolder}/bin/${workspaceFolderBasename}` if neither is found.

- A breakpoint at `main` **and** `_main` is set automatically (covers both Linux/ELF's bare `main` and macOS/Mach-O's underscore-prefixed `_main`), along with `settings set target.language c` — this works around an lldb limitation where hand-written `.S` files with no DWARF language tag otherwise reject `expr` commands (`Could not find type system for language assembly`).

- If a `launch.json` already exists in the workspace, your own settings are always respected — auto-detection only runs when there's nothing to go on.

### Snippets

| Prefix                 | Description                                                                      |
| ---------------------- | -------------------------------------------------------------------------------- |
| `_huninit`             | Minimal function skeleton (16 bytes, no callee-saved registers)                  |
| `_huninit_cs`          | Function skeleton preserving x19/x20 (32 bytes)                                  |
| `_huninit_macro`       | Skeleton using the `CODE_SECTION`/etc. macros                                    |
| `_huninit_macro_full`  | Skeleton using `FUNC_START_FULL`/`FUNC_EXIT_FULL` with full sections             |
| `_huninit_macro_light` | Lightweight variant of the macro-based skeleton                                  |
| `_plg` / `_eplg`       | One-line prologue / epilogue                                                     |
| `_vprintf`             | Call `printf` with variadic args pushed to the stack (required by the Apple ABI) |
| `_vscanf`              | Call `scanf` with variadic args pushed to the stack                              |
| `_lloop`               | Local-label (`.L_`) counting-loop skeleton                                       |
| `_menutbl`             | One `menu_table` entry line                                                      |
| `_csel`                | `csel` ternary pattern (max/min/conditional select)                              |
| `_rustffi`             | Call a Rust `extern "C"` function (pointer + length convention)                  |
| `_sect`                | Full section-macro block                                                         |

- `_vprintf`/`_vscanf` bake in a detail people often miss in practice: the Apple ABI's variadic-argument stacking rules.

---

- [section_macros.inc](https://github.com/ViVaKR/Hun/blob/main/Yana/include/section_macros.inc) — view on GitHub
- [Download (raw)](https://raw.githubusercontent.com/ViVaKR/Hun/main/Yana/include/section_macros.inc) — drop straight into your project

---

## Installation

### From the Open VSX Registry (Antigravity IDE, VSCodium, etc.)

1. In the Extensions panel, search for `Hun ARM64 한글 어셈블리 강조`
2. Click Install

### From a `.vsix` file

1. Download the latest `.vsix` from [Releases](https://github.com/ViVaKR/Hun/releases)
2. `Cmd+Shift+P` → `Extensions: Install from VSIX...` → select the file

## Usage

Just open a `.S`, `.s`, `.inc`, or `.asm` file — the extension activates automatically. No configuration needed.

## Customization

The extension seamlessly high-lights your assembly code even inside Markdown (`.md`) files! To let VS Code know when to apply the `Hun ARM64 Assembly` power within code blocks, you can customize your global `settings.json`.

### ⚙️ Recommended `settings.json` Configuration

Add the following to your VS Code settings to enforce precise file mapping and a custom tailored editing experience for the Hun ecosystem:

```json
{
  "files.associations": {
    "*.S": "hun-asm",
    "*.s": "hun-asm",
    "*.asm": "hun-asm",
    "*.inc": "hun-asm",
    "*.riscv": "hun-riscv", // Pure RISC-V domain perfect matching
    "*.v": "hun-riscv"      // Annexes other extensions to reign supreme!
  },

  "[hun-asm]": {
    "editor.colorDecorators": false,
    "editor.defaultFormatter": "buddham-hq.hun-asm-highlighter",
    "editor.fontSize": 18,
    "editor.wordSeparators": "`~!@#\$%^&*()-=+[{]}\\|;:'\",.<>/??",
    "editor.glyphMargin": false,
    "editor.renderWhitespace": "none"
  }
}
```

> **Note on Markdown Code Blocks:** Inside your `.md` files, use ` ```hun-asm ` or ` ```asm ` to instantly trigger full color syntax highlighting, autocomplete, and alignment mechanics.

---
## Changelog

### 🚀 v2.7.0 — Dual-Architecture Sovereignty: RISC-V Expansion & Hybrid Engine Launch
Following our established ARM64 territory, we have officially annexed **64-bit RISC-V (RV64I)**—the pure, untainted, and fully open-source architecture of humanity's shared software heritage. This release transforms the extension into a transcendent, All-in-One package capable of ruling two unique CPU universes simultaneously.

* **Declaration of a Sovereign RISC-V Language ID (`hun-riscv`)**: Officially capturing and activating native support for `.riscv` and `.v` file extensions.
* **Pristine RISC-V Register Highlighting**: Flawless recognition of `x0`–`x31`, `f0`–`f31`, and their high-status ABI aliases (`a0`–`a7`, `t0`–`t6`, `sp`, `zero`, etc.).
* **Pure, C-Free Loop Snippets**: Summon a clean counting loop (from 1 to 10) instantly via the `_vloop` prefix—engineered with zero reliance on toxic C/C++ scaffolding.
* **Suppression of Petty Visual Dilemmas**: Deployed tactical configurations to tame VS Code's stubborn JSON formatter, permanently stopping braces and properties from awkwardly warping onto new lines.

> Note on the version jump (2.6.1 → 2.7.0): This substantial leap reflects a massive expansion into a brand-new territory of processor architecture (New Feature Category). Aligned with SemVer rules, the MINOR version is aggressively promoted to v2.7.0 for this historic rollout.

### 🐛 v2.6.1 — Debug Provider Bug Fixes
Following up on v2.6.0's debugging integration, this patch fixes three real-world bugs discovered while dogfooding the feature on a fresh macOS project.

* **Breakpoint now matches both `main` and `_main`** — hand-assembled `.S` files that declare their own entry symbol following Mach-O's leading-underscore convention (e.g. scaffolded by `armcli init` on macOS) previously never hit the auto breakpoint, since only bare `main` was targeted
* **Manual "Add Configuration..." and automatic F5 detection now share one code path** (`buildLldbConfig`) — previously the manually-added config used a stale `${workspaceFolder}/bin/...` default that didn't match Zig's actual `zig-out/bin/...` output, while F5's auto-detect got it right; both now call the same `detectExecutable` logic
* **Debug Console now opens automatically** on session start (`internalConsoleOptions: "openOnSessionStart"`), instead of silently staying behind the integrated terminal
* **Removed an incorrect `contributes.debuggers` declaration** in `package.json` that could cause VS Code's extension picker to suggest this extension itself instead of CodeLLDB when `lldb` wasn't yet installed

> Why PATCH and not MINOR: no new capability was added, no configuration surface changed — these are pure bug fixes to the v2.6.0 debugging feature, so semver PATCH applies.

### 🚀 v2.6.0 — Debugging Integration (CodeLLDB)
This release adds a new capability class to the extension — debugging, not just editing. `hun-asm-highlighter` now declares [CodeLLDB](https://github.com/vadimcn/vscode-lldb) as an `extensionDependencies` entry and registers a `DebugConfigurationProvider` for its `lldb` debug type.

* **Zero-config F5 debugging**: with no `launch.json` present, pressing F5 auto-detects the executable path from `build.zig` (Zig) or `CMakeLists.txt` (+ `CMakeCache.txt` when available for the build-type subfolder), falling back to a sane default otherwise
* **Auto breakpoint at `main`**, plus an automatic `settings set target.language c` workaround for lldb's "no type system for language assembly" error on hand-written `.S` files
* User-authored `launch.json` configurations are always respected — auto-detection only fires when nothing is specified
* Purely additive: no existing highlighting/hover/diagnostics/formatting behavior changes

> Note on the version jump (2.5.2 → 2.6.0): this reflects the new `extensionDependencies` entry and a brand-new feature category (debugging), not a breaking change — hence a MINOR bump rather than a PATCH.

### 🚀 v2.5.1 — Linker Script Support & Refinements
This release extends the extension's territory to include compiler infrastructure engineering, adding first-class support for linker scripts (`linker.ld`).

* **Linker Script Syntax Highlighting**: Automatically detects and colors core linker directives (`ENTRY`, `SECTIONS`, `MEMORY`, `KEEP`, etc.) and memory properties (`ORIGIN`, `LENGTH`) inside `.ld` and `linker.ld` files
* **Enhanced Code Folding**: Structural folding rules (`#region` / `#endregion`) now seamlessly recognize both assembly line comments (`//`) and linker block comments (`/* ... */`)
* **Targeted Intelligence**: Smarter `wordPattern` configuration preserves dots (`.`) and letters unified, ensuring single-click text block selection works beautifully across both syntax environments

### 🚀 v2.5.0 — Workspace-wide IntelliSense
Autocomplete and Go to Definition used to only really know about the current file — a function defined elsewhere wouldn't show up while typing, and F12 had to reopen and rescan up to 300 files from scratch on every jump. This release replaces that with a proper in-memory symbol index, built once when the extension activates and kept live afterward via a file watcher.

* **Cross-file autocomplete**: functions and labels defined anywhere in the workspace now appear in autocomplete, with their source file shown in the detail line
* **Instant Go to Definition**: F12 now resolves from the in-memory index instead of re-scanning the workspace on every click
* **New: Ctrl+T / Cmd+T — Go to Symbol in Workspace**: search every function/label in the project by name, using VS Code's standard workspace-symbol picker
* Index updates incrementally on file save/create/delete, so it never goes stale without needing a reload

---

### 🚀 v2.4.1 — NEON/SIMD, Kernel-Level, and Scalar Completeness
This release closes three of the biggest remaining gaps in instruction coverage, adding 63 new mnemonics — all sourced from the same `arm64-data.js` file that already powers hover documentation, autocomplete, syntax highlighting, and the "unknown mnemonic" diagnostic hint, so every one of those four surfaces now agrees on the exact same 224-instruction set.

* **45 NEON/SIMD vector instructions**, aimed at the kind of code most assembly beginners actually run into first — image and audio processing:
  * Multiply-accumulate: `MLA`, `MLS`, `FMLA`, `FMLS`
  * Structured (interleaved) load/store for stereo audio and RGB/RGBA pixel data: `LD1`–`LD4`, `ST1`–`ST4`
  * Lane manipulation: `DUP`, `INS`, `UMOV`, `SMOV`
  * Table lookup / shuffle: `TBL`, `TBX`, `ZIP1`/`ZIP2`, `UZP1`/`UZP2`, `TRN1`/`TRN2`, `EXT`
  * Horizontal reductions: `ADDV`, `UMAXV`/`SMAXV`, `UMINV`/`SMINV`
  * Per-lane vector compares (produce branchless masks): `CMEQ`, `CMGT`, `CMGE`, `CMHI`, `CMHS`
  * Mask-based bitwise select: `BSL`, `BIT`, `BIF`
  * Saturating arithmetic (prevents audio clipping / pixel wraparound): `SQADD`, `UQADD`, `SQSUB`, `UQSUB`
  * Widen/narrow conversions: `SXTL`, `UXTL`, `XTN`
* **9 kernel/system instructions**, relevant to bare-metal and privileged-mode work (cache and TLB maintenance, exception levels): `DC`, `IC`, `TLBI`, `AT`, `SB`, `ERET`, `HVC`, `SMC`, `HLT`
* **9 previously-undocumented scalar instructions and aliases**, filling entries that only had a bare name (or none at all) before: `EXTR`, `CINC`, `CINV`, `CNEG`, `CSETM`, `BFXIL`, `ROR`, `UXTB`, `UXTH`

Every addition includes a full English + Korean description, official syntax, and a realistic code example — hover over any of them in the editor to see it directly.

Also published a standalone **[Mnemonic Dictionary](https://vivakr.github.io/Hun/)** (224 entries) as a GitHub Pages site, generated straight from `arm64-data.js` so it never drifts out of sync with what the extension itself shows.

### 🚀 v2.3.36 (Current) — 176 new mnemonics added to IntelliSense
* Added IntelliSense (Korean + English) for 176 additional mnemonics
* Unified code formatting and highlighting rules

### 🚀 v2.3.26 — Mnemonic alignment and more
* Added `SECTION_MACRO_RE` / `FUNC_MACRO_RE`, reusing the same section-macro/func-macro rules from `hun-asm.tmLanguage.json` so the formatter and the highlighter agree on "what counts as a macro"
* Instruction-block scanning now excludes macro calls from tab-alignment (like `.align`), stripping leading whitespace and treating them as standalone lines instead

### 🚀 v2.1.2 — Korean/English mnemonic-length alignment fix
* Instruction blocks now auto-detect the longest mnemonic per block (e.g. 3-letter `stp`/`mov` next to 4-letter `adrp`) and align all following operands into a single, perfectly straight column

### 🚀 v2.1.0
* Added a document-formatting engine, with an optional mode for vertically aligning data-section directives (`.asciz`, etc.)
* Added 11 practical snippets, including `_huninit` and the Apple-ABI-critical `_vprintf`/`_vscanf`
* Added stack-alignment and local-label-integrity diagnostics
* Added Go to Definition (workspace-wide) and Outline support

### 1.1.0
- Added snippets (`_huninit`, `_vprintf`, `_vscanf`, `_lloop`, `_csel`, `_rustffi`, and more)
- Added 16-byte stack-alignment diagnostics
- Added local-label (`.L_`) reference-integrity diagnostics
- Added Go to Definition (local labels within file, global labels workspace-wide)
- Added Outline (Document Symbols)

### 1.0.1
- Initial release: syntax highlighting, basic diagnostics (offset alignment/range, register width), hover, autocomplete

## License

MIT License

## Related Projects

- [Hun](https://github.com/ViVaKR/Hun) — the parent Korean-language OS development project

## Credits

- Design & implementation: BM. KIM BUM JUN (대제독)
- Co-developed with:
  - 제미니보살 (Gemini, Google)
  - 클로드보살 (Claude, Anthropic)

---
---

# Hun ARM64 한글 어셈블리 강조

한글 어셈블리 프로젝트 [Hun](https://github.com/ViVaKR/Hun)을 위해 만들어진 VS Code 확장이지만, 표준 ARM64 어셈블리만 쓰는 개발자에게도 그대로 유용합니다.

표준 AArch64 명령어 전체에 대한 문법 강조와 IntelliSense(호버 + 자동완성), 실제 인코딩 오류를 잡아내는 가벼운 정적 진단(diagnostics), 코드 자동 포맷, 자주 쓰는 패턴을 위한 스니펫, 라벨 탐색을 위한 Go to Definition / 아웃라인까지 제공합니다. 한글 니모닉(`할당`, `더함`, `적재`...) 지원은 이 위에 얹힌 선택적인 레이어이며, 한글 니모닉을 전혀 쓰지 않고 순수 표준 ARM64 어셈블리 용도로만 사용해도 무방합니다.

## 주요 기능

- 데이터 이동, 산술, 논리, 분기, 부동소수점/NEON, 원자적 연산, 포인터 인증, 시스템 명령어를 포함한 표준 AArch64 니모닉 전체 강조
- 레지스터 강조: `x0`~`x30`, `w0`~`w30`, `sp`, `lr`, `fp`, 그리고 벡터 element/lane 표기(`v0.4s`, `v1.2d[0]`)까지 포함한 FP/SIMD 레지스터 `d`/`q`/`s`/`h`/`v`
- 호버 문서: 니모닉에 마우스를 올리면 정식 명칭과 설명 표시
- 명령어 전체에 대한 자동완성(IntelliSense), 중복 없이 일관된 설명 제공
- 문서 자동 포맷: 오퍼랜드를 깔끔하게 정렬하며, 데이터 섹션 지시어(`.asciz` 등) 세로 정렬 옵션 제공
- 단순 오타 검출을 넘어 실제 AArch64 인코딩 규칙을 검사하는 진단 기능 (아래 참고)
- 라벨 정의로 바로 이동하는 Go to Definition 및 아웃라인
- **워크스페이스 전역 심볼 인덱스**: 프로젝트 안 어떤 파일에 정의한 함수/라벨이든 자동완성, Go to Definition, 새로 추가된 Ctrl+T(워크스페이스 심볼 검색) 어디서나 보입니다. 확장 켜질 때 한 번 구축한 뒤 파일 변경 감시로 계속 최신 상태를 유지하므로, 프로젝트가 커져도 속도가 유지됩니다
- **디버깅 통합**: `lldb` 디버그 타입용 `launch.json` 설정 제공자로 등록되며, 함께 설치되는 [CodeLLDB](https://github.com/vadimcn/vscode-lldb) 확장이 실제 디버거 연동을 담당합니다. 워크스페이스에 `launch.json`이 없는 상태로 F5를 누르면 빌드 시스템을 자동 감지해 실행파일 경로를 채우고 `main`에 자동으로 브레이크포인트를 걸어줍니다 — 아래 [디버깅](#디버깅-codelldb-기반) 항목 참고
- 흔히 쓰는 상용구를 위한 스니펫 (함수 프롤로그, printf/scanf variadic 호출, 반복문 등)
- `.section`, `.global`, `.macro` 등 내장 지시어 강조, 16진수/2진수/10진수 상수, 주석, 문자열 강조

- Hun 빌드 시스템이 쓰는 커스텀 섹션 매크로 지원 (`CODE_SECTION`, `DATA_SECTION`, `BSS_SECTION` 등)

- 선택적인 한글 니모닉(`할당`, `더함`, `적재` 등) 및 한글 라벨 인식

- **듀얼 아키텍처 독립 선포 (ARM64 & RISC-V)**: 단일 아키텍처의 쇠사슬을 끊어냈습니다. `.riscv` 또는 `.v` 파일을 여는 순간, 오직 RISC-V만을 위한 청정한 한글/영문 문법 렌즈가 즉각 발동합니다.

- **RISC-V 전용 식별자 (`hun-riscv`)**: 독자적인 확장자 지원을 통해 ARM64와의 간섭을 완벽히 차단하고, 가장 정갈한 순수 기계어 조립 환경을 하사합니다.

### 기본 진단 (Diagnostics)

- `ldp`/`stp` (`쌍적재`/`쌍저장`) 오프셋 정렬 및 인코딩 범위 검사
  - 예: `ldp x29, x30, [sp], #15` → 8의 배수가 아니라는 오류 표시
- `ldr`/`str` (`적재`/`저장`) 오프셋 정렬 및 범위 검사 (unsigned-offset / pre·post-index 형태 구분)
- 존재하지 않는 레지스터 이름 검출 (`x31`, `w99` 등)
- 레지스터 폭 불일치 경고 (`x`와 `w`를 짝으로 묶은 경우)
- 목록에 없는 영문 니모닉에 대한 가벼운 힌트
- **스택 정렬(16바이트) 검사**: `sub sp, sp, #N` / `add sp, sp, #N` 및 프롤로그의 `stp x29, x30, [sp, #-N]!`에서 N이 16의 배수가 아니면 경고. AArch64는 함수 호출 경계에서 sp가 항상 16의 배수를 유지해야 하며, 이를 어기면 당장은 안 터져도 다른 함수를 호출하는 순간 크래시로 이어질 수 있습니다.
- **로컬 라벨(`.L_`) 참조 무결성 검사**: `b`, `bl`, `cbz`, `cbnz`, `tbz`, `tbnz`, `b.eq` 등으로 `.L_`로 시작하는 라벨을 참조하는데 정작 해당 라벨이 파일 안에 정의돼 있지 않으면 경고. (`.L_` 라벨은 정의상 파일 경계를 벗어날 수 없으므로, 여기서는 확신을 갖고 검사할 수 있습니다. 반대로 `_menu_forloop` 같은 전역 라벨은 다른 파일이나 외부 libc에 있을 수 있어 diagnostics에서는 다루지 않고, 아래 Go to Definition에서 워크스페이스 전체를 훑어 처리합니다.)

> 현재는 확장 자체가 규칙을 정규식으로 흉내내는 방식입니다. 향후 패치된 `llvm-mc`/`clang`을 직접 호출해 실제 어셈블러의 판정을 그대로 가져오는 방식으로 발전시킬 예정입니다.

### 호버 & 자동완성

- `적재`/`저장`/`쌍적재`/`쌍저장`에 마우스를 올리면 대응하는 영문 니모닉과 설명 표시
- 한글/영문 니모닉 전체 목록에 대한 자동완성 후보 제공

### 정의로 이동, 아웃라인 & 워크스페이스 심볼 검색

- **Go to Definition (F12 / Cmd+클릭)**: 라벨 참조 위에서 실행하면 실시간 워크스페이스 전역 심볼 인덱스에서 즉시 정의로 이동합니다 — 클릭할 때마다 재스캔하지 않으므로 프로젝트가 커져도 빠릅니다.
  - `.L_`로 시작하는 로컬 라벨은 현재 파일 안에서만 찾습니다 (정의상 파일을 못 벗어나므로).
  - 그 외 전역 라벨은 워크스페이스 어디에 정의되어 있든 인덱스에서 바로 찾습니다. `_printf`처럼 외부 libc 함수는 자연스럽게 이동하지 않습니다 (정상 동작입니다).
- **Ctrl+T / Cmd+T — 워크스페이스 심볼 검색**: 프로젝트 전체 함수/라벨을 이름으로 검색합니다.
- **아웃라인 패널 / Ctrl+Shift+O**: 파일 안의 모든 라벨을 트리로 보여줍니다. 전역 라벨(함수)과 `.L_` 로컬 라벨(흐름 제어)을 서로 다른 아이콘으로 구분합니다.

### 디버깅 (CodeLLDB 기반)

이 확장을 설치하면 [CodeLLDB](https://github.com/vadimcn/vscode-lldb)도 함께 설치됩니다 — `lldb`와 실제로 통신하면서 VS Code의 브레이크포인트/스텝 실행/변수뷰 UI를 구동하는 진짜 [Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/) 구현체입니다. 이 확장은 디버거를 직접 재구현하지 않고, CodeLLDB의 `lldb` 타입에 `DebugConfigurationProvider`를 등록해서 어셈블리 프로젝트에 맞게 자동으로 연결해줄 뿐입니다.

- **설정 없이 F5로 바로 디버깅**: 워크스페이스에 `launch.json`이 없는 상태로 **Run and Debug (F5)**를 누르면 실행파일 경로를 자동으로 찾습니다:
  1. **Zig** (`build.zig`가 있는 경우) — `addExecutable` 호출의 `.name = "..."` 필드를 읽어 `zig-out/bin/<이름>`을 가리킵니다.
  2. **CMake** (`CMakeLists.txt`가 있는 경우) — `add_executable(...)`에서 타겟 이름을 읽고, `build/CMakeCache.txt`가 있으면 `CMAKE_BUILD_TYPE`까지 읽어서 Xcode 제너레이터처럼 `Debug/`/`Release/` 하위 폴더가 끼는 경우까지 반영합니다.
  3. 둘 다 없으면 `${workspaceFolder}/bin/${workspaceFolderBasename}`로 폴백합니다.
- `main`에 자동으로 브레이크포인트를 걸고, `settings set target.language c`도 같이 적용합니다 — DWARF 언어 태그가 없는 순수 `.S` 손코딩 파일에서 `expr` 커맨드가 `Could not find type system for language assembly` 에러로 거부되는 lldb의 한계를 미리 우회하기 위함입니다.
- 워크스페이스에 이미 `launch.json`이 있다면 그 설정을 항상 우선합니다 — 자동 감지는 아무 설정도 없을 때만 동작합니다.

### 스니펫

| Prefix                 | 내용                                                            |
| ---------------------- | --------------------------------------------------------------- |
| `_huninit`             | 기본 함수 뼈대 (16바이트, callee-saved 없음)                    |
| `_huninit_cs`          | x19/x20 보존이 필요한 함수 뼈대 (32바이트)                      |
| `_huninit_macro`       | `CODE_SECTION` 등 매크로를 쓰는 버전                            |
| `_huninit_macro_full`  | `FUNC_START_FULL`/`FUNC_EXIT_FULL`을 쓰는 전체 섹션 버전        |
| `_huninit_macro_light` | 매크로 버전의 경량화 버전                                       |
| `_plg` / `_eplg`       | 프롤로그 / 에필로그 한 줄                                       |
| `_vprintf`             | printf variadic 인자를 스택에 실어서 호출 (Apple ABI 필수 패턴) |
| `_vscanf`              | scanf variadic 인자를 스택에 실어서 호출                        |
| `_lloop`               | 로컬 라벨(`.L_`) 카운팅 루프 뼈대                               |
| `_menutbl`             | `menu_table` 항목 한 줄                                         |
| `_csel`                | `csel` 삼항연산 (max/min/조건선택)                              |
| `_rustffi`             | Rust `extern "C"` 함수 호출 (ptr+len 방식)                      |
| `_sect`                | 섹션 매크로 전체 블록                                           |

>- `_vprintf`/`_vscanf`는 실전에서 자주 놓치는 부분을 그대로 담았습니다.

---

>- [section_macros.inc](https://github.com/ViVaKR/Hun/blob/main/Yana/include/section_macros.inc) — GitHub에서 바로 열람
>- [Download (raw)](https://raw.githubusercontent.com/ViVaKR/Hun/main/Yana/include/section_macros.inc) — 프로젝트에 바로 받아쓰기

---

## 설치 방법

### Open VSX Registry에서 설치 (Antigravity IDE, VSCodium 등)

1. 확장(Extensions) 패널에서 `Hun ARM64 한글 어셈블리 강조` 검색
2. Install 클릭

### VSIX 파일로 직접 설치

1. [Releases](https://github.com/ViVaKR/Hun/releases)에서 최신 `.vsix` 파일 다운로드
2. `Cmd+Shift+P` → `Extensions: Install from VSIX...` → 파일 선택

## 사용법

`.S`, `.s`, `.inc`, `.asm` 확장자 파일을 열면 자동으로 적용됩니다. 별도 설정 불필요.

## 사용자 설정 가이드

본 확장은 일반 어셈블리 파일뿐만 아니라, 마크다운(`.md`) 문서 내부의 코드 블록 안에서도 강력한 하이라이팅을 그대로 지원합니다! VS Code가 마크다운 내에서 `Hun ARM64 한글 어셈블리` 엔진을 정확히 호출할 수 있도록 `settings.json` 설정을 최적화해 주세요.

### ⚙️ 추천 `settings.json` 환경 설정

VS Code의 전역 설정 파일(`settings.json`)에 아래 내용을 추가하면, 파일 확장자 자격 서열 정리 및 오직 훈(Hun) 에코시스템만을 위한 명품 편집기 환경이 완성됩니다.

```json
{
  "files.associations": {
    "*.S": "hun-asm",
    "*.s": "hun-asm",
    "*.asm": "hun-asm",
    "*.inc": "hun-asm",
    "*.riscv": "hun-riscv", // 청정 RISC-V 도메인 완벽 매칭
    "*.v": "hun-riscv"      // 타사 언어를 제압하고 서열 1위로 군림!
  },

  "[hun-asm]": {
    "editor.colorDecorators": false,
    "editor.defaultFormatter": "buddham-hq.hun-asm-highlighter",
    "editor.fontSize": 18,
    "editor.wordSeparators": "`~!@#\$%^&*()-=+[{]}\\|;:'\",.<>/??",
    "editor.glyphMargin": false,
    "editor.renderWhitespace": "none"
  }
}
```

> **💡 마크다운 작성 팁:** `.md` 파일 본문에서 코드 블록을 열 때 **` ```hun-asm `** 또는 **` ```asm `** 식별자를 적어주시면 훈 프로젝트 전용 한글 니모닉과 매크로 색상 렌즈가 즉각 발동합니다.

---

## 변경 이력

### 🚀 v2.7.0 — RISC-V 아키텍처 영토 확장 및 듀얼 엔진 선포 (Dual-Architecture Sovereignty)
기존 ARM64 진형에 이어, 인류의 청정 유산이자 완전 자유 오픈소스 아키텍처인 **RISC-V 64비트(RV64I)** 영토를 정식 합병했습니다. 확장팩 하나로 두 개의 우주를 동시에 지배하는 초월적 올인원(All-in-One) 패키지 체제입니다.

* **독자적 RISC-V 언어 식별자 (`hun-riscv`) 선포**: `.riscv` 및 `.v` 확장자 파일 공식 포획 활성화.
* **정갈한 RISC-V 레지스터 문법 하이라이팅**: `x0~x31`, `f0~f31` 및 고품격 ABI 별명(`a0~a7`, `t0~t6`, `sp`, `zero` 등) 완벽 인식.
* **C의 잔재가 없는 순수 루프 스니펫 장착**: `_vloop` 입력 시 1부터 10까지 누적 합산하는 청정 반복문 뼈대 즉시 생성.
* **사소한 비주얼 딜레마 진압**: 중괄호와 속성값들이 멋대로 줄 바꿈되어 늘어지던 VS Code json 포맷터 똥고집 제어 옵션 탑재.

> Note on the version jump (2.6.1 → 2.7.0): RISC-V 아키텍처 지원이라는 거대한 신규 영토 확장(New Feature Category)이 이루어졌으므로, SemVer 규칙에 따라 MINOR 버전을 2.7.0으로 대폭 격상하여 반포합니다.

### 🐛 v2.6.1 — 디버그 프로바이더 버그 수정
v2.6.0의 디버깅 통합 기능을 실제 macOS 프로젝트에서 써보며 발견된 버그 3건을 수정한 패치입니다.

* **브레이크포인트가 `main`과 `_main` 둘 다 매칭**되도록 수정 — Mach-O 언더스코어 관례를 따르는(예: macOS에서 `armcli init`으로 생성한) `.S` 진입점 심볼이 `_main`인 경우, 기존엔 `main`만 찾아서 브레이크포인트가 전혀 안 걸리던 문제
* **"Add Configuration..." 수동 설정과 F5 자동 감지가 이제 같은 로직(`buildLldbConfig`)을 공유** — 예전엔 수동 설정만 옛 기본값(`${workspaceFolder}/bin/...`)을 쓰다가 Zig의 실제 출력 경로(`zig-out/bin/...`)와 안 맞던 불일치 제거
* **디버그 세션 시작 시 DEBUG CONSOLE이 자동으로 포커스**되도록 (`internalConsoleOptions: "openOnSessionStart"`) — 예전엔 통합 터미널 뒤에 조용히 숨어있어 입력이 안 먹히는 것처럼 보이던 문제
* **`package.json`의 잘못된 `contributes.debuggers` 선언 제거** — CodeLLDB 미설치 상태에서 확장 추천 검색창에 이 확장 자신이 엉뚱하게 뜨던 문제

> PATCH인 이유: 새 기능 추가도, 설정 인터페이스 변경도 없이 v2.6.0 디버깅 기능의 순수 버그 수정이라 SemVer PATCH가 맞습니다.

### 🚀 v2.6.0 — 디버깅 통합 (CodeLLDB)
이번 릴리스는 확장의 영역을 "편집"에서 "디버깅"까지 넓힙니다. `hun-asm-highlighter`가 이제 [CodeLLDB](https://github.com/vadimcn/vscode-lldb)를 `extensionDependencies`로 선언하고, 그 확장의 `lldb` 디버그 타입에 `DebugConfigurationProvider`를 등록합니다.

* **설정 없이 F5로 바로 디버깅**: `launch.json`이 없어도 F5를 누르면 `build.zig`(Zig) 또는 `CMakeLists.txt`(+ 가능하면 `CMakeCache.txt`로 빌드 타입 하위 폴더까지 반영)에서 실행파일 경로를 자동 감지하고, 둘 다 없으면 합리적인 기본값으로 폴백
* **`main`에 자동 브레이크포인트** 설정, 손코딩 `.S` 파일에서 DWARF 언어 태그 부재로 `expr`이 거부되는 lldb 문제를 미리 우회하는 `settings set target.language c` 자동 적용
* 워크스페이스에 이미 `launch.json`이 있으면 항상 그 설정을 우선 — 자동 감지는 아무것도 없을 때만 동작
* 순수 추가 기능: 기존 문법강조/호버/진단/포맷 동작에는 아무 영향 없음

> 버전이 2.5.2 → 2.6.0으로 뛴 이유: 새로운 `extensionDependencies` 등록과 완전히 새로운 기능 범주(디버깅) 추가를 반영한 것으로, 기존 기능을 깨는 변경(breaking change)은 아니라서 PATCH가 아닌 MINOR 증가로 처리했습니다.

### 🚀 v2.5.1 — 링커 스크립트 지원 및 코드 접기 보강
이번 릴리스는 컴파일러 인프라 엔지니어링 영역까지 확장하여, 시스템 빌드의 뼈대인 링커 스크립트(`linker.ld`)를 공식 지원합니다.

* **링커 스크립트 문법 강조**: `.ld` 확장자 및 `linker.ld` 파일 포획 활성화. `ENTRY`, `SECTIONS`, `MEMORY`, `KEEP` 등의 핵심 지시어와 메모리 주소 속성들이 칼같이 화려한 색상으로 강조됩니다.
* **링커/어셈블리 통합 코드 접기**: 대형 구조화 접기 기능(`#region`)이 어셈블리용 한 줄 주석(`//`)뿐만 아니라 링커용 블록 주석(`/* ... */`)도 완벽하게 감지하도록 방어 장갑을 보강했습니다.
* **단어 인식 최적화**: 링커 스크립트 환경과 조화를 이루도록 단어 판정 정규식을 조율하여, 더블 클릭 한 번에 식별자와 라벨이 쪼개지지 않고 깔끔하게 한 덩어리로 선택됩니다.

### 🚀 v2.5.0 — 워크스페이스 전역 인텔리센스
지금까지 자동완성과 Go to Definition은 사실상 현재 파일만 알고 있었습니다 — 다른 파일에 정의한 함수는 타이핑 중 자동완성에 안 뜨고, F12를 누를 때마다 워크스페이스 파일을 최대 300개까지 매번 새로 열어 처음부터 다시 훑었습니다. 이번 릴리스는 이걸 제대로 된 인메모리 심볼 인덱스로 교체했습니다 — 확장이 켜질 때 한 번 구축하고, 이후로는 파일 변경 감시(watcher)로 계속 최신 상태를 유지합니다.

* **파일 간 자동완성**: 워크스페이스 어디에 정의한 함수/라벨이든 자동완성에 뜨고, detail 줄에 어느 파일 출처인지 표시
* **즉시 반응하는 Go to Definition**: F12가 매번 재스캔하는 대신 인메모리 인덱스에서 바로 조회
* **신규: Ctrl+T / Cmd+T — 워크스페이스 심볼 검색**: 프로젝트 전체 함수/라벨을 이름으로 검색 (VS Code 표준 워크스페이스 심볼 피커)
* 파일 저장/생성/삭제 시 인덱스가 증분 갱신되어, 리로드 없이도 항상 최신 상태 유지

### 🚀 v2.3.36 (Current Release) - 신규 니모닉 176종 인텔리센스 한/영 추가
* 니모닉 인텔리센스 176종 추가
* 코드 포맷 및 하이라이터 통합 적용

### 🚀 v2.3.26 (Current Release) - 니모닉 정렬외
* SECTION_MACRO_RE / FUNC_MACRO_RE 두 정규식을 새로 추가
* hun-asm.tmLanguage.json의 section-macros/func-macros 규칙을 그대로 재사용해서 포맷터와 하이라이터가 "매크로가 뭔지"에 대해 같은 기준을 쓰게 만듦
* 명령어 블록 탐색 루프에서, mnemonic이 저 매크로 패턴에 걸리면 → .align처럼 탭 정렬 대상에서 빼고, 왼쪽 공백/탭을 강제로 제거한 뒤 단독 편집으로 처리하고 블록을 끊음

### 🚀 v2.1.2 (Current Release) — 🔥 천년의 한(한글/영문 정렬 불일치) 치유 패치!
* ✨ **명령어 블록별 니모닉 길이 자동 감지 및 오퍼랜드 칼군무 정렬 기능 탑재**
  * 이제 `stp`, `mov` 같은 3글자 명령어와 `adrp` 같은 4글자(혹은 그 이상) 명령어가 연속으로 배치되어도, 포맷터가 블록 내 최대 길이를 자동으로 계산하여 공백을 조율합니다.
  * 뒤따라오는 오퍼랜드(`x10`, `x29` 등) 라인이 단 0.0001mm의 오차도 없이 일직선으로 완벽하게 일렬종대 정렬됩니다! 눈과 마음이 편안해지는 장인 정신의 정렬을 경험해 보세요.

### 🚀 v2.1.0 (Current Release)

* ✨ **자동 포맷(Document Formatting) 엔진 탑재 및 칼군무 옵션 추가**
  * 데이터 섹션(`.asciz` 등) 지시어 세로 일렬종대 정렬 기능 제공 (설정에서 온/오프 가능)
* ⚡ **실전 압축형 스니펫(Snippets) 11종 대거 추가**
  * `_huninit`(기본 함수 뼈대), Apple ABI 필수 패턴인 `_vprintf`/`_vscanf` 등 완비
* 🩺 **스택 및 로컬 라벨 무결성 정적 진단(Diagnostics) 추가**
  * AArch64 스택 16바이트 정렬 검사 및 로컬 라벨(`.L_`) 참조 오류 경고 추가
* 🗺️ **초고속 탐색 기능 지원 (Go to Definition & 아웃라인)**
  * `F12` / `Cmd+클릭` 시 워크스페이스 전체를 훑어 라벨 정의로 바로 이동
  * `Ctrl+Shift+O`로 전역/로컬 라벨을 트리 구조로 한눈에 파악 가능

### 1.1.0

- 스니펫 추가 (`_huninit`, `_vprintf`, `_vscanf`, `_lloop`, `_csel`, `_rustffi` 등 11종)
- 스택 정렬(16바이트) 진단 추가
- 로컬 라벨(`.L_`) 참조 무결성 진단 추가
- Go to Definition 추가 (로컬 라벨은 파일 내, 전역 라벨은 워크스페이스 전체 검색)
- 아웃라인(Document Symbols) 추가

### 1.0.1

- 초기 배포: 문법 강조, 기본 진단(오프셋 정렬/범위, 레지스터 폭), hover, 자동완성

## 라이선스

MIT License

## 관련 프로젝트

- 📖 **[Browse the full Mnemonic Dictionary →](https://vivakr.github.io/Hun/)** — every instruction, hover-for-hover the same as what you see in the editor.
- [Hun](https://github.com/ViVaKR/Hun) — 한글 OS 개발 프로젝트 본체

## 제작진

- 기획/구현: BM. KIM BUM JUN (대제독)
- 공동 개발:
  - 제미니보살 (Gemini, Google)
  - 클로드보살 (Claude, Anthropic)

---
