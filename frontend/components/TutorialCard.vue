<template>
  <view class="tutorial-card" @tap="handleClick">
    <view class="tutorial-type-tag" v-if="tutorial.video_url">视频教程</view>
    <view class="tutorial-type-tag image-type" v-else>图文教程</view>
    
    <image 
      :src="tutorial.cover_url || '/static/images/default-tutorial.png'" 
      class="tutorial-image" 
      mode="aspectFill"
    ></image>
    
    <view class="tutorial-info">
      <text class="tutorial-title">{{ tutorial.title }}</text>
      <view class="tutorial-bottom">
        <text class="tutorial-category">{{ categoryName }}</text>
        <view class="progress-container" v-if="progress > 0">
          <view class="progress-bar" :style="{width: progress + '%'}"></view>
          <text class="progress-text">{{ progress }}%</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TutorialCard',
  props: {
    tutorial: {
      type: Object,
      required: true
    },
    categoryName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      progress: 0
    }
  },
  created() {
    // 从本地存储获取学习进度
    const progressKey = `tutorial_progress_${this.tutorial.id}`;
    try {
      const savedProgress = uni.getStorageSync(progressKey);
      if (savedProgress) {
        this.progress = parseInt(savedProgress);
      }
    } catch (e) {
      console.error('获取学习进度失败', e);
    }
  },
  methods: {
    handleClick() {
      this.$emit('click', this.tutorial);
    }
  }
}
</script>

<style>
.tutorial-card {
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
  position: relative;
}

.tutorial-type-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #d4237a;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1;
}

.tutorial-type-tag.image-type {
  background-color: #2e7d32;
}

.tutorial-image {
  width: 100%;
  height: 160px;
}

.tutorial-info {
  padding: 10px;
}

.tutorial-title {
  font-size: 16px;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
}

.tutorial-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tutorial-category {
  color: #666;
  font-size: 12px;
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 10px;
}

.progress-container {
  width: 100px;
  height: 6px;
  background-color: #eee;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background-color: #d4237a;
}

.progress-text {
  position: absolute;
  right: -30px;
  top: -5px;
  font-size: 12px;
  color: #d4237a;
}
</style> 