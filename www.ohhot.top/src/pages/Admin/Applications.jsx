import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, message, Space, Input, Select, DatePicker } from 'antd';
import { EyeOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { applicationAPI } from '../../services/api';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Applications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateRange: null,
  });

  // 获取申请列表
  const fetchApplications = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page: params.current || pagination.current,
        pageSize: params.pageSize || pagination.pageSize,
        ...filters,
      };

      // 处理日期范围
      if (filters.dateRange && filters.dateRange.length === 2) {
        queryParams.startDate = filters.dateRange[0].format('YYYY-MM-DD');
        queryParams.endDate = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await applicationAPI.getApplications(queryParams);
      if (response.success) {
        setApplications(response.data.applications);
        setPagination({
          ...pagination,
          current: response.data.pagination.current,
          pageSize: response.data.pagination.pageSize,
          total: response.data.pagination.total,
        });
      } else {
        message.error('获取申请列表失败');
      }
    } catch (error) {
      console.error('获取申请列表错误:', error);
      message.error('获取申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchApplications();
  }, []);

  // 表格列定义
  const columns = [
    {
      title: '申请ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '求职者',
      dataIndex: 'applicant_name',
      key: 'applicant_name',
      render: (text, record) => (
        <div>
          <div>{text || record.nickname || '未设置姓名'}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '申请职位',
      dataIndex: 'job_title',
      key: 'job_title',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>ID: {record.job_id}</div>
        </div>
      ),
    },
    {
      title: '申请状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig = {
          1: { text: '待处理', color: 'processing' },
          2: { text: '已查看', color: 'default' },
          3: { text: '已联系', color: 'warning' },
          4: { text: '已拒绝', color: 'error' },
          5: { text: '已录用', color: 'success' },
        };
        const config = statusConfig[status] || { text: '未知', color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '申请时间',
      dataIndex: 'applied_at',
      key: 'applied_at',
      width: 150,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/admin/application-details/${record.id}`)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  // 处理表格分页、排序变化
  const handleTableChange = (paginationConfig) => {
    fetchApplications({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    });
  };

  // 处理搜索
  const handleSearch = (value) => {
    setFilters({
      ...filters,
      search: value,
    });
    fetchApplications({
      current: 1,
    });
  };

  // 处理状态筛选
  const handleStatusChange = (value) => {
    setFilters({
      ...filters,
      status: value,
    });
    fetchApplications({
      current: 1,
    });
  };

  // 处理日期范围变化
  const handleDateRangeChange = (dates) => {
    setFilters({
      ...filters,
      dateRange: dates,
    });
    fetchApplications({
      current: 1,
    });
  };

  // 重置筛选条件
  const handleReset = () => {
    setFilters({
      status: '',
      search: '',
      dateRange: null,
    });
    fetchApplications({
      current: 1,
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="职位申请管理" bordered={false}>
        {/* 筛选区域 */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Search
            placeholder="搜索求职者姓名、邮箱或职位名称"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
          <Select
            placeholder="申请状态"
            allowClear
            style={{ width: 120 }}
            onChange={handleStatusChange}
            value={filters.status || undefined}
          >
            <Option value="1">待处理</Option>
            <Option value="2">已查看</Option>
            <Option value="3">已联系</Option>
            <Option value="4">已拒绝</Option>
            <Option value="5">已录用</Option>
          </Select>
          <RangePicker
            placeholder={['开始日期', '结束日期']}
            onChange={handleDateRangeChange}
            value={filters.dateRange}
          />
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default Applications;