const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件 - 用于提供uploads目录中的图片和文本文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 添加/learn路径的静态文件支持
app.use('/learn', express.static(path.join(__dirname, 'uploads/learn')));
// 添加/uploads/assets路径的静态文件支持
app.use('/uploads/assets', express.static(path.join(__dirname, 'uploads/assets')));

// 数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'demo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 将数据库连接池添加到app.locals中，以便在路由中使用
app.locals.pool = pool;

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功！');
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
}

// 初始化数据库
async function initDatabase() {
  try {
    // 首先创建数据库（如果不存在）
    const rootPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    const dbName = process.env.DB_NAME || 'demo';
    
    try {
      // 尝试创建数据库（如果不存在）
      await rootPool.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
      console.log(`数据库 ${dbName} 创建成功或已存在`);
    } catch (error) {
      console.error(`创建数据库 ${dbName} 失败:`, error);
      throw error;
    } finally {
      // 关闭临时连接池
      await rootPool.end();
    }
    
    // 读取并执行SQL初始化脚本
    const sqlScript = fs.readFileSync(path.join(__dirname, 'db/init.sql'), 'utf8');
    const statements = sqlScript.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log('数据库表初始化完成');
  } catch (error) {
    console.error('初始化数据库失败:', error);
    throw error;  // 重新抛出错误，让上层函数处理
  }
}

// 导入路由
const usersRoutes = require('./routes/users');
const learningRoutes = require('./routes/learning');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const communityRoutes = require('./routes/community');
const homeRoutes = require('./routes/home');

// API路由
// 根路由 - API信息
app.get('/', (req, res) => {
  res.json({
    message: '非遗小程序 API 服务',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      learning: '/api/learning',
      products: '/api/products',
      orders: '/api/orders',
      community: '/api/community'
    }
  });
});

// 使用路由
app.use('/api/users', usersRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/home', homeRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
  });
});

// 未找到路由处理
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `路径 ${req.originalUrl} 不存在`
  });
});

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    
    if (dbConnected) {
      // 初始化数据库
      await initDatabase();
      
      // 启动服务器
      app.listen(PORT, () => {
        console.log(`服务器运行在端口 ${PORT}`);
        console.log(`访问 http://localhost:${PORT} 查看API文档`);
      });
    } else {
      console.error('无法启动服务器，数据库连接失败');
      process.exit(1);
    }
  } catch (error) {
    console.error('启动服务器过程中出错:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

// 启动服务器
startServer(); 