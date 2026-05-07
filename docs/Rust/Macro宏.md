---
description: 介绍 Rust 宏（Macro）的基本概念、类型、用途及与函数的区别，帮助理解和编写宏。
---

# Macro 宏

我们已经在本教程中使用过像 `println!` 这样的宏了,不过尚未深入探讨什么是宏以及它是如何工作的.这一章将介绍 Rust 中的宏,展示它们的强大功能,并教你如何编写自己的宏来生成代码.

## 基本概念

在 Rust 中,**宏（Macro）** 是一种元编程工具,用来生成代码.宏主要分为 **声明宏** 和 **过程宏** 两大类.

- **声明宏（Declarative Macro）**:使用 `macro_rules!` 定义,通过模式匹配来生成代码,适用于通用的代码生成需求.
- **过程宏（Procedural Macro）**:更像函数,接收 Rust 代码作为输入,进行操作后输出生成的代码.过程宏又分为三种类型:

| 宏类型   | 语法特征             | 常见用途                                             |
| -------- | -------------------- | ---------------------------------------------------- |
| 派生宏   | `#[derive(MyMacro)]` | 自动为结构体或枚举实现特定的 Trait（如 `Serialize`） |
| 类属性宏 | `#[my_attribute]`    | 创建自定义属性,可挂载在任何项上（如函数、结构体）    |
| 类函数宏 | `my_macro!(...)`     | 看起来像函数调用,但操作的是输入代码的 Token 流       |

## 宏和函数的区别

**1. 本质区别:元编程 vs 逻辑执行**

- **宏**:是"编写代码的代码"（元编程）.它们在编译期展开,生成比手写更多的源代码.
- **函数**:是程序运行时的逻辑单元,在运行期被调用.

**2. 参数灵活性**

- **宏**:支持可变数量的参数.例如 `println!` 可以接收一个或多个参数.
- **函数**:必须声明固定数量和类型的参数.

**3. 编译时能力**

- **宏**:可以在编译器解析代码前展开,因此能为给定类型实现 Trait.
- **函数**:无法在编译时实现 Trait,因为函数逻辑发生在运行时.

**4. 复杂度与维护性**

- **宏**:定义更复杂.因为涉及间接的代码生成,宏通常比函数更难阅读、理解和维护.
- **函数**:定义直观,易于理解.

**5. 定义与调用顺序**

- **宏**:必须在调用之前定义或引入作用域（有先后顺序要求）.
- **函数**:可以在代码的任何地方定义和调用,无需担心先后顺序.

**对比总结表**

| 特性       | 宏 (Macro)               | 函数 (Function)    |
| ---------- | ------------------------ | ------------------ |
| 核心本质   | 编译期代码展开（元编程） | 运行期逻辑调用     |
| 参数数量   | 可变参数（Variadic）     | 固定参数           |
| Trait 实现 | 可以实现 Trait           | 不可以             |
| 编写难度   | 较高（生成代码的代码）   | 较低（直接逻辑）   |
| 调用约束   | 必须先定义/引入再调用    | 可以在任何位置定义 |

## 声明宏

声明宏（Declarative Macro）使用 `macro_rules!` 来定义,是类似 `match` 的模式匹配系统,可以想象成一种"**高级查找与替换**".它们通过模式匹配来生成代码,适用于通用的代码生成需求.

- 定义语法: `macro_rules! my_macro { ... }`
- 使用语法: `my_macro!(...)`

### 定义声明宏

以 `vec!` 宏为例,其简化定义如下:

```rust
#[macro_export]
macro_rules! vec {
  ( $( $x:expr ),* ) => {
    {
      let mut temp_vec = Vec::new();
      $(
        temp_vec.push($x);
      )*
      temp_vec
    }
  };
}
```

> **注意**:标准库中实际定义的 `vec!` 包含预分配正确数量内存的优化代码,此处示例已简化.

- `#[macro_export]`:使宏在当前 crate 之外也可用.
- `macro_rules! vec`:定义一个名为 `vec` 的宏（定义时不需要 `!`）.

### 解析声明宏

**1. 基础构成:元变量与指示符**

每个被匹配的片段都由 `$` 开头,格式为 `$名字:指示符`.

以 `$x:expr` 为例:

- `$`:告诉编译器,这是宏的变量占位符,而非普通 Rust 代码.
- `$x`:给这个匹配项起的变量名.
- `:expr`:**指示符（Designator）**,告诉宏应该捕获什么类型的代码片段.

常用指示符如下:

| 指示符    | 匹配内容                                 |
| --------- | ---------------------------------------- |
| `expr`    | 表达式（如 `1 + 1`、`f()`）              |
| `ident`   | 标识符（如变量名 `my_var`、函数名）      |
| `ty`      | 类型（如 `i32`、`Vec<String>`）          |
| `stmt`    | 一条语句                                 |
| `pat`     | 模式（如 `Some(x)`、`1..=5`）            |
| `literal` | 字面量（如 `42`、`"hello"`）             |
| `tt`      | 单个 Token 树（最通用,匹配任意代码片段） |

**2. 重复模式:核心部分**

重复模式的公式可以总结为:`$( 匹配内容 ) 分隔符 重复次数`.

以 `$( $x:expr ),*` 为例:

- `$( ... )`:包裹需要重复的内容.
- `,`:**分隔符**,表示匹配或展开时每项之间用逗号隔开,这样 `vec![1, 2, 3]` 就能正确解析.
- `*`:**重复次数修饰符**.

| 修饰符 | 含义        |
| ------ | ----------- |
| `*`    | 0 次或多次  |
| `+`    | 1 次或多次  |
| `?`    | 0 次或 1 次 |

**3. 匹配 vs 展开**

宏分为"左侧模式"和"右侧代码",符号是对称使用的:

| 阶段         | 语法                       | 含义                                                              |
| ------------ | -------------------------- | ----------------------------------------------------------------- |
| 匹配（左侧） | `$( $x:expr ),*`           | "给我一堆用逗号隔开的表达式,我把它们存进 `$x` 序列里."            |
| 展开（右侧） | `$( temp_vec.push($x); )*` | "把 `$x` 里的元素逐个取出,每项都套上 `temp_vec.push(...);` 模板." |

**符号速查表**

| 符号             | 名称   | 作用                             |
| ---------------- | ------ | -------------------------------- |
| `$`              | 宏前缀 | 区分宏变量和普通 Rust 语法       |
| `expr` / `ident` | 指示符 | 规定捕获的代码片段是什么类型     |
| `$( )`           | 重复组 | 标记哪一部分代码需要循环处理     |
| `,` / `;`        | 分隔符 | 规定循环项之间用什么符号分隔     |
| `*` / `+` / `?`  | 修饰符 | 规定循环的次数（类似正则表达式） |

> 有关完整的宏模式语法,请查阅 [Rust 参考手册](https://doc.rust-lang.org/reference/macros-by-example.html).

**展开示例**

当你调用 `vec![1, 2, 3]` 时,编译器会将其展开为:

```rust
{
  let mut temp_vec = Vec::new();
  temp_vec.push(1);
  temp_vec.push(2);
  temp_vec.push(3);
  temp_vec
}
```

## 过程宏

### 基础概念

过程宏（Procedural Macro）更像函数:接收 Rust 代码的 `TokenStream` 作为输入,进行操作后输出新的 `TokenStream`,而非像声明宏那样进行模式匹配与替换.

#### 创建过程宏 Crate

目前定义过程宏需要放在一个**独立的 crate** 中,且该 crate 的类型必须设置为 `proc-macro`.这是因为过程宏需要特殊的编译环境,必须与普通 Rust 代码分开编译.

在 `Cargo.toml` 中添加以下内容:

```toml
[lib]
proc-macro = true        # 声明这是一个过程宏库

[dependencies]
syn   = "2.0"            # 用于将 TokenStream 解析为语法树（AST）
quote = "1.0"            # 用于将语法树转换回 Rust 代码（TokenStream）
```

#### 过程宏的基本结构

```rust
use proc_macro::TokenStream; // 引入 TokenStream 类型

// 标注宏类型（如 #[proc_macro_derive]、#[proc_macro_attribute]、#[proc_macro]）
#[some_attribute]
pub fn some_name(input: TokenStream) -> TokenStream {
  // 处理输入,返回生成的代码
}
```

> - `some_attribute`:标注该函数是哪种类型的过程宏（如 `#[proc_macro_derive]`）.
> - `input`:编译器传入的原始代码,类型为 `TokenStream`.
> - 返回值:生成的新代码,同样是 `TokenStream`,将被编译器插入到宏调用处.
> - `TokenStream` 代表 Rust 代码的 Token 序列,比普通字符串具有更丰富的结构,可用于分析和操作代码.可以把它理解为一段 "还没有被编译器完全理解,但已经被切分好的代码块".

#### 过程宏的三大类型

| 类型名称                  | 定义语法                  | 用法示例                | 作用描述                                                                             |
| ------------------------- | ------------------------- | ----------------------- | ------------------------------------------------------------------------------------ |
| 派生宏（Derive）          | `#[proc_macro_derive]`    | `#[derive(HelloMacro)]` | 最常用的过程宏.为结构体或枚举自动实现 Trait.**只会追加代码,不修改原定义.**           |
| 属性宏（Attribute-like）  | `#[proc_macro_attribute]` | `#[my_attribute]`       | 类似"装饰器".可附着在任何项上（函数、结构体等）,**可修改或替换原代码**,并可接收参数. |
| 类函数宏（Function-like） | `#[proc_macro]`           | `my_macro!(...)`        | 使用方式类似函数调用（带 `!`）.接收一段代码并返回生成的代码,语法灵活可自定义.        |

### 派生宏

派生宏（Derive Macro）是最常见的过程宏类型,允许你为结构体或枚举**自动生成 Trait 的实现**.通过 `#[derive(MyMacro)]` 语法,编译器会在编译时为你的类型生成对应代码,可大量减少样板代码.

例如,`#[derive(Debug)]` 会自动为类型生成 `Debug` trait 的实现,使你可以用 `{:?}` 打印该类型的实例.

- **定义语法:** `#[proc_macro_derive(MyMacro)]`
- **使用语法:** `#[derive(MyMacro)]`

**示例:定义一个 `HelloMacro` derive 宏**

**`src/lib.rs`**

```rust
use proc_macro::TokenStream;
use quote::quote;
use syn;

/// 定义一个 Trait,供宏生成代码时实现
pub trait HelloMacro {
  fn hello_macro();
}

/// 定义 derive 宏,名称为 HelloMacro
#[proc_macro_derive(HelloMacro)]
pub fn hello_macro_derive(input: TokenStream) -> TokenStream {
  // 将输入的 TokenStream 解析为语法树（AST）
  let ast: syn::DeriveInput = syn::parse(input).unwrap();

  // 根据语法树生成 Trait 实现代码
  impl_hello_macro(&ast)
}

fn impl_hello_macro(ast: &syn::DeriveInput) -> TokenStream {
  let name = &ast.ident; // 获取用户定义的类型名称

  // 使用 quote! 宏生成实现 HelloMacro trait 的代码
  let generated = quote! {
    impl HelloMacro for #name {
      fn hello_macro() {
        println!("Hello, Macro! My name is {}!", stringify!(#name));
      }
    }
  };

  generated.into() // 将生成的代码转换回 TokenStream
}
```

**代码流程说明:**

1. `syn::parse(input)` 将 `TokenStream` 解析为结构化的语法树 `DeriveInput`.
2. `ast.ident` 获取被标注类型的名称（如 `Pancakes`）.
3. `quote!` 宏用于生成 Rust 代码,`#name` 会被替换为实际的类型名.
4. `stringify!(#name)` 将类型名转换为字符串字面量,供打印使用.
5. `.into()` 将 `quote!` 生成的结果转换回 `TokenStream` 供编译器使用.

**使用示例:**

```rust
use hello_macro::HelloMacro;        // 引入 Trait 定义
use hello_macro_derive::HelloMacro; // 引入 derive 宏

#[derive(HelloMacro)]
struct Pancakes;

fn main() {
  Pancakes::hello_macro();
  // 输出: Hello, Macro! My name is Pancakes!
}
```

### 类属性宏

类属性宏（Attribute-like Macro）与派生宏相似,但更为灵活:

- 派生宏**只能**用于结构体和枚举,且只追加代码.
- 属性宏可用于**任何项**（函数、结构体、模块等）,并且可以**修改或替换**原代码.
- **定义语法:** `#[proc_macro_attribute]`
- **使用语法:** `#[my_attribute]`

**示例:定义一个 `my_route` 属性宏**

**`src/lib.rs`**

```rust
use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, AttributeArgs, ItemFn, Lit, NestedMeta};

#[proc_macro_attribute] // 标注这是一个属性宏
pub fn my_route(attr: TokenStream, item: TokenStream) -> TokenStream {
  // 解析属性参数（如 GET, "/"）
  let args = parse_macro_input!(attr as AttributeArgs);
  let mut method = String::new();
  let mut path = String::new();

  if args.len() == 2 {
    // 第一个参数:HTTP 方法（GET/POST 等）
    if let NestedMeta::Meta(syn::Meta::Path(ref p)) = args[0] {
      method = quote!(#p).to_string();
    }
    // 第二个参数:路径字符串
    if let NestedMeta::Lit(Lit::Str(ref s)) = args[1] {
      path = s.value();
    }
  }

  // 解析被标注的函数
  let input_fn = parse_macro_input!(item as ItemFn);
  let fn_name  = &input_fn.sig.ident;
  let fn_block = &input_fn.block;
  let fn_attrs = &input_fn.attrs;
  let fn_vis   = &input_fn.vis;
  let fn_sig   = &input_fn.sig;

  // 生成新函数:在原函数体前插入路由信息打印
  let expanded = quote! {
    #(#fn_attrs)*
    #fn_vis #fn_sig {
      println!("Route registered: method = {}, path = {}", #method, #path);
      #fn_block
    }
  };

  expanded.into()
}
```

> **注意**:`attr` 接收属性括号内的参数（如 `GET, "/"`）,`item` 接收被标注的完整项（如函数定义）.

**使用示例:**

```rust
use my_macro::my_route;

#[my_route(GET, "/")]
fn index() {
  println!("This is the index handler.");
}

fn main() {
  index();
  // 输出:
  // Route registered: method = GET, path = /
  // This is the index handler.
}
```

### 类函数宏

类函数宏（Function-like Macro）的调用语法与声明宏相同（使用 `!`）,但其底层实现是过程宏,因此比 `macro_rules!` 更灵活,可以执行任意复杂的代码分析与生成.

- **定义语法:** `#[proc_macro]`
- **使用语法:** `my_macro!(...)`

**示例:定义一个 `my_macro` 类函数宏**

**`src/lib.rs`**

```rust
use proc_macro::TokenStream;
use quote::quote;

#[proc_macro]
pub fn my_macro(input: TokenStream) -> TokenStream {
  // 将输入的 TokenStream 转换为字符串
  let input_str = input.to_string();

  let generated = quote! {
    println!("You called my_macro with: {}", #input_str);
  };

  generated.into()
}
```

**使用示例:**

```rust
use my_macro::my_macro;

fn main() {
  my_macro!(Hello, world!);
  // 输出: You called my_macro with: Hello , world !
}
```

> **提示**:`TokenStream` 在转换为字符串时,Token 之间会自动加入空格,因此输出可能与原始输入略有差异（如 `Hello , world !`）.如需精确控制,应使用 `syn` 对输入进行结构化解析.
