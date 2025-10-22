import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';

// 用户注册
const register = async (req, res) => {
  try {
    const { username, email, password, user_type, phone, companyName, cityId } = req.body;

    // 检查用户是否已存在
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (existingUser.success && existingUser.data.length > 0) {
      return res.status(400).json({
        success: false,
        message: '邮箱或手机号已被注册',
      });
    }

    // 设置用户类型（使用数字值：1=求职者，3=招聘者）
    let userTypeValue = 1; // 默认求职者
    if (user_type === "employer") {
      userTypeValue = 3; // 招聘者
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 插入新用户
    const insertResult = await query(
      'INSERT INTO users (`phone`, `email`, `password`, `user_type`, `nickname`, `city_id`, `created_at`, `updated_at`) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [phone, email, hashedPassword, userTypeValue, username || phone, cityId || 0]
    );

    if (!insertResult.success) {
      return res.status(500).json({
        success: false,
        message: '注册失败，请稍后重试',
      });
    }

    const userId = insertResult.data.insertId;

    // 生成JWT token
    const token = generateToken(userId);

    // 获取用户信息（不包含密码）
    const userResult = await query(
      'SELECT id, phone, email, user_type, nickname, avatar, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: userResult.data[0],
        token,
      },
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { email, phone, password, loginIdentifier, securityKey } = req.body;

    console.log('登录请求:', { email, phone, password: '***', loginIdentifier, securityKey: '***' });

    // 确定登录标识（email或phone）
    let identifier = email || phone || loginIdentifier;
    let queryField;
    
    // 根据输入格式确定查询字段
    if (identifier) {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      queryField = isEmail ? 'email' : 'phone';
    } else {
      return res.status(400).json({
        success: false,
        message: '请输入邮箱地址或手机号',
      });
    }

    console.log('查询条件:', { queryField, identifier });

    // 查询用户 - 根据登录类型区分
    let userResult;
    if (securityKey && securityKey.trim() !== '') {
      // 管理员登录，只查找user_type=2或3的记录
      console.log('使用管理员登录逻辑');
      userResult = await query(
        `SELECT * FROM users WHERE ${queryField} = ? AND status = ? AND (user_type = ? OR user_type = ?)`,
        [identifier, 1, 2, 3]
      );
    } else {
      // 普通用户登录，查找user_type=1或3的记录（允许企业用户不使用安全密钥）
      console.log('使用普通用户登录逻辑');
      userResult = await query(
        `SELECT * FROM users WHERE ${queryField} = ? AND status = ? AND (user_type = ? OR user_type = ?)`,
        [identifier, 1, 1, 3]
      );
    }

    console.log('查询结果:', { success: userResult.success, dataLength: userResult.data?.length || 0 });

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误',
      });
    }

    const user = userResult.data[0];
    console.log('用户信息:', { id: user.id, email: user.email, user_type: user.user_type });

    // 如果是管理员账号，验证安全密钥（企业用户不强制要求安全密钥）
    if (user.user_type === 2) {
      if (!securityKey || securityKey.trim() === '') {
        return res.status(401).json({
          success: false,
          message: '管理员登录需要提供安全密钥',
        });
      }
      
      if (securityKey !== 'Admin@2024#Key') {
        return res.status(401).json({
          success: false,
          message: '管理员安全密钥验证失败',
        });
      }
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('密码验证结果:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误',
      });
    }

    // 生成JWT token
    const token = generateToken(user.id);

    // 更新最后登录时间
    await query('UPDATE users SET login_time = NOW() WHERE id = ?', [user.id]);

    // 记录登录日志
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || '';
    const userAgent = req.headers['user-agent'] || '';
    const deviceInfo = `${req.headers['sec-ch-ua-platform'] || 'Unknown'} - ${req.headers['sec-ch-ua'] || 'Unknown Browser'}`;
    
    // 获取用户类型描述
    let userTypeDesc = 'job_seeker';
    if (user.user_type === 2) {
      userTypeDesc = 'admin';
    } else if (user.user_type === 3) {
      userTypeDesc = 'employer';
    }
    
    await query(
      'INSERT INTO login_logs (user_id, username, user_type, ip_address, device_info, user_agent, login_time, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [user.id, user.nickname || user.phone || user.email, userTypeDesc, ipAddress, deviceInfo, userAgent]
    );

    // 返回用户信息（不包含密码），确保所有字段都有值
    const userWithoutPassword = {
      id: user.id,
      phone: user.phone || '',
      email: user.email || '',
      user_type: user.user_type || 1,
      nickname: user.nickname || '',
      avatar: user.avatar || '',
      real_name: user.real_name || '',
      gender: user.gender || 0,
      city_id: user.city_id || 0,
      company_name: user.company_name || '',
      company_address: user.company_address || '',
      id_card: user.id_card || '',
      status: user.status || 1,
      balance: user.balance || 0.00,
      login_ip: user.login_ip || '',
      login_time: user.login_time || null,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    const userResult = await query(
      'SELECT id, phone, email, user_type, nickname, avatar, created_at, login_time FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    res.json({
      success: true,
      data: userResult.data[0],
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 更新用户资料
const updateProfile = async (req, res) => {
  try {
    const { username, phone, real_name, gender, company_name, company_address } = req.body;
    const userId = req.user.id;

    // 检查昵称是否已被使用（排除当前用户）
    if (username) {
      const existingUser = await query(
        'SELECT id FROM users WHERE nickname = ? AND id != ?',
        [username, userId]
      );

      if (existingUser.success && existingUser.data.length > 0) {
        return res.status(400).json({
          success: false,
          message: '昵称已被使用',
        });
      }
    }

    // 构建更新字段
    const updateFields = [];
    const updateValues = [];

    if (username) {
      updateFields.push('nickname = ?');
      updateValues.push(username);
    }

    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }

    if (real_name !== undefined) {
      updateFields.push('real_name = ?');
      updateValues.push(real_name);
    }

    if (gender !== undefined) {
      updateFields.push('gender = ?');
      updateValues.push(gender);
    }

    if (company_name !== undefined) {
      updateFields.push('company_name = ?');
      updateValues.push(company_name);
    }

    if (company_address !== undefined) {
      updateFields.push('company_address = ?');
      updateValues.push(company_address);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的字段',
      });
    }

    updateValues.push(userId);

    const updateResult = await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: '更新失败',
      });
    }

    // 获取更新后的用户信息
    const userResult = await query(
      'SELECT id, phone, email, user_type, nickname, avatar, real_name, gender, company_name, company_address, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: '资料更新成功',
      data: userResult.data[0],
    });
  } catch (error) {
    console.error('更新资料错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 用户登出
const logout = async (req, res) => {
  try {
    // 在实际应用中，可能需要将token加入黑名单
    // 这里简单返回成功消息
    res.json({
      success: true,
      message: '登出成功',
    });
  } catch (error) {
    console.error('登出错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 忘记密码
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 检查用户是否存在
    const userResult = await query(
      'SELECT id FROM users WHERE email = ? AND status = ?',
      [email, 1]
    );

    if (!userResult.success || userResult.data.length === 0) {
      // 出于安全考虑，不透露用户是否存在
      return res.json({
        success: true,
        message: '如果邮箱存在，重置链接已发送',
      });
    }

    // 生成重置token（简化处理）
    const resetToken = jwt.sign(
      { userId: userResult.data[0].id, type: 'reset' },
      process.env.JWT_SECRET + '_reset',
      { expiresIn: '1h' }
    );

    // 存储重置token到数据库
    await query(
      'UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?',
      [resetToken, userResult.data[0].id]
    );

    // 在实际应用中，这里应该发送邮件
    console.log('重置密码链接:', `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);

    res.json({
      success: true,
      message: '如果邮箱存在，重置链接已发送',
    });
  } catch (error) {
    console.error('忘记密码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 重置密码
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET + '_reset');
    
    if (decoded.type !== 'reset') {
      return res.status(400).json({
        success: false,
        message: '无效的重置令牌',
      });
    }

    // 检查token是否有效
    const userResult = await query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(400).json({
        success: false,
        message: '重置令牌无效或已过期',
      });
    }

    const userId = userResult.data[0].id;

    // 加密新密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 更新密码并清除重置token
    const updateResult = await query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, userId]
    );

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: '密码重置失败',
      });
    }

    res.json({
      success: true,
      message: '密码重置成功',
    });
  } catch (error) {
    console.error('重置密码错误:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: '重置令牌已过期',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: '无效的重置令牌',
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

export {
  register,
  login,
  getCurrentUser,
  updateProfile,
  logout,
  forgotPassword,
  resetPassword,
};