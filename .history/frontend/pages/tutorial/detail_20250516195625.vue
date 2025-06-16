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
    
    <!-- 内容区域 -->
    <scroll-view scroll-y class="content-scroll">
      <!-- 头部图片 -->
      <view class="header-image-container">
        <image :src="tutorialData.cover_url" mode="aspectFill" class="header-image"></image>
        <view class="header-info">
          <text class="header-title">{{tutorialData.title}}</text>
        </view>
      </view>
      
      <!-- 缩略图滑动区域 -->
      <scroll-view scroll-x class="thumbnail-scroll" show-scrollbar="false">
        <view 
          v-for="(img, index) in tutorialData.images" 
          :key="index"
          class="thumbnail-item"
          :class="{'active': activeImageIndex === index}"
          @tap="changeMainImage(index)">
          <image :src="img" mode="aspectFill" class="thumbnail-image"></image>
        </view>
      </scroll-view>
      
      <!-- 内容详情 -->
      <view class="content-details">
        <text class="content-title">{{tutorialData.title}}</text>
        <view class="article-container">
          <view v-for="(paragraph, index) in tutorialData.content" :key="index" class="paragraph">
            <text class="paragraph-text">{{paragraph}}</text>
          </view>
        </view>
      </view>
      
      <!-- 相关推荐 -->
      <view class="related-section" v-if="tutorialData.related && tutorialData.related.length > 0">
        <view class="section-header">
          <view class="section-title-container">
            <text class="section-title">相关推荐</text>
          </view>
        </view>
        
        <scroll-view scroll-x class="related-scroll" show-scrollbar="false">
          <view 
            v-for="(item, index) in tutorialData.related" 
            :key="index"
            class="related-item"
            @tap="navigateToTutorial(item)">
            <image :src="item.cover_url" mode="aspectFill" class="related-image"></image>
            <text class="related-title">{{item.title}}</text>
          </view>
        </scroll-view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      id: null,
      activeImageIndex: 0,
      tutorialData: {
        id: 101,
        title: '常山战鼓：千年古城的铿锵战歌',
        cover_url: '/static/images/learn/传统表演艺术/常山战鼓1.jpg',
        images: [
          '/static/images/learn/传统表演艺术/常山战鼓1.jpg',
          '/static/images/learn/传统表演艺术/常山战鼓2.jpg',
          '/static/images/learn/传统表演艺术/常山战鼓3.jpg',
          '/static/images/learn/传统表演艺术/常山战鼓4.jpg'
        ],
        content: [
          '在燕赵大地的苍茫历史中，常山战鼓如惊雷滚过岁月，叩击着中华文明的雄浑节拍。这一因正定古属常山郡而得名的民间锣鼓艺术，自战国雏形初现，历经宋元演艺鼎盛，至明代形成气势恢宏的表演体系，至今仍是北方鼓乐文化的活化石。',
          '金戈铁马的声响史诗常山战鼓以鼓、钹、锣等打击乐器构建声浪矩阵，少则数十人、多至数百人的表演阵容，如千军万马列阵。传统曲牌【大传帐】【霸王鞭】等 9 章 72 套曲目，通过紧凑鼓点与复杂变奏，模拟出点兵、列阵、厮杀等战争场景；新创【十面埋伏】【胜利凯旋】等阵势，则以现代艺术手法重构历史张力。演奏时，鼓手腾挪跳跃间鼓槌翻飞，钹镲撞击声穿云裂石，刚健的舞姿与震天的声响交织，重现了 "常山赵子龙" 的忠勇之气，被誉为 "中国北方鼓乐的活兵马俑"。',
          '农耕文明的节奏密码这门扎根河北农村的艺术，深植于民俗生活的肌理：嫁娶寿庆时，战鼓以欢快鼓点传递喜悦；节庆典礼上，雷霆万钧的阵列表演凝聚民心。东杨庄、西杨庄的传承村落中，家传与师徒相授的传统延续至今，老艺人手中的鼓谱不仅是音符的集合，更是农耕社会的集体记忆 —— 每一段曲牌都关联着节气更替、宗族仪轨，每一次腾跃都烙印着北方汉子的豪迈性情。',
          '从战国战场的助威呐喊到当代舞台的文化符号，常山战鼓以不变的铿锵节奏，丈量着中华文明的韧性。当鼓点在正定古城墙下响起，青砖黛瓦间回荡的不仅是音响的震撼，更是燕赵大地 "慷慨悲歌" 的精神传承，让千年历史在震天动地的节拍中，焕发出新的生命张力。'
        ],
        related: [
          {
            id: 102,
            title: '龙舞表演艺术入门',
            cover_url: '/static/images/learn/传统表演艺术/龙舞1.jpg'
          },
          {
            id: 103,
            title: '舞狮技艺详解',
            cover_url: '/static/images/learn/传统表演艺术/舞狮1.jpg'
          },
          {
            id: 104,
            title: '二人转基本功训练',
            cover_url: '/static/images/learn/传统表演艺术/二人转1.jpg'
          }
        ]
      }
    }
  },
  onLoad(options) {
    // 获取传递的教程ID
    if (options.id) {
      this.id = options.id;
      // 真实环境中，应该根据ID从API获取数据
      // this.fetchTutorialData(this.id);
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    changeMainImage(index) {
      this.activeImageIndex = index;
      this.tutorialData.cover_url = this.tutorialData.images[index];
    },
    navigateToTutorial(item) {
      uni.navigateTo({
        url: `/pages/tutorial/detail?id=${item.id}`
      });
    },
    fetchTutorialData(id) {
      // 模拟API请求获取教程数据
      // 实际开发中，这里应当调用真实的API接口
      uni.showLoading({
        title: '加载中...'
      });
      
      setTimeout(() => {
        // 模拟数据已加载
        uni.hideLoading();
      }, 500);
    }
  }
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.custom-nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 44px 15px 10px; /* 上边距根据状态栏高度调整 */
  background: linear-gradient(135deg, #f0e6d2 0%, #e5c49d 100%);
  box-shadow: 0 2px 10px rgba(109, 65, 38, 0.15);
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
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

.thumbnail-scroll {
  white-space: nowrap;
  padding: 15px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.thumbnail-item {
  display: inline-block;
  width: 80px;
  height: 60px;
  margin-right: 10px;
  border-radius: 4px;
  overflow: hidden;
  opacity: 0.7;
  transition: all 0.3s;
}

.thumbnail-item.active {
  opacity: 1;
  border: 2px solid #6d4126;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
}

.content-details {
  padding: 20px 15px;
  background-color: #fff;
  margin-bottom: 10px;
}

.content-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.article-container {
  margin-top: 10px;
}

.paragraph {
  margin-bottom: 15px;
}

.paragraph-text {
  font-size: 16px;
  color: #444;
  line-height: 1.7;
  text-align: justify;
}

.related-section {
  background-color: #fff;
  padding: 15px 0;
  margin-bottom: 15px;
}

.section-header {
  padding: 0 15px 10px;
  border-bottom: 1px solid #f0f0f0;
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

.related-scroll {
  white-space: nowrap;
  padding: 15px;
}

.related-item {
  display: inline-block;
  width: 120px;
  margin-right: 15px;
}

.related-image {
  width: 120px;
  height: 80px;
  border-radius: 4px;
}

.related-title {
  font-size: 14px;
  color: #333;
  margin-top: 8px;
  display: block;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 40px;
}
</style> 