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

// 实现地图资源数据插入
async function insertMapResources(connection) {
  console.log('开始插入地图资源数据...');
  
  // 清空表
  await connection.query('TRUNCATE TABLE map_resources');
  
  // 插入地图资源数据
  const mapResources = [
    {
      resource_type: 'map_image',
      name: '',
      image_url: '/uploads/assets/Home/Map/非遗分布地图1.jpg',
      count: 0,
      percentage: 100,
      world_count: 42,
      national_count: 1557,
      provincial_count: 13087,
      display_order: 1,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'map_image',
      name: '',
      image_url: '/uploads/assets/Home/Map/非遗分布地图2.jpg',
      count: 0,
      percentage: 100,
      world_count: 42,
      national_count: 1557,
      provincial_count: 13087,
      display_order: 2,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'statistics',
      name: '',
      image_url: '',
      count: 0,
      percentage: 100,
      world_count: 42,
      national_count: 1557,
      provincial_count: 13087,
      display_order: 0,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'region',
      name: '浙江省',
      image_url: '',
      count: 158,
      percentage: 100,
      world_count: 42,
      national_count: 1557,
      provincial_count: 13087,
      display_order: 1,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'region',
      name: '江苏省',
      image_url: '',
      count: 142,
      percentage: 90,
      world_count: 42,
      national_count: 1557,
      provincial_count: 13087,
      display_order: 2,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'region',
      name: '山东省',
      image_url: '',
      count: 138,
      percentage: 87,
      world_count: 42,
      national_count: 1557,
      provincial_count: 13087,
      display_order: 3,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'region',
      name: '河南省',
      image_url: '',
      count: 132,
      percentage: 84,
      world_count: 42,
      national_count: 1557,
      provincial_count: 13087,
      display_order: 4,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'region',
      name: '四川省',
      image_url: '',
      count: 130,
      percentage: 82,
      world_count: 42,
      national_count: 1557,
      provincial_count: 13087,
      display_order: 5,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'category',
      name: '传统表演艺术',
      image_url: '',
      count: 326,
      percentage: 100,
      world_count: 42,
      national_count: 1557,
      provincial_count: 13087,
      display_order: 1,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'category',
      name: '传统技艺',
      image_url: '',
      count: 614,
      percentage: 100,
      world_count: 42,
      national_count: 1557,
      provincial_count: 13087,
      display_order: 2,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'category',
      name: '传统医药',
      image_url: '',
      count: 98,
      percentage: 100,
      world_count: 42,
      national_count: 1557,
      provincial_count: 13087,
      display_order: 3,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'category',
      name: '民俗',
      image_url: '',
      count: 248,
      percentage: 100,
      world_count: 42,
      national_count: 1557,
      provincial_count: 13087,
      display_order: 4,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'category',
      name: '传统音乐',
      image_url: '',
      count: 185,
      percentage: 100,
      world_count: 42,
      national_count: 1557,
      provincial_count: 13087,
      display_order: 5,
      created_at: new Date('2025-05-19 14:43:42')
    },
    {
      resource_type: 'category',
      name: '传统美术',
      image_url: '',
      count: 86,
      percentage: 100,
      world_count: 42,
      national_count: 1557,
      provincial_count: 13087,
      display_order: 6,
      created_at: new Date('2025-05-19 14:43:42')
    }
  ];
  
  // 批量插入地图资源数据
  const [result] = await connection.query(
    'INSERT INTO map_resources (resource_type, name, image_url, count, percentage, world_count, national_count, provincial_count, display_order, created_at) VALUES ?',
    [mapResources.map(resource => [
      resource.resource_type,
      resource.name,
      resource.image_url,
      resource.count,
      resource.percentage,
      resource.world_count,
      resource.national_count,
      resource.provincial_count,
      resource.display_order,
      resource.created_at
    ])]
  );
  
  console.log(`成功插入 ${result.affectedRows} 条地图资源数据`);
}

// 实现非遗项目数据插入
async function insertLearning(connection) {
  console.log('开始插入非遗项目数据...');
  
  // 清空表
  await connection.query('TRUNCATE TABLE learning');
  
  // 插入非遗项目数据
  const learningData = [
    {
      title: '传统乐器与音乐',
      subtitle: '维吾尔十二木卡姆',
      image_url: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆1.jpg',
      all_images: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆1.jpg\t/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆2.jpg\t/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆3.jpg\t/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆4.jpg',
      content_url: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆.txt',
      all_content_urls: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆.txt',
      created_at: new Date('2025-05-18 14:19:58')
    },
    {
      title: '传统服饰',
      subtitle: '回族服饰',
      image_url: '/uploads/assets/传统服饰/回族服饰1.jpg',
      all_images: '/uploads/assets/传统服饰/回族服饰1.jpg\t/uploads/assets/传统服饰/回族服饰2.jpg\t/uploads/assets/传统服饰/回族服饰3.jpg\t/uploads/assets/传统服饰/回族服饰4.jpg',
      content_url: '/uploads/assets/传统服饰/回族服饰.txt',
      all_content_urls: '/uploads/assets/传统服饰/回族服饰.txt',
      created_at: new Date('2025-05-18 14:19:58')
    },
    {
      title: '传统艺术与工艺',
      subtitle: '刺绣',
      image_url: '/uploads/assets/传统艺术与工艺/刺绣/苏绣1.jpg',
      all_images: '/uploads/assets/传统艺术与工艺/刺绣/苏绣1.jpg\t/uploads/assets/传统艺术与工艺/刺绣/苏绣2.jpg\t/uploads/assets/传统艺术与工艺/刺绣/苏绣3.jpg\t/uploads/assets/传统艺术与工艺/刺绣/苏绣4.jpg\t/uploads/assets/传统艺术与工艺/刺绣/蜀绣1.jpg\t/uploads/assets/传统艺术与工艺/刺绣/蜀绣2.jpg\t/uploads/assets/传统艺术与工艺/刺绣/蜀绣3.jpg',
      content_url: '/uploads/assets/传统艺术与工艺/刺绣/苏绣.txt',
      all_content_urls: '/uploads/assets/传统艺术与工艺/刺绣/苏绣.txt;/uploads/assets/传统艺术与工艺/刺绣/蜀绣.txt',
      created_at: new Date('2025-05-18 14:19:58')
    },
    // ... 添加更多示例数据 ...
    {
      title: '传统表演艺术',
      subtitle: '戏曲',
      image_url: '/uploads/assets/传统表演艺术/戏曲/川剧1.jpg',
      all_images: '/uploads/assets/传统表演艺术/戏曲/川剧1.jpg\t/uploads/assets/传统表演艺术/戏曲/川剧2.jpg\t/uploads/assets/传统表演艺术/戏曲/川剧3.jpg\t/uploads/assets/传统表演艺术/戏曲/川剧4.jpg\t/uploads/assets/传统表演艺术/戏曲/淮剧1.jpg\t/uploads/assets/传统表演艺术/戏曲/淮剧2.jpg\t/uploads/assets/传统表演艺术/戏曲/淮剧3.jpg\t/uploads/assets/传统表演艺术/戏曲/秦腔1.jpg\t/uploads/assets/传统表演艺术/戏曲/秦腔2.jpg\t/uploads/assets/传统表演艺术/戏曲/秦腔3.jpg\t/uploads/assets/传统表演艺术/戏曲/秦腔4.jpg\t/uploads/assets/传统表演艺术/戏曲/黄梅戏1.jpg\t/uploads/assets/传统表演艺术/戏曲/黄梅戏2.jpg\t/uploads/assets/传统表演艺术/戏曲/黄梅戏3.jpg',
      content_url: '/uploads/assets/传统表演艺术/戏曲/川剧.txt',
      all_content_urls: '/uploads/assets/传统表演艺术/戏曲/川剧.txt;/uploads/assets/传统表演艺术/戏曲/淮剧.txt;/uploads/assets/传统表演艺术/戏曲/秦腔.txt;/uploads/assets/传统表演艺术/戏曲/黄梅戏.txt',
      created_at: new Date('2025-05-18 14:19:58')
    },
    {
      title: '传统表演艺术',
      subtitle: '民间舞蹈',
      image_url: '/uploads/assets/传统表演艺术/民间舞蹈/二人转1.jpg',
      all_images: '/uploads/assets/传统表演艺术/民间舞蹈/二人转1.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/二人转2.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/二人转3.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/常山战鼓1.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/常山战鼓2.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/常山战鼓3.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/常山战鼓4.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/朝鲜族跳板1.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/朝鲜族跳板2.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/朝鲜族跳板3.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/舞狮1.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/舞狮2.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/舞狮3.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/舞狮4.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/龙舞1.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/龙舞2.jpg\t/uploads/assets/传统表演艺术/民间舞蹈/龙舞3.jpg',
      content_url: '/uploads/assets/传统表演艺术/民间舞蹈/东北二人转.txt',
      all_content_urls: '/uploads/assets/传统表演艺术/民间舞蹈/东北二人转.txt;/uploads/assets/传统表演艺术/民间舞蹈/常山战鼓.txt;/uploads/assets/传统表演艺术/民间舞蹈/朝鲜族跳板.txt;/uploads/assets/传统表演艺术/民间舞蹈/舞狮.txt;/uploads/assets/传统表演艺术/民间舞蹈/龙舞.txt',
      created_at: new Date('2025-05-18 14:19:58')
    }
  ];
  
  // 批量插入非遗项目数据
  const [result] = await connection.query(
    'INSERT INTO learning (title, subtitle, image_url, all_images, content_url, all_content_urls, created_at) VALUES ?',
    [learningData.map(item => [
      item.title,
      item.subtitle,
      item.image_url,
      item.all_images,
      item.content_url,
      item.all_content_urls,
      item.created_at
    ])]
  );
  
  console.log(`成功插入 ${result.affectedRows} 条非遗项目数据`);
}

// 实现商品数据插入
async function insertProducts(connection) {
  console.log('开始插入商品数据...');
  
  // 清空表
  await connection.query('TRUNCATE TABLE products');
  
  // 插入商品数据
  const products = [
    {
      name: '竹编包包',
      category: '竹编',
      image_url: '/uploads/assets/商品/卖竹编包包1.jpg',
      price: 304.42,
      description_url: '/uploads/assets/商品/竹编包包1.txt',
      created_at: new Date('2025-05-18 20:13:47')
    },
    {
      name: '竹编包包',
      category: '竹编',
      image_url: '/uploads/assets/商品/卖竹编包包2.jpg',
      price: 406.68,
      description_url: '/uploads/assets/商品/竹编包包1.txt',
      created_at: new Date('2025-05-18 20:13:47')
    },
    {
      name: '竹编包包',
      category: '竹编',
      image_url: '/uploads/assets/商品/卖竹编包包3.jpg',
      price: 442.75,
      description_url: '/uploads/assets/商品/竹编包包1.txt',
      created_at: new Date('2025-05-18 20:13:47')
    },
    {
      name: '竹编包包',
      category: '竹编',
      image_url: '/uploads/assets/商品/卖竹编包包4.jpg',
      price: 252.88,
      description_url: '/uploads/assets/商品/竹编包包1.txt',
      created_at: new Date('2025-05-18 20:13:47')
    },
    {
      name: '竹编包包',
      category: '竹编',
      image_url: '/uploads/assets/商品/卖竹编包包5.jpg',
      price: 102.43,
      description_url: '/uploads/assets/商品/竹编包包1.txt',
      created_at: new Date('2025-05-18 20:13:47')
    },
    {
      name: '竹编扇子',
      category: '竹编',
      image_url: '/uploads/assets/商品/卖竹编扇子1.jpg',
      price: 356.23,
      description_url: '/uploads/assets/商品/竹编扇子.txt',
      created_at: new Date('2025-05-18 20:13:47')
    },
    {
      name: '竹编扇子',
      category: '竹编',
      image_url: '/uploads/assets/商品/卖竹编扇子2.jpg',
      price: 411.4,
      description_url: '/uploads/assets/商品/竹编扇子.txt',
      created_at: new Date('2025-05-18 20:13:47')
    },
    {
      name: '竹编扇子',
      category: '竹编',
      image_url: '/uploads/assets/商品/卖竹编扇子3.jpg',
      price: 130.96,
      description_url: '/uploads/assets/商品/竹编扇子.txt',
      created_at: new Date('2025-05-18 20:13:47')
    },
    {
      name: '竹编椅子',
      category: '竹编',
      image_url: '/uploads/assets/商品/卖竹编椅子1.jpg',
      price: 371.09,
      description_url: '/uploads/assets/商品/竹编椅子.txt',
      created_at: new Date('2025-05-18 20:13:47')
    },
    {
      name: '竹编椅子',
      category: '竹编',
      image_url: '/uploads/assets/商品/卖竹编椅子2.jpg',
      price: 117.33,
      description_url: '/uploads/assets/商品/竹编椅子.txt',
      created_at: new Date('2025-05-18 20:13:47')
    }
  ];
  
  // 批量插入商品数据
  const [result] = await connection.query(
    'INSERT INTO products (name, category, image_url, price, description_url, created_at) VALUES ?',
    [products.map(product => [
      product.name,
      product.category,
      product.image_url,
      product.price,
      product.description_url,
      product.created_at
    ])]
  );
  
  console.log(`成功插入 ${result.affectedRows} 条商品数据`);
}

// 实现订单数据插入
async function insertOrders(connection) {
  console.log('开始插入订单数据...');
  
  // 清空表
  await connection.query('TRUNCATE TABLE orders');
  
  // 获取用户和商品ID
  const [users] = await connection.query('SELECT id FROM users');
  const [products] = await connection.query('SELECT id FROM products');
  
  if (users.length === 0 || products.length === 0) {
    console.warn('用户或商品数据为空，无法插入订单数据');
    return;
  }
  
  // 为用户创建订单
  const orders = [
    // 用户1的订单
    {
      user_id: users[0].id,
      product_id: products[0].id,
      quantity: 1,
      created_at: new Date('2025-05-18 12:48:43')
    },
    {
      user_id: users[0].id,
      product_id: products[2].id,
      quantity: 2,
      created_at: new Date('2025-05-19 10:30:22')
    },
    // 用户2的订单
    {
      user_id: users[1].id,
      product_id: products[1].id,
      quantity: 1,
      created_at: new Date('2025-05-18 15:12:33')
    },
    {
      user_id: users[1].id,
      product_id: products[3].id,
      quantity: 1,
      created_at: new Date('2025-05-19 09:45:16')
    },
    {
      user_id: users[1].id,
      product_id: products[5].id,
      quantity: 3,
      created_at: new Date('2025-05-19 16:20:50')
    }
  ];
  
  // 批量插入订单数据
  const [result] = await connection.query(
    'INSERT INTO orders (user_id, product_id, quantity, created_at) VALUES ?',
    [orders.map(order => [
      order.user_id,
      order.product_id,
      order.quantity,
      order.created_at
    ])]
  );
  
  console.log(`成功插入 ${result.affectedRows} 条订单数据`);
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

