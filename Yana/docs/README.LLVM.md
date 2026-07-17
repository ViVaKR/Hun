# LLVM PROJECT for Hun

## Git Clone `llvm-project`

```bash
git clone https://github.com/llvm/llvm-project.git
du -sh llvm-project/

# 기타 진실의 방 명령
git rev-parse HEAD
git count-objectts -vH
cat .gitmodules 2>/dev/null && echo "서브모듈 정의 있음" || echo "❌ .gitmodules 파일 자체가 없음"
git log --oneline -1
git rm -rf --chced .
du -sh .git

# 기타 공격목표 파일 찾기 예시
find . -path "*AsmLexer.cpp"
find ~/llvm-project -path "*/MC/MCParser/AsmLexer.cpp"
```

### llvm-project build

```bash
cmake -S llvm -B build -G Ninja \
    -DLLVM_ENABLE_PROJECTS="clang" \
    -DLLVM_TARGETS_TO_BUILD="AArch64" \
    -DCMAKE_BUILD_TYPE=Release \
    -DLLVM_PARALLEL_LINK_JOBS=2 \
    -DCMAKE_EXPORT_COMPILE_COMMANDS=ON

ninja -C build
```

### '훈' 타켓파일 목록

- llvm-project/llvm/lib/MC/MCParser/AsmLexer.cpp
  - static bool isIdentityfierChar(char C, bool AllowAt, bool AllowHash);

### lldb

```bash

# ARM64 _main
clang -arch arm64 -o hello hello.s
./hello
echo $?

# ARM64 _start
as -o if_else.o if_else.s
ld -o if_else if_else.o -lSystem -syslibroot $(xcrun --sdk macosx --show-sdk-path) -e _main -arch arm64

# C compile
clang -arch arm64 -o hello.o ./main.c
ld hello.o -o hello -l System -syslibroot `xcrun -sdk macosx --show-sdk-path` -e _main -arch arm64

xcrun -sdk macosx --show-sdk-path

# =============== (lldb) ===============
register read/d
register read --all
registar read x0, x1, x2

# 메모리 덤프 (4바이트씩 hex로)
x/4xb &msg_format
memory read &msg_format

# sp 부터 8워드(64bye)를 hex 로 펼쳐봄,
# 스택프레임이 꼬였을때
# stp/ldp 짝이 안 맞을 때

# 스택메모리 덤프
memory read -f x -c 8 $sp

# 상수/변수의 메모리 주소
p &msg_format
image lookup -n msg_format
expression &msg_format

# 그 주소의 메모리 내용 보기
memory read &msg_format
memory read --format s --count 1 $x0

# 문자열로 보기
memory read -f s &msg_format
# 레지스터에 담긴 주소가 가리키는 곳 보기
memory read $x0
memory read -fx -c4 -s4 $address
memory read --size 4 --format x --count 4 0xbffff3c0
me r -s4 -fx -c4 0xbffff3c0
x/s $x0
x -s4 -fx -c4 0xbffff3c
x/4gx $sp

# 메모리 주소 감시
watchpoint set expression -w write -- $sp

# 심볼이 있는 변수
watchpoint set variable msg_format

# 텍스트(Text) / 데이터(Data) 영역 감상
# --> 프로그램 코드영역이나 포맷스트링 같은 문자열 데이터 영역을 보고 싶다면
# 주소창에 해당 주소값을 그대로 치거나 라벨 이름을 넣으면 무서운 기계어 번호들이 바이트 단위로 나열된것을 볼 수 있음.

# 여러 레지스터를 한번에 볼때
target stop-hok add -o "register read x0 x1 x29 x30 sp"
target stop-hook add -o "register read x0 x1"

# 등록된 훅 번호 확인
target stop-hook list
tart stop-hook delete 1 // 1번훅 삭제
target stop-hook add -o "x/8regx \$sp"
target stop-hok add
    > x/4gx $sp
    > register read x0 x1 x2
    > DONE
target stop-hook delete or disable
target stop-hook list
target module dump sections
target stop-hook add -o "x4/gx $sp"
target module dump sections

finish (f) 함수탈출 : Step Out
next (n) 다음줄로 : Step Over
step (s, si) : Step Into 함수 내부로 들어가기

fr v (frame variable) -f : display format -c : count -s : size of data

image lookup -v -a $sp
image lookup -F "main"
image lookup -f "main.c"

expression char * $demo = "Hello, World"
expr int $num = 10
p a

br s -n main

# 조건부 멈추기
br s -n _chain_func -c '$x0 == 100'

# 콜스택 확인 : 내가 지금 어디서 불려왔지?
# 호출스택 확인
bt
frame select 1 // 스택프레임 이동 (호출자 쪽으로)

# 어셈블리 명령어로 디스어셈블
disassemble -n _main

# po (Print Object) : 객체를 "설명"으로 예쁘게 출력
p $x0
x/s $x0

# register
register read --format d x0
register readd --all
register read -f b x0 // 2진수로 보고 싶을때 (비트연산 디버깅용)

 # [플래그] NZCV 플래그 (조건 플래그ㅒ 확인
 - cmp, b.eq, b.ne 디버깅 필수
 - cmp 하고 b.eq 가 원하는대로 안튈때
 - Zero/Carry/Negtive/Overflow 플래그 새팅확인
 register read cpsr

 # 다음 함수까지 쭉 실행 (스텝인 대신)
 ni // step over (si 는 step into, ni 는 건너뛰기)
 finish // 현재 함수 끝가지 실행하고 호출자로 복귀

 - _printf 안에서 si 하면 libc 내부까지 딸려 들어가서
 headahe - 이럴때 ni 로 건너뛰는게 정신 건강에 좋음.

 # 디스어셈블 + 현재 위치 동시에
 # 현재 실행위치 하이라이트
 disassemble --pc

# 테스트 1
nm /tmp/한글테스트
0000000100000000 T __mh_execute_header
00000001000002d8 T _main
00000001000002e8 t 함수야

# 테스트 2
❈ objdump -t /tmp/한글테스트
/tmp/한글테스트:    file format mach-o arm64

SYMBOL TABLE:
00000001000002e8 l     F __TEXT,__text 함수야
0000000100000000 g     F __TEXT,__text __mh_execute_header
00000001000002d8 g     F __TEXT,__text _main


### 하노이 탑 고급 디버깅을 위한 상남자 명령어 세트 ###
## 1. 프레임 가시화 및 컨텍스트 스위칭 (f & bt)
# 재귀 호출이 깊어 지면 지금 몇 번째 하오니 탑에 빠져 있는지 헷갈림
# 영혼의 동반자 명령어 
# 현재 쌓여 있는 모든 스택 프레임을 위에서 아래오 쫙 보여줌
(lldb) bt

# bt 결과에서 3번 프레임 (과거 시점의 부모 함수 호출 상태)으로 시간 이동
# 이동하는 순간 해당 시점의 레지스터와 메모리 상태를 뜯어볼 수 있음
(lldb) f 3

## 2. 레지스터 통째로 털기 (register read)
# 인자값 (x0 ~ x3)과 스택 포인터들이 제대로 돌고 있는지 실시간으로 모니터링
# 기능: 인자값 전용 레지스터만 쏙 골라서 현재 원반 개수와 기둥번호를 확인 합니다.
(lldb) register read x0, x1, x2, x3

# 기능 : 상남자라면 무릇 CPU의 오든 레지스터 상태를 한 화면에 가득 채워 출력하기 필수
(lldb) register read --all

## 3. 스택 메모리 생으로 뜯어보기(x)
# 하노이 탑은 자기 자신을 호출하기 전에 반드시 x29, x30과 남은 원반 갯수(x0) 등을 스택에 백업함
# 메모리에 백업된 스택 프레임을 16진수로 직접 저격 하기
# 기능: 현재 스택 포인터($sp)부터 8바이트(g)씩  4개 단위를 16진수(x) 로 생으로 출력 하기
# x29(FP) 와 x30(LR) 이 이쁘게 주차되어 있는지 내눈으로 직접 확인하는 고급 기술
(lldb) x/4gx $sp

## 4. 기계어 한 줄씩 즈려 밟기 (si & disassemble)
# 소스코드가 아니라 실제 ARM64 기계어 명령어 단위로 쪼개서 디버깅 하기
# 기능 : 현재 멈춰 서 있는 어셈블리 명령어 주변 코드를 화살표와 함께 보여줌 
(lldb) disassemble --frame

# 기능 : next 처럼 함수를 건너뛰는게 아니라, bl 이나 blr 을 만나면 함수 내부 기계어 첫줄로 직접 기어 들어가는 명령어
# Step Intruction
(lldb) si

### [실전] 하노이 탑 디버깅 시나리오 ###

## (머리속 로직)
# -> n == 0 이면 리턴 (Base Case)
# -> hanoi(n-1, 출발, 보조, 목적); // 목적지와 보조를 바꿈
# -> printf("원반 %d: %d -> %d\n", n, 출발, 목적);
# -> hanoi(n-1, 보조, 목적, 출발); // 출발과 보조를 바꿈

# 1. 하노이 탑 함수 시작 지점에 브레이크포인트 장착!
(lldb) b _hanoi

# 2. 프로그램 질주 시작
(lldb) run

# 3. 첫 번째 중단! 현재 인자값 확인 (예: 원반 3개, 1번 기둥에서 3번 기둥으로)
(lldb) register read x0 x1 x2 x3
x0 = 0x0000000000000003  <- n = 3
x1 = 0x0000000000000001  <- 출발 = 1
x2 = 0x0000000000000003  <- 목적 = 3
x3 = 0x0000000000000002  <- 보조 = 2

# 4. 재귀 호출 안으로 계속 진입하기 위해 기계어 단위로 따라 들어감
(lldb) si

# 5. 한 3~4번 들어가서 재귀가 깊어졌을 때, 현재 스택이 얼마나 아름답게 쌓였나 확인
(lldb) bt
* frame #0: 0x0000000100003f10 my_hanoi`hanoi at menu_hanoi.S:15
  frame #1: 0x0000000100003f44 my_hanoi`hanoi at menu_hanoi.S:34
  frame #2: 0x0000000100003f44 my_hanoi`hanoi at menu_hanoi.S:34
  frame #3: 0x0000000100003ea8 my_hanoi`main at main.S:20

# 6. frame #2 (부모 함수 시점)로 시간 이동해서 당시의 원반 개수(x0) 털어보기
(lldb) f 2
(lldb) register read x0

```

### 하노이탑 구현 

```s
// =============================================================
// 파일명: menu_hanoi.S
// 목적: ARM64 Calling Convention 복습용 하노이 탑 (원반 3개)
// =============================================================
.include "hun.macros.inc"

CSTRING_SECTION
// 출력 서식: "원반 [n]: [출발기둥] -> [목적기둥]"
fmt_hanoi: .asciz "원반 %d: %d -> %d\n"

CODE_SECTION

// -------------------------------------------------------------
// 함수명: menu_hanoi (메인 매니저가 호출할 진입점)
// -------------------------------------------------------------
FUNC_START menu_hanoi, 16
    // 하노이 재귀 함수 호출 준비
    mov     x0, #3          // x0 = 원반 개수 (3층)
    mov     x1, #1          // x1 = 1번 기둥 (출발)
    mov     x2, #3          // x2 = 3번 기둥 (목적)
    mov     x3, #2          // x3 = 2번 기둥 (보조)
    bl      _hanoi          // 하노이 재귀 스타트!

    FUNC_EXIT_LIGHT 16

// -------------------------------------------------------------
// 함수명: hanoi (실제 재귀가 일어나는 상남자 핵심 루틴)
// 인자: x0=n, x1=from, x2=to, x3=via
// -------------------------------------------------------------
.global _hanoi
_hanoi:
    // [기본 조건 검사] n이 0이면 재귀 탈출
    cmp     x0, #0
    b.eq    _hanoi_return

    // [프롤로그] 재귀 호출을 위해 현재 인자들과 레지스터를 스택에 백업!
    // 변수가 많으므로 안전하게 48바이트 확보합니다.
    stp     x29, x30, [sp, #-48]!
    mov     x29, sp
    
    // 재귀 돌리면서 값이 덮어써지면 안 되므로 피호출자 저장 레지스터(callee-saved)에 백업
    stp     x19, x20, [sp, #16]    // x19 = n,  x20 = from
    stp     x21, x22, [sp, #32]    // x21 = to, x22 = via
    
    // 현재 인자들을 안전한 곳으로 이사
    mov     x19, x0
    mov     x20, x1
    mov     x21, x2
    mov     x22, x3

    // ---------------------------------------------------------
    // 단계 1: hanoi(n-1, from, via, to)
    // ---------------------------------------------------------
    sub     x0, x19, #1     // n - 1
    mov     x1, x20         // 출발(from) 그대로
    mov     x2, x22         // 목적지를 보조(via)로 변경 👈
    mov     x3, x21         // 보조를 목적지(to)로 변경  👈
    bl      _hanoi

    // ---------------------------------------------------------
    // 단계 2: 현재 원반 이동 출력 (printf)
    // ---------------------------------------------------------
    LOAD_STR x0, fmt_hanoi  // 포맷 문자열 로드 ("원반 %d: %d -> %d\n")
    mov     x1, x19         // 인자 1: n
    mov     x2, x20         // 인자 2: from
    mov     x3, x21         // 인자 3: to
    bl      _printf

    // ---------------------------------------------------------
    // 단계 3: hanoi(n-1, via, to, from)
    // ---------------------------------------------------------
    sub     x0, x19, #1     // n - 1
    mov     x1, x22         // 출발을 보조(via)로 변경 👈
    mov     x2, x21         // 목적지(to) 그대로
    mov     x3, x20         // 보조를 출발(from)로 변경 👈
    bl      _hanoi

    // [에필로그] 내 스택 완벽히 치우고 부모 함수로 복귀!
    ldp     x21, x22, [sp, #32]
    ldp     x19, x20, [sp, #16]
    ldp     x29, x30, [sp], #48

_hanoi_return:
    ret

```

### 🕵️ 훈련소 입소 완료! 

> lldb로 이 코드 털어먹는 관전 포인트 위 코드를 빌드해서 lldb로 들어간 뒤, 아래 순서대로 맛보시면 뇌가 짜릿해집니다
>> 1. 터미널에서 lldb ./프로그램이름 진입 후 b _hanoi 쳐서 브레이크포인트 장착!
>> 2. run을 치면 첫 진입(n=3) 상태에서 멈춥니다.
>> 3. c(continue)를 두 번 더 눌러서 n=1일 때까지 깊숙이 들어갑니다.
>> 4. 그 상태에서 bt를 딱 치면! _hanoi 함수가 스택 프레임에 층층이 쌓여있는 기가 막힌 탑을 보실 수 있습니다.
>> 5. register read x19 x20 x21을 치면 각 층(Frame)마다 보존되고 있는 원반 번호와 기둥 상태가 눈에 보입니다.

---

### 명령어 옵션

apropos -- List debugger commands related to a word or subject.
breakpoint -- Commands for operating on breakpoints (see 'help b' for shorthand.)
command -- Commands for managing custom LLDB commands.
diagnostics -- Commands controlling LLDB diagnostics.
disassemble -- Disassemble specified instructions in the current target. Defaults to the current function for the current thread and stack frame.
dwim-print -- Print a variable or expression.
expression -- Evaluate an expression on the current thread. Displays any returned value with LLDB's default formatting.
frame -- Commands for selecting and examining the current thread's stack frames.
gdb-remote -- Connect to a process via remote GDB server.
If no host is specified, localhost is assumed.
gdb-remote is an abbreviation for 'process connect --plugin gdb-remote connect:
gui -- Switch into the curses based GUI mode.
help -- Show a list of all debugger commands, or give details about a specific command. kdp-remote -- Connect to a process via remote KDP server.
kdp-remote is an abbreviation for 'process connect --plugin kdp-remote udp:
language -- Commands specific to a source language.
log -- Commands controlling LLDB internal logging.
memory -- Commands for operating on memory in the current target process.
platform -- Commands to manage and create platforms.
plugin -- Commands for managing LLDB plugins.
process -- Commands for interacting with processes on the current platform.
protocol-server -- Start, stop, and query protocol servers.
quit -- Quit the LLDB debugger.
register -- Commands to access registers for the current thread and stack frame.
scripting -- Commands for operating on the scripting functionalities.
session -- Commands controlling LLDB session.
settings -- Commands for managing LLDB settings.
source -- Commands for examining source code described by debug information for the current target process.
statistics -- Print statistics about a debugging session
target -- Commands for operating on debugger targets.
thread -- Commands for operating on one or more threads in the current process.
trace -- Commands for loading and using processor trace information.
type -- Commands for operating on the type system.
version -- Show the LLDB debugger version.
watchpoint -- Commands for operating on watchpoints.
Current command abbreviations (type 'help command alias' for more info):
add-dsym -- Add a debug symbol file to one of the target's current modules by specifying a path to a debug
symbols file or by using the options to specify a module.
attach -- Attach to process by ID or name.
b -- Set a breakpoint using one of several shorthand formats, or list the existing breakpoints if no arguments are provided.
bt -- Show backtrace of the current thread's call stack. Any numeric argument displays at most that
many frames. The argument 'all' displays all threads. Use 'settings set frame-format' to
customize the printing of individual frames and 'settings set thread-format' to customize the
thread header. Frame recognizers may filter the list. Use 'thread backtrace -u (--unfiltered)'
to see them all.
c -- Continue execution of all threads in the current process.
call -- Evaluate an expression on the current thread. Displays any returned value with LLDB's default formatting.
continue -- Continue execution of all threads in the current process.
detach -- Detach from the current target process.
di -- Disassemble specified instructions in the current target. Defaults to the current function for the current thread and stack frame.
dis -- Disassemble specified instructions in the current target. Defaults to the current function for the current thread and stack frame.
display -- Evaluate an expression at every stop (see 'help target stop-hook'.)
down -- Select a newer stack frame. Defaults to moving one frame, a numeric argument can specify an arbitrary number.
e -- Evaluate an expression on the current thread. Displays any returned value with LLDB's default formatting.
env -- Shorthand for viewing and setting environment variables.
exit -- Quit the LLDB debugger.
f -- Select the current stack frame by index from within the current thread (see 'thread backtrace'.)
file -- Create a target using the argument as the main executable.

finish -- 함수탈출 (f), Finish executing the current stack frame and stop after returning.
Defaults to current thread unless specified.

h -- Show a list of all debugger commands, or give details about a specific command.
history -- Dump the history of commands in this session.
Commands in the history list can be run again using "!<INDEX>". "!-<OFFSET>" will re-run the
command that is <OFFSET> commands from the end of the list (counting the current command).
image -- Commands for accessing information for one or more target modules.
j -- Set the program counter to a new address.
jump -- Set the program counter to a new address.
kill -- Terminate the current target process.
l -- List relevant source code using one of several shorthand formats.
list -- List relevant source code using one of several shorthand formats.
n -- Source level single step, stepping over calls. Defaults to current thread unless specified.

next -- 다음줄로 (n), 함수내보로 안들어 가고 그냥 다음 줄로 건너뛰기.
Source level single step, stepping over calls. Defaults to current thread unless specified.

nexti -- Instruction level single step, stepping over calls. Defaults to current thread unless specified.

ni -- Instruction level single step, stepping over calls. Defaults to current thread unless specified.
p -- Print a variable or expression.
parray -- parray <COUNT> <EXPRESSION> -- lldb will evaluate EXPRESSION to get a
typed-pointer-to-an-array in memory, and will display COUNT elements of that type from the array.
po -- Evaluate an expression on the current thread. Displays any returned value with formatting controlled by the types order
poarray -- lldb will evaluate EXPRESSION to get the address of an array
of COUNT objects in memory, and will call po on them.
print -- Print a variable or expression.
q -- Quit the LLDB debugger.
r -- Launch the executable in the debugger. If no run-args are specified, the arguments from
target.run-args are used.
rbreak -- Sets a breakpoint or set of breakpoints in the executable.
re -- Commands to access registers for the current thread and stack frame.
run -- Launch the executable in the debugger. If no run-args are specified, the arguments from
target.run-args are used.
s -- Single step, optionally to a specific function.
script -- Invoke the script interpreter with provided code and display any results. Start the
interactive interpreter if no code is supplied.
shell -- Run a shell command on the host.
si -- Instruction level single step, stepping into calls. Defaults to current thread unless specified.
sif -- Step through the current block, stopping if you step directly into a function whose name matches the TargetFunctionName.
step -- Single step, optionally to a specific function.
stepi -- Instruction level single step, stepping into calls. Defaults to current thread unless specified.
t -- Change the currently selected thread.
tbreak -- Set a one-shot breakpoint using one of several shorthand formats.
undisplay -- Stop displaying expression at every stop (specified by stop-hook index.)
up -- Select an older stack frame. Defaults to moving one frame, a numeric argument can specify an arbitrary number.
v -- Show variables for the current stack frame. Defaults to all arguments and local variables in
scope. Names of argument, local, file static and file global variables can be specified.
var -- Show variables for the current stack frame. Defaults to all arguments and local variables in
scope. Names of argument, local, file static and file global variables can be specified.
vo -- Show variables for the current stack frame. Defaults to all arguments and local variables in
scope. Names of argument, local, file static and file global variables can be specified.
x -- Read from the memory of the current target process.

---
