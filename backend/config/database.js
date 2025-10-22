import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 确保环境变量已加载
dotenv.config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sanshi_recruit',
  charset: 'utf8mb4',
  timezone: '+08:00', // 北京时间
  connectionLimit: 10,
  // 添加更多字符集相关设置
  typeCast: function (field, next) {
    if (field.type === 'VAR_STRING' || field.type === 'STRING') {
      return field.string();
    }
    return next();
  },
  // MySQL2不支持initSql，我们将在query函数中设置字符集
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
async function testConnection() {
  try {
    console.log('数据库连接配置:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      passwordLength: dbConfig.password ? dbConfig.password.length : 0
    });
    
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    
    // 测试查询
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ 数据库查询测试通过');
    
    connection.release();
    return { success: true };
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.error('详细错误信息:', error);
    return { success: false, error: error.message };
  }
}

// 执行查询
async function query(sql, params = []) {
  let connection;
  try {
    // 重新加载环境变量以确保使用最新配置
    dotenv.config();
    
    // 每次查询都重新创建数据库配置，确保使用最新的环境变量
    const currentDbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sanshi_recruit',
      charset: 'utf8mb4',
      timezone: '+08:00', // 北京时间
      // 设置连接选项
      multipleStatements: true,
      // 添加字符集设置
      typeCast: function (field, next) {
        if (field.type === 'VAR_STRING' || field.type === 'STRING') {
          return field.string();
        }
        return next();
      }
    };
    
    console.log('数据库配置信息:', {
      host: currentDbConfig.host,
      port: currentDbConfig.port,
      user: currentDbConfig.user,
      database: currentDbConfig.database,
      passwordLength: currentDbConfig.password ? currentDbConfig.password.length : 0
    });
    
    // 创建新的连接，确保使用正确的数据库配置
    connection = await mysql.createConnection(currentDbConfig);
    
    // 执行设置字符集的SQL
    await connection.execute('SET NAMES utf8mb4');
    await connection.execute('SET CHARACTER SET utf8mb4');
    await connection.execute('SET character_set_connection=utf8mb4');
    await connection.execute('SET collation_connection=utf8mb4_unicode_ci');
    
    // 验证实际连接的数据库
    const [dbResult] = await connection.execute('SELECT DATABASE() as current_db');
    console.log('实际连接的数据库:', dbResult[0].current_db);
    
    // 使用Promise版本的execute方法
    const [rows, fields] = await connection.execute(sql, params);
    
    await connection.end();
    return { success: true, data: rows, fields };
  } catch (error) {
    console.error('数据库查询错误:', error);
    if (connection) {
      await connection.end();
    }
    return { success: false, error: error.message };
  }
}

// 执行事务
async function transaction(operations) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    for (const operation of operations) {
      const { sql, params } = operation;
      await connection.execute(sql, params);
    }
    
    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error('事务执行失败:', error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

// 关闭连接池
async function closePool() {
  try {
    await pool.end();
    console.log('数据库连接池已关闭');
  } catch (error) {
    console.error('关闭连接池时出错:', error);
  }
}

export {
  pool,
  query,
  transaction,
  testConnection,
  closePool,
  dbConfig,
};