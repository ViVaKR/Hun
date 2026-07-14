#!/usr/bin/env zsh

echo "다음 폴더를 삭제합니다:"
echo "  - build/"
echo "  - build-xcode/"
read -q "CONFIRM?계속할까요? (y/N): "
if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    rm -rf ../build ../build-xcode
    echo "정리 완료!"
else
    echo "취소됨."
fi
