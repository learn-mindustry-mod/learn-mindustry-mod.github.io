### 第三章 游戏内容的程序逻辑

  - 3.1.1 方块与建筑的分工：Content vs Building
  - 3.1.2 多态与重写：为什么“游戏来找你的代码”
  - 3.1.3 内容生命周期：load/init/postInit 与注册时机
  - 3.1.4 buildType() 与 Building 的实例化流程
  - 3.1.5 Block 常见字段与默认行为（尺寸、血量、容量、需求等）
  - 3.1.6 Building 的状态字段：progress/warmup/efficiency/timers 等
  - 3.1.7 更新循环：update/updateTile 与性能注意
  - 3.1.8 绘制与放置：draw/drawPlace/drawSelect
  - 3.1.9 配置与交互：config/configured/buildConfiguration
  - 3.1.10 统计与 UI 信息：setStats/setBars
  - 3.1.11 消耗与生产的挂载点（Consumes 的入口位置）
  - 3.1.12 存档与同步：write/read 与网络一致性
  - 3.1.13 小练习：从 0 写一个“可配置的小工厂”

**游戏内容背后的程序原理，真正开始进入编程**
- **3.1** 方块（Block）与建筑（Building）
- **3.2** 工厂的生产逻辑
- **3.2** 单位类型（UnitType）与单位实体（Unit）
- **3.3** 电网图（PowerGraph）模型
- **3.4** 物流/液体/热量的物流传输逻辑
- **3.5** 载荷（Payload）
- **3.6** 弹射物类型（BulletType）与弹射物实体（Bullet）
- **3.7** 全局事件与事件监听
- **3.8** 星球与星球生成器（PlanetGenerator）