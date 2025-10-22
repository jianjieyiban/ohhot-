import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Tag, 
  Space, 
  Divider, 
  Descriptions, 
  Avatar,
  Spin,
  message,
  Modal,
  Row,
  Col
} from 'antd';
import { 
  EnvironmentOutlined, 
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  HeartOutlined,
  ShareAltOutlined,
  SafetyCertificateOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useJob } from '../../contexts/JobContext';
import { useAuth } from '../../contexts/AuthContext';
import { jobAPI, adminAPI } from '../../utils/api';
import './JobDetail.css';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentJob, loading, fetchJobDetail, applyJob, deleteJob } = useJob();
  const { user, isAuthenticated } = useAuth();
  
  const [applyLoading, setApplyLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetail(id);
    }
  }, [id]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录后再申请职位');
      navigate('/login', { state: { from: location } });
      return;
    }

    setApplyLoading(true);
    try {
      await applyJob(currentJob.id);
      message.success('职位申请成功！');
    } catch (error) {
      message.error(error.message || '申请失败，请重试');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录后再收藏职位');
      navigate('/login', { state: { from: location } });
      return;
    }

    setFavoriteLoading(true);
    try {
      if (currentJob.isFavorited) {
        await jobAPI.unfavoriteJob(currentJob.id);
        message.success('已取消收藏');
        // 更新本地状态
        setCurrentJob(prev => ({ ...prev, isFavorited: false }));
      } else {
        await jobAPI.favoriteJob(currentJob.id);
        message.success('收藏成功！');
        // 更新本地状态
        setCurrentJob(prev => ({ ...prev, isFavorited: true }));
      }
    } catch (error) {
      message.error(error.message || '操作失败，请重试');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentJob.title,
        text: currentJob.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success('链接已复制到剪贴板');
    }
  };

  // 处理删除职位
  const handleDeleteJob = async () => {
    try {
      // 显示确认对话框
      const confirmDelete = window.confirm('确定要删除这个职位吗？此操作不可恢复。');
      if (!confirmDelete) return;

      // 根据用户类型选择不同的API
      let response;
      if (user && (user.user_type === 2 || user.user_type === 3)) {
        // 管理员使用adminAPI
        response = await adminAPI.deleteJob(currentJob.id);
      } else {
        // 普通用户使用jobAPI
        response = await jobAPI.deleteJob(currentJob.id);
      }
      
      if (response.success) {
        message.success('职位删除成功');
        // 返回职位列表
        navigate('/jobs');
      } else {
        message.error(response.message || '删除失败，请稍后重试');
      }
    } catch (error) {
      console.error('删除职位错误:', error);
      message.error('删除失败，请稍后重试');
    }
  };

  if (loading) {
    return (
      <div className="job-detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="job-detail-error">
        <Card>
          <div className="error-content">
            <h2>职位不存在</h2>
            <p>您访问的职位可能已被删除或不存在</p>
            <Button type="primary" onClick={() => navigate('/jobs')}>
              返回职位列表
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="job-detail-page">
      <div className="job-detail-container">
        {/* 返回按钮 */}
        <div className="back-section">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            className="back-button"
          >
            返回
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          {/* 职位详情主内容 */}
          <Col xs={24} lg={16}>
            <Card className="job-main-card">
              <div className="job-header">
                <div className="job-title-section">
                  <h1 className="job-title">{currentJob.title}</h1>
                  <Space size="middle" className="job-meta-tags">
                    <Tag icon={<DollarOutlined />} color="green">{currentJob.salary}</Tag>
                    <Tag icon={<EnvironmentOutlined />} color="blue">{currentJob.city?.city}</Tag>
                    <Tag icon={<CalendarOutlined />} color="orange">{currentJob.experience}</Tag>
                    <Tag icon={<UserOutlined />} color="purple">{currentJob.education}</Tag>
                  </Space>
                </div>
                
                <div className="job-actions">
                  <Space size="middle">
                    <Button 
                      icon={<HeartOutlined />} 
                      loading={favoriteLoading}
                      type={currentJob.isFavorited ? 'primary' : 'default'}
                      onClick={handleFavorite}
                    >
                      {currentJob.isFavorited ? '已收藏' : '收藏'}
                    </Button>
                    <Button 
                      icon={<ShareAltOutlined />} 
                      onClick={handleShare}
                    >
                      分享
                    </Button>
                    {/* 只有职位发布者或管理员才能删除职位 */}
                    {user && (user.id === currentJob.user_id || user.user_type === 2 || user.user_type === 3) && (
                      <Button 
                        danger
                        onClick={handleDeleteJob}
                      >
                        删除职位
                      </Button>
                    )}
                  </Space>
                </div>
              </div>

              <Divider />

              {/* 职位描述 */}
              <section className="job-section">
                <h3>职位描述</h3>
                <div 
                  className="job-description"
                  dangerouslySetInnerHTML={{ __html: currentJob.description }}
                />
              </section>

              <Divider />

              {/* 职位要求 */}
              <section className="job-section">
                <h3>职位要求</h3>
                <div 
                  className="job-requirements"
                  dangerouslySetInnerHTML={{ __html: currentJob.requirements }}
                />
              </section>

              <Divider />

              {/* 福利待遇 */}
              {currentJob.benefits && (
                <>
                  <section className="job-section">
                    <h3>福利待遇</h3>
                    <div className="job-benefits">
                      {currentJob.benefits.split(',').map((benefit, index) => (
                        <Tag key={index} color="cyan" className="benefit-tag">
                          {benefit.trim()}
                        </Tag>
                      ))}
                    </div>
                  </section>
                  <Divider />
                </>
              )}

              {/* 公司信息 */}
              <section className="job-section">
                <h3>公司信息</h3>
                <Link to={`/companies/${currentJob.company?.id}`} className="company-link">
                  <div className="company-info">
                    <Avatar 
                      size={64} 
                      src={currentJob.company?.logo} 
                      icon={<UserOutlined />}
                      className="company-avatar"
                    />
                    <div className="company-details">
                      <h4 className="company-name">{currentJob.company?.name}</h4>
                      <p className="company-desc">{currentJob.company?.description}</p>
                      <Space size="small">
                        <SafetyCertificateOutlined />
                        <span>已认证</span>
                      </Space>
                    </div>
                  </div>
                </Link>
              </section>
            </Card>
          </Col>

          {/* 侧边栏 */}
          <Col xs={24} lg={8}>
            <Card className="job-sidebar-card">
              <div className="sidebar-content">
                {/* 申请按钮 */}
                <Button 
                    type="primary" 
                    size="large" 
                    block
                    loading={applyLoading}
                    onClick={handleApply}
                    className="apply-button"
                    disabled={currentJob.hasApplied}
                  >
                    {currentJob.hasApplied ? '已申请' : '立即申请'}
                  </Button>
                  
                  {/* 只有职位发布者或管理员才能删除职位 */}
                  {user && (user.id === currentJob.user_id || user.user_type === 2 || user.user_type === 3) && (
                    <Button 
                      danger
                      size="large"
                      block
                      onClick={handleDeleteJob}
                      style={{ marginTop: 10 }}
                    >
                      删除职位
                    </Button>
                  )}

                <Divider />

                {/* 职位基本信息 */}
                <Descriptions column={1} size="small" className="job-info">
                  <Descriptions.Item label="发布时间">
                    {new Date(currentJob.createdAt).toLocaleDateString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="工作地点">
                    {currentJob.address}
                  </Descriptions.Item>
                  <Descriptions.Item label="职位类别">
                    {currentJob.category}
                  </Descriptions.Item>
                  <Descriptions.Item label="招聘人数">
                    {currentJob.vacancy} 人
                  </Descriptions.Item>
                  <Descriptions.Item label="截止时间">
                    {new Date(currentJob.deadline).toLocaleDateString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="联系人">
                    {currentJob.contact_person}
                  </Descriptions.Item>
                  {currentJob.contact_phone && (
                    <Descriptions.Item label="联系电话">
                      {currentJob.contact_phone}
                    </Descriptions.Item>
                  )}
                  {currentJob.contact_wechat && (
                    <Descriptions.Item label="微信号">
                      {currentJob.contact_wechat}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                <Divider />

                {/* 相似职位推荐 */}
                <div className="similar-jobs">
                  <h4>相似职位</h4>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {currentJob.similarJobs?.slice(0, 3).map(similarJob => (
                      <Link 
                        key={similarJob.id} 
                        to={`/jobs/${similarJob.id}`}
                        className="similar-job-item"
                      >
                        <div className="similar-job-title">{similarJob.title}</div>
                        <div className="similar-job-salary">{similarJob.salary}</div>
                      </Link>
                    ))}
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default JobDetail;