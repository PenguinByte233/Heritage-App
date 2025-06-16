/**
 * 全局数据初始化脚本
 * 用于一次性初始化所有表的数据
 */

const mysql = require('mysql2/promise');
const config = require('./db.config');

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
`);
}

// 主函数：连接数据库并执行所有插入操作
async function main() {
  let connection;
  try {
    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');

    // 禁用外键约束检查
    console.log('禁用外键约束检查...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // 执行各种数据插入
    await insertProducts(connection);
    await insertHomeResources(connection);
    await insertMapResources(connection);
    await insertLearning(connection);

    // 启用外键约束检查
    console.log('启用外键约束检查...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('所有数据插入完成');
  } catch (error) {
    console.error('数据插入过程中发生错误:', error);
  } finally {
    // 关闭数据库连接
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
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
  
  // 清空表 - 不需要单独禁用/启用外键检查，因为在main函数中已经处理
  await connection.query('TRUNCATE TABLE home_resources');
  
  // 插入首页资源数据
  const homeResources = [
    { resource_type: 'banner', image_url: '/uploads/assets/Home/Banner/非遗1.jpg', title: '非遗文化', description: '传承千年的非物质文化遗产', display_order: 1, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'banner', image_url: '/uploads/assets/Home/Banner/非遗2.jpg', title: '非遗艺术', description: '中国传统艺术的精髓', display_order: 2, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'banner', image_url: '/uploads/assets/Home/Banner/非遗.jpg', title: '非遗技艺', description: '匠心独运的传统技艺', display_order: 3, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'map', image_url: '/uploads/assets/Home/Map/非遗分布地图1.jpg', title: '中国非物质文化遗产分布', description: '点击查看详细分布', display_order: 1, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'project', image_url: '/uploads/assets/Home/Project/传统表演艺术/龙舞1.jpg', title: '传统表演艺术', description: '国家级非物质文化遗产代表性项目', display_order: 1, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'project', image_url: '/uploads/assets/Home/Project/传统服饰/回族服饰3.jpg', title: '传统服饰', description: '国家级非物质文化遗产代表性项目', display_order: 2, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'project', image_url: '/uploads/assets/Home/Project/传统乐器与音乐/维吾尔十二木卡姆4.jpg', title: '传统乐器与音乐', description: '国家级非物质文化遗产代表性项目', display_order: 3, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'project', image_url: '/uploads/assets/Home/Project/传统艺术与工艺/海伦剪纸1.jpg', title: '传统艺术与工艺', description: '国家级非物质文化遗产代表性项目', display_order: 4, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'project', image_url: '/uploads/assets/Home/Project/传统节日与庆典/龙舟3.jpg', title: '传统节日与庆典', description: '国家级非物质文化遗产代表性项目', display_order: 5, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'project', image_url: '/uploads/assets/Home/Project/传统装饰与配饰/海伦剪纸1.jpg', title: '传统装饰与配饰', description: '国家级非物质文化遗产代表性项目', display_order: 6, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'project', image_url: '/uploads/assets/Home/Project/文化与创意产业/图片1.png', title: '文化与创意产业', description: '国家级非物质文化遗产代表性项目', display_order: 7, created_at: new Date('2025-05-19 14:43:42') }
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
  
  // 清空表 - 不需要单独禁用/启用外键检查，因为在main函数中已经处理
  await connection.query('TRUNCATE TABLE map_resources');
  
  // 插入地图资源数据
  const mapResources = [
    { resource_type: 'map_image', name: '', image_url: '/uploads/assets/Home/Map/非遗分布地图1.jpg', count: 0, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 1, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'map_image', name: '', image_url: '/uploads/assets/Home/Map/非遗分布地图2.jpg', count: 0, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 2, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'statistics', name: '', image_url: '', count: 0, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 0, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'region', name: '浙江省', image_url: '', count: 158, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 1, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'region', name: '江苏省', image_url: '', count: 142, percentage: 90, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 2, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'region', name: '山东省', image_url: '', count: 138, percentage: 87, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 3, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'region', name: '河南省', image_url: '', count: 132, percentage: 84, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 4, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'region', name: '四川省', image_url: '', count: 130, percentage: 82, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 5, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'category', name: '传统表演艺术', image_url: '', count: 326, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 1, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'category', name: '传统技艺', image_url: '', count: 614, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 2, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'category', name: '传统医药', image_url: '', count: 98, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 3, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'category', name: '民俗', image_url: '', count: 248, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 4, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'category', name: '传统音乐', image_url: '', count: 185, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 5, created_at: new Date('2025-05-19 14:43:42') },
    { resource_type: 'category', name: '传统美术', image_url: '', count: 86, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 6, created_at: new Date('2025-05-19 14:43:42') }
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
  
  // 清空表 - 不需要单独禁用/启用外键检查，因为在main函数中已经处理
  await connection.query('TRUNCATE TABLE learning');
  
  // 插入非遗项目数据
  const learningData = [
    { id: 1, title: '传统乐器与音乐', subtitle: '维吾尔十二木卡姆', image_url: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆1.jpg', all_images: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆1.jpg,/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆2.jpg,/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆3.jpg,/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆4.jpg', content_url: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆.txt', all_content_urls: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') },
    { id: 2, title: '传统服饰', subtitle: '回族服饰', image_url: '/uploads/assets/传统服饰/回族服饰1.jpg', all_images: '/uploads/assets/传统服饰/回族服饰1.jpg,/uploads/assets/传统服饰/回族服饰2.jpg,/uploads/assets/传统服饰/回族服饰3.jpg,/uploads/assets/传统服饰/回族服饰4.jpg', content_url: '/uploads/assets/传统服饰/回族服饰.txt', all_content_urls: '/uploads/assets/传统服饰/回族服饰.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') },
    { id: 3, title: '传统艺术与工艺', subtitle: '刺绣', image_url: '/uploads/assets/传统艺术与工艺/刺绣/苏绣1.jpg', all_images: '/uploads/assets/传统艺术与工艺/刺绣/苏绣1.jpg,/uploads/assets/传统艺术与工艺/刺绣/苏绣2.jpg,/uploads/assets/传统艺术与工艺/刺绣/苏绣3.jpg,/uploads/assets/传统艺术与工艺/刺绣/苏绣4.jpg,/uploads/assets/传统艺术与工艺/刺绣/蜀绣1.jpg,/uploads/assets/传统艺术与工艺/刺绣/蜀绣2.jpg,/uploads/assets/传统艺术与工艺/刺绣/蜀绣3.jpg', content_url: '/uploads/assets/传统艺术与工艺/刺绣/苏绣.txt', all_content_urls: '/uploads/assets/传统艺术与工艺/刺绣/苏绣.txt,/uploads/assets/传统艺术与工艺/刺绣/蜀绣.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') },
    { id: 4, title: '传统艺术与工艺', subtitle: '剪纸', image_url: '/uploads/assets/传统艺术与工艺/剪纸/海伦剪纸1.jpg', all_images: '/uploads/assets/传统艺术与工艺/剪纸/海伦剪纸1.jpg,/uploads/assets/传统艺术与工艺/剪纸/海伦剪纸2.jpg,/uploads/assets/传统艺术与工艺/剪纸/海伦剪纸3.jpg', content_url: '/uploads/assets/传统艺术与工艺/剪纸/海伦剪纸.txt', all_content_urls: '/uploads/assets/传统艺术与工艺/剪纸/海伦剪纸.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') },
    { id: 5, title: '传统艺术与工艺', subtitle: '唐卡', image_url: '/uploads/assets/传统艺术与工艺/唐卡/藏族唐卡1.jpg', all_images: '/uploads/assets/传统艺术与工艺/唐卡/藏族唐卡1.jpg,/uploads/assets/传统艺术与工艺/唐卡/藏族唐卡2.jpg,/uploads/assets/传统艺术与工艺/唐卡/藏族唐卡3.jpg,/uploads/assets/传统艺术与工艺/唐卡/藏族唐卡4.jpg', content_url: '/uploads/assets/传统艺术与工艺/唐卡/藏族唐卡.txt', all_content_urls: '/uploads/assets/传统艺术与工艺/唐卡/藏族唐卡.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') },
    { id: 6, title: '传统艺术与工艺', subtitle: '年画', image_url: '/uploads/assets/传统艺术与工艺/年画/凤翔木版年画1.jpg', all_images: '/uploads/assets/传统艺术与工艺/年画/凤翔木版年画1.jpg,/uploads/assets/传统艺术与工艺/年画/凤翔木版年画2.jpg,/uploads/assets/传统艺术与工艺/年画/凤翔木版年画3.jpg,/uploads/assets/传统艺术与工艺/年画/凤翔木版年画4.jpg,/uploads/assets/传统艺术与工艺/年画/衡水内画1.jpg,/uploads/assets/传统艺术与工艺/年画/衡水内画2.jpg,/uploads/assets/传统艺术与工艺/年画/衡水内画3.jpg', content_url: '/uploads/assets/传统艺术与工艺/年画/凤翔木版年画.txt', all_content_urls: '/uploads/assets/传统艺术与工艺/年画/凤翔木版年画.txt,/uploads/assets/传统艺术与工艺/年画/衡水内画.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') },
    { id: 7, title: '传统艺术与工艺', subtitle: '编织', image_url: '/uploads/assets/传统艺术与工艺/编织/竹编1.jpg', all_images: '/uploads/assets/传统艺术与工艺/编织/竹编1.jpg,/uploads/assets/传统艺术与工艺/编织/竹编2.jpg,/uploads/assets/传统艺术与工艺/编织/竹编3.jpg,/uploads/assets/传统艺术与工艺/编织/竹编杯垫.png', content_url: '/uploads/assets/传统艺术与工艺/编织/竹编.txt', all_content_urls: '/uploads/assets/传统艺术与工艺/编织/竹编.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') },
    { id: 8, title: '传统艺术与工艺', subtitle: '陶瓷', image_url: '/uploads/assets/传统艺术与工艺/陶瓷/唐三彩1.jpg', all_images: '/uploads/assets/传统艺术与工艺/陶瓷/唐三彩1.jpg,/uploads/assets/传统艺术与工艺/陶瓷/唐三彩2.jpg,/uploads/assets/传统艺术与工艺/陶瓷/唐三彩3.jpg,/uploads/assets/传统艺术与工艺/陶瓷/唐三彩4.jpg', content_url: '/uploads/assets/传统艺术与工艺/陶瓷/唐三彩.txt', all_content_urls: '/uploads/assets/传统艺术与工艺/陶瓷/唐三彩.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') },
    { id: 9, title: '传统艺术与工艺', subtitle: '雕刻', image_url: '/uploads/assets/传统艺术与工艺/雕刻/叶雕1.jpg', all_images: '/uploads/assets/传统艺术与工艺/雕刻/叶雕1.jpg,/uploads/assets/传统艺术与工艺/雕刻/叶雕2.jpg,/uploads/assets/传统艺术与工艺/雕刻/黄杨木雕1.jpg,/uploads/assets/传统艺术与工艺/雕刻/黄杨木雕2.jpg,/uploads/assets/传统艺术与工艺/雕刻/黄杨木雕3.jpg', content_url: '/uploads/assets/传统艺术与工艺/雕刻/叶雕.txt', all_content_urls: '/uploads/assets/传统艺术与工艺/雕刻/叶雕.txt,/uploads/assets/传统艺术与工艺/雕刻/黄杨木雕.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') },
    { id: 10, title: '传统节日与庆典', subtitle: '炎帝陵祭奠', image_url: '/uploads/assets/传统节日与庆典/炎帝陵祭奠/炎帝陵祭典1.jpg', all_images: '/uploads/assets/传统节日与庆典/炎帝陵祭奠/炎帝陵祭典1.jpg,/uploads/assets/传统节日与庆典/炎帝陵祭奠/炎帝陵祭典2.jpg,/uploads/assets/传统节日与庆典/炎帝陵祭奠/炎帝陵祭典3.jpg,/uploads/assets/传统节日与庆典/炎帝陵祭奠/炎帝陵祭典4.jpg', content_url: '/uploads/assets/传统节日与庆典/炎帝陵祭奠/炎帝陵祭典.txt', all_content_urls: '/uploads/assets/传统节日与庆典/炎帝陵祭奠/炎帝陵祭典.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') },
    { id: 11, title: '传统节日与庆典', subtitle: '风筝', image_url: '/uploads/assets/传统节日与庆典/风筝/风筝.jpg', all_images: '/uploads/assets/传统节日与庆典/风筝/风筝.jpg,/uploads/assets/传统节日与庆典/风筝/风筝1.jpg,/uploads/assets/传统节日与庆典/风筝/风筝2.jpg,/uploads/assets/传统节日与庆典/风筝/风筝3.jpg', content_url: '/uploads/assets/传统节日与庆典/风筝/风筝.txt', all_content_urls: '/uploads/assets/传统节日与庆典/风筝/风筝.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') },
    { id: 12, title: '传统节日与庆典', subtitle: '龙舟', image_url: '/uploads/assets/传统节日与庆典/龙舟/龙舟1.jpg', all_images: '/uploads/assets/传统节日与庆典/龙舟/龙舟1.jpg,/uploads/assets/传统节日与庆典/龙舟/龙舟2.jpg,/uploads/assets/传统节日与庆典/龙舟/龙舟3.jpg', content_url: '/uploads/assets/传统节日与庆典/龙舟/龙舟.txt', all_content_urls: '/uploads/assets/传统节日与庆典/龙舟/龙舟.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') },
    { id: 13, title: '传统表演艺术', subtitle: '戏曲', image_url: '/uploads/assets/传统表演艺术/戏曲/川剧1.jpg', all_images: '/uploads/assets/传统表演艺术/戏曲/川剧1.jpg,/uploads/assets/传统表演艺术/戏曲/川剧2.jpg,/uploads/assets/传统表演艺术/戏曲/川剧3.jpg,/uploads/assets/传统表演艺术/戏曲/川剧4.jpg,/uploads/assets/传统表演艺术/戏曲/淮剧1.jpg,/uploads/assets/传统表演艺术/戏曲/淮剧2.jpg,/uploads/assets/传统表演艺术/戏曲/淮剧3.jpg,/uploads/assets/传统表演艺术/戏曲/秦腔1.jpg,/uploads/assets/传统表演艺术/戏曲/秦腔2.jpg,/uploads/assets/传统表演艺术/戏曲/秦腔3.jpg,/uploads/assets/传统表演艺术/戏曲/秦腔4.jpg,/uploads/assets/传统表演艺术/戏曲/黄梅戏1.jpg,/uploads/assets/传统表演艺术/戏曲/黄梅戏2.jpg,/uploads/assets/传统表演艺术/戏曲/黄梅戏3.jpg', content_url: '/uploads/assets/传统表演艺术/戏曲/川剧.txt', all_content_urls: '/uploads/assets/传统表演艺术/戏曲/川剧.txt,/uploads/assets/传统表演艺术/戏曲/淮剧.txt,/uploads/assets/传统表演艺术/戏曲/秦腔.txt,/uploads/assets/传统表演艺术/戏曲/黄梅戏.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') },
    { id: 14, title: '传统表演艺术', subtitle: '民间舞蹈', image_url: '/uploads/assets/传统表演艺术/民间舞蹈/二人转1.jpg', all_images: '/uploads/assets/传统表演艺术/民间舞蹈/二人转1.jpg,/uploads/assets/传统表演艺术/民间舞蹈/二人转2.jpg,/uploads/assets/传统表演艺术/民间舞蹈/二人转3.jpg,/uploads/assets/传统表演艺术/民间舞蹈/常山战鼓1.jpg,/uploads/assets/传统表演艺术/民间舞蹈/常山战鼓2.jpg,/uploads/assets/传统表演艺术/民间舞蹈/常山战鼓3.jpg,/uploads/assets/传统表演艺术/民间舞蹈/常山战鼓4.jpg,/uploads/assets/传统表演艺术/民间舞蹈/朝鲜族跳板1.jpg,/uploads/assets/传统表演艺术/民间舞蹈/朝鲜族跳板2.jpg,/uploads/assets/传统表演艺术/民间舞蹈/朝鲜族跳板3.jpg,/uploads/assets/传统表演艺术/民间舞蹈/舞狮1.jpg,/uploads/assets/传统表演艺术/民间舞蹈/舞狮2.jpg,/uploads/assets/传统表演艺术/民间舞蹈/舞狮3.jpg,/uploads/assets/传统表演艺术/民间舞蹈/舞狮4.jpg,/uploads/assets/传统表演艺术/民间舞蹈/龙舞1.jpg,/uploads/assets/传统表演艺术/民间舞蹈/龙舞2.jpg,/uploads/assets/传统表演艺术/民间舞蹈/龙舞3.jpg', content_url: '/uploads/assets/传统表演艺术/民间舞蹈/东北二人转.txt', all_content_urls: '/uploads/assets/传统表演艺术/民间舞蹈/东北二人转.txt,/uploads/assets/传统表演艺术/民间舞蹈/常山战鼓.txt,/uploads/assets/传统表演艺术/民间舞蹈/朝鲜族跳板.txt,/uploads/assets/传统表演艺术/民间舞蹈/舞狮.txt,/uploads/assets/传统表演艺术/民间舞蹈/龙舞.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') },
    { id: 15, title: '传统装饰与配饰', subtitle: '簪花', image_url: '/uploads/assets/传统装饰与配饰/簪花/三条簪1.jpg', all_images: '/uploads/assets/传统装饰与配饰/簪花/三条簪1.jpg,/uploads/assets/传统装饰与配饰/簪花/三条簪2.jpg,/uploads/assets/传统装饰与配饰/簪花/三条簪3.jpg', content_url: '/uploads/assets/传统装饰与配饰/簪花/三条簪.txt', all_content_urls: '/uploads/assets/传统装饰与配饰/簪花/三条簪.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') },
    { id: 16, title: '文化与创意产业', subtitle: '文创图片', image_url: '/uploads/assets/文化与创意产业/图片1.png', all_images: '/uploads/assets/文化与创意产业/图片1.png,/uploads/assets/文化与创意产业/图片2.png,/uploads/assets/文化与创意产业/图片3.png', content_url: '/uploads/assets/文化与创意产业/文创图片.txt', all_content_urls: '/uploads/assets/文化与创意产业/文创图片.txt', created_at: new Date('2025-05-18 14:19:58'), updated_at: new Date('2025-05-18 14:19:58') }
  ];
  
  // 批量插入非遗项目数据
  const [result] = await connection.query(
    'INSERT INTO learning (id, title, subtitle, image_url, all_images, content_url, all_content_urls, created_at, updated_at) VALUES ?',
    [learningData.map(item => [
      item.id,
      item.title,
      item.subtitle,
      item.image_url,
      item.all_images,
      item.content_url,
      item.all_content_urls,
      item.created_at,
      item.updated_at
    ])]
  );
  
  console.log(`成功插入 ${result.affectedRows} 条非遗项目数据`);
}

// 实现商品数据插入
async function insertProducts(connection) {
  console.log('开始插入商品数据...');
  
  // 清空表 - 不需要单独禁用/启用外键检查，因为在main函数中已经处理
  await connection.query('TRUNCATE TABLE products');
  
  // 插入商品数据
  const products = [
    { id: 18, name: '竹编包包', category: '竹编', image_url: '/uploads/assets/商品/卖竹编包包1.jpg', price: 304.42, description_url: '/uploads/assets/商品/竹编包包1.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 19, name: '竹编包包', category: '竹编', image_url: '/uploads/assets/商品/卖竹编包包2.jpg', price: 406.68, description_url: '/uploads/assets/商品/竹编包包1.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 20, name: '竹编包包', category: '竹编', image_url: '/uploads/assets/商品/卖竹编包包3.jpg', price: 442.75, description_url: '/uploads/assets/商品/竹编包包1.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 21, name: '竹编包包', category: '竹编', image_url: '/uploads/assets/商品/卖竹编包包4.jpg', price: 252.88, description_url: '/uploads/assets/商品/竹编包包1.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 22, name: '竹编包包', category: '竹编', image_url: '/uploads/assets/商品/卖竹编包包5.jpg', price: 102.43, description_url: '/uploads/assets/商品/竹编包包1.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 23, name: '竹编扇子', category: '竹编', image_url: '/uploads/assets/商品/卖竹编扇子1.jpg', price: 356.23, description_url: '/uploads/assets/商品/竹编扇子.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 24, name: '竹编扇子', category: '竹编', image_url: '/uploads/assets/商品/卖竹编扇子2.jpg', price: 411.40, description_url: '/uploads/assets/商品/竹编扇子.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 25, name: '竹编扇子', category: '竹编', image_url: '/uploads/assets/商品/卖竹编扇子3.jpg', price: 130.96, description_url: '/uploads/assets/商品/竹编扇子.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 26, name: '竹编椅子', category: '竹编', image_url: '/uploads/assets/商品/卖竹编椅子1.jpg', price: 371.09, description_url: '/uploads/assets/商品/竹编椅子.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 27, name: '竹编椅子', category: '竹编', image_url: '/uploads/assets/商品/卖竹编椅子2.jpg', price: 117.33, description_url: '/uploads/assets/商品/竹编椅子.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 28, name: '竹编椅子', category: '竹编', image_url: '/uploads/assets/商品/卖竹编椅子3.jpg', price: 416.73, description_url: '/uploads/assets/商品/竹编椅子.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 29, name: '竹编灯罩', category: '竹编', image_url: '/uploads/assets/商品/卖竹编灯罩1.jpg', price: 308.32, description_url: '/uploads/assets/商品/竹编灯罩.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 30, name: '竹编灯罩', category: '竹编', image_url: '/uploads/assets/商品/卖竹编灯罩2.jpg', price: 93.70, description_url: '/uploads/assets/商品/竹编灯罩.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 31, name: '竹编灯罩', category: '竹编', image_url: '/uploads/assets/商品/卖竹编灯罩3.jpg', price: 161.67, description_url: '/uploads/assets/商品/竹编灯罩.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 32, name: '竹编篮', category: '竹编', image_url: '/uploads/assets/商品/卖竹编篮1.jpg', price: 118.40, description_url: '/uploads/assets/商品/竹编篮子.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 33, name: '竹编篮', category: '竹编', image_url: '/uploads/assets/商品/卖竹编篮2.jpg', price: 115.83, description_url: '/uploads/assets/商品/竹编篮子.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') },
    { id: 34, name: '竹编篮', category: '竹编', image_url: '/uploads/assets/商品/卖竹编篮3.jpg', price: 465.10, description_url: '/uploads/assets/商品/竹编篮子.txt', created_at: new Date('2025-05-18 20:13:47'), updated_at: new Date('2025-05-18 20:13:47') }
  ];
  
  // 批量插入商品数据
  const [result] = await connection.query(
    'INSERT INTO products (id, name, category, image_url, price, description_url, created_at, updated_at) VALUES ?',
    [products.map(product => [
      product.id,
      product.name,
      product.category,
      product.image_url,
      product.price,
      product.description_url,
      product.created_at,
      product.updated_at
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

// 执行主函数
main();

