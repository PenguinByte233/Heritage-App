if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const getNetworkIP = () => {
    let ip = "192.168.1.105";
    try {
      const networkType = uni.getNetworkType();
      formatAppLog("log", "at config/config.js:10", "当前网络类型:", networkType);
      const systemInfo = uni.getSystemInfoSync();
      formatAppLog("log", "at config/config.js:14", "当前系统信息:", systemInfo.platform);
    } catch (error) {
      formatAppLog("error", "at config/config.js:19", "获取网络信息失败:", error);
    }
    return ip;
  };
  const config = {
    // 开发环境配置
    develop: {
      // 本地开发服务器地址(模拟器访问)
      localhost: {
        BASE_API_URL: "http://localhost:3001/api",
        SERVER_URL: "http://localhost:3001"
      },
      // 局域网开发服务器地址(真机访问)
      network: {
        BASE_API_URL: `http://${getNetworkIP()}:3001/api`,
        SERVER_URL: `http://${getNetworkIP()}:3001`
      }
    },
    // 测试环境配置
    trial: {
      BASE_API_URL: "http://your-staging-server.com/api",
      SERVER_URL: "http://your-staging-server.com"
    },
    // 生产环境配置
    release: {
      BASE_API_URL: "https://your-production-server.com/api",
      SERVER_URL: "https://your-production-server.com"
    }
  };
  const getCurrentEnv = () => {
    try {
      const accountInfo = uni.getAccountInfoSync();
      return accountInfo.miniProgram ? accountInfo.miniProgram.envVersion : "develop";
    } catch (error) {
      formatAppLog("error", "at config/config.js:60", "获取环境信息失败:", error);
      return "develop";
    }
  };
  const isRealDevice = () => {
    try {
      const platform = uni.getSystemInfoSync().platform;
      return platform === "android" || platform === "ios";
    } catch (error) {
      formatAppLog("error", "at config/config.js:72", "获取平台信息失败:", error);
      return false;
    }
  };
  const currentEnv = getCurrentEnv();
  formatAppLog("log", "at config/config.js:79", "当前运行环境:", currentEnv);
  const exportConfig = currentEnv === "develop" ? isRealDevice() ? config.develop.network : config.develop.localhost : config[currentEnv];
  formatAppLog("log", "at config/config.js:86", "当前使用的API配置:", exportConfig);
  const BASE_URL = exportConfig.BASE_API_URL;
  const SERVER_URL = exportConfig.SERVER_URL;
  formatAppLog("log", "at api/api.js:10", "API服务地址:", BASE_URL);
  formatAppLog("log", "at api/api.js:11", "资源服务器地址:", SERVER_URL);
  const processImageUrl = (url) => {
    if (!url)
      return "";
    formatAppLog("log", "at api/api.js:17", "处理图片URL:", url);
    if (url.startsWith("http://") || url.startsWith("https://")) {
      formatAppLog("log", "at api/api.js:21", "已是完整URL，保持不变");
      return url;
    }
    const lastSlashIndex = url.lastIndexOf("/");
    const baseUrl = url.substring(0, lastSlashIndex + 1);
    const fileName = url.substring(lastSlashIndex + 1);
    const encodedFileName = encodeURIComponent(fileName);
    const encodedUrl = baseUrl + encodedFileName;
    if (url.startsWith("/learn/")) {
      const processedUrl2 = `${SERVER_URL}/uploads/assets${url.substring(6)}`;
      formatAppLog("log", "at api/api.js:37", "转换/learn/路径:", processedUrl2);
      return processedUrl2;
    }
    if (url.startsWith("/uploads/")) {
      const processedUrl2 = `${SERVER_URL}${encodedUrl}`;
      formatAppLog("log", "at api/api.js:44", "添加服务器基础URL:", processedUrl2);
      return processedUrl2;
    }
    if (url.startsWith("/static/")) {
      const processedUrl2 = `${SERVER_URL}/uploads/assets${url.substring(14)}`;
      formatAppLog("log", "at api/api.js:52", "替换静态路径:", processedUrl2);
      return processedUrl2;
    }
    const processedUrl = `${SERVER_URL}${encodedUrl}`;
    formatAppLog("log", "at api/api.js:58", "默认处理:", processedUrl);
    return processedUrl;
  };
  const request = (url, method = "GET", data = {}) => {
    return new Promise((resolve, reject) => {
      uni.request({
        url: `${BASE_URL}${url}`,
        method,
        data,
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  };
  const register = (nickname, phone_number, password) => {
    return request("/users/register", "POST", { nickname, phone_number, password });
  };
  const login = (phone_number, password) => {
    return request("/users/login", "POST", { phone_number, password });
  };
  const getLearningHeaders = (title) => {
    formatAppLog("log", "at api/api.js:110", `调用API获取 ${title} 的小标题列表...`);
    return request(`/learning/headers?title=${encodeURIComponent(title)}`).then((response) => {
      formatAppLog("log", "at api/api.js:113", "获取小标题原始响应:", JSON.stringify(response, null, 2));
      if (response.status === "success" && response.data && Array.isArray(response.data)) {
        response.data.forEach((item, index) => {
          formatAppLog("log", "at api/api.js:118", `
处理第 ${index + 1} 个小标题 [${item.subtitle}]`);
          if (item.image_url) {
            formatAppLog("log", "at api/api.js:122", `  原始封面图: ${item.image_url}`);
            item.image_url = processImageUrl(item.image_url);
            formatAppLog("log", "at api/api.js:124", `  处理后封面图: ${item.image_url}`);
          } else {
            formatAppLog("log", "at api/api.js:126", "  无封面图");
          }
          if (item.images && Array.isArray(item.images)) {
            formatAppLog("log", "at api/api.js:131", `  原始图片数组 (${item.images.length}张): ${JSON.stringify(item.images)}`);
            item.images = item.images.map((url, i) => {
              const processed = processImageUrl(url);
              formatAppLog("log", "at api/api.js:135", `    图片[${i + 1}]: ${url} -> ${processed}`);
              return processed;
            }).filter((url) => url);
            formatAppLog("log", "at api/api.js:139", `  处理后图片数组 (${item.images.length}张): ${JSON.stringify(item.images)}`);
          } else {
            formatAppLog("log", "at api/api.js:141", "  原始图片数组: 不存在或非数组");
            item.images = item.image_url ? [item.image_url] : [];
            formatAppLog("log", "at api/api.js:144", `  创建的图片数组: ${JSON.stringify(item.images)}`);
          }
        });
      } else {
        formatAppLog("error", "at api/api.js:148", "API返回无效响应:", response);
      }
      return response;
    }).catch((error) => {
      formatAppLog("error", "at api/api.js:153", "获取小标题列表失败:", error);
      throw error;
    });
  };
  const getLearningContent = (subtitle) => {
    formatAppLog("log", "at api/api.js:160", "调用API获取内容，小标题:", subtitle);
    return request(`/learning/content?subtitle=${encodeURIComponent(subtitle)}`).then((response) => {
      formatAppLog("log", "at api/api.js:162", "获取内容原始响应:", JSON.stringify(response, null, 2));
      if (response.status === "success" && response.data) {
        formatAppLog("log", "at api/api.js:166", `
图片数组状态检查：`);
        formatAppLog("log", "at api/api.js:167", `- response.data.images 是否存在: ${response.data.images ? "是" : "否"}`);
        if (response.data.images) {
          formatAppLog("log", "at api/api.js:170", `- 是否为数组: ${Array.isArray(response.data.images) ? "是" : "否"}`);
          if (Array.isArray(response.data.images)) {
            formatAppLog("log", "at api/api.js:172", `- 数组长度: ${response.data.images.length}`);
            formatAppLog("log", "at api/api.js:173", `- 原始图片数组内容: ${JSON.stringify(response.data.images)}`);
          }
        }
        if (response.data.images && Array.isArray(response.data.images)) {
          const originalImages = [...response.data.images];
          response.data.images = response.data.images.map((url, index) => {
            formatAppLog("log", "at api/api.js:182", `
处理第 ${index + 1}/${originalImages.length} 张图片:`);
            formatAppLog("log", "at api/api.js:183", `- 原始URL: ${url}`);
            const processedUrl = processImageUrl(url);
            formatAppLog("log", "at api/api.js:185", `- 处理后URL: ${processedUrl}`);
            return processedUrl;
          }).filter((url) => {
            const isValid = !!url;
            if (!isValid) {
              formatAppLog("warn", "at api/api.js:190", "- 发现无效URL，将被过滤");
            }
            return isValid;
          });
          formatAppLog("log", "at api/api.js:195", `
处理后的图片数组 (${response.data.images.length}张): ${JSON.stringify(response.data.images)}`);
        } else {
          formatAppLog("warn", "at api/api.js:197", "返回的数据中没有图片数组或图片数组不是有效数组");
          response.data.images = [];
          formatAppLog("log", "at api/api.js:200", "已创建空图片数组");
        }
        formatAppLog("log", "at api/api.js:204", `
内容数组状态检查：`);
        formatAppLog("log", "at api/api.js:205", `- response.data.all_contents 是否存在: ${response.data.all_contents ? "是" : "否"}`);
        if (response.data.all_contents) {
          formatAppLog("log", "at api/api.js:208", `- 是否为数组: ${Array.isArray(response.data.all_contents) ? "是" : "否"}`);
          if (Array.isArray(response.data.all_contents)) {
            formatAppLog("log", "at api/api.js:210", `- 数组长度: ${response.data.all_contents.length}`);
            formatAppLog("log", "at api/api.js:211", `- 内容标题: ${response.data.all_contents.map((item) => item.title).join(", ")}`);
            response.data.all_contents = response.data.all_contents.map((content) => {
              if (!content.title) {
                content.title = "未命名文档";
              }
              return content;
            });
          }
        } else {
          formatAppLog("log", "at api/api.js:222", "- 没有多内容数组，使用单一text_content");
          if (response.data.text_content) {
            response.data.all_contents = [{
              title: subtitle,
              content: response.data.text_content,
              source: "legacy"
            }];
            formatAppLog("log", "at api/api.js:230", `- 已从text_content创建内容数组，长度: 1`);
          } else {
            response.data.all_contents = [];
            formatAppLog("log", "at api/api.js:233", `- 创建了空内容数组`);
          }
        }
        formatAppLog("log", "at api/api.js:237", "处理后的完整响应数据结构:", JSON.stringify({
          images_count: response.data.images.length,
          contents_count: response.data.all_contents.length,
          content_titles: response.data.all_contents.map((c) => c.title)
        }, null, 2));
      } else {
        formatAppLog("error", "at api/api.js:243", "API返回错误或没有数据:", response);
      }
      return response;
    }).catch((error) => {
      formatAppLog("error", "at api/api.js:247", "API请求错误:", error);
      throw error;
    });
  };
  const getAllProducts = () => {
    return request("/products").then((response) => {
      if (response.status === "success" && response.data && Array.isArray(response.data)) {
        response.data.forEach((product) => {
          if (product.image_url) {
            product.image_url = processImageUrl(product.image_url);
          }
        });
      }
      return response;
    });
  };
  const getProductDetail = (id) => {
    return request(`/products/${id}`).then((response) => {
      if (response.status === "success" && response.data) {
        if (response.data.image_url) {
          response.data.image_url = processImageUrl(response.data.image_url);
        }
        if (response.data.additional_images && Array.isArray(response.data.additional_images)) {
          response.data.additional_images = response.data.additional_images.map((url) => processImageUrl(url));
        }
      }
      return response;
    });
  };
  const getProductCategories = () => {
    return request("/products/categories/all");
  };
  const createOrder = (user_id, product_id, quantity) => {
    return request("/orders", "POST", { user_id, product_id, quantity });
  };
  const createPost = (author_name, content) => {
    return request("/community/post", "POST", { author_name, content });
  };
  const getPosts = () => {
    return request("/community/posts").then((response) => {
      if (response.status === "success" && response.data && Array.isArray(response.data)) {
        response.data.forEach((post) => {
          if (post.image_url) {
            post.image_url = processImageUrl(post.image_url);
          }
        });
      }
      return response;
    });
  };
  const getPostDetail = (id) => {
    return request(`/community/post/${id}`).then((response) => {
      if (response.status === "success" && response.data) {
        if (response.data.image_url) {
          response.data.image_url = processImageUrl(response.data.image_url);
        }
      }
      return response;
    });
  };
  const addComment = (post_id, author_name, content) => {
    return request("/community/comment", "POST", { post_id, author_name, content });
  };
  const likePost = (post_id, user_id) => {
    return request("/community/like", "POST", { post_id, user_id });
  };
  const checkLiked = (post_id, user_id) => {
    return request(`/community/like/check?post_id=${post_id}&user_id=${user_id}`);
  };
  function getHomeResources() {
    return request("/home/resources");
  }
  function getMapResources() {
    return request("/home/map-resources");
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$d = {
    data() {
      return {
        currentProjectIndex: 0,
        bannerImages: [],
        categories: [
          {
            name: "首页",
            icon: "../../static/images/tabbar/museum.png",
            path: "/pages/home/home"
          },
          {
            name: "学习",
            icon: "../../static/images/tabbar/锤子.png",
            path: "/pages/learn/learn"
          },
          {
            name: "购买",
            icon: "../../static/images/tabbar/扇子.png",
            path: "/pages/buy/buy"
          },
          {
            name: "社区",
            icon: "../../static/images/tabbar/chat.png",
            path: "/pages/chat/chat"
          },
          {
            name: "我的",
            icon: "../../static/images/tabbar/profile.png",
            path: "/pages/profile/profile"
          }
        ],
        projectItems: [],
        mapImage: "",
        mapTitle: "中国非物质文化遗产分布",
        mapSubtitle: "点击查看详细分布",
        isLoading: true,
        statistics: {
          world: 42,
          national: 1557,
          provincial: 13087
        }
      };
    },
    onLoad() {
      this.fetchHomeResources();
      this.fetchMapResources();
    },
    methods: {
      // 获取首页资源
      async fetchHomeResources() {
        this.isLoading = true;
        try {
          formatAppLog("log", "at pages/home/home.vue:194", "开始获取首页资源...");
          const response = await getHomeResources();
          formatAppLog("log", "at pages/home/home.vue:196", "获取首页资源响应:", response);
          if (response && response.success && response.data) {
            formatAppLog("log", "at pages/home/home.vue:199", "获取首页资源成功");
            if (response.data.bannerImages && response.data.bannerImages.length > 0) {
              formatAppLog("log", "at pages/home/home.vue:203", "设置轮播图数据:", response.data.bannerImages);
              this.bannerImages = response.data.bannerImages.map((url) => processImageUrl(url));
            } else {
              formatAppLog("warn", "at pages/home/home.vue:206", "未获取到轮播图数据");
            }
            if (response.data.projectItems && response.data.projectItems.length > 0) {
              formatAppLog("log", "at pages/home/home.vue:211", "设置项目轮播图数据:", response.data.projectItems);
              this.projectItems = response.data.projectItems.map((item) => ({
                ...item,
                image: processImageUrl(item.image)
              }));
            } else {
              formatAppLog("warn", "at pages/home/home.vue:217", "未获取到项目轮播图数据");
            }
            if (response.data.mapImages && response.data.mapImages.length > 0) {
              const mapData = response.data.mapImages[0];
              formatAppLog("log", "at pages/home/home.vue:223", "设置地图数据:", mapData);
              this.mapImage = processImageUrl(mapData.image_url);
              this.mapTitle = mapData.title || "中国非物质文化遗产分布";
              this.mapSubtitle = mapData.description || "点击查看详细分布";
            } else {
              formatAppLog("warn", "at pages/home/home.vue:228", "未获取到地图数据");
            }
          } else {
            formatAppLog("error", "at pages/home/home.vue:231", "获取首页资源失败:", response);
            this.showErrorToast("获取首页资源失败");
          }
        } catch (error) {
          formatAppLog("error", "at pages/home/home.vue:235", "获取首页资源出错:", error);
          this.showErrorToast("获取首页资源出错");
        } finally {
          this.isLoading = false;
        }
      },
      // 获取地图详情资源
      async fetchMapResources() {
        try {
          formatAppLog("log", "at pages/home/home.vue:245", "开始获取地图详情资源...");
          const response = await getMapResources();
          formatAppLog("log", "at pages/home/home.vue:247", "获取地图详情资源响应:", response);
          if (response && response.success && response.data) {
            formatAppLog("log", "at pages/home/home.vue:250", "获取地图详情资源成功");
            if (response.data.statistics) {
              formatAppLog("log", "at pages/home/home.vue:254", "设置统计数据:", response.data.statistics);
              this.statistics = response.data.statistics;
            } else {
              formatAppLog("warn", "at pages/home/home.vue:257", "未获取到统计数据");
            }
            if (response.data.mapImages && response.data.mapImages.length > 0) {
              formatAppLog("log", "at pages/home/home.vue:262", "处理地图图片:", response.data.mapImages);
              response.data.mapImages = response.data.mapImages.map((url) => processImageUrl(url));
            }
          } else {
            formatAppLog("error", "at pages/home/home.vue:266", "获取地图资源失败:", response);
          }
        } catch (error) {
          formatAppLog("error", "at pages/home/home.vue:269", "获取地图资源出错:", error);
        }
      },
      // 显示错误提示
      showErrorToast(message) {
        uni.showToast({
          title: message,
          icon: "none",
          duration: 2e3
        });
      },
      navigateToCategory(category) {
        uni.switchTab({
          url: category.path
        });
      },
      navigateToLearn() {
        uni.switchTab({
          url: "/pages/learn/learn"
        });
      },
      navigateToLearnCategory(item) {
        const learnCategories = [
          "传统表演艺术",
          "传统服饰",
          "传统节日与庆典",
          "传统乐器与音乐",
          "传统艺术与工艺",
          "传统装饰与配饰",
          "文化与创意产业"
        ];
        if (learnCategories.includes(item.title)) {
          formatAppLog("log", "at pages/home/home.vue:305", "准备跳转到学习页面，分类:", item.title);
          getApp().globalData = getApp().globalData || {};
          getApp().globalData.selectedCategory = item.title;
          getApp().globalData.needScrollToCategory = true;
          formatAppLog("log", "at pages/home/home.vue:312", "已设置全局变量:", getApp().globalData);
          setTimeout(() => {
            uni.switchTab({
              url: "/pages/learn/learn",
              success: () => {
                formatAppLog("log", "at pages/home/home.vue:319", "已跳转到学习页面");
              },
              fail: (err) => {
                formatAppLog("error", "at pages/home/home.vue:322", "跳转到学习页面失败:", err);
              }
            });
          }, 50);
        } else {
          formatAppLog("log", "at pages/home/home.vue:328", "准备跳转到分类详情页:", item.title);
          uni.navigateTo({
            url: `/pages/learn/category?title=${encodeURIComponent(item.title)}&autoScroll=true`,
            success: () => {
              formatAppLog("log", "at pages/home/home.vue:332", "已跳转到分类详情页");
            },
            fail: (err) => {
              formatAppLog("error", "at pages/home/home.vue:335", "导航失败:", err);
              uni.showToast({
                title: "该分类暂未开放",
                icon: "none"
              });
            }
          });
        }
      },
      onProjectChange(e) {
        this.currentProjectIndex = e.detail.current;
      },
      showMapDetail() {
        uni.navigateTo({
          url: "/pages/home/map-detail"
        });
      },
      showSearchTip() {
        uni.showToast({
          title: "搜索功能开发中",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部区域（包含状态栏和标题） "),
      vue.createElementVNode("view", { class: "top-area" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "header" }, [
          vue.createElementVNode("text", { class: "title" }, "国家非遗")
        ])
      ]),
      vue.createCommentVNode(" 搜索框 "),
      vue.createElementVNode("view", {
        class: "search-box",
        onClick: _cache[0] || (_cache[0] = (...args) => $options.showSearchTip && $options.showSearchTip(...args))
      }, [
        vue.createElementVNode("image", {
          class: "search-icon",
          src: "https://img.icons8.com/ios/50/000000/search--v1.png"
        }),
        vue.createElementVNode("text", { class: "search-placeholder" }, "请输入关键字进行搜索")
      ]),
      vue.createCommentVNode(" 轮播图 "),
      vue.createElementVNode("view", { class: "banner-container" }, [
        vue.createElementVNode("swiper", {
          class: "banner-swiper",
          circular: "",
          autoplay: "",
          interval: "3000",
          duration: "500",
          "indicator-dots": "",
          "indicator-active-color": "#6d4126",
          "indicator-color": "rgba(255, 255, 255, 0.6)"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.bannerImages, (image, index) => {
              return vue.openBlock(), vue.createElementBlock("swiper-item", { key: index }, [
                vue.createElementVNode("image", {
                  class: "banner-image",
                  src: image,
                  mode: "aspectFill"
                }, null, 8, ["src"])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 五个分类入口 "),
      vue.createElementVNode("view", { class: "category-icons" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.categories, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "category-item",
              key: index,
              onClick: ($event) => $options.navigateToCategory(item)
            }, [
              vue.createElementVNode("image", {
                src: item.icon,
                class: "category-icon"
              }, null, 8, ["src"]),
              vue.createElementVNode(
                "text",
                { class: "category-name" },
                vue.toDisplayString(item.name),
                1
                /* TEXT */
              )
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 非遗地图区域 "),
      vue.createElementVNode("view", { class: "map-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("view", { class: "section-title-container" }, [
            vue.createElementVNode("view", { class: "section-icon" }, [
              (vue.openBlock(), vue.createElementBlock("svg", {
                width: "20",
                height: "20",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg"
              }, [
                vue.createElementVNode("path", {
                  d: "M12 22C12 22 20 16 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 16 12 22 12 22Z",
                  stroke: "#6d4126",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }),
                vue.createElementVNode("path", {
                  d: "M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z",
                  stroke: "#6d4126",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                })
              ]))
            ]),
            vue.createElementVNode("text", { class: "section-title" }, "非遗·地图")
          ]),
          vue.createElementVNode("view", {
            class: "more-container",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.showMapDetail && $options.showMapDetail(...args))
          }, [
            vue.createElementVNode("text", { class: "more-text" }, "详情"),
            vue.createElementVNode("view", { class: "more-icon" }, [
              (vue.openBlock(), vue.createElementBlock("svg", {
                width: "16",
                height: "16",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg"
              }, [
                vue.createElementVNode("path", {
                  d: "M9 18L15 12L9 6",
                  stroke: "#6d4126",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                })
              ]))
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "map-container" }, [
          vue.createElementVNode("view", { class: "map-card" }, [
            vue.createElementVNode("image", {
              class: "map-image",
              src: $data.mapImage,
              mode: "aspectFill",
              onClick: _cache[2] || (_cache[2] = (...args) => $options.showMapDetail && $options.showMapDetail(...args))
            }, null, 8, ["src"]),
            vue.createElementVNode("view", { class: "map-overlay" }, [
              vue.createElementVNode(
                "text",
                { class: "map-title" },
                vue.toDisplayString($data.mapTitle),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "map-subtitle" },
                vue.toDisplayString($data.mapSubtitle),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "map-stats" }, [
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-number" },
                vue.toDisplayString($data.statistics.world),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "世界级非遗")
            ]),
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-number" },
                vue.toDisplayString($data.statistics.national),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "国家级非遗")
            ]),
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-number" },
                vue.toDisplayString($data.statistics.provincial),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "省级非遗")
            ])
          ])
        ])
      ]),
      vue.createCommentVNode(" 非遗资源标题栏 "),
      vue.createElementVNode("view", { class: "section-header" }, [
        vue.createElementVNode("view", { class: "section-title-container" }, [
          vue.createElementVNode("view", { class: "section-icon" }, [
            (vue.openBlock(), vue.createElementBlock("svg", {
              width: "20",
              height: "20",
              viewBox: "0 0 24 24",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg"
            }, [
              vue.createElementVNode("path", {
                d: "M12 8L16 12L12 16L8 12L12 8Z",
                stroke: "#6d4126",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round"
              }),
              vue.createElementVNode("path", {
                d: "M12 3L19 10L12 21L5 10L12 3Z",
                stroke: "#6d4126",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round"
              })
            ]))
          ]),
          vue.createElementVNode("text", { class: "section-title" }, "非遗·资源")
        ]),
        vue.createElementVNode("view", {
          class: "more-container",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.navigateToLearn && $options.navigateToLearn(...args))
        }, [
          vue.createElementVNode("text", { class: "more-text" }, "更多"),
          vue.createElementVNode("view", { class: "more-icon" }, [
            (vue.openBlock(), vue.createElementBlock("svg", {
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg"
            }, [
              vue.createElementVNode("path", {
                d: "M9 18L15 12L9 6",
                stroke: "#6d4126",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round"
              })
            ]))
          ])
        ])
      ]),
      vue.createCommentVNode(" 内容区域 "),
      vue.createElementVNode("view", { class: "content-container" }, [
        vue.createCommentVNode(" 项目内容 "),
        vue.createElementVNode("view", { class: "projects-content" }, [
          vue.createCommentVNode(" 左侧装饰 "),
          vue.createElementVNode("view", { class: "border-decoration left" }),
          vue.createCommentVNode(" 项目轮播 "),
          vue.createElementVNode(
            "swiper",
            {
              class: "item-swiper",
              circular: "",
              "previous-margin": "60px",
              "next-margin": "60px",
              onChange: _cache[4] || (_cache[4] = (...args) => $options.onProjectChange && $options.onProjectChange(...args))
            },
            [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.projectItems, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock("swiper-item", {
                    key: index,
                    class: "swiper-item-container"
                  }, [
                    vue.createElementVNode("view", {
                      class: vue.normalizeClass(["item-card", { "current-item": $data.currentProjectIndex === index }]),
                      onClick: ($event) => $options.navigateToLearnCategory(item)
                    }, [
                      vue.createElementVNode("image", {
                        class: "item-image",
                        src: item.image,
                        mode: "aspectFill"
                      }, null, 8, ["src"])
                    ], 10, ["onClick"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ],
            32
            /* NEED_HYDRATION */
          ),
          vue.createCommentVNode(" 右侧装饰 "),
          vue.createElementVNode("view", { class: "border-decoration right" }),
          vue.createCommentVNode(" 标题栏 "),
          vue.createElementVNode("view", { class: "item-title-bar" }, [
            vue.createElementVNode(
              "text",
              { class: "item-title" },
              vue.toDisplayString($data.projectItems[$data.currentProjectIndex].title),
              1
              /* TEXT */
            )
          ]),
          vue.createCommentVNode(" 描述 "),
          vue.createElementVNode("view", { class: "item-description" }, [
            vue.createElementVNode(
              "text",
              { class: "item-description-text" },
              vue.toDisplayString($data.projectItems[$data.currentProjectIndex].description),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 底部留白区域 "),
      vue.createElementVNode("view", { style: { "height": "60px" } })
    ]);
  }
  const PagesHomeHome = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__file", "Y:/Parttime/非遗小程序开发/Demo/Demo/frontend/pages/home/home.vue"]]);
  const _sfc_main$c = {
    data() {
      return {
        isLoading: true,
        mapImages: [],
        statistics: {
          world: 42,
          national: 1557,
          provincial: 13087
        },
        regionData: [],
        categoryData: []
      };
    },
    onLoad() {
      this.fetchMapResources();
    },
    methods: {
      async fetchMapResources() {
        this.isLoading = true;
        try {
          formatAppLog("log", "at pages/home/map-detail.vue:162", "开始获取地图详情资源...");
          const response = await getMapResources();
          formatAppLog("log", "at pages/home/map-detail.vue:164", "获取地图详情资源响应:", response);
          if (response && response.success && response.data) {
            formatAppLog("log", "at pages/home/map-detail.vue:167", "获取地图详情资源成功");
            if (response.data.mapImages && response.data.mapImages.length > 0) {
              this.mapImages = response.data.mapImages.map((url) => processImageUrl(url));
              formatAppLog("log", "at pages/home/map-detail.vue:173", "处理后的地图图片URLs:", this.mapImages);
            } else {
              const defaultImages = [
                "/uploads/assets/Home/Map/非遗分布地图1.jpg",
                "/uploads/assets/Home/Map/非遗分布地图2.jpg"
              ];
              this.mapImages = defaultImages.map((url) => processImageUrl(url));
              formatAppLog("log", "at pages/home/map-detail.vue:181", "使用默认地图图片URLs:", this.mapImages);
            }
            if (response.data.statistics) {
              formatAppLog("log", "at pages/home/map-detail.vue:186", "设置统计数据:", response.data.statistics);
              this.statistics = response.data.statistics;
            }
            if (response.data.regionData && response.data.regionData.length > 0) {
              formatAppLog("log", "at pages/home/map-detail.vue:192", "设置地区分布数据:", response.data.regionData);
              this.regionData = response.data.regionData;
            } else {
              this.regionData = [
                { name: "浙江省", count: 158, percentage: 100 },
                { name: "江苏省", count: 142, percentage: 90 },
                { name: "山东省", count: 138, percentage: 87 },
                { name: "河南省", count: 132, percentage: 84 },
                { name: "四川省", count: 130, percentage: 82 }
              ];
              formatAppLog("log", "at pages/home/map-detail.vue:203", "使用默认地区分布数据");
            }
            if (response.data.categoryData && response.data.categoryData.length > 0) {
              formatAppLog("log", "at pages/home/map-detail.vue:208", "设置分类数据:", response.data.categoryData);
              this.categoryData = response.data.categoryData;
            } else {
              this.categoryData = [
                { name: "传统表演艺术", count: 326 },
                { name: "传统技艺", count: 614 },
                { name: "传统医药", count: 98 },
                { name: "民俗", count: 248 },
                { name: "传统音乐", count: 185 },
                { name: "传统美术", count: 86 }
              ];
              formatAppLog("log", "at pages/home/map-detail.vue:220", "使用默认分类数据");
            }
          } else {
            formatAppLog("error", "at pages/home/map-detail.vue:223", "获取地图资源失败:", response);
            this.useDefaultData();
          }
        } catch (error) {
          formatAppLog("error", "at pages/home/map-detail.vue:228", "获取地图资源出错:", error);
          this.useDefaultData();
        } finally {
          this.isLoading = false;
        }
      },
      // 使用默认数据
      useDefaultData() {
        const defaultImages = [
          "/uploads/assets/Home/Map/非遗分布地图1.jpg",
          "/uploads/assets/Home/Map/非遗分布地图2.jpg"
        ];
        this.mapImages = defaultImages.map((url) => processImageUrl(url));
        formatAppLog("log", "at pages/home/map-detail.vue:244", "使用默认数据 - 地图图片URLs:", this.mapImages);
        this.statistics = {
          world: 42,
          national: 1557,
          provincial: 13087
        };
        this.regionData = [
          { name: "浙江省", count: 158, percentage: 100 },
          { name: "江苏省", count: 142, percentage: 90 },
          { name: "山东省", count: 138, percentage: 87 },
          { name: "河南省", count: 132, percentage: 84 },
          { name: "四川省", count: 130, percentage: 82 }
        ];
        this.categoryData = [
          { name: "传统表演艺术", count: 326 },
          { name: "传统技艺", count: 614 },
          { name: "传统医药", count: 98 },
          { name: "民俗", count: 248 },
          { name: "传统音乐", count: 185 },
          { name: "传统美术", count: 86 }
        ];
      },
      goBack() {
        uni.navigateBack();
      },
      previewImage(url) {
        uni.previewImage({
          urls: this.mapImages,
          current: url
        });
      },
      navigateToCategory(categoryName) {
        uni.navigateTo({
          url: `/pages/learn/category?title=${encodeURIComponent(categoryName)}`
        });
      }
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部区域（包含状态栏和标题） "),
      vue.createElementVNode("view", { class: "top-area" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "header" }, [
          vue.createElementVNode("view", {
            class: "back-button",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "←")
          ]),
          vue.createElementVNode("text", { class: "title" }, "非遗地图详情"),
          vue.createElementVNode("view", { style: { "width": "60rpx" } })
        ])
      ]),
      vue.createCommentVNode(" 内容区域 "),
      vue.createElementVNode("scroll-view", {
        class: "content",
        "scroll-y": ""
      }, [
        vue.createCommentVNode(" 加载指示器 "),
        $data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-container"
        }, [
          vue.createElementVNode("view", { class: "loading-icon" }),
          vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
        ])) : (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 1 },
          [
            vue.createCommentVNode(" 地图标题 "),
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "main-title" }, "中国非物质文化遗产分布"),
              vue.createElementVNode("text", { class: "sub-title" }, "截至2023年统计数据")
            ]),
            vue.createCommentVNode(" 地图展示 "),
            vue.createElementVNode("view", { class: "map-container" }, [
              vue.createElementVNode("swiper", {
                class: "map-swiper",
                "indicator-dots": "",
                "indicator-active-color": "#6d4126",
                "indicator-color": "rgba(255, 255, 255, 0.6)"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.mapImages, (url, index) => {
                    return vue.openBlock(), vue.createElementBlock("swiper-item", { key: index }, [
                      vue.createElementVNode("image", {
                        class: "map-image",
                        src: url,
                        mode: "widthFix",
                        onClick: ($event) => $options.previewImage(url)
                      }, null, 8, ["src", "onClick"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("text", { class: "map-hint" }, "点击图片可查看大图")
            ]),
            vue.createCommentVNode(" 统计数据 "),
            vue.createElementVNode("view", { class: "stats-section" }, [
              vue.createElementVNode("view", { class: "stats-title" }, [
                vue.createElementVNode("view", { class: "stats-icon" }, [
                  (vue.openBlock(), vue.createElementBlock("svg", {
                    width: "20",
                    height: "20",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    xmlns: "http://www.w3.org/2000/svg"
                  }, [
                    vue.createElementVNode("path", {
                      d: "M18 20V10",
                      stroke: "#6d4126",
                      "stroke-width": "2",
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round"
                    }),
                    vue.createElementVNode("path", {
                      d: "M12 20V4",
                      stroke: "#6d4126",
                      "stroke-width": "2",
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round"
                    }),
                    vue.createElementVNode("path", {
                      d: "M6 20V14",
                      stroke: "#6d4126",
                      "stroke-width": "2",
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round"
                    })
                  ]))
                ]),
                vue.createElementVNode("text", { class: "stats-title-text" }, "非遗项目统计")
              ]),
              vue.createElementVNode("view", { class: "stats-cards" }, [
                vue.createElementVNode("view", { class: "stats-card" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "stats-number" },
                    vue.toDisplayString($data.statistics.world),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", { class: "stats-label" }, "世界级非遗"),
                  vue.createElementVNode("text", { class: "stats-desc" }, "联合国教科文组织认定")
                ]),
                vue.createElementVNode("view", { class: "stats-card" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "stats-number" },
                    vue.toDisplayString($data.statistics.national),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", { class: "stats-label" }, "国家级非遗"),
                  vue.createElementVNode("text", { class: "stats-desc" }, "国家文化和旅游部认定")
                ]),
                vue.createElementVNode("view", { class: "stats-card" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "stats-number" },
                    vue.toDisplayString($data.statistics.provincial),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", { class: "stats-label" }, "省级非遗"),
                  vue.createElementVNode("text", { class: "stats-desc" }, "各省级文化和旅游厅认定")
                ])
              ])
            ]),
            vue.createCommentVNode(" 地区分布 "),
            vue.createElementVNode("view", { class: "region-section" }, [
              vue.createElementVNode("view", { class: "section-title" }, [
                vue.createElementVNode("view", { class: "section-icon" }, [
                  (vue.openBlock(), vue.createElementBlock("svg", {
                    width: "20",
                    height: "20",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    xmlns: "http://www.w3.org/2000/svg"
                  }, [
                    vue.createElementVNode("path", {
                      d: "M12 22C12 22 20 16 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 16 12 22 12 22Z",
                      stroke: "#6d4126",
                      "stroke-width": "2",
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round"
                    }),
                    vue.createElementVNode("path", {
                      d: "M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z",
                      stroke: "#6d4126",
                      "stroke-width": "2",
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round"
                    })
                  ]))
                ]),
                vue.createElementVNode("text", { class: "section-title-text" }, "地区分布热点")
              ]),
              vue.createElementVNode("view", { class: "region-list" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.regionData, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "region-item",
                      key: index
                    }, [
                      vue.createElementVNode(
                        "view",
                        { class: "region-rank" },
                        vue.toDisplayString(index + 1),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("view", { class: "region-info" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "region-name" },
                          vue.toDisplayString(item.name),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "region-count" },
                          vue.toDisplayString(item.count) + "项",
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "region-bar-container" }, [
                        vue.createElementVNode(
                          "view",
                          {
                            class: "region-bar",
                            style: vue.normalizeStyle({ width: item.percentage + "%" })
                          },
                          null,
                          4
                          /* STYLE */
                        )
                      ])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            vue.createCommentVNode(" 分类统计 "),
            vue.createElementVNode("view", { class: "category-section" }, [
              vue.createElementVNode("view", { class: "section-title" }, [
                vue.createElementVNode("view", { class: "section-icon" }, [
                  (vue.openBlock(), vue.createElementBlock("svg", {
                    width: "20",
                    height: "20",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    xmlns: "http://www.w3.org/2000/svg"
                  }, [
                    vue.createElementVNode("path", {
                      d: "M12 8L16 12L12 16L8 12L12 8Z",
                      stroke: "#6d4126",
                      "stroke-width": "2",
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round"
                    }),
                    vue.createElementVNode("path", {
                      d: "M12 3L19 10L12 21L5 10L12 3Z",
                      stroke: "#6d4126",
                      "stroke-width": "2",
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round"
                    })
                  ]))
                ]),
                vue.createElementVNode("text", { class: "section-title-text" }, "非遗类别分布")
              ]),
              vue.createElementVNode("view", { class: "category-list" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.categoryData, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "category-item",
                      key: index,
                      onClick: ($event) => $options.navigateToCategory(item.name)
                    }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: vue.normalizeClass(["category-icon", "category-icon-" + index % 5])
                        },
                        [
                          vue.createElementVNode(
                            "text",
                            { class: "category-icon-text" },
                            vue.toDisplayString(item.name.substr(0, 1)),
                            1
                            /* TEXT */
                          )
                        ],
                        2
                        /* CLASS */
                      ),
                      vue.createElementVNode("view", { class: "category-info" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "category-name" },
                          vue.toDisplayString(item.name),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "category-count" },
                          vue.toDisplayString(item.count) + "项",
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "category-arrow" }, [
                        vue.createElementVNode("text", { class: "arrow-icon" }, "›")
                      ])
                    ], 8, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            vue.createCommentVNode(" 底部说明 "),
            vue.createElementVNode("view", { class: "footer-note" }, [
              vue.createElementVNode("text", { class: "note-text" }, "数据来源：中国非物质文化遗产网"),
              vue.createElementVNode("text", { class: "note-text" }, "最后更新：2023年12月")
            ])
          ],
          64
          /* STABLE_FRAGMENT */
        ))
      ])
    ]);
  }
  const PagesHomeMapDetail = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__file", "Y:/Parttime/非遗小程序开发/Demo/Demo/frontend/pages/home/map-detail.vue"]]);
  const _imports_0$6 = "/static/images/empty-products.png";
  const _sfc_main$b = {
    data() {
      return {
        products: [],
        categories: [],
        selectedCategory: "all",
        isLoading: false,
        searchKeyword: ""
      };
    },
    computed: {
      filteredProducts() {
        let result = this.products;
        if (this.selectedCategory !== "all") {
          result = result.filter((product) => product.category === this.selectedCategory);
        }
        if (this.searchKeyword.trim()) {
          const keyword = this.searchKeyword.toLowerCase().trim();
          result = result.filter(
            (product) => {
              var _a;
              return product.name.toLowerCase().includes(keyword) || ((_a = product.description) == null ? void 0 : _a.toLowerCase().includes(keyword)) || product.category.toLowerCase().includes(keyword);
            }
          );
        }
        return result;
      }
    },
    onLoad() {
      this.fetchCategories();
      this.fetchProducts();
    },
    methods: {
      async fetchCategories() {
        try {
          const response = await getProductCategories();
          if (response.status === "success" && response.data) {
            this.categories = response.data;
          }
        } catch (error) {
          formatAppLog("error", "at pages/buy/buy.vue:121", "获取商品分类失败:", error);
        }
      },
      async fetchProducts() {
        this.isLoading = true;
        try {
          const response = await getAllProducts();
          if (response.status === "success" && response.data) {
            this.products = response.data;
            formatAppLog("log", "at pages/buy/buy.vue:130", "获取到商品数据:", this.products.length);
            this.products.forEach((product, index) => {
              if (!product.id) {
                formatAppLog("warn", "at pages/buy/buy.vue:134", `警告: 第${index + 1}个商品没有ID`, product);
              }
            });
          } else {
            uni.showToast({
              title: "获取商品失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/buy/buy.vue:144", "获取商品列表失败:", error);
          uni.showToast({
            title: "获取商品失败",
            icon: "none"
          });
        } finally {
          this.isLoading = false;
        }
      },
      selectCategory(category) {
        this.selectedCategory = category;
      },
      searchProducts() {
        formatAppLog("log", "at pages/buy/buy.vue:158", "搜索关键词:", this.searchKeyword);
      }
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部标题栏 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "title-row" }, [
          vue.createElementVNode("text", { class: "title" }, "非遗商城")
        ]),
        vue.createElementVNode("view", { class: "search-row" }, [
          vue.createElementVNode("view", { class: "search-box" }, [
            vue.createElementVNode("text", { class: "search-icon" }, "🔍"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "search-input",
                placeholder: "搜索非遗商品",
                onConfirm: _cache[0] || (_cache[0] = (...args) => $options.searchProducts && $options.searchProducts(...args)),
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.searchKeyword = $event)
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $data.searchKeyword]
            ])
          ])
        ])
      ]),
      vue.createCommentVNode(" 内容区域 "),
      vue.createElementVNode("view", { class: "content-area" }, [
        vue.createCommentVNode(" 分类选择 "),
        vue.createElementVNode("view", { class: "category-tabs" }, [
          vue.createElementVNode("scroll-view", {
            "scroll-x": "",
            class: "scroll-view",
            "show-scrollbar": "false"
          }, [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["category-tab", { active: $data.selectedCategory === "all" }]),
                onClick: _cache[2] || (_cache[2] = ($event) => $options.selectCategory("all"))
              },
              [
                vue.createElementVNode("text", { class: "category-text" }, "全部")
              ],
              2
              /* CLASS */
            ),
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.categories, (category, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index,
                  class: vue.normalizeClass(["category-tab", { active: $data.selectedCategory === category }]),
                  onClick: ($event) => $options.selectCategory(category)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "category-text" },
                    vue.toDisplayString(category),
                    1
                    /* TEXT */
                  )
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createCommentVNode(" 商品列表 "),
        vue.createElementVNode("view", { class: "product-list" }, [
          vue.createCommentVNode(" 加载提示 "),
          $data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "loading-container"
          }, [
            vue.createElementVNode("view", { class: "loading-spinner" }),
            vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 商品卡片 "),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($options.filteredProducts, (product, index) => {
              return vue.openBlock(), vue.createElementBlock("navigator", {
                key: index,
                class: "product-card",
                url: `/pages/buy/detail?id=${product.id}`,
                "hover-class": "navigator-hover"
              }, [
                vue.createElementVNode("image", {
                  class: "product-image",
                  src: product.image_url,
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "product-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "product-name" },
                    vue.toDisplayString(product.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "product-price" },
                    "¥" + vue.toDisplayString(product.price),
                    1
                    /* TEXT */
                  )
                ])
              ], 8, ["url"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createCommentVNode(" 无内容提示 "),
          !$data.isLoading && $options.filteredProducts.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "empty-container"
          }, [
            vue.createElementVNode("image", {
              class: "empty-icon",
              src: _imports_0$6
            }),
            vue.createElementVNode("text", { class: "empty-text" }, "暂无相关商品")
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ])
    ]);
  }
  const PagesBuyBuy = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__file", "Y:/Parttime/非遗小程序开发/Demo/Demo/frontend/pages/buy/buy.vue"]]);
  const _imports_0$5 = "/static/images/QR/douyin-qrcode.png";
  const _sfc_main$a = {
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
        const userInfoStr = uni.getStorageSync("userInfo");
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
        formatAppLog("error", "at pages/buy/detail.vue:113", "获取用户信息失败:", error);
      }
    },
    methods: {
      async fetchProductDetail() {
        this.isLoading = true;
        try {
          const response = await getProductDetail(this.id);
          if (response.status === "success" && response.data) {
            this.product = response.data;
            formatAppLog("log", "at pages/buy/detail.vue:123", "商品详情:", this.product);
          } else {
            uni.showToast({
              title: "获取商品详情失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/buy/detail.vue:131", "获取商品详情失败:", error);
          uni.showToast({
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
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          setTimeout(() => {
            uni.switchTab({
              url: "/pages/profile/profile"
            });
          }, 1500);
          return;
        }
        if (!this.product) {
          uni.showToast({
            title: "商品信息不完整",
            icon: "none"
          });
          return;
        }
        try {
          const response = await createOrder(this.userId, this.product.id, this.quantity);
          if (response.status === "success") {
            uni.showToast({
              title: `购买成功，获得${response.data.points_earned}积分`,
              icon: "success",
              duration: 2e3
            });
            try {
              const userInfoStr = uni.getStorageSync("userInfo");
              if (userInfoStr) {
                let userInfo;
                try {
                  userInfo = JSON.parse(userInfoStr);
                } catch (e) {
                  userInfo = userInfoStr;
                }
                userInfo.points = response.data.total_points;
                uni.setStorageSync("userInfo", JSON.stringify(userInfo));
              }
            } catch (error) {
              formatAppLog("error", "at pages/buy/detail.vue:212", "更新用户积分失败:", error);
            }
            setTimeout(() => {
              uni.navigateBack();
            }, 2e3);
          } else {
            uni.showToast({
              title: response.message || "购买失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/buy/detail.vue:226", "购买商品失败:", error);
          uni.showToast({
            title: "购买失败，请稍后再试",
            icon: "none"
          });
        }
      },
      goBack() {
        uni.navigateBack();
      }
    },
    computed: {
      // 根据数量计算可得积分
      totalPoints() {
        return this.pointsPerItem * this.quantity;
      }
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部标题栏 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "title-row" }, [
          vue.createElementVNode("view", {
            class: "back-button",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "←")
          ]),
          vue.createElementVNode("text", { class: "title" }, "商品详情"),
          vue.createElementVNode("view", { style: { "width": "60rpx" } }),
          vue.createCommentVNode(" 占位，保持标题居中 ")
        ])
      ]),
      vue.createCommentVNode(" 商品信息 "),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "content-scroll"
      }, [
        $data.product ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "product-container"
        }, [
          vue.createCommentVNode(" 商品图片 "),
          vue.createElementVNode("image", {
            class: "product-image",
            src: $data.product.image_url,
            mode: "widthFix"
          }, null, 8, ["src"]),
          vue.createCommentVNode(" 商品信息 "),
          vue.createElementVNode("view", { class: "product-info" }, [
            vue.createElementVNode(
              "text",
              { class: "product-name" },
              vue.toDisplayString($data.product.name),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "product-price" },
              "¥" + vue.toDisplayString($data.product.price),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "product-details-row" }, [
              vue.createElementVNode(
                "text",
                { class: "product-category" },
                "分类：" + vue.toDisplayString($data.product.category),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "product-points" }, [
                vue.createTextVNode("积分："),
                vue.createElementVNode(
                  "text",
                  { class: "points-value" },
                  vue.toDisplayString($options.totalPoints),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createCommentVNode(" 商品描述 "),
            $data.product.description ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "product-description"
            }, [
              vue.createElementVNode("text", { class: "description-title" }, "商品描述"),
              vue.createElementVNode("rich-text", {
                class: "description-content",
                nodes: $options.formatDescription($data.product.description)
              }, null, 8, ["nodes"])
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 抖音溯源二维码 "),
        vue.createElementVNode("view", { class: "trace-container" }, [
          vue.createElementVNode("text", { class: "trace-title" }, "用抖音扫码溯源"),
          vue.createElementVNode("view", { class: "trace-qrcode-container" }, [
            vue.createElementVNode("image", {
              class: "trace-qrcode",
              src: _imports_0$5,
              mode: "aspectFit"
            }),
            vue.createCommentVNode(" 注意：请确保将二维码图片保存为 /static/images/QR/douyin-qrcode.png ")
          ]),
          vue.createElementVNode("text", { class: "trace-hint" }, "扫码了解更多非遗工艺及制作过程")
        ]),
        vue.createCommentVNode(" 加载提示 "),
        $data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "loading-container"
        }, [
          vue.createElementVNode("view", { class: "loading-spinner" }),
          vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 无内容提示 "),
        !$data.isLoading && !$data.product ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "empty-container"
        }, [
          vue.createElementVNode("text", { class: "empty-text" }, "商品不存在")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 底部占位，确保内容不被购买栏遮挡 "),
        vue.createElementVNode("view", { style: { "height": "140rpx" } })
      ]),
      vue.createCommentVNode(" 购买按钮 "),
      vue.createElementVNode("view", { class: "action-bar" }, [
        vue.createElementVNode("view", { class: "quantity-control" }, [
          vue.createElementVNode("text", {
            class: "quantity-btn",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.decreaseQuantity && $options.decreaseQuantity(...args))
          }, "-"),
          vue.createElementVNode(
            "text",
            { class: "quantity-value" },
            vue.toDisplayString($data.quantity),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", {
            class: "quantity-btn",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.increaseQuantity && $options.increaseQuantity(...args))
          }, "+")
        ]),
        vue.createElementVNode("view", { class: "buy-action" }, [
          vue.createElementVNode(
            "text",
            { class: "points-hint" },
            "获得" + vue.toDisplayString($options.totalPoints) + "积分",
            1
            /* TEXT */
          ),
          vue.createElementVNode("button", {
            class: "buy-button",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.buyProduct && $options.buyProduct(...args))
          }, "立即购买")
        ])
      ])
    ]);
  }
  const PagesBuyDetail = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__file", "Y:/Parttime/非遗小程序开发/Demo/Demo/frontend/pages/buy/detail.vue"]]);
  const _sfc_main$9 = {
    data() {
      return {
        // 本地存储的大标题数据
        categories: [
          { title: "传统表演艺术" },
          { title: "传统服饰" },
          { title: "传统节日与庆典" },
          { title: "传统乐器与音乐" },
          { title: "传统艺术与工艺" },
          { title: "传统装饰与配饰" },
          { title: "文化与创意产业" }
        ],
        currentCategory: "",
        subcategories: [],
        isLoading: false,
        currentSwiperIndex: {}
        // 记录每个卡片的当前滑动位置
      };
    },
    onLoad(options) {
      if (options && options.title) {
        const title = decodeURIComponent(options.title);
        const found = this.categories.find((cat) => cat.title === title);
        if (found) {
          this.currentCategory = title;
        } else {
          this.currentCategory = this.categories[0].title;
        }
      } else {
        if (this.categories.length > 0) {
          this.currentCategory = this.categories[0].title;
        }
      }
      this.fetchSubcategories(this.currentCategory);
    },
    onShow() {
      const app = getApp();
      if (app && app.globalData) {
        formatAppLog("log", "at pages/learn/learn.vue:134", "检查全局变量:", app.globalData);
        if (app.globalData.selectedCategory) {
          const category = app.globalData.selectedCategory;
          formatAppLog("log", "at pages/learn/learn.vue:138", "发现全局选中的分类:", category);
          const found = this.categories.find((cat) => cat.title === category);
          if (found) {
            if (this.currentCategory !== category) {
              formatAppLog("log", "at pages/learn/learn.vue:144", "切换到分类:", category);
              this.currentCategory = category;
              this.fetchSubcategories(category);
            }
            if (app.globalData.needScrollToCategory) {
              formatAppLog("log", "at pages/learn/learn.vue:151", "需要滚动到分类:", category);
              this.$nextTick(() => {
                const index = this.categories.findIndex((cat) => cat.title === category);
                if (index !== -1) {
                  setTimeout(() => {
                    formatAppLog("log", "at pages/learn/learn.vue:159", "滚动到分类索引:", index);
                    const query = uni.createSelectorQuery().in(this);
                    query.selectAll(".nav-tab").boundingClientRect((rects) => {
                      if (rects && rects[index]) {
                        const tabRect = rects[index];
                        uni.createSelectorQuery().select(".nav-tabs").boundingClientRect().exec((res) => {
                          if (res && res[0]) {
                            const scrollViewRect = res[0];
                            const scrollLeft = tabRect.left - scrollViewRect.left - scrollViewRect.width / 2 + tabRect.width / 2;
                            uni.pageScrollTo({
                              scrollLeft,
                              duration: 300
                            });
                          }
                        });
                      }
                    }).exec();
                  }, 300);
                }
              });
              app.globalData.needScrollToCategory = false;
            }
          }
          app.globalData.selectedCategory = null;
        }
      }
    },
    methods: {
      async fetchSubcategories(title) {
        this.isLoading = true;
        this.subcategories = [];
        this.currentSwiperIndex = {};
        try {
          formatAppLog("log", "at pages/learn/learn.vue:197", `正在获取分类 "${title}" 的小标题数据...`);
          const response = await getLearningHeaders(title);
          if (response.status === "success" && response.data) {
            this.subcategories = response.data;
            formatAppLog("log", "at pages/learn/learn.vue:204", `获取到 ${this.subcategories.length} 个小标题，详细数据：`);
            this.subcategories.forEach((item, index) => {
              formatAppLog("log", "at pages/learn/learn.vue:206", `[${index + 1}] ${item.subtitle}:`);
              formatAppLog("log", "at pages/learn/learn.vue:207", `  - image_url: ${item.image_url}`);
              if (item.images && Array.isArray(item.images)) {
                formatAppLog("log", "at pages/learn/learn.vue:209", `  - images数组 (${item.images.length}张):`);
                item.images.forEach((img, i) => {
                  formatAppLog("log", "at pages/learn/learn.vue:211", `    [${i + 1}] ${img}`);
                });
              } else {
                formatAppLog("log", "at pages/learn/learn.vue:214", `  - images数组: 不存在或不是数组`);
              }
            });
          } else {
            formatAppLog("error", "at pages/learn/learn.vue:218", "API返回错误:", response);
            uni.showToast({
              title: "获取数据失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/learn/learn.vue:225", "获取小标题列表失败:", error);
          uni.showToast({
            title: "获取数据失败",
            icon: "none"
          });
        } finally {
          this.isLoading = false;
        }
      },
      selectCategory(title) {
        if (this.currentCategory !== title) {
          this.currentCategory = title;
          this.fetchSubcategories(title);
        }
      },
      navigateToContent(item) {
        formatAppLog("log", "at pages/learn/learn.vue:241", "正在导航到内容页，小标题:", item.subtitle);
        try {
          uni.navigateTo({
            url: `/pages/learn/content?subtitle=${encodeURIComponent(item.subtitle)}`,
            success: () => {
              formatAppLog("log", "at pages/learn/learn.vue:246", "导航成功");
            },
            fail: (err) => {
              formatAppLog("error", "at pages/learn/learn.vue:249", "导航失败:", err);
              uni.showToast({
                title: "页面跳转失败",
                icon: "none"
              });
            }
          });
        } catch (e) {
          formatAppLog("error", "at pages/learn/learn.vue:257", "导航错误:", e);
        }
      },
      handleSwiperChange(itemIndex, event) {
        const currentIndex = event.detail.current;
        this.$set(this.currentSwiperIndex, itemIndex, currentIndex);
      },
      getImageCountText(item) {
        if (!item.images || !item.images.length)
          return "";
        const itemIndex = item.index || 0;
        const currentIndex = this.currentSwiperIndex[itemIndex] || 0;
        const totalImages = item.images.length;
        const displayCount = Math.min(totalImages, 3);
        if (totalImages > 3) {
          return `${currentIndex + 1}/${displayCount} (共${totalImages}张)`;
        } else {
          return `${currentIndex + 1}/${totalImages}`;
        }
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部标题 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "status-bar-height" }),
        vue.createElementVNode("text", { class: "title" }, "学习非遗")
      ]),
      vue.createCommentVNode(" 大标题导航栏 "),
      vue.createElementVNode("scroll-view", {
        "scroll-x": "",
        class: "nav-tabs",
        "show-scrollbar": "false"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.categories, (category, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: vue.normalizeClass(["nav-tab", { "active": $data.currentCategory === category.title }]),
              onClick: ($event) => $options.selectCategory(category.title)
            }, [
              vue.createElementVNode(
                "text",
                { class: "nav-text" },
                vue.toDisplayString(category.title),
                1
                /* TEXT */
              )
            ], 10, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 小标题卡片列表 "),
      !$data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "subcategory-list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.subcategories, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: "subcategory-item",
              onClick: ($event) => $options.navigateToContent(item)
            }, [
              vue.createCommentVNode(" 在这里为每个item添加index属性，便于引用 "),
              vue.createCommentVNode("v-if", true),
              vue.createCommentVNode(" 多图预览，如果只有一张图则显示单图 "),
              item.images && item.images.length > 1 ? (vue.openBlock(), vue.createElementBlock("swiper", {
                key: 1,
                class: "image-swiper",
                circular: "",
                "indicator-dots": true,
                "indicator-color": "rgba(255, 255, 255, 0.3)",
                "indicator-active-color": "#ffffff",
                onChange: ($event) => $options.handleSwiperChange(index, $event)
              }, [
                vue.createCommentVNode(" 检查是否正确循环图片数组 "),
                vue.createCommentVNode("v-if", true),
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(item.images.slice(0, 3), (img, imgIndex) => {
                    return vue.openBlock(), vue.createElementBlock("swiper-item", { key: imgIndex }, [
                      vue.createElementVNode("image", {
                        class: "subcategory-image",
                        src: img,
                        mode: "aspectFill",
                        onError: (e) => _ctx.__f__("error", "at pages/learn/learn.vue:49", `图片加载失败:`, img, e)
                      }, null, 40, ["src", "onError"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 40, ["onChange"])) : (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                { key: 2 },
                [
                  vue.createCommentVNode(" 单图展示（兼容旧数据） "),
                  vue.createElementVNode("image", {
                    class: "subcategory-image",
                    src: item.image_url || item.images && item.images[0],
                    mode: "aspectFill"
                  }, null, 8, ["src"])
                ],
                2112
                /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
              )),
              vue.createCommentVNode(" 图片计数指示 "),
              item.images && item.images.length > 1 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 3,
                class: "image-count"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "image-count-text" },
                  vue.toDisplayString($options.getImageCountText(item)),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true),
              vue.createCommentVNode(" 标题容器 "),
              vue.createElementVNode("view", { class: "subcategory-title-container" }, [
                vue.createElementVNode(
                  "text",
                  { class: "subcategory-title" },
                  vue.toDisplayString(item.subtitle),
                  1
                  /* TEXT */
                )
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        vue.createCommentVNode(" 空状态提示 "),
        $data.subcategories.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-tip"
        }, [
          vue.createElementVNode("text", { class: "empty-text" }, "暂无内容，请选择其他分类")
        ])) : vue.createCommentVNode("v-if", true)
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 加载指示器 "),
      $data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "loading-container"
      }, [
        vue.createElementVNode("view", { class: "loading-icon" }),
        vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesLearnLearn = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__file", "Y:/Parttime/非遗小程序开发/Demo/Demo/frontend/pages/learn/learn.vue"]]);
  const _sfc_main$8 = {
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
        formatAppLog("error", "at pages/learn/content.vue:124", "缺少subtitle参数");
        this.loadError = true;
        this.errorMessage = "参数错误";
        uni.showToast({
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
          formatAppLog("log", "at pages/learn/content.vue:142", "正在获取内容，小标题：", this.subtitle);
          const response = await getLearningContent(this.subtitle);
          formatAppLog("log", "at pages/learn/content.vue:144", "获取内容响应:", response);
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
            formatAppLog("log", "at pages/learn/content.vue:163", "内容处理完成，卡片数量:", this.contentCards.length);
            if (this.contentCards.length === 0) {
              formatAppLog("warn", "at pages/learn/content.vue:166", "处理后无可显示内容");
              uni.showToast({
                title: "内容为空",
                icon: "none"
              });
            }
          } else {
            formatAppLog("error", "at pages/learn/content.vue:173", "获取内容失败:", response);
            this.loadError = true;
            this.errorMessage = response.message || "获取内容失败";
            uni.showToast({
              title: "获取内容失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/learn/content.vue:182", "获取内容失败:", error);
          this.loadError = true;
          this.errorMessage = "网络错误，请重试";
          uni.showToast({
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
        formatAppLog("log", "at pages/learn/content.vue:199", "创建内容卡片，所有图片:", allImages);
        contents.forEach((content, index) => {
          const contentTitle = content.title || `内容 ${index + 1}`;
          formatAppLog("log", "at pages/learn/content.vue:206", `处理内容: "${contentTitle}"`);
          const matchingImages = allImages.filter((imgUrl) => {
            const decodedUrl = decodeURIComponent(imgUrl);
            return decodedUrl.includes(`/${contentTitle}`) || decodedUrl.includes(`${contentTitle}`);
          });
          formatAppLog("log", "at pages/learn/content.vue:216", `为内容 "${contentTitle}" 匹配到 ${matchingImages.length} 张图片`);
          const cardImages = matchingImages.length > 0 ? matchingImages : [];
          this.contentCards.push({
            title: contentTitle,
            content: content.content,
            images: cardImages,
            source: content.source
          });
        });
        formatAppLog("log", "at pages/learn/content.vue:230", "创建了 " + this.contentCards.length + " 个内容卡片");
        this.contentCards.forEach((card, idx) => {
          formatAppLog("log", "at pages/learn/content.vue:232", `卡片 ${idx + 1}: 标题="${card.title}", 图片数量=${card.images.length}`);
        });
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
          uni.previewImage({
            current: images[currentIndex],
            urls: images
          });
        }
      },
      // 处理图片加载错误
      handleImageError(cardIndex, imageIndex) {
        formatAppLog("error", "at pages/learn/content.vue:288", `卡片 ${cardIndex + 1} 的图片 ${imageIndex + 1} 加载失败: ${this.contentCards[cardIndex].images[imageIndex]}`);
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
        uni.navigateBack();
      }
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 固定在左上角的返回按钮 "),
      vue.createElementVNode("view", {
        class: "fixed-back-button",
        onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
      }, [
        vue.createElementVNode("text", { class: "back-icon" }, "←")
      ]),
      vue.createCommentVNode(" 顶部标题 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "status-bar-height" }),
        vue.createElementVNode("view", { class: "title-container" }, [
          vue.createElementVNode("view", { class: "title-spacer" }),
          vue.createElementVNode(
            "text",
            { class: "title" },
            vue.toDisplayString($data.subtitle),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 内容区域 "),
      vue.createElementVNode("view", { class: "content-area" }, [
        vue.createCommentVNode(" 加载提示 "),
        $data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-container"
        }, [
          vue.createElementVNode("view", { class: "loading-icon" }),
          vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 多内容卡片展示 "),
        !$data.isLoading && $data.contentCards.length > 0 ? (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 1 },
          [
            vue.createCommentVNode(" 内容数量指示器 "),
            $data.contentCards.length > 1 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "content-count"
            }, [
              vue.createElementVNode(
                "text",
                { class: "content-count-text" },
                "共 " + vue.toDisplayString($data.contentCards.length) + " 篇内容",
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" 内容卡片列表 "),
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.contentCards, (card, cardIndex) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: cardIndex,
                  class: "content-card"
                }, [
                  vue.createCommentVNode(" 内容标题 "),
                  card.title ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "card-title"
                  }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(card.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "title-decoration" })
                  ])) : vue.createCommentVNode("v-if", true),
                  vue.createCommentVNode(" 卡片内容区域 "),
                  vue.createElementVNode("view", { class: "card-body" }, [
                    vue.createCommentVNode(" 卡片内容文字 "),
                    card.content ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "card-content"
                    }, [
                      vue.createElementVNode("rich-text", {
                        nodes: $options.formatContent(card.content)
                      }, null, 8, ["nodes"])
                    ])) : vue.createCommentVNode("v-if", true),
                    vue.createCommentVNode(" 卡片图片轮播 "),
                    card.images && card.images.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 1,
                      class: "card-images-swiper"
                    }, [
                      vue.createElementVNode("view", { class: "image-count-badge" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "image-count-text" },
                          vue.toDisplayString($data.imageIndex[cardIndex] + 1 || 1) + "/" + vue.toDisplayString(card.images.length),
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("swiper", {
                        class: "images-swiper",
                        circular: "",
                        "indicator-dots": false,
                        onChange: (e) => $options.handleSwiperChange(cardIndex, e),
                        onClick: () => $options.previewImages(card.images, $data.imageIndex[cardIndex] || 0)
                      }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList(card.images, (image, imgIndex) => {
                            return vue.openBlock(), vue.createElementBlock("swiper-item", {
                              key: `${cardIndex}-${imgIndex}`
                            }, [
                              vue.createElementVNode("image", {
                                src: image,
                                class: "swiper-image",
                                mode: "aspectFit",
                                onError: ($event) => $options.handleImageError(cardIndex, imgIndex)
                              }, null, 40, ["src", "onError"])
                            ]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ], 40, ["onChange", "onClick"])
                    ])) : vue.createCommentVNode("v-if", true)
                  ]),
                  vue.createCommentVNode(" 无内容提示 "),
                  !card.content && (!card.images || card.images.length === 0) ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "no-content-tip"
                  }, [
                    vue.createElementVNode("text", { class: "no-content-text" }, "此内容为空")
                  ])) : vue.createCommentVNode("v-if", true),
                  vue.createCommentVNode(" 卡片底部装饰 "),
                  vue.createElementVNode("view", { class: "card-footer" }, [
                    vue.createElementVNode("view", { class: "footer-decoration" })
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ],
          64
          /* STABLE_FRAGMENT */
        )) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 空内容提示 "),
        !$data.isLoading && $data.contentCards.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "empty-container"
        }, [
          vue.createElementVNode("text", { class: "empty-text" }, "暂无相关内容")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 错误提示 "),
        $data.loadError ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 3,
          class: "error-container"
        }, [
          vue.createElementVNode(
            "text",
            { class: "error-text" },
            vue.toDisplayString($data.errorMessage),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", {
            class: "retry-button",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.fetchContent && $options.fetchContent(...args))
          }, [
            vue.createElementVNode("text", { class: "retry-text" }, "重试")
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesLearnContent = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__file", "Y:/Parttime/非遗小程序开发/Demo/Demo/frontend/pages/learn/content.vue"]]);
  const _sfc_main$7 = {
    data() {
      return {
        title: "",
        subtitleList: [],
        isLoading: false
      };
    },
    onLoad(options) {
      if (options.title) {
        this.title = decodeURIComponent(options.title);
        this.fetchSubtitles();
      }
    },
    onShow() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.options && currentPage.options.autoScroll === "true") {
        setTimeout(() => {
          uni.pageScrollTo({
            scrollTop: 0,
            duration: 300
          });
          uni.showToast({
            title: `已定位到${this.title}`,
            icon: "none",
            duration: 1500
          });
        }, 500);
      }
    },
    methods: {
      async fetchSubtitles() {
        this.isLoading = true;
        try {
          const response = await getLearningHeaders(this.title);
          if (response.status === "success" && response.data) {
            this.subtitleList = response.data;
          } else {
            uni.showToast({
              title: "获取数据失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/learn/category.vue:89", "获取小标题列表失败:", error);
          uni.showToast({
            title: "获取数据失败",
            icon: "none"
          });
        } finally {
          this.isLoading = false;
        }
      },
      navigateToContent(item) {
        uni.navigateTo({
          url: `/pages/learn/content?subtitle=${encodeURIComponent(item.subtitle)}`
        });
      },
      goBack() {
        uni.navigateBack();
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部标题 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "back-button",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "back-icon" }, "←")
        ]),
        vue.createElementVNode(
          "text",
          { class: "title" },
          vue.toDisplayString($data.title),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 小标题列表 "),
      vue.createElementVNode("view", { class: "subtitle-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.subtitleList, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: "subtitle-item",
              onClick: ($event) => $options.navigateToContent(item)
            }, [
              vue.createElementVNode("image", {
                class: "subtitle-image",
                src: item.image_url,
                mode: "aspectFill"
              }, null, 8, ["src"]),
              vue.createElementVNode("view", { class: "subtitle-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "subtitle-title" },
                  vue.toDisplayString(item.subtitle),
                  1
                  /* TEXT */
                )
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        vue.createCommentVNode(" 加载提示 "),
        $data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-container"
        }, [
          vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 无内容提示 "),
        !$data.isLoading && $data.subtitleList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "empty-container"
        }, [
          vue.createElementVNode("text", { class: "empty-text" }, "暂无相关内容")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesLearnCategory = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__file", "Y:/Parttime/非遗小程序开发/Demo/Demo/frontend/pages/learn/category.vue"]]);
  const _imports_0$4 = "/static/images/empty-posts.png";
  const _sfc_main$6 = {
    data() {
      return {
        posts: [],
        isLoading: false,
        showForm: false,
        postContent: "",
        nickname: "游客",
        // 默认昵称，实际应从用户信息中获取
        userInfo: {}
        // 用户信息对象
      };
    },
    onLoad() {
      this.fetchPosts();
      this.getUserInfo();
    },
    onShow() {
      this.fetchPosts();
    },
    methods: {
      async fetchPosts() {
        this.isLoading = true;
        try {
          const response = await getPosts();
          if (response.status === "success" && response.data) {
            this.posts = response.data.map((post) => {
              if (!post.avatar_url) {
                post.avatar_url = "/static/images/avatar/空中花园.png";
              }
              return post;
            });
          } else {
            uni.showToast({
              title: "获取帖子失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/chat/chat.vue:132", "获取帖子列表失败:", error);
          uni.showToast({
            title: "获取帖子失败",
            icon: "none"
          });
        } finally {
          this.isLoading = false;
        }
      },
      getUserInfo() {
        try {
          const userInfoStr = uni.getStorageSync("userInfo");
          if (userInfoStr) {
            try {
              this.userInfo = JSON.parse(userInfoStr);
            } catch (e) {
              this.userInfo = userInfoStr;
            }
            this.nickname = this.userInfo.nickname || "游客";
            formatAppLog("log", "at pages/chat/chat.vue:155", "获取到的用户信息:", this.userInfo);
          } else {
            formatAppLog("log", "at pages/chat/chat.vue:157", "未找到用户信息");
            this.userInfo = {};
            this.nickname = "游客";
          }
        } catch (error) {
          formatAppLog("error", "at pages/chat/chat.vue:162", "获取用户信息失败:", error);
          this.userInfo = {};
          this.nickname = "游客";
        }
      },
      formatTime(timeStr) {
        if (!timeStr)
          return "";
        const date = new Date(timeStr);
        const now = /* @__PURE__ */ new Date();
        const diff = now - date;
        if (diff < 36e5) {
          const minutes = Math.floor(diff / 6e4);
          return minutes <= 0 ? "刚刚" : `${minutes}分钟前`;
        }
        if (diff < 864e5) {
          const hours = Math.floor(diff / 36e5);
          return `${hours}小时前`;
        }
        if (diff < 2592e6) {
          const days = Math.floor(diff / 864e5);
          return `${days}天前`;
        }
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;
      },
      navigateToDetail(post) {
        formatAppLog("log", "at pages/chat/chat.vue:199", "正在导航到帖子详情，帖子ID:", post.id);
        uni.navigateTo({
          url: `./detail?id=${post.id}`,
          success: () => {
            formatAppLog("log", "at pages/chat/chat.vue:204", "导航成功");
          },
          fail: (err) => {
            formatAppLog("error", "at pages/chat/chat.vue:207", "导航失败:", err);
            uni.showToast({
              title: "跳转失败",
              icon: "none"
            });
          }
        });
      },
      likePostFromList(post, event) {
        event.stopPropagation();
        if (!this.userInfo || !this.userInfo.id) {
          uni.showModal({
            title: "提示",
            content: "请先登录后再点赞",
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: "/pages/login/login"
                });
              }
            }
          });
          return;
        }
        this.navigateToDetail(post);
      },
      showPostForm() {
        this.getUserInfo();
        if (!this.userInfo || !this.userInfo.id) {
          formatAppLog("log", "at pages/chat/chat.vue:244", "用户未登录或信息不完整，需要登录");
          uni.showModal({
            title: "提示",
            content: "请先登录后再发布帖子",
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: "/pages/login/login"
                });
              }
            }
          });
          return;
        }
        formatAppLog("log", "at pages/chat/chat.vue:259", "用户已登录，显示发布表单");
        this.showForm = true;
      },
      hidePostForm() {
        this.showForm = false;
      },
      async submitPost() {
        if (!this.postContent.trim()) {
          uni.showToast({
            title: "内容不能为空",
            icon: "none"
          });
          return;
        }
        try {
          uni.showLoading({
            title: "发布中..."
          });
          const response = await createPost(this.nickname, this.postContent);
          uni.hideLoading();
          if (response.status === "success") {
            uni.showToast({
              title: "发布成功",
              icon: "success"
            });
            this.postContent = "";
            this.hidePostForm();
            this.fetchPosts();
          } else {
            uni.showToast({
              title: response.message || "发布失败",
              icon: "none"
            });
          }
        } catch (error) {
          uni.hideLoading();
          formatAppLog("error", "at pages/chat/chat.vue:299", "发布帖子失败:", error);
          uni.showToast({
            title: "发布失败，请稍后再试",
            icon: "none"
          });
        }
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部区域（包含状态栏和标题） "),
      vue.createElementVNode("view", { class: "top-area" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "header" }, [
          vue.createElementVNode("text", { class: "title" }, "社区交流")
        ])
      ]),
      vue.createCommentVNode(" 帖子列表 "),
      vue.createElementVNode("view", { class: "post-list" }, [
        vue.createCommentVNode(" 加载提示 "),
        $data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-container"
        }, [
          vue.createElementVNode("view", { class: "loading-spinner" }),
          vue.createElementVNode("text", { class: "loading-text" }, "正在加载社区内容...")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 帖子卡片 "),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.posts, (post, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: post.id,
              class: "post-card",
              onClick: ($event) => $options.navigateToDetail(post)
            }, [
              vue.createElementVNode("view", { class: "post-header" }, [
                vue.createElementVNode("view", { class: "user-info" }, [
                  vue.createElementVNode("image", {
                    class: "avatar",
                    src: post.avatar_url || "/static/images/avatar/空中花园.png"
                  }, null, 8, ["src"]),
                  vue.createElementVNode(
                    "text",
                    { class: "post-author" },
                    vue.toDisplayString(post.author_name),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "post-time" },
                  vue.toDisplayString($options.formatTime(post.created_at)),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "post-content" }, [
                vue.createElementVNode(
                  "text",
                  { class: "post-text" },
                  vue.toDisplayString(post.content),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "post-footer" }, [
                vue.createElementVNode("view", {
                  class: "post-action",
                  onClick: vue.withModifiers(($event) => $options.navigateToDetail(post), ["stop"])
                }, [
                  vue.createElementVNode("text", { class: "post-action-icon" }, "💬"),
                  vue.createElementVNode(
                    "text",
                    { class: "post-action-count" },
                    vue.toDisplayString(post.comment_count || 0),
                    1
                    /* TEXT */
                  )
                ], 8, ["onClick"]),
                vue.createElementVNode("view", {
                  class: "post-action",
                  onClick: vue.withModifiers(($event) => $options.likePostFromList(post, $event), ["stop"])
                }, [
                  vue.createElementVNode("text", { class: "post-action-icon" }, "👍"),
                  vue.createElementVNode(
                    "text",
                    { class: "post-action-count" },
                    vue.toDisplayString(post.like_count || 0),
                    1
                    /* TEXT */
                  )
                ], 8, ["onClick"])
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        vue.createCommentVNode(" 无内容提示 "),
        !$data.isLoading && $data.posts.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "empty-container"
        }, [
          vue.createElementVNode("image", {
            class: "empty-icon",
            src: _imports_0$4
          }),
          vue.createElementVNode("text", { class: "empty-text" }, "暂无帖子，快来发布第一篇吧！"),
          vue.createElementVNode("view", {
            class: "empty-action",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.showPostForm && $options.showPostForm(...args))
          }, [
            vue.createElementVNode("text", null, "发布新帖子")
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createCommentVNode(" 固定在右下角的发布按钮 "),
      vue.createElementVNode("view", {
        class: "float-post-btn",
        onClick: _cache[1] || (_cache[1] = (...args) => $options.showPostForm && $options.showPostForm(...args))
      }, [
        vue.createElementVNode("text", { class: "float-post-icon" }, "+")
      ]),
      vue.createCommentVNode(" 发帖弹窗 "),
      $data.showForm ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "post-form-overlay",
        onClick: _cache[6] || (_cache[6] = (...args) => $options.hidePostForm && $options.hidePostForm(...args))
      }, [
        vue.createElementVNode("view", {
          class: "post-form",
          onClick: _cache[5] || (_cache[5] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "post-form-header" }, [
            vue.createElementVNode("text", { class: "post-form-title" }, "发布帖子"),
            vue.createElementVNode("text", {
              class: "post-form-close",
              onClick: _cache[2] || (_cache[2] = (...args) => $options.hidePostForm && $options.hidePostForm(...args))
            }, "×")
          ]),
          vue.createElementVNode("view", { class: "user-info-preview" }, [
            vue.createElementVNode("image", {
              class: "avatar-small",
              src: $data.userInfo.avatar_url || "/static/images/avatar/空中花园.png"
            }, null, 8, ["src"]),
            vue.createElementVNode(
              "text",
              { class: "username" },
              vue.toDisplayString($data.nickname),
              1
              /* TEXT */
            )
          ]),
          vue.withDirectives(vue.createElementVNode(
            "textarea",
            {
              class: "post-form-input",
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.postContent = $event),
              placeholder: "分享你的想法或非遗见闻...",
              maxlength: "500",
              "auto-height": ""
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.postContent]
          ]),
          vue.createElementVNode("view", { class: "post-form-footer" }, [
            vue.createElementVNode(
              "text",
              { class: "post-form-count" },
              vue.toDisplayString($data.postContent.length) + "/500",
              1
              /* TEXT */
            ),
            vue.createElementVNode("button", {
              class: "post-form-submit",
              onClick: _cache[4] || (_cache[4] = (...args) => $options.submitPost && $options.submitPost(...args)),
              disabled: !$data.postContent.trim()
            }, "发布", 8, ["disabled"])
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesChatChat = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__file", "Y:/Parttime/非遗小程序开发/Demo/Demo/frontend/pages/chat/chat.vue"]]);
  const _imports_0$3 = "/static/images/empty-comments.png";
  const _sfc_main$5 = {
    data() {
      return {
        id: null,
        post: null,
        isLoading: false,
        commentContent: "",
        commentFocus: false,
        userId: 1,
        // 默认用户ID，实际应从登录状态获取
        nickname: "游客",
        // 默认昵称，实际应从登录状态获取
        liked: false,
        likeCount: 0,
        userInfo: {},
        // 用户信息
        avatarUrl: "/static/images/avatar/空中花园.png"
        // 用户头像
      };
    },
    onLoad(options) {
      if (options.id) {
        this.id = options.id;
        this.fetchPostDetail();
      }
      this.getUserInfo();
    },
    methods: {
      async fetchPostDetail() {
        this.isLoading = true;
        try {
          const response = await getPostDetail(this.id);
          if (response.status === "success" && response.data) {
            this.post = response.data;
            this.likeCount = this.post.like_count || 0;
            if (!this.post.avatar_url) {
              this.post.avatar_url = "/static/images/avatar/空中花园.png";
            }
            if (this.post.comments && Array.isArray(this.post.comments)) {
              this.post.comments.forEach((comment) => {
                if (!comment.avatar_url) {
                  comment.avatar_url = "/static/images/avatar/空中花园.png";
                }
              });
            }
            this.checkLikeStatus();
          } else {
            uni.showToast({
              title: "获取帖子详情失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/chat/detail.vue:167", "获取帖子详情失败:", error);
          uni.showToast({
            title: "获取帖子详情失败",
            icon: "none"
          });
        } finally {
          this.isLoading = false;
        }
      },
      getUserInfo() {
        try {
          const userInfoStr = uni.getStorageSync("userInfo");
          if (userInfoStr) {
            try {
              this.userInfo = JSON.parse(userInfoStr);
            } catch (e) {
              this.userInfo = userInfoStr;
            }
            formatAppLog("log", "at pages/chat/detail.vue:188", "获取到的用户信息:", this.userInfo);
            this.userId = this.userInfo.id || 1;
            this.nickname = this.userInfo.nickname || "游客";
            this.avatarUrl = this.userInfo.avatar_url || "/static/images/avatar/空中花园.png";
          } else {
            formatAppLog("log", "at pages/chat/detail.vue:195", "未找到用户信息");
            this.userInfo = {};
            this.userId = 1;
            this.nickname = "游客";
            this.avatarUrl = "/static/images/avatar/空中花园.png";
          }
        } catch (error) {
          formatAppLog("error", "at pages/chat/detail.vue:202", "获取用户信息失败:", error);
          this.userInfo = {};
          this.userId = 1;
          this.nickname = "游客";
          this.avatarUrl = "/static/images/avatar/空中花园.png";
        }
      },
      async checkLikeStatus() {
        try {
          const response = await checkLiked(this.id, this.userId);
          if (response.status === "success" && response.data) {
            this.liked = response.data.liked;
          }
        } catch (error) {
          formatAppLog("error", "at pages/chat/detail.vue:216", "检查点赞状态失败:", error);
        }
      },
      formatTime(timeStr) {
        if (!timeStr)
          return "";
        const date = new Date(timeStr);
        const now = /* @__PURE__ */ new Date();
        const diff = now - date;
        if (diff < 36e5) {
          const minutes = Math.floor(diff / 6e4);
          return minutes <= 0 ? "刚刚" : `${minutes}分钟前`;
        }
        if (diff < 864e5) {
          const hours = Math.floor(diff / 36e5);
          return `${hours}小时前`;
        }
        if (diff < 2592e6) {
          const days = Math.floor(diff / 864e5);
          return `${days}天前`;
        }
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;
      },
      focusComment() {
        if (!this.userInfo || !this.userInfo.id) {
          uni.showModal({
            title: "提示",
            content: "请先登录后再发表评论",
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: "/pages/login/login"
                });
              }
            }
          });
          return;
        }
        this.commentFocus = true;
      },
      async submitComment() {
        if (!this.commentContent.trim()) {
          uni.showToast({
            title: "评论内容不能为空",
            icon: "none"
          });
          return;
        }
        if (!this.userInfo || !this.userInfo.id) {
          uni.showModal({
            title: "提示",
            content: "请先登录后再发表评论",
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: "/pages/login/login"
                });
              }
            }
          });
          return;
        }
        try {
          uni.showLoading({
            title: "发送中..."
          });
          const author_name = this.userInfo.nickname || this.nickname;
          formatAppLog("log", "at pages/chat/detail.vue:301", "发送评论，作者：", author_name);
          const response = await addComment(this.id, author_name, this.commentContent);
          uni.hideLoading();
          if (response.status === "success") {
            uni.showToast({
              title: "评论成功",
              icon: "success",
              duration: 2e3
            });
            this.commentContent = "";
            setTimeout(() => {
              this.fetchPostDetail();
            }, 1e3);
          } else {
            uni.showToast({
              title: response.message || "评论失败",
              icon: "none"
            });
          }
        } catch (error) {
          uni.hideLoading();
          formatAppLog("error", "at pages/chat/detail.vue:328", "评论失败:", error);
          uni.showToast({
            title: "评论失败，请稍后再试",
            icon: "none"
          });
        }
      },
      async toggleLike() {
        if (!this.userInfo || !this.userInfo.id) {
          uni.showModal({
            title: "提示",
            content: "请先登录后再点赞",
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: "/pages/login/login"
                });
              }
            }
          });
          return;
        }
        try {
          const response = await likePost(this.id, this.userId);
          if (response.status === "success") {
            this.liked = response.data.liked;
            if (this.liked) {
              this.likeCount++;
            } else {
              this.likeCount = Math.max(0, this.likeCount - 1);
            }
            uni.showToast({
              title: this.liked ? "点赞成功" : "取消点赞",
              icon: "success"
            });
          } else {
            uni.showToast({
              title: response.message || "操作失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/chat/detail.vue:375", "点赞操作失败:", error);
          uni.showToast({
            title: "操作失败，请稍后再试",
            icon: "none"
          });
        }
      },
      sharePost() {
        uni.showToast({
          title: "分享功能即将上线",
          icon: "none"
        });
      },
      goBack() {
        uni.navigateBack();
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部标题栏 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "nav-content" }, [
          vue.createElementVNode("view", {
            class: "back-button",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "←")
          ]),
          vue.createElementVNode("text", { class: "title" }, "帖子详情"),
          vue.createElementVNode("view", { style: { "width": "60rpx" } }),
          vue.createCommentVNode(" 占位，保持标题居中 ")
        ])
      ]),
      vue.createCommentVNode(" 内容区域 "),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "content-scroll"
      }, [
        vue.createCommentVNode(" 帖子详情 "),
        $data.post ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "post-detail-card"
        }, [
          vue.createElementVNode("view", { class: "post-header" }, [
            vue.createElementVNode("view", { class: "user-info" }, [
              vue.createElementVNode("image", {
                class: "avatar",
                src: $data.post.avatar_url || "/static/images/avatar/空中花园.png"
              }, null, 8, ["src"]),
              vue.createElementVNode("view", { class: "user-details" }, [
                vue.createElementVNode(
                  "text",
                  { class: "author-name" },
                  vue.toDisplayString($data.post.author_name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "post-time" },
                  vue.toDisplayString($options.formatTime($data.post.created_at)),
                  1
                  /* TEXT */
                )
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "post-content" }, [
            vue.createElementVNode(
              "text",
              { class: "post-text" },
              vue.toDisplayString($data.post.content),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "post-actions" }, [
            vue.createElementVNode("view", {
              class: "action-item",
              onClick: _cache[1] || (_cache[1] = (...args) => $options.toggleLike && $options.toggleLike(...args))
            }, [
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass(["action-icon", { "liked": $data.liked }])
                },
                "👍",
                2
                /* CLASS */
              ),
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass(["action-text", { "liked-text": $data.liked }])
                },
                vue.toDisplayString($data.liked ? "已点赞" : "点赞"),
                3
                /* TEXT, CLASS */
              ),
              vue.createElementVNode(
                "text",
                { class: "action-count" },
                vue.toDisplayString($data.likeCount),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", {
              class: "action-item",
              onClick: _cache[2] || (_cache[2] = (...args) => $options.focusComment && $options.focusComment(...args))
            }, [
              vue.createElementVNode("text", { class: "action-icon" }, "💬"),
              vue.createElementVNode("text", { class: "action-text" }, "评论"),
              vue.createElementVNode(
                "text",
                { class: "action-count" },
                vue.toDisplayString($data.post.comments ? $data.post.comments.length : 0),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", {
              class: "action-item",
              onClick: _cache[3] || (_cache[3] = (...args) => $options.sharePost && $options.sharePost(...args))
            }, [
              vue.createElementVNode("text", { class: "action-icon" }, "🔗"),
              vue.createElementVNode("text", { class: "action-text" }, "分享")
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 评论区标题 "),
        vue.createElementVNode("view", { class: "comments-header" }, [
          vue.createElementVNode("text", { class: "comments-title" }, "评论区"),
          vue.createElementVNode(
            "text",
            { class: "comments-count" },
            vue.toDisplayString($data.post && $data.post.comments ? $data.post.comments.length : 0) + "条评论",
            1
            /* TEXT */
          )
        ]),
        vue.createCommentVNode(" 评论列表 "),
        $data.post && $data.post.comments ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "comment-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.post.comments, (comment, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: "comment-item"
              }, [
                vue.createElementVNode("view", { class: "comment-header" }, [
                  vue.createElementVNode("image", {
                    class: "comment-avatar",
                    src: comment.avatar_url || "/static/images/avatar/空中花园.png"
                  }, null, 8, ["src"]),
                  vue.createElementVNode("view", { class: "comment-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "comment-author" },
                      vue.toDisplayString(comment.author_name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "comment-time" },
                      vue.toDisplayString($options.formatTime(comment.created_at)),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "comment-content" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "comment-text" },
                    vue.toDisplayString(comment.content),
                    1
                    /* TEXT */
                  )
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createCommentVNode(" 无评论提示 "),
          $data.post && $data.post.comments.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "empty-comment"
          }, [
            vue.createElementVNode("image", {
              class: "empty-icon",
              src: _imports_0$3
            }),
            vue.createElementVNode("text", { class: "empty-text" }, "暂无评论，快来发表第一条评论吧！")
          ])) : vue.createCommentVNode("v-if", true)
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 底部占位，确保内容不被评论框遮挡 "),
        vue.createElementVNode("view", { style: { "height": "140rpx" } })
      ]),
      vue.createCommentVNode(" 评论输入框 "),
      vue.createElementVNode("view", { class: "comment-box" }, [
        vue.withDirectives(vue.createElementVNode("input", {
          class: "comment-input",
          "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.commentContent = $event),
          placeholder: "发表友善评论...",
          focus: $data.commentFocus,
          onBlur: _cache[5] || (_cache[5] = ($event) => $data.commentFocus = false),
          "confirm-type": "send",
          onConfirm: _cache[6] || (_cache[6] = (...args) => $options.submitComment && $options.submitComment(...args))
        }, null, 40, ["focus"]), [
          [vue.vModelText, $data.commentContent]
        ]),
        vue.createElementVNode("button", {
          class: "comment-submit",
          onClick: _cache[7] || (_cache[7] = (...args) => $options.submitComment && $options.submitComment(...args)),
          disabled: !$data.commentContent.trim()
        }, "发送", 8, ["disabled"])
      ]),
      vue.createCommentVNode(" 加载提示 "),
      $data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-container"
      }, [
        vue.createElementVNode("view", { class: "loading-spinner" }),
        vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesChatDetail = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__file", "Y:/Parttime/非遗小程序开发/Demo/Demo/frontend/pages/chat/detail.vue"]]);
  const _sfc_main$4 = {
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
          const userInfoStr = uni.getStorageSync("userInfo");
          if (userInfoStr) {
            try {
              this.userInfo = JSON.parse(userInfoStr);
            } catch (e) {
              this.userInfo = userInfoStr;
            }
            formatAppLog("log", "at pages/chat/post.vue:130", "获取到的用户信息:", this.userInfo);
            if (!this.userInfo.id) {
              this.promptLogin();
            }
          } else {
            formatAppLog("log", "at pages/chat/post.vue:138", "未找到用户信息");
            this.promptLogin();
          }
        } catch (error) {
          formatAppLog("error", "at pages/chat/post.vue:142", "获取用户信息失败:", error);
          this.promptLogin();
        }
      },
      promptLogin() {
        uni.showModal({
          title: "提示",
          content: "请先登录后再发布帖子",
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: "/pages/login/login"
              });
            } else {
              uni.navigateBack();
            }
          }
        });
      },
      checkContentLength() {
        this.contentLength = this.content.length;
      },
      chooseImage() {
        uni.chooseImage({
          count: 9 - this.imageList.length,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            const tempFilePaths = res.tempFilePaths;
            this.imageList = [...this.imageList, ...tempFilePaths];
          },
          fail: (err) => {
            formatAppLog("error", "at pages/chat/post.vue:175", "选择图片失败", err);
          }
        });
      },
      deleteImage(index) {
        this.imageList.splice(index, 1);
      },
      publishPost() {
        if (!this.isValidPost) {
          uni.showToast({
            title: "内容不能为空",
            icon: "none"
          });
          return;
        }
        if (!this.userInfo || !this.userInfo.id) {
          uni.showModal({
            title: "提示",
            content: "请先登录后再发布帖子",
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
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
              formatAppLog("error", "at pages/chat/post.vue:225", "上传图片失败:", err);
              throw new Error("上传图片失败");
            });
          }
          const postData = {
            author_id: this.userInfo.id,
            author_name: this.userInfo.nickname || "游客",
            content: this.content,
            images: uploadedImages
          };
          const response = await createPost(postData);
          if (response.status === "success") {
            uni.showToast({
              title: "发布成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            throw new Error(response.message || "发布失败");
          }
        } catch (error) {
          formatAppLog("error", "at pages/chat/post.vue:255", "发布帖子失败:", error);
          uni.showToast({
            title: error.message || "发布失败，请稍后再试",
            icon: "none"
          });
        } finally {
          this.isLoading = false;
        }
      },
      async uploadImages() {
        formatAppLog("log", "at pages/chat/post.vue:267", "上传图片:", this.imageList);
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(this.imageList);
          }, 500);
        });
      },
      goBack() {
        uni.navigateBack();
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部标题栏 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "header-left" }, [
          vue.createElementVNode("view", {
            class: "back-button",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "←")
          ])
        ]),
        vue.createElementVNode("view", { class: "header-title" }, "发布内容"),
        vue.createElementVNode("view", { class: "header-right" }, [
          vue.createElementVNode("button", {
            class: vue.normalizeClass(["publish-button", { "publish-button-active": $options.isValidPost }]),
            disabled: !$options.isValidPost,
            onClick: _cache[1] || (_cache[1] = (...args) => $options.publishPost && $options.publishPost(...args))
          }, "发布", 10, ["disabled"])
        ])
      ]),
      vue.createCommentVNode(" 发布帖子表单 "),
      vue.createElementVNode("view", { class: "post-form" }, [
        vue.createCommentVNode(" 用户信息展示 "),
        vue.createElementVNode("view", { class: "user-info" }, [
          vue.createElementVNode("image", {
            class: "avatar",
            src: $data.userInfo.avatar_url || "/static/images/default-avatar.png"
          }, null, 8, ["src"]),
          vue.createElementVNode("view", { class: "user-detail" }, [
            vue.createElementVNode(
              "text",
              { class: "nickname" },
              vue.toDisplayString($data.userInfo.nickname || "游客"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "hint" }, "发布内容将以本账号名义展示")
          ])
        ]),
        vue.createCommentVNode(" 内容输入区 "),
        vue.createElementVNode("view", { class: "content-area" }, [
          vue.withDirectives(vue.createElementVNode(
            "textarea",
            {
              class: "content-input",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.content = $event),
              placeholder: "分享你的心情、经验或问题...",
              maxlength: "500",
              "auto-height": "",
              onInput: _cache[3] || (_cache[3] = (...args) => $options.checkContentLength && $options.checkContentLength(...args))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.content]
          ]),
          vue.createCommentVNode(" 字数统计 "),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["word-count", { "word-count-warning": $data.contentLength > 450 }])
            },
            vue.toDisplayString($data.contentLength) + "/500 ",
            3
            /* TEXT, CLASS */
          )
        ]),
        vue.createCommentVNode(" 图片上传区 "),
        vue.createElementVNode("view", { class: "image-upload-area" }, [
          vue.createElementVNode("view", { class: "image-upload-title" }, [
            vue.createElementVNode("text", { class: "title-text" }, "添加图片"),
            vue.createElementVNode("text", { class: "title-hint" }, "(选填，最多9张)")
          ]),
          vue.createElementVNode("view", { class: "image-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.imageList, (img, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "image-item",
                  key: index
                }, [
                  vue.createElementVNode("image", {
                    class: "preview-image",
                    src: img,
                    mode: "aspectFill"
                  }, null, 8, ["src"]),
                  vue.createElementVNode("view", {
                    class: "delete-button",
                    onClick: ($event) => $options.deleteImage(index)
                  }, "×", 8, ["onClick"])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            $data.imageList.length < 9 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "image-upload-button",
              onClick: _cache[4] || (_cache[4] = (...args) => $options.chooseImage && $options.chooseImage(...args))
            }, [
              vue.createElementVNode("text", { class: "upload-icon" }, "+")
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])
      ]),
      vue.createCommentVNode(" 提交确认弹窗 "),
      $data.showSubmitModal ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "submit-modal"
      }, [
        vue.createElementVNode("view", { class: "modal-content" }, [
          vue.createElementVNode("view", { class: "modal-title" }, "确认发布"),
          vue.createElementVNode("view", { class: "modal-body" }, "您确定要发布这条内容吗？"),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode("button", {
              class: "modal-button cancel",
              onClick: _cache[5] || (_cache[5] = (...args) => $options.cancelSubmit && $options.cancelSubmit(...args))
            }, "取消"),
            vue.createElementVNode("button", {
              class: "modal-button confirm",
              onClick: _cache[6] || (_cache[6] = (...args) => $options.confirmSubmit && $options.confirmSubmit(...args))
            }, "确认")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 加载提示 "),
      $data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "loading-container"
      }, [
        vue.createElementVNode("view", { class: "loading-spinner" }),
        vue.createElementVNode("text", { class: "loading-text" }, "正在发布...")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesChatPost = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__file", "Y:/Parttime/非遗小程序开发/Demo/Demo/frontend/pages/chat/post.vue"]]);
  const _imports_0$2 = "/static/images/avatar/空中花园.png";
  const _sfc_main$3 = {
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
        const token = uni.getStorageSync("token");
        const userInfoStr = uni.getStorageSync("userInfo");
        if (token && userInfoStr) {
          try {
            let userInfo = JSON.parse(userInfoStr);
            if (!userInfo.avatar_url) {
              userInfo.avatar_url = "/static/images/avatar/空中花园.png";
              uni.setStorageSync("userInfo", JSON.stringify(userInfo));
            }
            this.isLogin = true;
            this.userInfo = userInfo;
            formatAppLog("log", "at pages/profile/profile.vue:185", "当前用户头像路径:", this.userInfo.avatar_url);
          } catch (e) {
            formatAppLog("error", "at pages/profile/profile.vue:187", "解析用户信息失败:", e);
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
        uni.navigateTo({
          url: "/pages/login/login"
        });
      },
      handleLogout() {
        uni.showModal({
          title: "提示",
          content: "确定要退出登录吗？",
          success: (res) => {
            if (res.confirm) {
              uni.removeStorageSync("token");
              uni.removeStorageSync("userInfo");
              this.isLogin = false;
              this.userInfo = {
                id: null,
                nickname: "",
                avatar_url: ""
              };
              uni.showToast({
                title: "已退出登录",
                icon: "success"
              });
            }
          }
        });
      },
      navigateTo(url) {
        uni.navigateTo({ url });
      },
      navigateToOrderList(status) {
        if (!this.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          setTimeout(() => {
            this.handleLogin();
          }, 1500);
          return;
        }
        let url = "/pages/order/order-detail?id=1001";
        uni.navigateTo({
          url,
          success: () => {
            formatAppLog("log", "at pages/profile/profile.vue:255", "成功导航到订单详情页面");
          },
          fail: (err) => {
            formatAppLog("error", "at pages/profile/profile.vue:258", "导航到订单详情页面失败:", err);
            uni.redirectTo({
              url,
              fail: (redirectErr) => {
                formatAppLog("error", "at pages/profile/profile.vue:264", "redirectTo 也失败了:", redirectErr);
                uni.reLaunch({
                  url,
                  fail: (relaunchErr) => {
                    formatAppLog("error", "at pages/profile/profile.vue:270", "reLaunch 也失败了:", relaunchErr);
                    uni.showToast({
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
        formatAppLog("error", "at pages/profile/profile.vue:284", "头像加载失败:", e);
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
        uni.showActionSheet({
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
        uni.chooseImage({
          count: 1,
          // 最多可以选择的图片张数
          sizeType: ["compressed"],
          // 可以指定是原图还是压缩图，默认二者都有
          sourceType: [sourceType],
          // album 从相册选图，camera 使用相机
          success: (res) => {
            const tempFilePath = res.tempFilePaths[0];
            uni.showLoading({
              title: "上传中..."
            });
            this.uploadAvatar(tempFilePath);
          }
        });
      },
      uploadAvatar(filePath) {
        uni.uploadFile({
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
              formatAppLog("error", "at pages/profile/profile.vue:359", "解析上传结果失败:", error);
              uni.showToast({
                title: "上传失败，请稍后再试",
                icon: "none"
              });
            }
          },
          fail: (error) => {
            formatAppLog("error", "at pages/profile/profile.vue:367", "上传头像失败:", error);
            uni.showToast({
              title: "上传失败，请稍后再试",
              icon: "none"
            });
          },
          complete: () => {
            uni.hideLoading();
          }
        });
      },
      async updateAvatarUrl(avatarUrl) {
        try {
          const response = await this.updateUserAvatar(this.userInfo.id, avatarUrl);
          if (response.status === "success") {
            this.userInfo.avatar_url = avatarUrl;
            uni.setStorageSync("userInfo", JSON.stringify(this.userInfo));
            uni.showToast({
              title: "头像更新成功",
              icon: "success"
            });
          } else {
            throw new Error(response.message || "更新失败");
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/profile.vue:396", "更新头像URL失败:", error);
          uni.showToast({
            title: "更新失败，请稍后再试",
            icon: "none"
          });
        }
      },
      updateUserAvatar(userId, avatarUrl) {
        return new Promise((resolve, reject) => {
          uni.request({
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
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部安全区域和导航栏 "),
      vue.createElementVNode("view", { class: "status-bar" }),
      vue.createElementVNode("view", { class: "nav-header" }, [
        vue.createElementVNode("text", { class: "nav-title" }, "我的")
      ]),
      vue.createCommentVNode(" 个人信息卡片 "),
      vue.createElementVNode("view", { class: "profile-card" }, [
        vue.createElementVNode("view", {
          class: "avatar-container",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.changeAvatar && $options.changeAvatar(...args))
        }, [
          $data.isLogin && $data.userInfo.avatar_url && !$options.isDefaultAvatar($data.userInfo.avatar_url) ? (vue.openBlock(), vue.createElementBlock("image", {
            key: 0,
            src: $data.userInfo.avatar_url,
            class: "avatar",
            mode: "aspectFill",
            onError: _cache[0] || (_cache[0] = (...args) => $options.handleAvatarError && $options.handleAvatarError(...args))
          }, null, 40, ["src"])) : (vue.openBlock(), vue.createElementBlock("image", {
            key: 1,
            src: _imports_0$2,
            class: "avatar",
            mode: "aspectFill"
          }))
        ]),
        vue.createElementVNode("view", { class: "user-details" }, [
          vue.createElementVNode(
            "text",
            { class: "user-name" },
            vue.toDisplayString($data.userInfo.nickname || "未登录用户"),
            1
            /* TEXT */
          ),
          !$data.isLogin ? (vue.openBlock(), vue.createElementBlock("button", {
            key: 0,
            class: "login-button",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.handleLogin && $options.handleLogin(...args))
          }, [
            vue.createElementVNode("text", { class: "login-text" }, "点击登录")
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 积分显示 "),
        $data.isLogin ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "points-badge"
        }, [
          vue.createElementVNode("view", { class: "points-icon" }, "🏆"),
          vue.createElementVNode("view", { class: "points-info" }, [
            vue.createElementVNode(
              "text",
              { class: "points-value" },
              vue.toDisplayString($data.userInfo.points || 0),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "points-label" }, "积分")
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createCommentVNode(" 订单模块 "),
      vue.createElementVNode("view", { class: "module-card" }, [
        vue.createElementVNode("view", { class: "module-header" }, [
          vue.createElementVNode("view", { class: "module-title-block" }, [
            vue.createElementVNode("text", { class: "module-icon" }, "📦"),
            vue.createElementVNode("text", { class: "module-title" }, "我的订单")
          ]),
          vue.createElementVNode("view", {
            class: "view-all",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.navigateToOrderList && $options.navigateToOrderList(...args))
          }, [
            vue.createElementVNode("text", { class: "view-all-text" }, "查看全部"),
            vue.createElementVNode("text", { class: "chevron-right" }, "›")
          ])
        ]),
        vue.createElementVNode("view", { class: "order-actions" }, [
          vue.createElementVNode("view", {
            class: "action-item",
            onClick: _cache[4] || (_cache[4] = ($event) => $options.navigateToOrderList("pending"))
          }, [
            vue.createElementVNode("view", { class: "action-icon-wrapper" }, [
              vue.createElementVNode("text", { class: "action-icon" }, "💰"),
              $data.orderBadges.pending ? (vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: 0,
                  class: "notification"
                },
                vue.toDisplayString($data.orderBadges.pending),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ]),
            vue.createElementVNode("text", { class: "action-name" }, "待付款")
          ]),
          vue.createElementVNode("view", {
            class: "action-item",
            onClick: _cache[5] || (_cache[5] = ($event) => $options.navigateToOrderList("paid"))
          }, [
            vue.createElementVNode("view", { class: "action-icon-wrapper" }, [
              vue.createElementVNode("text", { class: "action-icon" }, "📦"),
              $data.orderBadges.paid ? (vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: 0,
                  class: "notification"
                },
                vue.toDisplayString($data.orderBadges.paid),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ]),
            vue.createElementVNode("text", { class: "action-name" }, "待发货")
          ]),
          vue.createElementVNode("view", {
            class: "action-item",
            onClick: _cache[6] || (_cache[6] = ($event) => $options.navigateToOrderList("shipped"))
          }, [
            vue.createElementVNode("view", { class: "action-icon-wrapper" }, [
              vue.createElementVNode("text", { class: "action-icon" }, "🚚"),
              $data.orderBadges.shipped ? (vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: 0,
                  class: "notification"
                },
                vue.toDisplayString($data.orderBadges.shipped),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ]),
            vue.createElementVNode("text", { class: "action-name" }, "待收货")
          ]),
          vue.createElementVNode("view", {
            class: "action-item",
            onClick: _cache[7] || (_cache[7] = ($event) => $options.navigateToOrderList("review"))
          }, [
            vue.createElementVNode("view", { class: "action-icon-wrapper" }, [
              vue.createElementVNode("text", { class: "action-icon" }, "✏️"),
              $data.orderBadges.review ? (vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: 0,
                  class: "notification"
                },
                vue.toDisplayString($data.orderBadges.review),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ]),
            vue.createElementVNode("text", { class: "action-name" }, "待评价")
          ]),
          vue.createElementVNode("view", {
            class: "action-item",
            onClick: _cache[8] || (_cache[8] = ($event) => $options.navigateTo("/pages/order/after-sale"))
          }, [
            vue.createElementVNode("view", { class: "action-icon-wrapper" }, [
              vue.createElementVNode("text", { class: "action-icon" }, "🔄")
            ]),
            vue.createElementVNode("text", { class: "action-name" }, "售后")
          ])
        ])
      ]),
      vue.createCommentVNode(" 我的发布模块 "),
      vue.createElementVNode("view", { class: "module-card" }, [
        vue.createElementVNode("view", { class: "module-header" }, [
          vue.createElementVNode("view", { class: "module-title-block" }, [
            vue.createElementVNode("text", { class: "module-icon" }, "📝"),
            vue.createElementVNode("text", { class: "module-title" }, "我的发布")
          ])
        ]),
        vue.createElementVNode("view", { class: "list-menu" }, [
          vue.createElementVNode("view", {
            class: "list-item",
            onClick: _cache[9] || (_cache[9] = ($event) => $options.navigateTo("/pages/post/my"))
          }, [
            vue.createElementVNode("view", { class: "item-left" }, [
              vue.createElementVNode("text", { class: "item-icon" }, "📋"),
              vue.createElementVNode("text", { class: "item-name" }, "我的帖子")
            ]),
            vue.createElementVNode("view", { class: "item-right" }, [
              vue.createElementVNode(
                "text",
                { class: "item-info" },
                vue.toDisplayString($data.userStats.posts || 0) + "篇",
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "chevron-right" }, "›")
            ])
          ]),
          vue.createElementVNode("view", {
            class: "list-item",
            onClick: _cache[10] || (_cache[10] = ($event) => $options.navigateTo("/pages/comment/my"))
          }, [
            vue.createElementVNode("view", { class: "item-left" }, [
              vue.createElementVNode("text", { class: "item-icon" }, "💬"),
              vue.createElementVNode("text", { class: "item-name" }, "我的评论")
            ]),
            vue.createElementVNode("view", { class: "item-right" }, [
              vue.createElementVNode(
                "text",
                { class: "item-info" },
                vue.toDisplayString($data.userStats.comments || 0) + "条",
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "chevron-right" }, "›")
            ])
          ])
        ])
      ]),
      vue.createCommentVNode(" 退出登录按钮 "),
      $data.isLogin ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "logout-container"
      }, [
        vue.createElementVNode("button", {
          class: "logout-button",
          onClick: _cache[11] || (_cache[11] = (...args) => $options.handleLogout && $options.handleLogout(...args))
        }, "退出登录")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesProfileProfile = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__file", "Y:/Parttime/非遗小程序开发/Demo/Demo/frontend/pages/profile/profile.vue"]]);
  const _imports_0$1 = "/static/images/empty-order.png";
  const _sfc_main$2 = {
    data() {
      return {
        isLoading: true,
        orderId: "",
        order: null,
        allOrders: [],
        // 存储所有订单
        currentOrderIndex: 0,
        // 当前显示的订单索引
        apiBaseUrl: "http://localhost:3001/api",
        userId: 2
        // 默认用户ID
      };
    },
    onLoad(options) {
      formatAppLog("log", "at pages/order/order-detail.vue:120", "订单详情页面加载, 参数:", options);
      if (options.userId) {
        this.userId = options.userId;
        formatAppLog("log", "at pages/order/order-detail.vue:125", "使用传入的用户ID:", this.userId);
      }
      this.fetchOrderDetail();
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      fetchOrderDetail() {
        this.isLoading = true;
        formatAppLog("log", "at pages/order/order-detail.vue:137", "开始获取所有订单数据");
        formatAppLog("log", "at pages/order/order-detail.vue:140", `正在请求用户ID ${this.userId} 的订单数据`);
        uni.request({
          url: `${this.apiBaseUrl}/orders/user/${this.userId}`,
          method: "GET",
          success: (res) => {
            var _a;
            formatAppLog("log", "at pages/order/order-detail.vue:145", "API返回数据:", res.data);
            if (res.data && res.data.status === "success") {
              const orderList = res.data.data;
              formatAppLog("log", "at pages/order/order-detail.vue:151", `用户ID ${this.userId} 的所有订单列表:`, orderList);
              formatAppLog("log", "at pages/order/order-detail.vue:152", "订单数量:", orderList.length);
              if (orderList && orderList.length > 0) {
                this.allOrders = orderList.map((order) => this.formatOrderData(order));
                formatAppLog("log", "at pages/order/order-detail.vue:157", `加载了 ${this.allOrders.length} 个订单`);
                this.allOrders.forEach((order, index) => {
                  formatAppLog("log", "at pages/order/order-detail.vue:161", `订单 ${index + 1}/${this.allOrders.length}:`, {
                    id: order.id,
                    商品: order.products.map((p) => p.name).join(", "),
                    金额: order.total_amount,
                    状态: this.getStatusText(order.status)
                  });
                });
                this.currentOrderIndex = 0;
                this.order = this.allOrders[0];
                formatAppLog("log", "at pages/order/order-detail.vue:172", "当前显示订单:", this.order);
                if (this.allOrders.length > 1) {
                  setTimeout(() => {
                    uni.showToast({
                      title: `发现${this.allOrders.length}个订单，上下滑动可切换`,
                      icon: "none",
                      duration: 2e3
                    });
                  }, 500);
                }
              } else {
                this.allOrders = [];
                this.order = null;
                uni.showToast({
                  title: "暂无订单数据",
                  icon: "none"
                });
              }
            } else {
              formatAppLog("error", "at pages/order/order-detail.vue:195", "API返回错误:", res.data);
              uni.showToast({
                title: ((_a = res.data) == null ? void 0 : _a.message) || "获取订单详情失败",
                icon: "none"
              });
              this.useFallbackData();
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/order/order-detail.vue:206", "获取订单详情失败:", err);
            uni.showToast({
              title: "获取订单详情失败，请检查网络",
              icon: "none"
            });
            this.useFallbackData();
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      },
      // 处理滑动切换订单
      handleOrderChange(e) {
        const index = e.detail.current;
        formatAppLog("log", "at pages/order/order-detail.vue:224", "滑动切换至订单索引:", index);
        this.currentOrderIndex = index;
        this.order = this.allOrders[index];
        const direction = index > e.detail.source ? "↑" : "↓";
        uni.showToast({
          title: `${direction} 订单 ${index + 1}/${this.allOrders.length}`,
          icon: "none",
          duration: 1e3
        });
      },
      // 获取滑动提示文本
      getSwipeHintText(index) {
        if (this.allOrders.length <= 1)
          return "";
        if (index === 0) {
          return "↑ 向上滑动查看下一订单";
        } else if (index === this.allOrders.length - 1) {
          return "↓ 向下滑动查看上一订单";
        } else {
          return "↕ 上下滑动切换订单";
        }
      },
      // 格式化订单数据
      formatOrderData(orderData) {
        if (!orderData)
          return null;
        let productImage = orderData.product_image;
        if (productImage && productImage.startsWith("/uploads/")) {
          productImage = `${this.apiBaseUrl.replace("/api", "")}${productImage}`;
        }
        return {
          id: orderData.id,
          order_number: orderData.order_number || `ORD${orderData.id}`,
          status: orderData.status || 1,
          // 如果没有状态，默认为待发货状态（已支付）
          total_amount: orderData.total_price || "0.00",
          created_at: orderData.created_at,
          payment_time: orderData.payment_time || (/* @__PURE__ */ new Date()).toLocaleString(),
          // 处理商品数据
          products: Array.isArray(orderData.products) ? orderData.products.map((p) => {
            let image = p.image;
            if (image && image.startsWith("/uploads/")) {
              image = `${this.apiBaseUrl.replace("/api", "")}${image}`;
            }
            return { ...p, image };
          }) : [
            {
              id: orderData.product_id,
              name: orderData.product_name,
              price: orderData.product_price,
              quantity: orderData.quantity,
              image: productImage
            }
          ]
        };
      },
      // 使用模拟数据作为备选
      useFallbackData() {
        const mockOrders = [
          {
            id: "1001",
            order_number: "O2023051001",
            status: 1,
            // 待发货（已支付）
            total_amount: "299.00",
            created_at: "2023-05-10 14:30:00",
            payment_time: "2023-05-10 14:35:00",
            products: [
              {
                id: "101",
                name: "竹编包包",
                price: "299.00",
                quantity: 1,
                image: "/uploads/assets/商品/卖竹编包包1.jpg"
              }
            ]
          },
          {
            id: "1002",
            order_number: "O2023051002",
            status: 2,
            // 待收货
            total_amount: "599.00",
            created_at: "2023-05-12 10:20:00",
            payment_time: "2023-05-12 10:25:00",
            products: [
              {
                id: "102",
                name: "传统手工艺品",
                price: "599.00",
                quantity: 1,
                image: "/uploads/assets/商品/卖竹编包包1.jpg"
              }
            ]
          },
          {
            id: "1003",
            order_number: "O2023051003",
            status: 3,
            // 已完成
            total_amount: "199.00",
            created_at: "2023-05-15 16:40:00",
            payment_time: "2023-05-15 16:45:00",
            products: [
              {
                id: "103",
                name: "民族风饰品",
                price: "199.00",
                quantity: 1,
                image: "/uploads/assets/商品/卖竹编包包1.jpg"
              }
            ]
          }
        ];
        this.allOrders = mockOrders.map((order) => {
          const products = order.products.map((p) => {
            if (p.image && p.image.startsWith("/uploads/")) {
              p.image = `${this.apiBaseUrl.replace("/api", "")}${p.image}`;
            }
            return p;
          });
          return { ...order, products };
        });
        this.currentOrderIndex = 0;
        this.order = this.allOrders[0];
        formatAppLog("log", "at pages/order/order-detail.vue:359", "使用模拟数据:", this.allOrders);
        if (this.allOrders.length > 1) {
          setTimeout(() => {
            uni.showToast({
              title: `加载了${this.allOrders.length}个模拟订单，上下滑动可切换`,
              icon: "none",
              duration: 2e3
            });
          }, 500);
        }
      },
      getStatusText(status) {
        const statusMap = {
          0: "待付款",
          1: "待发货",
          2: "待收货",
          3: "已完成",
          4: "已取消"
        };
        return statusMap[status] || "未知状态";
      },
      getStatusDesc(status) {
        const descMap = {
          0: "请在24小时内完成支付，超时订单将自动取消",
          1: "商家正在备货中，请耐心等待",
          2: "商品已发出，请注意查收",
          3: "订单已完成，感谢您的购买",
          4: "订单已取消"
        };
        return descMap[status] || "";
      },
      getStatusIconText(status) {
        const iconMap = {
          0: "付",
          1: "备",
          2: "运",
          3: "完",
          4: "取"
        };
        return iconMap[status] || "?";
      },
      getProductsTotal(products) {
        if (!products || !products.length)
          return "0.00";
        const total = products.reduce((sum, product) => {
          return sum + parseFloat(product.price) * (product.quantity || 1);
        }, 0);
        return total.toFixed(2);
      },
      viewProduct(productId) {
        if (!productId)
          return;
        uni.navigateTo({
          url: `/pages/buy/detail?id=${productId}`
        });
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "status-bar" }),
        vue.createElementVNode("view", { class: "title-row" }, [
          vue.createElementVNode("view", {
            class: "back-button",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "back-icon" }, "←")
          ]),
          vue.createElementVNode("text", { class: "title" }, "订单详情"),
          vue.createElementVNode("view", { style: { "width": "60rpx" } })
        ])
      ]),
      $data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-container"
      }, [
        vue.createElementVNode("view", { class: "loading-spinner" }),
        vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
      ])) : vue.createCommentVNode("v-if", true),
      !$data.isLoading && $data.allOrders.length > 0 ? (vue.openBlock(), vue.createElementBlock("swiper", {
        key: 1,
        class: "order-swiper",
        current: $data.currentOrderIndex,
        onChange: _cache[2] || (_cache[2] = (...args) => $options.handleOrderChange && $options.handleOrderChange(...args)),
        vertical: "",
        duration: 300
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.allOrders, (orderItem, index) => {
            return vue.openBlock(), vue.createElementBlock("swiper-item", {
              key: orderItem.id,
              class: "swiper-item-container"
            }, [
              vue.createElementVNode("scroll-view", {
                class: "content",
                "scroll-y": "",
                "enable-back-to-top": ""
              }, [
                vue.createElementVNode("view", { class: "status-section" }, [
                  vue.createElementVNode("view", { class: "status-icon" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "status-icon-text" },
                      vue.toDisplayString($options.getStatusIconText(orderItem.status)),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "status-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "status-text" },
                      vue.toDisplayString($options.getStatusText(orderItem.status)),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "status-desc" },
                      vue.toDisplayString($options.getStatusDesc(orderItem.status)),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "card products-card" }, [
                  vue.createElementVNode("view", { class: "card-header" }, [
                    vue.createElementVNode("text", { class: "card-title" }, "商品信息")
                  ]),
                  vue.createElementVNode("view", { class: "product-list" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(orderItem.products, (product, pIndex) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          key: pIndex,
                          class: "product-item",
                          onClick: ($event) => $options.viewProduct(product.id)
                        }, [
                          vue.createElementVNode("view", { class: "product-image-container" }, [
                            vue.createElementVNode("image", {
                              class: "product-image",
                              src: product.image,
                              mode: "aspectFill"
                            }, null, 8, ["src"])
                          ]),
                          vue.createElementVNode("view", { class: "product-info" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "product-name" },
                              vue.toDisplayString(product.name),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode("view", { class: "product-price-count" }, [
                              vue.createElementVNode(
                                "text",
                                { class: "product-price" },
                                "¥" + vue.toDisplayString(product.price),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode(
                                "text",
                                { class: "product-count" },
                                "x" + vue.toDisplayString(product.quantity),
                                1
                                /* TEXT */
                              )
                            ])
                          ])
                        ], 8, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ]),
                vue.createElementVNode("view", { class: "card amount-card" }, [
                  vue.createElementVNode("view", { class: "card-header" }, [
                    vue.createElementVNode("text", { class: "card-title" }, "金额明细")
                  ]),
                  vue.createElementVNode("view", { class: "amount-info" }, [
                    vue.createElementVNode("view", { class: "amount-item" }, [
                      vue.createElementVNode("text", { class: "label" }, "商品金额"),
                      vue.createElementVNode(
                        "text",
                        { class: "value" },
                        "¥" + vue.toDisplayString($options.getProductsTotal(orderItem.products)),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "amount-item total" }, [
                      vue.createElementVNode("text", { class: "label" }, "实付款"),
                      vue.createElementVNode(
                        "text",
                        { class: "value" },
                        "¥" + vue.toDisplayString(orderItem.total_amount),
                        1
                        /* TEXT */
                      )
                    ])
                  ])
                ]),
                vue.createElementVNode("view", { class: "footer-actions" }, [
                  vue.createElementVNode("view", { class: "action-group" }, [
                    vue.createElementVNode("view", {
                      class: "action-btn",
                      onClick: _cache[1] || (_cache[1] = (...args) => $options.goBack && $options.goBack(...args))
                    }, "返回"),
                    vue.createElementVNode("view", {
                      class: "action-btn primary-btn",
                      onClick: ($event) => {
                        var _a;
                        return $options.viewProduct((_a = orderItem.products[0]) == null ? void 0 : _a.id);
                      }
                    }, "查看商品", 8, ["onClick"])
                  ]),
                  vue.createCommentVNode(" 滑动提示 "),
                  $data.allOrders.length > 1 ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "swipe-hint"
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "hint-text" },
                      vue.toDisplayString($options.getSwipeHintText(index)),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "order-indicator" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "indicator-text" },
                        "订单 " + vue.toDisplayString(index + 1) + "/" + vue.toDisplayString($data.allOrders.length),
                        1
                        /* TEXT */
                      )
                    ])
                  ])) : vue.createCommentVNode("v-if", true)
                ])
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ], 40, ["current"])) : vue.createCommentVNode("v-if", true),
      !$data.isLoading && $data.allOrders.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "empty-container"
      }, [
        vue.createElementVNode("image", {
          class: "empty-icon",
          src: _imports_0$1
        }),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无订单信息"),
        vue.createElementVNode("view", {
          class: "go-back-btn",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.goBack && $options.goBack(...args))
        }, "返回")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesOrderOrderDetail = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "Y:/Parttime/非遗小程序开发/Demo/Demo/frontend/pages/order/order-detail.vue"]]);
  const _imports_0 = "/static/images/logo.png";
  const _sfc_main$1 = {
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
        uni.navigateBack();
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
        uni.navigateTo({
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
        uni.showToast({
          title: "验证码已发送",
          icon: "success"
        });
      },
      validateForm() {
        if (this.isRegister) {
          if (!this.username.trim()) {
            uni.showToast({
              title: "请输入用户名",
              icon: "none"
            });
            return false;
          }
          if (!this.validatePhone())
            return false;
          if (this.useVerifyCode && !this.verifyCode.trim()) {
            uni.showToast({
              title: "请输入验证码",
              icon: "none"
            });
            return false;
          }
          if (this.password.length < 6) {
            uni.showToast({
              title: "密码长度不能少于6位",
              icon: "none"
            });
            return false;
          }
          if (this.password !== this.confirmPassword) {
            uni.showToast({
              title: "两次输入的密码不一致",
              icon: "none"
            });
            return false;
          }
          if (!this.isAgreed) {
            uni.showToast({
              title: "请同意用户协议和隐私政策",
              icon: "none"
            });
            return false;
          }
        } else {
          if (!this.validatePhone())
            return false;
          if (!this.password.trim()) {
            uni.showToast({
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
          uni.showToast({
            title: "请输入手机号",
            icon: "none"
          });
          return false;
        }
        if (!/^1\d{10}$/.test(this.phone)) {
          uni.showToast({
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
            response = await register(
              this.username,
              // nickname
              this.phone,
              // phone_number
              this.password
              // password
            );
            if (response.status === "success") {
              uni.showToast({
                title: "注册成功，请登录",
                icon: "success"
              });
              this.isRegister = false;
              this.password = "";
            } else {
              throw new Error(response.message || "注册失败");
            }
          } else {
            response = await login(
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
              formatAppLog("log", "at pages/login/login.vue:346", "设置用户信息，头像路径:", userInfo.avatar_url);
              uni.getImageInfo({
                src: userInfo.avatar_url,
                success: function(res) {
                  formatAppLog("log", "at pages/login/login.vue:352", "头像图片加载成功:", res.width, "x", res.height);
                },
                fail: function(err) {
                  formatAppLog("error", "at pages/login/login.vue:355", "头像图片加载失败:", err);
                  userInfo.avatar_url = "./static/images/avatar/空中花园.png";
                  uni.setStorageSync("userInfo", JSON.stringify(userInfo));
                }
              });
              uni.setStorageSync("token", "user_token");
              uni.setStorageSync("userInfo", JSON.stringify(userInfo));
              uni.showToast({
                title: "登录成功",
                icon: "success"
              });
              setTimeout(() => {
                uni.navigateBack();
              }, 1500);
            } else {
              throw new Error(response.message || "登录失败");
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/login/login.vue:379", this.isRegister ? "注册失败:" : "登录失败:", error);
          uni.showToast({
            title: error.message || (this.isRegister ? "注册失败，请稍后再试" : "登录失败，请检查账号密码"),
            icon: "none"
          });
        } finally {
          this.isSubmitting = false;
        }
      },
      wechatLogin() {
        uni.showToast({
          title: "微信登录功能开发中",
          icon: "none"
        });
      },
      handleAgreementChange(e) {
        this.isAgreed = e.detail.value.includes("agree");
      },
      viewUserAgreement() {
        uni.navigateTo({
          url: "/pages/login/user-agreement"
        });
      },
      viewPrivacyPolicy() {
        uni.navigateTo({
          url: "/pages/login/privacy-policy"
        });
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" \r\n      注意：验证码验证功能当前被禁用，\r\n      因为后端API接口不需要验证码。\r\n      若后端添加了验证码功能，将useVerifyCode设为true即可启用。\r\n    "),
      vue.createCommentVNode(" 顶部安全区域 "),
      vue.createElementVNode("view", { class: "status-bar" }),
      vue.createCommentVNode(" 返回按钮 "),
      vue.createElementVNode("view", {
        class: "back-btn",
        onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
      }, [
        vue.createElementVNode("text", { class: "back-icon" }, "←")
      ]),
      vue.createCommentVNode(" 标题区域 "),
      vue.createElementVNode("view", { class: "header-section" }, [
        vue.createElementVNode("image", {
          class: "logo-image",
          src: _imports_0,
          mode: "aspectFit"
        }),
        vue.createElementVNode(
          "text",
          { class: "welcome-text" },
          vue.toDisplayString($data.isRegister ? "创建账号" : "欢迎回来"),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "subtitle-text" },
          vue.toDisplayString($data.isRegister ? "加入非遗小程序，探索传统文化" : "登录您的账号，继续探索之旅"),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 表单区域 "),
      vue.createElementVNode("view", { class: "form-section" }, [
        vue.createCommentVNode(" 用户名输入框 (仅注册时显示) "),
        $data.isRegister ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "input-group"
        }, [
          vue.createElementVNode("text", { class: "input-label" }, "用户名"),
          vue.createElementVNode("view", { class: "input-container" }, [
            vue.createElementVNode("text", { class: "input-icon" }, "👤"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input-field",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.username = $event),
                placeholder: "请输入您的用户名",
                maxlength: "20"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.username]
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 手机号输入框 "),
        vue.createElementVNode("view", { class: "input-group" }, [
          vue.createElementVNode("text", { class: "input-label" }, "手机号"),
          vue.createElementVNode("view", { class: "input-container" }, [
            vue.createElementVNode("text", { class: "input-icon" }, "📱"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input-field",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.phone = $event),
                placeholder: "请输入您的手机号",
                maxlength: "11",
                type: "number"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.phone]
            ])
          ])
        ]),
        vue.createCommentVNode(" 验证码输入框 (仅在注册且启用验证码时显示) "),
        $data.isRegister && $data.useVerifyCode ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "input-group"
        }, [
          vue.createElementVNode("text", { class: "input-label" }, "验证码"),
          vue.createElementVNode("view", { class: "input-container verify-code" }, [
            vue.createElementVNode("text", { class: "input-icon" }, "🔑"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input-field",
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.verifyCode = $event),
                placeholder: "请输入验证码",
                maxlength: "6",
                type: "number"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.verifyCode]
            ]),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["verify-btn", { "disabled": $data.countDown > 0 }]),
                onClick: _cache[4] || (_cache[4] = (...args) => $options.getVerifyCode && $options.getVerifyCode(...args))
              },
              vue.toDisplayString($data.countDown > 0 ? `${$data.countDown}s` : "获取验证码"),
              3
              /* TEXT, CLASS */
            )
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 密码输入框 "),
        vue.createElementVNode("view", { class: "input-group" }, [
          vue.createElementVNode("text", { class: "input-label" }, "密码"),
          vue.createElementVNode("view", { class: "input-container" }, [
            vue.createElementVNode("text", { class: "input-icon" }, "🔒"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input-field",
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.password = $event),
                placeholder: "请输入密码",
                password: "",
                maxlength: "20"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.password]
            ])
          ])
        ]),
        vue.createCommentVNode(" 确认密码输入框 (仅注册时显示) "),
        $data.isRegister ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "input-group"
        }, [
          vue.createElementVNode("text", { class: "input-label" }, "确认密码"),
          vue.createElementVNode("view", { class: "input-container" }, [
            vue.createElementVNode("text", { class: "input-icon" }, "🔒"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input-field",
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $data.confirmPassword = $event),
                placeholder: "请再次输入密码",
                password: "",
                maxlength: "20"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.confirmPassword]
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createCommentVNode(" 选项区域 "),
      vue.createElementVNode("view", { class: "options-section" }, [
        vue.createCommentVNode(" 用户协议勾选 (仅注册时显示) "),
        $data.isRegister ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "agreement-container"
        }, [
          vue.createElementVNode(
            "checkbox-group",
            {
              onChange: _cache[9] || (_cache[9] = (...args) => $options.handleAgreementChange && $options.handleAgreementChange(...args))
            },
            [
              vue.createElementVNode("checkbox", {
                value: "agree",
                checked: $data.isAgreed,
                color: "#8a6642",
                style: { "transform": "scale(0.8)" }
              }, null, 8, ["checked"]),
              vue.createElementVNode("text", { class: "agreement-text" }, "我已阅读并同意"),
              vue.createElementVNode("text", {
                class: "agreement-link",
                onClick: _cache[7] || (_cache[7] = (...args) => $options.viewUserAgreement && $options.viewUserAgreement(...args))
              }, "《用户协议》"),
              vue.createElementVNode("text", { class: "agreement-text" }, "和"),
              vue.createElementVNode("text", {
                class: "agreement-link",
                onClick: _cache[8] || (_cache[8] = (...args) => $options.viewPrivacyPolicy && $options.viewPrivacyPolicy(...args))
              }, "《隐私政策》")
            ],
            32
            /* NEED_HYDRATION */
          )
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 忘记密码链接 (仅登录时显示) "),
        !$data.isRegister ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "forgot-password"
        }, [
          vue.createElementVNode("text", {
            class: "forgot-password-link",
            onClick: _cache[10] || (_cache[10] = (...args) => $options.forgetPassword && $options.forgetPassword(...args))
          }, "忘记密码?")
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createCommentVNode(" 提交按钮 "),
      vue.createElementVNode("view", { class: "submit-section" }, [
        vue.createElementVNode("button", {
          class: "submit-button",
          disabled: $data.isSubmitting,
          onClick: _cache[11] || (_cache[11] = (...args) => $options.handleSubmit && $options.handleSubmit(...args))
        }, [
          vue.createElementVNode(
            "text",
            { class: "submit-text" },
            vue.toDisplayString($data.isSubmitting ? "处理中..." : $data.isRegister ? "注册" : "登录"),
            1
            /* TEXT */
          )
        ], 8, ["disabled"])
      ]),
      vue.createCommentVNode(" 切换登录/注册 "),
      vue.createElementVNode("view", {
        class: "switch-mode",
        onClick: _cache[12] || (_cache[12] = (...args) => $options.toggleRegister && $options.toggleRegister(...args))
      }, [
        vue.createElementVNode(
          "text",
          { class: "switch-text" },
          vue.toDisplayString($data.isRegister ? "已有账号？" : "没有账号？"),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "switch-action" },
          vue.toDisplayString($data.isRegister ? "去登录" : "去注册"),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 其他登录方式 "),
      vue.createElementVNode("view", { class: "other-login" }, [
        vue.createElementVNode("view", { class: "divider" }, [
          vue.createElementVNode("view", { class: "divider-line" }),
          vue.createElementVNode("text", { class: "divider-text" }, "其他登录方式"),
          vue.createElementVNode("view", { class: "divider-line" })
        ]),
        vue.createElementVNode("view", { class: "social-buttons" }, [
          vue.createElementVNode("view", {
            class: "social-button wechat",
            onClick: _cache[13] || (_cache[13] = (...args) => $options.wechatLogin && $options.wechatLogin(...args))
          }, [
            vue.createElementVNode("text", { class: "social-icon" }, "微")
          ])
        ])
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "Y:/Parttime/非遗小程序开发/Demo/Demo/frontend/pages/login/login.vue"]]);
  __definePage("pages/home/home", PagesHomeHome);
  __definePage("pages/home/map-detail", PagesHomeMapDetail);
  __definePage("pages/buy/buy", PagesBuyBuy);
  __definePage("pages/buy/detail", PagesBuyDetail);
  __definePage("pages/learn/learn", PagesLearnLearn);
  __definePage("pages/learn/content", PagesLearnContent);
  __definePage("pages/learn/category", PagesLearnCategory);
  __definePage("pages/chat/chat", PagesChatChat);
  __definePage("pages/chat/detail", PagesChatDetail);
  __definePage("pages/chat/post", PagesChatPost);
  __definePage("pages/profile/profile", PagesProfileProfile);
  __definePage("pages/order/order-detail", PagesOrderOrderDetail);
  __definePage("pages/login/login", PagesLoginLogin);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "Y:/Parttime/非遗小程序开发/Demo/Demo/frontend/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
