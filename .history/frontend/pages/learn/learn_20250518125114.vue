<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
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
        <view class="subcategory-info">
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
  background-color: #f8f8f8;
  min-height: 100vh;
}

.header {
  padding: 30rpx 0;
  background-color: #f0e6d2;
  text-align: center;
  border-bottom: 1px solid #e6dcc8;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #6d4126;
  display: inline-block;
}

/* 导航栏样式 */
.nav-tabs {
  display: flex;
  white-space: nowrap;
  background-color: #fff;
  padding: 0;
  border-bottom: 1px solid #f0f0f0;
}

.nav-tab {
  display: inline-block;
  padding: 20rpx 30rpx;
  position: relative;
}

.nav-text {
  font-size: 28rpx;
  color: #666;
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
  padding: 20rpx;
}

.subcategory-item {
  display: flex;
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.subcategory-image {
  width: 200rpx;
  height: 160rpx;
  flex-shrink: 0;
}

.subcategory-info {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.subcategory-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 60rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.empty-tip {
  width: 100%;
  padding: 60rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style> 