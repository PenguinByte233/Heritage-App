// 应用配置文件 - 用于管理不同环境的配置

// 获取当前IP地址的辅助函数
const getNetworkIP = () => {
  let ip = '192.168.1.100'; // 默认IP，确保有一个可用值
  
  try {
    // 获取网络信息
    const networkType = uni.getNetworkType();
    console.log('当前网络类型:', networkType);
    
    // 获取系统信息
    const systemInfo = uni.getSystemInfoSync();
    console.log('当前系统信息:', systemInfo.platform);
    
    // 在不同环境下自动检测IP是未来可能实现的功能
    // 目前需要手动设置真实的局域网IP
  } catch (error) {
    console.error('获取网络信息失败:', error);
  }
  
  return ip;
};

// 环境配置
const config = {
  // 开发环境配置
  develop: {
    // 本地开发服务器地址(模拟器访问)
    localhost: {
      BASE_API_URL: 'http://localhost:3001/api',
      SERVER_URL: 'http://localhost:3001'
    },
    // 局域网开发服务器地址(真机访问)
    network: {
      BASE_API_URL: `http://${getNetworkIP()}:3001/api`,
      SERVER_URL: `http://${getNetworkIP()}:3001`
    }
  },
  
  // 测试环境配置
  trial: {
    BASE_API_URL: 'http://your-staging-server.com/api',
    SERVER_URL: 'http://your-staging-server.com'
  },
  
  // 生产环境配置
  release: {
    BASE_API_URL: 'https://your-production-server.com/api',
    SERVER_URL: 'https://your-production-server.com'
  }
};

// 获取当前环境
const getCurrentEnv = () => {
  try {
    const accountInfo = uni.getAccountInfoSync();
    return accountInfo.miniProgram ? accountInfo.miniProgram.envVersion : 'develop';
  } catch (error) {
    console.error('获取环境信息失败:', error);
    return 'develop'; // 默认返回开发环境
  }
};

// 判断是否为真机
const isRealDevice = () => {
  try {
    // 在真机上运行时，platform一般为android或ios
    const platform = uni.getSystemInfoSync().platform;
    return platform === 'android' || platform === 'ios';
  } catch (error) {
    console.error('获取平台信息失败:', error);
    return false; // 默认假设不是真机
  }
};

// 导出当前环境的配置
const currentEnv = getCurrentEnv();
console.log('当前运行环境:', currentEnv);

// 在开发环境中，根据是否真机选择不同的配置
const exportConfig = currentEnv === 'develop' 
  ? (isRealDevice() ? config.develop.network : config.develop.localhost)
  : config[currentEnv];

console.log('当前使用的API配置:', exportConfig);

export default exportConfig; 