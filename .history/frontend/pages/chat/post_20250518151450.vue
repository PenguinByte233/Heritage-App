<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <view class="header">
      <view class="header-left">
        <view class="back-button" @tap="goBack">
          <text class="back-icon">←</text>
        </view>
      </view>
      <view class="header-title">发布内容</view>
      <view class="header-right">
        <button 
          class="publish-button" 
          :disabled="!isValidPost"
          :class="{'publish-button-active': isValidPost}"
          @tap="publishPost"
        >发布</button>
      </view>
    </view>
    
    <!-- 发布帖子表单 -->
    <view class="post-form">
      <!-- 用户信息展示 -->
      <view class="user-info">
        <image class="avatar" :src="userInfo.avatar_url || '/static/images/default-avatar.png'"></image>
        <view class="user-detail">
          <text class="nickname">{{userInfo.nickname || '游客'}}</text>
          <text class="hint">发布内容将以本账号名义展示</text>
        </view>
      </view>
      
      <!-- 内容输入区 -->
      <view class="content-area">
        <textarea 
          class="content-input" 
          v-model="content" 
          placeholder="分享你的心情、经验或问题..." 
          maxlength="500"
          auto-height
          @input="checkContentLength"
        ></textarea>
        
        <!-- 字数统计 -->
        <view class="word-count" :class="{'word-count-warning': contentLength > 450}">
          {{contentLength}}/500
        </view>
      </view>
      
      <!-- 图片上传区 -->
      <view class="image-upload-area">
        <view class="image-upload-title">
          <text class="title-text">添加图片</text>
          <text class="title-hint">(选填，最多9张)</text>
        </view>
        
        <view class="image-list">
          <view 
            class="image-item" 
            v-for="(img, index) in imageList" 
            :key="index"
          >
            <image class="preview-image" :src="img" mode="aspectFill"></image>
            <view class="delete-button" @tap="deleteImage(index)">×</view>
          </view>
          
          <view class="image-upload-button" @tap="chooseImage" v-if="imageList.length < 9">
            <text class="upload-icon">+</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 提交确认弹窗 -->
    <view class="submit-modal" v-if="showSubmitModal">
      <view class="modal-content">
        <view class="modal-title">确认发布</view>
        <view class="modal-body">您确定要发布这条内容吗？</view>
        <view class="modal-footer">
          <button class="modal-button cancel" @tap="cancelSubmit">取消</button>
          <button class="modal-button confirm" @tap="confirmSubmit">确认</button>
        </view>
      </view>
    </view>
    
    <!-- 加载提示 -->
    <view class="loading-container" v-if="isLoading">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在发布...</text>
    </view>
  </view>
</template>

<script>
import { createPost } from '@/api/api.js';

export default {
  data() {
    return {
      content: '',
      contentLength: 0,
      imageList: [],
      isLoading: false,
      showSubmitModal: false,
      userInfo: {} // 用户信息
    };
  },
  computed: {
    isValidPost() {
      // 内容非空且不超过500个字符
      return this.content.trim().length > 0 && this.content.length <= 500;
    }
  },
  onLoad() {
    // 获取用户信息
    this.getUserInfo();
  },
  methods: {
    getUserInfo() {
      try {
        const userInfoStr = uni.getStorageSync('userInfo');
        if (userInfoStr) {
          this.userInfo = JSON.parse(userInfoStr);
        } else {
          // 如果没有用户信息，提示用户登录
          uni.showModal({
            title: '提示',
            content: '请先登录后再发布帖子',
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: '/pages/login/login'
                });
              } else {
                uni.navigateBack();
              }
            }
          });
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    },
    checkContentLength() {
      this.contentLength = this.content.length;
    },
    chooseImage() {
      uni.chooseImage({
        count: 9 - this.imageList.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // 将选择的图片添加到列表中
          const tempFilePaths = res.tempFilePaths;
          this.imageList = [...this.imageList, ...tempFilePaths];
        },
        fail: (err) => {
          console.error('选择图片失败', err);
        }
      });
    },
    deleteImage(index) {
      this.imageList.splice(index, 1);
    },
    publishPost() {
      if (!this.isValidPost) {
        uni.showToast({
          title: '内容不能为空',
          icon: 'none'
        });
        return;
      }
      
      // 检查用户是否登录
      if (!this.userInfo || !this.userInfo.id) {
        uni.showModal({
          title: '提示',
          content: '请先登录后再发布帖子',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/login/login'
              });
            }
          }
        });
        return;
      }
      
      // 显示确认弹窗
      this.showSubmitModal = true;
    },
    cancelSubmit() {
      this.showSubmitModal = false;
    },
    async confirmSubmit() {
      this.showSubmitModal = false;
      this.isLoading = true;
      
      try {
        // 首先处理图片上传
        let uploadedImages = [];
        
        if (this.imageList.length > 0) {
          await this.uploadImages().then(res => {
            uploadedImages = res;
          }).catch(err => {
            console.error('上传图片失败:', err);
            throw new Error('上传图片失败');
          });
        }
        
        // 创建帖子数据
        const postData = {
          author_id: this.userInfo.id,
          author_name: this.userInfo.nickname || '游客',
          content: this.content,
          images: uploadedImages
        };
        
        // 调用API发布帖子
        const response = await createPost(postData);
        
        if (response.status === 'success') {
          uni.showToast({
            title: '发布成功',
            icon: 'success'
          });
          
          // 延迟返回，让用户看到成功提示
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          throw new Error(response.message || '发布失败');
        }
      } catch (error) {
        console.error('发布帖子失败:', error);
        uni.showToast({
          title: error.message || '发布失败，请稍后再试',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    async uploadImages() {
      // 这里模拟图片上传，实际项目中需要实现文件上传到服务器
      // 由于Demo项目可能不需要实际上传，这里只返回本地路径
      console.log('上传图片:', this.imageList);
      
      return new Promise((resolve) => {
        // 模拟上传延迟
        setTimeout(() => {
          // 返回图片路径数组
          resolve(this.imageList);
        }, 500);
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
  min-height: 100vh;
  background-color: #f5f1e6;
  padding: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #f0e6d2;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.header-left, .header-right {
  width: 120rpx;
  display: flex;
  align-items: center;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #6d4126;
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.back-icon {
  font-size: 36rpx;
  font-weight: bold;
  color: #6d4126;
}

.publish-button {
  font-size: 28rpx;
  color: #999;
  background-color: #f0e6d2;
  border-radius: 30rpx;
  padding: 10rpx 20rpx;
  margin: 0;
  line-height: 1.5;
}

.publish-button-active {
  color: #fff;
  background: linear-gradient(135deg, #8a6642 0%, #6d4126 100%);
  box-shadow: 0 4rpx 10rpx rgba(109, 65, 38, 0.3);
}

.post-form {
  padding: 30rpx;
  background-color: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #f0e6d2;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  border: 2rpx solid #f0e6d2;
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 4rpx;
}

.hint {
  font-size: 22rpx;
  color: #999;
}

.content-area {
  margin-bottom: 30rpx;
  position: relative;
}

.content-input {
  width: 100%;
  min-height: 240rpx;
  font-size: 32rpx;
  color: #333;
  padding: 0;
  line-height: 1.6;
}

.word-count {
  position: absolute;
  bottom: 10rpx;
  right: 10rpx;
  font-size: 24rpx;
  color: #999;
}

.word-count-warning {
  color: #ff6b6b;
}

.image-upload-area {
  margin-top: 40rpx;
}

.image-upload-title {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.title-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-right: 10rpx;
}

.title-hint {
  font-size: 24rpx;
  color: #999;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
}

.image-item, .image-upload-button {
  width: 200rpx;
  height: 200rpx;
  margin-right: 15rpx;
  margin-bottom: 15rpx;
  border-radius: 8rpx;
  overflow: hidden;
  position: relative;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.delete-button {
  position: absolute;
  top: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24rpx;
}

.image-upload-button {
  background-color: #f9f6f0;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed #d0c0a6;
}

.upload-icon {
  font-size: 60rpx;
  color: #d0c0a6;
}

.submit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  width: 560rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.modal-title {
  padding: 30rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #f0e6d2;
}

.modal-body {
  padding: 40rpx 30rpx;
  text-align: center;
  font-size: 30rpx;
  color: #666;
}

.modal-footer {
  display: flex;
  border-top: 1px solid #f0e6d2;
}

.modal-button {
  flex: 1;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  font-size: 30rpx;
  margin: 0;
  border-radius: 0;
}

.cancel {
  border-right: 1px solid #f0e6d2;
  color: #999;
  background-color: #fff;
}

.confirm {
  color: #fff;
  background: linear-gradient(135deg, #8a6642 0%, #6d4126 100%);
}

.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #f3f3f3;
  border-top: 6rpx solid #6d4126;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}
</style> 