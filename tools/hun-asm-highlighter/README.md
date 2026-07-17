# Hun ARM64 한글 어셈블리 강조

한글 어셈블리 프로젝트 [Hun](https://github.com/ViVaKR/Hun)에서 사용하는
한글 니모닉(`할당`, `더함`, `적재`...)과 커스텀 섹션 매크로
(`CODE_SECTION`, `STRING_SECTION`...)를 인식하는 VS Code 확장입니다.

문법 강조뿐 아니라 오프셋 정렬/범위 같은 기본적인 실수를 잡아주는
가벼운 정적 검사(diagnostics)도 함께 제공합니다.

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

### 기본 진단 (Diagnostics)

- `ldp`/`stp` (`쌍적재`/`쌍저장`) 오프셋 정렬 및 인코딩 범위 검사
  - 예: `ldp x29, x30, [sp], #15` → 8의 배수가 아니라는 오류 표시
- `ldr`/`str` (`적재`/`저장`) 오프셋 정렬 및 범위 검사 (unsigned-offset / pre·post-index 형태 구분)
- 존재하지 않는 레지스터 이름 검출 (`x31`, `w99` 등)
- 레지스터 폭 불일치 경고 (`x`와 `w`를 짝으로 묶은 경우)
- 목록에 없는 영문 니모닉에 대한 가벼운 힌트

> 현재는 확장 자체가 규칙을 정규식으로 흉내내는 방식입니다. 향후 패치된
> `llvm-mc`/`clang`을 직접 호출해 실제 어셈블러의 판정을 그대로 가져오는
> 방식으로 발전시킬 예정입니다.

### 호버 & 자동완성

- `적재`/`저장`/`쌍적재`/`쌍저장`에 마우스를 올리면 대응하는 영문 니모닉과 설명 표시
- 한글/영문 니모닉 전체 목록에 대한 자동완성 후보 제공

## 설치 방법

### Open VSX Registry에서 설치 (Antigravity IDE, VSCodium 등)

1. 확장(Extensions) 패널에서 `Hun ARM64 한글 어셈블리 강조` 검색
2. Install 클릭

### VSIX 파일로 직접 설치

1. [Releases](https://github.com/ViVaKR/Hun/releases)에서 최신 `.vsix` 파일 다운로드
2. `Cmd+Shift+P` → `Extensions: Install from VSIX...` → 파일 선택

## 사용법

`.S`, `.s`, `.inc`, `.asm` 확장자 파일을 열면 자동으로 적용됩니다. 별도 설정 불필요.

## 향후 계획

- Language Server Protocol(LSP) 기반 구조로 전환
- 패치된 `llvm-mc`를 백엔드로 호출해 진단 정확도를 실제 어셈블러 수준으로 향상
- 라벨 참조 검증(존재하지 않는 라벨로 분기하는 경우 등) 추가

## 라이선스

MIT License

## 관련 프로젝트

- [Hun](https://github.com/ViVaKR/Hun) — 한글 OS 개발 프로젝트 본체

## 제작진

- 기획/구현: BM. KIM BUM JUN (대제독)
- 공동 개발: 
  - 클로드보살 (Claude, Anthropic)
  - 제미니보살 (Gemini, Google)