-- 创建首页资源表
CREATE TABLE IF NOT EXISTS `home_resources` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `resource_type` ENUM('banner', 'map', 'project') NOT NULL COMMENT '资源类型：banner-轮播图, map-地图, project-项目',
  `image_url` VARCHAR(255) NOT NULL COMMENT '图片URL',
  `title` VARCHAR(100) DEFAULT NULL COMMENT '标题',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `display_order` INT DEFAULT 0 COMMENT '显示顺序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='首页资源表';

-- 创建地图详情页资源表
CREATE TABLE IF NOT EXISTS `map_resources` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `resource_type` ENUM('map_image', 'statistics', 'region', 'category') NOT NULL COMMENT '资源类型：map_image-地图图片, statistics-统计数据, region-地区数据, category-分类数据',
  `name` VARCHAR(100) DEFAULT NULL COMMENT '名称',
  `image_url` VARCHAR(255) DEFAULT NULL COMMENT '图片URL',
  `count` INT DEFAULT 0 COMMENT '数量',
  `percentage` INT DEFAULT 100 COMMENT '百分比',
  `world_count` INT DEFAULT 42 COMMENT '世界级非遗数量',
  `national_count` INT DEFAULT 1557 COMMENT '国家级非遗数量',
  `provincial_count` INT DEFAULT 13087 COMMENT '省级非遗数量',
  `display_order` INT DEFAULT 0 COMMENT '显示顺序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地图详情页资源表';

-- 插入首页轮播图数据
INSERT INTO `home_resources` (`resource_type`, `image_url`, `title`, `description`, `display_order`) VALUES
('banner', '/static/images/Home/Home/非遗/非遗1.jpg', '非遗文化', '传承千年的非物质文化遗产', 1),
('banner', '/static/images/Home/Home/非遗/非遗2.jpg', '非遗艺术', '中国传统艺术的精髓', 2),
('banner', '/static/images/Home/Home/非遗/非遗.jpg', '非遗技艺', '匠心独运的传统技艺', 3);

-- 插入首页地图资源数据
INSERT INTO `home_resources` (`resource_type`, `image_url`, `title`, `description`, `display_order`) VALUES
('map', '/static/images/Home/Home/地图/非遗分布地图1.jpg', '中国非物质文化遗产分布', '点击查看详细分布', 1);

-- 插入首页项目轮播图数据
INSERT INTO `home_resources` (`resource_type`, `image_url`, `title`, `description`, `display_order`) VALUES
('project', '/static/images/Home/Carousel1/传统表演艺术/龙舞1.jpg', '传统表演艺术', '国家级非物质文化遗产代表性项目', 1),
('project', '/static/images/Home/Carousel1/传统服饰/回族服饰3.jpg', '传统服饰', '国家级非物质文化遗产代表性项目', 2),
('project', '/static/images/Home/Carousel1/传统乐器与音乐/维吾尔十二木卡姆4.jpg', '传统乐器与音乐', '国家级非物质文化遗产代表性项目', 3),
('project', '/static/images/Home/Carousel1/传统艺术与工艺/海伦剪纸1.jpg', '传统艺术与工艺', '国家级非物质文化遗产代表性项目', 4),
('project', '/static/images/Home/Carousel1/传统节日与庆典/龙舟3.jpg', '传统节日与庆典', '国家级非物质文化遗产代表性项目', 5),
('project', '/static/images/Home/Carousel1/传统装饰与配饰/海伦剪纸1.jpg', '传统装饰与配饰', '国家级非物质文化遗产代表性项目', 6),
('project', '/static/images/Home/Carousel1/文化与创意产业/图片1.png', '文化与创意产业', '国家级非物质文化遗产代表性项目', 7);

-- 插入地图详情页地图图片数据
INSERT INTO `map_resources` (`resource_type`, `image_url`, `display_order`) VALUES
('map_image', '/static/images/Home/Home/地图/非遗分布地图1.jpg', 1),
('map_image', '/static/images/Home/Home/地图/非遗分布地图2.jpg', 2);

-- 插入地图详情页统计数据
INSERT INTO `map_resources` (`resource_type`, `world_count`, `national_count`, `provincial_count`) VALUES
('statistics', 42, 1557, 13087);

-- 插入地图详情页地区分布数据
INSERT INTO `map_resources` (`resource_type`, `name`, `count`, `percentage`, `display_order`) VALUES
('region', '浙江省', 158, 100, 1),
('region', '江苏省', 142, 90, 2),
('region', '山东省', 138, 87, 3),
('region', '河南省', 132, 84, 4),
('region', '四川省', 130, 82, 5);

-- 插入地图详情页分类数据
INSERT INTO `map_resources` (`resource_type`, `name`, `count`, `display_order`) VALUES
('category', '传统表演艺术', 326, 1),
('category', '传统技艺', 614, 2),
('category', '传统医药', 98, 3),
('category', '民俗', 248, 4),
('category', '传统音乐', 185, 5),
('category', '传统美术', 86, 6); 