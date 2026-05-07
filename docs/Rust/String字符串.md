# String 字符串

Rust 有两种字符串类型：`str` 和 `String`。其中 `str` 是 `String` 的**切片类型**，即 `str` 类型的字符串值是 `String` 类型字符串值的一部分或全部。

`String` 类型由标准库提供，是对 `Vec<u8>` 的封装，支持可增长、可变、可拥有的 UTF-8 编码字符串。`str` 是核心语言内置的字符串切片类型，通常以引用形式 `&str` 出现。两者都保证是有效的 UTF-8 编码。

`String` 是一个结构体，内部包含一个 `Vec<u8>` 字段：

```rust
pub struct String {
    vec: Vec<u8>,
}
```

> `String` 和 `str` 的关系类就像 碗 和 饭，`String` 是 `str` 的拥有者和容器, `str` 是具体的字符串内存数据。

## 字符串字面量（&str）

字符串字面量使用双引号包围，其类型被推导为 `&str`：

```rust
let s = "hello";          // 推导为 &str
let s: &str = "hello";    // 等价写法
```

### 字面量的存储原理

字符串字面量并不是先在堆上创建一个 `String`，再引用它来得到 `&str` 的。编译器对字符串字面量做了特殊处理：

1. **编译期**：编译器将字符串字面量以硬编码的方式写入程序二进制文件中
2. **加载期**：程序被加载时，字符串字面量被放入内存的**全局字面量区**（不在堆上，也不在栈上）
3. **运行期**：执行到 `let s = "hello"` 时，将全局字面量区中该数据的地址保存到栈上的 `&str` 变量 `s` 中

```
  二进制文件        程序内存（加载后）     变量 s（栈上）
 ┌──────────┐      ┌──────────────┐     ┌───────────────────┐
 │  "hello" │  →   │   "hello"    │ ←── │  ptr + len(5)     │
 │ (硬编码)  │      │(全局字面量区) │     │     &str          │
 └──────────┘      └──────────────┘     └───────────────────┘
```

> 因此，字符串字面量拥有 `'static` 生命周期——程序运行期间始终有效，这正是字面量类型为 `&str` 而非 `str` 的原因之一。

## String 类型

`String` 类型没有 `&str` 类型对应的字面量构建方式，只能通过方法构建：

```rust
let mut s = String::new();         // 新建空字符串
let s = String::from("hello");     // 从字面量构建
let s = "hello".to_string();       // 等价写法
let s = "hello".to_owned();        // 等价写法
```

### String::from 的堆拷贝原理

```rust
let s = String::from("hello");
```

这行代码的执行过程：编译器将 `"hello"` 硬编码写入二进制文件，程序加载时放入全局字面量区；运行到 `String::from()` 时，从字面量区将内容**拷贝**到堆内存；栈上的变量 `s` 保存指向堆内存的指针、长度和容量（共 3 个字长）。

```
 全局字面量区       堆内存            变量 s（栈上）
 ┌──────────┐     ┌──────────┐     ┌──────────────────────────┐
 │  "hello" │  →  │  "hello" │ ←── │  ptr + len(5) + cap(5)   │
 └──────────┘     └──────────┘     │         String            │
              (从字面量区拷贝而来)   └──────────────────────────┘
```

### 修改 String

- `push()` 追加单个字符，使用单引号，不获取所有权；
- `push_str()` 追加字符串 slice，使用双引号，不获取所有权；

```rust
let mut s = String::from("hello");
s.push(' ');           // push() 追加单个字符，使用单引号
s.push_str("world");   // push_str() 追加 &str，s 所有权不转移
println!("{s}");       // hello world
```

## str 与 String 的关系

`str` 是 `String` 的切片类型。对一个 `String` 进行切片操作，得到的就是 `str` 类型；取其引用则得到 `&str`：

```rust
let s = String::from("junmajinlong.com");

// s[0..3] 的类型为 str
// &s[0..3] 的类型为 &str（等价于 &(s[0..3])，而不是 (&s)[0..3]）
let s_str: &str = &s[0..3];

println!("{}", s_str); // 输出：jun
```

字符串字面量的类型同样是 `&str`，本质上也是对某块字符串数据的切片引用，只不过它指向全局字面量区而非堆内存：

| 表达式     | 类型     | 说明                                    |
| ---------- | -------- | --------------------------------------- |
| `s`        | `String` | 拥有所有权的字符串，数据在堆上          |
| `s[0..3]`  | `str`    | 字符串切片（DST，不能直接作为变量类型） |
| `&s[0..3]` | `&str`   | 字符串切片的引用（胖指针）              |
| `"hello"`  | `&str`   | 字面量，指向全局字面量区的胖指针        |

> `str` 是 DST（动态大小类型），无法直接作为变量类型使用，必须通过引用 `&str` 来访问。关于 `str` 是 DST 的详细说明，请参阅 [字符串 String 延申](./String延申.md#为什么-str-是-dst)。

## 字符串拼接

### `+` 运算符

`+` 底层调用 `add()` 方法，第一个参数接管 `self` 的所有权，第二个参数为 `&str`：

```rust
let s1 = String::from("Hello, ");
let s2 = String::from("world!");
let s3 = s1 + &s2; // s1 的所有权被转移，不能再使用 s1
```

### `format!` 宏

`format!` 不获取任何所有权，适合多个字符串拼接：

```rust
let s1 = String::from("tic");
let s2 = String::from("tac");
let s3 = String::from("toe");
let s = format!("{s1}-{s2}-{s3}"); // s1、s2、s3 均可继续使用
```

> `format!` 使用和 `println!` 完全相同的格式语法，但不打印，而是返回一个 `String`

| 方式      | 所有权         | 性能             | 适用场景         |
| --------- | -------------- | ---------------- | ---------------- |
| `+`       | 转移第一个参数 | 较高（直接追加） | 简单两段拼接     |
| `format!` | 不转移任何参数 | 稍低（额外分配） | 多段拼接、格式化 |

## 字符串索引与切片

字符串不支持直接整数索引，只能通过切片访问，因为 Rust 的字符串是 UTF-8 编码，一个字符可能占 1 到 4 个字节，整数索引的语义不明确：

```rust
let s = "hello";
// let c = s[0];  // ❌ 编译错误：不支持直接整数索引
```

使用切片时，必须在字符边界处切割，否则会 panic：

```rust
let s = "Здравствуйте"; // 西里尔字母，每个字符 2 字节
let slice = &s[0..4];   // ✅ 正确：4 字节 = 两个字符
println!("{}", slice);  // Зд

// let slice = &s[0..3];  // ❌ 运行时 panic：在字符中间切割
```

## 遍历字符串

- **`chars()`**：按 Unicode 字符迭代，返回 `char` 类型，推荐用于字符处理
- **`bytes()`**：按原始字节迭代，返回 `u8` 类型，用于字节级操作

```rust
for c in "Зд".chars() {
    println!("{c}");
}
// 输出: З
//      д

for b in "Зд".bytes() {
    println!("{b}");
}
// 输出: 208  151  208  180
```

> 需要人能理解的字符时，使用 `chars()`；需要机器处理的字节时，使用 `bytes()`。

## char 与 String 的区别

| 特性         | `char`      | `String`       |
| ------------ | ----------- | -------------- |
| 声明符号     | 单引号 `''` | 双引号 `""`    |
| 存储内容     | 单个字符    | 字符序列       |
| 大小         | 固定 4 字节 | 动态（堆分配） |
| 类型性质     | 原始类型    | `Vec<u8>` 封装 |
| Unicode 表示 | 单个码位    | 多个码位序列   |

## 常用方法

```rust
let s = String::from("  Hello, Rust!  ");

// 查询（借用，不转移所有权）
s.len();                      // 字节数（非字符数）
s.chars().count();            // 字符数（UTF-8 安全，推荐）
s.is_empty();
s.contains("Rust");
s.starts_with("  Hello");
s.ends_with("  ");
s.find("Rust");               // → Option<usize> 首次出现的字节位置
s.rfind("l");                 // → Option<usize> 最后一次出现的字节位置

// 转换（返回新值，不转移原所有权）
s.trim();                     // 去除首尾空白 → &str
s.trim_start();               // 只去首部空白 → &str
s.trim_end();                 // 只去尾部空白 → &str
s.to_uppercase();             // → String
s.to_lowercase();             // → String
s.replace("Rust", "World");   // 替换全部匹配 → String
s.replacen("l", "L", 2);      // 只替换前 n 个匹配 → String

// 分割（返回迭代器，借用原数据）
let parts: Vec<&str> = s.split(',').collect();
let words: Vec<&str> = s.split_whitespace().collect();
let lines: Vec<&str> = "a\nb\nc".lines().collect();
```

> - 查询方法借用原数据；
> - `to_*` 和 `replace*` 返回新 `String`；
> - `trim*` 返回 `&str`；分割返回迭代器（借用）。

### `len()` 与 `chars().count()` 的区别

```rust
let s = "你好";
println!("{}", s.len());           // 6（字节数：每个汉字 3 字节）
println!("{}", s.chars().count()); // 2（字符数）
// 对 ASCII 字符串两者相等；含多字节字符时必须用 chars().count() 获取字符数
```

### `&str` 与 `String` 互转

```rust
// &str → String
let s1 = "hello".to_string();
let s2 = String::from("hello");
let s3 = "hello".to_owned();  // 三种等价，to_string 最常用

// String → &str
let owned = String::from("hello");
let borrowed: &str = &owned;
let borrowed2: &str = owned.as_str();
```

### `parse()` — 字符串转其他类型

```rust
let n: i32 = "42".parse().unwrap();
let f: f64 = "3.14".parse().unwrap();
// 推荐：使用 parse::<T>() 显式指定类型，避免依赖上下文推断
let n = "42".parse::<i32>().unwrap();
```
