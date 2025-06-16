const jwt = require('jsonwebtoken');
const User = require('../models/user');

// 从环境变量中获取JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'heritage_app_secret_key';

/**
 * 认证中间件 - 验证JWT令牌
 */
const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }
    
    // 提取令牌
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }
    
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'heritage_app_secret_key');
    
    // 将用户信息添加到请求对象
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '令牌已过期' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '无效的令牌' });
    }
    
    console.error('认证错误:', error);
    res.status(401).json({ error: '认证失败' });
  }
};

/**
 * 管理员权限中间件 - 在authMiddleware之后使用
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '无权访问此资源' });
  }
  
  next();
};

// 生成JWT令牌
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username
  };
  
  // 获取过期时间配置，默认为30天
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  generateToken
}; 