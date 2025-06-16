<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="back-button" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">{{ title }}</text>
    </view>
    
    <!-- 小标题列表 -->
    <view class="subtitle-list">
      <view 
        v-for="(item, index) in subtitleList" 
        :key="index" 
        class="subtitle-item"
        @tap="navigateToContent(item)"
      >
        <image class="subtitle-image" :src="item.image_url" mode="aspectFill"></image>
        <view class="subtitle-info">
          <text class="subtitle-title">{{ item.subtitle }}</text>
        </view>
      </view>
      
      <!-- 加载提示 -->
      <view class="loading-container" v-if="isLoading">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 无内容提示 -->
      <view class="empty-container" v-if="!isLoading && subtitleList.length === 0">
        <text class="empty-text">暂无相关内容</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getLearningHeaders } from '@/api/api.js';

export default {
  data() {
    return {
      title: '',
      subtitleList: [],
      isLoading: false
    };
  },
  onLoad(options) {
    if (options.title) {
      this.title = decodeURIComponent(options.title);
      this.fetchSubtitles();
    }
  },
  methods: {
    async fetchSubtitles() {
      this.isLoading = true;
      try {
        const response = await getLearningHeaders(this.title);
        if (response.status === 'success' && response.data) {
          this.subtitleList = response.data;
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
    navigateToContent(item) {
      uni.navigateTo({
        url: `/pages/learn/content?subtitle=${encodeURIComponent(item.subtitle)}`
      });
    },
    goBack() {
      uni.navigateBack();
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
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.back-button {
  padding: 10rpx;
  margin-right: 20rpx;
}

.back-icon {
  font-size: 40rpx;
  color: #333;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.subtitle-list {
  padding: 20rpx;
}

.subtitle-item {
  position: relative;
  margin-bottom: 30rpx;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.subtitle-image {
  width: 100%;
  height: 300rpx;
}

.subtitle-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
}

.subtitle-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.loading-container, .empty-container {
  display: flex;
  justify-content: center;
  padding: 60rpx 0;
}

.loading-text, .empty-text {
  font-size: 28rpx;
  color: #999;
}
</style> 