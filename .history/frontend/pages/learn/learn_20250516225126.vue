<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <text class="custom-title">国家非遗</text>
    </view>

    <!-- 主分类导航区域 - 作为Banner -->
    <view class="category-banner">
      <scroll-view scroll-x class="category-tabs" show-scrollbar="false">
        <view 
          v-for="(item, index) in categories" 
          :key="index"
          class="category-tab-item"
          :class="{'active': selectedCategoryIndex === index}"
          @tap="selectCategory(index)">
          <text class="category-tab-text">{{item.name}}</text>
          <view class="category-tab-indicator" v-if="selectedCategoryIndex === index"></view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 加载中提示 -->
      <view class="loading-container" v-if="isLoading">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 如果有内容，显示子分类内容 -->
      <view v-else-if="currentCategoryData && currentCategoryData.subcategories && currentCategoryData.subcategories.length > 0">
        <!-- 展示子分类内容图片 -->
        <view class="subcategory-showcase">
          <!-- 遍历所有子分类 -->
          <block v-for="(subcategory, subIndex) in currentCategoryData.subcategories" :key="subIndex">
            <!-- 子分类标题 -->
            <view class="subcategory-title">
              <text>{{subcategory.name}}</text>
            </view>
            
            <!-- 该子分类下的项目列表 -->
            <view 
              v-for="(item, itemIndex) in subcategory.items" 
              :key="itemIndex"
              class="subcategory-showcase-item"
              @tap="navigateToDetail(item)">
              <image :src="item.image_path" class="subcategory-showcase-image" mode="aspectFill"></image>
              <view class="subcategory-showcase-info">
                <text class="subcategory-showcase-title">{{getShortTitle(item.title)}}</text>
              </view>
            </view>
          </block>
        </view>
      </view>
      
      <!-- 无内容提示 -->
      <view class="no-content" v-else>
        <text class="no-content-text">暂无相关内容</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 静态定义分类列表
      categories: [
        { name: '传统表演艺术', categoryValue: '传统表演艺术' },
        { name: '传统服饰', categoryValue: '传统服饰' },
        { name: '传统乐器与音乐', categoryValue: '传统乐器与音乐' },
        { name: '传统艺术与工艺', categoryValue: '传统艺术与工艺' },
        { name: '传统节日与庆典', categoryValue: '传统节日与庆典' },
        { name: '传统装饰与配饰', categoryValue: '传统装饰与配饰' },
        { name: '文化与创意产业', categoryValue: '文化与创意产业' }
      ],
      selectedCategoryIndex: 0,
      currentCategoryData: null,
      isLoading: false,
      apiBase: '/api/learn',
      errorMessage: ''
    }
  },
  created() {
    // 默认加载第一个分类的内容
    if (this.categories.length > 0) {
      this.fetchCategoryItems(this.categories[0].categoryValue);
    }
  },
  methods: {
    // 根据分类获取卡片数据 - 符合 /api/learn/category/:category API
    async fetchCategoryItems(category) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const res = await uni.request({
          url: `${this.apiBase}/category/${encodeURIComponent(category)}`,
          method: 'GET'
        });
        
        const [_, response] = res;
        
        if (response.statusCode === 200 && response.data && response.data.success) {
          this.currentCategoryData = response.data.data;
          
          // 确保结果符合预期的数据结构
          if (!this.currentCategoryData.subcategories) {
            this.currentCategoryData.subcategories = [];
            console.warn('API返回的数据缺少subcategories字段');
          }
        } else {
          console.error('获取分类内容失败:', response);
          this.currentCategoryData = null;
          this.errorMessage = response.data?.message || '获取内容失败，请稍后重试';
          
          // 显示错误提示
          uni.showToast({
            title: this.errorMessage,
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('获取分类内容错误:', error);
        this.currentCategoryData = null;
        this.errorMessage = '网络错误，请检查网络连接';
        
        // 显示错误提示
        uni.showToast({
          title: this.errorMessage,
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    // 选择分类
    selectCategory(index) {
      if (this.selectedCategoryIndex === index) return;
      
      this.selectedCategoryIndex = index;
      // 获取选中分类的数据
      if (this.categories[index]) {
        this.fetchCategoryItems(this.categories[index].categoryValue);
      }
    },
    
    // 导航到详情页 - 使用title参数，符合详情页API
    navigateToDetail(item) {
      if (!item || !item.title) {
        console.error('无效的项目数据:', item);
        return;
      }
      
      uni.navigateTo({
        url: `/pages/tutorial/detail?title=${encodeURIComponent(item.title)}`,
        fail: (err) => {
          console.error('导航失败:', err);
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none',
            duration: 2000
          });
        }
      });
    },
    
    // 获取简短标题 - 移除冒号后面的内容
    getShortTitle(title) {
      if (!title) return '';
      const colonIndex = title.indexOf('：');
      return colonIndex > 0 ? title.substring(0, colonIndex) : title;
    }
  }
}
</script>

<style>
.container {
  padding: 0 0 20px 0;
  background-color: #f0e6d2;
}

.custom-nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 44px 15px 10px; /* 上边距根据状态栏高度调整 */
  background-color: #f0e6d2;
}

.custom-title {
  font-size: 22px;
  font-weight: bold;
  color: #6d4126;
  letter-spacing: 2px;
  text-shadow: 1px 1px 2px rgba(109, 65, 38, 0.1);
}

/* 主分类导航 - Banner样式 */
.category-banner {
  background-color: #f0e6d2;
  padding: 5px 0; /* 由10px减小为5px */
  box-shadow: 0 2px 8px rgba(109, 65, 38, 0.1);
  margin-top: 5px;
}

.category-tabs {
  white-space: nowrap;
  padding: 2px 0; /* 由5px减小为2px */
}

.category-tab-item {
  display: inline-block;
  padding: 6px 15px; /* 由10px减小为6px */
  margin: 0 5px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.category-tab-item:first-child {
  margin-left: 15px;
}

.category-tab-text {
  font-size: 16px;
  color: #8a653e;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 auto;
  padding-bottom: 3px;
  transition: all 0.3s ease;
}

.category-tab-item.active .category-tab-text {
  font-weight: bold;
  color: #6d4126;
  transform: scale(1.05);
}

.category-tab-indicator {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: linear-gradient(to right, #e5c49d, #6d4126, #e5c49d);
  border-radius: 3px;
  transition: all 0.3s ease;
}

/* 内容区域 */
.content-area {
  padding-top: 5px; /* 由10px减小为5px */
  background-color: #f0e6d2;
  min-height: 300px;
}

/* 子分类展示 */
.subcategory-showcase {
  display: flex;
  flex-direction: column; /* 改为纵向排列 */
  padding: 5px;
  background-color: #f0e6d2;
  margin: 0 15px 10px; /* 底部边距从15px减小为10px */
}

.subcategory-title {
  margin: 15px 0 10px;
  padding-left: 10px;
  border-left: 4px solid #6d4126;
}

.subcategory-title text {
  font-size: 18px;
  font-weight: bold;
  color: #6d4126;
}

.subcategory-showcase-item {
  width: 100%; /* 宽度改为100%，与屏幕宽度持平 */
  padding: 5px;
  position: relative;
  margin-bottom: 10px; /* 添加底部间距 */
}

.subcategory-showcase-image {
  width: 100%;
  height: 160px; /* 增加图片高度 */
  border-radius: 8px;
}

.subcategory-showcase-info {
  position: absolute;
  bottom: 5px;
  left: 5px;
  right: 5px;
  padding: 10px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  border-radius: 0 0 8px 8px;
}

.subcategory-showcase-title {
  color: #fff;
  font-size: 18px; /* 增大字体 */
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

/* 加载中和无内容提示 */
.loading-container, .no-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.loading-text, .no-content-text {
  color: #6d4126;
  font-size: 16px;
}
</style> 