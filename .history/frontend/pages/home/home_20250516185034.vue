<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <text class="custom-title">国家非遗</text>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-box">
      <image class="search-icon" src="https://img.icons8.com/ios/50/000000/search--v1.png"></image>
      <text class="search-placeholder">请输入关键字进行搜索</text>
    </view>
    
    <!-- 轮播图 -->
    <view class="banner-container">
      <swiper class="banner-swiper" circular autoplay interval="3000" duration="500" indicator-dots indicator-active-color="#6d4126" indicator-color="rgba(255, 255, 255, 0.6)">
        <swiper-item>
          <image class="banner-image" src="/static/images/Home/Carousel/常山战鼓1.jpg" mode="aspectFill"></image>
        </swiper-item>
        <swiper-item>
          <image class="banner-image" src="/static/images/Home/Carousel/藏族唐卡1.jpg" mode="aspectFill"></image>
        </swiper-item>
        <swiper-item>
          <image class="banner-image" src="/static/images/Home/Carousel/川剧1.jpg" mode="aspectFill"></image>
        </swiper-item>
        <swiper-item>
          <image class="banner-image" src="/static/images/Home/Carousel/朝鲜族跳板1.jpg" mode="aspectFill"></image>
        </swiper-item>
        <swiper-item>
          <image class="banner-image" src="/static/images/Home/Carousel/二人转1.jpg" mode="aspectFill"></image>
        </swiper-item>
      </swiper>
    </view>
    
    <!-- 五个分类入口 -->
    <view class="category-icons">
      <view class="category-item" v-for="(item, index) in categories" :key="index" @tap="navigateToCategory(item)">
        <image :src="item.icon" class="category-icon"></image>
        <text class="category-name">{{item.name}}</text>
      </view>
    </view>
    
    <!-- 非遗资源标题栏 -->
    <view class="section-header">
      <view class="section-title-container">
        <view class="section-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8L16 12L12 16L8 12L12 8Z" stroke="#6d4126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 3L19 10L12 21L5 10L12 3Z" stroke="#6d4126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </view>
        <text class="section-title">非遗·资源</text>
      </view>
      <view class="more-container" @tap="navigateToMore">
        <text class="more-text">更多</text>
        <view class="more-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="#999999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </view>
      </view>
    </view>
    
    <!-- 选项卡 -->
    <view class="tabs">
      <view 
        class="tab" 
        :class="{'active-tab': activeTabIndex === 0}" 
        @tap="switchTab(0)"
      >
        <text class="tab-text">非遗项目</text>
      </view>
      <view 
        class="tab" 
        :class="{'active-tab': activeTabIndex === 1}" 
        @tap="switchTab(1)"
      >
        <text class="tab-text">非遗传承人</text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-container">
      <!-- 项目内容 -->
      <view v-if="activeTabIndex === 0" class="projects-content">
        <!-- 左侧装饰 -->
        <view class="border-decoration left"></view>
        
        <!-- 项目轮播 -->
        <swiper class="item-swiper" circular previous-margin="60px" next-margin="60px" @change="onProjectChange">
          <swiper-item v-for="(item, index) in projectItems" :key="index" class="swiper-item-container">
            <view class="item-card" :class="{'current-item': currentProjectIndex === index}">
              <image class="item-image" :src="item.image" mode="aspectFill"></image>
            </view>
          </swiper-item>
        </swiper>
        
        <!-- 右侧装饰 -->
        <view class="border-decoration right"></view>
        
        <!-- 标题栏 -->
        <view class="item-title-bar">
          <text class="item-title">{{projectItems[currentProjectIndex].title}}</text>
        </view>
        <!-- 描述 -->
        <view class="item-description">
          <text class="item-description-text">{{projectItems[currentProjectIndex].description}}</text>
        </view>
      </view>
      
      <!-- 传承人内容 -->
      <view v-if="activeTabIndex === 1" class="inheritors-content">
        <!-- 左侧装饰 -->
        <view class="border-decoration left"></view>
        
        <!-- 传承人轮播 -->
        <swiper class="item-swiper" circular previous-margin="60px" next-margin="60px" @change="onInheritorChange">
          <swiper-item v-for="(item, index) in inheritorItems" :key="index" class="swiper-item-container">
            <view class="item-card" :class="{'current-item': currentInheritorIndex === index}">
              <image class="item-image" :src="item.image" mode="aspectFill"></image>
            </view>
          </swiper-item>
        </swiper>
        
        <!-- 右侧装饰 -->
        <view class="border-decoration right"></view>
        
        <!-- 标题栏 -->
        <view class="item-title-bar">
          <text class="item-title">{{inheritorItems[currentInheritorIndex].title}}</text>
        </view>
        <!-- 描述 -->
        <view class="item-description">
          <text class="item-description-text">{{inheritorItems[currentInheritorIndex].description}}</text>
        </view>
      </view>
    </view>
    
    <!-- 底部留白区域 -->
    <view style="height: 60px;"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTabIndex: 0,
      currentProjectIndex: 0,
      currentInheritorIndex: 0,
      categories: [
        { 
          name: '非遗资源', 
          icon: '../../static/images/tabbar/guzheng.png',
          path: '/pages/resources/index'
        },
        { 
          name: '非遗展馆', 
          icon: '../../static/images/tabbar/museum.png',
          path: '/pages/museums/index'
        },
        { 
          name: '非遗工坊', 
          icon: '../../static/images/tabbar/hammer.png',
          path: '/pages/workshops/index'
        },
        { 
          name: '非遗购物', 
          icon: '../../static/images/tabbar/shopping-cart.png',
          path: '/pages/shopping/index'
        },
        { 
          name: '非遗旅游', 
          icon: '../../static/images/tabbar/train.png',
          path: '/pages/tourism/index'
        }
      ],
      projectItems: [
        {
          title: '传统表演艺术',
          image: '/static/images/Home/Carousel1/传统表演艺术/龙舞1.jpg',
          description: '国家级非物质文化遗产代表性项目'
        },
        {
          title: '传统服饰',
          image: '/static/images/Home/Carousel1/传统服饰/回族服饰3.jpg',
          description: '国家级非物质文化遗产代表性项目'
        },
        {
          title: '传统乐器与音乐',
          image: '/static/images/Home/Carousel1/传统乐器与音乐/维吾尔十二木卡姆4.jpg',
          description: '国家级非物质文化遗产代表性项目'
        },
        {
          title: '传统艺术与工艺',
          image: '/static/images/Home/Carousel1/传统艺术与工艺/海伦剪纸1.jpg',
          description: '国家级非物质文化遗产代表性项目'
        },
        {
          title: '传统节日与庆典',
          image: '/static/images/Home/Carousel1/传统节日与庆典/龙舟3.jpg',
          description: '国家级非物质文化遗产代表性项目'
        },
        {
          title: '传统装饰与配饰',
          image: '/static/images/Home/Carousel1/传统装饰与配饰/海伦剪纸1.jpg',
          description: '国家级非物质文化遗产代表性项目'
        },
        {
          title: '文化与创意产业',
          image: '/static/images/Home/Carousel1/文化与创意产业/图片1.png',
          description: '国家级非物质文化遗产代表性项目'
        }
      ],
      inheritorItems: [
        {
          title: '王心如',
          image: 'https://pic1.zhimg.com/80/v2-c3bb57912eda5b1b167b9450491fdd3c_720w.jpg',
          description: '南音传承人 国家级非物质文化遗产传承人'
        },
        {
          title: '李明德',
          image: 'https://pic1.zhimg.com/80/v2-a7c1787ec0fa40c64e1a5e47c16f2387_720w.jpg',
          description: '古琴艺术传承人 国家级非物质文化遗产传承人'
        },
        {
          title: '梅兰芳',
          image: 'https://pic1.zhimg.com/80/v2-d2440c566b48d053bd14f126183accde_720w.jpg',
          description: '京剧艺术传承人 国家级非物质文化遗产传承人'
        }
      ]
    }
  },
  methods: {
    switchTab(index) {
      this.activeTabIndex = index;
    },
    navigateToCategory(category) {
      uni.navigateTo({
        url: category.path
      });
    },
    navigateToMore() {
      uni.navigateTo({
        url: '/pages/resources/more'
      });
    },
    onProjectChange(e) {
      this.currentProjectIndex = e.detail.current;
    },
    onInheritorChange(e) {
      this.currentInheritorIndex = e.detail.current;
    }
  }
}
</script>

<style>
.container {
  padding: 0;
  background-color: #f0e6d2;
  min-height: 100vh; /* 确保容器至少有视口高度 */
}

/* 自定义导航栏样式 */
.custom-nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 44px 15px 10px; /* 上边距根据状态栏高度调整 */
  background-color: #f0e6d2;
}

.custom-title {
  font-size: 22px;
  font-weight: bold;
  color: #6d4126;
  letter-spacing: 2px; /* 字间距增加 */
  text-shadow: 1px 1px 2px rgba(109, 65, 38, 0.1); /* 添加轻微文字阴影 */
}

.search-box {
  margin: 5px 15px 15px 15px;
  background-color: #fff;
  border-radius: 20px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-icon {
  width: 18px;
  height: 18px;
  margin-right: 10px;
  opacity: 0.6; /* 降低图标不透明度，让其看起来更柔和 */
}

.search-placeholder {
  color: #999;
  font-size: 14px;
}

.banner-container {
  margin: 10px 15px;
  border-radius: 12px;
  overflow: hidden;
}

.banner-swiper {
  width: 100%;
  height: 180px;
}

.banner-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.category-icons {
  display: flex;
  justify-content: space-between;
  padding: 15px 10px;
  background-color: #f0e6d2;
  margin: 0 10px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20%;
}

.category-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 5px;
}

.category-name {
  font-size: 12px;
  color: #333;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f0e6d2;
  margin-top: 10px;
}

.section-title-container {
  display: flex;
  align-items: center;
}

.section-icon {
  width: 20px;
  height: 20px;
  margin-right: 5px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #6d4126;
}

.more-container {
  display: flex;
  align-items: center;
}

.more-text {
  font-size: 12px;
  color: #999;
}

.more-icon {
  width: 16px;
  height: 16px;
}

.tabs {
  display: flex;
  background-color: #f0e6d2;
  border-bottom: 1px solid #e5d9c0;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  border-bottom: 2px solid transparent;
}

.active-tab {
  color: #6d4126;
  border-bottom-color: #6d4126;
}

.tab-text {
  font-size: 14px;
}

.content-container {
  padding: 15px;
  background-color: #f0e6d2;
  overflow: visible; /* 确保内容可以溢出并正常滚动 */
}

.item-swiper {
  height: 280px;
  overflow: visible;
  margin-bottom: 10px;
}

.swiper-item-container {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
  overflow: visible;
}

.item-card {
  height: 240px;
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(109, 65, 38, 0.15);
  transform: scale(0.9);
  transition: all 0.3s ease;
  border: 1px solid #e5d9c0;
}

.current-item {
  transform: scale(1);
  border: 1px solid #a67c52;
  box-shadow: 0 4px 12px rgba(109, 65, 38, 0.25);
}

.item-image {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.item-title-bar {
  width: 70%;
  margin: -10px auto 0;
  background-color: #a67c52;
  padding: 10px 0;
  text-align: center;
  position: relative;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  box-shadow: 0 2px 4px rgba(109, 65, 38, 0.1);
  z-index: 10;
}

.item-title {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.item-description {
  width: 80%;
  margin: 10px auto;
  padding: 10px 0;
  text-align: center;
  border-radius: 4px;
}

.item-description-text {
  font-size: 12px;
  color: #6d4126;
  line-height: 1.4;
  font-weight: 500;
}

.projects-content, .inheritors-content {
  position: relative;
  padding: 0 15px;
}

.border-decoration {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 100px;
  background: linear-gradient(to bottom, #f0e6d2, #a67c52, #f0e6d2);
  border-radius: 5px;
  z-index: 2;
}

.left {
  left: 0;
}

.right {
  right: 0;
}
</style> 