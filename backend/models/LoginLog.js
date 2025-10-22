import pkg from 'sequelize';
const { DataTypes } = pkg;
import { sequelize } from './index.js';

// 定义登录日志模型
const LoginLog = sequelize.define('LoginLog', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  user_type: {
    type: DataTypes.ENUM('job_seeker', 'employer', 'admin'),
    allowNull: false,
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  login_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  device_info: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'login_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default LoginLog;