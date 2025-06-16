/*
 * seedProducts.js
 *
 * 用于将商品数据批量插入数据库中的脚本
 * 使用方法：在项目根目录下运行 `node seedProducts.js`
 */

// 引入数据库连接（假设 server/db.js 导出的是一个 Pool 实例）
const pool = require('./server/db');

// 待插入的数据数组
const products = [
  { id: 18, name: '竹编包包', category: '竹编', image_url: '/uploads/assets/商品/卖竹编包包1.jpg', price: 304.42, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编包包1.txt' },
  { id: 19, name: '竹编包包', category: '竹编', image_url: '/uploads/assets/商品/卖竹编包包2.jpg', price: 406.68, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编包包1.txt' },
  { id: 20, name: '竹编包包', category: '竹编', image_url: '/uploads/assets/商品/卖竹编包包3.jpg', price: 442.75, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编包包1.txt' },
  { id: 21, name: '竹编包包', category: '竹编', image_url: '/uploads/assets/商品/卖竹编包包4.jpg', price: 252.88, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编包包1.txt' },
  { id: 22, name: '竹编包包', category: '竹编', image_url: '/uploads/assets/商品/卖竹编包包5.jpg', price: 102.43, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编包包1.txt' },
  { id: 23, name: '竹编扇子', category: '竹编', image_url: '/uploads/assets/商品/卖竹编扇子1.jpg', price: 356.23, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编扇子.txt' },
  { id: 24, name: '竹编扇子', category: '竹编', image_url: '/uploads/assets/商品/卖竹编扇子2.jpg', price: 411.40, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编扇子.txt' },
  { id: 25, name: '竹编扇子', category: '竹编', image_url: '/uploads/assets/商品/卖竹编扇子3.jpg', price: 130.96, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编扇子.txt' },
  { id: 26, name: '竹编椅子', category: '竹编', image_url: '/uploads/assets/商品/卖竹编椅子1.jpg', price: 371.09, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编椅子.txt' },
  { id: 27, name: '竹编椅子', category: '竹编', image_url: '/uploads/assets/商品/卖竹编椅子2.jpg', price: 117.33, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编椅子.txt' },
  { id: 28, name: '竹编椅子', category: '竹编', image_url: '/uploads/assets/商品/卖竹编椅子3.jpg', price: 416.73, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编椅子.txt' },
  { id: 29, name: '竹编灯罩', category: '竹编', image_url: '/uploads/assets/商品/卖竹编灯罩1.jpg', price: 308.32, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编灯罩.txt' },
  { id: 30, name: '竹编灯罩', category: '竹编', image_url: '/uploads/assets/商品/卖竹编灯罩2.jpg', price: 93.70, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编灯罩.txt' },
  { id: 31, name: '竹编灯罩', category: '竹编', image_url: '/uploads/assets/商品/卖竹编灯罩3.jpg', price: 161.67, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编灯罩.txt' },
  { id: 32, name: '竹编篮', category: '竹编', image_url: '/uploads/assets/商品/卖竹编篮1.jpg', price: 118.40, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编篮子.txt' },
  { id: 33, name: '竹编篮', category: '竹编', image_url: '/uploads/assets/商品/卖竹编篮2.jpg', price: 115.83, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编篮子.txt' },
  { id: 34, name: '竹编篮', category: '竹编', image_url: '/uploads/assets/商品/卖竹编篮3.jpg', price: 465.10, created_at: '2025-05-18 20:13:47', updated_at: '2025-05-18 20:13:47', description_url: '/uploads/assets/商品/竹编篮子.txt' }
];

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const query = `
      INSERT INTO products
        (id, name, category, image_url, price, created_at, updated_at, description_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        image_url = EXCLUDED.image_url,
        price = EXCLUDED.price,
        updated_at = EXCLUDED.updated_at,
        description_url = EXCLUDED.description_url;
    `;
    for (const p of products) {
      await client.query(query, [
        p.id, p.name, p.category, p.image_url,
        p.price, p.created_at, p.updated_at, p.description_url
      ]);
    }
    await client.query('COMMIT');
    console.log('✅ 商品数据插入/更新完成');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ 商品数据操作失败:', err);
  } finally {
    client.release();
    process.exit();
  }
})();