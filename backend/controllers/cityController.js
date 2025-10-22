import City from '../models/City.js';
// 必须用这两行导入Op，不能用 import { Op } from 'sequelize'
import pkg from 'sequelize';
const { Op } = pkg;

// 以下是原文件中后续的所有代码（获取城市列表、详情等逻辑，保持不变）
// 获取城市列表
const getCities = async (req, res) => {
  try {
    const { is_hot, limit = 50 } = req.query;
    const where = { is_active: true };
    if (is_hot !== undefined) {
      where.is_hot = is_hot === 'true';
    }
    console.log('查询条件:', JSON.stringify(where, null, 2));
    const cities = await City.findAll({
      where,
      order: [['city', 'ASC']],
      limit: parseInt(limit),
    });
    console.log('查询结果数量:', cities.length);
    const formattedCities = cities.map(city => ({
      id: city.id,
      city: city.city,
      province: city.province,
      district: city.district,
      is_hot: city.is_hot,
      is_active: city.is_active,
      created_at: city.created_at,
      updated_at: city.updated_at,
    }));
    res.json({ success: true, data: formattedCities });
  } catch (error) {
    console.error('获取城市列表错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
};
// 获取城市详情
const getCity = async (req, res) => {
  try {
    const { id } = req.params;

    const city = await City.findOne({
      where: { 
        id: parseInt(id),
        is_active: true 
      }
    });

    if (!city) {
      return res.status(404).json({
        success: false,
        message: '城市不存在',
      });
    }

    // 获取该城市的职位统计
    const jobStats = await City.sequelize.query(
      `SELECT 
        COUNT(*) as total_jobs,
        AVG((salary_min + salary_max) / 2) as avg_salary,
        COUNT(DISTINCT user_id) as total_companies
      FROM jobs 
      WHERE city_id = ? AND status = 1`,
      {
        replacements: [id],
        type: City.sequelize.QueryTypes.SELECT
      }
    );

    const stats = jobStats.length > 0 
      ? jobStats[0] 
      : { total_jobs: 0, avg_salary: null, total_companies: 0 };

    const cityWithStats = {
      id: city.id,
      city: city.city,
      province: city.province,
      district: city.district,
      is_hot: city.is_hot,
      is_active: city.is_active,
      created_at: city.created_at,
      updated_at: city.updated_at,
      tier_name: city.level ? getTierName(city.level) : '未知',
      population_text: city.population ? getPopulationText(city.population) : '未知',
      stats: {
        total_jobs: stats.total_jobs || 0,
        avg_salary: stats.avg_salary ? Math.round(stats.avg_salary) : null,
        total_companies: stats.total_companies || 0,
      },
    };

    res.json({
      success: true,
      data: cityWithStats,
    });
  } catch (error) {
    console.error('获取城市详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 搜索城市
const searchCities = async (req, res) => {
  try {
    // 支持路径参数和查询参数两种方式
    const keyword = req.params.keyword || req.query.keyword;

    if (!keyword || keyword.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词至少需要2个字符',
      });
    }

    // 解码URL编码的关键词
    const decodedKeyword = decodeURIComponent(keyword);

    const cities = await City.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { city: { [Op.like]: `%${decodedKeyword}%` } },
          { province: { [Op.like]: `%${decodedKeyword}%` } }
        ]
      },
      order: [
        [City.sequelize.literal(`CASE 
          WHEN city = '${decodedKeyword}' THEN 1
          WHEN city LIKE '${decodedKeyword}%' THEN 2
          WHEN province LIKE '%${decodedKeyword}%' THEN 3
          ELSE 4
        END`), 'ASC']
      ],
      limit: 20
    });

    const formattedCities = cities.map(city => ({
      id: city.id,
      city: city.city,
      province: city.province,
      district: city.district,
      is_hot: city.is_hot,
      is_active: city.is_active,
      created_at: city.created_at,
      updated_at: city.updated_at,
      tier_name: city.level ? getTierName(city.level) : '未知',
      population_text: city.population ? getPopulationText(city.population) : '未知',
    }));

    res.json({
      success: true,
      data: formattedCities,
    });
  } catch (error) {
    console.error('搜索城市错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 获取热门城市
const getHotCities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const cities = await City.findAll({
      where: {
        is_active: true,
        is_hot: true
      },
      order: [
        // 按城市等级排序，一线城市优先
        [City.sequelize.literal(`CASE 
          WHEN level = 'tier1' THEN 1
          WHEN level = 'tier2' THEN 2
          WHEN level = 'tier3' THEN 3
          ELSE 4
        END`), 'ASC'],
        // 同等级城市按城市名拼音排序
        ['city', 'ASC']
      ],
      limit: parseInt(limit)
    });

    const formattedCities = cities.map(city => ({
      id: city.id,
      city: city.city,
      province: city.province,
      district: city.district,
      is_hot: city.is_hot,
      is_active: city.is_active,
      created_at: city.created_at,
      updated_at: city.updated_at,
      tier_name: city.level ? getTierName(city.level) : '未知',
      population_text: city.population ? getPopulationText(city.population) : '未知',
    }));

    res.json({
      success: true,
      data: formattedCities,
    });
  } catch (error) {
    console.error('获取热门城市错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 获取城市统计
const getCityStats = async (req, res) => {
  try {
    // 由于cities表缺少统计字段，返回基础统计信息
    const totalStats = await City.sequelize.query(`
      SELECT 
        COUNT(*) as total_cities,
        SUM(is_hot) as hot_cities
      FROM cities 
      WHERE is_active = 1
    `, {
      type: City.sequelize.QueryTypes.SELECT
    });

    const stats = totalStats.length > 0 
      ? totalStats[0] 
      : { total_cities: 0, hot_cities: 0 };

    res.json({
      success: true,
      data: {
        by_level: [],
        total: stats,
      },
    });
  } catch (error) {
    console.error('获取城市统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 辅助函数
function getTierName(level) {
  const tierNames = {
    tier1: '一线城市',
    tier2: '新一线城市',
    tier3: '二线城市',
    tier4: '三线城市',
    tier5: '四线及以下',
  };
  return tierNames[level] || '未知';
}

function getPopulationText(population) {
  if (!population) return '未知';
  
  if (population >= 10000000) {
    return `${(population / 10000000).toFixed(1)}千万`;
  } else if (population >= 10000) {
    return `${(population / 10000).toFixed(1)}万`;
  } else {
    return population.toLocaleString();
  }
}

export {
  getCities,
  getCity,
  searchCities,
  getHotCities,
  getCityStats,
};