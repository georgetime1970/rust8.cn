# Trait 特征

trait 定义了某个特定类型拥有可能与其他类型共享的功能.可以通过 trait 以一种抽象的方式定义共同行为.可以使用 trait bounds 指定泛型是任何拥有特定行为的类型.

> 注意:trait 类似于其他语言中的常被称为 接口（interfaces）的功能,虽然有一些不同.

## 定义 trait

- 通过 `trait` 以一种抽象的方式定义共同行为
- 注意: 用于定义行为的规范,既可以是抽象的也可以有默认行为

```rust
trait TraitName {
    ├── fn xxx(&self)      → 方法(method)
    ├── fn xxx()           → 关联函数(associated function)
    ├── const XXX          → 关联常量
    └── type XXX           → 关联类型
 }
```

- 使用 `trait` 关键字
- `trait` 中,方法的第一个参数可以是 `self`、`&self`、`&mut self`,或不含 `self`(静态方法)

```rust
trait DoSomething {
    // 1. 抽象方法,必须实现
    fn run(&self);

    // 2. 默认方法,可选覆盖
    fn sleep(&self) {
        println!("I am sleeping");
    }

    // 3. 共享引用,只读(常用),必须实现
    fn area(&self) -> f64;

    // 4. 可变引用,修改内部值,必须实现
    fn resize(&mut self, factor: f64);

    // 5. 获取所有权(Self 表示实现类型本身),必须实现
    fn destroy(self);

    // 6. 关联函数,无 self 参数,必须实现(常用于构造器)
    fn create_default() -> i32 {
        0
    }

    // 7. 抽象关联函数,必须实现
    fn new() -> Self;
}
```

## 实现 trait

- 通过 `impl Trait for Type` 为类型实现 `trait`

```rust
struct Person {
    name: String,
    age: u8,
}

impl DoSomething for Person {
    // 实现抽象方法
    fn run(&self) {
        dbg!("I am running");
    }
    // 重写默认方法
    fn sleep(&self) {
        dbg!("I am eating");
    }

    // DoSomething Trait 的其他抽象方法和抽象关联函数也必须实现
    fn area(&self) -> f64 {
        0.0
    }
    fn resize(&mut self, _factor: f64) {
       unimplemented!() // 这里不需要真正实现调整大小的逻辑
    }
    fn destroy(self) {
        unimplemented!() // 这里不需要真正实现销毁的逻辑
    }

    fn new() -> Self {
        Self {
            name: "默认".into(),
            age: 0,
        }
    }
}
```

**孤儿规则(Orphan Rule)**

实现 trait 时,类型和 trait 至少有一个必须是你自己定义的:

- ✅ 给**自己的类型**实现**系统的 `Trait`**
- ✅ 给**系统的类型**实现**自己的 `Trait`**
- ❌ 给系统的类型实现系统的 `Trait`

## Trait 作为参数

通过 trait 约束泛型,限制参数必须具备指定能力.

**1. `impl Trait` 语法(最简洁)**

```rust
// 只要实现了 DoSomething 和std::fmt::Display 的类型都能传进来
// 注意这里是 &impl Trait 不会获取item参数的所有权,所以item参数依然可以在函数外被使用
fn execute(item: &(impl DoSomething + std::fmt::Display)) {
    item.run();
}

let san = Person { name: "张三".into(), age: 18 }; // into()利用上下文推导,进行类型转换
execute(&san);
```

**2. `Trait Bound` 语法(泛型约束)**

当需要多个参数为同一类型或逻辑复杂时使用.

```rust
// 强制要求 arg1 和 arg2 的类型必须完全一致,且都实现 DoSomething
// 注意这里 函数是获取了 arg1 和 arg2 的所有权的,所以在函数外无法再使用这两个参数了
fn combine<T: DoSomething>(arg1: T, arg2: T) {
    arg1.run();
    arg2.run();
}

let san = Person { name: "张三".into(), age: 18 };
let si = Person { name: "李四".into(), age: 20 };
combine(san, si);
```

**3. `where` 子句(最整洁)**

```rust
// 需求: T 必须能运行,且必须能打印输出
fn complex_task<T>(item: T)
where
    T: DoSomething + std::fmt::Display
{
    item.run();
    println!("Status: {}", item);
}
```

## Trait 作为返回值

```rust
// 返回一个实现了 DoSomething的结构体
// Person必须已经提前实现了DoSomething trait才行
fn new_person() -> impl DoSomething {
    Person {
        name: "王五".into(),
        age: 19,
    }
}

fn main(){
  let wu = new_person();  // 调用函数
  wu.run(); // 返回的struct自动实现了run方法
}
```

> **注意**: 只能返回一个具体类型.若需返回不同类型,使用 `Box<dyn Trait>`.

## 综合示例

```rust
// 定义一个 struct
struct Bird {
    name: String,
}

// Bird 自有的方法
impl Bird {
    fn play(&self) {
        dbg!(&self.name, "喜欢玩足球---固有方法");
    }
}

// 定义一个 trait
trait Fly {
    fn fly(&self);
}

// 为 Bird 实现 trait
impl Fly for Bird {
    fn fly(&self) {
        dbg!(&self.name, "正在飞---trait方法");
    }
}

// 一个需要Fly能力的函数
fn can_fly<T: Fly>(name: &T) {
    dbg!("我拥有飞的能力---泛型函数");
    name.fly();
}

fn main() {
    // 实例化结构体
    let san = Bird {
        name: "zhangSan".into(),
    };

    // 调用san的自有方法
    san.play();
    // 调用san的trait方法
    san.fly();
    // 调用泛型函数, san实现了Fly trait,所以可以作为参数传入
    can_fly(&san);
}
```

## Trait 思考

### Trait 总结

- `trait` 是一个能力证明器,也是复用方法的集合.在泛型函数中用作约束(如 `Fn`、`FnMut`、`FnOnce` 等闭包相关的 trait)
- 主要用于**泛型函数**中指定参数的能力.只有实现了该能力的参数才能调用相应的方法
- Rust 的设计非常严谨.即使 `struct` 的 `impl Struct` 实现了某种方法,进入泛型函数时也不会认可,必须通过 `impl Trait` 再次实现/转发该方法
- `trait` 就像证件一样: 向泛型函数证明你具备某种能力.而 `struct` 自己 `impl Struct` 的方法是你会但没有证书,无法向需要该能力的地方证明

### 合理使用 `impl Trait` 和 `impl Struct`

**设计原则:**

- `impl Struct`: 私有逻辑、内部实现
- `impl Trait`: 对外接口、公开能力、通用算法

**实施步骤:**

1. **第一步**: 先写 `struct` 和 `impl Struct`,把功能实现出来,让代码跑通
2. **第二步**: 当发现 2 个以上结构体有相同操作,或第三方函数(如 `Iterator` 或 `Serialize`)需要某种能力时
3. **第三步**: 将重复逻辑提取成 `trait`,然后在 `impl Trait for Struct` 中调用第一步写好的自有方法

这样既保持代码封装性,又通过 trait 提供统一的外部接口.
