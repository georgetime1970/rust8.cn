trait MyInto<Rhs = Self> {
    fn my_into(self) -> Rhs;
}

struct Converter;

impl MyInto for Converter {
    fn my_into(self) -> Self { self }
}
impl MyInto<f64> for Converter {
    fn my_into(self) -> f64 { 0.0 }
}
impl MyInto<Vec<u8>> for Converter {
    fn my_into(self) -> Vec<u8> { vec![] }
}

fn main() {
    let c = Converter;
    // turbofish on method - does this work?
    let _ = c.my_into::<f64>();
}
