// mnemonics-riscv.js
// -----------------------------------------------------------------------
// 목적: mnemonics.js(ARM64 전용)와 완전히 같은 역할을 RISC-V 쪽에서 담당하는
//       "단일 진실 공급원". diagnostics.js가 나중에 document.languageId로
//       분기할 때 (hun-riscv → 이 파일의 RISCV_KNOWN_SET, hun-asm → 기존
//       mnemonics.js의 KNOWN_SET) 그대로 갖다 쓸 수 있도록 이름/모양을
//       최대한 mnemonics.js와 대칭으로 맞춰 놓았다.
//
// RISC-V만의 특징 두 가지를 꼭 기억할 것:
//   1) "진짜(base) 명령어"와 "의사명령어(pseudo-instruction)"가 뚜렷이 나뉜다.
//      예) `li t0, 10` 은 실제로는 addi/lui 조합으로 어셈블러가 확장해주는
//      pseudo-instruction. ARM64엔 없던 개념이라 diagnostics.js가 지금까지
//      "beqz" 를 모르는 명령어로 오탐한 것도 바로 이 구분이 없어서였음.
//   2) 즉시값(immediate) 앞에 ARM64처럼 '#'을 붙이지 않는다
//      (hun-riscv.tmLanguage.json의 numbers 규칙 주석에도 이미 명시돼 있음).
// -----------------------------------------------------------------------

// === 1. Base ISA 명령어 (RV32I/RV64I + M/A/F/D/C 확장 중 실전에서 자주 쓰는 것) ===
// hun-riscv.tmLanguage.json의 기존 standard-mnemonics 목록(li/add/addi/beq/bne/
// bgt/blt/j/ecall/lui/auipc/jal/jalr/bge/lw/sw/ld/sd)을 전부 포함하면서,
// 강좌 진도(정수 연산, 분기, 메모리, 곱셈/나눗셈)에 맞춰 확장함.
const RISCV_BASE_INSTRUCTIONS = [
  // --- 정수 레지스터-레지스터 연산 (RV32I/RV64I) ---
  'add', 'sub', 'and', 'or', 'xor', 'sll', 'srl', 'sra',
  'slt', 'sltu',
  // --- 정수 레지스터-즉시값 연산 ---
  'addi', 'andi', 'ori', 'xori', 'slli', 'srli', 'srai',
  'slti', 'sltiu',
  // --- RV64 전용 32비트 폭 연산 (뒤에 w가 붙는 것들) ---
  'addw', 'subw', 'sllw', 'srlw', 'sraw',
  'addiw', 'slliw', 'srliw', 'sraiw',
  // --- 상위 비트 즉시값 로드 ---
  'lui', 'auipc',
  // --- 분기 (조건부, 전부 진짜 base 명령어) ---
  'beq', 'bne', 'blt', 'bge', 'bltu', 'bgeu',
  // --- 무조건 분기 / 함수 호출 (진짜 base 명령어) ---
  'jal', 'jalr',
  // --- 메모리 로드 ---
  'lb', 'lh', 'lw', 'ld', 'lbu', 'lhu', 'lwu',
  // --- 메모리 저장 ---
  'sb', 'sh', 'sw', 'sd',
  // --- 시스템 / 환경 호출 ---
  'ecall', 'ebreak',
  'fence', 'fence.i',
  'csrrw', 'csrrs', 'csrrc', 'csrrwi', 'csrrsi', 'csrrci',
  // --- M 확장 (곱셈/나눗셈) ---
  'mul', 'mulh', 'mulhsu', 'mulhu', 'div', 'divu', 'rem', 'remu',
  'mulw', 'divw', 'divuw', 'remw', 'remuw',
  // --- A 확장 (원자적 연산, 이름만이라도 알아두면 오탐 방지) ---
  'lr.w', 'sc.w', 'lr.d', 'sc.d',
  'amoswap.w', 'amoadd.w', 'amoand.w', 'amoor.w', 'amoxor.w',
  // --- F/D 확장 (부동소수점, 기본형 위주) ---
  'flw', 'fsw', 'fld', 'fsd',
  'fadd.s', 'fsub.s', 'fmul.s', 'fdiv.s', 'fsqrt.s',
  'fadd.d', 'fsub.d', 'fmul.d', 'fdiv.d', 'fsqrt.d',
  'fcvt.w.s', 'fcvt.s.w', 'fcvt.w.d', 'fcvt.d.w',
  'fmv.x.w', 'fmv.w.x',
];

// === 2. 의사명령어 (Pseudo-instructions) ===
// 어셈블러가 실제로는 위 base 명령어 하나 또는 조합으로 치환해주는 "편의 문법".
// 오늘 hello.riscv에서 쓴 li/la/beqz/j가 전부 여기 속함 — 이게 diagnostics.js
// KNOWN_SET에 없어서 "모르는 명령어"로 오탐났던 바로 그 목록.
const RISCV_PSEUDO_INSTRUCTIONS = [
  // --- 상수/주소 로드 ---
  'li',       // load immediate → addi 또는 lui+addi 조합으로 확장
  'la',       // load address → auipc+addi 조합으로 확장 (심볼 주소 계산)
  'lla',      // la의 non-PIC(위치 종속) 버전
  // --- 레지스터 이동/부호반전 ---
  'mv',       // 레지스터 복사 → addi rd, rs, 0
  'not',      // 비트 반전 → xori rd, rs, -1
  'neg',      // 부호 반전 → sub rd, x0, rs
  'negw',
  'sext.w',   // 32비트 값을 64비트로 부호 확장
  // --- 0과의 비교 (조건부 분기 계열) ---
  'seqz', 'snez', 'sltz', 'sgtz',
  'beqz', 'bnez', 'blez', 'bgez', 'bltz', 'bgtz',
  // --- 두 레지스터 비교 분기 (피연산자 순서만 뒤집은 것들) ---
  'bgt', 'ble', 'bgtu', 'bleu',
  // --- 무조건 분기 / 함수 호출·복귀 ---
  'j',        // 무조건 분기 → jal x0, offset
  'jr',       // 레지스터 경유 분기 → jalr x0, rs, 0
  'ret',      // 함수 복귀 → jalr x0, ra, 0
  'call',     // 원거리 함수 호출 (auipc+jalr 조합)
  'tail',     // 꼬리 호출 (auipc+jalr, ra 안 씀)
  // --- 기타 ---
  'nop',      // 아무 것도 안 함 → addi x0, x0, 0
  'fence',    // 실제로도 존재하지만 인자 없이 쓰면 관용적으로 pseudo 취급
];

// === 3. 레지스터 ABI 별칭 (숫자 레지스터 x0~x31의 관용적 이름) ===
// hun-riscv.tmLanguage.json의 registers 정규식과 이름 집합을 맞춰둠.
// 나중에 diagnostics.js가 "존재하지 않는 레지스터" 검사를 RISC-V용으로도
// 만들 때, 이 목록을 그대로 파싱 기준으로 쓸 수 있게 별도로 분리해둔다.
const RISCV_ABI_REGISTER_NAMES = [
  'zero', 'ra', 'sp', 'gp', 'tp',
  't0', 't1', 't2', 't3', 't4', 't5', 't6',
  's0', 'fp', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11',
  'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7',
];

// === 4. 짧은 설명 매핑 (hover에서 mnemonics.js의 MNEMONIC_MAP과 동일하게 쓰일 것) ===
// 지금은 강좌에서 실제로 다룬 것 위주로만 채워둠 — 나머지는 KNOWN_SET에는
// 있지만 설명은 mnemonic-info.js의 "안전망(4번 케이스)"이 커버해줌.
const RISCV_MNEMONIC_MAP = {
  'li': { desc: '레지스터에 즉시값(상수)을 로드합니다 (의사명령어 — addi 또는 lui+addi로 확장됨).' },
  'la': { desc: '심볼(라벨)의 주소를 레지스터에 로드합니다 (의사명령어 — auipc+addi로 확장됨).' },
  'mv': { desc: '한 레지스터 값을 다른 레지스터로 복사합니다 (의사명령어 — addi rd, rs, 0).' },
  'j': { desc: '지정한 라벨로 무조건 분기합니다 (의사명령어 — jal x0, offset).' },
  'jr': { desc: '레지스터에 담긴 주소로 분기합니다 (의사명령어 — jalr x0, rs, 0).' },
  'ret': { desc: '현재 함수를 종료하고 ra(x1) 레지스터의 주소로 복귀합니다 (의사명령어).' },
  'call': { desc: '먼 거리의 함수를 호출합니다 (의사명령어 — auipc+jalr 조합, 복귀주소는 ra에 저장).' },
  'nop': { desc: '아무 동작도 하지 않습니다 (의사명령어 — addi x0, x0, 0).' },
  'beqz': { desc: '레지스터 값이 0과 같으면 분기합니다 (의사명령어 — beq rs, x0, offset).' },
  'bnez': { desc: '레지스터 값이 0이 아니면 분기합니다 (의사명령어 — bne rs, x0, offset).' },
  'add': { desc: '두 레지스터 값을 더합니다 (base 명령어).' },
  'addi': { desc: '레지스터 값에 즉시값을 더합니다 (base 명령어, 즉시값은 12비트 부호있는 범위).' },
  'sub': { desc: '두 레지스터 값을 뺍니다 (base 명령어, sub rd, rs1, rs2 — 즉시값 버전은 없고 addi에 음수를 씀).' },
  'beq': { desc: '두 레지스터 값이 같으면 분기합니다 (base 명령어).' },
  'bne': { desc: '두 레지스터 값이 다르면 분기합니다 (base 명령어).' },
  'lb': { desc: '메모리에서 1바이트를 부호 확장하여 레지스터로 로드합니다 (load byte).' },
  'lw': { desc: '메모리에서 4바이트(word)를 부호 확장하여 레지스터로 로드합니다.' },
  'ld': { desc: '메모리에서 8바이트(doubleword)를 레지스터로 로드합니다 (RV64 전용).' },
  'sb': { desc: '레지스터의 하위 1바이트를 메모리에 저장합니다 (store byte).' },
  'sw': { desc: '레지스터의 하위 4바이트(word)를 메모리에 저장합니다.' },
  'sd': { desc: '레지스터의 8바이트(doubleword)를 메모리에 저장합니다 (RV64 전용).' },
  'jal': { desc: '함수를 호출하고 복귀 주소를 rd에 저장합니다 (Jump And Link, base 명령어).' },
  'jalr': { desc: '레지스터 기반 주소로 함수를 호출합니다 (Jump And Link Register, base 명령어).' },
  'ecall': { desc: '환경 호출 — 커널/모니터/하이퍼바이저에 서비스를 요청합니다 (base 명령어). 베어메탈에선 트랩 핸들러가 없으면 아무 반응이 없을 수 있습니다.' },
  'lui': { desc: '즉시값을 상위 20비트에 로드합니다 (Load Upper Immediate, base 명령어). li/la 의사명령어의 재료로 자주 쓰입니다.' },
  'auipc': { desc: '현재 PC에 즉시값(상위 20비트)을 더해서 레지스터에 저장합니다 (Add Upper Immediate to PC). 위치 독립적 주소 계산(la, call)의 핵심 재료.' },
};

// === 5. 통합 목록 / 조회용 Set ===
const RISCV_ALL_MNEMONICS = Array.from(
  new Set([...RISCV_BASE_INSTRUCTIONS, ...RISCV_PSEUDO_INSTRUCTIONS])
);
const RISCV_KNOWN_SET = new Set(RISCV_ALL_MNEMONICS);
const RISCV_REGISTER_SET = new Set(RISCV_ABI_REGISTER_NAMES);

module.exports = {
  RISCV_BASE_INSTRUCTIONS,
  RISCV_PSEUDO_INSTRUCTIONS,
  RISCV_ABI_REGISTER_NAMES,
  RISCV_MNEMONIC_MAP,
  RISCV_ALL_MNEMONICS,
  RISCV_KNOWN_SET,
  RISCV_REGISTER_SET,
};
