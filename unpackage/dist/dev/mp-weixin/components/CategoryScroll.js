"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "CategoryScroll",
  props: {
    // 分类数据
    categories: {
      type: Array,
      default: () => []
    },
    // 默认选中项
    defaultActive: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      activeIndex: this.defaultActive
    };
  },
  methods: {
    handleSelect(index, item) {
      this.activeIndex = index;
      this.$emit("select", item, index);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($props.categories, (item, index, i0) => {
      return {
        a: item.imageUrl || "/static/images/default-category.png",
        b: common_vendor.t(item.name),
        c: index,
        d: $data.activeIndex === index ? 1 : "",
        e: common_vendor.o(($event) => $options.handleSelect(index, item), index)
      };
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
