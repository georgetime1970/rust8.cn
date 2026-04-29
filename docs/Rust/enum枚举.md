# 枚举 enum

**enum(枚举) 是一种定义"一个类型可以是几种不同变体之一"的方式**

- `enum`和`struct`都是类型
- 一个枚举实例在同一时刻只能是定义的其中一种变体,是`或`的关系
- `enum`访问使用`match`/`if let`,`struct`使用点语法
- 我的理解: `enum`就是一个可以储值的状态机,使用`match`来区分不同的状态,并执行相应的逻辑
- `enum`里面的是值构造器,是一种标签+数据形状的组合
- `enum`变体可以包含不同类型和数量的数据,甚至没有数据
- `enum`占用内存大小等于最大变体的大小加上标签空间

## 定义 enum

- 使用`enum`关键字
- 枚举变体可以是: 无数据、元组变体(tuple variant)、结构体变体(struct variant)

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
    Move { x: i32, y: i32 },   // 结构体变体
    Write(String),              // 元组变体
    ChangeColor(i32, i32, i32),// 元组变体
}
```

## 实例化 enum

- 使用`::`命名空间,格式为 `EnumName::VariantName`
- 无数据变体直接声明,有数据变体需要提供相应的数据
- 创建的实例可以绑定到变量中

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

## 访问 `match/if let`

- 使用`match/if let`
- `match`匹配必须穷尽
- 使用通配模式和 `_` 占位符处理其他情况

> 在 [match模式匹配](./8.1.match模式匹配.md)中我们会详细介绍`match`等语法的模式匹配,这里先简单使用一下

```rust
// 针对不同变体执行不同逻辑
// 也可以赋值给变量,但要保证每个逻辑返回的是相同类型的值
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
 // 只关心一个结果
    if let IpAddr::V4(a, b, c, d) = &home {
        let home_value = (a, b, c, d);
        println!("它是 IPv4: {:#?}", home_value);
    } else {
        println!("它是 IPv6");
    }
```

## 修改

**1. 修改整个变体(常用)**

```rust
let mut loopback = IpAddr::V6(String::from("::1")); // 必须声明 mut
loopback = IpAddr::V4(127, 0, 0, 1);
println!("{:#?}", loopback);
```

**2. 修改变体内部数据, 使用 if let 匹配并获取可变引用**

```rust
let mut home = IpAddr::V4(127, 0, 0, 1); // 必须声明 mut
// 通过模式匹配,将值赋值给last (获取可变引用)
if let IpAddr::V4(_, _, _, last) = &mut home {
    *last = 255; // 通过解引用修改内部的值
}
println!("{:?}", home); // 输出: V4(127, 0, 0, 255)
```

## impl Enum

- 使用`impl`关键字定义
- 一个枚举可以使用多个`impl`块定义枚举方法和关联函数
- `impl`块中可以定义方法、关联函数、关联常量和关联类型

```rust
impl Enum {
    ├── fn xxx(&self)      → 方法(method)
    ├── fn xxx()           → 关联函数(associated function)
    ├── const XXX          → 关联常量
    └── type XXX           → 关联类型
 }
```

### 方法

- `impl Enum`中,函数的第一个参数可以是`self`、`&self`、`&mut self`,或没有`self`参数(静态方法/关联函数)
- `&self`是`self: &Self`的缩写
- `self`(小写): 指代具体的实例
- `Self`(大写): 指代这个类型本身

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
    home.call(); // 使用不可变借用
    home.call_mut(); // 使用可变借用
    // home.call_once(); // 获取所有权后就不能再使用了
}
```

### 关联函数

- `impl Enum`中没有`self`参数的函数称为关联函数,类似于静态方法
- 通常用于定义构造函数,使用`::`调用

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

## `Option<T>`枚举

- `Option`枚举表示一个变量要么有值要么没值
- Rust 并没有很多其他语言中有的空值功能.空值(Null)是一个值,它代表没有值
- 本质是强迫程序员处理为`None`的情况

### 定义`Option<T>`

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
    // let num0 = num_none.unwrap(); // 此处会panic
    let num1 = num_none.unwrap_or(1); // 返回 1
    let num2 = num.expect("should have a value"); // 返回 5

    // map 链式转换
    let num3 = num.map(|n| n + 1); // Some(6)
    let num4 = num_none.map(|n| n + 1); // None

    // and_then 链式处理
    let result = num.and_then(|n| Some(n * 2)); // Some(10)
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
    let mut some_number = Some(1); // 等于 Option::Some(1); 表示变量可能是5,也可能没有

    // 对some_number进行空值处理
    some_number = match some_number {
        None => None,
        Some(i) => Some(i + 1),
    };
    println!("some_number的值是{:#?}", some_number)
}
```
