<template>
  <view class="container">
    <!-- A. 用户信息卡片 -->
    <view class="user-header">
      <view class="user-info">
        <image :src="userInfo.avatar_url || 'https://img.icons8.com/ios/100/000000/user-male-circle.png'" class="avatar"></image>
        <view class="name-box">
          <text class="username">{{ userInfo.nickname || '未登录用户' }}</text>
          <button class="login-btn" v-if="!isLogin" @tap="handleLogin">点击登录</button>
        </view>
      </view>
    </view>
    
    <!-- B. 我的订单 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title-container">
          <image class="section-icon" src="https://img.icons8.com/ios/50/000000/purchase-order.png"></image>
          <text class="section-title">我的订单</text>
        </view>
        <view class="more-container" @tap="navigateTo('/pages/order/list')">
          <text class="more-text">查看全部</text>
          <image class="more-icon" src="https://img.icons8.com/ios/50/000000/chevron-right.png"></image>
        </view>
      </view>
      
      <view class="grid-menu">
        <view class="grid-item" @tap="navigateTo('/pages/order/list?status=pending')">
          <image class="grid-icon" src="https://img.icons8.com/ios/50/000000/wallet.png"></image>
          <text class="grid-text">待付款</text>
          <view class="badge" v-if="orderBadges.pending">{{orderBadges.pending}}</view>
        </view>
        <view class="grid-item" @tap="navigateTo('/pages/order/list?status=paid')">
          <image class="grid-icon" src="https://img.icons8.com/ios/50/000000/box.png"></image>
          <text class="grid-text">待发货</text>
          <view class="badge" v-if="orderBadges.paid">{{orderBadges.paid}}</view>
        </view>
        <view class="grid-item" @tap="navigateTo('/pages/order/list?status=shipped')">
          <image class="grid-icon" src="https://img.icons8.com/ios/50/000000/truck.png"></image>
          <text class="grid-text">待收货</text>
          <view class="badge" v-if="orderBadges.shipped">{{orderBadges.shipped}}</view>
        </view>
        <view class="grid-item" @tap="navigateTo('/pages/order/list?status=review')">
          <image class="grid-icon" src="https://img.icons8.com/ios/50/000000/edit.png"></image>
          <text class="grid-text">待评价</text>
          <view class="badge" v-if="orderBadges.review">{{orderBadges.review}}</view>
        </view>
        <view class="grid-item" @tap="navigateTo('/pages/order/after-sale')">
          <image class="grid-icon" src="https://img.icons8.com/ios/50/000000/refund.png"></image>
          <text class="grid-text">售后</text>
        </view>
      </view>
    </view>
    
    <!-- C. 我的发布 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title-container">
          <image class="section-icon" src="https://img.icons8.com/ios/50/000000/community.png"></image>
          <text class="section-title">我的发布</text>
        </view>
      </view>
      
      <view class="menu-list">
        <view class="menu-item" @tap="navigateTo('/pages/post/my')">
          <image class="menu-icon" src="https://img.icons8.com/ios/50/000000/comments.png"></image>
          <text class="menu-text">我的帖子</text>
          <text class="menu-desc">{{userStats.posts || 0}}篇</text>
          <image class="menu-arrow" src="https://img.icons8.com/ios/50/000000/chevron-right.png"></image>
        </view>
        <view class="menu-item" @tap="navigateTo('/pages/comment/my')">
          <image class="menu-icon" src="https://img.icons8.com/ios/50/000000/topic.png"></image>
          <text class="menu-text">我的评论</text>
          <text class="menu-desc">{{userStats.comments || 0}}条</text>
          <image class="menu-arrow" src="https://img.icons8.com/ios/50/000000/chevron-right.png"></image>
        </view>
      </view>
    </view>
    
    <!-- D. 退出登录 -->
    <view class="logout-btn" v-if="isLogin" @tap="handleLogout">
      退出登录
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLogin: false,
      userInfo: {
        id: null,
        nickname: '',
        avatar_url: ''
      },
      userStats: {
        posts: 5,
        comments: 18
      },
      orderBadges: {
        pending: 1,
        paid: 2,
        shipped: 0,
        review: 3
      }
    }
  },
  onShow() {
    // 每次显示页面时检查登录状态，确保状态最新
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      // 实际应用中，应该检查本地存储或全局状态获取登录信息
      const token = uni.getStorageSync('token');
      const userInfo = uni.getStorageSync('userInfo');
      
      if (token && userInfo) {
        this.isLogin = true;
        this.userInfo = JSON.parse(userInfo);
      } else {
        this.isLogin = false;
      }
    },
    handleLogin() {
      // 模拟登录过程
      uni.showLoading({ title: '登录中' });
      
      setTimeout(() => {
        const mockUser = {
          id: 100,
          nickname: '非遗用户',
          avatar_url: 'https://pic2.zhimg.com/v2-3b19d8777dc695a91a301eef5a18048c_xl.jpg'
        };
        
        uni.setStorageSync('token', 'mock_token');
        uni.setStorageSync('userInfo', JSON.stringify(mockUser));
        
        this.isLogin = true;
        this.userInfo = mockUser;
        
        uni.hideLoading();
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });
      }, 1000);
    },
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除登录信息
            uni.removeStorageSync('token');
            uni.removeStorageSync('userInfo');
            
            this.isLogin = false;
            this.userInfo = {
              id: null,
              nickname: '',
              avatar_url: ''
            };
            
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            });
          }
        }
      });
    },
    navigateTo(url) {
      uni.navigateTo({ url });
    }
  }
}
</script>

<style>
.container {
  padding: 0 0 30px 0;
  background-color: #f0e6d2; /* 统一使用与内容页相同的背景色 */
}

.user-header {
  height: 200px;
  background: linear-gradient(to bottom, #8a6642, #6d4126); /* 与应用整体风格一致的配色 */
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  width: 100%;
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.8);
  background-color: #fff;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.2);
}

.name-box {
  flex: 1;
  margin-left: 20px;
}

.username {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10px;
  display: block;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.login-btn {
  width: 120px;
  line-height: 36px;
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 14px;
  border-radius: 18px;
  text-align: center;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s;
}

.login-btn:active {
  transform: scale(0.95);
  background-color: rgba(255, 255, 255, 0.3);
}

.section-card {
  background-color: #fff;
  margin: 20px 15px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(109, 65, 38, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid rgba(240, 230, 210, 0.6);
}

.section-title-container {
  display: flex;
  align-items: center;
}

.section-icon {
  width: 22px;
  height: 22px;
  margin-right: 10px;
  opacity: 0.7;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #6d4126; /* 与应用主题色一致 */
}

.more-container {
  display: flex;
  align-items: center;
}

.more-text {
  font-size: 13px;
  color: #8a6642; /* 与应用主题色一致 */
}

.more-icon {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

.grid-menu {
  display: flex;
  flex-wrap: wrap;
  padding: 15px 0;
  background-color: #fff;
}

.grid-item {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  position: relative;
  transition: all 0.3s;
}

.grid-item:active {
  transform: scale(0.95);
}

.grid-icon {
  width: 28px;
  height: 28px;
  margin-bottom: 8px;
  opacity: 0.8;
}

.grid-text {
  font-size: 12px;
  color: #666;
}

.badge {
  position: absolute;
  top: 5px;
  right: 50%;
  margin-right: -20px;
  background-color: #e65339; /* 更符合主题色系 */
  color: #fff;
  font-size: 10px;
  height: 16px;
  min-width: 16px;
  padding: 0 4px;
  border-radius: 8px;
  line-height: 16px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.menu-list {
  background-color: #fff;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid rgba(240, 230, 210, 0.6);
  transition: all 0.3s;
}

.menu-item:active {
  background-color: rgba(109, 65, 38, 0.05);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  width: 22px;
  height: 22px;
  margin-right: 12px;
  opacity: 0.8;
}

.menu-text {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.menu-desc {
  font-size: 13px;
  color: #8a6642; /* 使用次主题色 */
  margin-right: 8px;
}

.menu-arrow {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

.logout-btn {
  width: 90%;
  height: 44px;
  line-height: 44px;
  background-color: #fff;
  color: #e65339; /* 红色调整为更符合主题的颜色 */
  text-align: center;
  border-radius: 22px;
  margin: 30px auto;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(230, 83, 57, 0.2);
  transition: all 0.3s;
}

.logout-btn:active {
  transform: scale(0.98);
  background-color: rgba(230, 83, 57, 0.05);
}
</style> 