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
          <view class="category-tab-indicator" v-if="selectedCategoryIndex === index + 1"></view>
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
      
      <!-- 推荐教程部分已移除 -->
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
      specialTopics: [
        {
          id: 101,
          title: '常山战鼓',
          image: '/static/images/learn/传统表演艺术/常山战鼓1.jpg',
          category: 1,
          subcategory: 101,
          description: '千年古城的铿锵战歌，燕赵大地的文化瑰宝'
        },
        {
          id: 102,
          title: '龙舞',
          image: '/static/images/learn/传统表演艺术/龙舞1.jpg',
          category: 1,
          subcategory: 102,
          description: '中国传统民间艺术，舞动吉祥如意'
        },
        {
          id: 103,
          title: '舞狮',
          image: '/static/images/learn/传统表演艺术/舞狮1.jpg',
          category: 1,
          subcategory: 103,
          description: '威武雄壮的民间艺术表演，驱邪纳福'
        },
        {
          id: 104,
          title: '二人转',
          image: '/static/images/learn/传统表演艺术/二人转1.jpg',
          category: 1,
          subcategory: 104,
          description: '东北特色曲艺，活泼幽默的民间艺术'
        }
      ],
      inProgressTutorials: [
        {
          id: 101,
          title: '常山战鼓基础入门',
          author: '张大师',
          duration: '45分钟',
          cover_url: '/static/images/learn/传统表演艺术/常山战鼓1.jpg',
          progress: 35,
          category: 1,
          subcategory: 101
        }
      ],
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
      filteredSpecialTopics: [],
      filteredRecommendTutorials: [],
      isLoading: false,
      hasMore: false,
      loadingMore: false,
      page: 1
    }
  },
  created() {
    this.filterContentByCategory();
  },
  methods: {
    selectCategory(index) {
      this.selectedCategoryIndex = index;
      this.selectedSubcategoryIndex = 0; // 重置子分类选择
      this.filterContentByCategory();
    },
    selectSubcategoryAndShowContent(index) {
      this.selectedSubcategoryIndex = index;
      this.filterContentBySubcategory();
      
      // 获取选中的子分类信息
      const subcategory = this.performanceSubcategories[index - 1];
      
      // 跳转到详情页，传递ID参数
      uni.navigateTo({
        url: `/pages/tutorial/detail?id=${subcategory.id}`
      });
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
    },
    loadMore() {
      if (this.loadingMore) return;
      
      this.loadingMore = true;
      
      // 模拟加载更多
      setTimeout(() => {
        this.page++;
        
        const moreTutorials = [
          {
            id: 5,
            title: '漳州木偶头雕刻教程',
            cover_url: 'https://pic2.zhimg.com/v2-c0e1ecbe4ec497c98babeee35f1e255f_r.jpg',
            views: 987,
            video_url: 'https://example.com/video5.mp4'
          },
          {
            id: 6,
            title: '传统漆线雕技法',
            cover_url: 'https://pic1.zhimg.com/v2-d3d29d74f7799b8892f7fed518a583a1_r.jpg',
            views: 1243
          }
        ];
        
        this.recommendTutorials = [...this.recommendTutorials, ...moreTutorials];
        this.loadingMore = false;
        this.hasMore = this.page < 3; // 模拟只有3页数据
      }, 1000);
    }
  }
}
</script>

<style>
.container {
  padding: 0 0 20px 0;
  background-color: #6d4126;
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
  box-shadow: 0 2px 8px rgba(109, 65, 38, 0.1);
  margin-top: 5px;
  border-radius: 15px;
  margin: 5px 15px 0;
}

.category-tabs {
  white-space: nowrap;
  padding: 5px 0;
}

.category-tab-item {
  display: inline-block;
  padding: 10px 15px;
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
  padding-top: 10px;
  background-color: #f5f5f5;
}

/* 子分类展示 */
.subcategory-showcase {
  display: flex;
  flex-direction: column; /* 改为纵向排列 */
  padding: 5px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin: 0 15px 15px; /* 增加边距 */
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

/* 推荐教程样式 */
.recommend-section {
  background-color: #fff;
  border-radius: 8px;
  margin: 0 15px; /* 增加左右边距 */
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
  padding: 10px;
  display: flex;
  flex-direction: column; /* 改为纵向排列 */
}

.tutorial-item {
  width: 100%; /* 宽度改为100%，与屏幕宽度持平 */
  margin-bottom: 15px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.tutorial-image {
  width: 100%;
  height: 160px; /* 增加图片高度 */
  border-radius: 8px 8px 0 0;
}

.tutorial-info {
  padding: 15px; /* 增加内边距 */
}

.tutorial-title {
  font-size: 16px; /* 增大字体 */
  color: #333;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tutorial-desc {
  font-size: 14px; /* 增大字体 */
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