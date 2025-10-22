import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { query } from '../config/database.js';

const router = express.Router();

// 获取用户简历列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { user } = req;
    const result = await query('SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC', [user.id]);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: '获取简历列表失败'
      });
    }
  } catch (error) {
    console.error('获取简历列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取简历详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    const result = await query('SELECT * FROM resumes WHERE id = ? AND user_id = ?', [id, user.id]);
    
    if (result.success && result.data.length > 0) {
      res.json({
        success: true,
        data: result.data[0]
      });
    } else {
      res.status(404).json({
        success: false,
        message: '简历不存在'
      });
    }
  } catch (error) {
    console.error('获取简历详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 创建简历
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { user } = req;
    const { title, content, file_path } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '标题和内容不能为空'
      });
    }
    
    const result = await query(
      'INSERT INTO resumes (user_id, title, content, file_path, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [user.id, title, content, file_path]
    );
    
    if (result.success) {
      const resumeId = result.data.insertId;
      const resumeResult = await query('SELECT * FROM resumes WHERE id = ?', [resumeId]);
      
      res.status(201).json({
        success: true,
        message: '简历创建成功',
        data: resumeResult.data[0]
      });
    } else {
      res.status(500).json({
        success: false,
        message: '创建简历失败'
      });
    }
  } catch (error) {
    console.error('创建简历错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新简历
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { title, content, file_path } = req.body;
    
    // 检查简历是否存在且属于当前用户
    const checkResult = await query('SELECT id FROM resumes WHERE id = ? AND user_id = ?', [id, user.id]);
    if (!checkResult.success || checkResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: '简历不存在或无权修改'
      });
    }
    
    const updateFields = [];
    const updateValues = [];
    
    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    
    if (content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(content);
    }
    
    if (file_path !== undefined) {
      updateFields.push('file_path = ?');
      updateValues.push(file_path);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的字段'
      });
    }
    
    updateValues.push(id, user.id);
    
    const result = await query(
      `UPDATE resumes SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ? AND user_id = ?`,
      updateValues
    );
    
    if (result.success) {
      const resumeResult = await query('SELECT * FROM resumes WHERE id = ?', [id]);
      
      res.json({
        success: true,
        message: '简历更新成功',
        data: resumeResult.data[0]
      });
    } else {
      res.status(500).json({
        success: false,
        message: '更新简历失败'
      });
    }
  } catch (error) {
    console.error('更新简历错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 删除简历
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // 检查简历是否存在且属于当前用户
    const checkResult = await query('SELECT id FROM resumes WHERE id = ? AND user_id = ?', [id, user.id]);
    if (!checkResult.success || checkResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: '简历不存在或无权删除'
      });
    }
    
    const result = await query('DELETE FROM resumes WHERE id = ? AND user_id = ?', [id, user.id]);
    
    if (result.success) {
      res.json({
        success: true,
        message: '简历删除成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '删除简历失败'
      });
    }
  } catch (error) {
    console.error('删除简历错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;