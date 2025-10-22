import pkg from 'sequelize';
const { DataTypes } = pkg;
import { sequelize } from './index.js';

const Application = sequelize.define('Application', {
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
  status: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1,
  },
  application_type: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1,
  },
  resume_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  cover_letter: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  expected_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  interview_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  interview_address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  interview_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  employer_feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  applicant_feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
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
  tableName: 'applications',
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
      fields: ['status'],
    },
    {
      fields: ['application_type'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

// 实例方法
Application.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

Application.prototype.getPublicInfo = function() {
  return {
    id: this.id,
    user_id: this.user_id,
    job_id: this.job_id,
    status: this.status,
    application_type: this.application_type,
    resume_id: this.resume_id,
    cover_letter: this.cover_letter,
    expected_salary: this.expected_salary,
    interview_time: this.interview_time,
    interview_address: this.interview_address,
    interview_notes: this.interview_notes,
    employer_feedback: this.employer_feedback,
    applicant_feedback: this.applicant_feedback,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

// 静态方法
Application.findByUserId = function(userId) {
  return this.findAll({ where: { user_id: userId } });
};

Application.findByJobId = function(jobId) {
  return this.findAll({ where: { job_id: jobId } });
};

Application.getPendingApplications = function() {
  return this.findAll({ where: { status: 1 } });
};

export default Application;