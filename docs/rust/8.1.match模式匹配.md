# match 模式匹配

- 模式匹配工具,不仅用于枚举
- 穷尽性: 编译器要求你必须处理所有可能的情况,否则无法编译通过.这保证了运行时的类型安全
- 表达式性质: `match` 是一个表达式,这意味着它可以返回值,直接用于变量赋值
- 按序匹配: 程序会从上到下检查分支,执行第一个匹配成功的代码块
- 所有权: `match` 会转移被匹配值的所有权(可用引用 `&` 避免移动)
- 适用范围: `Option<T>`、`Result<T, E>`、自定义枚举、整数、字符串等
- 匹配值可以是字面量、变量、通配符或复杂模式

## match 用法

```rust
#[derive(Debug)]
enum San {
    eat(String), // 状态吃:吃的什么
    sleep(u8),   // 状态睡:睡了多久
    run(i32),    // 跑了多远
    jump(i32),   // 跳了多远
}

fn main() {
    // 定义san的状态为跳,跳了2米
    let san = San::jump(2);
    // match匹配san的状态
    match san {
        San::eat(food) => {
            println!("吃的是: {food:?}")
        }
        San::sleep(hours) => {
            println!("睡了{hours:?}小时")
        }
        other => {
            println!("除了吃和睡的其他情况: {other:?}")
        } // 匹配其他可能,使用里面的值
        _ => {
            println!("除了吃和睡的其他情况")
        } // 匹配其他可能,不在乎里面的值
      // 注意: 最后的占位符匹配永远不会执行,根据按序匹配other已经处理了
    }
}
```

**关键点:**

- 必须穷尽所有分支, 使用`other` 或 `_` 来处理未匹配的情况
- 所有 `enum` 变体都应被显式处理,确保代码安全

## if let / if let else

- `match` 的语法糖,简化只关心一种情况的模式匹配
- 只关心一种情况,也可以更精确地关心这种情况的某些值,其他情况都不关心
- 本质是: 如果匹配就执行代码块,否则执行 `else` 块(`else` 可选)
- 相比 `match`: 代码更简洁,但只能处理一个模式

```rust
// 1. 如果 san 是跳,就执行代码,不关心跳了多少米
if let San::jump(_) = san {
    println!("跳跃!");
} else {
    println!("其他情况: {san:?}")
}

// 2. 如果 san 是跳了 2 米,就执行代码
if let San::jump(2) = san {
    println!("跳了 2 米!");
} else {
    println!("其他情况: {san:?}")
}

// 3. 如果 san 是跳,绑定跳跃距离到变量
if let San::jump(distance) = san {
    println!("跳了 {distance} 米!");
} else {
    println!("其他情况: {san:?}")
}
```

**关键点:**

- `else` 块可选,不需要处理所有情况
- 变量绑定作用域仅限于 `if let` 块内
- 支持守卫条件: `if let San::jump(d) = san if d > 5 { ... }`
- 所有权规则同 `match`,可用 `&` 避免移动

## let-else

- 守卫模式/解构失败退出
- 如果不匹配,直接 `return`、`break` 或 `panic!` 退出
- 必须包含 `else` 块
- `else` 块里必须中止当前流程(用 `return`、`break`、`panic!` 等)
- 如果匹配成功,变量会直接绑定到当前作用域,后续可直接使用
- 本质: 符合条件才让程序继续执行,否则直接退出

```rust
let San::jump(distance) = san else {
    panic!("不是跳跃状态");
};
println!("跳了 {distance} 米");

// 在函数中使用 return
fn check_jump(san: San) -> i32 {
    let San::jump(d) = san else {
        return 0; // 不是跳跃状态,返回 0
    };
    d
}
```

**关键点:**

- `else` 块必须改变控制流(不能继续执行后续代码)
- 比 `if let` 更清晰地表达"必须匹配"的意图
- 变量绑定作用域为当前作用域
- 所有权规则同 `match`,可用 `&` 避免移动
