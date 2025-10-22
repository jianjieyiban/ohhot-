import { useState, useEffect, useRef, useCallback } from 'react';
import { animationUtils, ANIMATION_PRESETS } from '../config/animations';

/**
 * 滚动动画相关 Hooks
 */

/**
 * 滚动触发动画 Hook
 * @param {Object} options - 配置选项
 * @returns {Object} - 动画状态和方法
 */
export const useScrollAnimation = (options = {}) => {
  const {
    animationType = 'fadeIn',
    threshold = 0.1,
    rootMargin = '0px',
    once = true,
    delay = 0,
    stagger = 0
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || (once && hasAnimated)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasAnimated(true);
          
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, once, hasAnimated]);

  const getAnimationStyle = useCallback((index = 0) => {
    if (!isVisible && animationUtils.prefersReducedMotion()) {
      return {};
    }

    const preset = ANIMATION_PRESETS[animationType] || ANIMATION_PRESETS.fadeIn;
    const finalDelay = delay + (stagger ? animationUtils.calculateStaggerDelay(index, stagger) : 0);
    
    const adaptiveConfig = animationUtils.getAdaptiveAnimationConfig({
      ...preset,
      delay: finalDelay
    });

    return animationUtils.generateAnimationCSS(animationType, adaptiveConfig);
  }, [isVisible, animationType, delay, stagger]);

  return {
    ref: elementRef,
    isVisible,
    hasAnimated,
    getAnimationStyle,
    animationClass: isVisible ? `animate-${animationType}` : ''
  };
};

/**
 * 滚动进度监控 Hook
 * @param {Object} options - 配置选项
 * @returns {Object} - 滚动进度信息
 */
export const useScrollProgress = (options = {}) => {
  const {
    target = null,
    offsetStart = 0,
    offsetEnd = 0
  } = options;

  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const scrollElement = target ? document.querySelector(target) : window;
    
    const handleScroll = () => {
      setIsScrolling(true);
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 100);

      if (target) {
        const element = document.querySelector(target);
        if (element) {
          const scrollTop = element.scrollTop;
          const scrollHeight = element.scrollHeight - element.clientHeight;
          const currentProgress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
          setProgress(Math.max(0, Math.min(1, currentProgress)));
        }
      } else {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const currentProgress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
        setProgress(Math.max(0, Math.min(1, currentProgress)));
      }
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    
    // 初始计算
    handleScroll();

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [target]);

  return {
    progress,
    isScrolling,
    percentage: Math.round(progress * 100)
  };
};

/**
 * 视差滚动效果 Hook
 * @param {Object} options - 配置选项
 * @returns {Object} - 视差偏移值
 */
export const useParallax = (options = {}) => {
  const {
    speed = 0.5,
    direction = 'vertical',
    enabled = true
  } = options;

  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const newOffset = scrollY * speed;
      setOffset(newOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 初始计算
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, direction, enabled]);

  const getTransformStyle = useCallback(() => {
    if (!enabled) return {};
    
    if (direction === 'vertical') {
      return { transform: `translateY(${offset}px)` };
    } else if (direction === 'horizontal') {
      return { transform: `translateX(${offset}px)` };
    }
    
    return {};
  }, [offset, direction, enabled]);

  return {
    offset,
    getTransformStyle
  };
};

/**
 * 滚动到指定元素 Hook
 * @returns {Function} - 滚动函数
 */
export const useScrollTo = () => {
  const scrollTo = useCallback((target, options = {}) => {
    const {
      behavior = 'smooth',
      offset = 0,
      duration = 1000
    } = options;

    let targetElement;
    
    if (typeof target === 'string') {
      targetElement = document.querySelector(target);
    } else if (target instanceof Element) {
      targetElement = target;
    } else if (typeof target === 'number') {
      // 滚动到指定位置
      window.scrollTo({
        top: target,
        behavior
      });
      return;
    }

    if (!targetElement) {
      console.warn('滚动目标元素未找到:', target);
      return;
    }

    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    if (behavior === 'smooth' && duration > 0) {
      // 自定义平滑滚动
      const startPosition = window.pageYOffset;
      const distance = offsetPosition - startPosition;
      let startTime = null;

      const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // 缓动函数
        const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        
        window.scrollTo(0, startPosition + distance * ease(progress));
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    } else {
      window.scrollTo({
        top: offsetPosition,
        behavior
      });
    }
  }, []);

  return scrollTo;
};

/**
 * 滚动节流 Hook
 * @param {Function} callback - 回调函数
 * @param {number} delay - 延迟时间
 * @returns {void}
 */
export const useScrollThrottle = (callback, delay = 100) => {
  const timeoutRef = useRef(null);
  const lastCallRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback();
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback();
        }, delay - (now - lastCallRef.current));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [callback, delay]);
};

export default {
  useScrollAnimation,
  useScrollProgress,
  useParallax,
  useScrollTo,
  useScrollThrottle
};