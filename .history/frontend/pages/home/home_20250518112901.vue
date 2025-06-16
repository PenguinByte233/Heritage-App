<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <text class="custom-title">国家非遗</text>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-box">
      <image class="search-icon" src="https://img.icons8.com/ios/50/000000/search--v1.png"></image>
      <text class="search-placeholder">请输入关键字进行搜索</text>
    </view>
    
    <!-- 轮播图 -->
    <view class="banner-container">
      <swiper class="banner-swiper" circular autoplay interval="3000" duration="500" indicator-dots indicator-active-color="#6d4126" indicator-color="rgba(255, 255, 255, 0.6)">
        <swiper-item v-for="(image, index) in bannerImages" :key="index">
          <image class="banner-image" :src="image" mode="aspectFill"></image>
        </swiper-item>
      </swiper>
    </view>
    
    <!-- 五个分类入口 -->
    <view class="category-icons">
      <view class="category-item" v-for="(item, index) in categories" :key="index" @tap="navigateToCategory(item)">
        <image :src="item.icon" class="category-icon"></image>
        <text class="category-name">{{item.name}}</text>
      </view>
    </view>
    
    <!-- 非遗资源标题栏 -->
    <view class="section-header">
      <view class="section-title-container">
        <view class="section-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8L16 12L12 16L8 12L12 8Z" stroke="#6d4126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 3L19 10L12 21L5 10L12 3Z" stroke="#6d4126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </view>
        <text class="section-title">非遗·资源</text>
      </view>
      <view class="more-container" @tap="navigateToLearn">
        <text class="more-text">更多</text>
        <view class="more-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="#999999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-container">
      <!-- 项目内容 -->
      <view class="projects-content">
        <!-- 左侧装饰 -->
        <view class="border-decoration left"></view>
        
        <!-- 项目轮播 -->
        <swiper class="item-swiper" circular previous-margin="60px" next-margin="60px" @change="onProjectChange">
          <swiper-item v-for="(item, index) in projectItems" :key="index" class="swiper-item-container">
            <view class="item-card" :class="{'current-item': currentProjectIndex === index}" @tap="navigateToLearnCategory(item)">
              <image class="item-image" :src="item.image" mode="aspectFill"></image>
            </view>
          </swiper-item>
        </swiper>
        
        <!-- 右侧装饰 -->
        <view class="border-decoration right"></view>
        
        <!-- 标题栏 -->
        <view class="item-title-bar">
          <text class="item-title">{{projectItems[currentProjectIndex].title}}</text>
        </view>
        <!-- 描述 -->
        <view class="item-description">
          <text class="item-description-text">{{projectItems[currentProjectIndex].description}}</text>
        </view>
      </view>
    </view>
    
    <!-- 底部留白区域 -->
    <view style="height: 60px;"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentProjectIndex: 0,
      bannerImages: [
        '/static/images/Home/Carousel/常山战鼓1.jpg',
        '/static/images/Home/Carousel/藏族唐卡1.jpg',
        '/static/images/Home/Carousel/川剧1.jpg',
        '/static/images/Home/Carousel/朝鲜族跳板1.jpg',
        '/static/images/Home/Carousel/二人转1.jpg'
      ],
      categories: [
        { 
          name: '首页', 
          icon: '../../static/images/tabbar/home.png',
          path: '/pages/home/home'
        },
        { 
          name: '学习', 
          icon: '../../static/images/tabbar/learn.png',
          path: '/pages/learn/learn'
        },
        { 
          name: '购买', 
          icon: '../../static/images/tabbar/shopping-cart.png',
          path: '/pages/buy/buy'
        },
        { 
          name: '社区', 
          icon: '../../static/images/tabbar/community.png',
          path: '/pages/chat/chat'
        },
        { 
          name: '我的', 
          icon: '../../static/images/tabbar/user.png',
          path: '/pages/profile/profile'
        }
      ],
      projectItems: [
        {
          title: '传统表演艺术',
          image: '/static/images/Home/Carousel1/传统表演艺术/龙舞1.jpg',
          description: '国家级非物质文化遗产代表性项目'
        },
        {
          title: '传统服饰',
          image: '/static/images/Home/Carousel1/传统服饰/回族服饰3.jpg',
          description: '国家级非物质文化遗产代表性项目'
        },
        {
          title: '传统乐器与音乐',
          image: '/static/images/Home/Carousel1/传统乐器与音乐/维吾尔十二木卡姆4.jpg',
          description: '国家级非物质文化遗产代表性项目'
        },
        {
          title: '传统艺术与工艺',
          image: '/static/images/Home/Carousel1/传统艺术与工艺/海伦剪纸1.jpg',
          description: '国家级非物质文化遗产代表性项目'
        },
        {
          title: '传统节日与庆典',
          image: '/static/images/Home/Carousel1/传统节日与庆典/龙舟3.jpg',
          description: '国家级非物质文化遗产代表性项目'
        },
        {
          title: '传统装饰与配饰',
          image: '/static/images/Home/Carousel1/传统装饰与配饰/海伦剪纸1.jpg',
          description: '国家级非物质文化遗产代表性项目'
        },
        {
          title: '文化与创意产业',
          image: '/static/images/Home/Carousel1/文化与创意产业/图片1.png',
          description: '国家级非物质文化遗产代表性项目'
        }
      ]
    }
  },
  methods: {
    navigateToCategory(category) {
      uni.switchTab({
        url: category.path
      });
    },
    navigateToLearn() {
      uni.switchTab({
        url: '/pages/learn/learn'
      });
    },
    navigateToLearnCategory(item) {
      uni.navigateTo({
        url: `/pages/learn/category?title=${encodeURIComponent(item.title)}`
      });
    },
    onProjectChange(e) {
      this.currentProjectIndex = e.detail.current;
    }
  }
}
</script>

<style>
.container {
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.custom-nav {
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.custom-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.search-box {
  margin: 20rpx 30rpx;
  height: 70rpx;
  background-color: #f5f5f5;
  border-radius: 35rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
}

.search-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.search-placeholder {
  font-size: 28rpx;
  color: #999;
}

.banner-container {
  margin: 20rpx 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.banner-swiper {
  height: 300rpx;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.category-icons {
  display: flex;
  justify-content: space-around;
  margin: 40rpx 20rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.category-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 10rpx;
}

.category-name {
  font-size: 24rpx;
  color: #333;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30rpx 30rpx 20rpx;
}

.section-title-container {
  display: flex;
  align-items: center;
}

.section-icon {
  margin-right: 10rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.more-container {
  display: flex;
  align-items: center;
}

.more-text {
  font-size: 24rpx;
  color: #999;
  margin-right: 5rpx;
}

.content-container {
  padding: 20rpx 0;
}

.projects-content {
  position: relative;
}

.border-decoration {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 300rpx;
  background-color: rgba(109, 65, 38, 0.1);
  border-radius: 20rpx;
  z-index: 1;
}

.left {
  left: 0;
}

.right {
  right: 0;
}

.item-swiper {
  height: 400rpx;
}

.swiper-item-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.item-card {
  width: 90%;
  height: 340rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.current-item {
  height: 380rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.2);
}

.item-image {
  width: 100%;
  height: 100%;
}

.item-title-bar {
  margin: 20rpx 30rpx 10rpx;
  text-align: center;
}

.item-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.item-description {
  margin: 0 60rpx;
  text-align: center;
}

.item-description-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}
</style> 