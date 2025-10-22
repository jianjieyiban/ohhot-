# 三石招聘 - 前端项目

专业的招聘平台前端应用，基于 React + Vite 构建。

## 联系我们

- 📧 邮箱：1323432580@qq.com
- 📱 手机：15608476465
- 💬 微信公众号：南岳衡山万事通
- ⏰ 工作时间：周一至周五 9:00-18:00

## 功能特性

### 用户功能
- 🔐 **用户认证** - 注册、登录、密码找回
- 👤 **个人中心** - 个人信息管理、简历上传
- 💼 **职位浏览** - 搜索、筛选、收藏职位
- 📝 **职位申请** - 在线申请、申请记录管理
- 🏢 **企业入驻** - 企业认证、职位发布管理

### 技术特性
- ⚡ **快速构建** - 基于 Vite 的快速开发体验
- 📱 **响应式设计** - 支持移动端和桌面端
- 🎨 **主题系统** - 支持亮色/深色主题切换
- 🔧 **TypeScript** - 类型安全的开发体验
- 🧪 **测试覆盖** - 单元测试和集成测试
- 📦 **组件化** - 可复用的 UI 组件库

## 技术栈

### 前端框架
- **React 18** - 用户界面库
- **React Router** - 路由管理
- **React Context** - 状态管理

### 构建工具
- **Vite** - 快速构建工具
- **TypeScript** - 类型系统
- **ESLint** - 代码检查
- **Prettier** - 代码格式化

### UI 组件
- **CSS Modules** - 样式模块化
- **自定义组件** - 可复用 UI 组件

### 开发工具
- **Axios** - HTTP 请求库
- **Day.js** - 日期处理
- **React Hook Form** - 表单处理

## 项目结构

```
my-web/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 可复用组件
│   │   ├── Layout/        # 布局组件
│   │   ├── JobCard/       # 职位卡片
│   │   ├── SearchBar/     # 搜索组件
│   │   └── Pagination/    # 分页组件
│   ├── pages/             # 页面组件
│   │   ├── Home/          # 首页
│   │   ├── Auth/          # 认证页面
│   │   ├── Jobs/          # 职位相关页面
│   │   └── User/          # 用户相关页面
│   ├── contexts/          # React Context
│   │   ├── AuthContext/   # 认证状态
│   │   ├── JobContext/    # 职位状态
│   │   └── CityContext/  # 城市数据
│   ├── utils/             # 工具函数
│   │   ├── api.js         # API 封装
│   │   └── helpers.js     # 通用工具
│   ├── styles/            # 样式文件
│   │   └── theme.js       # 主题配置
│   ├── constants/         # 常量定义
│   │   └── index.js       # 应用常量
│   └── App.jsx            # 应用入口
├── package.json           # 依赖配置
├── vite.config.js         # Vite 配置
└── README.md             # 项目说明
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
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
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_TITLE=三石招聘
VITE_DEBUG=true
```

### 开发模式

```bash
# 启动开发服务器
npm run dev

# 或使用 yarn
yarn dev

# 或使用 pnpm
pnpm dev
```

应用将在 http://localhost:5173 启动。

### 构建生产版本

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 脚本说明

### 开发脚本
- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建

### 代码质量
- `npm run lint` - 运行 ESLint 检查
- `npm run lint:fix` - 自动修复 ESLint 问题
- `npm run format` - 格式化代码

### 测试脚本
- `npm run test` - 运行测试
- `npm run test:coverage` - 生成测试覆盖率报告

## 部署指南

### 静态文件部署

项目构建后生成静态文件，可以部署到任何静态文件服务器：

1. **构建项目**
```bash
npm run build
```

2. **部署到服务器**
将 `dist` 目录上传到 Web 服务器（如 Nginx、Apache）

### Docker 部署

1. **构建 Docker 镜像**
```bash
docker build -t sanshi-recruit-web .
```

2. **运行容器**
```bash
docker run -p 80:80 sanshi-recruit-web
```

### 平台部署

- **Vercel**: 连接 GitHub 仓库自动部署
- **Netlify**: 拖拽 `dist` 文件夹部署
- **GitHub Pages**: 使用 GitHub Actions 自动部署

## API 集成

前端应用需要与后端 API 服务配合使用：

### 后端服务要求
- 基础 URL: `http://localhost:3001/api`
- CORS 配置: 允许前端域名访问
- 认证方式: JWT Token

### 主要 API 端点

- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `GET /jobs` - 获取职位列表
- `GET /jobs/:id` - 获取职位详情
- `POST /jobs/:id/apply` - 申请职位

## 浏览器支持

| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | 88+ |
| Firefox | 78+ |
| Safari | 14+ |
| Edge | 88+ |

## 贡献指南

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- 使用 ESLint 和 Prettier 保持代码风格一致
- 提交前运行 `npm run lint` 检查代码
- 遵循 React Hooks 最佳实践
- 编写清晰的组件文档

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目主页: [https://github.com/jianjieyiban/sanshi-recruit-edgeone](https://github.com/jianjieyiban/sanshi-recruit-edgeone)
- 问题反馈: [GitHub Issues](https://github.com/jianjieyiban/sanshi-recruit-edgeone/issues)
- 邮箱: support@sanshi.com

## 更新日志

### v1.0.0 (2024-01-01)
- ✨ 初始版本发布
- 🎉 基础功能实现
- 📱 响应式设计支持