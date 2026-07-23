// =========================================================================
// 👑 대제독의 hun-asm 확장팩 핵심 코어 엔진 (extension.js)
// =========================================================================

const vscode = require('vscode');
const { validateDocument } = require('./diagnostics');

// 🔗 [단일 진실 공급원] hover / completion 이 항상 같은 설명을 보여주도록
//    MNEMONIC_MAP(mnemonics.js) + arm64Instructions/arm64FpInstructions/
//    arm64ConditionCodes(data/arm64-data.js) 를 하나로 합쳐 조회하는 레이어.
//    (예전엔 hover는 MNEMONIC_MAP만, completion은 두 소스를 각각 따로 순회
//     하면서 'mov'/'MOV'가 별개 후보로 중복 등장하는 문제가 있었음.)
const { getMnemonicInfo, getAllCompletionEntries } = require('./mnemonic-info');

// 🔥 [ARM64 첩보원 추가] ARM64 표준 명령어 & 레지스터 데이터 로드
// (2026-07 보강: FP/SIMD 레지스터(V0~V31), 부동소수점 명령어, 조건 코드 표까지 전부 로드.
//  예전엔 arm64Instructions/arm64Registers 두 개만 가져와서, FP 관련 자료가 파일에는
//  있어도 실제 hover/자동완성에는 전혀 연결이 안 되고 있었음.)
const {
  arm64Registers,
  arm64FpSimdRegisters,
} = require('./data/arm64-data');

// 🩹 [스칼라 뷰 파생] arm64-data.js 에는 V0~V31(128비트 벡터) 항목만 있고,
// 그 하위 비트 폭 스칼라 뷰인 D0(64b)/S0(32b)/H0(16b)/B0(8b)/Q0(128b)는
// 각 Vn 설명문 "안에 텍스트로만" 언급될 뿐, 실제로 조회 가능한 엔트리가 아니었음.
// → 그래서 마우스를 D0 위에 올려도 REGISTER_INDEX에 잡히는 게 없어서 호버가 그냥 안 뜬 것.
// 데이터 파일에 32×5개를 일일이 손으로 채우는 대신, 여기서 Vn 하나당 자동으로
// B/H/S/D/Q 스칼라 별칭 다섯 개를 파생시켜서 인덱스에 함께 등록해준다.
const SCALAR_VIEW_INFO = {
  B: { bits: 8, label: 'Byte scalar (8-bit)' },
  H: { bits: 16, label: 'Halfword scalar (16-bit)' },
  S: { bits: 32, label: 'Single-precision scalar (32-bit)' },
  D: { bits: 64, label: 'Double-precision scalar (64-bit)' },
  Q: { bits: 128, label: 'Quadword scalar (128-bit, full vector width)' },
};

function deriveScalarViewRegisters(vRegisters) {
  const derived = [];
  for (const vReg of vRegisters) {
    const m = /^V([0-9]{1,2})$/.exec(vReg.name);
    if (!m) continue; // FPCR/FPSR 등 스칼라 뷰가 없는 항목은 스킵
    const num = m[1];
    for (const prefix of Object.keys(SCALAR_VIEW_INFO)) {
      const { label } = SCALAR_VIEW_INFO[prefix];
      derived.push({
        name: `${prefix}${num}`,
        description: `${label} view of V${num} — the lower ${SCALAR_VIEW_INFO[prefix].bits} bits of the same physical register. ${vReg.description}`,
        type: `${vReg.type} · ${label}`,
      });
    }
  }
  return derived;
}

const derivedScalarRegisters = deriveScalarViewRegisters(arm64FpSimdRegisters || []);

// 정수 + FP/SIMD(Vn) + 파생된 스칼라 뷰(Bn/Hn/Sn/Dn/Qn)를 하나로 합친 통합 목록 / 조회 인덱스
const ALL_ARM_REGISTERS = [...arm64Registers, ...(arm64FpSimdRegisters || []), ...derivedScalarRegisters];
const REGISTER_INDEX = new Map(ALL_ARM_REGISTERS.map((r) => [r.name.toUpperCase(), r]));

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
// 📝 [공용 조립소] getMnemonicInfo() 결과를 vscode.MarkdownString 으로 조립.
//    hover / completion 양쪽에서 이 함수 하나만 쓰므로 항상 같은 내용이 뜬다.
// =========================================================================
function buildMnemonicMarkdown(originalWord, info) {
  const md = new vscode.MarkdownString();
  // ⭐️ 이 두 줄이 반드시 들어가 있어야 수식이 작동합니다!
  md.isTrusted = true;    // 수학 공식($...$) 및 커맨드 링크 활성화 필수 옵션
  md.supportHtml = true;  // <br> 등의 HTML 태그 허용 옵션

  if (info.hangulAliases.length > 0) {
    md.appendMarkdown(`**${originalWord}** → \`${info.english.toUpperCase()}\`  \n`);
    md.appendMarkdown(`별칭: ${info.hangulAliases.map((a) => `\`${a}\``).join(', ')}\n\n`);
  } else {
    md.appendMarkdown(`### \`${info.english.toUpperCase()}\`\n\n`);
  }

  md.appendMarkdown(`${info.description}\n\n`);

  if (info.syntax) {
    md.appendMarkdown('**Syntax:**\n');
    md.appendCodeblock(info.syntax, 'arm64');
  }
  if (info.example) {
    md.appendMarkdown('\n**Example:**\n');
    md.appendCodeblock(info.example, 'arm64');
  }

  return md;
}


// =========================================================================
// ⚔️ [6구역: 종합 예술 조각소] 코드 칼정렬(Formatting) 포맷터 엔진
//    - 명령어 라인(mov/ldr/...) 정렬
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


// 일반 명령어 라인 블록 정렬 함수 구체화
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
  //    (2026-07 통합: mnemonic-info.js 의 getMnemonicInfo() 하나로 일원화.
  //     이제 'mov'든 '할당'이든 완전히 같은 설명(풍부한 버전)이 뜬다.
  //     예전엔 MNEMONIC_MAP을 먼저 체크하는 바람에 영문 니모닉은 항상 짧은
  //     설명에서 멈추고, arm64-data.js의 syntax/example까지 못 갔었음.)
  // -----------------------------------------------------------------------
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(LANGUAGE_ID, {
      provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position, /[\p{L}0-9_.]+/u);
        if (!range) return;

        const originalWord = document.getText(range); // 백성이 쓴 원본 형태

        // 1) 니모닉(한글 별칭 + 영문 + FP + 조건부 분기) 통합 조회
        const info = getMnemonicInfo(originalWord);
        if (info) {
          return new vscode.Hover(buildMnemonicMarkdown(originalWord, info), range);
        }

        // 2) ARM64 레지스터 검사 (정수 + FP/SIMD + 파생 스칼라 뷰 통합 인덱스)
        const wordUpper = originalWord.trim().toUpperCase();
        const armReg = REGISTER_INDEX.get(wordUpper);
        if (armReg) {
          const md = new vscode.MarkdownString();
          // ⭐️ 이 두 줄이 반드시 들어가 있어야 수식이 작동합니다!
          md.isTrusted = true;    // 수학 공식($...$) 및 커맨드 링크 활성화 필수 옵션
          md.supportHtml = true;  // <br> 등의 HTML 태그 허용 옵션
          md.appendMarkdown(`### ARM64 Register: \`${armReg.name}\`\n\n`);
          md.appendMarkdown(`**Type:** ${armReg.type}\n\n`);
          md.appendMarkdown(`**Description:** ${armReg.description}`);
          return new vscode.Hover(md, range);
        }

        return;
      },
    })
  );


  // -----------------------------------------------------------------------
  // ✍️ [3구역: 서기 대행] 니모닉 자동완성(Completion) 비서실
  //    (2026-07 통합: getAllCompletionEntries() 로 영문 니모닉은 캐논 하나만,
  //     한글 별칭은 별도 단어로 등록하되 설명은 hover와 완전히 동일하게 공유.
  //     예전엔 'mov'(짧은 설명)와 'MOV'(풍부한 설명)가 별개 후보로 중복 등장했음.)
  // -----------------------------------------------------------------------
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      LANGUAGE_ID, {
      provideCompletionItems(document, position) {
        try {
          const completionItems = [];
          const range = document.getWordRangeAtPosition(position, /[\p{L}0-9_.]+/u);

          // 1) 니모닉(한글 + 영문) 통합 자동완성
          for (const entry of getAllCompletionEntries()) {
            try {
              const item = new vscode.CompletionItem(entry.insertText, vscode.CompletionItemKind.Keyword);
              const info = entry.info;

              if (info) {
                item.detail = info.hangulAliases.length
                  ? `${info.english.toUpperCase()} (${info.hangulAliases.join(', ')})`
                  : info.english.toUpperCase();
                item.documentation = buildMnemonicMarkdown(entry.insertText, info);
              } else {
                item.detail = 'Hun-ASM mnemonic';
              }

              item.insertText = new vscode.SnippetString(`${entry.insertText} `);
              item.filterText = `${entry.insertText.toLowerCase()} ${entry.insertText}`;
              if (range) item.range = range;
              completionItems.push(item);
            } catch (e) {
              console.error('[hun-asm] 니모닉 자동완성 처리 중 에러:', e);
            }
          }

          // 2) ARM64 레지스터 자동완성 (정수 + FP/SIMD + 파생 스칼라 뷰 통합 목록)
          if (Array.isArray(ALL_ARM_REGISTERS)) {
            ALL_ARM_REGISTERS.forEach((reg) => {
              try {
                const item = new vscode.CompletionItem(reg.name, vscode.CompletionItemKind.Variable);
                item.detail = `ARM64 Register: ${reg.name} (${reg.type})`;
                item.documentation = new vscode.MarkdownString(reg.description);

                item.documentation.isTrusted = true;    // 수학 공식($...$) 및 커맨드 링크 활성화 필수 옵션
                item.documentation.supportHtml = true;  // <br> 등의 HTML 태그 허용 옵션

                item.filterText = `${reg.name.toLowerCase()} ${reg.name}`;
                if (range) item.range = range;
                completionItems.push(item);
              } catch (e) {
                console.error('[hun-asm] ARM64 레지스터 처리 중 에러:', e);
              }
            });
          }

          return completionItems;
        } catch (globalError) {
          console.error('[hun-asm] 자동완성 수집 중 심각한 에러 발생:', globalError);
          return [];
        }
      },
    },
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      '.', '_'
    )
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
        const config = vscode.workspace.getConfiguration('hun-asm', document.uri);
        const alignMode = config.get('alignDataDirectives', true);

        if (alignMode) {
          console.log('[hun-asm] 대제독의 명에 따라 칼군무 정렬을 실시한다! 🔥');
        } else {
          console.log('[hun-asm] 순정파 모드! 라벨에 바짝 붙인다! 🔹');
        }

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
