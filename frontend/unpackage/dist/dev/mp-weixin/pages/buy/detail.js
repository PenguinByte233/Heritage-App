"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      id: null,
      product: null,
      quantity: 1,
      isLoading: false,
      userId: null,
      pointsPerItem: 15
      // 每件商品的积分值
    };
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id;
      this.fetchProductDetail();
    }
    try {
      const userInfoStr = common_vendor.index.getStorageSync("userInfo");
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          this.userId = userInfo.id;
        } catch (e) {
          const userInfo = userInfoStr;
          this.userId = userInfo.id;
        }
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
    }
  },
  methods: {
    async fetchProductDetail() {
      this.isLoading = true;
      try {
        const response = await api_api.getProductDetail(this.id);
        if (response.status === "success" && response.data) {
          this.product = response.data;
          console.log("商品详情:", this.product);
        } else {
          common_vendor.index.showToast({
            title: "获取商品详情失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("获取商品详情失败:", error);
        common_vendor.index.showToast({
          title: "获取商品详情失败",
          icon: "none"
        });
      } finally {
        this.isLoading = false;
      }
    },
    formatDescription(description) {
      if (!description)
        return "";
      let formattedText = description.replace(/\n/g, "<br>");
      const paragraphs = formattedText.split("<br><br>");
      formattedText = paragraphs.map((p) => `<p style="margin-bottom: 16px;">${p}</p>`).join("");
      return formattedText;
    },
    increaseQuantity() {
      this.quantity++;
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    async buyProduct() {
      if (!this.userId) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.switchTab({
            url: "/pages/profile/profile"
          });
        }, 1500);
        return;
      }
      if (!this.product) {
        common_vendor.index.showToast({
          title: "商品信息不完整",
          icon: "none"
        });
        return;
      }
      try {
        const response = await api_api.createOrder(this.userId, this.product.id, this.quantity);
        if (response.status === "success") {
          common_vendor.index.showToast({
            title: `购买成功，获得${response.data.points_earned}积分`,
            icon: "success",
            duration: 2e3
          });
          try {
            const userInfoStr = common_vendor.index.getStorageSync("userInfo");
            if (userInfoStr) {
              let userInfo;
              try {
                userInfo = JSON.parse(userInfoStr);
              } catch (e) {
                userInfo = userInfoStr;
              }
              userInfo.points = response.data.total_points;
              common_vendor.index.setStorageSync("userInfo", JSON.stringify(userInfo));
            }
          } catch (error) {
            console.error("更新用户积分失败:", error);
          }
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 2e3);
        } else {
          common_vendor.index.showToast({
            title: response.message || "购买失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("购买商品失败:", error);
        common_vendor.index.showToast({
          title: "购买失败，请稍后再试",
          icon: "none"
        });
      }
    },
    goBack() {
      common_vendor.index.navigateBack();
    }
  },
  computed: {
    // 根据数量计算可得积分
    totalPoints() {
      return this.pointsPerItem * this.quantity;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.product
  }, $data.product ? common_vendor.e({
    c: $data.product.image_url,
    d: common_vendor.t($data.product.name),
    e: common_vendor.t($data.product.price),
    f: common_vendor.t($data.product.category),
    g: common_vendor.t($options.totalPoints),
    h: $data.product.description
  }, $data.product.description ? {
    i: $options.formatDescription($data.product.description)
  } : {}) : {}, {
    j: common_assets._imports_0$1,
    k: $data.isLoading
  }, $data.isLoading ? {} : {}, {
    l: !$data.isLoading && !$data.product
  }, !$data.isLoading && !$data.product ? {} : {}, {
    m: common_vendor.o((...args) => $options.decreaseQuantity && $options.decreaseQuantity(...args)),
    n: common_vendor.t($data.quantity),
    o: common_vendor.o((...args) => $options.increaseQuantity && $options.increaseQuantity(...args)),
    p: common_vendor.t($options.totalPoints),
    q: common_vendor.o((...args) => $options.buyProduct && $options.buyProduct(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
