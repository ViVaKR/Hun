fn main() {
    // Yana/tests/test.S 파일의 상대 경로 설정
    // hun_text_runner 기준 상위로 4번 올라가면 GitWorkspace/Hun 이 나옴
    let test_asm_path = "../../../../Yana/tests/test.S";

    // 어셈블리 파일이 수정되면 Cargo가 다시 빌드하도록 트리거 설정
    println!("cargo:rerun-if-changed={}", test_asm_path);

    // cc 크레이트를 사용하여 어셈블리 파일을 컴파일하고 라이브러리로 링크
    cc::Build::new().file(test_asm_path).compile("hun_test_asm");
}
