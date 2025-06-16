<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <view class="header">
      <view class="status-bar"></view>
      <view class="title-row">
        <text class="title">非遗商城</text>
      </view>
      <view class="search-row">
        <view class="search-box">
          <text class="search-icon">🔍</text>
          <input class="search-input" placeholder="搜索非遗商品" @confirm="searchProducts" v-model="searchKeyword" />
        </view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-area">
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
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>
        
        <!-- 商品卡片 -->
        <navigator 
          v-for="(product, index) in filteredProducts" 
          :key="index"
          class="product-card"
          :url="`/pages/buy/detail?id=${product.id}`"
          hover-class="navigator-hover"
        >
          <image class="product-image" :src="product.image_url" mode="aspectFill"></image>
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-price">¥{{ product.price }}</text>
          </view>
        </navigator>
        
        <!-- 无内容提示 -->
        <view class="empty-container" v-if="!isLoading && filteredProducts.length === 0">
          <image class="empty-icon" src="/static/images/empty-products.png"></image>
          <text class="empty-text">暂无相关商品</text>
        </view>
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
      isLoading: false,
      searchKeyword: ''
    };
  },
  computed: {
    filteredProducts() {
      let result = this.products;
      
      // 按分类筛选
      if (this.selectedCategory !== 'all') {
        result = result.filter(product => product.category === this.selectedCategory);
      }
      
      // 按关键词搜索
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase().trim();
        result = result.filter(product => 
          product.name.toLowerCase().includes(keyword) || 
          product.description?.toLowerCase().includes(keyword) ||
          product.category.toLowerCase().includes(keyword)
        );
      }
      
      return result;
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
          console.log('获取到商品数据:', this.products.length);
          // 检查商品ID是否存在
          this.products.forEach((product, index) => {
            if (!product.id) {
              console.warn(`警告: 第${index+1}个商品没有ID`, product);
            }
          });
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
    searchProducts() {
      // 执行搜索，由于使用了计算属性，这里不需要额外操作
      console.log('搜索关键词:', this.searchKeyword);
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #f0e6d2;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.status-bar {
  height: 44px; /* 适配iPhone状态栏高度 */
  width: 100%;
}

.title-row {
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20rpx;
}

.search-row {
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20rpx 10rpx;
  border-bottom: 1px solid #e5d9c1;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #6d4126;
  text-align: center;
}

.search-box {
  width: 100%;
  height: 60rpx;
  background-color: #ffffff;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}

.search-icon {
  font-size: 28rpx;
  color: #999;
  margin-right: 10rpx;
}

.search-input {
  flex: 1;
  height: 60rpx;
  font-size: 28rpx;
  color: #333;
}

.content-area {
  flex: 1;
  margin-top: calc(44px + 80rpx + 70rpx - 15rpx); /* 状态栏 + 标题行 + 搜索行 - 增加减少的间隙量 */
  display: flex;
  flex-direction: column;
}

.category-tabs {
  background-color: #f0e6d2;
  padding: 3rpx 0;
  margin-bottom: 0;
}

.scroll-view {
  white-space: nowrap;
  width: 100%;
}

.category-tab {
  display: inline-block;
  padding: 8rpx 25rpx;
  margin: 0 5rpx;
  border-radius: 30rpx;
  background-color: #ffffff;
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
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  background-color: #f8f4e9;
  font-size: 0; /* 消除行内元素间的空白 */
  flex: 1;
}

.product-card {
  width: 50%;
  margin: 0;
  padding: 0;
  background-color: #fff;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  box-sizing: border-box;
  border-right: 1rpx solid #f8f4e9;
  border-bottom: 1rpx solid #f8f4e9;
}

.navigator-hover {
  opacity: 0.9;
}

.product-image {
  width: 100%;
  height: 300rpx;
  display: block; /* 消除图片底部间隙 */
}

.product-info {
  padding: 10rpx;
}

.product-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 5rpx;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
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

.loading-text, .empty-text {
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
}

.empty-icon {
  width: 160rpx;
  height: 160rpx;
  opacity: 0.7;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 