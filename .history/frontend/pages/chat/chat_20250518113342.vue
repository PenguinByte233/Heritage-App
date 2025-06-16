<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">社区广场</text>
      <view class="post-btn" @tap="navigateToPost">发布</view>
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
          <text class="author-name">{{ post.author_name }}</text>
          <text class="post-time">{{ formatTime(post.created_at) }}</text>
        </view>
        <view class="post-content">
          <text class="post-text">{{ post.content }}</text>
        </view>
        <view class="post-footer">
          <view class="post-action">
            <text class="action-icon">💬</text>
            <text class="action-count">{{ post.comment_count || 0 }}</text>
          </view>
          <view class="post-action">
            <text class="action-icon">❤️</text>
            <text class="action-count">{{ post.like_count || 0 }}</text>
          </view>
        </view>
      </view>
      
      <!-- 无内容提示 -->
      <view class="empty-container" v-if="!isLoading && posts.length === 0">
        <text class="empty-text">暂无帖子，快来发布第一条吧！</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getPosts } from '@/api/api.js';

export default {
  data() {
    return {
      posts: [],
      isLoading: false
    };
  },
  onLoad() {
    this.fetchPosts();
  },
  onPullDownRefresh() {
    this.fetchPosts();
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
        uni.stopPullDownRefresh();
      }
    },
    navigateToPost() {
      uni.navigateTo({
        url: '/pages/chat/post'
      });
    },
    navigateToDetail(post) {
      uni.navigateTo({
        url: `/pages/chat/detail?id=${post.id}`
      });
    },
    formatTime(timeStr) {
      if (!timeStr) return '';
      
      const date = new Date(timeStr);
      const now = new Date();
      
      const diff = now - date;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) {
        return `${days}天前`;
      } else if (hours > 0) {
        return `${hours}小时前`;
      } else if (minutes > 0) {
        return `${minutes}分钟前`;
      } else {
        return '刚刚';
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.post-btn {
  padding: 10rpx 30rpx;
  background-color: #6d4126;
  color: #fff;
  font-size: 28rpx;
  border-radius: 30rpx;
}

.post-list {
  padding: 20rpx;
}

.post-card {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.author-name {
  font-size: 32rpx;
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
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
}

.post-action {
  display: flex;
  align-items: center;
  margin-right: 40rpx;
}

.action-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.action-count {
  font-size: 28rpx;
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
</style> 