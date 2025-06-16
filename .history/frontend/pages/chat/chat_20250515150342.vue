<template>
  <view class="container">
    <!-- 标题栏 -->
    <view class="header">
      <text class="title">非遗社区</text>
      <button class="post-btn" @tap="handlePostNew">发布</button>
    </view>
    
    <!-- 分类筛选 -->
    <scroll-view scroll-x class="filter-scroll" show-scrollbar="false">
      <view 
        class="filter-item" 
        :class="{'active': selectedFilter === 'all'}"
        @tap="handleFilter('all')">
        全部
      </view>
      <view 
        class="filter-item" 
        :class="{'active': selectedFilter === 'hot'}"
        @tap="handleFilter('hot')">
        热门
      </view>
      <view 
        class="filter-item" 
        :class="{'active': selectedFilter === 'new'}"
        @tap="handleFilter('new')">
        最新
      </view>
      <view 
        class="filter-item" 
        :class="{'active': selectedFilter === 'follow'}"
        @tap="handleFilter('follow')">
        关注
      </view>
    </scroll-view>
    
    <!-- 帖子列表 -->
    <view class="post-list">
      <post-item 
        v-for="(item, index) in posts" 
        :key="index" 
        :post="item"
        @click="handlePostClick"
        @like="handleLike"
        @comment="handleComment"
        @share="handleShare"
      ></post-item>
      
      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMore" @tap="loadMore">
        加载更多
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="posts.length === 0">
        <image src="/static/images/empty-posts.png" class="empty-image"></image>
        <text class="empty-text">暂无相关帖子</text>
        <button class="empty-btn" @tap="handlePostNew">发布第一个帖子</button>
      </view>
    </view>
    
    <!-- 发布新帖弹窗 -->
    <view class="post-modal" v-if="showPostModal">
      <view class="modal-mask" @tap="handleCloseModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">发布新帖</text>
          <text class="modal-close" @tap="handleCloseModal">×</text>
        </view>
        
        <view class="modal-body">
          <input 
            type="text" 
            class="post-title-input" 
            placeholder="请输入标题..." 
            v-model="newPost.title"
          />
          <textarea 
            class="post-content-input" 
            placeholder="分享你的非遗故事..." 
            v-model="newPost.content"
          ></textarea>
          
          <view class="post-actions">
            <button class="action-btn">
              <text class="iconfont">📷</text>
              <text>添加图片</text>
            </button>
            <button class="action-btn">
              <text class="iconfont">📹</text>
              <text>添加视频</text>
            </button>
            <button class="action-btn">
              <text class="iconfont">📌</text>
              <text>添加位置</text>
            </button>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="cancel-btn" @tap="handleCloseModal">取消</button>
          <button class="submit-btn" @tap="handleSubmitPost" :disabled="!canSubmit">发布</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import PostItem from '@/components/PostItem';
import { getPosts, createPost } from '@/api/api';

export default {
  components: {
    PostItem
  },
  data() {
    return {
      selectedFilter: 'all',
      posts: [],
      page: 1,
      hasMore: true,
      showPostModal: false,
      newPost: {
        title: '',
        content: ''
      }
    }
  },
  computed: {
    canSubmit() {
      return this.newPost.title.trim() && this.newPost.content.trim();
    }
  },
  onLoad() {
    this.loadPosts();
  },
  methods: {
    async loadPosts() {
      try {
        uni.showLoading({ title: '加载中' });
        // 实际项目中，应该从API获取数据
        // const res = await getPosts(this.page, 10, this.selectedFilter);
        // this.posts = [...this.posts, ...res.data.items];
        // this.hasMore = this.posts.length < res.data.total;
        
        // 模拟数据
        setTimeout(() => {
          const mockPosts = [
            {
              id: 1,
              user_id: 101,
              nickname: '非遗爱好者',
              avatar_url: '/static/images/avatar1.png',
              title: '传统苏绣技艺心得分享',
              content: '学习苏绣已经三年了，今天分享一些关于针法的心得体会...',
              created_at: '2023-05-10T14:30:00',
              likes: 24,
              comments: 8
            },
            {
              id: 2,
              user_id: 102,
              nickname: '剪纸大师',
              avatar_url: '/static/images/avatar2.png',
              title: '新手剪纸常见问题解答',
              content: '很多新手在学习剪纸时会遇到一些困惑，今天我来解答几个常见问题...',
              created_at: '2023-05-15T09:15:00',
              likes: 36,
              comments: 15
            },
            {
              id: 3,
              user_id: 103,
              nickname: '陶艺创作者',
              avatar_url: '/static/images/avatar3.png',
              title: '参观了景德镇非遗展览',
              content: '周末去景德镇参观了一场非遗展览，看到了许多精美的陶瓷作品，分享一些照片和感受...',
              created_at: '2023-05-18T16:45:00',
              likes: 42,
              comments: 12
            },
            {
              id: 4,
              user_id: 104,
              nickname: '传统文化研究者',
              avatar_url: '/static/images/avatar4.png',
              title: '非遗传承面临的挑战与机遇',
              content: '近年来，非物质文化遗产的保护与传承面临诸多挑战，同时也有新的机遇...',
              created_at: '2023-05-20T11:20:00',
              likes: 18,
              comments: 7
            }
          ];
          
          if (this.page === 1) {
            this.posts = mockPosts;
          } else {
            this.posts = [...this.posts, ...mockPosts];
          }
          
          this.hasMore = this.page < 3; // 模拟只有3页数据
          this.page++;
          
          uni.hideLoading();
        }, 1000);
      } catch (error) {
        console.error('加载帖子列表失败', error);
        uni.hideLoading();
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        });
      }
    },
    handleFilter(filter) {
      this.selectedFilter = filter;
      this.page = 1;
      this.posts = [];
      this.loadPosts();
    },
    loadMore() {
      if (this.hasMore) {
        this.loadPosts();
      }
    },
    handlePostClick(post) {
      uni.navigateTo({
        url: `/pages/post/detail?id=${post.id}`
      });
    },
    handleLike(post) {
      // 实际应用中，应该调用API点赞
      // 这里简单处理，直接增加点赞数
      const index = this.posts.findIndex(item => item.id === post.id);
      if (index !== -1) {
        this.posts[index].likes++;
      }
    },
    handleComment(post) {
      uni.navigateTo({
        url: `/pages/post/detail?id=${post.id}&showComment=true`
      });
    },
    handleShare(post) {
      // 微信小程序分享功能
      console.log('分享帖子:', post);
    },
    handlePostNew() {
      this.showPostModal = true;
    },
    handleCloseModal() {
      this.showPostModal = false;
    },
    async handleSubmitPost() {
      if (!this.canSubmit) return;
      
      try {
        uni.showLoading({ title: '发布中' });
        
        // 获取当前用户信息（实际应用中可能从缓存或全局状态获取）
        const userId = 100; // 模拟用户ID
        
        // 实际项目中，应该调用API发布帖子
        // await createPost(userId, this.newPost.title, this.newPost.content);
        
        // 模拟发布成功
        setTimeout(() => {
          // 添加到帖子列表顶部
          this.posts.unshift({
            id: new Date().getTime(), // 临时ID
            user_id: userId,
            nickname: '当前用户',
            avatar_url: '/static/images/default-avatar.png',
            title: this.newPost.title,
            content: this.newPost.content,
            created_at: new Date().toISOString(),
            likes: 0,
            comments: 0
          });
          
          // 重置表单
          this.newPost.title = '';
          this.newPost.content = '';
          
          // 关闭弹窗
          this.showPostModal = false;
          
          uni.hideLoading();
          uni.showToast({
            title: '发布成功',
            icon: 'success'
          });
        }, 1000);
      } catch (error) {
        console.error('发布帖子失败', error);
        uni.hideLoading();
        uni.showToast({
          title: '发布失败',
          icon: 'none'
        });
      }
    }
  }
}
</script>

<style>
.container {
  padding: 0 0 20px 0;
  position: relative;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.post-btn {
  background-color: #d4237a;
  color: white;
  font-size: 14px;
  width: 80px;
  height: 36px;
  line-height: 36px;
  border-radius: 18px;
}

.filter-scroll {
  width: 100%;
  white-space: nowrap;
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-item {
  display: inline-block;
  padding: 5px 12px;
  margin-right: 10px;
  font-size: 14px;
  border-radius: 15px;
  background-color: #f5f5f5;
}

.filter-item.active {
  background-color: #d4237a;
  color: #fff;
}

.post-list {
  padding: 15px;
}

.load-more {
  text-align: center;
  padding: 15px;
  color: #999;
  font-size: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.empty-image {
  width: 150px;
  height: 150px;
  margin-bottom: 15px;
}

.empty-text {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}

.empty-btn {
  background-color: #d4237a;
  color: white;
  font-size: 14px;
  width: 200px;
  height: 40px;
  line-height: 40px;
  border-radius: 20px;
}

/* 发布新帖弹窗 */
.post-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
}

.modal-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 12px 12px 0 0;
  padding: 15px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
}

.modal-title {
  font-size: 16px;
  font-weight: bold;
}

.modal-close {
  font-size: 24px;
  color: #999;
}

.modal-body {
  padding: 15px 0;
}

.post-title-input {
  width: 100%;
  height: 40px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 16px;
  margin-bottom: 15px;
}

.post-content-input {
  width: 100%;
  height: 150px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
  font-size: 14px;
  margin-bottom: 15px;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: transparent;
  font-size: 12px;
  color: #666;
  line-height: 1.2;
  padding: 5px 0;
}

.action-btn .iconfont {
  font-size: 24px;
  margin-bottom: 5px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
}

.cancel-btn, .submit-btn {
  width: 45%;
  height: 40px;
  line-height: 40px;
  border-radius: 20px;
  font-size: 16px;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.submit-btn {
  background-color: #d4237a;
  color: white;
}

.submit-btn[disabled] {
  background-color: #f8c8dd;
  color: white;
}
</style> 