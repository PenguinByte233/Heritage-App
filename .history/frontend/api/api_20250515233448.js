// api.js - 统一管理后端API接口调用

const BASE_URL = 'http://localhost:3000/api'; // 后端服务器地址
// 生产环境请修改为实际服务器地址

// 封装请求方法
const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json'
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

// 获取非遗大类列表
export const getHeritageTypes = () => {
  return request('/heritage-types');
};

// 获取子类列表
export const getCategories = (typeId) => {
  return request(`/categories?typeId=${typeId}`);
};

// 获取商品列表
export const getProducts = (categoryId) => {
  return request(`/products?categoryId=${categoryId}`);
};

// 获取商品详情
export const getProductDetail = (id) => {
  return request(`/products/${id}`);
};

// 创建订单
export const createOrder = (userId, productIds) => {
  return request('/orders', 'POST', { userId, productIds });
};

// 获取订单列表
export const getOrders = (userId) => {
  return request(`/orders?userId=${userId}`);
};

// 获取教程列表
export const getTutorials = (categoryId) => {
  return request(`/tutorials?categoryId=${categoryId}`);
};

// 获取帖子列表
export const getPosts = (page = 1, size = 10) => {
  return request(`/posts?page=${page}&size=${size}`);
};

// 发布帖子
export const createPost = (userId, title, content) => {
  return request('/posts', 'POST', { userId, title, content });
};

// 微信登录
export const wxLogin = (code) => {
  return request('/users/login', 'POST', { code });
}; 