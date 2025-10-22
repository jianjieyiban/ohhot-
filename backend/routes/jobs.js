import express from 'express';
const router = express.Router();

// 导入中间件
import { validateJobCreation, validatePagination, handleValidationErrors } from '../middleware/validation.js';
import { authenticateToken as authMiddleware } from '../middleware/auth.js';
import { query } from '../config/database.js';

// 延迟导入控制器以避免循环依赖
let jobController;
try {
    jobController = await import('../controllers/jobController.js');
} catch (error) {
    console.error('Error importing jobController:', error);
    // 如果导入失败，使用延迟加载
    jobController = {};
}

// 获取兼职列表（公开接口）
router.get('/', validatePagination, handleValidationErrors, async (req, res) => {
    if (!jobController.getJobs) {
        jobController = await import('../controllers/jobController.js');
    }
    jobController.getJobs(req, res);
});

// 获取兼职详情（公开接口）
router.get('/:id', async (req, res) => {
    if (!jobController.getJob) {
        jobController = await import('../controllers/jobController.js');
    }
    jobController.getJob(req, res);
});

// 发布兼职（需要认证）
router.post('/', authMiddleware, validateJobCreation, async (req, res) => {
    console.log('POST /api/jobs - 请求已到达路由');
    console.log('请求体:', req.body);
    console.log('用户信息:', req.user);
    if (!jobController.createJob) {
        jobController = await import('../controllers/jobController.js');
    }
    try {
        await jobController.createJob(req, res);
    } catch (error) {
        console.error('路由层错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误',
            error: error.message
        });
    }
});

// 更新兼职信息（需要认证）
router.put('/:id', authMiddleware, async (req, res) => {
    if (!jobController.updateJob) {
        jobController = await import('../controllers/jobController.js');
    }
    jobController.updateJob(req, res);
});

// 删除兼职信息（需要认证）
router.delete('/:id', authMiddleware, async (req, res) => {
    if (!jobController.deleteJob) {
        jobController = await import('../controllers/jobController.js');
    }
    jobController.deleteJob(req, res);
});

// 申请职位功能已移至 applications.js 路由文件
// 请使用 POST /api/applications/:jobId 来申请职位

// 获取用户发布的兼职（需要认证）
router.get('/user/my-jobs', authMiddleware, validatePagination, handleValidationErrors, async (req, res) => {
    if (!jobController.getMyJobs) {
        jobController = await import('../controllers/jobController.js');
    }
    jobController.getMyJobs(req, res);
});

// 收藏职位（需要认证）
router.post('/:id/favorite', authMiddleware, async (req, res) => {
    const { id: jobId } = req.params;
    const { user } = req;
    
    try {
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
        console.error('收藏职位错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 取消收藏职位（需要认证）
router.delete('/:id/favorite', authMiddleware, async (req, res) => {
    const { id: jobId } = req.params;
    const { user } = req;
    
    try {
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

// 获取收藏的职位列表（需要认证）
router.get('/favorites', authMiddleware, async (req, res) => {
    const { user } = req;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    try {
        const result = await query(`
            SELECT j.*, c.city as city_name, c.province as city_province,
                   (SELECT COUNT(*) FROM job_favorites WHERE job_id = j.id) as favorite_count
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

export default router;