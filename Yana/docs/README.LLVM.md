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

# _main
clang -arch arm64 -o hello jun.s
./hello
echo $?

# _start 
as -o if_else.o if_else.s
ld -o if_else if_else.o -lSystem -syslibroot $(xcrun --sdk macosx --show-sdk-path) -e _main -arch arm64

## (lldb)
register read/d
register read --all
(lldb) memory read --size 4 --format x --count 4 0xbffff3c0
(lldb) me r -s4 -fx -c4 0xbffff3c0
(lldb) x -s4 -fx -c4 0xbffff3c
(lldb) gui
(lldb) si  ; stepi
(lldb) c
(lldb) continue

# 스택영역 감상 
$sp

# 텍스트(Text) / 데이터(Data) 영역 감상
# --> 프로그램 코드영역이나 포맷스트링 같은 문자열 데이터 영역을 보고 싶다면
# 주소창에 해당 주소값을 그대로 치거나 라벨 이름을 넣으면 무서운 기계어 번호들이 바이트 단위로 나열된것을 볼 수 있음.


x/4gx $sp
 
 target stop-hook add -o "x/8regx \$sp"
 target stop-hok add
    > x/4gx $sp
    > register read x0 x1 x2
    > DONE

 registar read x0, x1, x2
 target stop-hook delete or disable
 target stop-hook list
 finish (f) 함수탈출 : Step Out
 next (n) 다음줄로 : Step Over
 step (s, si) : Step Into 함수 내부로 들어가기
 image lookup -v -a $sp
 target module dump sections

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
```

### 명령어 옵션 모음

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

finish -- 함수탈출 (f),  Finish executing the current stack frame and stop after returning. 
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
poarray --  lldb will evaluate EXPRESSION to get the address of an array
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
