import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Upload, 
  message, 
  Avatar, 
  Space,
  Divider,
  Row,
  Col,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  CameraOutlined, 
  SaveOutlined,
  EditOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useCity } from '../../contexts/CityContext';
import './UserProfile.css';

const { Option } = Select;
const { TextArea } = Input;

const UserProfile = () => {
  const { user, updateProfile, loading } = useAuth();
  const { cities, getCities } = useCity();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    getCities();
    
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        phone: user.phone,
        cityId: user.cityId,
        bio: user.bio
      });
      setAvatarUrl(user.avatar || '');
    }
  }, [user]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        phone: user.phone,
        cityId: user.cityId,
        bio: user.bio
      });
    }
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await updateProfile(values);
      message.success('个人信息更新成功！');
      setEditing(false);
    } catch (error) {
      message.error(error.message || '更新失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      // 这里处理头像上传成功后的逻辑
      setAvatarUrl(info.file.response?.url || '');
      message.success('头像上传成功');
    } else if (info.file.status === 'error') {
      message.error('头像上传失败');
    }
  };

  const uploadProps = {
    name: 'avatar',
    listType: 'picture-card',
    showUploadList: false,
    action: '/api/upload/avatar',
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('只能上传 JPG/PNG 格式的图片!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB!');
      }
      return isJpgOrPng && isLt2M;
    },
    onChange: handleAvatarChange
  };

  if (loading && !user) {
    return (
      <div className="user-profile-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        <Card className="profile-card">
          {/* 头部 */}
          <div className="profile-header">
            <div className="avatar-section">
              <Upload {...uploadProps}>
                <div className="avatar-upload">
                  <Avatar 
                    size={120} 
                    src={avatarUrl} 
                    icon={<UserOutlined />}
                    className="profile-avatar"
                  />
                  <div className="avatar-overlay">
                    <CameraOutlined />
                    <span>更换头像</span>
                  </div>
                </div>
              </Upload>
              <div className="user-info">
                <h2>{user?.username || '用户'}</h2>
                <p className="user-email">{user?.email}</p>
                <p className="user-type">
                  {user?.userType === 'employer' ? '企业用户' : '求职者'}
                </p>
              </div>
            </div>
            
            {!editing && (
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={handleEdit}
                className="edit-button"
              >
                编辑资料
              </Button>
            )}
          </div>

          <Divider />

          {/* 表单区域 */}
          <Form
            form={form}
            name="userProfile"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            scrollToFirstError
            disabled={!editing}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[
                    { required: true, message: '请输入用户名' },
                    { min: 2, max: 20, message: '用户名2-20个字符' }
                  ]}
                >
                  <Input placeholder="请输入用户名" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input placeholder="请输入邮箱" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="手机号"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
                  ]}
                >
                  <Input placeholder="请输入手机号" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="cityId"
                  label="所在城市"
                  rules={[{ required: true, message: '请选择所在城市' }]}
                >
                  <Select placeholder="选择城市">
                    {cities.map(city => (
                      <Option key={city.id} value={city.id}>{city.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="bio"
                  label="个人简介"
                  rules={[{ max: 200, message: '个人简介不能超过200个字符' }]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="介绍一下自己..."
                    showCount
                    maxLength={200}
                  />
                </Form.Item>
              </Col>

              {editing && (
                <Col xs={24}>
                  <Divider />
                  <Form.Item>
                    <Space size="large">
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={submitting}
                        icon={<SaveOutlined />}
                        size="large"
                      >
                        保存修改
                      </Button>
                      <Button 
                        onClick={handleCancel}
                        size="large"
                      >
                        取消
                      </Button>
                    </Space>
                  </Form.Item>
                </Col>
              )}
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;