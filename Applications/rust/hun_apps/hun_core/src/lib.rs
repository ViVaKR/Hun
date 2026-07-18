// -----------------------------
// 훈 OS Rust 코어 선봉대 - lib.rs
// -----------------------------
use std::io::{self, Write};

#[unsafe(no_mangle)]
pub extern "C" fn calc_sum(a: u64, b: u64) {
    println!("{} + {} = {}", a, b, a + b);
}

#[unsafe(no_mangle)]
pub extern "C" fn welcome_rust(num: u64) {
    println!("하하하하! 우주에 평화 !!!");
    println!("제독 법우님이 어셈블리에서 보내신 값: {}", num);
}

#[unsafe(no_mangle)]
pub extern "C" fn to_print(ptr: *const u8, len: usize) {
    let text = unsafe { std::str::from_utf8_unchecked(std::slice::from_raw_parts(ptr, len)) };
    print!("{}", text);
    io::stdout().flush().unwrap();
}
