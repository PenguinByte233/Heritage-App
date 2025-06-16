"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "PostItem",
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleClick() {
      this.$emit("click", this.post);
    },
    handleLike() {
      this.$emit("like", this.post);
    },
    handleComment() {
      this.$emit("comment", this.post);
    },
    handleShare() {
      common_vendor.index.showShareMenu({
        withShareTicket: true
      });
      this.$emit("share", this.post);
    },
    formatTime(dateString) {
      if (!dateString)
        return "";
      const date = new Date(dateString);
      const now = /* @__PURE__ */ new Date();
      const diff = now.getTime() - date.getTime();
      if (diff < 60 * 1e3) {
        return "刚刚";
      }
      if (diff < 60 * 60 * 1e3) {
        return Math.floor(diff / (60 * 1e3)) + "分钟前";
      }
      if (diff < 24 * 60 * 60 * 1e3) {
        return Math.floor(diff / (60 * 60 * 1e3)) + "小时前";
      }
      if (diff < 7 * 24 * 60 * 60 * 1e3) {
        return Math.floor(diff / (24 * 60 * 60 * 1e3)) + "天前";
      }
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $props.post.avatar_url || "/static/images/default-avatar.png",
    b: common_vendor.t($props.post.nickname || "匿名用户"),
    c: common_vendor.t($options.formatTime($props.post.created_at)),
    d: common_vendor.t($props.post.title),
    e: common_vendor.t($props.post.content),
    f: common_vendor.t($props.post.likes || 0),
    g: common_vendor.o((...args) => $options.handleLike && $options.handleLike(...args)),
    h: common_vendor.t($props.post.comments || 0),
    i: common_vendor.o((...args) => $options.handleComment && $options.handleComment(...args)),
    j: common_vendor.o((...args) => $options.handleShare && $options.handleShare(...args)),
    k: common_vendor.o((...args) => $options.handleClick && $options.handleClick(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
