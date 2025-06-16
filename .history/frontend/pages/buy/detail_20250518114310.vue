<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="back-button" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">商品详情</text>
    </view>
    
    <!-- 商品信息 -->
    <view class="product-container" v-if="product">
      <!-- 商品图片 -->
      <image class="product-image" :src="product.image_url" mode="widthFix"></image>
      
      <!-- 商品信息 -->
      <view class="product-info">
        <text class="product-name">{{ product.name }}</text>
        <text class="product-price">¥{{ product.price }}</text>
        <text class="product-category">分类：{{ product.category }}</text>
      </view>
      
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
    
    <!-- 加载提示 -->
    <view class="loading-container" v-if="isLoading">
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 无内容提示 -->
    <view class="empty-container" v-if="!isLoading && !product">
      <text class="empty-text">商品不存在</text>
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
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo) {
        this.userId = userInfo.id;
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
  padding: 0;
  background-color: #f8f8f8;
  min-height: 100vh;
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

.product-container {
  background-color: #fff;
  margin-bottom: 20rpx;
}

.product-image {
  width: 100%;
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
}

.action-bar {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 8rpx;
}

.quantity-btn {
  width: 80rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 40rpx;
  color: #333;
}

.quantity-value {
  width: 80rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 30rpx;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
}

.buy-button {
  background-color: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 40rpx;
  padding: 0 60rpx;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 30rpx;
  font-weight: bold;
}

.loading-container, .empty-container {
  display: flex;
  justify-content: center;
  padding: 60rpx 0;
}

.loading-text, .empty-text {
  font-size: 28rpx;
  color: #999;
}
</style> 