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
        <view class="loading-icon"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 内容展示 -->
      <view class="content-container" v-if="!isLoading && (content || images.length > 0)">
        <!-- 图片展示 -->
        <view class="images-container" v-if="images.length > 0">
          <view class="image-count" v-if="images.length > 1">
            <text class="image-count-text">共 {{ images.length }} 张图片</text>
          </view>
          <image 
            v-for="(image, index) in images" 
            :key="index" 
            :src="image" 
            class="content-image" 
            mode="widthFix"
            @tap="previewImage(index)"
            @error="handleImageError(index)"
          ></image>
        </view>
        
        <!-- 文本内容 -->
        <view class="text-container" v-if="content">
          <rich-text :nodes="formattedContent"></rich-text>
        </view>
        
        <!-- 无文本内容提示 -->
        <view class="no-text-container" v-if="!content && images.length > 0">
          <text class="no-text">暂无文字描述</text>
        </view>
      </view>
      
      <!-- 无内容提示 -->
      <view class="empty-container" v-if="!isLoading && !content && images.length === 0">
        <text class="empty-text">暂无相关内容</text>
      </view>
      
      <!-- 错误提示 -->
      <view class="error-container" v-if="loadError">
        <text class="error-text">{{ errorMessage }}</text>
        <view class="retry-button" @tap="fetchContent">
          <text class="retry-text">重试</text>
        </view>
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
      isLoading: false,
      loadError: false,
      errorMessage: '获取内容失败',
      failedImages: [] // 记录加载失败的图片
    };
  },
  computed: {
    formattedContent() {
      if (!this.content) return '';
      
      // 简单处理文本内容，将换行符转换为HTML标签
      let formatted = this.content.replace(/\n/g, '<br>');
      
      // 处理可能的Markdown标记
      // 标题
      formatted = formatted.replace(/#{1,6}\s+(.+)/g, '<h3>$1</h3>');
      // 粗体
      formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // 斜体
      formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
      
      return formatted;
    }
  },
  onLoad(options) {
    if (options.subtitle) {
      this.subtitle = decodeURIComponent(options.subtitle);
      this.fetchContent();
    } else {
      console.error('缺少subtitle参数');
      this.loadError = true;
      this.errorMessage = '参数错误';
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      });
    }
  },
  methods: {
    async fetchContent() {
      this.isLoading = true;
      this.loadError = false;
      this.failedImages = [];
      
      try {
        console.log('正在获取内容，小标题：', this.subtitle);
        const response = await getLearningContent(this.subtitle);
        console.log('获取内容响应:', response);
        
        if (response.status === 'success' && response.data) {
          this.content = response.data.text_content || '';
          this.images = response.data.images || [];
          console.log('内容获取成功，图片数量:', this.images.length);
          
          if (this.images.length === 0 && !this.content) {
            console.warn('获取的内容为空');
            uni.showToast({
              title: '内容为空',
              icon: 'none'
            });
          }
        } else {
          console.error('获取内容失败:', response);
          this.loadError = true;
          this.errorMessage = response.message || '获取内容失败';
          uni.showToast({
            title: '获取内容失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取内容失败:', error);
        this.loadError = true;
        this.errorMessage = '网络错误，请重试';
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    previewImage(index) {
      // 过滤掉加载失败的图片
      const validImages = this.images.filter((_, i) => !this.failedImages.includes(i));
      if (validImages.length > 0) {
        const currentIndex = this.failedImages.filter(i => i < index).length;
        uni.previewImage({
          current: validImages[index - currentIndex],
          urls: validImages
        });
      }
    },
    handleImageError(index) {
      console.error(`图片 ${index + 1} 加载失败: ${this.images[index]}`);
      if (!this.failedImages.includes(index)) {
        this.failedImages.push(index);
      }
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.loading-icon {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #e0d6c2;
  border-top: 4rpx solid #6d4126;
  border-radius: 50%;
  margin-bottom: 20rpx;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text, .empty-text, .error-text, .no-text {
  font-size: 28rpx;
  color: #8a6642; /* 与learn.vue的次要文本颜色一致 */
}

.content-container {
  padding: 20rpx 0;
}

.images-container {
  margin-bottom: 30rpx;
  position: relative;
}

.image-count {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  z-index: 2;
}

.image-count-text {
  color: #fff;
  font-size: 24rpx;
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

.empty-container, .error-container, .no-text-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 12rpx;
}

.retry-button {
  margin-top: 30rpx;
  background-color: #6d4126;
  color: #fff;
  padding: 15rpx 40rpx;
  border-radius: 30rpx;
  box-shadow: 0 4rpx 8rpx rgba(109, 65, 38, 0.2);
}

.retry-text {
  color: #fff;
  font-size: 28rpx;
}
</style> 