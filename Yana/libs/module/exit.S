.include "section_macros.inc"
CODE_SECTION
.align 2
.global _menu_exit

_menu_exit:
  mov x0, #0      // 리턴 코드 0 (정상종료)
  bl _exit        // C 라이브러리 exit 호출 (여기서 프로그램이 끝남)