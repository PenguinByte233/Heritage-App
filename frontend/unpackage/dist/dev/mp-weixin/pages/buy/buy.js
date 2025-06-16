"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      products: [],
      categories: [],
      selectedCategory: "all",
      isLoading: false,
      searchKeyword: ""
    };
  },
  computed: {
    filteredProducts() {
      let result = this.products;
      if (this.selectedCategory !== "all") {
        result = result.filter((product) => product.category === this.selectedCategory);
      }
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase().trim();
        result = result.filter(
          (product) => {
            var _a;
            return product.name.toLowerCase().includes(keyword) || ((_a = product.description) == null ? void 0 : _a.toLowerCase().includes(keyword)) || product.category.toLowerCase().includes(keyword);
          }
        );
      }
      return result;
    }
  },
  onLoad() {
    this.fetchCategories();
    this.fetchProducts();
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await api_api.getProductCategories();
        if (response.status === "success" && response.data) {
          this.categories = response.data;
        }
      } catch (error) {
        console.error("获取商品分类失败:", error);
      }
    },
    async fetchProducts() {
      this.isLoading = true;
      try {
        const response = await api_api.getAllProducts();
        if (response.status === "success" && response.data) {
          this.products = response.data;
          console.log("获取到商品数据:", this.products.length);
          this.products.forEach((product, index) => {
            if (!product.id) {
              console.warn(`警告: 第${index + 1}个商品没有ID`, product);
            }
          });
        } else {
          common_vendor.index.showToast({
            title: "获取商品失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("获取商品列表失败:", error);
        common_vendor.index.showToast({
          title: "获取商品失败",
          icon: "none"
        });
      } finally {
        this.isLoading = false;
      }
    },
    selectCategory(category) {
      this.selectedCategory = category;
    },
    searchProducts() {
      console.log("搜索关键词:", this.searchKeyword);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.searchProducts && $options.searchProducts(...args)),
    b: $data.searchKeyword,
    c: common_vendor.o(($event) => $data.searchKeyword = $event.detail.value),
    d: $data.selectedCategory === "all" ? 1 : "",
    e: common_vendor.o(($event) => $options.selectCategory("all")),
    f: common_vendor.f($data.categories, (category, index, i0) => {
      return {
        a: common_vendor.t(category),
        b: index,
        c: $data.selectedCategory === category ? 1 : "",
        d: common_vendor.o(($event) => $options.selectCategory(category), index)
      };
    }),
    g: $data.isLoading
  }, $data.isLoading ? {} : {}, {
    h: common_vendor.f($options.filteredProducts, (product, index, i0) => {
      return {
        a: product.image_url,
        b: common_vendor.t(product.name),
        c: common_vendor.t(product.price),
        d: index,
        e: `/pages/buy/detail?id=${product.id}`
      };
    }),
    i: !$data.isLoading && $options.filteredProducts.length === 0
  }, !$data.isLoading && $options.filteredProducts.length === 0 ? {
    j: common_assets._imports_0
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
