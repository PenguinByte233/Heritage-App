"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const TutorialCard = () => "../../components/TutorialCard.js";
const _sfc_main = {
  components: {
    TutorialCard
  },
  data() {
    return {
      searchText: "",
      selectedType: "all",
      tutorials: [],
      heritageTypes: [],
      inProgressTutorials: [],
      page: 1,
      hasMore: true
    };
  },
  computed: {
    filteredTutorials() {
      let result = [...this.tutorials];
      if (this.selectedType === "video") {
        result = result.filter((item) => item.video_url);
      } else if (this.selectedType === "image") {
        result = result.filter((item) => !item.video_url);
      } else if (this.selectedType.startsWith("type-")) {
        const typeId = parseInt(this.selectedType.split("-")[1]);
        result = result.filter((item) => {
          const category = this.getCategoryById(item.category_id);
          return category && category.heritage_type_id === typeId;
        });
      }
      if (this.searchText.trim()) {
        const keyword = this.searchText.toLowerCase();
        result = result.filter(
          (item) => item.title.toLowerCase().includes(keyword) || item.content && item.content.toLowerCase().includes(keyword)
        );
      }
      return result;
    }
  },
  onLoad() {
    this.loadHeritageTypes();
    this.loadTutorials();
    this.loadInProgressTutorials();
  },
  methods: {
    async loadHeritageTypes() {
      try {
        setTimeout(() => {
          this.heritageTypes = [
            { id: 1, name: "刺绣" },
            { id: 2, name: "剪纸" },
            { id: 3, name: "木雕" },
            { id: 4, name: "陶瓷" },
            { id: 5, name: "漆艺" }
          ];
        }, 500);
      } catch (error) {
        console.error("加载非遗大类失败", error);
      }
    },
    async loadTutorials() {
      try {
        common_vendor.index.showLoading({ title: "加载中" });
        setTimeout(() => {
          const mockTutorials = [
            {
              id: 1,
              title: "苏绣入门基础技法",
              category_id: 1,
              cover_url: "/static/images/tutorial1.png",
              video_url: "https://example.com/video1.mp4"
            },
            {
              id: 2,
              title: "传统剪纸窗花制作",
              category_id: 5,
              cover_url: "/static/images/tutorial2.png"
            },
            {
              id: 3,
              title: "木雕实用技巧分享",
              category_id: 8,
              cover_url: "/static/images/tutorial3.png",
              video_url: "https://example.com/video3.mp4"
            },
            {
              id: 4,
              title: "陶瓷彩绘入门",
              category_id: 8,
              cover_url: "/static/images/tutorial4.png"
            },
            {
              id: 5,
              title: "传统漆器修复方法",
              category_id: 8,
              cover_url: "/static/images/tutorial5.png",
              video_url: "https://example.com/video5.mp4"
            },
            {
              id: 6,
              title: "蜀绣针法详解",
              category_id: 4,
              cover_url: "/static/images/tutorial6.png"
            }
          ];
          if (this.page === 1) {
            this.tutorials = mockTutorials;
          } else {
            this.tutorials = [...this.tutorials, ...mockTutorials];
          }
          this.hasMore = this.page < 3;
          this.page++;
          common_vendor.index.hideLoading();
        }, 1e3);
      } catch (error) {
        console.error("加载教程列表失败", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "加载数据失败",
          icon: "none"
        });
      }
    },
    loadInProgressTutorials() {
      try {
        this.inProgressTutorials = [
          {
            id: 1,
            title: "苏绣入门基础技法",
            category_id: 1,
            cover_url: "/static/images/tutorial1.png",
            video_url: "https://example.com/video1.mp4",
            progress: 35
          },
          {
            id: 3,
            title: "木雕实用技巧分享",
            category_id: 8,
            cover_url: "/static/images/tutorial3.png",
            video_url: "https://example.com/video3.mp4",
            progress: 68
          }
        ];
      } catch (e) {
        console.error("获取学习进度失败", e);
      }
    },
    handleSearch() {
      this.page = 1;
      this.tutorials = [];
      this.loadTutorials();
    },
    handleFilter(type) {
      this.selectedType = type;
    },
    handleMoreProgress() {
      common_vendor.index.navigateTo({
        url: "/pages/learn/progress"
      });
    },
    handleTutorialClick(tutorial) {
      common_vendor.index.navigateTo({
        url: `/pages/tutorial/detail?id=${tutorial.id}`
      });
    },
    loadMore() {
      if (this.hasMore) {
        this.loadTutorials();
      }
    },
    getCategoryName(categoryId) {
      return "非遗教程";
    },
    getCategoryById(categoryId) {
      const mockCategories = [
        { id: 1, name: "苏绣", heritage_type_id: 1 },
        { id: 2, name: "湘绣", heritage_type_id: 1 },
        { id: 3, name: "粤绣", heritage_type_id: 1 },
        { id: 4, name: "蜀绣", heritage_type_id: 1 },
        { id: 5, name: "北方剪纸", heritage_type_id: 2 },
        { id: 8, name: "传统工艺", heritage_type_id: 3 }
      ];
      return mockCategories.find((item) => item.id === categoryId);
    }
  }
};
if (!Array) {
  const _component_tutorial_card = common_vendor.resolveComponent("tutorial-card");
  _component_tutorial_card();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    b: $data.searchText,
    c: common_vendor.o(($event) => $data.searchText = $event.detail.value),
    d: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    e: $data.selectedType === "all" ? 1 : "",
    f: common_vendor.o(($event) => $options.handleFilter("all")),
    g: $data.selectedType === "video" ? 1 : "",
    h: common_vendor.o(($event) => $options.handleFilter("video")),
    i: $data.selectedType === "image" ? 1 : "",
    j: common_vendor.o(($event) => $options.handleFilter("image")),
    k: common_vendor.f($data.heritageTypes, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: index,
        c: $data.selectedType === "type-" + item.id ? 1 : "",
        d: common_vendor.o(($event) => $options.handleFilter("type-" + item.id), index)
      };
    }),
    l: $data.inProgressTutorials.length > 0
  }, $data.inProgressTutorials.length > 0 ? {
    m: common_vendor.o((...args) => $options.handleMoreProgress && $options.handleMoreProgress(...args)),
    n: common_vendor.f($data.inProgressTutorials, (item, index, i0) => {
      return {
        a: item.cover_url || "/static/images/default-tutorial.png",
        b: common_vendor.t(item.title),
        c: item.progress + "%",
        d: common_vendor.t(item.progress),
        e: index,
        f: common_vendor.o(($event) => $options.handleTutorialClick(item), index)
      };
    })
  } : {}, {
    o: common_vendor.f($options.filteredTutorials, (item, index, i0) => {
      return {
        a: index,
        b: common_vendor.o($options.handleTutorialClick, index),
        c: "22a3c7ea-0-" + i0,
        d: common_vendor.p({
          tutorial: item,
          categoryName: $options.getCategoryName(item.category_id)
        })
      };
    }),
    p: $data.hasMore
  }, $data.hasMore ? {
    q: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args))
  } : {}, {
    r: $options.filteredTutorials.length === 0
  }, $options.filteredTutorials.length === 0 ? {
    s: common_assets._imports_0$1
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
