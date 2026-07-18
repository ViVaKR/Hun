// -----------------------------------------------------------------
// 훈 OS Rust 코어 선봉대 - lib.rs
// -----------------------------------------------------------------

/// 대제독님의 어셈블리 영역에서 다이렉트로 호출하는 우주 평화 기어
/// macOS(Mach-O) 링커 특성상, 어셈블리 파일(.s)에서 호출할 때는
/// 함수 이름 앞에 언더바(_)를 붙여서 `bl _call_from_dharma`로 호출해야 합니다.

#[unsafe(no_mangle)]
pub extern "C" fn calc_sum(a: u64, b: u64) {
    println!("{} + {} = {}", a, b, a + b);
}

#[unsafe(no_mangle)]
pub extern "C" fn call_from_dharma(num: u64) {
    println!("하하하하! 우주에 평화 !!!");
    println!("제독 법우님이 어셈블리에서 보내신 값: {}", num);
}

#[unsafe(no_mangle)]
pub extern "C" fn to_print(ptr: *const u8, len: usize) {
    let text = unsafe { std::str::from_utf8_unchecked(std::slice::from_raw_parts(ptr, len)) };
    println!("{} - {}", text, text.len());
}

/*
      [ctype.h]
    - isalnum(c): c가 알파벳 또는 숫자인지 판별
    - isalpha(c): c가 알파벳인지 판별
    - isascii(c): c가 7비트 ASCII 문자인지 판별
    - isblank(c): c가 공백 문자(스페이스 또는 탭)인지 판별
    - iscntrl(c): c가 제어 문자인지 판별
    - isdigit(c): c가 숫자인지 판별
    - isgraph(c): c가 공백을 제외한 출력 가능한 문자인지 판별
    - islower(c): c가 소문자인지 판별
    - isprint(c): c가 출력 가능한 문자인지 판별
    - ispunct(c): c가 구두점 문자인지 판별
    - isspace(c): c가 공백 문자인지 판별
    - isupper(c): c가 대문자인지 판별
    - isxdigit(c): c가 16진수 문자인지 판별
    - toupper
    - tolower
    - toascii1
*/
