"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
const _sfc_main = {
  data() {
    return {
      // 本地存储的大标题数据
      categories: [
        { title: "传统表演艺术" },
        { title: "传统服饰" },
        { title: "传统节日与庆典" },
        { title: "传统乐器与音乐" },
        { title: "传统艺术与工艺" },
        { title: "传统装饰与配饰" },
        { title: "文化与创意产业" }
      ],
      currentCategory: "",
      subcategories: [],
      isLoading: false,
      currentSwiperIndex: {}
      // 记录每个卡片的当前滑动位置
    };
  },
  onLoad(options) {
    if (options && options.title) {
      const title = decodeURIComponent(options.title);
      const found = this.categories.find((cat) => cat.title === title);
      if (found) {
        this.currentCategory = title;
      } else {
        this.currentCategory = this.categories[0].title;
      }
    } else {
      if (this.categories.length > 0) {
        this.currentCategory = this.categories[0].title;
      }
    }
    this.fetchSubcategories(this.currentCategory);
  },
  onShow() {
    const app = getApp();
    if (app && app.globalData) {
      console.log("检查全局变量:", app.globalData);
      if (app.globalData.selectedCategory) {
        const category = app.globalData.selectedCategory;
        console.log("发现全局选中的分类:", category);
        const found = this.categories.find((cat) => cat.title === category);
        if (found) {
          if (this.currentCategory !== category) {
            console.log("切换到分类:", category);
            this.currentCategory = category;
            this.fetchSubcategories(category);
          }
          if (app.globalData.needScrollToCategory) {
            console.log("需要滚动到分类:", category);
            this.$nextTick(() => {
              const index = this.categories.findIndex((cat) => cat.title === category);
              if (index !== -1) {
                setTimeout(() => {
                  console.log("滚动到分类索引:", index);
                  const query = common_vendor.index.createSelectorQuery().in(this);
                  query.selectAll(".nav-tab").boundingClientRect((rects) => {
                    if (rects && rects[index]) {
                      const tabRect = rects[index];
                      common_vendor.index.createSelectorQuery().select(".nav-tabs").boundingClientRect().exec((res) => {
                        if (res && res[0]) {
                          const scrollViewRect = res[0];
                          const scrollLeft = tabRect.left - scrollViewRect.left - scrollViewRect.width / 2 + tabRect.width / 2;
                          common_vendor.index.pageScrollTo({
                            scrollLeft,
                            duration: 300
                          });
                        }
                      });
                    }
                  }).exec();
                }, 300);
              }
            });
            app.globalData.needScrollToCategory = false;
          }
        }
        app.globalData.selectedCategory = null;
      }
    }
  },
  methods: {
    async fetchSubcategories(title) {
      this.isLoading = true;
      this.subcategories = [];
      this.currentSwiperIndex = {};
      try {
        console.log(`正在获取分类 "${title}" 的小标题数据...`);
        const response = await api_api.getLearningHeaders(title);
        if (response.status === "success" && response.data) {
          this.subcategories = response.data;
          console.log(`获取到 ${this.subcategories.length} 个小标题，详细数据：`);
          this.subcategories.forEach((item, index) => {
            console.log(`[${index + 1}] ${item.subtitle}:`);
            console.log(`  - image_url: ${item.image_url}`);
            if (item.images && Array.isArray(item.images)) {
              console.log(`  - images数组 (${item.images.length}张):`);
              item.images.forEach((img, i) => {
                console.log(`    [${i + 1}] ${img}`);
              });
            } else {
              console.log(`  - images数组: 不存在或不是数组`);
            }
          });
        } else {
          console.error("API返回错误:", response);
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
    selectCategory(title) {
      if (this.currentCategory !== title) {
        this.currentCategory = title;
        this.fetchSubcategories(title);
      }
    },
    navigateToContent(item) {
      console.log("正在导航到内容页，小标题:", item.subtitle);
      try {
        common_vendor.index.navigateTo({
          url: `/pages/learn/content?subtitle=${encodeURIComponent(item.subtitle)}`,
          success: () => {
            console.log("导航成功");
          },
          fail: (err) => {
            console.error("导航失败:", err);
            common_vendor.index.showToast({
              title: "页面跳转失败",
              icon: "none"
            });
          }
        });
      } catch (e) {
        console.error("导航错误:", e);
      }
    },
    handleSwiperChange(itemIndex, event) {
      const currentIndex = event.detail.current;
      this.$set(this.currentSwiperIndex, itemIndex, currentIndex);
    },
    getImageCountText(item) {
      if (!item.images || !item.images.length)
        return "";
      const itemIndex = item.index || 0;
      const currentIndex = this.currentSwiperIndex[itemIndex] || 0;
      const totalImages = item.images.length;
      const displayCount = Math.min(totalImages, 3);
      if (totalImages > 3) {
        return `${currentIndex + 1}/${displayCount} (共${totalImages}张)`;
      } else {
        return `${currentIndex + 1}/${totalImages}`;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.categories, (category, index, i0) => {
      return {
        a: common_vendor.t(category.title),
        b: index,
        c: $data.currentCategory === category.title ? 1 : "",
        d: common_vendor.o(($event) => $options.selectCategory(category.title), index)
      };
    }),
    b: !$data.isLoading
  }, !$data.isLoading ? common_vendor.e({
    c: common_vendor.f($data.subcategories, (item, index, i0) => {
      return common_vendor.e({}, {
        b: item.images && item.images.length > 1
      }, item.images && item.images.length > 1 ? common_vendor.e({}, {
        d: common_vendor.f(item.images.slice(0, 3), (img, imgIndex, i1) => {
          return {
            a: img,
            b: common_vendor.o((e) => console.error(`图片加载失败:`, img, e), imgIndex),
            c: imgIndex
          };
        }),
        e: common_vendor.o(($event) => $options.handleSwiperChange(index, $event), index)
      }) : {
        f: item.image_url || item.images && item.images[0]
      }, {
        g: item.images && item.images.length > 1
      }, item.images && item.images.length > 1 ? {
        h: common_vendor.t($options.getImageCountText(item))
      } : {}, {
        i: common_vendor.t(item.subtitle),
        j: index,
        k: common_vendor.o(($event) => $options.navigateToContent(item), index)
      });
    }),
    d: $data.subcategories.length === 0
  }, $data.subcategories.length === 0 ? {} : {}) : {}, {
    e: $data.isLoading
  }, $data.isLoading ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
