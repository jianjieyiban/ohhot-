// models/index.js（修复表结构同步问题，确保字段与模型一致）
import pkg from 'sequelize';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 兼容ES模块与CommonJS模块的Sequelize导出
const Sequelize = pkg.default ? pkg.default : pkg;

// 数据库实例配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'sanshi_recruit',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    timezone: '+08:00',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      underscored: true,        // 字段名自动转为下划线（如province保持不变，createdAt→created_at）
      timestamps: true,
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功（Sequelize构造函数正常）');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 同步数据库表结构（开发环境强制同步，确保字段匹配）
async function syncDatabase() {
  // 开发环境强制同步（删除旧表重建，保证与模型一致）
  // 生产环境部署时改为 force: false
  const forceSync = process.env.NODE_ENV === 'development';
  
  try {
    await sequelize.sync({ force: forceSync });
    console.log(`✅ 数据库同步${forceSync ? '（强制模式，已更新表结构）' : ''}成功`);
    return true;
  } catch (error) {
    console.error('❌ 数据库同步失败:', error.message);
    return false;
  }
}

// 关闭数据库连接
async function closeConnection() {
  try {
    await sequelize.close();
    console.log('✅ 数据库连接已安全关闭');
  } catch (error) {
    console.error('❌ 关闭数据库连接失败:', error.message);
  }
}

export {
  sequelize,
  Sequelize,
  testConnection,
  syncDatabase,
  closeConnection
};