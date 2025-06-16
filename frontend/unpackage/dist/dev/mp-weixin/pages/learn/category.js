"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
const _sfc_main = {
  data() {
    return {
      title: "",
      subtitleList: [],
      isLoading: false
    };
  },
  onLoad(options) {
    if (options.title) {
      this.title = decodeURIComponent(options.title);
      this.fetchSubtitles();
    }
  },
  onShow() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage && currentPage.options && currentPage.options.autoScroll === "true") {
      setTimeout(() => {
        common_vendor.index.pageScrollTo({
          scrollTop: 0,
          duration: 300
        });
        common_vendor.index.showToast({
          title: `已定位到${this.title}`,
          icon: "none",
          duration: 1500
        });
      }, 500);
    }
  },
  methods: {
    async fetchSubtitles() {
      this.isLoading = true;
      try {
        const response = await api_api.getLearningHeaders(this.title);
        if (response.status === "success" && response.data) {
          this.subtitleList = response.data;
        } else {
          common_vendor.index.showToast({
            title: "获取数据失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("获取小标题列表失败:", error);
        common_vendor.index.showToast({
          title: "获取数据失败",
          icon: "none"
        });
      } finally {
        this.isLoading = false;
      }
    },
    navigateToContent(item) {
      common_vendor.index.navigateTo({
        url: `/pages/learn/content?subtitle=${encodeURIComponent(item.subtitle)}`
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
    b: common_vendor.t($data.title),
    c: common_vendor.f($data.subtitleList, (item, index, i0) => {
      return {
        a: item.image_url,
        b: common_vendor.t(item.subtitle),
        c: index,
        d: common_vendor.o(($event) => $options.navigateToContent(item), index)
      };
    }),
    d: $data.isLoading
  }, $data.isLoading ? {} : {}, {
    e: !$data.isLoading && $data.subtitleList.length === 0
  }, !$data.isLoading && $data.subtitleList.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
