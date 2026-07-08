// ⚠️ #[no_mangle]: Rust 컴파일러가 함수 이름을 지 멋대로 바꾸지 못하게 고정하는 봉인일세!
// ⚠️ extern "C": C/어셈블리 표준 호출 규격을 따르겠다는 우주 표준 약속이지.
#[unsafe(no_mangle)]
pub extern "C" fn call_from_dharma(num: u64) {
    // 제독님이 어셈블리에서 보낸 숫자가 여기에 도착할 걸세!
    println!("우주에 평화 !!!");
    println!("어셈블리에서 보내신 값: {}", num);
}
