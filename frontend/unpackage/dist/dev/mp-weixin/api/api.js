"use strict";
const common_vendor = require("../common/vendor.js");
const config_config = require("../config/config.js");
const BASE_URL = config_config.exportConfig.BASE_API_URL;
const SERVER_URL = config_config.exportConfig.SERVER_URL;
console.log("API服务地址:", BASE_URL);
console.log("资源服务器地址:", SERVER_URL);
const processImageUrl = (url) => {
  if (!url)
    return "";
  console.log("处理图片URL:", url);
  if (url.startsWith("http://") || url.startsWith("https://")) {
    console.log("已是完整URL，保持不变");
    return url;
  }
  const lastSlashIndex = url.lastIndexOf("/");
  const baseUrl = url.substring(0, lastSlashIndex + 1);
  const fileName = url.substring(lastSlashIndex + 1);
  const encodedFileName = encodeURIComponent(fileName);
  const encodedUrl = baseUrl + encodedFileName;
  if (url.startsWith("/learn/")) {
    const processedUrl2 = `${SERVER_URL}/uploads/assets${url.substring(6)}`;
    console.log("转换/learn/路径:", processedUrl2);
    return processedUrl2;
  }
  if (url.startsWith("/uploads/")) {
    const processedUrl2 = `${SERVER_URL}${encodedUrl}`;
    console.log("添加服务器基础URL:", processedUrl2);
    return processedUrl2;
  }
  if (url.startsWith("/static/")) {
    const processedUrl2 = `${SERVER_URL}/uploads/assets${url.substring(14)}`;
    console.log("替换静态路径:", processedUrl2);
    return processedUrl2;
  }
  const processedUrl = `${SERVER_URL}${encodedUrl}`;
  console.log("默认处理:", processedUrl);
  return processedUrl;
};
const request = (url, method = "GET", data = {}) => {
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
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
  console.log(`调用API获取 ${title} 的小标题列表...`);
  return request(`/learning/headers?title=${encodeURIComponent(title)}`).then((response) => {
    console.log("获取小标题原始响应:", JSON.stringify(response, null, 2));
    if (response.status === "success" && response.data && Array.isArray(response.data)) {
      response.data.forEach((item, index) => {
        console.log(`
处理第 ${index + 1} 个小标题 [${item.subtitle}]`);
        if (item.image_url) {
          console.log(`  原始封面图: ${item.image_url}`);
          item.image_url = processImageUrl(item.image_url);
          console.log(`  处理后封面图: ${item.image_url}`);
        } else {
          console.log("  无封面图");
        }
        if (item.images && Array.isArray(item.images)) {
          console.log(`  原始图片数组 (${item.images.length}张): ${JSON.stringify(item.images)}`);
          item.images = item.images.map((url, i) => {
            const processed = processImageUrl(url);
            console.log(`    图片[${i + 1}]: ${url} -> ${processed}`);
            return processed;
          }).filter((url) => url);
          console.log(`  处理后图片数组 (${item.images.length}张): ${JSON.stringify(item.images)}`);
        } else {
          console.log("  原始图片数组: 不存在或非数组");
          item.images = item.image_url ? [item.image_url] : [];
          console.log(`  创建的图片数组: ${JSON.stringify(item.images)}`);
        }
      });
    } else {
      console.error("API返回无效响应:", response);
    }
    return response;
  }).catch((error) => {
    console.error("获取小标题列表失败:", error);
    throw error;
  });
};
const getLearningContent = (subtitle) => {
  console.log("调用API获取内容，小标题:", subtitle);
  return request(`/learning/content?subtitle=${encodeURIComponent(subtitle)}`).then((response) => {
    console.log("获取内容原始响应:", JSON.stringify(response, null, 2));
    if (response.status === "success" && response.data) {
      console.log(`
图片数组状态检查：`);
      console.log(`- response.data.images 是否存在: ${response.data.images ? "是" : "否"}`);
      if (response.data.images) {
        console.log(`- 是否为数组: ${Array.isArray(response.data.images) ? "是" : "否"}`);
        if (Array.isArray(response.data.images)) {
          console.log(`- 数组长度: ${response.data.images.length}`);
          console.log(`- 原始图片数组内容: ${JSON.stringify(response.data.images)}`);
        }
      }
      if (response.data.images && Array.isArray(response.data.images)) {
        const originalImages = [...response.data.images];
        response.data.images = response.data.images.map((url, index) => {
          console.log(`
处理第 ${index + 1}/${originalImages.length} 张图片:`);
          console.log(`- 原始URL: ${url}`);
          const processedUrl = processImageUrl(url);
          console.log(`- 处理后URL: ${processedUrl}`);
          return processedUrl;
        }).filter((url) => {
          const isValid = !!url;
          if (!isValid) {
            console.warn("- 发现无效URL，将被过滤");
          }
          return isValid;
        });
        console.log(`
处理后的图片数组 (${response.data.images.length}张): ${JSON.stringify(response.data.images)}`);
      } else {
        console.warn("返回的数据中没有图片数组或图片数组不是有效数组");
        response.data.images = [];
        console.log("已创建空图片数组");
      }
      console.log(`
内容数组状态检查：`);
      console.log(`- response.data.all_contents 是否存在: ${response.data.all_contents ? "是" : "否"}`);
      if (response.data.all_contents) {
        console.log(`- 是否为数组: ${Array.isArray(response.data.all_contents) ? "是" : "否"}`);
        if (Array.isArray(response.data.all_contents)) {
          console.log(`- 数组长度: ${response.data.all_contents.length}`);
          console.log(`- 内容标题: ${response.data.all_contents.map((item) => item.title).join(", ")}`);
          response.data.all_contents = response.data.all_contents.map((content) => {
            if (!content.title) {
              content.title = "未命名文档";
            }
            return content;
          });
        }
      } else {
        console.log("- 没有多内容数组，使用单一text_content");
        if (response.data.text_content) {
          response.data.all_contents = [{
            title: subtitle,
            content: response.data.text_content,
            source: "legacy"
          }];
          console.log(`- 已从text_content创建内容数组，长度: 1`);
        } else {
          response.data.all_contents = [];
          console.log(`- 创建了空内容数组`);
        }
      }
      console.log("处理后的完整响应数据结构:", JSON.stringify({
        images_count: response.data.images.length,
        contents_count: response.data.all_contents.length,
        content_titles: response.data.all_contents.map((c) => c.title)
      }, null, 2));
    } else {
      console.error("API返回错误或没有数据:", response);
    }
    return response;
  }).catch((error) => {
    console.error("API请求错误:", error);
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
exports.addComment = addComment;
exports.checkLiked = checkLiked;
exports.createOrder = createOrder;
exports.createPost = createPost;
exports.getAllProducts = getAllProducts;
exports.getHomeResources = getHomeResources;
exports.getLearningContent = getLearningContent;
exports.getLearningHeaders = getLearningHeaders;
exports.getMapResources = getMapResources;
exports.getPostDetail = getPostDetail;
exports.getPosts = getPosts;
exports.getProductCategories = getProductCategories;
exports.getProductDetail = getProductDetail;
exports.likePost = likePost;
exports.login = login;
exports.processImageUrl = processImageUrl;
exports.register = register;
