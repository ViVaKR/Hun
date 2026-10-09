// =========================================================================
// 🏛️ Hun RISC-V (RV64GC) 표준 명령어 & 레지스터 대백과사전 (riscv-data.js)
// =========================================================================

// --- 1. RISC-V 핵심 명령어 및 의사명령어 (Pseudo-instructions) ---
const riscvInstructions = [
  // ---- 의사명령어 (Pseudo-instructions: 어셈블러 편의 마법) ----
  {
    name: "LI",
    description: "✓ Load Immediate (Pseudo-instruction). Loads a 32-bit or 64-bit constant into a register. The assembler automatically expands this into optimal combinations of LUI, ADDI, ADDIW, or SLLI depending on the value size.\n\n✓ 즉시값 적재 (의사명령어). 32비트 또는 64비트 정수 상수를 레지스터에 로드합니다. 상수의 크기에 따라 어셈블러가 lui, addi, slli 등의 최적 기계어 조합으로 자동 치환합니다.",
    syntax: "LI <rd>, <imm>",
    example: "LI a0, 100          // addi a0, zero, 100 으로 확장\nLI t0, 0x10000000   // lui t0, 0x10000 으로 확장 (UART 주소)"
  },
  {
    name: "LA",
    description: "✓ Load Address (Pseudo-instruction). Loads the address of a symbol into a register using PC-relative addressing (AUIPC + ADDI). Used to safely obtain symbol addresses in position-independent code (PIC).\n\n✓ 심볼 주소 로드 (의사명령어). 라벨(심볼)의 주소를 PC 상대 주소 계산(auipc + addi)을 통해 레지스터에 적재합니다. 위치 독립 코드(PIC)에서 안전하게 주소를 획득할 때 사용됩니다.",
    syntax: "LA <rd>, <symbol>",
    example: "LA a0, msg_hello   // auipc + addi 조합으로 라벨 주소 계산"
  },
  {
    name: "MV",
    description: "✓ Copy Register (Pseudo-instruction). Copies the value of one register to another. Expands to ADDI rd, rs, 0.\n\n✓ 레지스터 복사 (의사명령어). 한 레지스터의 값을 다른 레지스터로 복사합니다. 기계어로는 ADDI rd, rs, 0 으로 치환됩니다.",
    syntax: "MV <rd>, <rs>",
    example: "MV a0, s0          // s0의 값을 a0로 복사 (인자 전달 준비)"
  },
  {
    name: "NOP",
    description: "✓ No Operation (Pseudo-instruction). Consumes an instruction slot without altering architectural state. Expands to ADDI zero, zero, 0.\n\n✓ 무동작 (의사명령어). CPU 상태를 바꾸지 않고 명령어 1사이클을 소비합니다. ADDI zero, zero, 0 으로 치환됩니다.",
    syntax: "NOP",
    example: "NOP"
  },
  {
    name: "J",
    description: "✓ Unconditional Jump (Pseudo-instruction). Unconditionally jumps to a target label. Expands to JAL zero, <offset> (discards the return address).\n\n✓ 무조건 분기 (의사명령어). 지정한 라벨로 즉시 무조건 점프합니다. 복귀 주소를 zero 레지스터에 버리는 JAL zero, offset 으로 치환됩니다.",
    syntax: "J <label>",
    example: "J .L_loop_start"
  },
  {
    name: "JR",
    description: "✓ Jump to Register (Pseudo-instruction). Branches to the target address stored in a register without saving a return address. Expands to JALR zero, 0(rs).\n\n✓ 레지스터 기반 분기 (의사명령어). 레지스터에 담긴 동적 주소로 점프합니다. JALR zero, 0(rs) 로 치환됩니다.",
    syntax: "JR <rs>",
    example: "JR t0"
  },
  {
    name: "RET",
    description: "✓ Return from Subroutine (Pseudo-instruction). Returns from a function by jumping to the return address held in the ra(x1) register. Expands to JALR zero, 0(ra).\n\n✓ 서브루틴 복귀 (의사명령어). 현재 함수를 종료하고 ra(x1, 링크 레지스터)에 담긴 호출부로 복귀합니다. JALR zero, 0(ra) 로 치환됩니다.",
    syntax: "RET",
    example: "RET"
  },
  {
    name: "CALL",
    description: "✓ Call Subroutine (Pseudo-instruction). Calls a distant subroutine by calculating a PC-relative offset, saving the return address into ra(x1). Expands to AUIPC ra, offset_hi + JALR ra, offset_lo(ra).\n\n✓ 원거리 함수 호출 (의사명령어). PC 상대 주소를 계산하여 먼 거리의 함수를 호출하고 복귀 주소를 ra 레지스터에 저장합니다. auipc + jalr 쌍으로 치환됩니다.",
    syntax: "CALL <symbol>",
    example: "CALL uart_put_hex"
  },
  {
    name: "TAIL",
    description: "✓ Tail Call (Pseudo-instruction). Performs a tail-call optimization by jumping to another function without modifying ra(x1), allowing the callee to return directly to the original caller.\n\n✓ 꼬리 호출 (의사명령어). ra 레지스터를 덮어쓰지 않고 다른 함수로 제어를 넘겨, 호출된 함수가 최초 호출자에게 직접 복귀할 수 있게 최적화합니다.",
    syntax: "TAIL <symbol>",
    example: "TAIL next_handler"
  },
  {
    name: "BEQZ",
    description: "✓ Branch if Equal to Zero (Pseudo-instruction). Branches to the label if the register value is 0. Expands to BEQ rs, zero, <offset>.\n\n✓ 0과 같으면 분기 (의사명령어). 레지스터 값이 0일 때 지정한 라벨로 점프합니다. BEQ rs, zero, offset 으로 치환됩니다.",
    syntax: "BEQZ <rs>, <label>",
    example: "BEQZ a0, .L_exit"
  },
  {
    name: "BNEZ",
    description: "✓ Branch if Not Equal to Zero (Pseudo-instruction). Branches to the label if the register value is non-zero. Expands to BNE rs, zero, <offset>.\n\n✓ 0이 아니면 분기 (의사명령어). 레지스터 값이 0이 아닐 때 지정한 라벨로 점프합니다. BNE rs, zero, offset 으로 치환됩니다.",
    syntax: "BNEZ <rs>, <label>",
    example: "BNEZ t0, .L_loop"
  },

  // ---- 기본 산술 / 논리 연산 (Base Integer Arithmetic) ----
  {
    name: "ADDI",
    description: "✓ Add Immediate. Adds a sign-extended 12-bit immediate to a register. The immediate must be in the range -2048 to +2047.\n\n✓ 즉시값 덧셈. 레지스터 값에 12비트 부호 있는 즉시값(-2048 ~ +2047)을 더하여 대상 레지스터에 저장합니다.",
    syntax: "ADDI <rd>, <rs1>, <imm12>",
    example: "ADDI sp, sp, -16     // 스택 프레임 16바이트 할당\nADDI a0, zero, 42"
  },
  {
    name: "ADD",
    description: "✓ Add. Adds two registers and writes the result to the destination register.\n\n✓ 레지스터 덧셈. 두 레지스터 값을 더하여 결과를 대상 레지스터에 저장합니다.",
    syntax: "ADD <rd>, <rs1>, <rs2>",
    example: "ADD a0, a1, a2"
  },
  {
    name: "SUB",
    description: "✓ Subtract. Subtracts rs2 from rs1 and writes the result to the destination register. Note: there is no SUBI in RISC-V; use ADDI with a negative immediate instead.\n\n✓ 레지스터 뺄셈. rs1에서 rs2를 뺀 결과를 대상 레지스터에 씁니다. 주의: RISC-V에는 subi 명령어가 없으며 addi에 음수를 넣어 뺄셈을 대신합니다.",
    syntax: "SUB <rd>, <rs1>, <rs2>",
    example: "SUB t0, t1, t2"
  },
  {
    name: "ADDIW",
    description: "✓ Add Immediate Word (RV64). Adds a 12-bit immediate to the low 32 bits of rs1, and sign-extends the 32-bit result to 64 bits.\n\n✓ 32비트 즉시값 덧셈 (RV64 전용). rs1의 하위 32비트에 즉시값을 더한 뒤, 결과 32비트 값을 64비트로 부호 확장하여 대상 레지스터에 저장합니다.",
    syntax: "ADDIW <rd>, <rs1>, <imm12>",
    example: "ADDIW a0, a0, 1"
  },
  {
    name: "ADDW",
    description: "✓ Add Word (RV64). Adds the low 32 bits of two registers and sign-extends the result to 64 bits. Corresponds to 32-bit int arithmetic in C.\n\n✓ 32비트 덧셈 (RV64 전용). 두 레지스터의 하위 32비트끼리 더하고 결과를 64비트로 부호 확장합니다. C 언어의 32비트 int 연산에 대응합니다.",
    syntax: "ADDW <rd>, <rs1>, <rs2>",
    example: "ADDW a0, a1, a2"
  },
  {
    name: "LUI",
    description: "✓ Load Upper Immediate. Loads a 20-bit immediate into the upper 20 bits of the destination register (bits 31:12), zeroing the lower 12 bits and sign-extending bit 31 into the upper 32 bits on RV64.\n\n✓ 상위 즉시값 로드. 20비트 즉시값을 대상 레지스터의 상위 20비트(31:12)에 적재하고 하위 12비트는 0으로 채웁니다.",
    syntax: "LUI <rd>, <imm20>",
    example: "LUI t0, 0x10000"
  },
  {
    name: "AUIPC",
    description: "✓ Add Upper Immediate to PC. Adds a 20-bit upper immediate (shifted left by 12) to the current PC and writes the result to rd. The core building block of position-independent addressing (LA, CALL).\n\n✓ PC에 상위 즉시값 더하기. 현재 PC 값에 12비트 좌측 시프트된 20비트 상수를 더하여 레지스터에 저장합니다. 위치 독립 주소 계산(la, call)의 핵심 기초 블록입니다.",
    syntax: "AUIPC <rd>, <imm20>",
    example: "AUIPC a0, %pcrel_hi(symbol)"
  },

  // ---- 메모리 로드 / 스토어 (Load & Store) ----
  {
    name: "LD",
    description: "✓ Load Doubleword (RV64). Loads a 64-bit value (8 bytes) from memory at address (rs1 + sign-extended offset).\n\n✓ 64비트 더블워드 적재 (RV64). 메모리 주소 [rs1 + 오프셋] 위치에서 8바이트를 읽어 대상 레지스터에 저장합니다.",
    syntax: "LD <rd>, <offset12>(<rs1>)",
    example: "LD ra, 8(sp)         // 스택에서 복귀 주소 복원\nLD s0, 0(sp)"
  },
  {
    name: "SD",
    description: "✓ Store Doubleword (RV64). Stores a 64-bit value (8 bytes) from rs2 into memory at address (rs1 + sign-extended offset).\n\n✓ 64비트 더블워드 저장 (RV64). rs2의 8바이트 값을 메모리 주소 [rs1 + 오프셋] 위치에 씁니다.",
    syntax: "SD <rs2>, <offset12>(<rs1>)",
    example: "SD ra, 8(sp)         // 스택에 복귀 주소 저장\nSD s0, 0(sp)"
  },
  {
    name: "LW",
    description: "✓ Load Word. Loads a 32-bit word (4 bytes) from memory and sign-extends it to 64 bits on RV64.\n\n✓ 32비트 워드 적재. 메모리에서 4바이트를 읽어 대상 레지스터에 적재하며, RV64에서는 64비트로 부호 확장됩니다.",
    syntax: "LW <rd>, <offset12>(<rs1>)",
    example: "LW a0, 0(t0)"
  },
  {
    name: "SW",
    description: "✓ Store Word. Stores the lower 32 bits (4 bytes) of rs2 into memory at address (rs1 + offset).\n\n✓ 32비트 워드 저장. rs2 레지스터의 하위 4바이트를 메모리 [rs1 + 오프셋] 위치에 씁니다.",
    syntax: "SW <rs2>, <offset12>(<rs1>)",
    example: "SW a0, 0(t0)"
  },
  {
    name: "LB",
    description: "✓ Load Byte. Loads a single byte (8 bits) from memory and sign-extends it to the register width.\n\n✓ 바이트 적재 (부호 확장). 메모리에서 1바이트를 읽어 레지스터 전체 폭으로 부호 확장하여 채웁니다.",
    syntax: "LB <rd>, <offset12>(<rs1>)",
    example: "LB t0, 0(a0)"
  },
  {
    name: "LBU",
    description: "✓ Load Byte Unsigned. Loads a single byte (8 bits) from memory and zero-extends it.\n\n✓ 바이트 적재 (부호 없음). 메모리에서 1바이트를 읽어 상위 비트를 0으로 채워 레지스터에 저장합니다.",
    syntax: "LBU <rd>, <offset12>(<rs1>)",
    example: "LBU a0, 0(t0)        // ASCII 문자 1개 읽기"
  },
  {
    name: "SB",
    description: "✓ Store Byte. Stores the lowest byte (8 bits) of rs2 into memory. Commonly used for UART MMIO character output.\n\n✓ 바이트 저장. rs2 레지스터의 최하위 1바이트를 메모리에 씁니다. 베어메탈 UART 문자 출력에 가장 많이 쓰입니다.",
    syntax: "SB <rs2>, <offset12>(<rs1>)",
    example: "SB a0, 0(t0)         // UART FIFO 데이터 레지스터에 1바이트 전송"
  },

  // ---- 조건부 분기 (Branches: no flags!) ----
  {
    name: "BEQ",
    description: "✓ Branch if Equal. Compares rs1 and rs2 directly, branching to the target label if equal. (No condition flag register needed!)\n\n✓ 두 레지스터가 같으면 분기. rs1과 rs2를 직접 비교하여 같을 경우 라벨로 점프합니다. (NZCV 같은 상태 플래그 레지스터가 필요 없습니다!)",
    syntax: "BEQ <rs1>, <rs2>, <label>",
    example: "BEQ a0, a1, .L_match"
  },
  {
    name: "BNE",
    description: "✓ Branch if Not Equal. Branches to the label if rs1 != rs2.\n\n✓ 두 레지스터가 다르면 분기. rs1과 rs2가 서로 다를 경우 라벨로 점프합니다.",
    syntax: "BNE <rs1>, <rs2>, <label>",
    example: "BNE a0, zero, .L_not_null"
  },
  {
    name: "BLT",
    description: "✓ Branch if Less Than (signed). Branches to the label if rs1 < rs2 (signed comparison).\n\n✓ 작으면 분기 (부호 있음). 부호 있는 비교를 수행하여 rs1 < rs2 일 때 라벨로 점프합니다.",
    syntax: "BLT <rs1>, <rs2>, <label>",
    example: "BLT a0, a1, .L_smaller"
  },
  {
    name: "BGE",
    description: "✓ Branch if Greater or Equal (signed). Branches to the label if rs1 >= rs2 (signed comparison).\n\n✓ 크거나 같으면 분기 (부호 있음). 부호 있는 비교를 수행하여 rs1 >= rs2 일 때 라벨로 점프합니다.",
    syntax: "BGE <rs1>, <rs2>, <label>",
    example: "BGE a0, a1, .L_loop"
  },

  // ---- 시스템 & 제어 / 상태 레지스터 (CSR & System) ----
  {
    name: "ECALL",
    description: "✓ Environment Call. Makes a service request to the execution environment (Operating System, Hypervisor, or M-mode Machine firmware). Equivalent to ARM64's SVC/HVC/SMC.\n\n✓ 환경 호출. 실행 환경(OS 커널, 하이퍼바이저, 머신 모드 펌웨어)에 시스템 콜 서비스를 요청합니다. ARM64의 SVC/HVC/SMC에 대응합니다.",
    syntax: "ECALL",
    example: "LI a7, 64           // Linux write syscall 번호\nECALL"
  },
  {
    name: "EBREAK",
    description: "✓ Environment Breakpoint. Traps to a debugger. Equivalent to ARM64's BRK.\n\n✓ 브레이크포인트 트랩. 디버거에 제어를 넘겨 실행을 일시 중단합니다. ARM64의 BRK에 대응합니다.",
    syntax: "EBREAK",
    example: "EBREAK"
  },
  {
    name: "CSRR",
    description: "✓ Read Control and Status Register (Pseudo-instruction). Reads the value of a CSR into a general-purpose register. Expands to CSRRS rd, csr, zero.\n\n✓ CSR 읽기 (의사명령어). 특권 제어/상태 레지스터(mstatus, mtvec 등)의 값을 범용 레지스터로 읽어옵니다. CSRRS rd, csr, zero 로 치환됩니다.",
    syntax: "CSRR <rd>, <csr>",
    example: "CSRR t0, mstatus     // 머신 상태 레지스터 읽기"
  },
  {
    name: "CSRW",
    description: "✓ Write Control and Status Register (Pseudo-instruction). Overwrites a CSR with the value of a general-purpose register. Expands to CSRRW zero, csr, rs.\n\n✓ CSR 쓰기 (의사명령어). 범용 레지스터의 값으로 특권 제어/상태 레지스터를 덮어씁니다. CSRRW zero, csr, rs 로 치환됩니다.",
    syntax: "CSRW <csr>, <rs>",
    example: "CSRW mtvec, t0       // 트랩 핸들러 벡터 주소 등록"
  },
  {
    name: "CSRS",
    description: "✓ Set bits in CSR (Pseudo-instruction). Bitwise ORs the mask in rs into the specified CSR (sets designated bits to 1).\n\n✓ CSR 비트 세트 (의사명령어). rs 레지스터의 비트마스크를 지정한 CSR에 OR 연산하여 특정 비트들을 1로 켭니다.",
    syntax: "CSRS <csr>, <rs>",
    example: "CSRS mstatus, t1     // 인터럽트 활성화 비트 세팅"
  },
  {
    name: "CSRC",
    description: "✓ Clear bits in CSR (Pseudo-instruction). Clears bits in the CSR corresponding to 1s in rs.\n\n✓ CSR 비트 클리어 (의사명령어). rs 레지스터에서 1로 지정된 비트들을 해당 CSR에서 0으로 지웁니다.",
    syntax: "CSRC <csr>, <rs>",
    example: "CSRC mstatus, t1"
  }
];

// --- 2. RISC-V 32개 범용 레지스터 (ABI 이름 & Xn 번호 통합 매핑) ---
const riscvRegisters = [
  {
    name: "ZERO", alt: "X0",
    description: "✓ Hardwired Zero. Always evaluates to 0; any value written to it is discarded. Essential building block for NOP, J, and MV.\n\n✓ 하드웨어 고정 영(0). 영구히 0으로 고정된 읽기 전용 레지스터입니다. 쓰기는 무시되며 NOP, 점프, 복사 등 온갖 의사명령어의 재료가 됩니다.",
    type: "Constant 0 (Read-only)"
  },
  {
    name: "RA", alt: "X1",
    description: "✓ Return Address. Stores the return address when calling a subroutine with JAL or CALL. Must be saved on the stack in functions that make calls.\n\n✓ 복귀 주소(링크 레지스터). JAL이나 CALL 명령어로 함수를 호출할 때 돌아올 주소가 자동으로 저장됩니다. 다른 함수를 호출하는 non-leaf 함수는 스택에 보존해야 합니다.",
    type: "Return Address (Caller-saved)"
  },
  {
    name: "SP", alt: "X2",
    description: "✓ Stack Pointer. Points to the current top of the stack. Must be kept 16-byte aligned at function entry on RV64 standard ABI.\n\n✓ 스택 포인터. 현재 스택 메모리의 최상단을 가리킵니다. RV64 표준 ABI 규격상 함수 진입 경계에서 항상 16바이트 정렬을 유지해야 합니다.",
    type: "Stack Pointer (Callee-saved)"
  },
  {
    name: "GP", alt: "X3",
    description: "✓ Global Pointer. Points to the middle of the small-data section (.sdata/.sbss, offset +0x800). Used by linker relaxation to access global variables using a single 12-bit offset instruction.\n\n✓ 전역 포인터. 소형 데이터 영역(.sdata)의 중심부를 가리킵니다. 링커 릴랙세이션(Relaxation) 최적화를 통해 전역 변수를 단 1개 명령어로 빠르게 접근할 때 기준점이 됩니다.",
    type: "Global Pointer (Unallocatable)"
  },
  {
    name: "TP", alt: "X4",
    description: "✓ Thread Pointer. Holds a pointer to the thread-local storage (TLS) block for the currently active thread.\n\n✓ 스레드 포인터. 현재 활성화된 스레드의 스레드 로컬 스토리지(TLS) 블록을 가리킵니다.",
    type: "Thread Pointer (Unallocatable)"
  },
  {
    name: "T0", alt: "X5",
    description: "✓ Temporary Register 0 / Alternate Link Register. Caller-saved scratchpad register; free for local calculations.\n\n✓ 임시 레지스터 0. 자유롭게 쓸 수 있는 스크래치 레지스터(Caller-saved)입니다. 함수 호출 시 값이 보존되지 않습니다.",
    type: "Temporary (Caller-saved)"
  },
  {
    name: "T1", alt: "X6",
    description: "✓ Temporary Register 1. Caller-saved scratchpad register.\n\n✓ 임시 레지스터 1. 지역 계산용 임시 레지스터입니다.",
    type: "Temporary (Caller-saved)"
  },
  {
    name: "T2", alt: "X7",
    description: "✓ Temporary Register 2. Caller-saved scratchpad register.\n\n✓ 임시 레지스터 2. 지역 계산용 임시 레지스터입니다.",
    type: "Temporary (Caller-saved)"
  },
  {
    name: "S0", alt: "X8",
    description: "✓ Saved Register 0 / Frame Pointer (FP). Callee-saved. When used as a Frame Pointer, points to the base of the current stack frame for debugging and local variable tracking.\n\n✓ 보존 레지스터 0 / 프레임 포인터(FP). Callee-saved. 프레임 포인터로 쓰일 때는 현재 스택 프레임의 바닥 주소를 가리켜 디버깅 및 지역 변수 오프셋 계산의 기준점이 됩니다.",
    type: "Saved / Frame Pointer (Callee-saved)"
  },
  {
    name: "FP", alt: "S0",
    description: "✓ Frame Pointer. Alias for s0(x8). Points to the base of the stack frame.\n\n✓ 프레임 포인터. s0(x8)의 별칭입니다. 스택 프레임의 기준점을 담습니다.",
    type: "Frame Pointer (Callee-saved)"
  },
  {
    name: "S1", alt: "X9",
    description: "✓ Saved Register 1. Callee-saved; must be preserved by the called function across calls.\n\n✓ 보존 레지스터 1. Callee-saved 레지스터로, 함수 내부에서 사용할 경우 스택에 백업/복원하여 호출 전 값을 보존해야 합니다.",
    type: "Saved Register (Callee-saved)"
  },
  {
    name: "A0", alt: "X10",
    description: "✓ Function Argument 1 / Primary Return Value. Holds the first argument passed into a function, and receives the main return value when the function exits.\n\n✓ 함수 인자 1 / 주 반환값. 함수를 호출할 때 첫 번째 매개변수를 담고, 함수가 종료될 때 결과 반환값을 담아 나옵니다.",
    type: "Argument / Return Value"
  },
  {
    name: "A1", alt: "X11",
    description: "✓ Function Argument 2 / Secondary Return Value. Holds the second argument, and holds the upper half of a 128-bit return value together with a0.\n\n✓ 함수 인자 2 / 보조 반환값. 두 번째 매개변수를 담으며, 128비트 반환값의 상위 절반을 담기도 합니다.",
    type: "Argument / Return Value"
  },
  {
    name: "A2", alt: "X12",
    description: "✓ Function Argument 3.\n\n✓ 함수 세 번째 매개변수 전달 레지스터입니다.",
    type: "Function Argument (Caller-saved)"
  },
  {
    name: "A3", alt: "X13",
    description: "✓ Function Argument 4.\n\n✓ 함수 네 번째 매개변수 전달 레지스터입니다.",
    type: "Function Argument (Caller-saved)"
  },
  {
    name: "A4", alt: "X14",
    description: "✓ Function Argument 5.\n\n✓ 함수 다섯 번째 매개변수 전달 레지스터입니다.",
    type: "Function Argument (Caller-saved)"
  },
  {
    name: "A5", alt: "X15",
    description: "✓ Function Argument 6.\n\n✓ 함수 여섯 번째 매개변수 전달 레지스터입니다.",
    type: "Function Argument (Caller-saved)"
  },
  {
    name: "A6", alt: "X16",
    description: "✓ Function Argument 7.\n\n✓ 함수 일곱 번째 매개변수 전달 레지스터입니다.",
    type: "Function Argument (Caller-saved)"
  },
  {
    name: "A7", alt: "X17",
    description: "✓ Function Argument 8 / Syscall ID. Holds the eighth function argument, or the system call service number when issuing an ECALL.\n\n✓ 함수 인자 8 / 시스템 콜 번호. 여덟 번째 매개변수 전달용이며, ECALL 실행 시 리눅스 커널 시스템 콜 번호(예: 64=write)를 전달하는 용도로 쓰입니다.",
    type: "Argument / Syscall ID"
  },
  {
    name: "S2", alt: "X18",
    description: "✓ Saved Register 2. Callee-saved.\n\n✓ 보존 레지스터 2. Callee-saved (스택에 저장 후 복원 필수).",
    type: "Saved Register (Callee-saved)"
  },
  {
    name: "S3", alt: "X19",
    description: "✓ Saved Register 3. Callee-saved.\n\n✓ 보존 레지스터 3. Callee-saved.",
    type: "Saved Register (Callee-saved)"
  },
  {
    name: "S4", alt: "X20",
    description: "✓ Saved Register 4. Callee-saved.\n\n✓ 보존 레지스터 4. Callee-saved.",
    type: "Saved Register (Callee-saved)"
  },
  {
    name: "S5", alt: "X21",
    description: "✓ Saved Register 5. Callee-saved.\n\n✓ 보존 레지스터 5. Callee-saved.",
    type: "Saved Register (Callee-saved)"
  },
  {
    name: "S6", alt: "X22",
    description: "✓ Saved Register 6. Callee-saved.\n\n✓ 보존 레지스터 6. Callee-saved.",
    type: "Saved Register (Callee-saved)"
  },
  {
    name: "S7", alt: "X23",
    description: "✓ Saved Register 7. Callee-saved.\n\n✓ 보존 레지스터 7. Callee-saved.",
    type: "Saved Register (Callee-saved)"
  },
  {
    name: "S8", alt: "X24",
    description: "✓ Saved Register 8. Callee-saved.\n\n✓ 보존 레지스터 8. Callee-saved.",
    type: "Saved Register (Callee-saved)"
  },
  {
    name: "S9", alt: "X25",
    description: "✓ Saved Register 9. Callee-saved.\n\n✓ 보존 레지스터 9. Callee-saved.",
    type: "Saved Register (Callee-saved)"
  },
  {
    name: "S10", alt: "X26",
    description: "✓ Saved Register 10. Callee-saved.\n\n✓ 보존 레지스터 10. Callee-saved.",
    type: "Saved Register (Callee-saved)"
  },
  {
    name: "S11", alt: "X27",
    description: "✓ Saved Register 11. Callee-saved.\n\n✓ 보존 레지스터 11. Callee-saved.",
    type: "Saved Register (Callee-saved)"
  },
  {
    name: "T3", alt: "X28",
    description: "✓ Temporary Register 3. Caller-saved scratchpad.\n\n✓ 임시 레지스터 3. Caller-saved 스크래치 레지스터입니다.",
    type: "Temporary (Caller-saved)"
  },
  {
    name: "T4", alt: "X29",
    description: "✓ Temporary Register 4. Caller-saved scratchpad.\n\n✓ 임시 레지스터 4. Caller-saved 스크래치 레지스터입니다.",
    type: "Temporary (Caller-saved)"
  },
  {
    name: "T5", alt: "X30",
    description: "✓ Temporary Register 5. Caller-saved scratchpad.\n\n✓ 임시 레지스터 5. Caller-saved 스크래치 레지스터입니다.",
    type: "Temporary (Caller-saved)"
  },
  {
    name: "T6", alt: "X31",
    description: "✓ Temporary Register 6. Caller-saved scratchpad.\n\n✓ 임시 레지스터 6. Caller-saved 스크래치 레지스터입니다.",
    type: "Temporary (Caller-saved)"
  }
];

// --- 3. 베어메탈 핵심 CSR (Control and Status Registers) ---
const riscvCsrRegisters = [
  {
    name: "MSTATUS",
    description: "✓ Machine Status Register. Tracks and controls processor operating state, interrupt enables (MIE), previous privilege mode (MPP), and floating-point unit status.\n\n✓ 머신 상태 레지스터 (M-Mode). CPU 동작 모드, 글로벌 인터럽트 허용 여부(MIE), 직전 특권 모드(MPP), FPU 상태 등을 총괄 통제합니다.",
    type: "Machine CSR (0x300)"
  },
  {
    name: "MTVEC",
    description: "✓ Machine Trap-Vector Base-Address Register. Holds the base address of the exception / interrupt handler. Mode bits determine direct or vectored dispatch.\n\n✓ 머신 트랩 벡터 베이스 주소 레지스터. 트랩/인터럽트 발생 시 CPU가 점프할 공용 예외 처리 핸들러 함수의 시작 주소를 담습니다.",
    type: "Machine CSR (0x305)"
  },
  {
    name: "MEPC",
    description: "✓ Machine Exception Program Counter. Holds the virtual address of the instruction that caused the trap, or the instruction interrupted. Restored on MRET.\n\n✓ 머신 예외 복귀 주소 레지스터. 트랩이 발생한 순간의 실행 중이던 명령어 주소가 보존되며, MRET 복귀 시 이 주소로 되돌아갑니다.",
    type: "Machine CSR (0x341)"
  },
  {
    name: "MCAUSE",
    description: "✓ Machine Cause Register. Identifies the reason for the trap (top bit = interrupt flag, lower bits = exception code like ecall, page fault, etc.).\n\n✓ 머신 예외 원인 레지스터. 최상위 비트는 하드웨어 인터럽트 여부를, 나머지 하위 비트는 발생한 트랩의 세부 사유 코드(시스템콜, 정렬 오류 등)를 나타냅니다.",
    type: "Machine CSR (0x342)"
  },
  {
    name: "MIE",
    description: "✓ Machine Interrupt Enable Register. Contains individual enable bits for software, timer, and external interrupts.\n\n✓ 머신 개별 인터럽트 허용 레지스터. 소프트웨어, 타이머, 외부 장치(UART 등) 인터럽트의 활성화 스위치 비트들을 담고 있습니다.",
    type: "Machine CSR (0x304)"
  },
  {
    name: "MIP",
    description: "✓ Machine Interrupt Pending Register. Shows which interrupts are currently pending hardware service.\n\n✓ 머신 인터럽트 대기 레지스터. 현재 어떤 하드웨어 인터럽트 신호가 들어와 처리를 기다리고 있는지 상태를 보여줍니다.",
    type: "Machine CSR (0x344)"
  }
];

module.exports = {
  riscvInstructions,
  riscvRegisters,
  riscvCsrRegisters
};
