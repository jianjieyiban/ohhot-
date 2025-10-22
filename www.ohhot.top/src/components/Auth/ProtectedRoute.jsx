import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute检查:', { 
    path: location.pathname, 
    isAuthenticated, 
    isAdmin, 
    adminOnly, 
    userType: user?.user_type,
    loading 
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <span style={{ marginLeft: '10px' }}>检查登录状态...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // 重定向到登录页面，并保存当前路径以便登录后返回
    console.log('用户未认证，重定向到登录页面');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果要求管理员权限但当前用户不是管理员
  if (adminOnly && !isAdmin) {
    console.log('用户不是管理员，重定向到首页');
    return <Navigate to="/" replace />;
  }

  console.log('路由保护检查通过，渲染子组件');
  return children;
};

export default ProtectedRoute;