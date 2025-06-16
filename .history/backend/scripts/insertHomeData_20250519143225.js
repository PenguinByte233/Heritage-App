/**
 * 插入首页和地图详情页静态资源数据
 * 
 * 此脚本用于将首页轮播图、地图资源和项目轮播图数据插入数据库
 * 所有静态资源位于 /uploads/assets/Home 目录下
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const { promisify } = require('util');

// 加载环境变量
dotenv.config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'feiyi_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 资源目录配置
const ASSETS_BASE_PATH = '/uploads/assets/Home';
const BANNER_PATH = `${ASSETS_BASE_PATH}/Banner`;
const MAP_PATH = `${ASSETS_BASE_PATH}/Map`;
const PROJECT_PATH = `${ASSETS_BASE_PATH}/Project`;

// 首页资源数据
const bannerData = [
  {
    resource_type: 'banner',
    image_url: `${BANNER_PATH}/banner1.jpg`,
    title: '非遗文化',
    description: '传承千年的非物质文化遗产',
    display_order: 1
  },
  {
    resource_type: 'banner',
    image_url: `${BANNER_PATH}/banner2.jpg`,
    title: '非遗艺术',
    description: '中国传统艺术的精髓',
    display_order: 2
  },
  {
    resource_type: 'banner',
    image_url: `${BANNER_PATH}/banner3.jpg`,
    title: '非遗技艺',
    description: '匠心独运的传统技艺',
    display_order: 3
  }
];

const mapData = [
  {
    resource_type: 'map',
    image_url: `${MAP_PATH}/map_cover.jpg`,
    title: '中国非物质文化遗产分布',
    description: '点击查看详细分布',
    display_order: 1
  }
];

const projectData = [
  {
    resource_type: 'project',
    image_url: `${PROJECT_PATH}/traditional_performance.jpg`,
    title: '传统表演艺术',
    description: '国家级非物质文化遗产代表性项目',
    display_order: 1
  },
  {
    resource_type: 'project',
    image_url: `${PROJECT_PATH}/traditional_costume.jpg`,
    title: '传统服饰',
    description: '国家级非物质文化遗产代表性项目',
    display_order: 2
  },
  {
    resource_type: 'project',
    image_url: `${PROJECT_PATH}/traditional_music.jpg`,
    title: '传统乐器与音乐',
    description: '国家级非物质文化遗产代表性项目',
    display_order: 3
  },
  {
    resource_type: 'project',
    image_url: `${PROJECT_PATH}/traditional_art.jpg`,
    title: '传统艺术与工艺',
    description: '国家级非物质文化遗产代表性项目',
    display_order: 4
  },
  {
    resource_type: 'project',
    image_url: `${PROJECT_PATH}/traditional_festival.jpg`,
    title: '传统节日与庆典',
    description: '国家级非物质文化遗产代表性项目',
    display_order: 5
  },
  {
    resource_type: 'project',
    image_url: `${PROJECT_PATH}/traditional_decoration.jpg`,
    title: '传统装饰与配饰',
    description: '国家级非物质文化遗产代表性项目',
    display_order: 6
  },
  {
    resource_type: 'project',
    image_url: `${PROJECT_PATH}/cultural_industry.jpg`,
    title: '文化与创意产业',
    description: '国家级非物质文化遗产代表性项目',
    display_order: 7
  }
];

// 地图详情页资源数据
const mapDetailData = [
  {
    resource_type: 'map_image',
    image_url: `${MAP_PATH}/map_detail1.jpg`,
    display_order: 1
  },
  {
    resource_type: 'map_image',
    image_url: `${MAP_PATH}/map_detail2.jpg`,
    display_order: 2
  }
];

const statisticsData = {
  resource_type: 'statistics',
  world_count: 42,
  national_count: 1557,
  provincial_count: 13087
};

const regionData = [
  {
    resource_type: 'region',
    name: '浙江省',
    count: 158,
    percentage: 100,
    display_order: 1
  },
  {
    resource_type: 'region',
    name: '江苏省',
    count: 142,
    percentage: 90,
    display_order: 2
  },
  {
    resource_type: 'region',
    name: '山东省',
    count: 138,
    percentage: 87,
    display_order: 3
  },
  {
    resource_type: 'region',
    name: '河南省',
    count: 132,
    percentage: 84,
    display_order: 4
  },
  {
    resource_type: 'region',
    name: '四川省',
    count: 130,
    percentage: 82,
    display_order: 5
  }
];

const categoryData = [
  {
    resource_type: 'category',
    name: '传统表演艺术',
    count: 326,
    display_order: 1
  },
  {
    resource_type: 'category',
    name: '传统技艺',
    count: 614,
    display_order: 2
  },
  {
    resource_type: 'category',
    name: '传统医药',
    count: 98,
    display_order: 3
  },
  {
    resource_type: 'category',
    name: '民俗',
    count: 248,
    display_order: 4
  },
  {
    resource_type: 'category',
    name: '传统音乐',
    count: 185,
    display_order: 5
  },
  {
    resource_type: 'category',
    name: '传统美术',
    count: 86,
    display_order: 6
  }
];

/**
 * 检查并创建表
 * @param {Object} connection - 数据库连接对象
 */
async function createTablesIfNotExist(connection) {
  console.log('检查并创建数据表...');
  
  // 创建首页资源表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`home_resources\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`resource_type\` ENUM('banner', 'map', 'project') NOT NULL COMMENT '资源类型：banner-轮播图, map-地图, project-项目',
      \`image_url\` VARCHAR(255) NOT NULL COMMENT '图片URL',
      \`title\` VARCHAR(100) DEFAULT NULL COMMENT '标题',
      \`description\` VARCHAR(255) DEFAULT NULL COMMENT '描述',
      \`display_order\` INT DEFAULT 0 COMMENT '显示顺序',
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='首页资源表';
  `);
  
  // 创建地图详情页资源表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`map_resources\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`resource_type\` ENUM('map_image', 'statistics', 'region', 'category') NOT NULL COMMENT '资源类型：map_image-地图图片, statistics-统计数据, region-地区数据, category-分类数据',
      \`name\` VARCHAR(100) DEFAULT NULL COMMENT '名称',
      \`image_url\` VARCHAR(255) DEFAULT NULL COMMENT '图片URL',
      \`count\` INT DEFAULT 0 COMMENT '数量',
      \`percentage\` INT DEFAULT 100 COMMENT '百分比',
      \`world_count\` INT DEFAULT 42 COMMENT '世界级非遗数量',
      \`national_count\` INT DEFAULT 1557 COMMENT '国家级非遗数量',
      \`provincial_count\` INT DEFAULT 13087 COMMENT '省级非遗数量',
      \`display_order\` INT DEFAULT 0 COMMENT '显示顺序',
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地图详情页资源表';
  `);
  
  console.log('数据表检查完成');
}

/**
 * 清空表数据
 * @param {Object} connection - 数据库连接对象
 */
async function clearTables(connection) {
  console.log('清空表数据...');
  
  await connection.query('TRUNCATE TABLE home_resources');
  await connection.query('TRUNCATE TABLE map_resources');
  
  console.log('表数据已清空');
}

/**
 * 插入首页资源数据
 * @param {Object} connection - 数据库连接对象
 */
async function insertHomeResources(connection) {
  console.log('插入首页资源数据...');
  
  // 插入轮播图数据
  for (const item of bannerData) {
    await connection.query(
      'INSERT INTO home_resources (resource_type, image_url, title, description, display_order) VALUES (?, ?, ?, ?, ?)',
      [item.resource_type, item.image_url, item.title, item.description, item.display_order]
    );
  }
  console.log(`已插入 ${bannerData.length} 条轮播图数据`);
  
  // 插入地图资源数据
  for (const item of mapData) {
    await connection.query(
      'INSERT INTO home_resources (resource_type, image_url, title, description, display_order) VALUES (?, ?, ?, ?, ?)',
      [item.resource_type, item.image_url, item.title, item.description, item.display_order]
    );
  }
  console.log(`已插入 ${mapData.length} 条地图资源数据`);
  
  // 插入项目轮播图数据
  for (const item of projectData) {
    await connection.query(
      'INSERT INTO home_resources (resource_type, image_url, title, description, display_order) VALUES (?, ?, ?, ?, ?)',
      [item.resource_type, item.image_url, item.title, item.description, item.display_order]
    );
  }
  console.log(`已插入 ${projectData.length} 条项目轮播图数据`);
}

/**
 * 插入地图详情页资源数据
 * @param {Object} connection - 数据库连接对象
 */
async function insertMapResources(connection) {
  console.log('插入地图详情页资源数据...');
  
  // 插入地图图片数据
  for (const item of mapDetailData) {
    await connection.query(
      'INSERT INTO map_resources (resource_type, image_url, display_order) VALUES (?, ?, ?)',
      [item.resource_type, item.image_url, item.display_order]
    );
  }
  console.log(`已插入 ${mapDetailData.length} 条地图图片数据`);
  
  // 插入统计数据
  await connection.query(
    'INSERT INTO map_resources (resource_type, world_count, national_count, provincial_count) VALUES (?, ?, ?, ?)',
    [statisticsData.resource_type, statisticsData.world_count, statisticsData.national_count, statisticsData.provincial_count]
  );
  console.log('已插入统计数据');
  
  // 插入地区分布数据
  for (const item of regionData) {
    await connection.query(
      'INSERT INTO map_resources (resource_type, name, count, percentage, display_order) VALUES (?, ?, ?, ?, ?)',
      [item.resource_type, item.name, item.count, item.percentage, item.display_order]
    );
  }
  console.log(`已插入 ${regionData.length} 条地区分布数据`);
  
  // 插入分类数据
  for (const item of categoryData) {
    await connection.query(
      'INSERT INTO map_resources (resource_type, name, count, display_order) VALUES (?, ?, ?, ?)',
      [item.resource_type, item.name, item.count, item.display_order]
    );
  }
  console.log(`已插入 ${categoryData.length} 条分类数据`);
}

/**
 * 检查资源文件是否存在
 */
async function checkResourceFiles() {
  console.log('检查资源文件是否存在...');
  
  const baseDir = path.join(__dirname, '..', 'public');
  
  // 检查Banner目录
  const bannerDir = path.join(baseDir, BANNER_PATH.replace('/uploads', ''));
  try {
    await fs.mkdir(bannerDir, { recursive: true });
    console.log(`Banner目录已创建: ${bannerDir}`);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error(`创建Banner目录失败: ${err.message}`);
    }
  }
  
  // 检查Map目录
  const mapDir = path.join(baseDir, MAP_PATH.replace('/uploads', ''));
  try {
    await fs.mkdir(mapDir, { recursive: true });
    console.log(`Map目录已创建: ${mapDir}`);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error(`创建Map目录失败: ${err.message}`);
    }
  }
  
  // 检查Project目录
  const projectDir = path.join(baseDir, PROJECT_PATH.replace('/uploads', ''));
  try {
    await fs.mkdir(projectDir, { recursive: true });
    console.log(`Project目录已创建: ${projectDir}`);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error(`创建Project目录失败: ${err.message}`);
    }
  }
  
  console.log('资源目录检查完成');
  
  // 提示用户
  console.log('\n请确保以下资源文件已存在:');
  console.log('Banner图片:');
  bannerData.forEach(item => console.log(`  - ${item.image_url}`));
  
  console.log('\nMap图片:');
  mapData.forEach(item => console.log(`  - ${item.image_url}`));
  mapDetailData.forEach(item => console.log(`  - ${item.image_url}`));
  
  console.log('\nProject图片:');
  projectData.forEach(item => console.log(`  - ${item.image_url}`));
}

/**
 * 主函数
 */
async function main() {
  let connection;
  
  try {
    console.log('开始执行数据插入脚本...');
    console.log('连接数据库...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 检查资源文件
    await checkResourceFiles();
    
    // 检查并创建表
    await createTablesIfNotExist(connection);
    
    // 清空表数据
    await clearTables(connection);
    
    // 插入首页资源数据
    await insertHomeResources(connection);
    
    // 插入地图详情页资源数据
    await insertMapResources(connection);
    
    console.log('\n数据插入完成!');
    console.log('请确保所有资源文件已上传到正确的目录中');
    
  } catch (error) {
    console.error('执行脚本时出错:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行主函数
main().catch(console.error); 