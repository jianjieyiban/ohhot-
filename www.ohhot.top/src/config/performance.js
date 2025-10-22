/**
 * 性能优化配置
 * 集中管理各种性能优化策略和配置
 */

// 图片优化配置
export const IMAGE_OPTIMIZATION_CONFIG = {
  // 图片格式优先级（按性能排序）
  formatPriority: ['webp', 'avif', 'jpg', 'jpeg', 'png'],
  
  // 最大图片尺寸限制
  maxDimensions: {
    small: { width: 320, height: 240 },
    medium: { width: 640, height: 480 },
    large: { width: 1200, height: 800 }
  },
  
  // 质量设置
  quality: {
    webp: 80,
    jpg: 85,
    png: 90
  },
  
  // 懒加载配置
  lazyLoading: {
    threshold: 0.1,
    rootMargin: '50px'
  }
};

// 资源加载优化配置
export const RESOURCE_LOADING_CONFIG = {
  // 预加载关键资源
  preload: [
    '/logo-lei.svg',
    '/favicon-32x32.png'
  ],
  
  // 预连接关键域名
  preconnect: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ],
  
  // DNS 预解析
  dnsPrefetch: [
    '//fonts.googleapis.com',
    '//fonts.gstatic.com'
  ]
};

// 代码分割配置
export const CODE_SPLITTING_CONFIG = {
  // 路由级别的代码分割
  routes: [
    'Home',
    'Jobs',
    'Job',
    'Profile',
    'About'
  ],
  
  // 第三方库分割
  vendors: {
    react: ['react', 'react-dom'],
    antd: ['antd'],
    antdIcons: ['@ant-design/icons'],
    utils: ['axios', 'dayjs']
  }
};

// 缓存策略配置
export const CACHING_CONFIG = {
  // 静态资源缓存时间（秒）
  staticAssets: 31536000, // 1年
  
  // API 响应缓存时间（秒）
  apiResponses: 300, // 5分钟
  
  // 浏览器缓存策略
  browser: {
    maxAge: 86400, // 1天
    mustRevalidate: true
  }
};

// 性能监控配置
export const PERFORMANCE_MONITORING_CONFIG = {
  // 关键性能指标阈值（毫秒）
  thresholds: {
    firstContentfulPaint: 2000,
    largestContentfulPaint: 2500,
    firstInputDelay: 100,
    cumulativeLayoutShift: 0.1,
    timeToInteractive: 3000
  },
  
  // 采样率（0-1）
  samplingRate: 0.1,
  
  // 报告频率（毫秒）
  reportInterval: 60000 // 1分钟
};

// 压缩配置
export const COMPRESSION_CONFIG = {
  // Gzip 压缩级别
  gzip: {
    level: 6,
    threshold: 1024
  },
  
  // Brotli 压缩级别
  brotli: {
    level: 4,
    threshold: 1024
  }
};

// 响应式图片配置
export const RESPONSIVE_IMAGES_CONFIG = {
  // 断点配置
  breakpoints: {
    xs: 320,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400
  },
  
  // 图片尺寸配置
  sizes: {
    thumbnail: { width: 100, height: 100 },
    small: { width: 320, height: 240 },
    medium: { width: 640, height: 480 },
    large: { width: 1200, height: 800 },
    xlarge: { width: 1920, height: 1080 }
  }
};

// 性能优化工具函数
export const performanceUtils = {
  /**
   * 检查浏览器是否支持 WebP 格式
   */
  supportsWebP() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = function() {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  },

  /**
   * 检查浏览器是否支持 AVIF 格式
   */
  supportsAVIF() {
    return new Promise((resolve) => {
      const avif = new Image();
      avif.onload = avif.onerror = function() {
        resolve(avif.height === 2);
      };
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  },

  /**
   * 获取最佳图片格式
   */
  async getBestImageFormat() {
    if (await this.supportsAVIF()) {
      return 'avif';
    }
    if (await this.supportsWebP()) {
      return 'webp';
    }
    return 'jpg';
  },

  /**
   * 生成响应式图片 URL
   */
  generateResponsiveImageUrl(baseUrl, width, format = null) {
    const url = new URL(baseUrl, window.location.origin);
    
    if (width) {
      url.searchParams.set('w', width.toString());
    }
    
    if (format) {
      url.searchParams.set('fm', format);
    }
    
    return url.toString();
  },

  /**
   * 检查网络连接状态
   */
  getConnectionInfo() {
    if (navigator.connection) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  },

  /**
   * 根据网络状况调整图片质量
   */
  getAdaptiveImageQuality() {
    const connection = this.getConnectionInfo();
    
    if (!connection) {
      return 80; // 默认质量
    }
    
    switch (connection.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 50; // 低质量
      case '3g':
        return 70; // 中等质量
      case '4g':
      default:
        return 85; // 高质量
    }
  },

  /**
   * 性能评分计算
   */
  calculatePerformanceScore(metrics) {
    let score = 100;
    
    // 根据性能指标扣分
    if (metrics.firstContentfulPaint > 2000) {
      score -= 20;
    }
    
    if (metrics.largestContentfulPaint > 2500) {
      score -= 20;
    }
    
    if (metrics.cumulativeLayoutShift > 0.1) {
      score -= 15;
    }
    
    if (metrics.timeToInteractive > 3000) {
      score -= 25;
    }
    
    return Math.max(0, score);
  }
};

// 默认导出配置
export default {
  IMAGE_OPTIMIZATION_CONFIG,
  RESOURCE_LOADING_CONFIG,
  CODE_SPLITTING_CONFIG,
  CACHING_CONFIG,
  PERFORMANCE_MONITORING_CONFIG,
  COMPRESSION_CONFIG,
  RESPONSIVE_IMAGES_CONFIG,
  performanceUtils
};