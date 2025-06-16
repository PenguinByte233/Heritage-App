<template>
  <view class="container">
    <!-- 顶部区域（包含状态栏和标题） -->
    <view class="top-area">
      <view class="status-bar"></view>
      <view class="header">
        <text class="title">国家非遗</text>
      </view>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-box" @tap="showSearchTip">
      <image class="search-icon" src="https://img.icons8.com/ios/50/000000/search--v1.png"></image>
      <text class="search-placeholder">请输入关键字进行搜索</text>
    </view>
    
    <!-- 轮播图 -->
    <view class="banner-container">
      <swiper class="banner-swiper" circular autoplay interval="3000" duration="500" indicator-dots indicator-active-color="#6d4126" indicator-color="rgba(255, 255, 255, 0.6)">
        <swiper-item v-for="(image, index) in bannerImages" :key="index">
          <image class="banner-image" :src="image" mode="aspectFill"></image>
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
    
    <!-- 非遗地图区域 -->
    <view class="map-section">
      <view class="section-header">
        <view class="section-title-container">
          <view class="section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C12 22 20 16 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 16 12 22 12 22Z" stroke="#6d4126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#6d4126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </view>
          <text class="section-title">非遗·地图</text>
        </view>
        <view class="more-container" @tap="showMapDetail">
          <text class="more-text">详情</text>
          <view class="more-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="#6d4126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </view>
        </view>
      </view>
      
      <view class="map-container">
        <view class="map-card">
          <image class="map-image" :src="mapImage" mode="aspectFill" @tap="showMapDetail"></image>
          <view class="map-overlay">
            <text class="map-title">{{ mapTitle }}</text>
            <text class="map-subtitle">{{ mapSubtitle }}</text>
          </view>
        </view>
        
        <view class="map-stats">
          <view class="stat-item">
            <text class="stat-number">{{ statistics.world }}</text>
            <text class="stat-label">世界级非遗</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ statistics.national }}</text>
            <text class="stat-label">国家级非遗</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ statistics.provincial }}</text>
            <text class="stat-label">省级非遗</text>
          </view>
        </view>
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
      <view class="more-container" @tap="navigateToLearn">
        <text class="more-text">更多</text>
        <view class="more-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="#6d4126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-container">
      <!-- 项目内容 -->
      <view class="projects-content">
        <!-- 左侧装饰 -->
        <view class="border-decoration left"></view>
        
        <!-- 项目轮播 -->
        <swiper class="item-swiper" circular previous-margin="60px" next-margin="60px" @change="onProjectChange">
          <swiper-item v-for="(item, index) in projectItems" :key="index" class="swiper-item-container">
            <view class="item-card" :class="{'current-item': currentProjectIndex === index}" @tap="navigateToLearnCategory(item)">
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
    </view>
    
    <!-- 底部留白区域 -->
    <view style="height: 60px;"></view>
  </view>
</template>

<script>
import { getHomeResources, getMapResources, processImageUrl } from '@/api/api.js';

export default {
  data() {
    return {
      currentProjectIndex: 0,
      bannerImages: [],
      categories: [
        { 
          name: '首页', 
          icon: '../../static/images/tabbar/museum.png',
          path: '/pages/home/home'
        },
        { 
          name: '学习', 
          icon: '../../static/images/tabbar/锤子.png',
          path: '/pages/learn/learn'
        },
        { 
          name: '购买', 
          icon: '../../static/images/tabbar/shopping-cart.png',
          path: '/pages/buy/buy'
        },
        { 
          name: '社区', 
          icon: '../../static/images/tabbar/chat.png',
          path: '/pages/chat/chat'
        },
        { 
          name: '我的', 
          icon: '../../static/images/tabbar/profile.png',
          path: '/pages/profile/profile'
        }
      ],
      projectItems: [],
      mapImage: '',
      mapTitle: '中国非物质文化遗产分布',
      mapSubtitle: '点击查看详细分布',
      isLoading: true,
      statistics: {
        world: 42,
        national: 1557,
        provincial: 13087
      }
    }
  },
  onLoad() {
    this.fetchHomeResources();
    this.fetchMapResources();
  },
  methods: {
    // 获取首页资源
    async fetchHomeResources() {
      this.isLoading = true;
      try {
        console.log('开始获取首页资源...');
        const response = await getHomeResources();
        console.log('获取首页资源响应:', response);
        
        if (response && response.success && response.data) {
          console.log('获取首页资源成功');
          
          // 设置轮播图数据
          if (response.data.bannerImages && response.data.bannerImages.length > 0) {
            console.log('设置轮播图数据:', response.data.bannerImages);
            this.bannerImages = response.data.bannerImages.map(url => processImageUrl(url));
          } else {
            console.warn('未获取到轮播图数据');
          }
          
          // 设置项目轮播图数据
          if (response.data.projectItems && response.data.projectItems.length > 0) {
            console.log('设置项目轮播图数据:', response.data.projectItems);
            this.projectItems = response.data.projectItems.map(item => ({
              ...item,
              image: processImageUrl(item.image)
            }));
          } else {
            console.warn('未获取到项目轮播图数据');
          }
          
          // 设置地图数据
          if (response.data.mapImages && response.data.mapImages.length > 0) {
            const mapData = response.data.mapImages[0];
            console.log('设置地图数据:', mapData);
            this.mapImage = processImageUrl(mapData.image_url);
            this.mapTitle = mapData.title || '中国非物质文化遗产分布';
            this.mapSubtitle = mapData.description || '点击查看详细分布';
          } else {
            console.warn('未获取到地图数据');
          }
        } else {
          console.error('获取首页资源失败:', response);
          this.showErrorToast('获取首页资源失败');
        }
      } catch (error) {
        console.error('获取首页资源出错:', error);
        this.showErrorToast('获取首页资源出错');
      } finally {
        this.isLoading = false;
      }
    },
    
    // 获取地图详情资源
    async fetchMapResources() {
      try {
        console.log('开始获取地图详情资源...');
        const response = await getMapResources();
        console.log('获取地图详情资源响应:', response);
        
        if (response && response.success && response.data) {
          console.log('获取地图详情资源成功');
          
          // 设置统计数据
          if (response.data.statistics) {
            console.log('设置统计数据:', response.data.statistics);
            this.statistics = response.data.statistics;
          } else {
            console.warn('未获取到统计数据');
          }
          
          // 处理地图图片
          if (response.data.mapImages && response.data.mapImages.length > 0) {
            console.log('处理地图图片:', response.data.mapImages);
            response.data.mapImages = response.data.mapImages.map(url => processImageUrl(url));
          }
        } else {
          console.error('获取地图资源失败:', response);
        }
      } catch (error) {
        console.error('获取地图资源出错:', error);
      }
    },
    
    // 显示错误提示
    showErrorToast(message) {
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      });
    },
    
    navigateToCategory(category) {
      uni.switchTab({
        url: category.path
      });
    },
    navigateToLearn() {
      uni.switchTab({
        url: '/pages/learn/learn'
      });
    },
    navigateToLearnCategory(item) {
      // 检查项目标题是否在学习页面的分类列表中
      const learnCategories = [
        '传统表演艺术',
        '传统服饰',
        '传统节日与庆典',
        '传统乐器与音乐',
        '传统艺术与工艺',
        '传统装饰与配饰',
        '文化与创意产业'
      ];
      
      if (learnCategories.includes(item.title)) {
        console.log('准备跳转到学习页面，分类:', item.title);
        
        // 先设置全局变量，确保在页面切换前就准备好了数据
        getApp().globalData = getApp().globalData || {};
        getApp().globalData.selectedCategory = item.title;
        getApp().globalData.needScrollToCategory = true; // 添加一个标记，表示需要滚动到对应分类
        
        console.log('已设置全局变量:', getApp().globalData);
        
        // 延迟一点再执行跳转，确保全局变量设置完成
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/learn/learn',
            success: () => {
              console.log('已跳转到学习页面');
            },
            fail: (err) => {
              console.error('跳转到学习页面失败:', err);
            }
          });
        }, 50);
      } else {
        // 否则尝试导航到分类详情页
        console.log('准备跳转到分类详情页:', item.title);
        uni.navigateTo({
          url: `/pages/learn/category?title=${encodeURIComponent(item.title)}&autoScroll=true`,
          success: () => {
            console.log('已跳转到分类详情页');
          },
          fail: (err) => {
            console.error('导航失败:', err);
            uni.showToast({
              title: '该分类暂未开放',
              icon: 'none'
            });
          }
        });
      }
    },
    onProjectChange(e) {
      this.currentProjectIndex = e.detail.current;
    },
    showMapDetail() {
      uni.navigateTo({
        url: '/pages/home/map-detail'
      });
    },
    showSearchTip() {
      uni.showToast({
        title: '搜索功能开发中',
        icon: 'none'
      });
    }
  }
}
</script>

<style>
.container {
  padding: 0;
  background-color: #f0e6d2; /* 统一背景色 */
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.top-area {
  background-color: #f0e6d2;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.status-bar {
  height: 44px; /* 适配顶部安全区域 */
  background-color: #f0e6d2;
}

.header {
  padding: 20rpx 30rpx;
  background-color: #f0e6d2;
  border-bottom: 1px solid #f0e6d2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #6d4126;
  text-align: center;
}

.search-box {
  margin: 20rpx 30rpx;
  height: 70rpx;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 35rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
}

.search-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.search-placeholder {
  font-size: 28rpx;
  color: #999;
}

.banner-container {
  margin: 20rpx 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.banner-swiper {
  height: 300rpx;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.category-icons {
  display: flex;
  justify-content: space-around;
  margin: 40rpx 20rpx;
  background-color: rgba(255, 255, 255, 0.5);
  padding: 20rpx;
  border-radius: 16rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.category-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 10rpx;
}

.category-name {
  font-size: 24rpx;
  color: #333;
}

/* 地图区域样式 */
.map-section {
  margin: 30rpx 20rpx;
  padding: 20rpx;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 16rpx;
}

.map-container {
  margin-top: 20rpx;
}

.map-card {
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 20rpx;
}

.map-image {
  width: 100%;
  height: 400rpx;
  display: block;
}

.map-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx 20rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
}

.map-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8rpx;
  display: block;
}

.map-subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.map-stats {
  display: flex;
  justify-content: space-between;
  margin: 20rpx 0 30rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 12rpx;
  margin: 0 10rpx;
}

.stat-item:first-child {
  margin-left: 0;
}

.stat-item:last-child {
  margin-right: 0;
}

.stat-number {
  font-size: 36rpx;
  font-weight: 700;
  color: #6d4126;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #8a6642;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30rpx 30rpx 20rpx;
}

.section-title-container {
  display: flex;
  align-items: center;
}

.section-icon {
  margin-right: 10rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #6d4126;
}

.more-container {
  display: flex;
  align-items: center;
}

.more-text {
  font-size: 24rpx;
  color: #6d4126;
  margin-right: 5rpx;
}

.content-container {
  padding: 20rpx 0;
}

.projects-content {
  position: relative;
}

.border-decoration {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 300rpx;
  background-color: rgba(109, 65, 38, 0.2);
  border-radius: 20rpx;
  z-index: 1;
}

.left {
  left: 0;
}

.right {
  right: 0;
}

.item-swiper {
  height: 400rpx;
}

.swiper-item-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.item-card {
  width: 90%;
  height: 340rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.current-item {
  height: 380rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.2);
}

.item-image {
  width: 100%;
  height: 100%;
}

.item-title-bar {
  margin: 20rpx 30rpx 10rpx;
  text-align: center;
}

.item-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #6d4126;
}

.item-description {
  margin: 0 60rpx;
  text-align: center;
}

.item-description-text {
  font-size: 24rpx;
  color: #6d4126;
  line-height: 1.5;
}
</style> 