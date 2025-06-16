"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "ProductCard",
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleClick() {
      this.$emit("click", this.product);
    },
    handleCustomize() {
      common_vendor.index.showToast({
        title: "即将打开客服会话",
        icon: "none"
      });
      this.$emit("customize", this.product);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $props.product.image_url || "/static/images/default-product.png",
    b: common_vendor.t($props.product.name),
    c: common_vendor.t($props.product.price),
    d: common_vendor.o((...args) => $options.handleCustomize && $options.handleCustomize(...args)),
    e: common_vendor.o((...args) => $options.handleClick && $options.handleClick(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
