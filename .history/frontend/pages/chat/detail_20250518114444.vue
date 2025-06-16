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
        <text class="post-author">{{ post.author_name }}</text>
        <text class="post-time">{{ formatTime(post.created_at) }}</text>
      </view>
      <view class="post-content">
        <text class="post-text">{{ post.content }}</text>
      </view>
      <view class="post-actions">
        <view class="action-item" @tap="toggleLike">
          <text class="action-icon" :class="{'liked': liked}">👍</text>
          <text class="action-count">{{ likeCount }}</text>
        </view>
        <view class="action-item" @tap="focusComment">
          <text class="action-icon">💬</text>
          <text class="action-count">{{ post.comments ? post.comments.length : 0 }}</text>
        </view>
      </view>
    </view>
    
    <!-- 评论列表 -->
    <view class="comment-list" v-if="post && post.comments">
      <text class="comment-list-title">全部评论 ({{ post.comments.length }})</text>
      <view 
        v-for="(comment, index) in post.comments" 
        :key="index"
        class="comment-item"
      >
        <view class="comment-header">
          <text class="comment-author">{{ comment.author_name }}</text>
          <text class="comment-time">{{ formatTime(comment.created_at) }}</text>
        </view>
        <view class="comment-content">
          <text class="comment-text">{{ comment.content }}</text>
        </view>
      </view>
      
      <!-- 无评论提示 -->
      <view class="empty-comment" v-if="post.comments.length === 0">
        <text class="empty-text">暂无评论，快来发表第一条评论吧</text>
      </view>
    </view>
    
    <!-- 评论输入框 -->
    <view class="comment-box">
      <input 
        class="comment-input" 
        v-model="commentContent" 
        placeholder="发表评论..." 
        :focus="commentFocus"
        @blur="commentFocus = false"
      />
      <button class="comment-submit" @tap="submitComment">发送</button>
    </view>
    
    <!-- 加载提示 -->
    <view class="loading-container" v-if="isLoading">
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
      likeCount: 0
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
          this.post = response.data;
          this.likeCount = this.post.like_count || 0;
          
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
        const userInfo = uni.getStorageSync('userInfo');
        if (userInfo) {
          this.userId = userInfo.id || 1;
          this.nickname = userInfo.nickname || '游客';
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
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
      
      try {
        const response = await addComment(this.id, this.nickname, this.commentContent);
        if (response.status === 'success') {
          uni.showToast({
            title: '评论成功',
            icon: 'success'
          });
          
          this.commentContent = ''; // 清空评论内容
          this.fetchPostDetail(); // 刷新帖子详情及评论
        } else {
          uni.showToast({
            title: response.message || '评论失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('评论失败:', error);
        uni.showToast({
          title: '评论失败，请稍后再试',
          icon: 'none'
        });
      }
    },
    async toggleLike() {
      try {
        const response = await likePost(this.id, this.userId);
        if (response.status === 'success') {
          this.liked = response.data.liked;
          
          // 更新点赞数
          if (this.liked) {
            this.likeCount++;
          } else {
            this.likeCount--;
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
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style>
.container {
  padding: 0;
  background-color: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 120rpx; /* 为底部评论框留出空间 */
}

.header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.back-button {
  padding: 10rpx;
  margin-right: 20rpx;
}

.back-icon {
  font-size: 40rpx;
  color: #333;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.post-detail {
  background-color: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.post-author {
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
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
}

.post-actions {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
}

.action-item {
  display: flex;
  align-items: center;
  margin-right: 40rpx;
}

.action-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.action-icon.liked {
  color: #e74c3c;
}

.action-count {
  font-size: 26rpx;
  color: #666;
}

.comment-list {
  background-color: #fff;
  padding: 30rpx;
}

.comment-list-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.comment-item {
  margin-bottom: 30rpx;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.comment-author {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.comment-time {
  font-size: 24rpx;
  color: #999;
}

.comment-content {
  margin-bottom: 10rpx;
}

.comment-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.empty-comment {
  padding: 40rpx 0;
  text-align: center;
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
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #eee;
}

.comment-input {
  flex: 1;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.comment-submit {
  margin-left: 20rpx;
  background-color: #6d4126;
  color: #fff;
  font-size: 28rpx;
  padding: 0 30rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  border: none;
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
</style> 