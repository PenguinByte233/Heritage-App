const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// 获取数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'demo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 获取所有分类及子分类
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT category, subcategory, id, image_path, description 
      FROM learn_items
      ORDER BY category, subcategory
    `);
    
    // 组织数据结构
    const categories = {};
    rows.forEach(row => {
      if (!categories[row.category]) {
        categories[row.category] = {
          category: row.category,
          subcategories: []
        };
      }
      
      categories[row.category].subcategories.push({
        name: row.subcategory,
        id: row.id,
        image_path: row.image_path,
        description: row.description
      });
    });
    
    res.json({
      success: true,
      data: Object.values(categories)
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类失败，请稍后再试'
    });
  }
});

// 根据ID获取详细内容
router.get('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: '无效的ID'
      });
    }
    
    const [rows] = await pool.query('SELECT * FROM learn_items WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到相关内容'
      });
    }
    
    const item = rows[0];
    
    // 读取内容文件
    let content = '';
    try {
      const filePath = path.join(process.cwd(), item.content_file_path);
      if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, 'utf8');
      }
    } catch (error) {
      console.error('读取内容文件失败:', error);
    }
    
    // 处理额外图片
    let additionalImages = [];
    if (item.additional_images) {
      additionalImages = item.additional_images.split(',');
    }
    
    res.json({
      success: true,
      data: {
        ...item,
        content,
        additional_images: additionalImages
      }
    });
  } catch (error) {
    console.error('获取内容失败:', error);
    res.status(500).json({
      success: false,
      message: '获取内容失败，请稍后再试'
    });
  }
});

// 根据大标题获取卡片信息
router.get('/category/:category', async (req, res) => {
  try {
    // 获取并解码参数
    let { category } = req.params;
    
    // 如果参数包含大括号，去除它们
    if (category.startsWith('{') && category.endsWith('}')) {
      category = category.substring(1, category.length - 1);
    }
    
    // 确保参数已解码
    try {
      category = decodeURIComponent(category);
    } catch (e) {
      // 如果解码失败，保持原样
      console.log('参数解码失败，使用原始参数');
    }
    
    console.log('查询分类:', category); // 调试用
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的分类名称'
      });
    }
    
    const [rows] = await pool.query(`
      SELECT 
        id,
        category,
        subcategory,
        title,
        description,
        image_path
      FROM learn_items
      WHERE category = ?
      ORDER BY subcategory, id
    `, [category]);
    
    if (rows.length === 0) {
      return res.json({
        success: true,
        data: {
          category,
          subcategories: []
        }
      });
    }
    
    // 将项目按子分类组织
    const result = {};
    rows.forEach(item => {
      if (!result[item.subcategory]) {
        result[item.subcategory] = [];
      }
      
      // 创建卡片数据结构
      result[item.subcategory].push({
        id: item.id,
        title: item.title,
        description: item.description?.substring(0, 50) + (item.description?.length > 50 ? '...' : ''),
        image_path: item.image_path
      });
    });
    
    res.json({
      success: true,
      data: {
        category,
        subcategories: Object.keys(result).map(subcategory => ({
          name: subcategory,
          items: result[subcategory]
        }))
      }
    });
  } catch (error) {
    console.error('获取分类内容失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类内容失败，请稍后再试'
    });
  }
});

// 根据标题获取详细内容
router.get('/detail/:title', async (req, res) => {
  try {
    // 获取并解码参数
    let { title } = req.params;
    
    // 确保参数已解码
    try {
      title = decodeURIComponent(title);
    } catch (e) {
      // 如果解码失败，保持原样
      console.log('参数解码失败，使用原始参数');
    }
    
    console.log('查询标题:', title); // 调试用
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的标题'
      });
    }
    
    // 使用LIKE操作符进行模糊匹配，确保可以找到包含标题的项目
    const [rows] = await pool.query(`
      SELECT * FROM learn_items 
      WHERE title LIKE ? OR title = ?
      LIMIT 1
    `, [`%${title}%`, title]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到相关内容'
      });
    }
    
    const item = rows[0];
    
    // 读取内容文件
    let content = '';
    try {
      const filePath = path.join(process.cwd(), item.content_file_path);
      if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, 'utf8');
      }
    } catch (error) {
      console.error('读取内容文件失败:', error);
    }
    
    // 处理额外图片
    let additionalImages = [];
    if (item.additional_images) {
      additionalImages = item.additional_images.split(',');
    }
    
    res.json({
      success: true,
      data: {
        id: item.id,
        category: item.category,
        subcategory: item.subcategory,
        title: item.title,
        description: item.description,
        content,
        image_path: item.image_path,
        additional_images: additionalImages,
        created_at: item.created_at
      }
    });
  } catch (error) {
    console.error('获取详细内容失败:', error);
    res.status(500).json({
      success: false,
      message: '获取详细内容失败，请稍后再试'
    });
  }
});

module.exports = router; 