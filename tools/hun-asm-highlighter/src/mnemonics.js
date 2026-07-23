// mnemonics.js
// 한글/영문 니모닉 목록 및 확실한 의미가 검증된 항목만 담은 매핑.
//
// MNEMONIC_MAP 은 hover 설명 등에 쓰이는 "확신 있는" 매핑만 담았다.
// (LDP/STP/LDR/STR 은 diagnostics.js 에서 직접 검증 로직을 갖고 있으므로
//  이름 뜻도 확실하게 넣어둠. 나머지 한글 니모닉은 실제 AsmLexer.cpp 의
//  테이블을 보고 여기에 하나씩 채워 넣으면 hover 설명도 정확해진다.)

const MNEMONIC_MAP = {
  // === 기존에 넣어둔 4대 천왕 ===
  'ldr': { english: 'ldr', desc: '메모리 값을 레지스터로 적재(load)합니다.' },
  '적재': { english: 'ldr', desc: '메모리 값을 레지스터로 적재(load)합니다.' },

  'str': { english: 'str', desc: '레지스터 값을 메모리에 저장(store)합니다.' },
  '저장': { english: 'str', desc: '레지스터 값을 메모리에 저장(store)합니다.' },

  'ldp': { english: 'ldp', desc: '레지스터 두 개를 한 번에 적재합니다 (load pair).' },
  '쌍적재': { english: 'ldp', desc: '레지스터 두 개를 한 번에 적재합니다 (load pair).' },

  'stp': { english: 'stp', desc: '레지스터 두 개를 한 번에 저장합니다 (store pair).' },
  '쌍저장': { english: 'stp', desc: '레지스터 두 개를 한 번에 저장합니다 (store pair).' },

  // === 1. 주소 및 데이터 이동 (오타 다발 구역!) ===
  'mov': { english: 'mov', desc: '레지스터 간에 값을 이동하거나 상수를 대입합니다.' },
  '할당': { english: 'mov', desc: '레지스터 간에 값을 이동하거나 상수를 대입합니다.' },

  'adrp': { english: 'adrp', desc: '페이지 단위(4KB) 주소를 계산하여 상위 레지스터에 로드합니다.' },
  '페이지주소': { english: 'adrp', desc: '페이지 단위(4KB) 주소를 계산하여 상위 레지스터에 로드합니다.' },

  'add': { english: 'add', desc: '두 값을 더합니다.' },
  'adds': { english: 'adds', desc: '두 값을 더한 후 플래그 갱신.' },
  '더함': { english: 'add', desc: '두 값을 더합니다.' },

  'sub': { english: 'sub', desc: '두 값을 뺍니다. (오프셋이나 스택 조정에 필수!)' },
  'subs': { english: 'subs', desc: '두 값을 뺀후 플래그 갱신. (오프셋이나 스택 조정에 필수!)' },
  '뺌': { english: 'sub', desc: '두 값을 뺍니다. (오프셋이나 스택 조정에 필수!)' },

  // === 2. 제어 흐름 및 함수 호출 (대제독 전용 무기) ===
  'bl': { english: 'bl', desc: '함수를 호출하고, 돌아올 주소를 lr(x30)에 저장합니다 (Branch with Link).' },
  '불러감': { english: 'bl', desc: '함수를 호출하고, 돌아올 주소를 lr(x30)에 저장합니다 (Branch with Link).' },

  'blr': { english: 'blr', desc: '레지스터에 담긴 동적 주소로 함수를 호출합니다.' },
  '주소불러감': { english: 'blr', desc: '레지스터에 담긴 동적 주소로 함수를 호출합니다.' },

  'ret': { english: 'ret', desc: '현재 함수를 종료하고 lr(x30) 주소로 돌아갑니다.' },
  '돌아감': { english: 'ret', desc: '현재 함수를 종료하고 lr(x30) 주소로 돌아갑니다.' },

  // === 3. 조건문 & 비트 연산 (어제 배운 꿀맛 명령어!) ===
  'cmp': { english: 'cmp', desc: '두 값을 비교하여 CPU 상태 플래그(NZCV)를 설정합니다.' },
  '비교': { english: 'cmp', desc: '두 값을 비교하여 CPU 상태 플래그(NZCV)를 설정합니다.' },

  'cset': { english: 'cset', desc: '조건이 만족하면 1, 만족하지 않으면 0을 레지스터에 설정합니다.' },
  '조건셋': { english: 'cset', desc: '조건이 만족하면 1, 만족하지 않으면 0을 레지스터에 설정합니다.' },

  'lsl': { english: 'lsl', desc: '비트를 왼쪽으로 이동시킵니다 (2진수 곱셈 효과).' },
  '왼쉬프트': { english: 'lsl', desc: '비트를 왼쪽으로 이동시킵니다 (2진수 곱셈 효과).' },

  'lsr': { english: 'lsr', desc: '비트를 오른쪽으로 이동시킵니다 (2진수 나눗셈 효과).' },
  '오른쉬프트': { english: 'lsr', desc: '비트를 오른쪽으로 이동시킵니다 (2진수 나눗셈 효과).' },

  // -- 추가한 부분
  // === 데이터 이동 계열 ===
  'mvn': { english: 'mvn', desc: '레지스터의 모든 비트를 반전시킵니다 (비트 NOT).' },
  '부정': { english: 'mvn', desc: '레지스터의 모든 비트를 반전시킵니다 (비트 NOT).' },

  'fmov': { english: 'fmov', desc: '부동소수점 레지스터 간에 값을 이동합니다.' },
  '실수이동': { english: 'fmov', desc: '부동소수점 레지스터 간에 값을 이동합니다.' },

  // === 곱셈/나눗셈 계열 ===
  'madd': { english: 'madd', desc: '두 값을 곱한 뒤 세 번째 값을 더합니다 (곱셈-덧셈).' },
  '곱더함': { english: 'madd', desc: '두 값을 곱한 뒤 세 번째 값을 더합니다 (곱셈-덧셈).' },

  'msub': { english: 'msub', desc: '세 번째 값에서 두 값을 곱한 결과를 뺍니다 (곱셈-뺄셈).' },
  '곱뺌': { english: 'msub', desc: '세 번째 값에서 두 값을 곱한 결과를 뺍니다 (곱셈-뺄셈).' },

  'fdiv': { english: 'fdiv', desc: '두 부동소수점 값을 나눕니다 (실수 나눗셈).' },
  '실수나눔': { english: 'fdiv', desc: '두 부동소수점 값을 나눕니다 (실수 나눗셈).' },

  'sdiv': { english: 'sdiv', desc: '두 값을 부호 있는 정수로 나눕니다.' },
  '나눔': { english: 'sdiv', desc: '두 값을 부호 있는 정수로 나눕니다.' },

  // === 조건/비교 계열 ===
  'ccmp': { english: 'ccmp', desc: '이전 조건이 참일 때만 추가로 비교를 수행합니다 (조건부 비교).' },
  '조건비교': { english: 'ccmp', desc: '이전 조건이 참일 때만 추가로 비교를 수행합니다 (조건부 비교).' },

  'csel': { english: 'csel', desc: '조건 플래그에 따라 분기 없이 두 값 중 하나를 선택합니다 (조건부 선택).' },
  '조건선택': { english: 'csel', desc: '조건 플래그에 따라 분기 없이 두 값 중 하나를 선택합니다 (조건부 선택).' },

  'fcvtzs': { english: 'fcvtzs', desc: '부동소수점 값을 정수로 변환합니다 (0 방향 반올림).' },
  '정수변환': { english: 'fcvtzs', desc: '부동소수점 값을 정수로 변환합니다 (0 방향 반올림).' },

  // === 분기 계열 ===
  'b': { english: 'b', desc: '지정한 라벨로 무조건 분기(점프)합니다.' },
  '가기': { english: 'b', desc: '지정한 라벨로 무조건 분기(점프)합니다.' },

  'b.gt': { english: 'b.gt', desc: '직전 비교에서 크다(>)는 조건이 참이면 분기합니다.' },
  '큼이면뜀': { english: 'b.gt', desc: '직전 비교에서 크다(>)는 조건이 참이면 분기합니다.' },

  'cbnz': { english: 'cbnz', desc: '레지스터 값이 0이 아니면 분기합니다.' },
  '영아니면뜀': { english: 'cbnz', desc: '레지스터 값이 0이 아니면 분기합니다.' },

  'svc': { english: 'svc', desc: '커널에 시스템 콜(서비스)을 요청합니다 (Supervisor Call).' },
  '명령호출': { english: 'svc', desc: '커널에 시스템 콜(서비스)을 요청합니다 (Supervisor Call).' },

  // === 논리 연산 계열 ===
  'and': { english: 'and', desc: '두 값을 비트 단위로 AND 연산합니다.' },
  '그리고': { english: 'and', desc: '두 값을 비트 단위로 AND 연산합니다.' },

  'orr': { english: 'orr', desc: '두 값을 비트 단위로 OR 연산합니다.' },
  '또는': { english: 'orr', desc: '두 값을 비트 단위로 OR 연산합니다.' },

  'eor': { english: 'eor', desc: '두 값을 비트 단위로 배타적 OR(XOR) 연산합니다.' },
  '배타적': { english: 'eor', desc: '두 값을 비트 단위로 배타적 OR(XOR) 연산합니다.' },

  'ror': { english: 'ror', desc: '비트를 오른쪽으로 회전시킵니다 (밀려난 비트가 반대쪽에서 다시 들어옴).' },
  '돌림': { english: 'ror', desc: '비트를 오른쪽으로 회전시킵니다 (밀려난 비트가 반대쪽에서 다시 들어옴).' },

  // === 확장/비트필드 계열 ===
  'sxtw': { english: 'sxtw', desc: '32비트 값을 부호를 유지한 채 64비트로 확장합니다 (부호 확장).' },
  '부호확장': { english: 'sxtw', desc: '32비트 값을 부호를 유지한 채 64비트로 확장합니다 (부호 확장).' },

  'ubfx': { english: 'ubfx', desc: '레지스터에서 지정한 비트 범위를 추출합니다 (비트필드 추출).' },
  '비트추출': { english: 'ubfx', desc: '레지스터에서 지정한 비트 범위를 추출합니다 (비트필드 추출).' },

  'bfi': { english: 'bfi', desc: '지정한 비트 범위에 값을 삽입합니다 (나머지 비트는 그대로 유지).' },
  '비트삽입': { english: 'bfi', desc: '지정한 비트 범위에 값을 삽입합니다 (나머지 비트는 그대로 유지).' },
};

const ENGLISH_MNEMONICS = [
  // 1. 데이터 이동 및 상수 주소 계산
  'mov', 'mvn', 'fmov', 'adr', 'adrp',

  // 2. 메모리 로드 및 스토어 (기본 및 스케일 단위)
  'ldr', 'str', 'ldp', 'stp',
  'ldrb', 'strb', 'ldrh', 'strh',
  'ldrsb', 'ldrsh', 'ldrsw',

  // 3. 정수 사칙연산
  'add', 'sub', 'adds', 'subs', 'adc', 'sdiv', 'udiv', 'madd', 'msub', 'mul',
  'umulh', 'smulh',

  // 4. 실수(Floating-point) 연산
  'fadd', 'fsub', 'fmul', 'fdiv', 'fmla', 'fcmp',
  'scvtf', 'fcvtzs',

  // 4-1. 실수 연산 보강 (2026-07 arm64-data.js 동기화: 곱셈누적/부호반전/절대값/제곱근/최대최소/변환)
  'fmadd', 'fmsub', 'fneg', 'fabs', 'fsqrt', 'fmax', 'fmin', 'ucvtf', 'fcvtzu', 'fcvt',

  // 5. 비교, 조건 설정 및 시스템 제어
  'cmp', 'ccmp', 'csel', 'cset', 'nop', 'svc', 'wfe', 'wfi',
  'neg', 'tst',

  // 6. 무조건 및 조건부 분기 (함수 호출 포함)
  'ret', 'bl', 'blr', 'br', 'b', 'cbz', 'cbnz',
  'b.eq', 'b.ne', 'b.gt', 'b.lt', 'b.ge', 'b.le', 'b.hs', 'b.lo', 'b.hi', 'b.ls',
  'tbz', 'tbnz',

  // (호환성용 점 없는 버전)
  'beq', 'bne', 'bgt', 'blt', 'bge', 'ble',

  // 7. 논리 및 비트 연산 (시프트 포함)
  'and', 'orr', 'eor', 'bic', 'lsl', 'lsr', 'asr', 'ror',

  // 8. 비트 추출, 삽입 및 부호/제로 확장
  'sxtb', 'sxth', 'sxtw', 'uxtb', 'uxth', 'uxtw', 'bfxil', 'bfi', 'ubfx', 'ubfiz',

  // 9. 기타
  'mrs', 'msr', 'eret', 'isb'
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
