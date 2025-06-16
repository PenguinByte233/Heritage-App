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
          v-for="(item, index) in categories.slice(1)" 
          :key="index"
          class="category-tab-item"
          :class="{'active': selectedCategoryIndex === index + 1}"
          @tap="selectCategory(index + 1)">
          <text class="category-tab-text">{{item.name}}</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 如果选中的是传统表演艺术，显示传统表演艺术的内容 -->
      <view v-if="selectedCategoryIndex === 1">
        <!-- 展示子分类内容图片 -->
        <view class="subcategory-showcase">
          <view 
            v-for="(item, index) in performanceSubcategories" 
            :key="index"
            class="subcategory-showcase-item"
            @tap="selectSubcategoryAndShowContent(index + 1)">
            <image :src="item.icon" class="subcategory-showcase-image" mode="aspectFill"></image>
            <view class="subcategory-showcase-info">
              <text class="subcategory-showcase-title">{{item.name}}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 推荐教程 -->
      <view class="recommend-section">
        <view class="section-header">
          <view class="section-title-container">
            <text class="section-title">推荐教程</text>
          </view>
        </view>
        
        <view class="tutorial-grid">
          <view 
            v-for="(item, index) in filteredRecommendTutorials" 
            :key="index"
            class="tutorial-item"
            @tap="navigateToTutorial(item)">
            <image :src="item.cover_url" class="tutorial-image" mode="aspectFill"></image>
            <view class="tutorial-info">
              <text class="tutorial-title">{{item.title}}</text>
              <text class="tutorial-desc">{{item.description}}</text>
              <view class="tutorial-meta">
                <text class="tutorial-views">{{item.views}}次学习</text>
                <text class="tutorial-type">图文</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 没有内容的提示 -->
        <view class="no-content" v-if="filteredRecommendTutorials.length === 0">
          <text class="no-content-text">暂无当前分类的教程内容</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      categories: [
        { id: 0, name: '全部', icon: '/static/images/tabbar/home.png' },
        { id: 1, name: '传统表演艺术', icon: '/static/images/Home/Carousel1/传统表演艺术/龙舞1.jpg' },
        { id: 2, name: '传统服饰', icon: '/static/images/Home/Carousel1/传统服饰/回族服饰3.jpg' },
        { id: 3, name: '传统乐器与音乐', icon: '/static/images/Home/Carousel1/传统乐器与音乐/维吾尔十二木卡姆4.jpg' },
        { id: 4, name: '传统艺术与工艺', icon: '/static/images/Home/Carousel1/传统艺术与工艺/海伦剪纸1.jpg' },
        { id: 5, name: '传统节日与庆典', icon: '/static/images/Home/Carousel1/传统节日与庆典/龙舟3.jpg' },
        { id: 6, name: '传统装饰与配饰', icon: '/static/images/Home/Carousel1/传统装饰与配饰/海伦剪纸1.jpg' },
        { id: 7, name: '文化与创意产业', icon: '/static/images/Home/Carousel1/文化与创意产业/图片1.png' }
      ],
      // 传统表演艺术子分类
      performanceSubcategories: [
        { id: 101, name: '常山战鼓', icon: '/static/images/learn/传统表演艺术/常山战鼓1.jpg' },
        { id: 102, name: '龙舞', icon: '/static/images/learn/传统表演艺术/龙舞1.jpg' },
        { id: 103, name: '舞狮', icon: '/static/images/learn/传统表演艺术/舞狮1.jpg' },
        { id: 104, name: '二人转', icon: '/static/images/learn/传统表演艺术/二人转1.jpg' }
      ],
      selectedCategoryIndex: 1, // 默认选中传统表演艺术
      selectedSubcategoryIndex: 0, // 默认选中第一个子分类
      recommendTutorials: [
        {
          id: 101,
          title: '常山战鼓：千年古城的铿锵战歌',
          cover_url: '/static/images/learn/传统表演艺术/常山战鼓1.jpg',
          views: 2568,
          category: 1,
          subcategory: 101,
          description: '在燕赵大地的苍茫历史中，常山战鼓如惊雷滚过岁月，叩击着中华文明的雄浑节拍。这一因正定古属常山郡而得名的民间锣鼓艺术...'
        },
        {
          id: 102,
          title: '龙舞表演艺术入门',
          cover_url: '/static/images/learn/传统表演艺术/龙舞1.jpg',
          views: 2103,
          category: 1,
          subcategory: 102,
          description: '龙舞是中国传统民间艺术，象征着吉祥与祈福。本教程帮助你了解龙舞的基本知识与表演技巧。'
        },
        {
          id: 103,
          title: '舞狮技艺详解',
          cover_url: '/static/images/learn/传统表演艺术/舞狮1.jpg',
          views: 1879,
          category: 1,
          subcategory: 103,
          description: '舞狮是中国传统民俗活动，分南狮和北狮。本教程介绍舞狮的历史渊源和基本表演方法。'
        },
        {
          id: 104,
          title: '二人转基本功训练',
          cover_url: '/static/images/learn/传统表演艺术/二人转1.jpg',
          views: 1562,
          category: 1,
          subcategory: 104,
          description: '二人转是流行于东北地区的传统曲艺形式，本教程将介绍二人转的唱、念、做、舞四大基本功。'
        }
      ],
      filteredRecommendTutorials: [],
      isLoading: false,
      baseUrl: 'http://localhost:3001',
      apiData: null,
      errorMessage: ''
    }
  },
  created() {
    // 首先获取所有分类
    this.fetchCategories();
  },
  methods: {
    // 获取所有分类
    async fetchCategories() {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const apiUrl = `${this.baseUrl}/api/learn/categories`;
        console.log('请求分类URL:', apiUrl);
        
        const response = await uni.request({
          url: apiUrl,
          method: 'GET'
        });
        
        if (response.statusCode === 200 && response.data && response.data.success) {
          // 更新分类数据
          const categoriesData = response.data.data;
          if (Array.isArray(categoriesData) && categoriesData.length > 0) {
            // 创建新的分类数组，保留"全部"分类
            const newCategories = [
              { id: 0, name: '全部', icon: '/static/images/tabbar/home.png' }
            ];
            
            // 添加API返回的分类
            categoriesData.forEach((cat, index) => {
              // 为每个分类找一个代表性的图片
              let icon = '/static/images/placeholder.jpg';
              if (cat.subcategories && cat.subcategories.length > 0 && cat.subcategories[0].image_path) {
                icon = cat.subcategories[0].image_path;
              }
              
              newCategories.push({
                id: index + 1,
                name: cat.category,
                categoryValue: cat.category,
                icon: icon
              });
            });
            
            // 更新分类列表
            this.categories = newCategories;
            console.log('获取到的分类列表:', this.categories);
            
            // 默认加载第一个分类的内容
            if (this.categories.length > 1) {
              this.selectedCategoryIndex = 1; // 选择第一个实际分类
              this.fetchCategoryItems(this.categories[1].categoryValue);
            }
          } else {
            console.warn('API返回的分类数据为空，使用默认分类');
            // 使用默认分类
            this.filterContentByCategory();
          }
        } else {
          console.error('获取分类失败:', response);
          this.errorMessage = response.data?.message || '获取分类失败，请稍后重试';
          
          // 显示错误提示
          uni.showToast({
            title: this.errorMessage,
            icon: 'none',
            duration: 2000
          });
          
          // 使用默认分类
          this.filterContentByCategory();
        }
      } catch (error) {
        console.error('获取分类错误:', error);
        this.errorMessage = '网络错误，请检查网络连接';
        
        // 显示错误提示
        uni.showToast({
          title: this.errorMessage,
          icon: 'none',
          duration: 2000
        });
        
        // 使用默认分类
        this.filterContentByCategory();
      } finally {
        this.isLoading = false;
      }
    },
    
    // 根据分类获取卡片数据
    async fetchCategoryItems(category) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        // 直接使用中文参数
        const apiUrl = `${this.baseUrl}/api/learn/category/${category}`;
        
        console.log('请求URL:', apiUrl);
        
        const response = await uni.request({
          url: apiUrl,
          method: 'GET'
        });
        
        if (response.statusCode === 200 && response.data && response.data.success) {
          const categoryData = response.data.data;
          
          // 使用API返回的数据更新界面
          if (categoryData && categoryData.subcategories) {
            // 更新推荐教程列表
            let newTutorials = [];
            
            // 遍历所有子分类，收集其中的项目
            categoryData.subcategories.forEach(subcategory => {
              if (subcategory.items && subcategory.items.length > 0) {
                // 为每个项目添加必要的属性
                const items = subcategory.items.map(item => ({
                  ...item,
                  cover_url: item.image_path,
                  views: Math.floor(Math.random() * 3000) + 1000, // 随机生成浏览量
                  category: this.selectedCategoryIndex,
                  subcategory: subcategory.name
                }));
                
                newTutorials = [...newTutorials, ...items];
              }
            });
            
            if (newTutorials.length > 0) {
              // 替换静态数据
              this.filteredRecommendTutorials = newTutorials;
              console.log('更新的推荐教程:', this.filteredRecommendTutorials);
            } else {
              // 如果没有数据，显示空列表
              this.filteredRecommendTutorials = [];
            }
            
            // 如果是传统表演艺术分类，还可以更新子分类数据
            if (category === '传统表演艺术' && categoryData.subcategories.length > 0) {
              const performanceSubcategories = categoryData.subcategories.map((subcat, index) => {
                // 找到该子分类下的第一个项目的图片作为图标
                const firstItem = subcat.items && subcat.items.length > 0 ? subcat.items[0] : null;
                return {
                  id: 100 + index + 1,
                  name: subcat.name,
                  icon: firstItem ? firstItem.image_path : '/static/images/placeholder.jpg'
                };
              });
              
              if (performanceSubcategories.length > 0) {
                this.performanceSubcategories = performanceSubcategories;
              }
            }
          }
        } else {
          console.error('获取分类内容失败:', response);
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
    
    // 从API获取分类数据 - 原方法重命名，保持兼容
    async fetchCategoryData() {
      const categoryName = this.categories[this.selectedCategoryIndex].name;
      await this.fetchCategoryItems(categoryName);
    },
    
    selectCategory(index) {
      this.selectedCategoryIndex = index;
      this.selectedSubcategoryIndex = 0; // 重置子分类选择
      this.filterContentByCategory();
      
      // 当选择新分类时，尝试从API获取数据
      this.fetchCategoryData();
    },
    selectSubcategoryAndShowContent(index) {
      this.selectedSubcategoryIndex = index;
      this.filterContentBySubcategory();
    },
    filterContentByCategory() {
      const categoryId = this.categories[this.selectedCategoryIndex].id;
      
      // 根据类别筛选
      this.filteredRecommendTutorials = this.recommendTutorials.filter(item => item.category === categoryId);
      
      // 如果当前类别是传统表演艺术，还需按子分类筛选
      if (categoryId === 1 && this.selectedSubcategoryIndex > 0) {
        this.filterContentBySubcategory();
      }
    },
    filterContentBySubcategory() {
      if (this.selectedCategoryIndex !== 1) return; // 只有传统表演艺术类别才有子分类
      
      const subcategoryId = this.selectedSubcategoryIndex === 0 ? 
        null : // 全部子分类
        this.performanceSubcategories[this.selectedSubcategoryIndex - 1].id;
      
      if (subcategoryId === null) {
        // 显示当前类别下的所有内容
        this.filteredRecommendTutorials = this.recommendTutorials.filter(item => item.category === 1);
      } else {
        // 按子分类筛选
        this.filteredRecommendTutorials = this.recommendTutorials.filter(item => item.subcategory === subcategoryId);
      }
    },
    navigateToTutorial(item) {
      uni.navigateTo({
        url: `/pages/tutorial/detail?id=${item.id}`
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
  padding: 10px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.category-tabs {
  white-space: nowrap;
  padding: 5px 0;
}

.category-tab-item {
  display: inline-block;
  padding: 0 15px;
  margin: 0 5px;
  text-align: center;
}

.category-tab-item:first-child {
  margin-left: 15px;
}

.category-tab-text {
  font-size: 16px;
  color: #6d4126;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 8px 0;
}

.category-tab-item.active .category-tab-text {
  font-weight: bold;
  border-bottom: 2px solid #6d4126;
}

/* 内容区域 */
.content-area {
  padding-top: 10px;
}

/* 子分类展示 */
.subcategory-showcase {
  display: flex;
  flex-wrap: wrap;
  padding: 5px;
  background-color: #fff;
  border-radius: 8px;
  margin: 0 5px 10px;
}

.subcategory-showcase-item {
  width: 50%;
  padding: 5px;
  position: relative;
}

.subcategory-showcase-image {
  width: 100%;
  height: 120px;
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
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

/* 推荐教程样式 */
.recommend-section {
  background-color: #fff;
  border-radius: 8px;
  margin: 0 5px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.section-title-container {
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #6d4126;
}

.tutorial-grid {
  padding: 10px 5px;
}

.tutorial-item {
  width: 100%;
  margin-bottom: 15px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.tutorial-image {
  width: 100%;
  height: 180px;
  border-radius: 8px 8px 0 0;
}

.tutorial-info {
  padding: 12px;
}

.tutorial-title {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tutorial-desc {
  font-size: 14px;
  color: #666;
  margin: 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tutorial-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.tutorial-views {
  font-size: 12px;
  color: #999;
}

.tutorial-type {
  font-size: 12px;
  color: #6d4126;
  background-color: rgba(109, 65, 38, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
}

.no-content {
  padding: 30px 0;
  text-align: center;
}

.no-content-text {
  color: #999;
  font-size: 14px;
}
</style> 