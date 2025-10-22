#!/usr/bin/env node

/**
 * 管理员数据库初始化脚本
 * 用于在宝塔面板部署时初始化数据库连接和基础数据
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('🚀 开始管理员数据库初始化...');
console.log('📊 环境变量配置:');
console.log('   DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('   DB_USER:', process.env.DB_USER || 'root');
console.log('   DB_NAME:', process.env.DB_NAME || 'recruitment_db');
console.log('   DB_PORT:', process.env.DB_PORT || '3306');

// 导入数据库连接模块
import { testConnection, query } from './config/database.js';

async function initializeDatabase() {
    try {
        console.log('\n🔍 测试数据库连接...');
        
        // 测试数据库连接
        const connectionResult = await testConnection();
        if (!connectionResult.success) {
            console.error('❌ 数据库连接失败:', connectionResult.error);
            console.log('💡 请检查以下配置:');
            console.log('   1. 数据库服务是否启动');
            console.log('   2. 数据库用户名密码是否正确');
            console.log('   3. 数据库是否存在');
            console.log('   4. 防火墙设置是否允许连接');
            process.exit(1);
        }
        
        console.log('✅ 数据库连接成功');
        
        // 检查数据库表是否存在
        console.log('\n📋 检查数据库表结构...');
        const tablesResult = await query(`SHOW TABLES LIKE 'users'`);
        
        if (tablesResult.success && tablesResult.data.length > 0) {
            console.log('✅ 数据库表已存在');
            
            // 检查管理员用户是否存在
            console.log('\n👤 检查管理员账户...');
            const adminResult = await query(`SELECT * FROM users WHERE email = 'admin@recruitment-system.com'`);
            
            if (adminResult.success && adminResult.data.length > 0) {
                console.log('✅ 管理员账户已存在');
                const admin = adminResult.data[0];
                console.log(`   邮箱: ${admin.email}`);
                console.log(`   用户类型: ${admin.user_type}`);
                console.log(`   状态: ${admin.status}`);
            } else {
                console.log('⚠️ 管理员账户不存在，将创建默认管理员账户');
                await createDefaultAdmin();
            }
        } else {
            console.log('❌ 数据库表不存在，请先导入数据库结构');
            console.log('💡 请执行以下步骤:');
            console.log('   1. 在宝塔面板中创建数据库');
            console.log('   2. 导入 database/schema.sql 文件');
            console.log('   3. 或者导入 database/lw_database_complete.sql 文件');
            process.exit(1);
        }
        
        console.log('\n🎉 数据库初始化完成！');
        console.log('📝 管理员账户信息:');
        console.log('   邮箱: admin@recruitment-system.com');
        console.log('   密码: admin123');
        console.log('   安全密钥: Admin@2024#Key');
        console.log('\n💡 现在可以启动后端服务器了');
        
    } catch (error) {
        console.error('❌ 初始化过程中出错:', error);
        process.exit(1);
    }
}

async function createDefaultAdmin() {
    try {
        console.log('👤 创建默认管理员账户...');
        
        // 导入bcrypt用于密码加密
        const bcrypt = await import('bcrypt');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);
        
        // 插入管理员用户
        const insertResult = await query(`
            INSERT INTO users (phone, password, username, email, user_type, status) 
            VALUES ('13800138000', ?, '系统管理员', 'admin@recruitment-system.com', 2, 'active')
        `, [hashedPassword]);
        
        if (insertResult.success) {
            console.log('✅ 管理员账户创建成功');
        } else {
            console.error('❌ 创建管理员账户失败:', insertResult.error);
        }
        
    } catch (error) {
        console.error('❌ 创建管理员账户时出错:', error);
    }
}

// 执行初始化
initializeDatabase();