# JavaScript 基础语法

这一节我们将介绍 JavaScript 的基础语法,包括变量声明、数据类型、运算符、控制结构等内容。尽管我们的核心目的是写出能在Mindustry中运行的JavaScript代码,但理解这些基础语法对于编写高效、可维护的代码是非常重要的。

## 通用语法

这一部分将介绍一些JavaScript的通用语法规则,这些规则在任何JavaScript环境中都是适用的。这半节的内容都可以在[w3school的js教程](https://www.w3school.com.cn/js/index.asp)中找到,不过如果你懒,我也会在这里总结一些重要的语法规则。

### 变量类型

JavaScript中有几种基本的数据类型:

- **Number数字**: 用于表示浮点数。例如: `let x = 10.0;` 
JavaScript中的数字类型没有整数和浮点数之分,然而编写mdt的java有,所有不要在应该填整数的地方填浮点数,以及抄源码的时候记得把数字末尾的`f`去掉。
- **String字符串**: 用于表示文本数据,由一系列字符组成。例如: `let name = "Mindustry";`
- **Boolean**: 用于表示逻辑值,只有两个取值: `true` 和 `false`。例如: `let isActive = true;`
- **Object对象**: 用于表示复杂数据结构,由键值对组成。例如:

```javascript

let person = {
  name: "Alice",
  age: 30
};

let block = new Block("block"); // mdt的方块,也是对象

```

- **Array数组**: 用于表示有序的列表,可以包含任何类型的元素。例如:

```javascript
let numbers = [1, 2, 3, 4, 5];
let mixed = [1, "two", true, { name: "Alice" }];
```

注意数组索引从0开始,所以`numbers[0]`是1,而不是2。

### 变量声明

在JavaScript中,我们可以使用`var`, `let`, 或 `const`来声明变量。简单来说:

- `var` 是最早的变量声明方式,它有一些作用域上的问题,不推荐使用。**注意和mdt中常用的Vars区分开来**
- `let` 块级作用域变量声明方式,推荐使用。一般用于for循环
- `const` 用于声明常量,即值不能被重新赋值的变量。不要用它声明数字(`Number`)和字符串(`String`),而是用于声明对象(`Object`)和数组(`Array`)等复杂数据类型。

我们一般这样声明变量:

```javascript
let x = 10; // 数字类型
let isActive = true; // 布尔类型
let name = "Mindustry"; // 字符串类型 用得少
const block = new Block("block"); // mdt的方块 对象类型

// 理论上也可以不初始化变量,但不推荐
let y; // 声明一个变量但不赋值

//这里省略一万行代码

y = 20; // 再给y赋值

```

如你所见,我们在声明变量时并没有指定变量的类型,这是因为JavaScript是一种动态类型语言,变量的类型是根据赋值来确定的。你可以随时给一个变量赋不同类型的值,但这可能会导致代码难以维护和调试,所以我建议在编写代码时保持变量类型的一致性。

```javascript

let a; // a的类型是undefined
a = 10; // a现在是一个数字
a = "Hello"; // a现在是一个字符串
a = true; // a现在是一个布尔值

```

我的建议是,在编写代码时尽量保持变量类型的一致性,这样可以提高代码的可读性和可维护性。如果你确定了一个变量的类型,但不能确定它的值,我建议你在声明变量时就给它一个初始值,以明确变量的类型.

```javascript

let a = 0; // 数字
let b = ""; // 字符串
let c = false; // 布尔值
let d = {}; // object类型
let e = []; // 数组类型

```

### 运算符

- **算术运算符**: `+`, `-`, `*`, `/`, `%` 等。例如:

```javascript

let sum = 10 + 5; // 15
let difference = 10 - 5; // 5
let product = 10 * 5; // 乘法 50
let quotient = 10 / 5; // 除法 2
let remainder = 10 % 3; // 取余 结果是1

let square = 5 ** 2; // 乘方 结果是25
let square = Math.power(5,2); // 乘方的另一种写法 结果是25

let a = 10 * 2 + 5; // 25,乘法优先级高于加法
let b = (10 + 5) * 2; // 30,括号改变了运算顺序

let x = 10;
x++; // 递增 x现在是11 for循环里好用

x--; // 递减 x现在是10

```

- **比较运算符**: `==`, `===`, `!=`, `!==`, `<`, `>`, `<=`, `>=` 等。例如:

```javascript
let isEqual = (10 == "10"); // true, == 不是严格比较,会进行类型转换
let error1 = (10 = "10"); 
/* 
一个常见的语法错误,单等号是赋值运算符,而不是比较运算符
如果你这样写了,你会得到一个SyntaxError: Invalid left-hand side in assignment错误
这个错误有时会让人很头大,因为=在自然语言中是一个比较运算符,但实际上是一个赋值运算符
而且mdt不会报这个错误的行号
*/
let warning = (true == 'false'); // true, == 进行类型转换后, true和'false'都被转换成了true

let isStrictEqual = (10 === "10"); // false, === 是严格比较,不进行类型转换
let isNotEqual = (10 != "10"); // false, != 不是严格比较,会进行类型转换
let isStrictNotEqual = (10 !== "10"); // true, !== 是严格比较
let isGreater = (10 > 5); // true
let isLess = (10 < 5); // false
let isGreaterOrEqual = (10 >= 10); // true 注意不要写成10 => 10,记住大于等于,先写大于号,再写等于号,不要反过来
let isLessOrEqual = (10 <= 5); // false
```

- **逻辑运算符**: `&&` (逻辑与), `||` (逻辑或), `!` (逻辑非) 等。例如:

```javascript
let isTrue = true && true; // true
let isFalse = true && false; // false
let isEitherTrue = true || false; // true
let isNeitherTrue = false || false; // false
let isNotTrue = !true; // false
let isNotFalse = !false; // true
```
- **赋值运算符**: `=`, `+=`, `-=`, `*=`, `/=`, `%=` 等。例如:

```javascript
let x = 10; // 赋值
x += 5; // x现在是15,相当于 x = x +
x -= 3; // x现在是12,相当于 x = x - 3
x *= 2; // x现在是24,相当于 x = x * 2
x /= 4; // x现在是6,相当于 x = x / 4
x %= 4; // x现在是2,相当于 x = x % 4
```

- **其他运算符**: 还有一些其他的运算符,如三元运算符 `? :`, 位运算符 `&`, `|`, `^`, `~`, `<<`, `>>`, `>>>` 等,以及一些特殊的运算符如 `typeof`, `instanceof`, `in` 等。这些运算符在某些特定的情况下非常有用,但在编写mdt脚本时可能用得不多,所以我们暂时不深入介绍它们。

### if 和 for 语句

- **条件语句**: `if`, `else if`, `else` 等。例如:

```javascript
let x = 10;

if (x > 10) {
  console.log("x is greater than 10");
} else if (x === 10) {
  console.log("x is equal to 10");
} else {
  console.log("x is less than 10");
}

```

- **循环语句**: 有`for`, `while`, `do...while` 等。

但我觉得for大部分时候就够用了,其他的循环语句在mdt脚本里用得不多.

```javascript
// for循环的语法是: for (初始化; 条件; 更新) { 代码块 }
// 这是某个mdt脚本单位draw()里的一段代码,它使用了for循环来绘制一个旋转的圆弧
for (let i = 0; i < 3; i++) {
    let rot = i * 360 / 3 + Time.time * 1;
    Lines.arc(unit.x, unit.y, range, 0.15, rot);
}

// 不用for循环的话,你就得写三段几乎一模一样的代码,这样不仅冗长,而且不易维护

Lines.arc(unit.x, unit.y, range, 0.15, 0 + Time.time * 1);
Lines.arc(unit.x, unit.y, range, 0.15, 120 + Time.time * 1);
Lines.arc(unit.x, unit.y, range, 0.15, 240 + Time.time * 1);

//for循环也可用于批量创建对象,比如在mdt脚本里创建多个部件
for (let i = 0; i < 3; i++) {
    triploid.parts.add(
    Object.assign(new RegionPart("-blade"), {
        layerOffset: -0.001,
        x: 2,
        moveX: 6 + i * 1.9,
        moveY: 8 + -4 * i,
        moveRot: 40 - i * 25,
        mirror: true,
        progress: DrawPart.PartProgress.warmup.delay(i * 0.2)
    }))
}
//这段代码创建了三个部件,它们的moveX、moveY、moveRot属性根据i的值不同而不同,如果不用for循环的话,你就得写三段几乎一模一样的代码,这样不仅冗长,而且不易维护

//如果你需要遍历一个数组或者对象的属性,你也可以使用for循环,比如:
let numbers = [1, 2, 3, 4, 5];
for (let i = 0; i < numbers.length; i++) {
    console.log(numbers[i]);
}

//不过我更推荐使用for...of循环或者for...in来遍历数组,它的语法更简洁,比如:
let numbers = [1, 2, 3, 4, 5];
for (let number of numbers) {
    console.log(number);
}

for (let index in numbers) {
    console.log(numbers[index]);
}

// 注意for...of循环直接获取数组的元素,而for...in循环获取数组的索引
```

以上就是JavaScript的一些基础语法规则,掌握这些规则将帮助你更好地编写mdt脚本。在接下来的章节中,我们将介绍一些更高级的JavaScript特性,如函数、对象、数组等,以及如何在mdt中使用它们。
