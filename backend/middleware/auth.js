import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 认证中间件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问令牌不存在',
      });
    }

    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 查询用户信息
    const userResult = await query(
      'SELECT id, phone, email, user_type, nickname, avatar, created_at FROM users WHERE id = ? AND status = ?',
      [decoded.userId, 1]
    );

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用',
      });
    }

    // 将用户信息添加到请求对象
    req.user = userResult.data[0];
    console.log('认证中间件 - 用户信息:', req.user); // 添加调试日志
    next();
  } catch (error) {
    console.error('Token验证失败:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '访问令牌已过期',
      });
    }

    return res.status(403).json({
      success: false,
      message: '无效的访问令牌',
    });
  }
};

// 生成JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// 验证用户类型权限
const requireUserType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '请先登录',
      });
    }

    if (!allowedTypes.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        message: '权限不足',
      });
    }

    next();
  };
};

// 可选认证中间件（不强制要求登录）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userResult = await query(
        'SELECT id, phone, email, user_type, nickname, avatar, created_at FROM users WHERE id = ? AND status = ?',
        [decoded.userId, 1]
      );

      if (userResult.success && userResult.data.length > 0) {
        req.user = userResult.data[0];
      }
    }
  } catch (error) {
    // 忽略认证错误，继续执行
    console.log('可选认证失败:', error.message);
  }

  next();
};

// 刷新token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: '刷新令牌不能为空',
      });
    }

    // 验证refresh token（这里简化处理，实际应该存储和验证refresh token）
    const decoded = jwt.verify(refreshToken, JWT_SECRET + '_refresh');
    
    // 查询用户是否存在
    const userResult = await query(
      'SELECT id FROM users WHERE id = ? AND status = ?',
      [decoded.userId, 1]
    );

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用',
      });
    }

    // 生成新的access token
    const newAccessToken = generateToken(decoded.userId);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: JWT_EXPIRES_IN,
      },
    });
  } catch (error) {
    console.error('刷新token失败:', error);
    res.status(401).json({
      success: false,
      message: '刷新令牌无效',
    });
  }
};

// 管理员权限验证中间件
const adminAuth = async (req, res, next) => {
  try {
    // 首先确保用户已通过基本认证
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 检查用户是否为管理员
    if (req.user.user_type !== 2) {
      return res.status(403).json({
        success: false,
        message: '需要管理员权限',
      });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: '权限验证失败',
    });
  }
};

export {
  authenticateToken,
  generateToken,
  requireUserType,
  optionalAuth,
  refreshToken,
  adminAuth,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};