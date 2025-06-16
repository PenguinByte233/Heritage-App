const express = require('express');
const router = express.Router();

// 获取所有商品
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    
    // 查询所有商品
    const [rows] = await pool.query('SELECT * FROM products');
    
    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取商品列表失败，请稍后再试'
    });
  }
});

// 获取商品详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = req.app.locals.pool;
    
    // 查询指定ID的商品
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '商品不存在'
      });
    }
    
    res.json({
      status: 'success',
      data: rows[0]
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取商品详情失败，请稍后再试'
    });
  }
});

// 根据分类获取商品
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const pool = req.app.locals.pool;
    
    // 查询指定分类的商品
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE category = ?',
      [category]
    );
    
    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('获取分类商品失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取分类商品失败，请稍后再试'
    });
  }
});

// 获取所有商品分类
router.get('/categories/all', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    
    // 查询所有不同的商品分类
    const [rows] = await pool.query(
      'SELECT DISTINCT category FROM products'
    );
    
    res.json({
      status: 'success',
      data: rows.map(row => row.category)
    });
  } catch (error) {
    console.error('获取商品分类失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取商品分类失败，请稍后再试'
    });
  }
});

module.exports = router; 