import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Pagination,
  Space,
  Spin,
  Empty,
  Divider,
  message 
} from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  DollarOutlined,
  CalendarOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons';
import { useJob } from '../../contexts/JobContext';
import { useCity } from '../../contexts/CityContext';
import { useAuth } from '../../contexts/AuthContext';
import { jobAPI } from '../../utils/api';
import { ScrollAnimation, ScrollProgress, ScrollToTop } from '../../components/index.js';
import './JobList.css';

const { Option } = Select;

const JobList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { jobs, loading, getJobs, pagination, applyJob } = useJob();
  const { cities, getCities } = useCity();
  const { user } = useAuth();
  const [applyLoading, setApplyLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    keyword: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    salary: searchParams.get('salary') || '',
    experience: searchParams.get('experience') || '',
    sort: searchParams.get('sort') || 'createdAt_desc',  // 默认按最新发布排序
    favorites: searchParams.get('favorites') === 'true'
  });
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getCities();
    handleSearch();
  }, [currentPage]);

  // 监听路由变化，刷新职位列表
  useEffect(() => {
    const unlisten = () => {
      // 当从其他页面导航到职位列表时，刷新职位列表
      if (window.location.pathname === '/jobs') {
        handleSearch();
      }
    };
    
    // 添加路由变化监听
    window.addEventListener('popstate', unlisten);
    
    return () => {
      window.removeEventListener('popstate', unlisten);
    };
  }, []);

  useEffect(() => {
    const keyword = searchParams.get('search');
    const city = searchParams.get('city');
    const salary = searchParams.get('salary');
    const experience = searchParams.get('experience');
    const sort = searchParams.get('sort');
    const favorites = searchParams.get('favorites');
    
    // 只有当参数确实发生变化时才更新
    if (keyword !== filters.keyword || city !== filters.city || 
        salary !== filters.salary || experience !== filters.experience || 
        sort !== filters.sort || favorites !== (filters.favorites ? 'true' : null)) {
      
      setFilters({
        keyword: keyword || '',
        city: city || '',
        salary: salary || '',
        experience: experience || '',
        sort: sort || 'createdAt_desc',
        favorites: favorites === 'true'
      });
      
      // 重置到第一页并执行搜索
      setCurrentPage(1);
      
      // 使用最新的参数立即执行搜索
      const params = {
        keyword: keyword || '',
        city: city || '',
        salary: salary || '',
        experience: experience || '',
        sort: sort || 'createdAt_desc',
        favorites: favorites === 'true',
        page: 1,
        limit: 12
      };
      
      getJobs(params);
    }
  }, [searchParams]);

  const handleSearch = () => {
    const params = {
      ...filters,
      page: currentPage,
      limit: 12
    };
    
    // 更新URL参数
    const newSearchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'favorites') {
        if (value) newSearchParams.set(key, 'true');
      } else if (value) {
        newSearchParams.set(key, value);
      }
    });
    setSearchParams(newSearchParams);
    
    getJobs(params);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // 处理收藏筛选
  const handleFavoriteFilter = () => {
    const newFavorites = !filters.favorites;
    handleFilterChange('favorites', newFavorites);
  };

  // 处理收藏职位
  const handleFavorite = async (jobId) => {
    try {
      // 检查用户是否已登录
      if (!user) {
        message.warning('请先登录后再收藏职位');
        navigate('/login');
        return;
      }
      
      // 找到当前职位
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;
      
      // 根据当前收藏状态调用不同的API
      let response;
      if (job.isFavorited) {
        response = await jobAPI.unfavoriteJob(jobId);
        if (response.success) {
          message.success('已取消收藏');
          // 更新本地状态
          setJobs(prevJobs => 
            prevJobs.map(j => 
              j.id === jobId 
                ? { ...j, isFavorited: false }
                : j
            )
          );
        }
      } else {
        response = await jobAPI.favoriteJob(jobId);
        if (response.success) {
          message.success('收藏成功');
          // 更新本地状态
          setJobs(prevJobs => 
            prevJobs.map(j => 
              j.id === jobId 
                ? { ...j, isFavorited: true }
                : j
            )
          );
        }
      }
      
      if (!response.success) {
        message.error(response.message || '操作失败，请重试');
      }
    } catch (error) {
      console.error('收藏操作错误:', error);
      message.error('操作失败，请检查网络连接');
    }
  };

  // 处理职位申请
  const handleApply = async (jobId) => {
    try {
      setApplyLoading(true);
      
      // 检查用户是否已登录
      if (!user) {
        message.warning('请先登录后再申请职位');
        navigate('/login');
        return;
      }
      
      // 调用申请职位的API
      const result = await applyJob(jobId);
      
      if (result.success) {
        message.success('申请成功！');
        
        // 更新本地职位列表中的申请状态
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === jobId 
              ? { ...job, hasApplied: true }
              : job
          )
        );
      } else {
        message.error(result.message || '申请失败，请重试');
      }
    } catch (error) {
      message.error('申请失败，请检查网络连接');
    } finally {
      setApplyLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 处理删除职位
  const handleDeleteJob = async (jobId) => {
    try {
      // 显示确认对话框
      const confirmDelete = window.confirm('确定要删除这个职位吗？此操作不可恢复。');
      if (!confirmDelete) return;

      // 调用删除API
      const response = await jobAPI.deleteJob(jobId);
      
      if (response.success) {
        message.success('职位删除成功');
        // 刷新职位列表
        handleSearch();
      } else {
        message.error(response.message || '删除失败，请稍后重试');
      }
    } catch (error) {
      console.error('删除职位错误:', error);
      message.error('删除失败，请稍后重试');
    }
  };

  const salaryOptions = [
    { value: '0-5', label: '5k以下' },
    { value: '5-10', label: '5-10k' },
    { value: '10-20', label: '10-20k' },
    { value: '20-50', label: '20-50k' },
    { value: '50+', label: '50k以上' }
  ];

  const experienceOptions = [
    { value: '不限', label: '经验不限' },
    { value: '应届生', label: '应届生' },
    { value: '1-3年', label: '1-3年' },
    { value: '3-5年', label: '3-5年' },
    { value: '5-10年', label: '5-10年' },
    { value: '10年以上', label: '10年以上' }
  ];

  const sortOptions = [
    { value: 'createdAt_desc', label: '最新发布' },
    { value: 'createdAt_asc', label: '最早发布' },
    { value: 'salary_desc', label: '薪资最高' },
    { value: 'salary_asc', label: '薪资最低' }
  ];

  return (
    <div className="jobs-page">
      {/* 滚动进度指示器 */}
      <ScrollProgress position="top" height={4} color="#1890ff" />
      
      <div className="jobs-container">
        {/* 搜索和筛选区域 */}
        <ScrollAnimation animation="fadeInDown" threshold={0.3}>
          <Card className="filters-card">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={4}>
                <ScrollAnimation animation="slideInLeft" delay={100}>
                  <Input
                    placeholder="搜索职位、公司或关键词"
                    prefix={<SearchOutlined />}
                    value={filters.keyword}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                    onPressEnter={handleSearch}
                  />
                </ScrollAnimation>
              </Col>
              
              <Col xs={12} sm={6} md={3}>
                <ScrollAnimation animation="slideInLeft" delay={150}>
                  <Select
                    placeholder="选择城市"
                    value={filters.city}
                    onChange={(value) => handleFilterChange('city', value)}
                    style={{ width: '100%' }}
                    allowClear
                  >
                    {cities.map(city => (
                      <Option key={city.id} value={city.id}>{city.city}</Option>
                    ))}
                  </Select>
                </ScrollAnimation>
              </Col>
              
              <Col xs={12} sm={6} md={3}>
                <ScrollAnimation animation="slideInLeft" delay={200}>
                  <Select
                    placeholder="薪资范围"
                    value={filters.salary}
                    onChange={(value) => handleFilterChange('salary', value)}
                    style={{ width: '100%' }}
                    allowClear
                  >
                    {salaryOptions.map(option => (
                      <Option key={option.value} value={option.value}>{option.label}</Option>
                    ))}
                  </Select>
                </ScrollAnimation>
              </Col>
              
              <Col xs={12} sm={6} md={3}>
                <ScrollAnimation animation="slideInLeft" delay={250}>
                  <Select
                    placeholder="经验要求"
                    value={filters.experience}
                    onChange={(value) => handleFilterChange('experience', value)}
                    style={{ width: '100%' }}
                    allowClear
                  >
                    {experienceOptions.map(option => (
                      <Option key={option.value} value={option.value}>{option.label}</Option>
                    ))}
                  </Select>
                </ScrollAnimation>
              </Col>
              
              <Col xs={12} sm={6} md={3}>
                <ScrollAnimation animation="slideInRight" delay={300}>
                  <Select
                    value={filters.sort}
                    onChange={(value) => handleFilterChange('sort', value)}
                    style={{ width: '100%' }}
                  >
                    {sortOptions.map(option => (
                      <Option key={option.value} value={option.value}>{option.label}</Option>
                    ))}
                  </Select>
                </ScrollAnimation>
              </Col>
              
              <Col xs={24} sm={24} md={3}>
                <ScrollAnimation animation="slideInRight" delay={350}>
                  <Button 
                    type="primary" 
                    icon={<SearchOutlined />} 
                    onClick={handleSearch}
                    block
                  >
                    搜索
                  </Button>
                </ScrollAnimation>
              </Col>
            </Row>
          </Card>
        </ScrollAnimation>

        {/* 职位列表 */}
        <ScrollAnimation animation="fadeInUp" threshold={0.3}>
          <div className="jobs-content">
              <div className="jobs-header">
                <h2>职位列表</h2>
                <div className="jobs-header-actions">
                  <span className="jobs-count">
                    共找到 {pagination.total} 个职位
                  </span>
                  <Button 
                    type={filters.favorites ? "primary" : "default"}
                    icon={filters.favorites ? <HeartFilled /> : <HeartOutlined />}
                    onClick={handleFavoriteFilter}
                    style={{ marginLeft: 16 }}
                  >
                    {filters.favorites ? '查看全部职位' : '只看收藏'}
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="loading-container">
                  <Spin size="large" />
                </div>
              ) : jobs.length === 0 ? (
                <Empty 
                  description="暂无相关职位"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button type="primary" onClick={() => {
                    setFilters({ keyword: '', city: '', salary: '', experience: '', sort: 'createdAt_desc' });
                    setCurrentPage(1);
                    handleSearch();
                  }}>
                    查看所有职位
                  </Button>
                </Empty>
              ) : (
                <>
                  <Row gutter={[24, 24]}>
                    {jobs.map((job, index) => (
                      <Col xs={24} sm={12} lg={8} key={job.id}>
                        <ScrollAnimation 
                          animation="slideInUp" 
                          delay={200 + (index % 3) * 50}
                          threshold={0.2}
                        >
                          <Card 
                            className="job-card"
                            hoverable
                            actions={[
                              <Link to={`/jobs/${job.id}`} key="view">查看详情</Link>,
                              <Button 
                                type="link" 
                                key="apply"
                                onClick={() => handleApply(job.id)}
                                loading={applyLoading}
                              >
                                {job.hasApplied ? '已申请' : '立即申请'}
                              </Button>,
                              <Button 
                                type="link" 
                                key="favorite"
                                onClick={() => handleFavorite(job.id)}
                                icon={job.isFavorited ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                              >
                                {job.isFavorited ? '已收藏' : '收藏'}
                              </Button>,
                              // 只有职位发布者或管理员才能删除职位
                              (user && (user.id === job.user_id || user.user_type === 2 || user.user_type === 3)) && (
                                <Button 
                                  type="link" 
                                  danger
                                  key="delete"
                                  onClick={() => handleDeleteJob(job.id)}
                                >
                                  删除
                                </Button>
                              )
                            ].filter(Boolean)}
                          >
                            <Card.Meta
                              avatar={
                                <div className="company-avatar">
                                  {job.company?.logo ? (
                                    <img src={job.company.logo} alt={job.company.name} />
                                  ) : (
                                    <div className="avatar-placeholder">
                                      {job.company?.name?.charAt(0)}
                                    </div>
                                  )}
                                </div>
                              }
                              title={
                                <div className="job-title-container">
                                  <Link to={`/jobs/${job.id}`} className="job-title">
                                    {job.title}
                                  </Link>
                                  {job.isFavorited && (
                                    <HeartFilled className="job-favorite-icon" style={{ color: '#ff4d4f' }} />
                                  )}
                                </div>
                              }
                              description={
                                <div className="job-meta">
                                  <div className="company-name">{job.company?.name}</div>
                                  <Space size="small" className="job-tags">
                                    <Tag icon={<EnvironmentOutlined />} color="blue">
                                      {job.city?.name}
                                    </Tag>
                                    <Tag icon={<DollarOutlined />} color="green">
                                      {job.salary}
                                    </Tag>
                                    <Tag icon={<CalendarOutlined />} color="orange">
                                      {job.experience}
                                    </Tag>
                                  </Space>
                                  <div className="job-desc">
                                    {job.description?.substring(0, 100)}...
                                  </div>
                                </div>
                              }
                            />
                          </Card>
                        </ScrollAnimation>
                      </Col>
                    ))}
                  </Row>

              {/* 分页 */}
              {pagination.total > 0 && (
                <ScrollAnimation animation="fadeInUp" delay={500}>
                  <div className="pagination-container">
                    <Pagination
                      current={currentPage}
                      total={pagination.total}
                      pageSize={pagination.limit}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      showQuickJumper
                      showTotal={(total, range) => 
                        `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                      }
                    />
                  </div>
                </ScrollAnimation>
              )}
            </>
          )}
        </div>
        </ScrollAnimation>
        
        {/* 滚动到顶部按钮 */}
        <ScrollToTop threshold={300} size="medium" />
      </div>
    </div>
  );
};

export default JobList;