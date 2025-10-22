import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  
  // 项目根目录
  root: resolve(__dirname, '.'),
  
  // 公共目录
  publicDir: 'public',
  
  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    
    // 资源文件目录
    assetsDir: 'assets',
    
    // 源代码映射（生产环境关闭以减小包大小）
    sourcemap: process.env.NODE_ENV === 'production' ? false : true,
    
    // 最小化配置
    minify: 'esbuild',
    
    // 块大小警告限制
    chunkSizeWarningLimit: 500,
    
    // 资源内联限制（减小内联资源大小）
    assetsInlineLimit: 2048,
    
    // 打包配置
    rollupOptions: {
      output: {
        // 代码分割配置（确保 React 和依赖它的库在同一个chunk）
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // 将 React、ReactDOM 和 @ant-design/icons 打包在一起
            if (id.includes('react') || id.includes('react-dom') || id.includes('@ant-design/icons')) {
              return 'vendor-react'
            }
            // antd 单独打包
            if (id.includes('antd')) {
              return 'vendor-antd'
            }
            // 其他第三方库
            return 'vendor'
          }
        },
        
        // 入口文件命名
        entryFileNames: 'assets/[name]-[hash:8].js',
        
        // 块文件命名
        chunkFileNames: 'assets/[name]-[hash:8].js',
        
        // 资源文件命名（优化哈希长度）
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.').at(1)
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return 'assets/images/[name]-[hash:8].[ext]'
          }
          if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            return 'assets/fonts/[name]-[hash:8].[ext]'
          }
          return 'assets/[name]-[hash:8].[ext]'
        }
      }
    }
  },
  
  // 开发服务器配置
  server: {
    // 服务器端口
    port: 5173,
    
    // 自动打开浏览器
    open: true,
    
    // 启用热重载
    hmr: true,
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    },
    
    // 主机配置
    host: '0.0.0.0',
    
    // CORS 配置
    cors: true,
    
    // SPA路由支持（解决404问题）
    historyApiFallback: true
  },
  
  // 预览服务器配置
  preview: {
    port: 4173,
    host: '0.0.0.0',
    
    // 预览模式也需要代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  
  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@constants': resolve(__dirname, 'src/constants'),
      '@contexts': resolve(__dirname, 'src/contexts')
    }
  },
  
  // CSS 配置
  css: {
    // 预处理器选项
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    },
    
    // 模块配置
    modules: {
      localsConvention: 'camelCase'
    }
  },
  
  // 环境变量前缀
  envPrefix: 'VITE_',
  
  // 优化配置
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'dayjs'
    ],
    
    // 强制预构建
    force: true
  },
  
  // 移除实验性功能，避免构建问题
  // experimental: {
  //   renderBuiltUrl(filename, { hostType }) {
  //     if (hostType === 'js') {
  //       return { runtime: `window.assetsPath || ${JSON.stringify(filename)}` }
  //     }
  //     return filename
  //   }
  // },
  
  // 基础路径（用于部署在子路径下）
  base: '/',
  
  // 日志级别
  logLevel: 'info',
  
  // 清除屏幕
  clearScreen: true
})