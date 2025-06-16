<template>
  <view class="category-scroll-container">
    <scroll-view scroll-x class="category-scroll" show-scrollbar="false">
      <view 
        v-for="(item, index) in categories" 
        :key="index"
        class="category-item"
        :class="{'active': activeIndex === index}"
        @tap="handleSelect(index, item)">
        <image :src="item.imageUrl || '/static/images/default-category.png'" class="category-icon"></image>
        <text class="category-name">{{item.name}}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'CategoryScroll',
  props: {
    // 分类数据
    categories: {
      type: Array,
      default: () => []
    },
    // 默认选中项
    defaultActive: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      activeIndex: this.defaultActive
    }
  },
  methods: {
    handleSelect(index, item) {
      this.activeIndex = index;
      this.$emit('select', item, index);
    }
  }
}
</script>

<style>
.category-scroll-container {
  width: 100%;
  padding: 10px 0;
}

.category-scroll {
  white-space: nowrap;
  width: 100%;
}

.category-item {
  display: inline-block;
  padding: 10px;
  flex-direction: column;
  align-items: center;
  margin-right: 15px;
  width: 80px;
  text-align: center;
}

.category-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.category-name {
  font-size: 12px;
  margin-top: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.active {
  color: #d4237a;
}

.active .category-icon {
  border: 2px solid #d4237a;
}
</style> 