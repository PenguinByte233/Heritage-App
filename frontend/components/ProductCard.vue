<template>
  <view class="product-card" @tap="handleClick">
    <image :src="product.image_url || '/static/images/default-product.png'" class="product-image" mode="aspectFill"></image>
    <view class="product-info">
      <text class="product-name">{{ product.name }}</text>
      <view class="product-price-row">
        <text class="product-price">¥{{ product.price }}</text>
        <button class="custom-btn" size="mini" @tap.stop="handleCustomize">联系客服定制</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleClick() {
      this.$emit('click', this.product);
    },
    handleCustomize() {
      // 打开客服会话
      uni.showToast({
        title: '即将打开客服会话',
        icon: 'none'
      });
      
      // 实际小程序中调用客服接口
      // 示例：
      // uni.openCustomerServiceChat({
      //   extInfo: { url: '' },
      //   corpId: '',
      //   success: () => {}
      // });
      
      this.$emit('customize', this.product);
    }
  }
}
</script>

<style>
.product-card {
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.product-image {
  width: 100%;
  height: 200px;
}

.product-info {
  padding: 10px;
}

.product-name {
  font-size: 16px;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
}

.product-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  color: #d4237a;
  font-size: 18px;
  font-weight: bold;
}

.custom-btn {
  background-color: #d4237a;
  color: white;
  border-radius: 20px;
  font-size: 12px;
}
</style> 