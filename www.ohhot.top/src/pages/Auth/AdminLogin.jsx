import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Divider } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const AdminLogin = () => {
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 获取重定向路径
  const from = location.state?.from || '/admin';

  // 登录成功后跳转到管理员后台
  useEffect(() => {
    if (user) {
      console.log('用户状态已更新:', user);
      console.log('用户类型:', user.user_type);
      
      // 检查用户类型是否为管理员
      if (user.user_type === 2) {
        console.log('管理员登录成功，跳转到管理员后台');
        navigate('/admin');
      } else {
        console.log('非管理员用户尝试登录，用户类型:', user.user_type);
        message.error('您不是管理员，无法访问管理员后台');
        logout();
        navigate('/login');
      }
    }
  }, [user, navigate, logout]);

  const onFinish = async (values) => {
    const { email, password, securityKey } = values;
    
    // 验证安全密钥
    if (securityKey !== 'Admin@2024#Key') {
      message.error('安全密钥错误，无权访问管理后台');
      return;
    }
    
    setLoading(true);
    try {
      console.log('开始管理员登录流程...');
      // 使用email作为loginIdentifier参数
      const response = await login(email, password, securityKey);
      
      console.log('登录响应完整结构:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        // 登录成功，useEffect会自动处理跳转
        message.success('登录成功');
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error) {
      console.error('登录错误:', error);
      message.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card admin-login-card" title={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              三石招聘 - 管理后台
            </div>
            <div style={{ fontSize: '16px', color: '#666', marginTop: '8px' }}>
              管理员登录
            </div>
          </div>
        }>
          <Form
            form={form}
            name="adminLogin"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入管理员邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="管理员邮箱地址"
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

            <Form.Item
              name="securityKey"
              rules={[
                { required: true, message: '请输入安全密钥!' },
                { min: 6, message: '安全密钥至少6位字符!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="安全密钥"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                className="auth-button admin-login-btn"
              >
                管理员登录
              </Button>
            </Form.Item>
          </Form>

          <Divider>管理员账号</Divider>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link to="/login" style={{ color: '#1890ff' }}>
              <ArrowLeftOutlined /> 返回普通用户登录
            </Link>
          </div>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
            请使用专属管理员账号登录
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;