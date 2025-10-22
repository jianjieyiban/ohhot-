import React, { createContext, useContext, useState } from 'react';
import { jobAPI } from '../utils/api';
import { message } from 'antd';

const JobContext = createContext();

export const useJob = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJob必须在JobProvider内使用');
  }
  return context;
};

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchJobs = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // 处理两种参数格式：单一对象参数或分开的参数
      let filters = {};
      let page = 1;
      let pageSize = 10;
      
      // 如果第一个参数是对象，且包含page或pageSize属性，则认为是单一对象参数
      if (typeof params === 'object' && (params.page !== undefined || params.pageSize !== undefined)) {
        filters = { ...params };
        page = params.page || 1;
        pageSize = params.pageSize || 10;
        
        // 从filters中移除分页参数
        delete filters.page;
        delete filters.pageSize;
      } else {
        // 否则认为是传统的三个参数格式
        filters = params || {};
        page = arguments[1] || 1;
        pageSize = arguments[2] || 10;
      }
      
      const response = await jobAPI.getJobs({
        ...filters,
        page,
        pageSize
      });
      
      if (response.success) {
        // 确保每个职位都有isFavorited字段
        const jobsWithFavoriteStatus = response.data.jobs.map(job => ({
          ...job,
          isFavorited: Boolean(job.isFavorited)
        }));
        
        setJobs(jobsWithFavoriteStatus);
        setPagination({
          current: page,
          pageSize,
          total: response.data.total
        });
        return { success: true, data: { ...response.data, jobs: jobsWithFavoriteStatus } };
      } else {
        setError(response.message || '获取职位列表失败');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '获取职位列表失败，请检查网络连接';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetail = async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobAPI.getJobDetail(jobId);
      
      if (response.success) {
        // 确保isFavorited字段存在
        const jobData = {
          ...response.data,
          isFavorited: Boolean(response.data.isFavorited)
        };
        setCurrentJob(jobData);
        return { success: true, data: jobData };
      } else {
        setError(response.message || '获取职位详情失败');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '获取职位详情失败，请检查网络连接';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 创建职位
  const createJob = async (jobData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobAPI.createJob(jobData);
      
      if (response.success) {
        // 创建成功后刷新职位列表
        await fetchJobs();
        return { success: true, data: response.data };
      } else {
        setError(response.message || '创建职位失败');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '创建职位失败，请检查网络连接';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (jobId, jobData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobAPI.updateJob(jobId, jobData);
      
      if (response.success) {
        // 更新成功后，更新当前职位和职位列表
        setCurrentJob(response.data);
        await fetchJobs();
        return { success: true, data: response.data };
      } else {
        setError(response.message || '更新职位失败');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '更新职位失败，请检查网络连接';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobAPI.deleteJob(jobId);
      
      if (response.success) {
        // 删除成功后，重新获取职位列表
        await fetchJobs();
        return { success: true };
      } else {
        setError(response.message || '删除职位失败');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '删除职位失败，请检查网络连接';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobAPI.getMyJobs();
      
      if (response.success) {
        setJobs(response.data.jobs);
        setPagination({
          current: 1,
          pageSize: 10,
          total: response.data.total
        });
        return { success: true, data: response.data };
      } else {
        setError(response.message || '获取我的职位失败');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '获取我的职位失败，请检查网络连接';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 获取所有职位，然后在前端筛选热门职位
      const response = await jobAPI.getJobs({ page: 1, pageSize: 20 });
      
      if (response.success) {
        // 筛选热门职位：首先按发布时间排序，然后按浏览量和申请量排序
        const featuredJobs = response.data.jobs
          .sort((a, b) => {
            // 首先按发布时间排序（最新的在前）
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            if (dateB !== dateA) {
              return dateB - dateA;
            }
            
            // 如果发布时间相同，则按浏览量和申请量排序
            const aScore = (a.view_count || 0) + (a.application_count || 0);
            const bScore = (b.view_count || 0) + (b.application_count || 0);
            return bScore - aScore;
          })
          .slice(0, 6); // 取前6个作为热门职位
        
        return { success: true, data: featuredJobs };
      } else {
        setError(response.message || '获取热门职位失败');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '获取热门职位失败，请检查网络连接';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const applyJob = async (jobId, applicationData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobAPI.applyJob(jobId, applicationData);
      
      if (response.success) {
        // 申请成功后，更新职位列表中的申请状态
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === jobId 
              ? { ...job, hasApplied: true, application_count: (job.application_count || 0) + 1 }
              : job
          )
        );
        
        // 如果当前有选中的职位，也更新其状态
        if (currentJob && currentJob.id === jobId) {
          setCurrentJob(prevJob => 
            prevJob 
              ? { ...prevJob, hasApplied: true, application_count: (prevJob.application_count || 0) + 1 }
              : prevJob
          );
        }
        
        return { success: true, data: response.data };
      } else {
        setError(response.message || '申请职位失败');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || '申请职位失败，请检查网络连接';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearCurrentJob = () => setCurrentJob(null);

  // 为保持兼容性，提供getJobs作为fetchJobs的别名
  const getJobs = fetchJobs;

  const value = {
    jobs,
    currentJob,
    loading,
    error,
    pagination,
    fetchJobs,
    getJobs, // 添加getJobs别名
    fetchJobDetail,
    createJob,
    updateJob,
    deleteJob,
    fetchMyJobs,
    fetchFeaturedJobs,
    applyJob,
    clearError,
    clearCurrentJob
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};

export default JobContext;