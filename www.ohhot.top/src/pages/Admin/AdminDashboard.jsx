import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, message, Modal, Space, Tabs } from 'antd';
import { UserOutlined, ShoppingOutlined, DollarOutlined, ExclamationCircleOutlined, LoginOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/api';

const { confirm } = Modal;

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalRevenue: 0,
    pendingJobs: 0,
    activeUsers: 0,
    newUsersToday: 0
  });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loginLogs, setLoginLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // 检查管理员权限
  useEffect(() => {
    if (!isAdmin) {
      message.error('您没有权限访问管理后台');
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [isAdmin, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 获取统计数据
      const statsResponse = await adminAPI.getStats();
      if (statsResponse.success) {
        setStats(statsResponse.data || {});
      } else {
        message.error('获取统计数据失败');
      }

      // 获取用户列表
      const usersResponse = await adminAPI.getUsers();
      if (usersResponse.success) {
        setUsers(usersResponse.data?.users || []);
      } else {
        message.error('获取用户列表失败');
      }

      // 获取职位列表
      const jobsResponse = await adminAPI.getJobs();
      if (jobsResponse.success) {
        setJobs(jobsResponse.data?.jobs || []);
      } else {
        message.error('获取职位列表失败');
      }

      // 获取登录日志
      const logsResponse = await adminAPI.getLoginLogs({ limit: 50 });
      if (logsResponse.success) {
        setLoginLogs(logsResponse.data?.logs || []);
      } else {
        message.error('获取登录日志失败');
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId) => {
    confirm({
      title: '确认删除用户',
      icon: <ExclamationCircleOutlined />,
      content: '此操作将永久删除该用户及其所有数据，确定要继续吗？',
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await adminAPI.deleteUser(userId);
          
          if (response.success) {
            message.success('用户删除成功');
            fetchDashboardData();
          } else {
            message.error('删除用户失败');
          }
        } catch (error) {
          console.error('删除用户失败:', error);
          message.error('删除用户失败');
        }
      },
    });
  };

  const handleDeleteJob = (jobId) => {
    confirm({
      title: '确认删除职位',
      icon: <ExclamationCircleOutlined />,
      content: '此操作将永久删除该职位，确定要继续吗？',
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await adminAPI.deleteJob(jobId);
          
          if (response.success) {
            message.success('职位删除成功');
            fetchDashboardData();
          } else {
            message.error('删除职位失败');
          }
        } catch (error) {
          console.error('删除职位失败:', error);
          message.error('删除职位失败');
        }
      },
    });
  };

  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '用户类型',
      dataIndex: 'user_type',
      key: 'user_type',
      render: (type) => {
        const types = {
          1: '求职者',
          2: '管理员',
          3: '企业用户'
        };
        return types[type] || '未知';
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small">查看</Button>
          <Button 
            type="link" 
            size="small" 
            danger
            onClick={() => handleDeleteUser(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const jobColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '职位名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '发布者',
      dataIndex: 'employer_name',
      key: 'employer_name',
    },
    {
      title: '薪资',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary) => `¥${salary}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small">查看</Button>
          <Button 
            type="link" 
            size="small" 
            danger
            onClick={() => handleDeleteJob(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const loginLogColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户',
      dataIndex: 'user_email',
      key: 'user_email',
    },
    {
      title: '用户类型',
      dataIndex: 'user_type',
      key: 'user_type',
      render: (type) => {
        const types = {
          1: '求职者',
          2: '管理员',
          3: '企业用户'
        };
        return types[type] || '未知';
      }
    },
    {
      title: 'IP地址',
      dataIndex: 'ip_address',
      key: 'ip_address',
    },
    {
      title: '登录时间',
      dataIndex: 'login_time',
      key: 'login_time',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '设备信息',
      dataIndex: 'user_agent',
      key: 'user_agent',
      ellipsis: true,
    },
  ];

  if (!isAdmin) {
    return null;
  }

  // 定义tabs配置
  const tabItems = [
    {
      key: 'dashboard',
      label: '数据统计',
      children: (
        <>
          {/* 统计卡片 */}
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总用户数"
                  value={stats.totalUsers}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总职位数"
                  value={stats.totalJobs}
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总收入"
                  value={stats.totalRevenue}
                  prefix={<DollarOutlined />}
                  precision={2}
                  suffix="元"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="待审核职位"
                  value={stats.pendingJobs}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
          
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="活跃用户"
                  value={stats.activeUsers}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="今日新增用户"
                  value={stats.newUsersToday}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="系统状态"
                  value="正常"
                  prefix={<SettingOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'users',
      label: '用户管理',
      children: (
        <Card title="用户管理">
          <Table
            columns={userColumns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ),
    },
    {
      key: 'jobs',
      label: '职位管理',
      children: (
        <Card title="职位管理">
          <Table
            columns={jobColumns}
            dataSource={jobs}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ),
    },
    {
      key: 'applications',
      label: '申请管理',
      children: (
        <Card title="职位申请管理">
          <div style={{ marginBottom: '16px' }}>
            <Button 
              type="primary" 
              icon={<FileTextOutlined />}
              onClick={() => navigate('/admin/applications')}
            >
              查看所有申请
            </Button>
          </div>
          <p>点击上方按钮查看所有求职者的职位申请详情，包括申请状态、求职者信息和职位信息等。</p>
        </Card>
      ),
    },
    {
      key: 'login-logs',
      label: '登录日志',
      children: (
        <Card title="登录日志">
          <Table
            columns={loginLogColumns}
            dataSource={loginLogs}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>管理后台</h1>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default AdminDashboard;