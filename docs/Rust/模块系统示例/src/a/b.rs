pub const AGE: i32 = 18;

pub mod c {

    use super::d::More;

    // 定义结构体
    #[derive(Debug)]
    pub struct Person {
        pub name: String,
        pub age: i8,
    }

    // 为Person实现外部trait
    impl More for Person {
        fn name(&self) -> &str {
            &self.name
        }
    }
}

// 只要遵守孤儿规则,并且pub,给Type实现的固有方法就可以不单独导入使用
// 对比trait就必须单独导入使用
pub mod c_method {
    use super::c::Person;
    // 为Person实现固有方法
    impl Person {
        pub fn run(&self) {
            println!("我是{},今年{}岁---我再跑", &self.name, &self.age);
        }
    }
}

// trait必须显式的和type一起导入,这样Type才可以使用trait上的方法
pub mod d {
    pub trait More {
        // 强制子类实现这个方法,返回一个字符串
        fn name(&self) -> &str;

        // 默认方法里只打印这个字符串
        fn sleep(&self) {
            println!("{} ---我在睡觉", self.name());
        }
    }
}
