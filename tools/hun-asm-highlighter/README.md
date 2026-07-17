# Hun ARM64 한글 어셈블리 강조

한글 어셈블리 프로젝트 [Hun](https://github.com/ViVaKR/Hun)에서 사용하는
한글 니모닉(`할당`, `더함`, `적재`...)과 커스텀 섹션 매크로
(`CODE_SECTION`, `STRING_SECTION`...)를 인식하는 VS Code 문법 강조 확장입니다.

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

## 설치 방법

### Open VSX Registry에서 설치 (Antigravity IDE, VSCodium 등)

1. 확장(Extensions) 패널에서 `Hun ARM64 한글 어셈블리 강조` 검색
2. Install 클릭

### VSIX 파일로 직접 설치

1. [Releases](https://github.com/ViVaKR/Hun/releases)에서 최신 `.vsix` 파일 다운로드
2. `Cmd+Shift+P` → `Extensions: Install from VSIX...` → 파일 선택

## 사용법

`.S`, `.s`, `.inc`, `.asm` 확장자 파일을 열면 자동으로 적용됩니다. 별도 설정 불필요.

## 라이선스

MIT License

## 관련 프로젝트

- [Hun](https://github.com/ViVaKR/Hun) — 한글 OS 개발 프로젝트 본체

## 제작진

- 기획/구현: BM. KIM BUM JUN (대제독)
- 공동 개발: 
  - 클로드보살 (Claude, Anthropic)
  - 제미니보살 (Gemini, Google)