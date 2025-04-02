# 组件沙盒
## Tabs

:::: tabs 

::: tab apple
Apple
::: 

::: tab "banana" id="banana"
Banana
::: 

::::
::::: tabs 

:::: tab apple
Apple
:::info
Hello
:::
::::

::: tab "banana" id="banana"
banana
::: 

:::::
```markdown
:::: tabs 

::: tab apple
Apple
::: 

::: tab "banana" id="banana"
Banana
::: 

::::
::::: tabs 

:::: tab apple
Apple
:::info
Hello
:::
::::

::: tab "banana" id="banana"
banana
::: 

:::::
```
## GitHubCard
<GitHubCard repo="learn-mindustry-mod/learn-mindustry-mod.github.io"/>
```markdown
<GitHubCard repo="learn-mindustry-mod/learn-mindustry-mod.github.io"/>
```
::: info
<GitHubCard repo="learn-mindustry-mod/learn-mindustry-mod.github.io"/>    
:::
```markdown
::: info
<GitHubCard repo="learn-mindustry-mod/learn-mindustry-mod.github.io"/>
:::
```

:::: tabs :options="{ storageKey: 'system' }"

::: tab "Windows" id="windows"
Windows
::: 

::: tab "Debian/Ubuntu" id="debian"
Debian
::: 

::: tab "ArchLinux" id="arch"
ArchLinux
::: 

::: tab "Termux" id="termux"
Termux
::: 

::::

```markdown
:::: tabs :options="{ storageKey: 'system' }"

::: tab "Windows" id="windows"
Windows
::: 

::: tab "Debian/Ubuntu" id="debian"
Debian
::: 

::: tab "ArchLinux" id="arch"
ArchLinux
::: 

::: tab "Termux" id="termux"
Termux
::: 

::::
```
:::: tabs :options="{ storageKey: 'language' }"

::: tab "Java" id="java"
Java
::: 

::: tab "Kotlin" id="kt"
Kotlin
::: 

::: tab "JavaScript" id="js"
JavaScript
::: 

::: tab "TypeScript" id="ts"
TypeScript
::: 

::::
```markdown
:::: tabs :options="{ storageKey: 'language' }"

::: tab "Java" id="java"
Java
::: 

::: tab "Kotlin" id="kt"
Kotlin
::: 

::: tab "JavaScript" id="js"
JavaScript
::: 

::: tab "TypeScript" id="ts"
TypeScript
::: 

::::
```
> 使用:options="{ storageKey: 'my-storage-key' }"可以在不同页面之间同步 \
> system用于系统 language用于语言 ide用于ide
> 也可以使用 id=""\
> 更多请参考[vue-tabs-component](https://github.com/Jacobs63/vue3-tabs-component)
