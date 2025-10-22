const http = require('http');

// 测试用户注册功能
const testRegistration = () => {
  const postData = JSON.stringify({
    username: 'testuser999',
    email: 'uniqueuser@example.com',  // 使用全新的邮箱
    phone: '13912345678',             // 使用全新的手机号
    password: 'Test123456',
    user_type: 'job_seeker',
    cityId: 33
  });

  const options = {
    hostname: 'localhost',
    port: 5001,  // 使用端口5001
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('注册请求状态码:', res.statusCode);
    
    let data = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('注册响应数据:', data);
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.success) {
          console.log('✅ 注册成功！');
          console.log('用户ID:', jsonData.data.user.id);
          console.log('用户类型:', jsonData.data.user.user_type);
          
          // 注册成功后，尝试登录
          testLogin(jsonData.data.user.email, 'Test123456');
        } else {
          console.log('❌ 注册失败:', jsonData.message);
        }
      } catch (e) {
        console.log('❌ 解析注册响应失败:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error('注册请求失败:', e.message);
  });

  req.write(postData);
  req.end();
};

// 测试用户登录功能
const testLogin = (email, password) => {
  console.log('\n开始测试登录功能...');
  
  const postData = JSON.stringify({
    loginIdentifier: email,
    password: password
  });

  const options = {
    hostname: 'localhost',
    port: 5001,  // 使用端口5001
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('登录请求状态码:', res.statusCode);
    
    let data = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('登录响应数据:', data);
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.success) {
          console.log('✅ 登录成功！');
          console.log('用户类型:', jsonData.data.user.user_type);
          
          // 解析JWT token
          const token = jsonData.data.token;
          const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          console.log('Token过期时间:', new Date(decoded.exp * 1000));
        } else {
          console.log('❌ 登录失败:', jsonData.message);
        }
      } catch (e) {
        console.log('❌ 解析登录响应失败:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error('登录请求失败:', e.message);
  });

  req.write(postData);
  req.end();
};

// 检查服务器是否运行
const checkServer = () => {
  const options = {
    hostname: 'localhost',
    port: 5001,  // 使用端口5001
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('服务器状态检查:', res.statusCode);
    if (res.statusCode === 200) {
      console.log('✅ 服务器运行正常，开始测试注册功能...');
      testRegistration();
    } else {
      console.log('❌ 服务器状态异常');
    }
  });

  req.on('error', (e) => {
    console.error('❌ 无法连接到服务器:', e.message);
    console.log('请确保后端服务器在端口5001上运行');
  });

  req.end();
};

// 开始测试
console.log('检查服务器状态...');
checkServer();