<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="back-button" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">帖子详情</text>
    </view>
    
    <!-- 帖子详情 -->
    <view class="post-detail-card" v-if="post">
      <view class="post-header">
        <view class="user-info">
          <image class="avatar" :src="post.avatar_url || '/static/images/avatar/空中花园.png'"></image>
          <view class="user-details">
            <text class="author-name">{{ post.author_name }}</text>
            <text class="post-time">{{ formatTime(post.created_at) }}</text>
          </view>
        </view>
      </view>
      <view class="post-content">
        <text class="post-text">{{ post.content }}</text>
      </view>
      <view class="post-actions">
        <view class="action-item" @tap="toggleLike">
          <text class="action-icon" :class="{'liked': liked}">👍</text>
          <text class="action-text" :class="{'liked-text': liked}">{{ liked ? '已点赞' : '点赞' }}</text>
          <text class="action-count">{{ likeCount }}</text>
        </view>
        <view class="action-item" @tap="focusComment">
          <text class="action-icon">💬</text>
          <text class="action-text">评论</text>
          <text class="action-count">{{ post.comments ? post.comments.length : 0 }}</text>
        </view>
        <view class="action-item" @tap="sharePost">
          <text class="action-icon">🔗</text>
          <text class="action-text">分享</text>
        </view>
      </view>
    </view>
      
    <!-- 评论区标题 -->
    <view class="comments-header">
      <text class="comments-title">评论区</text>
      <text class="comments-count">{{ post && post.comments ? post.comments.length : 0 }}条评论</text>
    </view>
    
    <!-- 评论列表 -->
    <view class="comment-list" v-if="post && post.comments">
      <view 
        v-for="(comment, index) in post.comments" 
        :key="index"
        class="comment-item"
      >
        <view class="comment-header">
          <image class="comment-avatar" :src="comment.avatar_url || '/static/images/avatar/空中花园.png'"></image>
          <view class="comment-info">
            <text class="comment-author">{{ comment.author_name }}</text>
            <text class="comment-time">{{ formatTime(comment.created_at) }}</text>
          </view>
        </view>
        <view class="comment-content">
          <text class="comment-text">{{ comment.content }}</text>
        </view>
      </view>
      
      <!-- 无评论提示 -->
      <view class="empty-comment" v-if="post && post.comments.length === 0">
        <image class="empty-icon" src="/static/images/empty-comments.png"></image>
        <text class="empty-text">暂无评论，快来发表第一条评论吧！</text>
      </view>
    </view>
    
    <!-- 评论输入框 -->
    <view class="comment-box">
      <input 
        class="comment-input" 
        v-model="commentContent" 
        placeholder="发表友善评论..." 
        :focus="commentFocus"
        @blur="commentFocus = false"
        confirm-type="send"
        @confirm="submitComment"
      />
      <button class="comment-submit" @tap="submitComment" :disabled="!commentContent.trim()">发送</button>
    </view>
    
    <!-- 加载提示 -->
    <view class="loading-container" v-if="isLoading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { getPostDetail, addComment, likePost, checkLiked } from '@/api/api.js';

export default {
  data() {
    return {
      id: null,
      post: null,
      isLoading: false,
      commentContent: '',
      commentFocus: false,
      userId: 1, // 默认用户ID，实际应从登录状态获取
      nickname: '游客', // 默认昵称，实际应从登录状态获取
      liked: false,
      likeCount: 0,
      userInfo: {}, // 用户信息
      avatarUrl: '/static/images/avatar/空中花园.png' // 用户头像
    };
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id;
      this.fetchPostDetail();
    }
    
    this.getUserInfo();
  },
  methods: {
    async fetchPostDetail() {
      this.isLoading = true;
      try {
        const response = await getPostDetail(this.id);
        if (response.status === 'success' && response.data) {
          // 处理帖子数据
          this.post = response.data;
          this.likeCount = this.post.like_count || 0;
          
          // 为帖子添加默认头像
          if (!this.post.avatar_url) {
            this.post.avatar_url = '/static/images/avatar/空中花园.png';
          }
          
          // 为评论添加默认头像
          if (this.post.comments && Array.isArray(this.post.comments)) {
            this.post.comments.forEach(comment => {
              if (!comment.avatar_url) {
                comment.avatar_url = '/static/images/avatar/空中花园.png';
              }
            });
          }
          
          // 检查是否已点赞
          this.checkLikeStatus();
        } else {
          uni.showToast({
            title: '获取帖子详情失败',
            icon: 'none'
          });
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
          
          console.log('获取到的用户信息:', this.userInfo);
          
          // 设置用户ID和昵称
          this.userId = this.userInfo.id || 1;
          this.nickname = this.userInfo.nickname || '游客';
          this.avatarUrl = this.userInfo.avatar_url || '/static/images/avatar/空中花园.png';
        } else {
          console.log('未找到用户信息');
          this.userInfo = {};
          this.userId = 1;
          this.nickname = '游客';
          this.avatarUrl = '/static/images/avatar/空中花园.png';
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        this.userInfo = {};
        this.userId = 1;
        this.nickname = '游客';
        this.avatarUrl = '/static/images/avatar/空中花园.png';
      }
    },
    async checkLikeStatus() {
      try {
        const response = await checkLiked(this.id, this.userId);
        if (response.status === 'success' && response.data) {
          this.liked = response.data.liked;
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
    focusComment() {
      // 检查用户是否登录
      if (!this.userInfo || !this.userInfo.id) {
        uni.showModal({
          title: '提示',
          content: '请先登录后再发表评论',
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
      
      this.commentFocus = true;
    },
    async submitComment() {
      if (!this.commentContent.trim()) {
        uni.showToast({
          title: '评论内容不能为空',
          icon: 'none'
        });
        return;
      }
      
      // 检查用户是否登录
      if (!this.userInfo || !this.userInfo.id) {
        uni.showModal({
          title: '提示',
          content: '请先登录后再发表评论',
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
      
      try {
        uni.showLoading({
          title: '发送中...'
        });
        
        // 使用userInfo中的nickname
        const author_name = this.userInfo.nickname || this.nickname;
        console.log('发送评论，作者：', author_name);
        
        const response = await addComment(this.id, author_name, this.commentContent);
        
        uni.hideLoading();
        
        if (response.status === 'success') {
          uni.showToast({
            title: '评论成功',
            icon: 'success',
            duration: 2000
          });
          
          this.commentContent = ''; // 清空评论内容
          
          setTimeout(() => {
            // 延迟刷新，确保用户能看到成功提示
            this.fetchPostDetail(); // 刷新帖子详情及评论
          }, 1000);
        } else {
          uni.showToast({
            title: response.message || '评论失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('评论失败:', error);
        uni.showToast({
          title: '评论失败，请稍后再试',
          icon: 'none'
        });
      }
    },
    async toggleLike() {
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
      
      try {
        const response = await likePost(this.id, this.userId);
        if (response.status === 'success') {
          this.liked = response.data.liked;
          
          // 更新点赞数
          if (this.liked) {
            this.likeCount++;
          } else {
            this.likeCount = Math.max(0, this.likeCount - 1); // 避免出现负数
          }
          
          uni.showToast({
            title: this.liked ? '点赞成功' : '取消点赞',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: response.message || '操作失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('点赞操作失败:', error);
        uni.showToast({
          title: '操作失败，请稍后再试',
          icon: 'none'
        });
      }
    },
    sharePost() {
      uni.showToast({
        title: '分享功能即将上线',
        icon: 'none'
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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f4e9;
  padding-bottom: 120rpx;
  padding-top: 90rpx; /* 为固定的header留出空间 */
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 90rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  border-bottom: 1px solid #f0e6d2;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 40rpx;
  color: #6d4126;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #6d4126;
  margin-right: 60rpx;
}

.post-detail-card {
  margin: 20rpx 30rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
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
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f0e6d2;
  border: 2rpx solid #e1d4c0;
}

.user-details {
  margin-left: 20rpx;
}

.author-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #6d4126;
}

.post-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.post-content {
  margin: 30rpx 0;
}

.post-text {
  font-size: 32rpx;
  color: #333;
  line-height: 1.6;
  word-break: break-all;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #f0e6d2;
  padding-top: 20rpx;
  margin-top: 20rpx;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  transition: background-color 0.2s;
}

.action-item:active {
  background-color: #f0e6d2;
}

.action-icon {
  font-size: 36rpx;
  margin-right: 10rpx;
}

.action-text {
  font-size: 28rpx;
  color: #666;
}

.action-count {
  font-size: 24rpx;
  color: #999;
  margin-left: 10rpx;
}

.liked {
  color: #ff6b6b;
}

.liked-text {
  color: #ff6b6b;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  margin-top: 20rpx;
}

.comments-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #6d4126;
}

.comments-count {
  font-size: 26rpx;
  color: #999;
}

.comment-list {
  padding: 0 30rpx;
}

.comment-item {
  padding: 20rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.comment-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #f0e6d2;
  border: 2rpx solid #e1d4c0;
}

.comment-info {
  margin-left: 16rpx;
  flex: 1;
}

.comment-author {
  font-size: 28rpx;
  font-weight: 500;
  color: #6d4126;
}

.comment-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 2rpx;
}

.comment-content {
  padding-left: 76rpx;
}

.comment-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  word-break: break-all;
}

.empty-comment {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.comment-box {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  border-top: 1px solid #f0e6d2;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.comment-input {
  flex: 1;
  height: 70rpx;
  background-color: #f8f4e9;
  border-radius: 35rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #333;
}

.comment-submit {
  width: 120rpx;
  height: 70rpx;
  background-color: #6d4126;
  color: #ffffff;
  border-radius: 35rpx;
  margin-left: 20rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.comment-submit:active {
  background-color: #5a351f;
}

.comment-submit[disabled] {
  background-color: #ccc;
  color: #fff;
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
  border: 4rpx solid #f0e6d2;
  border-top-color: #6d4126;
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 