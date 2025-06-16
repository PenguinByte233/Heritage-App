<template>
  <view class="container">
    <!-- 顶部安全区域和导航栏 -->
    <view class="status-bar"></view>
    <view class="nav-header">
      <text class="nav-title">我的</text>
    </view>
    
    <!-- 个人信息卡片 -->
    <view class="profile-card">
      <view class="avatar-container" @tap="changeAvatar">
        <image 
          v-if="isLogin && userInfo.avatar_url && !isDefaultAvatar(userInfo.avatar_url)"
          :src="userInfo.avatar_url" 
          class="avatar"
          mode="aspectFill"
          @error="handleAvatarError"
        ></image>
        <image 
          v-else
          src="/static/images/avatar/空中花园.png" 
          class="avatar"
          mode="aspectFill"
        ></image>
      </view>
      <view class="user-details">
        <text class="user-name">{{ userInfo.nickname || '未登录用户' }}</text>
        <button class="login-button" v-if="!isLogin" @tap="handleLogin">
          <text class="login-text">点击登录</text>
        </button>
      </view>
    </view>
    
    <!-- 订单模块 -->
    <view class="module-card">
      <view class="module-header">
        <view class="module-title-block">
          <text class="module-icon">📦</text>
          <text class="module-title">我的订单</text>
        </view>
        <view class="view-all" @tap="navigateToOrderList">
          <text class="view-all-text">查看全部</text>
          <text class="chevron-right">›</text>
        </view>
      </view>
      
      <view class="order-actions">
        <view class="action-item" @tap="navigateToOrderList('pending')">
          <view class="action-icon-wrapper">
            <text class="action-icon">💰</text>
            <view class="notification" v-if="orderBadges.pending">{{orderBadges.pending}}</view>
          </view>
          <text class="action-name">待付款</text>
        </view>
        
        <view class="action-item" @tap="navigateToOrderList('paid')">
          <view class="action-icon-wrapper">
            <text class="action-icon">📦</text>
            <view class="notification" v-if="orderBadges.paid">{{orderBadges.paid}}</view>
          </view>
          <text class="action-name">待发货</text>
        </view>
        
        <view class="action-item" @tap="navigateToOrderList('shipped')">
          <view class="action-icon-wrapper">
            <text class="action-icon">🚚</text>
            <view class="notification" v-if="orderBadges.shipped">{{orderBadges.shipped}}</view>
          </view>
          <text class="action-name">待收货</text>
        </view>
        
        <view class="action-item" @tap="navigateToOrderList('review')">
          <view class="action-icon-wrapper">
            <text class="action-icon">✏️</text>
            <view class="notification" v-if="orderBadges.review">{{orderBadges.review}}</view>
          </view>
          <text class="action-name">待评价</text>
        </view>
        
        <view class="action-item" @tap="navigateTo('/pages/order/after-sale')">
          <view class="action-icon-wrapper">
            <text class="action-icon">🔄</text>
          </view>
          <text class="action-name">售后</text>
        </view>
      </view>
    </view>
    
    <!-- 我的发布模块 -->
    <view class="module-card">
      <view class="module-header">
        <view class="module-title-block">
          <text class="module-icon">📝</text>
          <text class="module-title">我的发布</text>
        </view>
      </view>
      
      <view class="list-menu">
        <view class="list-item" @tap="navigateTo('/pages/post/my')">
          <view class="item-left">
            <text class="item-icon">📋</text>
            <text class="item-name">我的帖子</text>
          </view>
          <view class="item-right">
            <text class="item-info">{{userStats.posts || 0}}篇</text>
            <text class="chevron-right">›</text>
          </view>
        </view>
        
        <view class="list-item" @tap="navigateTo('/pages/comment/my')">
          <view class="item-left">
            <text class="item-icon">💬</text>
            <text class="item-name">我的评论</text>
          </view>
          <view class="item-right">
            <text class="item-info">{{userStats.comments || 0}}条</text>
            <text class="chevron-right">›</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 退出登录按钮 -->
    <view class="logout-container" v-if="isLogin">
      <button class="logout-button" @tap="handleLogout">退出登录</button>
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
      const userInfoStr = uni.getStorageSync('userInfo');
      
      if (token && userInfoStr) {
        try {
          // 解析用户信息
          let userInfo = JSON.parse(userInfoStr);
          
          // 确保头像路径正确
          if (!userInfo.avatar_url) {
            userInfo.avatar_url = '/static/images/avatar/空中花园.png';
            // 更新存储的用户信息
            uni.setStorageSync('userInfo', JSON.stringify(userInfo));
          }
          
          this.isLogin = true;
          this.userInfo = userInfo;
          console.log('当前用户头像路径:', this.userInfo.avatar_url);
        } catch (e) {
          console.error('解析用户信息失败:', e);
          this.isLogin = false;
        }
      } else {
        this.isLogin = false;
        // 确保未登录状态下也有默认头像
        this.userInfo = {
          id: null,
          nickname: '',
          avatar_url: '/static/images/avatar/空中花园.png'
        };
      }
    },
    handleLogin() {
      // 跳转到登录页面，不再使用模拟登录
      uni.navigateTo({
        url: '/pages/login/login'
      });
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
    handleAvatarError(e) {
      console.error('头像加载失败:', e);
      // 尝试使用不同的路径格式
      this.userInfo.avatar_url = './static/images/avatar/空中花园.png';
      // 如果还是失败，可以尝试使用绝对路径
      setTimeout(() => {
        if (!this.userInfo.avatar_url.includes('空中花园')) {
          this.userInfo.avatar_url = '/static/images/avatar/空中花园.png';
        }
      }, 500);
    },
    isDefaultAvatar(url) {
      return url === '/static/images/avatar/空中花园.png' || url === './static/images/avatar/空中花园.png';
    },
    changeAvatar() {
      if (!this.isLogin) {
        // 未登录状态下点击头像，跳转到登录页面
        this.handleLogin();
        return;
      }
      
      // 已登录状态下，显示选择图片的操作菜单
      uni.showActionSheet({
        itemList: ['从相册选择', '拍照'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 从相册选择
            this.chooseImage('album');
          } else if (res.tapIndex === 1) {
            // 拍照
            this.chooseImage('camera');
          }
        }
      });
    },
    chooseImage(sourceType) {
      uni.chooseImage({
        count: 1, // 最多可以选择的图片张数
        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: [sourceType], // album 从相册选图，camera 使用相机
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          
          // 显示图片上传中的提示
          uni.showLoading({
            title: '上传中...'
          });
          
          // 上传图片到服务器
          this.uploadAvatar(tempFilePath);
        }
      });
    },
    uploadAvatar(filePath) {
      // 上传图片到服务器
      uni.uploadFile({
        url: 'http://localhost:3001/api/users/upload/avatar', // 修改为正确的上传接口路径
        filePath: filePath,
        name: 'file',
        formData: {
          'user_id': this.userInfo.id
        },
        success: (uploadRes) => {
          try {
            const data = JSON.parse(uploadRes.data);
            
            if (data.status === 'success') {
              // 上传成功，更新用户头像URL
              const avatarUrl = data.data.url; // 服务器返回的头像URL
              // 构建完整的URL
              const fullAvatarUrl = `http://localhost:3001${avatarUrl}`;
              this.updateAvatarUrl(fullAvatarUrl);
            } else {
              throw new Error(data.message || '上传失败');
            }
          } catch (error) {
            console.error('解析上传结果失败:', error);
            uni.showToast({
              title: '上传失败，请稍后再试',
              icon: 'none'
            });
          }
        },
        fail: (error) => {
          console.error('上传头像失败:', error);
          uni.showToast({
            title: '上传失败，请稍后再试',
            icon: 'none'
          });
        },
        complete: () => {
          uni.hideLoading();
        }
      });
    },
    async updateAvatarUrl(avatarUrl) {
      try {
        // 调用API更新用户头像URL
        const response = await this.updateUserAvatar(this.userInfo.id, avatarUrl);
        
        if (response.status === 'success') {
          // 更新本地存储的用户信息
          this.userInfo.avatar_url = avatarUrl;
          uni.setStorageSync('userInfo', JSON.stringify(this.userInfo));
          
          uni.showToast({
            title: '头像更新成功',
            icon: 'success'
          });
        } else {
          throw new Error(response.message || '更新失败');
        }
      } catch (error) {
        console.error('更新头像URL失败:', error);
        uni.showToast({
          title: '更新失败，请稍后再试',
          icon: 'none'
        });
      }
    },
    updateUserAvatar(userId, avatarUrl) {
      return new Promise((resolve, reject) => {
        uni.request({
          url: `http://localhost:3001/api/users/${userId}/avatar`,
          method: 'PUT',
          data: {
            avatar_url: avatarUrl
          },
          success: (res) => {
            resolve(res.data);
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    },
    navigateToOrderList(status) {
      this.navigateTo(`/pages/order/list?status=${status}`);
    }
  }
}
</script>

<style>
/* 全局容器样式 */
.container {
  min-height: 100vh;
  background-color: #f5f1e6; /* 苹果风格的柔和背景色 */
  padding-bottom: 40px;
}

/* 顶部安全区域和导航栏 */
.status-bar {
  height: 44px; /* 适配顶部安全区域 */
}

.nav-header {
  padding: 10px 20px 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  letter-spacing: 0.5px;
}

/* 个人信息卡片 */
.profile-card {
  background-color: #8a6642;
  margin: 0 15px 20px;
  border-radius: 16px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.avatar-container {
  margin-bottom: 15px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 10px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.login-button {
  height: 36px;
  padding: 0 20px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-text {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

/* 模块卡片通用样式 */
.module-card {
  background-color: #ffffff;
  margin: 0 15px 20px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.module-title-block {
  display: flex;
  align-items: center;
}

.module-icon {
  margin-right: 10px;
  font-size: 18px;
}

.module-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.view-all {
  display: flex;
  align-items: center;
}

.view-all-text {
  font-size: 14px;
  color: #8a6642;
  margin-right: 4px;
}

.chevron-right {
  color: #8a6642;
  font-size: 16px;
  font-weight: 600;
}

/* 订单操作区 */
.order-actions {
  display: flex;
  padding: 15px 10px;
}

.action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-icon-wrapper {
  position: relative;
  margin-bottom: 8px;
}

.action-icon {
  font-size: 24px;
}

.notification {
  position: absolute;
  top: -6px;
  right: -10px;
  background-color: #FF3B30; /* 苹果红色通知 */
  color: white;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  text-align: center;
  line-height: 18px;
  padding: 0 5px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(255, 59, 48, 0.3);
}

.action-name {
  font-size: 12px;
  color: #333333;
}

/* 列表菜单 */
.list-menu {
  padding: 0 5px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.list-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
}

.item-icon {
  font-size: 18px;
  margin-right: 10px;
}

.item-name {
  font-size: 15px;
  color: #333333;
}

.item-right {
  display: flex;
  align-items: center;
}

.item-info {
  font-size: 14px;
  color: #8a6642;
  margin-right: 6px;
}

/* 退出登录按钮 */
.logout-container {
  padding: 0 15px;
  margin-top: 30px;
}

.logout-button {
  width: 100%;
  height: 46px;
  line-height: 46px;
  background-color: #ffffff;
  color: #FF3B30; /* 苹果风格红色 */
  font-size: 16px;
  font-weight: 500;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.logout-button:active {
  transform: scale(0.98);
  background-color: rgba(255, 59, 48, 0.05);
}
</style> 