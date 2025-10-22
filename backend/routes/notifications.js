import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { query } from '../config/database.js';

const router = express.Router();

// 获取通知列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, unread } = req.query;
    const offset = (page - 1) * limit;
    
    let sqlQuery = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [req.user.id];
    
    if (type) {
      sqlQuery += ' AND type = ?';
      params.push(type);
    }
    
    if (unread === 'true') {
      sqlQuery += ' AND is_read = 0';
    }
    
    sqlQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const notificationsResult = await query(sqlQuery, params);
    const notifications = notificationsResult.data;
    
    // 获取总数
    let countSqlQuery = 'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?';
    const countParams = [req.user.id];
    
    if (type) {
      countSqlQuery += ' AND type = ?';
      countParams.push(type);
    }
    
    if (unread === 'true') {
      countSqlQuery += ' AND is_read = 0';
    }
    
    const countResult = await query(countSqlQuery, countParams);
    const total = countResult.data[0].total;
    
    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取通知列表错误:', error);
    res.status(500).json({ error: '获取通知列表失败' });
  }
});

// 标记通知为已读
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (!result.success || result.data.affectedRows === 0) {
      return res.status(404).json({ error: '通知不存在或无权操作' });
    }
    
    res.json({ message: '通知已标记为已读' });
  } catch (error) {
    console.error('标记通知已读错误:', error);
    res.status(500).json({ error: '标记通知已读失败' });
  }
});

// 标记所有通知为已读
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    
    res.json({ message: '所有通知已标记为已读' });
  } catch (error) {
    console.error('标记所有通知已读错误:', error);
    res.status(500).json({ error: '标记所有通知已读失败' });
  }
});

// 删除通知
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (!result.success || result.data.affectedRows === 0) {
      return res.status(404).json({ error: '通知不存在或无权操作' });
    }
    
    res.json({ message: '通知删除成功' });
  } catch (error) {
    console.error('删除通知错误:', error);
    res.status(500).json({ error: '删除通知失败' });
  }
});

// 获取未读通知数量
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    
    if (!result.success) {
      return res.status(500).json({ error: '获取未读通知数量失败' });
    }
    
    res.json({ unreadCount: result.data[0].count });
  } catch (error) {
    console.error('获取未读通知数量错误:', error);
    res.status(500).json({ error: '获取未读通知数量失败' });
  }
});

// 创建通知（内部使用，不对外暴露）
router.post('/internal', async (req, res) => {
  try {
    const { user_id, title, content, type = 'info', related_id = null } = req.body;
    
    if (!user_id || !title || !content) {
      return res.status(400).json({ error: '用户ID、标题和内容不能为空' });
    }
    
    const result = await query(
      'INSERT INTO notifications (user_id, title, content, type, related_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [user_id, title, content, type, related_id]
    );
    
    if (!result.success) {
      return res.status(500).json({ error: '创建通知失败' });
    }
    
    res.status(201).json({
      id: result.data.insertId,
      message: '通知创建成功'
    });
  } catch (error) {
    console.error('创建通知错误:', error);
    res.status(500).json({ error: '创建通知失败' });
  }
});

export default router;