#!/usr/bin/env bash
set -euo pipefail

# 사용법: ./run.sh helloworld   (helloworld.s 를 빌드/실행/정리)

ENTRY="${ENTRY:-_start}"
SDKPATH=$(xcrun -sdk macosx --show-sdk-path)

if [[ $# -ne 1 ]]; then
    echo "usage: $0 <name>   (finds <name>.s in current directory)" >&2
    exit 1
fi

name="$1"
src="${name}.s"

if [[ ! -f "$src" ]]; then
    echo "error: $src not found" >&2
    exit 1
fi

as -arch arm64 -o "${name}.o" "$src"
ld -o "$name" "${name}.o" \
    -lSystem \
    -syslibroot "$SDKPATH" \
    -e "$ENTRY" \
    -arch arm64

echo "————————————————————————————"
"./${name}"
echo "————————————————————————————"

rm -f "$name" "${name}.o"