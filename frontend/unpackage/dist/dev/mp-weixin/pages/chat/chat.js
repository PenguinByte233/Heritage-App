"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      posts: [],
      isLoading: false,
      showForm: false,
      postContent: "",
      nickname: "游客",
      // 默认昵称，实际应从用户信息中获取
      userInfo: {}
      // 用户信息对象
    };
  },
  onLoad() {
    this.fetchPosts();
    this.getUserInfo();
  },
  onShow() {
    this.fetchPosts();
  },
  methods: {
    async fetchPosts() {
      this.isLoading = true;
      try {
        const response = await api_api.getPosts();
        if (response.status === "success" && response.data) {
          this.posts = response.data.map((post) => {
            if (!post.avatar_url) {
              post.avatar_url = "/static/images/avatar/空中花园.png";
            }
            return post;
          });
        } else {
          common_vendor.index.showToast({
            title: "获取帖子失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("获取帖子列表失败:", error);
        common_vendor.index.showToast({
          title: "获取帖子失败",
          icon: "none"
        });
      } finally {
        this.isLoading = false;
      }
    },
    getUserInfo() {
      try {
        const userInfoStr = common_vendor.index.getStorageSync("userInfo");
        if (userInfoStr) {
          try {
            this.userInfo = JSON.parse(userInfoStr);
          } catch (e) {
            this.userInfo = userInfoStr;
          }
          this.nickname = this.userInfo.nickname || "游客";
          console.log("获取到的用户信息:", this.userInfo);
        } else {
          console.log("未找到用户信息");
          this.userInfo = {};
          this.nickname = "游客";
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        this.userInfo = {};
        this.nickname = "游客";
      }
    },
    formatTime(timeStr) {
      if (!timeStr)
        return "";
      const date = new Date(timeStr);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      if (diff < 36e5) {
        const minutes = Math.floor(diff / 6e4);
        return minutes <= 0 ? "刚刚" : `${minutes}分钟前`;
      }
      if (diff < 864e5) {
        const hours = Math.floor(diff / 36e5);
        return `${hours}小时前`;
      }
      if (diff < 2592e6) {
        const days = Math.floor(diff / 864e5);
        return `${days}天前`;
      }
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;
    },
    navigateToDetail(post) {
      console.log("正在导航到帖子详情，帖子ID:", post.id);
      common_vendor.index.navigateTo({
        url: `./detail?id=${post.id}`,
        success: () => {
          console.log("导航成功");
        },
        fail: (err) => {
          console.error("导航失败:", err);
          common_vendor.index.showToast({
            title: "跳转失败",
            icon: "none"
          });
        }
      });
    },
    likePostFromList(post, event) {
      event.stopPropagation();
      if (!this.userInfo || !this.userInfo.id) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后再点赞",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
            }
          }
        });
        return;
      }
      this.navigateToDetail(post);
    },
    showPostForm() {
      this.getUserInfo();
      if (!this.userInfo || !this.userInfo.id) {
        console.log("用户未登录或信息不完整，需要登录");
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后再发布帖子",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
            }
          }
        });
        return;
      }
      console.log("用户已登录，显示发布表单");
      this.showForm = true;
    },
    hidePostForm() {
      this.showForm = false;
    },
    async submitPost() {
      if (!this.postContent.trim()) {
        common_vendor.index.showToast({
          title: "内容不能为空",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "发布中..."
        });
        const response = await api_api.createPost(this.nickname, this.postContent);
        common_vendor.index.hideLoading();
        if (response.status === "success") {
          common_vendor.index.showToast({
            title: "发布成功",
            icon: "success"
          });
          this.postContent = "";
          this.hidePostForm();
          this.fetchPosts();
        } else {
          common_vendor.index.showToast({
            title: response.message || "发布失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        console.error("发布帖子失败:", error);
        common_vendor.index.showToast({
          title: "发布失败，请稍后再试",
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.isLoading
  }, $data.isLoading ? {} : {}, {
    b: common_vendor.f($data.posts, (post, index, i0) => {
      return {
        a: post.avatar_url || "/static/images/avatar/空中花园.png",
        b: common_vendor.t(post.author_name),
        c: common_vendor.t($options.formatTime(post.created_at)),
        d: common_vendor.t(post.content),
        e: common_vendor.t(post.comment_count || 0),
        f: common_vendor.o(($event) => $options.navigateToDetail(post), post.id),
        g: common_vendor.t(post.like_count || 0),
        h: common_vendor.o(($event) => $options.likePostFromList(post, $event), post.id),
        i: post.id,
        j: common_vendor.o(($event) => $options.navigateToDetail(post), post.id)
      };
    }),
    c: !$data.isLoading && $data.posts.length === 0
  }, !$data.isLoading && $data.posts.length === 0 ? {
    d: common_assets._imports_0$2,
    e: common_vendor.o((...args) => $options.showPostForm && $options.showPostForm(...args))
  } : {}, {
    f: common_vendor.o((...args) => $options.showPostForm && $options.showPostForm(...args)),
    g: $data.showForm
  }, $data.showForm ? {
    h: common_vendor.o((...args) => $options.hidePostForm && $options.hidePostForm(...args)),
    i: $data.userInfo.avatar_url || "/static/images/avatar/空中花园.png",
    j: common_vendor.t($data.nickname),
    k: $data.postContent,
    l: common_vendor.o(($event) => $data.postContent = $event.detail.value),
    m: common_vendor.t($data.postContent.length),
    n: common_vendor.o((...args) => $options.submitPost && $options.submitPost(...args)),
    o: !$data.postContent.trim(),
    p: common_vendor.o(() => {
    }),
    q: common_vendor.o((...args) => $options.hidePostForm && $options.hidePostForm(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
