"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
const _sfc_main = {
  data() {
    return {
      content: "",
      contentLength: 0,
      imageList: [],
      isLoading: false,
      showSubmitModal: false,
      userInfo: {}
      // 用户信息
    };
  },
  computed: {
    isValidPost() {
      return this.content.trim().length > 0 && this.content.length <= 500;
    }
  },
  onLoad() {
    this.getUserInfo();
  },
  methods: {
    getUserInfo() {
      try {
        const userInfoStr = common_vendor.index.getStorageSync("userInfo");
        if (userInfoStr) {
          try {
            this.userInfo = JSON.parse(userInfoStr);
          } catch (e) {
            this.userInfo = userInfoStr;
          }
          console.log("获取到的用户信息:", this.userInfo);
          if (!this.userInfo.id) {
            this.promptLogin();
          }
        } else {
          console.log("未找到用户信息");
          this.promptLogin();
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        this.promptLogin();
      }
    },
    promptLogin() {
      common_vendor.index.showModal({
        title: "提示",
        content: "请先登录后再发布帖子",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateTo({
              url: "/pages/login/login"
            });
          } else {
            common_vendor.index.navigateBack();
          }
        }
      });
    },
    checkContentLength() {
      this.contentLength = this.content.length;
    },
    chooseImage() {
      common_vendor.index.chooseImage({
        count: 9 - this.imageList.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths;
          this.imageList = [...this.imageList, ...tempFilePaths];
        },
        fail: (err) => {
          console.error("选择图片失败", err);
        }
      });
    },
    deleteImage(index) {
      this.imageList.splice(index, 1);
    },
    publishPost() {
      if (!this.isValidPost) {
        common_vendor.index.showToast({
          title: "内容不能为空",
          icon: "none"
        });
        return;
      }
      if (!this.userInfo || !this.userInfo.id) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后再发布帖子",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
            }
          }
        });
        return;
      }
      this.showSubmitModal = true;
    },
    cancelSubmit() {
      this.showSubmitModal = false;
    },
    async confirmSubmit() {
      this.showSubmitModal = false;
      this.isLoading = true;
      try {
        let uploadedImages = [];
        if (this.imageList.length > 0) {
          await this.uploadImages().then((res) => {
            uploadedImages = res;
          }).catch((err) => {
            console.error("上传图片失败:", err);
            throw new Error("上传图片失败");
          });
        }
        const postData = {
          author_id: this.userInfo.id,
          author_name: this.userInfo.nickname || "游客",
          content: this.content,
          images: uploadedImages
        };
        const response = await api_api.createPost(postData);
        if (response.status === "success") {
          common_vendor.index.showToast({
            title: "发布成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          throw new Error(response.message || "发布失败");
        }
      } catch (error) {
        console.error("发布帖子失败:", error);
        common_vendor.index.showToast({
          title: error.message || "发布失败，请稍后再试",
          icon: "none"
        });
      } finally {
        this.isLoading = false;
      }
    },
    async uploadImages() {
      console.log("上传图片:", this.imageList);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.imageList);
        }, 500);
      });
    },
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: !$options.isValidPost,
    c: $options.isValidPost ? 1 : "",
    d: common_vendor.o((...args) => $options.publishPost && $options.publishPost(...args)),
    e: $data.userInfo.avatar_url || "/static/images/default-avatar.png",
    f: common_vendor.t($data.userInfo.nickname || "游客"),
    g: common_vendor.o([($event) => $data.content = $event.detail.value, (...args) => $options.checkContentLength && $options.checkContentLength(...args)]),
    h: $data.content,
    i: common_vendor.t($data.contentLength),
    j: $data.contentLength > 450 ? 1 : "",
    k: common_vendor.f($data.imageList, (img, index, i0) => {
      return {
        a: img,
        b: common_vendor.o(($event) => $options.deleteImage(index), index),
        c: index
      };
    }),
    l: $data.imageList.length < 9
  }, $data.imageList.length < 9 ? {
    m: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args))
  } : {}, {
    n: $data.showSubmitModal
  }, $data.showSubmitModal ? {
    o: common_vendor.o((...args) => $options.cancelSubmit && $options.cancelSubmit(...args)),
    p: common_vendor.o((...args) => $options.confirmSubmit && $options.confirmSubmit(...args))
  } : {}, {
    q: $data.isLoading
  }, $data.isLoading ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
