// 确保构建环境拥有所有必要的依赖
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('检查TailwindCSS是否已安装...');
  
  // 检查node_modules/tailwindcss目录是否存在
  const tailwindPath = path.join(process.cwd(), 'node_modules/tailwindcss');
  const exists = fs.existsSync(tailwindPath);
  
  if (!exists) {
    console.log('TailwindCSS未安装，正在安装...');
    execSync('npm install tailwindcss postcss autoprefixer --no-fund --no-audit', { stdio: 'inherit' });
  } else {
    console.log('TailwindCSS已安装');
  }
  
  // 检查postcss.config.js是否存在
  const postcssConfigPath = path.join(process.cwd(), 'postcss.config.js');
  if (!fs.existsSync(postcssConfigPath)) {
    console.log('创建postcss.config.js...');
    const postcssConfig = `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
    fs.writeFileSync(postcssConfigPath, postcssConfig);
  }
  
  console.log('构建准备完成！');
} catch (error) {
  console.error('准备构建时出错:', error);
  process.exit(1);
} 