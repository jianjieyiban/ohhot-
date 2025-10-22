import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PublicRoute = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated } = useAuth();

  // 如果用户已认证，重定向到指定页面（默认为首页）
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // 如果用户未认证，渲染公共页面
  return children;
};

export default PublicRoute;