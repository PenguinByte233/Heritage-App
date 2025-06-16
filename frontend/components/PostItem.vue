<template>
  <view class="post-item" @tap="handleClick">
    <view class="post-header">
      <image :src="post.avatar_url || '/static/images/default-avatar.png'" class="avatar"></image>
      <view class="user-info">
        <text class="username">{{ post.nickname || '匿名用户' }}</text>
        <text class="post-time">{{ formatTime(post.created_at) }}</text>
      </view>
    </view>
    
    <view class="post-content">
      <text class="post-title">{{ post.title }}</text>
      <text class="post-text">{{ post.content }}</text>
    </view>
    
    <view class="post-footer">
      <view class="action-btn" @tap.stop="handleLike">
        <text class="iconfont">❤</text>
        <text>{{ post.likes || 0 }}</text>
      </view>
      <view class="action-btn" @tap.stop="handleComment">
        <text class="iconfont">💬</text>
        <text>{{ post.comments || 0 }}</text>
      </view>
      <view class="action-btn" @tap.stop="handleShare">
        <text class="iconfont">↗</text>
        <text>分享</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PostItem',
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleClick() {
      this.$emit('click', this.post);
    },
    handleLike() {
      this.$emit('like', this.post);
    },
    handleComment() {
      this.$emit('comment', this.post);
    },
    handleShare() {
      uni.showShareMenu({
        withShareTicket: true
      });
      this.$emit('share', this.post);
    },
    formatTime(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      // 一分钟内
      if (diff < 60 * 1000) {
        return '刚刚';
      }
      // 一小时内
      if (diff < 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 1000)) + '分钟前';
      }
      // 一天内
      if (diff < 24 * 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
      }
      // 一周内
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前';
      }
      
      // 超过一周，显示具体日期
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
  }
}
</script>

<style>
.post-item {
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
  padding: 15px;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 14px;
  font-weight: bold;
  display: block;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-content {
  margin-bottom: 15px;
}

.post-title {
  font-size: 16px;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.post-text {
  font-size: 14px;
  color: #333;
  display: block;
  line-height: 1.5;
}

.post-footer {
  display: flex;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
}

.action-btn .iconfont {
  margin-right: 5px;
}
</style> 