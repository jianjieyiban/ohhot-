import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  Space, 
  message,
  Progress,
  List,
  Avatar,
  Tag,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  FileTextOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useJob } from '../../contexts/JobContext';
import './UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { myJobs, getMyJobs, loading: jobsLoading } = useJob();
  
  const [dashboardData, setDashboardData] = useState({
    applications: 0,
    pendingApplications: 0,
    viewedApplications: 0,
    acceptedApplications: 0,
    jobViews: 0,
    applicationRate: 0
  });

  useEffect(() => {
    if (user) {
      if (user.userType === 'employer') {
        getMyJobs();
      }
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // 模拟获取仪表盘数据
      setTimeout(() => {
        const mockData = {
          applications: user?.userType === 'jobseeker' ? 12 : 45,
          pendingApplications: user?.userType === 'jobseeker' ? 3 : 8,
          viewedApplications: user?.userType === 'jobseeker' ? 5 : 20,
          acceptedApplications: user?.userType === 'jobseeker' ? 2 : 10,
          jobViews: user?.userType === 'employer' ? 156 : 0,
          applicationRate: user?.userType === 'employer' ? 28.8 : 0
        };
        setDashboardData(mockData);
      }, 1000);
    } catch (error) {
      message.error('获取仪表盘数据失败');
    }
  };

  const getRecentActivities = () => {
    if (user?.userType === 'jobseeker') {
      return [
        {
          id: 1,
          type: 'application',
          title: '申请了前端开发工程师职位',
          company: 'ABC科技有限公司',
          time: '2小时前',
          status: 'pending'
        },
        {
          id: 2,
          type: 'application',
          title: 'Java开发工程师申请已查看',
          company: 'XYZ互联网公司',
          time: '1天前',
          status: 'reviewed'
        },
        {
          id: 3,
          type: 'application',
          title: 'UI设计师职位申请通过',
          company: '创意设计工作室',
          time: '2天前',
          status: 'accepted'
        }
      ];
    } else {
      return [
        {
          id: 1,
          type: 'job',
          title: '前端开发工程师职位收到新申请',
          applicant: '张三',
          time: '1小时前',
          status: 'new'
        },
        {
          id: 2,
          type: 'job',
          title: 'Java开发工程师职位被查看',
          views: 15,
          time: '3小时前',
          status: 'viewed'
        },
        {
          id: 3,
          type: 'job',
          title: '产品经理职位申请处理完成',
          applicant: '李四',
          time: '1天前',
          status: 'processed'
        }
      ];
    }
  };

  const getStatusTag = (status) => {
    const configs = {
      pending: { color: 'orange', text: '待处理' },
      reviewed: { color: 'blue', text: '已查看' },
      accepted: { color: 'green', text: '已通过' },
      new: { color: 'red', text: '新申请' },
      viewed: { color: 'blue', text: '被查看' },
      processed: { color: 'green', text: '已处理' }
    };
    const config = configs[status] || configs.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getQuickActions = () => {
    if (user?.userType === 'jobseeker') {
      return [
        {
          title: '浏览职位',
          icon: <EyeOutlined />,
          onClick: () => navigate('/jobs'),
          color: '#1890ff'
        },
        {
          title: '查看申请',
          icon: <FileTextOutlined />,
          onClick: () => navigate('/user/applications'),
          color: '#52c41a'
        },
        {
          title: '完善资料',
          icon: <UserOutlined />,
          onClick: () => navigate('/user/profile'),
          color: '#faad14'
        }
      ];
    } else {
      return [
        {
          title: '发布职位',
          icon: <PlusOutlined />,
          onClick: () => navigate('/jobs/create'),
          color: '#1890ff'
        },
        {
          title: '管理职位',
          icon: <FileTextOutlined />,
          onClick: () => navigate('/user/jobs'),
          color: '#52c41a'
        },
        {
          title: '账户设置',
          icon: <SettingOutlined />,
          onClick: () => navigate('/user/profile'),
          color: '#faad14'
        }
      ];
    }
  };

  if (authLoading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="user-dashboard-page">
      <div className="user-dashboard-container">
        {/* 欢迎区域 */}
        <Card className="welcome-card">
          <div className="welcome-content">
            <div className="welcome-text">
              <h1>欢迎回来，{user?.username}！</h1>
              <p>今天是 {new Date().toLocaleDateString('zh-CN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <div className="user-avatar">
              <Avatar size={80} src={user?.avatar} icon={<UserOutlined />} />
            </div>
          </div>
        </Card>

        {/* 快速操作 */}
        <Card className="quick-actions-card" title="快速操作">
          <Row gutter={[16, 16]}>
            {getQuickActions().map((action, index) => (
              <Col key={index} xs={24} sm={8}>
                <Button 
                  className="quick-action-btn"
                  icon={action.icon}
                  onClick={action.onClick}
                  style={{ borderColor: action.color, color: action.color }}
                  size="large"
                  block
                >
                  {action.title}
                </Button>
              </Col>
            ))}
          </Row>
        </Card>

        {/* 统计信息 */}
        <Row gutter={[16, 16]} className="stats-row">
          {user?.userType === 'jobseeker' ? (
            <>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="总申请数"
                    value={dashboardData.applications}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="待处理"
                    value={dashboardData.pendingApplications}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="已查看"
                    value={dashboardData.viewedApplications}
                    prefix={<EyeOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="已通过"
                    value={dashboardData.acceptedApplications}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </>
          ) : (
            <>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="发布职位"
                    value={myJobs.length}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="总申请数"
                    value={dashboardData.applications}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="职位浏览量"
                    value={dashboardData.jobViews}
                    prefix={<EyeOutlined />}
                    valueStyle={{ color: '#faad14' }}
                    suffix={<ArrowUpOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="申请转化率"
                    value={dashboardData.applicationRate}
                    suffix="%"
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
            </>
          )}
        </Row>

        {/* 最近活动 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card 
              className="activities-card"
              title="最近活动"
              extra={
                <Button type="link" onClick={fetchDashboardData}>
                  刷新
                </Button>
              }
            >
              <List
                dataSource={getRecentActivities()}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={item.type === 'application' ? <FileTextOutlined /> : <EyeOutlined />}
                          style={{ 
                            backgroundColor: item.type === 'application' ? '#1890ff' : '#52c41a' 
                          }}
                        />
                      }
                      title={
                        <Space>
                          <span>{item.title}</span>
                          {getStatusTag(item.status)}
                        </Space>
                      }
                      description={
                        <Space>
                          <span>{item.company || item.applicant}</span>
                          <span>•</span>
                          <span>{item.time}</span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* 进度统计 */}
          <Col xs={24} lg={8}>
            <Card className="progress-card" title="进度统计">
              <div className="progress-item">
                <div className="progress-label">
                  <span>资料完整度</span>
                  <span>75%</span>
                </div>
                <Progress percent={75} strokeColor="#1890ff" />
              </div>
              
              <div className="progress-item">
                <div className="progress-label">
                  <span>活跃度</span>
                  <span>60%</span>
                </div>
                <Progress percent={60} strokeColor="#52c41a" />
              </div>
              
              <div className="progress-item">
                <div className="progress-label">
                  <span>响应速度</span>
                  <span>85%</span>
                </div>
                <Progress percent={85} strokeColor="#faad14" />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default UserDashboard;