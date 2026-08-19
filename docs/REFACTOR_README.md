# Hun ARM64 Mnemonic Dictionary — 리팩토링 안내

## 무엇이 바뀌었나

| 항목 | Before | After |
|---|---|---|
| 니모닉 데이터 | `index.md` 5,394줄에 하드코딩 | `_data/mnemonics.yml` (217개 엔트리, 구조화된 데이터) |
| 다이어그램 | 니모닉마다 Mermaid 렌더링 (217회) | CSS 뱃지 (`_includes/mnemonic-entry.html` + `assets/css/mnemonics.css`) |
| 체크마크 | `$\checkmark$` (MathJax/KaTeX 필요) | `✅` 이모지 (렌더링 비용 0) |
| 페이지 구조 | 단일 거대 페이지 | 알파벳별 21개 페이지 (`mnemonics/a.md` ~ `mnemonics/z.md`) |
| 검색 | 없음 (Ctrl+F로 5천 줄 스크롤) | 클라이언트 검색창 (`assets/mnemonics-search.json` + `assets/js/search.js`) |
| index.md | 사전 본문 그 자체 | 목차 + 검색 페이지 (가벼움) |

## 파일을 리포에 배치하는 방법

아래 구조 그대로 리포 루트에 복사하면 됩니다 (기존 파일과 경로가 겹치는 것만 덮어쓰기).

```
_data/mnemonics.yml          ← 새 파일
_includes/mnemonic-entry.html ← 새 파일
_includes/letter-nav.html     ← 새 파일
_includes/head-custom.html    ← 새 파일 (커스텀 CSS 로드용)
assets/css/mnemonics.css      ← 새 파일
assets/js/search.js           ← 새 파일
assets/mnemonics-search.json  ← 새 파일
mnemonics/a.md ~ z.md (21개)  ← 새 파일
index.md                      ← 기존 파일 덮어쓰기 (백업 권장)
_config.yml                   ← 기존 파일 덮어쓰기 (주석 확인 후 병합 권장)
```

**기존 `index.md`는 지우지 말고 `index.md.bak` 같은 이름으로 백업해두는 걸 추천합니다.** 혹시 데이터 파싱에서 누락된 부분이 있는지 대조할 때 필요할 수 있어요.

## 반드시 확인해야 할 것

1. **`_config.yml`의 `mermaid: true` 주석 처리 전, 리포 전체에서 진짜 흐름도(장식용이 아닌)가 쓰이는 페이지가 있는지 확인하세요.**
   ```bash
   grep -rl '```mermaid' --include='*.md' .
   ```
   이번에 확인한 `hvc.md`, `ic.md`, `ins.md`에는 Mermaid가 없었지만, 리포 전체를 다 받은 게 아니라서 다른 페이지에 있을 수도 있습니다.

2. **`examples/*.md` 링크는 그대로 살아있습니다.** `mnemonics.yml`의 `body` 필드 안에 원문 그대로 `[_Open Summary_](examples/xxx.md#summary)` 링크가 보존되어 있어서, 기존 `examples/` 폴더 구조를 건드릴 필요가 없습니다.

3. **로컬에서 빌드 확인**을 꼭 해보세요 (이 환경엔 Ruby가 없어 직접 빌드 테스트를 못 했습니다):
   ```bash
   bundle exec jekyll serve
   ```
   특히 `letter-nav.html`이 쓰는 `where`, `map`, `uniq`, `sort` Liquid 필터는 GitHub Pages 표준 빌드(커스텀 플러그인 없이)에서 기본 지원되는 것들이라 문제없이 돌아갈 거예요.

4. **파싱 검증**: 원본 217개 니모닉 전체가 빠짐없이 옮겨졌는지 궁금하면:
   ```bash
   grep -c '^```mermaid$\|^## `' index.md.bak   # 원본 진입점 개수 (222, stub 5개 포함)
   ```
   `_data/mnemonics.yml`에서 `- name:` 개수를 세면 217이 나와야 합니다 (stub 중복 5개는 자동 병합됨).

## 알려진 사소한 이슈

- `mnemonics.yml`의 일부 `body` 필드가 YAML 리터럴 블록(`|`) 대신 큰따옴표 스타일로 저장된 항목이 있습니다 (예: `ADC`). 원본 텍스트에 줄 끝 공백이 남아있던 게 원인인데, **내용 자체는 100% 동일**하니 기능상 문제는 없습니다. 신경 쓰인다면 나중에 해당 항목만 수동으로 다듬으면 됩니다.
- `BLR`, `CSET`, `STP`, `MSR`, `LDSMIN` 5개는 원본에 Mermaid 박스 + `## 헤더`가 중복으로 겹쳐 있던 걸 자동 병합했습니다. 병합 후 내용을 한 번씩 훑어보는 걸 추천합니다.

## 다음에 새 니모닉을 추가하려면

이제 `index.md`를 직접 수정할 필요 없이, `_data/mnemonics.yml`에 항목 하나만 추가하면 됩니다:

```yaml
- name: NEWOP
  slug: newop
  letter: N
  summary_link: examples/newop.md
  body: |
    ✅ `Description here` ...

    ✅ `한국어 설명` ...

    **Syntax**

    ```arm
    NEWOP <Xd>, <Xn>
    ```
```

`mnemonics/n.md`가 `letter: N`인 항목을 자동으로 끌어와 렌더링하므로, 새 페이지를 따로 만들 필요가 없습니다.
