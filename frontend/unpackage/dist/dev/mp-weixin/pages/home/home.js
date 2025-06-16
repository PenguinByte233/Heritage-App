"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
const _sfc_main = {
  data() {
    return {
      currentProjectIndex: 0,
      bannerImages: [],
      categories: [
        {
          name: "首页",
          icon: "../../static/images/tabbar/museum.png",
          path: "/pages/home/home"
        },
        {
          name: "学习",
          icon: "../../static/images/tabbar/锤子.png",
          path: "/pages/learn/learn"
        },
        {
          name: "购买",
          icon: "../../static/images/tabbar/扇子.png",
          path: "/pages/buy/buy"
        },
        {
          name: "社区",
          icon: "../../static/images/tabbar/chat.png",
          path: "/pages/chat/chat"
        },
        {
          name: "我的",
          icon: "../../static/images/tabbar/profile.png",
          path: "/pages/profile/profile"
        }
      ],
      projectItems: [],
      mapImage: "",
      mapTitle: "中国非物质文化遗产分布",
      mapSubtitle: "点击查看详细分布",
      isLoading: true,
      statistics: {
        world: 42,
        national: 1557,
        provincial: 13087
      }
    };
  },
  onLoad() {
    this.fetchHomeResources();
    this.fetchMapResources();
  },
  methods: {
    // 获取首页资源
    async fetchHomeResources() {
      this.isLoading = true;
      try {
        console.log("开始获取首页资源...");
        const response = await api_api.getHomeResources();
        console.log("获取首页资源响应:", response);
        if (response && response.success && response.data) {
          console.log("获取首页资源成功");
          if (response.data.bannerImages && response.data.bannerImages.length > 0) {
            console.log("设置轮播图数据:", response.data.bannerImages);
            this.bannerImages = response.data.bannerImages.map((url) => api_api.processImageUrl(url));
          } else {
            console.warn("未获取到轮播图数据");
          }
          if (response.data.projectItems && response.data.projectItems.length > 0) {
            console.log("设置项目轮播图数据:", response.data.projectItems);
            this.projectItems = response.data.projectItems.map((item) => ({
              ...item,
              image: api_api.processImageUrl(item.image)
            }));
          } else {
            console.warn("未获取到项目轮播图数据");
          }
          if (response.data.mapImages && response.data.mapImages.length > 0) {
            const mapData = response.data.mapImages[0];
            console.log("设置地图数据:", mapData);
            this.mapImage = api_api.processImageUrl(mapData.image_url);
            this.mapTitle = mapData.title || "中国非物质文化遗产分布";
            this.mapSubtitle = mapData.description || "点击查看详细分布";
          } else {
            console.warn("未获取到地图数据");
          }
        } else {
          console.error("获取首页资源失败:", response);
          this.showErrorToast("获取首页资源失败");
        }
      } catch (error) {
        console.error("获取首页资源出错:", error);
        this.showErrorToast("获取首页资源出错");
      } finally {
        this.isLoading = false;
      }
    },
    // 获取地图详情资源
    async fetchMapResources() {
      try {
        console.log("开始获取地图详情资源...");
        const response = await api_api.getMapResources();
        console.log("获取地图详情资源响应:", response);
        if (response && response.success && response.data) {
          console.log("获取地图详情资源成功");
          if (response.data.statistics) {
            console.log("设置统计数据:", response.data.statistics);
            this.statistics = response.data.statistics;
          } else {
            console.warn("未获取到统计数据");
          }
          if (response.data.mapImages && response.data.mapImages.length > 0) {
            console.log("处理地图图片:", response.data.mapImages);
            response.data.mapImages = response.data.mapImages.map((url) => api_api.processImageUrl(url));
          }
        } else {
          console.error("获取地图资源失败:", response);
        }
      } catch (error) {
        console.error("获取地图资源出错:", error);
      }
    },
    // 显示错误提示
    showErrorToast(message) {
      common_vendor.index.showToast({
        title: message,
        icon: "none",
        duration: 2e3
      });
    },
    navigateToCategory(category) {
      common_vendor.index.switchTab({
        url: category.path
      });
    },
    navigateToLearn() {
      common_vendor.index.switchTab({
        url: "/pages/learn/learn"
      });
    },
    navigateToLearnCategory(item) {
      const learnCategories = [
        "传统表演艺术",
        "传统服饰",
        "传统节日与庆典",
        "传统乐器与音乐",
        "传统艺术与工艺",
        "传统装饰与配饰",
        "文化与创意产业"
      ];
      if (learnCategories.includes(item.title)) {
        console.log("准备跳转到学习页面，分类:", item.title);
        getApp().globalData = getApp().globalData || {};
        getApp().globalData.selectedCategory = item.title;
        getApp().globalData.needScrollToCategory = true;
        console.log("已设置全局变量:", getApp().globalData);
        setTimeout(() => {
          common_vendor.index.switchTab({
            url: "/pages/learn/learn",
            success: () => {
              console.log("已跳转到学习页面");
            },
            fail: (err) => {
              console.error("跳转到学习页面失败:", err);
            }
          });
        }, 50);
      } else {
        console.log("准备跳转到分类详情页:", item.title);
        common_vendor.index.navigateTo({
          url: `/pages/learn/category?title=${encodeURIComponent(item.title)}&autoScroll=true`,
          success: () => {
            console.log("已跳转到分类详情页");
          },
          fail: (err) => {
            console.error("导航失败:", err);
            common_vendor.index.showToast({
              title: "该分类暂未开放",
              icon: "none"
            });
          }
        });
      }
    },
    onProjectChange(e) {
      this.currentProjectIndex = e.detail.current;
    },
    showMapDetail() {
      common_vendor.index.navigateTo({
        url: "/pages/home/map-detail"
      });
    },
    showSearchTip() {
      common_vendor.index.showToast({
        title: "搜索功能开发中",
        icon: "none"
      });
    }
  }
};
if (!Array) {
  const _component_path = common_vendor.resolveComponent("path");
  const _component_svg = common_vendor.resolveComponent("svg");
  (_component_path + _component_svg)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.showSearchTip && $options.showSearchTip(...args)),
    b: common_vendor.f($data.bannerImages, (image, index, i0) => {
      return {
        a: image,
        b: index
      };
    }),
    c: common_vendor.f($data.categories, (item, index, i0) => {
      return {
        a: item.icon,
        b: common_vendor.t(item.name),
        c: index,
        d: common_vendor.o(($event) => $options.navigateToCategory(item), index)
      };
    }),
    d: common_vendor.p({
      d: "M12 22C12 22 20 16 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 16 12 22 12 22Z",
      stroke: "#6d4126",
      ["stroke-width"]: "2",
      ["stroke-linecap"]: "round",
      ["stroke-linejoin"]: "round"
    }),
    e: common_vendor.p({
      d: "M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z",
      stroke: "#6d4126",
      ["stroke-width"]: "2",
      ["stroke-linecap"]: "round",
      ["stroke-linejoin"]: "round"
    }),
    f: common_vendor.p({
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }),
    g: common_vendor.p({
      d: "M9 18L15 12L9 6",
      stroke: "#6d4126",
      ["stroke-width"]: "2",
      ["stroke-linecap"]: "round",
      ["stroke-linejoin"]: "round"
    }),
    h: common_vendor.p({
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }),
    i: common_vendor.o((...args) => $options.showMapDetail && $options.showMapDetail(...args)),
    j: $data.mapImage,
    k: common_vendor.o((...args) => $options.showMapDetail && $options.showMapDetail(...args)),
    l: common_vendor.t($data.mapTitle),
    m: common_vendor.t($data.mapSubtitle),
    n: common_vendor.t($data.statistics.world),
    o: common_vendor.t($data.statistics.national),
    p: common_vendor.t($data.statistics.provincial),
    q: common_vendor.p({
      d: "M12 8L16 12L12 16L8 12L12 8Z",
      stroke: "#6d4126",
      ["stroke-width"]: "2",
      ["stroke-linecap"]: "round",
      ["stroke-linejoin"]: "round"
    }),
    r: common_vendor.p({
      d: "M12 3L19 10L12 21L5 10L12 3Z",
      stroke: "#6d4126",
      ["stroke-width"]: "2",
      ["stroke-linecap"]: "round",
      ["stroke-linejoin"]: "round"
    }),
    s: common_vendor.p({
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }),
    t: common_vendor.p({
      d: "M9 18L15 12L9 6",
      stroke: "#6d4126",
      ["stroke-width"]: "2",
      ["stroke-linecap"]: "round",
      ["stroke-linejoin"]: "round"
    }),
    v: common_vendor.p({
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }),
    w: common_vendor.o((...args) => $options.navigateToLearn && $options.navigateToLearn(...args)),
    x: common_vendor.f($data.projectItems, (item, index, i0) => {
      return {
        a: item.image,
        b: $data.currentProjectIndex === index ? 1 : "",
        c: common_vendor.o(($event) => $options.navigateToLearnCategory(item), index),
        d: index
      };
    }),
    y: common_vendor.o((...args) => $options.onProjectChange && $options.onProjectChange(...args)),
    z: common_vendor.t($data.projectItems[$data.currentProjectIndex].title),
    A: common_vendor.t($data.projectItems[$data.currentProjectIndex].description)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
