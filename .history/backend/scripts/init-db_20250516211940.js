require('dotenv').config({ path: '../.env' });
const { pool } = require('../config/db');
const mysql = require('mysql2/promise');

async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    console.log('开始初始化数据库...');
    
    // 创建非遗类型表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS heritage_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ 已创建非遗类型表');

    // 创建商品表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category_id INT NOT NULL,
        description TEXT,
        specs TEXT,
        images JSON,
        stock INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ 已创建商品表');

    // 创建用户表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255),
        bio TEXT,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ 已创建用户表');

    // 创建教程表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tutorials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category_id INT NOT NULL,
        cover_url VARCHAR(255),
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ 已创建教程表');

    // 创建帖子表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        user_id INT NOT NULL,
        images JSON,
        likes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ 已创建帖子表');

    // 创建评论表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ 已创建评论表');

    // 创建点赞表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_like (user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ 已创建点赞表');

    // 创建学习内容表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learn_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category VARCHAR(255) NOT NULL COMMENT '大分类，如传统表演艺术、传统服饰等',
        subcategory VARCHAR(255) NOT NULL COMMENT '子分类，如常山战鼓、龙舞等',
        title VARCHAR(255) NOT NULL COMMENT '标题',
        description TEXT COMMENT '简短描述',
        image_path VARCHAR(255) NOT NULL COMMENT '封面图片路径',
        content_file_path VARCHAR(255) NOT NULL COMMENT '内容文本文件路径',
        additional_images VARCHAR(1000) DEFAULT NULL COMMENT '额外图片路径，以逗号分隔',
      )
    `);
    console.log('learn_items 表已创建或已存在');
    
    // 检查是否已有数据
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM learn_items');
    
    if (rows[0].count === 0) {
      // 插入示例数据
      await connection.query(`
        INSERT INTO learn_items 
        (category, subcategory, title, description, image_path, content_file_path, additional_images) 
        VALUES 
        ('传统表演艺术', '常山战鼓', '常山战鼓：千年古城的铿锵战歌', '千年古城的铿锵战歌，燕赵大地的文化瑰宝', 
        '/uploads/learn/images/changshanzhangu1.jpg', 
        '/uploads/learn/texts/changshanzhangu.txt',
        '/uploads/learn/images/changshanzhangu2.jpg,/uploads/learn/images/changshanzhangu3.jpg,/uploads/learn/images/changshanzhangu4.jpg'),
        
        ('传统表演艺术', '龙舞', '龙舞：舞动华夏吉祥', '中国传统民间艺术，舞动吉祥如意', 
        '/uploads/learn/images/longwu1.jpg', 
        '/uploads/learn/texts/longwu.txt',
        '/uploads/learn/images/longwu2.jpg,/uploads/learn/images/longwu3.jpg'),
        
        ('传统表演艺术', '舞狮', '舞狮：威武雄壮的祈福艺术', '威武雄壮的民间艺术表演，驱邪纳福', 
        '/uploads/learn/images/wushi1.jpg', 
        '/uploads/learn/texts/wushi.txt',
        '/uploads/learn/images/wushi2.jpg,/uploads/learn/images/wushi3.jpg'),
        
        ('传统表演艺术', '二人转', '二人转：东北热土的欢乐旋律', '东北特色曲艺，活泼幽默的民间艺术', 
        '/uploads/learn/images/errenzhuan1.jpg', 
        '/uploads/learn/texts/errenzhuan.txt',
        '/uploads/learn/images/errenzhuan2.jpg,/uploads/learn/images/errenzhuan3.jpg')
      `);
      console.log('示例数据已插入到 learn_items 表');
    } else {
      console.log('learn_items 表已有数据，跳过插入示例数据');
    }

    console.log('🎉 数据库初始化完成！');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
  } finally {
    connection.release();
    process.exit();
  }
}

initDatabase(); 