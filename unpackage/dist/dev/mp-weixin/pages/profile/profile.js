"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      isLogin: false,
      userInfo: {
        id: null,
        nickname: "",
        avatar_url: ""
      },
      orderCount: 0,
      favoriteCount: 0,
      postCount: 0,
      orderBadges: {
        pending: 2,
        paid: 1,
        shipped: 0
      }
    };
  },
  onLoad() {
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("token");
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (token && userInfo) {
        this.isLogin = true;
        this.userInfo = JSON.parse(userInfo);
        this.loadUserStats();
      } else {
        this.isLogin = false;
      }
    },
    loadUserStats() {
      this.orderCount = 5;
      this.favoriteCount = 12;
      this.postCount = 3;
    },
    handleLogin() {
      common_vendor.index.login({
        success: async (res) => {
          if (res.code) {
            try {
              common_vendor.index.showLoading({ title: "登录中" });
              setTimeout(() => {
                const mockUser = {
                  id: 100,
                  nickname: "非遗用户",
                  avatar_url: "/static/images/avatar1.png"
                };
                common_vendor.index.setStorageSync("token", "mock_token");
                common_vendor.index.setStorageSync("userInfo", JSON.stringify(mockUser));
                this.isLogin = true;
                this.userInfo = mockUser;
                this.loadUserStats();
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({
                  title: "登录成功",
                  icon: "success"
                });
              }, 1e3);
            } catch (error) {
              console.error("登录失败", error);
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "登录失败",
                icon: "none"
              });
            }
          } else {
            console.error("获取code失败", res.errMsg);
            common_vendor.index.showToast({
              title: "登录失败",
              icon: "none"
            });
          }
        }
      });
    },
    handleLogout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.removeStorageSync("userInfo");
            this.isLogin = false;
            this.userInfo = {
              id: null,
              nickname: "",
              avatar_url: ""
            };
            common_vendor.index.showToast({
              title: "已退出登录",
              icon: "success"
            });
          }
        }
      });
    },
    handleViewAllOrders() {
      common_vendor.index.navigateTo({
        url: "/pages/order/list"
      });
    },
    handleViewOrders(status) {
      common_vendor.index.navigateTo({
        url: `/pages/order/list?status=${status}`
      });
    },
    handleNavigate(url) {
      common_vendor.index.navigateTo({ url });
    },
    handleContact() {
      common_vendor.index.showToast({
        title: "正在连接客服",
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.userInfo.avatar_url || "/static/images/default-avatar.png",
    b: common_vendor.t($data.userInfo.nickname || "未登录"),
    c: !$data.isLogin
  }, !$data.isLogin ? {
    d: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args))
  } : {}, {
    e: $data.isLogin
  }, $data.isLogin ? {
    f: common_vendor.t($data.orderCount),
    g: common_vendor.t($data.favoriteCount),
    h: common_vendor.t($data.postCount)
  } : {}, {
    i: common_vendor.o((...args) => $options.handleViewAllOrders && $options.handleViewAllOrders(...args)),
    j: $data.orderBadges.pending
  }, $data.orderBadges.pending ? {
    k: common_vendor.t($data.orderBadges.pending)
  } : {}, {
    l: common_vendor.o(($event) => $options.handleViewOrders("pending")),
    m: $data.orderBadges.paid
  }, $data.orderBadges.paid ? {
    n: common_vendor.t($data.orderBadges.paid)
  } : {}, {
    o: common_vendor.o(($event) => $options.handleViewOrders("paid")),
    p: $data.orderBadges.shipped
  }, $data.orderBadges.shipped ? {
    q: common_vendor.t($data.orderBadges.shipped)
  } : {}, {
    r: common_vendor.o(($event) => $options.handleViewOrders("shipped")),
    s: common_vendor.o(($event) => $options.handleViewOrders("completed")),
    t: common_vendor.o(($event) => $options.handleNavigate("/pages/learn/progress")),
    v: common_vendor.o(($event) => $options.handleNavigate("/pages/learn/favorite")),
    w: common_vendor.o(($event) => $options.handleNavigate("/pages/learn/history")),
    x: common_vendor.o(($event) => $options.handleNavigate("/pages/profile/settings")),
    y: common_vendor.o((...args) => $options.handleContact && $options.handleContact(...args)),
    z: common_vendor.o(($event) => $options.handleNavigate("/pages/profile/about")),
    A: $data.isLogin
  }, $data.isLogin ? {
    B: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
