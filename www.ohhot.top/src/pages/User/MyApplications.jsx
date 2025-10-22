import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  message, 
  Modal,
  Row,
  Col,
  Statistic,
  Spin
} from 'antd';
import { 
  EyeOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './MyApplications.css';

const MyApplications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  // 模拟获取申请记录数据
  useEffect(() => {
    if (user?.userType === 'jobseeker') {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      setTimeout(() => {
        const mockApplications = [
          {
            id: 1,
            jobId: 101,
            jobTitle: '前端开发工程师',
            company: 'ABC科技有限公司',
            city: '北京',
            salary: '15-25k',
            status: 'pending',
            appliedAt: '2024-01-15',
            updatedAt: '2024-01-15'
          },
          {
            id: 2,
            jobId: 102,
            jobTitle: 'Java开发工程师',
            company: 'XYZ互联网公司',
            city: '上海',
            salary: '20-30k',
            status: 'reviewed',
            appliedAt: '2024-01-10',
            updatedAt: '2024-01-12'
          },
          {
            id: 3,
            jobId: 103,
            jobTitle: 'UI设计师',
            company: '创意设计工作室',
            city: '深圳',
            salary: '12-18k',
            status: 'accepted',
            appliedAt: '2024-01-05',
            updatedAt: '2024-01-08'
          },
          {
            id: 4,
            jobId: 104,
            jobTitle: '产品经理',
            company: '创新科技公司',
            city: '杭州',
            salary: '25-35k',
            status: 'rejected',
            appliedAt: '2024-01-03',
            updatedAt: '2024-01-07'
          }
        ];
        setApplications(mockApplications);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('获取申请记录失败');
      setLoading(false);
    }
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleWithdraw = (applicationId) => {
    Modal.confirm({
      title: '确认撤回',
      content: '确定要撤回这个职位申请吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 模拟撤回申请API调用
          setApplications(prev => prev.filter(app => app.id !== applicationId));
          message.success('申请已成功撤回');
        } catch (error) {
          message.error('撤回失败，请重试');
        }
      }
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        color: 'orange', 
        icon: <ClockCircleOutlined />, 
        text: '待处理' 
      },
      reviewed: { 
        color: 'blue', 
        icon: <EyeOutlined />, 
        text: '已查看' 
      },
      accepted: { 
        color: 'green', 
        icon: <CheckCircleOutlined />, 
        text: '已通过' 
      },
      rejected: { 
        color: 'red', 
        icon: <CloseCircleOutlined />, 
        text: '未通过' 
      }
    };
    return configs[status] || configs.pending;
  };

  const columns = [
    {
      title: '职位信息',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      width: 250,
      render: (text, record) => (
        <div className="job-info-cell">
          <div className="job-title">{text}</div>
          <div className="company-info">
            <span>{record.company}</span>
            <span>•</span>
            <span>{record.city}</span>
            <span>•</span>
            <span>{record.salary}</span>
          </div>
        </div>
      )
    },
    {
      title: '申请状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: '申请时间',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewJob(record.jobId)}
            size="small"
          >
            查看职位
          </Button>
          {record.status === 'pending' && (
            <Button 
              type="link" 
              danger
              onClick={() => handleWithdraw(record.id)}
              size="small"
            >
              撤回申请
            </Button>
          )}
        </Space>
      )
    }
  ];

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    reviewed: applications.filter(app => app.status === 'reviewed').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };

  if (user?.userType !== 'jobseeker') {
    return (
      <div className="my-applications-page">
        <div className="my-applications-container">
          <Card className="access-denied-card">
            <div className="access-denied">
              <FileTextOutlined className="denied-icon" />
              <h3>访问受限</h3>
              <p>只有求职者用户才能查看申请记录</p>
              <Button type="primary" onClick={() => navigate('/')}>
                返回首页
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="my-applications-page">
      <div className="my-applications-container">
        {/* 统计信息 */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="总申请数"
                value={stats.total}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="待处理"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="已查看"
                value={stats.reviewed}
                prefix={<EyeOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="已处理"
                value={stats.accepted + stats.rejected}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 申请记录列表 */}
        <Card 
          className="applications-card"
          title={
            <div className="card-header">
              <span>我的申请记录</span>
              <Button 
                type="primary" 
                onClick={fetchApplications}
                loading={loading}
              >
                刷新
              </Button>
            </div>
          }
        >
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={applications}
              rowKey="id"
              pagination={{
                total: applications.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
              scroll={{ x: 800 }}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default MyApplications;