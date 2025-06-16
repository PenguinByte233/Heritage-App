<template>
  <view class="container">
    <!-- 顶部封面图 -->
    <view class="cover-container">
      <image :src="tutorial.cover_url" class="cover-image" mode="aspectFill"></image>
      <view class="back-button" @tap="goBack">
        <image src="/static/images/tabbar/home.png" class="back-icon"></image>
      </view>
      <view class="cover-overlay">
        <text class="tutorial-title">{{tutorial.title}}</text>
        <view class="tutorial-meta">
          <text class="tutorial-views">{{tutorial.views}}次学习</text>
        </view>
      </view>
    </view>
    
    <!-- 教程内容 -->
    <view class="content-container">
      <template v-if="tutorial.content && tutorial.content.sections">
        <view 
          v-for="(section, index) in tutorial.content.sections" 
          :key="index" 
          class="section">
          <text class="section-title">{{section.title}}</text>
          <image 
            v-if="section.image" 
            :src="section.image" 
            class="section-image" 
            mode="widthFix"></image>
          <text class="section-content">{{section.content}}</text>
        </view>
      </template>
      
      <template v-else>
        <!-- 通用展示，未使用sections结构 -->
        <view class="section">
          <text class="section-content">{{tutorial.description}}</text>
        </view>
      </template>
    </view>
    
    <!-- 底部工具栏 -->
    <view class="toolbar">
      <view class="toolbar-item">
        <image src="/static/images/tabbar/home.png" class="toolbar-icon"></image>
        <text class="toolbar-text">收藏</text>
      </view>
      <view class="toolbar-item">
        <image src="/static/images/tabbar/home.png" class="toolbar-icon"></image>
        <text class="toolbar-text">分享</text>
      </view>
      <view class="toolbar-button" @tap="startLearning">
        <text class="toolbar-button-text">开始学习</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      id: null,
      tutorial: {
        title: '',
        cover_url: '',
        views: 0,
        description: '',
        content: null
      }
    }
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id;
      this.getTutorialDetail();
    }
  },
  methods: {
    getTutorialDetail() {
      // 实际项目中，这里会调用API获取教程详情
      // 模拟获取数据
      const tutorials = [
        {
          id: '101',
          title: '常山战鼓：千年古城的铿锵战歌',
          cover_url: '/static/images/learn/传统表演艺术/常山战鼓1.jpg',
          views: 2568,
          category: 1,
          subcategory: 101,
          description: '在燕赵大地的苍茫历史中，常山战鼓如惊雷滚过岁月，叩击着中华文明的雄浑节拍。',
          content: {
            title: '常山战鼓：千年古城的铿锵战歌',
            sections: [
              {
                title: '历史渊源',
                content: '在燕赵大地的苍茫历史中，常山战鼓如惊雷滚过岁月，叩击着中华文明的雄浑节拍。这一因正定古属常山郡而得名的民间锣鼓艺术，自战国雏形初现，历经宋元演艺鼎盛，至明代形成气势恢宏的表演体系，至今仍是北方鼓乐文化的活化石。',
                image: '/static/images/learn/传统表演艺术/常山战鼓1.jpg'
              },
              {
                title: '金戈铁马的声响史诗',
                content: '常山战鼓以鼓、钹、锣等打击乐器构建声浪矩阵，少则数十人、多至数百人的表演阵容，如千军万马列阵。传统曲牌【大传帐】【霸王鞭】等 9 章 72 套曲目，通过紧凑鼓点与复杂变奏，模拟出点兵、列阵、厮杀等战争场景；新创【十面埋伏】【胜利凯旋】等阵势，则以现代艺术手法重构历史张力。演奏时，鼓手腾挪跳跃间鼓槌翻飞，钹镲撞击声穿云裂石，刚健的舞姿与震天的声响交织，重现了 "常山赵子龙" 的忠勇之气，被誉为 "中国北方鼓乐的活兵马俑"。',
                image: '/static/images/learn/传统表演艺术/常山战鼓2.jpg'
              },
              {
                title: '农耕文明的节奏密码',
                content: '这门扎根河北农村的艺术，深植于民俗生活的肌理：嫁娶寿庆时，战鼓以欢快鼓点传递喜悦；节庆典礼上，雷霆万钧的阵列表演凝聚民心。东杨庄、西杨庄的传承村落中，家传与师徒相授的传统延续至今，老艺人手中的鼓谱不仅是音符的集合，更是农耕社会的集体记忆 —— 每一段曲牌都关联着节气更替、宗族仪轨，每一次腾跃都烙印着北方汉子的豪迈性情。',
                image: '/static/images/learn/传统表演艺术/常山战鼓3.jpg'
              },
              {
                title: '文化传承与现代价值',
                content: '从战国战场的助威呐喊到当代舞台的文化符号，常山战鼓以不变的铿锵节奏，丈量着中华文明的韧性。当鼓点在正定古城墙下响起，青砖黛瓦间回荡的不仅是音响的震撼，更是燕赵大地 "慷慨悲歌" 的精神传承，让千年历史在震天动地的节拍中，焕发出新的生命张力。',
                image: '/static/images/learn/传统表演艺术/常山战鼓4.jpg'
              }
            ]
          }
        },
        {
          id: '102',
          title: '龙舞表演艺术入门',
          cover_url: '/static/images/learn/传统表演艺术/龙舞1.jpg',
          views: 2103,
          description: '龙舞是中国传统民间艺术，象征着吉祥与祈福。本教程帮助你了解龙舞的基本知识与表演技巧。'
        }
      ];
      
      // 查找对应ID的教程
      const tutorial = tutorials.find(item => item.id === this.id);
      if (tutorial) {
        this.tutorial = tutorial;
      }
    },
    goBack() {
      uni.navigateBack();
    },
    startLearning() {
      // 开始学习逻辑
      uni.showToast({
        title: '开始学习',
        icon: 'none'
      });
      
      // 实际项目中，这里可能需要记录学习进度
      // 或跳转到实际学习页面
    }
  }
}
</script>

<style>
.container {
  background-color: #f5f5f5;
  min-height: 100vh;
  position: relative;
  padding-bottom: 60px; /* 为底部工具栏留出空间 */
}

.cover-container {
  position: relative;
  height: 250px;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.back-button {
  position: absolute;
  left: 15px;
  top: 44px; /* 状态栏高度 */
  width: 36px;
  height: 36px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.back-icon {
  width: 20px;
  height: 20px;
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 15px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}

.tutorial-title {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.tutorial-meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
}

.tutorial-views {
  color: rgba(255,255,255,0.8);
  font-size: 12px;
}

.content-container {
  padding: 15px;
  background-color: #fff;
  border-radius: 15px 15px 0 0;
  margin-top: -15px;
  position: relative;
  z-index: 5;
}

.section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #6d4126;
  margin-bottom: 10px;
  display: block;
}

.section-image {
  width: 100%;
  border-radius: 8px;
  margin: 10px 0;
}

.section-content {
  font-size: 14px;
  color: #333;
  line-height: 1.8;
  text-align: justify;
}

.toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 15px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.toolbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
}

.toolbar-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 3px;
}

.toolbar-text {
  font-size: 12px;
  color: #666;
}

.toolbar-button {
  flex: 1;
  height: 40px;
  background-color: #6d4126;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

.toolbar-button-text {
  color: #fff;
  font-size: 15px;
  font-weight: bold;
}
</style> 