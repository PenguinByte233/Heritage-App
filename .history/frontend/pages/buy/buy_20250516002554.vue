<template>
  <view class="container">
    <!-- 顶部搜索栏 -->
    <view class="search-box">
      <image class="search-icon" src="https://img.icons8.com/ios/50/000000/search--v1.png"></image>
      <text class="search-placeholder">搜索非遗商品</text>
    </view>
    
    <!-- 商品分类 -->
    <view class="category-tabs">
      <scroll-view scroll-x class="scroll-category" show-scrollbar="false">
        <view 
          v-for="(item, index) in categories" 
          :key="index"
          class="category-tab-item"
          :class="{'active': selectedCategoryIndex === index}"
          @tap="selectCategory(index)">
          {{item.name}}
        </view>
      </scroll-view>
    </view>
    
    <!-- 商品推荐横幅 -->
    <view class="banner-container">
      <image class="banner-image" src="https://pic2.zhimg.com/80/v2-eba24118a926028739b1d7c40d221fa5_720w.jpg" mode="aspectFill"></image>
    </view>
    
    <!-- 商品列表 -->
    <view class="product-grid">
      <view 
        class="product-item" 
        v-for="(item, index) in products" 
        :key="index"
        @tap="navigateToDetail(item)">
        <image :src="item.image_url || 'https://pic1.zhimg.com/v2-8f0a5ee5ebe4a0fc06b5a0ea49a31adb_r.jpg'" class="product-image"></image>
        <view class="product-info">
          <text class="product-name">{{item.name}}</text>
          <view class="product-price-row">
            <text class="product-price">¥{{item.price.toFixed(2)}}</text>
            <text class="product-sales">已售{{item.sales || Math.floor(Math.random() * 500)}}</text>
          </view>
          <view class="product-shop">
            <image class="shop-icon" src="https://img.icons8.com/ios/50/000000/shop.png"></image>
            <text class="shop-name">{{item.shop || '非遗官方店'}}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 加载更多 -->
    <view class="load-more" v-if="products.length > 0">
      <text class="load-more-text">{{loadingMore ? '加载中...' : '上拉加载更多'}}</text>
    </view>
    
    <!-- 空状态 -->
    <view class="empty-state" v-if="products.length === 0">
      <image src="https://img.icons8.com/ios/100/000000/empty-box.png" class="empty-image"></image>
      <text class="empty-text">暂无商品，我们正在努力上架中...</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      categories: [
        { id: 0, name: '全部' },
        { id: 1, name: '刺绣' },
        { id: 2, name: '剪纸' },
        { id: 3, name: '木雕' },
        { id: 4, name: '陶瓷' },
        { id: 5, name: '漆艺' },
        { id: 6, name: '织锦' },
        { id: 7, name: '扎染' }
      ],
      selectedCategoryIndex: 0,
      products: [],
      loadingMore: false,
      page: 1,
      pageSize: 10
    }
  },
  onLoad() {
    this.loadProducts();
  },
  onReachBottom() {
    this.loadMoreProducts();
  },
  methods: {
    selectCategory(index) {
      this.selectedCategoryIndex = index;
      this.page = 1;
      this.products = [];
      this.loadProducts();
    },
    loadProducts() {
      uni.showLoading({ title: '加载中' });
      
      // 模拟数据加载
      setTimeout(() => {
        const categoryId = this.categories[this.selectedCategoryIndex].id;
        
        this.products = [
          {
            id: 1,
            name: '福建传统木雕摆件',
            price: 299.00,
            image_url: 'https://pic1.zhimg.com/v2-3c8c9f61e8bbbf3d10267a40dfa8a6b3_r.jpg',
            shop: '木韵坊',
            sales: 235
          },
          {
            id: 2,
            name: '福州脱胎漆器茶杯',
            price: 128.00,
            image_url: 'https://pic2.zhimg.com/80/v2-be6273305a2e4d44b3451fa1e3a5cf10_720w.jpg',
            shop: '漆艺世家',
            sales: 442
          },
          {
            id: 3,
            name: '寿山石印章定制',
            price: 599.00,
            image_url: 'https://pic1.zhimg.com/v2-76a3d2f1ce5e35b7cf5d8ff9311157c6_r.jpg',
            shop: '石艺堂',
            sales: 128
          },
          {
            id: 4,
            name: '德化白瓷茶具套装',
            price: 459.00,
            image_url: 'https://pic1.zhimg.com/v2-7bc4e076857b973c1060027a34dde134_r.jpg',
            shop: '瓷源',
            sales: 367
          },
          {
            id: 5,
            name: '闽绣手工刺绣桌旗',
            price: 189.00,
            image_url: 'https://pic1.zhimg.com/v2-8a5a2159d4c3ee5e25d1d1fc8cc03359_r.jpg',
            shop: '绣艺坊',
            sales: 211
          },
          {
            id: 6,
            name: '建阳建盏茶杯',
            price: 258.00,
            image_url: 'https://pic1.zhimg.com/v2-b3f916fdd93f37c258c5f573fabd89b4_r.jpg',
            shop: '盏艺',
            sales: 489
          }
        ];
        
        uni.hideLoading();
      }, 1000);
    },
    loadMoreProducts() {
      if (this.loadingMore) return;
      
      this.loadingMore = true;
      
      // 模拟加载更多
      setTimeout(() => {
        this.page++;
        
        const moreProducts = [
          {
            id: 7,
            name: '福建土楼模型摆件',
            price: 168.00,
            image_url: 'https://pic3.zhimg.com/v2-ab2a19b478e1c2e9e13c3840f546ce34_r.jpg',
            shop: '闽南工艺',
            sales: 267
          },
          {
            id: 8,
            name: '漳州木偶挂饰',
            price: 98.00,
            image_url: 'https://pic1.zhimg.com/v2-b13e8843cc28f9817d993d6ae2e43e2d_r.jpg',
            shop: '偶艺坊',
            sales: 135
          }
        ];
        
        this.products = [...this.products, ...moreProducts];
        this.loadingMore = false;
      }, 1000);
    },
    navigateToDetail(product) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${product.id}`
      });
    }
  }
}
</script>

<style>
.container {
  padding: 0 0 20px 0;
  background-color: #f5f5f5;
}

.search-box {
  margin: 10px 15px;
  background-color: #fff;
  border-radius: 20px;
  padding: 8px 15px;
  display: flex;
  align-items: center;
}

.search-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.search-placeholder {
  color: #999;
  font-size: 14px;
}

.category-tabs {
  background-color: #fff;
  padding: 10px 0;
  margin-bottom: 10px;
}

.scroll-category {
  white-space: nowrap;
}

.category-tab-item {
  display: inline-block;
  padding: 5px 15px;
  font-size: 14px;
  position: relative;
}

.category-tab-item.active {
  color: #6d4126;
  font-weight: bold;
}

.category-tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 25%;
  width: 50%;
  height: 2px;
  background-color: #6d4126;
  border-radius: 2px;
}

.banner-container {
  margin-bottom: 10px;
}

.banner-image {
  width: 100%;
  height: 150px;
}

.product-grid {
  padding: 0 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.product-item {
  width: 48%;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.product-image {
  width: 100%;
  height: 150px;
}

.product-info {
  padding: 10px;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 5px;
}

.product-price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.product-price {
  font-size: 16px;
  color: #e64340;
  font-weight: bold;
}

.product-sales {
  font-size: 12px;
  color: #999;
}

.product-shop {
  display: flex;
  align-items: center;
}

.shop-icon {
  width: 14px;
  height: 14px;
  margin-right: 5px;
}

.shop-name {
  font-size: 12px;
  color: #666;
}

.load-more {
  text-align: center;
  padding: 15px 0;
}

.load-more-text {
  font-size: 14px;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.empty-image {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}
</style> 