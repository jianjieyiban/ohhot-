import { useState, useEffect, useCallback, useRef } from 'react';
import { performanceUtils } from '../config/performance';

/**
 * 性能优化相关 Hooks
 */

/**
 * 图片懒加载 Hook
 * @param {string} src - 图片源地址
 * @param {Object} options - 配置选项
 * @returns {Object} - 图片状态和属性
 */
export const useLazyImage = (src, options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    placeholder = null,
    fallback = null
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(img);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(img);

    return () => {
      if (img) {
        observer.unobserve(img);
      }
    };
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    
    const handleLoad = () => {
      setIsLoaded(true);
      setHasError(false);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoaded(false);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    img.src = src;

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [isInView, src]);

  const imageSrc = hasError ? fallback : (isInView ? src : placeholder);

  return {
    ref: imgRef,
    src: imageSrc,
    isLoaded,
    isInView,
    hasError,
    isLoading: !isLoaded && !hasError
  };
};

/**
 * 防抖 Hook
 * @param {Function} callback - 回调函数
 * @param {number} delay - 延迟时间
 * @returns {Function} - 防抖函数
 */
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

/**
 * 节流 Hook
 * @param {Function} callback - 回调函数
 * @param {number} delay - 延迟时间
 * @returns {Function} - 节流函数
 */
export const useThrottle = (callback, delay) => {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    const now = Date.now();
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        callback(...args);
      }, delay - (now - lastCallRef.current));
    }
  }, [callback, delay]);
};

/**
 * 性能监控 Hook
 * @param {string} componentName - 组件名称
 * @returns {Object} - 性能监控方法
 */
export const usePerformanceMonitor = (componentName) => {
  const startTimeRef = useRef(performance.now());
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    startTimeRef.current = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTimeRef.current;
      
      // 记录组件渲染时间
      // console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`);
      
      // 更新指标
      setMetrics(prev => ({
        ...prev,
        renderTime: duration,
        lastRender: new Date().toISOString()
      }));
    };
  }, [componentName]);

  const measureInteraction = useCallback((interactionName) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // console.log(`[Performance] ${componentName} - ${interactionName}: ${duration.toFixed(2)}ms`);
      
      setMetrics(prev => ({
        ...prev,
        [interactionName]: duration,
        lastInteraction: new Date().toISOString()
      }));
      
      return duration;
    };
  }, [componentName]);

  return {
    metrics,
    measureInteraction
  };
};

/**
 * 网络状态 Hook
 * @returns {Object} - 网络状态信息
 */
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState({
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
    online: navigator.onLine
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      if (navigator.connection) {
        setNetworkStatus({
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt,
          saveData: navigator.connection.saveData,
          online: navigator.onLine
        });
      } else {
        setNetworkStatus(prev => ({
          ...prev,
          online: navigator.onLine
        }));
      }
    };

    // 监听网络状态变化
    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateNetworkStatus);
    }
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // 初始更新
    updateNetworkStatus();

    return () => {
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', updateNetworkStatus);
      }
      
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  return networkStatus;
};

/**
 * 图片优化 Hook
 * @param {string} src - 原始图片地址
 * @param {Object} options - 优化选项
 * @returns {Object} - 优化后的图片信息
 */
export const useOptimizedImage = (src, options = {}) => {
  const {
    width,
    height,
    quality = 80,
    format = 'auto'
  } = options;

  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const [isSupported, setIsSupported] = useState(null);

  useEffect(() => {
    const optimizeImage = async () => {
      if (!src) return;

      try {
        let targetFormat = format;
        
        if (format === 'auto') {
          targetFormat = await performanceUtils.getBestImageFormat();
        }

        // 构建优化后的图片 URL
        const url = new URL(src, window.location.origin);
        
        if (width) url.searchParams.set('w', width);
        if (height) url.searchParams.set('h', height);
        if (quality) url.searchParams.set('q', quality);
        if (targetFormat && targetFormat !== 'auto') {
          url.searchParams.set('fm', targetFormat);
        }

        setOptimizedSrc(url.toString());
        setIsSupported(true);
      } catch (error) {
        console.warn('Image optimization failed:', error);
        setOptimizedSrc(src);
        setIsSupported(false);
      }
    };

    optimizeImage();
  }, [src, width, height, quality, format]);

  return {
    src: optimizedSrc,
    isSupported,
    isOptimized: optimizedSrc !== src
  };
};

/**
 * 资源预加载 Hook
 * @param {Array} resources - 需要预加载的资源列表
 */
export const usePreloadResources = (resources) => {
  useEffect(() => {
    if (!resources || resources.length === 0) return;

    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.url;
      
      if (resource.type) {
        link.as = resource.type;
      }
      
      if (resource.crossOrigin) {
        link.crossOrigin = resource.crossOrigin;
      }
      
      document.head.appendChild(link);
    });

    return () => {
      // 清理预加载的资源
      resources.forEach(resource => {
        const links = document.querySelectorAll(`link[href="${resource.url}"]`);
        links.forEach(link => link.remove());
      });
    };
  }, [resources]);
};

/**
 * 虚拟滚动 Hook
 * @param {Array} items - 数据项
 * @param {Object} options - 配置选项
 * @returns {Object} - 虚拟滚动状态
 */
export const useVirtualScroll = (items, options = {}) => {
  const {
    itemHeight = 50,
    overscan = 5,
    containerRef
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    const handleResize = () => {
      setContainerHeight(container.clientHeight);
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // 初始设置
    handleResize();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef]);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    startIndex,
    endIndex
  };
};

export default {
  useLazyImage,
  useDebounce,
  useThrottle,
  usePerformanceMonitor,
  useNetworkStatus,
  useOptimizedImage,
  usePreloadResources,
  useVirtualScroll
};