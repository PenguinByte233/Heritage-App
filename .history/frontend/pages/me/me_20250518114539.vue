<template>
  <view class="container">
    <!-- 顶部用户信息 -->
    <view class="user-header">
      <!-- 用户头像和信息 -->
      <view class="user-info">
        <image class="avatar" :src="userInfo.avatar || '/static/images/default-avatar.png'"></image>
        <view class="user-data">
          <text class="username">{{ userInfo.nickname || '游客' }}</text>
          <text class="user-id">ID: {{ userInfo.id || '未登录' }}</text>
        </view>
      </view>
      <!-- 设置按钮 -->
      <view class="settings" @tap="navigateToSettings">
        <text class="icon">⚙️</text>
      </view>
    </view>
    
    <!-- 用户数据统计 -->
    <view class="user-stats">
      <view class="stat-item" @tap="navigateToMyPosts">
        <text class="stat-count">{{ stats.posts }}</text>
        <text class="stat-label">我的帖子</text>
      </view>
      <view class="stat-item" @tap="navigateToMyOrders">
        <text class="stat-count">{{ stats.orders }}</text>
        <text class="stat-label">我的订单</text>
      </view>
      <view class="stat-item" @tap="navigateToLikes">
        <text class="stat-count">{{ stats.likes }}</text>
        <text class="stat-label">我的点赞</text>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <text class="section-title">我的服务</text>
      <view class="menu-list">
        <view class="menu-item" @tap="navigateToMyOrders">
          <text class="menu-icon">🛒</text>
          <text class="menu-label">我的订单</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @tap="navigateToMyPosts">
          <text class="menu-icon">📝</text>
          <text class="menu-label">我的帖子</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @tap="navigateToLearnHistory">
          <text class="menu-icon">📚</text>
          <text class="menu-label">学习历史</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @tap="navigateToFavorites">
          <text class="menu-icon">⭐</text>
          <text class="menu-label">我的收藏</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>
    
    <!-- 客服与支持 -->
    <view class="menu-section">
      <text class="section-title">客服与支持</text>
      <view class="menu-list">
        <view class="menu-item" @tap="contactService">
          <text class="menu-icon">💬</text>
          <text class="menu-label">联系客服</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @tap="navigateToFeedback">
          <text class="menu-icon">📢</text>
          <text class="menu-label">意见反馈</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @tap="navigateToHelp">
          <text class="menu-icon">❓</text>
          <text class="menu-label">使用帮助</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @tap="showAbout">
          <text class="menu-icon">ℹ️</text>
          <text class="menu-label">关于我们</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>
    
    <!-- 未登录状态下显示登录按钮 -->
    <view class="login-section" v-if="!isLoggedIn">
      <button class="login-button" @tap="navigateToLogin">登录/注册</button>
    </view>
    
    <!-- 已登录状态下显示退出登录按钮 -->
    <view class="logout-section" v-else>
      <button class="logout-button" @tap="logout">退出登录</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false,
      userInfo: {
        id: '',
        nickname: '游客',
        avatar: ''
      },
      stats: {
        posts: 0,
        orders: 0,
        likes: 0
      }
    };
  },
  onShow() {
    // 每次显示页面时检查登录状态
    this.checkLoginStatus();
    
    // 如果已登录，获取用户统计数据
    if (this.isLoggedIn) {
      this.fetchUserStats();
    }
  },
  methods: {
    checkLoginStatus() {
      try {
        const token = uni.getStorageSync('token');
        if (token) {
          this.isLoggedIn = true;
          
          // 获取用户信息
          const userInfo = uni.getStorageSync('userInfo');
          if (userInfo) {
            this.userInfo = JSON.parse(userInfo);
          } else {
            // 如果本地没有用户信息，尝试从API获取
            this.fetchUserInfo();
          }
        } else {
          this.isLoggedIn = false;
          this.userInfo = {
            id: '',
            nickname: '游客',
            avatar: ''
          };
          this.stats = {
            posts: 0,
            orders: 0,
            likes: 0
          };
        }
      } catch (e) {
        console.error('检查登录状态出错:', e);
        this.isLoggedIn = false;
      }
    },
    async fetchUserInfo() {
      try {
        // TODO: 实现用户信息获取API调用
        const userInfo = {
          id: '123456',
          nickname: '测试用户',
          avatar: ''
        };
        
        this.userInfo = userInfo;
        
        // 存储用户信息到本地
        uni.setStorageSync('userInfo', JSON.stringify(userInfo));
      } catch (e) {
        console.error('获取用户信息失败:', e);
      }
    },
    async fetchUserStats() {
      try {
        // TODO: 实现获取用户统计数据的API调用
        // 这里使用模拟数据
        this.stats = {
          posts: 5,
          orders: 2,
          likes: 12
        };
      } catch (e) {
        console.error('获取用户统计数据失败:', e);
        this.stats = {
          posts: 0,
          orders: 0,
          likes: 0
        };
      }
    },
    navigateToSettings() {
      if (!this.isLoggedIn) {
        this.showLoginTip();
        return;
      }
      
      uni.navigateTo({
        url: '/pages/me/settings'
      });
    },
    navigateToMyPosts() {
      if (!this.isLoggedIn) {
        this.showLoginTip();
        return;
      }
      
      uni.navigateTo({
        url: '/pages/me/my-posts'
      });
    },
    navigateToMyOrders() {
      if (!this.isLoggedIn) {
        this.showLoginTip();
        return;
      }
      
      uni.navigateTo({
        url: '/pages/order/order-list'
      });
    },
    navigateToLikes() {
      if (!this.isLoggedIn) {
        this.showLoginTip();
        return;
      }
      
      uni.navigateTo({
        url: '/pages/me/my-likes'
      });
    },
    navigateToLearnHistory() {
      if (!this.isLoggedIn) {
        this.showLoginTip();
        return;
      }
      
      uni.navigateTo({
        url: '/pages/me/learn-history'
      });
    },
    navigateToFavorites() {
      if (!this.isLoggedIn) {
        this.showLoginTip();
        return;
      }
      
      uni.navigateTo({
        url: '/pages/me/favorites'
      });
    },
    contactService() {
      uni.showModal({
        title: '联系客服',
        content: '客服热线：400-123-4567\n工作时间：9:00-18:00',
        showCancel: false,
        confirmText: '知道了'
      });
    },
    navigateToFeedback() {
      uni.navigateTo({
        url: '/pages/me/feedback'
      });
    },
    navigateToHelp() {
      uni.navigateTo({
        url: '/pages/me/help'
      });
    },
    showAbout() {
      uni.showModal({
        title: '关于我们',
        content: '非遗小程序 v1.0.0\n传承非物质文化遗产，弘扬中华优秀传统文化',
        showCancel: false,
        confirmText: '了解更多'
      });
    },
    navigateToLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    },
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除登录状态和用户信息
            uni.removeStorageSync('token');
            uni.removeStorageSync('userInfo');
            
            // 更新页面状态
            this.isLoggedIn = false;
            this.userInfo = {
              id: '',
              nickname: '游客',
              avatar: ''
            };
            this.stats = {
              posts: 0,
              orders: 0,
              likes: 0
            };
            
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            });
          }
        }
      });
    },
    showLoginTip() {
      uni.showModal({
        title: '提示',
        content: '您尚未登录，请先登录',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.navigateToLogin();
          }
        }
      });
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

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 30rpx;
  background-color: #6d4126;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background-color: #fff;
  margin-right: 30rpx;
}

.user-data {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.user-id {
  font-size: 24rpx;
  opacity: 0.8;
}

.settings {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon {
  font-size: 40rpx;
}

.user-stats {
  display: flex;
  background-color: #fff;
  padding: 30rpx 0;
  margin-bottom: 20rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1rpx solid #eee;
}

.stat-item:last-child {
  border-right: none;
}

.stat-count {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 26rpx;
  color: #666;
}

.menu-section {
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 20rpx 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
  width: 60rpx;
  text-align: center;
}

.menu-label {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 40rpx;
  color: #999;
}

.login-section, .logout-section {
  padding: 40rpx 30rpx;
}

.login-button, .logout-button {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  font-size: 32rpx;
  border-radius: 45rpx;
}

.login-button {
  background-color: #6d4126;
  color: #fff;
}

.logout-button {
  background-color: #f5f5f5;
  color: #666;
  border: 1rpx solid #ddd;
}
</style> 