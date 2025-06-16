/**
 * 全局数据初始化脚本
 * 用于一次性初始化所有表的数据
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../../frontendd/config/db.config');

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

// 处理命令行参数
function parseCommandLineArgs() {
  const args = process.argv.slice(2);
  const options = {
    all: true,
    tables: []
  };

  // 如果有指定表名，则只初始化指定的表
  if (args.length > 0) {
    options.all = false;
    options.tables = args;
  }

  return options;
}

// 打印使用说明
function printUsage() {
  console.log(`
数据初始化脚本使用说明:
--------------------------------------
不带参数: 初始化所有表
  node inserAllData.js

指定表名: 只初始化指定的表
  node inserAllData.js users products orders

可用的表名:
  - users (用户表)
  - home_resources (首页资源表)
  - map_resources (地图资源表)
  - learning (学习资源表)
  - products (商品表)
  - orders (订单表)
  - cart (购物车表)
`);
}

// 主函数
async function insertAllData() {
  // 解析命令行参数
  const options = parseCommandLineArgs();
  
  // 打印使用说明
  printUsage();
  
  console.log('开始初始化所有数据表...');
  
  let connection;
  try {
    // 建立数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 确保目录存在
    ensureDirectoriesExist();
    
    // 创建商品描述文件
    await createProductDescriptionFiles();
    
    // 禁用外键检查
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 根据命令行参数执行数据插入操作
    if (options.all || options.tables.includes('users')) {
      await insertUsers(connection);
    }
    
    if (options.all || options.tables.includes('home_resources')) {
      await insertHomeResources(connection);
    }
    
    if (options.all || options.tables.includes('map_resources')) {
      await insertMapResources(connection);
    }
    
    if (options.all || options.tables.includes('learning')) {
      await insertLearning(connection);
    }
    
    if (options.all || options.tables.includes('products')) {
      await insertProducts(connection);
    }
    
    if (options.all || options.tables.includes('orders')) {
      await insertOrders(connection);
    }
    
    if (options.all || options.tables.includes('cart')) {
      await insertCart(connection);
    }
    
    // 启用外键检查
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('所有数据初始化完成！');
  } catch (error) {
    console.error('初始化数据时出错:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 确保必要的目录结构存在
function ensureDirectoriesExist() {
  console.log('检查并创建必要的目录...');
  
  // 确保uploads目录存在
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`创建目录: ${UPLOADS_DIR}`);
  }
  
  // 确保assets目录存在
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
    console.log(`创建目录: ${ASSETS_DIR}`);
  }
  
  // 确保各资源类型的子目录存在
  const assetSubdirs = [
    'banner', 
    '首页', 
    '地图', 
    '学习', 
    '商品'
  ];
  
  for (const dir of assetSubdirs) {
    const fullPath = path.join(ASSETS_DIR, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`创建目录: ${fullPath}`);
    }
  }
  
  console.log('目录检查完成');
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

// 实现购物车数据插入
async function insertCart(connection) {
  console.log('开始插入购物车数据...');
  
  // 清空表
  await connection.query('TRUNCATE TABLE cart');
  
  // 获取用户和商品ID
  const [users] = await connection.query('SELECT id FROM users');
  const [products] = await connection.query('SELECT id FROM products');
  
  if (users.length === 0 || products.length === 0) {
    console.warn('用户或商品数据为空，无法插入购物车数据');
    return;
  }
  
  // 为用户创建购物车项目
  const cartItems = [
    // 用户1的购物车
    {
      user_id: users[0].id,
      product_id: products[4].id,
      quantity: 1,
      created_at: new Date('2025-05-20 09:12:34')
    },
    {
      user_id: users[0].id,
      product_id: products[6].id,
      quantity: 2,
      created_at: new Date('2025-05-20 09:15:22')
    },
    // 用户2的购物车
    {
      user_id: users[1].id,
      product_id: products[7].id,
      quantity: 1,
      created_at: new Date('2025-05-20 10:30:45')
    },
    {
      user_id: users[1].id,
      product_id: products[9].id,
      quantity: 3,
      created_at: new Date('2025-05-20 10:32:18')
    }
  ];
  
  // 批量插入购物车数据
  const [result] = await connection.query(
    'INSERT INTO cart (user_id, product_id, quantity, created_at) VALUES ?',
    [cartItems.map(item => [
      item.user_id,
      item.product_id,
      item.quantity,
      item.created_at
    ])]
  );
  
  console.log(`成功插入 ${result.affectedRows} 条购物车数据`);
}

// 创建商品描述文件
async function createProductDescriptionFiles() {
  console.log('创建商品描述文件...');
  
  const productDescriptions = {
    '竹编包包1.txt': `竹编包包是非物质文化遗产中的精品，手工编织而成。
这款包包选用优质竹材，经过传统工艺精心编织。
特点：
1. 纯手工编织，每一件都是独特的
2. 轻便耐用，环保材质
3. 通风透气，适合四季使用
4. 传统与现代结合的设计，既实用又美观

购买这款包包不仅能获得一件实用的物品，还能支持非物质文化遗产的传承与发展。`,
    
    '竹编扇子.txt': `竹编扇子是我国传统工艺品，历史悠久，工艺精湛。
这款扇子由经验丰富的竹编艺人手工制作，造型典雅，做工精细。
特点：
1. 采用优质竹材，轻便耐用
2. 手工精编，纹理清晰，做工考究
3. 散热效果好，使用舒适
4. 既可用于日常消暑，又可作为收藏品或礼品

竹编扇子不仅具有实用价值，更承载着中国传统文化的魅力，是非物质文化遗产的重要组成部分。`,
    
    '竹编椅子.txt': `竹编椅子是中国传统家具中的精品，代表着非物质文化遗产中的竹编工艺。
这款椅子采用优质竹材，由经验丰富的竹编艺人手工制作而成。
特点：
1. 选用优质竹材，经过防腐、防虫处理，耐用性强
2. 纯手工编织，每一件都独具匠心
3. 结构牢固，可承受较大重量
4. 造型美观，既有传统韵味，又符合现代审美
5. 透气性好，坐感舒适，适合四季使用

竹编椅子不仅是实用家具，更是艺术品和文化传承的载体，让您在日常生活中感受非遗文化的魅力。`
  };
  
  // 确保商品描述目录存在
  const productDescDir = path.join(ASSETS_DIR, '商品');
  if (!fs.existsSync(productDescDir)) {
    fs.mkdirSync(productDescDir, { recursive: true });
  }
  
  // 创建描述文件
  for (const [filename, content] of Object.entries(productDescriptions)) {
    const filePath = path.join(productDescDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`创建商品描述文件: ${filePath}`);
  }
  
  console.log('商品描述文件创建完成');
}

// 执行主函数
insertAllData().catch(console.error);

