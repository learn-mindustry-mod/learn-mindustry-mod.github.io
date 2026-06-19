# JavaScript in the Mindustry Environment

Starting from this section, we'll cover some special syntax and environment-specific knowledge you need to know when writing mods in JavaScript for Mindustry. This content may not apply to other JavaScript environments, but it's essential for writing Mindustry mods. We'll introduce some Mindustry-specific global objects, functions, common programming patterns, and tips.

## The main.js File and the require() Function

In Mindustry, JS files go in the `scripts/` directory, which sits alongside the JSON `content/` directory. Mindustry only recognizes and loads your `main.js` file. Technically you could write all your code in this single file, but that's generally not recommended.

You can create other JS files in the `scripts/` directory to organize your code, but these files must be imported via the `require()` function in `main.js` before they can be used.

```javascript
// main.js

require('item'); // Imports scripts/item.js
require('block/wall'); // Imports scripts/block/wall.js

// The above works for single-mod setups. If you have multiple mods loaded, you need to prefix the path with the mod name to disambiguate:

require('zerg/item'); // Imports scripts/item.js from the "zerg" mod
require('vne/item'); // Imports scripts/item.js from the "vne" (Vanilla Neoplasm Expansion) mod

// If you don't specify the mod name, Mindustry may load the wrong file.
```

## exports

In JavaScript, only global variables/methods (e.g. Mindustry's built-in `print`, `extend`, etc.) can be used across scripts. Variables/methods defined within a script are local and cannot be accessed by other script files. To enable cross-script access, you must explicitly export the variables/methods. In Mindustry, you export by assigning them to the `exports` object. Example:

```javascript
// item.js
const biomassSteel = new Item("biomass-steel", Color.valueOf("7EA341"));
exports.biomassSteel = biomassSteel;
Object.assign(biomassSteel, {
    cost: 2.5,
    healthScaling: 2.2,
})
```

```javascript
// wall.js
const item = require('vne/item');

const biomassWall = new Wall("biomass-wall");
exports.biomassWall = biomassWall;
Object.assign(biomassWall, {
    health: 1200,
    armor: 20,
    size: 1,
    insulated: true,
    absorbLasers: true,
    schematicPriority: 10,
    buildVisibility: BuildVisibility.shown,
    category: Category.defense,
    requirements: ItemStack.with(
    item.biomassSteel, 6, ),
})

```

In the example above, we defined a `biomassSteel` Item object in `item.js` and exported it. In `wall.js`, we imported `item.js` via `require('vne/item')` and accessed the `biomassSteel` object through `exports.biomassSteel`. This lets us use `biomassSteel`'s properties and methods in `wall.js`.

Note that `exports` is a plain JavaScript object — you can define any number of properties and methods in it to export. As long as another script imports the file via `require()`, it can access everything on the `exports` object.

Exporting immediately after declaring a variable is a good habit — it keeps code clear and makes it easy for other scripts to call. You can also assign directly to `exports` at declaration time:

```javascript

exports.biomassSteel = new Item("biomass-steel", Color.valueOf("7EA341"));

```

This is more concise, but you can't modify the variable after declaration, and you can't use it directly within the same file. So the declare-then-export pattern is generally recommended.

## The Object.assign() Method

In the examples above, we used `Object.assign()` to add properties to the `biomassSteel` object. While `Object.assign()` is a built-in JavaScript method (not Mindustry-specific), it's extremely common in Mindustry modding because it conveniently adds properties and methods to objects without repeating the object name. Example:

```javascript
// Without Object.assign()
const biomassSteel = new Item("biomass-steel", Color.valueOf("7EA341"));
biomassSteel.cost = 2.5;
biomassSteel.healthScaling = 2.2;

// With Object.assign()
const biomassSteel = new Item("biomass-steel", Color.valueOf("7EA341"));
Object.assign(biomassSteel, {
    cost: 2.5,
    healthScaling: 2.2,
})
```

The efficiency difference for a few properties is negligible, but when adding many properties and methods to an object, `Object.assign()` reduces code volume, avoids repeating the object name, and keeps code clean.

## The extend() Function

In Mindustry, `extend()` is a very important function. It creates a new object that inherits from an existing class and allows you to add new properties and methods.

However, `extend()` may work differently from inheritance patterns you've seen in other JavaScript environments, so we need to cover it specifically. Example:

```javascript

const acid = extend(Liquid, "acid", Color.valueOf("84a94b"), {
    update(puddle) {
        if (puddle.tile != null && puddle.tile.build != null) {
            puddle.tile.build.damage(0.2)
            
            puddle.amount -= 0.2
            
            if (Mathf.chanceDelta(0.05)) {
                Fx.mineSmall.at(puddle.x, puddle.y)
            }
        }
    },
    effect: StatusEffects.corroded,
    viscosity: 0.8,
    heatCapacity: 0.2,
    temperature: 0.54,
    flammability: 0,
    capPuddles: false,
    coolant: false
});

```

In this example, we used `extend()` to create a new Liquid object `acid` that inherits from the Liquid class and adds new properties and methods. The `update()` method is special — it's called every game tick, so you can write custom liquid behavior inside it.

Note that `extend()` takes a variable number of arguments, but:
- The **first** argument must be a Java class from Mindustry (or another Java mod).
- The **last** argument must be an object literal defining the new object's properties and methods.
- Arguments in between follow the order of the Java class's constructor parameters.

For example:

``` java
// Block class constructor
public Block(String name){}

```

So your `extend()` call would be:

```javascript

const biomassWall = extend(Block, "name", {})

```

For the BulletType class, its constructor is:

``` java

public BulletType(float speed, float damage){
    this.speed = speed;
    this.damage = damage;
}

public BulletType(){}

```

```javascript
// Both of the following are correct. The first is more concise, the second is more explicit — use whichever you prefer.
const acidBullet = extend(BulletType, 0.8, 20, {
    // Properties and methods here
})

const acidBullet = extend(BulletType, {
    speed: 0.8,
    damage: 20,
    // Properties and methods here
})

```

For classes with many constructor parameters, like ShieldRegenFieldAbility:

``` java
public ShieldRegenFieldAbility(){}

public ShieldRegenFieldAbility(float amount, float max, float reload, float range){
    this.amount = amount;
    this.max = max;
    this.reload = reload;
    this.range = range;
}

```

```javascript

// Using an object literal is clearer and easier to modify.
// For classes with many parameters, object literals reduce the burden of remembering parameter order.
const shieldRegenField = extend(ShieldRegenFieldAbility, {
    amount: 0.8,
    max: 20,
    reload: 60,
    range: 40
})

```

## Summary

When writing JS in the Mindustry environment, we need to be aware of some special syntax and environment-specific knowledge. We need to use the `exports` object to export variables and methods, the `require()` function to import other script files, `Object.assign()` to add properties and methods to objects, and `extend()` to create new objects that inherit from existing classes. Mastering these will help you write cleaner, more concise, and more efficient Mindustry mods.

Starting from the next section, we'll break down a simple JS mod and introduce some commonly used Mindustry global objects and functions.

**Homework**: Write a simple mod in JS that includes at least one Item and one Block, where the Block uses your newly created Item as a build requirement. Feel free to share your work and ask questions in the group.
