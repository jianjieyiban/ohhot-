import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, message, Divider, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 直接使用loginIdentifier字段，后端验证中间件会自动处理
      const { loginIdentifier, password } = values;
      
      // 验证输入格式
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginIdentifier);
      const isPhone = /^1[3-9]\d{9}$/.test(loginIdentifier);
      
      if (!isEmail && !isPhone) {
        message.error('请输入有效的邮箱地址或手机号');
        setLoading(false);
        return;
      }
      
      // 统一使用loginIdentifier字段，后端验证中间件会自动处理
      const credentials = { loginIdentifier, password };
      
      const result = await login(loginIdentifier, password);
      
      // 检查登录结果
      if (result && result.success) {
        message.success('登录成功！');
        
        // 等待用户状态更新后再进行跳转
        setTimeout(() => {
          // 检查token和用户状态
          const token = localStorage.getItem('token');
          if (token) {
            // 确保跳转到正确的首页路径
            const targetPath = from && from !== '/' ? from : '/';
            navigate(targetPath, { replace: true });
          } else {
            // 如果没有token，说明登录失败，留在登录页
            message.error('登录状态异常，请重新登录');
          }
        }, 500); // 增加等待时间确保用户状态更新完成
      } else {
        message.error(result?.message || '登录失败，请检查邮箱/手机号和密码');
      }
    } catch (error) {
    message.error(error?.message || '登录失败，请检查网络连接');
  } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (type) => {
    let loginIdentifier = '';
    let password = '';
    let securityKey = null;
    
    switch (type) {
      case 'employer':
        loginIdentifier = 'testemployer@example.com'; // 使用已验证可用的企业测试账号
        password = '123456'; // 使用已验证的密码
        break;
      case 'jobseeker':
        loginIdentifier = '13800138001'; // 使用通用的求职者测试账号
        password = 'Password123'; // 使用通用密码
        break;
      case 'admin':
        loginIdentifier = 'admin@recruitment-system.com';
        password = 'admin123';
        securityKey = 'Admin@2024#Key'; // 添加安全密钥
        break;
      default:
        return;
    }
    
    form.setFieldsValue({ loginIdentifier, password });
    // 直接调用登录函数，而不是onFinish
    setLoading(true);
    
    // 验证输入格式
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginIdentifier);
    const isPhone = /^1[3-9]\d{9}$/.test(loginIdentifier);
    
    if (!isEmail && !isPhone) {
      message.error('请输入有效的邮箱地址或手机号');
      setLoading(false);
      return;
    }
    
    // 统一使用loginIdentifier字段，后端验证中间件会自动处理
    const credentials = { loginIdentifier, password };
    
    login(loginIdentifier, password, securityKey).then(result => {
      if (result.success) {
        message.success('登录成功！');
        
        // 等待用户状态更新后再进行跳转
        setTimeout(() => {
          // 检查token和用户状态
          const token = localStorage.getItem('token');
          if (token) {
            // 确保跳转到正确的首页路径
            const targetPath = from && from !== '/' ? from : '/';
            navigate(targetPath, { replace: true });
          } else {
            // 如果没有token，说明登录失败，留在登录页
            message.error('登录状态异常，请重新登录');
          }
        }, 300); // 增加等待时间确保用户状态更新完成
      } else {
        // 显示具体的错误信息
        const errorMessage = result.message || '登录失败，请检查账号和密码';
        message.error(errorMessage);
        console.log('快速体验登录失败:', result);
      }
    }).catch(error => {
      // 显示具体的错误信息，避免显示"登录已过期"等误导信息
      const errorMessage = error.message || '登录失败，请检查网络连接';
      message.error(errorMessage);
      console.log('快速体验登录异常:', error);
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" title="登录三石招聘">
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="loginIdentifier"
              rules={[
                { required: true, message: '请输入邮箱地址或手机号' },
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.resolve();
                    }
                    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                    const isPhone = /^1[3-9]\d{9}$/.test(value);
                    if (isEmail || isPhone) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('请输入有效的邮箱地址或手机号'));
                  }
                }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="邮箱地址或手机号"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位字符' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                className="auth-button"
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-links">
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Link to="/forgot-password">忘记密码？</Link>
              <div>
                还没有账号？<Link to="/register">立即注册</Link>
              </div>
            </Space>
          </div>

          <Divider>快速体验</Divider>

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button 
              type="dashed" 
              block 
              onClick={() => handleQuickLogin('employer')}
              className="quick-login-btn"
            >
              <UserOutlined /> 企业账号体验
            </Button>
            <Button 
              type="dashed" 
              block 
              onClick={() => handleQuickLogin('jobseeker')}
              className="quick-login-btn"
            >
              <UserOutlined /> 求职者账号体验
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default Login;