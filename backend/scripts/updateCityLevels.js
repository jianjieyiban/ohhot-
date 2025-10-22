import { query } from '../config/database.js';

// 根据GDP和人口数据自动更新城市等级
async function updateCityLevels() {
  try {
    console.log('开始更新城市等级...');
    
    // 获取所有活跃城市
    const citiesResult = await query(`
      SELECT id, name, province, gdp, population 
      FROM cities 
      WHERE status = 'active' AND gdp IS NOT NULL AND population IS NOT NULL
    `);
    
    if (!citiesResult.success) {
      console.error('获取城市数据失败');
      return { success: false };
    }
    
    let updatedCount = 0;
    
    for (const city of citiesResult.data) {
      let newLevel = 'tier3'; // 默认为二线城市
      
      // 基于GDP和人口数据确定城市等级
      if (city.gdp > 20000 && city.population > 1500) {
        newLevel = 'tier1'; // 一线城市
      } else if (city.gdp > 10000 && city.population > 800) {
        newLevel = 'tier2'; // 新一线城市
      } else if (city.gdp > 5000 && city.population > 500) {
        newLevel = 'tier3'; // 二线城市
      } else if (city.gdp > 2000 && city.population > 200) {
        newLevel = 'tier4'; // 三线城市
      } else {
        newLevel = 'tier5'; // 四线及以下
      }
      
      // 检查是否需要更新
      const currentLevelResult = await query(
        'SELECT level FROM cities WHERE id = ?',
        [city.id]
      );
      
      if (currentLevelResult.success && currentLevelResult.data.length > 0) {
        const currentLevel = currentLevelResult.data[0].level;
        
        if (currentLevel !== newLevel) {
          // 更新城市等级
          const updateResult = await query(
            'UPDATE cities SET level = ?, updated_at = NOW() WHERE id = ?',
            [newLevel, city.id]
          );
          
          if (updateResult.success) {
            const tierNames = {
              tier1: '一线城市',
              tier2: '新一线城市',
              tier3: '二线城市',
              tier4: '三线城市',
              tier5: '四线及以下',
            };
            
            console.log(`✅ 更新城市等级: ${city.name} (${tierNames[currentLevel]} → ${tierNames[newLevel]})`);
            updatedCount++;
          }
        }
      }
    }
    
    console.log(`\n更新完成！共更新 ${updatedCount} 个城市的等级`);
    
    // 显示等级分布统计
    const statsResult = await query(`
      SELECT 
        level,
        COUNT(*) as count,
        AVG(gdp) as avg_gdp,
        AVG(population) as avg_population
      FROM cities 
      WHERE status = 'active'
      GROUP BY level
      ORDER BY 
        CASE level
          WHEN 'tier1' THEN 1
          WHEN 'tier2' THEN 2
          WHEN 'tier3' THEN 3
          WHEN 'tier4' THEN 4
          WHEN 'tier5' THEN 5
          ELSE 6
        END
    `);
    
    if (statsResult.success) {
      console.log('\n城市等级分布统计:');
      console.log('=================');
      
      statsResult.data.forEach(stat => {
        const tierNames = {
          tier1: '一线城市',
          tier2: '新一线城市',
          tier3: '二线城市',
          tier4: '三线城市',
          tier5: '四线及以下',
        };
        
        console.log(`${tierNames[stat.level] || stat.level}: ${stat.count} 个城市`);
        console.log(`  平均GDP: ${Math.round(stat.avg_gdp || 0)} 亿元`);
        console.log(`  平均人口: ${Math.round(stat.avg_population || 0)} 万人`);
        console.log('');
      });
    }
    
    return { success: true, updated: updatedCount };
    
  } catch (error) {
    console.error('更新城市等级时发生错误:', error);
    return { success: false, error: error.message };
  }
}

// 标记热门城市（基于职位数量）
async function updateHotCities() {
  try {
    console.log('开始更新热门城市标记...');
    
    // 首先重置所有城市的is_hot标记
    await query("UPDATE cities SET is_hot = false WHERE status = 'active'");
    
    // 获取职位数量排名前20的城市
    const hotCitiesResult = await query(`
      SELECT city_id, COUNT(*) as job_count
      FROM jobs 
      WHERE status = 'active'
      GROUP BY city_id
      ORDER BY job_count DESC
      LIMIT 20
    `);
    
    if (!hotCitiesResult.success) {
      console.error('获取热门城市数据失败');
      return { success: false };
    }
    
    let markedCount = 0;
    
    for (const hotCity of hotCitiesResult.data) {
      // 标记为热门城市
      const updateResult = await query(
        'UPDATE cities SET is_hot = true WHERE id = ?',
        [hotCity.city_id]
      );
      
      if (updateResult.success) {
        // 获取城市名称用于日志
        const cityResult = await query(
          'SELECT name, province FROM cities WHERE id = ?',
          [hotCity.city_id]
        );
        
        if (cityResult.success && cityResult.data.length > 0) {
          const city = cityResult.data[0];
          console.log(`✅ 标记热门城市: ${city.name} (${city.province}) - ${hotCity.job_count} 个职位`);
          markedCount++;
        }
      }
    }
    
    console.log(`\n标记完成！共标记 ${markedCount} 个热门城市`);
    return { success: true, marked: markedCount };
    
  } catch (error) {
    console.error('更新热门城市标记时发生错误:', error);
    return { success: false, error: error.message };
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'levels':
      updateCityLevels().then(result => {
        if (result.success) {
          process.exit(0);
        } else {
          process.exit(1);
        }
      });
      break;
    case 'hot':
      updateHotCities().then(result => {
        if (result.success) {
          process.exit(0);
        } else {
          process.exit(1);
        }
      });
      break;
    case 'all':
      Promise.all([updateCityLevels(), updateHotCities()]).then(results => {
        const allSuccess = results.every(result => result.success);
        process.exit(allSuccess ? 0 : 1);
      });
      break;
    default:
      console.log('使用方法:');
      console.log('  node updateCityLevels.js levels    - 更新城市等级');
      console.log('  node updateCityLevels.js hot      - 更新热门城市标记');
      console.log('  node updateCityLevels.js all      - 执行全部更新');
      process.exit(1);
  }
}

export {
  updateCityLevels,
  updateHotCities
};