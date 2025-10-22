import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
  BellOutlined,
} from '@ant-design/icons';

import { useAuth } from '../../contexts/AuthContext';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // 菜单项配置
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/jobs',
      icon: <SearchOutlined />,
      label: '职位搜索',
    },
    {
      key: '/companies',
      icon: <TeamOutlined />,
      label: '公司列表',
    },
  ];

  // 用户菜单
  const userMenuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '控制台',
      onClick: () => window.location.href = '/dashboard',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => window.location.href = '/profile',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
      danger: true,
    },
  ];

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === '/') return ['/'];
    if (path.startsWith('/jobs')) return ['/jobs'];
    if (path.startsWith('/companies')) return ['/companies'];
    return [];
  };

  return (
    <Layout className="main-layout">
      {/* 侧边栏 */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="layout-sider"
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) setCollapsed(true);
        }}
      >
        <div className="logo">
          {collapsed ? (
            <div className="logo-mini">三石</div>
          ) : (
            <Title level={3} className="logo-text">三石招聘</Title>
          )}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={({ key }) => {
            window.location.href = key;
          }}
        />
      </Sider>

      <Layout>
        {/* 顶部导航栏 */}
        <Header className="layout-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="trigger"
            />
            
            <div className="breadcrumb">
              <span>当前位置：</span>
              {location.pathname === '/' && '首页'}
              {location.pathname.startsWith('/jobs') && '职位搜索'}
              {location.pathname.startsWith('/companies') && '公司列表'}
              {location.pathname.startsWith('/dashboard') && '控制台'}
              {location.pathname.startsWith('/profile') && '个人资料'}
            </div>
          </div>

          <div className="header-right">
            <Space size="middle">
              {/* 通知铃铛 */}
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                className="notification-btn"
              />
              
              {/* 用户信息 */}
              {user ? (
                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  arrow
                >
                  <Space className="user-info">
                    <Avatar 
                      size="small" 
                      icon={<UserOutlined />} 
                      src={user.avatar}
                    />
                    <span className="username">{user.username}</span>
                  </Space>
                </Dropdown>
              ) : (
                <Space>
                  <Button type="text" onClick={() => window.location.href = '/login'}>
                    登录
                  </Button>
                  <Button type="primary" onClick={() => window.location.href = '/register'}>
                    注册
                  </Button>
                </Space>
              )}
            </Space>
          </div>
        </Header>

        {/* 主要内容区域 */}
        <Content className="layout-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;