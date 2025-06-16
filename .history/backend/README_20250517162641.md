# 非遗小程序 - 后端API服务

这是一个用于非物质文化遗产小程序的后端API服务，提供了学习内容的获取接口。

## 技术栈

- Node.js
- Express.js
- MySQL

## 安装和运行

### 前置条件

- Node.js (v14+)
- MySQL (v5.7+)

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建一个`.env`文件在项目根目录，包含以下内容：

```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=demo
```

根据你的实际情况修改这些值。

### 初始化数据库

服务启动时会自动创建必要的数据库表，并从`uploads/learn`目录中加载初始数据。

### 启动服务

```bash
npm start
```

服务将在 http://localhost:3001 上运行。

## API接口

### 根路径

- **URL**: `/`
- **方法**: `GET`
- **描述**: 返回API信息和可用端点列表

### 获取所有分类

- **URL**: `/api/learn/categories`
- **方法**: `GET`
- **描述**: 获取所有学习内容的分类和子分类
- **响应示例**:
  ```json
  {
    "success": true,
    "data": [
      {
        "category": "传统表演艺术",
        "subcategories": [
          {
            "name": "民间舞蹈",
            "id": 1,
            "image_path": "/uploads/learn/传统表演艺术/民间舞蹈/龙舞1.jpg",
            "description": "龙舞是中国传统民间舞蹈之一..."
          }
        ]
      }
    ]
  }
  ```

### 获取分类内容

- **URL**: `/api/learn/category/:category`
- **方法**: `GET`
- **参数**: 
  - `category`: 分类名称，如"传统表演艺术"
- **描述**: 获取指定分类下的所有内容，按子分类组织
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "category": "传统表演艺术",
      "subcategories": [
        {
          "name": "民间舞蹈",
          "items": [
            {
              "id": 1,
              "title": "龙舞",
              "description": "龙舞是中国传统民间舞蹈之一...",
              "image_path": "/uploads/learn/传统表演艺术/民间舞蹈/龙舞1.jpg"
            }
          ]
        }
      ]
    }
  }
  ```

### 根据ID获取详细内容

- **URL**: `/api/learn/items/:id`
- **方法**: `GET`
- **参数**: 
  - `id`: 内容ID
- **描述**: 获取指定ID的内容详情
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "category": "传统表演艺术",
      "subcategory": "民间舞蹈",
      "title": "龙舞",
      "description": "龙舞是中国传统民间舞蹈之一...",
      "content": "龙舞的详细内容...",
      "image_path": "/uploads/learn/传统表演艺术/民间舞蹈/龙舞1.jpg",
      "additional_images": [
        "/uploads/learn/传统表演艺术/民间舞蹈/龙舞2.jpg",
        "/uploads/learn/传统表演艺术/民间舞蹈/龙舞3.jpg"
      ],
      "created_at": "2023-01-01T00:00:00Z"
    }
  }
  ```

### 根据标题获取详细内容

- **URL**: `/api/learn/detail/:title`
- **方法**: `GET`
- **参数**: 
  - `title`: 内容标题
- **描述**: 获取指定标题的内容详情
- **响应示例**: 同上

## 目录结构

```
backend/
├── node_modules/      # 依赖包
├── routes/            # 路由文件
│   └── learn.js       # 学习内容相关路由
├── uploads/           # 上传文件目录
│   └── learn/         # 学习内容资源
│       └── 传统表演艺术/
│           └── 民间舞蹈/
│               ├── 龙舞.txt
│               ├── 龙舞1.jpg
│               └── ...
├── .env               # 环境变量
├── package.json       # 项目配置
├── README.md          # 项目说明
└── server.js          # 服务入口文件
```

## 错误处理

所有API响应都遵循以下格式：

- 成功响应:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```

- 错误响应:
  ```json
  {
    "success": false,
    "message": "错误信息"
  }
  ```

常见错误状态码:
- 400: 请求参数错误
- 404: 资源不存在
- 500: 服务器内部错误 