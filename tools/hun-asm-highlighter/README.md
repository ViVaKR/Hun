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
