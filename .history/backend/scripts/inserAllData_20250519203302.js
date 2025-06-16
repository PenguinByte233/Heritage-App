/**
 * 全局数据初始化脚本
 * 用于一次性初始化所有表的数据
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config/db.config');

// 数据库连接配置
const dbConfig = {
  host: config.HOST,
  user: config.USER,
  password: config.PASSWORD,
  database: config.DB,
  port: config.PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 资源目录路径
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const ASSETS_DIR = path.join(UPLOADS_DIR, 'assets');

// 主函数
async function insertAllData() {
  console.log('开始初始化所有数据表...');
  
  // 创建数据库连接
  const connection = await mysql.createConnection(dbConfig);
  console.log('数据库连接成功');
  
  try {
    // 检查目录是否存在，不存在则创建
    ensureDirectoriesExist();
    
    // 禁用外键检查，以便清空表
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 初始化各表数据
    await insertUsers(connection);
    await insertHomeResources(connection);
    await insertMapResources(connection);
    await insertLearning(connection);
    await insertProducts(connection);
    await insertOrders(connection);
    await insertCommunity(connection);
    await insertComments(connection);
    await insertLikes(connection);
    
    // 恢复外键检查
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('所有数据初始化完成！');
  } catch (error) {
    console.error('初始化数据时出错:', error);
  } finally {
    // 关闭数据库连接
    await connection.end();
    console.log('数据库连接已关闭');
  }
}

// 确保目录存在
function ensureDirectoriesExist() {
  const dirs = [
    UPLOADS_DIR,
    ASSETS_DIR,
    path.join(ASSETS_DIR, 'Home'),
    path.join(ASSETS_DIR, 'Home', 'Banner'),
    path.join(ASSETS_DIR, 'Home', 'Map'),
    path.join(ASSETS_DIR, 'Home', 'Project'),
    path.join(ASSETS_DIR, '商品'),
    path.join(ASSETS_DIR, '传统表演艺术'),
    path.join(ASSETS_DIR, '传统服饰'),
    path.join(ASSETS_DIR, '传统艺术与工艺'),
    path.join(ASSETS_DIR, '传统节日与庆典'),
    path.join(ASSETS_DIR, '传统乐器与音乐'),
    path.join(ASSETS_DIR, '传统装饰与配饰'),
    path.join(ASSETS_DIR, '文化与创意产业')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`创建目录: ${dir}`);
    }
  });
}

// 在此添加各表的数据插入函数
async function insertUsers(connection) {
  // 实现用户数据插入
}

async function insertHomeResources(connection) {
  // 实现首页资源数据插入
}

async function insertMapResources(connection) {
  // 实现地图资源数据插入
}

async function insertLearning(connection) {
  // 实现非遗项目数据插入
}

async function insertProducts(connection) {
  // 实现商品数据插入
}

async function insertOrders(connection) {
  // 实现订单数据插入
}

async function insertCommunity(connection) {
  // 实现社区数据插入
}

async function insertComments(connection) {
  // 实现评论数据插入
}

async function insertLikes(connection) {
  // 实现点赞数据插入
}

// 执行主函数
insertAllData().catch(console.error);

