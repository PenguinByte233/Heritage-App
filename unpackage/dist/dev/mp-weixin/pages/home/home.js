"use strict";
const common_vendor = require("../../common/vendor.js");
const CategoryScroll = () => "../../components/CategoryScroll.js";
const TabSection = () => "../../components/TabSection.js";
const TutorialCard = () => "../../components/TutorialCard.js";
const _sfc_main = {
  components: {
    CategoryScroll,
    TabSection,
    TutorialCard
  },
  data() {
    return {
      heritageTypes: [],
      selectedCategoryIndex: 0,
      selectedCategory: null,
      tabs: [
        { title: "历史" },
        { title: "传承" },
        { title: "教程" },
        { title: "回顾" }
      ],
      tutorials: [],
      inheritors: [
        {
          name: "张大师",
          level: "国家级非遗传承人",
          avatar: "/static/images/inheritor1.png",
          description: "从事非遗传承40年，曾获得多项国家级荣誉。"
        },
        {
          name: "李传承",
          level: "省级非遗传承人",
          avatar: "/static/images/inheritor2.png",
          description: "技艺精湛，作品曾在国际展览中获奖。"
        }
      ],
      historyImages: [
        { url: "/static/images/history1.png", title: "1950年代工艺制作场景" },
        { url: "/static/images/history2.png", title: "1980年代传承活动" },
        { url: "/static/images/history3.png", title: "2000年非遗保护项目启动" },
        { url: "/static/images/history4.png", title: "2010年传承人表演" },
        { url: "/static/images/history5.png", title: "2020年现代传承活动" },
        { url: "/static/images/history6.png", title: "近期非遗展览现场" }
      ]
    };
  },
  onLoad() {
    this.loadHeritageTypes();
  },
  methods: {
    async loadHeritageTypes() {
      try {
        common_vendor.index.showLoading({ title: "加载中" });
        setTimeout(() => {
          this.heritageTypes = [
            { id: 1, name: "刺绣", description: "刺绣是中国最古老的民间传统工艺之一，历史悠久，品种繁多。主要由绣工使用彩色的丝线或其他材料在织物上刺绣出各种图案纹样，形成绣品。", imageUrl: "/static/images/category1.png" },
            { id: 2, name: "剪纸", description: "剪纸是一种用剪刀或刻刀在纸上剪刻花纹，用于装点生活或配合其他民俗活动的民间艺术。", imageUrl: "/static/images/category2.png" },
            { id: 3, name: "木雕", description: "木雕是一种用刀具在木头上雕刻出各种图案、造型的工艺，具有悠久的历史传统。", imageUrl: "/static/images/category3.png" },
            { id: 4, name: "陶瓷", description: "陶瓷艺术是中国传统工艺的瑰宝，包括陶器和瓷器，具有实用与审美双重价值。", imageUrl: "/static/images/category4.png" },
            { id: 5, name: "漆艺", description: "漆艺是利用天然漆树的树液，涂布于器物表面，形成坚硬、光亮、耐热、耐酸、耐碱的保护膜，并配以金、银、螺钿等装饰材料的工艺。", imageUrl: "/static/images/category5.png" },
            { id: 6, name: "织锦", description: "织锦是中国传统的丝织工艺，利用丝线织造出各种纹样图案的织物。", imageUrl: "/static/images/category6.png" },
            { id: 7, name: "扎染", description: "扎染是一种防染工艺，通过在织物上扎、缝、缚、折等方法，使染料不能渗透被扎起来的部分，形成图案的技术。", imageUrl: "/static/images/category7.png" },
            { id: 8, name: "篆刻", description: "篆刻是在印章上刻制文字、图案的艺术形式，是中国特有的传统艺术。", imageUrl: "/static/images/category8.png" },
            { id: 9, name: "书法", description: "书法是中国及深受中国文化影响地区的传统艺术，通过书写汉字的形体美感来表达情感的艺术。", imageUrl: "/static/images/category9.png" },
            { id: 10, name: "茶艺", description: "茶艺是通过沏茶、赏茶、饮茶、增进友谊的一种综合艺术，体现了中国传统文化中天人合一的思想。", imageUrl: "/static/images/category10.png" }
          ];
          if (this.heritageTypes.length > 0) {
            this.selectedCategory = this.heritageTypes[0];
            this.loadTutorials(this.selectedCategory.id);
          }
          common_vendor.index.hideLoading();
        }, 1e3);
      } catch (error) {
        console.error("加载非遗大类失败", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "加载数据失败",
          icon: "none"
        });
      }
    },
    async loadTutorials(categoryId) {
      try {
        setTimeout(() => {
          this.tutorials = [
            {
              id: 1,
              title: "基础入门技法",
              category_id: categoryId,
              cover_url: "/static/images/tutorial1.png",
              video_url: "https://example.com/video1.mp4"
            },
            {
              id: 2,
              title: "进阶制作方法",
              category_id: categoryId,
              cover_url: "/static/images/tutorial2.png"
            },
            {
              id: 3,
              title: "高级技巧分享",
              category_id: categoryId,
              cover_url: "/static/images/tutorial3.png",
              video_url: "https://example.com/video3.mp4"
            }
          ];
        }, 500);
      } catch (error) {
        console.error("加载教程列表失败", error);
        common_vendor.index.showToast({
          title: "加载教程失败",
          icon: "none"
        });
      }
    },
    handleCategorySelect(category, index) {
      this.selectedCategoryIndex = index;
      this.selectedCategory = category;
      this.loadTutorials(category.id);
    },
    handleTabChange(index) {
      console.log("Tab changed:", index);
    },
    handleTutorialClick(tutorial) {
      common_vendor.index.navigateTo({
        url: `/pages/tutorial/detail?id=${tutorial.id}`
      });
    },
    previewImage(index) {
      const urls = this.historyImages.map((item) => item.url);
      common_vendor.index.previewImage({
        urls,
        current: urls[index]
      });
    }
  }
};
if (!Array) {
  const _component_category_scroll = common_vendor.resolveComponent("category-scroll");
  const _component_tutorial_card = common_vendor.resolveComponent("tutorial-card");
  const _component_tab_section = common_vendor.resolveComponent("tab-section");
  (_component_category_scroll + _component_tutorial_card + _component_tab_section)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.handleCategorySelect),
    b: common_vendor.p({
      categories: $data.heritageTypes
    }),
    c: $data.selectedCategory
  }, $data.selectedCategory ? {
    d: $data.selectedCategory.imageUrl || "/static/images/default-category.png",
    e: common_vendor.t($data.selectedCategory.name),
    f: common_vendor.t($data.selectedCategory.description || "暂无历史介绍")
  } : {}, {
    g: $data.selectedCategory
  }, $data.selectedCategory ? {
    h: common_vendor.f($data.inheritors, (item, index, i0) => {
      return {
        a: item.avatar || "/static/images/default-avatar.png",
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.level),
        d: common_vendor.t(item.description),
        e: index
      };
    })
  } : {}, {
    i: common_vendor.f($data.tutorials, (item, index, i0) => {
      return {
        a: index,
        b: common_vendor.o($options.handleTutorialClick, index),
        c: "e24c263e-2-" + i0 + ",e24c263e-1",
        d: common_vendor.p({
          tutorial: item,
          categoryName: $data.selectedCategory ? $data.selectedCategory.name : ""
        })
      };
    }),
    j: common_vendor.f($data.historyImages, (item, index, i0) => {
      return {
        a: index,
        b: item.url,
        c: common_vendor.o(($event) => $options.previewImage(index), index)
      };
    }),
    k: common_vendor.o($options.handleTabChange),
    l: common_vendor.p({
      tabs: $data.tabs
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
