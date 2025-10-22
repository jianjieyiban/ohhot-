import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Select, 
  InputNumber, 
  DatePicker,
  message, 
  Space, 
  Divider,
  Spin,
  Row,
  Col
} from 'antd';
import { 
  SaveOutlined, 
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined 
} from '@ant-design/icons';
import { useJob } from '../../contexts/JobContext';
import { useCity } from '../../contexts/CityContext';
import './JobEdit.css';

const { Option } = Select;
const { TextArea } = Input;

const JobEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createJob, updateJob, getJobDetail, job, loading } = useJob();
  const { cities, getCities } = useCity();
  
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [benefits, setBenefits] = useState([]);
  const [newBenefit, setNewBenefit] = useState('');

  const isEdit = !!id;

  useEffect(() => {
    getCities();
    
    if (isEdit && id) {
      getJobDetail(id).then(jobData => {
        if (jobData) {
          form.setFieldsValue({
            ...jobData,
            deadline: jobData.deadline ? moment(jobData.deadline) : null
          });
          if (jobData.benefits) {
            setBenefits(jobData.benefits.split(','));
          }
        }
      });
    }
  }, [id, isEdit]);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const jobData = {
        ...values,
        benefits: benefits.join(','),
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null
      };

      if (isEdit) {
        await updateJob(id, jobData);
        message.success('职位更新成功！');
      } else {
        await createJob(jobData);
        message.success('职位创建成功！');
      }
      
      navigate('/jobs/my');
    } catch (error) {
      message.error(error.message || '操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (index) => {
    const newBenefits = [...benefits];
    newBenefits.splice(index, 1);
    setBenefits(newBenefits);
  };

  const salaryOptions = [
    { value: '面议', label: '面议' },
    { value: '3-5k', label: '3-5k' },
    { value: '5-8k', label: '5-8k' },
    { value: '8-12k', label: '8-12k' },
    { value: '12-20k', label: '12-20k' },
    { value: '20-30k', label: '20-30k' },
    { value: '30-50k', label: '30-50k' },
    { value: '50k以上', label: '50k以上' }
  ];

  const experienceOptions = [
    { value: '不限', label: '经验不限' },
    { value: '应届生', label: '应届生' },
    { value: '1年以下', label: '1年以下' },
    { value: '1-3年', label: '1-3年' },
    { value: '3-5年', label: '3-5年' },
    { value: '5-10年', label: '5-10年' },
    { value: '10年以上', label: '10年以上' }
  ];

  const educationOptions = [
    { value: '不限', label: '学历不限' },
    { value: '高中', label: '高中' },
    { value: '大专', label: '大专' },
    { value: '本科', label: '本科' },
    { value: '硕士', label: '硕士' },
    { value: '博士', label: '博士' }
  ];

  if (loading && isEdit) {
    return (
      <div className="job-edit-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="job-edit-page">
      <div className="job-edit-container">
        {/* 头部 */}
        <div className="edit-header">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            className="back-button"
          >
            返回
          </Button>
          <h1>{isEdit ? '编辑职位' : '发布新职位'}</h1>
        </div>

        <Card className="edit-card">
          <Form
            form={form}
            name="jobEdit"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            scrollToFirstError
          >
            <Row gutter={[24, 16]}>
              {/* 基本信息 */}
              <Col xs={24}>
                <Divider orientation="left">基本信息</Divider>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="title"
                  label="职位标题"
                  rules={[
                    { required: true, message: '请输入职位标题' },
                    { min: 2, max: 50, message: '职位标题2-50个字符' }
                  ]}
                >
                  <Input placeholder="例如：前端开发工程师" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="cityId"
                  label="工作城市"
                  rules={[{ required: true, message: '请选择工作城市' }]}
                >
                  <Select placeholder="选择城市">
                    {cities.map(city => (
                      <Option key={city.id} value={city.id}>{city.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="address"
                  label="详细地址"
                  rules={[{ required: true, message: '请输入详细工作地址' }]}
                >
                  <Input placeholder="例如：北京市朝阳区xxx街道xxx号" />
                </Form.Item>
              </Col>

              {/* 薪资待遇 */}
              <Col xs={24}>
                <Divider orientation="left">薪资待遇</Divider>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="salary"
                  label="薪资范围"
                  rules={[{ required: true, message: '请选择薪资范围' }]}
                >
                  <Select placeholder="选择薪资范围">
                    {salaryOptions.map(option => (
                      <Option key={option.value} value={option.value}>{option.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="experience"
                  label="经验要求"
                  rules={[{ required: true, message: '请选择经验要求' }]}
                >
                  <Select placeholder="选择经验要求">
                    {experienceOptions.map(option => (
                      <Option key={option.value} value={option.value}>{option.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="education"
                  label="学历要求"
                  rules={[{ required: true, message: '请选择学历要求' }]}
                >
                  <Select placeholder="选择学历要求">
                    {educationOptions.map(option => (
                      <Option key={option.value} value={option.value}>{option.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="vacancy"
                  label="招聘人数"
                  rules={[{ required: true, message: '请输入招聘人数' }]}
                >
                  <InputNumber 
                    min={1} 
                    max={100} 
                    placeholder="例如：5" 
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="deadline"
                  label="截止日期"
                  rules={[{ required: true, message: '请选择截止日期' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    placeholder="选择截止日期"
                  />
                </Form.Item>
              </Col>

              {/* 职位描述 */}
              <Col xs={24}>
                <Divider orientation="left">职位描述</Divider>
              </Col>
              
              <Col xs={24}>
                <Form.Item
                  name="description"
                  label="职位描述"
                  rules={[
                    { required: true, message: '请输入职位描述' },
                    { min: 10, message: '职位描述至少10个字符' }
                  ]}
                >
                  <TextArea 
                    rows={6} 
                    placeholder="详细描述职位职责、工作内容等..."
                    showCount
                    maxLength={2000}
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="requirements"
                  label="职位要求"
                  rules={[
                    { required: true, message: '请输入职位要求' },
                    { min: 10, message: '职位要求至少10个字符' }
                  ]}
                >
                  <TextArea 
                    rows={6} 
                    placeholder="详细描述职位要求、技能要求等..."
                    showCount
                    maxLength={2000}
                  />
                </Form.Item>
              </Col>

              {/* 福利待遇 */}
              <Col xs={24}>
                <Divider orientation="left">福利待遇</Divider>
              </Col>
              
              <Col xs={24}>
                <div className="benefits-section">
                  <div className="benefits-input">
                    <Input
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      placeholder="输入福利待遇"
                      onPressEnter={addBenefit}
                    />
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      onClick={addBenefit}
                      className="add-benefit-btn"
                    >
                      添加
                    </Button>
                  </div>
                  
                  <div className="benefits-list">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="benefit-item">
                        <span>{benefit}</span>
                        <Button 
                          type="text" 
                          icon={<DeleteOutlined />} 
                          onClick={() => removeBenefit(index)}
                          size="small"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Col>

              {/* 操作按钮 */}
              <Col xs={24}>
                <Divider />
                <Form.Item>
                  <Space size="large">
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={submitting}
                      icon={<SaveOutlined />}
                      size="large"
                    >
                      {isEdit ? '更新职位' : '发布职位'}
                    </Button>
                    <Button 
                      onClick={() => navigate(-1)}
                      size="large"
                    >
                      取消
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default JobEdit;