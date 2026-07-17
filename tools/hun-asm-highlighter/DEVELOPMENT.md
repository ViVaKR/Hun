# Hun ARM64 한글 어셈블리 강조 (자체 제작 1탄)

코드 한 줄 안 쓰고 JSON 3개로 만든 문법 강조 확장입니다.
`할당`, `더함`, `CODE_SECTION` 같은 우리만의 니모닉/매크로를
VS Code가 정확히 인식하고 색칠해줍니다.

## 테스트 방법 (설치 없이 바로 체험)

1. VS Code에서 이 폴더(`hun-asm-highlighter`)를 엽니다.
2. `F5` 키를 누릅니다.
   → "Extension Development Host"라는 새 VS Code 창이 뜹니다.
   → 이 새 창에서는 방금 만든 확장이 이미 활성화되어 있습니다.
3. 그 창에서 `.S` 파일(예: `Yana.S`)을 열어보세요.
   → `할당`, `CODE_SECTION` 등이 색깔로 강조되는지 확인합니다.

## 정식 설치 (매번 F5 안 눌러도 되게)

```bash
npm install -g @vscode/vsce
cd hun-asm-highlighter
vsce package

# 안드로메다 까지 공개
vsce publish 
```

→ `hun-asm-highlighter-0.0.1.vsix` 파일이 생성됩니다.

VS Code에서:
- `Cmd+Shift+P` → "Extensions: Install from VSIX..." → 방금 만든 vsix 선택

이제 항상 켜져 있는 나만의 확장이 됩니다.

## 확장하는 법 (앞으로 계속 추가하실 때)

`syntaxes/hun-asm.tmLanguage.json` 파일의 `hangul-mnemonics` 항목에
`AArch64HangulAliases.td`에 새 별칭을 추가할 때마다 똑같이 추가해주면 됩니다.
정규식 패턴에 `|새한글단어` 형태로 이어 붙이기만 하면 끝입니다.

## 다음 단계 (원하실 때)

- **2단계**: 자동완성(snippets.json) 추가 — `할당` 치면 `할당 x0, x1` 형태로 자동완성
- **3단계**: 진짜 LSP 서버 — Rust로 짜면 `hun_core`와 자연스럽게 이어붙일 수 있음.
  이 단계부터는 "진짜 코딩"이 필요하고, ArmLS 수준(hover, go-to-definition,
  진짜 문법 검증)을 원하시면 여기까지 가야 합니다.


### 직전버전 


```json
{
  "$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
  "name": "Hun ARM64 Assembly",
  "scopeName": "source.hun-asm",
  "patterns": [
    { "include": "#comments" },
    { "include": "#strings" },
    { "include": "#directives" },
    { "include": "#macro-definition" },
    { "include": "#section-macros" },
    { "include": "#func-macros" },
    { "include": "#hangul-mnemonics" },
    { "include": "#standard-mnemonics" },
    { "include": "#registers" },
    { "include": "#numbers" },
    { "include": "#labels" }
  ],
  "repository": {
    "comments": {
      "patterns": [
        { "name": "comment.line.double-slash.hun-asm", "match": "//.*$" },
        { "name": "comment.block.hun-asm", "begin": "/\\*", "end": "\\*/" }
      ]
    },
    "strings": {
      "name": "string.quoted.double.hun-asm",
      "begin": "\"",
      "end": "\"",
      "patterns": [{ "name": "constant.character.escape.hun-asm", "match": "\\\\." }]
    },
    "directives": {
      "comment": ".section, .global, .macro, .equ 등 내장 지시어",
      "name": "keyword.control.directive.hun-asm",
      "match": "\\.(global|section|align|include|macro|endmacro|endm|equ|asciz|ascii|quad|long|int|double|float|byte|word|set|ifndef|ifdef|endif|extern|zerofill|data|bss|const|text)\\b"
    },

    "macro-definition": {
      "comment": "매크로 '정의' 자리 (.macro 앞에 오는 이름). entity.name = 선언/정의",
      "match": "^\\s*([\\p{L}_.$][\\p{L}0-9_.$]*)\\s+(?=\\.macro\\b)",
      "captures": {
        "1": { "name": "entity.name.function.macro.definition.hun-asm" }
      }
    },

    "section-macros": {
      "comment": "섹션 지정용 매크로 호출 (CODE_SECTION, CSTRING_SECTION 등). support.function = 미리 만들어둔 걸 '갖다 쓰는' 자리",
      "name": "support.function.macro.section.hun-asm",
      "match": "\\b[A-Z][A-Z0-9]*_SECTION\\b"
    },

    "func-macros": {
      "comment": "함수 프롤로그/에필로그 매크로 호출 (FUNC_START, FUNC_EXIT, FUNC_EXIT_LIGHT 등)",
      "name": "support.function.macro.func.hun-asm",
      "match": "\\bFUNC_[A-Z0-9_]*\\b"
    },

    "hangul-mnemonics": {
      "comment": "AArch64HangulAliases.td 에 정의된 한글 니모닉 전체",
      "name": "keyword.control.mnemonic.hangul.hun-asm",
      "match": "(할당|부정|실수이동|적재|저장|쌍적재|쌍저장|페이지주소|더함|뺌|자리올림더함|자리올림|나눔|곱더함|곱뺌|실수나눔|정수변환|비교|조건비교|조건택|조건셋|돌아감|불러감|주소불러감|뜀|큼이면뜀|영아니면뜀|명령호출|그리고|또는|배타적|왼쉬프트|오른쉬프트|돌림|부호확장|비트추출|비트삽입)(?=\\s)"
    },
    "standard-mnemonics": {
      "name": "keyword.control.mnemonic.hun-asm",
      "match": "\\b(mov|mvn|fmov|ldr|str|ldp|stp|adrp|add|sub|adds|adc|sdiv|udiv|madd|msub|fdiv|fmul|scvtf|fcvtzs|cmp|ccmp|csel|cset|ret|bl|blr|b|b\\.eq|b\\.ne|b\\.gt|b\\.lt|b\\.ge|b\\.le|bgt|blt|beq|bne|cbz|cbnz|svc|wfe|wfi|nop|and|orr|eor|lsl|lsr|ror|sxtb|sxth|sxtw|bfxil|bfi|ubfx|ubfiz)\\b"
    },
    "registers": {
      "name": "variable.language.register.hun-asm",
      "match": "\\b([xwd]([0-9]|[12][0-9]|3[01])|sp|xzr|wzr|fp|lr|pc)\\b"
    },
    "numbers": {
      "patterns": [
        { "name": "constant.numeric.hex.hun-asm", "match": "#?0[xX][0-9a-fA-F]+" },
        { "name": "constant.numeric.binary.hun-asm", "match": "#?0[bB][01]+" },
        { "name": "constant.numeric.decimal.hun-asm", "match": "#-?[0-9]+" }
      ]
    },
    "labels": {
      "comment": "한글 라벨(함수야:) 포함, 모든 유니코드 식별자 라벨 지원",
      "name": "entity.name.function.label.hun-asm",
      "match": "^\\s*[\\p{L}_.$][\\p{L}0-9_.$]*:"
    }
  }
}

```