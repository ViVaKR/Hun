// extension.js
const vscode = require('vscode');
const { validateDocument } = require('./diagnostics');
const { MNEMONIC_MAP, ALL_MNEMONICS } = require('./mnemonics');

const LANGUAGE_ID = 'hun-asm';

/** @type {vscode.DiagnosticCollection} */
let diagnosticCollection;

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
}

function deactivate() {
  if (diagnosticCollection) diagnosticCollection.dispose();
}

module.exports = { activate, deactivate };
