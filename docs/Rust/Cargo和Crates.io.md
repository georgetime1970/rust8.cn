# Cargo 与 Crates.io

Cargo 是 Rust 的官方构建系统与包管理器，负责项目的创建、依赖下载、编译、测试和发布等全生命周期管理。[Crates.io](https://crates.io/) 是 Rust 的官方包注册中心，所有公开发布的 crate 都托管于此。本章介绍 Cargo 的进阶特性：编译配置定制、crate 发布、工作空间管理以及工具扩展。

## 发布配置（Release Profiles）

发布配置是一组预定义的编译器参数集合，用于控制**编译速度**与**运行性能**之间的权衡。Cargo 内置两个最常用的配置：

| 配置      | 触发命令                | 优化级别        | 适用场景                       |
| --------- | ----------------------- | --------------- | ------------------------------ |
| `dev`     | `cargo build`           | `opt-level = 0` | 日常开发，编译快，含调试信息   |
| `release` | `cargo build --release` | `opt-level = 3` | 生产发布，编译慢，运行速度最优 |

`opt-level` 控制编译器的优化强度，取值范围为 `0`–`3`，值越高优化越激进，编译耗时越长：

```toml
# Cargo.toml
[profile.dev]
opt-level = 1       # 默认 0，稍微优化，加快开发时的运行速度

[profile.release]
opt-level = 3       # 默认 3，最高优化
```

每种配置互相独立，修改 `dev` 不会影响 `release`。完整的可调项（如调试信息、LTO、溢出检查等）可在 [Cargo 文档](https://doc.rust-lang.org/cargo/reference/profiles.html) 中查阅。

## 将 Crate 发布到 Crates.io

### 编写文档注释

Rust 使用 `///`（文档注释）为公开 API 生成 HTML 文档，支持 Markdown 语法，并且文档中的代码块在 `cargo test` 时会自动运行（文档测试）：

> 在 [自动化测试](./自动化测试.md#文档测试) 中有详细介绍。

````rust
/// 将两个数相加。
///
/// # 示例
///
/// ```
/// let result = my_crate::add(2, 3);
/// assert_eq!(result, 5);
/// ```
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
````

使用 `cargo doc --open` 可在浏览器中预览生成的文档。

`//!` 注释用于描述整个模块或 crate 本身（通常写在 `src/lib.rs` 的顶部）：

```rust
//! # My Crate
//!
//! 这是 crate 的整体说明文档。
```

### 用 `pub use` 重导出优化 API

内部模块层级对开发者有意义，但对库的使用者来说往往是负担。`pub use` 可以将深层路径的类型提升到 crate 根，让用户无需关心内部结构：
::: code-group

```rust [src/lib.rs]
pub use self::kinds::PrimaryColor;
pub use self::utils::mix;

mod kinds {
    pub struct PrimaryColor(pub u8, pub u8, pub u8);
}
mod utils {
    use crate::kinds::PrimaryColor;
    pub fn mix(c1: PrimaryColor, c2: PrimaryColor) -> PrimaryColor { todo!() }
}
```

:::

重导出后，用户可以直接写：

::: code-group

```rust [src/main.rs]
use my_crate::PrimaryColor;  // ✅ 无需 my_crate::kinds::PrimaryColor
```

:::
文档页面也会在 crate 根目录下直接显示这些类型，而不是埋在子模块里。

### 发布流程

**1. 注册账号并获取 API Token**

在 [crates.io](https://crates.io/) 用 GitHub 账号注册后，在账号设置页面生成 API Token，然后在终端登录：

```bash
cargo login
# 输入你的 API Token
```

Token 会保存在 `~/.cargo/credentials` 文件中。

**2. 填写 Cargo.toml 元数据**

发布前必须填写以下字段（否则 `cargo publish` 会报错）：

::: code-group

```toml [Cargo.toml]
[package]
name        = "my_crate"      # 名称在 crates.io 上必须唯一
version     = "0.1.0"         # 语义化版本（SemVer）
edition     = "2024"
description = "一句话描述这个 crate 的功能"
license     = "MIT OR Apache-2.0"   # 开源项目推荐双协议
```

:::
**3. 发布**

```bash
cargo publish
```

> 发布是**永久性**操作：同一版本号无法覆盖发布，代码也无法删除。Crates.io 的设计目标之一就是作为永久代码归档——所有依赖你的项目需要保证能一直正常构建。

**4. 撤回版本（Yank）**

如果某个版本存在严重 bug，可以将其标记为"撤回"：

```bash
cargo yank --vers 0.1.0       # 撤回
cargo yank --vers 0.1.0 --undo  # 取消撤回
```

撤回**不删除代码**，仅阻止新项目将该版本加入 `Cargo.lock`。已有 `Cargo.lock` 的项目不受影响，仍可继续下载和使用。

## Cargo 工作空间

当项目规模增大，往往需要将代码拆分为多个相关联的 crate。**工作空间**（Workspace）是一种将多个 crate 组织在同一目录下统一管理的机制，共享一份 `Cargo.lock` 和一个 `target` 输出目录。

### 创建工作空间

以一个二进制 crate `adder` 依赖库 crate `add_one` 为例：

**第一步：** 新建目录，在其中创建工作空间根配置：

::: code-group

```toml [add/Cargo.toml]
[workspace]
resolver = "3"
```

:::

> 工作空间根 `Cargo.toml` 没有 `[package]` 部分，只有 `[workspace]`。`resolver = "3"` 启用 Cargo 最新的依赖解析算法。

**第二步：** 在 `add/` 目录下创建各个成员 crate：

```bash
cargo new adder          # 二进制 crate
cargo new add_one --lib  # 库 crate
```

Cargo 会自动将新建的 crate 加入工作空间的 `members` 列表：

::: code-group

```toml [add/Cargo.toml]
[workspace]
resolver = "3"
members  = ["adder", "add_one"]
```

:::
此时目录结构如下：

```
add/
├── Cargo.lock
├── Cargo.toml          ← 工作空间根配置
├── add_one/            ← add_one 库 crate
│   ├── Cargo.toml
│   └── src/lib.rs
├── adder/              ← adder 二进制 crate
│   ├── Cargo.toml
│   └── src/main.rs
└── target/             ← 所有 crate 共用同一个构建目录
```

**第三步：** 实现库函数：

::: code-group

```rust [add_one/src/lib.rs]
pub fn add_one(x: i32) -> i32 {
    x + 1
}
```

:::

**第四步：** 在 `adder/Cargo.toml` 中声明对 `add_one` 的依赖：

::: code-group

```toml [adder/Cargo.toml]
[dependencies]
add_one = { path = "../add_one" }
```

:::

> Cargo 不会自动推断工作空间成员之间的依赖关系，必须**显式声明**。

**第五步：** 在 `adder` 中使用 `add_one`：

::: code-group

```rust [adder/src/main.rs]
use add_one::add_one;

fn main() {
    let num = 5;
    println!("{} + 1 = {}", num, add_one(num));
}
```

:::

### 工作空间常用命令

| 命令                    | 说明                       |
| ----------------------- | -------------------------- |
| `cargo build`           | 构建工作空间中的所有 crate |
| `cargo build -p adder`  | 只构建指定 crate           |
| `cargo run -p adder`    | 运行指定的二进制 crate     |
| `cargo test`            | 测试所有 crate             |
| `cargo test -p add_one` | 只测试指定 crate           |

### 共享外部依赖

工作空间在顶层维护**唯一一份** `Cargo.lock`。当多个成员 crate 都依赖同一个外部包（如 `rand`）时，Cargo 确保它们使用完全相同的版本，避免版本冲突，也减少重复编译：

::: code-group

```toml [adder/Cargo.toml]
[dependencies]
rand = "0.9"
```

```toml [add_one/Cargo.toml]
[dependencies]
rand = "0.9"
```

:::
两个声明会被解析为同一个版本，记录在顶层 `Cargo.lock` 中，不会产生两份独立的依赖。

## 使用 `cargo install` 安装命令行工具

`cargo install` 从 Crates.io 下载、编译并安装二进制 crate，生成的可执行文件默认放在 `~/.cargo/bin/` 目录下（需确保该目录在 `$PATH` 中）：

```bash
cargo install ripgrep   # 安装 rg 命令行工具
cargo install --list    # 查看已安装的工具
```

只有含有 `[[bin]]` 目标的 crate 才能通过此命令安装；纯库 crate 无法安装。

## Cargo 自定义扩展命令

Cargo 支持通过外部二进制文件扩展子命令，无需修改 Cargo 本身。规则很简单：如果 `$PATH` 中存在名为 `cargo-something` 的可执行文件，就可以用 `cargo something` 来调用它，并且它会出现在 `cargo --list` 的列表中。

这意味着可以用 `cargo install` 安装社区扩展工具，然后像内置命令一样使用：

```bash
cargo install cargo-watch   # 安装 cargo-watch
cargo watch -x run          # 像内置命令一样使用
```

常见的社区扩展工具：

| 工具            | 功能                                      |
| --------------- | ----------------------------------------- |
| `cargo-watch`   | 文件变更时自动重新编译/运行               |
| `cargo-edit`    | 命令行管理依赖（`cargo add`、`cargo rm`） |
| `cargo-expand`  | 展开宏，查看宏展开后的代码                |
| `cargo-audit`   | 检查依赖中的已知安全漏洞                  |
| `cargo-nextest` | 更快速的测试运行器                        |
