// extension.js
const vscode = require('vscode');
const { validateDocument } = require('./diagnostics');
const { MNEMONIC_MAP, ALL_MNEMONICS } = require('./mnemonics');

const LANGUAGE_ID = 'hun-asm';

// 라벨 정의: "이름:" 형태 (한글 라벨, .L_ 로컬 라벨 모두 포함)
const LABEL_DEF_RE = /^\s*([\p{L}_.$][\p{L}0-9_.$]*)\s*:/u;

/** @type {vscode.DiagnosticCollection} */
let diagnosticCollection;

/**
 * 문서 안에서 name과 정확히 일치하는 라벨 정의를 찾는다.
 * @returns {vscode.Position | null}
 */
function findLabelInDocument(document, name) {
  for (let i = 0; i < document.lineCount; i++) {
    const text = document.lineAt(i).text;
    const m = LABEL_DEF_RE.exec(text);
    if (m && m[1] === name) {
      const col = text.indexOf(m[1]);
      return new vscode.Position(i, col);
    }
  }
  return null;
}

function activate(context) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection(LANGUAGE_ID);
  context.subscriptions.push(diagnosticCollection);

  function refresh(document) {
    if (!document || document.languageId !== LANGUAGE_ID) return;
    try {
      diagnosticCollection.set(document.uri, validateDocument(document));
    } catch (err) {
      console.error('[hun-asm] diagnostics 실행 중 오류:', err);
    }
  }

  // 이미 열려있는 문서들부터 검사
  vscode.workspace.textDocuments.forEach(refresh);

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(refresh),
    vscode.workspace.onDidChangeTextDocument((e) => refresh(e.document)),
    vscode.workspace.onDidCloseTextDocument((doc) => diagnosticCollection.delete(doc.uri))
  );

  // 확실한 매핑이 있는 니모닉에 한해 hover 설명 제공
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(LANGUAGE_ID, {
      provideHover(document, position) {
        // 영문, 한글, 숫자, 점(.)까지 포함해서 단어 범위를 명확히 지정
        const range = document.getWordRangeAtPosition(position, /[\p{L}0-9_.]+/u);
        if (!range) return;

        // 대소문자 꼬임 방지를 위해 무조건 소문자로 변환하여 장부 검색!
        const word = document.getText(range).trim().toLowerCase();

        const info = MNEMONIC_MAP[word];
        if (!info) return; // 장부에 없으면 패스

        const md = new vscode.MarkdownString();
        // 원래 본문에 적혀있던 글자 형태 그대로 보여주기 위해 오리지널 텍스트 추출
        const originalWord = document.getText(range);

        md.appendMarkdown(`**${originalWord}** → \`${info.english.toUpperCase()}\`\n\n${info.desc}`);
        return new vscode.Hover(md, range);
      },
    })
  );

  // 전체 니모닉(한글+영문) 자동완성 후보 제공
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(LANGUAGE_ID, {
      provideCompletionItems() {
        return ALL_MNEMONICS.map((name) => {
          const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Keyword);
          const info = MNEMONIC_MAP[name];
          if (info) {
            item.detail = info.english;
            item.documentation = info.desc;
          } else {
            item.detail = 'Hun-ASM mnemonic';
          }
          return item;
        });
      },
    })
  );

  // Go to Definition (F12): 라벨 정의로 이동
  //  - .L_ 로 시작하는 로컬 라벨은 정의상 같은 파일을 벗어날 수 없으므로 현재 문서에서만 찾는다.
  //  - 그 외(전역 라벨, 예: _menu_forloop)는 현재 문서에 없으면 워크스페이스의
  //    다른 .s/.S/.asm 파일들도 훑어서 찾는다. (_printf 같은 외부 libc 함수는
  //    워크스페이스에 정의가 없을 테니 자연스럽게 "정의를 못 찾음" 상태가 됨 - 정상.)
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(LANGUAGE_ID, {
      async provideDefinition(document, position) {
        const range = document.getWordRangeAtPosition(position, /[\p{L}0-9_.$]+/u);
        if (!range) return;
        const word = document.getText(range);
        if (!word) return;

        // 1) 같은 문서 안에서 먼저 찾기
        const localPos = findLabelInDocument(document, word);
        if (localPos) return new vscode.Location(document.uri, localPos);

        // .L_ 로컬 라벨은 다른 파일로 못 건너감 - 여기서 못 찾았으면 끝
        if (word.startsWith('.L')) return;

        // 2) 워크스페이스의 다른 어셈블리 파일들도 뒤져보기 (전역 라벨)
        let files;
        try {
          files = await vscode.workspace.findFiles('**/*.{s,S,asm}', '**/{node_modules,build,out}/**', 300);
        } catch {
          return;
        }

        for (const uri of files) {
          if (uri.toString() === document.uri.toString()) continue;
          try {
            const doc = await vscode.workspace.openTextDocument(uri);
            const pos = findLabelInDocument(doc, word);
            if (pos) return new vscode.Location(uri, pos);
          } catch {
            // 읽을 수 없는 파일은 조용히 패스
          }
        }
        return;
      },
    })
  );

  // 아웃라인 패널 / Ctrl+Shift+O 심볼 목록: 파일 안의 모든 라벨을 트리로 표시
  //  - 전역 라벨(_menu_forloop 등)과 .L_ 로컬 라벨을 SymbolKind로 구분해서
  //    "이건 기능 단위, 이건 흐름 제어"라는 구분이 아웃라인에서도 바로 보이게 함
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(LANGUAGE_ID, {
      provideDocumentSymbols(document) {
        const symbols = [];
        for (let i = 0; i < document.lineCount; i++) {
          const text = document.lineAt(i).text;
          const m = LABEL_DEF_RE.exec(text);
          if (!m) continue;

          const name = m[1];
          const isLocal = name.startsWith('.L');
          const kind = isLocal ? vscode.SymbolKind.Field : vscode.SymbolKind.Function;
          const detail = isLocal ? '로컬 라벨' : '전역 라벨 / 함수';

          const lineRange = new vscode.Range(i, 0, i, text.length);
          const nameStart = text.indexOf(name);
          const selectionRange = new vscode.Range(i, nameStart, i, nameStart + name.length);

          symbols.push(new vscode.DocumentSymbol(name, detail, kind, lineRange, selectionRange));
        }
        return symbols;
      },
    })
  );
}

function deactivate() {
  if (diagnosticCollection) diagnosticCollection.dispose();
}

module.exports = { activate, deactivate };
