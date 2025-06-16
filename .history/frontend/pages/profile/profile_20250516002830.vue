<template>
  <view class="container">
    <!-- 用户信息卡片 -->
    <view class="user-header">
      <view class="user-info">
        <image :src="userInfo.avatar_url || 'https://img.icons8.com/ios/100/000000/user-male-circle.png'" class="avatar"></image>
        <view class="name-box">
          <text class="username">{{ userInfo.nickname || '未登录用户' }}</text>
          <button class="login-btn" v-if="!isLogin" @tap="handleLogin">点击登录</button>
        </view>
      </view>
    </view>
    
    <!-- 用户数据统计 -->
    <view class="stat-container">
      <view class="stat-item" @tap="navigateTo('/pages/profile/follow')">
        <text class="stat-num">{{userStats.follows || 0}}</text>
        <text class="stat-label">关注</text>
      </view>
      <view class="stat-item" @tap="navigateTo('/pages/profile/fans')">
        <text class="stat-num">{{userStats.fans || 0}}</text>
        <text class="stat-label">粉丝</text>
      </view>
      <view class="stat-item" @tap="navigateTo('/pages/profile/favor')">
        <text class="stat-num">{{userStats.favorites || 0}}</text>
        <text class="stat-label">收藏</text>
      </view>
      <view class="stat-item" @tap="navigateTo('/pages/profile/history')">
        <text class="stat-num">{{userStats.history || 0}}</text>
        <text class="stat-label">历史</text>
      </view>
    </view>
    
    <!-- 我的订单 -->
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
    
    <!-- 我的学习 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title-container">
          <image class="section-icon" src="https://img.icons8.com/ios/50/000000/book.png"></image>
          <text class="section-title">我的学习</text>
        </view>
      </view>
      
      <view class="menu-list">
        <view class="menu-item" @tap="navigateTo('/pages/learn/progress')">
          <image class="menu-icon" src="https://img.icons8.com/ios/50/000000/course.png"></image>
          <text class="menu-text">学习进度</text>
          <image class="menu-arrow" src="https://img.icons8.com/ios/50/000000/chevron-right.png"></image>
        </view>
        <view class="menu-item" @tap="navigateTo('/pages/learn/favorite')">
          <image class="menu-icon" src="https://img.icons8.com/ios/50/000000/bookmark-ribbon.png"></image>
          <text class="menu-text">收藏教程</text>
          <image class="menu-arrow" src="https://img.icons8.com/ios/50/000000/chevron-right.png"></image>
        </view>
        <view class="menu-item" @tap="navigateTo('/pages/learn/notes')">
          <image class="menu-icon" src="https://img.icons8.com/ios/50/000000/note.png"></image>
          <text class="menu-text">学习笔记</text>
          <image class="menu-arrow" src="https://img.icons8.com/ios/50/000000/chevron-right.png"></image>
        </view>
      </view>
    </view>
    
    <!-- 我的发布 -->
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
    
    <!-- 设置与服务 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title-container">
          <image class="section-icon" src="https://img.icons8.com/ios/50/000000/services.png"></image>
          <text class="section-title">设置与服务</text>
        </view>
      </view>
      
      <view class="menu-list">
        <view class="menu-item" @tap="navigateTo('/pages/profile/settings')">
          <image class="menu-icon" src="https://img.icons8.com/ios/50/000000/settings.png"></image>
          <text class="menu-text">个人设置</text>
          <image class="menu-arrow" src="https://img.icons8.com/ios/50/000000/chevron-right.png"></image>
        </view>
        <view class="menu-item" @tap="navigateTo('/pages/profile/address')">
          <image class="menu-icon" src="https://img.icons8.com/ios/50/000000/marker.png"></image>
          <text class="menu-text">地址管理</text>
          <image class="menu-arrow" src="https://img.icons8.com/ios/50/000000/chevron-right.png"></image>
        </view>
        <view class="menu-item" @tap="handleContact">
          <image class="menu-icon" src="https://img.icons8.com/ios/50/000000/phone.png"></image>
          <text class="menu-text">联系客服</text>
          <image class="menu-arrow" src="https://img.icons8.com/ios/50/000000/chevron-right.png"></image>
        </view>
        <view class="menu-item" @tap="navigateTo('/pages/profile/about')">
          <image class="menu-icon" src="https://img.icons8.com/ios/50/000000/info.png"></image>
          <text class="menu-text">关于我们</text>
          <image class="menu-arrow" src="https://img.icons8.com/ios/50/000000/chevron-right.png"></image>
        </view>
      </view>
    </view>
    
    <!-- 退出登录 -->
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
        follows: 12,
        fans: 25,
        favorites: 36,
        history: 48,
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
    },
    handleContact() {
      uni.showToast({
        title: '正在连接客服',
        icon: 'none'
      });
    }
  }
}
</script>

<style>
.container {
  padding: 0 0 30px 0;
  background-color: #f5f5f5;
}

.user-header {
  height: 200px;
  background: linear-gradient(to bottom, #8e582a, #d4a478);
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
  width: 100%;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #fff;
  background-color: #fff;
}

.name-box {
  flex: 1;
  margin-left: 15px;
}

.username {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10px;
  display: block;
}

.login-btn {
  width: 100px;
  line-height: 32px;
  background-color: #fff;
  color: #8e582a;
  font-size: 14px;
  border-radius: 16px;
  text-align: center;
  padding: 0;
}

.stat-container {
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  padding: 15px 0;
  margin-bottom: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.section-card {
  background-color: #fff;
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.section-title-container {
  display: flex;
  align-items: center;
}

.section-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.more-container {
  display: flex;
  align-items: center;
}

.more-text {
  font-size: 12px;
  color: #999;
}

.more-icon {
  width: 14px;
  height: 14px;
}

.grid-menu {
  display: flex;
  flex-wrap: wrap;
  padding: 10px 0;
}

.grid-item {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  position: relative;
}

.grid-icon {
  width: 28px;
  height: 28px;
  margin-bottom: 8px;
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
  background-color: #ff4d4f;
  color: #fff;
  font-size: 10px;
  height: 16px;
  min-width: 16px;
  padding: 0 4px;
  border-radius: 8px;
  line-height: 16px;
  text-align: center;
}

.menu-list {
  background-color: #fff;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.menu-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.menu-desc {
  font-size: 12px;
  color: #999;
  margin-right: 5px;
}

.menu-arrow {
  width: 14px;
  height: 14px;
}

.logout-btn {
  width: 90%;
  height: 44px;
  line-height: 44px;
  background-color: #fff;
  color: #ff4d4f;
  text-align: center;
  border-radius: 22px;
  margin: 20px auto 0;
  font-size: 16px;
}
</style> 