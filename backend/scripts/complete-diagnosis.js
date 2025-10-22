#!/usr/bin/env node

/**
 * 完整的网站诊断脚本
 * 检查数据库连接、后端服务、前端配置等
 */

import axios from 'axios';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message, prefix = '') {
  console.log(`${colors[color]}${prefix}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log('cyan', title, colors.bold);
  console.log('='.repeat(60) + '\n');
}

// 1. 检查环境变量
async function checkEnvironment() {
  section('1. 检查环境变量');
  
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    log('red', '❌ .env 文件不存在');
    return false;
  }
  
  log('green', '✅ .env 文件存在');
  
  // 读取 .env 文件
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  // 检查关键变量
  const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'PORT', 'JWT_SECRET'];
  const missing = [];
  
  requiredVars.forEach(varName => {
    if (!envVars[varName]) {
      missing.push(varName);
      log('red', `❌ 缺少环境变量: ${varName}`);
    } else {
      const displayValue = varName.includes('PASSWORD') || varName.includes('SECRET') 
        ? '*'.repeat(envVars[varName].length) 
        : envVars[varName];
      log('green', `✅ ${varName} = ${displayValue}`);
    }
  });
  
  return missing.length === 0;
}

// 2. 检查数据库连接
async function checkDatabase() {
  section('2. 检查数据库连接');
  
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'ohhot_user',
    password: process.env.DB_PASSWORD || '970829',
    database: process.env.DB_NAME || 'lw',
    charset: 'utf8mb4'
  };
  
  log('blue', '数据库配置：');
  console.log(`  Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`  User: ${dbConfig.user}`);
  console.log(`  Database: ${dbConfig.database}`);
  console.log(`  Password: ${'*'.repeat(dbConfig.password.length)}`);
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    log('green', '\n✅ 数据库连接成功');
    
    // 测试查询
    const [rows] = await connection.execute('SELECT 1 as test');
    log('green', '✅ 数据库查询测试通过');
    
    // 检查表
    const [tables] = await connection.execute('SHOW TABLES');
    log('green', `✅ 数据库共有 ${tables.length} 个表`);
    
    if (tables.length > 0) {
      log('blue', '\n表列表：');
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`  ${index + 1}. ${tableName}`);
      });
    } else {
      log('yellow', '⚠️ 数据库中没有表，需要初始化数据库');
      log('yellow', '   执行：node scripts/init-database.js');
    }
    
    await connection.end();
    return true;
  } catch (error) {
    log('red', '\n❌ 数据库连接失败');
    log('red', `   错误: ${error.message}`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      log('yellow', '\n💡 建议：');
      log('yellow', '   1. 检查数据库用户名和密码是否正确');
      log('yellow', '   2. 确认数据库用户有访问权限');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      log('yellow', '\n💡 建议：');
      log('yellow', '   1. 数据库不存在，需要在宝塔面板创建数据库');
      log('yellow', `   2. 数据库名：${dbConfig.database}`);
    } else if (error.code === 'ECONNREFUSED') {
      log('yellow', '\n💡 建议：');
      log('yellow', '   1. MySQL 服务可能未启动');
      log('yellow', '   2. 检查 MySQL 是否运行：systemctl status mysql');
    }
    
    return false;
  }
}

// 3. 检查后端服务
async function checkBackendService() {
  section('3. 检查后端服务');
  
  const port = process.env.PORT || 5000;
  const healthUrl = `http://localhost:${port}/health`;
  
  log('blue', `检查后端健康检查端点：${healthUrl}`);
  
  try {
    const response = await axios.get(healthUrl, { timeout: 5000 });
    log('green', '\n✅ 后端服务运行正常');
    log('blue', '响应数据：');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    log('red', '\n❌ 后端服务无法访问');
    
    if (error.code === 'ECONNREFUSED') {
      log('yellow', '\n💡 建议：');
      log('yellow', '   1. 后端服务未启动');
      log('yellow', '   2. 启动命令：pm2 start server.js --name ohhot-backend');
      log('yellow', '   3. 查看状态：pm2 status');
      log('yellow', '   4. 查看日志：pm2 logs ohhot-backend');
    } else if (error.code === 'ETIMEDOUT') {
      log('yellow', '\n💡 建议：');
      log('yellow', '   1. 后端服务响应超时');
      log('yellow', '   2. 检查数据库连接是否正常');
      log('yellow', '   3. 查看后端日志：pm2 logs ohhot-backend');
    } else {
      log('yellow', `\n   错误: ${error.message}`);
    }
    
    return false;
  }
}

// 4. 检查 Nginx 代理
async function checkNginxProxy() {
  section('4. 检查 Nginx 反向代理');
  
  const healthUrl = 'https://www.ohhot.top/health';
  
  log('blue', `检查通过 Nginx 访问：${healthUrl}`);
  
  try {
    const response = await axios.get(healthUrl, { 
      timeout: 10000,
      validateStatus: () => true
    });
    
    if (response.status === 200) {
      log('green', '\n✅ Nginx 反向代理配置正确');
      log('blue', '响应数据：');
      console.log(JSON.stringify(response.data, null, 2));
      return true;
    } else {
      log('red', `\n❌ Nginx 返回状态码：${response.status}`);
      return false;
    }
  } catch (error) {
    log('red', '\n❌ 无法通过 Nginx 访问后端');
    log('yellow', '\n💡 建议：');
    log('yellow', '   1. 检查 Nginx 配置中的反向代理设置');
    log('yellow', '   2. 确保配置了：location /api/ { proxy_pass http://127.0.0.1:5000/api/; }');
    log('yellow', '   3. 确保配置了：location /health { proxy_pass http://127.0.0.1:5000/health; }');
    log('yellow', '   4. 重启 Nginx：nginx -s reload');
    return false;
  }
}

// 5. 检查 API 端点
async function checkAPIEndpoints() {
  section('5. 检查 API 端点');
  
  const endpoints = [
    { url: 'https://www.ohhot.top/api/cities/hot', description: '热门城市' },
    { url: 'https://www.ohhot.top/api', description: 'API 文档' }
  ];
  
  let allPassed = true;
  
  for (const endpoint of endpoints) {
    log('blue', `\n测试：${endpoint.description}`);
    log('blue', `URL: ${endpoint.url}`);
    
    try {
      const response = await axios.get(endpoint.url, { 
        timeout: 10000,
        validateStatus: () => true 
      });
      
      if (response.status === 200) {
        log('green', `✅ 成功 (${response.status})`);
        if (endpoint.url.includes('/api/cities/hot')) {
          const data = response.data.data || response.data;
          if (Array.isArray(data) && data.length > 0) {
            log('green', `   返回 ${data.length} 个城市`);
          }
        }
      } else {
        log('red', `❌ 失败 (${response.status})`);
        allPassed = false;
      }
    } catch (error) {
      log('red', `❌ 请求失败: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// 6. 检查前端配置
async function checkFrontendConfig() {
  section('6. 检查前端配置');
  
  const frontendEnvPath = path.join(__dirname, '..', '..', 'www.ohhot.top', '.env.production');
  
  if (!fs.existsSync(frontendEnvPath)) {
    log('red', '❌ 前端 .env.production 文件不存在');
    return false;
  }
  
  log('green', '✅ .env.production 文件存在');
  
  const envContent = fs.readFileSync(frontendEnvPath, 'utf-8');
  const apiBaseUrl = envContent.match(/VITE_API_BASE_URL=(.+)/);
  
  if (apiBaseUrl) {
    const url = apiBaseUrl[1].trim();
    log('blue', `\nAPI 基础地址：${url}`);
    
    if (url.startsWith('https://')) {
      log('green', '✅ 使用 HTTPS 协议');
    } else {
      log('yellow', '⚠️ 未使用 HTTPS 协议，可能导致混合内容问题');
    }
    
    if (url.includes('www.ohhot.top')) {
      log('green', '✅ API 地址配置正确');
    } else {
      log('yellow', '⚠️ API 地址可能配置错误');
      log('yellow', '   应该是：https://www.ohhot.top/api');
    }
  }
  
  // 检查 dist 目录
  const distPath = path.join(__dirname, '..', '..', 'www.ohhot.top', 'dist');
  if (fs.existsSync(distPath)) {
    log('green', '\n✅ 前端已构建（dist 目录存在）');
    
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      log('green', '✅ index.html 存在');
    } else {
      log('red', '❌ index.html 不存在，需要重新构建');
      log('yellow', '   执行：cd /www/wwwroot/www.ohhot.top && npm run build');
    }
  } else {
    log('yellow', '\n⚠️ 前端未构建（dist 目录不存在）');
    log('yellow', '   执行：cd /www/wwwroot/www.ohhot.top && npm run build');
  }
  
  return true;
}

// 7. 生成诊断报告
function generateReport(results) {
  section('诊断报告总结');
  
  const checks = [
    { name: '环境变量', result: results.env },
    { name: '数据库连接', result: results.database },
    { name: '后端服务', result: results.backend },
    { name: 'Nginx 代理', result: results.nginx },
    { name: 'API 端点', result: results.api },
    { name: '前端配置', result: results.frontend }
  ];
  
  let passedCount = 0;
  let totalCount = checks.length;
  
  checks.forEach((check, index) => {
    const status = check.result ? '✅ 通过' : '❌ 失败';
    const color = check.result ? 'green' : 'red';
    log(color, `${index + 1}. ${status} - ${check.name}`);
    if (check.result) passedCount++;
  });
  
  console.log('\n' + '-'.repeat(60));
  
  if (passedCount === totalCount) {
    log('green', `\n🎉 恭喜！所有检查都通过了 (${passedCount}/${totalCount})`);
    log('green', '\n网站应该可以正常运行了！');
    log('blue', '\n访问地址：https://www.ohhot.top/');
  } else {
    log('yellow', `\n⚠️ 有 ${totalCount - passedCount} 项检查未通过`);
    log('yellow', '\n请根据上面的建议逐项修复问题');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// 主函数
async function main() {
  log('cyan', '\n' + '█'.repeat(60), colors.bold);
  log('cyan', '          网站完整诊断工具', colors.bold);
  log('cyan', '█'.repeat(60) + '\n', colors.bold);
  
  const results = {};
  
  // 执行所有检查
  results.env = await checkEnvironment();
  results.database = await checkDatabase();
  results.backend = await checkBackendService();
  results.nginx = await checkNginxProxy();
  results.api = await checkAPIEndpoints();
  results.frontend = await checkFrontendConfig();
  
  // 生成报告
  generateReport(results);
}

// 运行诊断
main().catch(error => {
  log('red', `\n❌ 诊断过程出错: ${error.message}`);
  console.error(error);
  process.exit(1);
});
