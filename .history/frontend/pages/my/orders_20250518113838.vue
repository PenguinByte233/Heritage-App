<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">我的订单</text>
      <view class="placeholder"></view>
    </view>
    
    <!-- 加载提示 -->
    <view class="loading-container" v-if="isLoading">
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 订单列表 -->
    <view class="order-list" v-if="!isLoading && orders.length > 0">
      <view 
        v-for="(order, index) in orders" 
        :key="index"
        class="order-card"
        @tap="navigateToDetail(order)"
      >
        <view class="order-header">
          <text class="order-number">订单号: {{ order.order_number }}</text>
          <text class="order-status">{{ getStatusText(order.status) }}</text>
        </view>
        
        <view class="order-products">
          <view 
            v-for="(product, pIndex) in order.products" 
            :key="pIndex"
            class="product-item"
          >
            <image 
              class="product-image" 
              :src="product.image_url || '/static/images/default-product.png'"
              mode="aspectFill"
            ></image>
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <view class="product-meta">
                <text class="product-price">¥{{ product.price }}</text>
                <text class="product-quantity">x{{ product.quantity }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="order-footer">
          <text class="order-time">{{ formatTime(order.created_at) }}</text>
          <text class="order-total">合计: ¥{{ calculateTotal(order) }}</text>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view class="empty-container" v-if="!isLoading && orders.length === 0">
      <image class="empty-image" src="/static/images/empty-order.png"></image>
      <text class="empty-text">暂无订单记录</text>
      <view class="go-shop-btn" @tap="navigateToShop">去逛逛</view>
    </view>
  </view>
</template>

<script>
import { getUserOrders } from '@/api/api.js';

export default {
  data() {
    return {
      orders: [],
      isLoading: true
    };
  },
  onLoad() {
    this.fetchOrders();
  },
  onPullDownRefresh() {
    this.fetchOrders();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    async fetchOrders() {
      this.isLoading = true;
      try {
        const response = await getUserOrders();
        if (response.status === 'success' && response.data) {
          this.orders = response.data;
        } else {
          throw new Error('获取订单失败');
        }
      } catch (error) {
        console.error('获取订单列表失败:', error);
        uni.showToast({
          title: '获取订单失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
        uni.stopPullDownRefresh();
      }
    },
    navigateToDetail(order) {
      uni.navigateTo({
        url: `/pages/my/order-detail?id=${order.id}`
      });
    },
    navigateToShop() {
      uni.switchTab({
        url: '/pages/buy/buy'
      });
    },
    getStatusText(status) {
      const statusMap = {
        'pending': '待付款',
        'paid': '已付款',
        'shipped': '已发货',
        'completed': '已完成',
        'cancelled': '已取消'
      };
      return statusMap[status] || '未知状态';
    },
    calculateTotal(order) {
      if (!order.products || order.products.length === 0) {
        return '0.00';
      }
      
      const total = order.products.reduce((sum, product) => {
        return sum + (product.price * product.quantity);
      }, 0);
      
      return total.toFixed(2);
    },
    formatTime(timeStr) {
      if (!timeStr) return '';
      
      const date = new Date(timeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
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
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 40rpx;
  color: #333;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.placeholder {
  width: 60rpx;
}

.loading-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.go-shop-btn {
  padding: 15rpx 40rpx;
  background-color: #6d4126;
  color: #fff;
  font-size: 28rpx;
  border-radius: 30rpx;
}

.order-list {
  padding: 20rpx;
}

.order-card {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.order-number {
  font-size: 28rpx;
  color: #666;
}

.order-status {
  font-size: 28rpx;
  color: #6d4126;
  font-weight: bold;
}

.order-products {
  padding: 20rpx 30rpx;
}

.product-item {
  display: flex;
  margin-bottom: 20rpx;
}

.product-item:last-child {
  margin-bottom: 0;
}

.product-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.product-meta {
  display: flex;
  justify-content: space-between;
}

.product-price {
  font-size: 28rpx;
  color: #6d4126;
}

.product-quantity {
  font-size: 28rpx;
  color: #999;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f5f5f5;
  background-color: #fafafa;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-total {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}
</style> 