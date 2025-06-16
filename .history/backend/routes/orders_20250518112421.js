const express = require('express');
const router = express.Router();

// 创建订单
router.post('/', async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    
    // 验证请求参数
    if (!user_id || !product_id || !quantity) {
      return res.status(400).json({
        status: 'error',
        message: '请提供用户ID、商品ID和购买数量'
      });
    }
    
    // 验证数量是否为正整数
    if (quantity <= 0 || !Number.isInteger(Number(quantity))) {
      return res.status(400).json({
        status: 'error',
        message: '购买数量必须为正整数'
      });
    }
    
    const pool = req.app.locals.pool;
    
    // 验证用户是否存在
    const [users] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [user_id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    // 验证商品是否存在
    const [products] = await pool.query(
      'SELECT id, price FROM products WHERE id = ?',
      [product_id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '商品不存在'
      });
    }
    
    // 创建订单
    const [result] = await pool.query(
      'INSERT INTO orders (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [user_id, product_id, quantity]
    );
    
    res.status(201).json({
      status: 'success',
      message: '订单创建成功',
      data: {
        id: result.insertId,
        user_id,
        product_id,
        quantity,
        product_price: products[0].price,
        total_price: products[0].price * quantity
      }
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({
      status: 'error',
      message: '创建订单失败，请稍后再试'
    });
  }
});

// 获取用户的所有订单
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const pool = req.app.locals.pool;
    
    // 查询用户的所有订单，并关联商品信息
    const [rows] = await pool.query(`
      SELECT o.id, o.user_id, o.product_id, o.quantity, o.created_at,
             p.name AS product_name, p.price AS product_price, p.image_url AS product_image
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [user_id]);
    
    // 计算每个订单的总价
    const orders = rows.map(order => ({
      ...order,
      total_price: order.product_price * order.quantity
    }));
    
    res.json({
      status: 'success',
      data: orders
    });
  } catch (error) {
    console.error('获取用户订单失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取用户订单失败，请稍后再试'
    });
  }
});

// 获取订单详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = req.app.locals.pool;
    
    // 查询订单详情，并关联商品信息
    const [rows] = await pool.query(`
      SELECT o.id, o.user_id, o.product_id, o.quantity, o.created_at,
             p.name AS product_name, p.price AS product_price, p.image_url AS product_image
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '订单不存在'
      });
    }
    
    const order = rows[0];
    
    // 计算订单总价
    order.total_price = order.product_price * order.quantity;
    
    res.json({
      status: 'success',
      data: order
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取订单详情失败，请稍后再试'
    });
  }
});

module.exports = router; 