// =========================================================================
// 👑 대제독의 hun-asm 확장팩 핵심 코어 엔진 (extension.js)
// =========================================================================

const vscode = require('vscode');
const { validateDocument } = require('./diagnostics');
const { MNEMONIC_MAP, ALL_MNEMONICS } = require('./mnemonics');

const LANGUAGE_ID = 'hun-asm';

// [정규식 감시탑] 라벨 정의 감지: "이름:" 형태 (한글 라벨 및 .L_ 로컬 라벨 포획용)
const LABEL_DEF_RE = /^\s*([\p{L}_.$][\p{L}0-9_.$]*)\s*:/u;

/** @type {vscode.DiagnosticCollection} */
let diagnosticCollection;


// =========================================================================
// 🔍 [내부 첩보원] 문서 내 라벨 위치 추적 함수
// =========================================================================
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


// =========================================================================
// ⚔️ [6구역: 종합 예술 조각소] 코드 칼정렬(Formatting) 포맷터 엔진
//    - 명령어 라인(mov/ldr/...) 정렬
//    - .asciz/.quad 같은 데이터 선언 "블록"을 표(table)처럼 컬럼 정렬
// =========================================================================

// 문자열 리터럴 안쪽인지 추적하면서 "구분자"를 찾아주는 공용 스캐너.
// 콤마 정규화(,\s* → ", ")나 // 주석 위치 찾기처럼, 문자열 안의 문자를
// 잘못 건드리면 안 되는 모든 곳에서 재사용한다.
function isInsideStringAt(text, index) {
  let inStr = false;
  for (let i = 0; i < index; i++) {
    if (text[i] === '"' && text[i - 1] !== '\\') inStr = !inStr;
  }
  return inStr;
}

// "콤마 뒤 공백을 한 칸으로" 정규화하되, 문자열 리터럴 안의 콤마는 건드리지 않음.
// (기존 코드의 `rawOperands.replace(/,\s*/g, ", ")` 는 .asciz "1,2,3" 같은
//  문자열 내용까지 고쳐버리는 버그가 있었음 - 이 함수로 교체)
function normalizeCommasOutsideStrings(str) {
  let result = '';
  let inStr = false;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '"' && str[i - 1] !== '\\') inStr = !inStr;

    if (!inStr && c === ',') {
      result += ',';
      let j = i + 1;
      while (str[j] === ' ') j++; // 콤마 뒤 공백들을 모두 건너뛰고
      result += ' ';              // 딱 한 칸만 다시 채움
      i = j - 1;
      continue;
    }
    result += c;
  }
  return result;
}

// "값 // 주석" 에서 문자열 밖의 진짜 "//" 위치를 찾아 값/주석을 분리.
// (.asciz 문자열 안에 우연히 "//"가 들어있어도 안전하게 통과)
function splitTrailingComment(text) {
  for (let i = 0; i < text.length - 1; i++) {
    if (text[i] === '/' && text[i + 1] === '/' && !isInsideStringAt(text, i)) {
      return { value: text.slice(0, i).trimEnd(), comment: text.slice(i).trimEnd() };
    }
  }
  return { value: text.trimEnd(), comment: '' };
}

// 일반 명령어 라인: (라벨:)? 니모닉 오퍼랜드...
const INSTRUCTION_RE =
  /^(?:\s*([\p{L}_.$][\p{L}0-9_.$]*:))?\s*([\p{L}_.$][\p{L}0-9_.$]*)\s+(.*)$/u;

// 데이터 선언 라인: (라벨:)? .지시어 값...  (예: format_str: .asciz "...")
const DATA_DECL_RE =
  /^(\s*)(?:([\p{L}_.$][\p{L}0-9_.$]*)\s*:\s*)?(\.\p{L}[\p{L}0-9]*)\s+(.*)$/u;

function formatInstructionLine(text) {
  const match = INSTRUCTION_RE.exec(text);
  if (!match) return text;

  const label = match[1] ? match[1] : '';
  const mnemonic = match[2];
  const rawOperands = match[3] ? match[3] : '';

  // 지시어(.asciz 등)는 여기서 다루지 않음 - collectAndAlignDataBlocks 담당
  if (mnemonic.startsWith('.')) return text;

  // 1단계: 콤마 뒤 공백 정리 (문자열 안쪽은 보호)
  let operands = normalizeCommasOutsideStrings(rawOperands);
  // 2단계: 대괄호 내부 공백 접착
  operands = operands.replace(/\[\s*([a-zA-Z0-9_]+)\s*,\s*([^\]]+)\]/g, '[$1, $2]');

  return label ? `${label}\t${mnemonic}\t${operands}` : `\t${mnemonic}\t${operands}`;
}

// .asciz / .quad 같은 데이터 선언이 연속된 "블록"을 찾아 정렬.
//
//  alignMode === true  → 🔥 칼군무 모드: 블록 안 최대 길이를 계산해서
//                        공백(padEnd)으로 라벨/지시어/값 열을 칼같이 맞춤.
//  alignMode === false → 🔹 라벨 밀착 모드: 정렬 없이, 라벨:지시어:값 사이를
//                        딱 한 칸씩만 남기고 순정 그대로 밀착시킴.
function collectAndAlignDataBlockEdits(document, alignMode) {
  const edits = [];
  let i = 0;

  while (i < document.lineCount) {
    const block = [];
    let j = i;

    while (j < document.lineCount) {
      const raw = document.lineAt(j).text;
      const m = DATA_DECL_RE.exec(raw);
      if (!m) break;

      const [, indent, label, directive, tail] = m;
      const { value, comment } = splitTrailingComment(normalizeCommasOutsideStrings(tail));
      block.push({ lineIdx: j, indent, label: label || '', directive, value, comment, raw });
      j++;
    }

    if (block.length > 0) {
      // 칼군무 모드는 최소 2줄은 있어야 "정렬"의 의미가 있음. 1줄뿐이면
      // 어차피 정렬할 상대가 없으니 라벨 밀착 모드와 동일하게 처리.
      const useAlign = alignMode && block.length >= 2;

      let maxLabelLen = 0, maxDirectiveLen = 0, maxValueLen = 0, hasAnyComment = false;
      if (useAlign) {
        maxLabelLen = Math.max(...block.map((b) => (b.label ? b.label.length + 1 : 0)));
        maxDirectiveLen = Math.max(...block.map((b) => b.directive.length));
        hasAnyComment = block.some((b) => b.comment);
        maxValueLen = Math.max(...block.map((b) => b.value.length));
      }

      for (const b of block) {
        let formatted;
        if (useAlign) {
          // 🔥 칼군무 모드
          const labelCol = b.label ? (b.label + ':').padEnd(maxLabelLen + 1) : ' '.repeat(maxLabelLen ? maxLabelLen + 1 : 0);
          const directiveCol = b.directive.padEnd(maxDirectiveLen + 1);
          const valueCol = hasAnyComment ? b.value.padEnd(maxValueLen + 1) : b.value;
          formatted = `${b.indent}${labelCol}${directiveCol}${valueCol}${b.comment}`.replace(/\s+$/, '');
        } else {
          // 🔹 라벨 밀착 모드: 정렬 없이 한 칸씩만
          const labelPart = b.label ? `${b.label}: ` : '';
          const commentPart = b.comment ? ` ${b.comment}` : '';
          formatted = `${b.indent}${labelPart}${b.directive} ${b.value}${commentPart}`.replace(/\s+$/, '');
        }

        if (formatted !== b.raw) {
          const line = document.lineAt(b.lineIdx);
          edits.push(vscode.TextEdit.replace(line.range, formatted));
        }
      }
    }

    i = j > i ? j : i + 1;
  }

  return edits;
}

function collectInstructionEdits(document) {
  const edits = [];

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const text = line.text;

    // 빈 줄, 주석 전용 줄, 지시어 줄(.asciz 등 - 위 블록 정렬이 담당)은 건드리지 않음
    const t = text.trim();
    if (!t || t.startsWith('//') || t.startsWith('/*')) continue;
    if (DATA_DECL_RE.test(text)) continue;

    const formatted = formatInstructionLine(text);
    if (formatted !== text) {
      edits.push(vscode.TextEdit.replace(line.range, formatted));
    }
  }

  return edits;
}


// =========================================================================
// 🚀 [제국 선포] 확장팩 활성화 (activate) 총지휘소
// =========================================================================
function activate(context) {

  // -----------------------------------------------------------------------
  // 🩺 [1구역: 실시간 코드 검진기] 문법 에러 및 경고(Diagnostics) 배포
  // -----------------------------------------------------------------------
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

  // 백성들이 이미 열어놓은 문서들 전수조사
  vscode.workspace.textDocuments.forEach(refresh);

  // 실시간 문서 감시망 가동 (열 때, 고칠 때, 닫을 때)
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(refresh),
    vscode.workspace.onDidChangeTextDocument((e) => refresh(e.document)),
    vscode.workspace.onDidCloseTextDocument((doc) => diagnosticCollection.delete(doc.uri))
  );


  // -----------------------------------------------------------------------
  // 💡 [2구역: 족집게 사전] 니모닉 마우스 호버(Hover) 설명 제공
  // -----------------------------------------------------------------------
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(LANGUAGE_ID, {
      provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position, /[\p{L}0-9_.]+/u);
        if (!range) return;

        // 대소문자 꼬임 방지를 위해 무조건 소문자로 변환하여 장부 검색!
        const word = document.getText(range).trim().toLowerCase();
        const info = MNEMONIC_MAP[word];
        if (!info) return;

        const md = new vscode.MarkdownString();
        const originalWord = document.getText(range); // 백성이 쓴 원본 형태 추출

        md.appendMarkdown(`**${originalWord}** → \`${info.english.toUpperCase()}\`\n\n${info.desc}`);
        return new vscode.Hover(md, range);
      },
    })
  );


  // -----------------------------------------------------------------------
  // ✍️ [3구역: 서기 대행] 니모닉 자동완성(Completion) 비서실
  // -----------------------------------------------------------------------
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


  // -----------------------------------------------------------------------
  // 🎯 [4구역: 축지법] F12 라벨 정의 이동(Go to Definition) 네비게이터
  // -----------------------------------------------------------------------
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(LANGUAGE_ID, {
      async provideDefinition(document, position) {
        const range = document.getWordRangeAtPosition(position, /[\p{L}0-9_.$]+/u);
        if (!range) return;
        const word = document.getText(range);
        if (!word) return;

        // 1) 같은 문서 안에서 먼저 수색
        const localPos = findLabelInDocument(document, word);
        if (localPos) return new vscode.Location(document.uri, localPos);

        // .L_ 로컬 라벨은 다른 파일로 못 건너가게 차단
        if (word.startsWith('.L')) return;

        // 2) 워크스페이스 전역을 이 잡듯 뒤지기 (전역 라벨 수색)
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


  // -----------------------------------------------------------------------
  // 🗺️ [5구역: 작전 지도] 아웃라인 패널(Ctrl+Shift+O) 심볼 트리 빌더
  // -----------------------------------------------------------------------
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


  // -----------------------------------------------------------------------
  // ⚔️ [6구역: 종합 예술 조각소] 코드 칼정렬(Formatting) 포맷터 엔진
  //    - 명령어 라인은 탭 기반 정렬 (기존과 동일, 문자열 안 콤마 보호 버그 수정됨)
  //    - .asciz/.quad 등 데이터 선언은 "블록" 단위로 찾아 공백 컬럼 정렬
  // -----------------------------------------------------------------------
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(LANGUAGE_ID, {
      provideDocumentFormattingEdits(document) {
        // resource(document.uri)를 함께 넘기면 멀티 루트 워크스페이스에서
        // 폴더별로 다른 설정을 준 경우에도 정확한 값을 읽어옴.
        const config = vscode.workspace.getConfiguration('hun-asm', document.uri);
        const alignMode = config.get('alignDataDirectives', true);

        if (alignMode) {
          console.log('[hun-asm] 대제독의 명에 따라 칼군무 정렬을 실시한다! 🔥');
        } else {
          console.log('[hun-asm] 순정파 모드! 라벨에 바짝 붙인다! 🔹');
        }

        // 두 패스는 서로 다른 종류의 줄(명령어 vs 지시어)만 건드리므로
        // 같은 줄에 대한 편집이 중복/충돌할 일이 없음.
        return [
          ...collectAndAlignDataBlockEdits(document, alignMode),
          ...collectInstructionEdits(document),
        ];
      },
    })
  );
}


// =========================================================================
// 🛑 [퇴근] 확장팩 비활성화 (deactivate) 정리소
// =========================================================================
function deactivate() {
  if (diagnosticCollection) diagnosticCollection.dispose();
}

module.exports = { activate, deactivate };
