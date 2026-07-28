#!/usr/bin/env pwsh
<#
.SYNOPSIS
    macOS arm64 어셈블리(.s) 소스를 빌드 -> 실행 -> 정리합니다.

.DESCRIPTION
    <Name>.s 를 어셈블(as)하고 링크(ld)한 뒤 실행하고,
    생성된 오브젝트/실행 파일은 실행 직후 자동으로 삭제합니다.

.PARAMETER Name
    확장자를 뺀 소스 파일 이름 (예: helloworld -> helloworld.s)

.PARAMETER Entry
    링커 엔트리포인트 심볼 (기본값: _start)

.EXAMPLE
    ./run.ps1 helloworld
    ./run.ps1 -Name helloworld -Entry _start
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Name,

    [Parameter()]
    [string]$Entry = '_start'
)

$ErrorActionPreference = 'Stop'

$SourceFile = "$Name.s"
$ObjectFile = "$Name.o"

if (-not (Test-Path $SourceFile)) {
    Write-Error "소스 파일을 찾을 수 없습니다: $SourceFile"
    exit 1
}

$SdkPath = (xcrun -sdk macosx --show-sdk-path).Trim()

Write-Host "어셈블: $SourceFile -> $ObjectFile" -ForegroundColor Cyan
as -arch arm64 -o $ObjectFile $SourceFile

Write-Host "링크:   $ObjectFile -> $Name" -ForegroundColor Cyan
ld -o $Name $ObjectFile `
    -lSystem `
    -syslibroot $SdkPath `
    -e $Entry `
    -arch arm64

Write-Host ('—' * 40)
& "./$Name"
Write-Host ('—' * 40)

Remove-Item -Force -ErrorAction SilentlyContinue $Name, $ObjectFile