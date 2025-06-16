/**
 * 插入首页和地图详情页静态资源数据
 * 
 * 此脚本用于将首页轮播图、地图资源和项目轮播图数据插入数据库
 * 所有静态资源位于 /uploads/assets/Home 目录下
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'demo',
  port: process.env.DB_PORT || 3306
};

// 资源目录配置
const ASSETS_BASE_DIR = path.join(__dirname, '../uploads/assets/Home');
const ASSETS_BASE_PATH = '/uploads/assets/Home';

// 检查目录是否存在
function checkDirectoryExists(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch (err) {
    return false;
  }
}

// 获取目录下的所有图片文件
function getImageFiles(dir) {
  if (!checkDirectoryExists(dir)) {
    console.warn(`目录不存在: ${dir}`);
    return [];
  }
  
  return fs.readdirSync(dir)
    .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
    .map(file => path.join(dir, file));
}

/**
 * 检查并创建表
 * @param {Object} connection - 数据库连接对象
 */
async function createTablesIfNotExist(connection) {
  console.log('检查并创建数据表...');
  
  // 创建首页资源表
  await connection.execute(`
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
  await connection.execute(`
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
  
  try {
    // 先检查是否有外键约束
    console.log('检查外键约束...');
    const [constraints] = await connection.execute(`
      SELECT * FROM information_schema.referential_constraints
      WHERE referenced_table_name = 'home_resources' OR referenced_table_name = 'map_resources'
    `);
    
    if (constraints.length > 0) {
      console.log(`发现 ${constraints.length} 个外键约束，使用DELETE FROM代替TRUNCATE`);
      await connection.execute('DELETE FROM home_resources');
      await connection.execute('DELETE FROM map_resources');
    } else {
      await connection.execute('TRUNCATE TABLE home_resources');
      await connection.execute('TRUNCATE TABLE map_resources');
    }
    console.log('表数据已清空');
  } catch (error) {
    console.error('清空表失败，尝试使用DELETE FROM:', error);
    await connection.execute('DELETE FROM home_resources');
    await connection.execute('DELETE FROM map_resources');
    console.log('使用DELETE FROM清空表成功');
  }
}

/**
 * 扫描首页Banner图片
 */
function scanBannerImages() {
  console.log('扫描Banner图片...');
  
  // 尝试多个可能的Banner目录
  const possibleDirs = [
    path.join(ASSETS_BASE_DIR, 'Banner'),
    path.join(ASSETS_BASE_DIR, 'banner'),
    path.join(ASSETS_BASE_DIR, 'Carousel'),
    path.join(ASSETS_BASE_DIR, 'carousel'),
    path.join(ASSETS_BASE_DIR, '非遗')
  ];
  
  let bannerFiles = [];
  let bannerDir = '';
  
  for (const dir of possibleDirs) {
    if (checkDirectoryExists(dir)) {
      const files = getImageFiles(dir);
      if (files.length > 0) {
        bannerFiles = files;
        bannerDir = dir;
        console.log(`在目录 ${dir} 中找到 ${files.length} 张Banner图片`);
        break;
      }
    }
  }
  
  if (bannerFiles.length === 0) {
    console.warn('未找到任何Banner图片，将使用默认数据');
    return [];
  }
  
  // 将文件路径转换为URL格式
  return bannerFiles.map((file, index) => {
    const relativePath = file.replace(path.join(__dirname, '..'), '').replace(/\\/g, '/');
    const urlPath = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
    
    return {
      resource_type: 'banner',
      image_url: urlPath,
      title: `非遗文化${index + 1}`,
      description: `传承千年的非物质文化遗产${index + 1}`,
      display_order: index + 1
    };
  });
}

/**
 * 扫描地图图片
 */
function scanMapImages() {
  console.log('扫描地图图片...');
  
  // 尝试多个可能的地图目录
  const possibleDirs = [
    path.join(ASSETS_BASE_DIR, 'Map'),
    path.join(ASSETS_BASE_DIR, 'map'),
    path.join(ASSETS_BASE_DIR, '地图')
  ];
  
  let mapFiles = [];
  let mapDir = '';
  
  for (const dir of possibleDirs) {
    if (checkDirectoryExists(dir)) {
      const files = getImageFiles(dir);
      if (files.length > 0) {
        mapFiles = files;
        mapDir = dir;
        console.log(`在目录 ${dir} 中找到 ${files.length} 张地图图片`);
        break;
      }
    }
  }
  
  if (mapFiles.length === 0) {
    console.warn('未找到任何地图图片，将使用默认数据');
    return [];
  }
  
  // 将文件路径转换为URL格式
  const mapData = [];
  const mapDetailData = [];
  
  mapFiles.forEach((file, index) => {
    const relativePath = file.replace(path.join(__dirname, '..'), '').replace(/\\/g, '/');
    const urlPath = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
    
    // 第一张图片作为地图封面
    if (index === 0) {
      mapData.push({
        resource_type: 'map',
        image_url: urlPath,
        title: '中国非物质文化遗产分布',
        description: '点击查看详细分布',
        display_order: 1
      });
    }
    
    // 所有图片都作为地图详情页图片
    mapDetailData.push({
      resource_type: 'map_image',
      image_url: urlPath,
      display_order: index + 1
    });
  });
  
  return { mapData, mapDetailData };
}

/**
 * 扫描项目图片
 */
function scanProjectImages() {
  console.log('扫描项目图片...');
  
  // 尝试多个可能的项目目录
  const possibleDirs = [
    path.join(ASSETS_BASE_DIR, 'Project'),
    path.join(ASSETS_BASE_DIR, 'project'),
    path.join(ASSETS_BASE_DIR, 'Carousel1')
  ];
  
  // 定义项目类别
  const projectCategories = [
    '传统表演艺术',
    '传统服饰',
    '传统乐器与音乐',
    '传统艺术与工艺',
    '传统节日与庆典',
    '传统装饰与配饰',
    '文化与创意产业'
  ];
  
  let projectData = [];
  
  // 尝试在每个可能的目录中查找项目图片
  for (const dir of possibleDirs) {
    if (checkDirectoryExists(dir)) {
      console.log(`检查项目目录: ${dir}`);
      
      // 检查是否有子目录
      const subdirs = fs.readdirSync(dir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      if (subdirs.length > 0) {
        // 如果有子目录，每个子目录对应一个项目类别
        console.log(`发现 ${subdirs.length} 个项目子目录`);
        
        subdirs.forEach((subdir, index) => {
          const subdirPath = path.join(dir, subdir);
          const files = getImageFiles(subdirPath);
          
          if (files.length > 0) {
            // 使用第一张图片作为项目封面
            const file = files[0];
            const relativePath = file.replace(path.join(__dirname, '..'), '').replace(/\\/g, '/');
            const urlPath = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
            
            // 使用子目录名作为项目标题，或者使用预定义的类别
            const title = projectCategories.includes(subdir) ? subdir : 
                         (index < projectCategories.length ? projectCategories[index] : subdir);
            
            projectData.push({
              resource_type: 'project',
              image_url: urlPath,
              title: title,
              description: '国家级非物质文化遗产代表性项目',
              display_order: index + 1
            });
            
            console.log(`  添加项目: ${title}, 图片: ${urlPath}`);
          }
        });
      } else {
        // 如果没有子目录，直接使用该目录下的图片
        const files = getImageFiles(dir);
        
        if (files.length > 0) {
          console.log(`在目录 ${dir} 中找到 ${files.length} 张项目图片`);
          
          // 限制最多使用7张图片
          const maxFiles = Math.min(files.length, 7);
          
          for (let i = 0; i < maxFiles; i++) {
            const file = files[i];
            const relativePath = file.replace(path.join(__dirname, '..'), '').replace(/\\/g, '/');
            const urlPath = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
            
            projectData.push({
              resource_type: 'project',
              image_url: urlPath,
              title: projectCategories[i] || `项目${i + 1}`,
              description: '国家级非物质文化遗产代表性项目',
              display_order: i + 1
            });
            
            console.log(`  添加项目: ${projectCategories[i] || `项目${i + 1}`}, 图片: ${urlPath}`);
          }
        }
      }
      
      // 如果找到了项目图片，就不再继续查找
      if (projectData.length > 0) {
        break;
      }
    }
  }
  
  if (projectData.length === 0) {
    console.warn('未找到任何项目图片，将使用默认数据');
  }
  
  return projectData;
}

/**
 * 插入首页资源数据
 * @param {Object} connection - 数据库连接对象
 * @param {Array} bannerData - 轮播图数据
 * @param {Array} mapData - 地图资源数据
 * @param {Array} projectData - 项目轮播图数据
 */
async function insertHomeResources(connection, bannerData, mapData, projectData) {
  console.log('插入首页资源数据...');
  
  // 插入轮播图数据
  for (const item of bannerData) {
    await connection.execute(
      'INSERT INTO home_resources (resource_type, image_url, title, description, display_order) VALUES (?, ?, ?, ?, ?)',
      [item.resource_type, item.image_url, item.title, item.description, item.display_order]
    );
  }
  console.log(`已插入 ${bannerData.length} 条轮播图数据`);
  
  // 插入地图资源数据
  for (const item of mapData) {
    await connection.execute(
      'INSERT INTO home_resources (resource_type, image_url, title, description, display_order) VALUES (?, ?, ?, ?, ?)',
      [item.resource_type, item.image_url, item.title, item.description, item.display_order]
    );
  }
  console.log(`已插入 ${mapData.length} 条地图资源数据`);
  
  // 插入项目轮播图数据
  for (const item of projectData) {
    await connection.execute(
      'INSERT INTO home_resources (resource_type, image_url, title, description, display_order) VALUES (?, ?, ?, ?, ?)',
      [item.resource_type, item.image_url, item.title, item.description, item.display_order]
    );
  }
  console.log(`已插入 ${projectData.length} 条项目轮播图数据`);
}

/**
 * 插入地图详情页资源数据
 * @param {Object} connection - 数据库连接对象
 * @param {Array} mapDetailData - 地图图片数据
 */
async function insertMapResources(connection, mapDetailData) {
  console.log('插入地图详情页资源数据...');
  
  // 插入地图图片数据
  for (const item of mapDetailData) {
    await connection.execute(
      'INSERT INTO map_resources (resource_type, image_url, display_order) VALUES (?, ?, ?)',
      [item.resource_type, item.image_url, item.display_order]
    );
  }
  console.log(`已插入 ${mapDetailData.length} 条地图图片数据`);
  
  // 插入统计数据
  const statisticsData = {
    resource_type: 'statistics',
    world_count: 42,
    national_count: 1557,
    provincial_count: 13087
  };
  
  await connection.execute(
    'INSERT INTO map_resources (resource_type, world_count, national_count, provincial_count) VALUES (?, ?, ?, ?)',
    [statisticsData.resource_type, statisticsData.world_count, statisticsData.national_count, statisticsData.provincial_count]
  );
  console.log('已插入统计数据');
  
  // 插入地区分布数据
  const regionData = [
    { resource_type: 'region', name: '浙江省', count: 158, percentage: 100, display_order: 1 },
    { resource_type: 'region', name: '江苏省', count: 142, percentage: 90, display_order: 2 },
    { resource_type: 'region', name: '山东省', count: 138, percentage: 87, display_order: 3 },
    { resource_type: 'region', name: '河南省', count: 132, percentage: 84, display_order: 4 },
    { resource_type: 'region', name: '四川省', count: 130, percentage: 82, display_order: 5 }
  ];
  
  for (const item of regionData) {
    await connection.execute(
      'INSERT INTO map_resources (resource_type, name, count, percentage, display_order) VALUES (?, ?, ?, ?, ?)',
      [item.resource_type, item.name, item.count, item.percentage, item.display_order]
    );
  }
  console.log(`已插入 ${regionData.length} 条地区分布数据`);
  
  // 插入分类数据
  const categoryData = [
    { resource_type: 'category', name: '传统表演艺术', count: 326, display_order: 1 },
    { resource_type: 'category', name: '传统技艺', count: 614, display_order: 2 },
    { resource_type: 'category', name: '传统医药', count: 98, display_order: 3 },
    { resource_type: 'category', name: '民俗', count: 248, display_order: 4 },
    { resource_type: 'category', name: '传统音乐', count: 185, display_order: 5 },
    { resource_type: 'category', name: '传统美术', count: 86, display_order: 6 }
  ];
  
  for (const item of categoryData) {
    await connection.execute(
      'INSERT INTO map_resources (resource_type, name, count, display_order) VALUES (?, ?, ?, ?)',
      [item.resource_type, item.name, item.count, item.display_order]
    );
  }
  console.log(`已插入 ${categoryData.length} 条分类数据`);
}

/**
 * 检查资源目录
 */
function checkResourceDirectories() {
  console.log('检查资源目录...');
  
  if (!checkDirectoryExists(ASSETS_BASE_DIR)) {
    console.error(`主资源目录不存在: ${ASSETS_BASE_DIR}`);
    console.log('尝试创建目录...');
    
    try {
      fs.mkdirSync(ASSETS_BASE_DIR, { recursive: true });
      console.log(`已创建目录: ${ASSETS_BASE_DIR}`);
    } catch (err) {
      console.error(`创建目录失败: ${err.message}`);
      return false;
    }
  }
  
  // 检查Banner目录
  const bannerDir = path.join(ASSETS_BASE_DIR, 'Banner');
  if (!checkDirectoryExists(bannerDir)) {
    try {
      fs.mkdirSync(bannerDir, { recursive: true });
      console.log(`已创建Banner目录: ${bannerDir}`);
    } catch (err) {
      console.warn(`创建Banner目录失败: ${err.message}`);
    }
  }
  
  // 检查Map目录
  const mapDir = path.join(ASSETS_BASE_DIR, 'Map');
  if (!checkDirectoryExists(mapDir)) {
    try {
      fs.mkdirSync(mapDir, { recursive: true });
      console.log(`已创建Map目录: ${mapDir}`);
    } catch (err) {
      console.warn(`创建Map目录失败: ${err.message}`);
    }
  }
  
  // 检查Project目录
  const projectDir = path.join(ASSETS_BASE_DIR, 'Project');
  if (!checkDirectoryExists(projectDir)) {
    try {
      fs.mkdirSync(projectDir, { recursive: true });
      console.log(`已创建Project目录: ${projectDir}`);
    } catch (err) {
      console.warn(`创建Project目录失败: ${err.message}`);
    }
  }
  
  return true;
}

/**
 * 主函数
 */
async function main() {
  let connection;
  
  try {
    console.log('开始执行数据插入脚本...');
    
    // 检查资源目录
    if (!checkResourceDirectories()) {
      console.error('资源目录检查失败，脚本终止');
      return;
    }
    
    console.log('连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 检查并创建表
    await createTablesIfNotExist(connection);
    
    // 清空表数据
    await clearTables(connection);
    
    // 扫描资源文件
    const bannerData = scanBannerImages();
    const { mapData, mapDetailData } = scanMapImages();
    const projectData = scanProjectImages();
    
    // 如果没有找到资源，使用默认数据
    const finalBannerData = bannerData.length > 0 ? bannerData : [
      {
        resource_type: 'banner',
        image_url: '/static/images/Home/Home/非遗/非遗1.jpg',
        title: '非遗文化',
        description: '传承千年的非物质文化遗产',
        display_order: 1
      },
      {
        resource_type: 'banner',
        image_url: '/static/images/Home/Home/非遗/非遗2.jpg',
        title: '非遗艺术',
        description: '中国传统艺术的精髓',
        display_order: 2
      },
      {
        resource_type: 'banner',
        image_url: '/static/images/Home/Home/非遗/非遗.jpg',
        title: '非遗技艺',
        description: '匠心独运的传统技艺',
        display_order: 3
      }
    ];
    
    const finalMapData = mapData.length > 0 ? mapData : [
      {
        resource_type: 'map',
        image_url: '/static/images/Home/Home/地图/非遗分布地图1.jpg',
        title: '中国非物质文化遗产分布',
        description: '点击查看详细分布',
        display_order: 1
      }
    ];
    
    const finalProjectData = projectData.length > 0 ? projectData : [
      {
        resource_type: 'project',
        image_url: '/static/images/Home/Carousel1/传统表演艺术/龙舞1.jpg',
        title: '传统表演艺术',
        description: '国家级非物质文化遗产代表性项目',
        display_order: 1
      },
      {
        resource_type: 'project',
        image_url: '/static/images/Home/Carousel1/传统服饰/回族服饰3.jpg',
        title: '传统服饰',
        description: '国家级非物质文化遗产代表性项目',
        display_order: 2
      },
      {
        resource_type: 'project',
        image_url: '/static/images/Home/Carousel1/传统乐器与音乐/维吾尔十二木卡姆4.jpg',
        title: '传统乐器与音乐',
        description: '国家级非物质文化遗产代表性项目',
        display_order: 3
      },
      {
        resource_type: 'project',
        image_url: '/static/images/Home/Carousel1/传统艺术与工艺/海伦剪纸1.jpg',
        title: '传统艺术与工艺',
        description: '国家级非物质文化遗产代表性项目',
        display_order: 4
      },
      {
        resource_type: 'project',
        image_url: '/static/images/Home/Carousel1/传统节日与庆典/龙舟3.jpg',
        title: '传统节日与庆典',
        description: '国家级非物质文化遗产代表性项目',
        display_order: 5
      },
      {
        resource_type: 'project',
        image_url: '/static/images/Home/Carousel1/传统装饰与配饰/海伦剪纸1.jpg',
        title: '传统装饰与配饰',
        description: '国家级非物质文化遗产代表性项目',
        display_order: 6
      },
      {
        resource_type: 'project',
        image_url: '/static/images/Home/Carousel1/文化与创意产业/图片1.png',
        title: '文化与创意产业',
        description: '国家级非物质文化遗产代表性项目',
        display_order: 7
      }
    ];
    
    const finalMapDetailData = mapDetailData.length > 0 ? mapDetailData : [
      {
        resource_type: 'map_image',
        image_url: '/static/images/Home/Home/地图/非遗分布地图1.jpg',
        display_order: 1
      },
      {
        resource_type: 'map_image',
        image_url: '/static/images/Home/Home/地图/非遗分布地图2.jpg',
        display_order: 2
      }
    ];
    
    // 插入首页资源数据
    await insertHomeResources(connection, finalBannerData, finalMapData, finalProjectData);
    
    // 插入地图详情页资源数据
    await insertMapResources(connection, finalMapDetailData);
    
    console.log('\n数据插入完成!');
    console.log('使用的资源目录:', ASSETS_BASE_DIR);
    
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