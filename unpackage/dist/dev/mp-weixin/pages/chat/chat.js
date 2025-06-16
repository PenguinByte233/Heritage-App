"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const PostItem = () => "../../components/PostItem.js";
const _sfc_main = {
  components: {
    PostItem
  },
  data() {
    return {
      selectedFilter: "all",
      posts: [],
      page: 1,
      hasMore: true,
      showPostModal: false,
      newPost: {
        title: "",
        content: ""
      }
    };
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
        common_vendor.index.showLoading({ title: "加载中" });
        setTimeout(() => {
          const mockPosts = [
            {
              id: 1,
              user_id: 101,
              nickname: "非遗爱好者",
              avatar_url: "/static/images/avatar1.png",
              title: "传统苏绣技艺心得分享",
              content: "学习苏绣已经三年了，今天分享一些关于针法的心得体会...",
              created_at: "2023-05-10T14:30:00",
              likes: 24,
              comments: 8
            },
            {
              id: 2,
              user_id: 102,
              nickname: "剪纸大师",
              avatar_url: "/static/images/avatar2.png",
              title: "新手剪纸常见问题解答",
              content: "很多新手在学习剪纸时会遇到一些困惑，今天我来解答几个常见问题...",
              created_at: "2023-05-15T09:15:00",
              likes: 36,
              comments: 15
            },
            {
              id: 3,
              user_id: 103,
              nickname: "陶艺创作者",
              avatar_url: "/static/images/avatar3.png",
              title: "参观了景德镇非遗展览",
              content: "周末去景德镇参观了一场非遗展览，看到了许多精美的陶瓷作品，分享一些照片和感受...",
              created_at: "2023-05-18T16:45:00",
              likes: 42,
              comments: 12
            },
            {
              id: 4,
              user_id: 104,
              nickname: "传统文化研究者",
              avatar_url: "/static/images/avatar4.png",
              title: "非遗传承面临的挑战与机遇",
              content: "近年来，非物质文化遗产的保护与传承面临诸多挑战，同时也有新的机遇...",
              created_at: "2023-05-20T11:20:00",
              likes: 18,
              comments: 7
            }
          ];
          if (this.page === 1) {
            this.posts = mockPosts;
          } else {
            this.posts = [...this.posts, ...mockPosts];
          }
          this.hasMore = this.page < 3;
          this.page++;
          common_vendor.index.hideLoading();
        }, 1e3);
      } catch (error) {
        console.error("加载帖子列表失败", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "加载数据失败",
          icon: "none"
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
      common_vendor.index.navigateTo({
        url: `/pages/post/detail?id=${post.id}`
      });
    },
    handleLike(post) {
      const index = this.posts.findIndex((item) => item.id === post.id);
      if (index !== -1) {
        this.posts[index].likes++;
      }
    },
    handleComment(post) {
      common_vendor.index.navigateTo({
        url: `/pages/post/detail?id=${post.id}&showComment=true`
      });
    },
    handleShare(post) {
      console.log("分享帖子:", post);
    },
    handlePostNew() {
      this.showPostModal = true;
    },
    handleCloseModal() {
      this.showPostModal = false;
    },
    async handleSubmitPost() {
      if (!this.canSubmit)
        return;
      try {
        common_vendor.index.showLoading({ title: "发布中" });
        const userId = 100;
        setTimeout(() => {
          this.posts.unshift({
            id: (/* @__PURE__ */ new Date()).getTime(),
            // 临时ID
            user_id: userId,
            nickname: "当前用户",
            avatar_url: "/static/images/default-avatar.png",
            title: this.newPost.title,
            content: this.newPost.content,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            likes: 0,
            comments: 0
          });
          this.newPost.title = "";
          this.newPost.content = "";
          this.showPostModal = false;
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "发布成功",
            icon: "success"
          });
        }, 1e3);
      } catch (error) {
        console.error("发布帖子失败", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "发布失败",
          icon: "none"
        });
      }
    }
  }
};
if (!Array) {
  const _component_post_item = common_vendor.resolveComponent("post-item");
  _component_post_item();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.handlePostNew && $options.handlePostNew(...args)),
    b: $data.selectedFilter === "all" ? 1 : "",
    c: common_vendor.o(($event) => $options.handleFilter("all")),
    d: $data.selectedFilter === "hot" ? 1 : "",
    e: common_vendor.o(($event) => $options.handleFilter("hot")),
    f: $data.selectedFilter === "new" ? 1 : "",
    g: common_vendor.o(($event) => $options.handleFilter("new")),
    h: $data.selectedFilter === "follow" ? 1 : "",
    i: common_vendor.o(($event) => $options.handleFilter("follow")),
    j: common_vendor.f($data.posts, (item, index, i0) => {
      return {
        a: index,
        b: common_vendor.o($options.handlePostClick, index),
        c: common_vendor.o($options.handleLike, index),
        d: common_vendor.o($options.handleComment, index),
        e: common_vendor.o($options.handleShare, index),
        f: "78ac4081-0-" + i0,
        g: common_vendor.p({
          post: item
        })
      };
    }),
    k: $data.hasMore
  }, $data.hasMore ? {
    l: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args))
  } : {}, {
    m: $data.posts.length === 0
  }, $data.posts.length === 0 ? {
    n: common_assets._imports_0$2,
    o: common_vendor.o((...args) => $options.handlePostNew && $options.handlePostNew(...args))
  } : {}, {
    p: $data.showPostModal
  }, $data.showPostModal ? {
    q: common_vendor.o((...args) => $options.handleCloseModal && $options.handleCloseModal(...args)),
    r: common_vendor.o((...args) => $options.handleCloseModal && $options.handleCloseModal(...args)),
    s: $data.newPost.title,
    t: common_vendor.o(($event) => $data.newPost.title = $event.detail.value),
    v: $data.newPost.content,
    w: common_vendor.o(($event) => $data.newPost.content = $event.detail.value),
    x: common_vendor.o((...args) => $options.handleCloseModal && $options.handleCloseModal(...args)),
    y: common_vendor.o((...args) => $options.handleSubmitPost && $options.handleSubmitPost(...args)),
    z: !$options.canSubmit
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
