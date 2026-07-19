# vscode code snippets

## snippets list

```json
{
  "Init Hun": {
    "scope": "hun-asm",
    "prefix": "_huninit",
    "body": [
      ".include \"section_macros.inc\"",
      ".global $1",
      "BSS_SECTION",
      "CONST_DATA_SECTION",
      "DATA_SECTION",
      "CONST_SECTION",
      "CSTRING_SECTION",
      "CODE_SECTION",
      "${1}:",
      "\t// 프롤로그",
      "\tstp x29, x30, [sp, #-48]!",
      "\tmov x29, sp",
      "\tstp x19, x20, [sp, #16]",
      "",
      "\t$0",
      "",
      "\t// 에필로그",
      "\tldp x19, x20, [sp, #16]",
      "\tmov x0, #0",
      "\tldp x29, x30, [sp], #48",
      "\tret",
    ],
    "include": ["**/*.S", "**/*.s", "**/*.asm"],
    "description": "Hun Asm Intialization",
  },
  "Create Prologue": {
    "scope": "hun-asm",
    "prefix": "_plg",
    "body": ["stp x29, x30, [sp, ${1:#-16}]!$0"],
    "include": ["**/*.S", "**/*.s", "**/*.asm"],
    "description": "프롤로그 만들기",
  },
  "Create Eplilogue": {
    "scope": "hun-asm",
    "prefix": "_epg",
    "body": ["ldp x29, x30, [sp], ${1:#16}"],
    "include": ["**/*.S", "**/*.s", "**/*.asm"],
    "description": "에필로그 만들기",
  },
}

```