import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// 导入路由
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import cityRoutes from './routes/cities.js';
import adminRoutes from './routes/admin.js';
import resumeRoutes from './routes/resumes.js';
import favoriteRoutes from './routes/favorites.js';
import applicationRoutes from './routes/applications.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';

// 导入中间件
import { errorHandler } from './middleware/errorHandler.js';

// ES模块的__dirname替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 生产环境100次，开发环境1000次
  message: {
    error: '请求过于频繁，请稍后再试',
    retryAfter: 900 // 15分钟
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// 压缩中间件
app.use(compression());

// 日志中间件
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 设置响应字符编码
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API文档端点
app.get('/api', (req, res) => {
  res.json({
    message: '三石招聘系统 API',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/profile',
        logout: 'POST /api/auth/logout'
      },
      jobs: {
        list: 'GET /api/jobs',
        create: 'POST /api/jobs',
        detail: 'GET /api/jobs/:id',
        update: 'PUT /api/jobs/:id',
        delete: 'DELETE /api/jobs/:id',
        myJobs: 'GET /api/jobs/my'
      },
      cities: {
        list: 'GET /api/cities',
        detail: 'GET /api/cities/:id',
        hot: 'GET /api/cities/hot',
        search: 'GET /api/cities/search'
      },
      admin: {
        stats: 'GET /api/admin/stats',
        users: 'GET /api/admin/users',
        jobs: 'GET /api/admin/jobs',
        deleteUser: 'DELETE /api/admin/users/:id',
        deleteJob: 'DELETE /api/admin/jobs/:id',
        approveJob: 'PUT /api/admin/jobs/:id/approve',
        rejectJob: 'PUT /api/admin/jobs/:id/reject',
        logs: 'GET /api/admin/logs'
      },
      resumes: {
        list: 'GET /api/resumes',
        create: 'POST /api/resumes',
        detail: 'GET /api/resumes/:id',
        update: 'PUT /api/resumes/:id',
        delete: 'DELETE /api/resumes/:id'
      },
      favorites: {
        list: 'GET /api/favorites',
        add: 'POST /api/favorites',
        remove: 'DELETE /api/favorites/:jobId',
        check: 'GET /api/favorites/check/:jobId'
      },
      applications: {
        list: 'GET /api/applications',
        apply: 'POST /api/applications/:jobId',
        detail: 'GET /api/applications/:id',
        cancel: 'DELETE /api/applications/:id'
      },
      messages: {
        list: 'GET /api/messages',
        send: 'POST /api/messages',
        markRead: 'PUT /api/messages/:id/read',
        delete: 'DELETE /api/messages/:id',
        unreadCount: 'GET /api/messages/unread-count'
      },
      notifications: {
        list: 'GET /api/notifications',
        markRead: 'PUT /api/notifications/:id/read',
        markAllRead: 'PUT /api/notifications/read-all',
        delete: 'DELETE /api/notifications/:id',
        unreadCount: 'GET /api/notifications/unread-count'
      }
    },
    documentation: 'https://github.com/jianjieyiban/sanshi-recruit-edgeone'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

export default app;