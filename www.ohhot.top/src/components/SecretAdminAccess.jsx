import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SecretAdminAccess = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    const { email, password, securityKey } = values;
    
    // 验证安全密钥
    if (securityKey !== 'Admin@2024#Key') {
      message.error('安全密钥错误，无权访问管理后台');
      return;
    }
    
    setLoading(true);
    try {
      const response = await login(email, password, securityKey);
      
      if (response.success) {
        // 检查是否是管理员
        if (response.data.user.user_type === 2) {
          message.success('管理员登录成功');
          setVisible(false);
          navigate('/admin');
        } else {
          message.error('您不是管理员，无权访问管理后台');
        }
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

  // 快速登录
  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      const email = 'admin@recruitment-system.com';
      const password = 'admin123';
      const securityKey = 'Admin@2024#Key';
      
      const response = await login(email, password, securityKey);
      
      if (response.success) {
        if (response.data.user.user_type === 2) {
          message.success('管理员登录成功');
          setVisible(false);
          navigate('/admin');
        } else {
          message.error('您不是管理员，无权访问管理后台');
        }
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
    <>
      {/* 隐藏的触发按钮，通过特定操作序列触发 */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          width: '20px', 
          height: '20px', 
          backgroundColor: 'transparent',
          cursor: 'default',
          zIndex: -1
        }}
        onClick={(e) => {
          // 通过连续点击5次触发管理员登录
          if (!window.adminClickCount) window.adminClickCount = 0;
          window.adminClickCount++;
          
          if (window.adminClickCount >= 5) {
            showModal();
            window.adminClickCount = 0;
          }
          
          // 3秒后重置计数
          setTimeout(() => {
            window.adminClickCount = 0;
          }, 3000);
        }}
      />
      
      <Modal
        title="管理员安全登录"
        open={visible}
        onCancel={handleCancel}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          name="admin_login"
          onFinish={onFinish}
          scrollToFirstError
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入管理员邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="管理员邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
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
              size="large"
            >
              登录管理后台
            </Button>
          </Form.Item>
          
          <Form.Item>
            <div style={{ textAlign: 'center' }}>
              <Button type="link" size="small" onClick={handleQuickLogin}>
                快速体验
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SecretAdminAccess;