# struct 结构体

**自定义数据类型,一种数据的组织方式**

- `struct` 实例化必须每个字段都赋值
- 每个字段拥有独立的所有权
- 更新语法必须在新结构体的后面
- 更新语法会转移结构体字段的所有权
- 旧的结构体中的字段必须被新的结构体包含,不能有新结构体没有的字段
- 部分移动规则: 非 `Copy` 字段被移动后,整个结构体实例进入不完整状态,可以访问拥有所有权的字段,但是结构体示例本身不能再整体使用(如赋值给另一个变量,或者作为整体传递给函数等)
- 结构体分为三种: 经典结构体、元组结构体、类单元结构体
- 方法通过 `.` 调用,关联函数通过 `::` 调用

## 定义struct

- 结构体名称应使用帕斯卡命名法(PascalCase)
- 字段名称应使用蛇形命名法(snake_case)
- 字段类型必须明确指定
- 结构体定义本身不占用内存,只有实例化后才占用内存

### 经典结构体 classic structs

```rust
struct User {
    name: String,
    age: i32,
    email: String,
}
```

### 元组结构体 tuple structs

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);
```

> black 和 origin 是不同的类型,哪怕里面的类型都是一样的

### 类单元结构体 unit-like structs

没有任何字段的结构体

```rust
struct AlwaysEqual;
```

## 实例化struct

```rust
// 1. 实例化经典结构体
let san = User {
    name: String::from("zhangsan"),
    age: 13,
    email: String::from("123@gmail.com")
};

// 2. 实例化元组结构体
let black = Color(0, 0, 0);
let origin = Point(0, 0, 0);

// 3. 实例化类单元结构体
let subject = AlwaysEqual;

```

**实例化要点**

- 实例化时所有字段都必须被赋值
- 字段的赋值顺序可以与定义顺序不同
- 字段初始化简写: 当变量名与字段名相同时,可以省略字段名(如 `User { name, age, email }`)
- 结构体实例必须是可变的(加 `mut`)才能修改其字段
- 只有经典结构体支持字段级别的初始化

## 访问

使用点语法

```rust
// 1. 访问经典结构体字段
let san_name = san.name; // ✅ 获取字段值

// 2. 访问元组结构体字段
let black0 = black.0; // ✅ 通过索引访问

// 3. 类单元结构体没有字段,无法访问
```

**访问要点**

- 只有拥有所有权或获得借用的实例才能访问字段
- 访问不可变引用的字段不会转移所有权
- 访问 `Copy` 类型的字段会复制值,不影响原实例
- 访问 `String` 等非 `Copy` 类型会转移所有权(在更新语法中需注意)
- 私有字段无法从模块外访问(所有权和可见性是两个独立的概念)

## 修改

使用点语法直接修改字段值

```rust
// 1. 修改经典结构体字段
san.name = "lisi".to_string(); // ✅ 必须是 mut 实例才能修改

// 2. 修改元组结构体字段
black.0 = 255; // ✅ 必须是 mut 实例才能修改

// 3. 类单元结构体没有字段,无法修改
```

**修改要点**

- 实例必须声明为 `mut`(可变),才能修改其字段
- 修改时只需要 `mut` 权限,不需要所有权转移
- 修改 `String` 等非 `Copy` 类型字段不影响其他字段的访问
- 不能只修改结构体中的某个字段为可变,必须整个实例为可变
- 修改字段后原实例的所有权和状态保持不变

## 更新语法

修改使用同一个结构体模板的变量的其中某部分值

```rust
let new_san = User{
    email: String::from("123@gmail.com"),
    ..san
}
```

**更新语法要点**

- `san` 必须是已经通过 `User` 实例化的结构体
- 新的 `new_san` 变量复用 `san` 中除 `email` 外的其他字段值
- 更新语法会转移所有权,是字段级别的所有权转移
- 由于 `struct` 中的所有权是单独的,实现了 `Copy` 的字段在更新语法后依旧可以直接访问
- 只能在新结构体后面使用 `..` 语法(`..san` 不能在前面)
- 部分移动规则: 一旦非 `Copy` 字段被移动,原变量进入"不完整"状态,可以访问拥有所有权的字段,但是结构体示例本身不能再整体使用(如赋值给另一个变量,或者作为整体传递给函数等)

> **部分移动(Partial Move)**: 结构体中有非 `Copy` 字段(如 `String`)被移动走后,Rust 编译器认为原变量处于"不完整"状态,允许访问仍然拥有所有权的字段(如 `age`),但禁止对整个结构体实例进行任何操作(如赋值、传参等),以防止访问已被移动走的字段导致悬垂引用或数据不一致问题.

## impl Struct

- 使用 `impl` 关键字定义
- 一个结构体可以使用多个 `impl` 定义结构体方法和关联函数

```rust
impl Struct {
    ├── fn xxx(&self)      → 方法(method)
    ├── fn xxx()           → 关联函数(associated function)
    ├── const XXX          → 关联常量
    └── type XXX           → 关联类型
}
```

### 方法

- `impl Struct` 中,函数的第一个参数可以是 `self`、`&self`、`&mut self`,或者没有 `self` 参数(静态方法/关联函数)
- `&self` 是 `self: &Self` 的缩写
- `self`(小写): 指代具体的实例
- `Self`(大写): 指代这个类型本身

```rust
impl User {
    // 1. self 作为参数,获取实例的所有权
    fn play(self) {
        println!("{}正在玩", self.name);
    }

    // 2. &self 作为参数,获取实例的不可变借用
    fn say(&self) {
        println!("我的名字是{}", self.name);
    }

    // 3. &mut self 作为参数,获取实例的可变借用
    fn update_name(&mut self, new_name: String) {
        self.name = new_name;
    }
}

fn main() {
    let mut san = User {
        name: String::from("zhangSan"),
        age: 18,
        email: "123@gmail.com".to_string(),
    };

    san.say();                                      // ✅ 调用方法
    san.update_name("liSi".to_string());            // ✅ 调用方法修改名字
    san.play();                                     // ✅ 调用方法获取所有权,之后 san 不能再使用
}
```

### 关联函数

- `impl Struct` 中,没有 `self` 参数的函数叫做关联函数,通常用来定义构造函数
- 通过 `::` 调用,类似面向对象中的静态方法

```rust
impl User {
    fn new(name: String, age: u8, email: String) -> Self {
        Self { name, age, email }
    }
}

fn main() {
    // 使用 :: 调用关联函数
    let san = User::new("zhangSan".to_string(), 18, "123@gmail.com".to_string());
}
```

> **为什么叫"关联函数"？**
>
> 因为它不属于某个实例但属于这个类型,是关联在某个类型名下的函数.

## 综合例子

```rust
// 定义结构体
#[derive(Debug)] // 实现Debug trait,可以使用println!宏打印
struct User {
    name: String,
    age: u8,
    email: String,
}

// 定义结构体方法/关联函数
impl User {
    // 关联函数,类似构造函数/静态方法
    fn new(name: String, age: u8, email: String) -> Self {
        Self { name, age, email }
    }
    // 方法
    fn say(&self) {
        println!("我的名字是{}", self.name);
    }
}

fn main() {
    // 实例化结构体
    let mut san = User {
        name: String::from("zhangSan"),
        age: 18,
        email: "345@gmail.com".to_string(),
    };

    // 更新语法
    let mut si = User {
        email: "1223@gmail.com".to_string(),
        ..san // san.name 和 san.email(String类型)所有权转移给 si
    };

    dbg!(san.age);  // ✅ 可以访问,虽然部分移动,原变量 san 处于"不完整"状态,但 age 字段是 Copy 类型(拥有所有权),仍然可以访问
    dbg!(si.age);  // ✅ 可以访问,因为 si.age 是新结构体的字段,拥有所有权

    // 修改san
    san.name = "liSi".to_string(); // 重新赋值,拥有所有权
    dbg!(san.name); // 这里能单独访问san.name,是因为san.name的所有权已经被重新赋值了,并且san.name是一个独立的字段,不受部分移动规则的限制,变相导致 san这个结构体又变成了完整的状态,所以可以访问san.name了,如果重新赋值没有补齐 san 结构体的完整性,那san.name依旧无法访问

    // 使用say方法
    si.say();

    // 使用new函数,构造新的字段
    let wu = User::new("wu".to_string(), 25, "567@gmail.com".to_string());
    println!("{wu:#?}")
}
```
