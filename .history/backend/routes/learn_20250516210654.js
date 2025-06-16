const express = require('express');
const router = express.Router();
const learnController = require('../controllers/learnController');

// 获取所有分类及子分类
router.get('/categories', learnController.getCategories);

// 根据ID获取详细内容
router.get('/items/:id', learnController.getItemById);

module.exports = router; 