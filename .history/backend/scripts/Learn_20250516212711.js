/**
 * 此脚本用于初始化 Learn 页面所需的数据库表
 * 创建 learn_items 表并插入初始数据
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

async function initLearnDatabase() {
  console.log('正在初始化 Learn 数据库...');
  let connection;

  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456'
    });

    // 确保数据库存在
    const dbName = process.env.DB_NAME || 'demo';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`数据库 ${dbName} 已创建或已存在`);

    // 使用创建的数据库
    await connection.query(`USE ${dbName}`);

    // 创建 learn_items 表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learn_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category VARCHAR(255) NOT NULL COMMENT '大标题/大分类，如传统表演艺术、传统服饰等',
        subcategory VARCHAR(255) NOT NULL COMMENT '小标题/子分类，如常山战鼓、龙舞等',
        title VARCHAR(255) NOT NULL COMMENT '完整标题',
        description TEXT COMMENT '简短描述',
        image_path VARCHAR(255) NOT NULL COMMENT '标题图片路径',
        content_file_path VARCHAR(255) NOT NULL COMMENT '内容文本文件路径',
        additional_images VARCHAR(1000) DEFAULT NULL COMMENT '内容图片路径，以逗号分隔',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('learn_items 表已创建');

    // 检查是否已有数据
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM learn_items');
    
    if (rows[0].count === 0) {
      console.log('正在插入初始数据...');
      
      // 确保文本目录存在
      const textDir = path.join(__dirname, '../uploads/learn/texts');
      if (!fs.existsSync(textDir)) {
        fs.mkdirSync(textDir, { recursive: true });
        console.log('创建了文本目录：', textDir);
      }
      
      // 确保图片目录存在
      const imageDir = path.join(__dirname, '../uploads/learn/images');
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
        console.log('创建了图片目录：', imageDir);
      }
      
      // 创建 changshanzhangu.txt 文件（如果不存在）
      const changshanzhangu = path.join(textDir, 'changshanzhangu.txt');
      if (!fs.existsSync(changshanzhangu)) {
        const content = `在燕赵大地的苍茫历史中，常山战鼓如惊雷滚过岁月，叩击着中华文明的雄浑节拍。这一因正定古属常山郡而得名的民间锣鼓艺术，自战国雏形初现，历经宋元演艺鼎盛，至明代形成气势恢宏的表演体系，至今仍是北方鼓乐文化的活化石。

金戈铁马的声响史诗常山战鼓以鼓、钹、锣等打击乐器构建声浪矩阵，少则数十人、多至数百人的表演阵容，如千军万马列阵。传统曲牌【大传帐】【霸王鞭】等 9 章 72 套曲目，通过紧凑鼓点与复杂变奏，模拟出点兵、列阵、厮杀等战争场景；新创【十面埋伏】【胜利凯旋】等阵势，则以现代艺术手法重构历史张力。演奏时，鼓手腾挪跳跃间鼓槌翻飞，钹镲撞击声穿云裂石，刚健的舞姿与震天的声响交织，重现了 "常山赵子龙" 的忠勇之气，被誉为 "中国北方鼓乐的活兵马俑"。

农耕文明的节奏密码这门扎根河北农村的艺术，深植于民俗生活的肌理：嫁娶寿庆时，战鼓以欢快鼓点传递喜悦；节庆典礼上，雷霆万钧的阵列表演凝聚民心。东杨庄、西杨庄的传承村落中，家传与师徒相授的传统延续至今，老艺人手中的鼓谱不仅是音符的集合，更是农耕社会的集体记忆 —— 每一段曲牌都关联着节气更替、宗族仪轨，每一次腾跃都烙印着北方汉子的豪迈性情。

从战国战场的助威呐喊到当代舞台的文化符号，常山战鼓以不变的铿锵节奏，丈量着中华文明的韧性。当鼓点在正定古城墙下响起，青砖黛瓦间回荡的不仅是音响的震撼，更是燕赵大地 "慷慨悲歌" 的精神传承，让千年历史在震天动地的节拍中，焕发出新的生命张力。`;
        fs.writeFileSync(changshanzhangu, content);
        console.log('创建了文本文件：', changshanzhangu);
      }
      
      // 插入初始数据
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
        '/uploads/learn/images/errenzhuan2.jpg,/uploads/learn/images/errenzhuan3.jpg'),
        
        ('传统服饰', '蒙古族服饰', '蒙古族服饰：草原民族的独特标识', '蒙古族传统服饰展现了草原民族的审美与智慧', 
        '/uploads/learn/images/menggu1.jpg', 
        '/uploads/learn/texts/menggu.txt',
        '/uploads/learn/images/menggu2.jpg,/uploads/learn/images/menggu3.jpg'),
        
        ('传统服饰', '藏族服饰', '藏族服饰：高原艺术的绚丽绽放', '藏族服饰是高原文化的瑰宝，色彩艳丽、工艺精湛', 
        '/uploads/learn/images/zang1.jpg', 
        '/uploads/learn/texts/zang.txt',
        '/uploads/learn/images/zang2.jpg,/uploads/learn/images/zang3.jpg')
      `);
      console.log('初始数据已插入到 learn_items 表');
    } else {
      console.log('learn_items 表已有数据，跳过初始数据插入');
    }

    console.log('Learn 数据库初始化完成！');
  } catch (error) {
    console.error('初始化数据库过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行初始化
initLearnDatabase().then(() => {
  console.log('脚本执行完毕');
}).catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
