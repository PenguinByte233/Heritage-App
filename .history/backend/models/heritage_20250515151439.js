const { pool } = require('../config/db');

// 非遗大类模型
class HeritageType {
  // 获取所有非遗大类
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM heritage_types');
      return rows;
    } catch (error) {
      console.error('获取非遗大类列表出错:', error);
      throw error;
    }
  }

  // 根据ID获取单个非遗大类
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM heritage_types WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`获取非遗大类(ID: ${id})出错:`, error);
      throw error;
    }
  }

  // 创建新的非遗大类
  static async create(name, description, imageUrl = null) {
    try {
      const [result] = await pool.query(
        'INSERT INTO heritage_types (name, description, image_url) VALUES (?, ?, ?)',
        [name, description, imageUrl]
      );
      const id = result.insertId;
      return { id, name, description, image_url: imageUrl };
    } catch (error) {
      console.error('创建非遗大类出错:', error);
      throw error;
    }
  }

  // 更新非遗大类
  static async update(id, name, description, imageUrl = null) {
    try {
      // 如果不需要更新图片，则不包含图片字段
      let query = 'UPDATE heritage_types SET name = ?, description = ?';
      let params = [name, description];
      
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
      
      return { id, name, description, image_url: imageUrl };
    } catch (error) {
      console.error(`更新非遗大类(ID: ${id})出错:`, error);
      throw error;
    }
  }

  // 删除非遗大类
  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM heritage_types WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`删除非遗大类(ID: ${id})出错:`, error);
      throw error;
    }
  }
}

// 非遗子类模型
class Category {
  // 获取所有子类
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM categories');
      return rows;
    } catch (error) {
      console.error('获取子类列表出错:', error);
      throw error;
    }
  }

  // 根据非遗大类ID获取子类
  static async findByHeritageTypeId(heritageTypeId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM categories WHERE heritage_type_id = ?',
        [heritageTypeId]
      );
      return rows;
    } catch (error) {
      console.error(`获取非遗大类(ID: ${heritageTypeId})的子类出错:`, error);
      throw error;
    }
  }

  // 根据ID获取单个子类
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`获取子类(ID: ${id})出错:`, error);
      throw error;
    }
  }

  // 创建新的子类
  static async create(name, heritageTypeId) {
    try {
      const [result] = await pool.query(
        'INSERT INTO categories (name, heritage_type_id) VALUES (?, ?)',
        [name, heritageTypeId]
      );
      const id = result.insertId;
      return { id, name, heritage_type_id: heritageTypeId };
    } catch (error) {
      console.error('创建子类出错:', error);
      throw error;
    }
  }

  // 更新子类
  static async update(id, name, heritageTypeId) {
    try {
      const [result] = await pool.query(
        'UPDATE categories SET name = ?, heritage_type_id = ? WHERE id = ?',
        [name, heritageTypeId, id]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { id, name, heritage_type_id: heritageTypeId };
    } catch (error) {
      console.error(`更新子类(ID: ${id})出错:`, error);
      throw error;
    }
  }

  // 删除子类
  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`删除子类(ID: ${id})出错:`, error);
      throw error;
    }
  }
}

module.exports = {
  HeritageType,
  Category
}; 