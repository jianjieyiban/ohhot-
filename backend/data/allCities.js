// 中国主要城市数据
const allCities = [
  // 一线城市
  { name: '北京', province: '北京', level: 'tier1', population: 2189, gdp: 36102.6, is_hot: true },
  { name: '上海', province: '上海', level: 'tier1', population: 2428, gdp: 38700.6, is_hot: true },
  { name: '广州', province: '广东', level: 'tier1', population: 1868, gdp: 25019.1, is_hot: true },
  { name: '深圳', province: '广东', level: 'tier1', population: 1756, gdp: 27670.2, is_hot: true },

  // 新一线城市
  { name: '成都', province: '四川', level: 'tier2', population: 1658, gdp: 17716.7, is_hot: true },
  { name: '杭州', province: '浙江', level: 'tier2', population: 981, gdp: 16106, is_hot: true },
  { name: '武汉', province: '湖北', level: 'tier2', population: 1233, gdp: 15616.1, is_hot: true },
  { name: '西安', province: '陕西', level: 'tier2', population: 1295, gdp: 10020.4, is_hot: true },
  { name: '苏州', province: '江苏', level: 'tier2', population: 1075, gdp: 20170.5, is_hot: true },
  { name: '南京', province: '江苏', level: 'tier2', population: 850, gdp: 14817.9, is_hot: true },
  { name: '长沙', province: '湖南', level: 'tier2', population: 815, gdp: 12142.5, is_hot: true },
  { name: '郑州', province: '河南', level: 'tier2', population: 1260, gdp: 12003, is_hot: true },
  { name: '东莞', province: '广东', level: 'tier2', population: 1047, gdp: 9650.2, is_hot: true },
  { name: '青岛', province: '山东', level: 'tier2', population: 1007, gdp: 12400.6, is_hot: true },
  { name: '沈阳', province: '辽宁', level: 'tier2', population: 832, gdp: 6571.6, is_hot: true },
  { name: '宁波', province: '浙江', level: 'tier2', population: 854, gdp: 11985.2, is_hot: true },
  { name: '昆明', province: '云南', level: 'tier2', population: 846, gdp: 6475.9, is_hot: true },

  // 二线城市
  { name: '合肥', province: '安徽', level: 'tier3', population: 937, gdp: 10045.7, is_hot: false },
  { name: '福州', province: '福建', level: 'tier3', population: 780, gdp: 10020.8, is_hot: false },
  { name: '厦门', province: '福建', level: 'tier3', population: 429, gdp: 6384.0, is_hot: false },
  { name: '哈尔滨', province: '黑龙江', level: 'tier3', population: 1001, gdp: 5183.8, is_hot: false },
  { name: '济南', province: '山东', level: 'tier3', population: 890, gdp: 10140.9, is_hot: false },
  { name: '大连', province: '辽宁', level: 'tier3', population: 745, gdp: 7030.4, is_hot: false },
  { name: '长春', province: '吉林', level: 'tier3', population: 854, gdp: 6638.0, is_hot: false },
  { name: '太原', province: '山西', level: 'tier3', population: 446, gdp: 4153.3, is_hot: false },
  { name: '南宁', province: '广西', level: 'tier3', population: 875, gdp: 4726.3, is_hot: false },
  { name: '乌鲁木齐', province: '新疆', level: 'tier3', population: 405, gdp: 3337.3, is_hot: false },

  // 三线城市
  { name: '贵阳', province: '贵州', level: 'tier4', population: 598, gdp: 4311.7, is_hot: false },
  { name: '兰州', province: '甘肃', level: 'tier4', population: 435, gdp: 2886.7, is_hot: false },
  { name: '银川', province: '宁夏', level: 'tier4', population: 285, gdp: 1964.4, is_hot: false },
  { name: '西宁', province: '青海', level: 'tier4', population: 247, gdp: 1548.8, is_hot: false },
  { name: '海口', province: '海南', level: 'tier4', population: 288, gdp: 1791.6, is_hot: false },
  { name: '呼和浩特', province: '内蒙古', level: 'tier4', population: 344, gdp: 2800.5, is_hot: false },

  // 四线及以下城市
  { name: '拉萨', province: '西藏', level: 'tier5', population: 86, gdp: 617.9, is_hot: false },
  { name: '日喀则', province: '西藏', level: 'tier5', population: 80, gdp: 150.2, is_hot: false },
  { name: '林芝', province: '西藏', level: 'tier5', population: 23, gdp: 63.5, is_hot: false },
  { name: '昌都', province: '西藏', level: 'tier5', population: 76, gdp: 180.3, is_hot: false },
  { name: '山南', province: '西藏', level: 'tier5', population: 35, gdp: 92.1, is_hot: false },
];

// 城市特色标签
const cityFeatures = {
  '北京': ['政治中心', '文化中心', '科技创新', '教育资源丰富', '历史名城'],
  '上海': ['经济中心', '金融中心', '国际化大都市', '时尚之都', '交通枢纽'],
  '广州': ['商贸中心', '美食之都', '岭南文化', '制造业发达', '港口城市'],
  '深圳': ['科技创新', '高新技术', '年轻活力', '创业热土', '改革开放前沿'],
  '成都': ['休闲之都', '美食天堂', '熊猫故乡', 'IT产业发达', '西部中心'],
  '杭州': ['电子商务', '互联网之都', '风景旅游', '创新创业', '历史文化'],
  '武汉': ['九省通衢', '教育重镇', '工业基地', '长江经济带', '中部中心'],
  '西安': ['历史文化', '旅游名城', '军工重镇', '西部开发', '丝绸之路起点'],
  '苏州': ['制造业强市', '园林城市', '外资集中', '经济发达', '江南水乡'],
  '南京': ['六朝古都', '教育科研', '历史文化', '沿江城市', '区域中心'],
};

// 为每个城市添加特色标签
allCities.forEach(city => {
  if (cityFeatures[city.name]) {
    city.features = cityFeatures[city.name];
  } else {
    city.features = [];
  }
  
  // 添加默认描述
  if (!city.description) {
    const tierNames = {
      tier1: '一线城市',
      tier2: '新一线城市', 
      tier3: '二线城市',
      tier4: '三线城市',
      tier5: '四线及以下城市',
    };
    
    city.description = `${city.name}是${city.province}的${tierNames[city.level]}，拥有${city.population}万人口，GDP为${city.gdp}亿元。`;
  }
});

export default allCities;