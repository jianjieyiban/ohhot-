// models/City.js
// 从index.js导入sequelize实例和Sequelize构造函数（关键）
import { sequelize, Sequelize } from './index.js';
const { DataTypes, Op } = Sequelize;  // 从构造函数解构，确保DataTypes有效

const City = sequelize.define('City', {
  id: {
    type: DataTypes.INTEGER,  // 此时DataTypes必然存在
    primaryKey: true,
    autoIncrement: true,
  },
  province: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  level: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  population: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_hot: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  },
}, {
  tableName: 'cities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
});

// 实例方法（保持不变）
City.prototype.incrementJobCount = function() {
  return this.increment('job_count');
};
City.prototype.decrementJobCount = function() {
  return this.decrement('job_count');
};
City.prototype.incrementCompanyCount = function() {
  return this.increment('company_count');
};
City.prototype.decrementCompanyCount = function() {
  return this.decrement('company_count');
};
City.prototype.getTierName = function() {
  const tierNames = {
    tier1: '一线城市',
    tier2: '新一线城市',
    tier3: '二线城市',
    tier4: '三线城市',
    tier5: '四线及以下',
  };
  return tierNames[this.level] || '未知';
};
City.prototype.getPopulationText = function() {
  if (!this.population) return '未知';
  if (this.population >= 10000000) {
    return `${(this.population / 10000000).toFixed(1)}千万`;
  } else if (this.population >= 10000) {
    return `${(this.population / 10000).toFixed(1)}万`;
  } else {
    return this.population.toLocaleString();
  }
};

// 静态方法（保持不变）
City.getHotCities = function(limit = 10) {
  return this.findAll({
    where: { is_hot: true, is_active: true },
    order: [['city', 'ASC']],
    limit,
  });
};
City.getCitiesByLevel = function(level) {
  return this.findAll({
    where: { level, is_active: true },
    order: [['city', 'ASC']],
  });
};
City.searchCities = function(keyword) {
  return this.findAll({
    where: {
      is_active: true,
      [Op.or]: [
        { city: { [Op.like]: `%${keyword}%` } },
        { province: { [Op.like]: `%${keyword}%` } },
      ],
    },
    order: [['city', 'ASC']],
    limit: 20,
  });
};
City.getCitiesWithStats = function() {
  return this.findAll({
    where: { is_active: true },
    attributes: [
      'id',
      'city',
      'province',
      'district',
      'is_hot',
      'is_active',
    ],
    order: [['city', 'ASC']],
  });
};
City.updateCityStats = async function(cityId) {
  const city = await this.findByPk(cityId);
  if (!city) return;
  const jobStats = await sequelize.query(
    `SELECT 
      COUNT(*) as job_count,
      AVG((salary_min + salary_max) / 2) as avg_salary,
      COUNT(DISTINCT user_id) as company_count
    FROM jobs 
    WHERE city_id = ? AND status = 1`,
    {
      replacements: [cityId],
      type: sequelize.QueryTypes.SELECT,
    }
  );
  if (jobStats.length > 0) {
    const stats = jobStats[0];
    await city.update({
      job_count: stats.job_count || 0,
      company_count: stats.company_count || 0,
      avg_salary: stats.avg_salary || null,
    });
  }
};

export default City;