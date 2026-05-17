mod a; // 寻找的是a.rs或者a文件夹下的mod.rs

use a::b::c; // 导入c模块,里面有struct和他的固有方法,以及实现的trait方法,但是trait定义没有在这个模块中
use a::b::d::More; // 需要使用模块c中struct已经实现的trait方法,还必须导入这个模块的trait才可以使用

// 严格遵守数据和行为分开的规则,数据和行为必须都导入才可以都是用

fn main() {
    // 实现模块a的struct
    let san = c::Person {
        name: "zhangSan".into(),
        age: 18,
    };
    san.run(); // run方法是固有的,只要导入了struct就可以使用
    san.sleep(); // sleep方法是实现了trait的方法,由于这个stuct和trait不在一个模块,必须显式的导入这个trait才可以使用实现了这个trait的方法
}
