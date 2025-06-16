<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="status-bar-height"></view>
      <text class="title">国家非遗</text>
    </view>
    
    <!-- 大标题导航栏 -->
    <scroll-view scroll-x class="nav-tabs" show-scrollbar="false">
      <view 
        v-for="(category, index) in categories" 
        :key="index"
        class="nav-tab"
        :class="{'active': currentCategory === category.title}"
        @tap="selectCategory(category.title)"
      >
        <text class="nav-text">{{ category.title }}</text>
      </view>
    </scroll-view>
    
    <!-- 小标题卡片列表 -->
    <view class="subcategory-list" v-if="!isLoading">
      <view 
        v-for="(item, index) in subcategories" 
        :key="index"
        class="subcategory-item"
        @tap="navigateToContent(item)"
      >
        <image class="subcategory-image" :src="item.image_url" mode="aspectFill"></image>
        <view class="subcategory-title-container">
          <text class="subcategory-title">{{ item.subtitle }}</text>
        </view>
      </view>
      
      <!-- 空状态提示 -->
      <view class="empty-tip" v-if="subcategories.length === 0">
        <text class="empty-text">暂无内容，请选择其他分类</text>
      </view>
    </view>
    
    <!-- 加载指示器 -->
    <view class="loading-container" v-if="isLoading">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { getLearningHeaders } from '@/api/api.js';

export default {
  data() {
    return {
      // 本地存储的大标题数据
      categories: [
        { title: '传统表演艺术' },
        { title: '传统服饰' },
        { title: '传统节日与庆典' },
        { title: '传统乐器与音乐' },
        { title: '传统艺术与工艺' },
        { title: '传统装饰与配饰' },
        { title: '文化与创意产业' }
      ],
      currentCategory: '',
      subcategories: [],
      isLoading: false
    };
  },
  onLoad() {
    // 默认选中第一个分类
    if (this.categories.length > 0) {
      this.currentCategory = this.categories[0].title;
      this.fetchSubcategories(this.currentCategory);
    }
  },
  methods: {
    async fetchSubcategories(title) {
      this.isLoading = true;
      this.subcategories = [];
      
      try {
        const response = await getLearningHeaders(title);
        if (response.status === 'success' && response.data) {
          this.subcategories = response.data;
        } else {
          uni.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取小标题列表失败:', error);
        uni.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    selectCategory(title) {
      if (this.currentCategory !== title) {
        this.currentCategory = title;
        this.fetchSubcategories(title);
      }
    },
    navigateToContent(item) {
      uni.navigateTo({
        url: `/pages/learn/content?subtitle=${encodeURIComponent(item.subtitle)}`
      });
    }
  }
};
</script>

<style>
.container {
  padding: 0;
  background-color: #f0e6d2; /* 统一背景色 */
  min-height: 100vh;
}

.header {
  padding: 0 0 20rpx 0;
  background-color: #f0e6d2;
  text-align: center;
}

.status-bar-height {
  height: 88rpx; /* 状态栏高度，根据实际情况调整 */
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #6d4126;
  display: inline-block;
  padding: 30rpx 0 10rpx 0;
}

/* 导航栏样式 */
.nav-tabs {
  display: flex;
  white-space: nowrap;
  background-color: #f0e6d2; /* 与容器背景色保持一致 */
  padding: 8rpx 0 12rpx 0; /* 稍微增加下方内边距代替边框 */
  position: relative;
  z-index: 10;
}

.nav-tab {
  display: inline-block;
  padding: 20rpx 30rpx;
  position: relative;
}

.nav-text {
  font-size: 28rpx;
  color: #8a6642; /* 棕色调，与整体主题一致 */
}

.nav-tab.active .nav-text {
  color: #6d4126;
  font-weight: bold;
}

.nav-tab.active:after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background-color: #6d4126;
}

/* 小标题列表样式 */
.subcategory-list {
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx; /* 增大间距，使卡片更加突出 */
}

.subcategory-item {
  position: relative;
  width: 100%;
  height: 380rpx; /* 稍微增加高度 */
  border-radius: 16rpx; /* 增大圆角 */
  overflow: hidden;
  box-shadow: 0 6rpx 16rpx rgba(109, 65, 38, 0.1); /* 阴影颜色与主题一致，降低不透明度 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.subcategory-item:active {
  transform: scale(0.98); /* 点击时的缩小效果 */
  box-shadow: 0 3rpx 8rpx rgba(109, 65, 38, 0.08);
}

.subcategory-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.subcategory-title-container {
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 24rpx 28rpx; /* 增大内边距 */
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
  width: 100%;
  height: 140rpx; /* 固定高度，使渐变效果更明显 */
  display: flex;
  align-items: flex-end;
}

.subcategory-title {
  font-size: 34rpx; /* 稍微增大字体 */
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
  line-height: 1.4;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 80rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #8a6642; /* 棕色调，与整体主题一致 */
}

.empty-tip {
  width: 100%;
  padding: 80rpx 0;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.3); /* 降低不透明度，使其与背景更协调 */
  border-radius: 12rpx;
  margin-top: 40rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #8a6642;
  font-weight: 500;
}
</style> 