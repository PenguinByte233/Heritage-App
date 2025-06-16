<template>
  <view class="container">
    <!-- 顶部分类选择 -->
    <view class="category-selector">
      <view class="main-category">
        <view 
          v-for="(item, index) in heritageTypes" 
          :key="index"
          class="main-category-item"
          :class="{'active': selectedMainIndex === index}"
          @tap="handleMainSelect(index, item)">
          {{ item.name }}
        </view>
      </view>
      
      <view class="sub-category" v-if="categories.length > 0">
        <view 
          v-for="(item, index) in categories" 
          :key="index"
          class="sub-category-item"
          :class="{'active': selectedSubIndex === index}"
          @tap="handleSubSelect(index, item)">
          {{ item.name }}
        </view>
      </view>
    </view>
    
    <!-- 商品列表 -->
    <view class="product-list" v-if="products.length > 0">
      <product-card 
        v-for="(item, index) in products" 
        :key="index" 
        :product="item"
        @click="handleProductClick"
        @customize="handleCustomize"
      ></product-card>
    </view>
    
    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <image src="/static/images/empty-products.png" class="empty-image"></image>
      <text class="empty-text">暂无商品，我们正在努力上架中...</text>
    </view>
  </view>
</template>

<script>
import ProductCard from '@/components/ProductCard';
import { getHeritageTypes, getCategories, getProducts } from '@/api/api';

export default {
  components: {
    ProductCard
  },
  data() {
    return {
      heritageTypes: [],
      categories: [],
      products: [],
      selectedMainIndex: 0,
      selectedSubIndex: 0,
      selectedHeritageType: null,
      selectedCategory: null
    }
  },
  onLoad() {
    this.loadHeritageTypes();
  },
  methods: {
    async loadHeritageTypes() {
      try {
        uni.showLoading({ title: '加载中' });
        // 实际项目中，应该从API获取数据
        // const res = await getHeritageTypes();
        // this.heritageTypes = res.data;
        
        // 模拟数据
        setTimeout(() => {
          this.heritageTypes = [
            { id: 1, name: '刺绣' },
            { id: 2, name: '剪纸' },
            { id: 3, name: '木雕' },
            { id: 4, name: '陶瓷' },
            { id: 5, name: '漆艺' },
            { id: 6, name: '织锦' },
            { id: 7, name: '扎染' },
            { id: 8, name: '篆刻' },
            { id: 9, name: '书法' },
            { id: 10, name: '茶艺' }
          ];
          
          if (this.heritageTypes.length > 0) {
            this.selectedHeritageType = this.heritageTypes[0];
            this.loadCategories(this.selectedHeritageType.id);
          }
          
          uni.hideLoading();
        }, 1000);
      } catch (error) {
        console.error('加载非遗大类失败', error);
        uni.hideLoading();
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        });
      }
    },
    async loadCategories(typeId) {
      try {
        // 实际项目中，应该从API获取数据
        // const res = await getCategories(typeId);
        // this.categories = res.data;
        
        // 模拟数据
        setTimeout(() => {
          if (typeId === 1) { // 刺绣
            this.categories = [
              { id: 1, name: '苏绣', heritage_type_id: 1 },
              { id: 2, name: '湘绣', heritage_type_id: 1 },
              { id: 3, name: '粤绣', heritage_type_id: 1 },
              { id: 4, name: '蜀绣', heritage_type_id: 1 }
            ];
          } else if (typeId === 2) { // 剪纸
            this.categories = [
              { id: 5, name: '北方剪纸', heritage_type_id: 2 },
              { id: 6, name: '南方剪纸', heritage_type_id: 2 },
              { id: 7, name: '民间窗花', heritage_type_id: 2 }
            ];
          } else {
            this.categories = [
              { id: 8, name: '传统工艺', heritage_type_id: typeId },
              { id: 9, name: '现代创新', heritage_type_id: typeId }
            ];
          }
          
          if (this.categories.length > 0) {
            this.selectedCategory = this.categories[0];
            this.selectedSubIndex = 0;
            this.loadProducts(this.selectedCategory.id);
          }
        }, 500);
      } catch (error) {
        console.error('加载子类失败', error);
        uni.showToast({
          title: '加载子类失败',
          icon: 'none'
        });
      }
    },
    async loadProducts(categoryId) {
      try {
        uni.showLoading({ title: '加载商品...' });
        // 实际项目中，应该从API获取数据
        // const res = await getProducts(categoryId);
        // this.products = res.data;
        
        // 模拟数据
        setTimeout(() => {
          this.products = [
            {
              id: 1,
              category_id: categoryId,
              name: '手工刺绣装饰画',
              price: 299.00,
              image_url: '/static/images/product1.png',
              description: '纯手工制作，精美刺绣，适合家居装饰。'
            },
            {
              id: 2,
              category_id: categoryId,
              name: '传统图案抱枕',
              price: 129.00,
              image_url: '/static/images/product2.png',
              description: '采用传统图案，手工刺绣，触感柔软舒适。'
            },
            {
              id: 3,
              category_id: categoryId,
              name: '刺绣手提包',
              price: 359.00,
              image_url: '/static/images/product3.png',
              description: '将传统刺绣与现代设计结合，实用又美观。'
            },
            {
              id: 4,
              category_id: categoryId,
              name: '丝绸刺绣披肩',
              price: 499.00,
              image_url: '/static/images/product4.png',
              description: '采用上等丝绸，手工刺绣，质地柔软轻薄。'
            }
          ];
          uni.hideLoading();
        }, 700);
      } catch (error) {
        console.error('加载商品失败', error);
        uni.hideLoading();
        uni.showToast({
          title: '加载商品失败',
          icon: 'none'
        });
      }
    },
    handleMainSelect(index, type) {
      this.selectedMainIndex = index;
      this.selectedHeritageType = type;
      this.loadCategories(type.id);
    },
    handleSubSelect(index, category) {
      this.selectedSubIndex = index;
      this.selectedCategory = category;
      this.loadProducts(category.id);
    },
    handleProductClick(product) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${product.id}`
      });
    },
    handleCustomize(product) {
      // 这里可以实现实际的客服联系逻辑
      console.log('联系客服定制商品:', product);
    }
  }
}
</script>

<style>
.container {
  padding: 0 0 20px 0;
}

.category-selector {
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.main-category {
  display: flex;
  white-space: nowrap;
  overflow-x: auto;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.main-category-item {
  padding: 5px 15px;
  font-size: 14px;
  position: relative;
}

.main-category-item.active {
  color: #d4237a;
  font-weight: bold;
}

.main-category-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 15%;
  width: 70%;
  height: 3px;
  background-color: #d4237a;
  border-radius: 3px;
}

.sub-category {
  display: flex;
  flex-wrap: wrap;
  padding: 10px 15px;
  background-color: #fff;
}

.sub-category-item {
  padding: 5px 12px;
  margin: 5px;
  font-size: 12px;
  border-radius: 15px;
  background-color: #f5f5f5;
}

.sub-category-item.active {
  background-color: #d4237a;
  color: #fff;
}

.product-list {
  padding: 15px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.empty-image {
  width: 150px;
  height: 150px;
  margin-bottom: 15px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}
</style> 