**<font style="color:#DF2A3F;">没有Java基础非常不建议写Java模组，AI并不会Mindustry。</font>**

**<font style="color:#DF2A3F;">没有Java基础非常不建议写Java模组，AI并不会Mindustry。</font>**

**<font style="color:#DF2A3F;">没有Java基础非常不建议写Java模组，AI并不会Mindustry。</font>**

##  声明与教程引用
本篇教程并非为 Java 语言教程，编写 Mod 需进行较深层次的 Java 编程知识，本文只简略介绍一些语法。

以下为普冷姆认为较合适的新手入门教程，您也可以选择更适合自己的，请结合多篇教程来学习。

菜鸟教程：[https://www.runoob.com/java/java-tutorial.html](https://www.runoob.com/java/java-tutorial.html)

Vamei<font style="color:rgb(51, 51, 51);">的博客：</font>[https://www.cnblogs.com/vamei/archive/2013/03/31/2991531.html](https://www.cnblogs.com/vamei/archive/2013/03/31/2991531.html)

廖雪峰的官方网站：[https://www.liaoxuefeng.com/wiki/1252599548343744](https://www.liaoxuefeng.com/wiki/1252599548343744)

## <font style="color:#DF2A3F;">AI 暂时不能代替程序员</font>
<font style="color:#DF2A3F;">人工智能获取知识，依赖于强化学习和大量的范例。可惜的是，Mindustry两者都不占，这也意味着，AI难以给出直接可用的Mindustry相关代码。因此，AI暂时不能代替您写模组</font>

## 游戏开发与业务开发中较大的不同
Mindustry 开发中，存在许多与你学到Java知识（前提是你学了）相差异甚至违背之处，所以要格外注意。

### 基本类型
首先就是浮点数问题。浮点数有两种精度：float和double，float的内存占用为8位，而double为16位，可见float在理论上更加经济，但实际并没有这回事。而在游戏开发领域，由于历史原因，float**<font style="color:#DF2A3F;">远</font>**比double常用。

但是，在Java中，一个简单的`3.0`，却默认被解读成double类型，而游戏中大部分变量是float类型，这样IDE就会向你抱怨**窄 化 类 型 转 换**。对于这个错误，正确的解决方法是使用`3.0f`而非`3.0`。注意，整数默认不向浮点数转换，因此也不应该写成`3`。

### 访问控制
你一定会见到网上的Java教程推荐这样的代码：



```java
public class Puppy {
    private int age;
    private String name;
 
    // 构造器
    public Puppy(String name) {
        this.name = name;
        System.out.println("小狗的名字是 : " + name);
    }
 
    // 设置 age 的值
    public void setAge(int age) {
        this.age = age;
    }
 
    // 获取 age 的值
    public int getAge() {
        return age;
    }
 
    // 获取 name 的值
    public String getName() {
        return name;
    }
}
```

应当说，这是很好的编程习惯，因为它更加精确地控制了字段的访问权限。但是Mindustry中鲜见这样的写法，对于上面的类，可能更倾向于这么写：

```java
public class Puppy {
    public int age;
    public String name;
 
    // 构造器
    public Puppy(String name) {
        this.name = name;
        Log.info("小狗的名字是 : " + name);
    }
}
```

笔者在此处强调，选择这样的写法确实有简洁的好处，但是这是好处中最坏的一个。至于这么写的原因，笔者猜测有以下几个：

1. 原版是使用同一套代码编译到iOS/Android/网页（已废弃）平台上去的，方法数过多可能会导致超过单个dex文件32k个方法数的限制，而Mindustry 大部分代码写成的时候未引入MultiDex
2. 游戏对速度要求较高，多一层getter会降低后端编译器优化能力不足时的运行速度
3. Anuke纯纯的反工程学疯子，或是一个纯粹的懒人。



**至于Anuke把你想要访问的方法、字段隐藏时，请致电MEEP**。

### 血族模型
在Mindustry中，可以粗略地把方法分为实体区和非实体区，区分方式为是否在游戏中会多次执行。因此，与业务开发的对象级、请求级、页面级不太一样。Mindustry大部分重要的代码都是实体区的，<font style="color:#DF2A3F;">这也就意味着你要保证代码在1/60s内能执行完毕</font>。不过，你也不用大惊小怪，要做到这一点，**<font style="color:#DF2A3F;">只需要你不要在update或draw相关代码中新建对象即可</font>**。

同时你也要切记，不要持有一个对象时间到不合理的地步，应该说这是目前资深开发者也要犯的低级错误。

### 反射地狱
## 变量 Variable
变量是在 Java 语法和逻辑中最基本的存储单元 (关于更多底层信息，请参见：[https://blog.csdn.net/jchen1218/article/details/112737747](https://blog.csdn.net/jchen1218/article/details/112737747))。

变量名可以使用—— 英文大小写符号 数字 下划线 美元符号

变量的命名不能以数字开头，可以使用 _ $ 符号。

<变量类型> <变量名>;

在 Java 中所有语句的末尾必须加上分号，如果您的IDEA或编译器报错，请检查分号。

```java
//这是单行注释，在编译的时候会被编译器忽略，不会保留到最终的class字节码中(字节码会在稍后说明)
int abc;			//合法，声明了一个 类型为 int (整数、定点数) 的变量
float 233;			//不合法，因为是以数字开头
float _f;			//合法。声明了一个 类型为 float (小数、单精度浮点数) 的变量
double DDDd;		//合法。声明了一个 类型为 double (小数、双精度浮点数) 的变量
object $obj;		//合法。声明了一个 类型为 object引用 的变量
```

其他：

1. 变量名称中可以包含 Unicode 字符，例如中文、日文等
2. 变量名称中不可以包含 特殊字符 或 Java 的运算符，例如 ? / - = \  * - + . ( ) [ ] { } % ^ & @ ! ~ 等
3. 变量名称不可以是 Java 使用的 语法关键字 ，例如 new if while do class 等

注：好的命名可以让其他人对于变量的含义一目了然，或便于他人理解您的代码 (甚至适合您修改代码或重构)

以下是 Java 中的一些规则，您当然可以不遵守。

1. 建议：变量名只包含英文字母，数字和下划线—— int ABCabc_123;
2. 建议：不要在任何名称 (包括变量名) 中使用美元符号 ($)。注：因为 Java 命名 匿名类，内部类和Lambda等 时使用了这个符号
3. 思考：变量名的长度和清晰度取决于变量的生命周期和重要性，如果一个变量要在很长的时间被反复使用、赋值、被他人浏览，请详细和确切地命名
4. 建议：不要使用汉语拼音为重要的变量命名，或者避免为所有变量使用汉语拼音命名。

## 变量初始化与赋值 <font style="color:rgb(51, 51, 51);">Assignment</font>
在使用 **局部变量 (local variable) **之前，需要进行 **初始化 (initialization) **或 **赋值 (assignment)**

### 初始化 Initialization
```java
int a = 10;											//将一个 int 变量 初始化为 10
float f = 3.14f;								//将一个 float 变量 初始化为 3.14
object plum = new Object( );		//将一个 object引用 变量 初始化为 new Object( )——一个对象
String str = "Hello, plum!";		//将一个 String 变量 初始化为 字符串"Hello, plum!"
```

### 赋值 <font style="color:rgb(51, 51, 51);">Assignment</font>
```java
byte a;			//声明了一个类型为 byte 的变量，只占1个字节 (即8个位)，取值范围比 int 小
bool b;			//声明了一个类型为 bool 的变量，只有两种值，true 和 false
a = 5;			//将 a 赋值为 5——把 5 赋值给 a
b = false;		//把 false 赋值给 b
char ch;		//声明了一个类型为 char 的变量，存储一个字符
ch = 'A';		//把字符 A 赋值给 ch
```



更多关于变量与赋值的内容，请参考其他教程。此后本教程默认您已掌握这类知识。

## 运算符 Operator
Java 支持大部分基础的数学运算符，少数特殊运算需要调用 Java 的 **库 (Library)**，例如 Math类 (java.lang.Math)。

```java
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
*/
```



更多与运算符相关的，请参考其他教程。此后本教程默认您已掌握运算符相关的知识。

## 函数 Function
仅针对 Java 来说。我们可以把 "f (x) = x * 2" 看做一个函数，也可以把 "plum.runs( )" 看做一个函数。

定义函数的语法：

<返回值的类型> <函数名> (<参数类型> <参数名>)

```java
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

对于多个参数的函数的示例：

```java
int max( int a , int b ){
  if ( a > b ) {
    return a;
  } else {
    return b;
  }
}
// if 条件语句等语句 请参考：https://www.runoob.com/java/java-if-else-switch.html
```



更多关于函数的，请参考其他教程或继续随着本教程学习。此后本教程默认您已掌握函数相关知识。

## 面向对象 OOP
Java 中万物皆对象，除了 int float bool double char long byte short 这些基础类型——不过这些基础类型也有对应的类。更多具体信息，请同时参照：[https://www.runoob.com/java/java-object-classes.html](https://www.runoob.com/java/java-object-classes.html) 来学习。

定义一个类

```java
public class Person{ 					// 类名首字母应当大写,类名为 Person
    public int age;					// 字段名首字母应当小写,字段名为 age,类型为 int
    public String firstName;				// 字段名为 firstName,类型为 String
    public String lastName;				// 字段名为 lastName,类型为 String
    Person(String firstName,String lastName){	//构造方法
        this.firstName = firstName;		//使用参数 firstName 为字段 firstName命名
        this.lastName = lastName;		//使用参数 lastName 为字段 lastName命名
    }
    public String getFullName( ){			// 方法名首字母应当小写,方法名为 getFullName.返回值为String
        return firstName + lastName;		// 将两个 String 拼接,并返回
    }
    /*
    在Mindustry中不推荐使用getter/setter方法
    public int getAge( ){				// 方法名为 getAge,返回值为 int
        return age;						// 直接返回 age 字段的值
    }
    */
}
```

以上，我们就定义了一个Person类了。下面具体解析其中的部分

### 类 Class
花括号 用于区分不同的代码块，需要成对出现

 声明类的语法：class <类名> { }

```java
public class Person{ 	}
```

### 字段 Field
——声明字段不同于普通的局部变量，如果不进行初始化，那么会有默认的初始值。请参见：[https://www.cnblogs.com/cao-1/p/12170117.html](https://www.cnblogs.com/cao-1/p/12170117.html)

 一个 私有 的 int 类型的字段，叫 age

声明字段的语法：<修饰符> <类型> <字段名>;

```java
private int age;
```

私有字段与私有方法，是外部无法访问的，只有类内的字段和方法可以访问。

公有字段与公有方法，是外部和内部都可以访问的。

**私有 (private)** 和** 公有 (public)** 的区别 和 更多修饰符 请参照：[https://www.runoob.com/java/java-modifier-types.html](https://www.runoob.com/java/java-modifier-types.html)，[https://blog.csdn.net/weixin_42189643/article/details/80305433](https://blog.csdn.net/weixin_42189643/article/details/80305433)

### 方法 Method
方法是只属于类的函数，Java 中并不允许真正的函数"孤独'地存在，必须被包含在一个类里。

```java
public String getFullName( ){	
	return firstName + lastName;	//同一个类的方法，可以访问这个类的字段和其他方法
}
```

### 构造方法 Consturctor
一种特殊的方法，一个类可以拥有一个或多个构造方法。若没有，则默认生成一个 没有参数的 构造方法。

构造方法会在创建对象的时候被调用，你只能使用构造方法去创建对象——除非使用 **反射 (Reflection)**

### 实例化 Instantiation
——或叫 创建对象

```java
Person plum = new Person ( "Plum" , "Li" ); 
// 创建了一个Person对象，并赋值给plum变量

String fullName = plum.getFullName( ); 
// fullName变量的值为 "PlumLi"

int age = plum.getAge( ); 
// age变量的值为 0，因为 plum对象 里 age字段 未被赋值，使用了初始值 0
```

只有 对象 才能调用 方法。与此同时，能被 对象 和 类 同时调用的方法叫 **静态方法 (Static method)**

### 继承 Inheritance 与 多态 Polymorphism
请同时参考：[https://www.runoob.com/java/java-object-classes.html](https://www.runoob.com/java/java-object-classes.html)

假设，我们认为 "学生" 和 "老师" 都是一种 "人"。学生包含自己的考试分数信息，与此同时，老师包含自己的教学科目。

我们可以写入如下的伪代码

> 人:
>
> 字段 姓名
>
> 字段 年龄
>
> 方法 自我介绍
>
> 学生 继承 人:
>
> 字段 姓名 来自 人
>
> 字段 年龄 来自 人
>
> 字段 分数
>
> 方法 自我介绍 覆盖 人
>
> 老师 继承 人:
>
> 字段 姓名 来自 人
>
> 字段 年龄 来自 人
>
> 字段 教学科目
>
> 方法 自我介绍 覆盖 人
>

字段 (Field) 与 方法 (Method) 已经在之前介绍过了，接下来先重点看看 **继承 (Inheritance)** 的部分。

因为 "人" 具有 姓名、年龄 字段，又因为 "学生" 是一种 "人"，所以 "学生" 自然应该包含所有 "人" 有的部分。

我们可以说：

1. "学生" 是一种 "人" —— Student is a (kind of) Person.
2. "学生" 继承 "人"
3. "学生" 是 "人" 的子类
4. "人" 是 "学生" 的父类
5. "学生" 的 "自我介绍" 方法 覆盖/覆写 了 "人" 的 "自我介绍"

以上，对 "老师" 与 "人" 同理



接下来用 Java 来重新描述一下上述的伪代码：

```java
public class Person{
    public String name = "LiPlum";	// 手动为字段初始化
    public int age;					//  未手动初始化的，依然使用默认值
    public void introduceSelf( ){
        System.out.println("I'm "+ name + " and "+age+" year-old.");
        // 向标准输出(这里是控制台)打印文字
    }
}
class Student extends Person{ 		// extends 表示 继承
    public int score = 100;	
    @Override					// 覆写了父类的方法，应当使用 @Override 注解
    public void introduceSelf( ){
        System.out.println("I'm "+ name + ", a "+ age +" year-old student, and have got "+score+" in recent exam.");
    }
}
class Teacher extends Person{
    public String subject = "Math";
    @Override
    public void introduceSelf( ){
        System.out.println("I'm "+ name + ", a "+ age +" year-old teacher, and teaching "+subject);
    }
}
```

我们可以如下创建对象和修改字段

```java
Person nobody = new Person( );	// 创建了一个 名为 nobody 的 Person 类的引用并赋值
nobody.name = "Nobody";		// 使用 变量名 + 点 + 字段名 的方式访问 字段
nobody.introduceSelf( );			// 使用 变量名 + 点 + 方法名 的方式调用 方法
// 控制台输出：I'm Nobody and 0 year-old.

Student plum = new Student( );	// 创建了一个 名为 plum 的 Student 类的引用并赋值
plum.age = 99;
plum.introduceSelf( );
// 控制台输出：I'm Liplum, a 99 year-old student, and have got 100 in recent exam.

Person Ben = new Teacher( );		// 将 一个 Teacher 对象 赋值 给 Person 类的引用 Ben
Ben.name = "Ben";
Ben.age = 25;
//Ben.subject = "Physics";		这行代码会报错，因为Ben 是Person 类的引用，而非 Teacher
Ben.introduceSelf( );			// 因为 Ben 是Person 类的引用，我们只能调用 Person 的方法
// 控制台输出：I'm Ben, a 25 year-old teacher, and teaching Math
```



剩余OOP相关知识，请继续查阅相关资料与教程，后续本教程假定您已掌握相关知识，如若出现陌生的术语或内容，请合理使用搜索引擎，进行搜索查阅。

