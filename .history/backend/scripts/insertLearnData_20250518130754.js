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

// 主类别（大标题）目录 - 从uploads/assets读取
const assetsDir = path.join(__dirname, '../uploads/assets');

// 要排除的分类
const excludedCategories = ['地图', '非遗', '商品'];

// 按主类别（大标题）插入数据的函数
async function insertLearningData() {
  // 连接数据库
  const connection = await mysql.createConnection(dbConfig);
  console.log('数据库连接成功');

  try {
    // 获取主类别文件夹列表，排除指定分类
    const mainCategories = fs.readdirSync(assetsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !excludedCategories.includes(dirent.name))
      .map(dirent => dirent.name);
    
    console.log(`找到 ${mainCategories.length} 个主类别`);

    // 清空learning表
    await connection.execute('TRUNCATE TABLE learning');
    console.log('已清空learning表，准备插入新数据');

    // 检查learning表是否有all_images字段，如果没有则添加
    try {
      await connection.execute('ALTER TABLE learning ADD COLUMN all_images TEXT AFTER image_url');
      console.log('已添加all_images字段');
    } catch (error) {
      // 如果字段已存在，会报错，忽略这个错误
      if (!error.message.includes('Duplicate column name')) {
        throw error;
      }
      console.log('all_images字段已存在');
    }

    // 遍历每个主类别
    for (const mainCategory of mainCategories) {
      console.log(`处理主类别: ${mainCategory}`);
      
      const categoryPath = path.join(assetsDir, mainCategory);
      
      // 获取子类别（小标题）文件夹列表
      const subCategories = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      console.log(`  发现 ${subCategories.length} 个子类别`);

      // 遍历每个子类别
      for (const subCategory of subCategories) {
        console.log(`    处理子类别: ${subCategory}`);
        
        const subCategoryPath = path.join(categoryPath, subCategory);
        
        // 查找所有文件
        const files = fs.readdirSync(subCategoryPath);
        
        // 查找所有图片文件
        const imageFiles = files.filter(file => 
          /\.(jpg|jpeg|png|gif)$/i.test(file)
        );
        
        // 查找内容文件
        const contentFiles = files.filter(file => 
          /\.(txt|md)$/i.test(file)
        );
        
        // 如果有图片和内容文件
        if (imageFiles.length > 0 && contentFiles.length > 0) {
          // 构建所有图片的URL数组
          const allImageUrls = imageFiles.map(file => 
            `/uploads/assets/${mainCategory}/${subCategory}/${file}`
          );
          
          // 使用第一张图片作为封面
          const imageUrl = allImageUrls[0];
          
          // 将所有图片URL合并为一个以逗号分隔的字符串
          const allImagesString = allImageUrls.join(',');
          
          // 内容文件路径
          const contentUrl = `/uploads/assets/${mainCategory}/${subCategory}/${contentFiles[0]}`;
          
          // 准备插入数据
          const insertQuery = `
            INSERT INTO learning (title, subtitle, image_url, all_images, content_url) 
            VALUES (?, ?, ?, ?, ?)
          `;
          
          // 执行插入
          const [result] = await connection.execute(
            insertQuery, 
            [mainCategory, subCategory, imageUrl, allImagesString, contentUrl]
          );
          
          console.log(`    成功插入: ${mainCategory} - ${subCategory}, ID: ${result.insertId}, 图片数量: ${imageFiles.length}`);
        } else {
          console.log(`    跳过: ${subCategory} - 缺少图片或内容文件`);
        }
      }
    }
    
    console.log('数据插入完成!');
  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    // 关闭数据库连接
    await connection.end();
    console.log('数据库连接已关闭');
  }
}

// 运行脚本
insertLearningData().catch(console.error);