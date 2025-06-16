const express = require('express');
const router = express.Router();

// 创建订单
router.post('/', async (req, res) => {
  let connection;
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
      'SELECT id, points FROM users WHERE id = ?',
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
    
    // 开始数据库事务
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 确认用户当前积分
      const [currentUser] = await connection.query(
        'SELECT points FROM users WHERE id = ? FOR UPDATE',
        [user_id]
      );
      
      const currentPoints = currentUser[0].points || 0;
      console.log(`用户当前积分: ${currentPoints}`);
      
      // 创建订单
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [user_id, product_id, quantity]
      );
      
      // 计算需要增加的积分 (每件商品15积分)
      const pointsToAdd = 15 * quantity;
      console.log(`需要增加的积分: ${pointsToAdd}`);
      
      // 计算更新后的总积分
      const newTotalPoints = currentPoints + pointsToAdd;
      console.log(`更新后的总积分: ${newTotalPoints}`);
      
      // 更新用户积分 - 使用绝对值而不是增量
      await connection.query(
        'UPDATE users SET points = ? WHERE id = ?',
        [newTotalPoints, user_id]
      );
      
      // 提交事务
      await connection.commit();
      
      // 获取用户更新后的积分 - 使用新的查询
      const [updatedUser] = await pool.query(
        'SELECT points FROM users WHERE id = ?',
        [user_id]
      );
      
      console.log(`确认更新后的积分: ${updatedUser[0].points}`);
      
      res.status(201).json({
        status: 'success',
        message: '订单创建成功',
        data: {
          id: orderResult.insertId,
          user_id,
          product_id,
          quantity,
          product_price: products[0].price,
          total_price: products[0].price * quantity,
          points_earned: pointsToAdd,
          total_points: updatedUser[0].points
        }
      });
    } catch (error) {
      // 如果出错，回滚事务
      if (connection) await connection.rollback();
      console.error('订单事务处理失败:', error);
      throw error;
    }
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({
      status: 'error',
      message: '创建订单失败，请稍后再试'
    });
  } finally {
    // 释放连接
    if (connection) connection.release();
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