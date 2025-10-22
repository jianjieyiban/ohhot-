import React, { useState, useEffect, useRef } from 'react';
import { 
  Select, 
  Input, 
  Button, 
  Card, 
  Row, 
  Col, 
  Tag, 
  Space, 
  Divider,
  Spin,
  Empty,
  message
} from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  StarOutlined,
  HistoryOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useCity } from '../../contexts/CityContext';
import './CitySelector.css';

const { Option } = Select;



const CitySelector = ({ 
  onCityChange, 
  selectedCity, 
  style = {},
  placeholder = "选择城市",
  size = "default",
  showSearch = true,
  allowClear = true
}) => {
  const { cities, hotCities, loading, searchCities, initialized: cityInitialized } = useCity();
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentCities, setRecentCities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);

  // 从localStorage加载最近使用的城市
  useEffect(() => {
    const savedRecentCities = localStorage.getItem('recentCities');
    if (savedRecentCities) {
      try {
        setRecentCities(JSON.parse(savedRecentCities));
      } catch (error) {
        console.error('解析最近城市数据失败:', error);
      }
    }
  }, []);

  // 保存最近使用的城市到localStorage
  const saveRecentCity = (city) => {
    const cityData = cities.find(c => c.id === city) || { id: city, city: city };
    const updatedRecentCities = [
      cityData,
      ...recentCities.filter(c => c.id !== city)
    ].slice(0, 5); // 最多保存5个最近城市
    
    setRecentCities(updatedRecentCities);
    localStorage.setItem('recentCities', JSON.stringify(updatedRecentCities));
  };

  // 处理城市选择
  const handleCityChange = (value) => {
    if (value) {
      saveRecentCity(value);
      // 调用父组件的回调函数
      if (onCityChange) {
        onCityChange(value);
      }
    }
    setShowDropdown(false);
  };

  // 处理搜索
  const handleSearch = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    
    // 清除之前的搜索超时
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 设置搜索延迟
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // 使用API搜索城市
        const response = await searchCities(keyword);
        if (response.success) {
          setSearchResults(response.data);
        } else {
          message.error(response.message || '搜索失败');
        }
      } catch (error) {
        console.error('搜索城市失败:', error);
        message.error('搜索失败，请稍后重试');
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };



  // 渲染城市选项
  const renderCityOption = (city) => (
    <Option key={city.id} value={city.id}>
      <Space>
        <EnvironmentOutlined />
        <span>{city.city}</span>
        {city.province && (
          <Tag size="small" color="blue">{city.province}</Tag>
        )}
      </Space>
    </Option>
  );

  // 渲染下拉菜单内容
  const renderDropdown = () => (
    <div className="city-selector-dropdown">
      {/* 最近使用的城市 */}
      {recentCities.length > 0 && (
        <div className="city-section">
          <div className="section-header">
            <HistoryOutlined />
            <span>最近使用</span>
          </div>
          <Row gutter={[8, 8]} className="city-grid">
            {recentCities.map(city => (
              <Col span={12} key={city.id}>
                <Card 
                  size="small" 
                  className="city-card"
                  onClick={() => handleCityChange(city.id)}
                >
                  <Space>
                    <EnvironmentOutlined />
                    <span>{city.city}</span>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* 热门城市 */}
      {hotCities.length > 0 && (
        <div className="city-section">
          <div className="section-header">
            <FireOutlined />
            <span>热门城市</span>
          </div>
          <Row gutter={[8, 8]} className="city-grid">
            {hotCities.slice(0, 8).map(city => (
              <Col span={12} key={city.id}>
                <Card 
                  size="small" 
                  className="city-card hot-city"
                  onClick={() => handleCityChange(city.id)}
                >
                  <Space>
                    <StarOutlined style={{ color: '#ff6b35' }} />
                    <span>{city.city}</span>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* 搜索区域 */}
      <div className="search-section">
        <Input
          placeholder="搜索城市..."
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
        />
      </div>

      {/* 搜索结果 */}
      {searchLoading ? (
        <div className="loading-section">
          <Spin size="small" />
          <span>搜索中...</span>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="search-results">
          <div className="section-header">搜索结果</div>
          {searchResults.map(city => (
            <div 
              key={city.id} 
              className="search-result-item"
              onClick={() => handleCityChange(city.id)}
            >
              <Space>
                <EnvironmentOutlined />
                <span>{city.city}</span>
                {city.province && (
                  <Tag size="small" color="blue">{city.province}</Tag>
                )}
              </Space>
            </div>
          ))}
        </div>
      ) : (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description="暂无搜索结果"
          style={{ padding: '20px 0' }}
        />
      )}

      {/* 所有城市列表 */}
      {cities.length > 0 && (
        <div className="all-cities-section">
          <div className="section-header">所有城市</div>
          <div className="all-cities-list">
            {cities.slice(0, 50).map(city => renderCityOption(city))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="city-selector" style={style}>
      <Select
        placeholder={placeholder}
        value={selectedCity}
        onChange={handleCityChange}
        loading={loading}
        style={{ width: '100%' }}
        size={size}
        allowClear={allowClear}
        showSearch={showSearch}
        popupRender={renderDropdown}
        onOpenChange={setShowDropdown}
        filterOption={false}
        onSearch={handleSearch}
        notFoundContent={null}
        className="search-select"
      />
    </div>
  );
}

export default CitySelector;