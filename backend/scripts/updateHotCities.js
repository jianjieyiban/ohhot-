import { query } from './config/database.js';

// 为热门城市设置默认的level和population
const hotCities = [
  { city: '北京', province: '北京', level: 'tier1', population: 2189 },
  { city: '上海', province: '上海', level: 'tier1', population: 2428 },
  { city: '广州', province: '广东', level: 'tier1', population: 1868 },
  { city: '深圳', province: '广东', level: 'tier1', population: 1756 },
  { city: '天津', province: '天津', level: 'tier1', population: 1562 },
  { city: '重庆', province: '重庆', level: 'tier1', population: 3205 },
  { city: '成都', province: '四川', level: 'tier2', population: 1658 },
  { city: '杭州', province: '浙江', level: 'tier2', population: 981 },
  { city: '武汉', province: '湖北', level: 'tier2', population: 1233 },
  { city: '西安', province: '陕西', level: 'tier2', population: 1295 },
  { city: '南京', province: '江苏', level: 'tier2', population: 850 },
  { city: '苏州', province: '江苏', level: 'tier2', population: 1075 },
  { city: '东莞', province: '广东', level: 'tier3', population: 1047 },
  { city: '青岛', province: '山东', level: 'tier2', population: 1007 },
  { city: '长沙', province: '湖南', level: 'tier2', population: 1005 },
  { city: '宁波', province: '浙江', level: 'tier2', population: 940 },
  { city: '佛山', province: '广东', level: 'tier2', population: 955 },
  { city: '合肥', province: '安徽', level: 'tier2', population: 937 },
  { city: '郑州', province: '河南', level: 'tier2', population: 1260 },
  { city: '济南', province: '山东', level: 'tier2', population: 920 },
  { city: '福州', province: '福建', level: 'tier2', population: 829 },
  { city: '厦门', province: '福建', level: 'tier2', population: 516 },
  { city: '昆明', province: '云南', level: 'tier2', population: 846 },
  { city: '大连', province: '辽宁', level: 'tier2', population: 745 },
  { city: '哈尔滨', province: '黑龙江', level: 'tier2', population: 1001 },
  { city: '沈阳', province: '辽宁', level: 'tier2', population: 907 },
  { city: '长春', province: '吉林', level: 'tier2', population: 906 },
  { city: '石家庄', province: '河北', level: 'tier3', population: 1120 },
  { city: '太原', province: '山西', level: 'tier3', population: 530 },
  { city: '南昌', province: '江西', level: 'tier3', population: 625 },
  { city: '贵阳', province: '贵州', level: 'tier3', population: 598 },
  { city: '南宁', province: '广西', level: 'tier3', population: 874 },
  { city: '乌鲁木齐', province: '新疆', level: 'tier3', population: 405 },
  { city: '兰州', province: '甘肃', level: 'tier3', population: 436 },
  { city: '呼和浩特', province: '内蒙古', level: 'tier3', population: 345 },
  { city: '海口', province: '海南', level: 'tier3', population: 287 },
  { city: '银川', province: '宁夏', level: 'tier3', population: 285 },
  { city: '西宁', province: '青海', level: 'tier3', population: 237 },
  { city: '拉萨', province: '西藏', level: 'tier3', population: 87 },
  { city: '徐州', province: '江苏', level: 'tier3', population: 902 },
  { city: '温州', province: '浙江', level: 'tier3', population: 964 },
  { city: '金华', province: '浙江', level: 'tier3', population: 712 },
  { city: '嘉兴', province: '浙江', level: 'tier3', population: 540 },
  { city: '台州', province: '浙江', level: 'tier3', population: 664 },
  { city: '绍兴', province: '浙江', level: 'tier3', population: 508 },
  { city: '烟台', province: '山东', level: 'tier3', population: 710 },
  { city: '临沂', province: '山东', level: 'tier3', population: 1102 },
  { city: '潍坊', province: '山东', level: 'tier3', population: 938 },
  { city: '惠州', province: '广东', level: 'tier3', population: 604 },
  { city: '珠海', province: '广东', level: 'tier3', population: 246 },
  { city: '保定', province: '河北', level: 'tier3', population: 1154 },
  { city: '洛阳', province: '河南', level: 'tier3', population: 705 },
  { city: '泉州', province: '福建', level: 'tier3', population: 878 }
];

async function updateHotCities() {
  console.log('开始更新热门城市数据...');
  
  for (const city of hotCities) {
    const result = await query(
      'UPDATE cities SET level = ?, population = ? WHERE city = ? AND province = ? AND is_hot = 1',
      [city.level, city.population, city.city, city.province]
    );
    
    if (result.success) {
      console.log(`✅ 更新 ${city.city} (${city.province}) 成功`);
    } else {
      console.error(`❌ 更新 ${city.city} (${city.province}) 失败:`, result.error);
    }
  }
  
  console.log('更新完成！');
}

updateHotCities().then(() => process.exit(0));