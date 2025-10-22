import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    // console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // console.log('API Response:', response.status, response.data);
    return response.data;
  },
  (error) => {
    console.error('Response Error:', error.response?.status, error.response?.data);
    
    // 处理不同的HTTP状态码
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          // 禁止访问
          console.error('Access denied:', data?.message);
          break;
        case 404:
          // 资源不存在
          console.error('Resource not found:', data?.message);
          break;
        case 500:
          // 服务器错误
          console.error('Server error:', data?.message);
          break;
        default:
          console.error('API Error:', data?.message);
      }
    } else if (error.request) {
      // 网络错误
      console.error('Network error:', error.message);
    } else {
      // 其他错误
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  // 用户登录
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 用户注册
  register: (userData) => api.post('/auth/register', userData),
  
  // 获取当前用户信息
  getCurrentUser: () => api.get('/auth/me'),
  
  // 刷新token
  refreshToken: () => api.post('/auth/refresh'),
  
  // 用户登出
  logout: () => api.post('/auth/logout'),
  
  // 忘记密码
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // 重置密码
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// 职位相关API
export const jobAPI = {
  // 获取职位列表
  getJobs: (params = {}) => api.get('/jobs', { params }),
  
  // 获取职位详情
  getJob: (id) => api.get(`/jobs/${id}`),
  
  // 创建职位
  createJob: (jobData) => api.post('/jobs', jobData),
  
  // 更新职位
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  
  // 删除职位
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  
  // 申请职位
  applyJob: (id, applicationData) => api.post(`/jobs/${id}/apply`, applicationData),
  
  // 获取我的职位申请
  getMyApplications: () => api.get('/jobs/my-applications'),
  
  // 获取我发布的职位
  getMyJobs: () => api.get('/jobs/my-jobs'),
  
  // 搜索职位
  searchJobs: (query, filters = {}) => api.get('/jobs/search', { 
    params: { q: query, ...filters } 
  }),
};

// 用户相关API
export const userAPI = {
  // 获取用户资料
  getProfile: (id) => api.get(`/users/${id}`),
  
  // 更新用户资料
  updateProfile: (userData) => api.put('/users/profile', userData),
  
  // 上传头像
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // 获取用户收藏的职位
  getFavorites: () => api.get('/users/favorites'),
  
  // 收藏职位
  addFavorite: (jobId) => api.post('/users/favorites', { jobId }),
  
  // 取消收藏职位
  removeFavorite: (jobId) => api.delete(`/users/favorites/${jobId}`),
};

// 文件上传相关API
export const fileAPI = {
  // 上传文件
  uploadFile: (formData) => api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // 上传图片
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // 删除文件
  deleteFile: (fileId) => api.delete(`/upload/${fileId}`),
};

// 系统相关API
export const systemAPI = {
  // 获取系统统计
  getStats: () => api.get('/system/stats'),
  
  // 获取城市列表
  getCities: () => api.get('/system/cities'),
  
  // 获取职位类型
  getJobTypes: () => api.get('/system/job-types'),
  
  // 获取行业分类
  getIndustries: () => api.get('/system/industries'),
  
  // 获取薪资范围
  getSalaryRanges: () => api.get('/system/salary-ranges'),
};

// 申请相关API
export const applicationAPI = {
  // 获取申请详情
  getApplicationDetails: (id) => api.get(`/applications/details/${id}`),
  
  // 获取申请记录
  getApplications: (params = {}) => api.get('/applications', { params }),
  
  // 获取申请记录详情
  getApplication: (id) => api.get(`/applications/${id}`),
  
  // 取消申请
  cancelApplication: (id) => api.delete(`/applications/${id}`),
};

// 工具函数
export const apiUtils = {
  // 生成查询参数
  generateQueryParams: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams.toString();
  },
  
  // 处理文件上传
  createFormData: (files) => {
    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach(file => formData.append('files', file));
    } else {
      formData.append('file', files);
    }
    return formData;
  },
  
  // 取消请求
  createCancelToken: () => axios.CancelToken.source(),
};

export default api;