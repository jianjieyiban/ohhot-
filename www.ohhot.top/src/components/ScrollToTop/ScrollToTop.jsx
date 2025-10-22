import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { useScrollProgress } from '../../hooks/useScrollAnimation';
import './ScrollToTop.css';

/**
 * 滚动到顶部组件
 */
const ScrollToTop = ({
  threshold = 300,
  position = 'bottom-right',
  size = 'medium',
  icon = '↑',
  text = '回到顶部',
  showText = false,
  smooth = true,
  className = '',
  style = {}
}) => {
  const { progress } = useScrollProgress();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初始检查

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  const scrollToTop = () => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(0, 0);
    }
  };

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'fixed',
      zIndex: 9998
    };

    switch (position) {
      case 'bottom-right':
        return { ...baseStyle, bottom: '20px', right: '20px' };
      case 'bottom-left':
        return { ...baseStyle, bottom: '20px', left: '20px' };
      case 'top-right':
        return { ...baseStyle, top: '20px', right: '20px' };
      case 'top-left':
        return { ...baseStyle, top: '20px', left: '20px' };
      case 'center-right':
        return { ...baseStyle, top: '50%', right: '20px', transform: 'translateY(-50%)' };
      case 'center-left':
        return { ...baseStyle, top: '50%', left: '20px', transform: 'translateY(-50%)' };
      default:
        return { ...baseStyle, bottom: '20px', right: '20px' };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: '40px', height: '40px', fontSize: '16px' };
      case 'medium':
        return { width: '50px', height: '50px', fontSize: '18px' };
      case 'large':
        return { width: '60px', height: '60px', fontSize: '20px' };
      default:
        return { width: '50px', height: '50px', fontSize: '18px' };
    }
  };

  const positionStyle = getPositionStyle();
  const sizeStyle = getSizeStyle();

  if (!isVisible) return null;

  return (
    <Button
      className={`scroll-to-top ${isVisible ? 'visible' : ''} ${className}`.trim()}
      style={{
        ...positionStyle,
        ...sizeStyle,
        ...style
      }}
      onClick={scrollToTop}
      aria-label="回到顶部"
      title="回到顶部"
      data-progress={Math.round(progress * 100)}
      type="primary"
      shape="circle"
    >
      <span className="scroll-to-top-icon">{icon}</span>
      {showText && (
        <span className="scroll-to-top-text">{text}</span>
      )}
      
      {/* 进度环 */}
      <svg className="scroll-to-top-progress" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          className="scroll-to-top-progress-bg"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          className="scroll-to-top-progress-fill"
          strokeDasharray="283"
          strokeDashoffset={283 - (progress * 283)}
        />
      </svg>
    </Button>
  );
};

export default ScrollToTop;