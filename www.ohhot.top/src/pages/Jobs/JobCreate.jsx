import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  InputNumber, 
  message,
  Card,
  Row,
  Col,
  Divider,
  Space
} from 'antd';
import { 
  SaveOutlined, 
  ArrowLeftOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useJob } from '../../contexts/JobContext';
import { useCity } from '../../contexts/CityContext';
import { useAuth } from '../../contexts/AuthContext';
import { ScrollAnimation } from '../../components/index.js';
import './JobCreate.css';

const { Option } = Select;
const { TextArea } = Input;

const JobCreate = () => {
  const navigate = useNavigate();
  const { createJob, loading } = useJob();
  const { cities } = useCity();
  const { user, isEmployer, isAdmin } = useAuth();
  const [form] = Form.useForm();

  // 检查用户权限
  useEffect(() => {
    if (user && !isEmployer && !isAdmin) {
      message.error('只有企业账号和管理员才能发布招聘信息');
      navigate('/jobs');
      return;
    }
  }, [user, isEmployer, isAdmin, navigate]);

  const handleSubmit = async (values) => {
    try {
      // 将前端表单字段转换为后端API期望的字段
      const jobData = {
        title: values.title,
        content: values.description, // 将description转换为content
        category_id: values.category_id || 1, // 默认分类ID为1
        city_id: values.city_id,
        district: values.district || '',
        address: values.address || '',
        salary_type: 1, // 默认月薪类型
        salary_min: values.salary_min,
        salary_max: values.salary_max,
        work_time: values.work_time || '9:00-18:00',
        work_days: values.work_days || '周一至周五',
        job_type: mapJobTypeToNumber(values.job_type), // 将前端job_type转换为数字格式
        requirements: values.requirements,
        contact_person: values.contact_person || '',
        contact_phone: values.contact_phone || '',
        contact_wechat: values.contact_wechat || '',
      };
      
      const result = await createJob(jobData);
      if (result.success) {
        message.success('职位发布成功！');
        
        // 确保跳转到职位列表页
        setTimeout(() => {
          navigate('/jobs', { replace: true });
        }, 500);
      } else {
        message.error(result.message || '发布失败，请重试');
      }
    } catch (error) {
      message.error('发布失败，请检查网络连接');
    }
  };

  // 将前端职位类型值转换为后端期望的数字值
  const mapJobTypeToNumber = (type) => {
    const typeMap = {
      'full-time': 1,
      'part-time': 2,
      'internship': 3,
      'contract': 4
    };
    return typeMap[type] || 1;
  };

  return (
    <div className="job-create-container">
      <ScrollAnimation animation="fadeInUp">
        <Card 
          title={
            <div className="page-header">
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/jobs')}
                className="back-button"
              >
                返回职位列表
              </Button>
              <h2>发布新职位</h2>
            </div>
          }
          className="job-create-card"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="job-create-form"
          >
            <Row gutter={24}>
              <Col xs={24} lg={12}>
                <ScrollAnimation animation="slideInLeft" threshold={0.3}>
                  <Form.Item
                    label="职位标题"
                    name="title"
                    rules={[
                      { required: true, message: '请输入职位标题' },
                      { min: 2, max: 50, message: '职位标题长度应在2-50个字符之间' }
                    ]}
                  >
                    <Input placeholder="例如：前端开发工程师" />
                  </Form.Item>
                </ScrollAnimation>

                <ScrollAnimation animation="slideInLeft" threshold={0.3} delay={100}>
                  <Form.Item
                    label="公司名称"
                    name="company_name"
                    rules={[
                      { required: true, message: '请输入公司名称' },
                      { min: 2, max: 50, message: '公司名称长度应在2-50个字符之间' }
                    ]}
                  >
                    <Input placeholder="例如：科技有限公司" />
                  </Form.Item>
                </ScrollAnimation>

                <ScrollAnimation animation="slideInLeft" threshold={0.3} delay={200}>
                  <Form.Item
                    label="工作城市"
                    name="city_id"
                    rules={[{ required: true, message: '请选择工作城市' }]}
                  >
                    <Select placeholder="请选择城市">
                      {cities.map(city => (
                        <Option key={city.id} value={city.id}>
                          {city.city} ({city.province})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </ScrollAnimation>
              </Col>

              <Col xs={24} lg={12}>
                <ScrollAnimation animation="slideInRight" threshold={0.3}>
                  <Form.Item
                    label="职位类型"
                    name="job_type"
                    rules={[{ required: true, message: '请选择职位类型' }]}
                  >
                    <Select placeholder="请选择职位类型">
                      <Option value="full-time">全职</Option>
                      <Option value="part-time">兼职</Option>
                      <Option value="internship">实习</Option>
                      <Option value="contract">合同工</Option>
                    </Select>
                  </Form.Item>
                </ScrollAnimation>

                <ScrollAnimation animation="slideInRight" threshold={0.3} delay={100}>
                  <Form.Item
                    label="薪资范围"
                  >
                    <Space.Compact style={{ width: '100%' }}>
                      <Form.Item
                        name="salary_min"
                        noStyle
                        rules={[{ required: true, message: '请输入最低薪资' }]}
                      >
                        <InputNumber 
                          placeholder="最低薪资" 
                          min={0} 
                          style={{ width: '50%' }}
                          formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/¥\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                      <Form.Item
                        name="salary_max"
                        noStyle
                        rules={[{ required: true, message: '请输入最高薪资' }]}
                      >
                        <InputNumber 
                          placeholder="最高薪资" 
                          min={0} 
                          style={{ width: '50%' }}
                          formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/¥\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Space.Compact>
                  </Form.Item>
                </ScrollAnimation>

                <ScrollAnimation animation="slideInRight" threshold={0.3} delay={200}>
                  <Form.Item
                    label="工作经验要求"
                    name="experience_required"
                    rules={[{ required: true, message: '请选择工作经验要求' }]}
                  >
                    <Select placeholder="请选择工作经验">
                      <Option value="不限">不限</Option>
                      <Option value="应届生">应届生</Option>
                      <Option value="1年以下">1年以下</Option>
                      <Option value="1-3年">1-3年</Option>
                      <Option value="3-5年">3-5年</Option>
                      <Option value="5年以上">5年以上</Option>
                    </Select>
                  </Form.Item>
                </ScrollAnimation>
              </Col>
            </Row>

            <Divider />

            <ScrollAnimation animation="fadeInUp" threshold={0.3} delay={300}>
              <Form.Item
                label="职位描述"
                name="description"
                rules={[
                  { required: true, message: '请输入职位描述' },
                  { min: 10, max: 2000, message: '职位描述长度应在10-2000个字符之间' }
                ]}
              >
                <TextArea 
                  rows={6} 
                  placeholder="请详细描述职位职责、任职要求、福利待遇等信息"
                  showCount
                  maxLength={2000}
                />
              </Form.Item>
            </ScrollAnimation>

            <ScrollAnimation animation="fadeInUp" threshold={0.3} delay={400}>
              <Form.Item
                label="任职要求"
                name="requirements"
                rules={[
                  { required: true, message: '请输入任职要求' },
                  { min: 10, max: 1000, message: '任职要求长度应在10-1000个字符之间' }
                ]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="请列出具体的任职要求，如技能、学历、证书等"
                  showCount
                  maxLength={1000}
                />
              </Form.Item>
            </ScrollAnimation>

            <ScrollAnimation animation="fadeInUp" threshold={0.3} delay={500}>
              <Form.Item
                label="公司福利"
                name="benefits"
              >
                <TextArea 
                  rows={3} 
                  placeholder="请列出公司提供的福利待遇，如五险一金、带薪年假、餐补等"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </ScrollAnimation>

            <ScrollAnimation animation="fadeInUp" threshold={0.3} delay={600}>
              <Row gutter={24}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label="联系人"
                    name="contact_person"
                    rules={[
                      { required: true, message: '请输入联系人姓名' },
                      { min: 2, max: 20, message: '联系人姓名长度应在2-20个字符之间' }
                    ]}
                  >
                    <Input placeholder="请输入联系人姓名" />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
              label="联系电话"
              name="contact_phone"
              rules={[
                {
                  pattern: /^1[3-9]\d{9}$/,
                  message: '请输入正确的手机号码',
                },
              ]}
            >
              <Input placeholder="请输入联系电话（选填）" />
            </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label="工作区域"
                    name="district"
                    rules={[{ required: true, message: '请输入工作区域' }]}
                  >
                    <Input placeholder="例如：朝阳区" />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label="详细地址"
                    name="address"
                    rules={[{ required: true, message: '请输入详细地址' }]}
                  >
                    <Input placeholder="请输入详细地址" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label="工作时间"
                    name="work_time"
                    initialValue="9:00-18:00"
                    rules={[{ required: true, message: '请输入工作时间' }]}
                  >
                    <Input placeholder="例如：9:00-18:00" />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label="工作天数"
                    name="work_days"
                    initialValue="周一至周五"
                    rules={[{ required: true, message: '请输入工作天数' }]}
                  >
                    <Input placeholder="例如：周一至周五" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                label="微信号（选填）"
                name="contact_wechat"
              >
                <Input placeholder="请输入微信号（选填）" />
              </Form.Item>
              <div className="form-actions">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />}
                  loading={loading}
                  size="large"
                  className="submit-button"
                >
                  发布职位
                </Button>
                <Button 
                  onClick={() => navigate('/jobs')}
                  size="large"
                  className="cancel-button"
                >
                  取消
                </Button>
              </div>
            </ScrollAnimation>
          </Form>
        </Card>
      </ScrollAnimation>
    </div>
  );
};

export default JobCreate;