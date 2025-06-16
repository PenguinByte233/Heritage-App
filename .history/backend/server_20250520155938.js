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

// 创建初始数据库
async function createDatabase() {
  const dbName = process.env.DB_NAME || 'demo';
  const rootPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  try {
    // 尝试创建数据库（如果不存在）
    await rootPool.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`数据库 ${dbName} 创建成功或已存在`);
    return true;
  } catch (error) {
    console.error(`创建数据库 ${dbName} 失败:`, error);
    return false;
  } finally {
    // 关闭临时连接池
    await rootPool.end();
  }
}

// 创建数据库连接池
function createConnectionPool() {
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
  return pool;
}

// 测试数据库连接
async function testConnection(pool) {
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

// 初始化数据库表
async function initDatabaseTables(pool) {
  try {
    // 首先检查是否已存在表
    console.log('检查数据库表是否已存在...');
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'demo']);
    
    // 提取已存在的表名列表
    const existingTables = tables.map(t => t.TABLE_NAME);
    console.log('已存在的表:', existingTables);
    
    // 检查关键表是否都已存在
    const requiredTables = ['users', 'learning', 'products', 'orders', 'community', 'comments', 'likes', 'home_resources', 'map_resources'];
    const missingTables = requiredTables.filter(tableName => !existingTables.includes(tableName));
    
    if (missingTables.length === 0) {
      console.log('所有必要的表已存在，跳过表初始化');
      return true;
    }
    
    console.log(`缺少以下表，需要创建: ${missingTables.join(', ')}`);
    
    // 读取并执行SQL初始化脚本
    const sqlScript = fs.readFileSync(path.join(__dirname, 'db/init.sql'), 'utf8');
    const statements = sqlScript.split(';').filter(stmt => stmt.trim());
    
    // 执行创建表的SQL语句
    console.log('开始创建缺少的表...');
    for (const statement of statements) {
      if (statement.trim()) {
        // 提取SQL语句中的表名
        const tableNameMatch = statement.match(/CREATE\s+TABLE\s+(?:`)?(\w+)(?:`)?/i);
        
        if (tableNameMatch && tableNameMatch[1]) {
          const tableName = tableNameMatch[1].replace(/`/g, '');
          
          // 如果表已存在，跳过创建
          if (existingTables.includes(tableName)) {
            console.log(`表 ${tableName} 已存在，跳过创建`);
            continue;
          }
          
          console.log(`创建表: ${tableName}`);
        }
        
        await pool.query(statement);
      }
    }
    
    console.log('数据库表初始化完成');
    return true;
  } catch (error) {
    console.error('初始化数据库表失败:', error);
    throw error;
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
    // 1. 首先创建数据库
    const dbCreated = await createDatabase();
    if (!dbCreated) {
      console.error('无法创建数据库，服务器启动失败');
      process.exit(1);
    }
    
    // 2. 创建连接池
    const pool = createConnectionPool();
    
    // 3. 测试数据库连接
    const dbConnected = await testConnection(pool);
    
    if (dbConnected) {
      // 4. 初始化数据库表
      await initDatabaseTables(pool);
      
      // 5. 启动服务器
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