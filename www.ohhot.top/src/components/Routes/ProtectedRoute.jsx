import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, hasRole } = useAuth();

  // 如果用户未认证，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 如果要求特定角色但用户没有该角色
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        color: '#ff4d4f'
      }}>
        <h2>权限不足</h2>
        <p>您没有访问此页面的权限</p>
        <button 
          onClick={() => window.history.back()}
          style={{ 
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          返回上一页
        </button>
      </div>
    );
  }

  // 如果用户已认证且具有所需权限，渲染子组件
  return children;
};

export default ProtectedRoute;