import React from 'react';
import Layout from '../components/Layout';
import './About.css';

const About = () => {
  return (
    <Layout>
      <div className="about-page">
        <div className="about-hero">
          <div className="container">
            <h1 className="about-title">关于三石招聘</h1>
            <p className="about-subtitle">专业的招聘平台，连接企业与人才</p>
          </div>
        </div>

        <div className="about-content">
          <div className="container">
            <section className="about-section">
              <h2>平台简介</h2>
              <p>
                三石招聘是一家专注于互联网行业的招聘平台，致力于为企业和求职者提供高效、精准的招聘服务。
                我们通过先进的技术手段和专业的服务团队，帮助企业在海量人才中快速找到合适的人选，同时也为求职者提供优质的职业发展机会。
              </p>
            </section>

            <section className="about-section">
              <h2>我们的使命</h2>
              <div className="mission-cards">
                <div className="mission-card">
                  <div className="mission-icon">🎯</div>
                  <h3>精准匹配</h3>
                  <p>通过智能算法，实现人才与岗位的精准匹配，提高招聘效率</p>
                </div>
                <div className="mission-card">
                  <div className="mission-icon">⚡</div>
                  <h3>高效便捷</h3>
                  <p>简化招聘流程，让企业和求职者都能享受便捷的招聘体验</p>
                </div>
                <div className="mission-card">
                  <div className="mission-icon">🤝</div>
                  <h3>专业服务</h3>
                  <p>专业的客服团队，为企业和求职者提供全方位的支持服务</p>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2>平台特色</h2>
              <div className="features-grid">
                <div className="feature-item">
                  <h4>智能推荐</h4>
                  <p>基于大数据分析，为求职者推荐最合适的职位</p>
                </div>
                <div className="feature-item">
                  <h4>实时沟通</h4>
                  <p>支持在线聊天，方便企业与求职者直接沟通</p>
                </div>
                <div className="feature-item">
                  <h4>简历解析</h4>
                  <p>智能解析简历，自动匹配岗位要求</p>
                </div>
                <div className="feature-item">
                  <h4>数据安全</h4>
                  <p>严格的数据保护措施，确保用户信息安全</p>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2>发展历程</h2>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-year">2020</div>
                  <div className="timeline-content">
                    <h4>平台成立</h4>
                    <p>三石招聘正式上线，专注于互联网行业招聘</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">2021</div>
                  <div className="timeline-content">
                    <h4>用户突破</h4>
                    <p>注册用户突破10万，合作企业超过1000家</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">2022</div>
                  <div className="timeline-content">
                    <h4>技术升级</h4>
                    <p>引入AI智能匹配算法，提升招聘效率</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">2023</div>
                  <div className="timeline-content">
                    <h4>服务扩展</h4>
                    <p>拓展至更多行业，提供全方位的招聘解决方案</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2>联系我们</h2>
              <div className="contact-info">
                <div className="contact-item">
                  <strong>客服电话：</strong>
                  <span>400-123-4567</span>
                </div>
                <div className="contact-item">
                  <strong>商务合作：</strong>
                  <span>business@sanshi.com</span>
                </div>
                <div className="contact-item">
                  <strong>公司地址：</strong>
                  <span>北京市朝阳区科技园区创新大厦A座1001</span>
                </div>
                <div className="contact-item">
                  <strong>工作时间：</strong>
                  <span>周一至周五 9:00-18:00</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;