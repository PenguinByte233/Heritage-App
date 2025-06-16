require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/db');

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 测试数据库连接
testConnection();

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/heritage', require('./routes/heritage'));
app.use('/api/products', require('./routes/products'));
app.use('/api/tutorials', require('./routes/tutorials'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: '非遗小程序 API 服务正在运行',
    version: '1.0.0',
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请联系管理员'
  });
});

// 未找到路由处理
app.use((req, res) => {
  res.status(404).json({
    error: '未找到',
    message: `路径 ${req.originalUrl} 不存在`
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`访问 http://localhost:${PORT} 查看API`);
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

module.exports = app; 