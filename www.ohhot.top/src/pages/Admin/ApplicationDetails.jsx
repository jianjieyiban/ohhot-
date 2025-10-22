import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Card, Row, Col, Descriptions, Tag, Button, Avatar, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { applicationAPI } from '../../services/api';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        const response = await applicationAPI.getApplicationDetails(id);
        if (response.data.success) {
          setApplicationData(response.data.data);
        } else {
          message.error('获取申请详情失败');
        }
      } catch (error) {
        console.error('获取申请详情失败:', error);
        message.error('获取申请详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [id]);

  const getStatusText = (status) => {
    switch (status) {
      case 1: return '待处理';
      case 2: return '已查看';
      case 3: return '已联系';
      case 4: return '已拒绝';
      case 5: return '已录用';
      default: return '未知状态';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1: return 'processing';
      case 2: return 'default';
      case 3: return 'warning';
      case 4: return 'error';
      case 5: return 'success';
      default: return 'default';
    }
  };

  const getGenderText = (gender) => {
    switch (gender) {
      case 0: return '未设置';
      case 1: return '男';
      case 2: return '女';
      default: return '未知';
    }
  };

  const getSalaryText = (salaryType, salaryMin, salaryMax) => {
    if (salaryType === 1) {
      return `${salaryMin}K-${salaryMax}K`;
    } else if (salaryType === 2) {
      return '面议';
    } else {
      return '薪资未公开';
    }
  };

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>加载中...</div>;
  }

  if (!applicationData) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>申请记录不存在</div>;
  }

  const { application, resume, job } = applicationData;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <h2>申请详情</h2>
        <Button onClick={() => navigate(-1)}>返回</Button>
      </div>

      <Row gutter={[16, 16]}>
        {/* 申请信息 */}
        <Col xs={24} lg={12}>
          <Card title="申请信息" bordered={false}>
            <Descriptions column={1}>
              <Descriptions.Item label="申请ID">{application.id}</Descriptions.Item>
              <Descriptions.Item label="申请状态">
                <Tag color={getStatusColor(application.status)}>
                  {getStatusText(application.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="申请时间">
                {new Date(application.applied_at).toLocaleString()}
              </Descriptions.Item>
              {application.message && (
                <Descriptions.Item label="申请留言">{application.message}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* 求职者信息 */}
        <Col xs={24} lg={12}>
          <Card title="求职者信息" bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Avatar 
                size={64} 
                src={application.avatar} 
                icon={<UserOutlined />} 
              />
              <div style={{ marginLeft: '16px' }}>
                <h3 style={{ margin: 0 }}>{application.real_name || application.nickname || '未设置姓名'}</h3>
                <p style={{ margin: 0, color: '#666' }}>ID: {application.user_id}</p>
              </div>
            </div>
            
            <Descriptions column={1}>
              <Descriptions.Item label="昵称">{application.nickname || '未设置'}</Descriptions.Item>
              <Descriptions.Item label="邮箱">
                <MailOutlined /> {application.email}
              </Descriptions.Item>
              <Descriptions.Item label="电话">
                <PhoneOutlined /> {application.phone}
              </Descriptions.Item>
              <Descriptions.Item label="性别">{getGenderText(application.gender)}</Descriptions.Item>
              <Descriptions.Item label="所在城市">{application.city_name || '未设置'}</Descriptions.Item>
              <Descriptions.Item label="注册时间">
                <ClockCircleOutlined /> {new Date(application.user_created_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* 职位信息 */}
        <Col xs={24}>
          <Card title="职位信息" bordered={false}>
            <Descriptions column={2}>
              <Descriptions.Item label="职位名称">{application.job_title}</Descriptions.Item>
              <Descriptions.Item label="薪资范围">
                <DollarOutlined /> {getSalaryText(application.salary_type, application.salary_min, application.salary_max)}
              </Descriptions.Item>
              <Descriptions.Item label="职位ID">{application.job_id}</Descriptions.Item>
              <Descriptions.Item label="招聘方">{job?.employer_name || '未知'}</Descriptions.Item>
              <Descriptions.Item label="招聘方电话">{job?.employer_phone || '未提供'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* 简历信息 */}
        {resume && (
          <Col xs={24}>
            <Card title="简历信息" bordered={false}>
              <Descriptions column={2}>
                <Descriptions.Item label="简历ID">{resume.id}</Descriptions.Item>
                <Descriptions.Item label="简历标题">{resume.title}</Descriptions.Item>
                <Descriptions.Item label="工作经验">{resume.experience}年</Descriptions.Item>
                <Descriptions.Item label="学历">{resume.education}</Descriptions.Item>
                <Descriptions.Item label="期望薪资">{resume.expected_salary}</Descriptions.Item>
                <Descriptions.Item label="求职状态">{resume.job_status}</Descriptions.Item>
              </Descriptions>
              
              {resume.skills && (
                <>
                  <Divider>技能标签</Divider>
                  <div style={{ marginBottom: '16px' }}>
                    {resume.skills.split(',').map((skill, index) => (
                      <Tag key={index} style={{ marginBottom: '8px' }}>{skill.trim()}</Tag>
                    ))}
                  </div>
                </>
              )}
              
              {resume.introduction && (
                <>
                  <Divider>自我介绍</Divider>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{resume.introduction}</p>
                </>
              )}
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ApplicationDetails;