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

  // 根据大标题获取卡片信息
  static async getItemsByCategory(category) {
    const [rows] = await pool.query(`
      SELECT 
        id,
        category,
        subcategory,
        title,
        description,
        image_path
      FROM learn_items
      WHERE category = ?
      ORDER BY subcategory, id
    `, [category]);
    
    if (rows.length === 0) {
      return [];
    }
    
    // 将项目按子分类组织
    const result = {};
    rows.forEach(item => {
      if (!result[item.subcategory]) {
        result[item.subcategory] = [];
      }
      
      // 创建卡片数据结构
      result[item.subcategory].push({
        id: item.id,
        title: item.title,
        description: item.description?.substring(0, 50) + (item.description?.length > 50 ? '...' : ''),
        image_path: item.image_path
      });
    });
    
    return {
      category,
      subcategories: Object.keys(result).map(subcategory => ({
        name: subcategory,
        items: result[subcategory]
      }))
    };
  }
  
  // 根据标题获取详细内容
  static async getItemDetailByTitle(title) {
    // 使用LIKE操作符进行模糊匹配，确保可以找到包含标题的项目
    const [rows] = await pool.query(`
      SELECT * FROM learn_items 
      WHERE title LIKE ? OR title = ?
      LIMIT 1
    `, [`%${title}%`, title]);
    
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
      id: item.id,
      category: item.category,
      subcategory: item.subcategory,
      title: item.title,
      description: item.description,
      content,
      image_path: item.image_path,
      additional_images: additionalImages,
      created_at: item.created_at
    };
  }
}

module.exports = LearnModel; 