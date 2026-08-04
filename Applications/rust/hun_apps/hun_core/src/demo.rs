use hun_macro::hun_export;

#[hun_export]
pub fn demo() {
    let mut x = 5;
    println!("This value of x is : {x}");
    x = 6;
    println!("The value of x is : {x}");

    // constant
    const THREE_HOURS_IN_SECONDS: u32 = 60 * 60 * 3;
    println!("Constant : {THREE_HOURS_IN_SECONDS}");

    // shadowed
    let y = 5;
    let y = y + 1;
    {
        let y = y * 2;
        println!("This value of x in the inner scope is: {y}");
    }
    println!("The value of x is: {y}");
}

#[hun_export]
pub fn demo_array() {}

#[hun_export]
pub fn demo_tuple() {
    let tup: (i32, f64, u8) = (500, 6.4, 1);
    let (x, y, z) = tup;
    let t0 = tup.0;
    let t1 = tup.1;
    let t2 = tup.2;
    println!("The value of tup is : {x} - {y} - {z}, {t0} - {t1} - {t2}");
}
