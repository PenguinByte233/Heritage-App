// api.js - 统一管理后端API接口调用

const BASE_URL = 'http://localhost:3001/api'; // 后端服务器地址
const SERVER_URL = 'http://localhost:3001'; // 服务器基础URL
// 生产环境请修改为实际服务器地址

// 处理图片URL，将/learn/开头的路径转换为/uploads/assets/
export const processImageUrl = (url) => {
  if (!url) return '';
  
  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 如果是相对路径，转换/learn/开头的路径
  if (url.startsWith('/learn/')) {
    return `${SERVER_URL}/uploads/assets${url.substring(6)}`;
  }
  
  // 其他情况，直接返回服务器URL加上路径
  return `${SERVER_URL}${url}`;
};

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
  console.log(`调用API获取 ${title} 的小标题列表...`);
  
  return request(`/learning/headers?title=${encodeURIComponent(title)}`).then(response => {
    console.log('获取小标题原始响应:', JSON.stringify(response, null, 2));
    
    // 处理返回的图片URL
    if (response.status === 'success' && response.data && Array.isArray(response.data)) {
      response.data.forEach((item, index) => {
        console.log(`\n处理第 ${index+1} 个小标题 [${item.subtitle}]`);
        
        // 处理单个封面图
        if (item.image_url) {
          console.log(`  原始封面图: ${item.image_url}`);
          item.image_url = processImageUrl(item.image_url);
          console.log(`  处理后封面图: ${item.image_url}`);
        } else {
          console.log('  无封面图');
        }
        
        // 处理图片数组
        if (item.images && Array.isArray(item.images)) {
          console.log(`  原始图片数组 (${item.images.length}张): ${JSON.stringify(item.images)}`);
          
          item.images = item.images.map((url, i) => {
            const processed = processImageUrl(url);
            console.log(`    图片[${i+1}]: ${url} -> ${processed}`);
            return processed;
          }).filter(url => url);
          
          console.log(`  处理后图片数组 (${item.images.length}张): ${JSON.stringify(item.images)}`);
        } else {
          console.log('  原始图片数组: 不存在或非数组');
          // 创建images数组，如果不存在
          item.images = item.image_url ? [item.image_url] : [];
          console.log(`  创建的图片数组: ${JSON.stringify(item.images)}`);
        }
      });
    } else {
      console.error('API返回无效响应:', response);
    }
    
    return response;
  }).catch(error => {
    console.error('获取小标题列表失败:', error);
    throw error;
  });
};

// 获取小标题对应内容
export const getLearningContent = (subtitle) => {
  console.log('调用API获取内容:', subtitle);
  return request(`/learning/content?subtitle=${encodeURIComponent(subtitle)}`).then(response => {
    console.log('获取内容原始响应:', response);
    // 处理返回的图片URL数组
    if (response.status === 'success' && response.data) {
      if (response.data.images && Array.isArray(response.data.images)) {
        // 确保每个URL都被正确处理
        response.data.images = response.data.images.map(url => {
          const processedUrl = processImageUrl(url);
          console.log(`处理图片URL: ${url} -> ${processedUrl}`);
          return processedUrl;
        }).filter(url => url); // 过滤掉空URL
      } else {
        console.warn('返回的数据中没有图片数组或图片数组为空');
      }
      console.log('处理后的响应数据:', response.data);
    } else {
      console.error('API返回错误或没有数据:', response);
    }
    return response;
  }).catch(error => {
    console.error('API请求错误:', error);
    throw error;
  });
};

// 根据ID获取学习内容
export const getLearningById = (id) => {
  return request(`/learning/${id}`).then(response => {
    // 处理返回的图片URL
    if (response.status === 'success' && response.data) {
      if (response.data.image_url) {
        response.data.image_url = processImageUrl(response.data.image_url);
      }
      if (response.data.images && Array.isArray(response.data.images)) {
        response.data.images = response.data.images.map(url => processImageUrl(url));
      }
    }
    return response;
  });
};

// 商品相关API
// 获取所有商品
export const getAllProducts = () => {
  return request('/products').then(response => {
    // 处理返回的商品图片URL
    if (response.status === 'success' && response.data && Array.isArray(response.data)) {
      response.data.forEach(product => {
        if (product.image_url) {
          product.image_url = processImageUrl(product.image_url);
        }
      });
    }
    return response;
  });
};

// 获取商品详情
export const getProductDetail = (id) => {
  return request(`/products/${id}`).then(response => {
    // 处理返回的商品图片URL
    if (response.status === 'success' && response.data) {
      if (response.data.image_url) {
        response.data.image_url = processImageUrl(response.data.image_url);
      }
      if (response.data.additional_images && Array.isArray(response.data.additional_images)) {
        response.data.additional_images = response.data.additional_images.map(url => processImageUrl(url));
      }
    }
    return response;
  });
};

// 根据分类获取商品
export const getProductsByCategory = (category) => {
  return request(`/products/category/${encodeURIComponent(category)}`).then(response => {
    // 处理返回的商品图片URL
    if (response.status === 'success' && response.data && Array.isArray(response.data)) {
      response.data.forEach(product => {
        if (product.image_url) {
          product.image_url = processImageUrl(product.image_url);
        }
      });
    }
    return response;
  });
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
  return request('/community/posts').then(response => {
    // 处理返回的帖子图片URL
    if (response.status === 'success' && response.data && Array.isArray(response.data)) {
      response.data.forEach(post => {
        if (post.image_url) {
          post.image_url = processImageUrl(post.image_url);
        }
      });
    }
    return response;
  });
};

// 获取帖子详情
export const getPostDetail = (id) => {
  return request(`/community/post/${id}`).then(response => {
    // 处理返回的帖子图片URL
    if (response.status === 'success' && response.data) {
      if (response.data.image_url) {
        response.data.image_url = processImageUrl(response.data.image_url);
      }
    }
    return response;
  });
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