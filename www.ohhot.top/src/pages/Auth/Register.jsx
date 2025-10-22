import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Radio, Select, Space } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined,
  IdcardOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useCity } from '../../contexts/CityContext';
import { cityList } from '../../data/cityFeatures';
import './Auth.css';

const { Option } = Select;

// 本地城市数据作为备用
const localCities = cityList.map(cityName => ({
  id: cityName,
  name: cityName
}));

// 城市名称到ID的映射（从数据库获取的真实映射）
const cityNameToIdMap = {
  '北京': 33,
  '上海': 34,
  '广州': 35,
  '深圳': 36,
  '天津': 37,
  '重庆': 38,
  '南京': 39,
  '苏州': 40,
  '杭州': 41,
  '成都': 42,
  '武汉': 43,
  '西安': 44,
  '长沙': 45,
  '郑州': 46,
  '合肥': 47,
  '青岛': 48,
  '东莞': 49,
  '宁波': 50,
  '佛山': 51,
  '济南': 52,
  '无锡': 53,
  '沈阳': 54,
  '昆明': 55,
  '福州': 56,
  '厦门': 57,
  '温州': 58,
  '石家庄': 59,
  '大连': 60,
  '哈尔滨': 61,
  '金华': 62,
  '泉州': 63,
  '南宁': 64,
  '长春': 65,
  '常州': 66,
  '南昌': 67,
  '南通': 68,
  '贵阳': 69,
  '嘉兴': 70,
  '徐州': 71,
  '惠州': 72,
  '太原': 73,
  '烟台': 74,
  '临沂': 75,
  '保定': 76,
  '台州': 77,
  '绍兴': 78,
  '珠海': 79,
  '洛阳': 80
};

// 根据城市名称获取城市ID
const getCityIdByName = (cityName) => {
  return cityNameToIdMap[cityName] || null;
};

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('jobseeker');
  const [citiesData, setCitiesData] = useState(localCities);
  const { register } = useAuth();
  const { cities: apiCities, getCities } = useCity();
  const navigate = useNavigate();

  React.useEffect(() => {
    // 直接使用本地城市数据，确保显示真实城市名称
    // 避免使用API数据，因为API可能返回数字编号格式
    setCitiesData(localCities);
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 将城市名称转换为城市ID
      const cityId = getCityIdByName(values.cityId);
      if (!cityId) {
        message.error('请选择有效的城市');
        return;
      }
      
      // 确保user_type字段符合后端要求
      const userType = values.userType === 'jobseeker' ? 'job_seeker' : 'employer';
      
      await register({
        username: values.username,
        email: values.email,
        phone: values.phone,
        password: values.password,
        cityId: cityId,
        user_type: userType,
        ...(userType === 'employer' && { companyName: values.companyName })
      });
      message.success('注册成功！请登录');
      navigate('/login');
    } catch (error) {
      message.error(error.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" title="注册三石招聘">
          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
            scrollToFirstError
          >
            <Form.Item
              name="userType"
              initialValue="jobseeker"
              rules={[{ required: true, message: '请选择用户类型' }]}
            >
              <Radio.Group 
                buttonStyle="solid" 
                onChange={(e) => setUserType(e.target.value)}
                className="user-type-group"
              >
                <Radio.Button value="jobseeker">求职者</Radio.Button>
                <Radio.Button value="employer">企业用户</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 2, max: 20, message: '用户名2-20个字符' },
                { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文字符' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="邮箱地址"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: '请输入手机号码' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
              ]}
            >
              <Input 
                prefix={<PhoneOutlined />} 
                placeholder="手机号码"
              />
            </Form.Item>

            {userType === 'employer' && (
              <Form.Item
                name="companyName"
                rules={[
                  { required: true, message: '请输入公司名称' },
                  { min: 2, max: 50, message: '公司名称2-50个字符' }
                ]}
              >
                <Input 
                  prefix={<IdcardOutlined />} 
                  placeholder="公司名称"
                />
              </Form.Item>
            )}

            <Form.Item
              name="cityId"
              rules={[{ required: true, message: '请选择所在城市' }]}
            >
              <Select placeholder="选择所在城市">
                {citiesData.map(city => (
                  <Option key={city.id} value={city.id}>{city.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位字符' },
                { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含大小写字母和数字' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="确认密码"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                className="auth-button"
              >
                注册
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-links">
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <div>
                已有账号？<Link to="/login">立即登录</Link>
              </div>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;