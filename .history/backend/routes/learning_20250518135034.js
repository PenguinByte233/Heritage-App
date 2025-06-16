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
    
    console.log(`获取内容请求，小标题: "${subtitle}"`);
    
    // 验证请求参数
    if (!subtitle) {
      console.error('请求缺少subtitle参数');
      return res.status(400).json({
        status: 'error',
        message: '请提供小标题参数'
      });
    }
    
    const pool = req.app.locals.pool;
    
    // 查询指定小标题的内容
    console.log(`执行查询: SELECT image_url, all_images, content_url FROM learning WHERE subtitle = "${subtitle}"`);
    const [rows] = await pool.query(
      'SELECT image_url, all_images, content_url FROM learning WHERE subtitle = ?',
      [subtitle]
    );
    
    if (rows.length === 0) {
      console.error(`未找到小标题为 "${subtitle}" 的内容`);
      return res.status(404).json({
        status: 'error',
        message: '未找到相关内容'
      });
    }
    
    console.log(`找到 ${rows.length} 条记录，第一条记录:`, rows[0]);
    
    const item = rows[0];
    
    // 读取内容文件
    let textContent = '';
    try {
      const filePath = path.join(process.cwd(), item.content_url);
      console.log(`尝试读取内容文件: ${filePath}`);
      if (fs.existsSync(filePath)) {
        textContent = fs.readFileSync(filePath, 'utf8');
        console.log(`成功读取内容文件，内容长度: ${textContent.length} 字符`);
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
      console.log(`从all_images字段获取图片: ${item.all_images}`);
      images = item.all_images.split(',');
    } else if (item.image_url) {
      // 如果没有all_images但有image_url，使用image_url
      console.log(`使用单个image_url: ${item.image_url}`);
      images = [item.image_url];
    }
    
    console.log(`处理后的图片数组，共 ${images.length} 张图片:`);
    images.forEach((url, index) => {
      console.log(`图片 ${index + 1}: ${url}`);
    });
    
    // 返回图片和文本内容
    const responseData = {
      status: 'success',
      data: {
        images: images,
        text_content: textContent
      }
    };
    
    console.log('返回响应数据');
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