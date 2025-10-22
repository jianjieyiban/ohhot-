import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { query } from '../config/database.js';

const router = express.Router();

// 获取消息列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;
    
    let sqlQuery = `
      SELECT m.*, 
             sender.nickname as sender_name,
             receiver.nickname as receiver_name,
             j.title as job_title
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users receiver ON m.receiver_id = receiver.id
      LEFT JOIN jobs j ON m.job_id = j.id
      WHERE m.receiver_id = ? OR m.sender_id = ?
    `;
    
    const params = [req.user.id, req.user.id];
    
    if (type) {
      sqlQuery += ' AND m.type = ?';
      params.push(type);
    }
    
    sqlQuery += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const messagesResult = await query(sqlQuery, params);
    const messages = messagesResult.data;
    
    // 获取总数
    let countSqlQuery = 'SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? OR sender_id = ?';
    const countParams = [req.user.id, req.user.id];
    
    if (type) {
      countSqlQuery += ' AND type = ?';
      countParams.push(type);
    }
    
    const countResult = await query(countSqlQuery, countParams);
    const total = countResult.data[0].total;
    
    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取消息列表错误:', error);
    res.status(500).json({ error: '获取消息列表失败' });
  }
});

// 发送消息
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { receiver_id, job_id, content, type = 'message' } = req.body;
    
    if (!receiver_id || !content) {
      return res.status(400).json({ error: '接收者和消息内容不能为空' });
    }
    
    // 检查接收者是否存在
    const userResult = await query('SELECT id FROM users WHERE id = ?', [receiver_id]);
    if (!userResult.success || userResult.data.length === 0) {
      return res.status(404).json({ error: '接收者不存在' });
    }
    
    // 如果关联职位，检查职位是否存在
    if (job_id) {
      const jobResult = await query('SELECT id FROM jobs WHERE id = ?', [job_id]);
      if (!jobResult.success || jobResult.data.length === 0) {
        return res.status(404).json({ error: '职位不存在' });
      }
    }
    
    const result = await query(
      'INSERT INTO messages (sender_id, receiver_id, job_id, content, type, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [req.user.id, receiver_id, job_id, content, type]
    );
    
    if (!result.success) {
      return res.status(500).json({ error: '发送消息失败' });
    }
    
    res.status(201).json({
      id: result.data.insertId,
      message: '消息发送成功'
    });
  } catch (error) {
    console.error('发送消息错误:', error);
    res.status(500).json({ error: '发送消息失败' });
  }
});

// 标记消息为已读
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'UPDATE messages SET is_read = 1 WHERE id = ? AND receiver_id = ?',
      [id, req.user.id]
    );
    
    if (!result.success || result.data.affectedRows === 0) {
      return res.status(404).json({ error: '消息不存在或无权操作' });
    }
    
    res.json({ message: '消息已标记为已读' });
  } catch (error) {
    console.error('标记消息已读错误:', error);
    res.status(500).json({ error: '标记消息已读失败' });
  }
});

// 删除消息
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM messages WHERE id = ? AND (receiver_id = ? OR sender_id = ?)',
      [id, req.user.id, req.user.id]
    );
    
    if (!result.success || result.data.affectedRows === 0) {
      return res.status(404).json({ error: '消息不存在或无权删除' });
    }
    
    res.json({ message: '消息删除成功' });
  } catch (error) {
    console.error('删除消息错误:', error);
    res.status(500).json({ error: '删除消息失败' });
  }
});

// 获取未读消息数量
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
      [req.user.id]
    );
    
    if (!result.success) {
      return res.status(500).json({ error: '获取未读消息数量失败' });
    }
    
    res.json({ unreadCount: result.data[0].count });
  } catch (error) {
    console.error('获取未读消息数量错误:', error);
    res.status(500).json({ error: '获取未读消息数量失败' });
  }
});

export default router;