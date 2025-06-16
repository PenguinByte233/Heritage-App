<template>
  <view class="container">
    <!-- 
      注意：验证码验证功能当前被禁用，
      因为后端API接口不需要验证码。
      若后端添加了验证码功能，将useVerifyCode设为true即可启用。
    -->
    
    <!-- 顶部安全区域 -->
    <view class="status-bar"></view>
    
    <!-- 返回按钮 -->
    <view class="back-btn" @tap="goBack">
      <text class="back-icon">←</text>
    </view>
    
    <!-- 标题区域 -->
    <view class="header-section">
      <image class="logo-image" src="/static/images/logo.png" mode="aspectFit"></image>
      <text class="welcome-text">{{ isRegister ? '创建账号' : '欢迎回来' }}</text>
      <text class="subtitle-text">{{ isRegister ? '加入非遗小程序，探索传统文化' : '登录您的账号，继续探索之旅' }}</text>
    </view>
    
    <!-- 表单区域 -->
    <view class="form-section">
      <!-- 用户名输入框 (仅注册时显示) -->
      <view class="input-group" v-if="isRegister">
        <text class="input-label">用户名</text>
        <view class="input-container">
          <text class="input-icon">👤</text>
          <input 
            class="input-field" 
            v-model="username" 
            placeholder="请输入您的用户名"
            maxlength="20"
          />
        </view>
      </view>
      
      <!-- 手机号输入框 -->
      <view class="input-group">
        <text class="input-label">手机号</text>
        <view class="input-container">
          <text class="input-icon">📱</text>
          <input 
            class="input-field" 
            v-model="phone" 
            placeholder="请输入您的手机号"
            maxlength="11"
            type="number"
          />
        </view>
      </view>
      
      <!-- 验证码输入框 (仅在注册且启用验证码时显示) -->
      <view class="input-group" v-if="isRegister && useVerifyCode">
        <text class="input-label">验证码</text>
        <view class="input-container verify-code">
          <text class="input-icon">🔑</text>
          <input 
            class="input-field" 
            v-model="verifyCode" 
            placeholder="请输入验证码"
            maxlength="6"
            type="number"
          />
          <view 
            class="verify-btn" 
            :class="{'disabled': countDown > 0}"
            @tap="getVerifyCode"
          >
            {{ countDown > 0 ? `${countDown}s` : '获取验证码' }}
          </view>
        </view>
      </view>
      
      <!-- 密码输入框 -->
      <view class="input-group">
        <text class="input-label">密码</text>
        <view class="input-container">
          <text class="input-icon">🔒</text>
          <input 
            class="input-field" 
            v-model="password" 
            placeholder="请输入密码"
            password
            maxlength="20"
          />
        </view>
      </view>
      
      <!-- 确认密码输入框 (仅注册时显示) -->
      <view class="input-group" v-if="isRegister">
        <text class="input-label">确认密码</text>
        <view class="input-container">
          <text class="input-icon">🔒</text>
          <input 
            class="input-field" 
            v-model="confirmPassword" 
            placeholder="请再次输入密码"
            password
            maxlength="20"
          />
        </view>
      </view>
    </view>
    
    <!-- 选项区域 -->
    <view class="options-section">
      <!-- 用户协议勾选 (仅注册时显示) -->
      <view class="agreement-container" v-if="isRegister">
        <checkbox-group @change="handleAgreementChange">
          <checkbox value="agree" :checked="isAgreed" color="#8a6642" style="transform: scale(0.8);" />
          <text class="agreement-text">我已阅读并同意</text>
          <text class="agreement-link" @tap="viewUserAgreement">《用户协议》</text>
          <text class="agreement-text">和</text>
          <text class="agreement-link" @tap="viewPrivacyPolicy">《隐私政策》</text>
        </checkbox-group>
      </view>
      
      <!-- 忘记密码链接 (仅登录时显示) -->
      <view class="forgot-password" v-if="!isRegister">
        <text class="forgot-password-link" @tap="forgetPassword">忘记密码?</text>
      </view>
    </view>
    
    <!-- 提交按钮 -->
    <view class="submit-section">
      <button 
        class="submit-button" 
        :disabled="isSubmitting" 
        @tap="handleSubmit"
      >
        <text class="submit-text">{{ isSubmitting ? '处理中...' : (isRegister ? '注册' : '登录') }}</text>
      </button>
    </view>
    
    <!-- 切换登录/注册 -->
    <view class="switch-mode" @tap="toggleRegister">
      <text class="switch-text">{{ isRegister ? '已有账号？' : '没有账号？' }}</text>
      <text class="switch-action">{{ isRegister ? '去登录' : '去注册' }}</text>
    </view>
    
    <!-- 其他登录方式 -->
    <view class="other-login">
      <view class="divider">
        <view class="divider-line"></view>
        <text class="divider-text">其他登录方式</text>
        <view class="divider-line"></view>
      </view>
      
      <view class="social-buttons">
        <view class="social-button wechat" @tap="wechatLogin">
          <text class="social-icon">微</text>
        </view>
      </view>
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
      isAgreed: false,
      useVerifyCode: false
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
        
        if (this.useVerifyCode && !this.verifyCode.trim()) {
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
/* 全局容器 */
.container {
  min-height: 100vh;
  background-color: #f5f1e6; /* 与profile页面保持一致的背景色 */
  position: relative;
  padding: 0 30px 50px;
  display: flex;
  flex-direction: column;
}

/* 状态栏安全区域 */
.status-bar {
  height: 44px;
}

/* 返回按钮 */
.back-btn {
  position: absolute;
  top: 54px;
  left: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-icon {
  font-size: 22px;
  color: #333;
  font-weight: 500;
}

/* 标题区域 */
.header-section {
  padding: 20px 0 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-image {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
}

.welcome-text {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.subtitle-text {
  font-size: 14px;
  color: #666;
  text-align: center;
}

/* 表单区域 */
.form-section {
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 24px;
}

.input-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  display: block;
  font-weight: 500;
}

.input-container {
  display: flex;
  align-items: center;
  background-color: #fff;
  height: 50px;
  border-radius: 12px;
  padding: 0 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.input-icon {
  margin-right: 10px;
  font-size: 16px;
}

.input-field {
  flex: 1;
  height: 50px;
  font-size: 16px;
  color: #333;
}

.verify-code {
  position: relative;
}

.verify-btn {
  position: absolute;
  right: 10px;
  height: 34px;
  line-height: 34px;
  background: linear-gradient(135deg, #8a6642 0%, #6d4126 100%);
  color: #fff;
  font-size: 12px;
  border-radius: 17px;
  padding: 0 15px;
  text-align: center;
}

.verify-btn.disabled {
  background: #ccc;
  color: #fff;
}

/* 选项区域 */
.options-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.agreement-container {
  display: flex;
  align-items: center;
}

.agreement-text {
  font-size: 12px;
  color: #666;
}

.agreement-link {
  font-size: 12px;
  color: #8a6642;
}

.forgot-password {
  text-align: right;
}

.forgot-password-link {
  font-size: 14px;
  color: #8a6642;
}

/* 提交按钮 */
.submit-section {
  margin-bottom: 25px;
}

.submit-button {
  height: 50px;
  background: linear-gradient(135deg, #8a6642 0%, #6d4126 100%);
  color: #fff;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(138, 102, 66, 0.3);
  border: none;
}

.submit-button:active {
  transform: scale(0.98);
}

.submit-button[disabled] {
  background: #ccc;
  box-shadow: none;
}

.submit-text {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
}

/* 切换模式 */
.switch-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}

.switch-text {
  font-size: 14px;
  color: #666;
}

.switch-action {
  font-size: 14px;
  color: #8a6642;
  font-weight: 500;
  margin-left: 5px;
}

/* 其他登录方式 */
.other-login {
  margin-top: auto;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.1);
}

.divider-text {
  padding: 0 15px;
  font-size: 12px;
  color: #999;
}

.social-buttons {
  display: flex;
  justify-content: center;
}

.social-button {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.wechat {
  background-color: #07C160;
}

.social-icon {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}
</style> 