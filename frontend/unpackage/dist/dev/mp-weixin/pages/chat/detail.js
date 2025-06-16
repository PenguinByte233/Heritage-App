"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      id: null,
      post: null,
      isLoading: false,
      commentContent: "",
      commentFocus: false,
      userId: 1,
      // 默认用户ID，实际应从登录状态获取
      nickname: "游客",
      // 默认昵称，实际应从登录状态获取
      liked: false,
      likeCount: 0,
      userInfo: {},
      // 用户信息
      avatarUrl: "/static/images/avatar/空中花园.png"
      // 用户头像
    };
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id;
      this.fetchPostDetail();
    }
    this.getUserInfo();
  },
  methods: {
    async fetchPostDetail() {
      this.isLoading = true;
      try {
        const response = await api_api.getPostDetail(this.id);
        if (response.status === "success" && response.data) {
          this.post = response.data;
          this.likeCount = this.post.like_count || 0;
          if (!this.post.avatar_url) {
            this.post.avatar_url = "/static/images/avatar/空中花园.png";
          }
          if (this.post.comments && Array.isArray(this.post.comments)) {
            this.post.comments.forEach((comment) => {
              if (!comment.avatar_url) {
                comment.avatar_url = "/static/images/avatar/空中花园.png";
              }
            });
          }
          this.checkLikeStatus();
        } else {
          common_vendor.index.showToast({
            title: "获取帖子详情失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("获取帖子详情失败:", error);
        common_vendor.index.showToast({
          title: "获取帖子详情失败",
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
          console.log("获取到的用户信息:", this.userInfo);
          this.userId = this.userInfo.id || 1;
          this.nickname = this.userInfo.nickname || "游客";
          this.avatarUrl = this.userInfo.avatar_url || "/static/images/avatar/空中花园.png";
        } else {
          console.log("未找到用户信息");
          this.userInfo = {};
          this.userId = 1;
          this.nickname = "游客";
          this.avatarUrl = "/static/images/avatar/空中花园.png";
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        this.userInfo = {};
        this.userId = 1;
        this.nickname = "游客";
        this.avatarUrl = "/static/images/avatar/空中花园.png";
      }
    },
    async checkLikeStatus() {
      try {
        const response = await api_api.checkLiked(this.id, this.userId);
        if (response.status === "success" && response.data) {
          this.liked = response.data.liked;
        }
      } catch (error) {
        console.error("检查点赞状态失败:", error);
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
    focusComment() {
      if (!this.userInfo || !this.userInfo.id) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后再发表评论",
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
      this.commentFocus = true;
    },
    async submitComment() {
      if (!this.commentContent.trim()) {
        common_vendor.index.showToast({
          title: "评论内容不能为空",
          icon: "none"
        });
        return;
      }
      if (!this.userInfo || !this.userInfo.id) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后再发表评论",
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
      try {
        common_vendor.index.showLoading({
          title: "发送中..."
        });
        const author_name = this.userInfo.nickname || this.nickname;
        console.log("发送评论，作者：", author_name);
        const response = await api_api.addComment(this.id, author_name, this.commentContent);
        common_vendor.index.hideLoading();
        if (response.status === "success") {
          common_vendor.index.showToast({
            title: "评论成功",
            icon: "success",
            duration: 2e3
          });
          this.commentContent = "";
          setTimeout(() => {
            this.fetchPostDetail();
          }, 1e3);
        } else {
          common_vendor.index.showToast({
            title: response.message || "评论失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        console.error("评论失败:", error);
        common_vendor.index.showToast({
          title: "评论失败，请稍后再试",
          icon: "none"
        });
      }
    },
    async toggleLike() {
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
      try {
        const response = await api_api.likePost(this.id, this.userId);
        if (response.status === "success") {
          this.liked = response.data.liked;
          if (this.liked) {
            this.likeCount++;
          } else {
            this.likeCount = Math.max(0, this.likeCount - 1);
          }
          common_vendor.index.showToast({
            title: this.liked ? "点赞成功" : "取消点赞",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: response.message || "操作失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("点赞操作失败:", error);
        common_vendor.index.showToast({
          title: "操作失败，请稍后再试",
          icon: "none"
        });
      }
    },
    sharePost() {
      common_vendor.index.showToast({
        title: "分享功能即将上线",
        icon: "none"
      });
    },
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.post
  }, $data.post ? {
    c: $data.post.avatar_url || "/static/images/avatar/空中花园.png",
    d: common_vendor.t($data.post.author_name),
    e: common_vendor.t($options.formatTime($data.post.created_at)),
    f: common_vendor.t($data.post.content),
    g: $data.liked ? 1 : "",
    h: common_vendor.t($data.liked ? "已点赞" : "点赞"),
    i: $data.liked ? 1 : "",
    j: common_vendor.t($data.likeCount),
    k: common_vendor.o((...args) => $options.toggleLike && $options.toggleLike(...args)),
    l: common_vendor.t($data.post.comments ? $data.post.comments.length : 0),
    m: common_vendor.o((...args) => $options.focusComment && $options.focusComment(...args)),
    n: common_vendor.o((...args) => $options.sharePost && $options.sharePost(...args))
  } : {}, {
    o: common_vendor.t($data.post && $data.post.comments ? $data.post.comments.length : 0),
    p: $data.post && $data.post.comments
  }, $data.post && $data.post.comments ? common_vendor.e({
    q: common_vendor.f($data.post.comments, (comment, index, i0) => {
      return {
        a: comment.avatar_url || "/static/images/avatar/空中花园.png",
        b: common_vendor.t(comment.author_name),
        c: common_vendor.t($options.formatTime(comment.created_at)),
        d: common_vendor.t(comment.content),
        e: index
      };
    }),
    r: $data.post && $data.post.comments.length === 0
  }, $data.post && $data.post.comments.length === 0 ? {
    s: common_assets._imports_0$3
  } : {}) : {}, {
    t: $data.commentFocus,
    v: common_vendor.o(($event) => $data.commentFocus = false),
    w: common_vendor.o((...args) => $options.submitComment && $options.submitComment(...args)),
    x: $data.commentContent,
    y: common_vendor.o(($event) => $data.commentContent = $event.detail.value),
    z: common_vendor.o((...args) => $options.submitComment && $options.submitComment(...args)),
    A: !$data.commentContent.trim(),
    B: $data.isLoading
  }, $data.isLoading ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
