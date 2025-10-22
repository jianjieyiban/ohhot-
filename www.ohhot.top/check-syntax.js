const fs = require('fs');
const path = require('path');

// 读取JobCreate.jsx文件
const filePath = path.join(__dirname, 'src', 'pages', 'Job', 'JobCreate.jsx');
const content = fs.readFileSync(filePath, 'utf8');

console.log('文件长度:', content.length);
console.log('文件行数:', content.split('\n').length);

// 检查括号平衡
const openBraces = (content.match(/\{/g) || []).length;
const closeBraces = (content.match(/\}/g) || []).length;
console.log('大括号平衡:', openBraces === closeBraces ? '平衡' : `不平衡 (开: ${openBraces}, 关: ${closeBraces})`);

// 检查括号平衡
const openParens = (content.match(/\(/g) || []).length;
const closeParens = (content.match(/\)/g) || []).length;
console.log('小括号平衡:', openParens === closeParens ? '平衡' : `不平衡 (开: ${openParens}, 关: ${closeParens})`);

// 检查JSX标签平衡
const openTags = (content.match(/<[^\/][^>]*>/g) || []).length;
const closeTags = (content.match(/<\/[^>]*>/g) || []).length;
console.log('JSX标签平衡:', openTags === closeTags ? '平衡' : `不平衡 (开: ${openTags}, 关: ${closeTags})`);

// 检查文件末尾
const lastLines = content.split('\n').slice(-10).join('\n');
console.log('\n文件最后10行:');
console.log(lastLines);