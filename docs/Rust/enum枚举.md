# enum 枚举

`enum`（枚举）是一种将**有限个具体值**归纳为同一类型的数据结构。一个枚举实例在同一时刻只能是其中一种变体，是"或"的关系。

枚举适合用于**可以穷举的事物**：性别（男/女）、星期（一到七）、方向（东/南/西/北）、会员等级。不能穷举的事物（如所有整数）不适合直接用枚举，但可以把具体值枚举出来，再加一个 `Other` 变体通配其余情况。

与 `struct` 相比：`enum` 用 `match`/`if let` 访问，`struct` 用点语法。`enum` 的占用内存大小等于最大变体的大小加上标签空间。

> 我的理解：`enum` 就是一个可以储值的状态机，使用 `match` 来区分不同的状态，并执行相应的逻辑。`enum` 里面的每个变体是一种"标签 + 数据形状"的组合。

## 枚举成员的数值

无数据变体本质上与整数对应。**默认第一个成员值为 0**，后一个成员值自动加 1；也可以用 `=` 手动指定：

```rust
enum Week {
    Monday = 1, // 1
    Tuesday,    // 自动加1 → 2
    Wednesday,  // 3
    Thursday,   // 4
    Friday,     // 5
    Saturday,   // 6
    Sunday,     // 7
}
```

使用 `as` 将枚举成员转换为对应的整数值：

```rust
let mon = Week::Monday as i32; // 1
let sun = Week::Sunday as i32; // 7
```

可以用 `#[repr(uN)]` 限制成员数值的范围，超出范围时编译报错：

```rust
#[repr(u8)]        // 限定范围为 0..=255
enum Level {
    Low = 1,
    Mid = 128,
    High = 255,
    // Over = 256, // ❌ 编译报错：超出 u8 范围
}
```

> 不指定 `#[repr]` 时，Rust 会自动选择能容纳最大成员值的最小整数类型（如最大值为 100 则用 `u8`，最大值为 500 则用 `u16`）。**只有无数据变体**才有这种整数对应关系；包含数据的变体不能直接 `as` 转换。

## 定义 enum

`enum` 的每个变体可以是三种形式之一，正好对应三种 `struct` 的形状：

| 变体形式   | 语法示例                  | 对应的 struct 形式 |
| ---------- | ------------------------- | ------------------ |
| 无数据变体 | `Quit`                    | 类单元结构体       |
| 元组变体   | `Write(String)`           | 元组结构体         |
| 结构体变体 | `Move { x: i32, y: i32 }` | 经典结构体         |

```rust
// 1. 定义没有数据的enum
#[derive(Debug)]
enum IpAddrKind {
    V4,
    V6,
}

// 2. 定义拥有数据的enum: 元组变体
#[derive(Debug)]
enum IpAddr {
    V4(u8, u8, u8, u8),
    V6(String),
}

// 3. 定义拥有数据的enum: 结构体变体
#[derive(Debug)]
enum Message {
    Quit,                       // 无数据变体
    Move { x: i32, y: i32 },    // 结构体变体
    Write(String),              // 元组变体
    ChangeColor(i32, i32, i32), // 元组变体
}
```

## 实例化 enum

使用 `EnumName::VariantName` 的形式创建实例。无数据变体直接声明，有数据变体需提供对应的数据：

```rust
// 创建 IpAddrKind 两个不同变体的实例
let four = IpAddrKind::V4;
let six = IpAddrKind::V6;

// 创建有数据的enum实例
let home = IpAddr::V4(127, 0, 0, 1);
let loopback = IpAddr::V6(String::from("::1"));

// 创建不同类型的变体实例
let msg1 = Message::Quit;
let msg2 = Message::Move { x: 10, y: 20 };
let msg3 = Message::Write(String::from("hello"));
let msg4 = Message::ChangeColor(255, 0, 128);
```

## 访问 enum 变体

`enum` 使用 `match` 或 `if let` 访问变体内部的数据。`match` 匹配必须**穷尽所有变体**，可用通配模式 `_` 处理其余情况。

> 在 [模式与模式匹配](./模式与模式匹配.md) 中会详细介绍模式匹配语法，这里先简单使用一下。

```rust
let home = IpAddr::V4(127, 0, 0, 1);
// match：针对不同变体执行不同逻辑（必须穷尽）
match &home {
    IpAddr::V4(a, b, c, d) => {
        println!("它是 IPv4: {}.{}.{}.{}", a, b, c, d);
    }
    IpAddr::V6(s) => {
        println!("它是 IPv6: {}", s);
    }
};
```

```rust
let home = IpAddr::V4(127, 0, 0, 1);
// if let：只关心一种变体时使用
if let IpAddr::V4(a, b, c, d) = &home {
    println!("它是 IPv4: {}.{}.{}.{}", a, b, c, d);
} else {
    println!("它是 IPv6");
}
```

## 修改

修改 `enum` 实例需要将其声明为 `mut`。有两种常用方式：

**1. 修改整个变体（常用）**：直接重新赋值为新变体。

```rust
let mut loopback = IpAddr::V6(String::from("::1")); // 必须声明 mut
loopback = IpAddr::V4(127, 0, 0, 1);
println!("{:#?}", loopback);
```

**2. 修改变体内部数据**：用 `if let` 匹配并获取可变引用，再通过解引用修改。

```rust
let mut home = IpAddr::V4(127, 0, 0, 1); // 必须声明 mut
if let IpAddr::V4(_, _, _, last) = &mut home {
    *last = 255;                         // 解引用修改内部的值
}
println!("{:?}", home);                  // 输出: V4(127, 0, 0, 255)
```

## impl Enum

和 `struct` 一样，使用 `impl` 关键字为枚举定义**方法**和**关联函数**，一个枚举可以拥有多个 `impl` 块：

```rust
 impl Enum {
    fn xxx(&self)  →  方法（method）
    fn xxx()       →  关联函数（associated function）
}
```

### 方法

方法的第一个参数是 `self` 的某种形式，含义与 `struct` 方法完全相同（参见 [struct 方法](./struct结构体.md#方法)）：

```rust
impl IpAddr {
    // 1. self 作为参数,获取实例的所有权(消费性方法)
    fn call_once(self) {
        println!("This is {:#?}", self);
    }
    // 2. &self 作为参数,获取实例的不可变借用
    fn call(&self) {
        println!("This is {:#?}", self);
    }
    // 3. &mut self 作为参数,获取实例的可变借用
    fn call_mut(&mut self) {
        println!("This is {:#?}", self);
    }
}

fn main() {
    let mut home = IpAddr::V4(127, 0, 0, 1);
    home.call();         // 使用不可变借用
    home.call_mut();     // 使用可变借用
    // home.call_once(); // 转移所有权后就不能再使用 home 变量了
}
```

### 关联函数

没有 `self` 参数的函数称为**关联函数**，通过 `::` 调用，常用于定义构造函数：

```rust
impl IpAddr {
    // 返回一个默认的 V4 地址
    fn new_v4() -> Self {
        IpAddr::V4(127, 0, 0, 1)
    }

    // 定义带参数的构造函数
    fn new_v6(addr: &str) -> Self {
        IpAddr::V6(addr.to_string())
    }
}

fn main() {
    // 使用 :: 调用关联函数
    let home = IpAddr::new_v4();
    let loopback = IpAddr::new_v6("::1");
}
```

## `Option<T>` 枚举

`Option<T>` 是 Rust 标准库中内置的枚举，用来表示"一个值要么存在（`Some`），要么不存在（`None`）"。Rust 没有 `null` 值，用 `Option<T>` 来强迫程序员**显式处理值不存在的情况**，从根源上避免了其他语言中常见的"空指针异常"。

### 定义 `Option<T>`

```rust
enum Option<T> {
    Some(T),
    None,
}

let some_number = Some(1); // 等于 Option::Some(1);表示变量可能是1,也可能没有
let none_number: Option<i32> = None;
```

### `Option<T>`常用方法

| 方法                           | 说明                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `unwrap()`                     | `Some(值)` 返回值；`None` 直接 panic                                            |
| `unwrap_or(default)`           | `None` 时返回默认值                                                             |
| `unwrap_or_else(\|\| default)` | `None` 时执行闭包生成默认值（延迟求值）                                         |
| `expect("msg")`                | 同 `unwrap`,但 panic 时显示自定义消息,便于调试                                  |
| `map(\|x\| x + 1)`             | `Some` 时对值进行转换返回新 `Some`；`None` 返回 `None`                          |
| `filter(\|x\| x > &0)`         | `Some` 且条件满足返回 `Some`；否则返回 `None`                                   |
| `and_then(\|x\| Some(x + 1))`  | 链式处理 `Option`,闭包返回 `Option`                                             |
| `or(other)`                    | `Some` 返回自身；`None` 返回 `other`                                            |
| `or_else(\|\| other)`          | `Some` 返回自身；`None` 执行闭包返回结果                                        |
| `?`                            | 有值就继续；`None` 直接从函数返回 `None`（仅用于返回 `Option`/`Result` 的函数） |
| `is_some()`                    | 是否是 `Some`                                                                   |
| `is_none()`                    | 是否是 `None`                                                                   |
| `as_ref()`                     | `Option<T>` → `Option<&T>`,获取值的不可变引用                                   |
| `as_mut()`                     | `Option<T>` → `Option<&mut T>`,获取值的可变引用                                 |
| `take()`                       | 取出值的所有权并将原 `Option` 置为 `None`                                       |
| `replace(value)`               | 替换为新值并返回旧值                                                            |
| `ok_or(err)`                   | `Option<T>` → `Result<T, E>`；`Some` 返回 `Ok(值)`,`None` 返回 `Err(err)`       |
| `ok_or_else(\|\| err)`         | 同 `ok_or`,但 `None` 时执行闭包生成错误                                         |

### `Option<T>`例子

```rust
fn main() {
    let num = Some(5);
    let num_none: Option<i32> = None;

    // unwrap 及相关方法
    // let num0 = num_none.unwrap();              // 此处会panic
    let num1 = num_none.unwrap_or(1);             // 返回 1
    let num2 = num.expect("should have a value"); // 返回 5

    // map 链式转换
    let num3 = num.map(|n| n + 1);                // Some(6)
    let num4 = num_none.map(|n| n + 1);           // None

    // and_then 链式处理
    let result = num.and_then(|n| Some(n * 2));   // Some(10)
}

// 使用 ? 传播运算符
fn count() -> Option<i32> {
    let value = Some(1)?; // 如果是 None,立即 return None
    Some(value + 1)
}
```

## 综合例子

```rust
// 定义没有数据的enum
#[derive(Debug)]
enum IpAddrKind {
    V4,
    V6,
}

// 定义拥有数据的enum
#[derive(Debug)]
enum IpAddr {
    V4(u8, u8, u8, u8),
    V6(String),
}

// 定义方法,和struct一样
impl IpAddr {
    // 返回一个默认的 V4 地址
    fn new_v4() -> Self {
        IpAddr::V4(127, 0, 0, 1)
    }
    // 也可以定义带参数的 new 函数
    fn new_v6(addr: &str) -> Self {
        IpAddr::V6(addr.to_string())
    }
    // 定义方法
    fn call(&self) {
        println!("This is {:#?}", self)
    }
}

fn main() {
    // 创建 IpAddrKind 两个不同变体的实例
    let four = IpAddrKind::V4;
    let six = IpAddrKind::V6;

    // 创建有数据的enum实例
    let mut home = IpAddr::V4(127, 0, 0, 1);
    let mut loopback = IpAddr::V6(String::from("::1"));

    // 使用new函数创建实例
    let new_home = IpAddr::new_v4();
    let new_loopback = IpAddr::new_v6("::1");

    // 使用方法
    new_home.call();

    println!("{:#?}", four);
    println!("{:#?}", six);
    println!("{:#?}", home);
    println!("{:#?}", loopback);
    println!("{:#?}", new_home);
    println!("{:#?}", new_loopback);

    // 访问,使用match/if let
    match &home {
        IpAddr::V4(a, b, c, d) => {
            println!("它是 IPv4: {}.{}.{}.{}", a, b, c, d);
        }
        IpAddr::V6(s) => {
            println!("它是 IPv6: {}", s);
        }
    };

    // 只关心一个结果
    if let IpAddr::V4(a, b, c, d) = &home {
        let home_value = (a, b, c, d);
        println!("它是 IPv4: {:#?}", home_value);
    } else {
        println!("它是 IPv6");
    }

    // 修改enum变体
    // 1. 修改整个变体(常用)
    loopback = IpAddr::V4(127, 0, 0, 1);
    println!("{:#?}", loopback);

    // 2. 修改变体内部数据, 使用 if let 匹配并获取可变引用
    // if let IpAddr::V4(_, _, _, ref mut last) = home {
    //     *last = 255; // 通过解引用修改内部的值
    // }
    // 现代写法
    if let IpAddr::V4(_, _, _, last) = &mut home {
        *last = 255; // 通过解引用修改内部的值
    }
    println!("{:?}", home); // 输出: V4(127, 0, 0, 255)

    // Option<T>枚举
    // 等于 Option::Some(1); 表示变量可能是1,也可能没有
    let mut some_number = Some(1);

    // 对some_number进行空值处理
    some_number = match some_number {
        None => None,
        Some(i) => Some(i + 1),
    };
    println!("some_number的值是{:#?}", some_number)
}
```
