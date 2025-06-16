<template>
  <view class="container">
    <!-- 固定在左上角的返回按钮 -->
    <view class="fixed-back-button" @tap="goBack">
      <text class="back-icon">←</text>
    </view>
    
    <!-- 顶部标题 -->
    <view class="header">
      <view class="status-bar-height"></view>
      <view class="title-container">
        <view class="title-spacer"></view>
        <text class="title">{{ subtitle }}</text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 加载提示 -->
      <view class="loading-container" v-if="isLoading">
        <view class="loading-icon"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 多内容卡片展示 -->
      <block v-if="!isLoading && contentCards.length > 0">
        <!-- 内容数量指示器 -->
        <view class="content-count" v-if="contentCards.length > 1">
          <text class="content-count-text">共 {{ contentCards.length }} 篇内容</text>
        </view>
        
        <!-- 内容卡片列表 -->
        <view 
          v-for="(card, cardIndex) in contentCards" 
          :key="cardIndex"
          class="content-card"
        >
          <!-- 内容标题 -->
          <view class="card-title" v-if="card.title">
            <text>{{ card.title }}</text>
            <view class="title-decoration"></view>
          </view>
          
          <!-- 卡片内容区域 -->
          <view class="card-body">
            <!-- 卡片内容文字 -->
            <view class="card-content" v-if="card.content">
              <rich-text :nodes="formatContent(card.content)"></rich-text>
            </view>
          
            <!-- 卡片图片轮播 -->
            <view class="card-images-swiper" v-if="card.images && card.images.length > 0">
              <view class="image-count-badge">
                <text class="image-count-text">{{ imageIndex[cardIndex] + 1 || 1 }}/{{ card.images.length }}</text>
              </view>
              <swiper 
                class="images-swiper" 
                circular 
                :indicator-dots="false" 
                @change="(e) => handleSwiperChange(cardIndex, e)"
                @tap="() => previewImages(card.images, imageIndex[cardIndex] || 0)"
              >
                <swiper-item v-for="(image, imgIndex) in card.images" :key="`${cardIndex}-${imgIndex}`">
                  <image 
                    :src="image" 
                    class="swiper-image" 
                    mode="aspectFit"
                    @error="handleImageError(cardIndex, imgIndex)"
                  ></image>
                </swiper-item>
              </swiper>
            </view>
          </view>
          
          <!-- 无内容提示 -->
          <view class="no-content-tip" v-if="!card.content && (!card.images || card.images.length === 0)">
            <text class="no-content-text">此内容为空</text>
          </view>
          
          <!-- 卡片底部装饰 -->
          <view class="card-footer">
            <view class="footer-decoration"></view>
          </view>
        </view>
      </block>
      
      <!-- 空内容提示 -->
      <view class="empty-container" v-if="!isLoading && contentCards.length === 0">
        <text class="empty-text">暂无相关内容</text>
      </view>
      
      <!-- 错误提示 -->
      <view class="error-container" v-if="loadError">
        <text class="error-text">{{ errorMessage }}</text>
        <view class="retry-button" @tap="fetchContent">
          <text class="retry-text">重试</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getLearningContent } from '@/api/api.js';

export default {
  data() {
    return {
      subtitle: '',
      contentCards: [], // 包含多个内容卡片的数组
      allImages: [], // 所有图片的URL数组
      imageIndex: {}, // 记录每个卡片当前显示的图片索引
      isLoading: false,
      loadError: false,
      errorMessage: '获取内容失败',
      failedImages: {} // 记录加载失败的图片，格式: {cardIndex: [imageIndex1, imageIndex2, ...]}
    };
  },
  onLoad(options) {
    if (options.subtitle) {
      this.subtitle = decodeURIComponent(options.subtitle);
      this.fetchContent();
    } else {
      console.error('缺少subtitle参数');
      this.loadError = true;
      this.errorMessage = '参数错误';
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      });
    }
  },
  methods: {
    async fetchContent() {
      this.isLoading = true;
      this.loadError = false;
      this.contentCards = [];
      this.allImages = [];
      this.failedImages = {};
      
      try {
        console.log('正在获取内容，小标题：', this.subtitle);
        const response = await getLearningContent(this.subtitle);
        console.log('获取内容响应:', response);
        
        if (response.status === 'success' && response.data) {
          // 获取所有图片
          this.allImages = response.data.images || [];
          
          // 处理内容卡片
          if (response.data.all_contents && response.data.all_contents.length > 0) {
            // 根据all_contents创建内容卡片
            this.createContentCards(response.data.all_contents, this.allImages);
          } else if (response.data.text_content) {
            // 为兼容旧版本，使用text_content创建单个卡片
            this.contentCards = [{
              title: this.subtitle,
              content: response.data.text_content,
              images: this.allImages
            }];
          }
          
          console.log('内容处理完成，卡片数量:', this.contentCards.length);
          
          if (this.contentCards.length === 0) {
            console.warn('处理后无可显示内容');
            uni.showToast({
              title: '内容为空',
              icon: 'none'
            });
          }
        } else {
          console.error('获取内容失败:', response);
          this.loadError = true;
          this.errorMessage = response.message || '获取内容失败';
          uni.showToast({
            title: '获取内容失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取内容失败:', error);
        this.loadError = true;
        this.errorMessage = '网络错误，请重试';
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    // 创建内容卡片，将内容与对应图片关联
    createContentCards(contents, allImages) {
      this.contentCards = [];
      
      // 打印调试信息
      console.log('创建内容卡片，所有图片:', allImages);
      console.log('获取到的内容数据:', contents);
      
      // 处理文件不存在/错误的情况
      let hasValidContent = false;
      
      // 特殊情况：只有一个内容项且存在错误且source包含逗号
      if (contents.length === 1 && contents[0].error && contents[0].source && contents[0].source.includes(',')) {
        console.log('检测到特殊情况：单内容项包含多个文件路径', contents[0]);
        
        // 获取多个文件路径并分解为独立内容
        const paths = contents[0].source.split(',').filter(path => path.trim() !== '');
        if (paths.length > 1) {
          console.log(`从source分解出 ${paths.length} 个文件路径`, paths);
          
          // 创建多个内容项
          const expandedContents = paths.map(filePath => {
            // 从路径中提取文件名作为标题
            const pathSegments = filePath.trim().split('/');
            const fileName = pathSegments[pathSegments.length - 1];
            const title = fileName.replace(/\.[^/.]+$/, ""); // 移除扩展名
            
            return {
              title: title,
              content: '内容文件不存在',
              source: filePath.trim(),
              error: true
            };
          });
          
          console.log('扩展后的内容项:', expandedContents);
          
          // 使用扩展后的内容替换原始内容
          contents = expandedContents;
        }
      }
      
      // 为每个内容创建卡片
      contents.forEach((content, index) => {
        const contentTitle = content.title || `内容 ${index + 1}`;
        
        // 提取文件名前缀用于匹配图片
        console.log(`处理内容: "${contentTitle}"`);
        
        // 新的匹配逻辑：根据内容标题匹配对应的图片
        const matchingImages = allImages.filter(imgUrl => {
          // 从URL中提取包含内容标题的部分
          const decodedUrl = decodeURIComponent(imgUrl);
          // 检查URL中是否包含内容标题（如"川剧"）
          return decodedUrl.includes(`/${contentTitle}`) || 
                 decodedUrl.includes(`${contentTitle}`) ||
                 // 添加额外匹配：尝试匹配不带数字后缀的标题名
                 decodedUrl.includes(`/${contentTitle.replace(/\d+$/, '')}`) || 
                 decodedUrl.includes(`${contentTitle.replace(/\d+$/, '')}`);
        });
        
        console.log(`为内容 "${contentTitle}" 匹配到 ${matchingImages.length} 张图片`);
        
        // 创建卡片，如果没有匹配到图片，使用空数组
        const cardImages = matchingImages.length > 0 ? matchingImages : [];
        
        // 标记内容是否有效（不是错误信息）
        const isContentValid = !(content.error || content.content === '内容文件不存在' || content.content === '读取内容文件失败');
        if (isContentValid) {
          hasValidContent = true;
        }
        
        // 创建卡片
        this.contentCards.push({
          title: contentTitle,
          content: content.content,
          images: cardImages,
          source: content.source,
          error: content.error || false
        });
      });
      
      console.log('创建了 ' + this.contentCards.length + ' 个内容卡片');
      this.contentCards.forEach((card, idx) => {
        console.log(`卡片 ${idx+1}: 标题="${card.title}", 图片数量=${card.images.length}, 错误=${card.error}`);
      });
      
      // 如果没有有效内容，但有图片，添加一个显示所有图片的卡片
      if (!hasValidContent && allImages.length > 0) {
        console.log('没有有效内容，但有图片，创建通用图片展示卡');
        this.contentCards.unshift({
          title: this.subtitle,
          content: '',
          images: allImages,
          source: '',
          isGeneral: true
        });
      }
    },
    
    // 旧的提取文件名函数保留，但不再用于主要匹配
    extractFileName(path) {
      if (!path) return '';
      // 获取路径中的文件名部分
      const fileName = path.split('/').pop();
      if (!fileName) return '';
      // 移除扩展名
      return fileName.replace(/\.[^/.]+$/, "");
    },
    
    // 旧的前缀提取函数保留，但不再用于主要匹配
    extractPrefix(fileName) {
      if (!fileName) return '';
      // 移除末尾的数字
      return fileName.replace(/\d+$/, "");
    },
    
    // 格式化内容文本
    formatContent(text) {
      if (!text) return '';
      
      // 显示错误信息
      if (text === '内容文件不存在' || text === '读取内容文件失败') {
        return `<div class="content-error-message">${text}</div>`;
      }
      
      // 简单处理文本内容，将换行符转换为HTML标签
      let formatted = text.replace(/\n/g, '<br>');
      
      // 处理段落首行缩进（每段前空两格）
      formatted = formatted.replace(/<br>/g, '</p><p class="paragraph">');
      formatted = '<p class="paragraph">' + formatted + '</p>';
      formatted = formatted.replace(/<p class="paragraph"><\/p>/g, ''); // 删除空段落
      
      // 处理可能的Markdown标记
      // 标题
      formatted = formatted.replace(/#{1,6}\s+(.+)/g, '<h3>$1</h3>');
      // 粗体
      formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // 斜体
      formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
      
      return formatted;
    },
    
    // 预览图片
    previewImages(images, currentIndex) {
      if (images && images.length > 0) {
        uni.previewImage({
          current: images[currentIndex],
          urls: images
        });
      }
    },
    
    // 处理图片加载错误
    handleImageError(cardIndex, imageIndex) {
      console.error(`卡片 ${cardIndex+1} 的图片 ${imageIndex+1} 加载失败: ${this.contentCards[cardIndex].images[imageIndex]}`);
      if (!this.failedImages[cardIndex]) {
        this.failedImages[cardIndex] = [];
      }
      if (!this.failedImages[cardIndex].includes(imageIndex)) {
        this.failedImages[cardIndex].push(imageIndex);
      }
    },
    
    // 处理轮播图切换
    handleSwiperChange(cardIndex, event) {
      const currentIndex = event.detail.current;
      this.$set(this.imageIndex, cardIndex, currentIndex);
    },
    
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style>
.container {
  padding: 0;
  background-color: #f0e6d2; /* 与learn.vue保持一致 */
  min-height: 100vh;
  font-family: Arial, Helvetica, sans-serif;
  position: relative;
}

.fixed-back-button {
  position: fixed;
  top: 88rpx; /* 状态栏高度 */
  left: 30rpx;
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  z-index: 100;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

.fixed-back-button:active {
  background-color: rgba(109, 65, 38, 0.2);
  transform: scale(0.95);
}

.back-icon {
  font-size: 36rpx;
  color: #6d4126; /* 与learn.vue的主题色一致 */
  font-weight: bold;
}

.header {
  background-color: #f0e6d2;
  padding: 0 0 10rpx 0;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
}

.status-bar-height {
  height: 88rpx; /* 状态栏高度 */
}

.title-container {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
}

.title-spacer {
  width: 70rpx;
  margin-right: 20rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #6d4126; /* 与learn.vue的主题色一致 */
  text-align: center;
  flex: 1;
}

.content-area {
  padding: 40rpx 30rpx;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
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

.content-count {
  background-color: rgba(109, 65, 38, 0.8);
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  display: inline-block;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.content-count-text {
  color: #fff;
  font-size: 26rpx;
  font-weight: 500;
}

.content-card {
  background-color: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 30rpx rgba(109, 65, 38, 0.12);
  margin-bottom: 50rpx;
  overflow: hidden;
  border: 1rpx solid rgba(109, 65, 38, 0.1);
  transition: all 0.3s;
  position: relative;
}

.card-title {
  background: linear-gradient(135deg, #8a6642 0%, #6d4126 100%);
  color: #fff;
  padding: 25rpx 30rpx;
  font-size: 34rpx;
  font-weight: bold;
  text-align: center;
  position: relative;
  letter-spacing: 2rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.title-decoration {
  position: absolute;
  height: 4rpx;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 160rpx;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 4rpx;
}

.card-body {
  padding: 20rpx;
}

.card-content {
  padding: 20rpx 30rpx 30rpx;
  color: #333;
  font-size: 30rpx;
  line-height: 1.8;
  border-bottom: 1rpx dashed rgba(109, 65, 38, 0.1);
  margin-bottom: 20rpx;
}

.card-content >>> .paragraph {
  text-indent: 2em; /* 首行缩进两个字符 */
  margin-bottom: 16rpx;
  line-height: 1.8;
}

.card-content >>> h3 {
  color: #6d4126;
  font-size: 32rpx;
  margin: 30rpx 0 20rpx;
  font-weight: bold;
  border-left: 6rpx solid #8a6642;
  padding-left: 16rpx;
}

.card-content >>> strong {
  color: #6d4126;
  font-weight: bold;
}

.card-content >>> em {
  font-style: italic;
  color: #8a6642;
}

.card-content >>> .content-error-message {
  color: #d66e59;
  font-size: 28rpx;
  padding: 30rpx;
  margin: 10rpx 0;
  background-color: #fff9f8;
  border-radius: 10rpx;
  border-left: 6rpx solid #d66e59;
  text-align: center;
}

.card-images-swiper {
  padding: 10rpx 20rpx 30rpx;
  position: relative;
  margin-top: 20rpx;
}

.image-count-badge {
  position: absolute;
  top: 20rpx;
  right: 30rpx;
  background-color: rgba(109, 65, 38, 0.7);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  z-index: 10;
}

.image-count-text {
  color: #fff;
  font-size: 22rpx;
  font-weight: 500;
}

.images-swiper {
  width: 100%;
  height: 400rpx;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.swiper-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.loading-text, .empty-text, .error-text, .no-content-text {
  font-size: 28rpx;
  color: #8a6642; /* 与learn.vue的次要文本颜色一致 */
}

.empty-container, .error-container, .no-content-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.retry-button {
  margin-top: 30rpx;
  background: linear-gradient(135deg, #8a6642 0%, #6d4126 100%);
  color: #fff;
  padding: 15rpx 40rpx;
  border-radius: 40rpx;
  box-shadow: 0 6rpx 15rpx rgba(109, 65, 38, 0.25);
  transition: all 0.3s;
}

.retry-button:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 10rpx rgba(109, 65, 38, 0.2);
}

.retry-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
}

.no-content-tip {
  padding: 30rpx 0;
  background-color: rgba(245, 240, 230, 0.8);
  margin: 20rpx 0;
}

.no-content-text {
  color: #8a6642;
  font-size: 28rpx;
  text-align: center;
}

.card-footer {
  padding: 15rpx 30rpx;
  background-color: #f9f5ef;
  display: flex;
  justify-content: center;
}

.footer-decoration {
  width: 80rpx;
  height: 6rpx;
  background: linear-gradient(90deg, transparent, rgba(109, 65, 38, 0.3), transparent);
  border-radius: 3rpx;
}
</style> 