"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "TabSection",
  props: {
    // Tab项数据
    tabs: {
      type: Array,
      default: () => []
    },
    // 默认选中的Tab
    defaultTab: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      currentTab: this.defaultTab
    };
  },
  methods: {
    switchTab(index) {
      this.currentTab = index;
      this.$emit("change", index);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($props.tabs, (tab, index, i0) => {
      return {
        a: common_vendor.t(tab.title),
        b: index,
        c: $data.currentTab === index ? 1 : "",
        d: common_vendor.o(($event) => $options.switchTab(index), index)
      };
    }),
    b: common_vendor.d("content-" + $data.currentTab)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
