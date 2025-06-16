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

// 实现用户数据插入
async function insertUsers(connection) {
  console.log('开始插入用户数据...');
  
  // 清空表
  await connection.query('TRUNCATE TABLE users');
  
  // 插入示例用户数据
  const users = [
    {
      nickname: '测试用户1',
      phone_number: '13800138001',
      password: '$2a$10$QwJARumCFQ8YFAXkUzScP.qsKxI4MyqzBEXSM1goL/I9yGDE3aYeS', // 密码: 123456
      avatar_url: '/uploads/assets/avatars/default.png',
      created_at: new Date('2025-05-18 12:30:00')
    },
    {
      nickname: '测试用户2',
      phone_number: '13800138002',
      password: '$2a$10$QwJARumCFQ8YFAXkUzScP.qsKxI4MyqzBEXSM1goL/I9yGDE3aYeS', // 密码: 123456
      avatar_url: '/uploads/assets/avatars/default.png',
      created_at: new Date('2025-05-18 12:35:00')
    }
  ];
  
  // 批量插入用户数据
  const [result] = await connection.query('INSERT INTO users (nickname, phone_number, password, avatar_url, created_at) VALUES ?', 
    [users.map(user => [user.nickname, user.phone_number, user.password, user.avatar_url, user.created_at])]
  );
  
  console.log(`成功插入 ${result.affectedRows} 条用户数据`);
}

// 实现首页资源数据插入
async function insertHomeResources(connection) {
  console.log('开始插入首页资源数据...');
  
  // 清空表
  await connection.query('TRUNCATE TABLE home_resources');
  
  // 插入首页资源数据
  const homeResources = [
    {
      resource_type: 'banner',
      image_url: '/uploads/assets/Home/Banner/非遗1.jpg',
      title: '非遗文化',
      description: '传承千年的非物质文化遗产',
      display_order: 1,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'banner',
      image_url: '/uploads/assets/Home/Banner/非遗2.jpg',
      title: '非遗艺术',
      description: '中国传统艺术的精髓',
      display_order: 2,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'banner',
      image_url: '/uploads/assets/Home/Banner/非遗.jpg',
      title: '非遗技艺',
      description: '匠心独运的传统技艺',
      display_order: 3,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'map',
      image_url: '/uploads/assets/Home/Map/非遗分布地图1.jpg',
      title: '中国非物质文化遗产分布',
      description: '点击查看详细分布',
      display_order: 1,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'project',
      image_url: '/uploads/assets/Home/Project/传统表演艺术/龙舞1.jpg',
      title: '传统表演艺术',
      description: '国家级非物质文化遗产代表性项目',
      display_order: 1,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'project',
      image_url: '/uploads/assets/Home/Project/传统服饰/回族服饰3.jpg',
      title: '传统服饰',
      description: '国家级非物质文化遗产代表性项目',
      display_order: 2,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'project',
      image_url: '/uploads/assets/Home/Project/传统乐器与音乐/维吾尔十二木卡姆4.jpg',
      title: '传统乐器与音乐',
      description: '国家级非物质文化遗产代表性项目',
      display_order: 3,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'project',
      image_url: '/uploads/assets/Home/Project/传统艺术与工艺/海伦剪纸1.jpg',
      title: '传统艺术与工艺',
      description: '国家级非物质文化遗产代表性项目',
      display_order: 4,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'project',
      image_url: '/uploads/assets/Home/Project/传统节日与庆典/龙舟3.jpg',
      title: '传统节日与庆典',
      description: '国家级非物质文化遗产代表性项目',
      display_order: 5,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'project',
      image_url: '/uploads/assets/Home/Project/传统装饰与配饰/海伦剪纸1.jpg',
      title: '传统装饰与配饰',
      description: '国家级非物质文化遗产代表性项目',
      display_order: 6,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'project',
      image_url: '/uploads/assets/Home/Project/文化与创意产业/图片1.png',
      title: '文化与创意产业',
      description: '国家级非物质文化遗产代表性项目',
      display_order: 7,
      created_at: new Date('2025-05-19 14:43:42')
    }
  ];
  
  // 批量插入首页资源数据
  const [result] = await connection.query(
    'INSERT INTO home_resources (resource_type, image_url, title, description, display_order, created_at) VALUES ?',
    [homeResources.map(resource => [
      resource.resource_type,
      resource.image_url,
      resource.title,
      resource.description,
      resource.display_order,
      resource.created_at
    ])]
  );
  
  console.log(`成功插入 ${result.affectedRows} 条首页资源数据`);
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

