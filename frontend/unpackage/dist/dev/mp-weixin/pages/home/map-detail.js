"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
const _sfc_main = {
  data() {
    return {
      isLoading: true,
      mapImages: [],
      statistics: {
        world: 42,
        national: 1557,
        provincial: 13087
      },
      regionData: [],
      categoryData: []
    };
  },
  onLoad() {
    this.fetchMapResources();
  },
  methods: {
    async fetchMapResources() {
      this.isLoading = true;
      try {
        console.log("开始获取地图详情资源...");
        const response = await api_api.getMapResources();
        console.log("获取地图详情资源响应:", response);
        if (response && response.success && response.data) {
          console.log("获取地图详情资源成功");
          if (response.data.mapImages && response.data.mapImages.length > 0) {
            this.mapImages = response.data.mapImages.map((url) => api_api.processImageUrl(url));
            console.log("处理后的地图图片URLs:", this.mapImages);
          } else {
            const defaultImages = [
              "/uploads/assets/Home/Map/非遗分布地图1.jpg",
              "/uploads/assets/Home/Map/非遗分布地图2.jpg"
            ];
            this.mapImages = defaultImages.map((url) => api_api.processImageUrl(url));
            console.log("使用默认地图图片URLs:", this.mapImages);
          }
          if (response.data.statistics) {
            console.log("设置统计数据:", response.data.statistics);
            this.statistics = response.data.statistics;
          }
          if (response.data.regionData && response.data.regionData.length > 0) {
            console.log("设置地区分布数据:", response.data.regionData);
            this.regionData = response.data.regionData;
          } else {
            this.regionData = [
              { name: "浙江省", count: 158, percentage: 100 },
              { name: "江苏省", count: 142, percentage: 90 },
              { name: "山东省", count: 138, percentage: 87 },
              { name: "河南省", count: 132, percentage: 84 },
              { name: "四川省", count: 130, percentage: 82 }
            ];
            console.log("使用默认地区分布数据");
          }
          if (response.data.categoryData && response.data.categoryData.length > 0) {
            console.log("设置分类数据:", response.data.categoryData);
            this.categoryData = response.data.categoryData;
          } else {
            this.categoryData = [
              { name: "传统表演艺术", count: 326 },
              { name: "传统技艺", count: 614 },
              { name: "传统医药", count: 98 },
              { name: "民俗", count: 248 },
              { name: "传统音乐", count: 185 },
              { name: "传统美术", count: 86 }
            ];
            console.log("使用默认分类数据");
          }
        } else {
          console.error("获取地图资源失败:", response);
          this.useDefaultData();
        }
      } catch (error) {
        console.error("获取地图资源出错:", error);
        this.useDefaultData();
      } finally {
        this.isLoading = false;
      }
    },
    // 使用默认数据
    useDefaultData() {
      const defaultImages = [
        "/uploads/assets/Home/Map/非遗分布地图1.jpg",
        "/uploads/assets/Home/Map/非遗分布地图2.jpg"
      ];
      this.mapImages = defaultImages.map((url) => api_api.processImageUrl(url));
      console.log("使用默认数据 - 地图图片URLs:", this.mapImages);
      this.statistics = {
        world: 42,
        national: 1557,
        provincial: 13087
      };
      this.regionData = [
        { name: "浙江省", count: 158, percentage: 100 },
        { name: "江苏省", count: 142, percentage: 90 },
        { name: "山东省", count: 138, percentage: 87 },
        { name: "河南省", count: 132, percentage: 84 },
        { name: "四川省", count: 130, percentage: 82 }
      ];
      this.categoryData = [
        { name: "传统表演艺术", count: 326 },
        { name: "传统技艺", count: 614 },
        { name: "传统医药", count: 98 },
        { name: "民俗", count: 248 },
        { name: "传统音乐", count: 185 },
        { name: "传统美术", count: 86 }
      ];
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    previewImage(url) {
      common_vendor.index.previewImage({
        urls: this.mapImages,
        current: url
      });
    },
    navigateToCategory(categoryName) {
      common_vendor.index.navigateTo({
        url: `/pages/learn/category?title=${encodeURIComponent(categoryName)}`
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
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.isLoading
  }, $data.isLoading ? {} : {
    c: common_vendor.f($data.mapImages, (url, index, i0) => {
      return {
        a: url,
        b: common_vendor.o(($event) => $options.previewImage(url), index),
        c: index
      };
    }),
    d: common_vendor.p({
      d: "M18 20V10",
      stroke: "#6d4126",
      ["stroke-width"]: "2",
      ["stroke-linecap"]: "round",
      ["stroke-linejoin"]: "round"
    }),
    e: common_vendor.p({
      d: "M12 20V4",
      stroke: "#6d4126",
      ["stroke-width"]: "2",
      ["stroke-linecap"]: "round",
      ["stroke-linejoin"]: "round"
    }),
    f: common_vendor.p({
      d: "M6 20V14",
      stroke: "#6d4126",
      ["stroke-width"]: "2",
      ["stroke-linecap"]: "round",
      ["stroke-linejoin"]: "round"
    }),
    g: common_vendor.p({
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }),
    h: common_vendor.t($data.statistics.world),
    i: common_vendor.t($data.statistics.national),
    j: common_vendor.t($data.statistics.provincial),
    k: common_vendor.p({
      d: "M12 22C12 22 20 16 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 16 12 22 12 22Z",
      stroke: "#6d4126",
      ["stroke-width"]: "2",
      ["stroke-linecap"]: "round",
      ["stroke-linejoin"]: "round"
    }),
    l: common_vendor.p({
      d: "M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z",
      stroke: "#6d4126",
      ["stroke-width"]: "2",
      ["stroke-linecap"]: "round",
      ["stroke-linejoin"]: "round"
    }),
    m: common_vendor.p({
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }),
    n: common_vendor.f($data.regionData, (item, index, i0) => {
      return {
        a: common_vendor.t(index + 1),
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.count),
        d: item.percentage + "%",
        e: index
      };
    }),
    o: common_vendor.p({
      d: "M12 8L16 12L12 16L8 12L12 8Z",
      stroke: "#6d4126",
      ["stroke-width"]: "2",
      ["stroke-linecap"]: "round",
      ["stroke-linejoin"]: "round"
    }),
    p: common_vendor.p({
      d: "M12 3L19 10L12 21L5 10L12 3Z",
      stroke: "#6d4126",
      ["stroke-width"]: "2",
      ["stroke-linecap"]: "round",
      ["stroke-linejoin"]: "round"
    }),
    q: common_vendor.p({
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }),
    r: common_vendor.f($data.categoryData, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name.substr(0, 1)),
        b: common_vendor.n("category-icon-" + index % 5),
        c: common_vendor.t(item.name),
        d: common_vendor.t(item.count),
        e: index,
        f: common_vendor.o(($event) => $options.navigateToCategory(item.name), index)
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
