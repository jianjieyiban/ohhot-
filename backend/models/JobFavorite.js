import pkg from 'sequelize';
const { DataTypes } = pkg;
import { sequelize } from './index.js';

const JobFavorite = sequelize.define('JobFavorite', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  job_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'job_favorites',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['job_id'],
    },
    {
      unique: true,
      fields: ['user_id', 'job_id'],
    },
  ],
});

export default JobFavorite;