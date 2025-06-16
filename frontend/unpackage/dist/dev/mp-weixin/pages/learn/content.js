"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
const _sfc_main = {
  data() {
    return {
      subtitle: "",
      contentCards: [],
      // 包含多个内容卡片的数组
      allImages: [],
      // 所有图片的URL数组
      imageIndex: {},
      // 记录每个卡片当前显示的图片索引
      isLoading: false,
      loadError: false,
      errorMessage: "获取内容失败",
      failedImages: {}
      // 记录加载失败的图片，格式: {cardIndex: [imageIndex1, imageIndex2, ...]}
    };
  },
  onLoad(options) {
    if (options.subtitle) {
      this.subtitle = decodeURIComponent(options.subtitle);
      this.fetchContent();
    } else {
      console.error("缺少subtitle参数");
      this.loadError = true;
      this.errorMessage = "参数错误";
      common_vendor.index.showToast({
        title: "参数错误",
        icon: "none"
      });
    }
  },
  methods: {
    async fetchContent() {
      this.isLoading = true;
      this.loadError = false;
      this.contentCards = [];
      this.allImages = [];
      this.failedImages = {};
      try {
        console.log("正在获取内容，小标题：", this.subtitle);
        const response = await api_api.getLearningContent(this.subtitle);
        console.log("获取内容响应:", response);
        if (response.status === "success" && response.data) {
          this.allImages = response.data.images || [];
          if (response.data.all_contents && response.data.all_contents.length > 0) {
            this.createContentCards(response.data.all_contents, this.allImages);
          } else if (response.data.text_content) {
            this.contentCards = [{
              title: this.subtitle,
              content: response.data.text_content,
              images: this.allImages
            }];
          }
          console.log("内容处理完成，卡片数量:", this.contentCards.length);
          if (this.contentCards.length === 0) {
            console.warn("处理后无可显示内容");
            common_vendor.index.showToast({
              title: "内容为空",
              icon: "none"
            });
          }
        } else {
          console.error("获取内容失败:", response);
          this.loadError = true;
          this.errorMessage = response.message || "获取内容失败";
          common_vendor.index.showToast({
            title: "获取内容失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("获取内容失败:", error);
        this.loadError = true;
        this.errorMessage = "网络错误，请重试";
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        this.isLoading = false;
      }
    },
    // 创建内容卡片，将内容与对应图片关联
    createContentCards(contents, allImages) {
      this.contentCards = [];
      console.log("创建内容卡片，所有图片:", allImages);
      console.log("获取到的内容数据:", contents);
      let hasValidContent = false;
      if (contents.length === 1 && contents[0].error && contents[0].source && contents[0].source.includes(",")) {
        console.log("检测到特殊情况：单内容项包含多个文件路径", contents[0]);
        const paths = contents[0].source.split(",").filter((path) => path.trim() !== "");
        if (paths.length > 1) {
          console.log(`从source分解出 ${paths.length} 个文件路径`, paths);
          const expandedContents = paths.map((filePath) => {
            const pathSegments = filePath.trim().split("/");
            const fileName = pathSegments[pathSegments.length - 1];
            const title = fileName.replace(/\.[^/.]+$/, "");
            return {
              title,
              content: "内容文件不存在",
              source: filePath.trim(),
              error: true
            };
          });
          console.log("扩展后的内容项:", expandedContents);
          contents = expandedContents;
        }
      }
      contents.forEach((content, index) => {
        const contentTitle = content.title || `内容 ${index + 1}`;
        console.log(`处理内容: "${contentTitle}"`);
        const matchingImages = allImages.filter((imgUrl) => {
          const decodedUrl = decodeURIComponent(imgUrl);
          return decodedUrl.includes(`/${contentTitle}`) || decodedUrl.includes(`${contentTitle}`) || // 添加额外匹配：尝试匹配不带数字后缀的标题名
          decodedUrl.includes(`/${contentTitle.replace(/\d+$/, "")}`) || decodedUrl.includes(`${contentTitle.replace(/\d+$/, "")}`);
        });
        console.log(`为内容 "${contentTitle}" 匹配到 ${matchingImages.length} 张图片`);
        const cardImages = matchingImages.length > 0 ? matchingImages : [];
        const isContentValid = !(content.error || content.content === "内容文件不存在" || content.content === "读取内容文件失败");
        if (isContentValid) {
          hasValidContent = true;
        }
        this.contentCards.push({
          title: contentTitle,
          content: content.content,
          images: cardImages,
          source: content.source,
          error: content.error || false
        });
      });
      console.log("创建了 " + this.contentCards.length + " 个内容卡片");
      this.contentCards.forEach((card, idx) => {
        console.log(`卡片 ${idx + 1}: 标题="${card.title}", 图片数量=${card.images.length}, 错误=${card.error}`);
      });
      if (!hasValidContent && allImages.length > 0) {
        console.log("没有有效内容，但有图片，创建通用图片展示卡");
        this.contentCards.unshift({
          title: this.subtitle,
          content: "",
          images: allImages,
          source: "",
          isGeneral: true
        });
      }
    },
    // 旧的提取文件名函数保留，但不再用于主要匹配
    extractFileName(path) {
      if (!path)
        return "";
      const fileName = path.split("/").pop();
      if (!fileName)
        return "";
      return fileName.replace(/\.[^/.]+$/, "");
    },
    // 旧的前缀提取函数保留，但不再用于主要匹配
    extractPrefix(fileName) {
      if (!fileName)
        return "";
      return fileName.replace(/\d+$/, "");
    },
    // 格式化内容文本
    formatContent(text) {
      if (!text)
        return "";
      if (text === "内容文件不存在" || text === "读取内容文件失败") {
        return `<div class="content-error-message">${text}</div>`;
      }
      let formatted = text.replace(/\n/g, "<br>");
      formatted = formatted.replace(/<br>/g, '</p><p class="paragraph">');
      formatted = '<p class="paragraph">' + formatted + "</p>";
      formatted = formatted.replace(/<p class="paragraph"><\/p>/g, "");
      formatted = formatted.replace(/#{1,6}\s+(.+)/g, "<h3>$1</h3>");
      formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      formatted = formatted.replace(/\*(.+?)\*/g, "<em>$1</em>");
      return formatted;
    },
    // 预览图片
    previewImages(images, currentIndex) {
      if (images && images.length > 0) {
        common_vendor.index.previewImage({
          current: images[currentIndex],
          urls: images
        });
      }
    },
    // 处理图片加载错误
    handleImageError(cardIndex, imageIndex) {
      console.error(`卡片 ${cardIndex + 1} 的图片 ${imageIndex + 1} 加载失败: ${this.contentCards[cardIndex].images[imageIndex]}`);
      if (!this.failedImages[cardIndex]) {
        this.failedImages[cardIndex] = [];
      }
      if (!this.failedImages[cardIndex].includes(imageIndex)) {
        this.failedImages[cardIndex].push(imageIndex);
      }
    },
    // 处理轮播图切换
    handleSwiperChange(cardIndex, event) {
      const currentIndex = event.detail.current;
      this.$set(this.imageIndex, cardIndex, currentIndex);
    },
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.t($data.subtitle),
    c: $data.isLoading
  }, $data.isLoading ? {} : {}, {
    d: !$data.isLoading && $data.contentCards.length > 0
  }, !$data.isLoading && $data.contentCards.length > 0 ? common_vendor.e({
    e: $data.contentCards.length > 1
  }, $data.contentCards.length > 1 ? {
    f: common_vendor.t($data.contentCards.length)
  } : {}, {
    g: common_vendor.f($data.contentCards, (card, cardIndex, i0) => {
      return common_vendor.e({
        a: card.title
      }, card.title ? {
        b: common_vendor.t(card.title)
      } : {}, {
        c: card.content
      }, card.content ? {
        d: $options.formatContent(card.content)
      } : {}, {
        e: card.images && card.images.length > 0
      }, card.images && card.images.length > 0 ? {
        f: common_vendor.t($data.imageIndex[cardIndex] + 1 || 1),
        g: common_vendor.t(card.images.length),
        h: common_vendor.f(card.images, (image, imgIndex, i1) => {
          return {
            a: image,
            b: common_vendor.o(($event) => $options.handleImageError(cardIndex, imgIndex), `${cardIndex}-${imgIndex}`),
            c: `${cardIndex}-${imgIndex}`
          };
        }),
        i: common_vendor.o((e) => $options.handleSwiperChange(cardIndex, e), cardIndex),
        j: common_vendor.o(() => $options.previewImages(card.images, $data.imageIndex[cardIndex] || 0), cardIndex)
      } : {}, {
        k: !card.content && (!card.images || card.images.length === 0)
      }, !card.content && (!card.images || card.images.length === 0) ? {} : {}, {
        l: cardIndex
      });
    })
  }) : {}, {
    h: !$data.isLoading && $data.contentCards.length === 0
  }, !$data.isLoading && $data.contentCards.length === 0 ? {} : {}, {
    i: $data.loadError
  }, $data.loadError ? {
    j: common_vendor.t($data.errorMessage),
    k: common_vendor.o((...args) => $options.fetchContent && $options.fetchContent(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
