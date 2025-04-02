ContentParser是原版json解析中重要的一环，由于json本身的各种限制，诸如requirements、consume等无法写出，这就需要解析器来帮助我们把json专用语法转换为java内容。

| Json | Java |
| --- | --- |
| Number<br/>String<br/>Object<br/>List<br/>Bool | Int, Float<br/>String, Object, Int<br/>Object<br/>ArrayList, ObjectMap, Seq<br/>Boolean |




**<font style="color:#CF1322;background-color:#E4F7D2;">温馨提示：请跳过任何一个你看不懂的字，专注于你能看懂的，如果想看懂，可以考虑去学java。</font>**

**<font style="color:#CF1322;background-color:#E4F7D2;">本文已完结</font>**

## 字段声明
```java
@SuppressWarnings("unchecked")
    public class ContentParser{
        private static final boolean ignoreUnknownFields = true;
        ObjectMap<Class<?>, ContentType> contentTypes = new ObjectMap<>();
        ObjectSet<Class<?>> implicitNullable = ObjectSet.with(TextureRegion.class, TextureRegion[].class, TextureRegion[][].class, TextureRegion[][][].class);
        ObjectMap<String, AssetDescriptor<?>> sounds = new ObjectMap<>();
        Seq<ParseListener> listeners = new Seq<>();

```

这里定义了ignoreUnknownFields字段，正如其名，意思是“忽略未知字段”，其余ObjectMap和ObjectSet可先忽略。

## ClassParsers 字段解析
classParsers的作用是建立类与解析办法的一一对应，由具体的读取json文件的方法调用，所以在这个文件里我们需要建立起需要的类与解析办法的一一对应。具体调用时，先判断此Map中是否含有所需要的类，在读取出对应值这个lambda，然后传入type和jsonData调用lambda以获取结果。



需要注意的是，给这个lambda传的参数不一定是Json的值，可能已经经过处理。另一种可能是，lambda要求字符串，但json值却是字符串列表，这个时候主体解析部分编写得当也可以奏效。

```java
put(Effect.class, (type, data) -> {
    if(data.isString()){
        return field(Fx.class, data);
    }
    if(data.isArray()){
        return new MultiEffect(parser.readValue(Effect[].class, data));
    }
    Class<? extends Effect> bc = resolve(data.getString("type", ""), ParticleEffect.class);
    data.remove("type");
    Effect result = make(bc);
    readFields(result, data);
    return result;
});
```

这是对于Effect类（特效）的识别，在json的预期写法中（下称**json中**，其实anuke本人并不写json但他会制定语法规则），effect相关的键名（比如hitEffect、idleEffect、craftEffect）可能传来的是一个字符串、一个列表或一个对象：

+ 对于字符串，如第3行，返回的是content/Fx.java中同名的特效；
+ 对于列表，如第6行，返回的是一个由列表内全部特效组成的一个综合特效（MultiEffect）
+ 如果都不是，说明这是一个**由大括号括起来的**对象：**对付json对象第一步是看他的type**，第8行，试图获取对象中type的值，如果没有type的话就默认值"ParticleEffect"（需要注意的是，前方的Class<? extends Effect>代表：这个对象到底是什么类（type）还没定下来，但是必须确保它继承于Effect，不继承就抛Error不让你进游戏）；第9行，从整个数据中剔出type；第10行，把这个json对象转换成java实例、赋值给result；第11行，把剩余字段添加到result身上；第12行返回result。

```java
put(Sortf.class, (type, data) -> field(UnitSorts.class, data));
put(Interp.class, (type, data) -> field(Interp.class, data));
put(Blending.class, (type, data) -> field(Blending.class, data));
put(CacheLayer.class, (type, data) -> field(CacheLayer.class, data));
```

这四个东西分别是单位排序、插补、混合、缓存层。总体来说无用。

```java
put(Attribute.class, (type, data) -> Attribute.get(data.asString()));
```

这是对Attribute类（地板属性）的识别，因为Attribute已经为我们封装好了get方法，直接调用即可。

```java
put(Schematic.class, (type, data) -> {
    Object result = fieldOpt(Loadouts.class, data);
    if(result != null){
        return result;
    }else{
        String str = data.asString();
        if(str.startsWith(Vars.schematicBaseStart)){
            return Schematics.readBase64(str);
        }else{
            return Schematics.read(Vars.tree.get("schematics/" + str + "." + Vars.schematicExtension));
        }
    }
});
```

这是对Schematics类（蓝图）的识别，在json中，~~截至目前毫无用处。~~唯一在小行星生成器被用到。

```java
put(Color.class, (type, data) -> Color.valueOf(data.asString()));
```

这是对Color类（颜色）的识别。原版所有需要颜色的地方在json传入的都是六位或八位十六进制色，这里使用了Color的valueOf方法来返回一个颜色的对象。

```java
put(StatusEffect.class, (type, data) -> {
    if(data.isString()){
        StatusEffect result = locate(ContentType.status, data.asString());
        if(result != null) return result;
        throw new IllegalArgumentException("Unknown status effect: '" + data.asString() + "'");
    }
    StatusEffect effect = new StatusEffect(currentMod.name + "-" + data.getString("name"));
    effect.minfo.mod = currentMod;
    readFields(effect, data);
    return effect;
});
```

这是对StatusEffect类（状态效果）的识别。在json中，和buff有关的键可能传来字符串或对象。

+ 如果传来字符串，那么说明这个是游戏已有的buff，那么我们就需要从原版或模组，总之类型是StatusEffect的东西中定位出一个。如寻找到了直接返回，没找到就直接报错。
+ 如果传来对象，那说明这个是玩家自定义的，那么就创建对象并读取字段赋值再返回。

```java
put(UnitCommand.class, (type, data) -> {
            if(data.isString()){
               var cmd = UnitCommand.all.find(u -> u.name.equals(data.asString()));
               if(cmd != null){
                   return cmd;
               }else{
                   throw new IllegalArgumentException("Unknown unit command name: " + data.asString());
               }
            }else{
                throw new IllegalArgumentException("Unit commands must be strings.");
            }
        });
```

这里是对UnitCommand类（单位RTS命令）的识别，在json中要求传来一个字符串。作为137新添加的代码，要求十分严格，找不到或不是字符串都会报错。

```java
put(BulletType.class, (type, data) -> {
    if(data.isString()){
        return field(Bullets.class, data);
    }
    Class<?> bc = resolve(data.getString("type", ""), BasicBulletType.class);
data.remove("type");
BulletType result = (BulletType)make(bc);
readFields(result, data);
return result;
});
```

这是对BulletType类（子弹类型）的识别。

+ 当传来字符串时，返回一个与参数同名的对象，且字段全部默认
+ 当传来对象时，先找到type字段，有则在BulletType中寻找，找不到则默认设置BasicBulletType，之后按照字段解析出对象返回。

```java
put(AmmoType.class, (type, data) -> {
    //string -> item
    //if liquid ammo support is added, this should scan for liquids as well
    if(data.isString()) return new ItemAmmoType(find(ContentType.item, data.asString()));
    //number -> power
    if(data.isNumber()) return new PowerAmmoType(data.asFloat());

    var bc = resolve(data.getString("type", ""), ItemAmmoType.class);
    data.remove("type");
    AmmoType result = make(bc);
    readFields(result, data);
    r
```

这是对AmmoType类（弹药类型）的识别。

+ 字符串解析成物品或流体；
+ 数字解析成电力；
+ 对象则提取type创建对象提取字段进行赋值并返回。

```java
put(DrawBlock.class, (type, data) -> {
    if(data.isString()){
        //try to instantiate
        return make(resolve(data.asString()));
    }
    //array is shorthand for DrawMulti
    if(data.isArray()){
        return new DrawMulti(parser.readValue(DrawBlock[].class, data));
    }
    var bc = resolve(data.getString("type", ""), DrawDefault.class);
    data.remove("type");
    DrawBlock result = make(bc);
    readFields(result, data);
    return result;
});
```

这是对DrawBlock类（方块绘制）的识别。

+ 字符串则使用同名DrawBlock；
+ 列表则使用DrawMulti括起来；
+ 对象则提取type创建对象提取字段进行赋值并返回。

```java
put(ShootPattern.class, (type, data) -> {
    var bc = resolve(data.getString("type", ""), ShootPattern.class);
    data.remove("type");
    var result = make(bc);
    readFields(result, data);
    return result;
    });
put(DrawPart.class, (type, data) -> {
    Class<?> bc = resolve(data.getString("type", ""), RegionPart.class);
    data.remove("type");
    var result = make(bc);
    readFields(result, data);
    return result;
    });
```

这两个同理，提取type-创建对象-提取字段-进行赋值并返回。

```java
//TODO this is untested
put(PartProgress.class, (type, data) -> {
    //simple case: it's a string or number constant
    if(data.isString()) return field(PartProgress.class, data.asString());
    if(data.isNumber()) return PartProgress.constant(data.asFloat());

    if(!data.has("type")){
        throw new RuntimeException("PartProgress object need a 'type' string field. Check the PartProgress class for a list of constants.");
    }

    PartProgress base = (PartProgress)field(PartProgress.class, data.getString("type"));

    JsonValue opval =
        data.has("operation") ? data.get("operation") :
        data.has("op") ? data.get("op") : null;

    //no operations I guess (why would you do this?)
    if(opval == null){
        return base;
    }

    //this is the name of the method to call
    String op = opval.asString();

    //I have to hard-code this, no easy way of getting parameter names, unfortunately
    return switch(op){
        case "inv" -> base.inv();
        case "slope" -> base.slope();
        case "clamp" -> base.clamp();
        case "delay" -> base.delay(data.getFloat("amount"));
        case "sustain" -> base.sustain(data.getFloat("offset", 0f), data.getFloat("grow", 0f), data.getFloat("sustain"));
        case "shorten" -> base.shorten(data.getFloat("amount"));
        case "add" -> data.has("amount") ? base.add(data.getFloat("amount")) : base.add(parser.readValue(PartProgress.class, data.get("other")));
            case "blend" -> base.blend(parser.readValue(PartProgress.class, data.get("other")), data.getFloat("amount"));
            case "mul" -> base.mul(parser.readValue(PartProgress.class, data.get("other")));
            case "min" -> base.min(parser.readValue(PartProgress.class, data.get("other")));
            case "sin" -> base.sin(data.getFloat("scl"), data.getFloat("mag"));
            case "absin" -> base.absin(data.getFloat("scl"), data.getFloat("mag"));
            case "curve" -> base.curve(parser.readValue(Interp.class, data.get("interp")));
            default -> throw new RuntimeException("Unknown operation '" + op + "', check PartProgress class for a list of methods.");
            };
            });
```

这个东西我不知道是什么，我也不知道怎么用，也不知道谁知道。总之写了这么多好像json并用不了的样子。

```java
put(PlanetGenerator.class, (type, data) -> {
    var result = new AsteroidGenerator(); //only one type for now
    readFields(result, data);
    return result;
});
```

这是对PlanerGenerator类（行星地图生成器）的识别。目前凡是json中，这个类一律返回AsteroidGenerator（小行星）。~~所以写星球就别想了~~

```java
put(GenericMesh.class, (type, data) -> {
    if(!data.isObject()) throw new RuntimeException("Meshes must be objects.");
    if(!(currentContent instanceof Planet planet)) throw new RuntimeException("Meshes can only be parsed as parts of planets.");

    String tname = Strings.capitalize(data.getString("type", "NoiseMesh"));

    return switch(tname){
            //TODO NoiseMesh is bad
        case "NoiseMesh" -> new NoiseMesh(planet,
                                          data.getInt("seed", 0), data.getInt("divisions", 1), data.getFloat("radius", 1f),
                                          data.getInt("octaves", 1), data.getFloat("persistence", 0.5f), data.getFloat("scale", 1f), data.getFloat("mag", 0.5f),
                                          Color.valueOf(data.getString("color1", data.getString("color", "ffffff"))),
                                          Color.valueOf(data.getString("color2", data.getString("color", "ffffff"))),
                                          data.getInt("colorOct", 1), data.getFloat("colorPersistence", 0.5f), data.getFloat("colorScale", 1f),
                                          data.getFloat("colorThreshold", 0.5f));
        case "MultiMesh" -> new MultiMesh(parser.readValue(GenericMesh[].class, data.get("meshes")));
        case "MatMesh" -> new MatMesh(parser.readValue(GenericMesh.class, data.get("mesh")), parser.readValue(Mat3D.class, data.get("mat")));
        default -> throw new RuntimeException("Unknown mesh type: " + tname);
    };
});
```

这是Mesh，是行星云层和地面六边形的绘制器。~~别看了别看了~~

```java
put(Mat3D.class, (type, data) -> {
    if(data == null) return new Mat3D();

    //transform x y z format
    if(data.has("x") && data.has("y") && data.has("z")){
        return new Mat3D().translate(data.getFloat("x", 0f), data.getFloat("y", 0f), data.getFloat("z", 0f));
    }

    //transform array format
    if(data.isArray() && data.size == 3){
        return new Mat3D().setToTranslation(new Vec3(data.asFloatArray()));
    }

    Mat3D mat = new Mat3D();

    //TODO this is kinda bad
    for(var val : data){
        switch(val.name){
            case "translate", "trans" -> mat.translate(parser.readValue(Vec3.class, data));
            case "scale", "scl" -> mat.scale(parser.readValue(Vec3.class, data));
            case "rotate", "rot" -> mat.rotate(parser.readValue(Vec3.class, data), data.getFloat("degrees", 0f));
            case "multiply", "mul" -> mat.mul(parser.readValue(Mat3D.class, data));
    case "x", "y", "z" -> {}
    default -> throw new RuntimeException("Unknown matrix transformation: '" + val.name + "'");
    }
    }

    return mat;
    });
```

这是Mat3（Martix3D）三维矩阵，和刚才Mesh的MatMesh是配套的。~~当你在凝视深渊的时候，深渊也在凝视着你~~

```java
put(Vec3.class, (type, data) -> {
    if(data.isArray()) return new Vec3(data.asFloatArray());
    return new Vec3(data.getFloat("x", 0f), data.getFloat("y", 0f), data.getFloat("z", 0f));
});
```

这是Vec3（Vector3）三维矢量，和刚才Mat3是配套的。~~不然他为什么不解析Vec2~~

```java
put(Sound.class, (type, data) -> {
    if(fieldOpt(Sounds.class, data) != null) return fieldOpt(Sounds.class, data);
    if(Vars.headless) return new Sound();

    String name = "sounds/" + data.asString();
    String path = Vars.tree.get(name + ".ogg").exists() ? name + ".ogg" : name + ".mp3";

    if(sounds.containsKey(path)) return ((SoundParameter)sounds.get(path).params).sound;
    var sound = new Sound();
    AssetDescriptor<?> desc = Core.assets.load(path, Sound.class, new SoundParameter(sound));
    desc.errored = Throwable::printStackTrace;
    sounds.put(path, desc);
    return sound;
});
```

这是Sound类（音效）的识别。首先他一定传来一个字符串。

+ Sounds类里能找到，说明这是游戏内建音效，直接返回即可；
+ 游戏无头（headless），说明正运行在一个无需播放音效的**服务器**上，返回一个空音效；
+ 下面则是在模组文件夹内寻找。name代表这个音效如果是本模组添加则应处于的位置，path则是同名音效位置。两个值之间进行“**包含**”比较。（因为音效既可以是ogg也可以是mp3，所以我们要让~/mods/my-mod/sounds/114.ogg和~/mods/my-mod/sounds/114.mp3都可以被匹配到音效114）

```java
put(Objectives.Objective.class, (type, data) -> {
    if(data.isString()){
        var cont = locateAny(data.asString());
        if(cont == null) throw new IllegalArgumentException("Unknown objective content: " + data.asString());
        return new Research((UnlockableContent)cont);
    }
    var oc = resolve(data.getString("type", ""), SectorComplete.class);
    data.remove("type");
    Objectives.Objective obj = make(oc);
    readFields(obj, data);
    return obj;
});
```



这是对Objectives.Objective类（研究额外需求）的识别。

+ 如果传进来一个字符串，意思就是要求研究的额外需求是研究此内容。这个内容可能是五大类任意一个（物品/流体/方块/单位/行星），所以要定位原版所有内容。
+ 如果传进来一个对象，那就提取type-创建对象-提取字段-进行赋值并返回。

```java
put(Ability.class, (type, data) -> {
    Class<? extends Ability> oc = resolve(data.getString("type", ""));
    data.remove("type");
    Ability obj = make(oc);
    readFields(obj, data);
    return obj;
});
```

这是提取type-创建对象-提取字段-进行赋值并返回。

```java
put(Weapon.class, (type, data) -> {
    var oc = resolve(data.getString("type", ""), Weapon.class);
    data.remove("type");
    var weapon = make(oc);
    readFields(weapon, data);
    weapon.name = currentMod.name + "-" + weapon.name;
    return weapon;
});
```

这是提取type-创建对象-提取字段-进行赋值并返回，但在返回前会在name前加上mod的name以正确调用贴图。

## 再次的字段与方法声明
```java
/** Stores things that need to be parsed fully, e.g. reading fields of content.
* This is done to accommodate binding of content names first.*/
private Seq<Runnable> reads = new Seq<>();
private Seq<Runnable> postreads = new Seq<>();
private ObjectSet<Object> toBeParsed = new ObjectSet<>();

LoadedMod currentMod;
Content currentContent;

```

## Parser 写法转换
```java
private Json parser = new Json(){
```

写法转换，而与其他不同的是，在json中的写法没有完全表示出java的半点痕迹，完完全全新开创的写法。

```java
@Override
    public <T> T readValue(Class<T> type, Class elementType, JsonValue jsonData, Class keyType){
    T t = internalRead(type, elementType, jsonData, keyType);
    if(t != null && !Reflect.isWrapper(t.getClass()) && (type == null || !type.isPrimitive())){
        checkNullFields(t);
        listeners.each(hook -> hook.parsed(type, jsonData, t));
    }
    return t;
}
```

这是json读取值的方法，这里的T都是泛型，Java作为一门强类型语言，必须明确写出方法的返回值以及变量的类型。但在这个使用场景，我们不知道返回的是一个PlanetGenerator还是一个BasicBulletType，所以我们使用到了泛型，他的意思是指在编写时不指定类型。不过要注意的是，java的泛型实则是把每一种可能都写一遍。

```java
private <T> T internalRead(Class<T> type, Class elementType, JsonValue jsonData, Class keyType){
    if(type != null){
        if(classParsers.containsKey(type)){
            try{
                return (T)classParsers.get(type).parse(type, jsonData);
            }catch(Exception e){
                throw new RuntimeException(e);
            }
        }
```

这个就是真正的解析了，传进来一个json值和他预期的类（type）。这是第一段，判断type在classParsers里有没有，有就直接调用里面的解析并返回，如果执行出现问题就扔错误。

```java
if((type == int.class || type == Integer.class) && jsonData.isArray()){
    int value = 0;
    for(var str : jsonData){
        if(!str.isString()) throw new SerializationException("Integer bitfield values must all be strings. Found: " + str);
        String field = str.asString();
        value |= Reflect.<Integer>get(Env.class, field);
    }

    return (T)(Integer)value;
}
```

这是第二段，假如classParsers没有，那我们还有一些额外的int、ItemStack、LiquidStack、ConsumeLiquid的解析，他们有种种原因没能塞进classParser，所以来这里额外处理。

这里是对Env类（环境）的转数字。Env是游戏采用位运算一个很巧妙的例子。每一种env都是2的幂，通过或运算算出当前环境的类型。再通过与、异或运算来计算envEnable和envDisable。

源代码如下：

```java
/** Environmental flags for different types of locations. */
public class Env{
    public static final int
    //is on a planet
    terrestrial = 1,
    //is in space, no atmosphere
    space = 1 << 1,
    //is underwater, on a planet
    underwater = 1 << 2,
    //has a spores
    spores = 1 << 3,
    //has a scorching env effect
    scorching = 1 << 4,
    //has oil reservoirs
    groundOil = 1 << 5,
    //has water reservoirs
    groundWater = 1 << 6,
    //has oxygen in the atmosphere
    oxygen = 1 << 7,
    //all attributes combined, only used for bitmasking purposes
    any = 0xffffffff,
    //no attributes (0)
    none = 0;
}
```

例如当前环境在行星上且有孢子，符合terrestrial和spore，那么我们就对00000001和00001000做或运算，得到00001001，就是当前的环境值。假如有物品要求在孢子环境才能运作（即envEnable=8），那么工作原理就是(环境值&8)不为零。

在json中，**我们可以把字符串列表转为正整数**_（可能你以为我表达不严谨，但是确实是任何情况下均可以这么转换）_，解析就是用增强for逐个累加。

```java
//try to parse "item/amount" syntax
if(type == ItemStack.class && jsonData.isString() && jsonData.asString().contains("/")){
    String[] split = jsonData.asString().split("/");

    return (T)fromJson(ItemStack.class, "{item: " + split[0] + ", amount: " + split[1] + "}");
}
```

这是对ItemStack的转写。注意判断条件是预计type必须为ItemStack。处理方式就是按斜杠分割，第一项塞进item，第二项塞进amount。

```java
//try to parse "liquid/amount" syntax
if(jsonData.isString() && jsonData.asString().contains("/")){
    String[] split = jsonData.asString().split("/");
    if(type == LiquidStack.class){
        return (T)fromJson(LiquidStack.class, "{liquid: " + split[0] + ", amount: " + split[1] + "}");
    }else if(type == ConsumeLiquid.class){
        return (T)fromJson(ConsumeLiquid.class, "{liquid: " + split[0] + ", amount: " + split[1] + "}");
    }
}
```

这是对截止到最后仍然没有解析并且含有斜杠的转写，有斜杠就先分割，在判断是LiquidStack还是ConsumeLiquid，然后把分割结果分别加到liquid和amount后。

```java
if(Content.class.isAssignableFrom(type)){
    ContentType ctype = contentTypes.getThrow(type, () -> new IllegalArgumentException("No content type for class: " + type.getSimpleName()));
    String prefix = currentMod != null ? currentMod.name + "-" : "";
    T one = (T)Vars.content.getByName(ctype, prefix + jsonData.asString());
    if(one != null) return one;
    T two = (T)Vars.content.getByName(ctype, jsonData.asString());

    if(two != null) return two;
    throw new IllegalArgumentException("\"" + jsonData.name + "\": No " + ctype + " found with name '" + jsonData.asString() + "'.\nMake sure '" + jsonData.asString() + "' is spelled correctly, and that it really exists!\nThis may also occur because its file failed to parse.");
}
}

return super.readValue(type, elementType, jsonData, keyType);
}
};
```

如果到这一步还没return走，说明要么type是假的，要么某些内容不存在。2行代码会尝试从ContentType枚举找这个type，如果没有就报“没有这个类”的错误。如果存在，说明问题只有东西找不到，然后尝试加模组名前缀和不加两次获取，再找不到，只能报错“内容找不到”了。

## Parsers 八大类解析
```java
private ObjectMap<ContentType, TypeParser<?>> parsers = ObjectMap.of(
```

一种内容基本类型，一个解析lambda。

### 方块 block
```java
ContentType.block, (TypeParser<Block>)(mod, name, value) -> {
    readBundle(ContentType.block, name, value);

    Block block;

    if(locate(ContentType.block, name) != null){
        if(value.has("type")){
            Log.warn("Warning: '" + currentMod.name + "-" + name + "' re-declares a type. This will be interpreted as a new block. If you wish to override a vanilla block, omit the 'type' section, as vanilla block `type`s cannot be changed.");
            block = make(resolve(value.getString("type", ""), Block.class), mod + "-" + name);
        }else{
            block = locate(ContentType.block, name);
        }
    }else{
        block = make(resolve(value.getString("type", ""), Block.class), mod + "-" + name);
    }
```

第一步自然是读取bundle，这个方法稍后即可见到。第二步则是个双层if，我们来逐层分析。

第一层判断的是是否是原版已有方块：

+ 如果不是就读取type创建对象；
+ 如果是，继续判断是否有type：如果有，警告“含有type字段则会创建新方块”并创建新对象；如果没有，就视为对这个方块进行增改操作。

```java
currentContent = block;

read(() -> {
    if(value.has("consumes") && value.get("consumes").isObject()){
        for(JsonValue child : value.get("consumes")){
            switch(child.name){
                case "item" -> block.consumeItem(find(ContentType.item, child.asString()));
                case "itemCharged" -> block.consume((Consume)parser.readValue(ConsumeItemCharged.class, child));
                case "itemFlammable" -> block.consume((Consume)parser.readValue(ConsumeItemFlammable.class, child));
                case "itemRadioactive" -> block.consume((Consume)parser.readValue(ConsumeItemRadioactive.class, child));
                case "itemExplosive" -> block.consume((Consume)parser.readValue(ConsumeItemExplosive.class, child));
                case "itemExplode" -> block.consume((Consume)parser.readValue(ConsumeItemExplode.class, child));
                case "items" -> block.consume(child.isArray() ?
                    new ConsumeItems(parser.readValue(ItemStack[].class, child)) :
                    parser.readValue(ConsumeItems.class, child));
                case "liquidFlammable" -> block.consume((Consume)parser.readValue(ConsumeLiquidFlammable.class, child));
                case "liquid" -> block.consume((Consume)parser.readValue(ConsumeLiquid.class, child));
                case "liquids" -> block.consume(child.isArray() ?
                    new ConsumeLiquids(parser.readValue(LiquidStack[].class, child)) :
                    parser.readValue(ConsumeLiquids.class, child));
                case "coolant" -> block.consume((Consume)parser.readValue(ConsumeCoolant.class, child));
                case "power" -> {
                    if(child.isNumber()){
                    block.consumePower(child.asFloat());
                    }else{
                    block.consume((Consume)parser.readValue(ConsumePower.class, child));
                    }
                    }
                case "powerBuffered" -> block.consumePowerBuffered(child.asFloat());
                default -> throw new IllegalArgumentException("Unknown consumption type: '" + child.name + "' for block '" + block.name + "'.");
                }
            }
            value.remove("consumes");
         }

```

第三步是个大switch，这里是对consumes的解析。首先试图读取consumes字段并判断是否为对象（即大括号括起来者）。然后，逐次解析键值对。

+ item：即为单个物品，会从Items找到同名实例并consumeItem；
+ itemCharged itemFlammable itemRadioactive itemExplosive itemExplode liquidFlammable：即为与物品/流体的同名属性，往发电机的consumes放这个会很有用；
+ items：正规的多个物品，如果为列表那么读取每一项的值，如果不是就读他自己即可；
+ liquid/liquids同item/items
+ power：如果为数字就是普普通通的消耗电力，但也可以赋值对象；
+ poweeBuffered：电量缓存。

```java
readFields(block, value, true);

if(block.size > maxBlockSize){
    throw new IllegalArgumentException("Blocks cannot be larger than " + maxBlockSize);
}

```

超过最大尺寸就报错（最大尺寸为16）

```java
if(value.has("requirements") && block.buildVisibility == BuildVisibility.hidden){
    block.buildVisibility = BuildVisibility.shown;
}
});

return block;
},
```

从136起默认方块处于隐藏状态，所以要么设置requirements，要么设置buildVisibility。最后处理完毕，返回。

### 单位 unit
```java
ContentType.unit, (TypeParser<UnitType>)(mod, name, value) -> {
    readBundle(ContentType.unit, name, value);

               UnitType unit;
               if(locate(ContentType.unit, name) == null){

               unit = make(resolve(value.getString("template", ""), UnitType.class), mod + "-" + name);
```

先读取bundle，再创建对象。

```java
if(value.has("template")){
    value.remove("template");
}

var typeVal = value.get("type");

if(typeVal != null && !typeVal.isString()){
    throw new RuntimeException("Unit '" + name + "' has an incorrect type. Types must be strings.");
}

unit.constructor = unitType(typeVal);
}else{
    unit = locate(ContentType.unit, name);
}
```

虽然查看了templete，但是旋即又给删了。实际上解析的还是type。先检测是否为空和是否为字符串，再处理constructor，注意这里unitType时下文一个方法。

这个else是上面的locate的，如果检测到了则把读取字段的目标设置为找到的同名单位。

```java
currentContent = unit;
//TODO test this!
read(() -> {
    //add reconstructor type
    if(value.has("requirements")){
        JsonValue rec = value.remove("requirements");

        UnitReq req = parser.readValue(UnitReq.class, rec);

        if(req.block instanceof Reconstructor r){
            if(req.previous != null){
                r.upgrades.add(new UnitType[]{req.previous, unit});
            }
        }else if(req.block instanceof UnitFactory f){
            f.plans.add(new UnitPlan(unit, req.time, req.requirements));
        }else{
            throw new IllegalArgumentException("Missing a valid 'block' in 'requirements'");
        }
```

anuke本人都说未经测试，所以就忽略吧。rec是requirements的json值，然后转换为req对象。req的一个属性block是重构工厂或兵工厂，若为重构工厂再读previous（前代），有就加配方，兵工厂直接加配方，否则，报错。

```java
if(value.has("controller") || value.has("aiController")){
    unit.aiController = supply(resolve(value.getString("controller", value.getString("aiController", "")), FlyingAI.class));
    value.remove("controller");
}

if(value.has("defaultController")){
    var sup = supply(resolve(value.getString("defaultController"), FlyingAI.class));
    unit.controller = u -> sup.get();
    value.remove("defaultController");
}
```

这是ai相关的解析，游戏会读取controller或aiController来应用ai。defaulrController因为lambda所以也要解析。

```java
//read extra default waves
if(value.has("waves")){
    JsonValue waves = value.remove("waves");
    SpawnGroup[] groups = parser.readValue(SpawnGroup[].class, waves);
    for(SpawnGroup group : groups){
        group.type = unit;
    }

    Vars.waves.get().addAll(groups);
}

readFields(unit, value, true);
});

return unit;
},
```

这个是对怪物生成的解析，也没什么用。

### 天气 weather
```java
ContentType.weather, (TypeParser<Weather>)(mod, name, value) -> {
    Weather item;
    if(locate(ContentType.weather, name) != null){
        item = locate(ContentType.weather, name);
        readBundle(ContentType.weather, name, value);
    }else{
        readBundle(ContentType.weather, name, value);
        item = make(resolve(getType(value), ParticleWeather.class), mod + "-" + name);
        value.remove("type");
    }
    currentContent = item;
    read(() -> readFields(item, value));
    return item;
},
```

判断已有，生成对象并赋值。

### 物品 item
```java
ContentType.item, parser(ContentType.item, Item::new),
```

物品直接新建一个

### 流体 liquid
```java
ContentType.liquid, (TypeParser<Liquid>)(mod, name, value) -> {
    Liquid liquid;
    if(locate(ContentType.liquid, name) != null){
        liquid = locate(ContentType.liquid, name);
        readBundle(ContentType.liquid, name, value);
    }else{
        readBundle(ContentType.liquid, name, value);
        liquid = make(resolve(value.getString("type", null), Liquid.class), mod + "-" + name);
        value.remove("type");
    }
    currentContent = liquid;
    read(() -> readFields(liquid, value));
    return liquid;
},
```

判断已有，生成对象并赋值。

### 状态效果 status
```java
ContentType.status, parser(ContentType.status, StatusEffect::new),
```

状态效果也直接新建

### 区块 sector
```java
ContentType.sector, (TypeParser<SectorPreset>)(mod, name, value) -> {
    if(value.isString()){
        return locate(ContentType.sector, name);
    }

    if(!value.has("sector") || !value.get("sector").isNumber()) throw new RuntimeException("SectorPresets must have a sector number.");

    SectorPreset out = new SectorPreset(name, locate(ContentType.planet, value.getString("planet", "serpulo")), value.getInt("sector"));
    value.remove("sector");
    value.remove("planet");
    currentContent = out;
    read(() -> readFields(out, value));
    return out;
},
```

先检测sector字段是否存在且为数字，再检测原版覆盖，最后读取字段并返回。

### 行星 planet
```java
ContentType.planet, (TypeParser<Planet>)(mod, name, value) -> {
    if(value.isString()) return locate(ContentType.planet, name);

    Planet parent = locate(ContentType.planet, value.getString("parent"));
    Planet planet = new Planet(name, parent, value.getFloat("radius", 1f), value.getInt("sectorSize", 0));

    if(value.has("mesh")){
        planet.meshLoader = () -> parser.readValue(GenericMesh.class, value.get("mesh"));
    }

    //always one sector right now...
    planet.sectors.add(new Sector(planet, Ptile.empty));

    currentContent = planet;
    read(() -> readFields(planet, value));
    return planet;
}
    );

```

检测parent和sector，赋值对象返回。



