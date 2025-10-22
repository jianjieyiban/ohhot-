/**
 * 性能监控工具
 * 用于监控页面加载性能、资源加载时间等
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  /**
   * 初始化性能监控
   */
  init() {
    // 监听页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.measurePageLoad();
      });
    } else {
      this.measurePageLoad();
    }

    // 监听资源加载
    this.measureResourceLoading();

    // 监听用户交互性能
    this.measureUserInteraction();
  }

  /**
   * 测量页面加载性能
   */
  measurePageLoad() {
    // 使用 Performance API 获取加载指标
    if (window.performance) {
      const perfData = window.performance.timing;
      
      this.metrics.pageLoad = {
        // DNS 查询时间
        dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
        
        // TCP 连接时间
        tcpConnect: perfData.connectEnd - perfData.connectStart,
        
        // 请求响应时间
        requestResponse: perfData.responseEnd - perfData.requestStart,
        
        // DOM 解析时间
        domParse: perfData.domComplete - perfData.domInteractive,
        
        // 页面完全加载时间
        fullLoad: perfData.loadEventEnd - perfData.navigationStart,
        
        // 首次内容绘制时间
        firstContentfulPaint: this.getFirstContentfulPaint(),
        
        // 最大内容绘制时间
        largestContentfulPaint: this.getLargestContentfulPaint()
      };

      // console.log('📊 页面加载性能指标:', this.metrics.pageLoad);
    }
  }

  /**
   * 获取首次内容绘制时间
   */
  getFirstContentfulPaint() {
    if (window.performance) {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcpEntry ? fcpEntry.startTime : null;
    }
    return null;
  }

  /**
   * 获取最大内容绘制时间
   */
  getLargestContentfulPaint() {
    if (window.performance) {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      const lcpEntry = lcpEntries[lcpEntries.length - 1];
      return lcpEntry ? lcpEntry.startTime : null;
    }
    return null;
  }

  /**
   * 测量资源加载性能
   */
  measureResourceLoading() {
    // 监听资源加载错误
    window.addEventListener('error', (e) => {
      if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
        console.error('❌ 资源加载失败:', e.target.src || e.target.href);
        
        // 发送错误报告
        this.reportError({
          type: 'resource_load_error',
          url: e.target.src || e.target.href,
          tagName: e.target.tagName
        });
      }
    }, true);

    // 监听图片加载性能
    document.addEventListener('DOMContentLoaded', () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.complete) {
          this.measureImageLoad(img);
        } else {
          img.addEventListener('load', () => {
            this.measureImageLoad(img);
          });
          img.addEventListener('error', () => {
            console.error('❌ 图片加载失败:', img.src);
          });
        }
      });
    });
  }

  /**
   * 测量图片加载性能
   */
  measureImageLoad(img) {
    const loadTime = performance.now();
    // console.log(`🖼️ 图片加载完成: ${img.src} (${loadTime.toFixed(2)}ms)`);
    
    // 检查图片是否使用了合适的格式
    this.checkImageFormat(img);
  }

  /**
   * 检查图片格式优化
   */
  checkImageFormat(img) {
    const src = img.src.toLowerCase();
    
    if (src.endsWith('.png') && !src.includes('logo') && !src.includes('icon')) {
      console.warn('⚠️ 考虑使用 WebP 格式替代 PNG:', img.src);
    }
    
    if (src.endsWith('.jpg') || src.endsWith('.jpeg')) {
      console.info('ℹ️  JPEG 图片已优化');
    }
    
    if (src.endsWith('.webp')) {
      console.info('✅ WebP 格式图片已优化');
    }
  }

  /**
   * 测量用户交互性能
   */
  measureUserInteraction() {
    // 监听点击事件响应时间
    document.addEventListener('click', (e) => {
      const startTime = performance.now();
      
      // 模拟异步操作完成后的回调
      setTimeout(() => {
        const responseTime = performance.now() - startTime;
        
        if (responseTime > 100) {
          console.warn(`⚠️ 点击响应时间较长: ${responseTime.toFixed(2)}ms`, e.target);
        }
      }, 0);
    });

    // 监听滚动性能
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTime = performance.now();
        // console.log(`🔄 滚动性能正常: ${scrollTime}`);
      }, 100);
    });
  }

  /**
   * 报告性能数据到服务器
   */
  reportPerformanceData() {
    // 这里可以集成到你的监控系统
    if (this.metrics.pageLoad) {
      // console.log('📈 发送性能数据到服务器:', this.metrics);
      
      // 示例：发送到监控服务
      // fetch('/api/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(this.metrics)
      // });
    }
  }

  /**
   * 报告错误
   */
  reportError(errorData) {
    console.error('📋 错误报告:', errorData);
    
    // 示例：发送错误报告
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData)
    // });
  }

  /**
   * 获取性能报告
   */
  getReport() {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null,
      metrics: this.metrics
    };
  }

  /**
   * 导出性能数据
   */
  exportData() {
    const data = this.getReport();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
}

// 创建全局性能监控实例
const performanceMonitor = new PerformanceMonitor();

// 导出工具函数
export const performanceUtils = {
  /**
   * 手动测量函数执行时间
   */
  measureFunction(fn, name = 'anonymous') {
    return function(...args) {
      const startTime = performance.now();
      const result = fn.apply(this, args);
      const endTime = performance.now();
      
      // console.log(`⏱️ 函数 ${name} 执行时间: ${(endTime - startTime).toFixed(2)}ms`);
      
      return result;
    };
  },

  /**
   * 检查图片是否已优化
   */
  checkImageOptimization(img) {
    return new Promise((resolve) => {
      if (img.complete) {
        performanceMonitor.checkImageFormat(img);
        resolve(true);
      } else {
        img.addEventListener('load', () => {
          performanceMonitor.checkImageFormat(img);
          resolve(true);
        });
        img.addEventListener('error', () => resolve(false));
      }
    });
  },

  /**
   * 获取当前性能数据
   */
  getPerformanceData() {
    return performanceMonitor.getReport();
  },

  /**
   * 导出性能报告
   */
  exportPerformanceReport() {
    performanceMonitor.exportData();
  }
};

export default performanceMonitor;