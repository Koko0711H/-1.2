const fs = require('fs');
const content = fs.readFileSync('src/components/SpotlightHome.jsx', 'utf8');

// 查找并替换能量路径数组
const oldPaths = /const paths = \[\s*\/\/ Top thick pipe \(left to right\)\s*\[[\s\S]*?\],\s*\/\/ Main generator connection \(center to right\)\s*\[[\s\S]*?\],\s*\/\/ Side pipes \(engine block\)\s*\[[\s\S]*?\],\s*\/\/ Bottom exhaust\/system\s*\[[\s\S]*?\],\s*\/\/ Vertical pipe left\s*\[[\s\S]*?\]\s*\]/;

const newPaths = const paths = [
      // Top thick pipe (left to right) - 增加中间点使路径更连贯
      [
        {x: 0.05, y: 0.22}, {x: 0.12, y: 0.22}, {x: 0.18, y: 0.25}, 
        {x: 0.25, y: 0.28}, {x: 0.32, y: 0.28}, {x: 0.4, y: 0.32}, 
        {x: 0.45, y: 0.35}
      ],
      // Main generator connection (center to right) - 更平滑的曲线
      [
        {x: 0.35, y: 0.45}, {x: 0.4, y: 0.48}, {x: 0.45, y: 0.5}, 
        {x: 0.52, y: 0.53}, {x: 0.55, y: 0.55}, {x: 0.62, y: 0.58}, 
        {x: 0.65, y: 0.6}, {x: 0.72, y: 0.63}, {x: 0.75, y: 0.65}
      ],
      // Side pipes (engine block) - 增加垂直过渡点
      [
        {x: 0.15, y: 0.65}, {x: 0.18, y: 0.62}, {x: 0.22, y: 0.58}, 
        {x: 0.25, y: 0.55}, {x: 0.3, y: 0.55}, {x: 0.35, y: 0.57}, 
        {x: 0.4, y: 0.58}, {x: 0.45, y: 0.6}
      ],
      // Bottom exhaust/system - 更平滑的底部路径
      [
        {x: 0.2, y: 0.85}, {x: 0.28, y: 0.83}, {x: 0.35, y: 0.8}, 
        {x: 0.42, y: 0.82}, {x: 0.5, y: 0.85}, {x: 0.58, y: 0.83}, 
        {x: 0.65, y: 0.8}
      ],
      // Vertical pipe left - 增加水平过渡
      [
        {x: 0.1, y: 0.3}, {x: 0.1, y: 0.35}, {x: 0.1, y: 0.4}, 
        {x: 0.1, y: 0.45}, {x: 0.1, y: 0.5}, {x: 0.1, y: 0.55}, 
        {x: 0.1, y: 0.6}
      ]
    ];

const updatedContent = content.replace(oldPaths, newPaths);
fs.writeFileSync('src/components/SpotlightHome.jsx', updatedContent);
console.log('Updated energy paths with more points for smoother flow');
