import mysql from 'mysql2/promise';  // ES模块语法
async function testDB() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'ohhot_user',
      password: '970829',
      database: 'LW'
    });
    console.log('✅ 数据库连接成功！');
    await connection.end();
  } catch (err) {
    console.error('❌ 数据库连接失败：', err.message);
  }
}
testDB();