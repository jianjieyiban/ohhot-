import { query } from '../config/database.js';

// 获取管理后台统计数据
const getStats = async (req, res) => {
    try {
        // 获取总用户数
        const usersResult = await query('SELECT COUNT(*) as count FROM users WHERE status = ?', [1]);
        const totalUsers = usersResult.success ? usersResult.data[0].count : 0;

        // 获取总职位数
        const jobsResult = await query('SELECT COUNT(*) as count FROM jobs WHERE status = ?', ['active']);
        const totalJobs = jobsResult.success ? jobsResult.data[0].count : 0;

        // 获取待审核职位数
        const pendingJobsResult = await query('SELECT COUNT(*) as count FROM jobs WHERE status = ?', ['pending']);
        const pendingJobs = pendingJobsResult.success ? pendingJobsResult.data[0].count : 0;

        // 获取总收入（模拟数据）
        const totalRevenue = 0; // 实际项目中需要根据订单数据计算

        res.json({
            success: true,
            data: {
                totalUsers,
                totalJobs,
                totalRevenue,
                pendingJobs
            }
        });
    } catch (error) {
        console.error('获取统计数据错误:', error);
        res.status(500).json({
            success: false,
            message: '获取统计数据失败'
        });
    }
};

// 获取用户列表
const getUsers = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, search = '' } = req.query;
        const offset = (page - 1) * pageSize;

        let whereClause = 'WHERE status = ?';
        let queryParams = [1];

        if (search) {
            whereClause += ' AND (email LIKE ? OR nickname LIKE ? OR phone LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // 获取用户列表
        const usersResult = await query(
            `SELECT id, email, phone, nickname, user_type, status, created_at, login_time 
             FROM users ${whereClause} 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [...queryParams, parseInt(pageSize), parseInt(offset)]
        );

        // 获取总数
        const countResult = await query(
            `SELECT COUNT(*) as total FROM users ${whereClause}`,
            queryParams
        );

        const users = usersResult.success ? usersResult.data : [];
        const total = countResult.success ? countResult.data[0].total : 0;

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    current: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total
                }
            }
        });
    } catch (error) {
        console.error('获取用户列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取用户列表失败'
        });
    }
};

// 获取职位列表
const getJobs = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, search = '', status = '' } = req.query;
        const offset = (page - 1) * pageSize;

        let whereClause = 'WHERE 1=1';
        let queryParams = [];

        if (search) {
            whereClause += ' AND (title LIKE ?)';
            queryParams.push(`%${search}%`);
        }

        if (status) {
            whereClause += ' AND status = ?';
            queryParams.push(status);
        }

        // 获取职位列表
        const jobsResult = await query(
            `SELECT j.*, u.nickname as employer_name 
             FROM jobs j 
             LEFT JOIN users u ON j.user_id = u.id 
             ${whereClause} 
             ORDER BY j.created_at DESC 
             LIMIT ? OFFSET ?`,
            [...queryParams, parseInt(pageSize), parseInt(offset)]
        );

        // 获取总数
        const countResult = await query(
            `SELECT COUNT(*) as total FROM jobs j ${whereClause}`,
            queryParams
        );

        const jobs = jobsResult.success ? jobsResult.data : [];
        const total = countResult.success ? countResult.data[0].total : 0;

        res.json({
            success: true,
            data: {
                jobs,
                pagination: {
                    current: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total
                }
            }
        });
    } catch (error) {
        console.error('获取职位列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取职位列表失败'
        });
    }
};

// 删除用户
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // 检查用户是否存在
        const userResult = await query('SELECT id FROM users WHERE id = ?', [id]);
        if (!userResult.success || userResult.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        // 软删除用户（更新状态为0）
        const deleteResult = await query('UPDATE users SET status = ? WHERE id = ?', [0, id]);

        if (deleteResult.success) {
            res.json({
                success: true,
                message: '用户删除成功'
            });
        } else {
            res.status(500).json({
                success: false,
                message: '删除用户失败'
            });
        }
    } catch (error) {
        console.error('删除用户错误:', error);
        res.status(500).json({
            success: false,
            message: '删除用户失败'
        });
    }
};

// 删除职位
const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        // 检查职位是否存在
        const jobResult = await query('SELECT id FROM jobs WHERE id = ?', [id]);
        if (!jobResult.success || jobResult.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: '职位不存在'
            });
        }

        // 删除职位
        const deleteResult = await query('DELETE FROM jobs WHERE id = ?', [id]);

        if (deleteResult.success) {
            res.json({
                success: true,
                message: '职位删除成功'
            });
        } else {
            res.status(500).json({
                success: false,
                message: '删除职位失败'
            });
        }
    } catch (error) {
        console.error('删除职位错误:', error);
        res.status(500).json({
            success: false,
            message: '删除职位失败'
        });
    }
};

// 审核职位
const approveJob = async (req, res) => {
    try {
        const { id } = req.params;

        // 检查职位是否存在
        const jobResult = await query('SELECT id, status FROM jobs WHERE id = ?', [id]);
        if (!jobResult.success || jobResult.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: '职位不存在'
            });
        }

        // 更新职位状态为active
        const updateResult = await query('UPDATE jobs SET status = ? WHERE id = ?', ['active', id]);

        if (updateResult.success) {
            res.json({
                success: true,
                message: '职位审核通过'
            });
        } else {
            res.status(500).json({
                success: false,
                message: '审核职位失败'
            });
        }
    } catch (error) {
        console.error('审核职位错误:', error);
        res.status(500).json({
            success: false,
            message: '审核职位失败'
        });
    }
};

// 拒绝职位
const rejectJob = async (req, res) => {
    try {
        const { id } = req.params;

        // 检查职位是否存在
        const jobResult = await query('SELECT id, status FROM jobs WHERE id = ?', [id]);
        if (!jobResult.success || jobResult.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: '职位不存在'
            });
        }

        // 更新职位状态为rejected
        const updateResult = await query('UPDATE jobs SET status = ? WHERE id = ?', ['rejected', id]);

        if (updateResult.success) {
            res.json({
                success: true,
                message: '职位已拒绝'
            });
        } else {
            res.status(500).json({
                success: false,
                message: '拒绝职位失败'
            });
        }
    } catch (error) {
        console.error('拒绝职位错误:', error);
        res.status(500).json({
            success: false,
            message: '拒绝职位失败'
        });
    }
};

// 获取登录日志
const getLoginLogs = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const limit = parseInt(pageSize);
        const offset = (parseInt(page) - 1) * limit;

        // 获取登录日志
        const logsResult = await query(
            `SELECT l.*, u.email as user_email, u.nickname, u.user_type 
             FROM login_logs l 
             LEFT JOIN users u ON l.user_id = u.id 
             ORDER BY l.login_time DESC 
             LIMIT ${limit} OFFSET ${offset}`
        );

        // 获取总数
        const countResult = await query('SELECT COUNT(*) as total FROM login_logs');

        const logs = logsResult.success ? logsResult.data : [];
        const total = countResult.success ? countResult.data[0].total : 0;

        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    current: parseInt(page),
                    pageSize: limit,
                    total
                }
            }
        });
    } catch (error) {
        console.error('获取登录日志错误:', error);
        res.status(500).json({
            success: false,
            message: '获取登录日志失败'
        });
    }
};

// 获取系统日志（简化版本）
const getLogs = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const offset = (page - 1) * pageSize;

        // 模拟日志数据
        const logs = [
            {
                id: 1,
                action: '用户登录',
                description: '管理员 admin@example.com 登录系统',
                timestamp: new Date().toISOString(),
                ip: '127.0.0.1'
            },
            {
                id: 2,
                action: '职位审核',
                description: '职位 "前端开发工程师" 审核通过',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                ip: '127.0.0.1'
            }
        ];

        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    current: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total: logs.length
                }
            }
        });
    } catch (error) {
        console.error('获取系统日志错误:', error);
        res.status(500).json({
            success: false,
            message: '获取系统日志失败'
        });
    }
};

export {
    getStats,
    getUsers,
    getJobs,
    deleteUser,
    deleteJob,
    approveJob,
    rejectJob,
    getLoginLogs,
    getLogs
};