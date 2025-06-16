const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  // 通过ID查找用户
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT id, username, email, phone, avatar, bio, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error(`获取用户(ID: ${id})出错:`, error);
      throw error;
    }
  }

  // 通过用户名查找用户
  static async findByUsername(username) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0] || null;
    } catch (error) {
      console.error(`通过用户名查找用户(${username})出错:`, error);
      throw error;
    }
  }

  // 通过邮箱查找用户
  static async findByEmail(email) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0] || null;
    } catch (error) {
      console.error(`通过邮箱查找用户(${email})出错:`, error);
      throw error;
    }
  }

  // 通过手机号查找用户
  static async findByPhone(phone) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
      return rows[0] || null;
    } catch (error) {
      console.error(`通过手机号查找用户(${phone})出错:`, error);
      throw error;
    }
  }

  // 创建新用户
  static async create(userData) {
    const { username, password, email = null, phone = null, avatar = null, bio = null } = userData;
    
    try {
      // 加密密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const [result] = await pool.query(
        'INSERT INTO users (username, password, email, phone, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, email, phone, avatar, bio]
      );
      
      const id = result.insertId;
      
      return {
        id,
        username,
        email,
        phone,
        avatar,
        bio
      };
    } catch (error) {
      console.error('创建用户出错:', error);
      throw error;
    }
  }

  // 更新用户信息
  static async update(id, userData) {
    const { username, email, phone, avatar, bio } = userData;
    
    try {
      let query = 'UPDATE users SET updated_at = NOW()';
      const params = [];
      
      // 只更新提供的字段
      if (username) {
        query += ', username = ?';
        params.push(username);
      }
      
      if (email) {
        query += ', email = ?';
        params.push(email);
      }
      
      if (phone) {
        query += ', phone = ?';
        params.push(phone);
      }
      
      if (avatar) {
        query += ', avatar = ?';
        params.push(avatar);
      }
      
      if (bio) {
        query += ', bio = ?';
        params.push(bio);
      }
      
      query += ' WHERE id = ?';
      params.push(id);
      
      const [result] = await pool.query(query, params);
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return await this.findById(id);
    } catch (error) {
      console.error(`更新用户(ID: ${id})出错:`, error);
      throw error;
    }
  }

  // 更新用户密码
  static async updatePassword(id, newPassword) {
    try {
      // 加密新密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      const [result] = await pool.query(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
        [hashedPassword, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`更新用户(ID: ${id})密码出错:`, error);
      throw error;
    }
  }

  // 验证密码
  static async verifyPassword(userId, password) {
    try {
      const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
      
      if (!rows[0]) {
        return false;
      }
      
      const isMatch = await bcrypt.compare(password, rows[0].password);
      return isMatch;
    } catch (error) {
      console.error(`验证用户(ID: ${userId})密码出错:`, error);
      throw error;
    }
  }

  // 删除用户
  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`删除用户(ID: ${id})出错:`, error);
      throw error;
    }
  }
}

module.exports = User; 