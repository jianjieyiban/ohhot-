import React from 'react';
import { Link } from 'react-router-dom';
import { Space, Divider } from 'antd';
import { 
  GithubOutlined, 
  WechatOutlined, 
  QqOutlined, 
  MailOutlined,
  PhoneOutlined 
} from '@ant-design/icons';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* 主要链接区域 */}
        <div className="footer-main">
          <div className="footer-section">
            <h3 className="footer-title">三石招聘</h3>
            <p className="footer-desc">
              专业的招聘平台，连接优秀人才与优质企业
            </p>
            <Space className="footer-social">
              <a href="#" className="social-link">
                <WechatOutlined />
              </a>
              <a href="#" className="social-link">
                <QqOutlined />
              </a>
              <a href="https://github.com/jianjieyiban/sanshi-recruit-edgeone" className="social-link">
                <GithubOutlined />
              </a>
            </Space>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">求职者</h4>
            <ul className="footer-links">
              <li><Link to="/jobs">浏览职位</Link></li>
              <li><Link to="/register">注册账号</Link></li>
              <li><Link to="/profile">个人中心</Link></li>
              <li><Link to="/#faq">常见问题</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">招聘方</h4>
            <ul className="footer-links">
              <li><Link to="/jobs/create">发布职位</Link></li>
              <li><Link to="/register">企业注册</Link></li>
              <li><Link to="/#pricing">服务价格</Link></li>
              <li><Link to="/#contact">联系我们</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">关于我们</h4>
            <ul className="footer-links">
              <li><Link to="/about">公司介绍</Link></li>
              <li><Link to="/team">团队介绍</Link></li>
              <li><Link to="/news">新闻动态</Link></li>
              <li><Link to="/join">加入我们</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">联系我们</h4>
            <div className="contact-info">
              <p><MailOutlined /> 1323432580@qq.com</p>
              <p><PhoneOutlined /> 15608476465</p>
              <p><WechatOutlined /> 微信公众号：南岳衡山万事通</p>
              <p>工作时间：周一至周五 9:00-18:00</p>
            </div>
          </div>
        </div>

        <Divider className="footer-divider" />

        {/* 安全提醒 */}
        <div className="security-notice">
          <span className="notice-icon">⚠️</span>
          <span className="notice-text">
            提醒：求职有风险，选择需谨慎。本网站不对招聘信息的真实性负责，请求职者提高警惕，保护个人信息安全
          </span>
        </div>

        {/* 底部版权信息 */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {currentYear} 三石招聘系统. 保留所有权利.</p>
            <Space size="middle" className="footer-legal">
              <Link to="/privacy">隐私政策</Link>
              <Link to="/terms">服务条款</Link>
              <Link to="/sitemap">网站地图</Link>
            </Space>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;