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
    <view class="post-detail" v-if="post">
      <view class="post-header">
        <view class="user-info">
          <image class="avatar" :src="post.avatar_url || '/static/images/default-avatar.png'"></image>
          <text class="author-name">{{ post.author_name }}</text>
        </view>
        <text class="post-time">{{ formatTime(post.created_at) }}</text>
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
      
      <!-- 分割线 -->
      <view class="divider">
        <view class="divider-line"></view>
        <text class="divider-text">评论区</text>
        <view class="divider-line"></view>
      </view>
    </view>
    
    <!-- 评论列表 -->
    <view class="comment-list" v-if="post && post.comments">
      <view 
        v-for="(comment, index) in post.comments" 
        :key="index"
        class="comment-item"
      >
        <view class="comment-header">
          <view class="comment-user">
            <image class="comment-avatar" :src="comment.avatar_url || '/static/images/default-avatar.png'"></image>
            <view class="comment-info">
              <text class="comment-author">{{ comment.author_name }}</text>
              <text class="comment-time">{{ formatTime(comment.created_at) }}</text>
            </view>
          </view>
        </view>
        <view class="comment-content">
          <text class="comment-text">{{ comment.content }}</text>
        </view>
      </view>
      
      <!-- 无评论提示 -->
      <view class="empty-comment" v-if="post.comments.length === 0">
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
      avatarUrl: '/static/images/default-avatar.png' // 用户头像
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
            this.post.avatar_url = '/static/images/default-avatar.png';
          }
          
          // 为评论添加默认头像
          if (this.post.comments && Array.isArray(this.post.comments)) {
            this.post.comments.forEach(comment => {
              if (!comment.avatar_url) {
                comment.avatar_url = '/static/images/default-avatar.png';
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
          this.avatarUrl = this.userInfo.avatar_url || '/static/images/default-avatar.png';
        } else {
          console.log('未找到用户信息');
          this.userInfo = {};
          this.userId = 1;
          this.nickname = '游客';
          this.avatarUrl = '/static/images/default-avatar.png';
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        this.userInfo = {};
        this.userId = 1;
        this.nickname = '游客';
        this.avatarUrl = '/static/images/default-avatar.png';
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
  padding: 0;
  background-color: #f5f1e6;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #f0e6d2;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.back-icon {
  font-size: 36rpx;
  font-weight: bold;
  color: #6d4126;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #6d4126;
  flex: 1;
  text-align: center;
  padding-right: 60rpx; /* 平衡左侧返回按钮 */
}

.post-detail {
  background-color: #fff;
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
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
  margin-right: 15rpx;
  border: 2rpx solid #f0e6d2;
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
  margin-bottom: 30rpx;
}

.post-text {
  font-size: 32rpx;
  color: #333;
  line-height: 1.6;
}

.post-actions {
  display: flex;
  border-top: 1px solid #f0e6d2;
  padding-top: 20rpx;
  margin-bottom: 20rpx;
}

.action-item {
  display: flex;
  align-items: center;
  margin-right: 40rpx;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  background-color: #f9f6f0;
}

.action-icon {
  font-size: 36rpx;
  margin-right: 10rpx;
}

.action-icon.liked {
  color: #ff6b6b;
}

.action-text {
  font-size: 28rpx;
  color: #666;
  margin-right: 10rpx;
}

.action-text.liked-text {
  color: #ff6b6b;
}

.action-count {
  font-size: 28rpx;
  color: #999;
  background-color: #f0e6d2;
  border-radius: 20rpx;
  padding: 2rpx 12rpx;
  min-width: 40rpx;
  text-align: center;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20rpx 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #f0e6d2;
}

.divider-text {
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #999;
}

.comment-list {
  padding: 0 20rpx 120rpx; /* 底部留空，避免评论框遮挡 */
}

.comment-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
}

.comment-header {
  margin-bottom: 15rpx;
}

.comment-user {
  display: flex;
  align-items: center;
}

.comment-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 15rpx;
  border: 2rpx solid #f0e6d2;
}

.comment-info {
  display: flex;
  flex-direction: column;
}

.comment-author {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.comment-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 5rpx;
}

.comment-content {
  padding-left: 75rpx; /* 与头像对齐 */
}

.comment-text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.5;
}

.empty-comment {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
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
}

.comment-box {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  border-top: 1px solid #f0e6d2;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  z-index: 999;
}

.comment-input {
  flex: 1;
  height: 70rpx;
  background-color: #f8f5ef;
  border-radius: 35rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  border: 1px solid #e8e0d2;
}

.comment-submit {
  margin-left: 20rpx;
  height: 70rpx;
  line-height: 70rpx;
  padding: 0 30rpx;
  background: linear-gradient(135deg, #8a6642 0%, #6d4126 100%);
  color: #fff;
  font-size: 28rpx;
  border-radius: 35rpx;
}

.comment-submit:active {
  opacity: 0.8;
}

.comment-submit[disabled] {
  background: #cccccc;
  color: #999999;
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