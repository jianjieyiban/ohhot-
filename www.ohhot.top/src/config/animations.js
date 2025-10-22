/**
 * 滚动动画配置
 * 定义各种动画效果和配置参数
 */

// 动画类型枚举
export const ANIMATION_TYPES = {
  FADE_IN: 'fadeIn',
  SLIDE_UP: 'slideUp',
  SLIDE_DOWN: 'slideDown',
  SLIDE_LEFT: 'slideLeft',
  SLIDE_RIGHT: 'slideRight',
  ZOOM_IN: 'zoomIn',
  BOUNCE: 'bounce',
  FLIP: 'flip',
  ROTATE: 'rotate'
};

// 动画缓动函数
export const EASING_FUNCTIONS = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  cubicBezier: 'cubic-bezier(0.4, 0, 0.2, 1)'
};

// 默认动画配置
export const DEFAULT_ANIMATION_CONFIG = {
  duration: 600,
  delay: 0,
  easing: EASING_FUNCTIONS.easeOut,
  threshold: 0.1,
  rootMargin: '0px',
  once: true,
  mirror: false
};

// 预定义动画配置
export const ANIMATION_PRESETS = {
  // 淡入效果
  fadeIn: {
    ...DEFAULT_ANIMATION_CONFIG,
    duration: 800,
    delay: 100
  },
  
  // 向上滑动
  slideUp: {
    ...DEFAULT_ANIMATION_CONFIG,
    duration: 700,
    delay: 200
  },
  
  // 向左滑动
  slideLeft: {
    ...DEFAULT_ANIMATION_CONFIG,
    duration: 600,
    delay: 150
  },
  
  // 向右滑动
  slideRight: {
    ...DEFAULT_ANIMATION_CONFIG,
    duration: 600,
    delay: 150
  },
  
  // 缩放进入
  zoomIn: {
    ...DEFAULT_ANIMATION_CONFIG,
    duration: 500,
    delay: 100
  },
  
  // 弹跳效果
  bounce: {
    ...DEFAULT_ANIMATION_CONFIG,
    duration: 800,
    delay: 50
  },
  
  // 翻转效果
  flip: {
    ...DEFAULT_ANIMATION_CONFIG,
    duration: 600,
    delay: 100
  },
  
  // 旋转效果
  rotate: {
    ...DEFAULT_ANIMATION_CONFIG,
    duration: 400,
    delay: 50
  }
};

// 组件特定动画配置
export const COMPONENT_ANIMATIONS = {
  // 头部导航
  header: {
    type: ANIMATION_TYPES.SLIDE_DOWN,
    duration: 500,
    delay: 0
  },
  
  // 轮播图
  carousel: {
    type: ANIMATION_TYPES.FADE_IN,
    duration: 800,
    delay: 200
  },
  
  // 搜索区域
  search: {
    type: ANIMATION_TYPES.SLIDE_UP,
    duration: 600,
    delay: 300
  },
  
  // 职位卡片
  jobCard: {
    type: ANIMATION_TYPES.FADE_IN,
    duration: 500,
    delay: 100,
    stagger: 100 // 交错延迟
  },
  
  // 公司信息
  companyInfo: {
    type: ANIMATION_TYPES.SLIDE_LEFT,
    duration: 700,
    delay: 200
  },
  
  // 页脚
  footer: {
    type: ANIMATION_TYPES.FADE_IN,
    duration: 800,
    delay: 100
  }
};

// 动画关键帧定义
export const KEYFRAMES = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },
  
  slideUp: {
    from: { 
      opacity: 0, 
      transform: 'translateY(50px)' 
    },
    to: { 
      opacity: 1, 
      transform: 'translateY(0)' 
    }
  },
  
  slideDown: {
    from: { 
      opacity: 0, 
      transform: 'translateY(-50px)' 
    },
    to: { 
      opacity: 1, 
      transform: 'translateY(0)' 
    }
  },
  
  slideLeft: {
    from: { 
      opacity: 0, 
      transform: 'translateX(50px)' 
    },
    to: { 
      opacity: 1, 
      transform: 'translateX(0)' 
    }
  },
  
  slideRight: {
    from: { 
      opacity: 0, 
      transform: 'translateX(-50px)' 
    },
    to: { 
      opacity: 1, 
      transform: 'translateX(0)' 
    }
  },
  
  zoomIn: {
    from: { 
      opacity: 0, 
      transform: 'scale(0.8)' 
    },
    to: { 
      opacity: 1, 
      transform: 'scale(1)' 
    }
  },
  
  bounce: {
    from: { 
      opacity: 0, 
      transform: 'scale(0.3)' 
    },
    '50%': { 
      opacity: 1, 
      transform: 'scale(1.05)' 
    },
    to: { 
      opacity: 1, 
      transform: 'scale(1)' 
    }
  },
  
  flip: {
    from: { 
      opacity: 0, 
      transform: 'rotateY(90deg)' 
    },
    to: { 
      opacity: 1, 
      transform: 'rotateY(0deg)' 
    }
  },
  
  rotate: {
    from: { 
      opacity: 0, 
      transform: 'rotate(-180deg) scale(0.5)' 
    },
    to: { 
      opacity: 1, 
      transform: 'rotate(0deg) scale(1)' 
    }
  }
};

// 动画工具函数
export const animationUtils = {
  /**
   * 生成 CSS 动画关键帧
   */
  generateKeyframes(animationType) {
    const keyframes = KEYFRAMES[animationType];
    if (!keyframes) {
      console.warn(`未知的动画类型: ${animationType}`);
      return KEYFRAMES.fadeIn;
    }
    return keyframes;
  },

  /**
   * 生成 CSS 动画样式
   */
  generateAnimationCSS(animationType, config = {}) {
    const preset = ANIMATION_PRESETS[animationType] || DEFAULT_ANIMATION_CONFIG;
    const finalConfig = { ...preset, ...config };
    
    return {
      animationName: animationType,
      animationDuration: `${finalConfig.duration}ms`,
      animationTimingFunction: finalConfig.easing,
      animationDelay: `${finalConfig.delay}ms`,
      animationFillMode: 'both'
    };
  },

  /**
   * 检查是否支持减少动画
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * 检查是否支持自动播放动画
   */
  prefersAutoPlay() {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * 获取适合当前环境的动画配置
   */
  getAdaptiveAnimationConfig(baseConfig) {
    if (this.prefersReducedMotion()) {
      return {
        ...baseConfig,
        duration: Math.min(baseConfig.duration, 300),
        delay: 0
      };
    }
    return baseConfig;
  },

  /**
   * 计算交错延迟
   */
  calculateStaggerDelay(index, staggerDelay = 100) {
    return index * staggerDelay;
  },

  /**
   * 检查元素是否在视口中
   */
  isElementInViewport(element, threshold = 0.1) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const vertInView = rect.top <= windowHeight && rect.top + rect.height >= 0;
    const horInView = rect.left <= windowWidth && rect.left + rect.width >= 0;
    
    return vertInView && horInView;
  },

  /**
   * 获取元素相对于视口的位置
   */
  getElementViewportPosition(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    return {
      top: rect.top,
      bottom: rect.bottom,
      height: rect.height,
      visibleRatio: Math.max(0, Math.min(1, (windowHeight - Math.max(0, -rect.top)) / rect.height))
    };
  }
};

// 默认导出
export default {
  ANIMATION_TYPES,
  EASING_FUNCTIONS,
  DEFAULT_ANIMATION_CONFIG,
  ANIMATION_PRESETS,
  COMPONENT_ANIMATIONS,
  KEYFRAMES,
  animationUtils
};