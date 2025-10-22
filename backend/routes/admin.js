import express from 'express';
const router = express.Router();

// 导入中间件
import { authenticateToken as authMiddleware } from '../middleware/auth.js';

// 延迟导入控制器以避免循环依赖
let adminController;
try {
    adminController = await import('../controllers/adminController.js');
} catch (error) {
    console.error('Error importing adminController:', error);
    adminController = {};
}

// 管理员权限验证中间件
const adminAuth = (req, res, next) => {
    if (req.user.user_type !== 2 && req.user.user_type !== 3) {
        return res.status(403).json({
            success: false,
            message: '权限不足，需要管理员权限'
        });
    }
    next();
};

// 获取管理后台统计数据
router.get('/stats', authMiddleware, adminAuth, async (req, res) => {
    if (!adminController.getStats) {
        adminController = await import('../controllers/adminController.js');
    }
    adminController.getStats(req, res);
});

// 获取用户列表
router.get('/users', authMiddleware, adminAuth, async (req, res) => {
    if (!adminController.getUsers) {
        adminController = await import('../controllers/adminController.js');
    }
    adminController.getUsers(req, res);
});

// 获取职位列表
router.get('/jobs', authMiddleware, adminAuth, async (req, res) => {
    if (!adminController.getJobs) {
        adminController = await import('../controllers/adminController.js');
    }
    adminController.getJobs(req, res);
});

// 删除用户
router.delete('/users/:id', authMiddleware, adminAuth, async (req, res) => {
    if (!adminController.deleteUser) {
        adminController = await import('../controllers/adminController.js');
    }
    adminController.deleteUser(req, res);
});

// 删除职位
router.delete('/jobs/:id', authMiddleware, adminAuth, async (req, res) => {
    if (!adminController.deleteJob) {
        adminController = await import('../controllers/adminController.js');
    }
    adminController.deleteJob(req, res);
});

// 审核职位
router.put('/jobs/:id/approve', authMiddleware, adminAuth, async (req, res) => {
    if (!adminController.approveJob) {
        adminController = await import('../controllers/adminController.js');
    }
    adminController.approveJob(req, res);
});

// 拒绝职位
router.put('/jobs/:id/reject', authMiddleware, adminAuth, async (req, res) => {
    if (!adminController.rejectJob) {
        adminController = await import('../controllers/adminController.js');
    }
    adminController.rejectJob(req, res);
});

// 获取登录日志
router.get('/login-logs', authMiddleware, adminAuth, async (req, res) => {
    if (!adminController.getLoginLogs) {
        adminController = await import('../controllers/adminController.js');
    }
    adminController.getLoginLogs(req, res);
});

// 获取系统日志
router.get('/logs', authMiddleware, adminAuth, async (req, res) => {
    if (!adminController.getLogs) {
        adminController = await import('../controllers/adminController.js');
    }
    adminController.getLogs(req, res);
});

export default router;