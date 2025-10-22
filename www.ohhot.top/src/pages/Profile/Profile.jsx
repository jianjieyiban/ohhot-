import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Avatar, 
  Space,
  Divider,
  message,
  Upload,
  Select,
  Row,
  Col
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  SaveOutlined,
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './Profile.css';

const { Title, Text } = Typography;
const { Option } = Select;

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const { user, updateProfile } = useAuth();
  const [form] = Form.useForm();

  // 根据实际用户类型设置用户资料
  const mockProfile = {
    id: user?.id || 1,
    username: user?.username || 'demo_user',
    email: user?.email || 'demo@example.com',
    phone: user?.phone || '138****1234',
    avatar: user?.avatar || null,
    fullName: user?.fullName || user?.nickname || '演示用户',
    location: user?.location || '北京',
    userType: user?.user_type === 1 ? 'job_seeker' : 
              user?.user_type === 3 ? 'employer' : 
              user?.user_type === 2 ? 'admin' : 'job_seeker',
    bio: user?.bio || '热爱编程，喜欢学习新技术，寻找前端开发岗位',
    skills: user?.skills || ['React', 'Vue', 'JavaScript', 'HTML5', 'CSS3'],
    experience: user?.experience || '3年',
    education: user?.education || '本科',
    createdAt: user?.createdAt || '2023-01-15'
  };

  useEffect(() => {
    if (user) {
      form.setFieldsValue(mockProfile);
    }
  }, [user, form]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      message.success('资料更新成功！');
      setEditing(false);
      
      // 模拟更新用户上下文
      if (updateProfile) {
        updateProfile(values);
      }
    } catch (error) {
      message.error('保存失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue(mockProfile);
    setEditing(false);
  };

  const handleAvatarUpload = async (file) => {
    setAvatarLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('头像上传成功！');
    } catch (error) {
      message.error('头像上传失败');
    } finally {
      setAvatarLoading(false);
    }
    return false; // 阻止默认上传行为
  };

  const uploadProps = {
    beforeUpload: handleAvatarUpload,
    showUploadList: false,
    accept: 'image/*'
  };

  if (!user) {
    return (
      <div className="profile-container">
        <Card>
          <Text>请先登录查看个人资料</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Title level={2}>个人资料</Title>
      
      <Row gutter={[24, 24]}>
        {/* 左侧头像和信息 */}
        <Col xs={24} md={8}>
          <Card className="profile-card">
            <div className="avatar-section">
              <Upload {...uploadProps}>
                <Avatar 
                  size={100} 
                  icon={<UserOutlined />}
                  src={mockProfile.avatar}
                  className="profile-avatar"
                />
                {editing && (
                  <div className="avatar-overlay">
                    <CameraOutlined />
                  </div>
                )}
              </Upload>
              
              <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>
                {mockProfile.fullName}
              </Title>
              <Text type="secondary">@{mockProfile.username}</Text>
              
              <div className="user-type-tag">
                <Text 
                  strong 
                  style={{ 
                    color: mockProfile.userType === 'job_seeker' ? '#1890ff' : 
                           mockProfile.userType === 'employer' ? '#52c41a' : '#f5222d'
                  }}
                >
                  {mockProfile.userType === 'job_seeker' ? '求职者' : 
                   mockProfile.userType === 'employer' ? '招聘者' : '管理员'}
                </Text>
              </div>
            </div>

            <Divider />

            {/* 基本信息 */}
            <div className="basic-info">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div className="info-item">
                  <MailOutlined />
                  <Text>{mockProfile.email}</Text>
                </div>
                <div className="info-item">
                  <PhoneOutlined />
                  <Text>{mockProfile.phone}</Text>
                </div>
                <div className="info-item">
                  <EnvironmentOutlined />
                  <Text>{mockProfile.location}</Text>
                </div>
              </Space>
            </div>

            <Divider />

            {/* 统计数据 */}
            <div className="stats">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="stat-item">
                    <Text strong>12</Text>
                    <Text type="secondary">申请职位</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="stat-item">
                    <Text strong>3</Text>
                    <Text type="secondary">收藏职位</Text>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* 右侧详细信息 */}
        <Col xs={24} md={16}>
          <Card 
            className="profile-card"
            title={
              <div className="card-header">
                <Title level={4} style={{ margin: 0 }}>详细信息</Title>
                {!editing ? (
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                  >
                    编辑资料
                  </Button>
                ) : (
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />}
                      loading={loading}
                      onClick={() => form.submit()}
                    >
                      保存
                    </Button>
                    <Button onClick={handleCancel}>
                      取消
                    </Button>
                  </Space>
                )}
              </div>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              disabled={!editing}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item name="fullName" label="姓名">
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="userType" label="用户类型">
                    <Select disabled={mockProfile.userType === 'admin'}>
                      <Option value="job_seeker">求职者</Option>
                      <Option value="employer">招聘者</Option>
                      {mockProfile.userType === 'admin' && <Option value="admin">管理员</Option>}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="phone" label="手机号">
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="location" label="所在地">
                    <Input prefix={<EnvironmentOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="bio" label="个人简介">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="experience" label="工作经验">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="education" label="学历">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            {/* 技能标签 */}
            {!editing && (
              <>
                <Divider orientation="left">技能标签</Divider>
                <Space wrap size={[8, 8]} style={{ marginBottom: 16 }}>
                  {mockProfile.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </Space>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;