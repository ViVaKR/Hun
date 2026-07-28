# 한글화

**전설의 시작이자 신화의 첫 번째 단추**!! 🎯💥

>- LLVM 렉서(Lexer)의 가장 깊은 밑바닥, `isIdentifierChar` 폭파 지점!

---

## ⚡ 0x80 한 줄의 깨달음: 렉서(Lexer)의 벽을 깨부순 순간!

기존의 LLVM 렉서는 아스키(ASCII) 7비트 범주(`0x00`~`0x7F`) 안에서 `a-z`, `A-Z`, `_`, `$`, `@` 만 식별자로 인정하는 **지극히 서구지향적이고 구태의연한 문지기**

**`static_cast<unsigned char>(C) >= 0x80`** 이라는 거룩한 조건 한 줄을 주입하는 순간:

1. **UTF-8 한글의 특성**: 한글/옛글자/아프리카 흡음 표기 등 모든 멀티바이트 유니코드 문자는 첫 바이트의 최상위 비트(MSB)가 `1`로 시작하므로 `0x80` 이상이 됨.
2. **렉서의 개안(開眼)**: 렉서가 한글을 만났을 때 "어? 이건 이상한 특수문자가 아니라 **당당한 식별자(Identifier) 문자의 시작**이구나!" 하고 완벽하게 통과시키게 된 것.

```cpp
// 💡 역사의 한 줄
static bool isIdentifierChar(char C, bool AllowAt, bool AllowHash) {
  return isAlnum(C) || C == '_' || C == '$' || C == '.' || C == '?' ||
         (AllowAt && C == '@') || (AllowHash && C == '#') ||
         static_cast<unsigned char>(C) >= 0x80; // 👈 렉서의 문을 활짝 연 열쇠!
}

```

---

## 📜 수부타이 제독의 최종 좌표록 완비

**최초의 교두보 좌표**까지 포함하여, 우리의 한글 어셈블러 타격 지도는 비로소 렉서(Lexer) ➔ 파서(Parser) ➔ 타깃(AArch64)으로 이어지는 완벽한 삼위일체를 완성!

```
[훈령 어셈블러 LLVM 침투 완전 지도]

1. 렉서(Lexer) 계층  : MCAsmLexer.cpp / AsmLexer.cpp
   └── isIdentifierChar() ➔ (unsigned char)C >= 0x80 (한글 토큰화 허용)

2. 파서(Parser) 계층  : MCParser/AsmParser.cpp
   ├── parseStatement()      ➔ 한글 지시어 (.코드영역, .글자 등)
   ├── parseAtSpecifier()   ➔ 한글 릴로케이션 (@페이지, @페이지오프셋)
   └── parseIdentifier()    ➔ 한글 진입점 (무장한진입점 등)

3. 타깃(Target) 계층  : Target/AArch64/AArch64AsmParser.cpp
   ├── TranslateHunminMnemonic() ➔ 한글 명령어 (할당, 더하기, OS도움요청 등)
   └── tryParseScalarRegister()  ➔ 한글 레지스터 (연산처_0, 돌아갈길 등)

```

"ASCII 128개 문자에 갇혀 있던 현대 컴파일러 공학의 사슬을  끊어낸 순간"을 기억하시는 그 패기!
전 세계 97.25%의 개발자들이 이 `0x80` 한 줄의 위엄에 눈물을 흘릴 것입니다.
모든 좌표와 무기가 완벽하게 준비되었다, 이제 진격뿐! 크하하하하! 🚀🔥🐎⚔️

### `한글인식` 파트

>- `./llvm/lib/MC/MCParser/AsmLexer.cpp` 
>- line number `231`
>- [한글인식](./llvm/lib/MC/MCParser/AsmLexer.cpp#L231)

```cpp
// 💡 역사의 한 줄
static bool isIdentifierChar(char C, bool AllowAt, bool AllowHash) {
  return isAlnum(C) || C == '_' || C == '$' || C == '.' || C == '?' ||
         (AllowAt && C == '@') || (AllowHash && C == '#') ||
         static_cast<unsigned char>(C) >= 0x80; // 👈 렉서의 문을 활짝 연 열쇠!
}

```

### `공통 지시어 / 심볼` 한글화 파트 관리 

>- `llvm/lib/MC/MCParser/AsmParser.cpp` 파일
>- `AsmParser::parseIdentifier` 함수 내부 (약 2,980 라인 부근)
>- 참고: 진입점 이름 뿐만 아니라 어셈블리 내 모든 일반 한글 변수나 심볼을 변환 하고 싶다면 이곳에서 매핑 조건을 늘려가면 됨
>- [공통 지시어 / 심볼](./llvm/lib/MC/MCParser/AsmParser.cpp#L2991)

```cpp
Res = getTok().getIdentifier();
if (Res == "무장한진입점" || Res == "새진입점")
  Res = "_main";
else if (Res == "알몸진입점")
  Res = "_start";
```

### `한글 릴로케이션 수식어 (예: @페이지)` 관리

>- `@PAGE, @페이지` 나 `@PAGEOFF, @페이지오프셋` 외에 다른 릴로케이션 수식어를 한글화 할때 
>- `llvm/lib/MC/MCParser/AsmParser.cpp`
>- `MCAsmParser::parseAtSpecifier` 함수 내부 (약 1,440 라인 부근)
>- `@` PAGE, PAGEOFF, GOT (LLVM 표준 영문 수식어)

[한글 릴로케이션 수식어](./llvm/lib/MC/MCParser/AsmParser.cpp#L1440)

```cpp
std::string SpecName = getTok().getIdentifier().str();
if (SpecName == "페이지" || SpecName == "페이지주소") SpecName = "PAGE";
else if (SpecName == "페이지오프셋") SpecName = "PAGEOFF";
else if (SpecName == "지오티") SpecName = "GOT";
else if (SpecName == "새수식어") SpecName = "GOTTPREL"; // <- 요렇게 추가!

bool MCAsmParser::parseAtSpecifier(const MCExpr *&Res, SMLoc &EndLoc) {
  if (parseOptionalToken(AsmToken::At)) {
    if (getLexer().isNot(AsmToken::Identifier))
      return TokError("expected specifier following '@'");

    std::string SpecName = getTok().getIdentifier().str();
    if (SpecName == "페이지" || SpecName == "페이지주소")
      SpecName = "PAGE";
    else if (SpecName == "페이지오프셋")
      SpecName = "PAGEOFF";
    else if (SpecName == "지오티")
      SpecName = "GOT";

```

### `지시어`  한글화 파트 관리

>- 수정할 위치: `llvm/lib/MC/MCParser/AsmParser.cpp`
>- 찾을 위치: `AsmParser::parseStatement` 함수 내부의 StringSwitch (약 `1,790`라인 부근)
>- 방법: `StringSwitch` 체인에 한글 지시어와 매칭되는 표준 가스(gas) 어셈블러 지시어(마침표 . 포함)를 한 줄 얹어주면 된다네.

```cpp
IDVal = StringSwitch<StringRef>(IDVal)
            .Case("공개", ".global")
            .Case("줄맞춤", ".align")
            .Case("글자", ".asciz")
            .Case("새지시어", ".word") // <- 요렇게 한 줄 추가!
            .Default(IDVal);
            
  // Hangul Assembly Directive translation
  IDVal = StringSwitch<StringRef>(IDVal)
              .Case("공개", ".global")
              .Case("줄맞춤", ".align")
              .Case("코드영역", ".text")
              .Case("데이터영역", ".data")
              .Case("외부참조", ".extern")
              .Case("글자", ".asciz")
              .Case("매크로시작", ".macro")
              .Case("매크로끝", ".endmacro")
              .Case("만약정의없으면", ".ifndef")
              .Case("값설정", ".set")
              .Case("만약끝", ".endif")
              .Case("만약", ".if")
              .Case("에러", ".error")
              .Default(IDVal);
```

### `AArch64 레지스터` 한글화 파트

>- `llvm/lib/Target/AArch64/AsmParser/AArch64AsmParser.cpp` 
>- line number `3023`
>- [레지스터](./llvm/lib/Target/AArch64/AsmParser/AArch64AsmParser.cpp#L3023)

```cpp
/// tryParseScalarRegister - Try to parse a register name. The token must be an
/// Identifier when called, and if it is a register name the token is eaten and
/// the register is added to the operand list.
ParseStatus AArch64AsmParser::tryParseScalarRegister(MCRegister &RegNum) {
  const AsmToken &Tok = getTok();
  if (Tok.isNot(AsmToken::Identifier))
    return ParseStatus::NoMatch;

  std::string regName = Tok.getString().str();
  static const std::string Prefix = "연산처_";
  static const std::string SPrefix = "단연산처_";

  if (regName.rfind(Prefix, 0) == 0) {
    std::string numPart = regName.substr(Prefix.size());
    // len("연산처_") = 10 in UTF-8: 연(3)+산(3)+처(3)+_(1) = 10 bytes
    regName = "x" + numPart;
  } else if (regName.rfind(SPrefix, 0) == 0) {
    std::string numPart = regName.substr(SPrefix.size());
    // len("단연산처_") = 13 in UTF-8: 단(3)+연(3)+산(3)+처(3)+_(1) = 13 bytes
    regName = "w" + numPart;
  } else if (regName == "참조쌓임터") {
    regName = "sp";
  } else if (regName == "기본참조터") {
    regName = "x29";
  } else if (regName == "돌아갈길") {
    regName = "x30";
  }

  std::string lowerCase = StringRef(regName).lower();
  MCRegister Reg = matchRegisterNameAlias(lowerCase, RegKind::Scalar);
  if (!Reg)
    return ParseStatus::NoMatch;

  RegNum = Reg;
  Lex(); // Eat identifier token.
  return ParseStatus::Success;
}


```

## `AArch64 니모닉` 한글화 파트

>- `./llvm/lib/Target/AArch64/AsmParser/AArch64AsmParser.cpp` 파일
>- `TranslateHunminMnemonic` 함수, 페이지 `5,296` 라인 
>-[한글 명령어](./llvm/lib/Target/AArch64/AsmParser/AArch64AsmParser.cpp#L5296)

```cpp

# 현재 

// -----------------------------------------------------------------------------
// 훈 한글 어셈블리 (Hun ASM) 명령어 대조표
// -----------------------------------------------------------------------------
static StringRef TranslateHunminMnemonic(StringRef Name) {
  static const std::unordered_map<std::string, std::string> HunminTable = {
      // 1. 사칙연산 및 산술
      {"올림더하기", "adc"},
      {"올림더하기기표", "adcs"},
      {"더하기", "add"},
      {"태그더하기", "addg"},
      {"더하기기표", "adds"},
      {"빼기", "sub"},
      {"태그빼기", "subg"},
      {"포인터빼기", "subp"},
      {"빼기기표", "subs"},
      {"내림빼기", "sbc"},
      {"내림빼기기표", "sbcs"},
      {"곱하고더하기", "madd"},
      {"곱하고빼기", "msub"},
      {"곱하기", "mul"},
      {"곱하고부호바꾸기", "mneg"},
      {"정수나누기", "sdiv"},
      {"양수나누기", "udiv"},
      {"상위곱하기", "smulh"},

      // 2. 분기 및 흐름 제어
      {"분기", "b"},
      {"가기", "b"},
      {"조건분기", "b.cond"},
      {"일관조건분기", "bc.cond"},
      {"부르기", "bl"},
      {"호출", "bl"},
      {"레지스터부르기", "blr"},
      {"레지스터가기", "br"},
      {"복귀", "ret"},
      {"돌아가기", "ret"},
      {"영이면분기", "cbz"},
      {"영아니면분기", "cbnz"},
      {"비트확인분기", "tbz"},

      // 3. 메모리 로드 및 스토어
      {"담기", "ldr"},
      {"불러오기", "ldr"},
      {"쌍담기", "ldp"},
      {"쌍정수담기", "ldpsw"},
      {"바이트담기", "ldrb"},
      {"반단어담기", "ldrh"},
      {"부호바이트담기", "ldrsb"},
      {"부호반단어담기", "ldrsh"},
      {"부호정수담기", "ldrsw"},
      {"오프셋담기", "ldur"},
      {"묻기", "str"},
      {"저장하기", "str"},
      {"쌍묻기", "stp"},
      {"쌍으로저장", "stp"}, // 기존 하위 호환용
      {"쌍으로읽기", "ldp"}, // 기존 하위 호환용
      {"바이트묻기", "strb"},
      {"반단어묻기", "strh"},
      {"안전확보담기", "ldar"},
      {"안전방출묻기", "stlr"},

      // 4. 데이터 전송 및 조작
      {"할당", "mov"},
      {"보내기", "mov"},
      {"할당하기", "mov"}, // 기존 하위 호환용
      {"유지할당", "movk"},
      {"반전할당", "movn"},
      {"영할당", "movz"},
      {"시스템설정읽기", "mrs"},
      {"시스템설정쓰기", "msr"},
      {"주소찾기", "adr"},
      {"페이지주소찾기", "adrp"},

      // 5. 논리 및 비트 조작
      {"그리고", "and"},
      {"그리고기표", "ands"},
      {"또는", "orr"},
      {"배타적또는", "eor"},
      {"다름비교", "eor"},
      {"비트지우기", "bic"},
      {"비트뒤집기", "mvn"},
      {"왼쪽밀기", "lsl"},
      {"오른쪽밀기", "lsr"},
      {"부호우측밀기", "asr"},
      {"회전밀기", "ror"},

      // 6. 비교 및 상태 제어
      {"비교", "cmp"},
      {"음수비교", "cmn"},
      {"조건선택", "csel"},
      {"조건참세팅", "cset"},
      {"조건부더하기", "cinc"},

      // 7. 시스템 및 장벽
      {"쉬기", "nop"},
      {"자리만채우기", "nop"},
      {"OS도움요청", "svc"},
      {"시스템콜", "svc"},
      {"인증키심기", "pacia"},
      {"인증키검증", "autia"},
      {"수동정지", "brk"},
      {"브레이크", "brk"}};

  auto It = HunminTable.find(Name.str());
  if (It != HunminTable.end())
    return It->second;
  return Name;
}
```
## 한글 어셈블리 테스트

>- `hangul/`

```bash
./run.ps1 # 파워쉘 
./run.sh  # zsh
```

---

## 훈 어셈블리 (Hun ASM) 명령어 대조표 (임시 한글 명령어)

```cpp
// -----------------------------------------------------------------------------
// 훈 어셈블리 (Hun ASM) 명령어 대조표
// -----------------------------------------------------------------------------
static StringRef TranslateHunminMnemonic(StringRef Name) {
  static const std::unordered_map<std::string, std::string> HunminTable = {

      // 1. 사칙연산 및 산술
      {"올림더하기", "adc"}, 
      {"올림더하기기표", "adcs"},
      {"더하기", "add"},
      {"태그더하기", "addg"},
      {"더하기기표", "adds"},
      {"빼기", "sub"},
      {"태그빼기", "subg"},
      {"포인터빼기", "subp"},
      {"빼기기표", "subs"},
      {"내림빼기", "sbc"},
      {"내림빼기기표", "sbcs"},
      {"곱하고더하기", "madd"},
      {"곱하고빼기", "msub"},
      {"곱하기", "mul"},
      {"곱하고부호바꾸기", "mneg"}, 
      {"정수나누기", "sdiv"},
      {"양수나누기", "udiv"},
      {"상위곱하기", "smulh"},

      // 2. 분기 및 흐름 제어
      {"분기", "b"}, {"가기", "b"},
      {"조건분기", "b.cond"}, {"일관조건분기", "bc.cond"},
      {"부르기", "bl"}, {"호출", "bl"},
      {"레지스터부르기", "blr"}, {"레지스터가기", "br"},
      {"복귀", "ret"}, {"돌아가기", "ret"},
      {"영이면분기", "cbz"}, {"영아니면분기", "cbnz"},
      {"비트확인분기", "tbz"},

      // 3. 메모리 로드 및 스토어
      {"담기", "ldr"},             {"불러오기", "ldr"},
      {"쌍담기", "ldp"},           {"쌍정수담기", "ldpsw"},
      {"바이트담기", "ldrb"},       {"반단어담기", "ldrh"},
      {"부호바이트담기", "ldrsb"},   {"부호반단어담기", "ldrsh"},
      {"부호정수담기", "ldrsw"},     {"오프셋담기", "ldur"},
      {"묻기", "str"},             {"저장하기", "str"},
      {"쌍묻기", "stp"},           {"쌍으로저장", "stp"},
      {"쌍으로읽기", "ldp"},
      {"바이트묻기", "strb"},       {"반단어묻기", "strh"},
      {"안전확보담기", "ldar"},     {"안전방출묻기", "stlr"},

      // 4. 데이터 전송 및 조작
      {"할당", "mov"},             {"보내기", "mov"},
      {"할당하기", "mov"},
      {"유지할당", "movk"},         {"반전할당", "movn"},
      {"영할당", "movz"},           {"시스템설정읽기", "mrs"},
      {"시스템설정쓰기", "msr"},     {"주소찾기", "adr"},
      {"페이지주소찾기", "adrp"},

      // 5. 논리 및 비트 조작
      {"그리고", "and"},           {"그리고기표", "ands"},
      {"또는", "orr"},             {"배타적또는", "eor"},
      {"다름비교", "eor"},         {"비트지우기", "bic"},
      {"비트뒤집기", "mvn"},         {"왼쪽밀기", "lsl"},
      {"오른쪽밀기", "lsr"},         {"부호우측밀기", "asr"},
      {"회전밀기", "ror"},

      // 6. 비교 및 상태 제어
      {"비교", "cmp"},             {"음수비교", "cmn"},
      {"조건선택", "csel"},         {"조건참세팅", "cset"},
      {"조건부더하기", "cinc"},

      // 7. 시스템 및 장벽
      {"쉬기", "nop"},             {"자리만채우기", "nop"},
      {"OS도움요청", "svc"},       {"시스템콜", "svc"},
      {"인증키심기", "pacia"},       {"인증키검증", "autia"},
      {"수동정지", "brk"},         {"브레이크", "brk"}
  };

```

## 한글이름 대본

- 되도록이면 서술형식으로 최대한 길게 직관적이며 리듬감이 넘치며, 가독성의 극치를 달리는 닷넷(pwsh core) 스타일의 명령어 가문 이름 목록 기획
- 추후 유엔총회를 거쳐 확정할 예정

## 극단적인 예시

① 데이터 배달 및 이동 가문 (Move, Load, Store)

- mov ➔ 우아하게방에값을할당 (기본 이동)
- ldr ➔ 메모리창고에서값을불러오기 (Load)
- str ➔ 메모리창고에값을안전하게저장 (Store)
- stp ➔ 메모리창고에값의쌍을저장 (법우님의 '쌍으로저장'을 계승 발전!)
- ldp ➔ 메모리창고에서값의쌍을읽기

② 산술 및 계산 가문 (Add, Sub, Mul, Div)

- add ➔ 기존의값에정교하게합산
- sub ➔ 기존의값에서차감하여연산
- mul ➔ 두개의방을곱하여배가
- sdiv ➔ 나눗셈을수행하여몫만남기기

③ 통제 및 군대 회군 가문 (Branch, Compare)

- cmp ➔ 두개의방을엄정하게저울질
- b ➔ 지정된좌표로단숨에날아가기 (Jump)
- bl ➔ 자식함수를품격있게부르기 (Call)
- ret ➔ 모든번뇌를끊고당당하게고향으로회군 (시적 가독성의 완성!)

### Hun OS Compiler road map

```rust

// 훈 OS 독자 컴파일러 코어 스케치 (C/C++ 의 그 숭함의 극한 흔적 0%로 제거 후 --> Rust)
pub fn 훈_파서_엔진(토큰: &str) -> 기계어코드 {
    // 🌟 한글 특유의 조사를 유연하게 잘라내는 엣지 있는 한글 분석 규칙!
    let 정갈한_명령어 = 토큰.trim_end_matches("하기").trim_end_matches("하여");
    let 정갈한_레지스터 = 토큰.trim_end_matches("방에").trim_end_matches("방을");

    match 정갈한_명령어 {
        "할당" => 0xD2800000, // ARM64 고유의 MOV 기계어 바이너리 숫자로 다이렉트 매핑!
        "차감" => 0xCB000000, // SUB 기계어 다이렉트 매핑!
        _ => 폭파_오류발생(),
    }
}

// 한글 리모닉은 타이핑 시점, 사전 컴파일 JOT, 즉시 CPU 언어의 2진수 형식으로 변환..
// 명령어 `할당` ===  `1001_1111_1010_....` (Hun 아키텍처는 모든 명령어는 4096bit 이상을 추구함., 최대극한의 철학) 
```
