const { pool } = require('../config/db');

class Post {
  // 获取所有帖子
  static async findAll(limit = 10, offset = 0) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, u.username, u.avatar 
         FROM posts p 
         LEFT JOIN users u ON p.user_id = u.id 
         ORDER BY p.created_at DESC 
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      return rows;
    } catch (error) {
      console.error('获取帖子列表出错:', error);
      throw error;
    }
  }

  // 根据ID获取单个帖子
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, u.username, u.avatar 
         FROM posts p 
         LEFT JOIN users u ON p.user_id = u.id 
         WHERE p.id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error(`获取帖子(ID: ${id})出错:`, error);
      throw error;
    }
  }

  // 获取用户的所有帖子
  static async findByUserId(userId, limit = 10, offset = 0) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, u.username, u.avatar 
         FROM posts p 
         LEFT JOIN users u ON p.user_id = u.id 
         WHERE p.user_id = ? 
         ORDER BY p.created_at DESC 
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      return rows;
    } catch (error) {
      console.error(`获取用户(ID: ${userId})的帖子出错:`, error);
      throw error;
    }
  }

  // 创建新帖子
  static async create(userId, content, imageUrls = null) {
    try {
      const [result] = await pool.query(
        'INSERT INTO posts (user_id, content, image_urls) VALUES (?, ?, ?)',
        [userId, content, imageUrls ? JSON.stringify(imageUrls) : null]
      );
      const id = result.insertId;
      
      // 获取新创建的帖子详情
      return await this.findById(id);
    } catch (error) {
      console.error('创建帖子出错:', error);
      throw error;
    }
  }

  // 更新帖子
  static async update(id, content, imageUrls = null) {
    try {
      const [result] = await pool.query(
        'UPDATE posts SET content = ?, image_urls = ? WHERE id = ?',
        [content, imageUrls ? JSON.stringify(imageUrls) : null, id]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      // 获取更新后的帖子详情
      return await this.findById(id);
    } catch (error) {
      console.error(`更新帖子(ID: ${id})出错:`, error);
      throw error;
    }
  }

  // 删除帖子
  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`删除帖子(ID: ${id})出错:`, error);
      throw error;
    }
  }

  // 搜索帖子
  static async search(keyword, limit = 10, offset = 0) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, u.username, u.avatar 
         FROM posts p 
         LEFT JOIN users u ON p.user_id = u.id 
         WHERE p.content LIKE ? 
         ORDER BY p.created_at DESC 
         LIMIT ? OFFSET ?`,
        [`%${keyword}%`, limit, offset]
      );
      return rows;
    } catch (error) {
      console.error(`搜索帖子(关键词: ${keyword})出错:`, error);
      throw error;
    }
  }
  
  // 获取帖子评论
  static async getComments(postId, limit = 10, offset = 0) {
    try {
      const [rows] = await pool.query(
        `SELECT c.*, u.username, u.avatar 
         FROM comments c 
         LEFT JOIN users u ON c.user_id = u.id 
         WHERE c.post_id = ? 
         ORDER BY c.created_at ASC 
         LIMIT ? OFFSET ?`,
        [postId, limit, offset]
      );
      return rows;
    } catch (error) {
      console.error(`获取帖子(ID: ${postId})评论出错:`, error);
      throw error;
    }
  }
  
  // 添加评论
  static async addComment(postId, userId, content) {
    try {
      const [result] = await pool.query(
        'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
        [postId, userId, content]
      );
      
      const id = result.insertId;
      
      // 获取新创建的评论详情
      const [commentRows] = await pool.query(
        `SELECT c.*, u.username, u.avatar 
         FROM comments c 
         LEFT JOIN users u ON c.user_id = u.id 
         WHERE c.id = ?`,
        [id]
      );
      
      return commentRows[0] || null;
    } catch (error) {
      console.error(`添加评论到帖子(ID: ${postId})出错:`, error);
      throw error;
    }
  }
  
  // 点赞帖子
  static async like(postId, userId) {
    try {
      // 检查是否已经点赞
      const [existingLikes] = await pool.query(
        'SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );
      
      if (existingLikes.length > 0) {
        return { message: '已经点赞过此帖子' };
      }
      
      // 添加点赞记录
      await pool.query(
        'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
        [postId, userId]
      );
      
      // 更新帖子点赞数
      await pool.query(
        'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?',
        [postId]
      );
      
      return { success: true, message: '点赞成功' };
    } catch (error) {
      console.error(`点赞帖子(ID: ${postId})出错:`, error);
      throw error;
    }
  }
  
  // 取消点赞
  static async unlike(postId, userId) {
    try {
      // 删除点赞记录
      const [result] = await pool.query(
        'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );
      
      if (result.affectedRows === 0) {
        return { message: '未找到点赞记录' };
      }
      
      // 更新帖子点赞数
      await pool.query(
        'UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?',
        [postId]
      );
      
      return { success: true, message: '取消点赞成功' };
    } catch (error) {
      console.error(`取消点赞帖子(ID: ${postId})出错:`, error);
      throw error;
    }
  }
}

module.exports = Post; 