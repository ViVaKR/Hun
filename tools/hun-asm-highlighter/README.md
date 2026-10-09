# Hun Assembly Highlighter (ARM64 & RISC-V)

[![Version](https://img.shields.io/visual-studio-marketplace/v/buddham-hq.hun-asm-highlighter)](https://marketplace.visualstudio.com/items?itemName=buddham-hq.hun-asm-highlighter)
[![📖 Mnemonic Dictionary](https://img.shields.io/badge/📖_Mnemonic_Dictionary-224+_instructions-brightgreen)](https://vivakr.github.io/Hun/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

A high-performance VS Code extension engineered for **AArch64 / ARM64** and **64-bit RISC-V (RV64GC)** bare-metal & kernel development — originally built for the [Hun](https://github.com/ViVaKR/Hun) operating system project, and perfectly suited for anyone writing pure, high-precision assembly and linker scripts.

It delivers rich syntax highlighting, dual-architecture IntelliSense (hover + autocomplete), lightweight static diagnostics, clean code formatting, boilerplate snippets, and cross-file label navigation (Go to Definition & Outline). Korean-mnemonic support (`할당`, `더함`, `적재`...) is seamlessly integrated as an optional layer on top.

---

## 🌟 Key Features

- **Dual-Architecture Sovereignty (ARM64 & RISC-V)**: Isolated syntax engines and IntelliSense for both ARM64 (`hun-asm`) and RISC-V (`hun-riscv`, `.riscv`, `.rv`, `.rvmacros`, `.rvinclude`).
- **Encyclopedic Hover & Autocomplete**: Real-time popups with official syntax, rich bilingual (EN/KO) descriptions, and verified code examples.
- **Linker Script Mastery (`.ld`, `linker.ld`)**: Full syntax highlighting for `ENTRY`, `SECTIONS`, `MEMORY`, `PHDRS`, and specialized memory sections (`.rodata`, `.srodata`, etc.) with diagnostic immunity.
- **Zero-Config LLDB Debugging**: Seamlessly backed by [CodeLLDB](https://github.com/vadimcn/vscode-lldb) with auto-detection for Zig (`build.zig`) and CMake builds.
- **Strict Static Diagnostics**: Real encoding checks (16-byte stack alignment, pair offsets, invalid registers, local label integrity) without false positives.
- **Workspace-wide Symbol Index**: Instant Go to Definition (F12) and Workspace Symbol Search (Ctrl+T / Cmd+T) across your entire repository.
- **Sovereign Code Formatter**: Dynamic operand alignment, standalone comment normalization, and table-like `.asciz`/data formatting.

---

## ⚙️ Recommended `settings.json` Configuration

Add the following to your VS Code `settings.json` for the ultimate assembly workspace setup:

```json
{
  "files.associations": {
    "*.S": "hun-asm",
    "*.s": "hun-asm",
    "*.asm": "hun-asm",
    "*.inc": "hun-asm",
    "*.ld": "hun-asm",
    "*.riscv": "hun-riscv",
    "*.rv": "hun-riscv",
    "*.rvmacros": "hun-riscv",
    "*.rvinclude": "hun-riscv"
  },

  "material-icon-theme.files.associations": {
    "*.riscv": "assembly",
    "*.rv": "assembly",
    "*.rvmacros": "assembly",
    "*.rvinclude": "assembly",
    "*.ld": "settings"
  },

  "[hun-asm]": {
    "editor.colorDecorators": false,
    "editor.defaultFormatter": "buddham-hq.hun-asm-highlighter",
    "editor.fontSize": 14,
    "editor.wordSeparators": "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?",
    "editor.glyphMargin": false
  },

  "[hun-riscv]": {
    "editor.colorDecorators": false,
    "editor.defaultFormatter": "buddham-hq.hun-asm-highlighter",
    "editor.fontSize": 14,
    "editor.wordSeparators": "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?",
    "editor.glyphMargin": false
  }
}
```

---

## 👑 Sovereign Orchestration & Companion CLI

The Hun ecosystem provides both VS Code palette commands and Homebrew CLI tools to scaffold pure bare-metal assembly infrastructure in milliseconds.

### 1. In-Editor Scaffolding (Command Palette)
Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) and type `Hun-ASM`:
* **`Hun-ASM: Create Shared Macro Include File (.inc)`** — Deploys `hun.macros.inc` into your workspace root.
* **`Hun-ASM: Create .NET 10 Tuxedo Orchestrator (hun-build.cs)`** — Deploys a zero-dependency, single-file `.NET 10 File-based App` build orchestrator.

### 2. Companion Homebrew CLIs (`armcli` & `riscvcli`)
For **complete multi-language project generation**, install our sovereign CLIs via Homebrew:

```bash
# Tap the sovereign armory
brew tap ViVaKR/armcli
brew tap ViVaKR/riscvcli

# Install both architecture commanders
brew install armcli riscvcli
```

#### 🛡️ `armcli` — AArch64 / ARM64 Project Generator
Scaffolds complete ARM64 workspaces wired with Zig, .NET 10, PowerShell 7, and optional FFI runtime libraries:
```bash
# Scaffold with Rust, Go, .NET libraries and PowerShell orchestrator
armcli init -n DemoARM -o . --rust --go --dotnet --pwsh

# Fast assembly file generation
armcli new my_func -t function
```

#### 🏹 `riscvcli` — RV64GC / RV32 Bare-Metal QEMU Generator
Scaffolds pristine RISC-V bare-metal projects (`Boot.riscv`, `Main.riscv`, `link.ld`, UART platform runtime, and 3-way orchestrators):
```bash
# Standard QEMU virt bare-metal project
riscvcli init -n FineThanksAndYou -o .

# Full options: Rust(no_std) staticlib + PowerShell 7 orchestrator
riscvcli init -n CoreRISCV -o . --rust --pwsh --xlen 64

# Single file generation (function, loop, bare, uart)
riscvcli new my_loop -t loop --xlen 64
riscvcli new my_bare -t bare --rv       # Pure .rv without cpp preprocessor

# System toolchain & QEMU health check
riscvcli doctor
```

#### ⚡ Triple-Orchestrator Execution Matrix
Every project scaffolded by `armcli` and `riscvcli` ships ready to build and run across three distinct orchestrators:

| Orchestrator | Execution Command | Requirements | Best For |
| :--- | :--- | :--- | :--- |
| **Zig Engine** | `zig build run` | Zig 0.13+ (Internal LLVM/Clang) | Zero-dependency bare-metal builds |
| **.NET 10 Tuxedo** | `dotnet ./hun-build.cs` | .NET 10 SDK (`dotnet`) | Blazing-fast 1ms single-file compilation |
| **PowerShell 7** | `pwsh ./hun-build.ps1` | PowerShell 7 (`pwsh`) | Cross-platform shell automation & CI/CD |

---

## 📜 Changelog

### 🚀 v2.8.0 — Dual-Architecture Empire & Sovereign Intelligence (천하통일 대개벽)
* **RISC-V (RV64GC) 대백과사전 인텔리센스 장착**: `li`, `la`, `addi`, `sd`, `ecall` 등 핵심 베어메탈 명령어에 대한 정밀 Syntax 및 Example 호버 팝업 완비.
* **CSR & ABI 레지스터 완벽 지원**: `mstatus`, `mtvec`, `mepc` 등 M-Mode 특권 레지스터 및 ABI 관용 레지스터(`ra`, `sp`, `a0`~`a7`, `t0`~`t6` 등)의 역할과 보존 규약(Caller/Callee-saved) 해설 제공.
* **링커 스크립트(`.ld`) 군사 보호 구역 설정**: `.ld` 파일에 대한 어셈블러 정적 진단 오탐(False Positive)을 원천 차단하고, `.rodata`, `.srodata` 등 소형 데이터/읽기 전용 섹션 하이라이팅 지원.
* **공통 지시어(`.equ`, `.global`, `.asciz`) 크로스 플랫폼 호버 연동**: ARM64와 RISC-V 문서 전역에서 심볼 상수와 지시어 백과사전이 즉각 발동하도록 통합.
* **쌍두독수리 CLI 지원 명시 (`armcli` & `riscvcli`)**: `--pwsh`, `--rust`, `--go`, `--dotnet` 전천후 오케스트레이션 및 프로젝트 템플릿 완벽 가이드 탑재.

<details>
<summary>📜 이전 변경 이력 보기 (v1.0.1 ~ v2.7.8)</summary>

### 🐛 v2.7.8 — 마크다운 미리보기 구문 강조 누락 버그 수정
* injection grammar 최상위 `scopeName` 선언 보강.

### 🚀 v2.7.0 — RISC-V 아키텍처 영토 확장 및 듀얼 엔진 선포
* 독자적 RISC-V 언어 식별자 (`hun-riscv`) 및 `.riscv`, `.rv` 확장자 공식 포획.

### 🚀 v2.6.0 — 디버깅 통합 (CodeLLDB)
* F5 원클릭 자동 실행 파일 감지 및 `main`/`_main` 자동 브레이크포인트 연동.

### 🚀 v2.5.0 — 워크스페이스 전역 인텔리센스
* 인메모리 심볼 인덱스 탑재로 대규모 프로젝트에서도 실시간 F12 정의 이동 및 Ctrl+T 전역 검색 지원.

### 🚀 v2.1.2 — 한글/영문 니모닉 칼군무 정렬 패치
* 명령어 블록별 니모닉 최대 길이를 자동 계산하여 오퍼랜드 칼군무 정렬.
</details>

---

# Hun ARM64 & RISC-V 한글 어셈블리 강조

한글 어셈블리 프로젝트 [Hun](https://github.com/ViVaKR/Hun)을 위해 만들어진 VS Code 확장이지만, 표준 ARM64 및 RISC-V 어셈블리만 쓰는 개발자에게도 완벽한 개발 환경을 제공합니다.

표준 AArch64 및 RV64GC 명령어 전체에 대한 문법 강조와 IntelliSense(호버 + 자동완성), 실제 인코딩 오류를 잡아내는 정적 진단(diagnostics), 코드 자동 포맷, 스니펫, 라벨 탐색(F12 / 아웃라인)까지 지원합니다.

## 주요 기능 요약

- **듀얼 아키텍처 지원 (ARM64 & RISC-V)**: `.S`, `.s`, `.inc`, `.asm`과 `.riscv`, `.rv` 독립 식별 및 분리 하이라이팅.
- **백과사전식 호버 및 자동완성**: 명령어 공식 문법(Syntax), 영/한 상세 해설, 실전 예제(Example) 즉각 팝업.
- **링커 스크립트(`.ld`) 완벽 지원**: 메모리 구역 및 섹션(`.rodata`, `.srodata` 포함) 하이라이팅, 정적 진단 오탐 면제.
- **F5 원클릭 무설정 디버깅**: CodeLLDB 기반 자동 빌드 타깃 탐색 및 `main`/`_main` 자동 브레이크포인트.
- **엄격한 인코딩 정적 진단**: 16바이트 스택 정렬, 레지스터 폭 불일치, `.L_` 로컬 라벨 무결성 검증.
- **초고속 전역 심볼 인덱스**: 프로젝트 전체 라벨 실시간 추적 및 Ctrl+T 전역 심볼 검색.
- **무기고 CLI 연동**: `armcli` 및 `riscvcli`를 통한 원클릭 프로젝트 생성 및 3종 오케스트레이터(`zig`, `dotnet`, `pwsh`) 완벽 호환.

---

## License

MIT License © BM. KIM BUM JUN (대제독)

## 관련 프로젝트

- 📖 **[Browse the Mnemonic Dictionary →](https://vivakr.github.io/Hun/)**
- [Hun Project Main Repository](https://github.com/ViVaKR/Hun)
- [armcli GitHub](https://github.com/ViVaKR/armcli)
- [riscvcli GitHub](https://github.com/ViVaKR/riscvcli)
