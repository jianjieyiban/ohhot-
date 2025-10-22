import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { debounce } from '../utils/helpers';
import './SearchBar.css';

const SearchBar = ({ 
  placeholder = "搜索职位、公司或关键词...", 
  size = "large",
  showFilters = false,
  onSearch,
  className = ""
}) => {
  const [keyword, setKeyword] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // 模拟搜索建议
  const mockSuggestions = [
    '前端开发',
    '后端开发',
    'Java工程师',
    'Python开发',
    '产品经理',
    'UI设计师',
    '测试工程师',
    '运维工程师'
  ];

  // 防抖搜索
  const debouncedSearch = debounce((value) => {
    if (value.trim()) {
      // 模拟API调用获取搜索建议
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, 300);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    debouncedSearch(value);
  };

  const handleSearch = (searchKeyword = keyword) => {
    if (searchKeyword.trim()) {
      if (onSearch) {
        onSearch(searchKeyword.trim());
      } else {
        // 默认跳转到搜索页面
        navigate(`/jobs?keyword=${encodeURIComponent(searchKeyword.trim())}`);
      }
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setKeyword(suggestion);
    handleSearch(suggestion);
  };

  const handleClear = () => {
    setKeyword('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (keyword.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // 延迟隐藏建议列表，以便点击建议项
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className={`search-bar ${size} ${className}`}>
      <div className="search-input-container">
        <div className="search-icon">🔍</div>
        <input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="search-input"
        />
        {keyword && (
          <Button 
            className="clear-btn" 
            onClick={handleClear} 
            title="清除"
            type="text"
            size="small"
          >
            ×
          </Button>
        )}
        <Button 
          className="search-btn" 
          onClick={() => handleSearch()}
          disabled={!keyword.trim()}
          type="primary"
        >
          搜索
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="suggestion-text">{suggestion}</span>
              <span className="suggestion-hint">点击搜索</span>
            </div>
          ))}
        </div>
      )}

      {showFilters && (
        <div className="search-filters">
          <div className="filter-group">
            <select className="filter-select">
              <option value="">所有城市</option>
              <option value="beijing">北京</option>
              <option value="shanghai">上海</option>
              <option value="guangzhou">广州</option>
              <option value="shenzhen">深圳</option>
            </select>
          </div>
          
          <div className="filter-group">
            <select className="filter-select">
              <option value="">所有类型</option>
              <option value="full_time">全职</option>
              <option value="part_time">兼职</option>
              <option value="internship">实习</option>
            </select>
          </div>
          
          <div className="filter-group">
            <select className="filter-select">
              <option value="">所有经验</option>
              <option value="no_experience">无经验</option>
              <option value="junior">1-3年</option>
              <option value="middle">3-5年</option>
            </select>
          </div>
          
          <Button className="advanced-filter-btn" type="default">
            高级筛选
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;