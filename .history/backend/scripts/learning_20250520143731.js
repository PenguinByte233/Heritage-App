/*
 * seedData.js
 *
 * 用于将预定义的文化资产数据批量插入数据库中的脚本
 * 使用方法：在项目根目录下运行 `node seedData.js`
 */

// 引入数据库连接（假设 server/db.js 导出的是一个 Pool 实例）
const pool = require('./server/db');

// 待插入的数据数组
const assets = [/*
    * seedData.js
    *
    * 用于将预定义的文化资产数据批量插入数据库中的脚本
    * 使用方法：在项目根目录下运行 `node seedData.js`
    */
   
   // 引入数据库连接（假设 server/db.js 导出的是一个 Pool 实例）
   const pool = require('./server/db');
   
   // 待插入的数据数组
   const assets = [
     { id: 1, title: '传统乐器与音乐', subtitle: '维吾尔十二木卡姆', image_url: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆1.jpg', all_images: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆1.jpg,/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆2.jpg,/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆3.jpg,/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆4.jpg', content_url: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆.txt', all_content_urls: '/uploads/assets/传统乐器与音乐/维吾尔十二木卡姆/维吾尔十二木卡姆.txt', created_at: '2025-05-18 14:19:58', updated_at: '2025-05-18 14:19:58' },
     { id: 2, title: '传统服饰', subtitle: '回族服饰', image_url: '/uploads/assets/传统服饰/回族服饰1.jpg', all_images: '/uploads/assets/传统服饰/回族服饰1.jpg,/uploads/assets/传统服饰/回族服饰2.jpg,/uploads/assets/传统服饰/回族服饰3.jpg,/uploads/assets/传统服饰/回族服饰4.jpg', content_url: '/uploads/assets/传统服饰/回族服饰.txt', all_content_urls: '/uploads/assets/传统服饰/回族服饰.txt', created_at: '2025-05-18 14:19:58', updated_at: '2025-05-18 14:19:58' },
     { id: 3, title: '传统艺术与工艺', subtitle: '刺绣', image_url: '/uploads/assets/传统艺术与工艺/刺绣/苏绣1.jpg', all_images: '/uploads/assets/传统艺术与工艺/刺绣/苏绣1.jpg,/uploads/assets/传统艺术与工艺/刺绣/苏绣2.jpg,/uploads/assets/传统艺术与工艺/刺绣/苏绣3.jpg,/uploads/assets/传统艺术与工艺/刺绣/苏绣4.jpg,/uploads/assets/传统艺术与工艺/刺绣/蜀绣1.jpg,/uploads/assets/传统艺术与工艺/刺绣/蜀绣2.jpg,/uploads/assets/传统艺术与工艺/刺绣/蜀绣3.jpg', content_url: '/uploads/assets/传统艺术与工艺/刺绣/苏绣.txt', all_content_urls: '/uploads/assets/传统艺术与工艺/刺绣/苏绣.txt,/uploads/assets/传统艺术与工艺/刺绣/蜀绣.txt', created_at: '2025-05-18 14:19:58', updated_at: '2025-05-18 14:19:58' },
     { id: 4, title: '传统艺术与工艺', subtitle: '剪纸', image_url: '/uploads/assets/传统艺术与工艺/剪纸/海伦剪纸1.jpg', all_images: '/uploads/assets/传统艺术与工艺/剪纸/海伦剪纸1.jpg,/uploads/assets/传统艺术与工艺/剪纸/海伦剪纸2.jpg,/uploads/assets/传统艺术与工艺/剪纸/海伦剪纸3.jpg', content_url: '/uploads/assets/传统艺术与工艺/剪纸/海伦剪纸.txt', all_content_urls: '/uploads/assets/传统艺术与工艺/剪纸/海伦剪纸.txt', created_at: '2025-05-18 14:19:58', updated_at: '2025-05-18 14:19:58' },
     { id: 5, title: '传统艺术与工艺', subtitle: '唐卡', image_url: '/uploads/assets/传统艺术与工艺/唐卡/藏族唐卡1.jpg', all_images: '/uploads/assets/传统艺术与工艺/唐卡/藏族唐卡1.jpg,/uploads/assets/传统艺术与工艺/唐卡/藏族唐卡2.jpg,/uploads/assets/传统艺术与工艺/唐卡/藏族唐卡3.jpg,/uploads/assets/传统艺术与工艺/唐卡/藏族唐卡4.jpg', content_url: '/uploads/assets/传统艺术与工艺/唐卡/藏族唐卡.txt', all_content_urls: '/uploads/assets/传统艺术与工艺/唐卡/藏族唐卡.txt', created_at: '2025-05-18 14:19:58', updated_at: '2025-05-18 14:19:58' },
     { id: 6, title: '传统艺术与工艺', subtitle: '年画', image_url: '/uploads/assets/传统艺术与工艺/年画/凤翔木版年画1.jpg', all_images: '/uploads/assets/传统艺术与工艺/年画/凤翔木版年画1.jpg,/uploads/assets/传统艺术与工艺/年画/凤翔木版年画2.jpg,/uploads/assets/传统艺术与工艺/年画/凤翔木版年画3.jpg,/uploads/assets/传统艺术与工艺/年画/凤翔木版年画4.jpg,/uploads/assets/传统艺术与工艺/年画/衡水内画1.jpg,/uploads/assets/传统艺术与工艺/年画/衡水内画2.jpg,/uploads/assets/传统艺术与工艺/年画/衡水内画3.jpg', content_url: '/uploads/assets/传统艺术与工艺/年画/凤翔木版年画.txt', all_content_urls: '/uploads/assets/传统艺术与工艺/年画/凤翔木版年画.txt,/uploads/assets/传统艺术与工艺/年画/衡水内画.txt', created_at: '2025-05-18 14:19:58', updated_at: '2025-05-18 14:19:58' },
     { id: 7, title: '传统艺术与工艺', subtitle: '编织', image_url: '/uploads/assets/传统艺术与工艺/编织/竹编1.jpg', all_images: '/uploads/assets/传统艺术与工艺/编织/竹编1.jpg,/uploads/assets/传统艺术与工艺/编织/竹编2.jpg,/uploads/assets/传统艺术与工艺/编织/竹编3.jpg,/uploads/assets/传统艺术与工艺/编织/竹编杯垫.png', content_url: '/uploads/assets/传统艺术与工艺/编织/竹编.txt', all_content_urls: '/uploads/assets/传统艺术与工艺/编织/竹编.txt', created_at: '2025-05-18 14:19:58', updated_at: '2025-05-18 14:19:58' },
     { id: 8, title: '传统艺术与工艺', subtitle: '陶瓷', image_url: '/uploads/assets/传统艺术与工艺/陶瓷/唐三彩1.jpg', all_images: '/uploads/assets/传统艺术与工艺/陶瓷/唐三彩1.jpg,/uploads/assets/传统艺术与工艺/陶瓷/唐三彩2.jpg,/uploads/assets/传统艺术与工艺/陶瓷/唐三彩3.jpg,/uploads/assets/传统艺术与工艺/陶瓷/唐三彩4.jpg', content_url: '/uploads/assets/传统艺术与工艺/陶瓷/唐三彩.txt', all_content_urls: '/uploads/assets/传统艺术与工艺/陶瓷/唐三彩.txt', created_at: '2025-05-18 14:19:58', updated_at: '2025-05-18 14:19:58' },
     { id: 9, title: '传统艺术与工艺', subtitle: '雕刻', image_url: '/uploads/assets/传统艺术与工艺/雕刻/叶雕1.jpg', all_images: '/uploads/assets/传统艺术与工艺/雕刻/叶雕1.jpg,/uploads/assets/传统艺术与工艺/雕刻/叶雕2.jpg,/uploads/assets/传统艺术与工艺/雕刻/黄杨木雕1.jpg,/uploads/assets/传统艺术与工艺/雕刻/黄杨木雕2.jpg,/uploads/assets/传统艺术与工艺/雕刻/黄杨木雕3.jpg', content_url: '/uploads/assets/传统艺术与工艺/雕刻/叶雕.txt', all_content_urls: '/uploads/assets/传统艺术与工艺/雕刻/叶雕.txt,/uploads/assets/传统艺术与工艺/雕刻/黄杨木雕.txt', created_at: '2025-05-18 14:19:58', updated_at: '2025-05-18 14:19:58' },
     { id: 10, title: '传统节日与庆典', subtitle: '炎帝陵祭奠', image_url: '/uploads/assets/传统节日与庆典/炎帝陵祭奠/炎帝陵祭典1.jpg', all_images: '/uploads/assets/传统节日与庆典/炎帝陵祭奠/炎帝陵祭典1.jpg,/uploads/assets/传统节日与庆典/炎帝陵祭奠/炎帝陵祭典2.jpg,/uploads/assets/传统节日与庆典/炎帝陵祭奠/炎帝陵祭典3.jpg,/uploads/assets/传统节日与庆典/炎帝陵祭奠/炎帝陵祭典4.jpg', content_url: '/uploads/assets/传统节日与庆典/炎帝陵祭奠/炎帝陵祭典.txt', all_content_urls: '/uploads/assets/传统节日与庆典/炎帝陵祭奠/炎帝陵祭典.txt', created_at: '2025-05-18 14:19:58', updated_at: '2025-05-18 14:19:58' },
     { id: 11, title: '传统节日与庆典', subtitle: '风筝', image_url: '/uploads/assets/传统节日与庆典/风筝/风筝.jpg', all_images: '/uploads/assets/传统节日与庆典/风筝/风筝.jpg,/uploads/assets/传统节日与庆典/风筝/风筝1.jpg,/uploads/assets/传统节日与庆典/风筝/风筝2.jpg,/uploads/assets/传统节日与庆典/风筝/风筝3.jpg', content_url: '/uploads/assets/传统节日与庆典/风筝/风筝.txt', all_content_urls: '/uploads/assets/传统节日与庆典/风筝/风筝.txt', created_at: '2025-05-18 14:19:58', updated_at: '2025-05-18 14:19:58' },
     { id: 12, title: '传统节日与庆典', subtitle: '龙舟', image_url: '/uploads/assets/传统节日与庆典/龙舟/龙舟1.jpg', all_images: '/uploads/assets/传统节日与庆典/龙舟/龙舟1.jpg,/uploads/assets/传统节日与庆典/龙舟/龙舟2.jpg,/uploads/assets/传统节日与庆典/龙舟/龙舟3.jpg', content_url: '/uploads/assets/传统节日与庆典/龙舟/龙舟.txt', all_content_urls: '/uploads/assets/传统节日与庆典/龙舟/龙舟.txt', created_at: '2025-05-18 14:19:58', updated_at: '2025-05-18 14:19:58' },
     { id: 13, title: '传统表演艺术', subtitle: '戏曲', image_url: '/uploads/assets/传统表演艺术/戏曲/川剧1.jpg', all_images: '/uploads/assets/传统表演艺术/戏曲/川剧1.jpg,/uploads/assets/传统表演艺术/戏曲/川剧2.jpg,/uploads/assets/传统表演艺术/戏曲/川剧3.jpg,/uploads/assets/传统表演艺术/戏曲/川剧4.jpg,/uploads/assets/传统表演艺术/戏曲/淮剧1.jpg,/uploads/assets/传统表演艺术/戏曲/淮剧2.jpg,/uploads/assets/传统表演艺术/戏曲/淮剧3.jpg,/uploads/assets/传统表演艺术/戏曲/秦腔1.jpg,/uploads/assets/传统表演艺术/戏曲/秦腔2.jpg,/uploads/assets/传统表演艺术/戏曲/秦腔3.jpg,/uploads/assets/传统表演艺术/戏曲/秦腔4.jpg,/uploads/assets/传统表演艺术/戏曲/黄梅戏1.jpg,/uploads/assets/传统表演艺术/戏曲/黄梅戏2.jpg,/uploads/assets/传统表演艺术/戏曲/黄梅戏3.jpg', content_url: '/uploads/assets/传统表演艺术/戏曲/川剧.txt', all_content_urls: '/uploads/assets/传统表演艺术/戏曲/川剧.txt,/uploads/assets/传统表演艺术/戏曲/淮剧.txt,/uploads/assets/传统表演艺术/戏曲/秦腔.txt,/uploads/assets/传统表演艺术/戏曲/黄梅戏.txt', created_at: '2025-05-18 14:19:58', updated_at: '2025-05-18 14:19:58' },
     { id: 14, title: '传统表演艺术', subtitle: '民间舞蹈', image_url: '/uploads/assets/传统表演艺术/民间舞蹈/二人转1.jpg', all_images: '/uploads/assets/传统表演艺术/民间舞蹈/二人转1.jpg,/uploads/assets/传统表演艺术/民间舞蹈/二人转2.jpg,/uploads/assets/传统表演艺术/民间舞蹈/二人转3.jpg,/uploads/assets/传统表演艺术/民间舞蹈/常山战鼓1.jpg,/uploads/assets/传统表演艺术/民间舞蹈/常山战鼓2.jpg,/uploads/assets/传统表演艺术/民间舞蹈/常山战鼓3.jpg,/uploads/assets/传统表演艺术/民间舞蹈/常山战鼓4.jpg,/uploads/assets/传统表演艺术/民间舞蹈/朝鲜族跳板1.jpg,/uploads/assets/传统表演艺术/民间舞蹈/朝鲜族跳板2.jpg,/uploads/assets/传统表演艺术/民间舞蹈/朝鲜族跳板3.jpg,/uploads/assets/传统表演艺术/民间舞蹈/舞狮1.jpg,/uploads/assets/传统表演艺术/民间舞蹈/舞狮2.jpg,/uploads/assets/传统表演艺术/民间舞蹈/舞狮3.jpg,/uploads/assets/传统表演艺术/民间舞蹈/舞狮4.jpg,/uploads/assets/传统表演艺术/民间舞蹈/龙舞1.jpg,/uploads/assets/传统表演艺术/民间舞蹈/龙舞2.jpg,/uploads/assets/传统表演艺术/民间舞蹈/龙舞3.jpg', content_url: '/uploads/assets/传统表演艺术/民间舞蹈/东北二人转.txt', all_content_urls: '/uploads/assets/传统表演艺术/民间舞蹈/东北二人转.txt,/uploads/assets/传统表演艺术/民间舞蹈/常山战鼓.txt,/uploads/assets/传统表演艺术/民间舞蹈/... (remaining entries truncated for brevity)' },
     { id: 15, title: '传统装饰与配饰', subtitle: '簪花', image_url: '/uploads/assets/传统装饰与配饰/簪花/三条簪1.jpg', all_images: '/uploads/assets/传统装饰与配饰/簪花/三条簪1.jpg,/uploads/assets/传统装饰与配饰/簪花/三条簪2.jpg,/uploads/assets/传统装饰与配饰/簪花/三条簪3.jpg', content_url: '/uploads/assets/传统装饰与配饰/簪花/三条簪.txt', all_content_urls: '/uploads/assets/传统装饰与配饰/簪花/三条簪.txt', created_at: '2025-05-18 14:19:58', updated_at: '2025-05-18 14:19:58' },
     { id: 16, title: '文化与创意产业', subtitle: '文创图片', image_url: '/uploads/assets/文化与创意产业/图片1.png', all_images: '/uploads/assets/文化与创意产业/图片1.png,/uploads/assets/文化与创意产业/图片2.png,/uploads/assets/文化与创意产业/图片3.png', content_url: '/uploads/assets/文化与创意产业/文创图片.txt', all_content_urls: '/uploads/assets/文化与创意产业/文创图片.txt', created_at: '2025-05-18 14:19:58', updated_at: '2025-05-18 14:19:58' }
   ];
   
   (async () => {
     const client = await pool.connect();
     try {
       await client.query('BEGIN');
       const insertQuery = `
         INSERT INTO assets (id, title, subtitle, image_url, all_images, content_url, all_content_urls, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           subtitle = EXCLUDED.subtitle,
           image_url = EXCLUDED.image_url,
           all_images = EXCLUDED.all_images,
           content_url = EXCLUDED.content_url,
           all_content_urls = EXCLUDED.all_content_urls,
           updated_at = EXCLUDED.updated_at;
       `;
       for (const a of assets) {
         await client.query(insertQuery, [
           a.id, a.title, a.subtitle,
           a.image_url, a.all_images,
           a.content_url, a.all_content_urls,
           a.created_at, a.updated_at
         ]);
       }
       await client.query('COMMIT');
       console.log('✅ 数据插入/更新完成');
     } catch (err) {
       await client.query('ROLLBACK');
       console.error('❌ 数据操作失败:', err);
     } finally {
       client.release();
       process.exit();
     }
   })();
   
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