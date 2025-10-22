import pkg from 'sequelize';
const { DataTypes } = pkg;
import { sequelize } from './index.js';

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  short_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  logo: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  industry: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  scale: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING(255),
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
  contact_email: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  district: {
    type: DataTypes.STRING(50),
    allowNull: true,
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
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'companies',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      fields: ['name'],
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['industry'],
    },
    {
      fields: ['city_id'],
    },
    {
      fields: ['status'],
    },
  ],
});

// 实例方法
Company.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

Company.prototype.getPublicInfo = function() {
  return {
    id: this.id,
    name: this.name,
    short_name: this.short_name,
    logo: this.logo,
    industry: this.industry,
    scale: this.scale,
    description: this.description,
    website: this.website,
    contact_person: this.contact_person,
    contact_phone: this.contact_phone,
    contact_email: this.contact_email,
    address: this.address,
    city_id: this.city_id,
    district: this.district,
    latitude: this.latitude,
    longitude: this.longitude,
    is_verified: this.is_verified,
    status: this.status,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

// 静态方法
Company.findByUserId = function(userId) {
  return this.findOne({ where: { user_id: userId } });
};

Company.getActiveCompanies = function() {
  return this.findAll({ where: { status: 1 } });
};

Company.getVerifiedCompanies = function() {
  return this.findAll({ where: { status: 1, is_verified: true } });
};

export default Company;