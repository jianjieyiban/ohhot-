import dotenv from 'dotenv';
import path from 'path';

// 确保正确加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('环境变量配置:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

// 先测试数据库连接
import { testConnection } from '../config/database.js';

async function testDBConnection() {
  console.log('🔍 测试数据库连接...');
  const result = await testConnection();
  if (!result.success) {
    console.error('❌ 数据库连接测试失败');
    process.exit(1);
  }
  console.log('✅ 数据库连接测试成功');
}

import { sequelize, syncDatabase } from '../models/index.js';
import { query } from '../config/database.js';

// 插入基础数据
async function seedData() {
  try {
    console.log('🌱 开始插入基础数据...');
    
    // 插入用户数据
    const usersResult = await query(`
      INSERT IGNORE INTO users (phone, password, username, email, user_type, status) VALUES
      ('13800138000', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'admin@sanshi.com', 'employer', 'active'),
      ('13800138001', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'jobseeker1', 'jobseeker1@example.com', 'job_seeker', 'active'),
      ('13800138002', '$2b$10$92IXUNpkjOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'company1', 'company1@example.com', 'employer', 'active')
    `);
    
    if (usersResult.success) {
      console.log('✅ 用户数据插入成功');
    } else {
      console.log('⚠️ 用户数据可能已存在');
    }
    
    // 跳过公司数据插入（数据库中没有companies表）
    console.log('ℹ️  跳过公司数据插入（数据库中没有companies表）');
    
    // 插入城市数据
    const citiesResult = await query(`
      INSERT IGNORE INTO cities (city, province, is_hot) VALUES
      ('合肥', '安徽', TRUE),
      ('北京', '北京', TRUE),
      ('上海', '上海', TRUE),
      ('深圳', '广东', TRUE),
      ('广州', '广东', TRUE),
      ('杭州', '浙江', TRUE),
      ('成都', '四川', TRUE),
      ('武汉', '湖北', TRUE),
      ('南京', '江苏', TRUE),
      ('西安', '陕西', TRUE),
      ('苏州', '江苏', TRUE)
    `);
    
    if (citiesResult.success) {
      console.log('✅ 城市数据插入成功');
    } else {
      console.log('⚠️ 城市数据可能已存在');
    }
    
    // 插入职位数据
    const jobsResult = await query(`
      INSERT IGNORE INTO jobs (title, content, salary_min, salary_max, job_type, city_id, status, user_id, requirements) VALUES
      ('前端开发工程师', '负责公司前端项目开发，要求熟练掌握React/Vue等框架', 15000, 25000, 'full_time', 1, 1, 2, '熟练掌握React/Vue等前端框架，有实际项目经验'),
      ('Java后端开发', '负责后端系统开发，要求熟悉Spring Boot框架', 20000, 35000, 'full_time', 2, 1, 2, '熟悉Spring Boot框架，有微服务开发经验'),
      ('Python数据分析师', '负责数据分析和建模工作', 12000, 20000, 'full_time', 3, 1, 2, '熟练使用Python进行数据分析，熟悉常用机器学习算法'),
      ('UI设计师', '负责产品UI界面设计', 10000, 18000, 'full_time', 4, 1, 2, '熟练使用设计软件，有良好的审美能力'),
      ('产品经理', '负责产品规划和需求分析', 18000, 30000, 'full_time', 5, 1, 2, '有产品设计经验，能够独立完成产品规划'),
      ('运维工程师', '负责系统运维和监控', 12000, 20000, 'full_time', 6, 1, 2, '熟悉Linux系统，有运维自动化经验'),
      ('测试工程师', '负责软件测试和质量保证', 10000, 18000, 'full_time', 7, 1, 2, '熟悉测试流程，能够编写测试用例'),
      ('移动端开发', '负责iOS/Android应用开发', 15000, 25000, 'full_time', 8, 1, 2, '熟悉iOS/Android开发，有上架应用经验'),
      ('大数据工程师', '负责大数据平台开发和维护', 20000, 35000, 'full_time', 9, 1, 2, '熟悉Hadoop/Spark等大数据技术'),
      ('AI算法工程师', '负责机器学习算法研发', 25000, 40000, 'full_time', 10, 1, 2, '熟悉深度学习算法，有算法优化经验')
    `);
    
    if (jobsResult.success) {
      console.log('✅ 职位数据插入成功');
    } else {
      console.log('⚠️ 职位数据可能已存在');
    }
    
    console.log('🌱 基础数据插入完成');
  } catch (error) {
    console.error('❌ 插入基础数据时出错:', error);
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始数据库初始化...');
    
    // 先测试数据库连接
    await testDBConnection();
    
    // 同步数据库表结构
    console.log('🔄 正在同步数据库表结构...');
    const syncResult = await syncDatabase(false); // false表示不强制重建
    
    if (!syncResult) {
      console.error('❌ 数据库同步失败');
      process.exit(1);
    }
    
    console.log('✅ 数据库表结构同步成功');
    
    // 插入基础数据
    await seedData();
    
    console.log('🎉 数据库初始化完成！');
    console.log('💡 现在可以启动服务器了');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行主函数
main();