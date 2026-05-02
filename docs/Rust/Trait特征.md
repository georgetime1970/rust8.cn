# Trait 特征

从多种类型中抽取共性的行为并定义为规范，是一种强大的代码复用方式，也是多态的体现。在面向对象语言中，这种机制通常通过接口（interface）实现；在 Rust 中，通过 **Trait** 实现。

Trait 有两个核心作用：**约束泛型**（规定泛型必须具备哪些能力）和**实现多态**（通过 Trait 对象在运行时统一处理不同类型）。Rust 是组合优于继承的语言：一个类型通过实现 Trait 来获得对应的能力（has a），而不是通过继承父类（is a）。

## 定义 Trait

使用 `trait` 关键字定义 Trait。Trait 中可以包含：

- **抽象方法**：只有签名，没有方法体，实现者必须提供实现
- **默认方法**：有方法体，实现者可以选择覆盖或直接使用默认实现

```rust
trait Playable {
    fn play(&self);                // 抽象方法，必须实现
    fn get_duration(&self) -> f32; // 抽象方法，必须实现
    fn pause(&self) {              // 默认方法，可选覆盖
        println!("pause");
    }
    fn stop() -> String;           // 关联函数，不使用 self 形式参数
}
```

方法的第一个参数可以是 `self`、`&self`、`&mut self`，或不含 `self`（关联函数）。

## 实现 Trait

通过 `impl Trait for Type` 为类型实现 Trait。所有没有默认方法体的方法都**必须实现**；有默认方法体的方法可以**选择覆盖**：

```rust
struct Audio { name: String, duration: f32 }
struct Video { name: String, duration: f32 }

impl Playable for Audio {
    fn play(&self) { println!("listening: {}", self.name); }
    fn get_duration(&self) -> f32 { self.duration }
    // pause() 不实现，使用默认实现
}

impl Playable for Video {
    fn play(&self) { println!("watching: {}", self.name); }
    fn get_duration(&self) -> f32 { self.duration }
    fn pause(&self) { println!("video paused"); } // 覆盖默认实现
}
```

实现后，类型实例就可以调用该 Trait 中的方法：

```rust
fn main() {
    let audio = Audio { name: "song.mp3".to_string(), duration: 3.5 };
    audio.play();   // 调用 Audio 的 play 实现
    audio.pause();  // 使用 Playable 中的默认实现
}
```

### 孤儿规则（Orphan Rule）

实现 Trait 时，**类型和 Trait 至少有一个必须是你自己定义的**：

- ✅ 给**自己的类型**实现**标准库的 Trait**（如为自定义 struct 实现 `Display`）
- ✅ 给**标准库的类型**实现**自己的 Trait**（如为 `Vec` 实现自定义 Trait）
- ❌ 给**标准库的类型**实现**标准库的 Trait**（会破坏生态一致性）

## `#[derive]` 派生 Trait

对于常见 Trait，可以在 `struct` 或 `enum` 前使用 [#[derive()]](./Macro宏.md#派生宏) 让编译器自动实现，无需手动编写：

```rust
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}
// Point 现在自动具备了调试输出、克隆、相等比较的能力
```

常见可派生的 Trait：

| Trait        | 功能              | 备注                          |
| ------------ | ----------------- | ----------------------------- |
| `Debug`      | `{:?}` 调试输出   | 最常用，几乎总是派生          |
| `Clone`      | `.clone()` 深拷贝 | 堆分配类型需要                |
| `Copy`       | 赋值时自动位拷贝  | 需同时派生 `Clone`            |
| `PartialEq`  | `==` 相等比较     | 大多数类型使用                |
| `Eq`         | 完全相等关系      | 需先派生 `PartialEq`          |
| `PartialOrd` | `<` `>` 大小比较  | 需先派生 `PartialEq`          |
| `Ord`        | 完全排序          | 需先派生 `Eq` 和 `PartialOrd` |
| `Hash`       | 哈希计算          | 用于 `HashMap` 的键           |
| `Default`    | 提供类型默认值    | `.default()` 构造             |

## Trait 作用域

调用 Trait 中的方法时，**必须将该 Trait 导入当前作用域**，即使某个类型已经实现了该 Trait：

```rust
// Vec 已实现 std::io::Write，但不导入就无法调用 Write 中的方法
let mut buf: Vec<u8> = vec![];
buf.write_all(b"hello")?; // ❌ 编译错误：找不到 write_all 方法

use std::io::Write;       // 必须导入 Trait
buf.write_all(b"hello")?; // ✅ 正确
```

原因：多个库可能为同一类型实现了同名方法，不显式导入编译器无法确定调用哪一个。大多数成熟的库（如 `tokio`、`serde`）会提供 `prelude` 模块一次性导入常用 Trait：

```rust
use tokio::prelude::*;
```

## Trait 作为参数

通过 Trait 约束泛型，限制参数必须具备指定能力。有三种等价写法：

**1. `impl Trait` 语法（最简洁，适合单个参数）**

```rust
// 参数 item 必须实现 Playable Trait
fn notify(item: &impl Playable) {
    println!("duration: {}", item.get_duration());
}
```

**2. Trait Bound 语法（可强制多个参数为同一类型）**

```rust
// 泛型 T 必须实现 Playable Trait
fn compare<T: Playable>(item1: T, item2: T) {
    println!("{} vs {}", item1.get_duration(), item2.get_duration());
}
```

**3. `where` 子句（多个泛型时可读性更好）**

```rust
fn complex_task<T, U>(item: T, msg: U)
// 泛型 T 必须实现 Playable 和 Debug 两个 Trait
// 泛型 U 必须实现 Display Trait
where
    T: Playable + std::fmt::Debug,
    U: std::fmt::Display,
{
    println!("{:?}: {}", item, msg);
}
```

多重约束用 `+` 连接，要求类型同时实现多个 Trait。

## Trait 作为返回值

返回一个实现了 Trait 的类型，而无需指定具体类型。

```rust
fn create_audio() -> impl Playable {
    Audio { name: "song.mp3".to_string(), duration: 3.5 }
}
```

**重要限制**：`impl Trait` 只能返回**一种具体类型**，以下代码无法编译：

```rust
// ❌ 编译错误：同一函数不能在不同分支返回不同类型
fn create_media(is_video: bool) -> impl Playable {
    if is_video {
        Video { name: "movie.mp4".to_string(), duration: 120.0 }
    } else {
        Audio { name: "song.mp3".to_string(), duration: 3.5 }
    }
}
```

原因：`impl Trait` 是编译期泛型的语法糖，返回类型在编译期必须确定为某一具体类型。需要返回不同类型时，使用 Trait 对象 `Box<dyn Trait>`（见下节）。

## Trait 对象（dyn Trait）

Trait 本身不能作为数据类型使用，但 **Trait 对象**（Trait Object）可以。Trait 对象使用 `dyn` 关键字标记，几乎总是以引用方式使用：`&dyn Trait`、`Box<dyn Trait>`、`Rc<dyn Trait>` 等。

```rust
// x 是一个 Trait 对象，要求是实现了 Playable 的某个类型实例
let x: &dyn Playable = &Audio { name: "song.mp3".to_string(), duration: 3.5 };
x.play(); // 运行时动态分派
```

> 如果说泛型是类型参数,那么Trait 对象就是在约束能力,而不要求是哪种具体类型.

### 内存布局：胖指针

Trait 对象的引用是一个**胖指针**，由两个指针组成，固定 16 字节（64 位系统）：

```
&dyn Playable（栈上，16 字节）
┌──────────────────┬──────────────────┐
│  ptr（数据指针）  │  vptr（虚表指针） │
└────────┬─────────┴────────┬─────────┘
         │                  │
         ▼ 指向具体实例      ▼ 指向虚表（只读数据区）
    Audio { ... }     ┌─────────────────────┐
                      │  drop 函数指针       │
                      │  play 函数指针       │
                      │  get_duration 指针   │
                      │  pause 函数指针      │
                      └─────────────────────┘
```

- **数据指针**：指向具体类型实例的内存（如 `Audio` 的数据）
- **虚表指针（vtable）**：指向一张函数指针表，记录该类型对 Trait 中每个方法的具体实现

调用方法时，程序通过 vtable 查找对应的函数指针再调用，这一过程在**运行时**完成，称为**动态分派**（dynamic dispatch）。

### 使用 Trait 对象的场景

Trait 对象的核心价值：允许在同一个集合中存放**不同类型**的值，只要它们都实现了同一个 Trait：

```rust
fn main() {
    // 这个 Vec 要求存放实现了 Playable Trait 的类型实例，但具体类型可以不同
    // Vec 中同时存放 Audio 和 Video，因为两者都实现了 Playable, 但类型不同
    let playlist: Vec<Box<dyn Playable>> = vec![
        Box::new(Audio { name: "song.mp3".to_string(), duration: 3.5 }),
        Box::new(Video { name: "movie.mp4".to_string(), duration: 120.0 }),
    ];

    for item in &playlist {
        item.play(); // 运行时动态分派，分别调用各自的 play 实现
    }
}
```

也可以用于需要返回不同类型的函数：

```rust
// 返回一个实现了 Playable Trait 的 Box<dyn Playable>，具体类型在运行时确定
fn create_media(is_video: bool) -> Box<dyn Playable> {
    if is_video {
        Box::new(Video { name: "movie.mp4".to_string(), duration: 120.0 })
    } else {
        Box::new(Audio { name: "song.mp3".to_string(), duration: 3.5 })
    }
}
```

### Trait 对象与泛型对比

| 对比项           | 泛型（`T: Trait`）         | Trait 对象（`dyn Trait`）      |
| ---------------- | -------------------------- | ------------------------------ |
| 分派时机         | 编译期静态分派             | 运行时动态分派                 |
| 性能             | 更高（单态化，无额外开销） | 稍低（vtable 查找）            |
| 同一集合         | 只能放**同一类型**的元素   | 可以放**不同类型**的元素       |
| 函数返回不同类型 | ❌ 不可以                  | ✅ 可以                        |
| 二进制体积       | 较大（单态化膨胀）         | 较小                           |
| 使用限制         | 无额外限制                 | Trait 必须满足**对象安全**规则 |

> `T: Trait` 表示泛型 T 必须实现 Trait,既要类型参数又要 Trait 约束;
>
> `dyn Trait` 只关心能力，不关心具体类型

### Trait 对象安全

只有**对象安全**（object-safe）的 Trait 才能创建 Trait 对象。Trait 方法必须满足：

- **返回值类型不是 `Self`**,否则无法在运行时确定具体类型.
- **方法没有泛型类型参数**,否则无法生成统一的虚函数表.

```rust
// ❌ Clone 不是对象安全的，因为 clone() 返回 Self
let v: Vec<Box<dyn Clone>> = vec![]; // 编译错误
```

### `&` 或 `Box`

这是初学者最容易困惑的地方——为什么不能直接写 `dyn Trait`？

- **大小不固定**:Rust 在编译时需要知道每个变量的大小.`Dog` 可能占 8 字节,`Cat` 可能占 800 字节.如果只说"给我个会叫的动物",Rust 不知道该分配多少内存.
- **指针大小固定**:无论指向什么,指针在 64 位系统上始终是 8 字节.
- **胖指针（Fat Pointer）**:`&dyn Trait` 实际存储了**两个**指针:
  - 一个指向**数据本身**.
  - 一个指向**虚函数表（vtable）**,记录了该类型所有 trait 方法的地址.

```
&dyn Trait 内存布局:
┌─────────────────┬─────────────────┐
│  data pointer   │  vtable pointer │
│  (指向实际数据)  │  (指向方法表)   │
└─────────────────┴─────────────────┘
```

## 条件实现

条件实现（Blanket Implementation）通过带 Trait 约束的 `impl` 块，可以有条件地只为实现了特定 Trait 的类型实现方法或另一个 Trait：

```rust{10,24}
pub trait GetName {
    fn get_name(&self) -> &String;
}

pub trait PrintName {
    fn print_name(&self);
}

// 为所有实现了 GetName 的类型自动实现 PrintName
impl<T: GetName> PrintName for T {
    fn print_name(&self) {
        println!("name = {}", self.get_name());
    }
}

struct Student { name: String }

impl GetName for Student {
    fn get_name(&self) -> &String { &self.name }
}

fn main() {
    let s = Student { name: "Alice".to_string() };
    s.print_name(); // Student 实现了 GetName，因此自动获得 PrintName 的方法
}
```

标准库大量使用这种模式，例如为所有实现了 `Display` 的类型自动实现 `ToString`。

## 使用原则

- `impl Struct`：私有逻辑、内部实现，不对外暴露
- `impl Trait`：对外接口、公开能力、通用算法
- 当发现多个结构体有相同操作，或第三方函数需要某种能力时，将共性逻辑提取为 Trait
