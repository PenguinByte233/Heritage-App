const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * 确保上传目录存在
 * @param {string} dir 目录路径
 */
function createUploadDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 基础上传配置
const baseUploadPath = process.env.UPLOAD_PATH || 'uploads';

// 确保基础上传目录存在
createUploadDir(path.join(__dirname, '..', baseUploadPath));

// 为各种类型的文件创建专门的目录
const uploadPaths = {
  avatar: path.join(baseUploadPath, 'avatars'),
  product: path.join(baseUploadPath, 'products'),
  tutorial: path.join(baseUploadPath, 'tutorials'),
  post: path.join(baseUploadPath, 'posts'),
  heritage: path.join(baseUploadPath, 'heritage')
};

// 确保所有上传目录存在
Object.values(uploadPaths).forEach(dir => {
  createUploadDir(path.join(__dirname, '..', dir));
});

// 获取文件类型的存储配置
const getStorage = (type) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', uploadPaths[type] || baseUploadPath);
      createUploadDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // 生成唯一文件名：时间戳+随机数+原始扩展名
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  });
};

// 图片文件过滤器
const imageFilter = (req, file, cb) => {
  // 检查文件类型是否为图片
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return cb(new Error('只允许上传图片文件!'), false);
  }
  cb(null, true);
};

// 创建各种类型的上传中间件
const uploadAvatar = multer({
  storage: getStorage('avatar'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

const uploadProduct = multer({
  storage: getStorage('product'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

const uploadTutorial = multer({
  storage: getStorage('tutorial'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

const uploadPost = multer({
  storage: getStorage('post'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

const uploadHeritage = multer({
  storage: getStorage('heritage'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

/**
 * 获取文件的URL
 * @param {object} file 上传的文件对象
 * @param {string} type 文件类型
 * @returns {string} 文件URL
 */
const getFileUrl = (file, type) => {
  // 使用相对路径，前端可以根据API服务器地址拼接完整URL
  const relativePath = path.join('/', uploadPaths[type] || baseUploadPath, file.filename);
  // 替换Windows路径分隔符为URL路径分隔符
  return relativePath.replace(/\\/g, '/');
};

module.exports = {
  uploadAvatar,
  uploadProduct,
  uploadTutorial,
  uploadPost,
  uploadHeritage,
  getFileUrl
}; 