# 哈希 map

`HashMap<K, V>` 是 Rust 标准库提供的键值对集合，通过哈希函数将键映射到存储位置，大多数操作具有 O(1) 的平均时间复杂度。与通过整数索引访问的 `Vec` 不同，`HashMap` 允许使用任何实现了 `Eq` 和 `Hash` trait 的类型作为键。

`HashMap` 是同质的：所有键必须是相同类型，所有值也必须是相同类型。数据存储在堆上，插入时会获取键和值的所有权。遍历时元素顺序是随机且不可预测的。

```rust
use std::collections::HashMap; // HashMap 不在 prelude 中，必须手动引入

let mut scores: HashMap<String, i32> = HashMap::new();
```

## 内部实现

Rust 的 `HashMap` 默认采用基于 **Google Swiss Table** 的高性能实现（通过 `hashbrown` crate 引入），在内存布局和缓存效率上表现卓越。默认哈希算法为 **SipHash 1-3**，它能有效抵抗 HashDoS 攻击（通过精心构造哈希冲突来降低哈希表性能的拒绝服务攻击），安全性高于速度。

## 插入键值对

使用 `insert(k, v)` 方法插入键值对。`insert()` 会获取键和值的所有权；如果键已存在，新值会覆盖旧值并返回 `Some(旧值)`，键不存在则返回 `None`：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
let old = scores.insert(String::from("Blue"), 25); // 覆盖旧值
println!("{old:?}"); // Some(10)
println!("{scores:?}"); // {"Blue": 25}
```

## 访问值

使用 `get(&key)` 方法访问值，返回 `Option<&V>`。通常配合 `copied()` 将 `Option<&V>` 转换为 `Option<V>`（适用于实现了 `Copy` 的类型），再用 `unwrap_or()` 提供默认值：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);

let score = scores.get("Blue").copied().unwrap_or(0); // 10
let score = scores.get("Red").copied().unwrap_or(0);  // 键不存在，返回默认值 0
```

> `copied()` 仅适用于实现了 `Copy` 的类型（如 `i32`、`bool`）。若值类型是 `String`、`Vec` 等，需改用 `cloned()`，它会调用 `clone()` 进行深拷贝。

## 检查键是否存在

使用 `contains_key()` 方法检查键是否存在，返回布尔值：

```rust
let has_blue = scores.contains_key("Blue"); // true
let has_red  = scores.contains_key("Red");  // false
```

## 遍历

使用 `for` 循环遍历，使用 `&` 符号获取引用，不转移所有权：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

for (key, value) in &scores {
    println!("{key}: {value}");
}
```

## 删除键值对

使用 `remove()` 方法删除指定键的键值对，返回 `Option<V>`：键存在则返回 `Some(value)` 并删除，键不存在则返回 `None`：

```rust
let removed = scores.remove("Blue");   // Some(10)，已删除
let removed = scores.remove("Ghost");  // None，键不存在
```

## 更新值

### 覆盖旧值

直接再次 `insert()` 相同的键即可覆盖：

```rust
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Blue"), 25); // 覆盖为 25
```

### 只在键不存在时插入

`entry(k).or_insert(v)` 在键不存在时插入默认值，并返回该值的可变引用；键已存在则直接返回现有值的可变引用，不做修改：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);

scores.entry(String::from("Yellow")).or_insert(50); // Yellow 不存在，插入 50
scores.entry(String::from("Blue")).or_insert(50);   // Blue 已存在，不修改
println!("{scores:?}"); // {"Blue": 10, "Yellow": 50}
```

### 基于旧值更新

`entry().or_insert()` 返回值的可变引用，可直接在原值基础上修改：

```rust
// 统计文本中每个单词出现的次数
use std::collections::HashMap;

let text = "hello world wonderful world";
let mut map = HashMap::new();

for word in text.split_whitespace() {
    let count = map.entry(word).or_insert(0);
    *count += 1; // 解引用后修改
}
println!("{map:?}"); // {"hello": 1, "world": 2, "wonderful": 1}
```

## 合并两个 HashMap

使用 `extend()` 方法将另一个 `HashMap` 的键值对合并进来。若存在重复的键，**来源 map 的值会覆盖目标 map 的值**：

```rust
use std::collections::HashMap;

let mut map1 = HashMap::new();
map1.insert("one", 1);
map1.insert("two", 2);

let mut map2 = HashMap::new();
map2.insert("two", 22);   // 与 map1 重复，会覆盖
map2.insert("three", 3);

map1.extend(map2);
println!("{map1:?}");    // {"one": 1, "two": 22, "three": 3}
```

## 容量管理

`HashMap` 会自动扩容，但也可以手动管理容量：

```rust
let mut map: HashMap<&str, i32> = HashMap::with_capacity(10); // 预分配容量
println!("{}", map.len());      // 当前键值对数量：0
println!("{}", map.capacity()); // 当前分配的容量：≥ 10

map.insert("a", 1);
map.shrink_to_fit(); // 缩减容量以贴近当前长度，减少内存浪费
```

## 自定义哈希算法

默认的 SipHash 安全性高但速度偏保守。在明确不需要防御 HashDoS 攻击的场景（如游戏、本地数据处理），可以替换为更快的哈希算法：

```rust
use std::collections::HashMap;
use std::hash::BuildHasherDefault;
use twox_hash::XxHash64; // 需要在 Cargo.toml 中引入 twox-hash crate

type FastHashMap<K, V> = HashMap<K, V, BuildHasherDefault<XxHash64>>;

let mut map: FastHashMap<&str, i32> = FastHashMap::default();
map.insert("one", 1);
map.insert("two", 2);
```

> **注意**：使用自定义哈希算法会放弃 SipHash 的 HashDoS 防御能力，仅在明确了解风险的场合使用。
