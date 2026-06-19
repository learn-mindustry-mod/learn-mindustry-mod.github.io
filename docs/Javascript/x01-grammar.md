# JavaScript Basic Syntax

In this section, we'll cover JavaScript basics — variable declarations, data types, operators, control structures, and more. Although our core goal is to write JavaScript that runs in Mindustry, understanding these fundamentals is essential for writing efficient and maintainable code.

## General Syntax

This part covers some universal JavaScript syntax rules that apply in any JavaScript environment. The content here can also be found in the [W3Schools JS tutorial](https://www.w3schools.com/js/); we've summarized the important rules below.

### Data Types

JavaScript has several basic data types:

- **Number**: Used to represent floating-point numbers. Example: `let x = 10.0;` — JavaScript's number type makes no distinction between integers and floats. However, Mindustry's Java does, so don't use floats where integers are expected, and remember to remove the trailing `f` when copying from source code.
- **String**: Used to represent text data, consisting of a sequence of characters. Example: `let name = "Mindustry";`
- **Boolean**: Represents logical values with only two possible values: `true` and `false`. Example: `let isActive = true;`
- **Object**: Represents complex data structures, composed of key-value pairs. Example:

```javascript

let person = {
  name: "Alice",
  age: 30
};

let block = new Block("block"); // A Mindustry block is also an object

```

- **Array**: Represents an ordered list that can contain elements of any type. Example:

```javascript
let numbers = [1, 2, 3, 4, 5];
let mixed = [1, "two", true, { name: "Alice" }];
```

Note that array indices start at 0, so `numbers[0]` is 1, not 2.

### Variable Declarations

In JavaScript, we can use `var`, `let`, or `const` to declare variables. In short:

- `var` is the oldest way to declare variables. It has scoping issues and is **not recommended**. **Note: do not confuse this with `Vars`, which is commonly used in Mindustry.**
- `let` declares block-scoped variables. Recommended for general use, especially in `for` loops.
- `const` declares constants — variables whose values cannot be reassigned. Don't use it for `Number` or `String` types; use it for complex types like `Object` and `Array`.

We typically declare variables like this:

```javascript
let x = 10; // Number type
let isActive = true; // Boolean type
let name = "Mindustry"; // String type (less common)
const block = new Block("block"); // Mindustry block — Object type

// You can also declare without initializing, but it's not recommended
let y; // Declares a variable without assigning a value

// Other example code omitted here

y = 20; // Assign a value to y later

```

As you can see, we don't specify a type when declaring variables — this is because JavaScript is a dynamically typed language. A variable's type is determined by its assigned value. You can assign values of different types to the same variable at any time, but this can make code hard to maintain and debug, so it's best to keep variable types consistent.

```javascript

let a; // a's type is undefined
a = 10; // a is now a number
a = "Hello"; // a is now a string
a = true; // a is now a boolean

```

When writing code, try to keep variable types consistent — this improves readability and maintainability. If a variable's type is known but its initial value isn't, give it a sensible default to clarify its purpose.

```javascript

let a = 0; // Number
let b = ""; // String
let c = false; // Boolean
let d = {}; // Object type
let e = []; // Array type

```

#### Variable Naming Rules

- Variable names must start with a letter, underscore `_`, or dollar sign `$`, followed by letters, digits, underscores, or dollar signs.
- Variable names are case-sensitive — `myVariable` and `myvariable` are two different variables.
- Variable names cannot be JavaScript reserved words like `let`, `const`, `if`, `else`, `for`, `while`, etc.

- Variable names should ideally match the `name` of your Mindustry content. For example:

```javascript

const triploid = new UnitType("triploid"); 
const biomassSteel = new Item("biomass-steel", Color.valueOf("4e342e"));
// Variable name matches the content name, improving readability and maintainability

```

For specific content types, we conventionally use lowerCamelCase — e.g. `protein`, `biomassSteel`, etc.
For functions you define yourself, we conventionally use UpperCamelCase — e.g. `Block`, `UnitType`, `DrawPart`, etc.

Technically, Chinese characters can be used as variable names, but if you do, you'll be switching input methods constantly.

### Operators

- **Arithmetic Operators**: `+`, `-`, `*`, `/`, `%`, etc. Example:

```javascript

let sum = 10 + 5; // 15
let difference = 10 - 5; // 5
let product = 10 * 5; // Multiplication: 50
let quotient = 10 / 5; // Division: 2
let remainder = 10 % 3; // Modulo: result is 1

let square = 5 ** 2; // Exponentiation: result is 25
let square = Math.pow(5, 2); // Another way to exponentiate: result is 25

let a = 10 * 2 + 5; // 25 — multiplication has higher precedence than addition
let b = (10 + 5) * 2; // 30 — parentheses change the order of operations

let x = 10;
x++; // Increment: x is now 11 — useful in for loops

x--; // Decrement: x is now 10

```

- **Comparison Operators**: `==`, `===`, `!=`, `!==`, `<`, `>`, `<=`, `>=`, etc. Example:

```javascript
let isEqual = (10 == "10"); // true — == is not strict, performs type coercion
let error1 = (10 = "10"); 
/* 
A common syntax error — single `=` is an assignment operator, not a comparison.
If you write this, you'll get a SyntaxError: Invalid left-hand side in assignment.
This error can be confusing because `=` looks like a comparison in natural language,
but it's actually assignment. Also, Mindustry won't report the line number for this error.
*/
let warning = (true == 'false'); // true — after type coercion, both true and 'false' become true

let isStrictEqual = (10 === "10"); // false — === is strict, no type coercion
let isNotEqual = (10 != "10"); // false — != is not strict, performs type coercion
let isStrictNotEqual = (10 !== "10"); // true — !== is strict
let isGreater = (10 > 5); // true
let isLess = (10 < 5); // false
let isGreaterOrEqual = (10 >= 10); // true — don't write 10 => 10; remember: greater-than sign first, then equals sign
let isLessOrEqual = (10 <= 5); // false
```

- **Logical Operators**: `&&` (AND), `||` (OR), `!` (NOT), etc. Example:

```javascript
let isTrue = true && true; // true
let isFalse = true && false; // false
let isEitherTrue = true || false; // true
let isNeitherTrue = false || false; // false
let isNotTrue = !true; // false
let isNotFalse = !false; // true
```

- **Assignment Operators**: `=`, `+=`, `-=`, `*=`, `/=`, `%=`, etc. Example:

```javascript
let x = 10; // Assignment
x += 5; // x is now 15, same as x = x + 5
x -= 3; // x is now 12, same as x = x - 3
x *= 2; // x is now 24, same as x = x * 2
x /= 4; // x is now 6, same as x = x / 4
x %= 4; // x is now 2, same as x = x % 4
```

- **Other Operators**: There are also ternary operator `? :`, bitwise operators `&`, `|`, `^`, `~`, `<<`, `>>`, `>>>`, and special operators like `typeof`, `instanceof`, `in`, etc. These are useful in certain situations but not commonly needed in Mindustry scripts, so we won't cover them in depth here.

### if and for Statements

- **Conditional Statements**: `if`, `else if`, `else`, etc. Example:

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

- **Loop Statements**: There are `for`, `while`, `do...while`, etc.

For most Mindustry scripts, `for` loops are usually sufficient; other loop types are rarely used.

```javascript
// for loop syntax: for (initialization; condition; update) { code block }
// This is from a Mindustry script's unit draw() method — it uses a for loop to draw rotating arcs
for (let i = 0; i < 3; i++) {
    let rot = i * 360 / 3 + Time.time * 1;
    Lines.arc(unit.x, unit.y, range, 0.15, rot);
}

// Without a for loop, you'd need to write three nearly identical lines — verbose and hard to maintain

Lines.arc(unit.x, unit.y, range, 0.15, 0 + Time.time * 1);
Lines.arc(unit.x, unit.y, range, 0.15, 120 + Time.time * 1);
Lines.arc(unit.x, unit.y, range, 0.15, 240 + Time.time * 1);

// for loops can also batch-create objects, e.g. multiple DrawParts in a Mindustry script
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
// This code creates three parts with different moveX, moveY, moveRot values based on `i`.
// Without a for loop, you'd need three nearly identical blocks of code.

// You can also use for loops to iterate over arrays or object properties:
let numbers = [1, 2, 3, 4, 5];
for (let i = 0; i < numbers.length; i++) {
    console.log(numbers[i]);
}

// for...of or for...in loops are usually more concise for array iteration:
let numbers = [1, 2, 3, 4, 5];
for (let number of numbers) {
    console.log(number);
}

for (let index in numbers) {
    console.log(numbers[index]);
}

// Note: for...of gets the array elements directly, while for...in gets the indices
```

The above covers some basic JavaScript syntax rules. If you think you understand, try the mini-quiz below:

```javascript

// 1. Declare a variable and assign it a string value.

// 2. Predict the output of the following code:
//(1)
console.log(10 == '10');
//(2) 
console.log(10 === '10');
//(3)
console.log(true == 'false');
//(4)
console.log(10 > 5 && 5 > 3);
//(5)
console.log(10 > 5 || 5 < 3);
//(6)
console.log(10 % 3);

//(7)
let x = 1;
for (let i = 1; i < 6; i++) {
    x *= i;
}
console.log(x);

//(8)
let numbers = [1, 2, 3, 4, 5];
for (let i = 1; i < 5; i++) {
    console.log(numbers[i]);
}

// 3. Find and fix the errors in the following code snippets:

// Error code 1 

// Assume `a` has been declared and assigned a value
if (a => 5) {
    console.log("a is greater than 5");
} else if (a = 5) {
    console.log("a is equal to 5");
} else {
    console.log("a is less than 5");
}

// Error code 2
let switch = false;
if (switch) {
    console.log("The switch is on");
} else {
    console.log("The switch is off");
}


```

Reference answers:

```javascript

// 1. Declare a variable and assign it a string value.
let name = "Mindustry";

// 2. Predict the output:
//(1) true — == is not strict, performs type coercion
//(2) false — === is strict, no type coercion
//(3) true — after type coercion, both true and 'false' become true
//(4) true — 10 > 5 is true, 5 > 3 is true, so true && true is true
//(5) true — 10 > 5 is true, 5 < 3 is false, so true || false is true
//(6) 1 — 10 % 3 equals 1
//(7) 120 — 1 * 1 = 1, 1 * 2 = 2, 2 * 3 = 6, 6 * 4 = 24, 24 * 5 = 120
//(8) 2, 3, 4, 5 — array indices start at 0, so numbers[1] is 2, numbers[2] is 3, numbers[3] is 4, numbers[4] is 5

// 3. Find and fix errors:
// Error code 1

if (a >= 5) { // Error 1: => is a syntax error, should be >=
    console.log("a is bigger than 5");
} else if (a == 5) { // Error 2: = is assignment, should be ==
    console.log("a is equal to 5");
} else {
    console.log("a is less than 5");
}
// Also a design issue: regardless of the value of a, the fixed code will only print "a is bigger than 5" or "a is less than 5", because a >= 5 already covers a == 5.


// Error code 2
let switch = false; // switch is a JavaScript reserved word and cannot be used as a variable name

// Fixed code
let isSwitchOn = false; // Renamed to isSwitchOn to avoid using a reserved word
```
