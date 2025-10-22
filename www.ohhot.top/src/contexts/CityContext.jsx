import React, { createContext, useContext, useState, useEffect } from 'react';
import { cityAPI } from '../utils/api';

const CityContext = createContext();

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity必须在CityProvider内使用');
  }
  return context;
};

export const CityProvider = ({ children }) => {
  const [cities, setCities] = useState([]);
  const [hotCities, setHotCities] = useState([]);
  const [currentCity, setCurrentCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const fetchCities = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cityAPI.getCities(filters);
      
      if (response.success) {
        setCities(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.message || '获取城市列表失败');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '获取城市列表失败，请检查网络连接';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const fetchHotCities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cityAPI.getHotCities();
      
      if (response.success) {
        setHotCities(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.message || '获取热门城市失败');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '获取热门城市失败，请检查网络连接';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const fetchCityDetail = async (cityId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cityAPI.getCityDetail(cityId);
      
      if (response.success) {
        setCurrentCity(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.message || '获取城市详情失败');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '获取城市详情失败，请检查网络连接';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const searchCities = async (keyword) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cityAPI.searchCities(keyword);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message || '搜索城市失败');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '搜索城市失败，请检查网络连接';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 在组件挂载时自动加载城市数据
  useEffect(() => {
    if (!initialized) {
      const initializeData = async () => {
        try {
          // 并行加载城市数据和热门城市数据
          await Promise.all([
            fetchCities(),
            fetchHotCities()
          ]);
          setInitialized(true);
        } catch (error) {
          console.error('初始化城市数据失败:', error);
        }
      };
      
      initializeData();
    }
  }, [initialized]);

  const clearError = () => setError(null);
  const clearCurrentCity = () => setCurrentCity(null);

  const value = {
    cities,
    hotCities,
    currentCity,
    loading,
    error,
    initialized,
    fetchCities,
    fetchHotCities,
    fetchCityDetail,
    searchCities,
    clearError,
    clearCurrentCity,
    // 添加getCities别名以兼容现有代码
    getCities: fetchCities
  };

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  );
};

// 确保导出一致性
export { CityContext };
export default CityContext;