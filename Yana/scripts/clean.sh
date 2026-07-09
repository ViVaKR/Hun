#!/usr/bin/env zsh

echo "다음 폴더를 삭제합니다:"
echo "  - build/"
echo "  - build-xcode/"
read -p "계속할까요? (y/N) " confirm
if [[ "$confirm" == "y" ]]; then
    rm -rf build build-xcode
    echo "정리 완료!"
else
    echo "취소됨."
fi