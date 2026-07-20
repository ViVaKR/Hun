# Conventional Commits (관례적 커밋 규격)

이 저장소의 모든 커밋 메시지는 아래 규칙을 따른다. 목적은 단순 취향이 아니라
① 나중에 로그만 보고도 무슨 변경인지 바로 알아보고, ② 필요해지면 버전 번호를
자동으로 매길 수 있게(SemVer) 하기 위함이다.

## 기본 형식

```
타입(범위): 제목
```

- **타입**: 아래 표 중 하나 (필수)
- **범위 (scope)**: 어느 서브프로젝트 얘기인지 (권장, 아래 목록 참고)
- **제목**: 한 줄 요약. 이모지 사용 금지, 50자 내외 권장 (초과 시 본문에 설명 추가)

---

## 📜 타입 교본

#### 1. `feat` (Feature)
* **상황**: 새로운 기능이나 로직, 파일 등을 **최초로 추가**했을 때.
* **예시**: `feat: 훈 ARM64 한글 어셈블리 하이라이터 추가`

#### 2. `fix` (Bug Fix)
* **상황**: 버그나 오류, 링킹 에러 등을 **수정/해결**했을 때.
* **예시**: `fix: main.rs 링킹 에러 및 build.rs 경로 오류 수정`

#### 3. `build` (Build System / Dependency)
* **상황**: 빌드 설정 파일이나 외부 의존성을 건드렸을 때. (`CMakeLists.txt`, `Cargo.toml`, `build.rs` 수정 등)
* **예시**: `build: Yana 프로젝트 build.rs 자동 어셈블리 컴파일 튜닝`

#### 4. `docs` (Documentation)
* **상황**: `README.md`, 주석, 문서 파일들만 수정했을 때 (코드 동작에는 영향 없음).
* **예시**: `docs: README.md 시스템 아키텍처 항목 업데이트`

#### 5. `style` (Formatting)
* **상황**: 동작에는 영향 없이 포맷/들여쓰기/공백/세미콜론 등만 정리했을 때.
* **구분 기준**: 동작이 조금이라도 바뀌면 `refactor`, 안 바뀌면 `style`.
* **예시**: `style: Yana.S 인덴트 정리`

#### 6. `refactor` (Refactoring)
* **상황**: 기능 추가나 버그 수정은 없는데, 코드 구조를 **더 깔끔하게 정리**했을 때 (가독성 향상, 구조 개선).
* **예시**: `refactor: playground.S의 레지스터 백업 루틴 구조화`

#### 7. `test` (Testing)
* **상황**: 테스트 코드를 추가하거나, 기존 테스트 케이스를 수정/보완했을 때.
* **예시**: `test: hun_test_runner에 CSEL 및 델리게이트 테스트 추가`

#### 8. `chore` (Chore)
* **상황**: 빌드나 소스코드와 무관한 자질구레한 작업들. (`.gitignore` 수정, 패키지 매니저 설정 변경, 자질구레한 파일 정리 등)
* **예시**: `chore: .gitignore에 tools/ 예외 규칙 추가 및 캐시 정리`

#### 9. `perf` (Performance)
* **상황**: 성능 개선을 위한 코드 변경이 있었을 때.
* **예시**: `perf: 루프 계산기에서 분기 예측 제거하여 속도 개선`

#### 10. `ci` (Continuous Integration)
* **상황**: GitHub Actions 등 CI/CD 설정 파일을 건드렸을 때. (지금 당장은 없어도 나중을 위해 자리를 비워둠)
* **예시**: `ci: vsix 자동 빌드 워크플로 추가`

#### 11. `revert` (Revert)
* **상황**: 이전 커밋을 되돌릴 때. `git revert` 실행 시 자동으로 이 형식의 메시지가 생성됨.
* **예시**: `revert: feat: 쌍적재 오프셋 문법 변경`

---

## 🔖 범위 (scope) 목록

로그만 보고도 어느 서브프로젝트인지 알 수 있도록, scope는 아래 목록 중에서 고른다.

| scope | 대상 |
|---|---|
| `yana` | Yana/ (ASM·CMake 코어) |
| `hun-core` | Applications/rust/hun_apps/hun_core |
| `hun-asm-highlighter` | tools/hun-asm-highlighter (VSCode 확장) |
| `hoon` | 훈(Hoon) C# 전처리기 |
| `buddham` | Buddham 플랫폼 관련 (별도 저장소가 아닐 경우) |

scope가 애매하거나 여러 군데 걸치면 생략하고 제목에서 풀어 설명한다.

---

## ⚡ SemVer(버전 번호) 매핑

특히 `.vsix`처럼 버전을 매겨 배포하는 서브프로젝트에 적용한다.

| 커밋 타입 | 버전 변화 | 예시 |
|---|---|---|
| `fix` | patch (0.2.0 → 0.2.1) | 버그 수정 |
| `feat` | minor (0.2.0 → 0.3.0) | 신규 기능 |
| `feat!` 또는 본문에 `BREAKING CHANGE:` | major (0.x.x → 1.0.0) | 기존 사용자가 재작업해야 하는 변경 |

**Breaking change 표기법 예시**:

```
feat!: 쌍적재/쌍저장 오프셋 문법을 괄호 없는 형태로 변경

BREAKING CHANGE: 기존 [sp, #8] 형태의 .S 파일은 재컴파일 필요
```

---

## 🚫 이모지 규칙

**실제 커밋 메시지에는 이모지를 넣지 않는다.** (이 문서 안에서 타입을 구분하는 용도로도 쓰지 않음)

이유: `commitlint` 같은 표준 검증 도구는 커밋 메시지가 `타입(범위): 제목` 형태로
정확히 **시작**해야 인식한다. 앞에 이모지가 붙으면 파싱에 실패해 자동화 도구를
붙일 때 문제가 생긴다.

---

## 💡 종합 예시

```
feat(hun-asm-highlighter): 한글 니모닉 강조 구문 추가
fix(yana): main.rs 링킹 에러 및 build.rs 경로 오류 수정
build(hun-core): build.rs에서 Yana/tests 동적 탐색 기능 구현
docs(hun-asm-highlighter): README.md 진단 기능 항목 업데이트
chore: .gitignore에 tools/ vsix 제외 규칙 추가
```

### release link

```bash
1. 코드 수정 완료 (extension.js, package.json 버전 올리기 등)
        ↓
2. git add && git commit
        ↓
3. git push origin main          ← 커밋이 원격에 먼저 올라가 있어야 함
        ↓
4. vsce package                  ← .vsix 로컬 생성, 파일 목록 확인
        ↓
5. (선택) 로컬에서 .vsix 직접 설치해서 실제 동작 테스트
        ↓
6. git tag hun-asm-highlighter-v2.1.0    ← 방금 push된 커밋을 가리킴
        ↓
7. git push origin hun-asm-highlighter-v2.1.0   ← 태그를 원격에 push
        ↓
8. GitHub → Releases → "Draft a new release" → 방금 push한 태그 선택 → .vsix 파일 첨부 → Publish
        ↓
9. vsce publish                  ← 마켓플레이스/Open VSX에 배포

```