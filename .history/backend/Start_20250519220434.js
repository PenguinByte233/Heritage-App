/**
 * 非遗小程序后端启动脚本
 * 用于便捷地启动后端服务
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 创建用户输入接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 检查环境
console.log('正在检查环境配置...');

// 检查数据库配置文件是否存在
const dbConfigPath = path.join(__dirname, 'config', 'db.config.js');
if (!fs.existsSync(dbConfigPath)) {
  console.error('错误: 数据库配置文件不存在，请确保 config/db.config.js 文件已创建');
  process.exit(1);
}

// 检查node_modules是否存在
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('未检测到依赖库，正在尝试安装依赖...');
  
  // 询问用户是否要安装依赖
  rl.question('未检测到依赖库，是否安装所有依赖？(y/n) ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log('正在安装依赖，请稍候...');
      exec('npm install', { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
          console.error(`安装依赖时出错: ${error.message}`);
          rl.close();
          process.exit(1);
        }
        console.log('依赖安装完成！');
        startServer();
      });
    } else {
      console.log('跳过依赖安装，尝试直接启动服务...');
      startServer();
    }
  });
} else {
  // 显示菜单
  showMenu();
}

// 显示主菜单
function showMenu() {
  console.log('\n非遗小程序后端启动菜单:');
  console.log('1. 启动后端服务 (开发模式 - 自动重载)');
  console.log('2. 启动后端服务 (生产模式)');
  console.log('3. 初始化数据库数据');
  console.log('4. 检查并安装依赖');
  console.log('5. 退出');
  
  rl.question('请选择操作 (1-5): ', (choice) => {
    switch(choice) {
      case '1':
        startDevServer();
        break;
      case '2':
        startProductionServer();
        break;
      case '3':
        initializeDatabase();
        break;
      case '4':
        installDependencies();
        break;
      case '5':
        console.log('退出程序...');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('无效的选择，请重新选择');
        showMenu();
    }
  });
}

// 开发模式启动服务器
function startDevServer() {
  console.log('正在启动后端服务 (开发模式)...');
  
  // 检查是否安装了nodemon
  try {
    const nodemonPath = path.join(__dirname, 'node_modules', '.bin', 'nodemon');
    if (fs.existsSync(nodemonPath)) {
      const server = exec('npm run dev', { cwd: __dirname });
      
      server.stdout.on('data', (data) => {
        console.log(data.toString().trim());
      });
      
      server.stderr.on('data', (data) => {
        console.error(data.toString().trim());
      });
      
      console.log('开发服务器已启动，按 Ctrl+C 停止服务...');
    } else {
      console.log('未检测到 nodemon，使用标准模式启动...');
      startProductionServer();
    }
  } catch (error) {
    console.error(`启动开发服务器时出错: ${error.message}`);
    rl.close();
  }
}

// 生产模式启动服务器
function startProductionServer() {
  console.log('正在启动后端服务 (生产模式)...');
  
  const server = exec('node app.js', { cwd: __dirname });
  
  server.stdout.on('data', (data) => {
    console.log(data.toString().trim());
  });
  
  server.stderr.on('data', (data) => {
    console.error(data.toString().trim());
  });
  
  console.log('服务器已启动，按 Ctrl+C 停止服务...');
}

// 初始化数据库
function initializeDatabase() {
  console.log('正在准备初始化数据库...');
  
  rl.question('这将清空并重新初始化所有表数据，确定继续吗？(y/n) ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log('开始初始化数据库...');
      
      const init = exec('node scripts/inserAllData.js', { cwd: __dirname });
      
      init.stdout.on('data', (data) => {
        console.log(data.toString().trim());
      });
      
      init.stderr.on('data', (data) => {
        console.error(data.toString().trim());
      });
      
      init.on('close', (code) => {
        console.log(`数据库初始化完成，退出代码: ${code}`);
        showMenu();
      });
    } else {
      console.log('已取消数据库初始化');
      showMenu();
    }
  });
}

// 安装依赖
function installDependencies() {
  console.log('正在安装项目依赖...');
  
  const install = exec('npm install', { cwd: __dirname });
  
  install.stdout.on('data', (data) => {
    console.log(data.toString().trim());
  });
  
  install.stderr.on('data', (data) => {
    console.error(data.toString().trim());
  });
  
  install.on('close', (code) => {
    console.log(`依赖安装完成，退出代码: ${code}`);
    showMenu();
  });
}

// 通用启动服务器函数
function startServer() {
  // 加载服务器启动选项
  showMenu();
}

// 处理程序退出
process.on('SIGINT', () => {
  console.log('\n正在关闭服务...');
  rl.close();
  process.exit(0);
});
