const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// 导入路由
const learnRoutes = require('./routes/learn');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件 - 用于提供uploads目录中的图片和文本文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// 初始化数据库表
async function initDatabase() {
  try {
    // 创建learn_items表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS learn_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100) NOT NULL COMMENT '大分类，如"传统表演艺术"',
        subcategory VARCHAR(100) NOT NULL COMMENT '子分类，如"民间舞蹈"',
        title VARCHAR(200) NOT NULL COMMENT '标题，如"常山战鼓"',
        description TEXT COMMENT '简短描述',
        image_path VARCHAR(255) COMMENT '主图片路径',
        content_file_path VARCHAR(255) COMMENT '内容文本文件路径',
        additional_images TEXT COMMENT '额外图片路径，用逗号分隔',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log('数据库表初始化完成');
    
    // 检查是否需要插入初始数据
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM learn_items');
    if (rows[0].count === 0) {
      await initLearnData();
    } else {
      console.log('数据库已有数据，跳过初始化数据');
    }
  } catch (error) {
    console.error('初始化数据库失败:', error);
  }
}

// 初始化学习数据
async function initLearnData() {
  try {
    console.log('开始初始化学习数据...');
    
    // 获取uploads/learn目录下的所有分类目录
    const learnDir = path.join(__dirname, 'uploads/learn');
    const categories = fs.readdirSync(learnDir).filter(item => 
      fs.statSync(path.join(learnDir, item)).isDirectory()
    );
    
    let insertCount = 0;
    
    // 遍历每个分类目录
    for (const category of categories) {
      const categoryDir = path.join(learnDir, category);
      
      // 获取子分类目录
      const subcategories = fs.readdirSync(categoryDir).filter(item => 
        fs.statSync(path.join(categoryDir, item)).isDirectory()
      );
      
      console.log(`${category} 下找到以下子分类: ${subcategories.join(', ')}`);
      
      // 遍历每个子分类目录
      for (const subcategory of subcategories) {
        const subcategoryDir = path.join(categoryDir, subcategory);
        
        // 获取所有文本文件
        const textFiles = fs.readdirSync(subcategoryDir).filter(file => 
          file.endsWith('.txt')
        );
        
        // 处理每个文本文件
        for (const textFile of textFiles) {
          const title = path.basename(textFile, '.txt');
          const contentFilePath = `/uploads/learn/${category}/${subcategory}/${textFile}`;
          
          // 找到对应的图片文件
          const baseFileName = title.replace(/\s+/g, '');
          const imageFiles = fs.readdirSync(subcategoryDir).filter(file => 
            file.startsWith(baseFileName) && (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg'))
          );
          
          if (imageFiles.length === 0) {
            console.log(`警告: ${textFile} 没有匹配的图片文件，已跳过`);
            continue;
          }
          
          // 主图片和额外图片
          const mainImage = `/uploads/learn/${category}/${subcategory}/${imageFiles[0]}`;
          const additionalImages = imageFiles.slice(1).map(img => 
            `/uploads/learn/${category}/${subcategory}/${img}`
          ).join(',');
          
          // 读取文本内容前几行作为描述
          let description = '';
          try {
            const content = fs.readFileSync(path.join(subcategoryDir, textFile), 'utf8');
            description = content.split('\n')[0].substring(0, 100) + '...';
          } catch (err) {
            console.error(`读取 ${textFile} 失败:`, err);
            description = `关于${title}的详细介绍`;
          }
          
          // 插入数据
          await pool.query(`
            INSERT INTO learn_items 
            (category, subcategory, title, description, image_path, content_file_path, additional_images)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            category,
            subcategory,
            title,
            description,
            mainImage,
            contentFilePath,
            additionalImages
          ]);
          
          insertCount++;
          console.log(`已插入: ${category} > ${subcategory} > ${title}`);
        }
      }
    }
    
    console.log(`总共插入了 ${insertCount} 条数据到 learn_items 表`);
  } catch (error) {
    console.error('初始化学习数据失败:', error);
  }
}

// API路由

// 根路由 - API信息
app.get('/', (req, res) => {
  res.json({
    message: '非遗小程序 - Learn API 服务',
    version: '1.0.0',
    endpoints: {
      categories: '/api/learn/categories',
      categoryItems: '/api/learn/category/:category',
      itemDetail: '/api/learn/detail/:title',
      itemById: '/api/learn/items/:id'
    }
  });
});

// 使用路由
app.use('/api/learn', learnRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
  });
});

// 未找到路由处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `路径 ${req.originalUrl} 不存在`
  });
});

// 启动服务器
async function startServer() {
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