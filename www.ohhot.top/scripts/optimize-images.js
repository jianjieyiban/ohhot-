#!/usr/bin/env node

/**
 * 图片优化脚本
 * 用于压缩和优化项目中的图片资源
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 支持的图片格式
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];

// 图片优化配置
const OPTIMIZATION_CONFIG = {
  jpg: {
    quality: 80,
    progressive: true
  },
  png: {
    quality: 80,
    compressionLevel: 9
  },
  webp: {
    quality: 80
  }
};

/**
 * 检查是否安装了必要的工具
 */
function checkDependencies() {
  try {
    execSync('which convert || which magick', { stdio: 'ignore' });
    console.log('✅ ImageMagick 已安装');
  } catch (error) {
    console.warn('⚠️ ImageMagick 未安装，部分优化功能可能不可用');
  }

  try {
    execSync('which cwebp', { stdio: 'ignore' });
    console.log('✅ WebP 工具已安装');
  } catch (error) {
    console.warn('⚠️ WebP 工具未安装，WebP 转换功能不可用');
  }
}

/**
 * 获取项目中的所有图片文件
 */
function getImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      getImageFiles(filePath, fileList);
    } else if (SUPPORTED_FORMATS.includes(path.extname(file).toLowerCase())) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * 优化单个图片文件
 */
function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath, ext);
  const dir = path.dirname(filePath);
  
  try {
    const stats = fs.statSync(filePath);
    const originalSize = stats.size;

    console.log(`🔧 优化图片: ${filePath} (${(originalSize / 1024).toFixed(2)} KB)`);

    // 根据文件类型进行优化
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        optimizeJpeg(filePath);
        break;
      case '.png':
        optimizePng(filePath);
        break;
      case '.svg':
        optimizeSvg(filePath);
        break;
      default:
        console.log(`ℹ️  跳过 ${ext} 格式文件`);
        return;
    }

    // 检查优化后的文件大小
    const newStats = fs.statSync(filePath);
    const newSize = newStats.size;
    const saved = originalSize - newSize;
    const savedPercent = ((saved / originalSize) * 100).toFixed(1);

    if (saved > 0) {
      console.log(`✅ 优化完成: 节省 ${(saved / 1024).toFixed(2)} KB (${savedPercent}%)`);
    } else {
      console.log(`ℹ️  文件已优化或无需优化`);
    }

    // 生成 WebP 版本
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      generateWebP(filePath);
    }

  } catch (error) {
    console.error(`❌ 优化失败: ${filePath}`, error.message);
  }
}

/**
 * 优化 JPEG 图片
 */
function optimizeJpeg(filePath) {
  try {
    execSync(`convert "${filePath}" -strip -interlace Plane -quality 80 "${filePath}"`, {
      stdio: 'ignore'
    });
  } catch (error) {
    // 如果 ImageMagick 不可用，使用其他方法
    console.log('ℹ️  ImageMagick 不可用，跳过 JPEG 优化');
  }
}

/**
 * 优化 PNG 图片
 */
function optimizePng(filePath) {
  try {
    execSync(`convert "${filePath}" -strip -quality 80 "${filePath}"`, {
      stdio: 'ignore'
    });
  } catch (error) {
    console.log('ℹ️  ImageMagick 不可用，跳过 PNG 优化');
  }
}

/**
 * 优化 SVG 图片
 */
function optimizeSvg(filePath) {
  try {
    // 简单的 SVG 优化：移除注释和空行
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 移除注释
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    
    // 移除空行
    content = content.replace(/^\s*[\r\n]/gm, '');
    
    fs.writeFileSync(filePath, content);
  } catch (error) {
    console.error('SVG 优化失败:', error.message);
  }
}

/**
 * 生成 WebP 版本
 */
function generateWebP(filePath) {
  try {
    const ext = path.extname(filePath);
    const webpPath = filePath.replace(ext, '.webp');
    
    execSync(`cwebp -q 80 "${filePath}" -o "${webpPath}"`, {
      stdio: 'ignore'
    });
    
    const webpStats = fs.statSync(webpPath);
    console.log(`🌐 生成 WebP: ${(webpStats.size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.log('ℹ️  WebP 工具不可用，跳过 WebP 生成');
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始图片优化...\n');
  
  // 检查依赖
  checkDependencies();
  console.log('');
  
  // 获取项目根目录
  const projectRoot = path.resolve(__dirname, '..');
  
  // 获取所有图片文件
  const imageFiles = getImageFiles(projectRoot);
  
  if (imageFiles.length === 0) {
    console.log('ℹ️  未找到图片文件');
    return;
  }
  
  console.log(`📁 找到 ${imageFiles.length} 个图片文件\n`);
  
  // 优化每个图片文件
  imageFiles.forEach((filePath, index) => {
    console.log(`[${index + 1}/${imageFiles.length}]`);
    optimizeImage(filePath);
    console.log('');
  });
  
  console.log('🎉 图片优化完成！');
  
  // 生成优化报告
  generateReport(imageFiles);
}

/**
 * 生成优化报告
 */
function generateReport(imageFiles) {
  console.log('\n📊 优化报告:');
  console.log('==============');
  
  const formatStats = {};
  
  imageFiles.forEach(filePath => {
    const ext = path.extname(filePath).toLowerCase();
    const stats = fs.statSync(filePath);
    
    if (!formatStats[ext]) {
      formatStats[ext] = {
        count: 0,
        totalSize: 0
      };
    }
    
    formatStats[ext].count++;
    formatStats[ext].totalSize += stats.size;
  });
  
  Object.entries(formatStats).forEach(([format, stats]) => {
    console.log(`${format}: ${stats.count} 个文件, ${(stats.totalSize / 1024).toFixed(2)} KB`);
  });
  
  console.log('==============');
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  getImageFiles,
  optimizeImage,
  generateWebP
};