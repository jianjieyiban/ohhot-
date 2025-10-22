import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { adminAuth } from '../middleware/auth.js';
import { query } from '../config/database.js';

const router = express.Router();

// 获取用户的申请记录
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { user } = req;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await query(`
      SELECT a.*, j.title as job_title, c.city as city_name, c.province as city_province
      FROM job_applications a
      JOIN jobs j ON a.job_id = j.id
      LEFT JOIN cities c ON j.city_id = c.id
      WHERE a.user_id = ?
      ORDER BY a.applied_at DESC
      LIMIT ? OFFSET ?
    `, [user.id, parseInt(limit), parseInt(offset)]);
    
    if (result.success) {
      // 获取总数
      const countResult = await query('SELECT COUNT(*) as total FROM job_applications WHERE user_id = ?', [user.id]);
      
      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.success ? countResult.data[0].total : 0
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: '获取申请记录失败'
      });
    }
  } catch (error) {
    console.error('获取申请记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 申请职位
router.post('/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { user } = req;
    const { resume_id, message } = req.body;
    
    // 检查职位是否存在
    const jobResult = await query('SELECT id, status FROM jobs WHERE id = ?', [jobId]);
    if (!jobResult.success || jobResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: '职位不存在'
      });
    }
    
    // 检查职位状态
    const job = jobResult.data[0];
    if (job.status !== 1) {
      return res.status(400).json({
        success: false,
        message: '该职位暂不可申请'
      });
    }
    
    // 检查是否已经申请过
    const existingResult = await query('SELECT id FROM job_applications WHERE user_id = ? AND job_id = ?', [user.id, jobId]);
    if (existingResult.success && existingResult.data.length > 0) {
      return res.status(400).json({
        success: false,
        message: '您已经申请过该职位'
      });
    }
    
    // 检查简历是否存在（如果提供了简历ID）
    if (resume_id) {
      const resumeResult = await query('SELECT id FROM resumes WHERE id = ? AND user_id = ?', [resume_id, user.id]);
      if (!resumeResult.success || resumeResult.data.length === 0) {
        return res.status(400).json({
          success: false,
          message: '简历不存在'
        });
      }
    }
    
    const result = await query(
      'INSERT INTO job_applications (user_id, job_id, resume_id, message, applied_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [user.id, jobId, resume_id, message]
    );
    
    if (result.success) {
      // 更新职位的申请计数
      await query('UPDATE jobs SET contact_count = contact_count + 1 WHERE id = ?', [jobId]);
      
      // 获取职位信息用于通知
      const jobInfoResult = await query(
        'SELECT j.title, u.nickname as employer_name FROM jobs j LEFT JOIN users u ON j.user_id = u.id WHERE j.id = ?',
        [jobId]
      );
      
      // 获取管理员用户
      const adminResult = await query('SELECT id FROM users WHERE user_type = 2 AND status = 1');
      
      // 创建通知给所有管理员
      if (jobInfoResult.success && jobInfoResult.data.length > 0 && adminResult.success && adminResult.data.length > 0) {
        const jobInfo = jobInfoResult.data[0];
        const admins = adminResult.data;
        
        // 为每个管理员创建通知
        for (const admin of admins) {
          await query(
            'INSERT INTO notifications (user_id, title, content, type, related_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            [
              admin.id,
              '新职位申请',
              `用户 ${user.nickname || user.email} 申请了职位: ${jobInfo.title}`,
              'application',
              result.data.insertId
            ]
          );
        }
      }
      
      res.status(201).json({
        success: true,
        message: '申请成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '申请失败'
      });
    }
  } catch (error) {
    console.error('申请职位错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取申请详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    const result = await query(`
      SELECT a.*, j.title as job_title, j.content as job_description,
             c.city as city_name, c.province as city_province,
             r.title as resume_title, r.content as resume_content
      FROM job_applications a
      JOIN jobs j ON a.job_id = j.id
      LEFT JOIN cities c ON j.city_id = c.id
      LEFT JOIN resumes r ON a.resume_id = r.id
      WHERE a.id = ? AND a.user_id = ?
    `, [id, user.id]);
    
    if (result.success && result.data.length > 0) {
      res.json({
        success: true,
        data: result.data[0]
      });
    } else {
      res.status(404).json({
        success: false,
        message: '申请记录不存在'
      });
    }
  } catch (error) {
    console.error('获取申请详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 取消申请
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // 检查申请是否存在且属于当前用户
    const checkResult = await query('SELECT id, job_id FROM job_applications WHERE id = ? AND user_id = ?', [id, user.id]);
    if (!checkResult.success || checkResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: '申请记录不存在或无权取消'
      });
    }
    
    const application = checkResult.data[0];
    
    const result = await query('DELETE FROM job_applications WHERE id = ? AND user_id = ?', [id, user.id]);
    
    if (result.success) {
      // 更新职位的申请计数
      await query('UPDATE jobs SET contact_count = contact_count - 1 WHERE id = ?', [application.job_id]);
      
      res.json({
        success: true,
        message: '取消申请成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '取消申请失败'
      });
    }
  } catch (error) {
    console.error('取消申请错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取申请详情（管理员专用）
router.get('/details/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取申请详情
    const applicationResult = await query(`
      SELECT ja.*, j.title as job_title, j.salary_min, j.salary_max, j.salary_type, 
             u.nickname, u.email, u.phone, u.real_name, u.avatar, u.gender,
             c.name as city_name, u.created_at as user_created_at
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      JOIN users u ON ja.user_id = u.id
      LEFT JOIN cities c ON u.city_id = c.id
      WHERE ja.id = ?
    `, [id]);
    
    if (!applicationResult.success || applicationResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: '申请记录不存在'
      });
    }
    
    // 获取简历信息
    const application = applicationResult.data[0];
    let resumeInfo = null;
    
    if (application.resume_id) {
      const resumeResult = await query(`
        SELECT * FROM resumes WHERE id = ?
      `, [application.resume_id]);
      
      if (resumeResult.success && resumeResult.data.length > 0) {
        resumeInfo = resumeResult.data[0];
      }
    }
    
    // 获取职位信息
    const jobResult = await query(`
      SELECT j.*, u.nickname as employer_name, u.phone as employer_phone
      FROM jobs j
      LEFT JOIN users u ON j.user_id = u.id
      WHERE j.id = ?
    `, [application.job_id]);
    
    let jobInfo = null;
    if (jobResult.success && jobResult.data.length > 0) {
      jobInfo = jobResult.data[0];
    }
    
    res.json({
      success: true,
      data: {
        application,
        resume: resumeInfo,
        job: jobInfo
      }
    });
  } catch (error) {
    console.error('获取申请详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取申请详情失败'
    });
  }
});

export default router;