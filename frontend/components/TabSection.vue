<template>
  <view class="tab-section">
    <!-- Tab标题栏 -->
    <view class="tab-header">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-item"
        :class="{'active': currentTab === index}"
        @tap="switchTab(index)">
        {{ tab.title }}
      </view>
    </view>
    
    <!-- Tab内容区 -->
    <view class="tab-content">
      <slot :name="'content-' + currentTab"></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TabSection',
  props: {
    // Tab项数据
    tabs: {
      type: Array,
      default: () => []
    },
    // 默认选中的Tab
    defaultTab: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      currentTab: this.defaultTab
    }
  },
  methods: {
    switchTab(index) {
      this.currentTab = index;
      this.$emit('change', index);
    }
  }
}
</script>

<style>
.tab-section {
  width: 100%;
}

.tab-header {
  display: flex;
  width: 100%;
  border-bottom: 1px solid #eee;
}

.tab-item {
  flex: 1;
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-size: 14px;
  color: #333;
  position: relative;
}

.tab-item.active {
  color: #d4237a;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 3px;
  background-color: #d4237a;
  border-radius: 3px;
}

.tab-content {
  padding: 15px;
}
</style> 