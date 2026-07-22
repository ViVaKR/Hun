// ARM64 Common Opcodes
const arm64Instructions = [
  {
    name: "MOV",
    description: "Move register or immediate value. Copies the value of the source operand to the destination register.",
    syntax: "MOV <Wd|Xd>, <Wn|Xn>  or  MOV <Wd|Xd>, #<imm>",
    example: "MOV X0, X1\nMOV W2, #10"
  },
  {
    name: "LDR",
    description: "Load Register. Loads a word or doubleword from memory into a register.",
    syntax: "LDR <Wt|Xt>, [<Xn|SP>], #<simm>\nLDR <Wt|Xt>, [<Xn|SP>, #<pimm>]",
    example: "LDR X0, [X1]\nLDR W2, [SP, #8]"
  },
  {
    name: "STR",
    description: "Store Register. Stores a word or doubleword from a register into memory.",
    syntax: "STR <Wt|Xt>, [<Xn|SP>], #<simm>\nSTR <Wt|Xt>, [<Xn|SP>, #<pimm>]",
    example: "STR X0, [X1]\nSTR W2, [SP, #8]"
  },
  {
    name: "ADD",
    description: "Add (register or immediate). Adds two operands and stores the result in the destination register.",
    syntax: "ADD <Wd|Xd>, <Wn|Xn>, <Wm|Xm>  or  ADD <Wd|Xd>, <Wn|Xn>, #<imm>",
    example: "ADD X0, X1, X2\nADD W0, W1, #5"
  },
  {
    name: "SUB",
    description: "Subtract (register or immediate). Subtracts the second operand from the first operand.",
    syntax: "SUB <Wd|Xd>, <Wn|Xn>, <Wm|Xm>  or  SUB <Wd|Xd>, <Wn|Xn>, #<imm>",
    example: "SUB X0, X1, X2\nSUB W0, W1, #4"
  },
  {
    name: "CMP",
    description: "Compare. Compares two operands by subtracting them and updates the condition flags.",
    syntax: "CMP <Wn|Xn>, <Wm|Xm>  or  CMP <Wn|Xn>, #<imm>",
    example: "CMP X0, X1\nCMP W2, #0"
  },
  {
    name: "B",
    description: "Branch. Unconditionally branches to a label.",
    syntax: "B <label>\nB.<cond> <label>  (Conditional, e.g. B.EQ, B.NE)",
    example: "B loop\nB.EQ exit_label"
  },
  {
    name: "BL",
    description: "Branch with Link. Calls a subroutine, saving the return address in X30 (Link Register).",
    syntax: "BL <label>",
    example: "BL my_function"
  },
  {
    name: "RET",
    description: "Return from subroutine. Branches to the address in the Link Register (usually X30).",
    syntax: "RET {<Xn>}",
    example: "RET"
  },

  // ---- 데이터 전송 (Pair / PC-relative) ----
  {
    name: "LDP",
    description: "Load Pair of Registers. Loads two words or doublewords from consecutive memory locations into two registers in a single instruction. Commonly used to restore callee-saved registers in epilogues.",
    syntax: "LDP <Wt1|Xt1>, <Wt2|Xt2>, [<Xn|SP>], #<imm>\nLDP <Wt1|Xt1>, <Wt2|Xt2>, [<Xn|SP>, #<imm>]",
    example: "LDP X19, X20, [SP, #16]\nLDP X29, X30, [SP], #48"
  },
  {
    name: "STP",
    description: "Store Pair of Registers. Stores two words or doublewords to consecutive memory locations in a single instruction. Commonly used to save callee-saved registers / FP+LR in prologues.",
    syntax: "STP <Wt1|Xt1>, <Wt2|Xt2>, [<Xn|SP>, #<imm>]!\nSTP <Wt1|Xt1>, <Wt2|Xt2>, [<Xn|SP>], #<imm>",
    example: "STP x29, x30, [sp, #-48]!\nSTP X19, X20, [SP, #16]"
  },
  {
    name: "ADRP",
    description: "Form PC-relative address to a 4KB page. Computes the address of the 4KB page containing a label and writes it to the destination register; usually paired with ADD ...@PAGEOFF or LDR to reach the exact byte.",
    syntax: "ADRP <Xd>, <label>@PAGE",
    example: "ADRP x2, msg_bubble@PAGE\nADD x2, x2, msg_bubble@PAGEOFF"
  },
  {
    name: "ADR",
    description: "Form PC-relative address. Computes the exact byte address of a nearby label (within ±1MB) and writes it to the destination register. Unlike ADRP, no page offset is needed.",
    syntax: "ADR <Xd>, <label>",
    example: "ADR x0, local_data"
  },

  // ---- 산술 ----
  {
    name: "MUL",
    description: "Multiply. Multiplies two registers and writes the (truncated) result to the destination register. Alias for MADD with a zero addend.",
    syntax: "MUL <Wd|Xd>, <Wn|Xn>, <Wm|Xm>",
    example: "MUL X0, X1, X2"
  },
  {
    name: "MADD",
    description: "Multiply-Add. Multiplies two registers, adds a third, and writes the result to the destination register: Xd = Xa + (Xn * Xm).",
    syntax: "MADD <Wd|Xd>, <Wn|Xn>, <Wm|Xm>, <Wa|Xa>",
    example: "MADD X0, X1, X2, X3   // X0 = X3 + (X1 * X2)"
  },
  {
    name: "MSUB",
    description: "Multiply-Subtract. Multiplies two registers, subtracts the product from a third, and writes the result to the destination register: Xd = Xa - (Xn * Xm).",
    syntax: "MSUB <Wd|Xd>, <Wn|Xn>, <Wm|Xm>, <Wa|Xa>",
    example: "MSUB X0, X1, X2, X3   // X0 = X3 - (X1 * X2)"
  },
  {
    name: "SDIV",
    description: "Signed Divide. Divides the first operand by the second (signed) and writes the quotient to the destination register (result truncates toward zero).",
    syntax: "SDIV <Wd|Xd>, <Wn|Xn>, <Wm|Xm>",
    example: "SDIV X0, X1, X2"
  },
  {
    name: "UDIV",
    description: "Unsigned Divide. Divides the first operand by the second (unsigned) and writes the quotient to the destination register.",
    syntax: "UDIV <Wd|Xd>, <Wn|Xn>, <Wm|Xm>",
    example: "UDIV X0, X1, X2"
  },
  {
    name: "NEG",
    description: "Negate. Computes the two's-complement negation of a register (equivalent to SUB Xd, XZR, Xn) and writes it to the destination.",
    syntax: "NEG <Wd|Xd>, <Wn|Xn>",
    example: "NEG X0, X1"
  },

  // ---- 논리 연산 ----
  {
    name: "AND",
    description: "Bitwise AND (register or immediate). ANDs two operands bit by bit and writes the result to the destination register.",
    syntax: "AND <Wd|Xd>, <Wn|Xn>, <Wm|Xm>  or  AND <Wd|Xd>, <Wn|Xn>, #<imm>",
    example: "AND X0, X1, X2\nAND W0, W1, #0xF"
  },
  {
    name: "ORR",
    description: "Bitwise OR (register or immediate). ORs two operands bit by bit and writes the result to the destination register.",
    syntax: "ORR <Wd|Xd>, <Wn|Xn>, <Wm|Xm>  or  ORR <Wd|Xd>, <Wn|Xn>, #<imm>",
    example: "ORR X0, X1, X2"
  },
  {
    name: "EOR",
    description: "Bitwise Exclusive OR (register or immediate). XORs two operands bit by bit; commonly used to zero a register (EOR Xd, Xd, Xd).",
    syntax: "EOR <Wd|Xd>, <Wn|Xn>, <Wm|Xm>  or  EOR <Wd|Xd>, <Wn|Xn>, #<imm>",
    example: "EOR X0, X0, X0   // X0 = 0"
  },
  {
    name: "MVN",
    description: "Bitwise NOT (Move Not). Inverts every bit of the source operand and writes the result to the destination register.",
    syntax: "MVN <Wd|Xd>, <Wn|Xn>",
    example: "MVN X0, X1"
  },
  {
    name: "TST",
    description: "Test bits. Performs a bitwise AND between two operands and updates the condition flags without storing the result (alias for ANDS with a discarded destination).",
    syntax: "TST <Wn|Xn>, <Wm|Xm>  or  TST <Wn|Xn>, #<imm>",
    example: "TST X0, #1\nB.NE is_odd"
  },

  // ---- 시프트 ----
  {
    name: "LSL",
    description: "Logical Shift Left. Shifts the bits of a register left by a given amount, filling with zeros from the right.",
    syntax: "LSL <Wd|Xd>, <Wn|Xn>, #<shift>  or  LSL <Wd|Xd>, <Wn|Xn>, <Wm|Xm>",
    example: "LSL x10, x22, #2   // x10 = j * 4"
  },
  {
    name: "LSR",
    description: "Logical Shift Right. Shifts the bits of a register right by a given amount, filling with zeros from the left.",
    syntax: "LSR <Wd|Xd>, <Wn|Xn>, #<shift>  or  LSR <Wd|Xd>, <Wn|Xn>, <Wm|Xm>",
    example: "LSR X0, X1, #1     // X0 = X1 / 2 (unsigned)"
  },
  {
    name: "ASR",
    description: "Arithmetic Shift Right. Shifts the bits of a register right by a given amount, filling with the sign bit (preserves the sign for signed division-like operations).",
    syntax: "ASR <Wd|Xd>, <Wn|Xn>, #<shift>  or  ASR <Wd|Xd>, <Wn|Xn>, <Wm|Xm>",
    example: "ASR X0, X1, #1     // X0 = X1 / 2 (signed)"
  },

  // ---- 분기 (조건부/레지스터 기반) ----
  {
    name: "CBZ",
    description: "Compare and Branch if Zero. Branches to a label if the register equals zero, without affecting the condition flags.",
    syntax: "CBZ <Wt|Xt>, <label>",
    example: "CBZ X0, done"
  },
  {
    name: "CBNZ",
    description: "Compare and Branch if Not Zero. Branches to a label if the register is nonzero, without affecting the condition flags.",
    syntax: "CBNZ <Wt|Xt>, <label>",
    example: "CBNZ X0, loop"
  },
  {
    name: "TBZ",
    description: "Test bit and Branch if Zero. Tests a single specified bit of a register and branches to a label if that bit is 0.",
    syntax: "TBZ <Wt|Xt>, #<bit_num>, <label>",
    example: "TBZ W0, #0, is_even"
  },
  {
    name: "TBNZ",
    description: "Test bit and Branch if Not Zero. Tests a single specified bit of a register and branches to a label if that bit is 1.",
    syntax: "TBNZ <Wt|Xt>, #<bit_num>, <label>",
    example: "TBNZ W0, #0, is_odd"
  },
  {
    name: "BR",
    description: "Branch to Register. Branches unconditionally to the address held in a register, without linking a return address (no update to X30).",
    syntax: "BR <Xn>",
    example: "BR X16"
  },
  {
    name: "BLR",
    description: "Branch with Link to Register. Calls a subroutine whose address is held in a register, saving the return address in X30 (Link Register).",
    syntax: "BLR <Xn>",
    example: "BLR X8"
  },

  // ---- 조건 선택 ----
  {
    name: "CSEL",
    description: "Conditional Select. Writes one of two source registers to the destination depending on the condition flags, without branching (branchless if/else).",
    syntax: "CSEL <Wd|Xd>, <Wn|Xn>, <Wm|Xm>, <cond>",
    example: "CSEL X0, X1, X2, GT   // X0 = (X1 > X2) ? X1 : X2 (after a prior CMP)"
  },
  {
    name: "CSET",
    description: "Conditional Set. Sets the destination register to 1 if the condition holds, or 0 otherwise, based on the condition flags.",
    syntax: "CSET <Wd|Xd>, <cond>",
    example: "CSET X0, EQ"
  },

  // ---- 확장 ----
  {
    name: "SXTW",
    description: "Sign-Extend Word. Sign-extends the low 32 bits of the source register to 64 bits and writes the result to the destination register.",
    syntax: "SXTW <Xd>, <Wn>",
    example: "SXTW X0, W1"
  },
  {
    name: "UXTW",
    description: "Zero-Extend Word (Unsigned eXTend Word). Zero-extends the low 32 bits of the source register to 64 bits and writes the result to the destination register.",
    syntax: "UXTW <Xd>, <Wn>",
    example: "UXTW X0, W1"
  },

  // ---- 기타 ----
  {
    name: "NOP",
    description: "No Operation. Consumes one instruction cycle slot but performs no architectural state change; often used for alignment or timing padding.",
    syntax: "NOP",
    example: "NOP"
  }
];

// ARM64 Registers
// 기준: AAPCS64 (Procedure Call Standard for the ARM 64-bit Architecture)
// + Apple Silicon(Darwin) ABI 특이사항 (X18 사용 금지 등)
const arm64Registers = [
  // ---- X0 ~ X7 : 인자 / 반환값 레지스터 ----
  { name: "X0", description: "64-bit general purpose register. Argument 1 / primary return value register.", type: "Argument / Return Value" },
  { name: "X1", description: "64-bit general purpose register. Argument 2. Also holds the upper half of a 128-bit return value together with X0.", type: "Argument / Return Value" },
  { name: "X2", description: "64-bit general purpose register. Argument 3.", type: "Argument" },
  { name: "X3", description: "64-bit general purpose register. Argument 4.", type: "Argument" },
  { name: "X4", description: "64-bit general purpose register. Argument 5.", type: "Argument" },
  { name: "X5", description: "64-bit general purpose register. Argument 6.", type: "Argument" },
  { name: "X6", description: "64-bit general purpose register. Argument 7.", type: "Argument" },
  { name: "X7", description: "64-bit general purpose register. Argument 8 (last register-passed argument; further arguments spill to the stack).", type: "Argument" },

  // ---- X8 : 간접 결과 레지스터 ----
  { name: "X8", description: "Indirect Result Location Register (XR). Holds the address of the memory location to which a large struct/union return value should be written.", type: "Indirect Result" },

  // ---- X9 ~ X15 : 임시(스크래치) 레지스터 ----
  { name: "X9", description: "64-bit temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "Temporary (Caller-saved)" },
  { name: "X10", description: "64-bit temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "Temporary (Caller-saved)" },
  { name: "X11", description: "64-bit temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "Temporary (Caller-saved)" },
  { name: "X12", description: "64-bit temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "Temporary (Caller-saved)" },
  { name: "X13", description: "64-bit temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "Temporary (Caller-saved)" },
  { name: "X14", description: "64-bit temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "Temporary (Caller-saved)" },
  { name: "X15", description: "64-bit temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "Temporary (Caller-saved)" },

  // ---- X16, X17 : 인트라 프로시저 콜 임시 레지스터 ----
  { name: "X16", description: "Intra-Procedure-call temporary register 1 (IP0). Reserved for use by the linker (e.g. veneers, PLT stubs) and trampoline code; avoid using across calls.", type: "IP Scratch (IP0)" },
  { name: "X17", description: "Intra-Procedure-call temporary register 2 (IP1). Reserved for linker/trampoline use, similar to X16. On Apple platforms also used as an auxiliary indirect branch target register.", type: "IP Scratch (IP1)" },

  // ---- X18 : 플랫폼 레지스터 ----
  { name: "X18", description: "Platform Register. Reserved for platform ABI use. On Apple platforms (Darwin) it holds a pointer to the current thread's state and must NOT be used as a general-purpose scratch register in user code.", type: "Platform Register (Reserved)" },

  // ---- X19 ~ X28 : Callee-saved 레지스터 ----
  { name: "X19", description: "64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).", type: "Callee-saved" },
  { name: "X20", description: "64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).", type: "Callee-saved" },
  { name: "X21", description: "64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).", type: "Callee-saved" },
  { name: "X22", description: "64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).", type: "Callee-saved" },
  { name: "X23", description: "64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).", type: "Callee-saved" },
  { name: "X24", description: "64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).", type: "Callee-saved" },
  { name: "X25", description: "64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).", type: "Callee-saved" },
  { name: "X26", description: "64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).", type: "Callee-saved" },
  { name: "X27", description: "64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).", type: "Callee-saved" },
  { name: "X28", description: "64-bit callee-saved register. Must be preserved by the called function (save/restore on the stack if used).", type: "Callee-saved" },

  // ---- X29, X30 : FP / LR ----
  { name: "X29", description: "Frame Pointer (FP). Points to the base of the current stack frame; used to chain stack frames for backtraces/debugging.", type: "Frame Pointer" },
  { name: "X30", description: "Link Register (LR). Stores the return address set by BL / BLR instructions.", type: "Link Register" },

  // ---- 특수 레지스터 ----
  { name: "SP", description: "Stack Pointer. Points to the current top of the stack. Must remain 16-byte aligned at public function boundaries on AAPCS64/Darwin.", type: "Stack Pointer" },
  { name: "PC", description: "Program Counter. Holds the address of the currently executing instruction. Not directly writable as a general register in AArch64 (only via branch instructions).", type: "Program Counter" },
  { name: "XZR", description: "64-bit Zero Register. Always reads as 0; any value written to it is discarded.", type: "Zero Register" },
  { name: "WZR", description: "32-bit Zero Register. The 32-bit view of XZR; always reads as 0, writes are discarded.", type: "Zero Register" },

  // ---- W0 ~ W30 : 32비트 뷰 ----
  { name: "W0", description: "32-bit view of X0 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W1", description: "32-bit view of X1 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W2", description: "32-bit view of X2 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W3", description: "32-bit view of X3 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W4", description: "32-bit view of X4 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W5", description: "32-bit view of X5 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W6", description: "32-bit view of X6 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W7", description: "32-bit view of X7 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W8", description: "32-bit view of X8 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W9", description: "32-bit view of X9 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W10", description: "32-bit view of X10 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W11", description: "32-bit view of X11 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W12", description: "32-bit view of X12 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W13", description: "32-bit view of X13 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W14", description: "32-bit view of X14 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W15", description: "32-bit view of X15 (low 32 bits). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W16", description: "32-bit view of X16 (low 32 bits, IP0). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W17", description: "32-bit view of X17 (low 32 bits, IP1). Writing to Wn zeroes the upper 32 bits of the corresponding Xn.", type: "General Purpose (32-bit view)" },
  { name: "W18", description: "32-bit view of X18 (low 32 bits, Platform Register). Reserved on Darwin; avoid using in user code.", type: "General Purpose (32-bit view)" },
  { name: "W19", description: "32-bit view of X19 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X19.", type: "General Purpose (32-bit view)" },
  { name: "W20", description: "32-bit view of X20 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X20.", type: "General Purpose (32-bit view)" },
  { name: "W21", description: "32-bit view of X21 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X21.", type: "General Purpose (32-bit view)" },
  { name: "W22", description: "32-bit view of X22 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X22.", type: "General Purpose (32-bit view)" },
  { name: "W23", description: "32-bit view of X23 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X23.", type: "General Purpose (32-bit view)" },
  { name: "W24", description: "32-bit view of X24 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X24.", type: "General Purpose (32-bit view)" },
  { name: "W25", description: "32-bit view of X25 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X25.", type: "General Purpose (32-bit view)" },
  { name: "W26", description: "32-bit view of X26 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X26.", type: "General Purpose (32-bit view)" },
  { name: "W27", description: "32-bit view of X27 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X27.", type: "General Purpose (32-bit view)" },
  { name: "W28", description: "32-bit view of X28 (low 32 bits). Callee-saved; writing to Wn zeroes the upper 32 bits of X28.", type: "General Purpose (32-bit view)" },
  { name: "W29", description: "32-bit view of X29 (low 32 bits, Frame Pointer). Rarely used directly; FP is normally referenced as X29.", type: "General Purpose (32-bit view)" },
  { name: "W30", description: "32-bit view of X30 (low 32 bits, Link Register). Rarely used directly; LR is normally referenced as X30.", type: "General Purpose (32-bit view)" },
];

// ARM64 SIMD & Floating-Point Registers (Vn)
// 각 Vn은 128비트 레지스터이며, 하위 비트 폭에 따라 Bn(8b)/Hn(16b)/Sn(32b, single-precision)/
// Dn(64b, double-precision)/Qn(128b, full vector)로 나누어 접근한다.
// AAPCS64 규약: V0~V7 인자/반환값, V8~V15 callee-saved(단, 하위 64비트 Dn만 보존),
// V16~V31 caller-saved(임시, 호출 간 보존 안 됨).
const arm64FpSimdRegisters = [
  { name: "V0", description: "128-bit SIMD/FP register. Argument 1 / primary FP-SIMD return value. Scalar views: B0, H0, S0, D0, Q0.", type: "FP/SIMD Argument / Return Value" },
  { name: "V1", description: "128-bit SIMD/FP register. Argument 2. Scalar views: B1, H1, S1, D1, Q1.", type: "FP/SIMD Argument" },
  { name: "V2", description: "128-bit SIMD/FP register. Argument 3. Scalar views: B2, H2, S2, D2, Q2.", type: "FP/SIMD Argument" },
  { name: "V3", description: "128-bit SIMD/FP register. Argument 4. Scalar views: B3, H3, S3, D3, Q3.", type: "FP/SIMD Argument" },
  { name: "V4", description: "128-bit SIMD/FP register. Argument 5. Scalar views: B4, H4, S4, D4, Q4.", type: "FP/SIMD Argument" },
  { name: "V5", description: "128-bit SIMD/FP register. Argument 6. Scalar views: B5, H5, S5, D5, Q5.", type: "FP/SIMD Argument" },
  { name: "V6", description: "128-bit SIMD/FP register. Argument 7. Scalar views: B6, H6, S6, D6, Q6.", type: "FP/SIMD Argument" },
  { name: "V7", description: "128-bit SIMD/FP register. Argument 8 (last register-passed FP/SIMD argument). Scalar views: B7, H7, S7, D7, Q7.", type: "FP/SIMD Argument" },
  { name: "V8", description: "128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D8) must be preserved; bits 64-127 are NOT preserved across calls.", type: "FP/SIMD Callee-saved (low 64b only)" },
  { name: "V9", description: "128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D9) must be preserved; bits 64-127 are NOT preserved across calls.", type: "FP/SIMD Callee-saved (low 64b only)" },
  { name: "V10", description: "128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D10) must be preserved; bits 64-127 are NOT preserved across calls.", type: "FP/SIMD Callee-saved (low 64b only)" },
  { name: "V11", description: "128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D11) must be preserved; bits 64-127 are NOT preserved across calls.", type: "FP/SIMD Callee-saved (low 64b only)" },
  { name: "V12", description: "128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D12) must be preserved; bits 64-127 are NOT preserved across calls.", type: "FP/SIMD Callee-saved (low 64b only)" },
  { name: "V13", description: "128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D13) must be preserved; bits 64-127 are NOT preserved across calls.", type: "FP/SIMD Callee-saved (low 64b only)" },
  { name: "V14", description: "128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D14) must be preserved; bits 64-127 are NOT preserved across calls.", type: "FP/SIMD Callee-saved (low 64b only)" },
  { name: "V15", description: "128-bit SIMD/FP register. Callee-saved, but only the low 64 bits (D15) must be preserved; bits 64-127 are NOT preserved across calls.", type: "FP/SIMD Callee-saved (low 64b only)" },
  { name: "V16", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "V17", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "V18", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "V19", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "V20", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "V21", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "V22", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "V23", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "V24", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "V25", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "V26", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "V27", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "V28", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "V29", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "V30", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "V31", description: "128-bit SIMD/FP temporary register. Caller-saved; free for local/scratch use, not preserved across calls.", type: "FP/SIMD Temporary (Caller-saved)" },
  { name: "FPCR", description: "Floating-Point Control Register. Configures rounding mode, exception trapping, and flush-to-zero behavior for FP operations. Accessed via MRS/MSR.", type: "FP Control" },
  { name: "FPSR", description: "Floating-Point Status Register. Holds cumulative FP exception flags (invalid op, overflow, underflow, etc.). Accessed via MRS/MSR.", type: "FP Status" },
];

// ARM64 Floating-Point Instructions (Sn = single-precision 32-bit, Dn = double-precision 64-bit)
const arm64FpInstructions = [
  {
    name: "FADD",
    description: "Floating-point Add. Adds two floating-point registers and writes the result to the destination register.",
    syntax: "FADD <Sd|Dd>, <Sn|Dn>, <Sm|Dm>",
    example: "FADD D0, D1, D2"
  },
  {
    name: "FSUB",
    description: "Floating-point Subtract. Subtracts the second floating-point operand from the first and writes the result to the destination register.",
    syntax: "FSUB <Sd|Dd>, <Sn|Dn>, <Sm|Dm>",
    example: "FSUB D0, D1, D2"
  },
  {
    name: "FMUL",
    description: "Floating-point Multiply. Multiplies two floating-point registers and writes the result to the destination register.",
    syntax: "FMUL <Sd|Dd>, <Sn|Dn>, <Sm|Dm>",
    example: "FMUL S0, S1, S2"
  },
  {
    name: "FDIV",
    description: "Floating-point Divide. Divides the first floating-point operand by the second and writes the result to the destination register.",
    syntax: "FDIV <Sd|Dd>, <Sn|Dn>, <Sm|Dm>",
    example: "FDIV D0, D1, D2"
  },
  {
    name: "FMADD",
    description: "Floating-point Fused Multiply-Add. Computes Dd = Da + (Dn * Dm) in a single rounding step (fused, more precise than separate multiply+add).",
    syntax: "FMADD <Sd|Dd>, <Sn|Dn>, <Sm|Dm>, <Sa|Da>",
    example: "FMADD D0, D1, D2, D3   // D0 = D3 + (D1 * D2)"
  },
  {
    name: "FMSUB",
    description: "Floating-point Fused Multiply-Subtract. Computes Dd = Da - (Dn * Dm) in a single rounding step.",
    syntax: "FMSUB <Sd|Dd>, <Sn|Dn>, <Sm|Dm>, <Sa|Da>",
    example: "FMSUB D0, D1, D2, D3   // D0 = D3 - (D1 * D2)"
  },
  {
    name: "FNEG",
    description: "Floating-point Negate. Flips the sign bit of a floating-point register and writes the result to the destination.",
    syntax: "FNEG <Sd|Dd>, <Sn|Dn>",
    example: "FNEG D0, D1"
  },
  {
    name: "FABS",
    description: "Floating-point Absolute Value. Clears the sign bit of a floating-point register and writes the result to the destination.",
    syntax: "FABS <Sd|Dd>, <Sn|Dn>",
    example: "FABS D0, D1"
  },
  {
    name: "FSQRT",
    description: "Floating-point Square Root. Computes the square root of a floating-point register and writes the result to the destination.",
    syntax: "FSQRT <Sd|Dd>, <Sn|Dn>",
    example: "FSQRT D0, D1"
  },
  {
    name: "FMAX",
    description: "Floating-point Maximum. Writes the numerically larger of two floating-point operands to the destination register (NaN-propagating).",
    syntax: "FMAX <Sd|Dd>, <Sn|Dn>, <Sm|Dm>",
    example: "FMAX D0, D1, D2"
  },
  {
    name: "FMIN",
    description: "Floating-point Minimum. Writes the numerically smaller of two floating-point operands to the destination register (NaN-propagating).",
    syntax: "FMIN <Sd|Dd>, <Sn|Dn>, <Sm|Dm>",
    example: "FMIN D0, D1, D2"
  },
  {
    name: "FCMP",
    description: "Floating-point Compare. Compares two floating-point registers (or a register and zero) and updates the NZCV condition flags.",
    syntax: "FCMP <Sn|Dn>, <Sm|Dm>  or  FCMP <Sn|Dn>, #0.0",
    example: "FCMP D0, D1\nB.GT greater_label"
  },
  {
    name: "FMOV",
    description: "Floating-point Move. Copies a value between FP registers, or between a general-purpose register and an FP register, or loads a small FP immediate.",
    syntax: "FMOV <Sd|Dd>, <Sn|Dn>  or  FMOV <Wd|Xd>, <Sn|Dn>  or  FMOV <Sd|Dd>, #<fpimm>",
    example: "FMOV D0, D1\nFMOV X0, D0\nFMOV D0, #1.0"
  },
  {
    name: "SCVTF",
    description: "Signed integer Convert to Floating-point. Converts a signed integer register value to a floating-point value in the destination register.",
    syntax: "SCVTF <Sd|Dd>, <Wn|Xn>",
    example: "SCVTF D0, X0"
  },
  {
    name: "UCVTF",
    description: "Unsigned integer Convert to Floating-point. Converts an unsigned integer register value to a floating-point value in the destination register.",
    syntax: "UCVTF <Sd|Dd>, <Wn|Xn>",
    example: "UCVTF D0, X0"
  },
  {
    name: "FCVTZS",
    description: "Floating-point Convert to Signed integer, rounding toward Zero. Converts an FP value to a signed integer in a general-purpose register (like a C-style (int) cast).",
    syntax: "FCVTZS <Wd|Xd>, <Sn|Dn>",
    example: "FCVTZS X0, D0"
  },
  {
    name: "FCVTZU",
    description: "Floating-point Convert to Unsigned integer, rounding toward Zero. Converts an FP value to an unsigned integer in a general-purpose register.",
    syntax: "FCVTZU <Wd|Xd>, <Sn|Dn>",
    example: "FCVTZU X0, D0"
  },
  {
    name: "FCVT",
    description: "Floating-point Convert precision. Converts a value between single-precision and double-precision formats.",
    syntax: "FCVT <Dd>, <Sn>  or  FCVT <Sd>, <Dn>",
    example: "FCVT D0, S0   // float -> double\nFCVT S0, D0   // double -> float"
  }
];

// ARM64 Condition Codes
// CMP/CMN/FCMP/SUBS 등이 세팅하는 NZCV 플래그를 기반으로 B.<cond>, CSEL, CSET 등에서 사용.
// N = Negative, Z = Zero, C = Carry, V = Overflow
const arm64ConditionCodes = [
  { name: "EQ", flags: "Z == 1", description: "Equal. True when the previous comparison's operands were equal (or subtraction result was zero).", example: "B.EQ label" },
  { name: "NE", flags: "Z == 0", description: "Not Equal. True when the previous comparison's operands were different.", example: "B.NE label" },
  { name: "CS / HS", flags: "C == 1", description: "Carry Set / Unsigned Higher or Same. True for an unsigned '>=' comparison.", example: "B.HS label" },
  { name: "CC / LO", flags: "C == 0", description: "Carry Clear / Unsigned Lower. True for an unsigned '<' comparison.", example: "B.LO label" },
  { name: "MI", flags: "N == 1", description: "Minus / Negative. True when the result of the previous operation was negative.", example: "B.MI label" },
  { name: "PL", flags: "N == 0", description: "Plus / Positive or zero. True when the result of the previous operation was non-negative.", example: "B.PL label" },
  { name: "VS", flags: "V == 1", description: "Overflow Set. True when the previous signed arithmetic operation overflowed.", example: "B.VS label" },
  { name: "VC", flags: "V == 0", description: "Overflow Clear. True when the previous signed arithmetic operation did not overflow.", example: "B.VC label" },
  { name: "HI", flags: "C == 1 && Z == 0", description: "Unsigned Higher. True for an unsigned '>' comparison.", example: "B.HI label" },
  { name: "LS", flags: "C == 0 || Z == 1", description: "Unsigned Lower or Same. True for an unsigned '<=' comparison.", example: "B.LS label" },
  { name: "GE", flags: "N == V", description: "Signed Greater than or Equal. True for a signed '>=' comparison.", example: "B.GE label" },
  { name: "LT", flags: "N != V", description: "Signed Less Than. True for a signed '<' comparison.", example: "B.LT label" },
  { name: "GT", flags: "Z == 0 && N == V", description: "Signed Greater Than. True for a signed '>' comparison. (Used in the C code: if (arr[j] > arr[j+1]))", example: "B.GT label" },
  { name: "LE", flags: "Z == 1 || N != V", description: "Signed Less than or Equal. True for a signed '<=' comparison.", example: "B.LE label" },
  { name: "AL", flags: "any", description: "Always. Condition is always true (rarely written explicitly; plain B is used instead).", example: "B.AL label" },
  { name: "NV", flags: "any", description: "Never (reserved encoding). Behaves identically to AL in practice; kept only for historical encoding completeness, should not be used.", example: "-- (reserved, avoid using)" },
];

module.exports = {
  arm64Instructions,
  arm64Registers,
  arm64FpSimdRegisters,
  arm64FpInstructions,
  arm64ConditionCodes
};
