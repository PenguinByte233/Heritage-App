<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">社区广场</text>
      <view class="post-btn" @tap="showPostForm">
        <text class="post-btn-text">发布</text>
      </view>
    </view>
    
    <!-- 帖子列表 -->
    <view class="post-list">
      <!-- 加载提示 -->
      <view class="loading-container" v-if="isLoading">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 帖子卡片 -->
      <view 
        v-for="(post, index) in posts" 
        :key="index"
        class="post-card"
        @tap="navigateToDetail(post)"
      >
        <view class="post-header">
          <text class="post-author">{{ post.author_name }}</text>
          <text class="post-time">{{ formatTime(post.created_at) }}</text>
        </view>
        <view class="post-content">
          <text class="post-text">{{ post.content }}</text>
        </view>
        <view class="post-footer">
          <view class="post-action">
            <text class="post-action-icon">💬</text>
            <text class="post-action-count">{{ post.comment_count || 0 }}</text>
          </view>
          <view class="post-action">
            <text class="post-action-icon">👍</text>
            <text class="post-action-count">{{ post.like_count || 0 }}</text>
          </view>
        </view>
      </view>
      
      <!-- 无内容提示 -->
      <view class="empty-container" v-if="!isLoading && posts.length === 0">
        <text class="empty-text">暂无帖子，快来发布第一篇吧！</text>
      </view>
    </view>
    
    <!-- 发帖弹窗 -->
    <view class="post-form-overlay" v-if="showForm" @tap="hidePostForm">
      <view class="post-form" @tap.stop>
        <text class="post-form-title">发布帖子</text>
        <textarea 
          class="post-form-input" 
          v-model="postContent" 
          placeholder="分享你的想法..."
          maxlength="500"
        ></textarea>
        <view class="post-form-footer">
          <text class="post-form-count">{{ postContent.length }}/500</text>
          <button class="post-form-submit" @tap="submitPost">发布</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getPosts, createPost } from '@/api/api.js';

export default {
  data() {
    return {
      posts: [],
      isLoading: false,
      showForm: false,
      postContent: '',
      nickname: '游客' // 默认昵称，实际应从用户信息中获取
    };
  },
  onLoad() {
    this.fetchPosts();
    this.getUserInfo();
  },
  methods: {
    async fetchPosts() {
      this.isLoading = true;
      try {
        const response = await getPosts();
        if (response.status === 'success' && response.data) {
          this.posts = response.data;
        } else {
          uni.showToast({
            title: '获取帖子失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取帖子列表失败:', error);
        uni.showToast({
          title: '获取帖子失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    getUserInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo');
        if (userInfo) {
          this.nickname = userInfo.nickname || '游客';
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    },
    formatTime(timeStr) {
      if (!timeStr) return '';
      
      const date = new Date(timeStr);
      const now = new Date();
      const diff = now - date;
      
      // 如果小于1小时，显示X分钟前
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
      }
      
      // 如果小于24小时，显示X小时前
      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}小时前`;
      }
      
      // 如果小于30天，显示X天前
      if (diff < 2592000000) {
        const days = Math.floor(diff / 86400000);
        return `${days}天前`;
      }
      
      // 否则显示年月日
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    },
    navigateToDetail(post) {
      uni.navigateTo({
        url: `/pages/chat/detail?id=${post.id}`
      });
    },
    showPostForm() {
      this.showForm = true;
    },
    hidePostForm() {
      this.showForm = false;
    },
    async submitPost() {
      if (!this.postContent.trim()) {
        uni.showToast({
          title: '内容不能为空',
          icon: 'none'
        });
        return;
      }
      
      try {
        const response = await createPost(this.nickname, this.postContent);
        if (response.status === 'success') {
          uni.showToast({
            title: '发布成功',
            icon: 'success'
          });
          this.postContent = '';
          this.hidePostForm();
          this.fetchPosts(); // 刷新帖子列表
        } else {
          uni.showToast({
            title: response.message || '发布失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('发布帖子失败:', error);
        uni.showToast({
          title: '发布失败，请稍后再试',
          icon: 'none'
        });
      }
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
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.post-btn {
  background-color: #6d4126;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
}

.post-btn-text {
  font-size: 28rpx;
  color: #fff;
}

.post-list {
  padding: 20rpx;
}

.post-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.post-author {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.post-time {
  font-size: 24rpx;
  color: #999;
}

.post-content {
  margin-bottom: 20rpx;
}

.post-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.post-footer {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
}

.post-action {
  display: flex;
  align-items: center;
  margin-right: 40rpx;
}

.post-action-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.post-action-count {
  font-size: 26rpx;
  color: #666;
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

.post-form-overlay {
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

.post-form {
  width: 80%;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
}

.post-form-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.post-form-input {
  width: 100%;
  height: 300rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.post-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-form-count {
  font-size: 24rpx;
  color: #999;
}

.post-form-submit {
  background-color: #6d4126;
  color: #fff;
  font-size: 28rpx;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  border: none;
}
</style> 