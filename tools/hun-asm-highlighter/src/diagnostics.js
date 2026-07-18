// diagnostics.js
// 훈-ASM(Hun ARM64) 문서에 대한 아주 기본적인 정적 검사.
//
// 지금 잡아내는 것들 (친구 톤):
//  1) LDP/STP (쌍적재/쌍저장): 오프셋 정렬(8 또는 4의 배수) + 인코딩 가능 범위(imm7)
//  2) LDR/STR (적재/저장)   : 오프셋 정렬 + 범위 (unsigned-offset 형태 / pre-post-index 형태)
//  3) 존재하지 않는 레지스터 이름 (x31, w99 같은 것)
//  4) 레지스터 폭 불일치 (x 레지스터랑 w 레지스터를 쌍으로 묶었을 때)
//  5) 얼추 "영문 소문자 니모닉처럼 생겼는데 목록에 없는 단어" 에 대한 가벼운 힌트
//
// 여기서 못 잡는 것 (일부러 범위를 좁게 잡음 - 오탐 방지):
//  - 한글 니모닉 전체의 오타 검출 (적재/저장/쌍적재/쌍저장 외에는 문법 규칙이 다양해서 보류)
//  - 매크로 확장 이후의 의미 검사
//  - LDUR/STUR 같은 비-스케일 명령 (현재 grammar 목록에 없음)

const vscode = require('vscode');
const { KNOWN_SET } = require('./mnemonics');

const PAIR_RE =
  /^(ldp|stp|쌍적재|쌍저장)\s+([^,\s]+)\s*,\s*([^,\s]+)\s*,\s*\[\s*([^\],\s]+)\s*(?:,\s*#(-?\d+)\s*)?\]\s*(!)?\s*(?:,\s*#(-?\d+))?/;

const SINGLE_RE =
  /^(ldr|str|적재|저장)\s+([^,\s]+)\s*,\s*\[\s*([^\],\s]+)\s*(?:,\s*#(-?\d+)\s*)?\]\s*(!)?\s*(?:,\s*#(-?\d+))?/;

const LABEL_PREFIX_RE = /^[\p{L}_.$][\p{L}0-9_.$]*:\s*/u;
const LABEL_ONLY_RE = /^[\p{L}_.$][\p{L}0-9_.$]*:$/u;

function parseRegister(tok) {
  if (tok === undefined) return null;
  const t = tok.trim();
  if (t === 'sp') return { width: 64, name: 'sp' };
  if (t === 'fp') return { width: 64, name: 'fp' };
  if (t === 'lr') return { width: 64, name: 'lr' };
  if (t === 'xzr') return { width: 64, name: 'xzr' };
  if (t === 'wzr') return { width: 32, name: 'wzr' };

  const m = /^([xwd])([0-9]{1,2})$/.exec(t);
  if (m) {
    const num = parseInt(m[2], 10);
    if (num >= 0 && num <= 30) {
      return { width: m[1] === 'x' ? 64 : 32, name: t };
    }
  }
  return null;
}

function stripComments(text) {
  let t = text;
  const slashIdx = t.indexOf('//');
  if (slashIdx >= 0) t = t.slice(0, slashIdx);
  t = t.replace(/\/\*.*?\*\//g, '');
  return t;
}

function stripLeadingLabel(t) {
  const m = LABEL_PREFIX_RE.exec(t);
  return m ? t.slice(m[0].length) : t;
}

function addDiag(diags, rawText, lineIdx, needle, message, severity) {
  severity = severity === undefined ? vscode.DiagnosticSeverity.Error : severity;
  let start = needle ? rawText.indexOf(needle) : -1;
  if (start < 0) start = 0;
  const length = needle ? needle.length : rawText.length;
  const range = new vscode.Range(lineIdx, start, lineIdx, start + length);
  const d = new vscode.Diagnostic(range, message, severity);
  d.source = 'hun-asm';
  diags.push(d);
}

function checkPairInstruction(trimmed, rawText, lineIdx, diags) {
  const m = PAIR_RE.exec(trimmed);
  if (!m) return;
  const [, , rt1Tok, rt2Tok, baseTok, insideImm, , postImm] = m;

  const rt1 = parseRegister(rt1Tok);
  const rt2 = parseRegister(rt2Tok);
  const base = parseRegister(baseTok);

  if (!rt1) addDiag(diags, rawText, lineIdx, rt1Tok, `어라, "${rt1Tok}" 이건 레지스터 이름이 아닌 것 같은데? x0~x30 / w0~w30 / sp / lr / fp 중에서 골라보게.`);
  if (!rt2) addDiag(diags, rawText, lineIdx, rt2Tok, `"${rt2Tok}"도 낯선 레지스터 이름이군.`);
  if (!base) addDiag(diags, rawText, lineIdx, baseTok, `주소로 쓸 베이스 레지스터 "${baseTok}"가 이상하네.`);
  if (!rt1 || !rt2 || !base) return;

  if (rt1.width !== rt2.width) {
    addDiag(diags, rawText, lineIdx, rt2Tok,
      `이봐 친구, ${rt1Tok}(${rt1.width}비트)랑 ${rt2Tok}(${rt2.width}비트)는 체급이 다르잖아. 같은 크기끼리 짝지어야지 ㅋㅋ`,
      vscode.DiagnosticSeverity.Warning);
  }
  if (base.width !== 64) {
    addDiag(diags, rawText, lineIdx, baseTok, `주소 계산은 64비트 레지스터(x.. 또는 sp)로 해야 하네, "${baseTok}"는 좀 가볍구먼.`);
  }

  if (insideImm !== undefined && postImm !== undefined) {
    addDiag(diags, rawText, lineIdx, `#${postImm}`, `오프셋이 대괄호 안에도 있고 밖에도 있고, 욕심이 과하네 그려. 하나만 쓰게.`);
    return;
  }
  const immStr = insideImm !== undefined ? insideImm : postImm;
  if (immStr === undefined) return;

  const imm = parseInt(immStr, 10);
  const scale = rt1.width === 64 ? 8 : 4;
  const min = -64 * scale;
  const max = 63 * scale;

  if (imm % scale !== 0) {
    addDiag(diags, rawText, lineIdx, `#${immStr}`,
      `어이 친구, #${imm}이 먼가? 모냥 빠지네 ㅋㅋㅋ ${rt1.width}비트 쌍적재/쌍저장은 오프셋이 ${scale}의 배수라야 하네.`);
  } else if (imm < min || imm > max) {
    addDiag(diags, rawText, lineIdx, `#${immStr}`,
      `#${imm}은 범위 밖이네. ${rt1.width}비트 기준으로 ${min}~${max} 사이라야 인코딩이 되네.`);
  }
}

function checkSingleInstruction(trimmed, rawText, lineIdx, diags) {
  const m = SINGLE_RE.exec(trimmed);
  if (!m) return;
  const [, , rtTok, baseTok, insideImm, bang, postImm] = m;

  const rt = parseRegister(rtTok);
  const base = parseRegister(baseTok);

  if (!rt) addDiag(diags, rawText, lineIdx, rtTok, `"${rtTok}" 이건 레지스터 이름이 아닌 것 같은데?`);
  if (!base) addDiag(diags, rawText, lineIdx, baseTok, `베이스 레지스터 "${baseTok}"가 낯설군.`);
  if (!rt || !base) return;

  if (base.width !== 64) {
    addDiag(diags, rawText, lineIdx, baseTok, `주소 계산은 64비트 레지스터(x.. 또는 sp)로 해야 하네, "${baseTok}"는 좀 가볍구먼.`);
  }

  if (insideImm !== undefined && postImm !== undefined) {
    addDiag(diags, rawText, lineIdx, `#${postImm}`, `오프셋이 대괄호 안에도 있고 밖에도 있고, 하나만 쓰게.`);
    return;
  }

  const isPreOrPostIndex = bang !== undefined || postImm !== undefined;

  if (isPreOrPostIndex) {
    const immStr = postImm !== undefined ? postImm : insideImm;
    if (immStr === undefined) return;
    const imm = parseInt(immStr, 10);
    if (imm < -256 || imm > 255) {
      addDiag(diags, rawText, lineIdx, `#${immStr}`,
        `#${imm}은 pre/post-index 형태 범위(-256~255)를 벗어났네. 이 형태는 정렬은 안 따져도 되지만 9비트 안에는 들어와야 하네.`);
    }
    return;
  }

  if (insideImm === undefined) return; // 오프셋 없음, 정상
  const imm = parseInt(insideImm, 10);
  const size = rt.width === 64 ? 8 : 4;
  if (imm < 0) {
    addDiag(diags, rawText, lineIdx, `#${insideImm}`,
      `이 형태(기본 오프셋)에선 음수 오프셋 #${imm}은 못 쓰네. pre/post-index로 쓰려면 "!"나 콤마 형태로 바꿔보게.`);
  } else if (imm % size !== 0) {
    addDiag(diags, rawText, lineIdx, `#${insideImm}`,
      `어이 친구, #${imm}이 먼가? ${rt.width}비트 적재/저장은 오프셋이 ${size}의 배수라야 인코딩이 되네.`);
  } else if (imm > 4095 * size) {
    addDiag(diags, rawText, lineIdx, `#${insideImm}`,
      `#${imm}은 너무 크네. ${rt.width}비트 기준 최대 ${4095 * size}까지라네.`);
  }
}

function checkUnknownMnemonic(trimmed, rawText, lineIdx, diags) {
  if (trimmed.startsWith('.')) return;
  if (LABEL_ONLY_RE.test(trimmed)) return;

  const firstTokMatch = /^([\p{L}_][\p{L}0-9_.]*)/u.exec(trimmed);
  if (!firstTokMatch) return;
  const first = firstTokMatch[1];

  // 매크로 호출(FUNC_START, XXX_SECTION 등)은 관례상 대문자라 제외
  if (/^[A-Z0-9_]+$/.test(first)) return;
  // 영문 소문자로만 된 토큰만 대상으로 함 (한글 니모닉은 규칙이 다양해서 여기선 보류)
  if (!/^[a-z][a-z.]*$/.test(first)) return;
  if (KNOWN_SET.has(first)) return;

  addDiag(diags, rawText, lineIdx, first,
    `"${first}"... 내가 아는 명령어 목록엔 없는 녀석인데? 오타 아닌지 한번 봐주게.`,
    vscode.DiagnosticSeverity.Information);
}

function validateDocument(document) {
  const diags = [];
  for (let i = 0; i < document.lineCount; i++) {
    const rawText = document.lineAt(i).text;
    let text = stripComments(rawText).trim();
    if (!text) continue;
    text = stripLeadingLabel(text).trim();
    if (!text) continue;

    checkPairInstruction(text, rawText, i, diags);
    checkSingleInstruction(text, rawText, i, diags);
    checkUnknownMnemonic(text, rawText, i, diags);
  }
  return diags;
}

module.exports = { validateDocument, parseRegister };
