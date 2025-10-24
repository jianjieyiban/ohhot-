# 三石招聘网站项目分析文档

## 项目概述

三石招聘是一个全栈招聘平台，包含前端React应用和后端Node.js API服务，提供职位发布、求职、用户管理等功能。

## 技术栈

### 后端技术栈
- **框架**: Node.js + Express.js
- **数据库**: MySQL + Sequelize ORM
- **认证**: JWT Token认证
- **安全**: Helmet安全头、CORS跨域、Rate Limiting限流
- **文件上传**: 本地文件存储
- **日志**: Morgan请求日志

### 前端技术栈
- **框架**: React 18 + Vite构建工具
- **UI组件库**: Ant Design
- **路由**: React Router DOM
- **状态管理**: React Context API
- **HTTP客户端**: Axios
- **样式**: CSS3 + Ant Design主题

## 项目结构

### 后端目录结构 (backend/)
```
backend/
├── config/           # 配置文件
│   ├── database.js  # 数据库配置
│   └── index.js     # 配置管理
├── controllers/      # 控制器层
│   ├── adminController.js    # 管理员控制器
│   ├── authController.js     # 认证控制器
│   ├── jobController.js      # 职位控制器
│   └── ...
├── middleware/       # 中间件
│   ├── auth.js              # JWT认证
│   ├── errorHandler.js      # 错误处理
│   └── validation.js        # 数据验证
├── models/           # 数据模型
│   ├── User.js              # 用户模型
│   ├── Job.js               # 职位模型
│   ├── City.js              # 城市模型
│   ├── associations.js      # 模型关联
│   └── index.js             # 模型导出
├── routes/           # 路由定义
│   ├── admin.js             # 管理员路由
│   ├── auth.js              # 认证路由
│   ├── jobs.js              # 职位路由
│   └── ...
├── uploads/          # 文件上传目录
├── app.js            # Express应用配置
├── server.js         # 服务器启动文件
└── package.json      # 依赖配置
```

### 前端目录结构 (www.ohhot.top/)
```
www.ohhot.top/
├── public/           # 静态资源
├── src/
│   ├── components/   # 公共组件
│   │   ├── Auth/            # 认证相关组件
│   │   ├── CitySelector/    # 城市选择器
│   │   └── ...
│   ├── contexts/     # 状态上下文
│   │   ├── AuthContext.jsx      # 认证状态
│   │   ├── JobContext.jsx       # 职位状态
│   │   └── CityContext.jsx      # 城市状态
│   ├── pages/        # 页面组件
│   │   ├── Admin/            # 管理后台页面
│   │   ├── Auth/             # 认证页面
│   │   ├── Home/             # 首页
│   │   └── Job/              # 职位相关页面
│   ├── services/     # API服务
│   ├── utils/        # 工具函数
│   ├── App.jsx       # 根组件
│   └── main.jsx      # 应用入口
├── vite.config.js    # Vite配置
└── package.json      # 依赖配置
```

## 核心功能模块

### 1. 用户认证系统
- **用户类型**: 求职者(1)、管理员(2)、企业用户(3)
- **登录方式**: 邮箱/手机号 + 密码
- **注册流程**: 用户信息验证、城市选择、企业信息填写
- **安全特性**: JWT Token、密码加密、登录日志

### 2. 职位管理模块
- **职位发布**: 企业用户可发布职位信息
- **职位搜索**: 关键词、城市、薪资、经验等多条件筛选
- **职位收藏**: 用户可收藏感兴趣的职位
- **职位申请**: 求职者可在线申请职位

### 3. 城市管理模块
- **城市数据**: 支持全国主要城市
- **热门城市**: 展示热门招聘城市
- **城市搜索**: 按名称搜索城市

### 4. 管理员后台
- **数据统计**: 用户数、职位数、收入等统计
- **用户管理**: 用户列表查看、删除操作
- **职位管理**: 职位审核、删除操作
- **系统监控**: 登录日志、系统日志

### 5. 简历管理模块
- **简历创建**: 求职者可创建个人简历
- **简历管理**: 编辑、删除、查看简历
- **简历投递**: 一键投递简历到目标职位

## 数据库设计

### 核心数据表
1. **users表**: 用户信息存储
2. **jobs表**: 职位信息存储
3. **cities表**: 城市信息存储
4. **job_favorites表**: 职位收藏关系
5. **applications表**: 职位申请记录
6. **login_logs表**: 用户登录日志

### 数据模型关联
- 用户 ↔ 职位 (一对多)
- 城市 ↔ 职位 (一对多)
- 用户 ↔ 职位收藏 (多对多)
- 用户 ↔ 职位申请 (一对多)
- 职位 ↔ 职位申请 (一对多)

## API接口设计

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/profile` - 获取用户信息
- `POST /api/auth/logout` - 用户登出

### 职位接口
- `GET /api/jobs` - 获取职位列表
- `POST /api/jobs` - 发布职位
- `GET /api/jobs/:id` - 获取职位详情
- `PUT /api/jobs/:id` - 更新职位信息
- `DELETE /api/jobs/:id` - 删除职位

### 管理员接口
- `GET /api/admin/stats` - 获取统计数据
- `GET /api/admin/users` - 获取用户列表
- `GET /api/admin/jobs` - 获取职位列表
- `DELETE /api/admin/users/:id` - 删除用户
- `DELETE /api/admin/jobs/:id` - 删除职位

## 安全特性

### 1. 认证安全
- JWT Token认证机制
- Token过期时间管理
- 密码加密存储 (bcrypt)

### 2. 请求安全
- CORS跨域配置
- Rate Limiting请求限流
- Helmet安全头设置
- SQL注入防护

### 3. 数据安全
- 敏感信息脱敏处理
- 权限验证中间件
- 文件上传类型限制

## 部署配置

### 环境变量配置
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=recruitment_db

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10mb
```

### 启动命令
```bash
# 后端启动
cd backend
npm install
npm start

# 前端启动
cd www.ohhot.top
npm install
npm run dev
```

## 项目特色

### 1. 响应式设计
- 支持PC端和移动端访问
- 自适应布局设计
- 移动端优化交互

### 2. 用户体验
- 快速登录体验账号
- 智能搜索和筛选
- 实时数据更新
- 错误友好提示

### 3. 代码质量
- 模块化架构设计
- 统一的错误处理
- 详细的代码注释
- 规范的API设计

## 扩展建议

### 功能扩展
1. **消息系统**: 站内信、通知推送
2. **支付系统**: 职位推广、会员服务
3. **推荐算法**: 智能职位推荐
4. **数据分析**: 招聘趋势分析

### 技术优化
1. **缓存策略**: Redis缓存热点数据
2. **微服务**: 服务拆分和独立部署
3. **监控系统**: 性能监控和告警
4. **CI/CD**: 自动化部署流程

## 总结

三石招聘网站是一个功能完整、架构清晰的招聘平台项目。项目采用现代化的技术栈，具有良好的可扩展性和维护性。前后端分离的架构设计使得项目可以独立开发和部署，模块化的代码组织便于团队协作和功能扩展。
