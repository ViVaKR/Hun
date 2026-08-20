# Doc

### Create vscode extension project

```bash

npm install -g yo generator-code --foreground-scripts --allow-scripts
yo --version

mkdir project-name
cd project-name
yo code


# Azure DevOps , PAT (2026년 12월 1일부로 폐지 예정)
# 그 이후 - Entra ID 기반 (vsce publish --azure-credential), CI/CD
npm install -g @vscode/vsce
cd yeoji-forest
vsce package
vsce login [ID] + PAT
vsce publish


# ovsx publis
npm install -g ovsx
ovsx create-namespace buddham-hq
ovsx publish -p <open-vsx-token>
```

### Git Commit with Tag

```bash
git add package.json README.md src/extension.js src/symbol-index.js
git commit -m "feat: 워크스페이스 전역 심볼 인덱스 도입 — 파일 경계를 넘는 인텔리센스 🗂️⚡ (v2.5.0)

- 파일 저장/생성/삭제를 감시하며 증분 갱신되는 인메모리 심볼 인덱스 신설
  (symbol-index.js) — 재활성화·재스캔 없이 프로젝트 전체를 항상 최신 상태로 유지
- 자동완성: 현재 파일뿐 아니라 워크스페이스 전체에 정의된 함수/라벨이
  출처 파일명과 함께 후보로 노출
- Go to Definition(F12): 클릭마다 최대 300개 파일을 재오픈하던 방식을
  인덱스 즉시 조회로 교체 — 프로젝트가 커져도 체감 속도 유지
- 신규: Ctrl+T/Cmd+T 워크스페이스 심볼 검색(registerWorkspaceSymbolProvider) 지원
- README(EN/KR) 및 package.json 버전 2.4.2 → 2.5.0 갱신"

git tag -a v2.5.0 -m "워크스페이스 전역 인텔리센스 — 심볼 인덱스 도입"

git push origin main --follow-tags

# --- vsix file upload --- #
gh auth status

# gh auth refresh -s repo

gh release create v2.5.0 tools/hun-asm-highlighter/hun-asm-highlighter-2.5.0.vsix \
  --title "v2.5.0" \
  --notes "워크스페이스 전역 인텔리센스 — 심볼 인덱스 도입"

git add .
git commit -m "release: v2.1.2 니모닉 블록별 칼군무 정렬 엔진 탑재"
git tag -a v2.1.2 -m "v2.1.2: 천년의 한을 풀어낸 오퍼랜드 칼정렬 엔진 패치"
git push origin main --tags
```

### Extension

```bash
vsce login buddham-hq


```

- PAT 자체가 없어지거나 새로 필요한 경우
- PAT는 Azure DevOps 쪽에서 발급하는 토큰이라, 유효기간이 있을 수 있어요(보통 발급할 때 90일/1년/커스텀 선택). 
- 만료되면 다시 `https://marketplace.visualstudio.com/manage/publishers/buddham-hq/` 페이지에서 새로 발급

---

### Cache

```bash
# 2. 이미 추적 중인 kernel.elf를 추적 목록에서만 제거
git rm --cached Yeoji/kernel.elf

# 3. 확인
git status

# 4. .gitignore 수정본과 함께 커밋
git add .gitignore
git commit -m "chore: stop tracking build artifact kernel.elf"
```

```bash
# 1. 소스코드만 커밋 (vsix 제외, .gitignore로 걸러짐)
git add .
git commit -m "release: v2.3.36 신규 니모닉 126개 인텔리센스 추가"
git tag -a v2.3.36 -m "highligher release 신규 니모닉 126개 인텔리센스 추가"
git push origin main --tags

# 2. vsce로 vsix 패키징 (로컬에서 생성, git엔 안 올라감)
vsce package

# 3. GitHub 웹사이트 또는 gh CLI로 Release 생성하며 vsix 첨부
gh release create v2.3.36 tools/hun-asm-highlighter/hun-asm-highlighter-2.3.36.vsix \
  --title "v2.3.36" \
  --notes "highligher 신규 니모닉 126 인텔리센스 추가"

# 다운로드 링크 예시
https://github.com/vivakr/hun/releases/download/v2.2.2/hun-asm-highlighter-2.2.2.vsix
```

### 예시 2

```bash
# 1. 꼬인 임시 폴더는 커밋 범위에서 깨끗하게 배제하기 위해
#    오직 hun-asm-highlighter 관련 변경사항 및 신규 데이터 파일만 조준 사격(Add)하네!
git add tools/hun-asm-highlighter/package.json
git add tools/hun-asm-highlighter/src/extension.js
git add tools/hun-asm-highlighter/src/data/arm64-data.js

# 2. 순혈주의 커밋 실행! (다른 작업인 Yana나 yeoji-forest는 커밋되지 않고 깨끗하게 남겨둠)
git commit -m "feat(highlighter): integrate ARM64 intellisense to lowercase"


# 3. 영광스러운 태그 생성 (자네의 package.json에 명시된 버전인 v2.2.2 혹은 배포할 버전 번호 입력!)
git tag -a v2.3.30 -m "Release v2.3.30: "

# 4. 원격 저장소로 오직 커밋된 순혈 코드와 태그만 Push!
git push origin main --tags

gh release create v2.3.30 tools/hun-asm-highlighter/hun-asm-highlighter-2.3.30.vsix \
  --title "v2.3.30" \
  --notes "### 👑 Hun-ASM Code Snippets v2.3.30
  -- **ARM64 코드제안 대문자에서 소문자로 변경**"

# 로컬에서 패키징 먼저 싹 해주고 (이미 되어 있다면 패스!)
# vsce package
# 릴리즈 생성 및 vsix 첨부 (타이틀과 태그 버전을 모두 v2.2.2로 맞췄네!)
gh release create v2. tools/hun-asm-highlighter/hun-asm-highlighter-2.2.2.vsix \
  --title "v2.2.2" \
  --notes "### 👑 Hun-ASM Highlighter & IntelliSense v2.2.2
- **ARM64 표준 명령어 및 레지스터 자동완성 탑재**
- **마우스 호버 설명 사전 연동**
- **소문자 입력 대응 및 자동완성 영점 조절 완료**"



```

### 헬퍼

```bash

# node -e: "노드(Node.js)야, 내가 뒤에 따옴표"" 안에 적어주는 자바스크립트 코드를
# 파일 안 만들고 터미널에서 즉석(-e: execute)으로 딱 한 번만 실행해 줘!
# "require('./mnemonics'): "현재 폴더에 있는 mnemonics.js라는 파일(어셈블리 명령어 리스트가 잔뜩 들어있을 파일)을 읽어와라!
# "const {ENGLISH_MNEMONICS} = ...: "그 파일 안에서
# 영문 어셈블리 니모닉(Mnemonic) 데이터 보따리인 ENGLISH_MNEMONICS라는 녀석만 쏙 골라내서 가져와라!"
node -e "const {ENGLISH_MNEMONICS}=require('./mnemonics'); console.log(JSON.stringify(ENGLISH_MNEMONICS, null, 2));"
```

```asm
stp  q0, q1, [sp, #8]       // 이제 "16의 배수라야 하네" 경고가 떠야 정상 (예전엔 안 떴을 것)
str  q0, [sp, #4]           // 이제 오탐 없이 "16의 배수" 경고가 떠야 정상
mul  v0.4s, v1.4s, v2.s[1]
```

### 종료코드 `138`

- 셸에서 종료 코드가 **128보다 크면 "시그널로 죽었다"**는 뜻이고, 계산법은 128 + 시그널번호야:
- 138 - 128 = 10 → 시그널 10 = SIGBUS (버스 에러)
- macOS ARM64에서 SIGBUS(10)가 뜨는 아주 전형적인 원인 하나가 **"PC(프로그램 카운터)가 4바이트 정렬 안 된 주소로 점프했을 때"**
- 야. ARM64 명령어는 무조건 4바이트 단위로 정렬돼 있어야 하는데, 정렬 안 된 주소로 튀면 CPU가 "이건 못 읽어" 하고 버스 에러를 던짐.

### 임시

```bash

#브레이크 포인트 걸릴 때 만다 자동으로 보여주기

(lldb) br se -n hanoi
(lldb) target stop-hook add -o "disassemble -p"  # -p(pc-centric) 현재 PC(실행중인 명령어 )주변
(lldb) target stop-hook add -o "bt"
(lldb) run
(lldb) registr read x19 x20 x21 x22

br set -n _hanoi

br command add 1
  > printf "n=%lld from=%c to=%c via=%c\n", $x19, (char)$x20, (char)$x21, (char)$x22
  > bt
  > DONE

// 워크플로추 (추천순서)

// (lldb) br set -n hanoi
// (lldb) breakpoint command add 1
// > bt
// > register read x19 x20 x21 x22
// > disassemble -p
// > DONE
// (lldb) run

// 스템 명령어 구분(재귀함수 디버깅의 핵심)
// stepi (si) 명령어 1줄씩(어셈블리 레벨)
// next (n) 소스라인 단위, 그러나 bl 만나면 그냥 지나쳐 버림 <- 재귀 안 들어감
// step (x) : bl 만나면 그 함수 안으로 들러감 <- 재귀 추적 할 땐 이것을 사용함
// finish : 지금 프레임 끝가지 실행하고 pop 되는 순각까지 감 (팝 확인용)

// 콜 스택 깊이가 깊어질 때 시각적으로 확인 하고 싶을때
// (lldb) bt | wc -l


# [ 최종 추천 세팅 ]
(lldb) br set -n hanoi
(lldb) run
(lldb) bt                              # 지금 콜스택 몇 층인지
(lldb) register read x19 x20 x21 x22   # n, from, to, via 값 확인
(lldb) s                                # bl 안으로 재귀 진입
(lldb) c                                # 다음 브레이크포인트까지 (같은 함수라 또 멈춤)

// * frame #0: hanoi (n=1, from='C', to='B', via='A')
//   frame #1: hanoi (n=2, from='A', to='B', via='C')
//   frame #2: hanoi (n=3, from='A', to='C', via='B')
//   frame #3: main
```

```markdown
[관전 포인트]

1. 터미널에서 lldb ./프로그램이름 진입 후 b \_hanoi 쳐서 브레이크포인트 장착!
2. run을 치면 첫 진입(n=3) 상태에서 멈춥니다.
3. c(continue)를 두 번 더 눌러서 n=1일 때까지 깊숙이 들어갑니다.
4. 그 상태에서 bt를 딱 치면! \_hanoi 함수가 스택 프레임에 층층이 쌓여있는 기가 막힌 탑을 보실 수 있습니다.
5. register read x19 x20 x21을 치면 각 층(Frame)마다 보존되고 있는 원반 번호와 기둥 상태가 눈에 보입니다.

---

# 1. 하노이 탑 함수 시작 지점에 브레이크포인트 장착!

(lldb) b \_hanoi

# 2. 프로그램 질주 시작

(lldb) run

# 3. 첫 번째 중단! 현재 인자값 확인 (예: 원반 3개, 1번 기둥에서 3번 기둥으로)

(lldb) register read x0 x1 x2 x3
x0 = 0x0000000000000003 <- n = 3
x1 = 0x0000000000000001 <- 출발 = 1
x2 = 0x0000000000000003 <- 목적 = 3
x3 = 0x0000000000000002 <- 보조 = 2

# 4. 재귀 호출 안으로 계속 진입하기 위해 기계어 단위로 따라 들어감

(lldb) si

# 5. 한 3~4번 들어가서 재귀가 깊어졌을 때, 현재 스택이 얼마나 아름답게 쌓였나 확인

(lldb) bt

- frame #0: 0x0000000100003f10 my_hanoi`hanoi at menu_hanoi.S:15
- frame #1: 0x0000000100003f44 my_hanoi`hanoi at menu_hanoi.S:34
- frame #2: 0x0000000100003f44 my_hanoi`hanoi at menu_hanoi.S:34
- frame #3: 0x0000000100003ea8 my_hanoi`main at main.S:20

# 6. frame #2 (부모 함수 시점)로 시간 이동해서 당시의 원반 개수(x0) 털어보기

(lldb) f 2
(lldb) register read x0

(lldb) disassemble --frame
(lldb) x/4gx $sp
(lldb) register read --all
(lldb) f 3
(lldb) bt
```

// 5 _ 16 = 80(x19 ~x28, 8 _ 10개) + 16(x29, x30) = 96 + 32 (16 \* 3, 지역 변수 6개 공간) = 128
// stack_size = 96 (고정프레임 : x29/x30 + x19 ~ x28)
// + 8(지역변수 num_disks, .quad 1개)
// = 104 -> 16바이트 정렬이 안 맞으니 112로 올림(패딩 8바이트)

// `.equ`
// C 언어의 #define 매크로와 유사한 역할
// 메모리 미할당 : 변수화 달리 메모리 공간을 전혀 차지 하지 않음.
// 재적의 불가
// .equ NUM_DISKS, 96 // 지역변수 오프셋 : [x29, #96]

// 이것을 풀엇 말하면:
// 1. 주소 계산: `x29 + 96`, 덧셈 부분
// 2. 메모리 접근 (역참조): 그 계산된 주소가 가리키는 메모리 위치에 x0 에 들어 있는 값을 써라
// C로 비유하면 이렇게 됨
// long long _ptr = (long long_)(x29 + 96) // (1) 주소 계산
// \*ptr = x0; // (2) 대괄호 (역참조) = 그 주소에 값 쓰기

// 반대 - [ldr]
// `ldr x0, [x19]` // x19 안에 들어 있는 값을 "주소"로 보고, 그 주소가 가리키는 메모리에서 값을 읽어와 x0에 저장
// `x0 = *((long long*)x19)` // 대괄호 없이 그냥 x19 자체를 쓰면 "주소값 자체"를 의미
// `mov x1, x19` // x1 = x19 (그냥 숫자 복사, 대괄호 없음 -> 역참조 안 함!)

// 대괄호 있고 없고의 차이 (헷갈리기 제일 쉬운 부분)
// mov x1, x19 // x1 = x19 값 그 자체 (예: 주소값 0x1000 을 복사)
// ldr x1, [x19] // x1 = x19 가 가르키는 주소(0x1000)에 저장된 내용물

// 예시
// mov x1, x19 // x1 = num_disks 의 '주소' (scanf 에게 "여기에 써줘" 라고 주소위치를 알려줌)
// ldr x1, [x19] // x1 = num_disks 주소에 들어 있는 '값' (printf 로 실제 숫자를 출력 )
// 즉, scanf 는 "어디에 써야할지" 주소가 필요하니까 대괄호 없이 (mov), printf 는 '무슨 값인지 '알아야 하니까 대괄호로 역참조(ldr) 한것임,
// 똭 C 에서 scanf("%lld", &x) 할 때 `&` (주소) 를 쓰고
// `printf("lld", x)` 할때 그냥 x(값) 을 쓰는 것과 완전히 같은 이치
// [...] 대괄호 - "메모리 포인터" 정확히는 "역참조(dereference)"
// `[ ]` 안의 계산(덧셈/뺄셈 은 주소를 계산하는 것이고
// 대괄호 자체가 **그 주소가 가리키는 메모리에 접근해라** 뜻
// 즉, 계산과 접근, 두 가지 일이 동시에 일어나는 것임.
// str x0, [x29, #96] // #

### 기타

```C
_argv:
	cmp  x0, #2
	mov  x19, #108
	b.lt .L_default

	ldr x0, [x1, #8]        // x0 = argv[1]
	bl  _atoi                // atoi(argv[1]); 결과는 x0에 저장됨
	mov x19, x0             // 결과를 안전하게 x19(Calle-saved)에 보관

    // [배열 시작주소 계산]
	adrp x10, command_table@PAGE
	add  x10, x10, command_table@PAGEOFF // x10 = command_table 시작 주소

    // [배열 끝 주소 계산]
	adrp x11, command_table_end@PAGE
	add  x11, x11, command_table_end@PAGEOFF  // x11 = command_tabel 끝 주소

    // [배열의 크기]
	sub x12, x11, x10

    // [배열의 갯수 계산]
    // 포인터 주소의 크기 : 8바이트
    // 배열의 갯수 = 배열의 크기 / 포인터 주소의 크기 2^3 (8바이트)
	lsr x12, x12, #3

    // 3. 64비트끼리 안전하게 범위 검사 (Boundary Check)
    // 범위검사 (Boundary Check) :
    // 사용자가 입력한 아규먼트 값 과 배열의 총 갯수를 비교
	cmp x19, x12

    // x19 가 배열의 크기보다 크거나 같으면
    // hs: Higher or Same, 부호없는 비교
    //  _default 레이블로 점프
	b.hs .L_default

    // 진짜 함수 로드하기
    // x10 (테이블 시작 주소)에서 x19(인덱스) 만큼 8바이트씩(lsl #3) 떨어진 곳의 주소값을 읽기
    // (예) : x19 (입력값) 을 2로 하였을 때
    //       x10 의 주소가 0x1000 일때
    //       0x1000 + (2 * 2^3) => 0x1000 + 16 => 즉.. array[2] 의 요소를 호출하는 결과가
	ldr x11, [x10, x19, lsl #3]

    // 목표 함수 실행!
	blr x11

	b .L_terminate

.L_default:
    // 3. 포맷 스트링 및 인자 준비 후 printf 호출
	adrp x0, format_str@PAGE  // 포맷 문자열 주소 로드
	add  x0, x0, format_str@PAGEOFF

	sub sp, sp, #32
	str x19, [sp, #0]
	bl  _printf
	add sp, sp, #32

	b .L_terminate
```

// .quad 는 8바이트 64비트를 의미함
// 한줄에 데이터가 2개씩 들어 있으므로
// 8바이트(함수 주소) + 8바이트 (문자열 주소) = 각행은 총 16바이트 2^4
// x10 에 배열의 시작 주소가 저장 되어 있음
// x22 에 사용자가 선택한 메뉴 인덱스 번호 (0,1,2,3...)
// lsl #4 : 인덱스 번호에 16(2^4) 곱하여 해당 메뉴를 찾는 로직

---

법우, 정확히 찾아냈어! 이건 우연이 아니라 Apple의 ARM64 ABI에 있는, 표준 AAPCS64와는 다른 특이 규칙 때문이야. 하하하 드디어 이 귀신의 진짜 정체를 잡았구나 🙏

Apple ARM64 ABI의 숨겨진 규칙

Apple 공식 문서("Writing ARM64 Code for Apple Platforms")에 이렇게 적혀있어: 가변인자(variadic) 함수를 호출할 때, 고정 인자(예: 포맷 문자열)는 표준대로 레지스터(x0)로 넘기지만, 그 이후의 가변인자들은 x1~x7에 넣어도 되는 게 아니라 반드시 스택에 넣어야 한다는 거야. 이게 리눅스 등 표준 AAPCS64와 macOS/iOS가 갈라지는 지점이야.

즉:

printf(fmt, x1) → 표준 AAPCS64라면 x1 레지스터만으로 충분해야 하지만
Apple 플랫폼에서는 x1에 값이 들어있어도 printf가 그걸 신뢰하지 않고 스택을 보려고 할 수 있어 → 그래서 스택 푸시가 없으면 쓰레기값을 읽어버려서 left=96 right=1, "p+Mk" 같은 깨진 결과가 나온 거야.

그런데 왜 어떤 땐 x1만으로도 되고 어떤 땐 안 됐을까?

이게 바로 "운 좋게 맞았다"의 전형이야. macOS의 printf 구현이 내부적으로 레지스터 x1~x7도 부분적으로 훑어보는 경로가 있어서, 일부 상황(예: 딱 1개짜리 인자, 특정 스택 정렬 상태)에서는 우연히 맞아떨어지지만, 인자가 2개(fmt_debug의 %lld %lld)거나 스택 프레임 배치가 살짝 달라지면 바로 깨지는 거야. 이건 **공식적으로 보장되지 않는 동작(UB)**이라서, 상황마다 다르게 나타났던 거지 — 법우가 "scanf 그거 빼고 되는 걸 본 적이 없다"고 느낀 그 직감이 정확했던 거야! 하하하

결론: 가변인자가 있는 모든 호출(scanf, fmt_string, fmt_debug, fmt_result)에 일관되게 스택 푸시 패턴을 적용해야 안전해.

---

- Than 있음 (GT, LT, GE, LE) → Signed

- Than 없음 (HI, LO, HS, LS) → Unsigned

---

### git ref

```bash

# check
git ls-files .vscode
git check-ignore -v .vscode/settings.json
git status

```
