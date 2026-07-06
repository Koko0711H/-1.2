const fs = require('fs');
const content = fs.readFileSync('src/components/SpotlightHome.jsx', 'utf8');

let updatedContent = content;

// 1. 增加能量流动速度到最快
updatedContent = updatedContent.replace(
  /const speed = 0\.02 \/\/ Even faster flow for more dynamic effect/g,
  'const speed = 0.025 // Maximum flow speed for dynamic energy'
);

// 2. 增加能量脉冲数量到最多
updatedContent = updatedContent.replace(
  /const totalPoints = 8 \/\/ Even more pulses for continuity/g,
  'const totalPoints = 10 // Maximum pulses for continuous flow'
);

// 3. 优化能量脉冲的发光效果
updatedContent = updatedContent.replace(
  /ctx\.strokeStyle = 'rgba\(255, 120, 40, 0\.7\)'/g,
  "ctx.strokeStyle = 'rgba(255, 130, 50, 0.8)'"
);

updatedContent = updatedContent.replace(
  /ctx\.strokeStyle = 'rgba\(255, 200, 80, 0\.95\)'/g,
  "ctx.strokeStyle = 'rgba(255, 210, 90, 1)'"
);

// 4. 增加能量脉冲的发光半径
updatedContent = updatedContent.replace(
  /ctx\.shadowBlur = 40/g,
  'ctx.shadowBlur = 45'
);

// 5. 增加脉冲大小和移动速度
updatedContent = updatedContent.replace(
  /const pulseRadius = 12 \+ Math\.sin\(time \* 0\.02\) \* 4/g,
  'const pulseRadius = 14 + Math.sin(time * 0.025) * 5'
);

updatedContent = updatedContent.replace(
  /const pulseOpacity = 0\.9 \+ Math\.sin\(time \* 0\.03\) \* 0\.1/g,
  'const pulseOpacity = 0.95 + Math.sin(time * 0.035) * 0.05'
);

// 6. 增加能量路径的宽度和发光
updatedContent = updatedContent.replace(
  /ctx\.lineWidth = 12/g,
  'ctx.lineWidth = 14'
);

updatedContent = updatedContent.replace(
  /ctx\.lineWidth = 4/g,
  'ctx.lineWidth = 5'
);

// 7. 增加能量脉冲的拖尾效果
updatedContent = updatedContent.replace(
  /ctx\.shadowColor = 'rgba\(255, 100, 50, 1\)'/g,
  "ctx.shadowColor = 'rgba(255, 110, 60, 1)'"
);

fs.writeFileSync('src/components/SpotlightHome.jsx', updatedContent);
console.log('Enhanced energy effects with maximum speed and continuity');
