const { pool } = require('../config/db');

class Tutorial {
  // 获取所有教程
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM tutorials');
      return rows;
    } catch (error) {
      console.error('获取教程列表出错:', error);
      throw error;
    }
  }

  // 根据分类ID获取教程
  static async findByCategoryId(categoryId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM tutorials WHERE category_id = ?',
        [categoryId]
      );
      return rows;
    } catch (error) {
      console.error(`获取分类(ID: ${categoryId})的教程出错:`, error);
      throw error;
    }
  }

  // 根据ID获取单个教程
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM tutorials WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`获取教程(ID: ${id})出错:`, error);
      throw error;
    }
  }

  // 创建新教程
  static async create(title, categoryId, content = null, videoUrl = null, coverUrl = null) {
    try {
      const [result] = await pool.query(
        'INSERT INTO tutorials (title, category_id, content, video_url, cover_url) VALUES (?, ?, ?, ?, ?)',
        [title, categoryId, content, videoUrl, coverUrl]
      );
      const id = result.insertId;
      return { 
        id, 
        title, 
        category_id: categoryId, 
        content, 
        video_url: videoUrl,
        cover_url: coverUrl
      };
    } catch (error) {
      console.error('创建教程出错:', error);
      throw error;
    }
  }

  // 更新教程
  static async update(id, title, categoryId, content = null, videoUrl = null, coverUrl = null) {
    try {
      // 构建更新查询
      let query = 'UPDATE tutorials SET title = ?, category_id = ?, content = ?';
      let params = [title, categoryId, content];
      
      // 如果提供了视频URL，则更新
      if (videoUrl !== undefined) {
        query += ', video_url = ?';
        params.push(videoUrl);
      }
      
      // 如果提供了封面URL，则更新
      if (coverUrl !== undefined) {
        query += ', cover_url = ?';
        params.push(coverUrl);
      }
      
      query += ' WHERE id = ?';
      params.push(id);
      
      const [result] = await pool.query(query, params);
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { 
        id, 
        title, 
        category_id: categoryId, 
        content, 
        video_url: videoUrl,
        cover_url: coverUrl
      };
    } catch (error) {
      console.error(`更新教程(ID: ${id})出错:`, error);
      throw error;
    }
  }

  // 删除教程
  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM tutorials WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`删除教程(ID: ${id})出错:`, error);
      throw error;
    }
  }

  // 搜索教程
  static async search(keyword) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM tutorials WHERE title LIKE ? OR content LIKE ?',
        [`%${keyword}%`, `%${keyword}%`]
      );
      return rows;
    } catch (error) {
      console.error(`搜索教程(关键词: ${keyword})出错:`, error);
      throw error;
    }
  }
}

module.exports = Tutorial; 