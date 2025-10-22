import pkg from 'sequelize';
const { DataTypes } = pkg;
import { sequelize } from './index.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      is: /^1[3-9]\d{9}$/,
    },
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  real_name: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  gender: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 0,
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  user_type: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1,
  },
  company_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  company_address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  id_card: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
  },
  login_ip: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  login_time: {
    type: DataTypes.DATE,
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
  tableName: 'users',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['phone'],
    },
    {
      fields: ['user_type'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['city_id'],
    },
  ],
});

// 实例方法
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

User.prototype.getPublicProfile = function() {
  return {
    id: this.id,
    phone: this.phone,
    nickname: this.nickname,
    email: this.email,
    user_type: this.user_type,
    avatar: this.avatar,
    real_name: this.real_name,
    gender: this.gender,
    created_at: this.created_at,
  };
};

// 静态方法
User.findByEmail = function(email) {
  return this.findOne({ where: { email } });
};

User.findByPhone = function(phone) {
  return this.findOne({ where: { phone } });
};

User.getActiveUsers = function() {
  return this.findAll({ where: { status: 1 } });
};

User.getEmployers = function() {
  return this.findAll({ where: { user_type: 3, status: 1 } });
};

User.getJobSeekers = function() {
  return this.findAll({ where: { user_type: 1, status: 1 } });
};

export default User;