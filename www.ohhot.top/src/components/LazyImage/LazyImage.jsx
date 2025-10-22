import React, { useState, useRef, useEffect } from 'react';
import { Spin } from 'antd';
import './LazyImage.css';

/**
 * 懒加载图片组件
 * 支持图片懒加载、错误处理、加载状态显示
 */
const LazyImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = null,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // 如果图片已经在视口中，直接加载
    if (isInView) {
      return;
    }

    // 创建 IntersectionObserver 实例
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    // 开始观察图片元素
    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    // 清理函数
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isInView, threshold, rootMargin]);

  // 处理图片加载成功
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad && onLoad();
  };

  // 处理图片加载失败
  const handleError = () => {
    setIsError(true);
    onError && onError();
  };

  // 渲染占位符
  const renderPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }

    return (
      <div className="lazy-image-placeholder">
        <Spin size="small" />
        <span>加载中...</span>
      </div>
    );
  };

  // 渲染错误状态
  const renderError = () => (
    <div className="lazy-image-error">
      <div className="error-icon">❌</div>
      <span>图片加载失败</span>
    </div>
  );

  return (
    <div 
      ref={imgRef}
      className={`lazy-image-container ${className}`}
      style={{ width, height }}
    >
      {/* 占位符 */}
      {!isLoaded && !isError && renderPlaceholder()}
      
      {/* 错误状态 */}
      {isError && renderError()}
      
      {/* 实际图片 */}
      {isInView && !isError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`lazy-image ${isLoaded ? 'loaded' : ''}`}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;