import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Dropdown, Avatar, Menu, Space, Badge, Drawer, message } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  BellOutlined,
  PlusOutlined,
  SearchOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated, isEmployer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

  // 认证状态监听
  useEffect(() => {
    // 认证状态变化处理逻辑
  }, [isAuthenticated, user]);

  // 处理管理员入口点击
  const handleAdminClick = () => {
    const newCount = adminClickCount + 1;
    setAdminClickCount(newCount);
    
    // 连续点击5次后跳转到管理员登录页
    if (newCount >= 5) {
      setAdminClickCount(0); // 重置计数器
      navigate('/admin-login');
    }
    
    // 3秒后自动重置计数器
    setTimeout(() => {
      setAdminClickCount(0);
    }, 3000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <img src="/logo-lei.svg" alt="ohhot求职招聘" className="logo-image" />
          <span className="logo-text">ohhot求职招聘</span>
        </Link>

        {/* 搜索框 */}
        <form className="header-search" onSubmit={handleSearch}>
          <div className="search-input-container">
            <SearchOutlined className="search-icon" />
            <input
              type="text"
              placeholder="搜索职位、公司或城市..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="search-input"
            />
          </div>
        </form>

        {/* 导航菜单 */}
        <nav className="header-nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            首页
          </Link>
          <Link 
            to="/jobs" 
            className={`nav-link ${location.pathname === '/jobs' ? 'active' : ''}`}
          >
            职位
          </Link>
        </nav>

        {/* 发布职位按钮 */}
        {isAuthenticated && (isEmployer || isAdmin) && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            className="create-job-btn"
            onClick={() => {
              navigate('/jobs/create');
            }}
            style={{ fontWeight: 'bold', fontSize: '16px', fontFamily: '黑体, sans-serif' }}
          >
            发布信息
          </Button>
        )}

        {/* 用户操作区 */}
        <div className="header-actions">
          {isAuthenticated ? (
            <Space size="middle">
              {/* 管理员后台按钮 */}
              {isAdmin && (
                <Button 
                  type="primary" 
                  ghost
                  className="admin-dashboard-btn"
                  onClick={() => navigate('/admin')}
                >
                  后台管理
                </Button>
              )}
              
              {/* 通知 */}
              <Badge count={5} size="small">
                <Button 
                  type="text" 
                  icon={<BellOutlined />} 
                  className="action-btn"
                  onClick={() => isAdmin ? navigate('/admin/applications') : message.info('请先登录管理员账号')}
                />
              </Badge>

              {/* 用户头像和下拉菜单 */}
              <Dropdown menu={{ items: [
                {
                  key: 'profile',
                  icon: <UserOutlined />,
                  label: '个人资料',
                  onClick: () => navigate('/profile')
                },
                {
                  key: 'settings',
                  icon: <SettingOutlined />,
                  label: '设置',
                  onClick: () => navigate('/profile?tab=settings')
                },
                { type: 'divider' },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: handleLogout
                }
              ] }} placement="bottomRight">
                <div className="user-info">
                  <Avatar 
                    size="small" 
                    icon={<UserOutlined />} 
                    src={user?.avatar}
                    className="user-avatar"
                  />
                  <span className="user-name">{user?.username || user?.email}</span>
                </div>
              </Dropdown>
            </Space>
          ) : (
            <Space size="small">
              <span onClick={() => navigate('/login')} className="action-btn">
                登录
              </span>
              <span onClick={() => navigate('/register')} className="action-btn">
                注册
              </span>
            </Space>
          )}
        </div>

        {/* 管理员登录入口 - 隐藏的红色圆框，需要连续点击5次 */}
        <div 
          className="admin-secret-btn"
          onClick={handleAdminClick}
          title="管理员入口"
        >
          <span className="admin-secret-dot"></span>
        </div>

        {/* 移动端汉堡菜单按钮 */}
        <Button 
          type="text" 
          icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
      </div>
      


      {/* 移动端抽屉菜单 */}
      <Drawer
        title="导航菜单"
        placement="right"
        closable={true}
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        className="mobile-drawer"
      >
        <div className="mobile-menu">
          <Link 
            to="/" 
            className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            首页
          </Link>
          <Link 
            to="/jobs" 
            className={`mobile-nav-link ${location.pathname === '/jobs' ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            职位
          </Link>
          {isAuthenticated && isEmployer && (
            <Link 
              to="/jobs/create" 
              className={`mobile-nav-link ${location.pathname === '/jobs/create' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              发布职位
            </Link>
          )}
          
          {/* 管理员后台按钮 */}
          {isAdmin && (
            <Link 
              to="/admin" 
              className={`mobile-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#1890ff', fontWeight: 'bold' }}
            >
              后台管理
            </Link>
          )}
          
          <div className="mobile-user-section">
            {/* 移动端管理员登录入口 */}
            <div 
              className="mobile-nav-link mobile-admin-login"
              style={{ 
                color: '#ff4d4f', 
                fontWeight: 'bold',
                textAlign: 'center',
                margin: '10px 0',
                padding: '8px',
                border: '1px dashed #ff4d4f',
                borderRadius: '4px'
              }}
              onClick={() => { navigate('/admin-login'); setMobileMenuOpen(false); }}
            >
              管理员登录
            </div>
            
            {isAuthenticated ? (
              <>
                <div className="mobile-user-info">
                  <Avatar 
                    size="small" 
                    icon={<UserOutlined />} 
                    src={user?.avatar}
                    className="mobile-user-avatar"
                  />
                  <span className="mobile-user-name">{user?.username || user?.email}</span>
                </div>
                <div className="mobile-user-actions">
                  <Button type="text" icon={<UserOutlined />} onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
                    个人资料
                  </Button>
                  <Button type="text" icon={<SettingOutlined />} onClick={() => { navigate('/profile?tab=settings'); setMobileMenuOpen(false); }}>
                    设置
                  </Button>
                  <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
                    退出登录
                  </Button>
                </div>
              </>
            ) : (
              <div className="mobile-auth-actions">
                <span className="action-btn mobile-action-btn" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                  登录
                </span>
                <span className="action-btn mobile-action-btn" onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>
                  注册
                </span>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
};

export default Header;