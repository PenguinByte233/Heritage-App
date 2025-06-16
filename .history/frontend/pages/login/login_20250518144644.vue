<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <view class="header">
      <view class="back-button" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">{{ isRegister ? '注册' : '登录' }}</text>
    </view>
    
    <!-- 标题 -->
    <view class="login-header">
      <image class="logo" src="/static/images/logo.png" mode="aspectFit"></image>
      <text class="welcome">{{ isRegister ? '欢迎加入非遗小程序' : '欢迎回来' }}</text>
    </view>
    
    <!-- 登录表单 -->
    <view class="form-container">
      <view class="form-item" v-if="isRegister">
        <text class="form-label">用户名</text>
        <input 
          class="form-input" 
          v-model="username" 
          placeholder="请输入用户名"
          maxlength="20"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">手机号</text>
        <input 
          class="form-input" 
          v-model="phone" 
          placeholder="请输入手机号"
          maxlength="11"
          type="number"
        />
      </view>
      
      <view class="form-item" v-if="isRegister">
        <text class="form-label">验证码</text>
        <view class="code-input-container">
          <input 
            class="form-input code-input" 
            v-model="verifyCode" 
            placeholder="请输入验证码"
            maxlength="6"
            type="number"
          />
          <view 
            class="get-code-button" 
            :class="{'disabled': countDown > 0}"
            @tap="getVerifyCode"
          >
            {{ countDown > 0 ? `${countDown}s后重新获取` : '获取验证码' }}
          </view>
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">密码</text>
        <input 
          class="form-input" 
          v-model="password" 
          placeholder="请输入密码"
          password
          maxlength="20"
        />
      </view>
      
      <view class="form-item" v-if="isRegister">
        <text class="form-label">确认密码</text>
        <input 
          class="form-input" 
          v-model="confirmPassword" 
          placeholder="请再次输入密码"
          password
          maxlength="20"
        />
      </view>
    </view>
    
    <!-- 提交按钮 -->
    <view class="button-container">
      <button 
        class="submit-button" 
        :disabled="isSubmitting" 
        @tap="handleSubmit"
      >
        {{ isSubmitting ? '处理中...' : (isRegister ? '注册' : '登录') }}
      </button>
    </view>
    
    <!-- 其他操作 -->
    <view class="other-options">
      <view class="option-item" @tap="toggleRegister">
        <text>{{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}</text>
      </view>
      <view class="option-item" @tap="forgetPassword" v-if="!isRegister">
        <text>忘记密码</text>
      </view>
    </view>
    
    <!-- 其他登录方式 -->
    <view class="other-login">
      <view class="divider">
        <view class="divider-line"></view>
        <text class="divider-text">其他登录方式</text>
        <view class="divider-line"></view>
      </view>
      
      <view class="login-methods">
        <view class="login-method" @tap="wechatLogin">
          <text class="method-icon">🔵</text>
          <text class="method-name">微信</text>
        </view>
      </view>
    </view>
    
    <!-- 协议 -->
    <view class="agreement" v-if="isRegister">
      <checkbox-group @change="handleAgreementChange">
        <checkbox value="agree" :checked="isAgreed" color="#6d4126" />
        <text class="agreement-text">我已阅读并同意</text>
        <text class="agreement-link" @tap="viewUserAgreement">《用户协议》</text>
        <text class="agreement-text">和</text>
        <text class="agreement-link" @tap="viewPrivacyPolicy">《隐私政策》</text>
      </checkbox-group>
    </view>
  </view>
</template>

<script>
import { login, register } from '@/api/api.js';

export default {
  data() {
    return {
      isRegister: false,
      username: '',
      phone: '',
      password: '',
      confirmPassword: '',
      verifyCode: '',
      countDown: 0,
      isSubmitting: false,
      isAgreed: false
    };
  },
  onLoad(options) {
    if (options.type === 'register') {
      this.isRegister = true;
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    toggleRegister() {
      this.isRegister = !this.isRegister;
      // 清空表单
      this.username = '';
      this.phone = '';
      this.password = '';
      this.confirmPassword = '';
      this.verifyCode = '';
    },
    forgetPassword() {
      uni.navigateTo({
        url: '/pages/login/forget-password'
      });
    },
    getVerifyCode() {
      if (this.countDown > 0) return;
      
      // 验证手机号
      if (!this.validatePhone()) return;
      
      // 开始倒计时
      this.countDown = 60;
      const timer = setInterval(() => {
        this.countDown--;
        if (this.countDown <= 0) {
          clearInterval(timer);
        }
      }, 1000);
      
      // TODO: 调用获取验证码API
      uni.showToast({
        title: '验证码已发送',
        icon: 'success'
      });
    },
    validateForm() {
      if (this.isRegister) {
        // 注册表单验证
        if (!this.username.trim()) {
          uni.showToast({
            title: '请输入用户名',
            icon: 'none'
          });
          return false;
        }
        
        if (!this.validatePhone()) return false;
        
        if (!this.verifyCode.trim()) {
          uni.showToast({
            title: '请输入验证码',
            icon: 'none'
          });
          return false;
        }
        
        if (this.password.length < 6) {
          uni.showToast({
            title: '密码长度不能少于6位',
            icon: 'none'
          });
          return false;
        }
        
        if (this.password !== this.confirmPassword) {
          uni.showToast({
            title: '两次输入的密码不一致',
            icon: 'none'
          });
          return false;
        }
        
        if (!this.isAgreed) {
          uni.showToast({
            title: '请同意用户协议和隐私政策',
            icon: 'none'
          });
          return false;
        }
      } else {
        // 登录表单验证
        if (!this.validatePhone()) return false;
        
        if (!this.password.trim()) {
          uni.showToast({
            title: '请输入密码',
            icon: 'none'
          });
          return false;
        }
      }
      
      return true;
    },
    validatePhone() {
      if (!this.phone.trim()) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        });
        return false;
      }
      
      if (!/^1\d{10}$/.test(this.phone)) {
        uni.showToast({
          title: '手机号格式不正确',
          icon: 'none'
        });
        return false;
      }
      
      return true;
    },
    async handleSubmit() {
      if (!this.validateForm()) return;
      
      this.isSubmitting = true;
      
      try {
        let response;
        
        if (this.isRegister) {
          // 注册 - 使用后端API，确保参数匹配
          response = await register(
            this.username, // nickname
            this.phone,    // phone_number
            this.password  // password
          );
          
          if (response.status === 'success') {
            uni.showToast({
              title: '注册成功，请登录',
              icon: 'success'
            });
            
            // 注册成功后切换到登录模式，无需自动登录
            this.isRegister = false;
            this.password = '';
            // 保留手机号方便用户登录
          } else {
            throw new Error(response.message || '注册失败');
          }
        } else {
          // 登录 - 使用后端API，确保参数匹配
          response = await login(
            this.phone,    // phone_number
            this.password  // password
          );
          
          if (response.status === 'success') {
            // 保存登录状态和用户信息
            const userInfo = {
              id: response.data.id,
              nickname: response.data.nickname,
              phone_number: response.data.phone_number,
              avatar_url: '/static/images/default-avatar.png' // 默认头像
            };
            
            uni.setStorageSync('token', 'user_token'); // 实际项目应使用后端返回的token
            uni.setStorageSync('userInfo', JSON.stringify(userInfo));
            
            uni.showToast({
              title: '登录成功',
              icon: 'success'
            });
            
            // 登录成功后，延迟返回上一页，让用户看到成功提示
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            throw new Error(response.message || '登录失败');
          }
        }
      } catch (error) {
        console.error(this.isRegister ? '注册失败:' : '登录失败:', error);
        uni.showToast({
          title: error.message || (this.isRegister ? '注册失败，请稍后再试' : '登录失败，请检查账号密码'),
          icon: 'none'
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    wechatLogin() {
      // TODO: 实现微信登录
      uni.showToast({
        title: '微信登录功能开发中',
        icon: 'none'
      });
    },
    handleAgreementChange(e) {
      this.isAgreed = e.detail.value.includes('agree');
    },
    viewUserAgreement() {
      uni.navigateTo({
        url: '/pages/login/user-agreement'
      });
    },
    viewPrivacyPolicy() {
      uni.navigateTo({
        url: '/pages/login/privacy-policy'
      });
    }
  }
};
</script>

<style>
.container {
  padding: 0;
  background-color: #fff;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
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
  text-align: center;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
}

.welcome {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.form-container {
  padding: 0 50rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 90rpx;
  border-bottom: 1px solid #ddd;
  font-size: 32rpx;
  color: #333;
}

.code-input-container {
  display: flex;
  align-items: center;
}

.code-input {
  flex: 1;
}

.get-code-button {
  width: 220rpx;
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  background-color: #6d4126;
  color: #fff;
  font-size: 26rpx;
  border-radius: 35rpx;
}

.get-code-button.disabled {
  background-color: #ccc;
  color: #fff;
}

.button-container {
  padding: 60rpx 50rpx 40rpx;
}

.submit-button {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background-color: #6d4126;
  color: #fff;
  font-size: 32rpx;
  border-radius: 45rpx;
}

.submit-button[disabled] {
  background-color: #ccc;
  color: #fff;
}

.other-options {
  display: flex;
  justify-content: space-between;
  padding: 0 50rpx 40rpx;
}

.option-item {
  font-size: 28rpx;
  color: #6d4126;
}

.other-login {
  padding: 40rpx 50rpx;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #eee;
}

.divider-text {
  padding: 0 20rpx;
  font-size: 26rpx;
  color: #999;
}

.login-methods {
  display: flex;
  justify-content: center;
}

.login-method {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 40rpx;
}

.method-icon {
  font-size: 60rpx;
  margin-bottom: 10rpx;
}

.method-name {
  font-size: 24rpx;
  color: #666;
}

.agreement {
  padding: 20rpx 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.agreement-text {
  font-size: 24rpx;
  color: #666;
  margin-left: 10rpx;
}

.agreement-link {
  font-size: 24rpx;
  color: #6d4126;
}
</style> 