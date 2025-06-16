const LearnModel = require('../models/learn');

// 获取所有分类及子分类
exports.getCategories = async (req, res) => {
  try {
    const categories = await LearnModel.getCategories();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类失败，请稍后再试'
    });
  }
};

// 根据ID获取详细内容
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: '无效的ID'
      });
    }
    
    const item = await LearnModel.getItemById(parseInt(id));
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: '未找到相关内容'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('获取内容失败:', error);
    res.status(500).json({
      success: false,
      message: '获取内容失败，请稍后再试'
    });
  }
}; 