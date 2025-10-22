// 首先导入所有依赖
import express from 'express';
const router = express.Router();

// 导入中间件
import { validateRegistration as registerValidation, validateLogin as loginValidation } from '../middleware/validation.js';
import { authenticateToken as authMiddleware } from '../middleware/auth.js';

// 延迟导入控制器以避免循环依赖
let authController;
try {
    authController = await import('../controllers/authController.js');
} catch (error) {
    console.error('Error importing authController:', error);
    // 如果导入失败，使用延迟加载
    authController = {};
}

// 用户注册
router.post('/register', registerValidation, async (req, res) => {
    if (!authController.register) {
        authController = await import('../controllers/authController.js');
    }
    authController.register(req, res);
});

// 用户登录
router.post('/login', loginValidation, async (req, res) => {
    if (!authController.login) {
        authController = await import('../controllers/authController.js');
    }
    authController.login(req, res);
});

// 获取用户信息
router.get('/profile', authMiddleware, async (req, res) => {
    if (!authController.getCurrentUser) {
        authController = await import('../controllers/authController.js');
    }
    authController.getCurrentUser(req, res);
});

// 更新用户信息
router.put('/profile', authMiddleware, async (req, res) => {
    if (!authController.updateProfile) {
        authController = await import('../controllers/authController.js');
    }
    authController.updateProfile(req, res);
});

// 绑定城市
router.post('/bind-city', authMiddleware, async (req, res) => {
    if (!authController.bindCity) {
        authController = await import('../controllers/authController.js');
    }
    authController.bindCity(req, res);
});

// 获取余额
router.get('/balance', authMiddleware, async (req, res) => {
    if (!authController.getBalance) {
        authController = await import('../controllers/authController.js');
    }
    authController.getBalance(req, res);
});

// 用户登出
router.post('/logout', authMiddleware, async (req, res) => {
    if (!authController.logout) {
        authController = await import('../controllers/authController.js');
    }
    authController.logout(req, res);
});

export default router;