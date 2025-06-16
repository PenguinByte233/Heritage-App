"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      isRegister: false,
      username: "",
      phone: "",
      password: "",
      confirmPassword: "",
      verifyCode: "",
      countDown: 0,
      isSubmitting: false,
      isAgreed: false,
      useVerifyCode: false
    };
  },
  onLoad(options) {
    if (options.type === "register") {
      this.isRegister = true;
    }
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    toggleRegister() {
      this.isRegister = !this.isRegister;
      this.username = "";
      this.phone = "";
      this.password = "";
      this.confirmPassword = "";
      this.verifyCode = "";
    },
    forgetPassword() {
      common_vendor.index.navigateTo({
        url: "/pages/login/forget-password"
      });
    },
    getVerifyCode() {
      if (this.countDown > 0)
        return;
      if (!this.validatePhone())
        return;
      this.countDown = 60;
      const timer = setInterval(() => {
        this.countDown--;
        if (this.countDown <= 0) {
          clearInterval(timer);
        }
      }, 1e3);
      common_vendor.index.showToast({
        title: "验证码已发送",
        icon: "success"
      });
    },
    validateForm() {
      if (this.isRegister) {
        if (!this.username.trim()) {
          common_vendor.index.showToast({
            title: "请输入用户名",
            icon: "none"
          });
          return false;
        }
        if (!this.validatePhone())
          return false;
        if (this.useVerifyCode && !this.verifyCode.trim()) {
          common_vendor.index.showToast({
            title: "请输入验证码",
            icon: "none"
          });
          return false;
        }
        if (this.password.length < 6) {
          common_vendor.index.showToast({
            title: "密码长度不能少于6位",
            icon: "none"
          });
          return false;
        }
        if (this.password !== this.confirmPassword) {
          common_vendor.index.showToast({
            title: "两次输入的密码不一致",
            icon: "none"
          });
          return false;
        }
        if (!this.isAgreed) {
          common_vendor.index.showToast({
            title: "请同意用户协议和隐私政策",
            icon: "none"
          });
          return false;
        }
      } else {
        if (!this.validatePhone())
          return false;
        if (!this.password.trim()) {
          common_vendor.index.showToast({
            title: "请输入密码",
            icon: "none"
          });
          return false;
        }
      }
      return true;
    },
    validatePhone() {
      if (!this.phone.trim()) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return false;
      }
      if (!/^1\d{10}$/.test(this.phone)) {
        common_vendor.index.showToast({
          title: "手机号格式不正确",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    async handleSubmit() {
      if (!this.validateForm())
        return;
      this.isSubmitting = true;
      try {
        let response;
        if (this.isRegister) {
          response = await api_api.register(
            this.username,
            // nickname
            this.phone,
            // phone_number
            this.password
            // password
          );
          if (response.status === "success") {
            common_vendor.index.showToast({
              title: "注册成功，请登录",
              icon: "success"
            });
            this.isRegister = false;
            this.password = "";
          } else {
            throw new Error(response.message || "注册失败");
          }
        } else {
          response = await api_api.login(
            this.phone,
            // phone_number
            this.password
            // password
          );
          if (response.status === "success") {
            const userInfo = {
              id: response.data.id,
              nickname: response.data.nickname,
              phone_number: response.data.phone_number,
              avatar_url: "/static/images/avatar/空中花园.png"
              // 默认头像
            };
            console.log("设置用户信息，头像路径:", userInfo.avatar_url);
            common_vendor.index.getImageInfo({
              src: userInfo.avatar_url,
              success: function(res) {
                console.log("头像图片加载成功:", res.width, "x", res.height);
              },
              fail: function(err) {
                console.error("头像图片加载失败:", err);
                userInfo.avatar_url = "./static/images/avatar/空中花园.png";
                common_vendor.index.setStorageSync("userInfo", JSON.stringify(userInfo));
              }
            });
            common_vendor.index.setStorageSync("token", "user_token");
            common_vendor.index.setStorageSync("userInfo", JSON.stringify(userInfo));
            common_vendor.index.showToast({
              title: "登录成功",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 1500);
          } else {
            throw new Error(response.message || "登录失败");
          }
        }
      } catch (error) {
        console.error(this.isRegister ? "注册失败:" : "登录失败:", error);
        common_vendor.index.showToast({
          title: error.message || (this.isRegister ? "注册失败，请稍后再试" : "登录失败，请检查账号密码"),
          icon: "none"
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    wechatLogin() {
      common_vendor.index.showToast({
        title: "微信登录功能开发中",
        icon: "none"
      });
    },
    handleAgreementChange(e) {
      this.isAgreed = e.detail.value.includes("agree");
    },
    viewUserAgreement() {
      common_vendor.index.navigateTo({
        url: "/pages/login/user-agreement"
      });
    },
    viewPrivacyPolicy() {
      common_vendor.index.navigateTo({
        url: "/pages/login/privacy-policy"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_assets._imports_0$6,
    c: common_vendor.t($data.isRegister ? "创建账号" : "欢迎回来"),
    d: common_vendor.t($data.isRegister ? "加入非遗小程序，探索传统文化" : "登录您的账号，继续探索之旅"),
    e: $data.isRegister
  }, $data.isRegister ? {
    f: $data.username,
    g: common_vendor.o(($event) => $data.username = $event.detail.value)
  } : {}, {
    h: $data.phone,
    i: common_vendor.o(($event) => $data.phone = $event.detail.value),
    j: $data.isRegister && $data.useVerifyCode
  }, $data.isRegister && $data.useVerifyCode ? {
    k: $data.verifyCode,
    l: common_vendor.o(($event) => $data.verifyCode = $event.detail.value),
    m: common_vendor.t($data.countDown > 0 ? `${$data.countDown}s` : "获取验证码"),
    n: $data.countDown > 0 ? 1 : "",
    o: common_vendor.o((...args) => $options.getVerifyCode && $options.getVerifyCode(...args))
  } : {}, {
    p: $data.password,
    q: common_vendor.o(($event) => $data.password = $event.detail.value),
    r: $data.isRegister
  }, $data.isRegister ? {
    s: $data.confirmPassword,
    t: common_vendor.o(($event) => $data.confirmPassword = $event.detail.value)
  } : {}, {
    v: $data.isRegister
  }, $data.isRegister ? {
    w: $data.isAgreed,
    x: common_vendor.o((...args) => $options.viewUserAgreement && $options.viewUserAgreement(...args)),
    y: common_vendor.o((...args) => $options.viewPrivacyPolicy && $options.viewPrivacyPolicy(...args)),
    z: common_vendor.o((...args) => $options.handleAgreementChange && $options.handleAgreementChange(...args))
  } : {}, {
    A: !$data.isRegister
  }, !$data.isRegister ? {
    B: common_vendor.o((...args) => $options.forgetPassword && $options.forgetPassword(...args))
  } : {}, {
    C: common_vendor.t($data.isSubmitting ? "处理中..." : $data.isRegister ? "注册" : "登录"),
    D: $data.isSubmitting,
    E: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args)),
    F: common_vendor.t($data.isRegister ? "已有账号？" : "没有账号？"),
    G: common_vendor.t($data.isRegister ? "去登录" : "去注册"),
    H: common_vendor.o((...args) => $options.toggleRegister && $options.toggleRegister(...args)),
    I: common_vendor.o((...args) => $options.wechatLogin && $options.wechatLogin(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
