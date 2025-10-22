// 应用常量配置

// 应用信息
export const APP_INFO = {
  name: '三石招聘',
  version: '1.0.0',
  description: '专业的招聘平台，连接企业与人才',
  author: '三石科技',
  copyright: '© 2024 三石科技. All rights reserved.'
};

// API配置
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  retryCount: 3,
  retryDelay: 1000
};

// 用户角色
export const USER_ROLES = {
  JOB_SEEKER: 'job_seeker',      // 求职者
  EMPLOYER: 'employer',          // 企业用户
  ADMIN: 'admin'                 // 管理员
};

// 职位类型
export const JOB_TYPES = {
  FULL_TIME: 'full_time',        // 全职
  PART_TIME: 'part_time',        // 兼职
  INTERNSHIP: 'internship',      // 实习
  REMOTE: 'remote',              // 远程
  CONTRACT: 'contract'           // 合同工
};

// 职位类型显示文本
export const JOB_TYPE_LABELS = {
  [JOB_TYPES.FULL_TIME]: '全职',
  [JOB_TYPES.PART_TIME]: '兼职',
  [JOB_TYPES.INTERNSHIP]: '实习',
  [JOB_TYPES.REMOTE]: '远程',
  [JOB_TYPES.CONTRACT]: '合同工'
};

// 工作经验要求
export const EXPERIENCE_LEVELS = {
  NO_EXPERIENCE: 'no_experience',    // 无经验
  INTERN: 'intern',                  // 实习生
  JUNIOR: 'junior',                  // 初级（1-3年）
  MIDDLE: 'middle',                  // 中级（3-5年）
  SENIOR: 'senior',                  // 高级（5-10年）
  EXPERT: 'expert'                   // 专家（10年以上）
};

// 工作经验显示文本
export const EXPERIENCE_LABELS = {
  [EXPERIENCE_LEVELS.NO_EXPERIENCE]: '无经验',
  [EXPERIENCE_LEVELS.INTERN]: '实习生',
  [EXPERIENCE_LEVELS.JUNIOR]: '1-3年',
  [EXPERIENCE_LEVELS.MIDDLE]: '3-5年',
  [EXPERIENCE_LEVELS.SENIOR]: '5-10年',
  [EXPERIENCE_LEVELS.EXPERT]: '10年以上'
};

// 教育背景要求
export const EDUCATION_LEVELS = {
  HIGH_SCHOOL: 'high_school',        // 高中
  COLLEGE: 'college',                // 大专
  BACHELOR: 'bachelor',              // 本科
  MASTER: 'master',                  // 硕士
  DOCTOR: 'doctor',                  // 博士
  OTHER: 'other'                     // 其他
};

// 教育背景显示文本
export const EDUCATION_LABELS = {
  [EDUCATION_LEVELS.HIGH_SCHOOL]: '高中',
  [EDUCATION_LEVELS.COLLEGE]: '大专',
  [EDUCATION_LEVELS.BACHELOR]: '本科',
  [EDUCATION_LEVELS.MASTER]: '硕士',
  [EDUCATION_LEVELS.DOCTOR]: '博士',
  [EDUCATION_LEVELS.OTHER]: '其他'
};

// 薪资范围（月薪，单位：元）
export const SALARY_RANGES = {
  '0-3000': '3k以下',
  '3000-5000': '3k-5k',
  '5000-8000': '5k-8k',
  '8000-12000': '8k-12k',
  '12000-20000': '12k-20k',
  '20000-30000': '20k-30k',
  '30000-50000': '30k-50k',
  '50000-100000': '50k-100k',
  '100000+': '100k以上'
};

// 职位状态
export const JOB_STATUS = {
  DRAFT: 'draft',                    // 草稿
  PUBLISHED: 'published',            // 已发布
  CLOSED: 'closed',                  // 已关闭
  EXPIRED: 'expired'                 // 已过期
};

// 职位状态显示文本
export const JOB_STATUS_LABELS = {
  [JOB_STATUS.DRAFT]: '草稿',
  [JOB_STATUS.PUBLISHED]: '已发布',
  [JOB_STATUS.CLOSED]: '已关闭',
  [JOB_STATUS.EXPIRED]: '已过期'
};

// 申请状态
export const APPLICATION_STATUS = {
  PENDING: 'pending',                // 待处理
  REVIEWING: 'reviewing',            // 审核中
  INTERVIEW: 'interview',            // 面试中
  OFFER: 'offer',                    // 已录用
  REJECTED: 'rejected',             // 已拒绝
  WITHDRAWN: 'withdrawn'            // 已撤回
};

// 申请状态显示文本
export const APPLICATION_STATUS_LABELS = {
  [APPLICATION_STATUS.PENDING]: '待处理',
  [APPLICATION_STATUS.REVIEWING]: '审核中',
  [APPLICATION_STATUS.INTERVIEW]: '面试中',
  [APPLICATION_STATUS.OFFER]: '已录用',
  [APPLICATION_STATUS.REJECTED]: '已拒绝',
  [APPLICATION_STATUS.WITHDRAWN]: '已撤回'
};

// 申请状态颜色
export const APPLICATION_STATUS_COLORS = {
  [APPLICATION_STATUS.PENDING]: '#ff9800',
  [APPLICATION_STATUS.REVIEWING]: '#2196f3',
  [APPLICATION_STATUS.INTERVIEW]: '#9c27b0',
  [APPLICATION_STATUS.OFFER]: '#4caf50',
  [APPLICATION_STATUS.REJECTED]: '#f44336',
  [APPLICATION_STATUS.WITHDRAWN]: '#9e9e9e'
};

// 行业分类
export const INDUSTRIES = {
  IT: 'it',                          // IT/互联网
  FINANCE: 'finance',                // 金融
  EDUCATION: 'education',            // 教育
  HEALTHCARE: 'healthcare',          // 医疗健康
  MANUFACTURING: 'manufacturing',    // 制造业
  REAL_ESTATE: 'real_estate',        // 房地产
  RETAIL: 'retail',                  // 零售
  MEDIA: 'media',                    // 媒体/广告
  TRANSPORTATION: 'transportation',  // 交通/物流
  CONSTRUCTION: 'construction',      // 建筑
  ENERGY: 'energy',                  // 能源
  GOVERNMENT: 'government',          // 政府/非营利
  OTHER: 'other'                     // 其他
};

// 行业分类显示文本
export const INDUSTRY_LABELS = {
  [INDUSTRIES.IT]: 'IT/互联网',
  [INDUSTRIES.FINANCE]: '金融',
  [INDUSTRIES.EDUCATION]: '教育',
  [INDUSTRIES.HEALTHCARE]: '医疗健康',
  [INDUSTRIES.MANUFACTURING]: '制造业',
  [INDUSTRIES.REAL_ESTATE]: '房地产',
  [INDUSTRIES.RETAIL]: '零售',
  [INDUSTRIES.MEDIA]: '媒体/广告',
  [INDUSTRIES.TRANSPORTATION]: '交通/物流',
  [INDUSTRIES.CONSTRUCTION]: '建筑',
  [INDUSTRIES.ENERGY]: '能源',
  [INDUSTRIES.GOVERNMENT]: '政府/非营利',
  [INDUSTRIES.OTHER]: '其他'
};

// 福利待遇
export const BENEFITS = {
  FIVE_INSURANCE: 'five_insurance',          // 五险一金
  ANNUAL_BONUS: 'annual_bonus',              // 年终奖
  STOCK_OPTIONS: 'stock_options',            // 股票期权
  FLEXIBLE_WORK: 'flexible_work',            // 弹性工作
  REMOTE_WORK: 'remote_work',                // 远程办公
  TRAINING: 'training',                      // 培训学习
  TEAM_BUILDING: 'team_building',            // 团建活动
  HEALTH_CHECKUP: 'health_checkup',          // 年度体检
  PAID_VACATION: 'paid_vacation',            // 带薪年假
  MEAL_SUBSIDY: 'meal_subsidy',              // 餐补
  TRANSPORTATION_SUBSIDY: 'transportation_subsidy', // 交通补贴
  HOUSING_SUBSIDY: 'housing_subsidy',        // 住房补贴
  CHILDCARE: 'childcare',                    // 子女教育
  OTHER: 'other'                             // 其他福利
};

// 福利待遇显示文本
export const BENEFIT_LABELS = {
  [BENEFITS.FIVE_INSURANCE]: '五险一金',
  [BENEFITS.ANNUAL_BONUS]: '年终奖',
  [BENEFITS.STOCK_OPTIONS]: '股票期权',
  [BENEFITS.FLEXIBLE_WORK]: '弹性工作',
  [BENEFITS.REMOTE_WORK]: '远程办公',
  [BENEFITS.TRAINING]: '培训学习',
  [BENEFITS.TEAM_BUILDING]: '团建活动',
  [BENEFITS.HEALTH_CHECKUP]: '年度体检',
  [BENEFITS.PAID_VACATION]: '带薪年假',
  [BENEFITS.MEAL_SUBSIDY]: '餐补',
  [BENEFITS.TRANSPORTATION_SUBSIDY]: '交通补贴',
  [BENEFITS.HOUSING_SUBSIDY]: '住房补贴',
  [BENEFITS.CHILDCARE]: '子女教育',
  [BENEFITS.OTHER]: '其他福利'
};

// 城市等级
export const CITY_LEVELS = {
  TIER_1: 'tier_1',                  // 一线城市
  TIER_2: 'tier_2',                  // 二线城市
  TIER_3: 'tier_3',                  // 三线城市
  TIER_4: 'tier_4',                  // 四线城市
  TIER_5: 'tier_5'                   // 五线城市
};

// 城市等级显示文本
export const CITY_LEVEL_LABELS = {
  [CITY_LEVELS.TIER_1]: '一线城市',
  [CITY_LEVELS.TIER_2]: '二线城市',
  [CITY_LEVELS.TIER_3]: '三线城市',
  [CITY_LEVELS.TIER_4]: '四线城市',
  [CITY_LEVELS.TIER_5]: '五线城市'
};

// 热门城市（默认）
export const HOT_CITIES = [
  { id: 1, name: '北京', level: CITY_LEVELS.TIER_1 },
  { id: 2, name: '上海', level: CITY_LEVELS.TIER_1 },
  { id: 3, name: '广州', level: CITY_LEVELS.TIER_1 },
  { id: 4, name: '深圳', level: CITY_LEVELS.TIER_1 },
  { id: 5, name: '杭州', level: CITY_LEVELS.TIER_2 },
  { id: 6, name: '南京', level: CITY_LEVELS.TIER_2 },
  { id: 7, name: '武汉', level: CITY_LEVELS.TIER_2 },
  { id: 8, name: '成都', level: CITY_LEVELS.TIER_2 },
  { id: 9, name: '西安', level: CITY_LEVELS.TIER_2 },
  { id: 10, name: '苏州', level: CITY_LEVELS.TIER_2 }
];

// 文件上传配置
export const UPLOAD_CONFIG = {
  // 头像上传
  avatar: {
    maxSize: 2 * 1024 * 1024, // 2MB
    accept: 'image/jpeg,image/png,image/gif',
    dimensions: {
      width: 200,
      height: 200
    }
  },
  
  // 简历上传
  resume: {
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: '.pdf,.doc,.docx,.txt',
    types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  },
  
  // 职位图片上传
  jobImage: {
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: 'image/jpeg,image/png,image/gif',
    dimensions: {
      width: 800,
      height: 400
    }
  }
};

// 分页配置
export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
};

// 表单验证规则
export const VALIDATION_RULES = {
  // 邮箱验证
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入有效的邮箱地址'
  },
  
  // 手机号验证
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入有效的手机号码'
  },
  
  // 密码验证
  password: {
    minLength: 8,
    message: '密码长度至少8位'
  },
  
  // 用户名验证
  username: {
    pattern: /^[a-zA-Z0-9_]{4,20}$/,
    message: '用户名只能包含字母、数字和下划线，长度4-20位'
  },
  
  // 中文姓名验证
  chineseName: {
    pattern: /^[\u4e00-\u9fa5]{2,10}$/,
    message: '请输入2-10位中文姓名'
  }
};

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SEARCH_HISTORY: 'search_history',
  FAVORITE_JOBS: 'favorite_jobs'
};

// 路由配置
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  JOBS: '/jobs',
  JOB_DETAIL: '/jobs/:id',
  JOB_EDIT: '/jobs/edit/:id?',
  USER_DASHBOARD: '/dashboard',
  USER_PROFILE: '/profile',
  MY_JOBS: '/my-jobs',
  MY_APPLICATIONS: '/my-applications',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms'
};

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  SERVER_ERROR: '服务器内部错误，请稍后重试',
  UNAUTHORIZED: '未授权访问，请重新登录',
  FORBIDDEN: '权限不足，无法访问该资源',
  NOT_FOUND: '请求的资源不存在',
  TIMEOUT: '请求超时，请稍后重试',
  VALIDATION_ERROR: '输入数据验证失败',
  UNKNOWN_ERROR: '未知错误，请联系管理员'
};

// 成功消息
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  REGISTER_SUCCESS: '注册成功',
  UPDATE_SUCCESS: '更新成功',
  DELETE_SUCCESS: '删除成功',
  CREATE_SUCCESS: '创建成功',
  APPLY_SUCCESS: '申请成功',
  UPLOAD_SUCCESS: '上传成功'
};

// 默认配置
export const DEFAULT_CONFIG = {
  // 默认头像
  DEFAULT_AVATAR: '/images/default-avatar.png',
  
  // 默认职位图片
  DEFAULT_JOB_IMAGE: '/images/default-job-image.png',
  
  // 默认公司Logo
  DEFAULT_COMPANY_LOGO: '/images/default-company-logo.png',
  
  // 默认每页显示数量
  DEFAULT_PAGE_SIZE: 10,
  
  // 默认搜索半径（公里）
  DEFAULT_SEARCH_RADIUS: 50,
  
  // 默认主题
  DEFAULT_THEME: 'light',
  
  // 默认语言
  DEFAULT_LANGUAGE: 'zh-CN'
};

// 导出所有常量
export default {
  APP_INFO,
  API_CONFIG,
  USER_ROLES,
  JOB_TYPES,
  JOB_TYPE_LABELS,
  EXPERIENCE_LEVELS,
  EXPERIENCE_LABELS,
  EDUCATION_LEVELS,
  EDUCATION_LABELS,
  SALARY_RANGES,
  JOB_STATUS,
  JOB_STATUS_LABELS,
  APPLICATION_STATUS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  INDUSTRIES,
  INDUSTRY_LABELS,
  BENEFITS,
  BENEFIT_LABELS,
  CITY_LEVELS,
  CITY_LEVEL_LABELS,
  HOT_CITIES,
  UPLOAD_CONFIG,
  PAGINATION_CONFIG,
  VALIDATION_RULES,
  STORAGE_KEYS,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEFAULT_CONFIG
};