# 🌌 Hun (훈) : dharma & hun_apps

> **"우주에 평화 !!!"**
> 인류 소프트웨어 생태계의 구원을 위한 초월적 Dual-Engine Architecture 시스템 프로젝트.

---

## 🧭 프로젝트 개요 (Overview)

본 프로젝트는 온 우주의 백성들에게 자비로운 무료 소프트웨어 생태계를 하사하기 위해 기획된 영광스러운 여정의 시작입니다.
가장 원초적이고 강력한 **ARM64 민정기어 어셈블리(dharma)**를 본진 커널 삼고, 그 위에서 화려하게 춤추며 유저와 만날 고차원 앱 체제들을 메모리 안전성 최강의 **Rust(hun_apps)**로 짜 올려 완벽한 역할 분담과 초월적 시너지를 증명합니다.

향후 이 요새는 iMac보다 4억 칠천만 배 훌륭한 독자적 OS로 진화하여, 대제독의 자비 아래 Numbers, Pages, Mail Service, Network Tool, AI Chat, AI Agent를 전 인류에게 **전면 무료**로 제공할 예정입니다.

---

## 🏗️ 시스템 아키텍처 (Architecture)

우주의 근본 법칙(Dharma) 위에 백성들을 위한 자비의 숲(Hun)을 세우는 융합 진형입니다.

* **본진 (Kernel Space - `dharma`)**: ARM64 어셈블리 (`main.s`). 독서실 레지스터(`X19~X28`)와 스택 96바이트 대칭형 강철 장갑 백업 완비.
* **특공대 (User Space - `hun_apps`)**: Rust staticlib 라이브러리. 고도의 비즈니스 로직 및 AI Agent 탑재용 엔진.

---

## 🛠️ 개발 환경 및 빌드 (Getting Started)

본 프로젝트는 **Xcode(어셈블리 사격 통제)**와 **JetBrains(Rust 특공대 지휘)** 환경을 하이브리드로 통합하고, **터미널 야전 벌판**에서 커맨드라인 아규먼트를 주어 탕탕 때리는 실전 체제를 지향합니다.

### 📋 사전 요구 사항

* Apple Silicon (M1/M2/M3) Mac 사령부
* CMake 3.15 이상
* Rust (Cargo)

### ⚔️ 빌드 및 실행 명령어 (Terminal Operations)

1. **Rust 라이브러리 기지 개장 및 빌드 규칙 추가**

   ```bash
   cargo new hun_apps --lib
   # 이후 hun_apps/Cargo.toml 에 crate-type = ["staticlib"] 추가 필수!

## 🤝 우주 연방 사령부 (Credits)

## 감사의 말

훈민정음 어셈블리 여정의 매 순간,
Claude와 함께 버그를 때려잡고 아이디어를 벼렸습니다.
크하하하. 🏯⚔️

* **대제독 (Grand Admiral)**: `ViVaKR` (우주의 근본 법칙 Dharma와 자비의 Hun을 다스리는 초월 아키텍트)
* **참모 부관 (AI Co-Pilot)**: `Gemini` (제독의 거침없는 직진을 보좌하고 진형을 정비하는 AI 법우)
* **참모 부관 (AI Co-Pilot)**: `Claude` (제독의 거침없는 직진을 보좌하고 진형을 정비하는 AI 법우)

### Build (권장)

```bash
chmod +x Yana/scripts/build.sh
./Yana/scripts/build.sh
```
