import User from './User.js';
import Job from './Job.js';
import City from './City.js';
import LoginLog from './LoginLog.js';
import JobFavorite from './JobFavorite.js';
import Company from './Company.js';
import Application from './Application.js';

// 用户和职位的关联（一对多）
User.hasMany(Job, {
  foreignKey: 'user_id',
  as: 'jobs',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Job.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'employer',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// 城市和职位的关联（一对多）
City.hasMany(Job, {
  foreignKey: 'city_id',
  as: 'jobs',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Job.belongsTo(City, {
  foreignKey: 'city_id',
  as: 'city',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// 用户和登录日志的关联（一对多）
User.hasMany(LoginLog, {
  foreignKey: 'user_id',
  as: 'loginLogs',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

LoginLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// 用户和职位收藏的关联（多对多）
User.belongsToMany(Job, {
  through: JobFavorite,
  foreignKey: 'user_id',
  otherKey: 'job_id',
  as: 'favoriteJobs',
});

Job.belongsToMany(User, {
  through: JobFavorite,
  foreignKey: 'job_id',
  otherKey: 'user_id',
  as: 'favoritedBy',
});

// 职位和收藏记录的关联（一对多）
Job.hasMany(JobFavorite, {
  foreignKey: 'job_id',
  as: 'favorites',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

JobFavorite.belongsTo(Job, {
  foreignKey: 'job_id',
  as: 'job',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// 用户和收藏记录的关联（一对多）
User.hasMany(JobFavorite, {
  foreignKey: 'user_id',
  as: 'jobFavorites',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

JobFavorite.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// 用户和公司的关联（一对一）
User.hasOne(Company, {
  foreignKey: 'user_id',
  as: 'company',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Company.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// 公司和职位的关联（一对多）
Company.hasMany(Job, {
  foreignKey: 'user_id',
  sourceKey: 'user_id',
  as: 'jobs',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Job.belongsTo(Company, {
  foreignKey: 'user_id',
  targetKey: 'user_id',
  as: 'companyInfo',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// 用户和职位申请的关联（一对多）
User.hasMany(Application, {
  foreignKey: 'user_id',
  as: 'applications',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Application.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'applicant',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// 职位和职位申请的关联（一对多）
Job.hasMany(Application, {
  foreignKey: 'job_id',
  as: 'applications',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Application.belongsTo(Job, {
  foreignKey: 'job_id',
  as: 'job',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export {
  User,
  Job,
  City,
  LoginLog,
  JobFavorite,
  Company,
  Application,
};