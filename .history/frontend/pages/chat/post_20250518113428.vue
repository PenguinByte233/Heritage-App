<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">取消</view>
      <text class="title">发布帖子</text>
      <view class="publish-btn" @tap="publishPost" :class="{ 'disabled': !isValid }">发布</view>
    </view>
    
    <!-- 发布内容区域 -->
    <view class="post-content">
      <textarea
        class="content-input"
        v-model="content"
        placeholder="分享你的非遗故事..."
        maxlength="500"
        auto-height
      ></textarea>
      
      <view class="word-count">
        <text>{{ content.length }}/500</text>
      </view>
    </view>
    
    <!-- 添加图片区域 -->
    <view class="image-section">
      <view class="image-list">
        <view 
          v-for="(image, index) in images" 
          :key="index"
          class="image-item"
        >
          <image :src="image" class="preview-image"></image>
          <view class="delete-icon" @tap="removeImage(index)">×</view>
        </view>
        
        <view class="add-image" @tap="chooseImage" v-if="images.length < 9">
          <text class="add-icon">+</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { createPost } from '@/api/api.js';

export default {
  data() {
    return {
      content: '',
      images: []
    };
  },
  computed: {
    isValid() {
      return this.content.trim().length > 0;
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    async publishPost() {
      if (!this.isValid) {
        return;
      }
      
      uni.showLoading({
        title: '发布中...'
      });
      
      try {
        const response = await createPost({
          content: this.content,
          images: this.images
        });
        
        if (response.status === 'success') {
          uni.hideLoading();
          uni.showToast({
            title: '发布成功',
            icon: 'success'
          });
          
          // 延迟返回，让用户看到发布成功的提示
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          throw new Error('发布失败');
        }
      } catch (error) {
        console.error('发布帖子失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '发布失败',
          icon: 'none'
        });
      }
    },
    chooseImage() {
      uni.chooseImage({
        count: 9 - this.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // 这里应该上传图片到服务器，获取URL后再添加到images数组
          // 为了演示，我们直接使用本地临时路径
          this.images = [...this.images, ...res.tempFilePaths];
        }
      });
    },
    removeImage(index) {
      this.images.splice(index, 1);
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
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #eee;
}

.back-btn {
  font-size: 32rpx;
  color: #333;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.publish-btn {
  padding: 10rpx 30rpx;
  background-color: #6d4126;
  color: #fff;
  font-size: 28rpx;
  border-radius: 30rpx;
}

.publish-btn.disabled {
  background-color: #ccc;
}

.post-content {
  padding: 30rpx;
}

.content-input {
  width: 100%;
  min-height: 300rpx;
  font-size: 32rpx;
  line-height: 1.6;
}

.word-count {
  text-align: right;
  padding: 10rpx 0;
  font-size: 24rpx;
  color: #999;
}

.image-section {
  padding: 0 30rpx 30rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
}

.image-item, .add-image {
  width: 220rpx;
  height: 220rpx;
  margin-right: 15rpx;
  margin-bottom: 15rpx;
  position: relative;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.delete-icon {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28rpx;
}

.add-image {
  border: 1px dashed #ddd;
  border-radius: 8rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-icon {
  font-size: 60rpx;
  color: #ddd;
}
</style> 