#[unsafe(no_mangle)]
pub extern "C" fn call_from_dharma(num: u64) {
    println!("하하하하! 우주에 평화 !!!");
    println!("제독 법우님이 어셈블리에서 보내신 값: {}", num);
}
