import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { message } from 'antd';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内使用');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 检查用户登录状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authAPI.getCurrentUser();
      if (response.success) {
        // 确保用户信息包含user_type字段
        if (response.data && typeof response.data.user_type !== 'undefined') {
          setUser(response.data);
          console.log('用户认证状态更新:', response.data.user_type);
        } else {
          console.error('用户数据缺少user_type字段:', response.data);
          // 只在非登录页面时清除token
          const currentPath = window.location.pathname;
          const isLoginPage = currentPath === '/admin-login' || currentPath === '/login';
          if (!isLoginPage) {
            localStorage.removeItem('token');
          }
        }
      } else {
        // token无效，只在非登录页面时清除本地存储
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath === '/admin-login' || currentPath === '/login';
        if (!isLoginPage) {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
      // 只在非登录页面时清除token
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === '/admin-login' || currentPath === '/login';
      if (!isLoginPage) {
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const login = async (emailOrIdentifier, password, securityKey = null) => {
    try {
      setError(null);
      setLoading(true);
      
      // 判断是邮箱还是手机号
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrIdentifier);
      
      // 统一使用loginIdentifier参数，这是后端期望的参数名
      const credentials = { 
        loginIdentifier: emailOrIdentifier,
        password 
      };
      
      if (securityKey) {
        credentials.securityKey = securityKey;
      }
      
      console.log('登录请求参数:', credentials);
      const response = await authAPI.login(credentials);
      
      // 检查响应结构
      if (response && response.success) {
        console.log('登录响应数据:', response);
        
        // 存储token
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        // 确保用户信息包含user_type字段
        if (response.data && response.data.user && typeof response.data.user.user_type !== 'undefined') {
          // 更新用户状态
          setUser(response.data.user);
          console.log('用户登录成功，用户类型:', response.data.user.user_type);
          
          // 返回成功响应
          return {
            success: true,
            message: response.message || '登录成功',
            data: response.data
          };
        } else {
          console.error('登录响应数据缺少user_type字段:', response.data);
          setError('登录响应数据异常');
          return { success: false, message: '登录响应数据异常' };
        }
      } else {
        // 登录失败，返回错误信息
        const errorMessage = response?.message || '登录失败';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('登录错误详情:', error);
      console.error('错误响应:', error.response);
      
      const errorMessage = error.response?.data?.message || error.message || '登录失败';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        return { success: true };
      } else {
        setError(response.message || '注册失败');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '注册失败，请检查网络连接';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setError(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        // 确保用户信息包含user_type字段
        if (response.data && typeof response.data.user_type !== 'undefined') {
          setUser(response.data);
          console.log('用户资料更新成功，用户类型:', response.data.user_type);
        } else {
          console.error('更新资料响应数据缺少user_type字段:', response.data);
          // 如果响应中没有user_type，保持原有的用户类型
          if (user && user.user_type) {
            const updatedUser = { ...response.data, user_type: user.user_type };
            setUser(updatedUser);
            console.log('已保持原有用户类型:', user.user_type);
          }
        }
        return { success: true };
      } else {
        setError(response.message || '更新失败');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '更新失败，请检查网络连接';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!user,
    isEmployer: user?.user_type === 3,
    isJobSeeker: user?.user_type === 1,
    isAdmin: user?.user_type === 2
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;