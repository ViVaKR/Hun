// ARM64 Common Opcodes
const arm64Instructions = [
  {
    name: "MOV",
    description: "✓ Move register or immediate value. Copies the value of the source operand to the destination register.\n\n✓ 레지스터 또는 즉시값을 이동합니다. 원본 피연산자의 값을 대상 레지스터로 복사합니다.",
    syntax: "MOV <Wd|Xd>, <Wn|Xn>  or  MOV <Wd|Xd>, #<imm>",
    example: "MOV X0, X1\nMOV W2, #10"
  },
  {
    name: "LDR",
    description: "✓ Load Register. Loads a word or doubleword from memory into a register.\n\n✓ 레지스터로 값을 적재합니다. 메모리에서 워드 또는 더블워드를 읽어 레지스터에 저장합니다.",
    syntax: "LDR <Wt|Xt>, [<Xn|SP>], #<simm>\nLDR <Wt|Xt>, [<Xn|SP>, #<pimm>]",
    example: "LDR X0, [X1]\nLDR W2, [SP, #8]"
  },
  {
    name: "STR",
    description: "✓ Store Register. Stores a word or doubleword from a register into memory.\n\n✓ 레지스터 값을 메모리에 저장합니다. 레지스터의 워드 또는 더블워드를 메모리에 씁니다.",
    syntax: "STR <Wt|Xt>, [<Xn|SP>], #<simm>\nSTR <Wt|Xt>, [<Xn|SP>, #<pimm>]",
    example: "STR X0, [X1]\nSTR W2, [SP, #8]"
  },
  {
    name: "ADD",
    description: "✓ Add (register or immediate). Adds two operands and stores the result in the destination register.\n\n✓ 덧셈 (레지스터 또는 즉시값). 두 피연산자를 더하여 결과를 대상 레지스터에 저장합니다.",
    syntax: "ADD <Wd|Xd>, <Wn|Xn>, <Wm|Xm>  or  ADD <Wd|Xd>, <Wn|Xn>, #<imm>",
    example: "ADD X0, X1, X2\nADD W0, W1, #5"
  },
  {
    name: "SUB",
    description: "✓ Subtract (register or immediate). Subtracts the second operand from the first operand.\n\n✓ 뺄셈 (레지스터 또는 즉시값). 두 번째 피연산자를 첫 번째 피연산자에서 뺍니다.",
    syntax: "SUB <Wd|Xd>, <Wn|Xn>, <Wm|Xm>  or  SUB <Wd|Xd>, <Wn|Xn>, #<imm>",
    example: "SUB X0, X1, X2\nSUB W0, W1, #4"
  },
  {
    name: "CMP",
    description: "✓ Compare. Compares two operands by subtracting them and updates the condition flags.\n\n✓ 비교합니다. 두 피연산자를 뺀 결과로 조건 플래그를 갱신하며, 결과값 자체는 저장하지 않습니다.",
    syntax: "CMP <Wn|Xn>, <Wm|Xm>  or  CMP <Wn|Xn>, #<imm>",
    example: "CMP X0, X1\nCMP W2, #0"
  },
  {
    name: "B",
    description: "✓ Branch. Unconditionally branches to a label.\n\n✓ 무조건 분기합니다. 지정한 라벨로 실행 흐름을 이동시킵니다.",
    syntax: "B <label>\nB.<cond> <label>  (Conditional, e.g. B.EQ, B.NE)",
    example: "B loop\nB.EQ exit_label"
  },
  {
    name: "BL",
    description: "✓ Branch with Link. Calls a subroutine, saving the return address in X30 (Link Register).\n\n✓ 링크와 함께 분기합니다. 서브루틴을 호출하면서 복귀 주소를 X30 (링크 레지스터)에 저장합니다.",
    syntax: "BL <label>",
    example: "BL my_function"
  },
  {
    name: "RET",
    description: "✓ Return from subroutine. Branches to the address in the Link Register (usually X30).\n\n✓ 서브루틴에서 복귀합니다. 링크 레지스터(보통 X30)에 저장된 주소로 분기합니다.",
    syntax: "RET {<Xn>}",
    example: "RET"
  },

  // ---- 데이터 전송 (Pair / PC-relative) ----
  {
    name: "LDP",
    description: "✓ Load Pair of Registers. Loads two words or doublewords from consecutive memory locations into two registers in a single instruction. Commonly used to restore callee-saved registers in epilogues.\n\n✓ 레지스터 쌍을 적재합니다. 연속된 메모리 위치에서 워드/더블워드 두 개를 한 번에 읽어 두 레지스터에 저장합니다. 함수 에필로그에서 callee-saved 레지스터를 복원할 때 흔히 사용됩니다.",
    syntax: "LDP <Wt1|Xt1>, <Wt2|Xt2>, [<Xn|SP>], #<imm>\nLDP <Wt1|Xt1>, <Wt2|Xt2>, [<Xn|SP>, #<imm>]",
    example: "LDP X19, X20, [SP, #16]\nLDP X29, X30, [SP], #48"
  },
  {
    name: "STP",
    description: "✓ Store Pair of Registers. Stores two words or doublewords to consecutive memory locations in a single instruction. Commonly used to save callee-saved registers / FP+LR in prologues.\n\n✓ 레지스터 쌍을 저장합니다. 두 레지스터의 값을 연속된 메모리 위치에 한 번에 씁니다. 함수 프롤로그에서 callee-saved 레지스터나 FP+LR을 저장할 때 흔히 사용됩니다.)",
    syntax: "STP <Wt1|Xt1>, <Wt2|Xt2>, [<Xn|SP>, #<imm>]!\nSTP <Wt1|Xt1>, <Wt2|Xt2>, [<Xn|SP>], #<imm>",
    example: "STP x29, x30, [sp, #-48]!\nSTP X19, X20, [SP, #16]"
  },
  {
    name: "ADRP",
    description: "✓ Form PC-relative address to a 4KB page. Computes the address of the 4KB page containing a label and writes it to the destination register; usually paired with ADD ...@PAGEOFF or LDR to reach the exact byte.\n\n✓ 4KB 페이지 단위의 PC 상대 주소를 계산합니다. 라벨이 속한 4KB 페이지의 시작 주소를 구해 대상 레지스터에 저장하며, 보통 정확한 바이트 주소를 얻기 위해 ADD ...@PAGEOFF 또는 LDR과 함께 사용됩니다.)",
    syntax: "ADRP <Xd>, <label>@PAGE",
    example: "ADRP x2, msg_bubble@PAGE\nADD x2, x2, msg_bubble@PAGEOFF"
  },
  {
    name: "ADR",
    description: "✓ Form PC-relative address. Computes the exact byte address of a nearby label (within ±1MB) and writes it to the destination register. Unlike ADRP, no page offset is needed.\n\n✓ PC 상대 주소를 계산합니다. 가까운(±1MB 이내) 라벨의 정확한 바이트 주소를 구해 대상 레지스터에 저장합니다. ADRP와 달리 페이지 오프셋 계산이 필요 없습니다.)",
    syntax: "ADR <Xd>, <label>",
    example: "ADR x0, local_data"
  },

  // ---- 산술 ----
  {
    name: "MUL",
    description: "✓ Multiply. Multiplies two registers and writes the (truncated) result to the destination register. Alias for MADD with a zero addend.\n\n✓ **곱셈**. 두 레지스터를 곱한 결과(잘림 처리됨)를 대상 레지스터에 저장합니다. 덧셈 항이 0인 MADD의 별칭입니다.)",
    syntax: "MUL <Wd|Xd>, <Wn|Xn>, <Wm|Xm>",
    example: "MUL X0, X1, X2"
  },
  {
    name: "MADD",
    description: "✓ Multiply-Add. Multiplies two registers, adds a third, and writes the result to the destination register: Xd = Xa + (Xn * Xm).\n\n✓ 곱셈-덧셈. 두 레지스터를 곱한 뒤 세 번째 레지스터를 더하여 결과를 저장합니다: Xd = Xa + (Xn * Xm).)",
    syntax: "MADD <Wd|Xd>, <Wn|Xn>, <Wm|Xm>, <Wa|Xa>",
    example: "MADD X0, X1, X2, X3   // X0 = X3 + (X1 * X2)"
  },
  {
    name: "MSUB",
    description: "✓ Multiply-Subtract. Multiplies two registers, subtracts the product from a third, and writes the result to the destination register: Xd = Xa - (Xn * Xm).\n\n✓ 곱셈-뺄셈. 두 레지스터를 곱한 값을 세 번째 레지스터에서 빼서 결과를 저장합니다: Xd = Xa - (Xn * Xm).)",
    syntax: "MSUB <Wd|Xd>, <Wn|Xn>, <Wm|Xm>, <Wa|Xa>",
    example: "MSUB X0, X1, X2, X3   // X0 = X3 - (X1 * X2)"
  },
  {
    name: "SDIV",
    description: "✓ Signed Divide. Divides the first operand by the second (signed) and writes the quotient to the destination register (result truncates toward zero).\n\n✓ 부호 있는 나눗셈. 첫 번째 피연산자를 두 번째 피연산자로(부호 있는 연산으로) 나눈 몫을 대상 레지스터에 저장합니다(0 방향으로 잘림 처리).)",
    syntax: "SDIV <Wd|Xd>, <Wn|Xn>, <Wm|Xm>",
    example: "SDIV X0, X1, X2"
  },
  {
    name: "UDIV",
    description: "✓ Unsigned Divide. Divides the first operand by the second (unsigned) and writes the quotient to the destination register.\n\n✓ 부호 없는 나눗셈. 첫 번째 피연산자를 두 번째 피연산자로(부호 없는 연산으로) 나눈 몫을 대상 레지스터에 저장합니다.)",
    syntax: "UDIV <Wd|Xd>, <Wn|Xn>, <Wm|Xm>",
    example: "UDIV X0, X1, X2"
  },
  {
    name: "NEG",
    description: "✓ Negate. Computes the two's-complement negation of a register (equivalent to SUB Xd, XZR, Xn) and writes it to the destination.\n\n✓ 부호를 반전합니다. 레지스터 값의 2의 보수를 계산합니다(SUB Xd, XZR, Xn과 동일)하여 대상 레지스터에 저장합니다.)",
    syntax: "NEG <Wd|Xd>, <Wn|Xn>",
    example: "NEG X0, X1"
  },

  // ---- 논리 연산 ----
  {
    name: "AND",
    description: "✓ Bitwise AND (register or immediate). ANDs two operands bit by bit and writes the result to the destination register.\n\n✓ 비트 단위 AND(레지스터 또는 즉시값). 두 피연산자를 비트 단위로 AND 연산하여 결과를 대상 레지스터에 저장합니다.",
    syntax: "AND <Wd|Xd>, <Wn|Xn>, <Wm|Xm>  or  AND <Wd|Xd>, <Wn|Xn>, #<imm>",
    example: "AND X0, X1, X2\nAND W0, W1, #0xF"
  },
  {
    name: "ORR",
    description: "✓ Bitwise OR (register or immediate). ORs two operands bit by bit and writes the result to the destination register.\n\n✓ 비트 단위 OR(레지스터 또는 즉시값). 두 피연산자를 비트 단위로 OR 연산하여 결과를 대상 레지스터에 저장합니다.",
    syntax: "ORR <Wd|Xd>, <Wn|Xn>, <Wm|Xm>  or  ORR <Wd|Xd>, <Wn|Xn>, #<imm>",
    example: "ORR X0, X1, X2"
  },
  {
    name: "EOR",
    description: "✓ Bitwise Exclusive OR (register or immediate). XORs two operands bit by bit; commonly used to zero a register (EOR Xd, Xd, Xd).\n\n✓ 비트 단위 배타적 OR(레지스터 또는 즉치값). 두 피연산자를 비트 단위로 XOR 연산합니다. 레지스터를 0으로 만들 때(EOR Xd, Xd, Xd) 흔히 사용됩니다.",
    syntax: "EOR <Wd|Xd>, <Wn|Xn>, <Wm|Xm>  or  EOR <Wd|Xd>, <Wn|Xn>, #<imm>",
    example: "EOR X0, X0, X0   // X0 = 0"
  },
  {
    name: "MVN",
    description: "✓ Bitwise NOT (Move Not). Inverts every bit of the source operand and writes the result to the destination register.\n\n✓ 비트 단위 NOT(Move Not). 원본 피연산자의 모든 비트를 반전시켜 결과를 대상 레지스터에 저장합니다.",
    syntax: "MVN <Wd|Xd>, <Wn|Xn>",
    example: "MVN X0, X1"
  },
  {
    name: "TST",
    description: "✓ Test bits. Performs a bitwise AND between two operands and updates the condition flags without storing the result\n\n✓ alias for ANDS with a discarded destination). (비트를 검사합니다. 두 피연산자를 비트 단위로 AND 연산하여 조건 플래그만 갱신하고 결과값은 저장하지 않습니다(결과를 버리는 ANDS의 별칭).",
    syntax: "TST <Wn|Xn>, <Wm|Xm>  or  TST <Wn|Xn>, #<imm>",
    example: "TST X0, #1\nB.NE is_odd"
  },

  // ---- 시프트 ----
  {
    name: "LSL",
    description: "✓ Logical Shift Left. Shifts the bits of a register left by a given amount, filling with zeros from the right.\n\n✓ 논리 왼쪽 시프트. 레지스터의 비트를 지정한 만큼 왼쪽으로 이동시키고, 오른쪽에서 채워지는 비트는 0으로 채웁니다.",
    syntax: "LSL <Wd|Xd>, <Wn|Xn>, #<shift>  or  LSL <Wd|Xd>, <Wn|Xn>, <Wm|Xm>",
    example: "LSL x10, x22, #2   // x10 = j * 4"
  },
  {
    name: "LSR",
    description: "✓ Logical Shift Right. Shifts the bits of a register right by a given amount, filling with zeros from the left.\n\n✓ 논리 오른쪽 시프트. 레지스터의 비트를 지정한 만큼 오른쪽으로 이동시키고, 왼쪽에서 채워지는 비트는 0으로 채웁니다.",
    syntax: "LSR <Wd|Xd>, <Wn|Xn>, #<shift>  or  LSR <Wd|Xd>, <Wn|Xn>, <Wm|Xm>",
    example: "LSR X0, X1, #1     // X0 = X1 / 2 (unsigned)"
  },
  {
    name: "ASR",
    description: "✓ Arithmetic Shift Right. Shifts the bits of a register right by a given amount, filling with the sign bit (preserves the sign for signed division-like operations).\n\n✓ 산술 오른쪽 시프트. 레지스터의 비트를 지정한 만큼 오른쪽으로 이동시키되, 왼쪽은 부호 비트로 채웁니다(부호 있는 나눗셈과 유사한 연산에서 부호를 보존).",
    syntax: "ASR <Wd|Xd>, <Wn|Xn>, #<shift>  or  ASR <Wd|Xd>, <Wn|Xn>, <Wm|Xm>",
    example: "ASR X0, X1, #1     // X0 = X1 / 2 (signed)"
  },

  // ---- 분기 (조건부/레지스터 기반) ----
  {
    name: "CBZ",
    description: "✓ Compare and Branch if Zero. Branches to a label if the register equals zero, without affecting the condition flags.\n\n✓ 비교 후 0이면 분기합니다. 조건 플래그에 영향을 주지 않고, 레지스터 값이 0이면 지정한 라벨로 분기합니다.",
    syntax: "CBZ <Wt|Xt>, <label>",
    example: "CBZ X0, done"
  },
  {
    name: "CBNZ",
    description: "✓ Compare and Branch if Not Zero. Branches to a label if the register is nonzero, without affecting the condition flags.\n\n✓ 비교 후 0이 아니면 분기합니다. 조건 플래그에 영향을 주지 않고, 레지스터 값이 0이 아니면 지정한 라벨로 분기합니다.",
    syntax: "CBNZ <Wt|Xt>, <label>",
    example: "CBNZ X0, loop"
  },
  {
    name: "TBZ",
    description: "✓ Test bit and Branch if Zero. Tests a single specified bit of a register and branches to a label if that bit is 0.\n\n✓ 특정 비트가 0이면 분기합니다. 레지스터의 지정한 한 비트를 검사하여 그 비트가 0이면 라벨로 분기합니다.",
    syntax: "TBZ <Wt|Xt>, #<bit_num>, <label>",
    example: "TBZ W0, #0, is_even"
  },
  {
    name: "TBNZ",
    description: "✓ Test bit and Branch if Not Zero. Tests a single specified bit of a register and branches to a label if that bit is 1.\n\n✓ 특정 비트가 1이면 분기합니다. 레지스터의 지정한 한 비트를 검사하여 그 비트가 1이면 라벨로 분기합니다.",
    syntax: "TBNZ <Wt|Xt>, #<bit_num>, <label>",
    example: "TBNZ W0, #0, is_odd"
  },
  {
    name: "BR",
    description: "✓ Branch to Register. Branches unconditionally to the address held in a register, without linking a return address (no update to X30).\n\n✓ 레지스터로 분기합니다. 복귀 주소를 링크하지 않고(X30 갱신 없이) 레지스터에 담긴 주소로 무조건 분기합니다.",
    syntax: "BR <Xn>",
    example: "BR X16"
  },
  {
    name: "BLR",
    description: "✓ Branch with Link to Register. Calls a subroutine whose address is held in a register, saving the return address in X30 (Link Register).\n\n✓ 레지스터로 링크와 함께 분기합니다. 주소가 레지스터에 담긴 서브루틴을 호출하며, 복귀 주소를 X30(링크 레지스터)에 저장합니다.",
    syntax: "BLR <Xn>",
    example: "BLR X8"
  },

  // ---- 조건 선택 ----
  {
    name: "CSEL",
    description: "✓ Conditional Select. Writes one of two source registers to the destination depending on the condition flags, without branching (branchless if/else).\n\n✓ 조건부 선택. 분기 없이 조건 플래그에 따라 두 소스 레지스터 중 하나를 대상 레지스터에 씁니다(분기 없는 if/else).",
    syntax: "CSEL <Wd|Xd>, <Wn|Xn>, <Wm|Xm>, <cond>",
    example: "CSEL X0, X1, X2, GT   // X0 = (X1 > X2) ? X1 : X2 (after a prior CMP)"
  },
  {
    name: "CSET",
    description: "✓ Conditional Set. Sets the destination register to 1 if the condition holds, or 0 otherwise, based on the condition flags.\n\n✓ 조건부 설정. 조건 플래그를 기준으로 조건이 참이면 대상 레지스터를 1로, 아니면 0으로 설정합니다.",
    syntax: "CSET <Wd|Xd>, <cond>",
    example: "CSET X0, EQ"
  },

  // ---- 확장 ----
  {
    name: "SXTW",
    description: "✓ Sign-Extend Word. Sign-extends the low 32 bits of the source register to 64 bits and writes the result to the destination register.\n\n✓ 워드를 부호 확장합니다. 소스 레지스터의 하위 32비트를 부호 확장하여 64비트로 만든 뒤 대상 레지스터에 저장합니다.",
    syntax: "SXTW <Xd>, <Wn>",
    example: "SXTW X0, W1"
  },
  {
    name: "UXTW",
    description: "✓ Zero-Extend Word (Unsigned eXTend Word). Zero-extends the low 32 bits of the source register to 64 bits and writes the result to the destination register.\n\n✓ 워드를 부호 없이 확장합니다(제로 확장). 소스 레지스터의 하위 32비트를 0으로 채워 64비트로 확장한 뒤 대상 레지스터에 저장합니다.",
    syntax: "UXTW <Xd>, <Wn>",
    example: "UXTW X0, W1"
  },

  // ---- 기타 ----
  {
    name: "NOP",
    description: "✓ No Operation. Consumes one instruction cycle slot but performs no architectural state change; often used for alignment or timing padding.\n\n✓ 아무 동작도 하지 않습니다. 명령어 사이클 한 슬롯을 소비할 뿐 아키텍처 상태를 변경하지 않으며, 정렬이나 타이밍 조정용으로 자주 사용됩니다.",
    syntax: "NOP",
    example: "NOP"
  }
];

// ARM64 Registers
// 기준: AAPCS64 (Procedure Call Standard for the ARM 64-bit Architecture)
// + Apple Silicon(Darwin) ABI 특이사항 (X18 사용 금지 등)
const arm64Registers = [
  // ---- X0 ~ X7 : 인자 / 반환값 레지스터 ----
  {
    name: "X0",
    description: "✓ 64-bit general purpose register. Argument 1 / primary return value register.\n\n✓ 64비트 범용 레지스터. 첫 번째 인자 전달 및 주 반환값 레지스터입니다.",
    type: "Argument / Return Value"
  },
  {
    name: "X1",
    description: "✓ 64-bit general purpose register. Argument 2. Also holds the upper half of a 128-bit return value together with X0.\n\n✓ 64비트 범용 레지스터. 두 번째 인자 전달용입니다. X0과 함께 128비트 반환값의 상위 절반을 담기도 합니다.",
    type: "Argument / Return Value"
  },
  {
    name: "X2",
    description: "✓ 64-bit general purpose register. Argument 3.\n\n✓ 64비트 범용 레지스터. 세 번째 인자 전달용입니다.",
    type: "Argument"
  },
  {
    name: "X3",
    description: "✓ 64-bit general purpose register. Argument 4.\n\n✓ 64비트 범용 레지스터. 네 번째 인자 전달용입니다.",
    type: "Argument"
  },
  {
    name: "X4",
    description: "✓ 64-bit general purpose register. Argument 5.\n\n✓ 64비트 범용 레지스터. 다섯 번째 인자 전달용입니다.",
    type: "Argument"
  },
  {
    name: "X5",
    description: "✓ 64-bit general purpose register. Argument 6.\n\n✓ 64비트 범용 레지스터. 여섯 번째 인자 전달용입니다.",
    type: "Argument"
  },
  {
    name: "X6",
    description: "✓ 64-bit general purpose register. Argument 7.\n\n✓ 64비트 범용 레지스터. 일곱 번째 인자 전달용입니다.",
    type: "Argument"
  },
  {
    name: "X7",
    description: "✓ 64-bit general purpose register. Argument 8 (last register-passed argument; further arguments spill to the stack).\n\n✓ 64비트 범용 레지스터. 여덟 번째 인자 전달용입니다(레지스터로 전달되는 마지막 인자로, 그 이후 인자는 스택으로 전달됩니다).",
    type: "Argument"
  },

  // ---- X8 : 간접 결과 레지스터 ----
  {
    name: "X8",
    description: "✓ Indirect Result Location Register (XR). Holds the address of the memory location to which a large struct/union return value should be written.\n\n✓ 간접 결과 위치 레지스터(XR). 큰 구조체/공용체 반환값을 써야 할 메모리 주소를 담습니다.)",
    type: "Indirect Result"
  },

  // ---- X9 ~ X15 : 임시(스크래치) 레지스터 ----
  {
    name: "X9",
    description: "✓ 64-bit temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 64비트 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "Temporary (Caller-saved)"
  },
  {
    name: "X10",
    description: "✓ **64-bit temporary** register. Caller-saved; free for local/scratch use, not preserved across calls. \n\n✓ 64비트 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "Temporary (Caller-saved)"
  },
  {
    name: "X11",
    description: "✓ 64-bit temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n64비트 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "Temporary (Caller-saved)"
  },
  {
    name: "X12",
    description: "✓ 64-bit temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n64비트 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "Temporary (Caller-saved)"
  },
  {
    name: "X13",
    description: "✓ 64-bit temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n64비트 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "Temporary (Caller-saved)"
  },
  {
    name: "X14",
    description: "✓ 64-bit temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n64비트 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "Temporary (Caller-saved)"
  },
  {
    name: "X15",
    description: "✓ 64-bit temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n64비트 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "Temporary (Caller-saved)"
  },

  // ---- X16, X17 : 인트라 프로시저 콜 임시 레지스터 ----
  {
    name: "X16",
    description: "✓ Intra-Procedure-call temporary register 1 (IP0). Reserved for use by the linker (e.g. veneers, PLT stubs) and trampoline code; avoid using across calls.\n\n인트라 프로시저 호출 임시 레지스터 1(IP0). 링커가 사용하도록 예약되어 있으며(veneer, PLT 스텁 등) 트램폴린 코드에도 쓰이므로, 함수 호출을 넘어서는 용도로는 사용을 피해야 합니다.",
    type: "IP Scratch (IP0)"
  },
  {
    name: "X17",
    description: "✓ Intra-Procedure-call temporary register 2 (IP1). Reserved for linker/trampoline use, similar to X16. On Apple platforms also used as an auxiliary indirect branch target register.\n\n인트라 프로시저 호출 임시 레지스터 2(IP1). X16과 유사하게 링커/트램폴린 용도로 예약되어 있습니다. Apple 플랫폼에서는 간접 분기 대상용 보조 레지스터로도 쓰입니다.",
    type: "IP Scratch (IP1)"
  },

  // ---- X18 : 플랫폼 레지스터 ----
  {
    name: "X18",
    description: "✓ Platform Register. Reserved for platform ABI use. On Apple platforms (Darwin) it holds a pointer to the current thread's state and must NOT be used as a general-purpose scratch register in user code.\n\n✓ 플랫폼 레지스터. 플랫폼 ABI 용도로 예약되어 있습니다. Apple 플랫폼(Darwin)에서는 현재 스레드 상태를 가리키는 포인터를 담으므로, 사용자 코드에서 범용 스크래치 레지스터로 사용해서는 안 됩니다.",
    type: "Platform Register (Reserved)"
  },

  // ---- X19 ~ X28 : Callee-saved 레지스터 ----
  {
    name: "X19",
    description: "✓ 64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).\n\n✓ 64비트 callee-saved 레지스터. 호출된 함수가 값을 보존해야 합니다(사용 시 스택에 저장/복원 필요).",
    type: "Callee-saved"
  },
  {
    name: "X20",
    description: "✓ 64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).\n\n✓ 64비트 callee-saved 레지스터. 호출된 함수가 값을 보존해야 합니다(사용 시 스택에 저장/복원 필요).",
    type: "Callee-saved"
  },
  {
    name: "X21",
    description: `✓ 64-bit callee-saved register.  Must be preserved by the called function (save/restore on the stack if used).  \n\n✓ 64비트 callee-saved 레지스터. 호출된 함수가 값을 보존해야 합니다(사용 시 스택에 저장/복원 필요).`,
    type: "Callee-saved"
  },
  {
    name: "X22",
    description: "✓ 64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).",
    type: "Callee-saved\n\n✓ 64비트 callee-saved 레지스터. 호출된 함수가 값을 보존해야 합니다(사용 시 스택에 저장/복원 필요)."
  },
  {
    name: "X23",
    description: "✓ 64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).",
    type: "Callee-saved\n\n✓ 64비트 callee-saved 레지스터. 호출된 함수가 값을 보존해야 합니다(사용 시 스택에 저장/복원 필요)."
  },
  {
    name: "X24",
    description: "✓ 64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).",
    type: "Callee-saved\n\n✓ 64비트 callee-saved 레지스터. 호출된 함수가 값을 보존해야 합니다(사용 시 스택에 저장/복원 필요)."
  },
  {
    name: "X25",
    description: "✓ 64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).",
    type: "Callee-saved\n\n✓ 64비트 callee-saved 레지스터. 호출된 함수가 값을 보존해야 합니다(사용 시 스택에 저장/복원 필요)."
  },
  {
    name: "X26",
    description: "✓ 64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).",
    type: "Callee-saved\n\n✓ 64비트 callee-saved 레지스터. 호출된 함수가 값을 보존해야 합니다(사용 시 스택에 저장/복원 필요)."
  },
  {
    name: "X27",
    description: "✓ 64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).",
    type: "Callee-saved\n\n✓ 64비트 callee-saved 레지스터. 호출된 함수가 값을 보존해야 합니다(사용 시 스택에 저장/복원 필요)."
  },
  {
    name: "X28",
    description: "✓ 64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).",
    type: "Callee-saved\n\n✓ 64비트 callee-saved 레지스터. 호출된 함수가 값을 보존해야 합니다(사용 시 스택에 저장/복원 필요)."
  },

  // ---- X29, X30 : FP / LR ----
  {
    name: "X29",
    description: "✓ Frame Pointer (FP). Points to the base of the current stack frame; used to chain stack frames for backtraces/debugging.",
    type: "Frame Pointer\n\n✓ 프레임 포인터(FP). 현재 스택 프레임의 시작 위치를 가리키며, 백트레이스/디버깅을 위해 스택 프레임을 연결하는 데 사용됩니다."
  },
  {
    name: "X30",
    description: "Link Register (LR). Stores the return address set by BL / BLR instructions.\n\n✓ 링크 레지스터(LR). BL / BLR 명령어가 설정한 복귀 주소를 저장합니다.",
    type: "Link Register"
  },

  // ---- 특수 레지스터 ----
  {
    name: "SP",
    description: "✓ Stack Pointer. Points to the current top of the stack. Must remain 16-byte aligned at public function boundaries on AAPCS64/Darwin.\n\n✓ 스택 포인터. 현재 스택의 최상단을 가리킵니다. AAPCS64/Darwin에서 공개 함수 경계에서는 항상 16바이트로 정렬되어 있어야 합니다.",
    type: "Stack Pointer"
  },

  {
    name: "PC",
    description: "✓ Program Counter. Holds the address of the currently executing instruction. Not directly writable as a general register in AArch64 (only via branch instructions).\n\n✓ 프로그램 카운터. 현재 실행 중인 명령어의 주소를 담습니다. AArch64에서는 일반 레지스터처럼 직접 쓸 수 없고 분기 명령어를 통해서만 변경됩니다.",
    type: "Program Counter"
  },

  {
    name: "XZR",
    description: "✓ 64-bit Zero Register. Always reads as 0; any value written to it is discarded.\n\n✓ 64비트 제로 레지스터. 항상 0으로 읽히며, 여기에 쓰는 값은 모두 버려집니다.",
    type: "Zero Register"
  },

  {
    name: "WZR",
    description: "✓ 32-bit Zero Register. The 32-bit view of XZR; always reads as 0, writes are discarded.\n\n✓ 32비트 제로 레지스터. XZR의 32비트 뷰이며, 항상 0으로 읽히고 쓰는 값은 버려집니다.",
    type: "Zero Register"
  },

  // ---- W0 ~ W30 : 32비트 뷰 ----
  {
    name: "W0",
    description: "✓ 32-bit view of X0 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X0의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W1",
    description: "✓ 32-bit view of X1 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X1의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W2",
    description: "✓ 32-bit view of X2 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X2의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W3",
    description: "✓ 32-bit view of X3 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X3의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W4",
    description: "✓ 32-bit view of X4 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X4의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W5",
    description: "✓ 32-bit view of X5 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X5의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W6",
    description: "✓ 32-bit view of X6 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X6의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W7",
    description: "✓ 32-bit view of X7 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X7의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W8",
    description: "✓ 32-bit view of X8 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X8의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W9",
    description: "✓ 32-bit view of X9 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X9의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },

  {
    name: "W10",
    description: "✓ 32-bit view of X10 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X10의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W11",
    description: "✓ 32-bit view of X11 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X11의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W12",
    description: "✓ 32-bit view of X12 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X12의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W13",
    description: "✓ 32-bit view of X13 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X13의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W14",
    description: "✓ 32-bit view of X14 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X14의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W15",
    description: "✓ 32-bit view of X15 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X15의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },

  {
    name: "W16",
    description: "✓ 32-bit view of X16 (low 32 bits, IP0). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X16(IP0)의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W17",
    description: "✓ 32-bit view of X17 (low 32 bits, IP1). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.\n\n✓ X17(IP1)의 32비트 뷰(하위 32비트). Wn에 값을 쓰면 대응하는 Xn의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },

  {
    name: "W18",
    description: "✓ 32-bit view of X18 (low 32 bits, Platform Register). Reserved on Darwin; avoid using in user code.\n\n✓ X18(플랫폼 레지스터)의 32비트 뷰(하위 32비트). Darwin에서는 예약되어 있으므로 사용자 코드에서 사용을 피해야 합니다.",
    type: "General Purpose (32-bit view)"
  },

  {
    name: "W19",
    description: "✓ 32-bit view of X19 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X19.\n\n✓ X19의 32비트 뷰(하위 32비트). Callee-saved이며, Wn에 값을 쓰면 X19의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W20",
    description: "✓ 32-bit view of X20 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X20.\n\n✓ X20의 32비트 뷰(하위 32비트). Callee-saved이며, Wn에 값을 쓰면 X20의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W21",
    description: "✓ 32-bit view of X21 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X21.\n\n✓ X21의 32비트 뷰(하위 32비트). Callee-saved이며, Wn에 값을 쓰면 X21의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W22",
    description: "✓ 32-bit view of X22 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X22.\n\n✓ X22의 32비트 뷰(하위 32비트). Callee-saved이며, Wn에 값을 쓰면 X22의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W23",
    description: "✓ 32-bit view of X23 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X23.\n\n✓ X23의 32비트 뷰(하위 32비트). Callee-saved이며, Wn에 값을 쓰면 X23의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W24",
    description: "✓ 32-bit view of X24 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X24.\n\n✓ X24의 32비트 뷰(하위 32비트). Callee-saved이며, Wn에 값을 쓰면 X24의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W25",
    description: "✓ 32-bit view of X25 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X25.\n\n✓ X25의 32비트 뷰(하위 32비트). Callee-saved이며, Wn에 값을 쓰면 X25의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W26",
    description: "✓ 32-bit view of X26 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X26.\n\n✓ X26의 32비트 뷰(하위 32비트). Callee-saved이며, Wn에 값을 쓰면 X26의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W27",
    description: "✓ 32-bit view of X27 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X27.\n\n✓ X27의 32비트 뷰(하위 32비트). Callee-saved이며, Wn에 값을 쓰면 X27의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W28",
    description: "✓ 32-bit view of X28 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X28.\n\n✓ X28의 32비트 뷰(하위 32비트). Callee-saved이며, Wn에 값을 쓰면 X28의 상위 32비트가 0으로 초기화됩니다.",
    type: "General Purpose (32-bit view)"
  },

  {
    name: "W29",
    description: "✓ 32-bit view of X29 (low 32 bits, Frame Pointer). Rarely used directly; FP is normally referenced as X29.\n\n✓ X29(프레임 포인터)의 32비트 뷰(하위 32비트). 직접 사용되는 경우는 드물며, FP는 보통 X29로 참조됩니다.",
    type: "General Purpose (32-bit view)"
  },
  {
    name: "W30",
    description: "✓ 32-bit view of X30 (low 32 bits, Link Register). Rarely used directly; LR is normally referenced as X30.\n\n✓ X30(링크 레지스터)의 32비트 뷰(하위 32비트). 직접 사용되는 경우는 드물며, LR은 보통 X30으로 참조됩니다.",
    type: "General Purpose (32-bit view)"
  },
];

// ARM64 SIMD & Floating-Point Registers (Vn)
// 각 Vn은 128비트 레지스터이며, 하위 비트 폭에 따라 Bn(8b)/Hn(16b)/Sn(32b, single-precision)/
// Dn(64b, double-precision)/Qn(128b, full vector)로 나누어 접근한다.
// AAPCS64 규약: V0~V7 인자/반환값, V8~V15 callee-saved(단, 하위 64비트 Dn만 보존),
// V16~V31 caller-saved(임시, 호출 간 보존 안 됨).
const arm64FpSimdRegisters = [
  {
    name: "V0",
    description: "✓ 128-bit SIMD/FP register. Argument 1 / primary FP-SIMD return value. Scalar views: B0, H0, S0, D0, Q0.\n\n✓ 128비트 SIMD/부동소수점 레지스터. 첫 번째 인자 전달 및 주 FP-SIMD 반환값용입니다. 스칼라 뷰: B0, H0, S0, D0, Q0.",
    type: "FP/SIMD Argument / Return Value"
  },
  {
    name: "V1",
    description: "✓ 128-bit SIMD/FP register. Argument 2. Scalar views: B1, H1, S1, D1, Q1.\n\n✓ 128비트 SIMD/부동소수점 레지스터. 두 번째 인자 전달용입니다. 스칼라 뷰: B1, H1, S1, D1, Q1.",
    type: "FP/SIMD Argument"
  },
  {
    name: "V2",
    description: "✓ 128-bit SIMD/FP register. Argument 3. Scalar views: B2, H2, S2, D2, Q2.\n\n✓ 128비트 SIMD/부동소수점 레지스터. 세 번째 인자 전달용입니다. 스칼라 뷰: B2, H2, S2, D2, Q2.",
    type: "FP/SIMD Argument"
  },

  {
    name: "V3",
    description: "✓ 128-bit SIMD/FP register. Argument 4. Scalar views: B3, H3, S3, D3, Q3.\n\n✓ 128비트 SIMD/부동소수점 레지스터. 네 번째 인자 전달용입니다. 스칼라 뷰: B3, H3, S3, D3, Q3.",
    type: "FP/SIMD Argument"
  },
  {
    name: "V4",
    description: "✓ 128-bit SIMD/FP register. Argument 5. Scalar views: B4, H4, S4, D4, Q4.\n\n✓ 128비트 SIMD/부동소수점 레지스터. 다섯 번째 인자 전달용입니다. 스칼라 뷰: B4, H4, S4, D4, Q4.",
    type: "FP/SIMD Argument"
  },
  {
    name: "V5",
    description: "✓ 128-bit SIMD/FP register. Argument 6. Scalar views: B5, H5, S5, D5, Q5.\n\n✓ 128비트 SIMD/부동소수점 레지스터. 여섯 번째 인자 전달용입니다. 스칼라 뷰: B5, H5, S5, D5, Q5.",
    type: "FP/SIMD Argument"
  },
  {
    name: "V6",
    description: "✓ 128-bit SIMD/FP register. Argument 7. Scalar views: B6, H6, S6, D6, Q6.\n\n✓ 128비트 SIMD/부동소수점 레지스터. 일곱 번째 인자 전달용입니다. 스칼라 뷰: B6, H6, S6, D6, Q6.",
    type: "FP/SIMD Argument"
  },
  {
    name: "V7",
    description: "✓ 128-bit SIMD/FP register. Argument 8 (last register-passed FP/SIMD argument). Scalar views: B7, H7, S7, D7, Q7.\n\n✓ 128비트 SIMD/부동소수점 레지스터. 여덟 번째 인자 전달용입니다(레지스터로 전달되는 마지막 FP/SIMD 인자). 스칼라 뷰: B7, H7, S7, D7, Q7.",
    type: "FP/SIMD Argument"
  },

  {
    name: "V8",
    description: "✓ 128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D8) must be preserved; bits 64-127 are NOT preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 레지스터. Callee-saved이지만 하위 64비트(D8)만 보존하면 되며, 64~127비트는 호출 간 보존되지 않습니다.",
    type: "FP/SIMD Callee-saved (low 64b only)"
  },
  {
    name: "V9",
    description: "✓ 128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D9) must be preserved; bits 64-127 are NOT preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 레지스터. Callee-saved이지만 하위 64비트(D9)만 보존하면 되며, 64~127비트는 호출 간 보존되지 않습니다.",
    type: "FP/SIMD Callee-saved (low 64b only)"
  },
  {
    name: "V10",
    description: "✓ 128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D10) must be preserved; bits 64-127 are NOT preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 레지스터. Callee-saved이지만 하위 64비트(D10)만 보존하면 되며, 64~127비트는 호출 간 보존되지 않습니다.",
    type: "FP/SIMD Callee-saved (low 64b only)"
  },
  {
    name: "V11",
    description: "✓ 128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D11) must be preserved; bits 64-127 are NOT preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 레지스터. Callee-saved이지만 하위 64비트(D11)만 보존하면 되며, 64~127비트는 호출 간 보존되지 않습니다.",
    type: "FP/SIMD Callee-saved (low 64b only)"
  },
  {
    name: "V12",
    description: "✓ 128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D12) must be preserved; bits 64-127 are NOT preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 레지스터. Callee-saved이지만 하위 64비트(D12)만 보존하면 되며, 64~127비트는 호출 간 보존되지 않습니다.",
    type: "FP/SIMD Callee-saved (low 64b only)"
  },
  {
    name: "V13",
    description: "✓ 128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D13) must be preserved; bits 64-127 are NOT preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 레지스터. Callee-saved이지만 하위 64비트(D13)만 보존하면 되며, 64~127비트는 호출 간 보존되지 않습니다.",
    type: "FP/SIMD Callee-saved (low 64b only)"
  },
  {
    name: "V14",
    description: "✓ 128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D14) must be preserved; bits 64-127 are NOT preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 레지스터. Callee-saved이지만 하위 64비트(D14)만 보존하면 되며, 64~127비트는 호출 간 보존되지 않습니다.",
    type: "FP/SIMD Callee-saved (low 64b only)"
  },
  {
    name: "V15",
    description: "✓ 128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D15) must be preserved; bits 64-127 are NOT preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 레지스터. Callee-saved이지만 하위 64비트(D15)만 보존하면 되며, 64~127비트는 호출 간 보존되지 않습니다.",
    type: "FP/SIMD Callee-saved (low 64b only)"
  },

  {
    name: "V16",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "FP/SIMD Temporary (Caller-saved)"
  },
  {
    name: "V17",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "FP/SIMD Temporary (Caller-saved)"
  },
  {
    name: "V18",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "FP/SIMD Temporary (Caller-saved)"
  },
  {
    name: "V19",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "FP/SIMD Temporary (Caller-saved)"
  },
  {
    name: "V20",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "FP/SIMD Temporary (Caller-saved)"
  },
  {
    name: "V21",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "FP/SIMD Temporary (Caller-saved)"
  },
  {
    name: "V22",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "FP/SIMD Temporary (Caller-saved)"
  },
  {
    name: "V23",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "FP/SIMD Temporary (Caller-saved)"
  },
  {
    name: "V24",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "FP/SIMD Temporary (Caller-saved)"
  },
  {
    name: "V25",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "FP/SIMD Temporary (Caller-saved)"
  },
  {
    name: "V26",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "FP/SIMD Temporary (Caller-saved)"
  },
  {
    name: "V27",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "FP/SIMD Temporary (Caller-saved)"
  },
  {
    name: "V28",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "FP/SIMD Temporary (Caller-saved)"
  },
  {
    name: "V29",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "FP/SIMD Temporary (Caller-saved)"
  },
  {
    name: "V30",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.", type: "FP/SIMD Temporary (Caller-saved)"
  },
  {
    name: "V31",
    description: "✓ 128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.\n\n✓ 128비트 SIMD/부동소수점 임시 레지스터. Caller-saved로, 호출 간 보존되지 않으며 지역/스크래치 용도로 자유롭게 사용 가능합니다.",
    type: "FP/SIMD Temporary (Caller-saved)"
  },

  {
    name: "FPCR",
    description: "✓ Floating-Point Control Register. Configures rounding mode, exception trapping, and flush-to-zero behavior for FP operations. Accessed via MRS/MSR.\n\n✓ 부동소수점 제어 레지스터. 반올림 모드, 예외 트래핑, flush-to-zero 동작 등 부동소수점 연산의 설정값을 담습니다. MRS/MSR로 접근합니다.",
    type: "FP Control"
  },
  {
    name: "FPSR",
    description: "✓ Floating-Point Status Register. Holds cumulative FP exception flags (invalid op, overflow, underflow, etc.). Accessed via MRS/MSR.\n\n✓ 부동소수점 상태 레지스터. 잘못된 연산, 오버플로, 언더플로 등 누적된 부동소수점 예외 플래그를 담습니다. MRS/MSR로 접근합니다.",
    type: "FP Status"
  },
];

// ARM64 Floating-Point Instructions (Sn = single-precision 32-bit, Dn = double-precision 64-bit)
const arm64FpInstructions = [
  {
    name: "FADD",
    description: "✓ Floating-point Add. Adds two floating-point registers and writes the result to the destination register.\n\n✓ 부동소수점 덧셈. 두 부동소수점 레지스터를 더하여 결과를 대상 레지스터에 저장합니다.",
    syntax: "FADD <Sd|Dd>, <Sn|Dn>, <Sm|Dm>",
    example: "FADD D0, D1, D2"
  },
  {
    name: "FSUB",
    description: "✓ Floating-point Subtract. Subtracts the second floating-point operand from the first and writes the result to the destination register.\n\n✓ 부동소수점 뺄셈. 두 번째 부동소수점 피연산자를 첫 번째에서 빼서 결과를 대상 레지스터에 저장합니다.",
    syntax: "FSUB <Sd|Dd>, <Sn|Dn>, <Sm|Dm>",
    example: "FSUB D0, D1, D2"
  },
  {
    name: "FMUL",
    description: "✓ Floating-point Multiply. Multiplies two floating-point registers and writes the result to the destination register.\n\n✓ 부동소수점 곱셈. 두 부동소수점 레지스터를 곱하여 결과를 대상 레지스터에 저장합니다.",
    syntax: "FMUL <Sd|Dd>, <Sn|Dn>, <Sm|Dm>",
    example: "FMUL S0, S1, S2"
  },
  {
    name: "FDIV",
    description: "✓ Floating-point Divide. Divides the first floating-point operand by the second and writes the result to the destination register.\n\n✓ 부동소수점 나눗셈. 첫 번째 부동소수점 피연산자를 두 번째로 나눈 결과를 대상 레지스터에 저장합니다.",
    syntax: "FDIV <Sd|Dd>, <Sn|Dn>, <Sm|Dm>",
    example: "FDIV D0, D1, D2"
  },
  {
    name: "FMADD",
    description: "✓ Floating-point Fused Multiply-Add. Computes Dd = Da + (Dn * Dm) in a single rounding step (fused, more precise than separate multiply+add).\n\n✓ 부동소수점 융합 곱셈-덧셈. Dd = Da + (Dn * Dm)을 한 번의 반올림으로 계산합니다(별도로 곱셈 후 덧셈하는 것보다 정밀도가 높음).",
    syntax: "FMADD <Sd|Dd>, <Sn|Dn>, <Sm|Dm>, <Sa|Da>",
    example: "FMADD D0, D1, D2, D3   // D0 = D3 + (D1 * D2)"
  },
  {
    name: "FMSUB",
    description: "✓ Floating-point Fused Multiply-Subtract. Computes Dd = Da - (Dn * Dm) in a single rounding step.\n\n✓ 부동소수점 융합 곱셈-뺄셈. Dd = Da - (Dn * Dm)을 한 번의 반올림으로 계산합니다.",
    syntax: "FMSUB <Sd|Dd>, <Sn|Dn>, <Sm|Dm>, <Sa|Da>",
    example: "FMSUB D0, D1, D2, D3   // D0 = D3 - (D1 * D2)"
  },
  {
    name: "FNEG",
    description: "✓ Floating-point Negate. Flips the sign bit of a floating-point register and writes the result to the destination.\n\n✓ 부동소수점 부호 반전. 부동소수점 레지스터의 부호 비트를 뒤집어 결과를 대상 레지스터에 저장합니다.",
    syntax: "FNEG <Sd|Dd>, <Sn|Dn>",
    example: "FNEG D0, D1"
  },
  {
    name: "FABS",
    description: "✓ Floating-point Absolute Value. Clears the sign bit of a floating-point register and writes the result to the destination.\n\n✓ 부동소수점 절댓값. 부동소수점 레지스터의 부호 비트를 지워 결과를 대상 레지스터에 저장합니다.",
    syntax: "FABS <Sd|Dd>, <Sn|Dn>",
    example: "FABS D0, D1"
  },
  {
    name: "FSQRT",
    description: "✓ Floating-point Square Root. Computes the square root of a floating-point register and writes the result to the destination.\n\n✓ 부동소수점 제곱근. 부동소수점 레지스터의 제곱근을 계산하여 결과를 대상 레지스터에 저장합니다.",
    syntax: "FSQRT <Sd|Dd>, <Sn|Dn>",
    example: "FSQRT D0, D1"
  },
  {
    name: "FMAX",
    description: "✓ Floating-point Maximum. Writes the numerically larger of two floating-point operands to the destination register (NaN-propagating).\n\n✓ 부동소수점 최댓값. 두 부동소수점 피연산자 중 수치적으로 더 큰 값을 대상 레지스터에 씁니다(NaN이 전파됨).",
    syntax: "FMAX <Sd|Dd>, <Sn|Dn>, <Sm|Dm>",
    example: "FMAX D0, D1, D2"
  },
  {
    name: "FMIN",
    description: "✓ Floating-point Minimum. Writes the numerically smaller of two floating-point operands to the destination register (NaN-propagating).\n\n✓ 부동소수점 최솟값. 두 부동소수점 피연산자 중 수치적으로 더 작은 값을 대상 레지스터에 씁니다(NaN이 전파됨).",
    syntax: "FMIN <Sd|Dd>, <Sn|Dn>, <Sm|Dm>",
    example: "FMIN D0, D1, D2"
  },
  {
    name: "FCMP",
    description: "✓ Floating-point Compare. Compares two floating-point registers (or a register and zero) and updates the NZCV condition flags.\n\n✓ 부동소수점 비교. 두 부동소수점 레지스터(또는 레지스터와 0)를 비교하여 NZCV 조건 플래그를 갱신합니다.",
    syntax: "FCMP <Sn|Dn>, <Sm|Dm>  or  FCMP <Sn|Dn>, #0.0",
    example: "FCMP D0, D1\nB.GT greater_label"
  },
  {
    name: "FMOV",
    description: "✓ Floating-point Move. Copies a value between FP registers, or between a general-purpose register and an FP register, or loads a small FP immediate.\n\n✓ 부동소수점 이동. FP 레지스터 간, 또는 범용 레지스터와 FP 레지스터 간 값을 복사하거나, 작은 FP 즉치값을 적재합니다.",
    syntax: "FMOV <Sd|Dd>, <Sn|Dn>  or  FMOV <Wd|Xd>, <Sn|Dn>  or  FMOV <Sd|Dd>, #<fpimm>",
    example: "FMOV D0, D1\nFMOV X0, D0\nFMOV D0, #1.0"
  },
  {
    name: "SCVTF",
    description: "✓ Signed integer Convert to Floating-point. Converts a signed integer register value to a floating-point value in the destination register.\n\n✓ 부호 있는 정수를 부동소수점으로 변환합니다. 부호 있는 정수 레지스터 값을 부동소수점 값으로 변환하여 대상 레지스터에 저장합니다.",
    syntax: "SCVTF <Sd|Dd>, <Wn|Xn>",
    example: "SCVTF D0, X0"
  },
  {
    name: "UCVTF",
    description: "✓ Unsigned integer Convert to Floating-point. Converts an unsigned integer register value to a floating-point value in the destination register.\n\n✓ 부호 없는 정수를 부동소수점으로 변환합니다. 부호 없는 정수 레지스터 값을 부동소수점 값으로 변환하여 대상 레지스터에 저장합니다.",
    syntax: "UCVTF <Sd|Dd>, <Wn|Xn>",
    example: "UCVTF D0, X0"
  },
  {
    name: "FCVTZS",
    description: "✓ Floating-point Convert to Signed integer, rounding toward Zero. Converts an FP value to a signed integer in a general-purpose register (like a C-style (int) cast).\n\n✓ 부동소수점을 0 방향으로 반올림하여 부호 있는 정수로 변환합니다. FP 값을 범용 레지스터의 부호 있는 정수로 변환합니다(C 언어의 (int) 캐스팅과 유사).",
    syntax: "FCVTZS <Wd|Xd>, <Sn|Dn>",
    example: "FCVTZS X0, D0"
  },
  {
    name: "FCVTZU",
    description: "✓ Floating-point Convert to Unsigned integer, rounding toward Zero. Converts an FP value to an unsigned integer in a general-purpose register.\n\n✓ 부동소수점을 0 방향으로 반올림하여 부호 없는 정수로 변환합니다. FP 값을 범용 레지스터의 부호 없는 정수로 변환합니다.",
    syntax: "FCVTZU <Wd|Xd>, <Sn|Dn>",
    example: "FCVTZU X0, D0"
  },
  {
    name: "FCVT",
    description: "✓ Floating-point Convert precision. Converts a value between single-precision and double-precision formats.\n\n✓ 부동소수점 정밀도를 변환합니다. 단정밀도와 배정밀도 형식 간에 값을 변환합니다.",
    syntax: "FCVT <Dd>, <Sn>  or  FCVT <Sd>, <Dn>",
    example: "FCVT D0, S0   // float -> double\nFCVT S0, D0   // double -> float"
  }
];

// ARM64 Condition Codes
// CMP/CMN/FCMP/SUBS 등이 세팅하는 NZCV 플래그를 기반으로 B.<cond>, CSEL, CSET 등에서 사용.
// N = Negative, Z = Zero, C = Carry, V = Overflow
const arm64ConditionCodes = [
  {
    name: "EQ", flags: "Z == 1",
    description: "✓ Equal. True when the previous comparison's operands were equal (or subtraction result was zero).\n\n✓ 같음(Equal). 직전 비교의 두 피연산자가 같았을 때(또는 뺄셈 결과가 0일 때) 참입니다.",
    example: "B.EQ label"
  },

  {
    name: "NE", flags: "Z == 0",
    description: "✓ Not Equal. True when the previous comparison's operands were different.\n\n✓ 같지 않음(Not Equal). 직전 비교의 두 피연산자가 달랐을 때 참입니다.",
    example: "B.NE label"
  },

  {
    name: "CS / HS", flags: "C == 1",
    description: "✓ Carry Set / Unsigned Higher or Same. True for an unsigned '>=' comparison.\n\n✓ 캐리 설정 / 부호 없는 크거나 같음. 부호 없는 '>=' 비교일 때 참입니다.",
    example: "B.HS label"
  },

  {
    name: "CC / LO", flags: "C == 0",
    description: "✓ Carry Clear / Unsigned Lower. True for an unsigned '<' comparison.\n\n✓ 캐리 해제 / 부호 없는 작음. 부호 없는 '<' 비교일 때 참입니다.",
    example: "B.LO label"
  },

  {
    name: "MI", flags: "N == 1",
    description: "✓ Minus / Negative. True when the result of the previous operation was negative.\n\n✓ 음수(Minus/Negative). 직전 연산 결과가 음수였을 때 참입니다.",
    example: "B.MI label"
  },

  {
    name: "PL", flags: "N == 0",
    description: "✓ Plus / Positive or zero. True when the result of the previous operation was non-negative.\n\n✓ 양수 또는 0(Plus). 직전 연산 결과가 음수가 아니었을 때 참입니다.",
    example: "B.PL label"
  },
  {
    name: "VS", flags: "V == 1",
    description: "✓ Overflow Set. True when the previous signed arithmetic operation overflowed.\n\n✓ 오버플로 설정(Overflow Set). 직전의 부호 있는 산술 연산이 오버플로했을 때 참입니다.",
    example: "B.VS label"
  },
  {
    name: "VC", flags: "V == 0",
    description: "✓ Overflow Clear. True when the previous signed arithmetic operation did not overflow.\n\n✓ 오버플로 해제(Overflow Clear). 직전의 부호 있는 산술 연산이 오버플로하지 않았을 때 참입니다.",
    example: "B.VC label"
  },
  {
    name: "HI", flags: "C == 1 && Z == 0",
    description: "✓ Unsigned Higher. True for an unsigned '>' comparison.\n\n✓ 부호 없는 큼(Unsigned Higher). 부호 없는 '>' 비교일 때 참입니다.",
    example: "B.HI label"
  },
  {
    name: "LS", flags: "C == 0 || Z == 1",
    description: "✓ Unsigned Lower or Same. True for an unsigned '<=' comparison.\n\n✓ 부호 없는 작거나 같음. 부호 없는 '<=' 비교일 때 참입니다.",
    example: "B.LS label"
  },
  {
    name: "GE", flags: "N == V",
    description: "✓ Signed Greater than or Equal. True for a signed '>=' comparison.\n\n✓ 부호 있는 크거나 같음(Greater than or Equal). 부호 있는 '>=' 비교일 때 참입니다.",
    example: "B.GE label"
  },
  {
    name: "LT", flags: "N != V",
    description: "✓ Signed Less Than. True for a signed '<' comparison.\n\n✓ 부호 있는 작음(Less Than). 부호 있는 '<' 비교일 때 참입니다.",
    example: "B.LT label"
  },
  {
    name: "GT", flags: "Z == 0 && N == V",
    description: "✓ Signed Greater Than. True for a signed '>' comparison. (Used in the C code: if (arr[j] > arr[j+1]))\n\n✓ 부호 있는 큼(Greater Than). 부호 있는 '>' 비교일 때 참입니다. (예: C 코드의 if (arr[j] > arr[j+1]))",
    example: "B.GT label"
  },
  {
    name: "LE", flags: "Z == 1 || N != V",
    description: "✓ Signed Less than or Equal. True for a signed '<=' comparison.\n\n✓ 부호 있는 작거나 같음(Less than or Equal). 부호 있는 '<=' 비교일 때 참입니다.",
    example: "B.LE label"
  },
  {
    name: "AL", flags: "any",
    description: "✓ Always. Condition is always true (rarely written explicitly; plain B is used instead).\n\n✓ 항상(Always). 조건이 항상 참입니다(명시적으로 쓰이는 경우는 드물며 보통 일반 B를 사용).", example: "B.AL label"
  },
  {
    name: "NV", flags: "any",
    description: "✓ Never (reserved encoding). Behaves identically to AL in practice; kept only for historical encoding completeness, should not be used.\n\n✓ 사용 안 함(예약된 인코딩). 실제로는 AL과 동일하게 동작하지만 역사적 인코딩 호환성을 위해 남아있으며, 사용을 피해야 합니다.", example: "-- (reserved, avoid using)"
  },
];

module.exports = {
  arm64Instructions,
  arm64Registers,
  arm64FpSimdRegisters,
  arm64FpInstructions,
  arm64ConditionCodes
};
