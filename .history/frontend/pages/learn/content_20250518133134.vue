<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="status-bar-height"></view>
      <view class="title-container">
        <view class="back-button" @tap="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="title">{{ subtitle }}</text>
      </view>
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
    } else {
      console.error('缺少subtitle参数');
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      });
    }
  },
  methods: {
    async fetchContent() {
      this.isLoading = true;
      try {
        console.log('正在获取内容，小标题：', this.subtitle);
        const response = await getLearningContent(this.subtitle);
        console.log('获取内容响应:', response);
        
        if (response.status === 'success' && response.data) {
          this.content = response.data.text_content || '';
          this.images = response.data.images || [];
          console.log('内容获取成功，图片数量:', this.images.length);
        } else {
          console.error('获取内容失败:', response);
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
  background-color: #f0e6d2; /* 与learn.vue保持一致 */
  min-height: 100vh;
}

.header {
  background-color: #f0e6d2;
  padding: 0 0 20rpx 0;
}

.status-bar-height {
  height: 88rpx; /* 状态栏高度 */
}

.title-container {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
}

.back-button {
  padding: 10rpx;
  margin-right: 20rpx;
}

.back-icon {
  font-size: 40rpx;
  color: #6d4126; /* 与learn.vue的主题色一致 */
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #6d4126; /* 与learn.vue的主题色一致 */
  flex: 1;
}

.content-area {
  padding: 30rpx;
}

.loading-container, .empty-container {
  display: flex;
  justify-content: center;
  padding: 60rpx 0;
}

.loading-text, .empty-text {
  font-size: 28rpx;
  color: #8a6642; /* 与learn.vue的次要文本颜色一致 */
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
  border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(109, 65, 38, 0.08); /* 轻微阴影，与learn.vue风格一致 */
}

.text-container {
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
  background-color: #fff;
  padding: 30rpx;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(109, 65, 38, 0.08); /* 轻微阴影，与learn.vue风格一致 */
}
</style> 