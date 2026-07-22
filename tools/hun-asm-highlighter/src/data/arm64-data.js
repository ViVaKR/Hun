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
  }
];

// ARM64 Registers
const arm64Registers = [
  { name: "X0", description: "64-bit general purpose register. Used for parameter 1 and return values.", type: "General Purpose / Argument / Return Value" },
  { name: "X1", description: "64-bit general purpose register. Parameter 2.", type: "General Purpose / Argument" },
  { name: "X2", description: "64-bit general purpose register. Parameter 3.", type: "General Purpose / Argument" },
  { name: "X29", description: "Frame Pointer (FP). Used to point to the base of the current stack frame.", type: "Frame Pointer" },
  { name: "X30", description: "Link Register (LR). Stores the return address for BL and BLR.", type: "Link Register" },
  { name: "SP", description: "Stack Pointer. Points to the current top of the stack.", type: "Stack Pointer" },
  { name: "XZR", description: "Zero Register. Always returns the value 0 and discards any writes.", type: "Zero Register" }
];

module.exports = {
  arm64Instructions,
  arm64Registers
};