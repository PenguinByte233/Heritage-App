<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="status-bar"></view>
      <view class="title-row">
        <view class="back-button" @tap="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="title">我的订单</text>
        <view style="width: 60rpx;"></view> <!-- 占位，保持标题居中 -->
      </view>
    </view>
    
    <!-- 订单状态标签 -->
    <view class="tab-container">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @tap="switchTab(tab.value)"
      >
        <text class="tab-text">{{ tab.name }}</text>
        <view class="tab-line" v-if="currentTab === tab.value"></view>
      </view>
    </view>
    
    <!-- 订单列表 -->
    <scroll-view 
      class="order-list"
      scroll-y
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 加载中 -->
      <view class="loading-container" v-if="isLoading && !refreshing">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 订单项 -->
      <view 
        v-for="(order, index) in orderList" 
        :key="index"
        class="order-item"
        @tap="viewOrderDetail(order.id)"
      >
        <!-- 订单头部 -->
        <view class="order-header">
          <text class="order-number">订单号: {{ order.order_number }}</text>
          <text class="order-status">{{ getStatusText(order.status) }}</text>
        </view>
        
        <!-- 订单商品 -->
        <view class="product-list">
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
        
        <!-- 订单底部 -->
        <view class="order-footer">
          <view class="order-total">
            <text class="total-text">共{{ getTotalQuantity(order.products) }}件商品 合计:</text>
            <text class="total-price">¥{{ order.total_amount }}</text>
          </view>
          
          <!-- 订单操作按钮 -->
          <view class="order-actions">
            <!-- 待付款 -->
            <view class="action-group" v-if="order.status === 0">
              <view class="action-btn cancel-btn" @tap.stop="cancelOrder(order.id)">取消订单</view>
              <view class="action-btn primary-btn" @tap.stop="payOrder(order.id)">立即付款</view>
            </view>
            
            <!-- 待发货 -->
            <view class="action-group" v-if="order.status === 1">
              <view class="action-btn" @tap.stop="contactSeller(order.id)">联系商家</view>
              <view class="action-btn primary-btn" @tap.stop="remindShipping(order.id)">提醒发货</view>
            </view>
            
            <!-- 待收货 -->
            <view class="action-group" v-if="order.status === 2">
              <view class="action-btn" @tap.stop="viewLogistics(order.id)">查看物流</view>
              <view class="action-btn primary-btn" @tap.stop="confirmReceive(order.id)">确认收货</view>
            </view>
            
            <!-- 已完成 -->
            <view class="action-group" v-if="order.status === 3">
              <view class="action-btn" @tap.stop="deleteOrder(order.id)">删除订单</view>
              <view class="action-btn primary-btn" @tap.stop="reviewOrder(order.id)" v-if="!order.is_reviewed">评价订单</view>
            </view>
            
            <!-- 已取消 -->
            <view class="action-group" v-if="order.status === 4">
              <view class="action-btn" @tap.stop="deleteOrder(order.id)">删除订单</view>
              <view class="action-btn primary-btn" @tap.stop="buyAgain(order.id)">再次购买</view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 无内容提示 -->
      <view class="empty-container" v-if="!isLoading && orderList.length === 0">
        <image class="empty-icon" src="/static/images/empty-order.png"></image>
        <text class="empty-text">暂无订单</text>
        <view class="go-shopping-btn" @tap="goShopping">去逛逛</view>
      </view>
      
      <!-- 加载更多 -->
      <view class="load-more" v-if="orderList.length > 0 && hasMore">
        <text class="load-more-text">正在加载更多...</text>
      </view>
      
      <view class="load-more" v-if="orderList.length > 0 && !hasMore">
        <text class="load-more-text">没有更多订单了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      tabs: [
        { name: '全部', value: 'all' },
        { name: '待付款', value: 'pending' },
        { name: '待发货', value: 'paid' },
        { name: '待收货', value: 'shipped' },
        { name: '已完成', value: 'completed' }
      ],
      currentTab: 'all',
      orderList: [],
      page: 1,
      pageSize: 10,
      hasMore: true,
      isLoading: false,
      refreshing: false,
      // 模拟订单数据
      mockOrders: [
        {
          id: '1001',
          order_number: 'O2023051001',
          status: 0, // 待付款
          total_amount: '299.00',
          created_at: '2023-05-10 14:30:00',
          products: [
            {
              id: '101',
              name: '竹编包包',
              price: '299.00',
              quantity: 1,
              image: '/uploads/assets/商品/卖竹编包包1.jpg'
            }
          ]
        },
        {
          id: '1002',
          order_number: 'O2023050901',
          status: 1, // 待发货
          total_amount: '598.00',
          created_at: '2023-05-09 10:15:00',
          payment_time: '2023-05-09 10:20:00',
          products: [
            {
              id: '102',
              name: '竹编灯罩',
              price: '299.00',
              quantity: 2,
              image: '/uploads/assets/商品/卖竹编灯罩1.jpg'
            }
          ]
        },
        {
          id: '1003',
          order_number: 'O2023050801',
          status: 2, // 待收货
          total_amount: '442.75',
          created_at: '2023-05-08 16:45:00',
          payment_time: '2023-05-08 16:50:00',
          shipping_time: '2023-05-09 09:30:00',
          logistics_company: '顺丰速运',
          logistics_number: 'SF1234567890',
          products: [
            {
              id: '103',
              name: '竹编包包',
              price: '442.75',
              quantity: 1,
              image: '/uploads/assets/商品/卖竹编包包2.jpg'
            }
          ]
        },
        {
          id: '1004',
          order_number: 'O2023050701',
          status: 3, // 已完成
          total_amount: '252.88',
          created_at: '2023-05-07 11:20:00',
          payment_time: '2023-05-07 11:25:00',
          shipping_time: '2023-05-07 14:30:00',
          completion_time: '2023-05-10 18:45:00',
          is_reviewed: false,
          products: [
            {
              id: '104',
              name: '竹编包包',
              price: '252.88',
              quantity: 1,
              image: '/uploads/assets/商品/卖竹编包包3.jpg'
            }
          ]
        },
        {
          id: '1005',
          order_number: 'O2023050601',
          status: 4, // 已取消
          total_amount: '356.23',
          created_at: '2023-05-06 09:10:00',
          products: [
            {
              id: '105',
              name: '竹编扇子',
              price: '356.23',
              quantity: 1,
              image: '/uploads/assets/商品/卖竹编扇子1.jpg'
            }
          ]
        }
      ]
    };
  },
  onLoad(options) {
    // 如果有状态参数，切换到对应标签
    if (options.status) {
      this.switchTab(options.status);
    } else {
      this.fetchOrders();
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    switchTab(tabValue) {
      this.currentTab = tabValue;
      this.page = 1;
      this.orderList = [];
      this.hasMore = true;
      this.fetchOrders();
    },
    fetchOrders() {
      if (this.isLoading || !this.hasMore) return;
      
      this.isLoading = true;
      
      // 模拟API请求
      setTimeout(() => {
        // 根据当前标签筛选订单
        let filteredOrders = this.mockOrders;
        
        if (this.currentTab !== 'all') {
          const statusMap = {
            'pending': 0,
            'paid': 1,
            'shipped': 2,
            'completed': 3,
            'cancelled': 4
          };
          
          filteredOrders = this.mockOrders.filter(order => order.status === statusMap[this.currentTab]);
        }
        
        // 分页
        const start = (this.page - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageOrders = filteredOrders.slice(start, end);
        
        // 更新订单列表
        this.orderList = [...this.orderList, ...pageOrders];
        
        // 判断是否还有更多数据
        this.hasMore = end < filteredOrders.length;
        
        this.isLoading = false;
        this.refreshing = false;
      }, 1000);
    },
    loadMore() {
      if (this.hasMore && !this.isLoading) {
        this.page++;
        this.fetchOrders();
      }
    },
    onRefresh() {
      this.refreshing = true;
      this.page = 1;
      this.orderList = [];
      this.hasMore = true;
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
    getTotalQuantity(products) {
      if (!products || !products.length) return 0;
      
      return products.reduce((sum, product) => {
        return sum + (product.quantity || 1);
      }, 0);
    },
    viewOrderDetail(orderId) {
      uni.navigateTo({
        url: `/pages/order/order-detail?id=${orderId}`
      });
    },
    cancelOrder(orderId) {
      uni.showModal({
        title: '取消订单',
        content: '确定要取消此订单吗？',
        success: (res) => {
          if (res.confirm) {
            // 模拟取消订单
            uni.showToast({
              title: '订单已取消',
              icon: 'success'
            });
            
            // 刷新订单列表
            this.onRefresh();
          }
        }
      });
    },
    payOrder(orderId) {
      // 模拟支付
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
    remindShipping(orderId) {
      uni.showToast({
        title: '已提醒商家发货',
        icon: 'success'
      });
    },
    viewLogistics(orderId) {
      // 查找订单
      const order = this.mockOrders.find(o => o.id === orderId);
      
      if (!order || !order.logistics_company || !order.logistics_number) {
        uni.showToast({
          title: '暂无物流信息',
          icon: 'none'
        });
        return;
      }
      
      uni.navigateTo({
        url: `/pages/order/logistics?number=${order.logistics_number}&company=${order.logistics_company}`
      });
    },
    confirmReceive(orderId) {
      uni.showModal({
        title: '确认收货',
        content: '确认已收到商品吗？确认后订单将完成',
        success: (res) => {
          if (res.confirm) {
            // 模拟确认收货
            uni.showToast({
              title: '确认收货成功',
              icon: 'success'
            });
            
            // 刷新订单列表
            this.onRefresh();
          }
        }
      });
    },
    reviewOrder(orderId) {
      uni.navigateTo({
        url: `/pages/order/review?id=${orderId}`
      });
    },
    deleteOrder(orderId) {
      uni.showModal({
        title: '删除订单',
        content: '确定要删除此订单吗？删除后无法恢复',
        success: (res) => {
          if (res.confirm) {
            // 模拟删除订单
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
            
            // 刷新订单列表
            this.onRefresh();
          }
        }
      });
    },
    buyAgain(orderId) {
      // 查找订单
      const order = this.mockOrders.find(o => o.id === orderId);
      
      if (!order || !order.products || order.products.length === 0) {
        return;
      }
      
      // 获取第一个商品ID，跳转到商品详情页
      const productId = order.products[0].id;
      uni.navigateTo({
        url: `/pages/buy/detail?id=${productId}`
      });
    },
    goShopping() {
      uni.switchTab({
        url: '/pages/buy/buy'
      });
    }
  }
};
</script>

<style>
.container {
  padding: 0;
  background-color: #f8f4e9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #f0e6d2;
  padding-top: 44px; /* 状态栏高度 */
  padding-bottom: 10rpx;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.title-row {
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 40rpx;
  color: #6d4126;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #6d4126;
  flex: 1;
  text-align: center;
}

.tab-container {
  display: flex;
  background-color: #f0e6d2;
  padding: 0 20rpx;
  position: fixed;
  top: calc(44px + 90rpx); /* 状态栏高度 + 标题行高度 */
  left: 0;
  right: 0;
  z-index: 99;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.03);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  position: relative;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
}

.tab-item.active .tab-text {
  color: #6d4126;
  font-weight: 600;
}

.tab-line {
  position: absolute;
  bottom: 0;
  width: 40rpx;
  height: 4rpx;
  background-color: #6d4126;
  border-radius: 2rpx;
}

.order-list {
  flex: 1;
  margin-top: calc(44px + 90rpx + 70rpx); /* 状态栏高度 + 标题行高度 + 标签栏高度 */
  padding: 20rpx;
}

.order-item {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  padding: 20rpx;
  border-bottom: 1px solid #f5f5f5;
}

.order-number {
  font-size: 26rpx;
  color: #666;
}

.order-status {
  font-size: 26rpx;
  color: #6d4126;
  font-weight: 600;
}

.product-list {
  padding: 0 20rpx;
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
  line-height: 1.4;
}

.product-price-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  padding: 20rpx;
  border-top: 1px solid #f5f5f5;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20rpx;
}

.total-text {
  font-size: 26rpx;
  color: #666;
  margin-right: 10rpx;
}

.total-price {
  font-size: 32rpx;
  color: #e74c3c;
  font-weight: 600;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
}

.action-group {
  display: flex;
}

.action-btn {
  margin-left: 20rpx;
  padding: 0 30rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
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

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
  opacity: 0.7;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.go-shopping-btn {
  padding: 0 40rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  background-color: #6d4126;
  color: #fff;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
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

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.load-more {
  text-align: center;
  padding: 20rpx 0;
}

.load-more-text {
  font-size: 24rpx;
  color: #999;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 