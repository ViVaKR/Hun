// mnemonics.js
// 한글/영문 니모닉 목록 및 확실한 의미가 검증된 항목만 담은 매핑.
//
// MNEMONIC_MAP 은 hover 설명 등에 쓰이는 "확신 있는" 매핑만 담았다.
// (LDP/STP/LDR/STR 은 diagnostics.js 에서 직접 검증 로직을 갖고 있으므로
//  이름 뜻도 확실하게 넣어둠. 나머지 한글 니모닉은 실제 AsmLexer.cpp 의
//  테이블을 보고 여기에 하나씩 채워 넣으면 hover 설명도 정확해진다.)
const MNEMONIC_MAP = {
  '적재': { english: 'ldr', desc: '메모리 값을 레지스터로 적재(load)합니다.' },
  '저장': { english: 'str', desc: '레지스터 값을 메모리에 저장(store)합니다.' },
  '쌍적재': { english: 'ldp', desc: '레지스터 두 개를 한 번에 적재합니다 (load pair).' },
  '쌍저장': { english: 'stp', desc: '레지스터 두 개를 한 번에 저장합니다 (store pair).' },
};

const ENGLISH_MNEMONICS = [
  'mov', 'mvn', 'fmov', 'ldr', 'str', 'ldp', 'stp', 'adr', 'adrp',
  'add', 'sub', 'adds', 'adc', 'sdiv', 'udiv', 'madd', 'msub',
  'fdiv', 'fmul', 'scvtf', 'fcvtzs', 'cmp', 'ccmp', 'csel', 'cset',
  'ret', 'bl', 'blr',
  'b.eq', 'b.ne', 'b.gt', 'b.lt', 'b.ge', 'b.le',
  'beq', 'bne', 'bgt', 'blt', 'bge', 'ble', 'b',
  'cbz', 'cbnz', 'svc', 'wfe', 'wfi', 'nop',
  'and', 'orr', 'eor', 'lsl', 'lsr', 'ror',
  'sxtb', 'sxth', 'sxtw', 'bfxil', 'bfi', 'ubfx', 'ubfiz',
];

// AArch64HangulAliases.td / tmLanguage.json 의 hangul-mnemonics 목록과 동일하게 유지할 것
const HANGUL_MNEMONICS = [
  '할당', '부정', '실수이동', '적재', '저장', '쌍적재', '쌍저장', '페이지주소',
  '더함', '뺌', '자리올림더함', '자리올림', '나눔', '곱더함', '곱뺌', '실수나눔',
  '정수변환', '비교', '조건비교', '조건택', '조건셋', '돌아감', '불러감',
  '주소불러감', '뜀', '큼이면뜀', '영아니면뜀', '명령호출', '그리고', '또는',
  '배타적', '왼쉬프트', '오른쉬프트', '돌림', '부호확장', '비트추출', '비트삽입',
];

const ALL_MNEMONICS = Array.from(new Set([...ENGLISH_MNEMONICS, ...HANGUL_MNEMONICS]));
const KNOWN_SET = new Set(ALL_MNEMONICS);

module.exports = { MNEMONIC_MAP, ALL_MNEMONICS, KNOWN_SET, ENGLISH_MNEMONICS, HANGUL_MNEMONICS };
