const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 获取大标题下的小标题及封面图
router.get('/headers', async (req, res) => {
  try {
    const { title } = req.query;
    
    console.log(`\n接收到获取标题请求，大标题: "${title}"`);
    
    // 验证请求参数
    if (!title) {
      console.error('缺少title参数');
      return res.status(400).json({
        status: 'error',
        message: '请提供大标题参数'
      });
    }
    
    const pool = req.app.locals.pool;
    
    // 查询指定大标题下的所有小标题及其封面图和所有图片
    console.log(`执行SQL: SELECT subtitle, image_url, all_images FROM learning WHERE title = "${title}"`);
    const [rows] = await pool.query(
      'SELECT subtitle, image_url, all_images FROM learning WHERE title = ?',
      [title]
    );
    
    if (rows.length === 0) {
      console.error(`未找到大标题 "${title}" 的数据`);
      return res.status(404).json({
        status: 'error',
        message: '未找到相关内容'
      });
    }
    
    console.log(`查询结果: 找到 ${rows.length} 条记录`);
    
    // 处理每个项目的图片数组
    const processedData = rows.map((item, index) => {
      console.log(`\n处理第 ${index+1} 条记录 [${item.subtitle}]`);
      console.log(`  封面图: ${item.image_url || '无'}`);
      console.log(`  all_images: ${item.all_images || '无'}`);
      
      let images = [];
      if (item.all_images) {
        // 如果有all_images字段，使用它作为图片数组
        images = item.all_images.split(',');
        console.log(`  拆分all_images得到 ${images.length} 张图片`);
      } else if (item.image_url) {
        // 如果没有all_images但有image_url，使用image_url
        images = [item.image_url];
        console.log(`  使用image_url作为唯一图片`);
      }
      
      const result = {
        subtitle: item.subtitle,
        image_url: item.image_url, // 保留单个封面图字段兼容旧代码
        images: images // 新增图片数组字段
      };
      
      console.log(`  处理结果: 标题=${result.subtitle}, 封面图=${result.image_url}, 图片数组长度=${result.images.length}`);
      return result;
    });
    
    console.log(`\n返回数据: ${processedData.length} 条记录`);
    res.json({
      status: 'success',
      data: processedData
    });
  } catch (error) {
    console.error('获取小标题列表失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取小标题列表失败，请稍后再试'
    });
  }
});

// 获取小标题对应内容
router.get('/content', async (req, res) => {
  try {
    const { subtitle } = req.query;
    
    console.log(`\n获取内容请求，小标题: "${subtitle}"`);
    
    // 验证请求参数
    if (!subtitle) {
      console.error('请求缺少subtitle参数');
      return res.status(400).json({
        status: 'error',
        message: '请提供小标题参数'
      });
    }
    
    const pool = req.app.locals.pool;
    
    // 查询指定小标题的内容，确保查询 all_images 和 all_content_urls 字段
    console.log(`执行查询: SELECT image_url, all_images, content_url, all_content_urls FROM learning WHERE subtitle = "${subtitle}"`);
    const [rows] = await pool.query(
      'SELECT image_url, all_images, content_url, all_content_urls FROM learning WHERE subtitle = ?',
      [subtitle]
    );
    
    if (rows.length === 0) {
      console.error(`未找到小标题为 "${subtitle}" 的内容`);
      return res.status(404).json({
        status: 'error',
        message: '未找到相关内容'
      });
    }
    
    console.log(`找到 ${rows.length} 条记录，第一条记录:`, JSON.stringify(rows[0], null, 2));
    
    const item = rows[0];
    
    // 处理图片
    let images = [];
    console.log(`\n处理图片数据:`);
    console.log(`image_url: ${item.image_url || '无'}`);
    console.log(`all_images: ${item.all_images || '无'}`);
    
    if (item.all_images) {
      // 如果有all_images字段，使用它
      console.log(`从all_images字段获取图片，原始值: "${item.all_images}"`);
      // 分割图片路径并去除空字符串
      images = item.all_images.split(',').filter(img => img.trim() !== '');
      console.log(`分割后得到 ${images.length} 张图片:`);
      images.forEach((url, idx) => console.log(`  [${idx+1}] ${url}`));
    } else if (item.image_url) {
      // 如果没有all_images但有image_url，使用image_url
      console.log(`未找到all_images，使用单个image_url: ${item.image_url}`);
      images = [item.image_url];
    }
    
    // 如果images为空但有image_url，确保至少添加image_url
    if (images.length === 0 && item.image_url) {
      console.log(`images数组为空，添加image_url: ${item.image_url}`);
      images.push(item.image_url);
    }
    
    console.log(`\n最终处理后的图片数组，共 ${images.length} 张图片:`);
    images.forEach((url, index) => {
      console.log(`  图片 ${index + 1}: ${url}`);
    });
    
    // 处理内容文件
    console.log(`\n处理内容文件:`);
    console.log(`content_url: ${item.content_url || '无'}`);
    console.log(`all_content_urls: ${item.all_content_urls || '无'}`);
    
    let allContents = [];
    
    // 如果有 all_content_urls 字段，使用它获取所有内容
    if (item.all_content_urls) {
      const contentUrls = item.all_content_urls.split(';').filter(url => url.trim() !== '');
      console.log(`从all_content_urls字段获取内容，共 ${contentUrls.length} 个文件`);
      
      // 读取所有内容文件
      for (let i = 0; i < contentUrls.length; i++) {
        const contentUrl = contentUrls[i];
        console.log(`读取内容文件 ${i+1}/${contentUrls.length}: ${contentUrl}`);
        
        try {
          const contentPath = path.join(process.cwd(), contentUrl);
          if (fs.existsSync(contentPath)) {
            const content = fs.readFileSync(contentPath, 'utf8');
            // 提取文件名作为标题
            const fileName = path.basename(contentUrl);
            allContents.push({
              title: fileName.replace(/\.[^/.]+$/, ""), // 移除扩展名
              content: content,
              source: contentUrl
            });
            console.log(`  成功读取，内容长度: ${content.length} 字符`);
          } else {
            console.error(`  内容文件不存在: ${contentPath}`);
            allContents.push({
              title: path.basename(contentUrl).replace(/\.[^/.]+$/, ""),
              content: '内容文件不存在',
              source: contentUrl,
              error: true
            });
          }
        } catch (error) {
          console.error(`  读取内容文件失败:`, error);
          allContents.push({
            title: path.basename(contentUrl).replace(/\.[^/.]+$/, ""),
            content: '读取内容文件失败',
            source: contentUrl,
            error: true
          });
        }
      }
    } 
    // 如果没有all_content_urls但有content_url，使用单个content_url
    else if (item.content_url) {
      console.log(`使用单个content_url: ${item.content_url}`);
      try {
        const contentPath = path.join(process.cwd(), item.content_url);
        if (fs.existsSync(contentPath)) {
          const content = fs.readFileSync(contentPath, 'utf8');
          const fileName = path.basename(item.content_url);
          allContents.push({
            title: fileName.replace(/\.[^/.]+$/, ""),
            content: content,
            source: item.content_url
          });
          console.log(`  成功读取，内容长度: ${content.length} 字符`);
        } else {
          console.error(`  内容文件不存在: ${contentPath}`);
          allContents.push({
            title: path.basename(item.content_url).replace(/\.[^/.]+$/, ""),
            content: '内容文件不存在',
            source: item.content_url,
            error: true
          });
        }
      } catch (error) {
        console.error(`  读取内容文件失败:`, error);
        allContents.push({
          title: path.basename(item.content_url).replace(/\.[^/.]+$/, ""),
          content: '读取内容文件失败',
          source: item.content_url,
          error: true
        });
      }
    }
    
    console.log(`处理后的内容数量: ${allContents.length}`);
    
    // 为了向后兼容，取第一个内容文件作为主要文本
    const mainTextContent = allContents.length > 0 ? allContents[0].content : '';
    
    // 返回图片和文本内容
    const responseData = {
      status: 'success',
      data: {
        images: images,
        text_content: mainTextContent, // 兼容旧版本的客户端
        all_contents: allContents // 新增字段，包含所有内容
      }
    };
    
    console.log('返回响应数据:', JSON.stringify(responseData.data.all_contents.map(c => ({title: c.title, length: c.content.length})), null, 2));
    res.json(responseData);
  } catch (error) {
    console.error('获取内容失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取内容失败，请稍后再试'
    });
  }
});

// 获取所有大标题
router.get('/titles', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    
    // 查询所有不同的大标题
    const [rows] = await pool.query(
      'SELECT DISTINCT title FROM learning'
    );
    
    res.json({
      status: 'success',
      data: rows.map(row => row.title)
    });
  } catch (error) {
    console.error('获取大标题列表失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取大标题列表失败，请稍后再试'
    });
  }
});

// 根据ID获取学习内容
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = req.app.locals.pool;
    
    // 查询指定ID的学习内容
    const [rows] = await pool.query(
      'SELECT * FROM learning WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '未找到相关内容'
      });
    }
    
    const item = rows[0];
    
    // 读取内容文件
    let textContent = '';
    try {
      const filePath = path.join(process.cwd(), item.content_url);
      if (fs.existsSync(filePath)) {
        textContent = fs.readFileSync(filePath, 'utf8');
      } else {
        console.error(`内容文件不存在: ${filePath}`);
      }
    } catch (error) {
      console.error('读取内容文件失败:', error);
    }
    
    // 处理图片URLs
    let images = [];
    if (item.all_images) {
      // 如果有all_images字段，使用它
      images = item.all_images.split(',');
    } else if (item.image_url) {
      // 如果没有all_images但有image_url，使用image_url
      images = [item.image_url];
    }
    
    // 返回完整内容
    res.json({
      status: 'success',
      data: {
        ...item,
        images: images,
        text_content: textContent
      }
    });
  } catch (error) {
    console.error('获取学习内容失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取学习内容失败，请稍后再试'
    });
  }
});

module.exports = router; 