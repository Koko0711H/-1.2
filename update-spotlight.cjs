const fs = require('fs');
const content = fs.readFileSync('src/components/SpotlightHome.jsx', 'utf8');

let updatedContent = content;

// 1. 增加能量流动速度
updatedContent = updatedContent.replace(
  /const speed = 0\.008 \/\/ Faster flow/g,
  'const speed = 0.015 // Much faster flow'
);

// 2. 增加能量脉冲数量
updatedContent = updatedContent.replace(
  /const totalPoints = 5 \/\/ More pulses per path/g,
  'const totalPoints = 8 // Even more pulses for continuity'
);

// 3. 增加能量脉冲的透明度和发光效果
updatedContent = updatedContent.replace(
  /ctx\.strokeStyle = 'rgba\(255, 80, 20, 0\.4\)'/g,
  "ctx.strokeStyle = 'rgba(255, 100, 30, 0.6)'"
);

updatedContent = updatedContent.replace(
  /ctx\.strokeStyle = 'rgba\(255, 150, 50, 0\.8\)'/g,
  "ctx.strokeStyle = 'rgba(255, 180, 70, 0.9)'"
);

// 4. 增加能量脉冲的发光效果
updatedContent = updatedContent.replace(
  /ctx\.shadowBlur = 25/g,
  'ctx.shadowBlur = 35'
);

// 5. 增加脉冲的大小和移动速度
updatedContent = updatedContent.replace(
  /const pulseRadius = 8 \+ Math\.sin\(time \* 0\.01\) \* 2/g,
  'const pulseRadius = 10 + Math.sin(time * 0.015) * 3'
);

updatedContent = updatedContent.replace(
  /const pulseOpacity = 0\.7 \+ Math\.sin\(time \* 0\.02\) \* 0\.3/g,
  'const pulseOpacity = 0.8 + Math.sin(time * 0.025) * 0.2'
);

fs.writeFileSync('src/components/SpotlightHome.jsx', updatedContent);
console.log('Updated SpotlightHome.jsx with enhanced energy effects');
