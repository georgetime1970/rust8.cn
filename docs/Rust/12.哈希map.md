# 哈希 map

`HashMap<K, V>` 是 Rust 标准库提供的一种哈希表(Hash Table)数据结构,用于存储具有映射关系的键值对(Key-Value pairs).

- 本质就是一个键值对,键是唯一的
- 类似于 `vector`,哈希 `map` 是同质的: 所有的键必须是相同类型,值也必须都是相同类型
- 是整体所有权

**1. 基本特性**

- 非索引访问: 与通过整数索引访问的 `Vec` 不同,`HashMap` 允许使用任何实现了 `Eq` 和 `Hash` trait 的类型作为键(如 `String`、`i32` 等)来检索数据.
- 键的唯一性: 每个键在 `map` 中只能存在一个.如果插入已有的键,旧值会被新值覆盖.
- 堆内存分配: 与 `Vec` 类似,`HashMap` 的数据存储在堆(Heap)上,且它是动态增长的.
- 无序性: 遍历 `HashMap` 时,元素的顺序是随机且不可预测的.
- 所有权移动: `insert()` 方法会转移键和值的所有权到 `HashMap` 中.

**2. 内部实现原理**

- 哈希函数: 它使用哈希函数将键转换成一个数字(哈希值),以此决定数据在内存中的存储位置.
- `Swiss Table` 算法: Rust 的 `HashMap` 默认采用了基于 `Google Swiss Table` 的高性能实现(通过 `hashbrown` crate 引入),这种算法在内存布局和缓存效率上表现卓越.
- 安全性设计: 默认使用 `SipHash 1-3` 算法.虽然它比某些哈希算法稍慢,但能有效抵抗 `HashDoS` 攻击(一种通过精心构造冲突来使哈希表性能降级的拒绝服务攻击).

## 新建一个哈希 map

- 需要引入`std::collections::HashMap`
- 所有的键必须是相同类型,值也必须都是相同类型

```rust
use std::collections::HashMap;
let mut scores = HashMap::new();
```

## 插入值到哈希 map

- 使用 `insert(k, v)` 方法插入键值对
- 如果键已存在,新值会覆盖旧值
- `insert()` 方法会转移键和值的所有权到 `HashMap` 中

```rust
use std::collections::HashMap;
let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);
println!("{scores:?}");
```

## 访问哈希 map 中的值

- 使用`get(&Q)`方法访问数据
- `get` 方法返回 `Option<&V>`

```rust
use std::collections::HashMap;
let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

let team_name = String::from("Blue");
let score = scores.get(&team_name).copied().unwrap_or(0);
// copied() 的作用是将 Option<&i32> 转换成 Option<i32>
// copied(): 仅限实现了 Copy 的类型(如 i32, bool, f64),极其高效(位拷贝)
// cloned(): 适用于实现了 Clone 的类型(如 String, Vec),涉及 clone() 函数调用,可能较慢
```

## 遍历 HashMap

- 使用 `for` 语句遍历,获得引用不会转移所有权

```rust
use std::collections::HashMap;
let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

for (key, value) in &scores {
    println!("{key}: {value}");
}
```

## 更新哈希 map

### 覆盖旧值

- `HashMap` 的键是唯一的,重复插入相同键会覆盖原值

```rust
use std::collections::HashMap;
let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Blue"), 25);
println!("{scores:?}"); // {"Blue": 25}
```

### 只在键不存在时插入

- 使用 `entry(k).or_insert(v)` 方法
- `entry(k)` 返回 `Entry` 枚举,表示键是否存在

```rust
use std::collections::HashMap;
let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
scores.entry(String::from("Yellow")).or_insert(50); // Yellow 不存在,插入 50
scores.entry(String::from("Blue")).or_insert(50); // Blue 存在,不插入
println!("{scores:?}");
```

### 根据旧值更新

- `entry().or_insert()` 返回值的可变引用,可直接修改

```rust
// 统计文本中每个单词出现的次数
use std::collections::HashMap;
let text = "hello world wonderful world";
let mut hash_map = HashMap::new();
for word in text.split_whitespace() {
    let count = hash_map.entry(word).or_insert(0); // 如果 word 不存在,插入 0 并返回可变引用;如果存在,直接返回可变引用
    *count += 1;
}
println!("{hash_map:?}"); // {"hello": 1, "world": 2, "wonderful": 1}
```

## 综合例子

```rust
use std::collections::{HashMap, btree_map::Keys};

fn main() {
    // 新建一个hashmap
    let mut x: HashMap<i32, i32> = HashMap::new();

    x.insert(0, 0); // 插入数据
    x.insert(0, 1); // 覆盖相当于重新赋值
    x.entry(1).or_insert(2); // 不存在 1键就插入2值
    dbg!(&x);

    // let y = x.get(&3); // 使用get安全取值,是一个Option
    let y = x.get(&3).unwrap_or(&3); // 使用get安全取值
    dbg!(&y);

    // 遍历 map
    for (k, v) in &x {
        dbg!(k, v);
    }

    for map in x {
        // dbg!(&map);
        println!("{map:?}")
    }
}
```
