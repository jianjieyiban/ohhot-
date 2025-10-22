import { body, validationResult } from 'express-validator';

// 通用验证错误处理
const handleValidationErrors = (req, res, next) => {
  console.log('handleValidationErrors - 开始执行');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('验证错误详情:', errors.array());
    return res.status(400).json({
      success: false,
      message: '参数验证失败',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  
  console.log('handleValidationErrors - 验证通过');
  next();
};

// 用户注册验证规则
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密码必须包含大小写字母和数字'),
  
  body('user_type')
    .isIn(['job_seeker', 'employer'])
    .withMessage('用户类型必须是job_seeker或employer'),
  
  body('phone')
    .optional()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('请输入有效的手机号码'),
  
  handleValidationErrors,
];

// 用户登录验证规则
const validateLogin = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  
  body('phone')
    .optional()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('请输入有效的手机号码'),
  
  body('password')
    .notEmpty()
    .withMessage('密码不能为空'),
  
  // 自定义验证：确保至少提供email或phone之一，并处理loginIdentifier字段
  body().custom((value, { req }) => {
    const { email, phone, loginIdentifier } = req.body;
    
    // 如果提供了loginIdentifier，检查其格式
    if (loginIdentifier) {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginIdentifier);
      const isPhone = /^1[3-9]\d{9}$/.test(loginIdentifier);
      
      if (!isEmail && !isPhone) {
        throw new Error('请输入有效的邮箱地址或手机号');
      }
      
      // 将loginIdentifier转换为对应的email或phone字段
      if (isEmail) {
        req.body.email = loginIdentifier;
      } else if (isPhone) {
        req.body.phone = loginIdentifier;
      }
    }
    
    // 确保至少提供email或phone之一
    if (!req.body.email && !req.body.phone) {
      throw new Error('请输入邮箱地址或手机号');
    }
    
    return true;
  }),
  
  handleValidationErrors,
];

// 职位创建验证规则
const validateJobCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('职位标题长度必须在5-100个字符之间'),
  
  body('content')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('职位内容长度必须在10-2000个字符之间'),
  
  body('city_id')
    .isInt({ min: 1 })
    .withMessage('请选择有效的城市'),
  
  body('category_id')
    .isInt({ min: 1 })
    .withMessage('请选择有效的职位分类'),
  
  body('job_type')
    .isIn([1, 2, 3, 4])
    .withMessage('请选择有效的职位类型'),
  
  body('salary_type')
    .optional()
    .isIn([1, 2, 3])
    .withMessage('请选择有效的薪资类型'),
  
  body('salary_min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('最低薪资必须是非负整数'),
  
  body('salary_max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('最高薪资必须是非负整数'),
  
  body('requirements')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('职位要求不能超过500个字符'),
  
  body('district')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('区域名称不能超过50个字符'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('详细地址不能超过200个字符'),
  
  body('work_time')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('工作时间不能超过50个字符'),
  
  body('work_days')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('工作天数不能超过50个字符'),
  
  body('contact_person')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('联系人姓名长度必须在2-20个字符之间'),
  
  body('contact_phone')
    .trim()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('请输入有效的手机号码'),
  
  body('contact_wechat')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('微信号不能超过30个字符'),
  
  handleValidationErrors,
];

// 职位更新验证规则
const validateJobUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('职位标题长度必须在5-100个字符之间'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('职位内容长度必须在10-2000个字符之间'),
  
  body('status')
    .optional()
    .isIn([1, 2, 3]) // 1=active, 2=inactive, 3=filled
    .withMessage('状态必须是1(active)、2(inactive)或3(filled)'),
  
  body('requirements')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('职位要求不能超过500个字符'),
  
  body('district')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('区域名称不能超过50个字符'),
  
  handleValidationErrors,
];

// 用户资料更新验证规则
const validateProfileUpdate = [
  body('phone')
    .optional()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('请输入有效的手机号码'),
  
  body('real_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('真实姓名长度必须在2-20个字符之间'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('性别必须是male、female或other'),
  
  body('company_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('公司名称不能超过100个字符'),
  
  body('company_address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('公司地址不能超过200个字符'),
  
  handleValidationErrors,
];

// 分页参数验证
const validatePagination = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须是1-100之间的整数'),
  
  handleValidationErrors,
];

// 搜索参数验证
const validateSearch = [
  body('q')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('搜索关键词不能超过100个字符'),
  
  body('city_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('城市ID必须是正整数'),
  
  body('job_type')
    .optional()
    .isIn([1, 2, 3, 4])
    .withMessage('请选择有效的职位类型'),
  
  body('salary_range')
    .optional()
    .isIn(['0-5000', '5000-10000', '10000-20000', '20000+'])
    .withMessage('请选择有效的薪资范围'),
  
  handleValidationErrors,
];

export {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateJobCreation,
  validateJobUpdate,
  validateProfileUpdate,
  validatePagination,
  validateSearch,
};