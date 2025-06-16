<template>
  <view class="container">
    <!-- 顶部安全区域 -->
    <view class="status-bar"></view>
    
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">社区交流</text>
    </view>
    
    <!-- 帖子列表 -->
    <view class="post-list">
      <!-- 发布按钮 -->
      <view class="post-btn-container">
        <view class="post-btn" @tap="showPostForm">
          <text class="post-btn-text">发布</text>
          <text class="post-btn-icon">+</text>
        </view>
      </view>
      
      <!-- 加载提示 -->
      <view class="loading-container" v-if="isLoading">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在加载社区内容...</text>
      </view>
      
      <!-- 帖子卡片 -->
      <view 
        v-for="(post, index) in posts" 
        :key="post.id"
        class="post-card"
        @tap="navigateToDetail(post)"
      >
        <view class="post-header">
          <view class="user-info">
            <image class="avatar" :src="post.avatar_url || '/static/images/avatar/空中花园.png'"></image>
            <text class="post-author">{{ post.author_name }}</text>
          </view>
          <text class="post-time">{{ formatTime(post.created_at) }}</text>
        </view>
        <view class="post-content">
          <text class="post-text">{{ post.content }}</text>
        </view>
        <view class="post-footer">
          <view class="post-action" @tap.stop="navigateToDetail(post)">
            <text class="post-action-icon">💬</text>
            <text class="post-action-count">{{ post.comment_count || 0 }}</text>
          </view>
          <view class="post-action" @tap.stop="likePostFromList(post, $event)">
            <text class="post-action-icon">👍</text>
            <text class="post-action-count">{{ post.like_count || 0 }}</text>
          </view>
        </view>
      </view>
      
      <!-- 无内容提示 -->
      <view class="empty-container" v-if="!isLoading && posts.length === 0">
        <image class="empty-icon" src="/static/images/empty-posts.png"></image>
        <text class="empty-text">暂无帖子，快来发布第一篇吧！</text>
        <view class="empty-action" @tap="showPostForm">
          <text>发布新帖子</text>
        </view>
      </view>
    </view>
    
    <!-- 发帖弹窗 -->
    <view class="post-form-overlay" v-if="showForm" @tap="hidePostForm">
      <view class="post-form" @tap.stop>
        <view class="post-form-header">
          <text class="post-form-title">发布帖子</text>
          <text class="post-form-close" @tap="hidePostForm">×</text>
        </view>
        <view class="user-info-preview">
          <image class="avatar-small" :src="userInfo.avatar_url || '/static/images/avatar/空中花园.png'"></image>
          <text class="username">{{ nickname }}</text>
        </view>
        <textarea 
          class="post-form-input" 
          v-model="postContent" 
          placeholder="分享你的想法或非遗见闻..."
          maxlength="500"
          auto-height
        ></textarea>
        <view class="post-form-footer">
          <text class="post-form-count">{{ postContent.length }}/500</text>
          <button class="post-form-submit" @tap="submitPost" :disabled="!postContent.trim()">发布</button>
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
      nickname: '游客', // 默认昵称，实际应从用户信息中获取
      userInfo: {} // 用户信息对象
    };
  },
  onLoad() {
    this.fetchPosts();
    this.getUserInfo();
  },
  onShow() {
    // 每次页面显示时刷新数据，确保点赞、评论等变更得到更新
    this.fetchPosts();
  },
  methods: {
    async fetchPosts() {
      this.isLoading = true;
      try {
        const response = await getPosts();
        if (response.status === 'success' && response.data) {
          this.posts = response.data.map(post => {
            // 添加默认头像
            if (!post.avatar_url) {
              post.avatar_url = '/static/images/avatar/空中花园.png';
            }
            return post;
          });
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
        const userInfoStr = uni.getStorageSync('userInfo');
        if (userInfoStr) {
          // 确保正确解析JSON字符串
          try {
            this.userInfo = JSON.parse(userInfoStr);
          } catch (e) {
            // 如果不是JSON字符串，可能是直接存储的对象
            this.userInfo = userInfoStr;
          }
          
          // 确保获取到昵称
          this.nickname = this.userInfo.nickname || '游客';
          console.log('获取到的用户信息:', this.userInfo);
        } else {
          console.log('未找到用户信息');
          this.userInfo = {};
          this.nickname = '游客';
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        this.userInfo = {};
        this.nickname = '游客';
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
      console.log('正在导航到帖子详情，帖子ID:', post.id);
      
      uni.navigateTo({
        url: `./detail?id=${post.id}`,
        success: () => {
          console.log('导航成功');
        },
        fail: (err) => {
          console.error('导航失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },
    likePostFromList(post, event) {
      // 阻止冒泡，避免触发整个卡片的点击事件
      event.stopPropagation();
      
      // 检查用户是否登录
      if (!this.userInfo || !this.userInfo.id) {
        uni.showModal({
          title: '提示',
          content: '请先登录后再点赞',
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
      
      // 直接跳转到详情页，在详情页处理点赞逻辑
      this.navigateToDetail(post);
    },
    showPostForm() {
      // 重新获取用户信息，确保是最新的
      this.getUserInfo();
      
      // 更完善的登录判断
      if (!this.userInfo || !this.userInfo.id) {
        console.log('用户未登录或信息不完整，需要登录');
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
      
      console.log('用户已登录，显示发布表单');
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
        uni.showLoading({
          title: '发布中...'
        });
        
        const response = await createPost(this.nickname, this.postContent);
        
        uni.hideLoading();
        
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
        uni.hideLoading();
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
  background-color: #f5f1e6; /* 与其他页面保持一致的背景色 */
  min-height: 100vh;
}

.status-bar {
  height: 44px; /* 适配顶部安全区域 */
}

.header {
  padding: 20rpx 30rpx;
  background-color: #f0e6d2;
  border-bottom: 1px solid #f0e6d2;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #6d4126;
  text-align: center;
}

.post-list {
  padding: 20rpx;
}

.post-btn-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20rpx;
}

.post-btn {
  background: linear-gradient(135deg, #8a6642 0%, #6d4126 100%);
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 10rpx rgba(109, 65, 38, 0.3);
}

.post-btn-text {
  font-size: 28rpx;
  color: #fff;
}

.post-btn-icon {
  font-size: 32rpx;
  color: #fff;
  margin-left: 10rpx;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
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

.post-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  position: relative;
}

.post-card:active {
  transform: scale(0.98);
  background-color: #faf7f2;
  box-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  margin-right: 15rpx;
  border: 2rpx solid #f0e6d2;
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
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
}

.post-footer {
  display: flex;
  border-top: 1px solid #f0e6d2;
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
  font-size: 28rpx;
  color: #999;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  width: 180rpx;
  height: 180rpx;
  margin-bottom: 20rpx;
  opacity: 0.7;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.empty-action {
  background: linear-gradient(135deg, #8a6642 0%, #6d4126 100%);
  color: #fff;
  font-size: 28rpx;
  padding: 15rpx 40rpx;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 10rpx rgba(109, 65, 38, 0.3);
}

.post-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.post-form {
  width: 90%;
  max-width: 650rpx;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
}

.post-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.post-form-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #6d4126;
}

.post-form-close {
  font-size: 40rpx;
  color: #999;
}

.user-info-preview {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 10rpx;
  border-radius: 10rpx;
  background-color: #f9f6f0;
}

.avatar-small {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 15rpx;
}

.username {
  font-size: 28rpx;
  color: #6d4126;
  font-weight: 500;
}

.post-form-input {
  width: 100%;
  height: 240rpx;
  padding: 20rpx;
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  border: 1px solid #eee;
  border-radius: 10rpx;
  box-sizing: border-box;
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
  padding: 15rpx 40rpx;
  background: linear-gradient(135deg, #8a6642 0%, #6d4126 100%);
  color: #fff;
  font-size: 28rpx;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 10rpx rgba(109, 65, 38, 0.3);
  border: none;
}

.post-form-submit[disabled] {
  background: #ccc;
  box-shadow: none;
}
</style> 