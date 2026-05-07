---
description: 本文介绍 Rust 语言中的 struct 结构体，包括其定义方式、三种结构体类型（经典结构体、元组结构体、类单元结构体），以及相关用法和注意事项，帮助读者理解和掌握 Rust 中自定义数据类型的使用。
---

# Struct 结构体

`struct` 是 Rust 中最重要的自定义数据类型，用于将相关联的数据组织在一起。它类似于面向对象语言中的"类"，`struct` 的实例类似于"对象"——都以键值对的方式存储数据，并可以附加方法。

Rust 中有三种结构体：**经典结构体**、**元组结构体**、**类单元结构体**。

## 定义 struct

### 经典结构体（Named Struct）

字段有名称的结构体，最常用的形式。

```rust
struct User {
    name: String,
    age: u32,
    email: String,
}
```

- 结构体名使用**帕斯卡命名法**（`PascalCase`）
- 字段名使用**蛇形命名法**（`snake_case`）
- 每个字段必须显式指定类型
- 结构体定义本身不占用内存，只有实例化后才占用

### 元组结构体（Tuple Struct）

字段没有名称、只有类型的结构体，通过索引访问字段。

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

let black = Color(0, 0, 0);
let origin = Point(0, 0, 0);
```

> `black` 和 `origin` 是**不同的类型**，尽管内部字段完全相同。元组结构体为相同结构赋予了不同的语义，适合表达"颜色"和"坐标"这类有明确含义但结构相同的数据。

### 类单元结构体（Unit-like Struct）

没有任何字段的空结构体，通常用于为某个类型实现 Trait 而不需要存储数据的场景。

```rust
struct AlwaysEqual;

let subject = AlwaysEqual;
```

## 实例化 struct

实例化时**所有字段都必须赋值**，字段顺序可与定义不同：

```rust
let san = User {
    name: String::from("zhangsan"),
    age: 18,
    email: String::from("123@gmail.com"),
};

let black = Color(0, 0, 0);
let origin = Point(0, 0, 0);
let subject = AlwaysEqual;
```

### 字段初始化简写

当变量名与字段名**相同**时，可以省略字段名：

```rust
let name = String::from("zhangsan");
let email = String::from("123@gmail.com");

let san = User {
    name,    // 等价于 name: name
    email,   // 等价于 email: email
    age: 18,
};
```

## 访问与修改

使用点语法访问字段，修改字段需要整个实例声明为 `mut`：

```rust
// 访问经典结构体字段
println!("{}", san.name);

// 访问元组结构体字段（索引）
println!("{}", black.0);

// 修改字段（实例必须是 mut）
let mut san = User {
    name: String::from("zhangsan"),
    age: 18,
    email: String::from("123@gmail.com"),
};
san.name = "lisi".to_string();
san.age = 20;
```

> Rust 不支持只将某个字段标记为可变，**整个实例必须声明为 `mut`** 才能修改任何字段。

## 更新语法

基于现有实例创建新实例时，可以用 `..` 语法复用未手动指定的字段，`..base` 必须放在末尾：

```rust
let new_san = User {
    email: String::from("new@gmail.com"),
    ..san  // 从 san 复用 name 和 age
};
```

**所有权注意事项**：`..` 语法本质上是字段级别的赋值，遵循所有权规则：

- 实现了 `Copy` 的字段（如 `u32`）会自动复制，原实例中的该字段仍然有效
- 未实现 `Copy` 的字段（如 `String`）会发生 Move，原实例中的该字段将失效

```rust
let user2 = User {
    name: String::from("lisi"),
    ..user1  // user1.age (u32, Copy) 仍可用，user1.email (String) 已被 Move
};

println!("{}", user1.age);      // ✅ age 是 Copy 类型，仍然有效
// println!("{}", user1.email); // ❌ email 已被 Move
// println!("{:?}", user1);     // ❌ user1 处于"不完整"状态，不能整体使用
```

若希望保留原实例完整可用，可以先 `clone()`：

```rust
let user2 = User {
    name: String::from("lisi"),
    ..user1.clone()  // 深拷贝 user1，user1 的所有权完全不受影响
};
```

> **部分移动（Partial Move）**：结构体中的非 `Copy` 字段被 Move 后，整个实例进入"不完整"状态。此时无法整体使用该实例（整体赋值、整体传参等），但仍然可以单独访问**未被移走的字段**。若后续对已移走的字段重新赋值，该字段重新归该实例所有，实例恢复完整状态。

## 调试输出

直接用 `{}` 格式化输出结构体会编译报错。需要在结构体定义前加上 `#[derive(Debug)]` 派生宏，然后使用 `{:?}`（单行）或 `{:#?}`（多行缩进）格式：

```rust
#[derive(Debug)]
struct User {
    name: String,
    age: u32,
}

let san = User { name: String::from("zhangsan"), age: 18 };

println!("{:?}", san);   // User { name: "zhangsan", age: 18 }
println!("{:#?}", san);  // 多行格式化输出
```

多行输出结果：

```
User {
    name: "zhangsan",
    age: 18,
}
```

也可以使用 `dbg!` 宏，它会额外输出**文件名和行号**，并返回值本身，适合调试中间值：

```rust
dbg!(&san);              // 打印引用，san 所有权不变
let age = dbg!(san.age); // 打印 san.age 并将值绑定给 age
```

## impl Struct

使用 `impl` 关键字为结构体定义**方法**和**关联函数**，一个结构体可以拥有**多个** `impl` 块：

```rust
impl Struct {
    fn xxx(&self)  →  方法（method）
    fn xxx()       →  关联函数（associated function）
}
```

### 方法

方法的第一个参数是 `self` 的某种形式，代表调用该方法的实例：

| 形式        | 含义                                       |
| ----------- | ------------------------------------------ |
| `self`      | 获取实例**所有权**，调用后实例失效         |
| `&self`     | **不可变借用**，只读，调用后实例仍可用     |
| `&mut self` | **可变借用**，可修改字段，调用后实例仍可用 |

> `&self` 是 `self: &Self` 的语法糖。`Self`（大写）表示当前结构体类型本身，`self`（小写）表示调用方法的具体实例。

```rust
impl User {
    // &self：不可变借用，只读
    fn say(&self) {
        println!("我叫 {}，今年 {} 岁", self.name, self.age);
    }

    // &mut self：可变借用，可修改字段
    fn update_name(&mut self, new_name: String) {
        self.name = new_name;
    }

    // self：获取所有权，调用后实例失效
    fn consume(self) {
        println!("{} 已注销", self.name);
    }
}

let mut san = User {
    name: "zhangsan".to_string(),
    age: 18,
    email: "123@gmail.com".to_string(),
};
san.say();
san.update_name("lisi".to_string());
san.consume(); // 调用后 san 不能再使用
```

方法本质上也是关联函数，可以用 `Type::method(&instance)` 的形式显式调用，效果完全等价：

```rust
san.say();           // 常用写法
User::say(&san);     // 等价写法，手动传递 &self 参数
```

### 关联函数

没有 `self` 参数的函数称为**关联函数**，属于类型本身而非某个实例，类似于面向对象中的静态方法，通过 `::` 调用：

```rust
impl User {
    fn new(name: String, age: u32, email: String) -> Self {
        Self { name, age, email }
    }
}

let san = User::new("zhangsan".to_string(), 18, "123@gmail.com".to_string());
```

> `String::from()` 就是 `String` 类型的一个关联函数。关联函数常用于定义构造函数，约定俗成命名为 `new`。

### 自动引用与解引用

Rust 中调用方法时（`.` 运算符），编译器会**自动**添加 `&`、`&mut` 或 `*` 来匹配方法签名，无需手动处理：

```rust
p.distance(&q);        // Rust 自动转换为 (&p).distance(&q)
box_val.method();      // 自动解引用 Box<T>，等价于 (*box_val).method()
```

这是 Rust 与 C/C++ 的重要区别：C++ 需要区分 `.`（对象调用）和 `->`（指针调用），而 Rust 统一用 `.`，编译器自动完成引用与解引用的推导。

除方法调用外，以下场景也会触发自动解引用：

- **字段访问**：`ref_val.name` 自动解引用到目标类型
- **比较操作符**：`a > b` 若两侧都是引用，自动解引用后再比较

## 综合例子

```rust
#[derive(Debug)]
struct User {
    name: String,
    age: u8,
    email: String,
}

impl User {
    // 关联函数：构造器
    fn new(name: String, age: u8, email: String) -> Self {
        Self { name, age, email }
    }

    // 方法：不可变借用
    fn say(&self) {
        println!("我叫 {}，今年 {} 岁", self.name, self.age);
    }

    // 方法：可变借用
    fn update_email(&mut self, new_email: String) {
        self.email = new_email;
    }
}

fn main() {
    let mut san = User {
        name: String::from("zhangsan"),
        age: 18,
        email: "old@gmail.com".to_string(),
    };

    // 更新语法：san.name (String) 被 Move 到 si，san.age (u8/Copy) 仍可访问
    let mut si = User {
        email: "si@gmail.com".to_string(),
        ..san
    };

    println!("{}", san.age);  // ✅ age 是 Copy 类型，san 的该字段仍然有效

    // 重新赋值 san.name，补全不完整状态
    san.name = "zhangsan_new".to_string();
    san.update_email("new@gmail.com".to_string());
    san.say();

    si.say();

    // 使用关联函数构造新实例
    let wu = User::new("wu".to_string(), 25, "wu@gmail.com".to_string());
    println!("{:#?}", wu);
}
```
