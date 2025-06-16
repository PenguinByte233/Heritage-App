<template>
  <view class="container">
    <!-- 顶部区域（包含状态栏和标题） -->
    <view class="top-area">
      <view class="status-bar"></view>
      <view class="header">
        <view class="back-button" @tap="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="title">非遗地图详情</text>
        <view style="width: 60rpx;"></view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y>
      <!-- 地图标题 -->
      <view class="section-title">
        <text class="main-title">中国非物质文化遗产分布</text>
        <text class="sub-title">截至2023年统计数据</text>
      </view>
      
      <!-- 地图展示 -->
      <view class="map-container">
        <swiper class="map-swiper" indicator-dots indicator-active-color="#6d4126" indicator-color="rgba(255, 255, 255, 0.6)">
          <swiper-item>
            <image class="map-image" src="/static/images/Home/Home/地图/非遗分布地图1.jpg" mode="widthFix" @tap="previewImage('/static/images/Home/Home/地图/非遗分布地图1.jpg')"></image>
          </swiper-item>
          <swiper-item>
            <image class="map-image" src="/static/images/Home/Home/地图/非遗分布地图2.jpg" mode="widthFix" @tap="previewImage('/static/images/Home/Home/地图/非遗分布地图2.jpg')"></image>
          </swiper-item>
        </swiper>
        <text class="map-hint">点击图片可查看大图</text>
      </view>
      
      <!-- 统计数据 -->
      <view class="stats-section">
        <view class="stats-title">
          <view class="stats-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 20V10" stroke="#6d4126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 20V4" stroke="#6d4126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 20V14" stroke="#6d4126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </view>
          <text class="stats-title-text">非遗项目统计</text>
        </view>
        
        <view class="stats-cards">
          <view class="stats-card">
            <text class="stats-number">42</text>
            <text class="stats-label">世界级非遗</text>
            <text class="stats-desc">联合国教科文组织认定</text>
          </view>
          
          <view class="stats-card">
            <text class="stats-number">1557</text>
            <text class="stats-label">国家级非遗</text>
            <text class="stats-desc">国家文化和旅游部认定</text>
          </view>
          
          <view class="stats-card">
            <text class="stats-number">13087</text>
            <text class="stats-label">省级非遗</text>
            <text class="stats-desc">各省级文化和旅游厅认定</text>
          </view>
        </view>
      </view>
      
      <!-- 地区分布 -->
      <view class="region-section">
        <view class="section-title">
          <view class="section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C12 22 20 16 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 16 12 22 12 22Z" stroke="#6d4126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#6d4126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </view>
          <text class="section-title-text">地区分布热点</text>
        </view>
        
        <view class="region-list">
          <view class="region-item" v-for="(item, index) in regionData" :key="index">
            <view class="region-rank">{{index + 1}}</view>
            <view class="region-info">
              <text class="region-name">{{item.name}}</text>
              <text class="region-count">{{item.count}}项</text>
            </view>
            <view class="region-bar-container">
              <view class="region-bar" :style="{width: item.percentage + '%'}"></view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 分类统计 -->
      <view class="category-section">
        <view class="section-title">
          <view class="section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8L16 12L12 16L8 12L12 8Z" stroke="#6d4126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 3L19 10L12 21L5 10L12 3Z" stroke="#6d4126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </view>
          <text class="section-title-text">非遗类别分布</text>
        </view>
        
        <view class="category-list">
          <view class="category-item" v-for="(item, index) in categoryData" :key="index" @tap="navigateToCategory(item.name)">
            <view class="category-icon" :class="'category-icon-' + (index % 5)">
              <text class="category-icon-text">{{item.name.substr(0, 1)}}</text>
            </view>
            <view class="category-info">
              <text class="category-name">{{item.name}}</text>
              <text class="category-count">{{item.count}}项</text>
            </view>
            <view class="category-arrow">
              <text class="arrow-icon">›</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部说明 -->
      <view class="footer-note">
        <text class="note-text">数据来源：中国非物质文化遗产网</text>
        <text class="note-text">最后更新：2023年12月</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      regionData: [
        { name: '浙江省', count: 158, percentage: 100 },
        { name: '江苏省', count: 142, percentage: 90 },
        { name: '山东省', count: 138, percentage: 87 },
        { name: '河南省', count: 132, percentage: 84 },
        { name: '四川省', count: 130, percentage: 82 }
      ],
      categoryData: [
        { name: '传统表演艺术', count: 326 },
        { name: '传统技艺', count: 614 },
        { name: '传统医药', count: 98 },
        { name: '民俗', count: 248 },
        { name: '传统音乐', count: 185 },
        { name: '传统美术', count: 86 }
      ]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    previewImage(url) {
      uni.previewImage({
        urls: [
          '/static/images/Home/Home/地图/非遗分布地图1.jpg',
          '/static/images/Home/Home/地图/非遗分布地图2.jpg'
        ],
        current: url
      });
    },
    navigateToCategory(categoryName) {
      uni.navigateTo({
        url: `/pages/learn/category?title=${encodeURIComponent(categoryName)}`
      });
    }
  }
}
</script>

<style>
.container {
  padding: 0;
  background-color: #f0e6d2;
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
  justify-content: space-between;
  align-items: center;
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 40rpx;
  color: #6d4126;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #6d4126;
  text-align: center;
  flex: 1;
}

.content {
  padding: 20rpx 30rpx;
  height: calc(100vh - 44px - 90rpx);
}

.section-title {
  margin: 30rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #6d4126;
  margin-bottom: 10rpx;
}

.sub-title {
  font-size: 26rpx;
  color: #8a6642;
}

.map-container {
  margin: 20rpx 0 40rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.map-swiper {
  width: 100%;
  height: 500rpx;
}

.map-image {
  width: 100%;
  height: auto;
}

.map-hint {
  font-size: 24rpx;
  color: #8a6642;
  text-align: center;
  padding: 16rpx 0;
  display: block;
}

.stats-section {
  margin: 40rpx 0;
}

.stats-title, .section-title {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.stats-icon, .section-icon {
  margin-right: 10rpx;
}

.stats-title-text, .section-title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #6d4126;
}

.stats-cards {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.stats-card {
  width: 30%;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
}

.stats-number {
  font-size: 40rpx;
  font-weight: 700;
  color: #6d4126;
  margin-bottom: 10rpx;
}

.stats-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #8a6642;
  margin-bottom: 10rpx;
}

.stats-desc {
  font-size: 20rpx;
  color: #999;
  text-align: center;
}

.region-section, .category-section {
  margin: 40rpx 0;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
}

.region-list, .category-list {
  margin-top: 20rpx;
}

.region-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.region-rank {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #6d4126;
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.region-info {
  width: 180rpx;
  margin-right: 20rpx;
}

.region-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 5rpx;
  display: block;
}

.region-count {
  font-size: 22rpx;
  color: #8a6642;
}

.region-bar-container {
  flex: 1;
  height: 20rpx;
  background-color: #f0e6d2;
  border-radius: 10rpx;
  overflow: hidden;
}

.region-bar {
  height: 100%;
  background: linear-gradient(to right, #8a6642, #6d4126);
  border-radius: 10rpx;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.category-item:last-child {
  border-bottom: none;
}

.category-icon {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.category-icon-0 {
  background-color: #e9d7c7;
}

.category-icon-1 {
  background-color: #d4b59e;
}

.category-icon-2 {
  background-color: #c19a7b;
}

.category-icon-3 {
  background-color: #a67c52;
}

.category-icon-4 {
  background-color: #8a6642;
}

.category-icon-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #6d4126;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 5rpx;
  display: block;
}

.category-count {
  font-size: 22rpx;
  color: #8a6642;
}

.category-arrow {
  width: 40rpx;
  display: flex;
  justify-content: flex-end;
}

.arrow-icon {
  font-size: 36rpx;
  color: #8a6642;
}

.footer-note {
  margin: 40rpx 0 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.note-text {
  font-size: 22rpx;
  color: #999;
  line-height: 1.6;
}
</style> 