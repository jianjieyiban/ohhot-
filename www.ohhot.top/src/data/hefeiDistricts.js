// 合肥市下级地区数据
export const hefeiDistricts = [
  {
    id: 'yaohai',
    name: '瑶海区',
    description: '合肥市中心城区之一，商业发达，交通便利',
    industries: ['商业', '服务业', '制造业'],
    avgSalary: '5k-9k',
    jobCount: 1200
  },
  {
    id: 'luyang',
    name: '庐阳区',
    description: '合肥市政治、经济、文化中心',
    industries: ['政府机关', '金融', '教育'],
    avgSalary: '6k-10k',
    jobCount: 1500
  },
  {
    id: 'shushan',
    name: '蜀山区',
    description: '高新技术产业开发区，科技企业聚集',
    industries: ['互联网', '科技', '教育'],
    avgSalary: '7k-12k',
    jobCount: 2000
  },
  {
    id: 'baohe',
    name: '包河区',
    description: '滨湖新区，现代服务业发达',
    industries: ['金融', '房地产', '服务业'],
    avgSalary: '6k-11k',
    jobCount: 1800
  },
  {
    id: 'chaohu',
    name: '巢湖市',
    description: '合肥市代管县级市，旅游资源丰富',
    industries: ['旅游', '农业', '制造业'],
    avgSalary: '4k-8k',
    jobCount: 800
  },
  {
    id: 'changfeng',
    name: '长丰县',
    description: '合肥市北部重要县域',
    industries: ['农业', '制造业', '物流'],
    avgSalary: '4k-7k',
    jobCount: 600
  },
  {
    id: 'feidong',
    name: '肥东县',
    description: '合肥市东部重要县域',
    industries: ['制造业', '农业', '物流'],
    avgSalary: '4k-7k',
    jobCount: 700
  },
  {
    id: 'feixi',
    name: '肥西县',
    description: '合肥市西部重要县域，工业基础雄厚',
    industries: ['制造业', '工业', '物流'],
    avgSalary: '5k-9k',
    jobCount: 900
  },
  {
    id: 'lujiang',
    name: '庐江县',
    description: '合肥市南部重要县域',
    industries: ['农业', '旅游', '制造业'],
    avgSalary: '4k-7k',
    jobCount: 500
  }
];

// 合肥特色产业园区
export const hefeiIndustrialParks = [
  {
    name: '合肥高新技术产业开发区',
    description: '国家级高新技术产业开发区',
    keyCompanies: ['科大讯飞', '美亚光电', '安科生物'],
    industries: ['人工智能', '生物医药', '新能源']
  },
  {
    name: '合肥经济技术开发区',
    description: '国家级经济技术开发区',
    keyCompanies: ['江淮汽车', '合力叉车', '日立建机'],
    industries: ['汽车制造', '装备制造', '家电']
  },
  {
    name: '新站高新技术产业开发区',
    description: '新型显示产业基地',
    keyCompanies: ['京东方', '维信诺', '康宁'],
    industries: ['显示技术', '半导体', '新材料']
  }
];

// 获取合肥地区数据
export const getHefeiDistricts = () => hefeiDistricts;

// 根据地区ID获取地区信息
export const getDistrictById = (districtId) => {
  return hefeiDistricts.find(district => district.id === districtId);
};

// 获取合肥特色产业园区
export const getHefeiIndustrialParks = () => hefeiIndustrialParks;