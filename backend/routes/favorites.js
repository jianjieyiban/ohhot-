import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { query } from '../config/database.js';

const router = express.Router();

// 获取用户收藏的职位列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { user } = req;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await query(`
      SELECT j.*, c.city as city_name, c.province as city_province
      FROM job_favorites f
      JOIN jobs j ON f.job_id = j.id
      LEFT JOIN cities c ON j.city_id = c.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `, [user.id, parseInt(limit), offset]);
    
    if (result.success) {
      // 获取总数
      const countResult = await query('SELECT COUNT(*) as total FROM job_favorites WHERE user_id = ?', [user.id]);
      
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
        message: '获取收藏列表失败'
      });
    }
  } catch (error) {
    console.error('获取收藏列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 添加职位到收藏
router.post('/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { user } = req;
    
    // 检查职位是否存在
    const jobResult = await query('SELECT id FROM jobs WHERE id = ?', [jobId]);
    if (!jobResult.success || jobResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: '职位不存在'
      });
    }
    
    // 检查是否已经收藏
    const existingResult = await query('SELECT id FROM job_favorites WHERE user_id = ? AND job_id = ?', [user.id, jobId]);
    if (existingResult.success && existingResult.data.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该职位已收藏'
      });
    }
    
    const result = await query(
      'INSERT INTO job_favorites (user_id, job_id, created_at) VALUES (?, ?, NOW())',
      [user.id, jobId]
    );
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: '收藏成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '收藏失败'
      });
    }
  } catch (error) {
    console.error('添加收藏错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 取消收藏职位
router.delete('/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { user } = req;
    
    const result = await query('DELETE FROM job_favorites WHERE user_id = ? AND job_id = ?', [user.id, jobId]);
    
    if (result.success) {
      res.json({
        success: true,
        message: '取消收藏成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '取消收藏失败'
      });
    }
  } catch (error) {
    console.error('取消收藏错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 检查职位是否已收藏
router.get('/check/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { user } = req;
    
    const result = await query('SELECT id FROM job_favorites WHERE user_id = ? AND job_id = ?', [user.id, jobId]);
    
    res.json({
      success: true,
      data: {
        is_favorited: result.success && result.data.length > 0
      }
    });
  } catch (error) {
    console.error('检查收藏状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;