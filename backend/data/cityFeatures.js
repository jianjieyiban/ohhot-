// 城市特色功能配置
const cityFeatures = {
  // 一线城市特色
  tier1: {
    name: '一线城市',
    description: '经济发达、就业机会多、薪资水平高',
    advantages: [
      '高薪资水平',
      '丰富的就业机会',
      '完善的职业发展体系',
      '优质的教育医疗资源',
      '多元化的文化生活'
    ],
    challenges: [
      '生活成本较高',
      '竞争压力大',
      '通勤时间长',
      '房价昂贵'
    ],
    suitableFor: [
      '追求高薪的职场人士',
      '希望快速成长的年轻人',
      '寻求国际化机会的专业人士',
      '创业者和企业家'
    ]
  },

  // 新一线城市特色
  tier2: {
    name: '新一线城市',
    description: '发展迅速、机会与生活平衡',
    advantages: [
      '良好的发展前景',
      '相对较低的生活成本',
      '人才政策优惠',
      '产业升级机会多',
      '工作生活平衡'
    ],
    challenges: [
      '部分行业机会有限',
      '国际化程度相对较低',
      '专业服务不如一线城市完善'
    ],
    suitableFor: [
      '寻求性价比的职场人士',
      '希望安家立业的年轻人',
      '特定行业的专业人士',
      '返乡就业的人才'
    ]
  },

  // 二线城市特色
  tier3: {
    name: '二线城市',
    description: '生活舒适、压力较小、发展稳定',
    advantages: [
      '生活成本低',
      '工作压力小',
      '生活环境舒适',
      '房价相对合理',
      '地方政策支持'
    ],
    challenges: [
      '高端职位机会较少',
      '薪资水平相对较低',
      '职业发展空间有限'
    ],
    suitableFor: [
      '追求稳定生活的人士',
      '本地就业的毕业生',
      '特定行业的专业人士',
      '寻求安逸生活的人群'
    ]
  },

  // 三线城市特色
  tier4: {
    name: '三线城市',
    description: '生活安逸、节奏缓慢、成本低廉',
    advantages: [
      '极低的生活成本',
      '轻松的工作节奏',
      '良好的自然环境',
      '较小的竞争压力',
      '亲近的社区关系'
    ],
    challenges: [
      '职业发展机会有限',
      '薪资水平较低',
      '专业服务不完善',
      '人才流动较少'
    ],
    suitableFor: [
      '寻求安逸生活的人士',
      '本地就业的居民',
      '特定行业的从业者',
      '退休或半退休人群'
    ]
  },

  // 四线及以下城市特色
  tier5: {
    name: '四线及以下城市',
    description: '生活简单、成本极低、发展潜力',
    advantages: [
      '极低的生活成本',
      '简单的生活方式',
      '自然环境优美',
      '较小的生活压力',
      '潜在的发展机会'
    ],
    challenges: [
      '就业机会非常有限',
      '薪资水平很低',
      '基础设施相对落后',
      '人才流失严重'
    ],
    suitableFor: [
      '本地居民就业',
      '特定产业从业者',
      '寻求简单生活的人士',
      '返乡创业的青年'
    ]
  }
};

// 城市产业特色
const cityIndustries = {
  '北京': {
    dominant: ['信息技术', '金融', '文化创意', '教育科研'],
    emerging: ['人工智能', '生物医药', '新能源', '高端制造']
  },
  '上海': {
    dominant: ['金融', '贸易', '航运', '先进制造'],
    emerging: ['金融科技', '生物医药', '集成电路', '人工智能']
  },
  '深圳': {
    dominant: ['电子信息', '互联网', '金融科技', '先进制造'],
    emerging: ['5G技术', '人工智能', '生命健康', '新材料']
  },
  '广州': {
    dominant: ['汽车制造', '商贸物流', '生物医药', '时尚产业'],
    emerging: ['新一代信息技术', '智能装备', '新能源', '数字创意']
  },
  '杭州': {
    dominant: ['电子商务', '互联网', '数字内容', '金融服务'],
    emerging: ['云计算', '大数据', '人工智能', '生命健康']
  },
  '成都': {
    dominant: ['电子信息', '生物医药', '航空航天', '现代服务'],
    emerging: ['人工智能', '数字文创', '绿色低碳', '现代物流']
  },
  '武汉': {
    dominant: ['光电子信息', '汽车制造', '生物医药', '现代服务'],
    emerging: ['网络安全', '人工智能', '商业航天', '新能源']
  },
  '西安': {
    dominant: ['航空航天', '电子信息', '装备制造', '文化旅游'],
    emerging: ['人工智能', '新材料', '生物医药', '新能源']
  }
};

// 城市人才政策
const cityTalentPolicies = {
  '北京': {
    housing: '人才公寓、租房补贴',
    settlement: '积分落户、人才引进',
    education: '子女入学便利',
    healthcare: '优质医疗资源',
    entrepreneurship: '创业扶持、资金支持'
  },
  '上海': {
    housing: '人才安居工程',
    settlement: '居转户、人才引进',
    education: '国际化教育资源',
    healthcare: '高端医疗服务',
    entrepreneurship: '创业孵化、风险投资'
  },
  '深圳': {
    housing: '人才住房补贴',
    settlement: '人才引进落户',
    education: '优质教育资源',
    healthcare: '现代化医疗体系',
    entrepreneurship: '创新创业支持'
  },
  '杭州': {
    housing: '人才专项租赁住房',
    settlement: '人才落户绿色通道',
    education: '子女教育保障',
    healthcare: '医疗健康服务',
    entrepreneurship: '创业贷款、场地支持'
  },
  '成都': {
    housing: '人才公寓、购房补贴',
    settlement: '人才落户便捷',
    education: '优质教育资源',
    healthcare: '医疗保障服务',
    entrepreneurship: '创业扶持、资金补贴'
  }
};

// 获取城市特色信息
function getCityFeatureInfo(cityName, cityLevel) {
  const levelInfo = cityFeatures[cityLevel] || cityFeatures.tier3;
  const industryInfo = cityIndustries[cityName] || {
    dominant: ['传统产业', '服务业', '制造业'],
    emerging: ['新兴产业', '科技创新']
  };
  const policyInfo = cityTalentPolicies[cityName] || {
    housing: '基本住房保障',
    settlement: '常规落户政策',
    education: '基础教育资源',
    healthcare: '基本医疗服务',
    entrepreneurship: '一般创业支持'
  };

  return {
    level: levelInfo,
    industries: industryInfo,
    policies: policyInfo
  };
}

// 获取城市推荐理由
function getCityRecommendationReasons(cityName, cityLevel) {
  const reasons = [];
  const featureInfo = getCityFeatureInfo(cityName, cityLevel);

  // 基于城市等级推荐
  reasons.push(`作为${featureInfo.level.name}，${featureInfo.level.description}`);
  
  // 基于优势推荐
  if (featureInfo.level.advantages.length > 0) {
    reasons.push(`优势包括：${featureInfo.level.advantages.slice(0, 3).join('、')}`);
  }

  // 基于产业特色推荐
  if (featureInfo.industries.dominant.length > 0) {
    reasons.push(`主导产业：${featureInfo.industries.dominant.slice(0, 3).join('、')}`);
  }

  // 基于人才政策推荐
  if (featureInfo.policies.housing !== '基本住房保障') {
    reasons.push('提供优惠的人才政策支持');
  }

  return reasons;
}

export {
  cityFeatures,
  cityIndustries,
  cityTalentPolicies,
  getCityFeatureInfo,
  getCityRecommendationReasons
};