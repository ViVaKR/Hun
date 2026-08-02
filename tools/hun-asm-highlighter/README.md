# Hun ARM64 Assembly Highlighter

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
- **Snippets** for common boilerplate (function prologues, printf/scanf variadic calls, loops, etc.)
- Built-in directive highlighting (`.section`, `.global`, `.macro`, ...), hex/binary/decimal constants, comments, and strings
- Support for custom section macros (`CODE_SECTION`, `DATA_SECTION`, `BSS_SECTION`, ...) used by the Hun build system
- Optional Korean-mnemonic recognition (`할당`, `더함`, `적재`, ...) and Korean-language labels, for developers working in the Hun ecosystem

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

### Go to Definition & Outline

- **Go to Definition (F12 / Cmd+Click)**: jump straight from a label reference to its definition.
  - `.L_`-prefixed local labels are searched for within the current file only (by definition, they can't exist elsewhere).
  - Other (global) labels are searched across the whole workspace if not found in the current file. External libc symbols like `_printf` won't resolve, which is expected.
- **Outline panel / Ctrl+Shift+O**: shows every label in the file as a tree, with global (function) labels and `.L_` local (control-flow) labels marked with distinct icons.

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

## Changelog

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
- 흔히 쓰는 상용구를 위한 스니펫 (함수 프롤로그, printf/scanf variadic 호출, 반복문 등)
- `.section`, `.global`, `.macro` 등 내장 지시어 강조, 16진수/2진수/10진수 상수, 주석, 문자열 강조
- Hun 빌드 시스템이 쓰는 커스텀 섹션 매크로 지원 (`CODE_SECTION`, `DATA_SECTION`, `BSS_SECTION` 등)
- 선택적인 한글 니모닉(`할당`, `더함`, `적재` 등) 및 한글 라벨 인식

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

### 정의로 이동 & 아웃라인

- **Go to Definition (F12 / Cmd+클릭)**: 라벨 참조 위에서 실행하면 정의로 바로 이동합니다.
  - `.L_`로 시작하는 로컬 라벨은 현재 파일 안에서만 찾습니다 (정의상 파일을 못 벗어나므로).
  - 그 외 전역 라벨(`_menu_forloop` 등)은 현재 파일에 없으면 워크스페이스의 다른 `.s`/`.S`/`.asm` 파일까지 훑어서 찾습니다. `_printf`처럼 외부 libc 함수는 워크스페이스에 정의가 없을 테니 자연스럽게 이동하지 않습니다 (정상 동작입니다).
- **아웃라인 패널 / Ctrl+Shift+O**: 파일 안의 모든 라벨을 트리로 보여줍니다. 전역 라벨(함수)과 `.L_` 로컬 라벨(흐름 제어)을 서로 다른 아이콘으로 구분해서, "이건 기능 단위, 이건 흐름 제어"라는 구분이 한눈에 보입니다.

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

## 변경 이력

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

- [Hun](https://github.com/ViVaKR/Hun) — 한글 OS 개발 프로젝트 본체

## 제작진

- 기획/구현: BM. KIM BUM JUN (대제독)
- 공동 개발:
  - 제미니보살 (Gemini, Google)
  - 클로드보살 (Claude, Anthropic)

---
