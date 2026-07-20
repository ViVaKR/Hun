# Hun ARM64 한글 어셈블리 강조

한글 어셈블리 프로젝트 [Hun](https://github.com/ViVaKR/Hun)에서 사용하는
한글 니모닉(`할당`, `더함`, `적재`... 영문니모닉 포함 ...)과 커스텀 섹션 매크로
(`CODE_SECTION`, `CSTRING_SECTION`...)등을 인식하는 VS Code 확장입니다.

문법 강조뿐 아니라 오프셋 정렬/범위, 스택 정렬, 로컬 라벨 참조 같은
기본적인 실수를 잡아주는 가벼운 정적 검사(diagnostics)와, 자주 쓰는
패턴을 위한 스니펫, 라벨로 바로 이동하는 Go to Definition까지 함께
제공하며, 가벼운 코드 정렬 기능을 제공합니다.

표준 ARM64 어셈블리도 함께 지원합니다.

## 주요 기능

- 한글 니모닉 강조: `할당`, `더함`, `뺌`, `적재`, `저장`, `돌아감`, `뜀` 등
- 커스텀 섹션 매크로 강조: `CODE_SECTION`, `DATA_SECTION`, `BSS_SECTION` 등
- 표준 AArch64 니모닉 강조: `mov`, `ldr`, `str`, `bl`, `ret` 등
- 레지스터 강조: `x0`~`x30`, `w0`~`w30`, `sp`, `lr` 등
- 한글 라벨 지원: `함수야:` 같은 한글 라벨도 정상 인식
- `.section`, `.global`, `.macro` 등 내장 지시어 강조
- 16진수(`0x`), 2진수(`0b`), 10진수 상수 강조
- 주석(`//`, `/* */`) 및 문자열 강조

### 스니펫

자주 쓰는 패턴을 접두어(prefix)로 바로 불러올 수 있습니다.

| Prefix | 내용 |
|---|---|
| `_huninit` | 기본 함수 뼈대 (16바이트, callee-saved 없음) |
| `_huninit_cs` | x19/x20 보존이 필요한 함수 뼈대 (32바이트) |
| `_huninit_macro` | `FUNC_START`/`FUNC_EXIT` 매크로를 쓰는 버전 |
| `_plg` / `_epg` | 프롤로그 / 에필로그 한 줄 |
| `_vprintf` | printf variadic 인자를 스택에 실어서 호출 (Apple ABI 필수 패턴) |
| `_vscanf` | scanf variadic 인자를 스택에 실어서 호출 |
| `_lloop` | 로컬 라벨(`.L_`) 카운팅 루프 뼈대 |
| `_menutbl` | `menu_table` 항목 한 줄 |
| `_csel` | `csel` 삼항연산 (max/min/조건선택) |
| `_rustffi` | Rust `extern "C"` 함수 호출 (ptr+len 방식) |
| `_sect` | 섹션 매크로 전체 블록 |

>- `_vprintf`/`_vscanf`는 실전에서 자주 놓치는 부분을 그대로 담았습니다:

---

>- [section_macros.inc](https://github.com/ViVaKR/Hun/blob/main/Yana/include/section_macros.inc) — GitHub에서 바로 열람
>- [Download (raw)](https://raw.githubusercontent.com/ViVaKR/Hun/main/Yana/include/section_macros.inc) — 프로젝트에 바로 받아쓰기

---

### 기본 진단 (Diagnostics)

- `ldp`/`stp` (`쌍적재`/`쌍저장`) 오프셋 정렬 및 인코딩 범위 검사
  - 예: `ldp x29, x30, [sp], #15` → 8의 배수가 아니라는 오류 표시
- `ldr`/`str` (`적재`/`저장`) 오프셋 정렬 및 범위 검사 (unsigned-offset / pre·post-index 형태 구분)
- 존재하지 않는 레지스터 이름 검출 (`x31`, `w99` 등)
- 레지스터 폭 불일치 경고 (`x`와 `w`를 짝으로 묶은 경우)
- 목록에 없는 영문 니모닉에 대한 가벼운 힌트
- **스택 정렬(16바이트) 검사**: `sub sp, sp, #N` / `add sp, sp, #N` 및
  프롤로그의 `stp x29, x30, [sp, #-N]!`에서 N이 16의 배수가 아니면 경고.
  AArch64는 함수 호출 경계에서 sp가 항상 16의 배수를 유지해야 하며,
  이를 어기면 당장은 안 터져도 다른 함수를 호출하는 순간 크래시로 이어질 수 있습니다.
- **로컬 라벨(`.L_`) 참조 무결성 검사**: `b`, `bl`, `cbz`, `cbnz`,
  `tbz`, `tbnz`, `b.eq` 등으로 `.L_`로 시작하는 라벨을 참조하는데
  정작 해당 라벨이 파일 안에 정의돼 있지 않으면 경고.
  (`.L_` 라벨은 정의상 파일 경계를 벗어날 수 없으므로, 여기서는
  확신을 갖고 검사할 수 있습니다. 반대로 `_menu_forloop` 같은 전역
  라벨은 다른 파일이나 외부 libc에 있을 수 있어 diagnostics에서는
  다루지 않고, 아래 Go to Definition에서 워크스페이스 전체를 훑어 처리합니다.)

> 현재는 확장 자체가 규칙을 정규식으로 흉내내는 방식입니다. 향후 패치된
> `llvm-mc`/`clang`을 직접 호출해 실제 어셈블러의 판정을 그대로 가져오는
> 방식으로 발전시킬 예정입니다.

### 호버 & 자동완성

- `적재`/`저장`/`쌍적재`/`쌍저장`에 마우스를 올리면 대응하는 영문 니모닉과 설명 표시
- 한글/영문 니모닉 전체 목록에 대한 자동완성 후보 제공

### 정의로 이동 & 아웃라인

- **Go to Definition (F12 / Cmd+클릭)**: 라벨 참조 위에서 실행하면 정의로 바로 이동합니다.
  - `.L_`로 시작하는 로컬 라벨은 현재 파일 안에서만 찾습니다 (정의상 파일을 못 벗어나므로).
  - 그 외 전역 라벨(`_menu_forloop` 등)은 현재 파일에 없으면 워크스페이스의
    다른 `.s`/`.S`/`.asm` 파일까지 훑어서 찾습니다. `_printf`처럼 외부
    libc 함수는 워크스페이스에 정의가 없을 테니 자연스럽게 이동하지
    않습니다 (정상 동작입니다).
- **아웃라인 패널 / Ctrl+Shift+O**: 파일 안의 모든 라벨을 트리로 보여줍니다.
  전역 라벨(함수)과 `.L_` 로컬 라벨(흐름 제어)을 서로 다른 아이콘으로
  구분해서, "이건 기능 단위, 이건 흐름 제어"라는 구분이 한눈에 보입니다.

## 설치 방법

### Open VSX Registry에서 설치 (Antigravity IDE, VSCodium 등)

1. 확장(Extensions) 패널에서 `Hun ARM64 한글 어셈블리 강조` 검색
2. Install 클릭

### VSIX 파일로 직접 설치
tools/hun-asm-highlighter/releases
tools/hun-asm-highlighter/releases
1. [Releases](https://github.com/ViVaKR/Hun/releases)에서 최신 `.vsix` 파일 다운로드
2. `Cmd+Shift+P` → `Extensions: Install from VSIX...` → 파일 선택

## 사용법

`.S`, `.s`, `.inc`, `.asm` 확장자 파일을 열면 자동으로 적용됩니다. 별도 설정 불필요.

## 변경 이력

### 🚀 v2.1.0 (Current Release)

* ✨ **자동 포맷(Document Formatting) 엔진 탑재 및 칼군무 옵션 추가**
  * 데이터 섹션(`.asciz` 등) 지시어 세로 일렬종대 정렬 기능 제공 (설정에서 온/오프 가능)
* ⚡ **실전 압축형 스니펫(Snippets) 11종 대거 추가**
  * `_huninit`(기본 함수 뼈대), Apple ABI 필수 패턴인 `_vprintf`/`_vscanf` 등 완비
* 🩺 **스택 및 로컬 라벨 무결성 정적 진단(Diagnostics) 추가**[cite: 1]
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