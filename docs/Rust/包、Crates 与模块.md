# 包、Crates 与模块

Rust 的模块系统由四个层级概念组成：**Workspace（工作空间）**、**Package（包）**、**Crate**、**Module（模块）**，范围从大到小。理解这四个概念是理解 Rust 项目组织方式的基础。

与 TypeScript 的文件系统驱动不同，Rust 的模块系统是**作用域驱动**的：必须通过 `mod` 关键字显式声明，从根文件（`main.rs` 或 `lib.rs`）开始构建模块树，未声明的代码无法被访问。

## 四个核心概念

| 概念          | 定义                                                                              | 对应物   |
| ------------- | --------------------------------------------------------------------------------- | -------- |
| **Workspace** | 多个 Package 的集合，共享一个 `Cargo.lock` 和输出目录                             | 单体仓库 |
| **Package**   | 一个 `Cargo.toml` 定义的项目，只能有一个 library crate，但可以有多个 binary crate | 项目     |
| **Crate**     | 最小编译单元，编译器的处理对象                                                    | 编译单元 |
| **Module**    | crate 内通过 `mod` 关键字定义的代码组织单位，构成模块树                           | 命名空间 |

```
Workspace
  └─ Package（Cargo.toml）
       └─ Crate（main.rs / lib.rs）
            └─ Module（mod）
```

## Crate

Crate 是 Rust 的最小编译单元，分为两种类型：Binary crate 和 Library crate。

**创建 binary crate（默认）：**

binary crate 是最常见的 crate 类型，用于生成可执行文件，入口为 `src/main.rs`，必须包含 `main()` 函数：

```bash
cargo new my-app        # 生成 src/main.rs，是一个 binary crate
```

文件目录:

```
my-app/
├── Cargo.toml
└── src/
    └── main.rs
```

**创建 library crate：**

library crate 用于生成库文件(（.rlib、.so 等）)，供其他 crate 或 binary crate 调用，入口为 `src/lib.rs`，不需要 `main()` 函数：

```bash
cargo new my-lib --lib  # 生成 src/lib.rs，是一个 library crate
```

文件目录:

```
my-lib/
├── Cargo.toml
└── src/
    └── lib.rs
```

## Package

Package 是一个包含 `Cargo.toml` 的项目，可以包含一个 library crate 和多个 binary crate。Package 是 Cargo 管理的基本单位，也是最常见的项目结构，发布到 crates.io 也是以 Package 为单位。

**创建 package：**

```bash
cargo new my-package  # 创建 binary crate
```

增加一个 Library Crate:

- 在 `src/` 下手动新建一个 `lib.rs`。
- 路径：`src/lib.rs`

增加多个 Binary Crates：

- 在 `src/` 下手动创建一个 `bin/` 文件夹，里面每个 `.rs` 文件都会变成一个独立的 binary。
- 路径：`src/bin/tool1.rs`, `src/bin/tool2.rs`

```bash
my-package/
├── Cargo.toml
└── src/
    ├── main.rs          # 默认 Binary Crate (名字同 Package)
    ├── lib.rs           # Library Crate (手动创建)
    └── bin/             # 额外的 Binary Crates 存放处 (手动创建)
        ├── tool1.rs     # 编译后生成名为 tool1 的独立可执行程序
        └── tool2.rs     # 编译后生成名为 tool2 的独立可执行程序
```

现在有多个“出口”，需要用 `-p` 或 `--bin` 指定运行哪一个：

- 运行主程序：`cargo run`
- 运行特定工具：`cargo run --bin tool1`
- 测试库代码：`cargo test` （会自动测试 `lib.rs` 中的代码）

## 工作空间（Workspace）

当项目包含多个 package 时，使用工作空间统一管理，所有 package 共享同一个 `Cargo.lock` 和 `target/` 输出目录。

**示例：`main` package 使用 `add` package 的功能**

**项目结构：**

```bash
my-project/
├── Cargo.toml       # workspace 根配置
├── add/             # library crate，也是一个package，提供 add 功能
│   ├── Cargo.toml
│   └── src/lib.rs
└── main/            # binary crate，也是一个package，依赖 add package
    ├── Cargo.toml
    └── src/main.rs
```

**第一步：创建 workspace 根配置 `my-project/Cargo.toml`：**

::: code-group

```toml [my-project/Cargo.toml]
[workspace]
members = [
    "./main", # 主程序包
    "./add",  # 功能库包
]
```

:::

**第二步：编写 library crate `add/src/lib.rs`：**

::: code-group

```rust [my-project/add/src/lib.rs]
pub fn add(left: u32, right: u32) -> u32 {
    left + right
}
```

:::

**第三步：在 `main/Cargo.toml` 中声明对 `add` 的依赖：**

::: code-group

```toml [my-project/main/Cargo.toml]
[dependencies]
add = { path = "../add" }  # 使用本地路径引用同 workspace 内的 crate
```

:::

**第四步：在 `main/src/main.rs` 中使用：**

::: code-group

```rust [my-project/main/src/main.rs]
use add::*;

fn main() {
    let ret = add(10, 21);
    println!("结果：{}", ret);
}
```

:::
在 `my-project/` 目录下运行 `cargo run` 即可编译执行整个项目。

> Workspace 是项目级概念，适合大型项目的单体仓库（monorepo）管理。详细创建流程见 [Cargo 和 Crates.io](./Cargo和Crates.io.md#cargo-工作空间)。

## 模块（Module）

模块是 crate 内部的代码组织单位，通过 `mod` 关键字声明，用于**分组相关代码**和**控制可见性**。

### mod 声明模块

```rust
mod factory {
    // 模块内的函数默认私有
    fn private_fn() {
        println!("私有函数，外部无法调用");
    }

    // 加 pub 才能外部访问
    pub fn produce() {
        println!("Produce something!");
    }
}

fn main() {
    factory::produce();     // ✅ pub 函数可以访问
    // factory::private_fn(); // ❌ 私有函数，编译报错
}
```

`mod` 也相当于其他语言中的导入语句：声明一个模块会将其内容引入当前作用域，未声明的模块无法访问。

::: code-group

```rust [src/factory.rs]
// 文件名已经是模块名了，不需要再写 mod factory
// 模块内的函数默认私有
fn private_fn() {
    println!("私有函数，外部无法调用");
}

// 加 pub 才能外部访问
pub fn produce() {
    println!("Produce something!");
}
```

```rust [src/main.rs]
mod factory; // 引入文件模块

fn main() {
    factory::produce();
}
```

:::

### 可见性规则

**模块中的项默认私有**，必须加 `pub` 才能被外部访问：

```rust
mod factory {
    pub struct PubStruct {
        pub i: u32,    // 字段也需要 pub 才能外部访问
    }

    struct PrivateStruct {  // 私有结构体
        i: u32,
    }

    pub fn public_fn() {
        // 模块内部可以访问私有项
        let p = PrivateStruct { i: 3 };
        println!("{}", p.i);
    }

    fn private_fn() { }
}

fn main() {
    let p = factory::PubStruct { i: 3 };   // ✅
    // let p = factory::PrivateStruct { i: 3 }; // ❌ 私有类型
    factory::public_fn();                  // ✅
    // factory::private_fn();              // ❌ 私有函数
}
```

**关键规则：**

- **子模块**可以访问父模块的所有项（包括私有项），但父模块不能访问子模块的私有项
- `struct` 的字段和方法各自独立控制可见性，需要单独加 `pub`
- `enum` 的变体无需 `pub`——枚举变体对外部一视同仁，声明为 `pub enum` 后所有变体自动公开

### 嵌套模块

```rust
mod parent {
    pub struct A(pub u32);

    pub mod factory {
        pub fn produce() {
            println!("Produce something!");
        }
    }
}

fn main() {
    parent::factory::produce();
}
```

## 路径

引用模块中的项需要通过路径。路径有两种形式：

| 路径类型     | 起点                                                           | 示例                                |
| ------------ | -------------------------------------------------------------- | ----------------------------------- |
| **绝对路径** | 以 `crate` 开头（当前 crate），或以 crate 名开头（外部 crate） | `crate::parent::factory::produce()` |
| **相对路径** | 以 `self`、`super` 或当前模块标识符开头                        | `super::A(1)`                       |

```rust
mod parent {
    pub struct A(pub u32);

    pub mod factory {
        pub fn produce() {
            let _a1 = super::A(1u32);               // 相对路径：父模块的 A
            let _a2 = crate::parent::A(2u32);       // 绝对路径：从 crate 根出发
            println!("Produce something!");
        }
    }
}

fn main() {
    crate::parent::factory::produce();  // 绝对路径
    self::parent::factory::produce();   // 相对路径（self 表示当前模块）
    parent::factory::produce();         // 相对路径（省略 self）
}
```

**路径前缀对照：**

| 前缀      | 含义                | 类比           |
| --------- | ------------------- | -------------- |
| `crate::` | 从当前 crate 根出发 | 项目根目录 `/` |
| `self::`  | 当前模块            | `./`           |
| `super::` | 父模块              | `../`          |

## use 关键字

每次都写完整路径很繁琐，`use` 将路径引入当前作用域，简化调用：

```rust
mod parent {
    pub mod factory {
        pub fn produce() {
            println!("Produce something!");
        }
    }
}

fn main() {
    // 不使用 use，需要写完整路径
    // parent::factory::produce();

    // 使用 use 引入路径，简化调用
    use parent::factory::produce;
    produce();  // 直接调用，不需要写完整路径

    use parent::factory::*;  // 引入模块内所有公有项
}
```

使用 `as` 为引入的项取别名，避免命名冲突：

```rust
use factory::produce as make;  // 重命名

make();  // 等价于 factory::produce()
```

### use 最佳实践

| 导入类型          | 惯例             | 示例                                                |
| ----------------- | ---------------- | --------------------------------------------------- |
| `struct` / `enum` | 直接导入类型名   | `use std::collections::HashMap;` → `HashMap::new()` |
| 函数              | 保留一层父模块名 | `use std::fs;` → `fs::read(...)`                    |
| Trait             | 直接导入 Trait   | `use std::io::Read;` → `file.read_to_string(...)`   |

> **函数保留父模块名**是为了在调用处一眼区分"这是外部库函数"还是"本地定义的函数"，提高可读性。

### pub use 重导出

`pub use` 将某个路径重导出为当前模块的公有 API，常用于隐藏内部实现细节：

::: code-group

```rust [src/network.rs]
pub mod client;
pub mod server;

// 重导出：调用者只需 use crate::network::Client，无需知道内部路径
pub use self::client::Client;
// 重导出：调用者只需 use crate::network::Server，无需知道内部路径
pub use self::server::Server;

// 合并导出：一次性把 Client 和 Server 暴露出去
pub use self::{client::Client, server::Server};
```

```rust [src/main.rs]
mod network;                    // 引入 network 模块
use network::{Client, Server};  // 直接使用重导出的 Client 和 Server

fn main() {
    let client = Client::new();
    let server = Server::new();
}
```

:::

## 将模块拆分为多个文件

当模块代码量增大后，可以将 `mod` 内的内容拆分到独立文件。在文件头写 `mod a;` 时，编译器会自动查找 `a` 的内容：

1. 先查找同级的 `a.rs`
2. 若没有，查找同级目录 `a/mod.rs`（旧版风格，不推荐）

**现代文件结构（推荐）：**

```bash
src/
├── main.rs      # 声明 mod factory;
└── factory.rs   # factory 模块的具体内容
```

::: code-group

```rust [src/factory.rs]
pub fn produce() {
    println!("Produce something!");
}
```

```rust [src/main.rs]
mod factory;  // 编译器自动加载 src/factory.rs 的内容

fn main() {
    use factory::produce as make;
    make();
}
```

:::

**多层级模块的文件结构：**

```bash
src/
├── main.rs        # mod network; mod storage;
├── network.rs     # pub mod client; pub mod server;
├── network/
│   ├── client.rs
│   └── server.rs
├── storage.rs     # pub mod mysql; pub mod redis;
└── storage/
    ├── mysql.rs
    └── redis.rs
```

- `network.rs` 负责声明子模块 `client` 和 `server`，充当**模块的 API 网关**
- `network/` 目录存放具体实现
- 所有细节必须通过 `network.rs` 的 `pub mod` 才能对外可见

## 使用第三方 Crate

**第一步：在 `Cargo.toml` 中添加依赖：**

::: code-group

```toml [Cargo.toml]
[dependencies]
rand = "0.8.5"
```

:::

> 也可以使用 `cargo add rand` 命令自动添加依赖并更新 `Cargo.toml`，无需手动编辑文件。

保存后，下次编译时 Cargo 会自动下载并编译依赖。

**第二步：在代码中引入并使用：**

::: code-group

```rust [src/main.rs]
use rand::prelude::*; // 引入 rand 的预导出模块，包含常用功能

fn main() {
    let mut rng = rand::thread_rng();
    let y: f64 = rng.gen();
    println!("y = {}", y);
}
```

:::
