const City = require('./models/City.js');

async function testCityModel() {
  try {
    console.log('测试城市模型...');
    
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
    
    process.exit(0);
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}

testCityModel();