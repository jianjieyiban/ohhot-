import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  message, 
  Modal, 
  Popconfirm,
  Row,
  Col,
  Statistic,
  Spin
} from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  PlusOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useJob } from '../../contexts/JobContext';
import { useAuth } from '../../contexts/AuthContext';
import './MyJobs.css';

const MyJobs = () => {
  const navigate = useNavigate();
  const { myJobs, getMyJobs, deleteJob, loading } = useJob();
  const { user } = useAuth();
  
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user?.userType === 'employer') {
      getMyJobs();
    }
  }, [user]);

  const handleView = (id) => {
    navigate(`/jobs/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/jobs/edit/${id}`);
  };

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await deleteJob(id);
      message.success('职位删除成功');
      getMyJobs();
    } catch (error) {
      message.error(error.message || '删除失败');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的职位');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个职位吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        setDeleteLoading(true);
        try {
          const deletePromises = selectedRowKeys.map(id => deleteJob(id));
          await Promise.all(deletePromises);
          message.success(`成功删除 ${selectedRowKeys.length} 个职位`);
          setSelectedRowKeys([]);
          getMyJobs();
        } catch (error) {
          message.error('删除失败，请重试');
        } finally {
          setDeleteLoading(false);
        }
      }
    });
  };

  const columns = [
    {
      title: '职位标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text, record) => (
        <div className="job-title-cell">
          <div className="job-title">{text}</div>
          <div className="job-info">
            <span>{record.city?.name}</span>
            <span>•</span>
            <span>{record.salary}</span>
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '招聘中' : '已关闭'}
        </Tag>
      )
    },
    {
      title: '申请人数',
      dataIndex: 'applications',
      key: 'applications',
      width: 100,
      render: (applications) => applications || 0
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : '长期有效'
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
            onClick={() => handleView(record.id)}
            size="small"
          >
            查看
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record.id)}
            size="small"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个职位吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okType="danger"
          >
            <Button 
              type="link" 
              icon={<DeleteOutlined />} 
              danger
              size="small"
              loading={deleteLoading}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record) => ({
      disabled: record.status === 'closed'
    })
  };

  const stats = {
    total: myJobs.length,
    active: myJobs.filter(job => job.status === 'active').length,
    closed: myJobs.filter(job => job.status === 'closed').length
  };

  if (user?.userType !== 'employer') {
    return (
      <div className="my-jobs-page">
        <div className="my-jobs-container">
          <Card className="access-denied-card">
            <div className="access-denied">
              <FileTextOutlined className="denied-icon" />
              <h3>访问受限</h3>
              <p>只有企业用户才能管理职位</p>
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
    <div className="my-jobs-page">
      <div className="my-jobs-container">
        {/* 统计信息 */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="总职位数"
                value={stats.total}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="招聘中"
                value={stats.active}
                prefix={<EyeOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="已关闭"
                value={stats.closed}
                prefix={<EditOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 职位列表 */}
        <Card 
          className="jobs-card"
          title={
            <div className="card-header">
              <span>我的职位</span>
              <Space>
                {selectedRowKeys.length > 0 && (
                  <Popconfirm
                    title={`确定删除选中的 ${selectedRowKeys.length} 个职位吗？`}
                    onConfirm={handleBatchDelete}
                    okText="确定"
                    cancelText="取消"
                    okType="danger"
                  >
                    <Button 
                      danger 
                      icon={<DeleteOutlined />}
                      loading={deleteLoading}
                    >
                      批量删除
                    </Button>
                  </Popconfirm>
                )}
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/jobs/create')}
                >
                  发布新职位
                </Button>
              </Space>
            </div>
          }
        >
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={myJobs}
              rowKey="id"
              pagination={{
                total: myJobs.length,
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

export default MyJobs;