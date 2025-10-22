import { validationResult } from 'express-validator';

/**
 * 全局错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', err);

  // 处理验证错误
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: '参数验证失败',
      details: errors.array(),
    });
  }

  // 处理JWT认证错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: '无效的认证令牌',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: '认证令牌已过期',
    });
  }

  // 处理数据库错误
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: '数据验证失败',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: '数据已存在',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: '关联数据不存在',
    });
  }

  // 处理文件上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: '文件大小超过限制',
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: '文件数量超过限制',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: '不支持的文件类型',
    });
  }

  // 处理自定义错误
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // 默认错误处理
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : err.message || '服务器内部错误';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details,
    }),
  });
};

/**
 * 创建自定义错误
 */
export const createError = (message, statusCode = 500, details = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
};

/**
 * 异步错误包装器
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};