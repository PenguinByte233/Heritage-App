// api.js - 统一管理后端API接口调用

const BASE_URL = 'http://localhost:3001/api'; // 后端服务器地址
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

// 用户相关API
// 用户注册
export const register = (nickname, phone_number, password) => {
  return request('/users/register', 'POST', { nickname, phone_number, password });
};

// 用户登录
export const login = (phone_number, password) => {
  return request('/users/login', 'POST', { phone_number, password });
};

// 获取用户信息
export const getUserInfo = (userId) => {
  return request(`/users/${userId}`);
};

// 非遗学习相关API
// 获取所有大标题
export const getLearningTitles = () => {
  return request('/learning/titles');
};

// 获取大标题下的小标题及封面图
export const getLearningHeaders = (title) => {
  return request(`/learning/headers?title=${encodeURIComponent(title)}`);
};

// 获取小标题对应内容
export const getLearningContent = (subtitle) => {
  return request(`/learning/content?subtitle=${encodeURIComponent(subtitle)}`);
};

// 根据ID获取学习内容
export const getLearningById = (id) => {
  return request(`/learning/${id}`);
};

// 商品相关API
// 获取所有商品
export const getAllProducts = () => {
  return request('/products');
};

// 获取商品详情
export const getProductDetail = (id) => {
  return request(`/products/${id}`);
};

// 根据分类获取商品
export const getProductsByCategory = (category) => {
  return request(`/products/category/${encodeURIComponent(category)}`);
};

// 获取所有商品分类
export const getProductCategories = () => {
  return request('/products/categories/all');
};

// 订单相关API
// 创建订单
export const createOrder = (user_id, product_id, quantity) => {
  return request('/orders', 'POST', { user_id, product_id, quantity });
};

// 获取用户的所有订单
export const getUserOrders = (user_id) => {
  return request(`/orders/user/${user_id}`);
};

// 获取订单详情
export const getOrderDetail = (id) => {
  return request(`/orders/${id}`);
};

// 社区相关API
// 发布帖子
export const createPost = (author_name, content) => {
  return request('/community/post', 'POST', { author_name, content });
};

// 获取帖子列表
export const getPosts = () => {
  return request('/community/posts');
};

// 获取帖子详情
export const getPostDetail = (id) => {
  return request(`/community/post/${id}`);
};

// 添加评论
export const addComment = (post_id, author_name, content) => {
  return request('/community/comment', 'POST', { post_id, author_name, content });
};

// 点赞帖子
export const likePost = (post_id, user_id) => {
  return request('/community/like', 'POST', { post_id, user_id });
};

// 检查用户是否点赞
export const checkLiked = (post_id, user_id) => {
  return request(`/community/like/check?post_id=${post_id}&user_id=${user_id}`);
}; 