const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { nickname, phone_number, password } = req.body;
    
    // 验证请求参数
    if (!nickname || !phone_number || !password) {
      return res.status(400).json({
        status: 'error',
        message: '请提供用户昵称、手机号和密码'
      });
    }
    
    const pool = req.app.locals.pool;
    
    // 检查手机号是否已存在
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE phone_number = ?',
      [phone_number]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: '该手机号已被注册'
      });
    }
    
    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 插入新用户
    await pool.query(
      'INSERT INTO users (nickname, phone_number, password) VALUES (?, ?, ?)',
      [nickname, phone_number, hashedPassword]
    );
    
    res.status(201).json({
      status: 'success',
      message: '注册成功'
    });
  } catch (error) {
    console.error('用户注册失败:', error);
    res.status(500).json({
      status: 'error',
      message: '注册失败，请稍后再试'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { phone_number, password } = req.body;
    
    // 验证请求参数
    if (!phone_number || !password) {
      return res.status(400).json({
        status: 'error',
        message: '请提供手机号和密码'
      });
    }
    
    const pool = req.app.locals.pool;
    
    // 查询用户
    const [users] = await pool.query(
      'SELECT * FROM users WHERE phone_number = ?',
      [phone_number]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: '手机号或密码错误'
      });
    }
    
    const user = users[0];
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: '手机号或密码错误'
      });
    }
    
    // 返回用户信息（不包含密码）
    res.json({
      status: 'success',
      data: {
        id: user.id,
        nickname: user.nickname,
        phone_number: user.phone_number
      },
      message: '登录成功'
    });
  } catch (error) {
    console.error('用户登录失败:', error);
    res.status(500).json({
      status: 'error',
      message: '登录失败，请稍后再试'
    });
  }
});

// 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = req.app.locals.pool;
    
    const [users] = await pool.query(
      'SELECT id, nickname, phone_number, created_at FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    res.json({
      status: 'success',
      data: users[0]
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取用户信息失败，请稍后再试'
    });
  }
});

module.exports = router; 