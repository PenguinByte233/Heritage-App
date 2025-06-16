const { pool } = require('../config/db');

class LearnModel {
  // 获取所有分类及子分类
  static async getCategories() {
    const [rows] = await pool.query(`
      SELECT DISTINCT category, subcategory, id, image_path, description 
      FROM learn_items
      ORDER BY category, subcategory
    `);
    
    // 组织数据结构
    const categories = {};
    rows.forEach(row => {
      if (!categories[row.category]) {
        categories[row.category] = {
          category: row.category,
          subcategories: []
        };
      }
      
      categories[row.category].subcategories.push({
        name: row.subcategory,
        id: row.id,
        image_path: row.image_path,
        description: row.description
      });
    });
    
    return Object.values(categories);
  }
  
  // 根据ID获取详细内容
  static async getItemById(id) {
    const [rows] = await pool.query('SELECT * FROM learn_items WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    const item = rows[0];
    
    // 读取内容文件
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), item.content_file_path);
    
    let content = '';
    try {
      if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, 'utf8');
      }
    } catch (error) {
      console.error('读取内容文件失败:', error);
    }
    
    // 处理额外图片
    let additionalImages = [];
    if (item.additional_images) {
      additionalImages = item.additional_images.split(',');
    }
    
    return {
      ...item,
      content,
      additional_images: additionalImages
    };
  }
}

module.exports = LearnModel; 