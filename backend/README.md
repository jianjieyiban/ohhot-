# 三石招聘 - 后端服务

专业的招聘平台后端 API 服务，基于 Node.js + Express 构建。

## 联系我们

- 📧 邮箱：1323432580@qq.com
- 📱 手机：15608476465
- 💬 微信公众号：南岳衡山万事通
- ⏰ 工作时间：周一至周五 9:00-18:00

## 功能特性

### 核心功能
- 🔐 **用户认证** - JWT Token 认证、权限管理
- 👥 **用户管理** - 用户注册、个人信息、角色管理
- 💼 **职位管理** - 职位发布、编辑、搜索、筛选
- 📝 **申请管理** - 职位申请、申请状态跟踪
- 🏢 **企业管理** - 企业认证、职位管理
- 📊 **数据统计** - 平台数据统计和分析

### 技术特性
- 🚀 **高性能** - 基于 Express 的快速 API 服务
- 🔒 **安全性** - JWT 认证、输入验证、SQL 注入防护
- 📈 **可扩展** - 模块化架构、易于扩展
- 📋 **文档化** - Swagger API 文档
- 🧪 **测试覆盖** - 单元测试和集成测试
- 🐳 **容器化** - Docker 支持

## 技术栈

### 后端框架
- **Node.js** - JavaScript 运行时
- **Express.js** - Web 应用框架
- **MySQL** - 关系型数据库
- **Redis** - 缓存和会话存储

### 开发工具
- **JWT** - JSON Web Token 认证
- **bcrypt** - 密码加密
- **Multer** - 文件上传处理
- **Nodemailer** - 邮件发送
- **Winston** - 日志记录

### 测试工具
- **Jest** - 测试框架
- **Supertest** - HTTP 测试

## 项目结构

```
my-server/
├── src/
│   ├── controllers/         # 控制器层
│   │   ├── auth.js         # 认证控制器
│   │   ├── users.js        # 用户控制器
│   │   ├── jobs.js         # 职位控制器
│   │   ├── applications.js # 申请控制器
│   │   └── companies.js    # 企业控制器
│   ├── models/             # 数据模型层
│   │   ├── User.js         # 用户模型
│   │   ├── Job.js          # 职位模型
│   │   ├── Application.js  # 申请模型
│   │   ├── Company.js      # 企业模型
│   │   └── City.js         # 城市模型
│   ├── routes/             # 路由层
│   │   ├── auth.js         # 认证路由
│   │   ├── users.js        # 用户路由
│   │   ├── jobs.js         # 职位路由
│   │   ├── applications.js # 申请路由
│   │   └── companies.js    # 企业路由
│   ├── middleware/         # 中间件
│   │   ├── auth.js         # 认证中间件
│   │   ├── validation.js   # 验证中间件
│   │   ├── errorHandler.js # 错误处理
│   │   └── rateLimit.js    # 限流中间件
│   ├── utils/              # 工具函数
│   │   ├── database.js     # 数据库连接
│   │   ├── jwt.js          # JWT 工具
│   │   ├── email.js        # 邮件工具
│   │   ├── upload.js       # 文件上传
│   │   └── logger.js       # 日志工具
│   ├── config/             # 配置文件
│   │   ├── database.js     # 数据库配置
│   │   ├── jwt.js          # JWT 配置
│   │   └── server.js       # 服务器配置
│   └── app.js              # 应用入口
├── tests/                  # 测试文件
├── uploads/                # 文件上传目录
├── logs/                   # 日志目录
├── package.json            # 依赖配置
└── README.md              # 项目说明
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- Redis >= 6.0（可选）

### 安装依赖

```bash
# 进入项目目录
cd my-server

# 使用 npm
npm install

# 使用 yarn
yarn install

# 使用 pnpm
pnpm install
```

### 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env
```

2. 修改 `.env` 文件中的配置：
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sanshi_recruit
JWT_SECRET=your_super_secret_jwt_key_here
```

3. 创建数据库：
```sql
CREATE DATABASE lw CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start

# 使用 yarn
yarn dev
```

服务将在 http://localhost:5000 启动。

## API 文档

启动服务后，访问 http://localhost:5000/api-docs 查看 Swagger API 文档。

### 主要 API 端点

#### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新 Token
- `POST /api/auth/logout` - 用户登出

#### 用户相关
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息
- `GET /api/users/applications` - 获取申请记录

#### 职位相关
- `GET /api/jobs` - 获取职位列表
- `GET /api/jobs/:id` - 获取职位详情
- `POST /api/jobs` - 创建职位（企业用户）
- `PUT /api/jobs/:id` - 更新职位（企业用户）
- `DELETE /api/jobs/:id` - 删除职位（企业用户）

#### 申请相关
- `POST /api/applications` - 申请职位
- `GET /api/applications/:id` - 获取申请详情
- `PUT /api/applications/:id` - 更新申请状态

## 数据库设计

### 主要数据表

#### users 表
- 用户基本信息
- 认证信息
- 角色权限

#### jobs 表
- 职位信息
- 企业信息
- 薪资待遇

#### applications 表
- 申请记录
- 申请状态
- 时间戳

#### companies 表
- 企业信息
- 认证状态
- 联系方式

#### cities 表
- 城市数据
- 区域信息

## 部署指南

### 传统部署

1. **构建项目**
```bash
npm run build
```

2. **启动服务**
```bash
npm start
```

### Docker 部署

1. **构建镜像**
```bash
docker build -t sanshi-recruit-server .
```

2. **运行容器**
```bash
docker run -p 5000:5000 sanshi-recruit-server
```

### PM2 部署

1. **安装 PM2**
```bash
npm install -g pm2
```

2. **启动应用**
```bash
pm2 start ecosystem.config.js
```

## 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行特定测试文件
npm test -- tests/auth.test.js
```

### 测试覆盖率

项目包含单元测试和集成测试，确保代码质量和功能稳定性。

## 监控和日志

### 日志配置

- 开发环境：控制台输出
- 生产环境：文件日志 + 控制台
- 支持日志分级：error、warn、info、debug

### 健康检查

访问 `/health` 端点获取服务健康状态：

```bash
curl http://localhost:5000/health
```

## 安全考虑

### 已实现的安全措施

- JWT Token 认证
- 密码加密存储（bcrypt）
- SQL 注入防护
- XSS 攻击防护
- CSRF 保护
- 请求频率限制
- 输入数据验证

### 建议的安全实践

- 定期更新依赖
- 使用 HTTPS
- 配置防火墙
- 监控异常请求
- 定期安全审计

## 贡献指南

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- 遵循 JavaScript Standard Style
- 使用 ESLint 检查代码
- 编写清晰的注释
- 添加适当的测试用例

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目主页: [https://github.com/jianjieyiban/sanshi-recruit-edgeone](https://github.com/jianjieyiban/sanshi-recruit-edgeone)
- 问题反馈: [GitHub Issues](https://github.com/jianjieyiban/sanshi-recruit-edgeone/issues)
- 邮箱: tech@sanshi.com

## 更新日志

### v1.0.0 (2024-01-01)
- ✨ 初始版本发布
- 🎉 基础 API 功能实现
- 🔐 JWT 认证系统
- 📊 数据库设计和迁移
- 🧪 测试框架搭建