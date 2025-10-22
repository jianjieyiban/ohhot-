/**
 * Service Worker - 性能优化和离线支持
 * 版本: 1.0.0
 */

const CACHE_NAME = 'lei-recruitment-v1.0.0';
const API_CACHE_NAME = 'lei-recruitment-api-v1.0.0';

// 检查是否为开发环境
const isDevelopment = self.location.hostname === 'localhost' || 
                     self.location.hostname === '127.0.0.1' ||
                     self.location.port === '5173' ||
                     self.location.port === '4173';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo-lei.svg',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/site.webmanifest'
];

// 需要缓存的API端点
const API_ENDPOINTS = [
  '/api/jobs',
  '/api/jobs/',
  '/api/companies',
  '/api/categories'
];

// 安装事件 - 缓存核心资源
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker 安装中...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 缓存核心静态资源');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] 安装完成，跳过等待阶段');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] 安装失败:', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker 激活中...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 删除旧版本的缓存
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('[SW] 删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] 激活完成，接管所有客户端');
        return self.clients.claim();
      })
  );
});

// 获取事件 - 缓存策略
self.addEventListener('fetch', (event) => {
  // 在开发环境中跳过所有请求拦截
  if (isDevelopment) {
    return;
  }
  
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非HTTP请求
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 处理API请求
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 处理静态资源请求
  event.respondWith(handleStaticRequest(request));
});

/**
 * 处理API请求 - 网络优先策略
 */
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // 首先尝试网络请求
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 缓存成功的响应
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] API网络请求失败，尝试缓存:', error);
    
    // 网络失败时返回缓存内容
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 返回离线页面或错误响应
    return new Response(
      JSON.stringify({ 
        error: '网络连接失败',
        offline: true 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * 处理静态资源请求 - 缓存优先策略
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // 首先尝试缓存
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // 在后台更新缓存
    updateCacheInBackground(request, cache);
    return cachedResponse;
  }
  
  try {
    // 缓存未命中，尝试网络请求
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 缓存新资源
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] 静态资源请求失败:', error);
    
    // 返回离线页面
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    // 返回占位图片或空响应
    if (request.destination === 'image') {
      return new Response(
        '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">'
        + '<rect width="100" height="100" fill="#f0f0f0"/>'
        + '<text x="50" y="50" text-anchor="middle" dy=".3em" fill="#999">图片</text>'
        + '</svg>',
        {
          status: 200,
          headers: { 'Content-Type': 'image/svg+xml' }
        }
      );
    }
    
    return new Response('', { status: 404 });
  }
}

/**
 * 在后台更新缓存
 */
async function updateCacheInBackground(request, cache) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse);
    }
  } catch (error) {
    // 静默失败，不影响用户体验
    console.log('[SW] 后台缓存更新失败:', error);
  }
}

/**
 * 消息处理 - 与主线程通信
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_API':
      cacheApiData(payload);
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus(event);
      break;
      
    case 'CLEAR_CACHE':
      clearCache();
      break;
      
    default:
      console.log('[SW] 未知消息类型:', type);
  }
});

/**
 * 缓存API数据
 */
async function cacheApiData({ key, data }) {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put(new Request(`/api/cache/${key}`), response);
    console.log('[SW] API数据缓存成功:', key);
  } catch (error) {
    console.error('[SW] API数据缓存失败:', error);
  }
}

/**
 * 获取缓存状态
 */
async function getCacheStatus(event) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const apiCache = await caches.open(API_CACHE_NAME);
    
    const staticKeys = await cache.keys();
    const apiKeys = await apiCache.keys();
    
    event.ports[0].postMessage({
      type: 'CACHE_STATUS',
      payload: {
        staticCache: {
          size: staticKeys.length,
          keys: staticKeys.map(key => key.url)
        },
        apiCache: {
          size: apiKeys.length,
          keys: apiKeys.map(key => key.url)
        }
      }
    });
  } catch (error) {
    console.error('[SW] 获取缓存状态失败:', error);
  }
}

/**
 * 清理缓存
 */
async function clearCache() {
  try {
    await caches.delete(CACHE_NAME);
    await caches.delete(API_CACHE_NAME);
    console.log('[SW] 缓存清理完成');
  } catch (error) {
    console.error('[SW] 缓存清理失败:', error);
  }
}

/**
 * 推送通知处理
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || '您有新的消息',
    icon: '/favicon-32x32.png',
    badge: '/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || '雷招聘', options)
  );
});

/**
 * 通知点击处理
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // 尝试聚焦现有窗口
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // 打开新窗口
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});

// 错误处理
self.addEventListener('error', (event) => {
  console.error('[SW] Service Worker 错误:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Service Worker 未处理的Promise拒绝:', event.reason);
});

console.log('[SW] Service Worker 加载完成');