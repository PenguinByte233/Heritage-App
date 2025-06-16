<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">帖子详情</text>
      <view class="placeholder"></view>
    </view>
    
    <!-- 加载提示 -->
    <view class="loading-container" v-if="isLoading">
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 帖子内容 -->
    <view class="post-detail" v-if="!isLoading && post">
      <!-- 作者信息 -->
      <view class="author-info">
        <image class="avatar" :src="post.avatar_url || '/static/images/default-avatar.png'"></image>
        <view class="author-meta">
          <text class="author-name">{{ post.author_name }}</text>
          <text class="post-time">{{ formatTime(post.created_at) }}</text>
        </view>
      </view>
      
      <!-- 帖子内容 -->
      <view class="post-content">
        <text class="content-text">{{ post.content }}</text>
      </view>
      
      <!-- 帖子图片 -->
      <view class="image-list" v-if="post.images && post.images.length > 0">
        <image 
          v-for="(img, index) in post.images" 
          :key="index" 
          :src="img" 
          class="content-image"
          mode="aspectFill"
          @tap="previewImage(index)"
        ></image>
      </view>
      
      <!-- 交互区域 -->
      <view class="interaction-bar">
        <view class="action-btn" @tap="toggleLike">
          <text class="action-icon" :class="{'active': isLiked}">❤️</text>
          <text class="action-text">{{ post.like_count || 0 }}</text>
        </view>
        <view class="action-btn" @tap="focusCommentInput">
          <text class="action-icon">💬</text>
          <text class="action-text">{{ post.comment_count || 0 }}</text>
        </view>
      </view>
    </view>
    
    <!-- 评论区 -->
    <view class="comment-section" v-if="!isLoading && post">
      <view class="section-title">
        <text>评论 ({{ post.comment_count || 0 }})</text>
      </view>
      
      <!-- 评论列表 -->
      <view class="comment-list">
        <view 
          v-for="(comment, index) in comments" 
          :key="index"
          class="comment-item"
        >
          <image class="comment-avatar" :src="comment.avatar_url || '/static/images/default-avatar.png'"></image>
          <view class="comment-content">
            <text class="comment-author">{{ comment.author_name }}</text>
            <text class="comment-text">{{ comment.content }}</text>
            <text class="comment-time">{{ formatTime(comment.created_at) }}</text>
          </view>
        </view>
        
        <!-- 无评论提示 -->
        <view class="empty-comment" v-if="comments.length === 0">
          <text>暂无评论，快来抢沙发吧！</text>
        </view>
      </view>
    </view>
    
    <!-- 评论输入框 -->
    <view class="comment-input-container">
      <input 
        class="comment-input" 
        v-model="commentText" 
        placeholder="写下你的评论..." 
        confirm-type="send"
        @confirm="submitComment"
        :focus="inputFocus"
      />
      <view 
        class="send-btn" 
        :class="{'active': commentText.trim().length > 0}"
        @tap="submitComment"
      >发送</view>
    </view>
  </view>
</template>

<script>
import { getPostDetail, addComment, likePost, checkLiked } from '@/api/api.js';

export default {
  data() {
    return {
      postId: null,
      post: null,
      comments: [],
      isLoading: true,
      commentText: '',
      inputFocus: false,
      isLiked: false
    };
  },
  onLoad(options) {
    if (options.id) {
      this.postId = options.id;
      this.fetchPostDetail();
      this.checkIfLiked();
    } else {
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    async fetchPostDetail() {
      this.isLoading = true;
      try {
        const response = await getPostDetail(this.postId);
        if (response.status === 'success' && response.data) {
          this.post = response.data.post;
          this.comments = response.data.comments || [];
        } else {
          throw new Error('获取帖子详情失败');
        }
      } catch (error) {
        console.error('获取帖子详情失败:', error);
        uni.showToast({
          title: '获取帖子详情失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    async checkIfLiked() {
      try {
        const response = await checkLiked(this.postId);
        if (response.status === 'success') {
          this.isLiked = response.data.liked;
        }
      } catch (error) {
        console.error('检查点赞状态失败:', error);
      }
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
    },
    previewImage(index) {
      if (!this.post.images || this.post.images.length === 0) return;
      
      uni.previewImage({
        current: index,
        urls: this.post.images
      });
    },
    focusCommentInput() {
      this.inputFocus = true;
    },
    async submitComment() {
      if (!this.commentText.trim()) return;
      
      try {
        uni.showLoading({
          title: '发送中...'
        });
        
        const response = await addComment(this.postId, this.commentText);
        
        if (response.status === 'success') {
          // 添加新评论到列表
          const newComment = {
            id: response.data.id,
            post_id: this.postId,
            author_name: '我', // 实际应用中应该从用户信息获取
            content: this.commentText,
            created_at: new Date().toISOString()
          };
          
          this.comments.unshift(newComment);
          
          // 更新评论数
          if (this.post) {
            this.post.comment_count = (this.post.comment_count || 0) + 1;
          }
          
          // 清空输入框
          this.commentText = '';
          this.inputFocus = false;
          
          uni.hideLoading();
        } else {
          throw new Error('评论失败');
        }
      } catch (error) {
        console.error('提交评论失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '评论失败',
          icon: 'none'
        });
      }
    },
    async toggleLike() {
      try {
        const response = await likePost(this.postId);
        
        if (response.status === 'success') {
          this.isLiked = !this.isLiked;
          
          // 更新点赞数
          if (this.post) {
            this.post.like_count = response.data.like_count || this.post.like_count;
          }
        } else {
          throw new Error('操作失败');
        }
      } catch (error) {
        console.error('点赞操作失败:', error);
        uni.showToast({
          title: '操作失败',
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
  padding-bottom: 100rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 40rpx;
  color: #333;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.placeholder {
  width: 60rpx;
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

.post-detail {
  background-color: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.author-meta {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999;
}

.post-content {
  margin-bottom: 20rpx;
}

.content-text {
  font-size: 32rpx;
  line-height: 1.6;
  color: #333;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
}

.content-image {
  width: 220rpx;
  height: 220rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
  border-radius: 8rpx;
}

.interaction-bar {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  margin-right: 40rpx;
}

.action-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.action-icon.active {
  color: #ff4d4f;
}

.action-text {
  font-size: 28rpx;
  color: #666;
}

.comment-section {
  background-color: #fff;
  padding: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.comment-list {
  padding-bottom: 20rpx;
}

.comment-item {
  display: flex;
  margin-bottom: 30rpx;
}

.comment-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.comment-content {
  flex: 1;
}

.comment-author {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.comment-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: 10rpx;
  display: block;
}

.comment-time {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.empty-comment {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;
}

.comment-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
}

.comment-input {
  flex: 1;
  height: 70rpx;
  background-color: #f5f5f5;
  border-radius: 35rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.send-btn {
  width: 100rpx;
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.send-btn.active {
  color: #6d4126;
}
</style> 