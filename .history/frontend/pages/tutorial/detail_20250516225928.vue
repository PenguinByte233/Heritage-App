<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-back" @tap="goBack">
        <view class="back-btn-circle">
          <image src="/static/images/tabbar/home.png" class="back-icon"></image>
        </view>
      </view>
      <view class="title-container">
        <text class="custom-title">非遗详情</text>
        <view class="title-underline"></view>
      </view>
    </view>
    
    <!-- 加载中提示 -->
    <view class="loading-container" v-if="isLoading">
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view scroll-y class="content-scroll" v-else-if="itemData">
      <!-- 头部图片 -->
      <view class="header-image-container">
        <image :src="itemData.image_path" mode="aspectFill" class="header-image"></image>
        <view class="header-info">
          <text class="header-title">{{itemData.title}}</text>
        </view>
      </view>
      
      <!-- 内容详情 -->
      <view class="content-details">
        <text class="content-title">{{itemData.title}}</text>
        
        <!-- 分类信息 -->
        <view class="category-info">
          <text class="category-label">分类：</text>
          <text class="category-value">{{itemData.category}} > {{itemData.subcategory}}</text>
        </view>
        
        <view class="article-container">
          <!-- 使用格式化的内容显示 -->
          <view class="content-paragraphs">
            <block v-for="(paragraph, index) in formattedContent" :key="index">
              <view class="paragraph">
                <text class="paragraph-text">{{paragraph}}</text>
              </view>
              
              <!-- 在段落之间插入图片，确保有足够的图片 -->
              <view class="content-image-container" v-if="itemData.additional_images && itemData.additional_images[index] && index < itemData.additional_images.length">
                <image :src="itemData.additional_images[index]" mode="widthFix" class="content-image"></image>
                <text class="image-caption">{{itemData.title}} - 图{{index + 1}}</text>
              </view>
            </block>
          </view>
        </view>
      </view>
      
      <!-- 所有图片展示区 -->
      <view class="all-images-section" v-if="itemData.additional_images && itemData.additional_images.length > 0">
        <view class="section-header">
          <view class="section-title-container">
            <text class="section-title">所有图片</text>
          </view>
        </view>
        
        <scroll-view scroll-x class="images-scroll" show-scrollbar="false">
          <view class="image-grid">
            <view class="image-item" v-for="(img, index) in allImages" :key="index" @tap="previewImage(index)">
              <image :src="img" mode="aspectFill" class="thumbnail-image"></image>
            </view>
          </view>
        </scroll-view>
      </view>
    </scroll-view>
    
    <!-- 无内容提示 -->
    <view class="no-content" v-else>
      <text class="no-content-text">未找到相关内容</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      title: '',
      isLoading: true,
      itemData: null,
      baseUrl: 'http://localhost:3000', // 使用完整URL
      errorMessage: ''
    }
  },
  computed: {
    // 将文本内容分割为段落
    formattedContent() {
      if (!this.itemData || !this.itemData.content) return [];
      return this.itemData.content.split('\n\n').filter(p => p.trim() !== '');
    },
    // 所有图片的列表
    allImages() {
      if (!this.itemData) return [];
      const images = [this.itemData.image_path];
      if (this.itemData.additional_images && this.itemData.additional_images.length > 0) {
        images.push(...this.itemData.additional_images);
      }
      return images;
    }
  },
  onLoad(options) {
    // 获取传递的title参数
    if (options.title) {
      this.title = decodeURIComponent(options.title);
      this.fetchItemDetail(this.title);
    } else {
      this.isLoading = false;
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    
    // 获取详细内容
    async fetchItemDetail(title) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        // 使用完整URL
        const encodedTitle = encodeURIComponent(title);
        const apiUrl = `${this.baseUrl}/api/learn/detail/${encodedTitle}`;
        console.log('请求详情URL:', apiUrl);
        
        const res = await uni.request({
          url: apiUrl,
          method: 'GET'
        });
        
        const [_, response] = res;
        
        if (response.statusCode === 200 && response.data && response.data.success && response.data.data) {
          this.itemData = response.data.data;
          // 设置页面标题
          const shortTitle = this.itemData.title.split('：')[0] || '非遗详情';
          uni.setNavigationBarTitle({
            title: shortTitle
          });
        } else {
          console.error('获取详细内容失败:', response);
          this.itemData = null;
          this.errorMessage = response.data?.message || '获取内容失败，请稍后重试';
          
          uni.showToast({
            title: this.errorMessage,
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('获取详细内容错误:', error);
        this.itemData = null;
        this.errorMessage = '网络错误，请检查网络连接';
        
        uni.showToast({
          title: this.errorMessage,
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    // 预览图片
    previewImage(index) {
      uni.previewImage({
        current: index,
        urls: this.allImages
      });
    }
  }
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
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

.nav-back {
  position: absolute;
  left: 15px;
  bottom: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(109, 65, 38, 0.2);
  transition: all 0.3s;
}

.back-btn-circle:active {
  transform: scale(0.95);
  box-shadow: 0 1px 4px rgba(109, 65, 38, 0.2);
}

.back-icon {
  width: 20px;
  height: 20px;
}

.title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.custom-title {
  font-size: 20px;
  font-weight: bold;
  color: #6d4126;
  letter-spacing: 2px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.title-underline {
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, transparent, #6d4126, transparent);
  border-radius: 3px;
  margin-top: 5px;
}

/* 加载中和无内容提示 */
.loading-container, .no-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.loading-text, .no-content-text {
  color: #6d4126;
  font-size: 16px;
}

.content-scroll {
  flex: 1;
  height: calc(100vh - 70px); /* 减去导航栏高度 */
}

.header-image-container {
  position: relative;
  width: 100%;
  height: 30vh;
  min-height: 200px;
}

.header-image {
  width: 100%;
  height: 100%;
}

.header-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 15px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}

.header-title {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.content-details {
  padding: 20px 15px;
  background-color: #fff;
  margin: 10px;
  border-radius: 8px;
}

.content-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.category-info {
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e5c49d;
}

.category-label {
  color: #8a653e;
  font-size: 14px;
}

.category-value {
  color: #6d4126;
  font-size: 14px;
  font-weight: bold;
}

.article-container {
  margin-top: 10px;
}

.paragraph {
  margin-bottom: 20px;
}

.paragraph-text {
  font-size: 16px;
  color: #444;
  line-height: 1.8;
  text-align: justify;
  letter-spacing: 0.5px;
}

/* 内容图片容器样式 */
.content-image-container {
  margin: 25px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.content-image {
  width: 100%;
  border-radius: 8px 8px 0 0;
}

.image-caption {
  display: block;
  font-size: 14px;
  color: #666;
  padding: 10px;
  text-align: center;
  background-color: #f9f5f0;
  font-style: italic;
}

.all-images-section {
  background-color: #fff;
  padding: 15px;
  margin: 0 10px 15px;
  border-radius: 8px;
}

.section-header {
  padding: 0 0 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
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

.images-scroll {
  width: 100%;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
}

.image-item {
  width: 31%;
  margin: 1%;
  aspect-ratio: 1;
  border-radius: 4px;
  overflow: hidden;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style> 