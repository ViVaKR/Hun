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
        const range = document.getWordRangeAtPosition(position, /[\p{L}][\p{L}0-9_.]*/u);
        if (!range) return;
        const word = document.getText(range);
        const info = MNEMONIC_MAP[word];
        if (!info) return;
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`**${word}** → \`${info.english}\`\n\n${info.desc}`);
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
