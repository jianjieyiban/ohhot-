import axios from 'axios';

// 创建axios实例
const api = axios.create({
  // 使用环境变量配置的 API 地址，生产环境自动使用 HTTPS
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  },
  // 确保正确处理UTF-8编码的响应
  responseType: 'json',
  transformResponse: [function (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }]
});

// 请求拦截器：添加token、开发环境日志
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一处理响应格式、错误状态码
api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      return 'success' in response.data 
        ? response.data 
        : { success: true, data: response.data };
    }
    return { success: true, data: response.data };
  },
  (error) => {
    console.error('API请求错误:', error);
    if (!error.response) {
      return Promise.reject({
        success: false,
        message: '网络连接失败，请检查网络设置',
        error: error.message
      });
    }
    const { status, data } = error.response;
    // 401 未授权/登录过期处理
    if (status === 401) {
      const isLoginPage = window.location.pathname === '/admin-login' || window.location.pathname === '/login';
      if (!isLoginPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject({
        success: false,
        message: data?.message || '认证失败，请检查登录信息',
        code: status
      });
    }
    // 其他错误状态码统一处理
    const errorMap = {
      403: '权限不足，无法访问此资源',
      404: '请求的资源不存在',
      500: '服务器内部错误，请稍后重试'
    };
    const defaultMsg = data?.message || data?.error || '请求失败';
    return Promise.reject({
      success: false,
      message: errorMap[status] || defaultMsg,
      code: status,
      data: data
    });
  }
);

// API工具函数（GET/POST/PUT/DELETE/上传/下载）
export const apiUtils = {
  get: (url, params = {}) => api.get(url, { params }),
  post: (url, data = {}) => api.post(url, data),
  put: (url, data = {}) => api.put(url, data),
  delete: (url, params = {}) => api.delete(url, { params }),
  upload: (url, formData, onProgress = null) => api.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total))
  }),
  download: (url, params = {}) => api.get(url, { params, responseType: 'blob' })
};

// 认证模块API
export const authAPI = {
  register: (userData) => apiUtils.post('/auth/register', userData),
  login: (credentials) => apiUtils.post('/auth/login', credentials),
  getCurrentUser: () => apiUtils.get('/auth/profile'),
  updateProfile: (userData) => apiUtils.put('/auth/profile', userData),
  changePassword: (passwordData) => apiUtils.put('/auth/password', passwordData),
  forgotPassword: (email) => apiUtils.post('/auth/forgot-password', { email }),
  resetPassword: (token, passwordData) => apiUtils.post('/auth/reset-password', { token, ...passwordData }),
  logout: () => apiUtils.post('/auth/logout')
};

// 职位模块API
export const jobAPI = {
  getJobs: (params = {}) => apiUtils.get('/jobs', params),
  getJobDetail: (id) => apiUtils.get(`/jobs/${id}`),
  createJob: (jobData) => {
    console.log('创建职位参数:', jobData);
    return apiUtils.post('/jobs', jobData);
  },
  updateJob: (id, jobData) => apiUtils.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => apiUtils.delete(`/jobs/${id}`),
  getMyJobs: () => apiUtils.get('/jobs/my'),
  applyJob: (id, applicationData) => apiUtils.post(`/jobs/${id}/apply`, applicationData),
  favoriteJob: (id) => apiUtils.post(`/jobs/${id}/favorite`),
  unfavoriteJob: (id) => apiUtils.delete(`/jobs/${id}/favorite`),
  getFavoriteJobs: () => apiUtils.get('/jobs/favorites')
};

// 城市模块API
export const cityAPI = {
  getCities: (params = {}) => apiUtils.get('/cities', params),
  getCityDetail: (id) => apiUtils.get(`/cities/${id}`),
  searchCities: (keyword) => apiUtils.get('/cities/search', { keyword }),
  getHotCities: () => apiUtils.get('/cities/hot'),
  getCityStats: (id) => apiUtils.get(`/cities/${id}/stats`)
};

// 申请模块API
export const applicationAPI = {
  getMyApplications: () => apiUtils.get('/applications/my'),
  getApplicationDetail: (id) => apiUtils.get(`/applications/${id}`),
  withdrawApplication: (id) => apiUtils.delete(`/applications/${id}`),
  getJobApplications: (jobId) => apiUtils.get(`/applications/job/${jobId}`),
  processApplication: (id, status) => apiUtils.put(`/applications/${id}`, { status })
};

// 上传模块API
export const uploadAPI = {
  uploadAvatar: (formData, onProgress) => apiUtils.upload('/upload/avatar', formData, onProgress),
  uploadResume: (formData, onProgress) => apiUtils.upload('/upload/resume', formData, onProgress),
  uploadJobImage: (formData, onProgress) => apiUtils.upload('/upload/job-image', formData, onProgress)
};

// 管理员模块API
export const adminAPI = {
  getStats: () => apiUtils.get('/admin/stats'),
  getUsers: (params = {}) => apiUtils.get('/admin/users', params),
  getUserDetail: (id) => apiUtils.get(`/admin/users/${id}`),
  deleteUser: (id) => apiUtils.delete(`/admin/users/${id}`),
  getJobs: (params = {}) => apiUtils.get('/admin/jobs', params),
  getJobDetail: (id) => apiUtils.get(`/admin/jobs/${id}`),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  getLoginLogs: (params = {}) => apiUtils.get('/admin/login-logs', params),
  getSystemLogs: (params = {}) => apiUtils.get('/admin/system-logs', params)
};

export default api;