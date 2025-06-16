# 数据初始化脚本

这个目录包含用于初始化数据库和上传目录的脚本。

## 数据初始化脚本 (inserAllData.js)

该脚本用于向数据库中插入初始数据，并创建必要的文件和目录结构。

### 前提条件

- 确保数据库已创建，并已执行 `backend/db/init.sql` 初始化数据库表结构
- 确保 `backend/config/db.config.js` 中的数据库配置正确

### 使用方法

**初始化所有表数据：**

```bash
node inserAllData.js
```

**初始化特定表数据：**

```bash
node inserAllData.js users products orders
```

### 可用的表名参数

- `users` - 初始化用户表
- `home_resources` - 初始化首页资源表
- `map_resources` - 初始化地图资源表
- `learning` - 初始化学习资源表
- `products` - 初始化商品表
- `orders` - 初始化订单表
- `cart` - 初始化购物车表

### 功能说明

1. 创建必要的目录结构
   - `/uploads`
   - `/uploads/assets` 及其子目录
   
2. 创建示例文件
   - 商品描述文件

3. 初始化数据表
   - 用户数据
   - 首页资源数据
   - 地图资源数据
   - 学习资源（非遗项目）数据
   - 商品数据
   - 订单数据
   - 购物车数据

### 注意事项

1. 脚本会先清空表中的现有数据，再插入新数据
2. 脚本执行过程中会暂时禁用外键约束
3. 如果您已有数据并想保留，请先备份数据库 