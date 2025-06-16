"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      isLogin: false,
      userInfo: {
        id: null,
        nickname: "",
        avatar_url: "",
        points: 0
      },
      userStats: {
        posts: 5,
        comments: 18
      },
      orderBadges: {
        pending: 1,
        paid: 2,
        shipped: 0,
        review: 3
      }
    };
  },
  onShow() {
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("token");
      const userInfoStr = common_vendor.index.getStorageSync("userInfo");
      if (token && userInfoStr) {
        try {
          let userInfo = JSON.parse(userInfoStr);
          if (!userInfo.avatar_url) {
            userInfo.avatar_url = "/static/images/avatar/空中花园.png";
            common_vendor.index.setStorageSync("userInfo", JSON.stringify(userInfo));
          }
          this.isLogin = true;
          this.userInfo = userInfo;
          console.log("当前用户头像路径:", this.userInfo.avatar_url);
        } catch (e) {
          console.error("解析用户信息失败:", e);
          this.isLogin = false;
        }
      } else {
        this.isLogin = false;
        this.userInfo = {
          id: null,
          nickname: "",
          avatar_url: "/static/images/avatar/空中花园.png"
        };
      }
    },
    handleLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
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
    navigateTo(url) {
      common_vendor.index.navigateTo({ url });
    },
    navigateToOrderList(status) {
      if (!this.isLogin) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          this.handleLogin();
        }, 1500);
        return;
      }
      let url = "/pages/order/order-detail?id=1001";
      common_vendor.index.navigateTo({
        url,
        success: () => {
          console.log("成功导航到订单详情页面");
        },
        fail: (err) => {
          console.error("导航到订单详情页面失败:", err);
          common_vendor.index.redirectTo({
            url,
            fail: (redirectErr) => {
              console.error("redirectTo 也失败了:", redirectErr);
              common_vendor.index.reLaunch({
                url,
                fail: (relaunchErr) => {
                  console.error("reLaunch 也失败了:", relaunchErr);
                  common_vendor.index.showToast({
                    title: "页面跳转失败，请重试",
                    icon: "none"
                  });
                }
              });
            }
          });
        }
      });
    },
    handleAvatarError(e) {
      console.error("头像加载失败:", e);
      this.userInfo.avatar_url = "./static/images/avatar/空中花园.png";
      setTimeout(() => {
        if (!this.userInfo.avatar_url.includes("空中花园")) {
          this.userInfo.avatar_url = "/static/images/avatar/空中花园.png";
        }
      }, 500);
    },
    isDefaultAvatar(url) {
      return url === "/static/images/avatar/空中花园.png" || url === "./static/images/avatar/空中花园.png";
    },
    changeAvatar() {
      if (!this.isLogin) {
        this.handleLogin();
        return;
      }
      common_vendor.index.showActionSheet({
        itemList: ["从相册选择", "拍照"],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.chooseImage("album");
          } else if (res.tapIndex === 1) {
            this.chooseImage("camera");
          }
        }
      });
    },
    chooseImage(sourceType) {
      common_vendor.index.chooseImage({
        count: 1,
        // 最多可以选择的图片张数
        sizeType: ["compressed"],
        // 可以指定是原图还是压缩图，默认二者都有
        sourceType: [sourceType],
        // album 从相册选图，camera 使用相机
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.index.showLoading({
            title: "上传中..."
          });
          this.uploadAvatar(tempFilePath);
        }
      });
    },
    uploadAvatar(filePath) {
      common_vendor.index.uploadFile({
        url: "http://localhost:3001/api/users/upload/avatar",
        // 修改为正确的上传接口路径
        filePath,
        name: "file",
        formData: {
          "user_id": this.userInfo.id
        },
        success: (uploadRes) => {
          try {
            const data = JSON.parse(uploadRes.data);
            if (data.status === "success") {
              const avatarUrl = data.data.url;
              const fullAvatarUrl = `http://localhost:3001${avatarUrl}`;
              this.updateAvatarUrl(fullAvatarUrl);
            } else {
              throw new Error(data.message || "上传失败");
            }
          } catch (error) {
            console.error("解析上传结果失败:", error);
            common_vendor.index.showToast({
              title: "上传失败，请稍后再试",
              icon: "none"
            });
          }
        },
        fail: (error) => {
          console.error("上传头像失败:", error);
          common_vendor.index.showToast({
            title: "上传失败，请稍后再试",
            icon: "none"
          });
        },
        complete: () => {
          common_vendor.index.hideLoading();
        }
      });
    },
    async updateAvatarUrl(avatarUrl) {
      try {
        const response = await this.updateUserAvatar(this.userInfo.id, avatarUrl);
        if (response.status === "success") {
          this.userInfo.avatar_url = avatarUrl;
          common_vendor.index.setStorageSync("userInfo", JSON.stringify(this.userInfo));
          common_vendor.index.showToast({
            title: "头像更新成功",
            icon: "success"
          });
        } else {
          throw new Error(response.message || "更新失败");
        }
      } catch (error) {
        console.error("更新头像URL失败:", error);
        common_vendor.index.showToast({
          title: "更新失败，请稍后再试",
          icon: "none"
        });
      }
    },
    updateUserAvatar(userId, avatarUrl) {
      return new Promise((resolve, reject) => {
        common_vendor.index.request({
          url: `http://localhost:3001/api/users/${userId}/avatar`,
          method: "PUT",
          data: {
            avatar_url: avatarUrl
          },
          success: (res) => {
            resolve(res.data);
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.isLogin && $data.userInfo.avatar_url && !$options.isDefaultAvatar($data.userInfo.avatar_url)
  }, $data.isLogin && $data.userInfo.avatar_url && !$options.isDefaultAvatar($data.userInfo.avatar_url) ? {
    b: $data.userInfo.avatar_url,
    c: common_vendor.o((...args) => $options.handleAvatarError && $options.handleAvatarError(...args))
  } : {
    d: common_assets._imports_0$4
  }, {
    e: common_vendor.o((...args) => $options.changeAvatar && $options.changeAvatar(...args)),
    f: common_vendor.t($data.userInfo.nickname || "未登录用户"),
    g: !$data.isLogin
  }, !$data.isLogin ? {
    h: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args))
  } : {}, {
    i: $data.isLogin
  }, $data.isLogin ? {
    j: common_vendor.t($data.userInfo.points || 0)
  } : {}, {
    k: common_vendor.o((...args) => $options.navigateToOrderList && $options.navigateToOrderList(...args)),
    l: $data.orderBadges.pending
  }, $data.orderBadges.pending ? {
    m: common_vendor.t($data.orderBadges.pending)
  } : {}, {
    n: common_vendor.o(($event) => $options.navigateToOrderList("pending")),
    o: $data.orderBadges.paid
  }, $data.orderBadges.paid ? {
    p: common_vendor.t($data.orderBadges.paid)
  } : {}, {
    q: common_vendor.o(($event) => $options.navigateToOrderList("paid")),
    r: $data.orderBadges.shipped
  }, $data.orderBadges.shipped ? {
    s: common_vendor.t($data.orderBadges.shipped)
  } : {}, {
    t: common_vendor.o(($event) => $options.navigateToOrderList("shipped")),
    v: $data.orderBadges.review
  }, $data.orderBadges.review ? {
    w: common_vendor.t($data.orderBadges.review)
  } : {}, {
    x: common_vendor.o(($event) => $options.navigateToOrderList("review")),
    y: common_vendor.o(($event) => $options.navigateTo("/pages/order/after-sale")),
    z: common_vendor.t($data.userStats.posts || 0),
    A: common_vendor.o(($event) => $options.navigateTo("/pages/post/my")),
    B: common_vendor.t($data.userStats.comments || 0),
    C: common_vendor.o(($event) => $options.navigateTo("/pages/comment/my")),
    D: $data.isLogin
  }, $data.isLogin ? {
    E: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
