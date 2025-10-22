import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { testConnection, syncDatabase } from './models/index.js';
import './models/associations.js';

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// 优雅关闭处理
const gracefulShutdown = (signal) => {
  console.log(`\n收到 ${signal} 信号，开始优雅关闭...`);
  
  // 给现有请求一些时间完成
  setTimeout(() => {
    console.log('服务器关闭完成');
    process.exit(0);
  }, 5000);
};

// 监听退出信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    console.log('正在连接数据库...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.warn('⚠️ 数据库连接失败，服务器将以只读模式启动');
      console.warn('⚠️ 部分功能（如职位发布、用户注册等）将不可用');
      // 不退出进程，继续启动服务器
    } else {
      console.log('✅ 数据库连接成功');
      
      // 同步数据库表结构
      console.log('正在同步数据库表结构...');
      const dbSynced = await syncDatabase(false);
      
      if (!dbSynced) {
        console.error('数据库同步失败');
        process.exit(1);
      }
      
      console.log('✅ 数据库表结构同步成功');
    }
    
    // 启动HTTP服务器
    const server = app.listen(PORT, HOST, () => {
      console.log('🚀 三石招聘系统服务器已启动');
      console.log(`📍 服务器地址: http://${HOST}:${PORT}`);
      console.log(`🌐 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
      console.log('');
      console.log('📋 可用端点:');
      console.log(`  健康检查: http://${HOST}:${PORT}/health`);
      console.log(`  API文档: http://${HOST}:${PORT}/api`);
      console.log(`  认证接口: http://${HOST}:${PORT}/api/auth`);
      console.log(`  职位接口: http://${HOST}:${PORT}/api/jobs`);
      console.log(`  城市接口: http://${HOST}:${PORT}/api/cities`);
      console.log('');
    });

    // 服务器错误处理
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT} 已被占用，请使用其他端口`);
      } else {
        console.error('服务器错误:', error);
      }
      process.exit(1);
    });

    // 设置服务器超时
    server.timeout = 30000; // 30秒超时
    
    // 保持活动超时
    server.keepAliveTimeout = 120000; // 2分钟
    server.headersTimeout = 125000; // 比keepAliveTimeout多5秒

  } catch (error) {
    console.error('启动服务器时发生错误:', error);
    process.exit(1);
  }
}

// 直接启动服务器
startServer();

export { startServer };