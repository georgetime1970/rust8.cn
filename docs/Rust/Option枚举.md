# `Option<T>` 枚举

`Option<T>` 是 Rust 标准库中内置的枚举,用来表示"一个值要么存在(`Some`),要么不存在(`None`)".

Rust 没有 `null` 值,用 `Option<T>` 来强迫程序员**显式处理值不存在的情况**,从根源上避免了其他语言中常见的"空指针异常".

## `Option<T>` 的定义

标准库中 `Option<T>` 的定义如下:

```rust
enum Option<T> {
    Some(T),
    None,
}
```

`Option<T>` 是一个**泛型枚举**,它有两个变体:

- `Some(T)`: 包含一个类型为 `T` 的值,表示存在.
- `None`: 不包含任何值,表示不存在.

> [!warning] 注意
> `Some` 和 `None` 不是关键字

## `Option<T>` 的实例化

实例化 `Option<T>` 时,可以使用 `Some` 来包装一个值,或者直接使用 `None` 来表示没有值:

```rust
let some_number = Some(1);           // 等于 Option::Some(1)
let none_number: Option<i32> = None; // 必须标注类型,否则编译器无法推断 T
```

## 处理 `Option<T>`

### `match` 模式匹配

`match` 是处理 `Option<T>` 最基本的方式,它强制要求处理所有变体:

```rust
let num = Some(5);

match num {
    Some(n) => println!("有值: {}", n),
    None    => println!("没有值"),
}
```

### `if let` 简化匹配

只关心 `Some` 分支时,`if let` 比 `match` 更简洁:

```rust
let num = Some(5);

if let Some(n) = num {
    println!("有值: {}", n);
} else {
    println!("没有值");
}
```

### `while let` 循环匹配

值为 `Some` 时持续循环,`None` 时自动退出:

```rust
let mut stack = vec![1, 2, 3];

while let Some(top) = stack.pop() {
    println!("{}", top); // 依次打印 3, 2, 1
}
```

## `Option<T>` 的常见用途

1.  **函数返回值**: 当函数可能无法返回有效结果时,使用 `Option` 来表示成功或失败.

    ```rust
    fn find_user(id: u32) -> Option<String> {
        if id == 1 {
            Some(String::from("Alice"))
        } else {
            None // 找不到时返回 None,而非 null
        }
    }
    ```

2.  **结构体字段**: 当某个字段可能不存在时,使用 `Option` 来表示.

    ```rust
    struct User {
        name: String,
        nickname: Option<String>, // 昵称是可选的
        age: Option<u8>,
    }
    ```

3.  **解析/转换操作**: 当某个操作可能失败时,使用 `Option` 来表示成功或失败.

    ```rust
    fn parse_port(s: &str) -> Option<u16> {
        s.parse().ok() // 解析失败返回 None
    }
    ```

## `Option<T>` 常用方法

### 值提取类

从 `Option` 中取出内部的值:

| 方法                        | 说明                                                       |
| --------------------------- | ---------------------------------------------------------- |
| `unwrap()`                  | `Some(值)` 返回值；`None` 直接 panic                       |
| `unwrap_or(default)`        | `None` 时返回指定默认值                                    |
| `unwrap_or_else(\|\| expr)` | `None` 时执行闭包生成默认值(延迟求值,适合开销较大的默认值) |
| `unwrap_or_default()`       | `None` 时返回类型的零值(需实现 `Default` trait)            |
| `expect("msg")`             | 同 `unwrap`,但 panic 时显示自定义消息,便于调试             |

```rust
let none: Option<i32> = None;

let a = none.unwrap_or(0);              // 0
let b = none.unwrap_or_else(|| 1 + 1);  // 2(延迟求值)
let c = none.unwrap_or_default();       // 0(i32 的默认值)

let some_val = Some(5);
let d = some_val.unwrap();              // 5, 如果是 None 则 panic
let e = some_val.expect("值不存在");     // 5,若为 None 则 panic 并打印消息
```

### 状态检查类

检查 `Option` 当前的状态,不消耗所有权:

| 方法                      | 说明                       |
| ------------------------- | -------------------------- |
| `is_some()`               | 是否是 `Some`              |
| `is_none()`               | 是否是 `None`              |
| `is_some_and(\|x\| cond)` | 是 `Some` 且内部值满足条件 |

```rust
let num = Some(5);
let none: Option<i32> = None;

println!("{}", num.is_some());               // true
println!("{}", none.is_none());              // true
println!("{}", num.is_some_and(|x| x > 3)); // true
println!("{}", num.is_some_and(|x| x > 9)); // false
```

### 转换类

在保持 `Option` 结构的同时对内部值进行变换:

| 方法                                    | 说明                                                       |
| --------------------------------------- | ---------------------------------------------------------- |
| `map(\|x\| expr)`                       | `Some` 时对值进行转换返回新 `Some`；`None` 原样返回 `None` |
| `map_or(default, \|x\| expr)`           | `Some` 时转换；`None` 时返回默认值(立即求值)               |
| `map_or_else(\|\| default, \|x\| expr)` | 同 `map_or`,但默认值通过闭包延迟生成                       |
| `filter(\|x\| cond)`                    | `Some` 且条件满足返回原 `Some`；否则返回 `None`            |

```rust
let num = Some(5);

let doubled  = num.map(|n| n * 2);               // Some(10)
let as_str   = num.map(|n| n.to_string());       // Some("5")

let result   = num.map_or(0, |n| n + 1);         // 6
let result2  = num.map_or_else(|| 0, |n| n + 1); // 6

let filtered  = num.filter(|n| *n > 3);          // Some(5)
let filtered2 = num.filter(|n| *n > 10);         // None
```

### 链式处理类

组合多个 `Option` 操作,适合多步骤的可失败逻辑:

| 方法                     | 说明                                                                   |
| ------------------------ | ---------------------------------------------------------------------- |
| `and(other)`             | `Some` 时返回 `other`；`None` 返回 `None`                              |
| `and_then(\|x\| Option)` | 链式处理,闭包返回新的 `Option`(扁平化,等同于其他语言的 `flatMap`)      |
| `or(other)`              | `Some` 返回自身；`None` 返回 `other`                                   |
| `or_else(\|\| Option)`   | `Some` 返回自身；`None` 执行闭包返回结果                               |
| `?` 运算符               | 有值就继续；`None` 直接从当前函数返回 `None`(仅限返回 `Option` 的函数) |

```rust
let none: Option<i32> = None;

// and / or
let a = Some(2).and(Some("ok")); // Some("ok"),前者 Some 才取后者
let b = none.or(Some(42));       // Some(42),前者 None 才取后者
let c = none.or_else(|| Some(100)); // Some(100)

// and_then 链式(类似 flatMap,避免嵌套 Option)
let result = Some("5")
    .and_then(|s| s.parse::<i32>().ok()) // Some(5)
    .and_then(|n| if n > 0 { Some(n * 2) } else { None }); // Some(10)

// ? 运算符
fn parse_and_double(s: &str) -> Option<i32> {
    let n = s.parse::<i32>().ok()?; // 解析失败直接返回 None
    Some(n * 2)
}
```

### 引用类

在不转移所有权的前提下操作 `Option`:

| 方法             | 说明                                            |
| ---------------- | ----------------------------------------------- |
| `as_ref()`       | `Option<T>` → `Option<&T>`,获取值的不可变引用   |
| `as_mut()`       | `Option<T>` → `Option<&mut T>`,获取值的可变引用 |
| `as_deref()`     | `Option<String>` → `Option<&str>`,自动解引用    |
| `as_deref_mut()` | `Option<String>` → `Option<&mut str>`           |

```rust
let text = Some(String::from("hello"));

// as_ref 避免消耗所有权
let len = text.as_ref().map(|s| s.len()); // Some(5)
println!("{:?}", text);                    // Some("hello"),text 仍可用

// as_deref 简化 String -> &str 的转换
let s: Option<&str> = text.as_deref();    // Some("hello")

// as_mut 修改内部值
let mut opt = Some(String::from("hi"));
if let Some(s) = opt.as_mut() {
    s.push_str(" world");
}
println!("{:?}", opt); // Some("hi world")
```

### 所有权操作类

直接修改 `Option` 本身的状态:

| 方法                             | 说明                                                 |
| -------------------------------- | ---------------------------------------------------- |
| `take()`                         | 取出值的所有权并将原 `Option` 置为 `None`            |
| `replace(value)`                 | 替换为新值并返回旧值                                 |
| `insert(value)`                  | 插入值(无论原来有没有值)并返回可变引用               |
| `get_or_insert(value)`           | `None` 时插入值并返回可变引用；`Some` 时直接返回引用 |
| `get_or_insert_with(\|\| value)` | 同上,但通过闭包延迟生成值                            |

```rust
let mut opt = Some(5);

let taken = opt.take();    // taken = Some(5), opt = None
let prev  = opt.replace(10); // prev = None, opt = Some(10)

// 惰性初始化(常见于缓存场景)
let mut cache: Option<i32> = None;
let val = cache.get_or_insert(42);  // cache = Some(42),返回 &mut 42
*val += 1;
println!("{:?}", cache); // Some(43)
```

### 类型转换类

在 `Option` 与其他类型之间相互转换:

| 方法                   | 说明                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| `ok_or(err)`           | `Option<T>` → `Result<T, E>`；`Some(v)` → `Ok(v)`,`None` → `Err(err)` |
| `ok_or_else(\|\| err)` | 同 `ok_or`,但错误值通过闭包延迟生成                                   |
| `transpose()`          | `Option<Result<T, E>>` → `Result<Option<T>, E>`                       |
| `flatten()`            | `Option<Option<T>>` → `Option<T>`,去掉一层嵌套                        |
| `zip(other)`           | `Some(a).zip(Some(b))` → `Some((a, b))`；任一为 `None` 则返回 `None`  |
| `unzip()`              | `Option<(A, B)>` → `(Option<A>, Option<B>)`                           |

```rust
let num  = Some(5);
let none: Option<i32> = None;

// ok_or: 转换为 Result
let ok: Result<i32, &str> = num.ok_or("not found");  // Ok(5)
let err: Result<i32, &str> = none.ok_or("not found"); // Err("not found")

// flatten: 去除嵌套
let nested: Option<Option<i32>> = Some(Some(42));
let flat = nested.flatten(); // Some(42)

// zip: 合并两个 Option
let a = Some(1);
let b = Some("hi");
let zipped = a.zip(b); // Some((1, "hi"))

let c: Option<i32> = None;
let not_zipped = c.zip(b); // None

// transpose: Option<Result> ↔ Result<Option>
let opt_result: Option<Result<i32, &str>> = Some(Ok(1));
let result_opt: Result<Option<i32>, &str> = opt_result.transpose(); // Ok(Some(1))
```

## 综合示例

```rust
fn main() {
    let num = Some(5);
    let none: Option<i32> = None;

    // 值提取
    let a = none.unwrap_or(0);             // 0
    let b = num.expect("应该有值");         // 5

    // 转换与过滤
    let doubled  = num.map(|n| n * 2);     // Some(10)
    let filtered = num.filter(|n| *n > 9); // None(5 不大于 9)

    // 链式处理: 解析字符串 -> 过滤正数 -> 翻倍
    let result = Some("42")
        .and_then(|s| s.parse::<i32>().ok()) // Some(42)
        .filter(|n| *n > 0)                  // Some(42)
        .map(|n| n * 2);                     // Some(84)
    println!("{:?}", result); // Some(84)

    // 类型转换
    let as_result: Result<i32, &str> = num.ok_or("no value"); // Ok(5)

    // take 与 replace
    let mut opt = Some(10);
    let old = opt.take();     // old = Some(10), opt = None
    opt.replace(20);          // opt = Some(20)
}

// ? 运算符传播 None
fn process(input: Option<&str>) -> Option<i32> {
    let s = input?;                  // None 时直接返回 None
    let n = s.parse::<i32>().ok()?; // 解析失败返回 None
    Some(n * 2)
}

fn main2() {
    println!("{:?}", process(Some("21"))); // Some(42)
    println!("{:?}", process(None));       // None
    println!("{:?}", process(Some("abc"))); // None
}
```
