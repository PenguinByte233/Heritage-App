"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "TutorialCard",
  props: {
    tutorial: {
      type: Object,
      required: true
    },
    categoryName: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      progress: 0
    };
  },
  created() {
    const progressKey = `tutorial_progress_${this.tutorial.id}`;
    try {
      const savedProgress = common_vendor.index.getStorageSync(progressKey);
      if (savedProgress) {
        this.progress = parseInt(savedProgress);
      }
    } catch (e) {
      console.error("获取学习进度失败", e);
    }
  },
  methods: {
    handleClick() {
      this.$emit("click", this.tutorial);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.tutorial.video_url
  }, $props.tutorial.video_url ? {} : {}, {
    b: $props.tutorial.cover_url || "/static/images/default-tutorial.png",
    c: common_vendor.t($props.tutorial.title),
    d: common_vendor.t($props.categoryName),
    e: $data.progress > 0
  }, $data.progress > 0 ? {
    f: $data.progress + "%",
    g: common_vendor.t($data.progress)
  } : {}, {
    h: common_vendor.o((...args) => $options.handleClick && $options.handleClick(...args))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
