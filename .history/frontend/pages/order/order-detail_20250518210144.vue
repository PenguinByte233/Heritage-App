<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="back-button" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">订单详情</text>
    </view>
    
    <!-- 订单状态 -->
    <view class="status-container" v-if="order">
      <view class="status-header">
        <text class="status-text">{{ getStatusText(order.status) }}</text>
        <text class="status-desc">{{ getStatusDesc(order.status) }}</text>
      </view>
      
      <!-- 状态进度条 -->
      <view class="progress-bar">
        <view 
          v-for="(step, index) in statusSteps" 
          :key="index"
          class="progress-step"
          :class="{'active': order.status >= index, 'current': order.status === index}"
        >
          <view class="step-icon"></view>
          <view class="step-line" v-if="index < statusSteps.length - 1"></view>
          <text class="step-text">{{ step }}</text>
        </view>
      </view>
    </view>
    
    <!-- 收货地址 -->
    <view class="section" v-if="order && order.address">
      <view class="section-header">
        <text class="section-title">收货信息</text>
      </view>
      <view class="address-info">
        <text class="address-name">{{ order.address.recipient_name }}</text>
        <text class="address-phone">{{ order.address.recipient_phone }}</text>
        <text class="address-detail">{{ order.address.province + order.address.city + order.address.district + order.address.detail_address }}</text>
      </view>
    </view>
    
    <!-- 订单商品 -->
    <view class="section" v-if="order">
      <view class="section-header">
        <text class="section-title">商品信息</text>
      </view>
      <view class="product-list">
        <view 
          v-for="(product, index) in order.products" 
          :key="index"
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
    </view>
    
    <!-- 订单信息 -->
    <view class="section" v-if="order">
      <view class="section-header">
        <text class="section-title">订单信息</text>
      </view>
      <view class="order-info">
        <view class="info-item">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{ order.order_number }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">创建时间</text>
          <text class="info-value">{{ formatDate(order.created_at) }}</text>
        </view>
        <view class="info-item" v-if="order.payment_time">
          <text class="info-label">支付时间</text>
          <text class="info-value">{{ formatDate(order.payment_time) }}</text>
        </view>
        <view class="info-item" v-if="order.shipping_time">
          <text class="info-label">发货时间</text>
          <text class="info-value">{{ formatDate(order.shipping_time) }}</text>
        </view>
        <view class="info-item" v-if="order.completion_time">
          <text class="info-label">完成时间</text>
          <text class="info-value">{{ formatDate(order.completion_time) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">支付方式</text>
          <text class="info-value">{{ getPaymentMethod(order.payment_method) }}</text>
        </view>
        <view class="info-item" v-if="order.logistics_company && order.logistics_number">
          <text class="info-label">物流信息</text>
          <view class="logistics-value">
            <text class="info-value">{{ order.logistics_company }} {{ order.logistics_number }}</text>
            <text class="copy-btn" @tap="copyLogistics(order.logistics_number)">复制</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 金额信息 -->
    <view class="section" v-if="order">
      <view class="section-header">
        <text class="section-title">金额明细</text>
      </view>
      <view class="price-info">
        <view class="price-item">
          <text class="price-label">商品总价</text>
          <text class="price-value">¥{{ calculateTotalPrice(order.products) }}</text>
        </view>
        <view class="price-item">
          <text class="price-label">运费</text>
          <text class="price-value">¥{{ order.shipping_fee || '0.00' }}</text>
        </view>
        <view class="price-item" v-if="order.discount">
          <text class="price-label">优惠金额</text>
          <text class="price-value discount">-¥{{ order.discount }}</text>
        </view>
        <view class="price-divider"></view>
        <view class="price-item total">
          <text class="price-label">实付金额</text>
          <text class="price-value total">¥{{ order.total_amount }}</text>
        </view>
      </view>
    </view>
    
    <!-- 底部操作按钮 -->
    <view class="bottom-actions" v-if="order">
      <!-- 待付款 -->
      <view class="action-group" v-if="order.status === 0">
        <view class="action-btn cancel-btn" @tap="cancelOrder">取消订单</view>
        <view class="action-btn primary-btn" @tap="payOrder">立即付款</view>
      </view>
      
      <!-- 待发货 -->
      <view class="action-group" v-if="order.status === 1">
        <view class="action-btn" @tap="contactSeller">联系商家</view>
        <view class="action-btn primary-btn" @tap="remindShipping">提醒发货</view>
      </view>
      
      <!-- 待收货 -->
      <view class="action-group" v-if="order.status === 2">
        <view class="action-btn" @tap="viewLogistics">查看物流</view>
        <view class="action-btn primary-btn" @tap="confirmReceive">确认收货</view>
      </view>
      
      <!-- 已完成 -->
      <view class="action-group" v-if="order.status === 3">
        <view class="action-btn" @tap="deleteOrder">删除订单</view>
        <view class="action-btn" @tap="viewLogistics">查看物流</view>
        <view class="action-btn primary-btn" @tap="reviewOrder" v-if="!order.is_reviewed">评价订单</view>
        <view class="action-btn" @tap="buyAgain">再次购买</view>
      </view>
      
      <!-- 已取消 -->
      <view class="action-group" v-if="order.status === 4">
        <view class="action-btn" @tap="deleteOrder">删除订单</view>
        <view class="action-btn primary-btn" @tap="buyAgain">再次购买</view>
      </view>
    </view>
    
    <!-- 加载中 -->
    <view class="loading-container" v-if="isLoading">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { getOrderDetail } from '@/api/api.js';

export default {
  data() {
    return {
      orderId: null,
      order: null,
      isLoading: true,
      statusSteps: ['待付款', '待发货', '待收货', '已完成']
    };
  },
  onLoad(options) {
    if (options.id) {
      this.orderId = options.id;
      this.fetchOrderDetail();
    } else {
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    async fetchOrderDetail() {
      this.isLoading = true;
      
      try {
        const response = await getOrderDetail(this.orderId);
        
        if (response.status === 'success' && response.data) {
          this.order = response.data;
        } else {
          uni.showToast({
            title: '获取订单详情失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取订单详情失败:', error);
        uni.showToast({
          title: '获取订单详情失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
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
    getStatusDesc(status) {
      const descMap = {
        0: '请在24小时内完成支付，超时订单将自动取消',
        1: '商家正在备货中，请耐心等待',
        2: '商品已发出，请注意查收',
        3: '订单已完成，感谢您的购买',
        4: '订单已取消'
      };
      
      return descMap[status] || '';
    },
    getPaymentMethod(method) {
      const methodMap = {
        'wechat': '微信支付',
        'alipay': '支付宝',
        'bank': '银行卡',
        'cod': '货到付款'
      };
      
      return methodMap[method] || '未知支付方式';
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      
      return `${year}-${month}-${day} ${hour}:${minute}`;
    },
    calculateTotalPrice(products) {
      if (!products || !products.length) return '0.00';
      
      const total = products.reduce((sum, product) => {
        return sum + (product.price * (product.quantity || 1));
      }, 0);
      
      return total.toFixed(2);
    },
    copyLogistics(number) {
      uni.setClipboardData({
        data: number,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          });
        }
      });
    },
    cancelOrder() {
      uni.showModal({
        title: '取消订单',
        content: '确定要取消此订单吗？',
        success: (res) => {
          if (res.confirm) {
            // TODO: 调用取消订单API
            uni.showToast({
              title: '订单已取消',
              icon: 'success'
            });
            
            // 刷新订单详情
            setTimeout(() => {
              this.fetchOrderDetail();
            }, 1500);
          }
        }
      });
    },
    payOrder() {
      // TODO: 调用支付API
      uni.showToast({
        title: '支付功能开发中',
        icon: 'none'
      });
    },
    contactSeller() {
      uni.showModal({
        title: '联系商家',
        content: '商家电话: 400-123-4567\n服务时间: 9:00-18:00',
        showCancel: false,
        confirmText: '知道了'
      });
    },
    remindShipping() {
      uni.showToast({
        title: '已提醒商家发货',
        icon: 'success'
      });
    },
    viewLogistics() {
      if (!this.order.logistics_company || !this.order.logistics_number) {
        uni.showToast({
          title: '暂无物流信息',
          icon: 'none'
        });
        return;
      }
      
      uni.navigateTo({
        url: `/pages/order/logistics?number=${this.order.logistics_number}&company=${this.order.logistics_company}`
      });
    },
    confirmReceive() {
      uni.showModal({
        title: '确认收货',
        content: '确认已收到商品吗？确认后订单将完成',
        success: (res) => {
          if (res.confirm) {
            // TODO: 调用确认收货API
            uni.showToast({
              title: '确认收货成功',
              icon: 'success'
            });
            
            // 刷新订单详情
            setTimeout(() => {
              this.fetchOrderDetail();
            }, 1500);
          }
        }
      });
    },
    reviewOrder() {
      uni.navigateTo({
        url: `/pages/order/review?id=${this.orderId}`
      });
    },
    buyAgain() {
      if (!this.order || !this.order.products || this.order.products.length === 0) {
        return;
      }
      
      // 获取第一个商品ID，跳转到商品详情页
      const productId = this.order.products[0].id;
      uni.navigateTo({
        url: `/pages/buy/detail?id=${productId}`
      });
    },
    deleteOrder() {
      uni.showModal({
        title: '删除订单',
        content: '确定要删除此订单吗？删除后无法恢复',
        success: (res) => {
          if (res.confirm) {
            // TODO: 调用删除订单API
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
            
            // 返回订单列表页
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
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
  padding-bottom: 120rpx;
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

.status-container {
  background-color: #6d4126;
  padding: 40rpx 30rpx;
  color: #fff;
}

.status-header {
  margin-bottom: 30rpx;
}

.status-text {
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.status-desc {
  font-size: 26rpx;
  opacity: 0.8;
}

.progress-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step-icon {
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background-color: #fff;
  opacity: 0.4;
  margin-bottom: 15rpx;
  z-index: 1;
}

.step-line {
  position: absolute;
  top: 15rpx;
  left: 50%;
  width: 100%;
  height: 2rpx;
  background-color: #fff;
  opacity: 0.4;
  z-index: 0;
}

.step-text {
  font-size: 24rpx;
  opacity: 0.8;
}

.progress-step.active .step-icon,
.progress-step.active .step-line {
  opacity: 1;
}

.progress-step.current .step-icon {
  width: 40rpx;
  height: 40rpx;
  margin-top: -5rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.8);
}

.progress-step.current .step-text {
  opacity: 1;
  font-weight: bold;
}

.section {
  margin-top: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.section-header {
  padding: 30rpx;
  border-bottom: 1px solid #f5f5f5;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.address-info {
  padding: 30rpx;
}

.address-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-right: 20rpx;
}

.address-phone {
  font-size: 28rpx;
  color: #666;
}

.address-detail {
  font-size: 28rpx;
  color: #333;
  margin-top: 10rpx;
  line-height: 1.5;
  display: block;
}

.product-list {
  padding: 0 30rpx;
}

.product-item {
  display: flex;
  padding: 30rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 160rpx;
  height: 160rpx;
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
  line-height: 1.5;
}

.product-price-count {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.product-price {
  font-size: 32rpx;
  color: #e74c3c;
  font-weight: bold;
}

.product-count {
  font-size: 26rpx;
  color: #999;
}

.order-info {
  padding: 10rpx 30rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  font-size: 28rpx;
  border-bottom: 1px solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #666;
}

.info-value {
  color: #333;
}

.logistics-value {
  display: flex;
  align-items: center;
}

.copy-btn {
  margin-left: 20rpx;
  color: #6d4126;
}

.price-info {
  padding: 10rpx 30rpx;
}

.price-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  font-size: 28rpx;
}

.price-label {
  color: #666;
}

.price-value {
  color: #333;
}

.price-value.discount {
  color: #e74c3c;
}

.price-divider {
  height: 1px;
  background-color: #f5f5f5;
  margin: 10rpx 0;
}

.price-item.total {
  font-weight: bold;
}

.price-value.total {
  color: #e74c3c;
  font-size: 36rpx;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: flex-end;
}

.action-group {
  display: flex;
}

.action-btn {
  margin-left: 20rpx;
  padding: 0 30rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: 1px solid #ddd;
  color: #666;
  background-color: #fff;
}

.action-btn.primary-btn {
  background-color: #6d4126;
  color: #fff;
  border: none;
}

.action-btn.cancel-btn {
  color: #999;
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
</style> 