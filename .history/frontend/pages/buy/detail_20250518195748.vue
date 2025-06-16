<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <view class="header">
      <view class="status-bar"></view>
      <view class="title-row">
        <view class="back-button" @tap="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="title">商品详情</text>
        <view style="width: 60rpx;"></view> <!-- 占位，保持标题居中 -->
      </view>
    </view>
    
    <!-- 商品信息 -->
    <scroll-view scroll-y class="content-scroll">
      <view class="product-container" v-if="product">
        <!-- 商品图片 -->
        <image class="product-image" :src="product.image_url" mode="widthFix"></image>
        
        <!-- 商品信息 -->
        <view class="product-info">
          <text class="product-name">{{ product.name }}</text>
          <text class="product-price">¥{{ product.price }}</text>
          <text class="product-category">分类：{{ product.category }}</text>
          <view class="product-description" v-if="product.description">
            <text class="description-title">商品描述</text>
            <text class="description-content">{{ product.description }}</text>
          </view>
        </view>
      </view>
      
      <!-- 加载提示 -->
      <view class="loading-container" v-if="isLoading">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 无内容提示 -->
      <view class="empty-container" v-if="!isLoading && !product">
        <text class="empty-text">商品不存在</text>
      </view>
      
      <!-- 底部占位，确保内容不被购买栏遮挡 -->
      <view style="height: 140rpx;"></view>
    </scroll-view>
    
    <!-- 购买按钮 -->
    <view class="action-bar">
      <view class="quantity-control">
        <text class="quantity-btn" @tap="decreaseQuantity">-</text>
        <text class="quantity-value">{{ quantity }}</text>
        <text class="quantity-btn" @tap="increaseQuantity">+</text>
      </view>
      <button class="buy-button" @tap="buyProduct">立即购买</button>
    </view>
  </view>
</template>

<script>
import { getProductDetail, createOrder } from '@/api/api.js';

export default {
  data() {
    return {
      id: null,
      product: null,
      quantity: 1,
      isLoading: false,
      userId: null
    };
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id;
      this.fetchProductDetail();
    }
    
    // 获取用户ID，这里应该从本地存储中获取
    try {
      const userInfoStr = uni.getStorageSync('userInfo');
      if (userInfoStr) {
        // 确保正确解析JSON字符串
        try {
          const userInfo = JSON.parse(userInfoStr);
          this.userId = userInfo.id;
        } catch (e) {
          // 如果不是JSON字符串，可能是直接存储的对象
          const userInfo = userInfoStr;
          this.userId = userInfo.id;
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  },
  methods: {
    async fetchProductDetail() {
      this.isLoading = true;
      try {
        const response = await getProductDetail(this.id);
        if (response.status === 'success' && response.data) {
          this.product = response.data;
        } else {
          uni.showToast({
            title: '获取商品详情失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取商品详情失败:', error);
        uni.showToast({
          title: '获取商品详情失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    increaseQuantity() {
      this.quantity++;
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    async buyProduct() {
      if (!this.userId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        
        // 跳转到登录页面
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/profile/profile'
          });
        }, 1500);
        return;
      }
      
      if (!this.product) {
        uni.showToast({
          title: '商品信息不完整',
          icon: 'none'
        });
        return;
      }
      
      try {
        const response = await createOrder(this.userId, this.product.id, this.quantity);
        if (response.status === 'success') {
          uni.showToast({
            title: '购买成功',
            icon: 'success'
          });
          
          // 跳转到订单页面或返回上一页
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          uni.showToast({
            title: response.message || '购买失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('购买商品失败:', error);
        uni.showToast({
          title: '购买失败，请稍后再试',
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
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f4e9;
  position: relative;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #f0e6d2;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.status-bar {
  height: 44px; /* 适配iPhone状态栏高度 */
  width: 100%;
}

.title-row {
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  border-bottom: 1px solid #e5d9c1;
}

.back-button {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

.back-icon {
  font-size: 40rpx;
  color: #6d4126;
  font-weight: bold;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  color: #6d4126;
}

.content-scroll {
  flex: 1;
  height: calc(100vh - 134px); /* 44px状态栏 + 90rpx标题行 */
  margin-top: 134px; /* 44px状态栏 + 90rpx标题行 */
  box-sizing: border-box;
}

.product-container {
  background-color: #fff;
  margin-bottom: 20rpx;
}

.product-image {
  width: 100%;
  border-radius: 0;
}

.product-info {
  padding: 30rpx;
}

.product-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.product-price {
  font-size: 40rpx;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 20rpx;
}

.product-category {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 30rpx;
}

.product-description {
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1px solid #f0e6d2;
}

.description-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.description-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-top: 1px solid #f0e6d2;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 99;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 8rpx;
  background-color: #f8f8f8;
}

.quantity-btn {
  width: 70rpx;
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  font-size: 36rpx;
  color: #333;
}

.quantity-value {
  width: 80rpx;
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  font-size: 30rpx;
  color: #333;
  background-color: #fff;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
}

.buy-button {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  margin-left: 30rpx;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 40rpx;
  text-align: center;
  box-shadow: 0 4rpx 10rpx rgba(231, 76, 60, 0.3);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f0e6d2;
  border-top-color: #6d4126;
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: 20rpx;
}

.loading-text, .empty-text {
  font-size: 28rpx;
  color: #999;
}

.empty-container {
  padding: 100rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 