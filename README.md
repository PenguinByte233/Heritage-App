# 非遗小程序项目

本项目是一个展示非物质文化遗产的小程序，包含前端和后端两部分。

## 项目结构

```
Demo/
├── frontend/          # 前端代码
│   ├── api/           # API接口调用
│   ├── components/    # 公共组件
│   ├── pages/         # 页面
│   ├── static/        # 静态资源
│   ├── unpackage/     # 编译输出
│   ├── App.vue        # 应用入口
│   ├── main.js        # 主函数
│   ├── manifest.json  # 应用配置
│   ├── pages.json     # 页面配置
│   └── uni.scss       # 全局样式
│
├── backend/           # 后端代码
│   ├── config/        # 配置文件
│   ├── controllers/   # 控制器
│   ├── middlewares/   # 中间件
│   ├── models/        # 数据模型
│   ├── routes/        # 路由
│   ├── scripts/       # 脚本
│   ├── uploads/       # 上传文件
│   ├── utils/         # 工具类
│   ├── app.js         # 后端入口
│   └── package.json   # 后端依赖
│
└── 开发文档            # 项目开发文档
```

## 运行项目

### 前端

1. 使用HBuilderX打开`frontend`文件夹
2. 点击运行按钮，选择需要运行的平台（微信开发者工具等）

### 后端

1. 进入`backend`文件夹
2. 安装依赖：
```bash
npm install
```
3. 初始化数据库：
```bash
node scripts/init-db.js
```
4. 启动服务器：
```bash
npm run dev
```

## 功能模块

- 首页：展示非遗概览和推荐内容
- 购买：展示非遗相关产品，支持购买
- 学习：提供非遗教程学习
- 社区：用户交流与分享
- 个人中心：用户信息与设置

## 技术栈

- 前端：uni-app框架
- 后端：Node.js + Express + MySQL

## 数据接口

详细的API接口请参考`backend/README.md`文件。 