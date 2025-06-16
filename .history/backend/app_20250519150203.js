const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'demo',
  port: process.env.DB_PORT || 3306
};

// 创建数据库连接池
const createPool = async () => {
  try {
    const pool = mysql.createPool(dbConfig);
    console.log('数据库连接池创建成功');
    return pool;
  } catch (error) {
    console.error('创建数据库连接池失败:', error);
    process.exit(1);
  }
};

// 引入路由模块
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const learningRouter = require('./routes/learning');
const communityRouter = require('./routes/community');
const learnRouter = require('./routes/learn');
const homeRouter = require('./routes/home');

// 注册API路由
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/learning', learningRouter);
app.use('/api/community', communityRouter);
app.use('/api/learn', learnRouter);
app.use('/api/home', homeRouter);

// 错误处理中间件
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `路径 ${req.path} 不存在`
  });
});

app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    status: 'error',
    message: '服务器内部错误'
  });
});

// 启动服务器
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  const pool = await createPool();
  app.locals.pool = pool;
  
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
};

startServer().catch(err => {
  console.error('启动服务器失败:', err);
  process.exit(1);
}); 