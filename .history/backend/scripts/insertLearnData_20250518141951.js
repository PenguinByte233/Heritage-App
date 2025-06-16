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

// 提取文件名前缀（例如：从"回族服饰1.jpg"中提取"回族服饰"）
function extractPrefix(filename) {
  // 移除扩展名
  let nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  // 移除末尾的数字
  return nameWithoutExt.replace(/\d+$/, "");
}

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
      const categoryContents = fs.readdirSync(categoryPath, { withFileTypes: true });
      
      // 检查主类别目录的内容
      const hasSubdirectories = categoryContents.some(item => item.isDirectory());
      
      if (hasSubdirectories) {
        // 第一种情况：主类别/子类别/文件
        const subCategories = categoryContents
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
        
        console.log(`  发现 ${subCategories.length} 个子类别`);

        // 遍历每个子类别
        for (const subCategory of subCategories) {
          await processSubcategory(connection, mainCategory, subCategory, path.join(categoryPath, subCategory));
        }
      } else {
        // 第二种情况：主类别/文件
        // 查找所有文件
        const files = categoryContents.map(dirent => dirent.name);
        
        // 查找所有图片文件
        const imageFiles = files.filter(file => 
          /\.(jpg|jpeg|png|gif)$/i.test(file)
        );
        
        // 查找内容文件
        const contentFiles = files.filter(file => 
          /\.(txt|md|docx)$/i.test(file)
        );
        
        if (imageFiles.length > 0 && contentFiles.length > 0) {
          // 按文件名前缀对图片分组
          const imageGroups = {};
          
          imageFiles.forEach(file => {
            const prefix = extractPrefix(file);
            if (!imageGroups[prefix]) {
              imageGroups[prefix] = [];
            }
            imageGroups[prefix].push(file);
          });
          
          // 检查是否有特殊情况：通用图片名称（如"图片1.png"）
          const hasGenericImageNames = Object.keys(imageGroups).some(prefix => 
            prefix === "图片" || prefix === "image" || prefix === ""
          );
          
          if (hasGenericImageNames) {
            // 特殊情况处理：使用目录名作为subtitle，所有图片合为一组
            const allImageUrls = imageFiles.map(file => 
              `/uploads/assets/${mainCategory}/${file}`
            );
            
            // 使用第一张图片作为封面
            const imageUrl = allImageUrls[0];
            
            // 将所有图片URL合并为一个以逗号分隔的字符串
            const allImagesString = allImageUrls.join(',');
            
            // 处理所有内容文件
            const allContentUrls = contentFiles.map(file => 
              `/uploads/assets/${mainCategory}/${file}`
            );
            
            // 将所有内容文件URL合并为一个以分号分隔的字符串
            const allContentUrlsString = allContentUrls.join(';');
            
            // 内容文件路径（使用第一个内容文件）
            const contentUrl = allContentUrls[0];
            
            // 选择一个合适的子标题名称
            let subtitle = mainCategory;
            // 尝试从内容文件名中获取更好的子标题
            if (contentFiles.length > 0) {
              const contentFilePrefix = extractPrefix(contentFiles[0]);
              if (contentFilePrefix && contentFilePrefix !== "." && contentFilePrefix.length > 1) {
                subtitle = contentFilePrefix;
              }
            }
            
            console.log(`    图片数量: ${imageFiles.length}, 内容文件数量: ${contentFiles.length}`);
            console.log(`    所有内容文件: ${allContentUrlsString}`);
            
            // 准备插入数据
            let insertQuery, insertParams;
            
            try {
              // 先检查字段是否存在
              const [columns] = await connection.execute('SHOW COLUMNS FROM learning LIKE "all_content_urls"');
              
              if (columns.length > 0) {
                // 如果字段存在，使用新格式
                insertQuery = `
                  INSERT INTO learning (title, subtitle, image_url, all_images, content_url, all_content_urls) 
                  VALUES (?, ?, ?, ?, ?, ?)
                `;
                insertParams = [mainCategory, subtitle, imageUrl, allImagesString, contentUrl, allContentUrlsString];
              } else {
                // 如果字段不存在，使用旧格式
                insertQuery = `
                  INSERT INTO learning (title, subtitle, image_url, all_images, content_url) 
                  VALUES (?, ?, ?, ?, ?)
                `;
                insertParams = [mainCategory, subtitle, imageUrl, allImagesString, contentUrl];
                console.warn('    使用旧的插入格式（没有all_content_urls字段）');
              }
              
              // 执行插入
              const [result] = await connection.execute(insertQuery, insertParams);
              
              console.log(`    成功插入: ${mainCategory} - ${subtitle}, ID: ${result.insertId}, 图片数量: ${imageFiles.length}, 内容文件数量: ${contentFiles.length}`);
            } catch (error) {
              console.error(`    插入数据失败: ${subtitle}`, error);
              throw error;
            }
          } else {
            // 常规情况：按前缀处理
            // 处理每个前缀组
            for (const prefix in imageGroups) {
              // 查找匹配该前缀的所有内容文件
              const matchingContentFiles = contentFiles.filter(file => 
                file.startsWith(prefix) || extractPrefix(file) === prefix
              );
              
              if (matchingContentFiles.length > 0) {
                // 构建所有图片的URL数组
                const allImageUrls = imageGroups[prefix].map(file => 
                  `/uploads/assets/${mainCategory}/${file}`
                );
                
                // 使用第一张图片作为封面
                const imageUrl = allImageUrls[0];
                
                // 将所有图片URL合并为一个以逗号分隔的字符串
                const allImagesString = allImageUrls.join(',');
                
                // 处理所有内容文件
                let allContentUrls = [];
                
                // 将所有内容文件添加到数组中
                matchingContentFiles.forEach(contentFile => {
                  allContentUrls.push(`/uploads/assets/${mainCategory}/${contentFile}`);
                });
                
                // 将所有内容文件URL合并为一个以分号分隔的字符串
                const allContentUrlsString = allContentUrls.join(';');
                
                // 使用第一个内容文件作为主要内容URL（兼容旧代码）
                const contentUrl = allContentUrls[0];
                
                console.log(`    图片数量: ${imageGroups[prefix].length}, 内容文件数量: ${matchingContentFiles.length}`);
                console.log(`    所有内容文件: ${allContentUrlsString}`);
                
                // 准备插入数据
                let insertQuery, insertParams;
                
                try {
                  // 先检查字段是否存在
                  const [columns] = await connection.execute('SHOW COLUMNS FROM learning LIKE "all_content_urls"');
                  
                  if (columns.length > 0) {
                    // 如果字段存在，使用新格式
                    insertQuery = `
                      INSERT INTO learning (title, subtitle, image_url, all_images, content_url, all_content_urls) 
                      VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    insertParams = [mainCategory, prefix, imageUrl, allImagesString, contentUrl, allContentUrlsString];
                  } else {
                    // 如果字段不存在，使用旧格式
                    insertQuery = `
                      INSERT INTO learning (title, subtitle, image_url, all_images, content_url) 
                      VALUES (?, ?, ?, ?, ?)
                    `;
                    insertParams = [mainCategory, prefix, imageUrl, allImagesString, contentUrl];
                    console.warn('    使用旧的插入格式（没有all_content_urls字段）');
                  }
                  
                  // 执行插入
                  const [result] = await connection.execute(insertQuery, insertParams);
                  
                  console.log(`    成功插入: ${mainCategory} - ${prefix}, ID: ${result.insertId}, 图片数量: ${imageGroups[prefix].length}, 内容文件数量: ${matchingContentFiles.length}`);
                } catch (error) {
                  console.error(`    插入数据失败: ${prefix}`, error);
                  throw error;
                }
              } else {
                console.log(`    跳过: ${prefix} - 缺少匹配的内容文件`);
              }
            }
          }
        } else {
          console.log(`  跳过主类别: ${mainCategory} - 缺少图片或内容文件`);
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

// 处理子类别的函数
async function processSubcategory(connection, mainCategory, subCategory, subCategoryPath) {
  console.log(`    处理子类别: ${subCategory}`);
  
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
    
    // 处理所有内容文件
    let allContentUrls = [];
    
    // 将所有内容文件添加到数组中
    contentFiles.forEach(contentFile => {
      allContentUrls.push(`/uploads/assets/${mainCategory}/${subCategory}/${contentFile}`);
    });
    
    // 将所有内容文件URL合并为一个以分号分隔的字符串
    const allContentUrlsString = allContentUrls.join(';');
    
    // 使用第一个内容文件作为主要内容URL（兼容旧代码）
    const contentUrl = allContentUrls[0];
    
    console.log(`    图片数量: ${imageFiles.length}, 内容文件数量: ${contentFiles.length}`);
    console.log(`    所有内容文件: ${allContentUrlsString}`);
    
    // 准备插入数据
    const insertQuery = `
      INSERT INTO learning (title, subtitle, image_url, all_images, content_url, all_content_urls) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    // 检查learning表是否有all_content_urls字段，如果没有则添加
    try {
      // 先检查字段是否存在
      const [columns] = await connection.execute('SHOW COLUMNS FROM learning LIKE "all_content_urls"');
      
      if (columns.length === 0) {
        // 如果字段不存在，添加它
        await connection.execute('ALTER TABLE learning ADD COLUMN all_content_urls TEXT AFTER content_url');
        console.log('已添加all_content_urls字段');
      }
    } catch (error) {
      console.error('检查或添加all_content_urls字段时出错:', error);
      // 继续执行，即使出错也尝试插入数据
    }
    
    // 执行插入
    try {
      const [result] = await connection.execute(
        insertQuery, 
        [mainCategory, subCategory, imageUrl, allImagesString, contentUrl, allContentUrlsString]
      );
      
      console.log(`    成功插入: ${mainCategory} - ${subCategory}, ID: ${result.insertId}, 图片数量: ${imageFiles.length}, 内容文件数量: ${contentFiles.length}`);
    } catch (error) {
      // 如果添加了新字段但插入失败，尝试使用旧的查询（没有all_content_urls字段）
      if (error.message && error.message.includes('Unknown column')) {
        console.warn('    使用旧的插入格式（没有all_content_urls字段）');
        const oldInsertQuery = `
          INSERT INTO learning (title, subtitle, image_url, all_images, content_url) 
          VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await connection.execute(
          oldInsertQuery, 
          [mainCategory, subCategory, imageUrl, allImagesString, contentUrl]
        );
        
        console.log(`    成功插入(旧格式): ${mainCategory} - ${subCategory}, ID: ${result.insertId}, 图片数量: ${imageFiles.length}`);
      } else {
        throw error; // 如果是其他错误，继续抛出
      }
    }
  } else {
    console.log(`    跳过: ${subCategory} - 缺少图片或内容文件`);
  }
}

// 运行脚本
insertLearningData().catch(console.error);