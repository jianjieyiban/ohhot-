import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Carousel, 
  Button, 
  Input, 
  Select, 
  Row, 
  Col, 
  Statistic, 
  Card, 
  Tag, 
  Space, 
  Typography,
  Alert
} from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  RocketOutlined,
  TrophyOutlined,
  SafetyCertificateOutlined,
  CodeOutlined,
  DatabaseOutlined,
  BugOutlined,
  MobileOutlined,
  CloudOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { useJob } from '../../contexts/JobContext';
import { useCity } from '../../contexts/CityContext';
import CitySelector from '../../components/CitySelector/CitySelector';
import { ScrollAnimation, Parallax, ScrollProgress, ScrollToTop } from '../../components/index.js';
import { hefeiDistricts, hefeiIndustrialParks } from '../../data/hefeiDistricts';
import { hotCities } from '../../data/cityFeatures';
import './Home.css';

const { Title, Paragraph } = Typography;
const { Option } = Select;

// 根据职位类型获取图标
const getJobIcon = (jobType, industry) => {
  const jobTypeLower = jobType?.toLowerCase() || '';
  const industryLower = industry?.toLowerCase() || '';
  
  if (jobTypeLower.includes('frontend') || jobTypeLower.includes('前端')) {
    return <CodeOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
  } else if (jobTypeLower.includes('backend') || jobTypeLower.includes('后端')) {
    return <DatabaseOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
  } else if (jobTypeLower.includes('qa') || jobTypeLower.includes('测试')) {
    return <BugOutlined style={{ fontSize: '24px', color: '#faad14' }} />;
  } else if (jobTypeLower.includes('mobile') || jobTypeLower.includes('移动')) {
    return <MobileOutlined style={{ fontSize: '24px', color: '#722ed1' }} />;
  } else if (jobTypeLower.includes('cloud') || jobTypeLower.includes('云')) {
    return <CloudOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />;
  } else if (jobTypeLower.includes('ai') || jobTypeLower.includes('算法')) {
    return <RobotOutlined style={{ fontSize: '24px', color: '#eb2f96' }} />;
  } else if (industryLower.includes('互联网') || industryLower.includes('科技')) {
    return <CodeOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
  } else if (industryLower.includes('金融') || industryLower.includes('银行')) {
    return <DollarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
  } else {
    return <CodeOutlined style={{ fontSize: '24px', color: '#8c8c8c' }} />;
  }
};

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

const Home = () => {
  const { jobs, loading, fetchJobs, fetchFeaturedJobs } = useJob();
  const { cities, hotCities, loading: cityLoading, error: cityError, fetchCities, fetchHotCities } = useCity();

  // 根据城市名称获取城市ID
  const getCityIdByName = (cityName) => {
    const cityMap = {
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
    return cityMap[cityName] || null;
  };

  // 全国一二线城市列表（一线城市优先，按等级排序）
  const majorCities = [
    // 一线城市（4个）
    { name: '北京', tier: 'tier1' },
    { name: '上海', tier: 'tier1' },
    { name: '广州', tier: 'tier1' },
    { name: '深圳', tier: 'tier1' },
    
    // 新一线城市（15个）
    { name: '成都', tier: 'tier2' },
    { name: '杭州', tier: 'tier2' },
    { name: '重庆', tier: 'tier2' },
    { name: '武汉', tier: 'tier2' },
    { name: '苏州', tier: 'tier2' },
    { name: '西安', tier: 'tier2' },
    { name: '南京', tier: 'tier2' },
    { name: '长沙', tier: 'tier2' },
    { name: '郑州', tier: 'tier2' },
    { name: '天津', tier: 'tier2' },
    { name: '合肥', tier: 'tier2' },
    { name: '青岛', tier: 'tier2' },
    { name: '东莞', tier: 'tier2' },
    { name: '宁波', tier: 'tier2' },
    { name: '佛山', tier: 'tier2' },
    
    // 二线城市（20个）
    { name: '济南', tier: 'tier3' },
    { name: '无锡', tier: 'tier3' },
    { name: '沈阳', tier: 'tier3' },
    { name: '昆明', tier: 'tier3' },
    { name: '福州', tier: 'tier3' },
    { name: '厦门', tier: 'tier3' },
    { name: '温州', tier: 'tier3' },
    { name: '石家庄', tier: 'tier3' },
    { name: '大连', tier: 'tier3' },
    { name: '哈尔滨', tier: 'tier3' },
    { name: '金华', tier: 'tier3' },
    { name: '泉州', tier: 'tier3' },
    { name: '南宁', tier: 'tier3' },
    { name: '长春', tier: 'tier3' },
    { name: '常州', tier: 'tier3' },
    { name: '南昌', tier: 'tier3' },
    { name: '南通', tier: 'tier3' },
    { name: '贵阳', tier: 'tier3' },
    { name: '嘉兴', tier: 'tier3' },
    { name: '徐州', tier: 'tier3' },
    { name: '惠州', tier: 'tier3' },
    { name: '太原', tier: 'tier3' },
    { name: '烟台', tier: 'tier3' },
    { name: '临沂', tier: 'tier3' },
    { name: '保定', tier: 'tier3' },
    { name: '台州', tier: 'tier3' },
    { name: '绍兴', tier: 'tier3' },
    { name: '珠海', tier: 'tier3' },
    { name: '洛阳', tier: 'tier3' }
  ];
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    city: '',
    salary: '',
    experience: ''
  });
  const [featuredJobs, setFeaturedJobs] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchJobs();
        const citiesResult = await fetchCities();
        if (!citiesResult.success) {
          console.error('获取城市列表失败:', citiesResult.message);
        }
        
        // 加载热门城市
        console.log('开始加载热门城市...');
        const hotCitiesResult = await fetchHotCities();
        console.log('热门城市加载结果:', hotCitiesResult);
        if (!hotCitiesResult.success) {
          console.error('获取热门城市失败:', hotCitiesResult.message);
        } else {
          console.log('热门城市数据:', hotCitiesResult.data);
        }
        
        // 获取热门职位
        const result = await fetchFeaturedJobs();
        if (result.success) {
          setFeaturedJobs(result.data);
        }
      } catch (error) {
        console.error('加载数据失败:', error);
      }
    };
    
    loadData();
  }, []);

  const handleSearch = () => {
    // 实现搜索逻辑
    fetchJobs(searchParams);
  };

  const displayHotCities = hotCities?.length > 0 
    ? hotCities.slice(0, 20) // 显示前20个热门城市
    : majorCities.slice(0, 20); // 如果API数据未加载，使用静态数据作为备选
  
  console.log('热门城市数据:', hotCities);
  console.log('显示的热门城市:', displayHotCities);

  const carouselItems = [
    {
      title: '发现理想工作',
      description: '连接优秀人才与优质企业',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop',
      color: '#2f54eb'
    },
    {
      title: '专业招聘平台',
      description: '高效匹配，精准推荐',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
      color: '#52c41a'
    },
    {
      title: '职业发展伙伴',
      description: '助力您的职业成长',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
      color: '#faad14'
    }
  ];

  const stats = [
    { value: 10000, label: '注册企业', prefix: <UserOutlined /> },
    { value: 50000, label: '在招职位', prefix: <RocketOutlined /> },
    { value: 200000, label: '求职用户', prefix: <TrophyOutlined /> },
    { value: 95, label: '成功率', suffix: '%', prefix: <SafetyCertificateOutlined /> }
  ];

  return (
    <div className="home-page">
      {/* 错误提示 */}
      {cityError && (
        <Alert
          message="数据加载错误"
          description={cityError}
          type="error"
          showIcon
          closable
          style={{ margin: '16px' }}
        />
      )}
      
      {/* 滚动进度指示器 */}
      <ScrollProgress position="top" height={4} color="#1890ff" />
      
      {/* 轮播图区域 */}
      <section className="hero-section">
        <Parallax speed={0.5}>
          <Carousel autoplay className="home-carousel">
            {carouselItems.map((item, index) => (
              <div key={index} className="carousel-item">
                <div 
                  className="carousel-content" 
                  style={{ background: `linear-gradient(135deg, ${item.color} 0%, #fff 100%)` }}
                >
                  <div className="carousel-text">
                    <ScrollAnimation animation="fadeInUp" delay={300}>
                      <Title level={1} className="carousel-title">{item.title}</Title>
                    </ScrollAnimation>
                    <ScrollAnimation animation="fadeInUp" delay={500}>
                      <Paragraph className="carousel-description">{item.description}</Paragraph>
                    </ScrollAnimation>
                    <ScrollAnimation animation="fadeInUp" delay={700}>
                      <Button type="primary" size="large" className="cta-button">
                        立即探索
                      </Button>
                    </ScrollAnimation>
                  </div>
                  <div className="carousel-image">
                    <ScrollAnimation animation="zoomIn" delay={400}>
                      <img src={item.image} alt={item.title} />
                    </ScrollAnimation>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </Parallax>
      </section>

      {/* 搜索区域 */}
      <section className="search-section">
        <ScrollAnimation animation="fadeInUp" threshold={0.3}>
          <div className="search-container">
            <ScrollAnimation animation="fadeInUp" delay={200}>
              <Title level={2} className="search-title">找到理想工作</Title>
            </ScrollAnimation>
            <ScrollAnimation animation="fadeInUp" delay={400}>
              <div className="search-form">
                <Space size="middle" className="search-fields">
                  <ScrollAnimation animation="slideInLeft" delay={600}>
                    <Input
                      placeholder="职位、公司或关键词"
                      prefix={<SearchOutlined />}
                      value={searchParams.keyword}
                      onChange={(e) => setSearchParams({...searchParams, keyword: e.target.value})}
                      className="search-input"
                    />
                  </ScrollAnimation>
                  <ScrollAnimation animation="slideInLeft" delay={800}>
                    <CitySelector
                      placeholder="选择城市"
                      value={searchParams.city}
                      onChange={(cityId, cityName) => setSearchParams({...searchParams, city: cityId})}
                      className="search-select"
                    />
                  </ScrollAnimation>
                  <ScrollAnimation animation="slideInLeft" delay={400}>
                    <Select
                      placeholder="薪资范围"
                      value={searchParams.salary}
                      onChange={(value) => setSearchParams({...searchParams, salary: value})}
                      className="search-select"
                    >
                      <Option value="0-5">5k以下</Option>
                      <Option value="5-10">5-10k</Option>
                      <Option value="10-20">10-20k</Option>
                      <Option value="20-50">20-50k</Option>
                      <Option value="50+">50k以上</Option>
                    </Select>
                  </ScrollAnimation>
                  <ScrollAnimation animation="slideInRight" delay={500}>
                    <Button 
                      type="primary" 
                      icon={<SearchOutlined />} 
                      onClick={handleSearch}
                      className="search-button"
                    >
                      搜索
                    </Button>
                  </ScrollAnimation>
                </Space>
              </div>
            </ScrollAnimation>
          </div>
        </ScrollAnimation>
      </section>

      {/* 数据统计 */}
      <section className="stats-section">
        <ScrollAnimation animation="fadeInUp" threshold={0.3}>
          <Row gutter={[24, 24]} justify="center">
            {stats.map((stat, index) => (
              <Col xs={12} sm={6} key={index}>
                <ScrollAnimation 
                  animation="bounceIn" 
                  delay={index * 200}
                  duration={800}
                >
                  <Statistic
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                    title={stat.label}
                    className="stat-item"
                  />
                </ScrollAnimation>
              </Col>
            ))}
          </Row>
        </ScrollAnimation>
      </section>

      {/* 热门职位 */}
      <section className="featured-jobs-section">
        <div className="section-container">
          <ScrollAnimation animation="fadeInUp" delay={200}>
            <Title level={2} className="section-title">热门职位</Title>
          </ScrollAnimation>
          <Row gutter={[16, 16]}>
            {featuredJobs.map((job, index) => (
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
                      <Button type="link" key="apply">立即申请</Button>
                    ]}
                  >
                    <Card.Meta
                      avatar={
                        <div className="company-avatar">
                          {getJobIcon(job.title, job.industry)}
                        </div>
                      }
                      title={job.title}
                      description={
                        <div className="job-meta">
                          <div className="company-name">{job.company?.name}</div>
                          <Space size="small" className="job-tags">
                            <Tag icon={<EnvironmentOutlined />} color="blue">{job.city?.name}</Tag>
                            <Tag icon={<DollarOutlined />} color="green">{job.salary}</Tag>
                            <Tag icon={<CalendarOutlined />} color="orange">{job.experience}</Tag>
                          </Space>
                        </div>
                      }
                    />
                  </Card>
                </ScrollAnimation>
              </Col>
            ))}
          </Row>
          <ScrollAnimation animation="fadeInUp" delay={800}>
            <div className="section-footer">
              <Link to="/jobs">
                <Button type="primary" size="large">查看所有职位</Button>
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* 合肥特色区域 */}
      <section className="hefei-section">
        <div className="section-container">
          <ScrollAnimation animation="fadeInUp" delay={200}>
            <div className="hefei-header">
              <Title level={2} className="section-title">
                <span className="hefei-highlight">合肥</span>本地招聘
              </Title>
              <Paragraph className="hefei-description">
                作为合肥本地运营的招聘平台，我们专注于为合肥及周边地区提供最优质的招聘服务
              </Paragraph>
            </div>
          </ScrollAnimation>
          
          {/* 合肥下级地区 */}
          <ScrollAnimation animation="fadeInUp" delay={400}>
            <div className="hefei-districts">
              <Title level={3} className="subsection-title">合肥各区县</Title>
              <Row gutter={[12, 12]}>
                {hefeiDistricts.map((district, index) => (
                  <Col xs={12} sm={8} md={6} lg={4} key={district.id}>
                    <ScrollAnimation 
                      animation="slideInUp" 
                      delay={400 + (index % 3) * 50}
                      threshold={0.2}
                    >
                      <Card 
                        className="district-card"
                        hoverable
                        onClick={() => setSearchParams({...searchParams, city: 47, district: district.id})}
                      >
                        <div className="district-content">
                          <EnvironmentOutlined className="district-icon" />
                          <div className="district-info">
                            <div className="district-name">{district.name}</div>
                            <div className="district-jobs">{district.jobCount} 个职位</div>
                            <div className="district-industries">
                              {district.industries.slice(0, 2).map(industry => (
                                <Tag key={industry} size="small" color="blue">{industry}</Tag>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </ScrollAnimation>
                  </Col>
                ))}
              </Row>
            </div>
          </ScrollAnimation>
          
          {/* 合肥特色产业园区 */}
          <ScrollAnimation animation="fadeInUp" delay={600}>
            <div className="hefei-parks">
              <Title level={3} className="subsection-title">特色产业园区</Title>
              <Row gutter={[16, 16]}>
                {hefeiIndustrialParks.map((park, index) => (
                  <Col xs={24} sm={12} lg={8} key={park.name}>
                    <ScrollAnimation 
                      animation="zoomIn" 
                      delay={600 + index * 100}
                      threshold={0.2}
                    >
                      <Card 
                        className="park-card"
                        hoverable
                        cover={
                          <div className="park-image">
                            <EnvironmentOutlined />
                          </div>
                        }
                      >
                        <Card.Meta
                          title={park.name}
                          description={
                            <div>
                              <p>{park.description}</p>
                              <div className="park-companies">
                                <strong>重点企业：</strong>
                                {park.keyCompanies.slice(0, 3).map(company => (
                                  <Tag key={company} size="small" color="green">{company}</Tag>
                                ))}
                              </div>
                            </div>
                          }
                        />
                      </Card>
                    </ScrollAnimation>
                  </Col>
                ))}
              </Row>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* 热门城市 */}
      <section className="hot-cities-section">
        <div className="section-container">
          <ScrollAnimation animation="fadeInUp" delay={200}>
            <Title level={2} className="section-title">热门城市</Title>
            <Paragraph className="section-subtitle">覆盖全国主要城市，为您提供更多就业机会</Paragraph>
          </ScrollAnimation>
          {/* 调试信息 */}
          <div style={{marginBottom: '16px', padding: '8px', background: '#f0f0f0', borderRadius: '4px'}}>
            <p>热门城市数量: {hotCities?.length || 0}</p>
            <p>显示城市数量: {displayHotCities.length}</p>
            <p>城市加载状态: {cityLoading ? '加载中' : '已完成'}</p>
            {cityError && <p style={{color: 'red'}}>错误信息: {cityError}</p>}
          </div>
          <div className="cities-tags-grid">
            {displayHotCities.length > 0 ? (
              displayHotCities.map((city, index) => (
                <Tag 
                  key={city.id || index}
                  className="city-tag"
                  onClick={() => {
                    // 使用API返回的城市ID或城市名称查找ID
                    let cityId = null;
                    
                    if (city.id) {
                      // 如果API返回了城市ID，直接使用
                      cityId = city.id;
                    } else if (city.city) {
                      // 如果只有城市名称，通过名称查找ID
                      cityId = getCityIdByName(city.city);
                    } else if (typeof city === 'string') {
                      // 如果是字符串格式的城市名称
                      cityId = getCityIdByName(city);
                    }
                    
                    // 跳转到该城市的职位页面
                    if (cityId) {
                      window.location.href = `/jobs?city=${cityId}`;
                    } else {
                      // 如果找不到城市ID，跳转到默认城市
                      window.location.href = `/jobs?city=33`; // 默认北京
                    }
                  }}
                >
                  {city.city || city.name || city}
                </Tag>
              ))
            ) : (
              // 如果没有数据，显示加载状态或提示信息
              <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>
                {cityLoading ? '正在加载热门城市...' : '暂无热门城市数据'}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* 滚动到顶部按钮 */}
      <ScrollToTop threshold={300} size="large" />
    </div>
  );
};

export default Home;