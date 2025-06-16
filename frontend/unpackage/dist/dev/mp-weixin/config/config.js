"use strict";
const common_vendor = require("../common/vendor.js");
const getNetworkIP = () => {
  let ip = "192.168.1.105";
  try {
    const networkType = common_vendor.index.getNetworkType();
    console.log("当前网络类型:", networkType);
    const systemInfo = common_vendor.index.getSystemInfoSync();
    console.log("当前系统信息:", systemInfo.platform);
  } catch (error) {
    console.error("获取网络信息失败:", error);
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
    const accountInfo = common_vendor.index.getAccountInfoSync();
    return accountInfo.miniProgram ? accountInfo.miniProgram.envVersion : "develop";
  } catch (error) {
    console.error("获取环境信息失败:", error);
    return "develop";
  }
};
const isRealDevice = () => {
  try {
    const platform = common_vendor.index.getSystemInfoSync().platform;
    return platform === "android" || platform === "ios";
  } catch (error) {
    console.error("获取平台信息失败:", error);
    return false;
  }
};
const currentEnv = getCurrentEnv();
console.log("当前运行环境:", currentEnv);
const exportConfig = currentEnv === "develop" ? isRealDevice() ? config.develop.network : config.develop.localhost : config[currentEnv];
console.log("当前使用的API配置:", exportConfig);
exports.exportConfig = exportConfig;
