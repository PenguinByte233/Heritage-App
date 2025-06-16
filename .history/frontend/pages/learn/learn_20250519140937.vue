<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="status-bar-height"></view>
      <text class="title">学习非遗</text>
    </view>
    
    <!-- 大标题导航栏 -->
    <scroll-view scroll-x class="nav-tabs" show-scrollbar="false">
      <view 
        v-for="(category, index) in categories" 
        :key="index"
        class="nav-tab"
        :class="{'active': currentCategory === category.title}"
        @tap="selectCategory(category.title)"
      >
        <text class="nav-text">{{ category.title }}</text>
      </view>
    </scroll-view>
    
    <!-- 小标题卡片列表 -->
    <view class="subcategory-list" v-if="!isLoading">
      <view 
        v-for="(item, index) in subcategories" 
        :key="index"
        class="subcategory-item"
        @tap="navigateToContent(item)"
      >
        <!-- 在这里为每个item添加index属性，便于引用 -->
        <view v-if="false">{{ item.index = index }}</view>
        
        <!-- 多图预览，如果只有一张图则显示单图 -->
        <swiper 
          v-if="item.images && item.images.length > 1" 
          class="image-swiper" 
          circular 
          :indicator-dots="true" 
          indicator-color="rgba(255, 255, 255, 0.3)"
          indicator-active-color="#ffffff"
          @change="handleSwiperChange(index, $event)"
        >
          <!-- 检查是否正确循环图片数组 -->
          <view v-if="false">
            {{ console.log(`渲染 ${item.subtitle} 的轮播，共 ${item.images.length} 张图片`) }}
          </view>
          
          <swiper-item v-for="(img, imgIndex) in item.images.slice(0, 3)" :key="imgIndex">
            <image class="subcategory-image" :src="img" mode="aspectFill" @error="(e) => console.error(`图片加载失败:`, img, e)"></image>
          </swiper-item>
        </swiper>
        
        <!-- 单图展示（兼容旧数据） -->
        <image 
          v-else 
          class="subcategory-image" 
          :src="item.image_url || (item.images && item.images[0])" 
          mode="aspectFill"
        ></image>
        
        <!-- 图片计数指示 -->
        <view class="image-count" v-if="item.images && item.images.length > 1">
          <text class="image-count-text">{{ getImageCountText(item) }}</text>
        </view>
        
        <!-- 标题容器 -->
        <view class="subcategory-title-container">
          <text class="subcategory-title">{{ item.subtitle }}</text>
        </view>
      </view>
      
      <!-- 空状态提示 -->
      <view class="empty-tip" v-if="subcategories.length === 0">
        <text class="empty-text">暂无内容，请选择其他分类</text>
      </view>
    </view>
    
    <!-- 加载指示器 -->
    <view class="loading-container" v-if="isLoading">
      <view class="loading-icon"></view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { getLearningHeaders } from '@/api/api.js';

export default {
  data() {
    return {
      // 本地存储的大标题数据
      categories: [
        { title: '传统表演艺术' },
        { title: '传统服饰' },
        { title: '传统节日与庆典' },
        { title: '传统乐器与音乐' },
        { title: '传统艺术与工艺' },
        { title: '传统装饰与配饰' },
        { title: '文化与创意产业' }
      ],
      currentCategory: '',
      subcategories: [],
      isLoading: false,
      currentSwiperIndex: {} // 记录每个卡片的当前滑动位置
    };
  },
  onLoad(options) {
    // 如果从首页传递了标题参数，则选择对应的类别
    if (options && options.title) {
      const title = decodeURIComponent(options.title);
      // 检查是否存在该类别
      const found = this.categories.find(cat => cat.title === title);
      if (found) {
        this.currentCategory = title;
      } else {
        // 如果没找到匹配的类别，则使用默认类别
        this.currentCategory = this.categories[0].title;
      }
    } else {
      // 默认选中第一个分类
      if (this.categories.length > 0) {
        this.currentCategory = this.categories[0].title;
      }
    }
    
    // 获取当前选中类别的子分类数据
    this.fetchSubcategories(this.currentCategory);
  },
  onShow() {
    // 检查全局变量中是否有选中的分类
    const app = getApp();
    if (app && app.globalData && app.globalData.selectedCategory) {
      const category = app.globalData.selectedCategory;
      // 检查是否存在该类别
      const found = this.categories.find(cat => cat.title === category);
      if (found && this.currentCategory !== category) {
        this.currentCategory = category;
        this.fetchSubcategories(category);
      }
      // 使用后清除全局变量
      app.globalData.selectedCategory = null;
    }
  },
  methods: {
    async fetchSubcategories(title) {
      this.isLoading = true;
      this.subcategories = [];
      this.currentSwiperIndex = {}; // 重置滑动索引
      
      try {
        console.log(`正在获取分类 "${title}" 的小标题数据...`);
        const response = await getLearningHeaders(title);
        
        if (response.status === 'success' && response.data) {
          this.subcategories = response.data;
          
          // 详细日志输出，查看每个项目的图片数据
          console.log(`获取到 ${this.subcategories.length} 个小标题，详细数据：`);
          this.subcategories.forEach((item, index) => {
            console.log(`[${index+1}] ${item.subtitle}:`);
            console.log(`  - image_url: ${item.image_url}`);
            if (item.images && Array.isArray(item.images)) {
              console.log(`  - images数组 (${item.images.length}张):`);
              item.images.forEach((img, i) => {
                console.log(`    [${i+1}] ${img}`);
              });
            } else {
              console.log(`  - images数组: 不存在或不是数组`);
            }
          });
        } else {
          console.error('API返回错误:', response);
          uni.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取小标题列表失败:', error);
        uni.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    selectCategory(title) {
      if (this.currentCategory !== title) {
        this.currentCategory = title;
        this.fetchSubcategories(title);
      }
    },
    navigateToContent(item) {
      console.log('正在导航到内容页，小标题:', item.subtitle);
      try {
        uni.navigateTo({
          url: `/pages/learn/content?subtitle=${encodeURIComponent(item.subtitle)}`,
          success: () => {
            console.log('导航成功');
          },
          fail: (err) => {
            console.error('导航失败:', err);
            uni.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      } catch (e) {
        console.error('导航错误:', e);
      }
    },
    handleSwiperChange(itemIndex, event) {
      const currentIndex = event.detail.current;
      this.$set(this.currentSwiperIndex, itemIndex, currentIndex);
    },
    getImageCountText(item) {
      if (!item.images || !item.images.length) return '';
      
      // 使用item自身的index访问currentSwiperIndex
      const itemIndex = item.index || 0;
      const currentIndex = this.currentSwiperIndex[itemIndex] || 0;
      const totalImages = item.images.length;
      const displayCount = Math.min(totalImages, 3); // 最多展示3张图片
      
      if (totalImages > 3) {
        return `${currentIndex + 1}/${displayCount} (共${totalImages}张)`;
      } else {
        return `${currentIndex + 1}/${totalImages}`;
      }
    }
  }
};
</script>

<style>
.container {
  padding: 0;
  background-color: #f0e6d2; /* 统一背景色 */
  min-height: 100vh;
}

.header {
  padding: 0 0 20rpx 0;
  background-color: #f0e6d2;
  text-align: center;
}

.status-bar-height {
  height: 88rpx; /* 状态栏高度，根据实际情况调整 */
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #6d4126;
  display: inline-block;
  padding: 30rpx 0 10rpx 0;
}

/* 导航栏样式 */
.nav-tabs {
  display: flex;
  white-space: nowrap;
  background-color: #f0e6d2; /* 与容器背景色保持一致 */
  padding: 8rpx 0 12rpx 0; /* 稍微增加下方内边距代替边框 */
  position: relative;
  z-index: 10;
}

.nav-tab {
  display: inline-block;
  padding: 20rpx 30rpx;
  position: relative;
}

.nav-text {
  font-size: 28rpx;
  color: #8a6642; /* 棕色调，与整体主题一致 */
}

.nav-tab.active .nav-text {
  color: #6d4126;
  font-weight: bold;
}

.nav-tab.active:after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background-color: #6d4126;
}

/* 小标题列表样式 */
.subcategory-list {
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx; /* 增大间距，使卡片更加突出 */
}

.subcategory-item {
  position: relative;
  width: 100%;
  height: 380rpx; /* 稍微增加高度 */
  border-radius: 16rpx; /* 增大圆角 */
  overflow: hidden;
  box-shadow: 0 6rpx 16rpx rgba(109, 65, 38, 0.1); /* 阴影颜色与主题一致，降低不透明度 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.subcategory-item:active {
  transform: scale(0.98); /* 点击时的缩小效果 */
  box-shadow: 0 3rpx 8rpx rgba(109, 65, 38, 0.08);
}

.image-swiper {
  width: 100%;
  height: 100%;
}

.subcategory-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-count {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
  z-index: 2;
}

.image-count-text {
  color: #ffffff;
  font-size: 22rpx;
}

.subcategory-title-container {
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 24rpx 28rpx; /* 增大内边距 */
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
  width: 100%;
  height: 140rpx; /* 固定高度，使渐变效果更明显 */
  display: flex;
  align-items: flex-end;
}

.subcategory-title {
  font-size: 34rpx; /* 稍微增大字体 */
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
  line-height: 1.4;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.loading-icon {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #e0d6c2;
  border-top: 4rpx solid #6d4126;
  border-radius: 50%;
  margin-bottom: 20rpx;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #8a6642; /* 棕色调，与整体主题一致 */
}

.empty-tip {
  width: 100%;
  padding: 80rpx 0;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.3); /* 降低不透明度，使其与背景更协调 */
  border-radius: 12rpx;
  margin-top: 40rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #8a6642;
  font-weight: 500;
}
</style> 