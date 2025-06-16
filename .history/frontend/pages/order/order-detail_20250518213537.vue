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
    
    <scroll-view class="content" scroll-y v-if="!isLoading && order">
      <view class="status-section">
        <view class="status-icon">
          <text class="status-icon-text">{{ getStatusIconText(order.status) }}</text>
        </view>
        <view class="status-info">
          <text class="status-text">{{ getStatusText(order.status) }}</text>
          <text class="status-desc">{{ getStatusDesc(order.status) }}</text>
        </view>
      </view>
      
      <view class="card logistics-card" v-if="order.status >= 2 && order.logistics_company">
        <view class="card-header">
          <text class="card-title">物流信息</text>
          <view class="card-action" @tap="viewLogistics(order.id)">
            <text class="action-text">查看详情</text>
            <text class="action-icon">></text>
          </view>
        </view>
        <view class="logistics-info">
          <view class="logistics-company">
            <text class="label">物流公司：</text>
            <text class="value">{{ order.logistics_company }}</text>
          </view>
          <view class="logistics-number">
            <text class="label">物流单号：</text>
            <text class="value">{{ order.logistics_number }}</text>
          </view>
          <view class="logistics-status">
            <text class="label">物流状态：</text>
            <text class="value">{{ order.logistics_status || '运输中' }}</text>
          </view>
        </view>
      </view>
      
      <view class="card address-card">
        <view class="card-header">
          <text class="card-title">收货地址</text>
        </view>
        <view class="address-info">
          <view class="contact-info">
            <text class="name">{{ order.address?.name || '张三' }}</text>
            <text class="phone">{{ order.address?.phone || '138****1234' }}</text>
          </view>
          <text class="address">{{ order.address?.full_address || '浙江省杭州市西湖区文化创意产业园区18号楼3层' }}</text>
        </view>
      </view>
      
      <view class="card order-card">
        <view class="card-header">
          <text class="card-title">订单信息</text>
        </view>
        <view class="order-info">
          <view class="info-item">
            <text class="label">订单编号：</text>
            <text class="value">{{ order.order_number }}</text>
            <text class="copy-btn" @tap="copyOrderNumber">复制</text>
          </view>
          <view class="info-item">
            <text class="label">创建时间：</text>
            <text class="value">{{ order.created_at }}</text>
          </view>
          <view class="info-item" v-if="order.payment_time">
            <text class="label">付款时间：</text>
            <text class="value">{{ order.payment_time }}</text>
          </view>
          <view class="info-item" v-if="order.shipping_time">
            <text class="label">发货时间：</text>
            <text class="value">{{ order.shipping_time }}</text>
          </view>
          <view class="info-item" v-if="order.completion_time">
            <text class="label">完成时间：</text>
            <text class="value">{{ order.completion_time }}</text>
          </view>
          <view class="info-item">
            <text class="label">支付方式：</text>
            <text class="value">{{ order.payment_method || '微信支付' }}</text>
          </view>
        </view>
      </view>
      
      <view class="card products-card">
        <view class="card-header">
          <text class="card-title">商品信息</text>
        </view>
        <view class="product-list">
          <view 
            v-for="(product, index) in order.products" 
            :key="index"
            class="product-item"
            @tap="viewProduct(product.id)"
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
      
      <view class="card amount-card">
        <view class="card-header">
          <text class="card-title">金额明细</text>
        </view>
        <view class="amount-info">
          <view class="amount-item">
            <text class="label">商品金额</text>
            <text class="value">¥{{ getProductsTotal(order.products) }}</text>
          </view>
          <view class="amount-item">
            <text class="label">运费</text>
            <text class="value">¥{{ order.shipping_fee || '0.00' }}</text>
          </view>
          <view class="amount-item discount" v-if="order.discount">
            <text class="label">优惠</text>
            <text class="value">-¥{{ order.discount }}</text>
          </view>
          <view class="amount-item total">
            <text class="label">实付款</text>
            <text class="value">¥{{ order.total_amount }}</text>
          </view>
        </view>
      </view>
      
      <view class="footer-actions">
        <view class="action-group" v-if="order.status === 0">
          <view class="action-btn cancel-btn" @tap="cancelOrder(order.id)">取消订单</view>
          <view class="action-btn primary-btn" @tap="payOrder(order.id)">立即付款</view>
        </view>
        
        <view class="action-group" v-if="order.status === 1">
          <view class="action-btn" @tap="contactSeller(order.id)">联系商家</view>
          <view class="action-btn primary-btn" @tap="remindShipping(order.id)">提醒发货</view>
        </view>
        
        <view class="action-group" v-if="order.status === 2">
          <view class="action-btn" @tap="viewLogistics(order.id)">查看物流</view>
          <view class="action-btn primary-btn" @tap="confirmReceive(order.id)">确认收货</view>
        </view>
        
        <view class="action-group" v-if="order.status === 3">
          <view class="action-btn" @tap="deleteOrder(order.id)">删除订单</view>
          <view class="action-btn primary-btn" @tap="reviewOrder(order.id)" v-if="!order.is_reviewed">评价订单</view>
        </view>
        
        <view class="action-group" v-if="order.status === 4">
          <view class="action-btn" @tap="deleteOrder(order.id)">删除订单</view>
          <view class="action-btn primary-btn" @tap="buyAgain(order.id)">再次购买</view>
        </view>
      </view>
    </scroll-view>
    
    <view class="empty-container" v-if="!isLoading && !order">
      <image class="empty-icon" src="/static/images/empty-order.png"></image>
      <text class="empty-text">订单不存在或已被删除</text>
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
      apiBaseUrl: 'http://localhost:3001/api'
    };
  },
  onLoad(options) {
    if (options.id) {
      this.orderId = options.id;
      this.fetchOrderDetail();
    } else {
      this.isLoading = false;
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    fetchOrderDetail() {
      this.isLoading = true;
      
      // 获取当前登录用户信息
      const token = uni.getStorageSync('token');
      const userInfoStr = uni.getStorageSync('userInfo');
      let userId = '';
      
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          userId = userInfo.id;
        } catch (e) {
          console.error('解析用户信息失败:', e);
        }
      }
      
      // 如果没有用户ID，使用模拟数据
      if (!userId) {
        console.warn('未找到用户ID，使用模拟数据');
        this.useFallbackData();
        return;
      }
      
      // 调用API获取订单详情
      uni.request({
        url: `${this.apiBaseUrl}/orders/user/${userId}/order/${this.orderId}`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          if (res.data && res.data.status === 'success') {
            // 处理API返回的订单数据
            const orderData = res.data.data;
            
            // 转换订单数据格式以适配页面显示
            this.order = {
              id: orderData.id,
              order_number: orderData.order_number || `ORD${orderData.id}`,
              status: orderData.status || 0,
              total_amount: orderData.total_price || '0.00',
              created_at: orderData.created_at,
              payment_time: orderData.payment_time,
              shipping_time: orderData.shipping_time,
              completion_time: orderData.completion_time,
              logistics_company: orderData.logistics_company,
              logistics_number: orderData.logistics_number,
              logistics_status: orderData.logistics_status,
              payment_method: orderData.payment_method || '微信支付',
              shipping_fee: orderData.shipping_fee || '0.00',
              discount: orderData.discount,
              address: orderData.address || {
                name: orderData.recipient_name,
                phone: orderData.recipient_phone,
                full_address: orderData.recipient_address
              },
              is_reviewed: orderData.is_reviewed || false,
              // 处理商品数据
              products: Array.isArray(orderData.products) ? orderData.products : [
                {
                  id: orderData.product_id,
                  name: orderData.product_name,
                  price: orderData.product_price,
                  quantity: orderData.quantity,
                  image: orderData.product_image
                }
              ]
            };
            
            console.log('订单数据:', this.order);
          } else {
            // 处理API错误
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
    // 使用模拟数据作为备选
    useFallbackData() {
      // 模拟订单数据
      const mockOrders = [
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
      ];
      
      // 查找对应ID的订单
      this.order = mockOrders.find(order => order.id === this.orderId) || mockOrders[0];
      console.log('使用模拟数据:', this.order);
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
    copyOrderNumber() {
      if (!this.order || !this.order.order_number) return;
      
      uni.setClipboardData({
        data: this.order.order_number,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          });
        }
      });
    },
    viewProduct(productId) {
      uni.navigateTo({
        url: `/pages/buy/detail?id=${productId}`
      });
    },
    cancelOrder(orderId) {
      uni.showModal({
        title: '取消订单',
        content: '确定要取消此订单吗？',
        success: (res) => {
          if (res.confirm) {
            // 获取用户ID
            const token = uni.getStorageSync('token');
            const userInfoStr = uni.getStorageSync('userInfo');
            let userId = '';
            
            if (userInfoStr) {
              try {
                const userInfo = JSON.parse(userInfoStr);
                userId = userInfo.id;
              } catch (e) {
                console.error('解析用户信息失败:', e);
              }
            }
            
            if (!userId) {
              uni.showToast({
                title: '请先登录',
                icon: 'none'
              });
              return;
            }
            
            // 调用取消订单API
            uni.request({
              url: `${this.apiBaseUrl}/orders/user/${userId}/order/${orderId}/cancel`,
              method: 'PUT',
              header: {
                'Authorization': `Bearer ${token}`
              },
              success: (res) => {
                if (res.data && res.data.status === 'success') {
                  uni.showToast({
                    title: '订单已取消',
                    icon: 'success'
                  });
                  
                  // 更新订单状态
                  this.order.status = 4;
                } else {
                  uni.showToast({
                    title: res.data?.message || '取消订单失败',
                    icon: 'none'
                  });
                }
              },
              fail: (err) => {
                console.error('取消订单失败:', err);
                uni.showToast({
                  title: '取消订单失败，请稍后再试',
                  icon: 'none'
                });
                
                // 模拟成功（开发阶段使用）
                this.order.status = 4;
              }
            });
          }
        }
      });
    },
    payOrder(orderId) {
      // 调用支付API
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
      // 获取用户ID
      const token = uni.getStorageSync('token');
      const userInfoStr = uni.getStorageSync('userInfo');
      let userId = '';
      
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          userId = userInfo.id;
        } catch (e) {
          console.error('解析用户信息失败:', e);
        }
      }
      
      if (!userId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      // 调用提醒发货API
      uni.request({
        url: `${this.apiBaseUrl}/orders/user/${userId}/order/${orderId}/remind`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          if (res.data && res.data.status === 'success') {
            uni.showToast({
              title: '已提醒商家发货',
              icon: 'success'
            });
          } else {
            uni.showToast({
              title: res.data?.message || '提醒发货失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('提醒发货失败:', err);
          // 模拟成功（开发阶段使用）
          uni.showToast({
            title: '已提醒商家发货',
            icon: 'success'
          });
        }
      });
    },
    viewLogistics(orderId) {
      if (!this.order || !this.order.logistics_company || !this.order.logistics_number) {
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
    confirmReceive(orderId) {
      uni.showModal({
        title: '确认收货',
        content: '确认已收到商品吗？确认后订单将完成',
        success: (res) => {
          if (res.confirm) {
            // 获取用户ID
            const token = uni.getStorageSync('token');
            const userInfoStr = uni.getStorageSync('userInfo');
            let userId = '';
            
            if (userInfoStr) {
              try {
                const userInfo = JSON.parse(userInfoStr);
                userId = userInfo.id;
              } catch (e) {
                console.error('解析用户信息失败:', e);
              }
            }
            
            if (!userId) {
              uni.showToast({
                title: '请先登录',
                icon: 'none'
              });
              return;
            }
            
            // 调用确认收货API
            uni.request({
              url: `${this.apiBaseUrl}/orders/user/${userId}/order/${orderId}/confirm`,
              method: 'PUT',
              header: {
                'Authorization': `Bearer ${token}`
              },
              success: (res) => {
                if (res.data && res.data.status === 'success') {
                  uni.showToast({
                    title: '确认收货成功',
                    icon: 'success'
                  });
                  
                  // 更新订单状态
                  this.order.status = 3;
                  this.order.completion_time = new Date().toLocaleString();
                } else {
                  uni.showToast({
                    title: res.data?.message || '确认收货失败',
                    icon: 'none'
                  });
                }
              },
              fail: (err) => {
                console.error('确认收货失败:', err);
                // 模拟成功（开发阶段使用）
                uni.showToast({
                  title: '确认收货成功',
                  icon: 'success'
                });
                
                this.order.status = 3;
                this.order.completion_time = new Date().toLocaleString();
              }
            });
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
            // 获取用户ID
            const token = uni.getStorageSync('token');
            const userInfoStr = uni.getStorageSync('userInfo');
            let userId = '';
            
            if (userInfoStr) {
              try {
                const userInfo = JSON.parse(userInfoStr);
                userId = userInfo.id;
              } catch (e) {
                console.error('解析用户信息失败:', e);
              }
            }
            
            if (!userId) {
              uni.showToast({
                title: '请先登录',
                icon: 'none'
              });
              return;
            }
            
            // 调用删除订单API
            uni.request({
              url: `${this.apiBaseUrl}/orders/user/${userId}/order/${orderId}`,
              method: 'DELETE',
              header: {
                'Authorization': `Bearer ${token}`
              },
              success: (res) => {
                if (res.data && res.data.status === 'success') {
                  uni.showToast({
                    title: '删除成功',
                    icon: 'success'
                  });
                  
                  // 返回上一页
                  setTimeout(() => {
                    uni.navigateBack();
                  }, 1000);
                } else {
                  uni.showToast({
                    title: res.data?.message || '删除订单失败',
                    icon: 'none'
                  });
                }
              },
              fail: (err) => {
                console.error('删除订单失败:', err);
                // 模拟成功（开发阶段使用）
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                
                setTimeout(() => {
                  uni.navigateBack();
                }, 1000);
              }
            });
          }
        }
      });
    },
    buyAgain(orderId) {
      if (!this.order || !this.order.products || this.order.products.length === 0) {
        return;
      }
      
      const productId = this.order.products[0].id;
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

.content {
  flex: 1;
  margin-top: calc(44px + 90rpx);
  padding: 20rpx;
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

.card-action {
  display: flex;
  align-items: center;
}

.action-text {
  font-size: 26rpx;
  color: #8c7b6b;
}

.action-icon {
  font-size: 26rpx;
  color: #8c7b6b;
  margin-left: 6rpx;
}

.logistics-info {
  padding: 20rpx 30rpx;
}

.logistics-company,
.logistics-number,
.logistics-status {
  display: flex;
  margin-bottom: 10rpx;
}

.logistics-status {
  margin-bottom: 0;
}

.label {
  font-size: 28rpx;
  color: #666;
  width: 160rpx;
}

.value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.address-info {
  padding: 20rpx 30rpx;
}

.contact-info {
  display: flex;
  margin-bottom: 10rpx;
}

.name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-right: 20rpx;
}

.phone {
  font-size: 28rpx;
  color: #666;
}

.address {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
}

.order-info {
  padding: 20rpx 30rpx;
}

.info-item {
  display: flex;
  margin-bottom: 16rpx;
}

.info-item:last-child {
  margin-bottom: 0;
}

.copy-btn {
  font-size: 24rpx;
  color: #6d4126;
  background-color: rgba(109, 65, 38, 0.1);
  padding: 0 10rpx;
  border-radius: 4rpx;
  margin-left: 10rpx;
}

.product-list {
  padding: 0 30rpx;
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

.amount-info {
  padding: 20rpx 30rpx;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.amount-item:last-child {
  margin-bottom: 0;
}

.amount-item .label {
  width: auto;
}

.amount-item.discount .value {
  color: #e74c3c;
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
  justify-content: flex-end;
  padding: 30rpx 0;
}

.action-group {
  display: flex;
}

.action-btn {
  margin-left: 20rpx;
  padding: 0 30rpx;
  height: 70rpx;
  line-height: 70rpx;
  border-radius: 35rpx;
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
</style> 