"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const ProductCard = () => "../../components/ProductCard.js";
const _sfc_main = {
  components: {
    ProductCard
  },
  data() {
    return {
      heritageTypes: [],
      categories: [],
      products: [],
      selectedMainIndex: 0,
      selectedSubIndex: 0,
      selectedHeritageType: null,
      selectedCategory: null
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
            { id: 1, name: "刺绣" },
            { id: 2, name: "剪纸" },
            { id: 3, name: "木雕" },
            { id: 4, name: "陶瓷" },
            { id: 5, name: "漆艺" },
            { id: 6, name: "织锦" },
            { id: 7, name: "扎染" },
            { id: 8, name: "篆刻" },
            { id: 9, name: "书法" },
            { id: 10, name: "茶艺" }
          ];
          if (this.heritageTypes.length > 0) {
            this.selectedHeritageType = this.heritageTypes[0];
            this.loadCategories(this.selectedHeritageType.id);
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
    async loadCategories(typeId) {
      try {
        setTimeout(() => {
          if (typeId === 1) {
            this.categories = [
              { id: 1, name: "苏绣", heritage_type_id: 1 },
              { id: 2, name: "湘绣", heritage_type_id: 1 },
              { id: 3, name: "粤绣", heritage_type_id: 1 },
              { id: 4, name: "蜀绣", heritage_type_id: 1 }
            ];
          } else if (typeId === 2) {
            this.categories = [
              { id: 5, name: "北方剪纸", heritage_type_id: 2 },
              { id: 6, name: "南方剪纸", heritage_type_id: 2 },
              { id: 7, name: "民间窗花", heritage_type_id: 2 }
            ];
          } else {
            this.categories = [
              { id: 8, name: "传统工艺", heritage_type_id: typeId },
              { id: 9, name: "现代创新", heritage_type_id: typeId }
            ];
          }
          if (this.categories.length > 0) {
            this.selectedCategory = this.categories[0];
            this.selectedSubIndex = 0;
            this.loadProducts(this.selectedCategory.id);
          }
        }, 500);
      } catch (error) {
        console.error("加载子类失败", error);
        common_vendor.index.showToast({
          title: "加载子类失败",
          icon: "none"
        });
      }
    },
    async loadProducts(categoryId) {
      try {
        common_vendor.index.showLoading({ title: "加载商品..." });
        setTimeout(() => {
          this.products = [
            {
              id: 1,
              category_id: categoryId,
              name: "手工刺绣装饰画",
              price: 299,
              image_url: "/static/images/product1.png",
              description: "纯手工制作，精美刺绣，适合家居装饰。"
            },
            {
              id: 2,
              category_id: categoryId,
              name: "传统图案抱枕",
              price: 129,
              image_url: "/static/images/product2.png",
              description: "采用传统图案，手工刺绣，触感柔软舒适。"
            },
            {
              id: 3,
              category_id: categoryId,
              name: "刺绣手提包",
              price: 359,
              image_url: "/static/images/product3.png",
              description: "将传统刺绣与现代设计结合，实用又美观。"
            },
            {
              id: 4,
              category_id: categoryId,
              name: "丝绸刺绣披肩",
              price: 499,
              image_url: "/static/images/product4.png",
              description: "采用上等丝绸，手工刺绣，质地柔软轻薄。"
            }
          ];
          common_vendor.index.hideLoading();
        }, 700);
      } catch (error) {
        console.error("加载商品失败", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "加载商品失败",
          icon: "none"
        });
      }
    },
    handleMainSelect(index, type) {
      this.selectedMainIndex = index;
      this.selectedHeritageType = type;
      this.loadCategories(type.id);
    },
    handleSubSelect(index, category) {
      this.selectedSubIndex = index;
      this.selectedCategory = category;
      this.loadProducts(category.id);
    },
    handleProductClick(product) {
      common_vendor.index.navigateTo({
        url: `/pages/product/detail?id=${product.id}`
      });
    },
    handleCustomize(product) {
      console.log("联系客服定制商品:", product);
    }
  }
};
if (!Array) {
  const _component_product_card = common_vendor.resolveComponent("product-card");
  _component_product_card();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.heritageTypes, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: index,
        c: $data.selectedMainIndex === index ? 1 : "",
        d: common_vendor.o(($event) => $options.handleMainSelect(index, item), index)
      };
    }),
    b: $data.categories.length > 0
  }, $data.categories.length > 0 ? {
    c: common_vendor.f($data.categories, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: index,
        c: $data.selectedSubIndex === index ? 1 : "",
        d: common_vendor.o(($event) => $options.handleSubSelect(index, item), index)
      };
    })
  } : {}, {
    d: $data.products.length > 0
  }, $data.products.length > 0 ? {
    e: common_vendor.f($data.products, (item, index, i0) => {
      return {
        a: index,
        b: common_vendor.o($options.handleProductClick, index),
        c: common_vendor.o($options.handleCustomize, index),
        d: "243ecfcf-0-" + i0,
        e: common_vendor.p({
          product: item
        })
      };
    })
  } : {
    f: common_assets._imports_0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
