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

    // 如果表不存在，创建表
    if (tables.length === 0) {
      console.log('创建products表...');
      await connection.execute(`
        CREATE TABLE products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          image_url VARCHAR(255) NOT NULL,
          description TEXT,
          stock INT DEFAULT 100,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('products表创建成功');
    } else {
      // 清空表
      await connection.execute('TRUNCATE TABLE products');
      console.log('已清空products表，准备插入新数据');
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
      
      // 为每个商品图片创建一个数据库记录
      for (const product of products) {
        const imageUrl = `/uploads/assets/商品/${product.file}`;
        const price = generateRandomPrice(50, 500); // 价格范围：50-500元
        const description = generateDescription(product.name, product.category);
        const stock = Math.floor(Math.random() * 100) + 10; // 库存范围：10-109
        
        // 插入商品数据
        const [result] = await connection.execute(`
          INSERT INTO products (name, category, price, image_url, description, stock)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [product.name, product.category, price, imageUrl, description, stock]);
        
        console.log(`  成功插入商品: ${product.name}, ID: ${result.insertId}, 价格: ¥${price}`);
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