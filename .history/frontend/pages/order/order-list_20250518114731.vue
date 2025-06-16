<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="back-button" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">我的订单</text>
    </view>
    
    <!-- 订单状态切换 -->
    <view class="tab-container">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-item"
        :class="{'active': currentTab === index}"
        @tap="switchTab(index)"
      >
        <text class="tab-text">{{ tab }}</text>
      </view>
    </view>
    
    <!-- 订单列表 -->
    <view class="order-list" v-if="!isLoading && orderList.length > 0">
      <view 
        v-for="(order, index) in orderList" 
        :key="index"
        class="order-item"
        @tap="navigateToDetail(order.id)"
      >
        <!-- 订单头部：订单号和状态 -->
        <view class="order-header">
          <text class="order-number">订单号：{{ order.order_number }}</text>
          <text class="order-status" :class="'status-' + order.status">{{ getStatusText(order.status) }}</text>
        </view>
        
        <!-- 订单商品 -->
        <view class="order-products">
          <view 
            v-for="(product, pIndex) in order.products" 
            :key="pIndex"
            class="product-item"
          >
            <image class="product-image" :src="product.image" mode="aspectFill"></image>
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <view class="product-price-count">
                <text class="product-price">¥{{ product.price }}</text>
                <text class="product-count">x{{ product.quantity }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 订单底部：总价和操作按钮 -->
        <view class="order-footer">
          <view class="order-total">
            <text>共{{ getTotalCount(order.products) }}件商品</text>
            <text>合计：<text class="total-price">¥{{ getTotalPrice(order.products) }}</text></text>
          </view>
          
          <view class="order-actions">
            <!-- 待付款状态 -->
            <view class="action-btn pay-btn" v-if="order.status === 0" @tap.stop="payOrder(order.id)">
              立即付款
            </view>
            
            <!-- 待发货状态 -->
            <view class="action-btn remind-btn" v-if="order.status === 1" @tap.stop="remindShipping(order.id)">
              提醒发货
            </view>
            
            <!-- 待收货状态 -->
            <view class="action-btn confirm-btn" v-if="order.status === 2" @tap.stop="confirmReceive(order.id)">
              确认收货
            </view>
            
            <!-- 已完成状态 -->
            <view class="action-btn review-btn" v-if="order.status === 3" @tap.stop="reviewOrder(order.id)">
              评价订单
            </view>
            
            <!-- 所有状态都可以取消订单（已完成除外） -->
            <view class="action-btn cancel-btn" v-if="order.status !== 3" @tap.stop="cancelOrder(order.id)">
              取消订单
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 加载中 -->
    <view class="loading-container" v-if="isLoading">
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 无订单提示 -->
    <view class="empty-container" v-if="!isLoading && orderList.length === 0">
      <image class="empty-image" src="/static/images/empty-order.png" mode="aspectFit"></image>
      <text class="empty-text">暂无相关订单</text>
      <view class="action-btn go-shop-btn" @tap="navigateToShop">
        去逛逛
      </view>
    </view>
  </view>
</template>

<script>
import { getUserOrders } from '@/api/api.js';

export default {
  data() {
    return {
      isLoading: true,
      orderList: [],
      tabs: ['全部', '待付款', '待发货', '待收货', '已完成'],
      currentTab: 0,
      userId: 1 // 默认用户ID，实际应从登录状态获取
    };
  },
  onLoad(options) {
    if (options.status) {
      this.currentTab = parseInt(options.status);
    }
    
    this.getUserInfo();
    this.fetchOrders();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    getUserInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo');
        if (userInfo) {
          const parsedInfo = JSON.parse(userInfo);
          this.userId = parsedInfo.id || 1;
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    },
    async fetchOrders() {
      this.isLoading = true;
      
      try {
        const status = this.currentTab === 0 ? null : this.currentTab - 1;
        const response = await getUserOrders(this.userId, status);
        
        if (response.status === 'success') {
          this.orderList = response.data || [];
        } else {
          uni.showToast({
            title: '获取订单列表失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取订单列表失败:', error);
        uni.showToast({
          title: '获取订单列表失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    switchTab(index) {
      if (this.currentTab === index) return;
      
      this.currentTab = index;
      this.fetchOrders();
    },
    getStatusText(status) {
      const statusMap = {
        0: '待付款',
        1: '待发货',
        2: '待收货',
        3: '已完成',
        4: '已取消'
      };
      
      return statusMap[status] || '未知状态';
    },
    getTotalCount(products) {
      return products.reduce((total, product) => total + (product.quantity || 0), 0);
    },
    getTotalPrice(products) {
      const total = products.reduce((total, product) => {
        return total + (product.price * (product.quantity || 1));
      }, 0);
      
      return total.toFixed(2);
    },
    navigateToDetail(orderId) {
      uni.navigateTo({
        url: `/pages/order/order-detail?id=${orderId}`
      });
    },
    navigateToShop() {
      uni.switchTab({
        url: '/pages/buy/buy'
      });
    },
    payOrder(orderId) {
      uni.showModal({
        title: '提示',
        content: '确定要支付此订单吗？',
        success: (res) => {
          if (res.confirm) {
            // TODO: 调用支付API
            uni.showToast({
              title: '支付功能开发中',
              icon: 'none'
            });
          }
        }
      });
    },
    remindShipping(orderId) {
      uni.showToast({
        title: '已提醒商家发货',
        icon: 'success'
      });
    },
    confirmReceive(orderId) {
      uni.showModal({
        title: '提示',
        content: '确认已收到商品吗？',
        success: (res) => {
          if (res.confirm) {
            // TODO: 调用确认收货API
            uni.showToast({
              title: '确认收货成功',
              icon: 'success'
            });
            
            // 刷新订单列表
            this.fetchOrders();
          }
        }
      });
    },
    reviewOrder(orderId) {
      uni.navigateTo({
        url: `/pages/order/review?id=${orderId}`
      });
    },
    cancelOrder(orderId) {
      uni.showModal({
        title: '提示',
        content: '确定要取消此订单吗？',
        success: (res) => {
          if (res.confirm) {
            // TODO: 调用取消订单API
            uni.showToast({
              title: '订单取消成功',
              icon: 'success'
            });
            
            // 刷新订单列表
            this.fetchOrders();
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

.tab-container {
  display: flex;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.tab-item {
  flex: 1;
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
}

.tab-item.active .tab-text {
  color: #6d4126;
  font-weight: bold;
}

.tab-item.active:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background-color: #6d4126;
}

.order-list {
  padding: 20rpx;
}

.order-item {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #f5f5f5;
}

.order-number {
  font-size: 26rpx;
  color: #666;
}

.order-status {
  font-size: 26rpx;
  font-weight: bold;
}

.status-0 {
  color: #ff9800;
}

.status-1 {
  color: #2196f3;
}

.status-2 {
  color: #4caf50;
}

.status-3 {
  color: #9e9e9e;
}

.status-4 {
  color: #f44336;
}

.order-products {
  margin-bottom: 20rpx;
}

.product-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.product-item:last-child {
  border-bottom: none;
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

.product-price-count {
  display: flex;
  justify-content: space-between;
}

.product-price {
  font-size: 28rpx;
  color: #e74c3c;
}

.product-count {
  font-size: 26rpx;
  color: #999;
}

.order-footer {
  border-top: 1px solid #f5f5f5;
  padding-top: 20rpx;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.order-total text {
  margin-left: 20rpx;
}

.total-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #e74c3c;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  padding: 10rpx 30rpx;
  font-size: 26rpx;
  border-radius: 30rpx;
  margin-left: 20rpx;
  border: 1px solid #ddd;
}

.pay-btn {
  background-color: #e74c3c;
  color: #fff;
  border: none;
}

.remind-btn, .review-btn {
  background-color: #fff;
  color: #6d4126;
  border-color: #6d4126;
}

.confirm-btn {
  background-color: #6d4126;
  color: #fff;
  border: none;
}

.cancel-btn {
  background-color: #fff;
  color: #999;
}

.go-shop-btn {
  background-color: #6d4126;
  color: #fff;
  border: none;
  width: 200rpx;
  text-align: center;
  margin-top: 30rpx;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 60rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
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
</style> 