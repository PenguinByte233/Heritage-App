const express = require('express');
const router = express.Router();

// 发布帖子
router.post('/post', async (req, res) => {
  try {
    const { author_name, content } = req.body;
    
    // 验证请求参数
    if (!author_name || !content) {
      return res.status(400).json({
        status: 'error',
        message: '请提供作者名称和帖子内容'
      });
    }
    
    const pool = req.app.locals.pool;
    
    // 插入帖子
    const [result] = await pool.query(
      'INSERT INTO community (author_name, content) VALUES (?, ?)',
      [author_name, content]
    );
    
    res.status(201).json({
      status: 'success',
      message: '帖子发布成功',
      data: {
        id: result.insertId,
        author_name,
        content,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('发布帖子失败:', error);
    res.status(500).json({
      status: 'error',
      message: '发布帖子失败，请稍后再试'
    });
  }
});

// 获取帖子列表
router.get('/posts', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    
    // 查询所有帖子，按创建时间降序排序
    const [posts] = await pool.query(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM comments WHERE post_id = c.id) AS comment_count,
             (SELECT COUNT(*) FROM likes WHERE post_id = c.id) AS like_count
      FROM community c
      ORDER BY c.created_at DESC
    `);
    
    res.json({
      status: 'success',
      data: posts
    });
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取帖子列表失败，请稍后再试'
    });
  }
});

// 获取帖子详情
router.get('/post/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = req.app.locals.pool;
    
    // 查询帖子详情
    const [posts] = await pool.query(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM comments WHERE post_id = c.id) AS comment_count,
             (SELECT COUNT(*) FROM likes WHERE post_id = c.id) AS like_count
      FROM community c
      WHERE c.id = ?
    `, [id]);
    
    if (posts.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '帖子不存在'
      });
    }
    
    // 查询帖子的评论
    const [comments] = await pool.query(`
      SELECT * FROM comments
      WHERE post_id = ?
      ORDER BY created_at ASC
    `, [id]);
    
    res.json({
      status: 'success',
      data: {
        ...posts[0],
        comments
      }
    });
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取帖子详情失败，请稍后再试'
    });
  }
});

// 添加评论
router.post('/comment', async (req, res) => {
  try {
    const { post_id, author_name, content } = req.body;
    
    // 验证请求参数
    if (!post_id || !author_name || !content) {
      return res.status(400).json({
        status: 'error',
        message: '请提供帖子ID、作者名称和评论内容'
      });
    }
    
    const pool = req.app.locals.pool;
    
    // 验证帖子是否存在
    const [posts] = await pool.query(
      'SELECT id FROM community WHERE id = ?',
      [post_id]
    );
    
    if (posts.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '帖子不存在'
      });
    }
    
    // 插入评论
    const [result] = await pool.query(
      'INSERT INTO comments (post_id, author_name, content) VALUES (?, ?, ?)',
      [post_id, author_name, content]
    );
    
    res.status(201).json({
      status: 'success',
      message: '评论添加成功',
      data: {
        id: result.insertId,
        post_id,
        author_name,
        content,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('添加评论失败:', error);
    res.status(500).json({
      status: 'error',
      message: '添加评论失败，请稍后再试'
    });
  }
});

// 点赞帖子
router.post('/like', async (req, res) => {
  try {
    const { post_id, user_id } = req.body;
    
    // 验证请求参数
    if (!post_id || !user_id) {
      return res.status(400).json({
        status: 'error',
        message: '请提供帖子ID和用户ID'
      });
    }
    
    const pool = req.app.locals.pool;
    
    // 验证帖子是否存在
    const [posts] = await pool.query(
      'SELECT id FROM community WHERE id = ?',
      [post_id]
    );
    
    if (posts.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '帖子不存在'
      });
    }
    
    // 验证用户是否存在
    const [users] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [user_id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    // 检查是否已经点赞
    const [likes] = await pool.query(
      'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
      [post_id, user_id]
    );
    
    if (likes.length > 0) {
      // 已经点赞，取消点赞
      await pool.query(
        'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
        [post_id, user_id]
      );
      
      res.json({
        status: 'success',
        message: '取消点赞成功',
        data: {
          liked: false
        }
      });
    } else {
      // 未点赞，添加点赞
      await pool.query(
        'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
        [post_id, user_id]
      );
      
      res.status(201).json({
        status: 'success',
        message: '点赞成功',
        data: {
          liked: true
        }
      });
    }
  } catch (error) {
    console.error('点赞操作失败:', error);
    res.status(500).json({
      status: 'error',
      message: '点赞操作失败，请稍后再试'
    });
  }
});

// 检查用户是否点赞
router.get('/like/check', async (req, res) => {
  try {
    const { post_id, user_id } = req.query;
    
    // 验证请求参数
    if (!post_id || !user_id) {
      return res.status(400).json({
        status: 'error',
        message: '请提供帖子ID和用户ID'
      });
    }
    
    const pool = req.app.locals.pool;
    
    // 查询是否点赞
    const [likes] = await pool.query(
      'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
      [post_id, user_id]
    );
    
    res.json({
      status: 'success',
      data: {
        liked: likes.length > 0
      }
    });
  } catch (error) {
    console.error('检查点赞状态失败:', error);
    res.status(500).json({
      status: 'error',
      message: '检查点赞状态失败，请稍后再试'
    });
  }
});

module.exports = router; 