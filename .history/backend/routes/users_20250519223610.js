const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置头像上传存储
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名，避免覆盖
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

const avatarUpload = multer({ 
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  },
  fileFilter: function (req, file, cb) {
    // 只允许上传图片
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('只允许上传图片文件!'), false);
    }
    cb(null, true);
  }
});

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
        phone_number: user.phone_number,
        avatar_url: user.avatar_url || '/static/images/avatar/空中花园.png',
        points: user.points || 0
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
      'SELECT id, nickname, phone_number, avatar_url, points, created_at FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    // 如果用户没有设置头像，返回默认头像路径
    if (!users[0].avatar_url) {
      users[0].avatar_url = '/static/images/avatar/空中花园.png';
    }
    
    // 确保返回积分字段，如果为null则设为0
    if (users[0].points === null) {
      users[0].points = 0;
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

// 添加更新头像接口
router.put('/:id/avatar', async (req, res) => {
  try {
    const { id } = req.params;
    const { avatar_url } = req.body;
    
    // 验证请求参数
    if (!avatar_url) {
      return res.status(400).json({
        status: 'error',
        message: '请提供头像URL'
      });
    }
    
    const pool = req.app.locals.pool;
    
    // 检查用户是否存在
    const [users] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    // 更新用户头像
    await pool.query(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatar_url, id]
    );
    
    res.json({
      status: 'success',
      message: '头像更新成功'
    });
  } catch (error) {
    console.error('更新头像失败:', error);
    res.status(500).json({
      status: 'error',
      message: '更新头像失败，请稍后再试'
    });
  }
});

// 头像上传接口
router.post('/upload/avatar', avatarUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: '没有上传文件'
      });
    }
    
    const user_id = req.body.user_id;
    
    if (!user_id) {
      return res.status(400).json({
        status: 'error',
        message: '请提供用户ID'
      });
    }
    
    // 获取上传文件的相对路径
    const relativePath = `/uploads/avatars/${req.file.filename}`;
    
    // 更新用户头像URL
    const pool = req.app.locals.pool;
    await pool.query(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [relativePath, user_id]
    );
    
    res.json({
      status: 'success',
      message: '头像上传成功',
      data: {
        url: relativePath
      }
    });
  } catch (error) {
    console.error('头像上传失败:', error);
    res.status(500).json({
      status: 'error',
      message: '头像上传失败，请稍后再试'
    });
  }
});

module.exports = router; 