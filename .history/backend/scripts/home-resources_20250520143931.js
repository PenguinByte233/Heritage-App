/*
 * seedHomeResources.js
 *
 * 用于将首页资源（Banner、地图、项目）数据批量插入数据库中的脚本
 * 使用方法：在项目根目录下运行 `node seedHomeResources.js`
 */

// 引入数据库连接（假设 server/db.js 导出的是一个 Pool 实例）
const pool = require('./server/db');

// 待插入的数据数组
const resources = [
  { id: 1, resource_type: 'banner', image_url: '/uploads/assets/Home/Banner/非遗1.jpg', title: '非遗文化', description: '传承千年的非物质文化遗产', display_order: 1, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 2, resource_type: 'banner', image_url: '/uploads/assets/Home/Banner/非遗2.jpg', title: '非遗艺术', description: '中国传统艺术的精髓', display_order: 2, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 3, resource_type: 'banner', image_url: '/uploads/assets/Home/Banner/非遗.jpg', title: '非遗技艺', description: '匠心独运的传统技艺', display_order: 3, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 4, resource_type: 'map',    image_url: '/uploads/assets/Home/Map/非遗分布地图1.jpg', title: '中国非物质文化遗产分布', description: '点击查看详细分布', display_order: 1, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 15:55:26' },
  { id: 5, resource_type: 'project',image_url: '/uploads/assets/Home/Project/传统表演艺术/龙舞1.jpg', title: '传统表演艺术', description: '国家级非物质文化遗产代表性项目', display_order: 1, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 6, resource_type: 'project',image_url: '/uploads/assets/Home/Project/传统服饰/回族服饰3.jpg', title: '传统服饰', description: '国家级非物质文化遗产代表性项目', display_order: 2, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 7, resource_type: 'project',image_url: '/uploads/assets/Home/Project/传统乐器与音乐/维吾尔十二木卡姆4.jpg', title: '传统乐器与音乐', description: '国家级非物质文化遗产代表性项目', display_order: 3, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 8, resource_type: 'project',image_url: '/uploads/assets/Home/Project/传统艺术与工艺/海伦剪纸1.jpg', title: '传统艺术与工艺', description: '国家级非物质文化遗产代表性项目', display_order: 4, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 9, resource_type: 'project',image_url: '/uploads/assets/Home/Project/传统节日与庆典/龙舟3.jpg', title: '传统节日与庆典', description: '国家级非物质文化遗产代表性项目', display_order: 5, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 10, resource_type: 'project',image_url: '/uploads/assets/Home/Project/传统装饰与配饰/海伦剪纸1.jpg', title: '传统装饰与配饰', description: '国家级非物质文化遗产代表性项目', display_order: 6, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 11, resource_type: 'project',image_url: '/uploads/assets/Home/Project/文化与创意产业/图片1.png', title: '文化与创意产业', description: '国家级非物质文化遗产代表性项目', display_order: 7, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' }
];

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertQuery = `
      INSERT INTO home_resources
      (id, resource_type, image_url, title, description, display_order, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (id) DO UPDATE SET
        resource_type = EXCLUDED.resource_type,
        image_url = EXCLUDED.image_url,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        display_order = EXCLUDED.display_order,
        updated_at = EXCLUDED.updated_at;
    `;
    for (const r of resources) {
      const vals = [
        r.id, r.resource_type, r.image_url,
        r.title, r.description, r.display_order,
        r.created_at, r.updated_at
      ];
      await client.query(insertQuery, vals);
    }
    await client.query('COMMIT');
    console.log('✅ 首页资源插入/更新完成');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ 首页资源数据操作失败:', err);
  } finally {
    client.release();
    process.exit();
  }
})();
