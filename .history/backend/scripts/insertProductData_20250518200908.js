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

// 商品图片目录
const productsDir = path.join(__dirname, '../uploads/assets/商品');

// 提取商品名称和类别（例如：从"卖竹编包包1.jpg"中提取名称"竹编包包"和类别"竹编"）
function extractProductInfo(filename) {
  // 移除扩展名
  let nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  // 移除"卖"前缀和末尾的数字
  let productName = nameWithoutExt.replace(/^卖/, "").replace(/\d+$/, "");
  
  // 提取类别（假设类别是名称的前两个字符，如"竹编"）
  let category = productName.substring(0, 2);
  
  return {
    name: productName,
    category: category
  };
}

// 生成随机价格（在指定范围内）
function generateRandomPrice(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

// 生成商品描述
function generateDescription(productName, category) {
  const descriptions = [
    `精美${productName}，传统${category}工艺制作，质地优良，做工精细。`,
    `纯手工${category}${productName}，采用传统工艺精心制作，每件作品都独一无二。`,
    `传统非遗${category}技艺，匠心打造的${productName}，是送礼自用的绝佳选择。`,
    `这款${productName}采用优质材料，${category}大师亲手制作，展现了非物质文化遗产的独特魅力。`,
    `${category}${productName}，传承百年工艺，既是实用物品，也是艺术收藏品。`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// 查找与商品相关的描述文件
function findDescriptionFile(productName) {
  // 尝试查找与商品名称相关的txt文件
  const files = fs.readdirSync(productsDir);
  const txtFiles = files.filter(file => 
    file.toLowerCase().endsWith('.txt') && 
    file.toLowerCase().includes(productName.toLowerCase().replace(/\s+/g, ''))
  );
  
  if (txtFiles.length > 0) {
    // 返回第一个匹配的txt文件路径
    return `/uploads/assets/商品/${txtFiles[0]}`;
  }
  
  // 如果没有精确匹配，尝试查找包含商品类别的txt文件
  const category = productName.substring(0, 2);
  const categoryTxtFiles = files.filter(file => 
    file.toLowerCase().endsWith('.txt') && 
    file.toLowerCase().includes(category.toLowerCase())
  );
  
  if (categoryTxtFiles.length > 0) {
    // 返回第一个匹配的txt文件路径
    return `/uploads/assets/商品/${categoryTxtFiles[0]}`;
  }
  
  // 如果没有找到任何匹配的txt文件，返回null
  return null;
}

// 插入商品数据
async function insertProductData() {
  // 连接数据库
  const connection = await mysql.createConnection(dbConfig);
  console.log('数据库连接成功');

  try {
    // 检查products表是否存在
    const [tables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = 'products'
    `, [dbConfig.database]);

    // 检查products表结构
    let hasDescriptionUrlField = false;
    if (tables.length > 0) {
      const [columns] = await connection.execute(`
        SHOW COLUMNS FROM products LIKE 'description_url'
      `);
      hasDescriptionUrlField = columns.length > 0;
      
      if (!hasDescriptionUrlField) {
        // 添加description_url字段
        console.log('添加description_url字段到products表...');
        await connection.execute(`
          ALTER TABLE products ADD COLUMN description_url VARCHAR(255) AFTER price
        `);
        console.log('description_url字段添加成功');
        hasDescriptionUrlField = true;
      }
    } else {
      // 如果表不存在，创建表
      console.log('创建products表...');
      await connection.execute(`
        CREATE TABLE products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          category VARCHAR(50) NOT NULL,
          image_url VARCHAR(255) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          description_url VARCHAR(255),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('products表创建成功');
      hasDescriptionUrlField = true;
    }

    // 清空表 - 使用DELETE FROM代替TRUNCATE TABLE以避免外键约束问题
    try {
      // 先检查是否有外键约束
      console.log('检查外键约束...');
      const [constraints] = await connection.execute(`
        SELECT * FROM information_schema.referential_constraints
        WHERE referenced_table_name = 'products'
      `);
      
      if (constraints.length > 0) {
        console.log(`发现 ${constraints.length} 个外键约束，使用DELETE FROM代替TRUNCATE`);
        await connection.execute('DELETE FROM products');
      } else {
        await connection.execute('TRUNCATE TABLE products');
      }
      console.log('已清空products表，准备插入新数据');
    } catch (error) {
      console.error('清空表失败，尝试使用DELETE FROM:', error);
      await connection.execute('DELETE FROM products');
      console.log('使用DELETE FROM清空表成功');
    }

    // 读取商品图片目录
    const files = fs.readdirSync(productsDir);
    
    // 过滤出图片文件
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );
    
    console.log(`找到 ${imageFiles.length} 个商品图片`);

    // 按商品名称分组
    const productGroups = {};
    
    imageFiles.forEach(file => {
      const info = extractProductInfo(file);
      const key = info.name;
      
      if (!productGroups[key]) {
        productGroups[key] = [];
      }
      
      productGroups[key].push({
        file: file,
        name: info.name,
        category: info.category
      });
    });

    // 插入每个商品
    for (const [productName, products] of Object.entries(productGroups)) {
      console.log(`处理商品: ${productName}, 图片数量: ${products.length}`);
      
      // 查找与该商品相关的描述文件
      const descriptionUrl = findDescriptionFile(productName);
      if (descriptionUrl) {
        console.log(`  找到描述文件: ${descriptionUrl}`);
      } else {
        console.log(`  未找到描述文件`);
      }
      
      // 为每个商品图片创建一个数据库记录
      for (const product of products) {
        const imageUrl = `/uploads/assets/商品/${product.file}`;
        const price = generateRandomPrice(50, 500); // 价格范围：50-500元
        
        // 准备SQL语句和参数
        let insertQuery, insertParams;
        
        if (hasDescriptionUrlField) {
          insertQuery = `
            INSERT INTO products (name, category, image_url, price, description_url)
            VALUES (?, ?, ?, ?, ?)
          `;
          insertParams = [product.name, product.category, imageUrl, price, descriptionUrl];
        } else {
          insertQuery = `
            INSERT INTO products (name, category, image_url, price)
            VALUES (?, ?, ?, ?)
          `;
          insertParams = [product.name, product.category, imageUrl, price];
        }
        
        // 插入商品数据
        const [result] = await connection.execute(insertQuery, insertParams);
        
        console.log(`  成功插入商品: ${product.name}, ID: ${result.insertId}, 价格: ¥${price}${descriptionUrl ? ', 描述文件: ' + descriptionUrl : ''}`);
      }
    }

    console.log('所有商品数据插入完成！');
  } catch (error) {
    console.error('插入商品数据失败:', error);
  } finally {
    await connection.end();
    console.log('数据库连接已关闭');
  }
}

// 执行插入操作
insertProductData().catch(console.error); 