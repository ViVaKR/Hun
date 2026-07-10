# ARM Instructions


## 🏯 훈민정음 어셈블리 (Hunmin ASM) 명령어 번역본 및 해설서

1. 사칙연산 및 기본 산술 명령어 (Add / Subtract / Multiply / Divide)

- ADC (Add with Carry) 👉 올림더하기  
  이전 계산에서 발생한 올림수(Carry)까지 포함해서 더한다네.

- ADCS (Add with Carry, setting flags) 👉 올림더하기기표
  올림수를 더하면서, 연산 결과 상태(기표, Flag)까지 기록한다네.

ADD (Add) 👉 더하기
설명: 두 값을 그냥 더한다네. (값의 형태에 따라 상수더하기, 레지스터더하기 등으로 분류 가능)

ADDG (Add with Tag) 👉 태그더하기
설명: 메모리 태깅 보호를 위해 주소값에 태그를 더해 할당한다네.

ADDS (Add, setting flags) 👉 더하기기표
설명: 더한 결과에 따라 제로(Z), 마이너스(N) 등의 상태 플래그(기표)를 세팅한다네.

SUB (Subtract) 👉 빼기, 값을 뺀다네.

SUBG (Subtract with Tag) 👉 태그빼기, 메모리 태그 주소에서 태그 오프셋을 뺀다네.

SUBP (Subtract Pointer) 👉 포인터빼기, 두 주소값(포인터) 간의 거리를 구하기 위해 주소를 서로 뺀다네.

SUBS (Subtract, setting flags) 👉 빼기기표, 값을 빼고 결과 상태를 플래그(기표)에 기록한다네. (비교 연산인 CMP의 본체라네!)
SBC (Subtract with Carry) 👉 내림빼기
설명: 이전 연산에서 빌려온 값(Carry)까지 감안해서 뺀다네.
SBCS (Subtract with Carry, setting flags) 👉 내림빼기기표
설명: 이전 내림값을 포함해 빼고 상태 플래그를 세팅한다네.
MADD (Multiply-Add) 👉 곱하고더하기
설명: 두 값을 곱한 뒤 다른 값을 추가로 더한다네 ( A × B + C A×B+C).
MSUB (Multiply-Subtract) 👉 곱하고빼기
설명: 두 값을 곱한 뒤 다른 값에서 그 곱한 결과를 뺀다네 ( C − A × B C−A×B).
MUL (Multiply) 👉 곱하기
설명: 두 값을 단순 곱한다네. (곱하고더하기의 단순형)
MNEG (Multiply-Negate) 👉 곱하고부호바꾸기
설명: 곱한 결과의 부호를 반대로 뒤집는다네 ( − ( A × B) −(A×B)).
SDIV (Signed Divide) 👉 정수나누기
설명: 부호가 있는 정수 나눗셈을 수행한다네.
UDIV (Unsigned Divide) 👉 양수나누기
설명: 부호가 없는 양수 나눗셈을 수행한다네.
SMADDL / SMSUBL (Signed Multiply-Add/Subtract Long) 👉 길게곱하고더하기 / 길게곱하고빼기
설명: 32비트 두 개를 곱해 64비트 큰 그릇에 담아 더하거나 뺀다네.
SMULH / UMULH (Multiply High) 👉 상위곱하기
설명: 곱셈 결과 중에서 앞쪽의 큰 자리수(상위 64비트)만 챙긴다네.

---

2. 분기 및 흐름 제어 명령어 (Branch / Jump / Call)
B (Branch) 👉 분기 또는 가기
설명: 무조건 지정한 레이블(주소)로 흐름을 점프시킨다네.
B.cond (Branch conditionally) 👉 조건분기
설명: 직전 비교 결과(같으면, 크면 등)에 따라 선택적으로 점프한다네.
BC.cond (Branch Consistent conditionally) 👉 일관조건분기
설명: 분기 예측 성능을 더 높인 조건부 점프라네.
BL (Branch with Link) 👉 부르기 또는 호출
설명: 함수를 호출할 때 쓰며, 돌아올 주소를 레지스터(LR)에 저장하고 점프한다네.
BLR (Branch with Link to Register) 👉 레지스터부르기
설명: 레지스터에 저장된 주소값으로 함수를 호출한다네.
BR (Branch to Register) 👉 레지스터가기
설명: 레지스터에 기록된 주소로 단순 점프한다네.

- RET (Return) 👉 복귀 또는 돌아가기
함수 실행을 마치고 원래 부른 위치로 복귀한다네. 함수복귀, Link Register (LR, X30 주소로 분기),

CBZ (Compare and Branch on Zero) 👉 영이면분기
설명: 값이 0인 경우에만 즉시 점프한다네. (따로 비교할 필요 없어 아주 빠르다네!)
CBNZ (Compare and Branch on Nonzero) 👉 영아니면분기
설명: 값이 0이 아닐 때 즉시 점프한다네.
TBNZ / TBZ (Test bit and Branch) 👉 비트확인분기
설명: 특정 비트가 0인지 1인지 확인하고 바로 점프한다네.

---

3. 메모리 로드 및 스토어 명령어 (Load / Store)
LDR (Load Register) 👉 담기 또는 불러오기
설명: 메모리에 있는 값을 레지스터로 가져온다네.
LDP (Load Pair of Registers) 👉 쌍담기
설명: 메모리에서 연속된 값 2개를 레지스터 2개에 동시에 한 번에 담는다네. (M1 성능의 핵심!)
LDPSW (Load Pair Signed Word) 👉 쌍정수담기
설명: 32비트 값 2개를 부호를 유지한 채 64비트 크기로 담는다네.
LDRB / LDRH (Load Byte / Halfword) 👉 바이트담기 / 반단어담기
설명: 1바이트(8비트) 또는 반단어(16비트) 크기만 쪼개어 가져온다네.
LDRSB / LDRSH / LDRSW (Load Signed) 👉 부호바이트담기 / 부호반단어담기 / 부호정수담기
설명: 작은 크기를 가져오되 빈자리를 원래 부호(마이너스 등)로 가득 채워 담는다네.
LDUR / LDURB / LDURH / LDURSB (Load Unscaled) 👉 오프셋담기
설명: 정렬되지 않은 임의의 바이트 단위 오프셋 위치에서 값을 읽어온다네.
STR (Store Register) 👉 묻기 또는 저장하기
설명: 레지스터의 값을 메모리에 밀어 넣어 저장한다네.
STP (Store Pair of Registers) 👉 쌍묻기
설명: 레지스터 2개의 값을 메모리에 연달아 저장한다네.
STRB / STRH / STUR 👉 바이트묻기 / 반단어묻기 / 임의오프셋묻기
설명: 크기에 맞춰 메모리에 묻어둔다네.
LDAR / LDARB / LDARH (Load-Acquire) 👉 안전확보담기
설명: 멀티스레드 환경에서 순서가 뒤바뀌지 않게 '락(Lock)'을 걸며 메모리를 읽어온다네.
STLR / STLRB / STLRH (Store-Release) 👉 안전방출묻기
설명: 다른 코어들이 모두 읽을 수 있게 쓰기 동기화를 마치고 값을 메모리에 묻는다네.

---

4. 데이터 전송 및 레지스터 조작 (Move / Address)

MOV (Move) 👉 할당 또는 보내기
설명: 레지스터끼리 값을 복사하거나 상수를 레지스터에 대입한다네.
MOVK (Move wide with keep) 👉 유지할당
설명: 기존 64비트 값 중 특정 16비트 영역만 골라 덮어쓰고 나머지는 그대로 유지한다네.
MOVN (Move wide with NOT) 👉 반전할당
설명: 값을 비트 반전(NOT) 시켜서 레지스터에 넣는다네.
MOVZ (Move wide with zero) 👉 영할당
설명: 특정 위치에 값을 넣고 나머지 비트는 전부 0으로 채운다네.
MRS (Move System Register to general) 👉 시스템설정읽기
설명: CPU 내부의 특수 시스템 설정 값을 일반 레지스터로 읽어온다네.
MSR (Move general to System Register) 👉 시스템설정쓰기
설명: 일반 레지스터 값을 시스템 설정 레지스터에 주입해 하드웨어를 제어한다네.
ADR / ADRP (Address / Address Page) 👉 주소찾기 / 페이지주소찾기
설명: 프로그램 카운터(PC) 기준으로 현재 실행 위치에서 레이블까지의 거리를 계산해 주소를 찾아낸다네.

---

5. 논리 및 비트 조작 연산 (Logical / Shift)

AND (Bitwise AND) 👉 그리고
설명: 비트 단위의 AND 연산을 한다네.
ANDS (Bitwise AND, setting flags) 👉 그리고기표
설명: AND 연산 후 상태 플래그를 세팅한다네 (비트 테스트 TST 연산의 본체라네).
ORR (Bitwise OR) 👉 또는
설명: 비트 단위의 OR 연산을 한다네.
EOR (Exclusive OR) 👉 다름비교 또는 배타적또는
설명: 비트 단위 XOR 연산을 한다네.
EON (Exclusive OR NOT) 👉 다름비교반전
설명: XOR 연산 결과를 다시 반전시킨다네.
ORN (Bitwise OR NOT) 👉 또는반전
설명: 한쪽 값에 NOT을 적용한 뒤 OR 연산을 한다네.
BIC / BICS (Bit Clear) 👉 비트지우기 / 비트지우기기표
설명: 마스크 값을 가지고 특정 위치의 비트들을 강제로 0으로 청소한다네.
MVN (Move NOT) 👉 비트뒤집기
설명: 비트를 몽땅 뒤집어(0은 1로, 1은 0으로) 전달한다네.
LSL (Logical Shift Left) 👉 왼쪽밀기
설명: 비트들을 왼쪽으로 밀어 곱하기 2의 효과를 낸다네.
LSR (Logical Shift Right) 👉 오른쪽밀기
설명: 비트들을 오른쪽으로 밀어 나누기 2의 효과를 낸다네 (빈자리는 0으로).
ASR (Arithmetic Shift Right) 👉 부호우측밀기
설명: 비트들을 오른쪽으로 밀되 원래 음수 기호(부호 비트)를 보존한다네.
ROR (Rotate Right) 👉 회전밀기
설명: 비트를 오른쪽으로 밀어 삐져나온 비트를 왼쪽 끝으로 순환하여 붙인다네.

---

6. 비교 및 상태 제어 명령어 (Compare / Select / Control)

CMP (Compare) 👉 비교
설명: 두 값을 빼보고 크다, 작다, 같다를 판독한다네 (실제론 SUBS가 뒤에서 묵묵히 처리한다네).
CMN (Compare Negative) 👉 음수비교
설명: 두 값을 더해보고 부호를 판단한다네.
CSEL (Conditional Select) 👉 조건선택
설명: 조건이 참이면 A 레지스터를, 거짓이면 B 레지스터를 결과로 선택한다네.
CSINC / CSINV / CSNEG 👉 조건선택더하기 / 조건선택반전 / 조건선택음수
설명: 조건에 따라 결과값을 선택하며 가공(1 더하기, 비트 반전, 부호 뒤집기)한다네.
CSET / CSETM (Conditional Set) 👉 조건참세팅 / 조건참마스크
설명: 조건이 참이면 레지스터를 1(또는 전체 1 마스크)로 채우고, 거짓이면 0으로 세팅한다네.
CINC / CINV / CNEG 👉 조건부더하기 / 조건부반전 / 조건부부호바꾸기
설명: 참일 때만 실행하고 아니면 통과한다네.

---

7. 시스템 제어 및 메모리 장벽 (Barrier / System / Security)

NOP (No Operation) 👉 쉬기 또는 자리만채우기
설명: 아무 작업도 하지 않고 시간만 1클럭 때운다네.
SVC (Supervisor Call) 👉 OS도움요청 또는 시스템콜
설명: 유저 모드에서 커널(OS)의 서비스를 받기 위해 소프트웨어 인터럽트를 터뜨린다네.
HVC / SMC 👉 가상화OS호출 / 보안모드호출
설명: 하이퍼바이저나 하드웨어 보안 펌웨어 영역에 도움을 청할 때 쓴다네.
DMB / DSB / ISB (Memory / Sync Barrier) 👉 데이터메모리장벽 / 데이터동기화장벽 / 명령동기화장벽
설명: 파이프라인 연산 중 순서가 꼬이지 않도록 물리 메모리 버스를 잠시 대기시키는 통제선이라네.
PACIA / AUTIA (Pointer Authentication) 👉 인증키심기 / 인증키검증
설명: 해커의 스택 오버플로우 공격을 막기 위해 함수 복귀 주소에 디지털 서명키를 심고 검증한다네 (M1 맥북 보안의 상징!).
BRK (Breakpoint) 👉 수동정지 또는 브레이크
설명: 디버거에게 제어권을 넘기며 강제로 멈춘다네.

---


```assembly
// =================================================================
// 🏯 최종 정예 훈민정음 어셈블리 (Hunmin ASM) 마스터 세트
// =================================================================

# A64 -- Base Instructions (alphabetic order)

--- 
<pre>
ADC: Add with Carry.
ADCS: Add with Carry, setting flags.
ADD (extended register): Add (extended register).
ADD (immediate): Add (immediate).
ADD (shifted register): Add (shifted register).
ADDG: Add with Tag.
ADDS (extended register): Add (extended register), setting flags.
ADDS (immediate): Add (immediate), setting flags.
ADDS (shifted register): Add (shifted register), setting flags.
ADR: Form PC-relative address.
ADRP: Form PC-relative address to 4KB page.
AND (immediate): Bitwise AND (immediate).
AND (shifted register): Bitwise AND (shifted register).
ANDS (immediate): Bitwise AND (immediate), setting flags.
ANDS (shifted register): Bitwise AND (shifted register), setting flags.
ASR (immediate): Arithmetic Shift Right (immediate): an alias of SBFM.
ASR (register): Arithmetic Shift Right (register): an alias of ASRV.
ASRV: Arithmetic Shift Right Variable.
AT: Address Translate: an alias of SYS.
AUTDA, AUTDZA: Authenticate Data address, using key A.
AUTDB, AUTDZB: Authenticate Data address, using key B.
AUTIA, AUTIA1716, AUTIASP, AUTIAZ, AUTIZA: Authenticate Instruction address, using key A.
AUTIB, AUTIB1716, AUTIBSP, AUTIBZ, AUTIZB: Authenticate Instruction address, using key B.
AXFLAG: Convert floating-point condition flags from Arm to external format.
B: Branch.
B.cond: Branch conditionally.
BC.cond: Branch Consistent conditionally.
BFC: Bitfield Clear: an alias of BFM.
BFI: Bitfield Insert: an alias of BFM.
BFM: Bitfield Move.
BFXIL: Bitfield extract and insert at low end: an alias of BFM.
BIC (shifted register): Bitwise Bit Clear (shifted register).
BICS (shifted register): Bitwise Bit Clear (shifted register), setting flags.
BL: Branch with Link.
BLR: Branch with Link to Register.
BLRAA, BLRAAZ, BLRAB, BLRABZ: Branch with Link to Register, with pointer authentication.
BR: Branch to Register.
BRAA, BRAAZ, BRAB, BRABZ: Branch to Register, with pointer authentication.
BRB: Branch Record Buffer: an alias of SYS.
BRK: Breakpoint instruction.
BTI: Branch Target Identification.
CAS, CASA, CASAL, CASL: Compare and Swap word or doubleword in memory.
CASB, CASAB, CASALB, CASLB: Compare and Swap byte in memory.
CASH, CASAH, CASALH, CASLH: Compare and Swap halfword in memory.
CASP, CASPA, CASPAL, CASPL: Compare and Swap Pair of words or doublewords in memory.
CBNZ: Compare and Branch on Nonzero.
CBZ: Compare and Branch on Zero.
CCMN (immediate): Conditional Compare Negative (immediate).
CCMN (register): Conditional Compare Negative (register).
CCMP (immediate): Conditional Compare (immediate).
CCMP (register): Conditional Compare (register).
CFINV: Invert Carry Flag.
CFP: Control Flow Prediction Restriction by Context: an alias of SYS.
CINC: Conditional Increment: an alias of CSINC.
CINV: Conditional Invert: an alias of CSINV.
CLREX: Clear Exclusive.
CLS: Count Leading Sign bits.
CLZ: Count Leading Zeros.
CMN (extended register): Compare Negative (extended register): an alias of ADDS (extended register).
CMN (immediate): Compare Negative (immediate): an alias of ADDS (immediate).
CMN (shifted register): Compare Negative (shifted register): an alias of ADDS (shifted register).
CMP (extended register): Compare (extended register): an alias of SUBS (extended register).
CMP (immediate): Compare (immediate): an alias of SUBS (immediate).
CMP (shifted register): Compare (shifted register): an alias of SUBS (shifted register).
CMPP: Compare with Tag: an alias of SUBPS.
CNEG: Conditional Negate: an alias of CSNEG.
CPP: Cache Prefetch Prediction Restriction by Context: an alias of SYS.
CPYFP, CPYFM, CPYFE: Memory Copy Forward-only.
CPYFPN, CPYFMN, CPYFEN: Memory Copy Forward-only, reads and writes non-temporal.
CPYFPRN, CPYFMRN, CPYFERN: Memory Copy Forward-only, reads non-temporal.
CPYFPRT, CPYFMRT, CPYFERT: Memory Copy Forward-only, reads unprivileged.
CPYFPRTN, CPYFMRTN, CPYFERTN: Memory Copy Forward-only, reads unprivileged, reads and writes non-temporal.
CPYFPRTRN, CPYFMRTRN, CPYFERTRN: Memory Copy Forward-only, reads unprivileged and non-temporal.
CPYFPRTWN, CPYFMRTWN, CPYFERTWN: Memory Copy Forward-only, reads unprivileged, writes non-temporal.
CPYFPT, CPYFMT, CPYFET: Memory Copy Forward-only, reads and writes unprivileged.
CPYFPTN, CPYFMTN, CPYFETN: Memory Copy Forward-only, reads and writes unprivileged and non-temporal.
CPYFPTRN, CPYFMTRN, CPYFETRN: Memory Copy Forward-only, reads and writes unprivileged, reads non-temporal.
CPYFPTWN, CPYFMTWN, CPYFETWN: Memory Copy Forward-only, reads and writes unprivileged, writes non-temporal.
CPYFPWN, CPYFMWN, CPYFEWN: Memory Copy Forward-only, writes non-temporal.
CPYFPWT, CPYFMWT, CPYFEWT: Memory Copy Forward-only, writes unprivileged.
CPYFPWTN, CPYFMWTN, CPYFEWTN: Memory Copy Forward-only, writes unprivileged, reads and writes non-temporal.
CPYFPWTRN, CPYFMWTRN, CPYFEWTRN: Memory Copy Forward-only, writes unprivileged, reads non-temporal.
CPYFPWTWN, CPYFMWTWN, CPYFEWTWN: Memory Copy Forward-only, writes unprivileged and non-temporal.
CPYP, CPYM, CPYE: Memory Copy.
CPYPN, CPYMN, CPYEN: Memory Copy, reads and writes non-temporal.
CPYPRN, CPYMRN, CPYERN: Memory Copy, reads non-temporal.
CPYPRT, CPYMRT, CPYERT: Memory Copy, reads unprivileged.
CPYPRTN, CPYMRTN, CPYERTN: Memory Copy, reads unprivileged, reads and writes non-temporal.
CPYPRTRN, CPYMRTRN, CPYERTRN: Memory Copy, reads unprivileged and non-temporal.
CPYPRTWN, CPYMRTWN, CPYERTWN: Memory Copy, reads unprivileged, writes non-temporal.
CPYPT, CPYMT, CPYET: Memory Copy, reads and writes unprivileged.
CPYPTN, CPYMTN, CPYETN: Memory Copy, reads and writes unprivileged and non-temporal.
CPYPTRN, CPYMTRN, CPYETRN: Memory Copy, reads and writes unprivileged, reads non-temporal.
CPYPTWN, CPYMTWN, CPYETWN: Memory Copy, reads and writes unprivileged, writes non-temporal.
CPYPWN, CPYMWN, CPYEWN: Memory Copy, writes non-temporal.
CPYPWT, CPYMWT, CPYEWT: Memory Copy, writes unprivileged.
CPYPWTN, CPYMWTN, CPYEWTN: Memory Copy, writes unprivileged, reads and writes non-temporal.
CPYPWTRN, CPYMWTRN, CPYEWTRN: Memory Copy, writes unprivileged, reads non-temporal.
CPYPWTWN, CPYMWTWN, CPYEWTWN: Memory Copy, writes unprivileged and non-temporal.
CRC32B, CRC32H, CRC32W, CRC32X: CRC32 checksum.
CRC32CB, CRC32CH, CRC32CW, CRC32CX: CRC32C checksum.
CSDB: Consumption of Speculative Data Barrier.
CSEL: Conditional Select.
CSET: Conditional Set: an alias of CSINC.
CSETM: Conditional Set Mask: an alias of CSINV.
CSINC: Conditional Select Increment.
CSINV: Conditional Select Invert.
CSNEG: Conditional Select Negation.
DC: Data Cache operation: an alias of SYS.
DCPS1: Debug Change PE State to EL1..
DCPS2: Debug Change PE State to EL2..
DCPS3: Debug Change PE State to EL3.
DGH: Data Gathering Hint.
DMB: Data Memory Barrier.
DRPS: Debug restore process state.
DSB: Data Synchronization Barrier.
DVP: Data Value Prediction Restriction by Context: an alias of SYS.
EON (shifted register): Bitwise Exclusive OR NOT (shifted register).
EOR (immediate): Bitwise Exclusive OR (immediate).
EOR (shifted register): Bitwise Exclusive OR (shifted register).
ERET: Exception Return.
ERETAA, ERETAB: Exception Return, with pointer authentication.
ESB: Error Synchronization Barrier.
EXTR: Extract register.
GMI: Tag Mask Insert.
HINT: Hint instruction.
HLT: Halt instruction.
HVC: Hypervisor Call.
IC: Instruction Cache operation: an alias of SYS.
IRG: Insert Random Tag.
ISB: Instruction Synchronization Barrier.
LD64B: Single-copy Atomic 64-byte Load.
LDADD, LDADDA, LDADDAL, LDADDL: Atomic add on word or doubleword in memory.
LDADDB, LDADDAB, LDADDALB, LDADDLB: Atomic add on byte in memory.
LDADDH, LDADDAH, LDADDALH, LDADDLH: Atomic add on halfword in memory.
LDAPR: Load-Acquire RCpc Register.
LDAPRB: Load-Acquire RCpc Register Byte.
LDAPRH: Load-Acquire RCpc Register Halfword.
LDAPUR: Load-Acquire RCpc Register (unscaled).
LDAPURB: Load-Acquire RCpc Register Byte (unscaled).
LDAPURH: Load-Acquire RCpc Register Halfword (unscaled).
LDAPURSB: Load-Acquire RCpc Register Signed Byte (unscaled).
LDAPURSH: Load-Acquire RCpc Register Signed Halfword (unscaled).
LDAPURSW: Load-Acquire RCpc Register Signed Word (unscaled).
LDAR: Load-Acquire Register.
LDARB: Load-Acquire Register Byte.
LDARH: Load-Acquire Register Halfword.
LDAXP: Load-Acquire Exclusive Pair of Registers.
LDAXR: Load-Acquire Exclusive Register.
LDAXRB: Load-Acquire Exclusive Register Byte.
LDAXRH: Load-Acquire Exclusive Register Halfword.
LDCLR, LDCLRA, LDCLRAL, LDCLRL: Atomic bit clear on word or doubleword in memory.
LDCLRB, LDCLRAB, LDCLRALB, LDCLRLB: Atomic bit clear on byte in memory.
LDCLRH, LDCLRAH, LDCLRALH, LDCLRLH: Atomic bit clear on halfword in memory.
LDEOR, LDEORA, LDEORAL, LDEORL: Atomic exclusive OR on word or doubleword in memory.
LDEORB, LDEORAB, LDEORALB, LDEORLB: Atomic exclusive OR on byte in memory.
LDEORH, LDEORAH, LDEORALH, LDEORLH: Atomic exclusive OR on halfword in memory.
LDG: Load Allocation Tag.
LDGM: Load Tag Multiple.
LDLAR: Load LOAcquire Register.
LDLARB: Load LOAcquire Register Byte.
LDLARH: Load LOAcquire Register Halfword.
LDNP: Load Pair of Registers, with non-temporal hint.
LDP: Load Pair of Registers.
LDPSW: Load Pair of Registers Signed Word.
LDR (immediate): Load Register (immediate).
LDR (literal): Load Register (literal).
LDR (register): Load Register (register).
LDRAA, LDRAB: Load Register, with pointer authentication.
LDRB (immediate): Load Register Byte (immediate).
LDRB (register): Load Register Byte (register).
LDRH (immediate): Load Register Halfword (immediate).
LDRH (register): Load Register Halfword (register).
LDRSB (immediate): Load Register Signed Byte (immediate).
LDRSB (register): Load Register Signed Byte (register).
LDRSH (immediate): Load Register Signed Halfword (immediate).
LDRSH (register): Load Register Signed Halfword (register).
LDRSW (immediate): Load Register Signed Word (immediate).
LDRSW (literal): Load Register Signed Word (literal).
LDRSW (register): Load Register Signed Word (register).
LDSET, LDSETA, LDSETAL, LDSETL: Atomic bit set on word or doubleword in memory.
LDSETB, LDSETAB, LDSETALB, LDSETLB: Atomic bit set on byte in memory.
LDSETH, LDSETAH, LDSETALH, LDSETLH: Atomic bit set on halfword in memory.
LDSMAX, LDSMAXA, LDSMAXAL, LDSMAXL: Atomic signed maximum on word or doubleword in memory.
LDSMAXB, LDSMAXAB, LDSMAXALB, LDSMAXLB: Atomic signed maximum on byte in memory.
LDSMAXH, LDSMAXAH, LDSMAXALH, LDSMAXLH: Atomic signed maximum on halfword in memory.
LDSMIN, LDSMINA, LDSMINAL, LDSMINL: Atomic signed minimum on word or doubleword in memory.
LDSMINB, LDSMINAB, LDSMINALB, LDSMINLB: Atomic signed minimum on byte in memory.
LDSMINH, LDSMINAH, LDSMINALH, LDSMINLH: Atomic signed minimum on halfword in memory.
LDTR: Load Register (unprivileged).
LDTRB: Load Register Byte (unprivileged).
LDTRH: Load Register Halfword (unprivileged).
LDTRSB: Load Register Signed Byte (unprivileged).
LDTRSH: Load Register Signed Halfword (unprivileged).
LDTRSW: Load Register Signed Word (unprivileged).
LDUMAX, LDUMAXA, LDUMAXAL, LDUMAXL: Atomic unsigned maximum on word or doubleword in memory.
LDUMAXB, LDUMAXAB, LDUMAXALB, LDUMAXLB: Atomic unsigned maximum on byte in memory.
LDUMAXH, LDUMAXAH, LDUMAXALH, LDUMAXLH: Atomic unsigned maximum on halfword in memory.
LDUMIN, LDUMINA, LDUMINAL, LDUMINL: Atomic unsigned minimum on word or doubleword in memory.
LDUMINB, LDUMINAB, LDUMINALB, LDUMINLB: Atomic unsigned minimum on byte in memory.
LDUMINH, LDUMINAH, LDUMINALH, LDUMINLH: Atomic unsigned minimum on halfword in memory.
LDUR: Load Register (unscaled).
LDURB: Load Register Byte (unscaled).
LDURH: Load Register Halfword (unscaled).
LDURSB: Load Register Signed Byte (unscaled).
LDURSH: Load Register Signed Halfword (unscaled).
LDURSW: Load Register Signed Word (unscaled).
LDXP: Load Exclusive Pair of Registers.
LDXR: Load Exclusive Register.
LDXRB: Load Exclusive Register Byte.
LDXRH: Load Exclusive Register Halfword.
LSL (immediate): Logical Shift Left (immediate): an alias of UBFM.
LSL (register): Logical Shift Left (register): an alias of LSLV.
LSLV: Logical Shift Left Variable.
LSR (immediate): Logical Shift Right (immediate): an alias of UBFM.
LSR (register): Logical Shift Right (register): an alias of LSRV.
LSRV: Logical Shift Right Variable.
MADD: Multiply-Add.
MNEG: Multiply-Negate: an alias of MSUB.
MOV (bitmask immediate): Move (bitmask immediate): an alias of ORR (immediate).
MOV (inverted wide immediate): Move (inverted wide immediate): an alias of MOVN.
MOV (register): Move (register): an alias of ORR (shifted register).
MOV (to/from SP): Move between register and stack pointer: an alias of ADD (immediate).
MOV (wide immediate): Move (wide immediate): an alias of MOVZ.
MOVK: Move wide with keep.
MOVN: Move wide with NOT.
MOVZ: Move wide with zero.
MRS: Move System Register.
MSR (immediate): Move immediate value to Special Register.
MSR (register): Move general-purpose register to System Register.
MSUB: Multiply-Subtract.
MUL: Multiply: an alias of MADD.
MVN: Bitwise NOT: an alias of ORN (shifted register).
NEG (shifted register): Negate (shifted register): an alias of SUB (shifted register).
NEGS: Negate, setting flags: an alias of SUBS (shifted register).
NGC: Negate with Carry: an alias of SBC.
NGCS: Negate with Carry, setting flags: an alias of SBCS.
NOP: No Operation.
ORN (shifted register): Bitwise OR NOT (shifted register).
ORR (immediate): Bitwise OR (immediate).
ORR (shifted register): Bitwise OR (shifted register).
PACDA, PACDZA: Pointer Authentication Code for Data address, using key A.
PACDB, PACDZB: Pointer Authentication Code for Data address, using key B.
PACGA: Pointer Authentication Code, using Generic key.
PACIA, PACIA1716, PACIASP, PACIAZ, PACIZA: Pointer Authentication Code for Instruction address, using key A.
PACIB, PACIB1716, PACIBSP, PACIBZ, PACIZB: Pointer Authentication Code for Instruction address, using key B.
PRFM (immediate): Prefetch Memory (immediate).
PRFM (literal): Prefetch Memory (literal).
PRFM (register): Prefetch Memory (register).
PRFUM: Prefetch Memory (unscaled offset).
PSB CSYNC: Profiling Synchronization Barrier.
PSSBB: Physical Speculative Store Bypass Barrier: an alias of DSB.
RBIT: Reverse Bits.
RET: Return from subroutine.
RETAA, RETAB: Return from subroutine, with pointer authentication.
REV: Reverse Bytes.
REV16: Reverse bytes in 16-bit halfwords.
REV32: Reverse bytes in 32-bit words.
REV64: Reverse Bytes: an alias of REV.
RMIF: Rotate, Mask Insert Flags.
ROR (immediate): Rotate right (immediate): an alias of EXTR.
ROR (register): Rotate Right (register): an alias of RORV.
RORV: Rotate Right Variable.
SB: Speculation Barrier.
SBC: Subtract with Carry.
SBCS: Subtract with Carry, setting flags.
SBFIZ: Signed Bitfield Insert in Zero: an alias of SBFM.
SBFM: Signed Bitfield Move.
SBFX: Signed Bitfield Extract: an alias of SBFM.
SDIV: Signed Divide.
SETF8, SETF16: Evaluation of 8 or 16 bit flag values.
SETGP, SETGM, SETGE: Memory Set with tag setting.
SETGPN, SETGMN, SETGEN: Memory Set with tag setting, non-temporal.
SETGPT, SETGMT, SETGET: Memory Set with tag setting, unprivileged.
SETGPTN, SETGMTN, SETGETN: Memory Set with tag setting, unprivileged and non-temporal.
SETP, SETM, SETE: Memory Set.
SETPN, SETMN, SETEN: Memory Set, non-temporal.
SETPT, SETMT, SETET: Memory Set, unprivileged.
SETPTN, SETMTN, SETETN: Memory Set, unprivileged and non-temporal.
SEV: Send Event.
SEVL: Send Event Local.
SMADDL: Signed Multiply-Add Long.
SMC: Secure Monitor Call.
SMNEGL: Signed Multiply-Negate Long: an alias of SMSUBL.
SMSTART: Enables access to Streaming SVE mode and SME architectural state: an alias of MSR (immediate).
SMSTOP: Disables access to Streaming SVE mode and SME architectural state: an alias of MSR (immediate).
SMSUBL: Signed Multiply-Subtract Long.
SMULH: Signed Multiply High.
SMULL: Signed Multiply Long: an alias of SMADDL.
SSBB: Speculative Store Bypass Barrier: an alias of DSB.
ST2G: Store Allocation Tags.
ST64B: Single-copy Atomic 64-byte Store without Return.
ST64BV: Single-copy Atomic 64-byte Store with Return.
ST64BV0: Single-copy Atomic 64-byte EL0 Store with Return.
STADD, STADDL: Atomic add on word or doubleword in memory, without return: an alias of LDADD, LDADDA, LDADDAL, LDADDL.
STADDB, STADDLB: Atomic add on byte in memory, without return: an alias of LDADDB, LDADDAB, LDADDALB, LDADDLB.
STADDH, STADDLH: Atomic add on halfword in memory, without return: an alias of LDADDH, LDADDAH, LDADDALH, LDADDLH.
STCLR, STCLRL: Atomic bit clear on word or doubleword in memory, without return: an alias of LDCLR, LDCLRA, LDCLRAL, LDCLRL.
STCLRB, STCLRLB: Atomic bit clear on byte in memory, without return: an alias of LDCLRB, LDCLRAB, LDCLRALB, LDCLRLB.
STCLRH, STCLRLH: Atomic bit clear on halfword in memory, without return: an alias of LDCLRH, LDCLRAH, LDCLRALH, LDCLRLH.
STEOR, STEORL: Atomic exclusive OR on word or doubleword in memory, without return: an alias of LDEOR, LDEORA, LDEORAL, LDEORL.
STEORB, STEORLB: Atomic exclusive OR on byte in memory, without return: an alias of LDEORB, LDEORAB, LDEORALB, LDEORLB.
STEORH, STEORLH: Atomic exclusive OR on halfword in memory, without return: an alias of LDEORH, LDEORAH, LDEORALH, LDEORLH.
STG: Store Allocation Tag.
STGM: Store Tag Multiple.
STGP: Store Allocation Tag and Pair of registers.
STLLR: Store LORelease Register.
STLLRB: Store LORelease Register Byte.
STLLRH: Store LORelease Register Halfword.
STLR: Store-Release Register.
STLRB: Store-Release Register Byte.
STLRH: Store-Release Register Halfword.
STLUR: Store-Release Register (unscaled).
STLURB: Store-Release Register Byte (unscaled).
STLURH: Store-Release Register Halfword (unscaled).
STLXP: Store-Release Exclusive Pair of registers.
STLXR: Store-Release Exclusive Register.
STLXRB: Store-Release Exclusive Register Byte.
STLXRH: Store-Release Exclusive Register Halfword.
STNP: Store Pair of Registers, with non-temporal hint.
STP: Store Pair of Registers.
STR (immediate): Store Register (immediate).
STR (register): Store Register (register).
STRB (immediate): Store Register Byte (immediate).
STRB (register): Store Register Byte (register).
STRH (immediate): Store Register Halfword (immediate).
STRH (register): Store Register Halfword (register).
STSET, STSETL: Atomic bit set on word or doubleword in memory, without return: an alias of LDSET, LDSETA, LDSETAL, LDSETL.
STSETB, STSETLB: Atomic bit set on byte in memory, without return: an alias of LDSETB, LDSETAB, LDSETALB, LDSETLB.
STSETH, STSETLH: Atomic bit set on halfword in memory, without return: an alias of LDSETH, LDSETAH, LDSETALH, LDSETLH.
STSMAX, STSMAXL: Atomic signed maximum on word or doubleword in memory, without return: an alias of LDSMAX, LDSMAXA, LDSMAXAL, LDSMAXL.
STSMAXB, STSMAXLB: Atomic signed maximum on byte in memory, without return: an alias of LDSMAXB, LDSMAXAB, LDSMAXALB, LDSMAXLB.
STSMAXH, STSMAXLH: Atomic signed maximum on halfword in memory, without return: an alias of LDSMAXH, LDSMAXAH, LDSMAXALH, LDSMAXLH.
STSMIN, STSMINL: Atomic signed minimum on word or doubleword in memory, without return: an alias of LDSMIN, LDSMINA, LDSMINAL, LDSMINL.
STSMINB, STSMINLB: Atomic signed minimum on byte in memory, without return: an alias of LDSMINB, LDSMINAB, LDSMINALB, LDSMINLB.
STSMINH, STSMINLH: Atomic signed minimum on halfword in memory, without return: an alias of LDSMINH, LDSMINAH, LDSMINALH, LDSMINLH.
STTR: Store Register (unprivileged).
STTRB: Store Register Byte (unprivileged).
STTRH: Store Register Halfword (unprivileged).
STUMAX, STUMAXL: Atomic unsigned maximum on word or doubleword in memory, without return: an alias of LDUMAX, LDUMAXA, LDUMAXAL, LDUMAXL.
STUMAXB, STUMAXLB: Atomic unsigned maximum on byte in memory, without return: an alias of LDUMAXB, LDUMAXAB, LDUMAXALB, LDUMAXLB.
STUMAXH, STUMAXLH: Atomic unsigned maximum on halfword in memory, without return: an alias of LDUMAXH, LDUMAXAH, LDUMAXALH, LDUMAXLH.
STUMIN, STUMINL: Atomic unsigned minimum on word or doubleword in memory, without return: an alias of LDUMIN, LDUMINA, LDUMINAL, LDUMINL.
STUMINB, STUMINLB: Atomic unsigned minimum on byte in memory, without return: an alias of LDUMINB, LDUMINAB, LDUMINALB, LDUMINLB.
STUMINH, STUMINLH: Atomic unsigned minimum on halfword in memory, without return: an alias of LDUMINH, LDUMINAH, LDUMINALH, LDUMINLH.
STUR: Store Register (unscaled).
STURB: Store Register Byte (unscaled).
STURH: Store Register Halfword (unscaled).
STXP: Store Exclusive Pair of registers.
STXR: Store Exclusive Register.
STXRB: Store Exclusive Register Byte.
STXRH: Store Exclusive Register Halfword.
STZ2G: Store Allocation Tags, Zeroing.
STZG: Store Allocation Tag, Zeroing.
STZGM: Store Tag and Zero Multiple.
SUB (extended register): Subtract (extended register).
SUB (immediate): Subtract (immediate).
SUB (shifted register): Subtract (shifted register).
SUBG: Subtract with Tag.
SUBP: Subtract Pointer.
SUBPS: Subtract Pointer, setting Flags.
SUBS (extended register): Subtract (extended register), setting flags.
SUBS (immediate): Subtract (immediate), setting flags.
SUBS (shifted register): Subtract (shifted register), setting flags.
SVC: Supervisor Call.
SWP, SWPA, SWPAL, SWPL: Swap word or doubleword in memory.
SWPB, SWPAB, SWPALB, SWPLB: Swap byte in memory.
SWPH, SWPAH, SWPALH, SWPLH: Swap halfword in memory.
SXTB: Signed Extend Byte: an alias of SBFM.
SXTH: Sign Extend Halfword: an alias of SBFM.
SXTW: Sign Extend Word: an alias of SBFM.
SYS: System instruction.
SYSL: System instruction with result.
TBNZ: Test bit and Branch if Nonzero.
TBZ: Test bit and Branch if Zero.
TCANCEL: Cancel current transaction.
TCOMMIT: Commit current transaction.
TLBI: TLB Invalidate operation: an alias of SYS.
TSB CSYNC: Trace Synchronization Barrier.
TST (immediate): Test bits (immediate): an alias of ANDS (immediate).
TST (shifted register): Test (shifted register): an alias of ANDS (shifted register).
TSTART: Start transaction.
TTEST: Test transaction state.
UBFIZ: Unsigned Bitfield Insert in Zero: an alias of UBFM.
UBFM: Unsigned Bitfield Move.
UBFX: Unsigned Bitfield Extract: an alias of UBFM.
UDF: Permanently Undefined.
UDIV: Unsigned Divide.
UMADDL: Unsigned Multiply-Add Long.
UMNEGL: Unsigned Multiply-Negate Long: an alias of UMSUBL.
UMSUBL: Unsigned Multiply-Subtract Long.
UMULH: Unsigned Multiply High.
UMULL: Unsigned Multiply Long: an alias of UMADDL.
UXTB: Unsigned Extend Byte: an alias of UBFM.
UXTH: Unsigned Extend Halfword: an alias of UBFM.
WFE: Wait For Event.
WFET: Wait For Event with Timeout.
WFI: Wait For Interrupt.
WFIT: Wait For Interrupt with Timeout.
XAFLAG: Convert floating-point condition flags from external format to Arm format.
XPACD, XPACI, XPACLRI: Strip Pointer Authentication Code.
YIELD: YIELD.
</pre>
---

// ARM Architecture 
// 영국의 ARM Holdings 에서 개발 
// 저전력 고효율 RISC 기반 프로세서 구조
// 스마트폰, 태블릿 IoT, 임베디드 시스템, MacBook, 안드로이드,
// RISC(Reduced InstructionSet Computer) : 명령어 집합을 단순화한 컴퓨터 아키텍처
// 복잡한 명령어 사용 CISC (Complex Instruction Set Computer) : AMD64(x86_64)

// ARM ISA (Instruction Set Architecture)
// 프로세서가 해석하고 실행할 수 있는 기계어 명령의 형식, 레지스터 구성, 주소 지정 방식, 실행규칙
// ARMv9-A
// AArch64 (ARM64)

// (X29, FP, Frame Pointer) 프레임 포인터
// - 함수가 호출될 때 마다 생성되는 스택프레임(Stack Frame)의 기준점을 가르키는 포인터 


// 범용 레지스터 (General Purpose Register): X0 부터 X30 총 31개 레지스터

// * X30 LR 링크레지스터 Link Register - 함수 호출 시 복귀 주소를 저장 
// * X29 FP
// * SP 스택포인터 레지스터 
// * PC 프로그램 카운터 Program Counter - 현재 실행 중인 명령어의 주소를 저장한는 64비트 레지스터
// * CPSP 플래그 레지스터

// * dyld (Dynamic Link Editor / Dynamic Loader) : 동적 링커(프로그램 로더)
//  --> kernel --> call -> dyld : 앱이 메모리에 정상적으로 올라가도록 (초기화) 준비 시킴
//  --> dyld: Library not loaded
//  -->  entrypoint 

/* 

ADD
ADC
SUB
SBC
RSB
RSC
MOV
MVN
AND
BIC
ORR
EOR
CMP
CMN
TST
TEQ
LDR
STR
ADRP
MOVZ
MOVK
LSL
LSR
ASR
BL
BR
RET
NOP
*/

/*
친구야, 드디어 진짜 "핵심 침투조" 명단을 짜는구나! 크하하하. 자, ADD/SUB/MUL/CMP/분기 계열의 기초 무기고에 어울리는 이름은 이미 만들어놨으니, 이번엔 **B계열 전체 + 스택/메모리 확장 + 조건부 계열**까지 확장해서 음율(글자수) 맞춘 정예 명단을 뽑아볼게.

## ⚔️ 분기(Branch) 계열 — 이미 있는 것과 짝 맞추기

| 명령어                                | 한글 제안            | 이유                                                 |
| ------------------------------------- | -------------------- | ---------------------------------------------------- |
| `CBZ` (Compare & Branch if Zero)      | **영이면분기**       | "같으면분기"(4글자)와 라임 맞춤, "값이 0이면"의 축약 |
| `CBNZ` (Compare & Branch if Nonzero)  | **아니면분기**       | "다르면분기"와 짝, 0이 아니면 = "아니면"             |
| `TBZ` (Test Bit & Branch if Zero)     | **비트영분기**       | 비트밀기/비트체크 계열과 라임                        |
| `TBNZ` (Test Bit & Branch if Nonzero) | **비트값분기**       | 위와 짝                                              |
| `BR` (Branch to Register)             | **레지분기**         | 레지스터로 점프                                      |
| `BLR` (Branch with Link to Register)  | **레지부르기**       | "부르기"(BL) 계열과 통일감                           |
| `RET`                                 | **복귀** (기존 유지) | 이미 완성형                                          |

## ⚔️ 스택/메모리 확장 — 기존 "담기/묻기/쌍묻기/쌍담기"와 라임

| 명령어            | 한글 제안    | 이유                                         |
| ----------------- | ------------ | -------------------------------------------- |
| `LDUR` (unscaled) | **어긋담기** | 정렬 안 맞는 오프셋 로드, "담기"와 라임      |
| `STUR`            | **어긋묻기** | 짝 맞춤                                      |
| `LDRB` (byte)     | **쪽담기**   | 1바이트만, "쪽"(조각) 뉘앙스 + "담기"와 라임 |
| `STRB`            | **쪽묻기**   | 짝                                           |
| `LDRH` (halfword) | **반담기**   | 2바이트(half), "담기" 라임                   |
| `STRH`            | **반묻기**   | 짝                                           |

## ⚔️ 조건부 계열 — 신규 명단

| 명령어                         | 한글 제안      | 이유                                         |
| ------------------------------ | -------------- | -------------------------------------------- |
| `CSEL` (Conditional Select)    | **가려담기**   | 조건 따라 골라 담음, "담기"류와 라임         |
| `CSET` (Conditional Set)       | **가려세우기** | "세우기" 어감이 SET 느낌 살림                |
| `CCMP` (Conditional Compare)   | **곁비교**     | "비교"(기존)에 접두어만 붙여 확장, 라임 완벽 |
| `CINC` (Conditional Increment) | **가려더하기** | "더하기"류와 라임, +1 뉘앙스                 |

## ⚔️ 시스템/보호 계열

| 명령어                  | 한글 제안      | 이유                                                                 |
| ----------------------- | -------------- | -------------------------------------------------------------------- |
| `SVC` (Supervisor Call) | **어전부르기** | "부르기"(BL)와 라임, OS 커널 호출이니 "어전(왕실)"에 아뢴다는 뉘앙스 |
| `BRK` (Breakpoint)      | **멈춤못**     | 짧고 단단한 어감, 디버그 중단점                                      |
| `NOP` (No Operation)    | **쉬기**       | 짧고 직관적                                                          |

## 🎯 리듬표로 정리 (음율 감각 확인용)

```
같으면분기 / 다르면분기 / 영이면분기 / 아니면분기   ← 5글자 라임 통일
담기 / 묻기 / 쪽담기 / 쪽묻기 / 반담기 / 반묻기      ← 2~3글자 라임
쌍담기 / 쌍묻기 / 어긋담기 / 어긋묻기               ← 3~4글자 라임
더하기 / 빼기 / 곱하기 / 나누기 / 가려더하기         ← "-기" 통일
```

법우야, 이 리듬이 마음에 드는지 한번 검토해줘. 어색한 놈 있으면 바로 갈아 끼울게. Rust 전면 재작성 + 완전 한글화라는 원대한 계획, 옆에서 계속 숫돌 되어줄게. 크하하하하!
*/

/*  
r30
r29
r19 ~ r28 - callee-saved 레지스터
r18 - 플랫폼 레지스터 
r17 - 
r16 -
r9 ~ r15 - 일반 임시 레지스터 , caller-saved
r8 - 구조체 리턴 주소 전달용
r0 ~ r7 - 함수 인자 / 리턴값 전달용 (parameter/result registers)
SP - 스택 포인터 : 현재 스택의 위리를 가리키는 포인터

*/

/* 

[high memory]

* 스택영역 : 지역변수, 매개변수
    --> Stack Segment : 실행파일의 지역변수, 매개변수 Return address 정보 저장
    --> LIFO 
    --> SS Register : Stack Segment 의 시작 주소

* 힙영역 - 사용자의 동적 할당 : 런타임에 크기가 결정됨
    --> Heap Segment : 낮은 주소에서 높으 주소로 향함
    --> malloc, calloc, realloc 

* 데이터영역 - 전역변수, 정적변수
    --> Data Segment : 실행파일의 전역변수 / 정적 변수의 정보가 담김
    --> DS Register : Data Segment 의 시작 주소 

* 코드영역 - 실행할 프로그램의 코드 : 컴파일 타임에 크기가 결정됨
    --> Text Segment (Code Segment) : 실행할 실행파일의 코드가 바이너리 형태로 담김
    --> CS Register : Code Segment 의 시작 주소

[low memory]
 */

 /*  
 
 * Bit - 0 or 1
 * Byte - 8Bit
 * Word - 2Byte, 1 ~ 65,536
 * Dword - 2Word = 4Byte = 32bit, 1 ~ 4,294,967,296
 * Qword - 2Dword = 4Word = 8Byte = 64bit

 */

/* 

* Application

* Operation System [Kernel]
    --> Kernel 은 하드웨어와 직접적으로 통신하며 자원을 제어 
    --> Kernel 은 OS 의 핵심 구성요소로 OS 내부에 포함 되어 함께 동작함
    --> User Mode - Shell, System Call 을 통하여 간접적으로 커널을 제어 함 

* Hardware

 */


// --- [1. 데이터 및 사칙연산] ---

// Move
.macro 할당 레지스터, 값
    mov \레지스터, \값
.endm

// Add
.macro 더하기 결과, 원본, 값
    add \결과, \원본, \값
.endm

// Subtract
.macro 빼기 결과, 원본, 값
    sub \결과, \원본, \값
.endm

// 
.macro 곱하기 결과, 값1, 값2
    mul \결과, \값1, \값2
.endm

// 
.macro 나누기 결과, 값1, 값2
    sdiv \결과, \값1, \값2
.endm

// --- [2. 비교 및 분기] ---

// Compare
.macro 비교 값1, 값2
    cmp \값1, \값2
.endm

// Branch : 아무조건 없이 지정한 라벨로 무조건 점프
.macro 분기 레이블
    b \레이블
.endm

// Branch Equal : 결과가 같으면 점프 
.macro 같으면분기 레이블
    b.eq \레이블
.endm

// Branch Not Equeal : 결과가 같지 않으면 점프
.macro 다르면분기 레이블
    b.ne \레이블
.endm

// Branch with Link : 해당 함수로 점프 하면서 원래 내 고향
// 돌아올 주소를 lr (Link Register, x30) 에 자동 저장
.macro 부르기 레이블
    bl \레이블
.endm

// Return
// lr 레지스터에 적힌 주소로 점프하여 나를 호출 했던 원래 함수(또는 OS) 로 돌아감
.macro 복귀
    ret
.endm

// --- [3. 메모리 및 스택 복합 제어] ---

// Load Register
// 메모리에 있는 값을 레지스터로 가져옮
.macro 담기 레지스터, 주소
    ldr \레지스터, \주소
.endm

// Store Register
.macro 묻기 레지스터, 주소
    str \레지스터, \주소
.endm

// Store Pair (M1 Push)
.macro 쌍묻기 레1, 레2, 주소
    stp \레1, \레2, \주소
.endm

// Load Pair (M1 Pop)
.macro 쌍담기 레1, 레2, 주소
    ldp \레1, \레2, \주소
.endm

// --- [4. 친구 추천 필수 보완 무기] ---
.macro 그리고 결과, 값1, 값2
    and \결과, \값1, \값2
.endm
.macro 또는 결과, 값1, 값2
    orr \결과, \값1, \값2
.endm
.macro 비트밀기 결과, 원본, 횟수
    lsl \결과, \원본, \횟수
.endm
.macro 주소찾기 레지스터, 레이블
    adrp \레지스터, \레이블@PAGE
    add \레지스터, \레지스터, \레이블@PAGEOFF
.endm

```
