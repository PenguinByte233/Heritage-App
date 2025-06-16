/*
 * seedMapStats.js
 *
 * 用于将地图及统计数据批量插入数据库中的脚本
 * 使用方法：在项目根目录下运行 `node seedMapStats.js`
 */

// 引入数据库连接（假设 server/db.js 导出的是一个 Pool 实例）
const pool = require('./server/db');

// 待插入的数据数组
const stats = [
  { id: 1, resource_type: 'map_image',   name: '',      image_url: '/uploads/assets/Home/Map/非遗分布地图1.jpg', count: 0, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 1, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 15:55:22' },
  { id: 2, resource_type: 'map_image',   name: '',      image_url: '/uploads/assets/Home/Map/非遗分布地图2.jpg', count: 0, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 2, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 15:55:22' },
  { id: 3, resource_type: 'statistics',  name: '',      image_url: '',                                    count: 0, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 0, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 4, resource_type: 'region',      name: '浙江省', image_url: '',                                    count: 158, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 1, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 5, resource_type: 'region',      name: '江苏省', image_url: '',                                    count: 142, percentage: 90,  world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 2, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 6, resource_type: 'region',      name: '山东省', image_url: '',                                    count: 138, percentage: 87,  world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 3, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 7, resource_type: 'region',      name: '河南省', image_url: '',                                    count: 132, percentage: 84,  world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 4, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 8, resource_type: 'region',      name: '四川省', image_url: '',                                    count: 130, percentage: 82,  world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 5, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 9, resource_type: 'category',    name: '传统表演艺术', image_url: '',                              count: 326, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 1, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 10,resource_type: 'category',    name: '传统技艺',     image_url: '',                              count: 614, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 2, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 11,resource_type: 'category',    name: '传统医药',     image_url: '',                              count: 98,  percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 3, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 12,resource_type: 'category',    name: '民俗',         image_url: '',                              count: 248, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 4, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 13,resource_type: 'category',    name: '传统音乐',     image_url: '',                              count: 185, percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 5, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' },
  { id: 14,resource_type: 'category',    name: '传统美术',     image_url: '',                              count: 86,  percentage: 100, world_count: 42, national_count: 1557, provincial_count: 13087, display_order: 6, created_at: '2025-05-19 14:43:42', updated_at: '2025-05-19 14:43:42' }
];

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertQuery = `
      INSERT INTO map_stats
      (id, resource_type, name, image_url, count, percentage, world_count, national_count, provincial_count, display_order, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (id) DO UPDATE SET
        resource_type = EXCLUDED.resource_type,
        name = EXCLUDED.name,
        image_url = EXCLUDED.image_url,
        count = EXCLUDED.count,
        percentage = EXCLUDED.percentage,
        world_count = EXCLUDED.world_count,
        national_count = EXCLUDED.national_count,
        provincial_count = EXCLUDED.provincial_count,
        display_order = EXCLUDED.display_order,
        updated_at = EXCLUDED.updated_at;
    `;

    for (const s of stats) {
      await client.query(insertQuery, [
        s.id, s.resource_type, s.name, s.image_url, s.count, s.percentage,
        s.world_count, s.national_count, s.provincial_count, s.display_order,
        s.created_at, s.updated_at
      ]);
    }

    await client.query('COMMIT');
    console.log('✅ 地图统计插入/更新完成');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ 地图统计数据操作失败:', err);
  } finally {
    client.release();
    process.exit();
  }
})();