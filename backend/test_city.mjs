import City from './models/City.js';
import { sequelize } from './models/index.js';

async function testCityModel() {
  try {
    console.log('测试城市模型...');
    
    // 确保数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 查询所有城市
    const cities = await City.findAll({
      where: { is_active: true },
      order: [['city', 'ASC']],
      limit: 10
    });
    
    console.log('找到城市数量:', cities.length);
    
    // 打印前几个城市
    cities.forEach((city, index) => {
      console.log(`${index + 1}. ID: ${city.id}, 城市: ${city.city}, 省份: ${city.province}`);
    });
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}

testCityModel();