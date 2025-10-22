/**
 * Service Worker 注册和管理工具
 */
```
class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.updateCallback = null;
    this.isUpdateAvailable = false;
    this.updateCallbacks = [];
    this.isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.port === '5173' ||
                         window.location.port === '4173';
  }
```
  /**
   * 注册 Service Worker
   */
  async register() {
    // 在开发环境中跳过Service Worker注册
    if (this.isDevelopment) {
      console.log('开发环境：跳过Service Worker注册');
      return false;
    }
    
    if (!this.isSupported) {
      console.warn('Service Worker 不支持当前浏览器');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      // console.log('Service Worker 注册成功:', this.registration);

      // 监听更新事件
      this.setupUpdateListeners();
      
      // 检查是否有等待激活的更新
      this.checkForUpdates();

      return true;
    } catch (error) {
      console.error('Service Worker 注册失败:', error);
      return false;
    }
  }

  /**
   * 设置更新监听器
   */
  setupUpdateListeners() {
    if (!this.registration) return;

    // 监听 Service Worker 更新
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 新版本已安装，等待激活
          this.isUpdateAvailable = true;
          this.notifyUpdateAvailable();
        }
      });
    });

    // 监听控制器变化
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // console.log('Service Worker 控制器已更新');
      window.location.reload();
    });
  }

  /**
   * 检查更新
   */
  async checkForUpdates() {
    if (!this.registration) return;

    try {
      await this.registration.update();
      // console.log('Service Worker 更新检查完成');
    } catch (error) {
      console.error('Service Worker 更新检查失败:', error);
    }
  }

  /**
   * 通知更新可用
   */
  notifyUpdateAvailable() {
    this.updateCallbacks.forEach(callback => {
      callback(this.registration);
    });
  }

  /**
   * 添加更新回调
   */
  onUpdateAvailable(callback) {
    this.updateCallbacks.push(callback);
  }

  /**
   * 激活更新
   */
  async activateUpdate() {
    if (!this.registration || !this.registration.waiting) {
      console.warn('没有等待激活的 Service Worker');
      return false;
    }

    try {
      // 发送跳过等待消息
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      // console.log('Service Worker 更新激活请求已发送');
      return true;
    } catch (error) {
      console.error('Service Worker 更新激活失败:', error);
      return false;
    }
  }

  /**
   * 卸载 Service Worker
   */
  async unregister() {
    if (!this.registration) return false;

    try {
      const result = await this.registration.unregister();
      // console.log('Service Worker 卸载结果:', result);
      return result;
    } catch (error) {
      console.error('Service Worker 卸载失败:', error);
      return false;
    }
  }

  /**
   * 获取缓存状态
   */
  async getCacheStatus() {
    if (!this.registration) return null;

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.type === 'CACHE_STATUS') {
          resolve(event.data.payload);
        }
      };

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_CACHE_STATUS' },
          [messageChannel.port2]
        );
      } else {
        resolve(null);
      }
    });
  }

  /**
   * 缓存 API 数据
   */
  async cacheApiData(key, data) {
    if (!navigator.serviceWorker.controller) return false;

    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_API',
        payload: { key, data }
      });
      return true;
    } catch (error) {
      console.error('API 数据缓存失败:', error);
      return false;
    }
  }

  /**
   * 清理缓存
   */
  async clearCache() {
    if (!navigator.serviceWorker.controller) return false;

    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE'
      });
      return true;
    } catch (error) {
      console.error('缓存清理失败:', error);
      return false;
    }
  }

  /**
   * 检查离线状态
   */
  isOffline() {
    return !navigator.onLine;
  }

  /**
   * 获取网络状态
   */
  getNetworkStatus() {
    if (navigator.connection) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData,
        online: navigator.onLine
      };
    }
    return {
      online: navigator.onLine
    };
  }

  /**
   * 显示更新提示
   */
  showUpdatePrompt() {
    if (!this.isUpdateAvailable) return;

    const shouldUpdate = confirm(
      '发现新版本，是否立即更新？\n\n' +
      '更新后页面将自动刷新以应用最新功能。'
    );

    if (shouldUpdate) {
      this.activateUpdate();
    }
  }

  /**
   * 初始化
   */
  async init() {
    if (!this.isSupported) {
      console.warn('Service Worker 不支持当前环境');
      return false;
    }

    // 等待页面加载完成
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    const result = await this.register();
    
    if (result) {
      // 监听网络状态变化
      this.setupNetworkListeners();
    }

    return result;
  }

  /**
   * 设置网络监听器
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      // console.log('网络连接恢复');
      this.onNetworkRestored();
    });

    window.addEventListener('offline', () => {
      console.warn('网络连接中断');
      this.onNetworkLost();
    });
  }

  /**
   * 网络恢复时的处理
   */
  onNetworkRestored() {
    // 检查更新
    this.checkForUpdates();
    
    // 显示网络恢复提示
    this.showNetworkRestoredMessage();
  }

  /**
   * 网络中断时的处理
   */
  onNetworkLost() {
    // 显示离线提示
    this.showOfflineMessage();
  }

  /**
   * 显示网络恢复消息
   */
  showNetworkRestoredMessage() {
    // 可以使用更友好的UI组件替代alert
    // console.log('网络连接已恢复');
  }

  /**
   * 显示离线消息
   */
  showOfflineMessage() {
    console.warn('网络连接已中断，进入离线模式');
  }
}

// 创建全局实例
const serviceWorkerManager = new ServiceWorkerManager();

// 导出工具函数
export const serviceWorker = {
  /**
   * 初始化 Service Worker
   */
  async init() {
    return serviceWorkerManager.init();
  },

  /**
   * 检查更新可用性
   */
  onUpdateAvailable(callback) {
    serviceWorkerManager.onUpdateAvailable(callback);
  },

  /**
   * 激活更新
   */
  async activateUpdate() {
    return serviceWorkerManager.activateUpdate();
  },

  /**
   * 获取缓存状态
   */
  async getCacheStatus() {
    return serviceWorkerManager.getCacheStatus();
  },

  /**
   * 缓存 API 数据
   */
  async cacheApiData(key, data) {
    return serviceWorkerManager.cacheApiData(key, data);
  },

  /**
   * 清理缓存
   */
  async clearCache() {
    return serviceWorkerManager.clearCache();
  },

  /**
   * 检查是否离线
   */
  isOffline() {
    return serviceWorkerManager.isOffline();
  },

  /**
   * 获取网络状态
   */
  getNetworkStatus() {
    return serviceWorkerManager.getNetworkStatus();
  },

  /**
   * 显示更新提示
   */
  showUpdatePrompt() {
    serviceWorkerManager.showUpdatePrompt();
  },

  /**
   * 卸载 Service Worker
   */
  async unregister() {
    return serviceWorkerManager.unregister();
  }
};

// 默认导出
export default serviceWorker;