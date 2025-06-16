const { pool } = require('../config/db');

class Product {
  // 获取所有商品
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM products');
      return rows;
    } catch (error) {
      console.error('获取商品列表出错:', error);
      throw error;
    }
  }

  // 根据分类ID获取商品
  static async findByCategoryId(categoryId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM products WHERE category_id = ?',
        [categoryId]
      );
      return rows;
    } catch (error) {
      console.error(`获取分类(ID: ${categoryId})的商品出错:`, error);
      throw error;
    }
  }

  // 根据ID获取单个商品
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`获取商品(ID: ${id})出错:`, error);
      throw error;
    }
  }

  // 创建新商品
  static async create(name, price, categoryId, description = null, imageUrl = null) {
    try {
      const [result] = await pool.query(
        'INSERT INTO products (name, price, category_id, description, image_url) VALUES (?, ?, ?, ?, ?)',
        [name, price, categoryId, description, imageUrl]
      );
      const id = result.insertId;
      return { 
        id, 
        name, 
        price, 
        category_id: categoryId, 
        description, 
        image_url: imageUrl 
      };
    } catch (error) {
      console.error('创建商品出错:', error);
      throw error;
    }
  }

  // 更新商品
  static async update(id, name, price, categoryId, description = null, imageUrl = null) {
    try {
      // 如果不需要更新图片，则不包含图片字段
      let query = 'UPDATE products SET name = ?, price = ?, category_id = ?, description = ?';
      let params = [name, price, categoryId, description];
      
      if (imageUrl) {
        query += ', image_url = ?';
        params.push(imageUrl);
      }
      
      query += ' WHERE id = ?';
      params.push(id);
      
      const [result] = await pool.query(query, params);
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { 
        id, 
        name, 
        price, 
        category_id: categoryId, 
        description, 
        image_url: imageUrl 
      };
    } catch (error) {
      console.error(`更新商品(ID: ${id})出错:`, error);
      throw error;
    }
  }

  // 删除商品
  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`删除商品(ID: ${id})出错:`, error);
      throw error;
    }
  }

  // 搜索商品
  static async search(keyword) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?',
        [`%${keyword}%`, `%${keyword}%`]
      );
      return rows;
    } catch (error) {
      console.error(`搜索商品(关键词: ${keyword})出错:`, error);
      throw error;
    }
  }
}

module.exports = Product; 