import { query } from '../config/database.js';
import allCities from '../data/allCities.js';

// 导入城市数据到数据库
async function importCities() {
  try {
    console.log('开始导入城市数据...');
    
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const cityData of allCities) {
      // 检查城市是否已存在
      const checkResult = await query(
        'SELECT id FROM cities WHERE city = ? AND province = ?',
        [cityData.name, cityData.province]
      );
      
      if (checkResult.success && checkResult.data.length > 0) {
        // 更新已存在的城市
        const updateResult = await query(
          `UPDATE cities SET 
            level = ?, population = ?, gdp = ?, area = ?, 
            description = ?, features = ?, is_hot = ?
          WHERE city = ? AND province = ?`,
          [
            cityData.level,
            cityData.population,
            cityData.gdp,
            cityData.area || null,
            cityData.description,
            JSON.stringify(cityData.features || []),
            cityData.is_hot || false,
            cityData.name,
            cityData.province
          ]
        );
        
        if (updateResult.success) {
          console.log(`✅ 成功更新城市: ${cityData.name} (${cityData.province})`);
          importedCount++;
        } else {
          console.error(`❌ 更新城市失败: ${cityData.name}`, updateResult.error);
        }
        skippedCount++;
        continue;
      }
      
      // 插入新城市
      const insertResult = await query(
        `INSERT INTO cities (
          city, province, district, level, population, gdp, area, 
          description, features, is_hot, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          cityData.name,
          cityData.province,
          cityData.district || null,
          cityData.level,
          cityData.population,
          cityData.gdp,
          cityData.area || null,
          cityData.description,
          JSON.stringify(cityData.features || []),
          cityData.is_hot || false,
          true
        ]
      );
      
      if (insertResult.success) {
        console.log(`✅ 成功导入城市: ${cityData.name} (${cityData.province})`);
        importedCount++;
      } else {
        console.error(`❌ 导入城市失败: ${cityData.name}`, insertResult.error);
      }
    }
    
    console.log(`\n导入完成！成功导入 ${importedCount} 个城市，跳过 ${skippedCount} 个已存在的城市`);
    
    // 显示导入统计
    const statsResult = await query(`
      SELECT 
        level,
        COUNT(*) as count,
        SUM(population) as total_population,
        AVG(gdp) as avg_gdp
      FROM cities 
      WHERE is_active = true
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
      console.log('\n城市数据统计:');
      console.log('==============');
      
      statsResult.data.forEach(stat => {
        const tierNames = {
          tier1: '一线城市',
          tier2: '新一线城市',
          tier3: '二线城市',
          tier4: '三线城市',
          tier5: '四线及以下',
        };
        
        console.log(`${tierNames[stat.level] || stat.level}: ${stat.count} 个城市，平均GDP: ${Math.round(stat.avg_gdp || 0)} 亿元`);
      });
    }
    
    return {
      success: true,
      imported: importedCount,
      skipped: skippedCount,
      total: importedCount + skippedCount
    };
    
  } catch (error) {
    console.error('导入城市数据时发生错误:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 清空城市数据（谨慎使用）
async function clearCities() {
  try {
    console.log('警告：此操作将清空所有城市数据！');
    
    // 在实际应用中，这里应该有确认机制
    // 为了安全，我们暂时不实现自动清空功能
    
    console.log('清空功能已禁用，如需清空请手动执行SQL语句');
    return { success: false, message: '清空功能已禁用' };
    
  } catch (error) {
    console.error('清空城市数据时发生错误:', error);
    return { success: false, error: error.message };
  }
}

// 更新城市统计数据
async function updateCityStats() {
  try {
    console.log('开始更新城市统计数据...');
    
    const citiesResult = await query('SELECT id FROM cities WHERE is_active = true');
    
    if (!citiesResult.success) {
      console.error('获取城市列表失败');
      return { success: false };
    }
    
    let updatedCount = 0;
    
    for (const city of citiesResult.data) {
      // 计算每个城市的职位统计
      const statsResult = await query(`
        SELECT 
          COUNT(*) as job_count,
          COUNT(DISTINCT user_id) as company_count,
          AVG((salary_min + salary_max) / 2) as avg_salary
        FROM jobs 
        WHERE city_id = ? AND status = 1
      `, [city.id]);
      
      if (statsResult.success && statsResult.data.length > 0) {
        const stats = statsResult.data[0];
        
        await query(
          'UPDATE cities SET job_count = ?, company_count = ?, avg_salary = ? WHERE id = ?',
          [stats.job_count || 0, stats.company_count || 0, stats.avg_salary || null, city.id]
        );
        
        updatedCount++;
      }
    }
    
    console.log(`✅ 成功更新 ${updatedCount} 个城市的统计数据`);
    return { success: true, updated: updatedCount };
    
  } catch (error) {
    console.error('更新城市统计数据时发生错误:', error);
    return { success: false, error: error.message };
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'import':
      importCities().then(result => {
        if (result.success) {
          process.exit(0);
        } else {
          process.exit(1);
        }
      });
      break;
    case 'stats':
      updateCityStats().then(result => {
        if (result.success) {
          process.exit(0);
        } else {
          process.exit(1);
        }
      });
      break;
    default:
      console.log('使用方法:');
      console.log('  node importCities.js import    - 导入城市数据');
      console.log('  node importCities.js stats    - 更新城市统计');
      process.exit(1);
  }
}

export {
  importCities,
  clearCities,
  updateCityStats
};