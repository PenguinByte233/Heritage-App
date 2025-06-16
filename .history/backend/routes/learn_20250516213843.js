const express = require('express');
const router = express.Router();
const learnController = require('../controllers/learnController');

// 获取所有分类及子分类
router.get('/categories', learnController.getCategories);

// 根据ID获取详细内容
router.get('/items/:id', learnController.getItemById);

// 根据大标题获取卡片信息
router.get('/category/:category', learnController.getItemsByCategory);

// 根据小标题获取详细内容
router.get('/detail/:title', learnController.getItemDetailByTitle);

module.exports = router; 