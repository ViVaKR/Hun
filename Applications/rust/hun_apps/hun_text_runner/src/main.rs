unsafe extern "C" {
    #[link_name = "test"]
    fn hun_test(a: i64, b: i64) -> i64;
}

fn main() {
    // 42와 99 중 큰값을 구하기
    let result = unsafe { hun_test(42, 99) };

    println!("Max value result: {}", result);
    if result == 99 {
        println!("PASS");
        std::process::exit(0);
    } else {
        println!("FAIL");
        std::process::exit(1);
    }
}
