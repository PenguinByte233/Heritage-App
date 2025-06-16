const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 获取大标题下的小标题及封面图
router.get('/headers', async (req, res) => {
  try {
    const { title } = req.query;
    
    // 验证请求参数
    if (!title) {
      return res.status(400).json({
        status: 'error',
        message: '请提供大标题参数'
      });
    }
    
    const pool = req.app.locals.pool;
    
    // 查询指定大标题下的所有小标题及其封面图
    const [rows] = await pool.query(
      'SELECT subtitle, image_url FROM learning WHERE title = ?',
      [title]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '未找到相关内容'
      });
    }
    
    res.json({
      status: 'success',
      data: rows.map(item => ({
        subtitle: item.subtitle,
        image_url: item.image_url
      }))
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
    
    // 验证请求参数
    if (!subtitle) {
      return res.status(400).json({
        status: 'error',
        message: '请提供小标题参数'
      });
    }
    
    const pool = req.app.locals.pool;
    
    // 查询指定小标题的内容
    const [rows] = await pool.query(
      'SELECT image_url, all_images, content_url FROM learning WHERE subtitle = ?',
      [subtitle]
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
    
    // 返回图片和文本内容
    res.json({
      status: 'success',
      data: {
        images: images,
        text_content: textContent
      }
    });
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