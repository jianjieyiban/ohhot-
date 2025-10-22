import pkg from 'sequelize';
const { DataTypes } = pkg;
import { sequelize } from './index.js';

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  salary_type: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1,
  },
  salary_min: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  salary_max: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  work_time: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  work_days: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  job_type: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  contact_person: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  contact_wechat: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  is_top: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  top_expire_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_urgent: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1,
  },
  view_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  contact_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
    defaultValue: 0.000000,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
    defaultValue: 0.000000,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'jobs',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      fields: ['title'],
    },
    {
      fields: ['city_id'],
    },
    {
      fields: ['job_type'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

// 实例方法
Job.prototype.getPublicInfo = function() {
  return {
    id: this.id,
    title: this.title,
    category_id: this.category_id,
    city_id: this.city_id,
    district: this.district,
    address: this.address,
    salary_type: this.salary_type,
    salary_min: this.salary_min,
    salary_max: this.salary_max,
    work_time: this.work_time,
    work_days: this.work_days,
    job_type: this.job_type,
    content: this.content,
    requirements: this.requirements,
    contact_person: this.contact_person,
    contact_phone: this.contact_phone,
    contact_wechat: this.contact_wechat,
    is_top: this.is_top,
    is_urgent: this.is_urgent,
    is_verified: this.is_verified,
    status: this.status,
    view_count: this.view_count,
    contact_count: this.contact_count,
    latitude: this.latitude,
    longitude: this.longitude,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

Job.prototype.incrementViewCount = async function() {
  this.view_count += 1;
  await this.save();
};

Job.prototype.incrementContactCount = async function() {
  this.contact_count += 1;
  await this.save();
};

Job.prototype.isActive = function() {
  return this.status === 1;
};

Job.prototype.isExpired = function() {
  return this.status === 0;
};

// 静态方法
Job.findActiveJobs = async function(options = {}) {
  const where = {
    status: 1,
    ...options.where,
  };
  
  return await Job.findAll({
    where,
    include: options.include,
    order: options.order || [['created_at', 'DESC']],
    limit: options.limit,
    offset: options.offset,
  });
};

Job.findByCity = async function(cityId, options = {}) {
  return await Job.findAll({
    where: {
      city_id: cityId,
      ...options.where,
    },
    include: options.include,
    order: options.order || [['created_at', 'DESC']],
    limit: options.limit,
    offset: options.offset,
  });
};

Job.findByJobType = async function(jobType, options = {}) {
  return await Job.findAll({
    where: {
      job_type: jobType,
      ...options.where,
    },
    include: options.include,
    order: options.order || [['created_at', 'DESC']],
    limit: options.limit,
    offset: options.offset,
  });
};

Job.searchJobs = async function(searchTerm, options = {}) {
  const where = {
    [sequelize.Op.or]: [
      { title: { [sequelize.Op.like]: `%${searchTerm}%` } },
      { content: { [sequelize.Op.like]: `%${searchTerm}%` } },
      { requirements: { [sequelize.Op.like]: `%${searchTerm}%` } },
    ],
    ...options.where,
  };
  
  return await Job.findAll({
    where,
    include: options.include,
    order: options.order || [['created_at', 'DESC']],
    limit: options.limit,
    offset: options.offset,
  });
};

Job.getJobsByUserId = function(userId) {
  return this.findAll({ where: { user_id: userId } });
};

Job.getPopularJobs = function(limit = 10) {
  return this.findAll({
    where: { status: 1 },
    order: [['view_count', 'DESC']],
    limit,
  });
};

export default Job;