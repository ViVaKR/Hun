// mnemonic-info.js
// -----------------------------------------------------------------------
// 목적: hover(마우스 오버)와 completion(자동완성) 두 곳이 "완전히 같은" 설명을
//       보여주도록 만드는 단일 진실 공급원(single source of truth).
//
// 발견된 문제:
//   1) hover: MNEMONIC_MAP(짧은 설명)을 먼저 체크하다 보니, 'mov' 같은 영문
//      니모닉은 항상 짧은 설명에서 멈추고 arm64-data.js의 풍부한 설명까지
//      절대 도달하지 못했음.
//   2) completion: ALL_MNEMONICS 순회(소문자 'mov', 짧은 설명)와
//      ALL_ARM_INSTRUCTIONS 순회(대문자 'MOV', 풍부한 설명)가 완전히 별개
//      항목으로 둘 다 떠서, 같은 명령어가 두 번 뜨고 설명 품질도 달랐음.
//
// 해법: 이 파일이 vscode API에 의존하지 않는 "순수 데이터 조회 레이어"가
//       되고, extension.js 는 여기서 나온 정보만 가지고 MarkdownString을
//       조립한다. (Buddham.Core가 인프라 의존성 없는 순수 레이어인 것과
//       같은 원칙 — 데이터 조회 로직과 vscode UI 조립 로직을 분리.)
// -----------------------------------------------------------------------

const {
  arm64Instructions,
  arm64FpInstructions,
  arm64ConditionCodes,
} = require('./data/arm64-data');

const {
  MNEMONIC_MAP,
  ENGLISH_MNEMONICS,
  HANGUL_MNEMONICS,
} = require('./mnemonics');

// 정수 + 부동소수점 명령어를 하나로 합친 목록 / 영문 소문자 기준 조회 인덱스
const ALL_ARM_INSTRUCTIONS = [...arm64Instructions, ...(arm64FpInstructions || [])];
const instructionByEnglish = new Map(ALL_ARM_INSTRUCTIONS.map((i) => [i.name.toLowerCase(), i]));

// 조건 코드 인덱스 ("CS / HS" 처럼 슬래시로 묶인 별칭은 개별 키로도 등록)
const conditionByName = new Map();
(arm64ConditionCodes || []).forEach((c) => {
  c.name.split('/').map((s) => s.trim().toLowerCase()).forEach((alias) => {
    conditionByName.set(alias, c);
  });
});

// 영문 니모닉 -> 한글 별칭 목록 (역매핑).
// MNEMONIC_MAP 은 { 'mov': {...}, '할당': {...} } 처럼 영문 키와 한글 키가
// 같은 english 값을 공유하는 구조이므로, english 기준으로 그룹핑한다.
const hangulAliasesByEnglish = new Map();
for (const [key, val] of Object.entries(MNEMONIC_MAP)) {
  if (key === val.english) continue; // 영문 키 자기 자신은 별칭이 아님
  if (!hangulAliasesByEnglish.has(val.english)) {
    hangulAliasesByEnglish.set(val.english, []);
  }
  hangulAliasesByEnglish.get(val.english).push(key);
}

function resolveEnglish(rawToken) {
  const token = rawToken.trim().toLowerCase();
  const mapped = MNEMONIC_MAP[token];
  return mapped ? mapped.english : token;
}

/**
 * 토큰(한글 별칭이든 영문 니모닉이든, 대소문자 무관)을 받아 통합 정보를 반환.
 * hover / completion 양쪽에서 이 함수 하나만 쓰면 항상 같은 내용이 뜬다.
 *
 * @param {string} rawToken
 * @returns {null | {
 *   english: string,
 *   hangulAliases: string[],
 *   description: string,
 *   syntax?: string,
 *   example?: string,
 *   kind: 'instruction' | 'condition' | 'mnemonic-only' | 'unknown'
 * }}
 */
function getMnemonicInfo(rawToken) {
  if (!rawToken) return null;
  const english = resolveEnglish(rawToken);

  // 1) arm64-data.js 의 풍부한 명령어 데이터 (최우선)
  const instr = instructionByEnglish.get(english);
  if (instr) {
    return {
      english: instr.name,
      hangulAliases: hangulAliasesByEnglish.get(english) || [],
      description: instr.description,
      syntax: instr.syntax,
      example: instr.example,
      kind: 'instruction',
    };
  }

  // 2) b.eq / b.ne 같은 조건부 분기는 조건 코드 표에서
  if (english.startsWith('b.')) {
    const cond = conditionByName.get(english.slice(2));
    if (cond) {
      return {
        english: `b.${english.slice(2)}`,
        hangulAliases: [],
        description: cond.description,
        syntax: undefined,
        example: cond.example,
        kind: 'condition',
      };
    }
  }

  // 3) mnemonics.js 에만 있고 arm64-data.js 엔 아직 상세 항목이 없는 경우
  //    (예: adc, ccmp, bic, ror, mrs, msr, eret, isb 등)
  const mapped = MNEMONIC_MAP[rawToken.trim().toLowerCase()];
  if (mapped) {
    return {
      english: mapped.english,
      hangulAliases: hangulAliasesByEnglish.get(mapped.english) || [],
      description: mapped.desc,
      syntax: undefined,
      example: undefined,
      kind: 'mnemonic-only',
    };
  }

  // 4) 안전망: ENGLISH_MNEMONICS 목록엔 있지만 설명이 아직 하나도 없는 경우
  if (ENGLISH_MNEMONICS.includes(english)) {
    return {
      english,
      hangulAliases: hangulAliasesByEnglish.get(english) || [],
      description: '설명 준비 중인 Hun-ASM 니모닉입니다.',
      syntax: undefined,
      example: undefined,
      kind: 'unknown',
    };
  }

  return null;
}

/**
 * Completion(자동완성) 후보를 위한 통합 리스트를 만든다.
 * - 영문 니모닉은 소문자로 "캐논(canonical) 하나"만 등록 (mov/MOV 중복 방지)
 * - 한글 별칭은 별도 단어이므로 그대로 별개 후보 유지 (사용자가 직접 타이핑함)
 * - 영문/한글 모두 같은 getMnemonicInfo() 결과를 공유하므로 설명이 항상 동일
 *
 * @returns {Array<{ insertText: string, isHangul: boolean, info: ReturnType<typeof getMnemonicInfo> }>}
 */
function getAllCompletionEntries() {
  const entries = [];
  const seenEnglish = new Set();

  function pushEnglishAndAliases(english) {
    if (seenEnglish.has(english)) return;
    seenEnglish.add(english);
    const info = getMnemonicInfo(english);
    entries.push({ insertText: english, isHangul: false, info });
    for (const alias of hangulAliasesByEnglish.get(english) || []) {
      entries.push({ insertText: alias, isHangul: true, info });
    }
  }

  // 1) 풍부한 데이터가 있는 명령어부터 (arm64-data.js 기준, 우선순위 높음)
  for (const instr of ALL_ARM_INSTRUCTIONS) {
    pushEnglishAndAliases(instr.name.toLowerCase());
  }

  // 2) 풍부한 데이터는 없지만 mnemonics.js 목록엔 있는 영문 니모닉
  for (const english of ENGLISH_MNEMONICS) {
    pushEnglishAndAliases(english);
  }

  // 3) 혹시 위 두 단계에서 하나도 안 걸린 한글 니모닉이 남아있으면 안전망으로 등록
  for (const hangul of HANGUL_MNEMONICS) {
    if (entries.some((e) => e.insertText === hangul)) continue;
    entries.push({ insertText: hangul, isHangul: true, info: getMnemonicInfo(hangul) });
  }

  return entries;
}

module.exports = { getMnemonicInfo, getAllCompletionEntries, ALL_ARM_INSTRUCTIONS };
