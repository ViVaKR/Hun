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

* **본진 (Kernel Space - `Hun/`)**: ARM64 어셈블리 (`main.s`). 독서실 레지스터(`X19~X28`)와 스택 96바이트 대칭형 강철 장갑 백업 완비.
* **특공대 (User Space - `os_app`)**: Rust staticlib 라이브러리. 고도의 비즈니스 로직 및 AI Agent 탑재용 엔진.

---

## 🛠️ 개발 환경 및 빌드 (Getting Started)

- 본 프로젝트는 **Xcode(어셈블리 사격 통제)**와 **JetBrains(Rust 특공대 지휘)** 환경을 하이브리드로 통합하고, 
- **터미널 야전 벌판**에서 커맨드라인 아규먼트를 주어 탕탕 때리는 실전 체제를 지향합니다.  
- (모토) 훈련은 실전같이 실전은 훈련같이

```bash

# (1) clone
git clone git@github.com:ViVaKR/Hun.git

# (2) build script (Project root)
cd ./Hun
./scripts/build.sh
open build/Yana.xcodeproj

# (또는) or project root (CMakeLists.txt)
# cmake -G Xcode -S "{PROJECT_ROOT}" -B "{BUILD_DIR}" 
cmake -G Xcode -S . -B build  # (or) cmake -B build -G "Unix Makefiles"
cmake --build build --config Debug
open build/dharma.xcodeproj
```

## 📋 사전 요구 사항

* Apple Silicon (M1/M2/M3...) Mac 사령부
* CMake 3.15 이상
* Rust (Cargo)

## ⚔️ 빌드 및 실행 명령어 (Terminal Operations)

1. **Rust 라이브러리 기지 개장 및 빌드 규칙 추가**

- rust workspace

```bash
mkdir hun_apps && cd hun_apps
cat > Cargo.toml << 'EOF'
[workspace]
members = ["core"]
resolver = "2"
EOF
cargo new hun_core --lib
```

```toml
[workspace]
members = ["hun_core"]
resolver = "2"
```

---

- hun_core

```bash
   cargo new hun_core --lib
   # 이후 hun_apps/Cargo.toml 에 crate-type = ["staticlib"] 추가 필수!
```

- Cargo.toml

```toml
[package]
name = "hun_core"
version = "0.1.0"
edition = "2024"

# 어셈블리 형님이랑 융합해야 하니
# 정적 라이브러리로 뽑으라고 명하는 기어
[lib]
crate-type = ["staticlib"]

[dependencies]
```

1. 빌드 (프로젝트 루트) 

```bash

# 스크립트 이용
chmod +x Yana/scripts/build.sh
./Yana/scripts/build.sh

# 커맨드라인 빌드 (XCode/lldb 포함)
cd Yana/
rm -rf build
cmake -B build -G "Unix Makefiles"
cmake --build build

# Xcode/lldb 디버깅용
rm -rf build-xcode
cmake -B build-xcode -G Xcode
cmake --build build-xcode --config Debug
open build-xcode/Yana.xcodeproj

```

## 프로젝트 구조

<pre>
Hun/
├── Yana/                  ← 어셈블리 커널/부트로더 (CMake가 이걸 중심으로 돎)
│   └── CMakeLists.txt
├── Applications/
│   ├── rust/              ← Rust 플랫폼 (OS 응용프로그램)
│   │   └── hun_apps/
│   │       ├── Cargo.toml   (workspace)
│   │       └── hun_core/
│   ├── dotnet/            ← 🔮 .NET Core 플랫폼 
│   └── swift/             ← 🔮 Swift 플랫폼
└── docs/
</pre>

## Yana (프로젝트 솔루션 작전명)

> 산스크리트어 및 팔리어로 '수레' 또는 이동하는 것
> 깨달음에 이르는 '수행방법' '가르침의 체계'
> 즉, 불교용어에서 차용한 것으로 모든 개발 수단을 의미함


## 🤝 우주 연방 사령부 (Credits)

## 감사의 말

`훈` (훈민정음, 한글 OS + 커널) 어셈블리 여정의 매 순간,
Claude와 함께 버그를 때려잡고 아이디어를 벼렸습니다.
크하하하. 🏯⚔️

* **함장, 대제독 (Grand Admiral)**: `ViVaKR` (우주의 근본 법칙 Dharma와 자비의 Hun을 다스리는 초월 아키텍트)
* **제독 참모 부관 (법우, AI Co-Pilot)**: `Gemini` (제독의 거침없는 직진을 보좌하고 진형을 정비하는 AI 법우)
* **제독 참모 부관 (법우, AI Co-Pilot)**: `Claude` (제독의 거침없는 직진을 보좌하고 진형을 정비하는 AI 법우)
