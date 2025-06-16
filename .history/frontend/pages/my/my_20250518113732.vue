<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="user-info-section">
      <view class="user-header">
        <image 
          class="avatar" 
          :src="userInfo.avatar_url || '/static/images/default-avatar.png'"
        ></image>
        <view class="user-meta">
          <text class="username">{{ userInfo.nickname || '未登录' }}</text>
          <text class="user-id" v-if="userInfo.id">ID: {{ userInfo.id }}</text>
        </view>
        <view class="login-btn" @tap="handleLogin" v-if="!isLoggedIn">登录/注册</view>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @tap="navigateTo('/pages/my/orders')">
          <view class="menu-icon">📦</view>
          <text class="menu-text">我的订单</text>
          <view class="menu-arrow">›</view>
        </view>
        
        <view class="menu-item" @tap="navigateTo('/pages/my/favorites')">
          <view class="menu-icon">❤️</view>
          <text class="menu-text">我的收藏</text>
          <view class="menu-arrow">›</view>
        </view>
        
        <view class="menu-item" @tap="navigateTo('/pages/my/posts')">
          <view class="menu-icon">📝</view>
          <text class="menu-text">我的发布</text>
          <view class="menu-arrow">›</view>
        </view>
      </view>
      
      <view class="menu-group">
        <view class="menu-item" @tap="navigateTo('/pages/my/settings')">
          <view class="menu-icon">⚙️</view>
          <text class="menu-text">设置</text>
          <view class="menu-arrow">›</view>
        </view>
        
        <view class="menu-item" @tap="navigateTo('/pages/my/about')">
          <view class="menu-icon">ℹ️</view>
          <text class="menu-text">关于我们</text>
          <view class="menu-arrow">›</view>
        </view>
      </view>
      
      <view class="menu-group" v-if="isLoggedIn">
        <view class="menu-item logout" @tap="handleLogout">
          <text class="menu-text">退出登录</text>
        </view>
      </view>
    </view>
    
    <!-- 登录弹窗 -->
    <view class="login-modal" v-if="showLoginModal">
      <view class="modal-mask" @tap="closeLoginModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">{{ isRegister ? '注册' : '登录' }}</text>
          <view class="modal-close" @tap="closeLoginModal">×</view>
        </view>
        
        <view class="modal-body">
          <input 
            class="input-field" 
            placeholder="用户名" 
            v-model="loginForm.username"
          />
          <input 
            class="input-field" 
            placeholder="密码" 
            password
            v-model="loginForm.password"
          />
          <input 
            class="input-field" 
            placeholder="确认密码" 
            password
            v-model="loginForm.confirmPassword"
            v-if="isRegister"
          />
        </view>
        
        <view class="modal-footer">
          <button class="submit-btn" @tap="submitLogin">{{ isRegister ? '注册' : '登录' }}</button>
          <view class="switch-mode" @tap="switchLoginMode">
            {{ isRegister ? '已有账号？点击登录' : '没有账号？点击注册' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { login, register, getUserInfo } from '@/api/api.js';

export default {
  data() {
    return {
      userInfo: {},
      isLoggedIn: false,
      showLoginModal: false,
      isRegister: false,
      loginForm: {
        username: '',
        password: '',
        confirmPassword: ''
      }
    };
  },
  onLoad() {
    this.checkLoginStatus();
  },
  onShow() {
    // 每次页面显示时检查登录状态
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      const token = uni.getStorageSync('token');
      if (token) {
        this.isLoggedIn = true;
        this.fetchUserInfo();
      } else {
        this.isLoggedIn = false;
        this.userInfo = {};
      }
    },
    async fetchUserInfo() {
      try {
        const response = await getUserInfo();
        if (response.status === 'success' && response.data) {
          this.userInfo = response.data;
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 如果获取用户信息失败，可能是token过期，清除登录状态
        if (error.statusCode === 401) {
          this.handleLogout();
        }
      }
    },
    navigateTo(url) {
      if (this.isLoggedIn) {
        uni.navigateTo({ url });
      } else {
        this.handleLogin();
      }
    },
    handleLogin() {
      this.showLoginModal = true;
      this.isRegister = false;
      this.resetLoginForm();
    },
    closeLoginModal() {
      this.showLoginModal = false;
    },
    resetLoginForm() {
      this.loginForm = {
        username: '',
        password: '',
        confirmPassword: ''
      };
    },
    switchLoginMode() {
      this.isRegister = !this.isRegister;
      this.resetLoginForm();
    },
    async submitLogin() {
      try {
        if (this.isRegister) {
          // 注册逻辑
          if (!this.loginForm.username || !this.loginForm.password || !this.loginForm.confirmPassword) {
            return uni.showToast({
              title: '请填写完整信息',
              icon: 'none'
            });
          }
          
          if (this.loginForm.password !== this.loginForm.confirmPassword) {
            return uni.showToast({
              title: '两次密码不一致',
              icon: 'none'
            });
          }
          
          uni.showLoading({ title: '注册中...' });
          const response = await register(this.loginForm.username, this.loginForm.password);
          
          if (response.status === 'success') {
            uni.hideLoading();
            uni.showToast({
              title: '注册成功',
              icon: 'success'
            });
            
            // 注册成功后自动登录
            this.isRegister = false;
            await this.submitLogin();
          } else {
            throw new Error(response.message || '注册失败');
          }
        } else {
          // 登录逻辑
          if (!this.loginForm.username || !this.loginForm.password) {
            return uni.showToast({
              title: '请填写用户名和密码',
              icon: 'none'
            });
          }
          
          uni.showLoading({ title: '登录中...' });
          const response = await login(this.loginForm.username, this.loginForm.password);
          
          if (response.status === 'success' && response.data.token) {
            uni.setStorageSync('token', response.data.token);
            this.isLoggedIn = true;
            this.showLoginModal = false;
            this.fetchUserInfo();
            
            uni.hideLoading();
            uni.showToast({
              title: '登录成功',
              icon: 'success'
            });
          } else {
            throw new Error(response.message || '登录失败');
          }
        }
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: error.message || (this.isRegister ? '注册失败' : '登录失败'),
          icon: 'none'
        });
      }
    },
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('token');
            this.isLoggedIn = false;
            this.userInfo = {};
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            });
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

.user-info-section {
  background-color: #fff;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
}

.user-header {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 30rpx;
}

.user-meta {
  flex: 1;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.user-id {
  font-size: 24rpx;
  color: #999;
}

.login-btn {
  padding: 15rpx 30rpx;
  background-color: #6d4126;
  color: #fff;
  font-size: 28rpx;
  border-radius: 30rpx;
}

.menu-section {
  padding: 0 20rpx;
}

.menu-group {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
  width: 50rpx;
  text-align: center;
}

.menu-text {
  flex: 1;
  font-size: 32rpx;
  color: #333;
}

.menu-arrow {
  font-size: 36rpx;
  color: #ccc;
}

.logout {
  justify-content: center;
}

.logout .menu-text {
  flex: 0;
  color: #ff4d4f;
}

/* 登录弹窗样式 */
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
}

.modal-body {
  padding: 30rpx;
}

.input-field {
  width: 100%;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.modal-footer {
  padding: 0 30rpx 30rpx;
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #6d4126;
  color: #fff;
  font-size: 32rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}

.switch-mode {
  text-align: center;
  font-size: 28rpx;
  color: #6d4126;
}
</style> 