# Conventional Commits (관례적 커밋 규격)

## 📜 Conventional Commits 꼬리표 교본

#### 1. ✨ `feat:` (Feature)
* **상황**: 새로운 기능이나 로직, 파일 등을 **최초로 추가**했을 때.
* **예시**: `feat: 훈 ARM64 한글 어셈블리 하이라이터 추가`

#### 2. 🐛 `fix:` (Bug Fix)
* **상황**: 버그나 오류, 링킹 에러 등을 **수정/해결**했을 때.
* **예시**: `fix: main.rs 링킹 에러 및 build.rs 경로 오류 수정`

#### 3. ⚙️ `build:` (Build System / Dependency)
* **상황**: 빌드 설정 파일이나 외부 의존성을 건드렸을 때. (`CMakeLists.txt`, `Cargo.toml`, `build.rs` 수정 등)
* **예시**: `build: Yana 프로젝트 build.rs 자동 어셈블리 컴파일 튜닝`

#### 4. 📝 `docs:` (Documentation)
* **상황**: `README.md`, 주석, 문서 파일들만 수정했을 때 (코드 동작에는 영향 없음).
* **예시**: `docs: README.md 시스템 아키텍처 항목 업데이트`

#### 5. 🛠️ `refactor:` (Refactoring)
* **상황**: 기능 추가나 버그 수정은 없는데, 코드 구조를 **더 깔끔하게 정리**했을 때 (가독성 향상, 구조 개선).
* **예시**: `refactor: playground.S의 레지스터 백업 루틴 구조화`

#### 6. 🧪 `test:` (Testing)
* **상황**: 테스트 코드를 추가하거나, 기존 테스트 케이스를 수정/보완했을 때.
* **예시**: `test: hun_test_runner에 CSEL 및 델리게이트 테스트 추가`

#### 7. 🧹 `chore:` (Chore)
* **상황**: 빌드나 소스코드와 무관한 자질구레한 작업들. (`.gitignore` 수정, 패키지 매니저 설정 변경, 자질구레한 파일 정리 등)
* **예시**: `chore: .gitignore에 tools/ 예외 규칙 추가 및 캐시 정리`

#### 8. ⚡ `perf:` (Performance)
* **상황**: 성능 개선을 위한 코드 변경이 있었을 때.
* **예시**: `perf: 루프 계산기에서 분기 예측 제거하여 속도 개선`

---

### 💡 예시

> **`타입(범위): 제목`**
> * 예시: `feat(highlighter): 한글 니모닉 강조 구문 추가`
> * 예시: `build(cargo): build.rs에서 Yana/tests 동적 탐색 기능 구현`
