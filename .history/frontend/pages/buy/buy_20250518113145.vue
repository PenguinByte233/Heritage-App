<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">非遗商城</text>
    </view>
    
    <!-- 分类选择 -->
    <view class="category-tabs">
      <scroll-view scroll-x class="scroll-view" show-scrollbar="false">
        <view 
          class="category-tab" 
          :class="{ active: selectedCategory === 'all' }"
          @tap="selectCategory('all')"
        >
          <text class="category-text">全部</text>
        </view>
        <view 
          v-for="(category, index) in categories" 
          :key="index"
          class="category-tab"
          :class="{ active: selectedCategory === category }"
          @tap="selectCategory(category)"
        >
          <text class="category-text">{{ category }}</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 商品列表 -->
    <view class="product-list">
      <!-- 加载提示 -->
      <view class="loading-container" v-if="isLoading">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 商品卡片 -->
      <view 
        v-for="(product, index) in filteredProducts" 
        :key="index"
        class="product-card"
        @tap="navigateToDetail(product)"
      >
        <image class="product-image" :src="product.image_url" mode="aspectFill"></image>
        <view class="product-info">
          <text class="product-name">{{ product.name }}</text>
          <text class="product-price">¥{{ product.price }}</text>
        </view>
      </view>
      
      <!-- 无内容提示 -->
      <view class="empty-container" v-if="!isLoading && filteredProducts.length === 0">
        <text class="empty-text">暂无相关商品</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getAllProducts, getProductCategories } from '@/api/api.js';

export default {
  data() {
    return {
      products: [],
      categories: [],
      selectedCategory: 'all',
      isLoading: false
    };
  },
  computed: {
    filteredProducts() {
      if (this.selectedCategory === 'all') {
        return this.products;
      } else {
        return this.products.filter(product => product.category === this.selectedCategory);
      }
    }
  },
  onLoad() {
    this.fetchCategories();
    this.fetchProducts();
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await getProductCategories();
        if (response.status === 'success' && response.data) {
          this.categories = response.data;
        }
      } catch (error) {
        console.error('获取商品分类失败:', error);
      }
    },
    async fetchProducts() {
      this.isLoading = true;
      try {
        const response = await getAllProducts();
        if (response.status === 'success' && response.data) {
          this.products = response.data;
        } else {
          uni.showToast({
            title: '获取商品失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取商品列表失败:', error);
        uni.showToast({
          title: '获取商品失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    selectCategory(category) {
      this.selectedCategory = category;
    },
    navigateToDetail(product) {
      uni.navigateTo({
        url: `/pages/buy/detail?id=${product.id}`
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
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.category-tabs {
  background-color: #fff;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
}

.scroll-view {
  white-space: nowrap;
  width: 100%;
}

.category-tab {
  display: inline-block;
  padding: 10rpx 30rpx;
  margin: 0 10rpx;
  border-radius: 30rpx;
  background-color: #f0f0f0;
}

.category-tab.active {
  background-color: #6d4126;
}

.category-text {
  font-size: 28rpx;
  color: #333;
}

.category-tab.active .category-text {
  color: #fff;
}

.product-list {
  padding: 0 20rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.product-card {
  width: 48%;
  margin-bottom: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.product-image {
  width: 100%;
  height: 300rpx;
}

.product-info {
  padding: 20rpx;
}

.product-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #e74c3c;
}

.loading-container, .empty-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 60rpx 0;
}

.loading-text, .empty-text {
  font-size: 28rpx;
  color: #999;
}
</style> 