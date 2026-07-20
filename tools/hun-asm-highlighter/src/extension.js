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
// =========================================================================
// ⚔️ [6구역: 종합 예술 조각소] 코드 칼정렬(Formatting) 포맷터 엔진
//    - 명령어 라인(mov/ldr/...) 블록별 니모닉 길이 자동 맞춤 정렬 (대수술 완료!)
//    - .asciz/.quad 같은 데이터 선언 "블록"을 표(table)처럼 컬럼 정렬
// =========================================================================

// 문자열 리터럴 안쪽인지 추적하면서 "구분자"를 찾아주는 공용 스캐너.
function isInsideStringAt(text, index) {
  let inStr = false;
  for (let i = 0; i < index; i++) {
    if (text[i] === '"' && text[i - 1] !== '\\') inStr = !inStr;
  }
  return inStr;
}

// "콤마 뒤 공백을 한 칸으로" 정규화하되, 문자열 리터럴 안의 콤마는 건드리지 않음.
function normalizeCommasOutsideStrings(str) {
  let result = '';
  let inStr = false;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '"' && str[i - 1] !== '\\') inStr = !inStr;

    if (!inStr && c === ',') {
      result += ',';
      let j = i + 1;
      while (str[j] === ' ') j++;
      result += ' ';
      i = j - 1;
      continue;
    }
    result += c;
  }
  return result;
}

// "값 // 주석" 에서 문자열 밖의 진짜 "//" 위치를 찾아 값/주석을 분리.
function splitTrailingComment(text) {
  for (let i = 0; i < text.length - 1; i++) {
    if (text[i] === '/' && text[i + 1] === '/' && !isInsideStringAt(text, i)) {
      return { value: text.slice(0, i).trimEnd(), comment: text.slice(i).trimEnd() };
    }
  }
  return { value: text.trimEnd(), comment: '' };
}

// 일반 명령어 라인 파싱 정규식
const INSTRUCTION_RE =
  /^(?:\s*([\p{L}_.$][\p{L}0-9_.$]*:))?\s*([\p{L}_.$][\p{L}0-9_.$]*)\s+(.*)$/u;

// 데이터 선언 라인 정규식 (.align 구문은 블록 정렬에서 철저히 제외!)
const DATA_DECL_RE =
  /^(\s*)(?:([\p{L}_.$][\p{L}0-9_.$]*)\s*:\s*)?((?!\.align\b)\.\p{L}[\p{L}0-9]*)\s+(.*)$/u;


// 데이터 선언 블록 정렬 함수 (기존 로직 유지)
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
          const labelCol = b.label ? (b.label + ':').padEnd(maxLabelLen + 1) : ' '.repeat(maxLabelLen ? maxLabelLen + 1 : 0);
          const directiveCol = b.directive.padEnd(maxDirectiveLen + 1);
          const valueCol = hasAnyComment ? b.value.padEnd(maxValueLen + 1) : b.value;
          formatted = `${b.indent}${labelCol}${directiveCol}${valueCol}${b.comment}`.replace(/\s+$/, '');
        } else {
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


// 🔥 [대수술 부위] 일반 명령어 라인 블록 정렬 함수 구체화!
function collectInstructionEdits(document) {
  const edits = [];
  let i = 0;

  while (i < document.lineCount) {
    const block = [];
    let j = i;

    // 연속된 일반 명령어 줄들을 하나의 "블록"으로 포획하기
    while (j < document.lineCount) {
      const line = document.lineAt(j);
      const text = line.text;
      const t = text.trim();

      // 빈 줄이나 주석 전용 줄을 만나면 블록을 끊는다!
      if (!t || t.startsWith('//') || t.startsWith('/*')) break;

      // .align 구문은 단독 처리 후 블록을 끊는다!
      if (t.startsWith('.align')) {
        if (t !== text) {
          edits.push(vscode.TextEdit.replace(line.range, t));
        }
        j++;
        break;
      }

      // 데이터 선언문 줄을 만나면 블록을 끊는다!
      if (DATA_DECL_RE.test(text)) break;

      // 일반 명령어 포획 시도
      const match = INSTRUCTION_RE.exec(text);
      if (match) {
        const label = match[1] ? match[1] : '';
        const mnemonic = match[2];
        const rawOperands = match[3] ? match[3] : '';

        // 지시어로 시작하는 것은 탈락 (.align 외의 다른 지시어 방어)
        if (mnemonic.startsWith('.')) {
          j++;
          break;
        }

        block.push({
          lineIdx: j,
          label,
          mnemonic,
          rawOperands,
          raw: text
        });
        j++;
      } else {
        // 매칭되지 않는 쌩뚱맞은 줄이 와도 블록을 끊는다
        break;
      }
    }

    // 🎯 포획된 명령어 블록이 있다면 칼군무 정렬 집도 시작!
    if (block.length > 0) {
      // 블록 내에서 가장 긴 니모닉(명령어)의 자릿수를 찾음 (예: adrp가 있으면 4)
      const maxMnemonicLen = Math.max(...block.map(b => b.mnemonic.length));

      for (const b of block) {
        // 1단계: 오퍼랜드 콤마 및 대괄호 공백 정규화
        let operands = normalizeCommasOutsideStrings(b.rawOperands);
        operands = operands.replace(/\[\s*([a-zA-Z0-9_]+)\s*,\s*([^\]]+)\]/g, '[$1, $2]');

        // 2단계: 핵심 마법! 가장 긴 명령어 길이에 맞춰서 뒤쪽 공백(padEnd)을 동적으로 채움!
        // 최소 1칸의 공백은 유지하도록 설정
        const mnemonicCol = b.mnemonic.padEnd(maxMnemonicLen + 1);

        // 3단계: 조립하기 (라벨이 있으면 앞에 붙이고, 없으면 탭(\t) 들여쓰기 유지)
        const formatted = b.label
          ? `${b.label}\t${mnemonicCol}${operands}`
          : `\t${mnemonicCol}${operands}`;

        if (formatted !== b.raw) {
          const line = document.lineAt(b.lineIdx);
          edits.push(vscode.TextEdit.replace(line.range, formatted));
        }
      }
    }

    // 다음 탐색 위치 지정
    i = j > i ? j : i + 1;
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
