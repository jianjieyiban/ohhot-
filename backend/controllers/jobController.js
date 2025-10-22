import { query } from '../config/database.js';
import Job from '../models/Job.js';
import City from '../models/City.js';
import { sequelize } from '../models/index.js';

// 获取职位列表
const getJobs = async (req, res) => {
  try {
    const { city_id, page = 1, limit = 10, q, favorites, sort = 'createdAt_desc' } = req.query;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const where = { status: 1 };  // 1表示活跃状态
    
    if (city_id) {
      where.city_id = city_id;
    }
    
    if (q) {
      where[sequelize.Op.or] = [
        { title: { [sequelize.Op.like]: `%${q}%` } },
        { content: { [sequelize.Op.like]: `%${q}%` } },
        { requirements: { [sequelize.Op.like]: `%${q}%` } }
      ];
    }

    // 处理排序参数
    let orderClause;
    switch (sort) {
      case 'createdAt_asc':
        orderClause = [['created_at', 'ASC']];
        break;
      case 'salary_desc':
        orderClause = [
          ['salary_max', 'DESC'],
          ['salary_min', 'DESC'],
          ['created_at', 'DESC']
        ];
        break;
      case 'salary_asc':
        orderClause = [
          ['salary_min', 'ASC'],
          ['salary_max', 'ASC'],
          ['created_at', 'DESC']
        ];
        break;
      case 'createdAt_desc':
      default:
        orderClause = [['created_at', 'DESC']];
        break;
    }

    // 处理收藏筛选
    let includeOptions = [
      {
        model: City,
        as: 'city',
        attributes: ['id', 'city', 'province']
      }
    ];

    // 如果需要筛选收藏的职位
    if (favorites === 'true' && req.user) {
      // 处理收藏职位的排序
      let orderClause;
      switch (sort) {
        case 'createdAt_asc':
          orderClause = 'ORDER BY j.created_at ASC';
          break;
        case 'salary_desc':
          orderClause = 'ORDER BY j.salary_max DESC, j.salary_min DESC, j.created_at DESC';
          break;
        case 'salary_asc':
          orderClause = 'ORDER BY j.salary_min ASC, j.salary_max ASC, j.created_at DESC';
          break;
        case 'createdAt_desc':
        default:
          orderClause = 'ORDER BY j.created_at DESC';
          break;
      }
      
      // 使用原生SQL查询收藏的职位，因为Sequelize的关联查询在这种情况下更复杂
      const result = await query(`
        SELECT j.*, c.city as city_name, c.province as city_province,
               1 as is_favorited,
               (SELECT COUNT(*) FROM job_favorites WHERE job_id = j.id) as favorite_count
        FROM jobs j
        LEFT JOIN cities c ON j.city_id = c.id
        INNER JOIN job_favorites f ON j.id = f.job_id
        WHERE j.status = 1 AND f.user_id = ?
        ${city_id ? 'AND j.city_id = ?' : ''}
        ${q ? `AND (j.title LIKE '%${q}%' OR j.content LIKE '%${q}%' OR j.requirements LIKE '%${q}%')` : ''}
        ${orderClause}
        LIMIT ? OFFSET ?
      `, [req.user.id, ...(city_id ? [city_id] : []), parseInt(limit), offset]);

      // 获取总数
      const countResult = await query(`
        SELECT COUNT(*) as total
        FROM jobs j
        INNER JOIN job_favorites f ON j.id = f.job_id
        WHERE j.status = 1 AND f.user_id = ?
        ${city_id ? 'AND j.city_id = ?' : ''}
        ${q ? `AND (j.title LIKE '%${q}%' OR j.content LIKE '%${q}%' OR j.requirements LIKE '%${q}%')` : ''}
      `, [req.user.id, ...(city_id ? [city_id] : [])]);

      const total = countResult.success ? countResult.data[0].total : 0;
      const totalPages = Math.ceil(total / limit);
      
      // 格式化返回数据，添加isFavorited字段
      const formattedJobs = result.success ? result.data.map(job => ({
        ...job,
        isFavorited: Boolean(job.is_favorited)
      })) : [];

      return res.json({
        success: true,
        data: {
          jobs: formattedJobs,
          pagination: {
            current_page: parseInt(page),
            total_pages: totalPages,
            total_count: total,
            has_next: page < totalPages,
            has_prev: page > 1
          }
        }
      });
    }

    // 使用Sequelize查询
    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      include: includeOptions,
      attributes: [
        'id',
        'title',
        'category_id',
        'city_id',
        'district',
        'address',
        'salary_type',
        'salary_min',
        'salary_max',
        'work_time',
        'work_days',
        'job_type',
        'content',
        'requirements',
        'contact_person',
        'contact_phone',
        'contact_wechat',
        'is_top',
        'is_urgent',
        'is_verified',
        'status',
        'view_count',
        'contact_count',
        'created_at'
      ],
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // 如果用户已登录，查询每个职位的收藏状态
    let jobsWithFavoriteStatus = jobs;
    if (req.user) {
      const jobIds = jobs.map(job => job.id);
      
      if (jobIds.length > 0) {
        const favoriteResults = await query(
          `SELECT job_id FROM job_favorites WHERE user_id = ? AND job_id IN (${jobIds.map(() => '?').join(',')})`,
          [req.user.id, ...jobIds]
        );
        
        const favoriteJobIds = favoriteResults.success ? favoriteResults.data.map(row => row.job_id) : [];
        
        // 为每个职位添加收藏状态
        jobsWithFavoriteStatus = jobs.map(job => ({
          ...job.toJSON(),
          isFavorited: favoriteJobIds.includes(job.id)
        }));
      }
    } else {
      // 用户未登录，所有职位都未收藏
      jobsWithFavoriteStatus = jobs.map(job => ({
        ...job.toJSON(),
        isFavorited: false
      }));
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        jobs: jobsWithFavoriteStatus,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_count: count,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('获取职位列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取职位列表失败',
      error: error.message
    });
  }
};

// 获取职位详情
const getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const jobResult = await query(
      `SELECT 
        j.*,
        c.city as city_name,
        c.province as city_province,
        c.level as city_level,
        u.nickname as employer_name,
        u.avatar as employer_avatar,
        u.email as employer_email,
        u.phone as employer_phone,
        CASE 
          WHEN COUNT(jf.id) > 0 THEN 1 
          ELSE 0 
        END as is_favorited
      FROM jobs j
      LEFT JOIN cities c ON j.city_id = c.id
      LEFT JOIN users u ON j.user_id = u.id
      LEFT JOIN job_favorites jf ON j.id = jf.job_id AND jf.user_id = ?
      WHERE j.id = ? AND j.status = 1
      GROUP BY j.id`,
      [userId, id]
    );

    if (!jobResult.success || jobResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: '职位不存在',
      });
    }

    const job = jobResult.data[0];

    // 增加浏览计数
    await query('UPDATE jobs SET view_count = view_count + 1 WHERE id = ?', [id]);

    // 格式化返回数据
    const formattedJob = {
      ...job,
      isFavorited: Boolean(job.is_favorited), // 添加收藏状态
      salary_range: job.salary_min && job.salary_max 
        ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} 元/月`
        : '面议',
      created_at: new Date(job.created_at).toISOString(),
      updated_at: new Date(job.updated_at).toISOString(),
    };

    res.json({
      success: true,
      data: formattedJob,
    });
  } catch (error) {
    console.error('获取职位详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 创建职位
const createJob = async (req, res) => {
  try {
    console.log('createJob - req.user:', req.user); // 添加调试日志
    
    // 检查用户权限，只有企业账号(user_type=2)和管理员(user_type=3)才能发布职位
    if (!req.user || (req.user.user_type !== 2 && req.user.user_type !== 3)) {
      console.log('权限检查失败 - req.user:', req.user); // 添加调试日志
      return res.status(403).json({
        success: false,
        message: '只有企业账号和管理员才能发布招聘信息',
      });
    }

    const {
      title,
      category_id,
      city_id,
      district,
      address,
      salary_type = 1,
      salary_min,
      salary_max,
      work_time,
      work_days,
      job_type = 1,
      content,
      requirements,
      contact_person,
      contact_phone,
      contact_wechat,
    } = req.body;

    // 使用认证用户的ID
    const userId = req.user.id;

    // 检查城市是否存在
    const cityResult = await query('SELECT id FROM cities WHERE id = ? AND is_active = 1', [city_id]);
    if (!cityResult.success || cityResult.data.length === 0) {
      return res.status(400).json({
        success: false,
        message: '选择的城市不存在',
      });
    }

    // 插入职位
    const insertResult = await query(
      `INSERT INTO jobs (
        title, category_id, city_id, district, address, salary_type,
        salary_min, salary_max, work_time, work_days, job_type, content,
        requirements, contact_person, contact_phone, contact_wechat, user_id, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        title,
        category_id,
        city_id,
        district,
        address,
        salary_type,
        salary_min,
        salary_max,
        work_time,
        work_days,
        job_type,
        content,
        requirements,
        contact_person,
        contact_phone,
        contact_wechat,
        userId,
        1  // 1表示活跃状态
      ]
    );

    if (!insertResult.success) {
      return res.status(500).json({
        success: false,
        message: '创建职位失败',
      });
    }

    const jobId = insertResult.data.insertId;

    // 更新城市职位计数
    await query('UPDATE cities SET job_count = job_count + 1 WHERE id = ?', [city_id]);

    // 获取创建的职位信息
    const jobResult = await query(
      `SELECT j.*, c.city as city_name, c.province as city_province 
       FROM jobs j LEFT JOIN cities c ON j.city_id = c.id 
       WHERE j.id = ?`,
      [jobId]
    );

    res.status(201).json({
      success: true,
      message: '职位创建成功',
      data: jobResult.data[0],
    });
  } catch (error) {
    console.error('创建职位错误:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
};

// 更新职位
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // 检查职位是否存在且属于当前用户
    const jobResult = await query('SELECT * FROM jobs WHERE id = ? AND user_id = ?', [id, userId]);
    if (!jobResult.success || jobResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: '职位不存在或无权修改',
      });
    }

    // 构建更新字段
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      'title', 'category_id', 'city_id', 'district', 'address', 'salary_type',
      'salary_min', 'salary_max', 'work_time', 'work_days', 'job_type', 'content',
      'requirements', 'contact_person', 'contact_phone', 'contact_wechat', 'status'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updateData[field]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的字段',
      });
    }

    updateValues.push(id, userId);

    const updateResult = await query(
      `UPDATE jobs SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ? AND user_id = ?`,
      updateValues
    );

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: '更新职位失败',
      });
    }

    // 获取更新后的职位信息
    const updatedJobResult = await query(
      `SELECT j.*, c.city as city_name, c.province as city_province 
       FROM jobs j LEFT JOIN cities c ON j.city_id = c.id 
       WHERE j.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: '职位更新成功',
      data: updatedJobResult.data[0],
    });
  } catch (error) {
    console.error('更新职位错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 删除职位
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查职位是否存在且属于当前用户
    const jobResult = await query('SELECT city_id FROM jobs WHERE id = ? AND user_id = ?', [id, userId]);
    if (!jobResult.success || jobResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: '职位不存在或无权删除',
      });
    }

    const cityId = jobResult.data[0].city_id;

    // 删除职位
    const deleteResult = await query('DELETE FROM jobs WHERE id = ? AND user_id = ?', [id, userId]);

    if (!deleteResult.success) {
      return res.status(500).json({
        success: false,
        message: '删除职位失败',
      });
    }

    // 更新城市职位计数
    await query('UPDATE cities SET job_count = GREATEST(0, job_count - 1) WHERE id = ?', [cityId]);

    res.json({
      success: true,
      message: '职位删除成功',
    });
  } catch (error) {
    console.error('删除职位错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 获取我的职位
const getMyJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;

    // 获取总数
    const countResult = await query('SELECT COUNT(*) as total FROM jobs WHERE user_id = ?', [userId]);
    const total = countResult.success ? countResult.data[0].total : 0;

    // 获取职位列表
    const jobsResult = await query(
      `SELECT j.*, c.city as city_name, c.province as city_province 
       FROM jobs j LEFT JOIN cities c ON j.city_id = c.id 
       WHERE j.user_id = ? 
       ORDER BY j.created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: {
        jobs: jobsResult.success ? jobsResult.data : [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          total_pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('获取我的职位错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

export {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
};