<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="back-button" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">{{ subtitle }}</text>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 加载提示 -->
      <view class="loading-container" v-if="isLoading">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 内容展示 -->
      <view class="content-container" v-if="!isLoading && content">
        <!-- 图片展示 -->
        <view class="images-container" v-if="images.length > 0">
          <image 
            v-for="(image, index) in images" 
            :key="index" 
            :src="image" 
            class="content-image" 
            mode="widthFix"
            @tap="previewImage(index)"
          ></image>
        </view>
        
        <!-- 文本内容 -->
        <view class="text-container">
          <rich-text :nodes="formattedContent"></rich-text>
        </view>
      </view>
      
      <!-- 无内容提示 -->
      <view class="empty-container" v-if="!isLoading && !content">
        <text class="empty-text">暂无相关内容</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getLearningContent } from '@/api/api.js';

export default {
  data() {
    return {
      subtitle: '',
      content: '',
      images: [],
      isLoading: false
    };
  },
  computed: {
    formattedContent() {
      if (!this.content) return '';
      
      // 简单处理文本内容，将换行符转换为HTML标签
      return this.content.replace(/\n/g, '<br>');
    }
  },
  onLoad(options) {
    if (options.subtitle) {
      this.subtitle = decodeURIComponent(options.subtitle);
      this.fetchContent();
    }
  },
  methods: {
    async fetchContent() {
      this.isLoading = true;
      try {
        const response = await getLearningContent(this.subtitle);
        if (response.status === 'success' && response.data) {
          this.content = response.data.text_content || '';
          this.images = response.data.images || [];
        } else {
          uni.showToast({
            title: '获取内容失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取内容失败:', error);
        uni.showToast({
          title: '获取内容失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    previewImage(index) {
      uni.previewImage({
        current: this.images[index],
        urls: this.images
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
  background-color: #fff;
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

.content-area {
  padding: 20rpx;
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

.content-container {
  padding: 20rpx 0;
}

.images-container {
  margin-bottom: 30rpx;
}

.content-image {
  width: 100%;
  margin-bottom: 20rpx;
  border-radius: 8rpx;
}

.text-container {
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
}
</style> 