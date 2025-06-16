"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/home/home.js";
  "./pages/home/map-detail.js";
  "./pages/buy/buy.js";
  "./pages/buy/detail.js";
  "./pages/learn/learn.js";
  "./pages/learn/content.js";
  "./pages/learn/category.js";
  "./pages/chat/chat.js";
  "./pages/chat/detail.js";
  "./pages/chat/post.js";
  "./pages/profile/profile.js";
  "./pages/order/order-detail.js";
  "./pages/login/login.js";
}
const _sfc_main = {
  onLaunch: function() {
    console.log("App Launch");
  },
  onShow: function() {
    console.log("App Show");
  },
  onHide: function() {
    console.log("App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
