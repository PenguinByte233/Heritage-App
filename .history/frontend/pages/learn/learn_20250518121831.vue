<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">非遗学习</text>
    </view>
    
    <!-- 大类列表 -->
    <view class="category-list">
      <view 
        v-for="(category, index) in categories" 
        :key="index" 
        class="category-item"
        @tap="navigateToCategory(category)"
      >
        <image class="category-image" :src="category.image" mode="aspectFill"></image>
        <view class="category-info">
          <text class="category-title">{{ category.title }}</text>
          <text class="category-desc">{{ category.description }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getLearningTitles } from '@/api/api.js';

export default {
  data() {
    return {
      categories: [
        {
          title: '传统表演艺术',
          description: '包括戏曲、音乐、舞蹈等各种表演形式',
          image: '/static/images/Home/Carousel1/传统表演艺术/龙舞1.jpg'
        },
        {
          title: '传统服饰',
          description: '各民族传统服饰文化与制作技艺',
          image: '/static/images/Home/Carousel1/传统服饰/回族服饰3.jpg'
        },
        {
          title: '传统节日与庆典',
          description: '中国传统节日及民俗庆典活动',
          image: '/static/images/Home/Carousel1/传统节日与庆典/龙舟3.jpg'
        },
        {
          title: '传统乐器与音乐',
          description: '中国传统乐器及音乐文化',
          image: '/static/images/Home/Carousel1/传统乐器与音乐/维吾尔十二木卡姆4.jpg'
        },
        {
          title: '传统艺术与工艺',
          description: '传统工艺美术与手工技艺',
          image: '/static/images/Home/Carousel1/传统艺术与工艺/海伦剪纸1.jpg'
        },
        {
          title: '传统装饰与配饰',
          description: '传统建筑装饰与生活配饰艺术',
          image: '/static/images/Home/Carousel1/传统装饰与配饰/海伦剪纸1.jpg'
        },
        {
          title: '文化与创意产业',
          description: '非遗文化创新与现代应用',
          image: '/static/images/Home/Carousel1/文化与创意产业/图片1.png'
        }
      ]
    };
  },
  onLoad() {
    this.fetchCategories();
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await getLearningTitles();
        if (response.status === 'success' && response.data) {
          // 如果API返回了标题列表，可以用来更新categories
          console.log('获取到的大标题列表:', response.data);
          // 这里可以根据API返回的数据更新categories
        }
      } catch (error) {
        console.error('获取大标题列表失败:', error);
        uni.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      }
    },
    navigateToCategory(category) {
      uni.navigateTo({
        url: `/pages/learn/category?title=${encodeURIComponent(category.title)}`
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

.category-list {
  padding: 20rpx;
}

.category-item {
  display: flex;
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.category-image {
  width: 200rpx;
  height: 160rpx;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.category-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.category-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}
</style> 