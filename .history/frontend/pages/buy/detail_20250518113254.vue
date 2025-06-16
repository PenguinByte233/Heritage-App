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
      <image class="product-image" :src="product.image_url" mode="aspectFill"></image>
      
      <!-- 商品信息 -->
      <view class="product-info">
        <text class="product-name">{{ product.name }}</text>
        <text class="product-price">¥{{ product.price }}</text>
        <text class="product-category">分类：{{ product.category }}</text>
      </view>
      
      <!-- 购买数量 -->
      <view class="quantity-container">
        <text class="quantity-label">购买数量</text>
        <view class="quantity-control">
          <view class="quantity-btn" @tap="decreaseQuantity">-</view>
          <text class="quantity-value">{{ quantity }}</text>
          <view class="quantity-btn" @tap="increaseQuantity">+</view>
        </view>
      </view>
      
      <!-- 购买按钮 -->
      <view class="buy-btn" @tap="buyNow">立即购买</view>
    </view>
    
    <!-- 加载提示 -->
    <view class="loading-container" v-if="isLoading">
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 无内容提示 -->
    <view class="empty-container" v-if="!isLoading && !product">
      <text class="empty-text">商品信息不存在</text>
    </view>
  </view>
</template>

<script>
import { getProductDetail, createOrder } from '@/api/api.js';

export default {
  data() {
    return {
      productId: null,
      product: null,
      quantity: 1,
      isLoading: false,
      userId: null // 用户ID，实际应用中应从登录状态获取
    };
  },
  onLoad(options) {
    if (options.id) {
      this.productId = options.id;
      this.fetchProductDetail();
    }
    
    // 从本地存储获取用户ID
    try {
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo) {
        this.userId = JSON.parse(userInfo).id;
      }
    } catch (e) {
      console.error('获取用户信息失败:', e);
    }
  },
  methods: {
    async fetchProductDetail() {
      this.isLoading = true;
      try {
        const response = await getProductDetail(this.productId);
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
    async buyNow() {
      if (!this.userId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/profile/login'
          });
        }, 1500);
        return;
      }
      
      try {
        const response = await createOrder(this.userId, this.productId, this.quantity);
        if (response.status === 'success') {
          uni.showToast({
            title: '下单成功',
            icon: 'success'
          });
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/profile/orders'
            });
          }, 1500);
        } else {
          uni.showToast({
            title: '下单失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('下单失败:', error);
        uni.showToast({
          title: '下单失败',
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
  height: 600rpx;
}

.product-info {
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
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

.quantity-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.quantity-label {
  font-size: 32rpx;
  color: #333;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.quantity-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 50%;
  font-size: 36rpx;
  color: #333;
}

.quantity-value {
  width: 80rpx;
  text-align: center;
  font-size: 32rpx;
  color: #333;
}

.buy-btn {
  margin: 40rpx 30rpx;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  background-color: #6d4126;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 45rpx;
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