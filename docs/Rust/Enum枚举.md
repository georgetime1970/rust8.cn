---
description: 本文详细介绍了 Rust 语言中 enum(枚举)的定义、用法、内存布局及应用场景,并通过示例讲解如何使用枚举类型.
---

# Enum 枚举

`enum`(枚举)是一种将**有限个具体值**归纳为同一类型的数据结构.一个枚举实例在同一时刻只能是其中一种变体,是"或"的关系.

枚举适合用于**可以穷举的事物**: 性别(男/女)、星期(一到七)、方向(东/南/西/北)、会员等级.不能穷举的事物(如所有整数)不适合直接用枚举,但可以把具体值枚举出来,再加一个 `Other` 变体通配其余情况.

与 `struct` 相比: `enum` 用 `match`/`if let` 访问,`struct` 用点语法.`enum` 的占用内存大小等于最大变体的大小加上标签空间.

> 我的理解: `enum` 就是一个可以储值的状态机,使用 `match` 来区分不同的状态,并执行相应的逻辑.`enum` 里面的每个变体是一种"标签 + 数据形状"的组合.

## 定义 Enum

`enum` 的每个变体可以是三种形式之一,正好对应三种 `struct` 的形状:

| 变体形式   | 语法示例                  | 对应的 struct 形式 |
| ---------- | ------------------------- | ------------------ |
| 无数据变体 | `Quit`                    | 类单元结构体       |
| 元组变体   | `Write(String)`           | 元组结构体         |
| 结构体变体 | `Move { x: i32, y: i32 }` | 经典结构体         |

Rust 社区推荐使用以下命名规范:

- 枚举名使用**帕斯卡命名法**(`PascalCase`)
- 变体名也使用**帕斯卡命名法**(`PascalCase`)

### 无数据变体(Unit-like Variant)

没有任何数据的变体,类似于类单元结构体,常用于表示某个状态或事件.

```rust
#[derive(Debug)]
enum Message {
    Quit, // 无数据变体
}

#[derive(Debug)]
enum IpAddrKind {
    V4,   // 无数据变体
    V6,   // 无数据变体
}
```

### 元组变体(Tuple Variant)

字段没有名称、只有类型的变体.

```rust
#[derive(Debug)]
enum IpAddr {
    V4(u8, u8, u8, u8), // 元组变体
    V6(String),         // 元组变体
}
```

### 结构体变体(Struct Variant)

字段有名称的变体,类似于经典结构体.

```rust
#[derive(Debug)]
enum Message {
    Quit,                       // 无数据变体
    Move { x: i32, y: i32 },    // 结构体变体
    Write(String),              // 元组变体
    ChangeColor(i32, i32, i32), // 元组变体
}
```

## 枚举成员的数值

无数据变体本质上与整数对应.**默认第一个成员值为 0**,后一个成员值自动加 1；也可以用 `=` 手动指定:

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

使用 `as` 将枚举成员转换为对应的整数值:

```rust
let mon = Week::Monday as i32; // 1
let sun = Week::Sunday as i32; // 7
```

可以用 `#[repr(uN)]` 限制成员数值的范围,超出范围时编译报错:

```rust
#[repr(u8)]        // 限定范围为 0..=255
enum Level {
    Low = 1,
    Mid = 128,
    High = 255,
    // Over = 256, // ❌ 编译报错: 超出 u8 范围
}
```

> 不指定 `#[repr]` 时,Rust 会自动选择能容纳最大成员值的最小整数类型(如最大值为 100 则用 `u8`,最大值为 500 则用 `u16`).**只有无数据变体**才有这种整数对应关系；包含数据的变体不能直接 `as` 转换.

## 实例化 Enum

使用 `EnumName::VariantName` 的形式创建实例.无数据变体直接声明,有数据变体需提供对应的数据:

### 无数据变体实例化

无数据变体直接使用变体名实例化.

```rust
#[derive(Debug)]
enum Message {
    Quit, // 无数据变体
}

#[derive(Debug)]
enum IpAddrKind {
    V4,   // 无数据变体
    V6,   // 无数据变体
}

let msg = Message::Quit;   // 直接使用变体名实例化
let kind = IpAddrKind::V4; // 直接使用变体名实例化
```

### 元组变体实例化

元组变体实例化时需要提供对应的数据,数据类型和顺序必须与定义一致.

```rust
#[derive(Debug)]
enum IpAddr {
    V4(u8, u8, u8, u8), // 元组变体
    V6(String),         // 元组变体
}

let home = IpAddr::V4(127, 0, 0, 1);            // 提供对应数据
let loopback = IpAddr::V6(String::from("::1")); // 提供对应数据
```

### 结构体变体实例化

结构体变体实例化时需要给字段赋值,字段顺序不限.

```rust
#[derive(Debug)]
enum Message {
    Quit,                       // 无数据变体
    Move { x: i32, y: i32 },    // 结构体变体
    Write(String),              // 元组变体
    ChangeColor(i32, i32, i32), // 元组变体
}

let msg1 = Message::Quit;                         // 无数据变体直接使用
let msg2 = Message::Move { x: 10, y: 20 };        // 提供对应数据
let msg3 = Message::Write(String::from("hello")); // 提供对应数据
let msg4 = Message::ChangeColor(255, 0, 128);     // 提供对应数据
```

## 访问 enum 变体

`enum` 使用 `match` 或 `if let` 访问变体内部的数据.`match` 匹配必须**穷尽所有变体**,可用通配模式 `_` 处理其余情况.

> 在 [模式与模式匹配](./模式与模式匹配.md) 中会详细介绍模式匹配语法,这里先简单介绍一下.

**使用 `match` 匹配不同变体并访问数据:**

```rust
let home = IpAddr::V4(127, 0, 0, 1);
// match: 针对不同变体执行不同逻辑(必须穷尽)
match &home {
    IpAddr::V4(a, b, c, d) => {
        println!("它是 IPv4: {}.{}.{}.{}", a, b, c, d);
    }
    IpAddr::V6(s) => {
        println!("它是 IPv6: {}", s);
    }
};
```

**使用 `if let` 只关心某个变体:**

```rust
let home = IpAddr::V4(127, 0, 0, 1);
// if let: 只关心一种变体时使用
if let IpAddr::V4(a, b, c, d) = &home {
    println!("它是 IPv4: {}.{}.{}.{}", a, b, c, d);
} else {
    println!("它是 IPv6");
}
```

## 修改 enum 变体

修改 `enum` 实例需要将其声明为 `mut`.有两种常用方式:

**1. 修改整个变体(常用)**: 直接重新赋值为新变体.

```rust
let mut loopback = IpAddr::V6(String::from("::1")); // 必须声明 mut
loopback = IpAddr::V4(127, 0, 0, 1);
println!("{:#?}", loopback);
```

**2. 修改变体内部数据**: 用 `if let` 匹配并获取可变引用,再通过解引用修改.

```rust
let mut home = IpAddr::V4(127, 0, 0, 1); // 必须声明 mut
if let IpAddr::V4(_, _, _, last) = &mut home {
    *last = 255;                         // 解引用修改内部的值
}
println!("{:?}", home);                  // 输出: V4(127, 0, 0, 255)
```

## impl Enum

和 `struct` 一样,使用 `impl` 关键字为枚举定义**方法**和**关联函数**,一个枚举可以拥有多个 `impl` 块:

```rust
 impl Enum {
    fn xxx(&self)  →  方法(method)
    fn xxx()       →  关联函数(associated function)
}
```

### 方法

方法的第一个参数是 `self` 的某种形式,含义与 `struct` 方法完全相同(参见 [struct 方法](./Struct结构体.md#方法)):

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

没有 `self` 参数的函数称为**关联函数**,通过 `::` 调用,常用于定义构造函数:

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
```
