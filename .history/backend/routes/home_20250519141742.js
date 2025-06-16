const express = require('express');
const router = express.Router();

/**
 * @api {get} /api/home/resources 获取首页所有静态资源
 * @apiDescription 获取首页所需的所有静态资源，包括轮播图、地图封面等
 * @apiName GetHomeResources
 * @apiGroup Home
 *
 * @apiSuccess {Boolean} success 请求是否成功
 * @apiSuccess {Array} bannerImages 轮播图资源列表
 * @apiSuccess {Array} mapImages 地图相关资源列表
 * @apiSuccess {Array} projectItems 项目轮播图资源列表
 */
router.get('/resources', async (req, res) => {
  try {
    // 从req.app.locals获取数据库连接池
    const pool = req.app.locals.pool;
    
    // 查询轮播图资源
    const [bannerImages] = await pool.query(`
      SELECT * FROM home_resources 
      WHERE resource_type = 'banner'
      ORDER BY display_order ASC
    `);
    
    // 查询地图相关资源
    const [mapImages] = await pool.query(`
      SELECT * FROM home_resources 
      WHERE resource_type = 'map'
      ORDER BY display_order ASC
    `);
    
    // 查询项目轮播图资源
    const [projectItems] = await pool.query(`
      SELECT * FROM home_resources 
      WHERE resource_type = 'project'
      ORDER BY display_order ASC
    `);
    
    // 格式化返回数据
    const formattedBannerImages = bannerImages.map(item => ({
      id: item.id,
      image_url: item.image_url,
      title: item.title || '',
      description: item.description || ''
    }));
    
    const formattedMapImages = mapImages.map(item => ({
      id: item.id,
      image_url: item.image_url,
      title: item.title || '',
      description: item.description || ''
    }));
    
    const formattedProjectItems = projectItems.map(item => ({
      id: item.id,
      title: item.title || '',
      image: item.image_url,
      description: item.description || ''
    }));
    
    res.json({
      success: true,
      data: {
        bannerImages: formattedBannerImages.map(item => item.image_url),
        mapImages: formattedMapImages,
        projectItems: formattedProjectItems
      }
    });
  } catch (error) {
    console.error('获取首页资源失败:', error);
    res.status(500).json({
      success: false,
      message: '获取首页资源失败，请稍后再试'
    });
  }
});

/**
 * @api {get} /api/home/map-resources 获取地图详情页资源
 * @apiDescription 获取地图详情页所需的静态资源
 * @apiName GetMapResources
 * @apiGroup Home
 *
 * @apiSuccess {Boolean} success 请求是否成功
 * @apiSuccess {Array} mapImages 地图图片资源
 * @apiSuccess {Object} statistics 统计数据
 * @apiSuccess {Array} regionData 地区分布数据
 * @apiSuccess {Array} categoryData 分类数据
 */
router.get('/map-resources', async (req, res) => {
  try {
    // 从req.app.locals获取数据库连接池
    const pool = req.app.locals.pool;
    
    // 查询地图详情页资源
    const [mapDetailImages] = await pool.query(`
      SELECT * FROM map_resources 
      WHERE resource_type = 'map_image'
      ORDER BY display_order ASC
    `);
    
    // 查询统计数据
    const [statistics] = await pool.query(`
      SELECT * FROM map_resources 
      WHERE resource_type = 'statistics'
      LIMIT 1
    `);
    
    // 查询地区分布数据
    const [regionData] = await pool.query(`
      SELECT * FROM map_resources 
      WHERE resource_type = 'region'
      ORDER BY count DESC
      LIMIT 5
    `);
    
    // 查询分类数据
    const [categoryData] = await pool.query(`
      SELECT * FROM map_resources 
      WHERE resource_type = 'category'
      ORDER BY count DESC
    `);
    
    // 格式化地图图片
    const formattedMapImages = mapDetailImages.map(item => item.image_url);
    
    // 格式化统计数据
    let formattedStatistics = {};
    if (statistics.length > 0) {
      formattedStatistics = {
        world: parseInt(statistics[0].world_count) || 42,
        national: parseInt(statistics[0].national_count) || 1557,
        provincial: parseInt(statistics[0].provincial_count) || 13087
      };
    } else {
      formattedStatistics = {
        world: 42,
        national: 1557,
        provincial: 13087
      };
    }
    
    // 格式化地区数据
    const formattedRegionData = regionData.map(item => ({
      name: item.name,
      count: parseInt(item.count) || 0,
      percentage: parseInt(item.percentage) || 100
    }));
    
    // 格式化分类数据
    const formattedCategoryData = categoryData.map(item => ({
      name: item.name,
      count: parseInt(item.count) || 0
    }));
    
    res.json({
      success: true,
      data: {
        mapImages: formattedMapImages,
        statistics: formattedStatistics,
        regionData: formattedRegionData,
        categoryData: formattedCategoryData
      }
    });
  } catch (error) {
    console.error('获取地图详情资源失败:', error);
    res.status(500).json({
      success: false,
      message: '获取地图详情资源失败，请稍后再试'
    });
  }
});

module.exports = router; 