# 语法基础检测及原版开发规范

本节我们将提及一些模组开发中需要的 Java/Kotlin/JavaScript/Hjson 语法，及原版在语法方面的一些规定，并不是编程语言的**教程或讲解**，如果发现有漏洞的知识点请在他处自行学习。如果你对Java真的零基础，可以先看看下面，了解一下不需要学什么。

推荐 Java 教程：[黑马程序员零基础](https://www.bilibili.com/video/BV1Ei4y137HJ)（全看完）、[韩顺平30天速成](https://www.bilibili.com/video/BV1fh411y7R8)（看到547课即可）、[廖雪峰官网](https://liaoxuefeng.com/books/java/introduction/index.html)、[菜鸟教程](https://www.runoob.com/java/java-tutorial.html)（不推荐用这个学，适合当语法速查）

推荐 Kotlin 教程：[官方文档](https://book.kotlincn.net/text/home.html)（新语言的文档往往比较优质）、[Kotlin教程视频](https://www.bilibili.com/video/BV1P94y1c7tV/)

推荐 JavaScript 教程：[FreecodeComp](https://www.freecodecamp.org/chinese/learn/javascript-algorithms-and-data-structures)

## 不需要什么
Mindustry不需要`java.[n]io` / `java.net` / `java.util`以外任何Java基础库，因为安卓可能没有它们，这就包括`Swing`和`Awt`。也不需要会任何其他Java框架或中间件。不需要非JVM语言，它们不能用来写模组，包括C++和Python。不需要数据库，除非你要做一个新的服务器基础层。

## Hjson语法

如果非要说的话，只有一句话：**括号一定要是匹配的！！！**

毕竟Mindustry原生的JSON解析过于宽松，引号和逗号笔者建议最好全都不要写，如果写了也一定要匹配，此外即使是Mjson也**不支持尾随逗号**。这样的话，一切语法问题就可以归结到括号不匹配上了。但如果读者使用的是MT管理器，或其他任何没有插件功能的文本编辑器，则推荐使用正规JSON语法，至少还有格式化器可用。

## Java 语言基础知识清单

以下标红处为Mindustry开发与传统Java开发的差异点，我们推荐你使用Mindustry的范式。

### 运行机制
Java 源代码(.java)通过 javac 编译器编译成字节码文件(.class)，然后在 JVM 上执行。Android 平台会将字节码进一步编译成 dex 格式由 ART 执行。

### 基础语法

**标识符与关键字**：标识符由字母、数字、`_`、`$`组成，不能以数字开头。关键字如 public、class、static 等有特殊含义。

**数据类型**：
- 整型：byte(1)、short(2)、int(4)、long(8)
- 浮点型：float(4)、double(8)，存在精度误差
- 字符型：char(2)
- 布尔型：boolean
- 及各类型表示的最大值和最小值

``` java
//这是单行注释，在编译的时候会被编译器忽略，不会保留到最终的class字节码中(字节码会在稍后说明)
int abc;			//合法，声明了一个 类型为 int (整数、定点数) 的变量
float 233;			//不合法，因为是以数字开头
float _f;			//合法。声明了一个 类型为 float (小数、单精度浮点数) 的变量
double DDDd;		//合法。声明了一个 类型为 double (小数、双精度浮点数) 的变量
object $obj;		//合法。声明了一个 类型为 object引用 的变量
```

**变量与常量**：变量存储数据，常量用 final 修饰，值不可变。使用前需要**初始化（Initialization）**

``` java
int a = 10;											//将一个 int 变量 初始化为 10
float f = 3.14f;								//将一个 float 变量 初始化为 3.14
object plum = new Object( );		//将一个 object引用 变量 初始化为 new Object( )——一个对象
String str = "Hello, plum!";		//将一个 String 变量 初始化为 字符串"Hello, plum!"
```

**运算符**：包括算术、关系、逻辑、位、赋值、条件运算符等，注意逻辑运算符的短路特性。

``` java
//本代码段完全符合 Java 语法，可以直接在您的IDEA里运行 (运行方式会在稍后的文章中说明)
int r = 1 + 1;	// r 的值为 2，此处声明了一个变量，类型为 int (整数、定点数)
r = 1 - 1;		// r 的值为 0
r = 3 * 2;		// r 的值为 6
r = 36 / 3;	// r 的值为 12
r = 11 / 5;	// r 的值为 2，int 的除法自动舍弃余数
r = 9 % 2;	// r 的值为 1，这是取余，返回 9 / 2 的余数

bool b = false;	//布尔类型，只有两种值，true 和 false
b = true && false;	// b 的值为 false
b = true || false;	// b 的值为 true
b = ! false;		// b 的值为 true
/*这是多行注释
对于布尔运算符：
&& (和)—— 左右两个操作数均为 true 时，才返回 true，否则返回 false
|| (或)——左右两个操作数至少有一个为true时，就返回 true。都没有为 true 则返回 false
! (否)——取反，使 true 变为 false，false 变为 true。
前一项值已经可以决定结果时，后一项根本就不会被计算
*/
```

**流程控制**:
- 分支结构：if-else、switch-case
- 循环结构：for(含增强for)、while、do-while
- 控制关键字：break、continue、return

**数组**：一维和多维数组，通过索引访问，length 属性获取长度。

### 函数或方法

实例（Instance）的函数（Function）叫方法（Method）。
``` java

// 定义一个函数，有一个int 参数，返回值为 int 类型
int multiply2 ( int x ) {				//可以看作为 f (x) = x * 2
  return x * 2 ;					//使用 return 关键字，返回函数的结果
}
// 函数调用
int res = multiply2 ( 5 ) ; 			//此时，res的值为 10

// 定义一个无返回值，无参数的函数
void bark ( ) {
  System.out.println("汪汪！");		//此处调用了System类的out字段的println方法
}
// 调用无返回值的函数
bark( ) 							//命令行或调试窗口显示：汪汪！

```

### 面向对象编程核心

**三大特征**：
- 封装：<font style="color:red;">减少一切Getter或Setter方法，让所有的属性是`public`的</font>
- 继承：extends实现代码复用，super调用父类成员
- 多态：同一接口不同实现，包括重载`@Override`(编译时)和重写(运行时)

示例代码：
```java
// 封装示例
class Person {
    public String name;
    public String getName() { return name; }
}

// 继承示例
class Student extends Person {
    @Override
    public String getName() { return super.getName(); }
}

// 多态示例
Animal a = new Dog();
a.makeSound(); // 调用Dog的makeSound
```

**其他概念**：
- 类与对象：new创建对象实例
- 构造方法：初始化对象，支持重载
- 字段：实例变量
- static：类成员，属于类而非实例
- final：常量、不可重写方法、不可继承类
- abstract：抽象类和抽象方法
- interface：定义规范，implements实现

### 常用基础类
- `Object`类：所有类的超类，toString()、equals()、hashCode()等方法
- `String`类：不可变字符序列，使用字符串常量池
- 原生容器类被Arc容器`arc.struct`取代，原生函数式接口被Arc函数式接口`arc.func`取代
  
``` java
Seq<Tile> tiles = new Seq<>();
tiles.add(Vars.world.tile(1,1));
ObjectMap<Item, Block> map = new ObjectMap<>();
map.put(Items.copper, Blocks.copperWall);

Cons<Tile> tileConsumer = t -> {Log.info(t.toString());};
tiles.each(tileConsumer);
```

### 命名规范
- 类名：大驼峰，如 BlockStateManager
- 方法名/变量名：小驼峰，如 getName
- 常量名：<font style="color:red;">不是全大写加下划线，而和变量一样小驼峰，如 maxSize</font>
- 包名：<font style="color:red;">不是全小写反向域名，而是要简单，如 project</font>


## Kotlin 语言基础知识清单

### 一、 基础语法：与 Java 的直观差异

1.  **变量声明**
    *   `val`: 声明**只读**变量（类似 Java `final`），优先使用。
    *   `var`: 声明**可变**变量。
    *   **类型推断**: 编译器可自动推断类型，类型标注可省略。
        ```kotlin
        val name = "Kotlin" // String
        var count = 42 // Int
        val explicit: Double = 3.14 // 显式标注类型
        ```
2.  **函数定义**
    *   使用 `fun` 关键字。
    *   返回值写在参数列表后，用 `: Type` 表示。
    *   表达式函数体：单表达式函数可省略 `{}` 和 `return`。
        ```kotlin
        // 传统写法
        fun sum(a: Int, b: Int): Int {
            return a + b
        }
        // 表达式函数体
        fun sum(a: Int, b: Int): Int = a + b
        // 甚至可进一步省略返回值类型（类型推断）
        fun sum(a: Int, b: Int) = a + b
        ```

### 空安全 (Null Safety) - 最重要的特性
1.  **可空类型**
    *   默认类型不可为 `null`。要允许为 `null`，必须在类型后加 `?`。
        ```kotlin
        var neverNull: String = "Hello" // 永远不为null
        var canBeNull: String? = null   // 可以为null
        ```
2.  **安全调用操作符 (`?.`)**
    *   如果对象不为 `null`，则调用方法或访问属性；否则返回 `null`。
        ```kotlin
        val length: Int? = canBeNull?.length // 如果canBeNull为null，则length也是null
        ```
3.  **Elvis 操作符 (`?:`)**
    *   提供 `null` 时的备用值。
        ```kotlin
        val length: Int = canBeNull?.length ?: 0 // 如果为null，则返回0
        ```
4.  **非空断言操作符 (`!!`)**
    *   断言对象不为 `null`，如果为 `null` 则抛出 `NPE`。**应谨慎使用**。
        ```kotlin
        val length: Int = canBeNull!!.length // 我保证它不是null！
        ```

### 类型系统与检查
1.  **智能转换 (Smart Cast)**
    *   一旦进行了类型检查 (`is`)，编译器会自动转换类型，无需显式 `cast`。
        ```kotlin
        fun demo(x: Any) {
            if (x is String) {
                print(x.length) // x 被自动智能转换为 String 类型
            }
        }
        ```
2.  **`Any`**: 所有类的超类（类似 Java `Object`）。
3.  **`Unit`**: 相当于 Java 的 `void`，表示函数不返回任何有意义的值。`Unit` 可省略。
4.  **`Nothing`**: 这个函数永不返回（例如，总是抛出异常）。

### 类与对象
1.  **主构造函数**
    *   简洁的声明方式，直接在类头声明。
        ```kotlin
        class Person(val name: String, var age: Int) { 
            // `val`/`var` 关键字使其同时成为类属性
            // 如果没有注解或可见性修饰符，`constructor` 关键字可省略
        }
        ```
2.  **`init` 代码块**
    *   主构造函数不能包含代码，初始化代码放在 `init` 块中。
3.  **数据类 (`data class`)**
    *   用于只保存数据的类。编译器自动生成 `equals()`, `hashCode()`, `toString()`, `copy()` 和 `componentN()` 函数。
        ```kotlin
        data class User(val name: String, val age: Int)
        ```
4.  **属性 (Property)**
    *   Kotlin 的属性是 first-class 特性，替代了字段 + Getter/Setter 的模式。
    *   完整的属性声明包括一个 Getter 和一个可选的 Setter。
        ```kotlin
        class Rectangle {
            var width: Int = 0
            var height: Int = 0
            val area: Int // 只有getter的属性
                get() = this.width * this.height
        }
        // 使用：直接通过 . 访问，背后是调用getter/setter
        val rect = Rectangle()
        rect.width = 10 // 实际上是调用了 setter
        println(rect.area) // 实际上是调用了 getter
        ```

### 函数式编程特性 (语言层面支持)
1.  **Lambda 表达式**
    *   语法： `{参数 -> 函数体}`。
    *   **如果 Lambda 是函数的最后一个参数**，它可以移到括号外面。如果它是唯一的参数，括号可以省略。
        ```kotlin
        // 假设有一个函数：fun runLater(block: () -> Unit) {}
        runLater({ println("Hi") })   // 传统写法
        runLater() { println("Hi") }  // Lambda 外置
        runLater { println("Hi") }    // 括号省略（最常用）
        ```
2.  **高阶函数**
    *   将函数用作参数或返回值的函数。
        ```kotlin
        fun calculate(x: Int, y: Int, operation: (Int, Int) -> Int): Int {
            return operation(x, y)
        }
        val result = calculate(10, 5) { a, b -> a + b } // 传入一个Lambda作为operation参数
        ```

### 伴生对象 (Companion Object) - 替代静态成员
*   Kotlin 中没有 `static` 关键字。
*   使用伴生对象来声明类级别的变量和函数，实现类似静态成员的功能。
    ```kotlin
    class MyClass {
        companion object {
            const val CONSTANT = "constant" // 编译期常量
            fun create(): MyClass = MyClass() // 工厂方法
        }
    }
    // 调用
    val constant = MyClass.CONSTANT
    val instance = MyClass.create()
    ```
* 使用`@JvmStatic`等注解

### 委托
Kotlin 的**委托（Delegation）** 是一个非常重要且强大的特性。它提供了一种清晰、简洁的方式来实现“组合优于继承”的原则。

Kotlin 的委托主要分为两类：**类委托**和**属性委托**。

#### 类委托 (Class Delegation)

**核心思想：** 将一个类的具体实现委托给另一个对象。

*   **Java 中的问题：** 在 Java 中，你需要手动实现所有接口方法，并将调用转发给内部持有的对象，会产生大量样板代码。
*   **Kotlin 的解决方案：** 使用 `by` 关键字，编译器会自动为你生成所有转发方法。

**语法：**
```kotlin
interface Base {
    fun print()
    fun printMessage(msg: String)
}

class BaseImpl(val x: Int) : Base {
    override fun print() { println("Value: $x") }
    override fun printMessage(msg: String) { println("$msg: $x") }
}

// 类 `Derived` 将其接口 `Base` 的所有公有成员实现委托给 `b` 这个对象。
// 语法： `class Derived : Base by b`
class Derived(b: Base) : Base by b {
    // 1. 可以重写委托的方法
    override fun print() {
        println("Derived's print")
        // 2. 如果需要，仍然可以通过 `super.print()` 调用委托对象的实现
        super.print()
    }
    // 3. 没有重写的方法（如 `printMessage`）会自动转发给 `b`
}

fun main() {
    val baseImpl = BaseImpl(10)
    val derived = Derived(baseImpl)
    derived.print() 
    // 输出：
    // Derived's print
    // Value: 10

    derived.printMessage("Hello") 
    // 自动转发给 baseImpl.printMessage("Hello")
    // 输出： Hello: 10
}
```



#### 属性委托 (Property Delegation)

**核心思想：** 将一个属性（property）的 `getter` 和 `setter` 逻辑委托给另一个对象（称为委托对象）。

**语法：**
`val/var <property name>: <Type> by <delegate expression>`

委托对象必须遵循**属性委托约定**，即提供 `operator` 修饰的 `getValue()` 和 `setValue()` 函数（后者用于 `var` 属性）。

Kotlin 标准库提供了几个极其有用的内置属性委托工厂函数（虽然你要求不包括 stdlib，但这些是理解委托不可或缺的核心例子）：

#### `lazy`： 惰性初始化

*   **用途：** 延迟一个昂贵开销的初始化，直到第一次访问该属性。
*   **要求：** 必须是 `val`（只读），因为初始值只能在第一次访问时确定。
*   **线程安全：** 默认情况下 `lazy()` 是同步的（线程安全的）。

```kotlin
val expensiveResource: Resource by lazy {
    // 这个 lambda 只在第一次访问 expensiveResource 时执行
    println("Initializing expensive resource...")
    Resource() // 最后一行表达式的结果就是属性的值
}

fun main() {
    println("Before access")
    val resource = expensiveResource // 此时会执行 lambda 进行初始化
    println("After access")
    // 再次访问不会再初始化
    val resource2 = expensiveResource
}
// 输出：
// Before access
// Initializing expensive resource...
// After access
```

#### b. `observable` 与 `vetoable`： 观察属性变化

*   **`observable`:** 在属性值**被改变后**触发回调。
*   **`vetoable`:** 在属性值**被改变前**触发回调，允许你“否决”此次修改。

```kotlin
import kotlin.properties.Delegates // 这是标准库的一部分，仅作示例

var name: String by Delegates.observable("<no name>") { prop, old, new ->
    println("$old -> $new") // 变化后打印
}

var positiveNumber: Int by Delegates.vetoable(0) { prop, old, new ->
    // 只有当新值是正数时，修改才生效
    new > 0
}

fun main() {
    name = "first"
    name = "second"
    // 输出：
    // <no name> -> first
    // first -> second

    positiveNumber = 1
    println(positiveNumber) // 输出: 1
    positiveNumber = -1    // 赋值被否决！
    println(positiveNumber) // 输出: 1 (值未被改变)
}
```


### 其他实用语法糖
1.  **字符串模板**
    *   在字符串中直接嵌入变量 (`$变量名`) 或表达式 (`${表达式}`)。
        ```kotlin
        val name = "Alice"
        println("Hello, $name!") // Hello, Alice!
        println("1 + 2 = ${1 + 2}") // 1 + 2 = 3
        ```
2.  **默认参数与命名参数**
    *   **默认参数**：函数参数可以指定默认值，避免重载。
    *   **命名参数**：调用时使用参数名指定值，提高可读性且可任意顺序。
        ```kotlin
        fun greet(name: String, msg: String = "Hi") {
            println("$msg $name")
        }
        greet("Bob") // 使用默认msg: Hi Bob
        greet(msg = "Hello", name = "Alice") // 命名参数：Hello Alice
        ```
3.  **`when` 表达式**
    *   强大的 `switch` 替代品，可以匹配值、范围、类型等。
    *   它可以返回值。
        ```kotlin
        fun describe(obj: Any): String = when (obj) {
            1 -> "One"
            "Hello" -> "Greeting"
            is Long -> "Long type"
            !is String -> "Not a string"
            else -> "Unknown"
        }
        ```
4.  **范围表达式 (`..` 和 `until`)**
    *   用于创建区间，常与 `in` 操作符在循环和 `when` 中使用。
        ```kotlin
        for (i in 1..5) { print(i) } // 12345 (闭区间[])
        for (i in 1 until 5) { print(i) } // 1234 (半开区间[))
        if (x in 1..10) { ... } // 判断x是否在1到10之间
        ```
