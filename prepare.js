// 确保构建环境拥有所有必要的依赖
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('检查必要依赖是否已安装...');
  
  // 检查node_modules/tailwindcss目录是否存在
  const tailwindPath = path.join(process.cwd(), 'node_modules/tailwindcss');
  const tailwindExists = fs.existsSync(tailwindPath);
  
  // 检查node_modules/styled-jsx目录是否存在
  const styledJsxPath = path.join(process.cwd(), 'node_modules/styled-jsx');
  const styledJsxStylePath = path.join(process.cwd(), 'node_modules/styled-jsx/style');
  const styledJsxExists = fs.existsSync(styledJsxPath);
  const styledJsxStyleExists = fs.existsSync(styledJsxStylePath);
  
  // 安装缺失的依赖
  if (!tailwindExists || !styledJsxExists || !styledJsxStyleExists) {
    console.log('发现缺失的依赖，正在安装...');
    
    if (!tailwindExists) {
      console.log('安装 tailwindcss...');
      execSync('npm install tailwindcss postcss autoprefixer --no-fund --no-audit', { stdio: 'inherit' });
    }
    
    if (!styledJsxExists || !styledJsxStyleExists) {
      console.log('安装 styled-jsx@5.0.0...');
      execSync('npm install styled-jsx@5.0.0 --no-fund --no-audit', { stdio: 'inherit' });
      
      // 强制创建必要的目录
      if (!fs.existsSync(styledJsxStylePath)) {
        console.log('尝试修复styled-jsx/style...');
        // 检查styled-jsx是否包含dist目录
        const distPath = path.join(styledJsxPath, 'dist');
        if (fs.existsSync(distPath)) {
          console.log('从dist目录复制style...');
          // 确保style目录存在
          if (!fs.existsSync(styledJsxStylePath)) {
            fs.mkdirSync(styledJsxStylePath, { recursive: true });
          }
          
          // 如果有dist/style.js，则复制到style目录
          const distStylePath = path.join(distPath, 'style.js');
          if (fs.existsSync(distStylePath)) {
            fs.copyFileSync(distStylePath, path.join(styledJsxStylePath, 'index.js'));
            console.log('style.js已复制到style/index.js');
          }
        }
      }
    }
  } else {
    console.log('所有依赖已正确安装');
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