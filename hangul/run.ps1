#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

# ── 네이티브 명령 실패 시 즉시 중단 (bash의 set -e 대응) ──────
function Invoke-Checked {
    param([Parameter(Mandatory)][scriptblock]$Command)
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "명령이 실패했습니다 (exit code: $LASTEXITCODE)"
    }
}

# ── 경로 정의 (스크립트 자신의 위치 기준, CWD 무관) ──────────
# $PSScriptRoot 는 pwsh가 기본 제공 - zsh의 ${0:A:h}에 해당
$ScriptDir = $PSScriptRoot
$LlvmRoot = if ($env:LLVM_ROOT) { $env:LLVM_ROOT } else { Join-Path $HOME "GitWorkspace/llvm-project" }
$LlvmRoot = (Resolve-Path $LlvmRoot).Path        # 절대경로로 정규화
$LlvmBuild = Join-Path $LlvmRoot "build"
$Clang = Join-Path $LlvmBuild "bin/clang"
$Target = "aarch64-apple-darwin"
$SdkPath = (xcrun -sdk macosx --show-sdk-path).Trim()
# ──────────────────────────────────────────────────────────

Write-Host "========================================="
Write-Host "⚙️  한글 어셈블러 빌드를 시작합니다..."
Write-Host "========================================="
Invoke-Checked { ninja -C $LlvmBuild clang }

Write-Host ""
Write-Host "========================================="
Write-Host "🧪 한글 어셈블리 코드 검증 중..."
Write-Host "========================================="

# 여기-문자열(@'...'@)은 bash의 <<'EOF'와 동일하게 변수 보간 없이 원문 그대로 씀
@'
.include "hun.macros.inc"

글자구역
인사말:
    글자 "안녕하세요 반갑습니다. 멋진 한글어셈블리의 세상에 오신것을 환영합니다.! (Hello, World!)\n\0"

코드구역
    문장시작 무장한진입점, 32

    페이지주소찾기    연산처_0, 인사말@페이지
    더하기          연산처_0, 연산처_0, 인사말@페이지오프셋
    부르기          _printf

    할당하기    연산처_0, 0
    문장끝 32
'@ | Set-Content -Path "hello.s" -Encoding utf8NoBOM

Write-Host "--- [입력한 한글 어셈블리 코드] ---"
Get-Content "hello.s"
Write-Host "----------------------------------"

Write-Host ""
Write-Host "--- [어셈블 결과 (기계어 번역)] ---"
Invoke-Checked { & $Clang --target=$Target -c hello.s -o hello.o }
Invoke-Checked { objdump -d hello.o }
Write-Host "----------------------------------"
Write-Host "✅ clang - 검증 완료!"

Invoke-Checked { & $Clang --target=$Target -isysroot $SdkPath hello.o -o hello }

Write-Host "--- [실행 결과] ---"
./hello
Write-Host "Exit Code: $LASTEXITCODE"
Write-Host "----------------------------------"

Remove-Item -Force -ErrorAction SilentlyContinue hello, hello.s, hello.o