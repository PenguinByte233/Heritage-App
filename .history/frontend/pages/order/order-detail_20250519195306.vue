<template>
  <view class="container">
    <view class="header">
      <view class="status-bar"></view>
      <view class="title-row">
        <view class="back-button" @tap="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="title">订单详情</text>
        <view style="width: 60rpx;"></view>
      </view>
    </view>
    
    <view class="loading-container" v-if="isLoading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <swiper 
      v-if="!isLoading && allOrders.length > 0"
      class="order-swiper"
      :current="currentOrderIndex"
      @change="handleOrderChange"
      vertical
      :style="{ height: 'calc(100vh - 44px - 90rpx)' }"
    >
      <swiper-item v-for="(orderItem, index) in allOrders" :key="orderItem.id" class="swiper-item-container">
        <scroll-view class="content" scroll-y>
          <view class="status-section">
            <view class="status-icon">
              <text class="status-icon-text">{{ getStatusIconText(orderItem.status) }}</text>
            </view>
            <view class="status-info">
              <text class="status-text">{{ getStatusText(orderItem.status) }}</text>
              <text class="status-desc">{{ getStatusDesc(orderItem.status) }}</text>
            </view>
          </view>
          
          <view class="card products-card">
            <view class="card-header">
              <text class="card-title">商品信息</text>
            </view>
            <view class="product-list">
              <view 
                v-for="(product, pIndex) in orderItem.products" 
                :key="pIndex"
                class="product-item"
                @tap="viewProduct(product.id)"
              >
                <view class="product-image-container">
                  <image class="product-image" :src="product.image" mode="aspectFill"></image>
                </view>
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
          
          <view class="card amount-card">
            <view class="card-header">
              <text class="card-title">金额明细</text>
            </view>
            <view class="amount-info">
              <view class="amount-item">
                <text class="label">商品金额</text>
                <text class="value">¥{{ getProductsTotal(orderItem.products) }}</text>
              </view>
              <view class="amount-item total">
                <text class="label">实付款</text>
                <text class="value">¥{{ orderItem.total_amount }}</text>
              </view>
            </view>
          </view>
          
          <view class="footer-actions">
            <view class="action-group">
              <view class="action-btn" @tap="goBack">返回</view>
              <view class="action-btn primary-btn" @tap="viewProduct(orderItem.products[0]?.id)">查看商品</view>
            </view>
            
            <!-- 滑动提示 -->
            <view class="swipe-hint" v-if="allOrders.length > 1">
              <text class="hint-text">{{ getSwipeHintText(index) }}</text>
            </view>
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>
    
    <view class="empty-container" v-if="!isLoading && allOrders.length === 0">
      <image class="empty-icon" src="/static/images/empty-order.png"></image>
      <text class="empty-text">暂无订单信息</text>
      <view class="go-back-btn" @tap="goBack">返回</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLoading: true,
      orderId: '',
      order: null,
      allOrders: [], // 存储所有订单
      currentOrderIndex: 0, // 当前显示的订单索引
      apiBaseUrl: 'http://localhost:3001/api'
    };
  },
  onLoad(options) {
    console.log('订单详情页面加载, 参数:', options);
    if (options.id) {
      this.orderId = options.id;
      console.log('设置订单ID:', this.orderId);
    } else {
      console.warn('未提供订单ID参数');
    }
    this.fetchOrderDetail();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    fetchOrderDetail() {
      this.isLoading = true;
      
      // 直接使用固定的API地址获取订单数据
      uni.request({
        url: `${this.apiBaseUrl}/orders/user/1`,
        method: 'GET',
        success: (res) => {
          console.log('API返回数据:', res.data);
          
          if (res.data && res.data.status === 'success') {
            // 处理API返回的订单数据
            const orderList = res.data.data;
            
            console.log('所有订单列表:', orderList.map(o => ({id: o.id, product: o.product_name})));
            console.log('订单数量:', orderList.length);
            
            if (orderList && orderList.length > 0) {
              // 格式化所有订单数据
              this.allOrders = orderList.map(order => this.formatOrderData(order));
              
              // 如果有指定的订单ID，则显示该订单
              if (this.orderId) {
                const targetIndex = this.allOrders.findIndex(order => order.id.toString() === this.orderId);
                if (targetIndex !== -1) {
                  this.currentOrderIndex = targetIndex;
                  console.log('显示指定订单索引:', this.currentOrderIndex);
                } else {
                  console.warn('未找到指定ID的订单，显示第一个订单');
                }
              }
              
              // 设置当前订单对象（兼容旧代码）
              this.order = this.allOrders[this.currentOrderIndex];
              console.log('当前显示订单:', this.order);
            } else {
              // 没有订单数据
              this.allOrders = [];
              this.order = null;
              uni.showToast({
                title: '暂无订单数据',
                icon: 'none'
              });
            }
          } else {
            // 处理API错误
            console.error('API返回错误:', res.data);
            uni.showToast({
              title: res.data?.message || '获取订单详情失败',
              icon: 'none'
            });
            
            // 如果API调用失败，可以使用模拟数据作为备选
            this.useFallbackData();
          }
        },
        fail: (err) => {
          console.error('获取订单详情失败:', err);
          uni.showToast({
            title: '获取订单详情失败，请检查网络',
            icon: 'none'
          });
          
          // 如果API调用失败，可以使用模拟数据作为备选
          this.useFallbackData();
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    },
    
    // 处理滑动切换订单
    handleOrderChange(e) {
      const index = e.detail.current;
      console.log('滑动切换至订单索引:', index);
      
      // 更新当前订单索引和订单对象
      this.currentOrderIndex = index;
      this.order = this.allOrders[index];
      
      // 更新URL中的订单ID（可选，有些小程序环境可能不支持）
      this.orderId = this.order.id.toString();
      
      // 显示切换提示
      uni.showToast({
        title: `订单 ${this.order.id}`,
        icon: 'none',
        duration: 1000
      });
    },
    
    // 获取滑动提示文本
    getSwipeHintText(index) {
      if (this.allOrders.length <= 1) return '';
      
      if (index === 0) {
        return '向上滑动查看下一订单';
      } else if (index === this.allOrders.length - 1) {
        return '向下滑动查看上一订单';
      } else {
        return '上下滑动切换订单';
      }
    },
    
    // 格式化订单数据
    formatOrderData(orderData) {
      if (!orderData) return null;
      
      // 处理图片路径
      let productImage = orderData.product_image;
      if (productImage && productImage.startsWith('/uploads/')) {
        productImage = `${this.apiBaseUrl.replace('/api', '')}${productImage}`;
      }
      
      return {
        id: orderData.id,
        order_number: orderData.order_number || `ORD${orderData.id}`,
        status: orderData.status || 1, // 如果没有状态，默认为待发货状态（已支付）
        total_amount: orderData.total_price || '0.00',
        created_at: orderData.created_at,
        payment_time: orderData.payment_time || new Date().toLocaleString(),
        // 处理商品数据
        products: Array.isArray(orderData.products) ? orderData.products.map(p => {
          // 处理产品数组中的每个图片
          let image = p.image;
          if (image && image.startsWith('/uploads/')) {
            image = `${this.apiBaseUrl.replace('/api', '')}${image}`;
          }
          return {...p, image};
        }) : [
          {
            id: orderData.product_id,
            name: orderData.product_name,
            price: orderData.product_price,
            quantity: orderData.quantity,
            image: productImage
          }
        ]
      };
    },
    // 使用模拟数据作为备选
    useFallbackData() {
      // 模拟订单数据
      const mockOrders = [
        {
          id: '1001',
          order_number: 'O2023051001',
          status: 1, // 待发货（已支付）
          total_amount: '299.00',
          created_at: '2023-05-10 14:30:00',
          payment_time: '2023-05-10 14:35:00',
          products: [
            {
              id: '101',
              name: '竹编包包',
              price: '299.00',
              quantity: 1,
              image: '/uploads/assets/商品/卖竹编包包1.jpg'
            }
          ]
        }
      ];
      
      // 使用模拟数据
      this.allOrders = mockOrders.map(order => {
        // 处理模拟数据中的图片路径
        const products = order.products.map(p => {
          if (p.image && p.image.startsWith('/uploads/')) {
            p.image = `${this.apiBaseUrl.replace('/api', '')}${p.image}`;
          }
          return p;
        });
        return {...order, products};
      });
      
      this.currentOrderIndex = 0;
      this.order = this.allOrders[0];
      console.log('使用模拟数据:', this.allOrders);
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
    getStatusIconText(status) {
      const iconMap = {
        0: '付',
        1: '备',
        2: '运',
        3: '完',
        4: '取'
      };
      
      return iconMap[status] || '?';
    },
    getProductsTotal(products) {
      if (!products || !products.length) return '0.00';
      
      const total = products.reduce((sum, product) => {
        return sum + parseFloat(product.price) * (product.quantity || 1);
      }, 0);
      
      return total.toFixed(2);
    },
    viewProduct(productId) {
      if (!productId) return;
      
      uni.navigateTo({
        url: `/pages/buy/detail?id=${productId}`
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
  padding-top: 44px;
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

.order-swiper {
  flex: 1;
  margin-top: calc(44px + 90rpx);
  width: 100%;
  height: calc(100vh - 44px - 90rpx) !important;
}

.swiper-item-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.content {
  flex: 1;
  height: 100%;
  padding: 20rpx;
  box-sizing: border-box;
  width: 100%;
}

.status-section {
  background-color: #f0e6d2;
  padding: 40rpx 30rpx;
  display: flex;
  align-items: center;
  border-radius: 16rpx 16rpx 0 0;
  margin: 0 0 20rpx;
}

.status-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: rgba(109, 65, 38, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.status-icon-text {
  font-size: 36rpx;
  color: #6d4126;
  font-weight: bold;
}

.status-info {
  flex: 1;
}

.status-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #6d4126;
  margin-bottom: 10rpx;
  display: block;
}

.status-desc {
  font-size: 24rpx;
  color: #8c7b6b;
  display: block;
}

.card {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #f5f5f5;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #6d4126;
}

.product-list {
  padding: 0 30rpx;
}

.product-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1px solid #f5f5f5;
  width: 100%;
  box-sizing: border-box;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image-container {
  width: 120rpx;
  height: 120rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
  border-radius: 8rpx;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 0; /* 确保flex内容不会溢出 */
  min-width: 0; /* 确保flex内容不会溢出 */
}

.product-name {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.product-price {
  font-size: 28rpx;
  color: #e74c3c;
  flex-shrink: 0;
}

.product-count {
  font-size: 26rpx;
  color: #999;
  flex-shrink: 0;
  margin-left: 10rpx;
}

.amount-info {
  padding: 20rpx 30rpx;
  width: 100%;
  box-sizing: border-box;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
  width: 100%;
  box-sizing: border-box;
}

.amount-item:last-child {
  margin-bottom: 0;
}

.amount-item .label {
  font-size: 28rpx;
  color: #666;
  flex-shrink: 0;
}

.amount-item .value {
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;
  text-align: right;
}

.amount-item.total {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1px solid #f5f5f5;
}

.amount-item.total .label,
.amount-item.total .value {
  font-size: 32rpx;
  font-weight: 600;
  color: #e74c3c;
}

.footer-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 0;
  width: 100%;
  box-sizing: border-box;
}

.action-group {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  margin-bottom: 30rpx;
  flex-wrap: wrap;
  gap: 10rpx;
}

.action-btn {
  padding: 0 30rpx;
  height: 70rpx;
  line-height: 70rpx;
  border-radius: 35rpx;
  font-size: 28rpx;
  border: 1px solid #ddd;
  color: #666;
  background-color: #fff;
  margin-left: 10rpx;
  text-align: center;
}

.action-btn.primary-btn {
  background-color: #6d4126;
  color: #fff;
  border: none;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
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

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
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

.go-back-btn {
  padding: 0 40rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  background-color: #6d4126;
  color: #fff;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.swipe-hint {
  width: 100%;
  text-align: center;
  margin-top: 20rpx;
  padding: 10rpx 0;
}

.hint-text {
  font-size: 24rpx;
  color: #8c7b6b;
  opacity: 0.7;
}
</style> 