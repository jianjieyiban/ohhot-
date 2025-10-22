import axios from 'axios';

/**
 * 网站诊断测试脚本
 * 用于检查前后端连接问题
 */

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(url, description) {
  try {
    log('blue', `\n测试: ${description}`);
    log('yellow', `URL: ${url}`);
    
    const startTime = Date.now();
    const response = await axios.get(url, {
      timeout: 5000,
      validateStatus: () => true // 接受所有状态码
    });
    const duration = Date.now() - startTime;
    
    if (response.status >= 200 && response.status < 300) {
      log('green', `✅ 成功 (${response.status}) - ${duration}ms`);
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      log('red', `❌ 失败 (${response.status}) - ${duration}ms`);
      console.log('错误响应:', response.data);
      return false;
    }
  } catch (error) {
    log('red', `❌ 请求失败: ${error.message}`);
    if (error.code) {
      log('yellow', `错误代码: ${error.code}`);
    }
    return false;
  }
}

async function runDiagnostics() {
  log('blue', '========================================');
  log('blue', '   网站诊断测试');
  log('blue', '========================================');

  const tests = [
    {
      url: 'http://localhost:5000/health',
      description: '本地后端健康检查 (HTTP)'
    },
    {
      url: 'http://localhost:5000/api/cities/hot',
      description: '本地后端 API 测试 (HTTP)'
    },
    {
      url: 'https://www.ohhot.top/',
      description: '前端网站 (HTTPS)'
    },
    {
      url: 'https://www.ohhot.top/health',
      description: '生产环境健康检查 (HTTPS via Nginx)'
    },
    {
      url: 'https://www.ohhot.top/api/cities/hot',
      description: '生产环境 API 测试 (HTTPS via Nginx)'
    }
  ];

  const results = [];
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.description);
    results.push({ ...test, passed: result });
  }

  // 总结报告
  log('blue', '\n========================================');
  log('blue', '   测试总结');
  log('blue', '========================================');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach((result, index) => {
    const status = result.passed ? '✅ 通过' : '❌ 失败';
    const color = result.passed ? 'green' : 'red';
    log(color, `${index + 1}. ${status} - ${result.description}`);
  });

  log('blue', `\n总计: ${passed}/${total} 测试通过`);

  // 诊断建议
  log('yellow', '\n========================================');
  log('yellow', '   诊断建议');
  log('yellow', '========================================');

  if (!results[0].passed && !results[1].passed) {
    log('red', '❌ 后端服务未运行或端口错误');
    log('yellow', '建议：');
    log('yellow', '1. 检查后端服务是否启动：pm2 status');
    log('yellow', '2. 启动后端服务：cd backend && pm2 start server.js --name ohhot-backend');
    log('yellow', '3. 检查端口5000是否被占用：netstat -ano | findstr :5000');
  }

  if (!results[2].passed) {
    log('red', '❌ 前端网站无法访问');
    log('yellow', '建议：');
    log('yellow', '1. 检查 Nginx 是否运行');
    log('yellow', '2. 检查 SSL 证书是否配置正确');
    log('yellow', '3. 检查防火墙是否开放 443 端口');
  }

  if (!results[3].passed || !results[4].passed) {
    log('red', '❌ Nginx 反向代理配置可能有问题');
    log('yellow', '建议：');
    log('yellow', '1. 在宝塔面板配置 Nginx 反向代理（参考诊断问题.md）');
    log('yellow', '2. 确保后端服务运行在 localhost:5000');
    log('yellow', '3. 重启 Nginx：nginx -s reload');
  }

  if (results[0].passed && results[1].passed && !results[4].passed) {
    log('yellow', '⚠️ 后端服务正常，但通过 HTTPS 无法访问');
    log('yellow', '这表明 Nginx 反向代理配置需要添加，请参考 诊断问题.md 文件');
  }
}

// 运行诊断
runDiagnostics().catch(error => {
  log('red', `诊断过程出错: ${error.message}`);
  process.exit(1);
});
