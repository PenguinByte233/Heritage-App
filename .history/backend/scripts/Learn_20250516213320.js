/**
 * 此脚本用于初始化 Learn 页面所需的数据库表
 * 创建 learn_items 表并根据文件系统实际内容插入数据
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

async function initLearnDatabase() {
  console.log('正在初始化 Learn 数据库...');
  let connection;

  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456'
    });

    // 确保数据库存在
    const dbName = process.env.DB_NAME || 'demo';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`数据库 ${dbName} 已创建或已存在`);

    // 使用创建的数据库
    await connection.query(`USE ${dbName}`);

    // 创建 learn_items 表，如果表已存在，先删除它以确保清理旧数据
    await connection.query(`DROP TABLE IF EXISTS learn_items`);
    
    await connection.query(`
      CREATE TABLE learn_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category VARCHAR(255) NOT NULL COMMENT '大标题/大分类，如传统表演艺术、传统服饰等',
        subcategory VARCHAR(255) NOT NULL COMMENT '小标题/子分类，如民间舞蹈、戏曲等',
        title VARCHAR(255) NOT NULL COMMENT '完整标题',
        description TEXT COMMENT '简短描述，从文本内容提取',
        image_path VARCHAR(255) NOT NULL COMMENT '标题图片路径',
        content_file_path VARCHAR(255) NOT NULL COMMENT '内容文本文件路径',
        additional_images VARCHAR(1000) DEFAULT NULL COMMENT '内容图片路径，以逗号分隔',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('learn_items 表已创建');

    // 扫描uploads/learn目录
    const learnDir = path.join(__dirname, '../uploads/learn');
    const categoryDirs = fs.readdirSync(learnDir).filter(dir => {
      const stat = fs.statSync(path.join(learnDir, dir));
      // 只选择目录，排除images和texts
      return stat.isDirectory() && dir !== 'images' && dir !== 'texts';
    });

    console.log(`找到以下大分类: ${categoryDirs.join(', ')}`);

    // 遍历每个大分类
    for (const category of categoryDirs) {
      const categoryPath = path.join(learnDir, category);
      const subcategoryDirs = fs.readdirSync(categoryPath).filter(dir => {
        const stat = fs.statSync(path.join(categoryPath, dir));
        return stat.isDirectory();
      });

      console.log(`${category} 下找到以下子分类: ${subcategoryDirs.join(', ')}`);

      // 遍历每个子分类
      for (const subcategory of subcategoryDirs) {
        const subcategoryPath = path.join(categoryPath, subcategory);
        const files = fs.readdirSync(subcategoryPath);
        
        // 获取所有txt文件（内容文件）
        const txtFiles = files.filter(file => file.endsWith('.txt'));
        // 获取所有jpg文件（图片文件）
        const jpgFiles = files.filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'));
        
        // 处理每个内容文件
        for (const txtFile of txtFiles) {
          const baseName = path.basename(txtFile, '.txt');
          // 找出匹配的图片文件
          const matchingImages = jpgFiles.filter(img => img.startsWith(baseName));
          
          if (matchingImages.length > 0) {
            // 选择第一张作为主图
            const mainImage = matchingImages[0];
            // 其余图片作为附加图片
            const additionalImages = matchingImages.slice(1);
            
            // 将绝对路径转换为相对于服务器的URL路径
            const mainImagePath = `/uploads/learn/${category}/${subcategory}/${mainImage}`;
            const additionalImagePaths = additionalImages.map(img => 
              `/uploads/learn/${category}/${subcategory}/${img}`
            ).join(',');
            
            // 读取内容文件以提取描述
            const contentFilePath = `/uploads/learn/${category}/${subcategory}/${txtFile}`;
            const absoluteContentPath = path.join(categoryPath, subcategory, txtFile);
            let description = '';
            let content = '';
            
            if (fs.existsSync(absoluteContentPath)) {
              content = fs.readFileSync(absoluteContentPath, 'utf8');
              // 提取第一段作为描述（最多200个字符）
              const firstParagraph = content.split('\n\n')[0] || '';
              description = firstParagraph.substring(0, 200) + (firstParagraph.length > 200 ? '...' : '');
            }
            
            // 生成标题
            const title = `${baseName}${description ? '：' + description.substring(0, 20) + '...' : ''}`;
            
            // 插入数据
            await connection.query(`
              INSERT INTO learn_items 
              (category, subcategory, title, description, image_path, content_file_path, additional_images) 
              VALUES 
              (?, ?, ?, ?, ?, ?, ?)
            `, [
              category,
              subcategory,
              title,
              description,
              mainImagePath,
              contentFilePath,
              additionalImagePaths || null
            ]);
            
            console.log(`已插入: ${category} > ${subcategory} > ${baseName}`);
          } else {
            console.log(`警告: ${baseName}.txt 没有匹配的图片文件，已跳过`);
          }
        }
      }
    }

    // 查看插入的数据数量
    const [countResult] = await connection.query('SELECT COUNT(*) as count FROM learn_items');
    console.log(`总共插入了 ${countResult[0].count} 条数据到 learn_items 表`);

    console.log('Learn 数据库初始化完成！');
  } catch (error) {
    console.error('初始化数据库过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行初始化
initLearnDatabase().then(() => {
  console.log('脚本执行完毕');
}).catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
