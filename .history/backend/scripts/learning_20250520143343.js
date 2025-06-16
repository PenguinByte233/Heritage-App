/*
 * seedData.js
 *
 * 用于将预定义的文化资产数据批量插入数据库中的脚本
 * 使用方法：在项目根目录下运行 `node seedData.js`
 */

// 引入数据库连接（假设 server/db.js 导出的是一个 Pool 实例）
const pool = require('./server/db');

// 待插入的数据数组
const assets = [
  {
    id: 1,
    title: '传统乐器与音乐',
    subtitle: '维吾尔十二木卡姆',
    image_url: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆1.jpg',
    all_images: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆1.jpg,/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆2.jpg,/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆3.jpg,/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆4.jpg',
    content_url: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆.txt',
    all_content_urls: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆.txt',
    created_at: '2025-05-18 14:19:58',
    updated_at: '2025-05-18 14:19:58'
  },
  {
    id: 2,
    title: '传统服饰',
    subtitle: '回族服饰',
    image_url: '/uploads/assets/传统服饰/回族服饰1.jpg',
    all_images: '/uploads/assets/传统服饰/回族服饰1.jpg,/uploads/assets/传统服饰/回族服饰2.jpg,/uploads/assets/传统服饰/回族服饰3.jpg,/uploads/assets/传统服饰/回族服饰4.jpg',
    content_url: '/uploads/assets/传统服饰/回族服饰.txt',
    all_content_urls: '/uploads/assets/传统服饰/回族服饰.txt',
    created_at: '2025-05-18 14:19:58',
    updated_at: '2025-05-18 14:19:58'
  },
  // ... 其余数据按照相同格式继续添加
];

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertQuery = `
      INSERT INTO assets
      (id, title, subtitle, image_url, all_images, content_url, all_content_urls, created_at, updated_at)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE
      SET title = EXCLUDED.title,
          subtitle = EXCLUDED.subtitle,
          image_url = EXCLUDED.image_url,
          all_images = EXCLUDED.all_images,
          content_url = EXCLUDED.content_url,
          all_content_urls = EXCLUDED.all_content_urls,
          updated_at = EXCLUDED.updated_at;
    `;

    for (const asset of assets) {
      const values = [
        asset.id,
        asset.title,
        asset.subtitle,
        asset.image_url,
        asset.all_images,
        asset.content_url,
        asset.all_content_urls,
        asset.created_at,
        asset.updated_at
      ];
      await client.query(insertQuery, values);
    }

    await client.query('COMMIT');
    console.log('✅ 数据插入/更新完成');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ 数据插入失败:', err);
  } finally {
    client.release();
    process.exit();
  }
})();