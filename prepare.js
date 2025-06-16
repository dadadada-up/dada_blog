// 确保构建环境拥有所有必要的依赖
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('检查必要依赖是否已安装...');
  
  // 检查是否使用yarn或npm
  const hasYarnLock = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));
  const packageManager = hasYarnLock ? 'yarn' : 'npm';
  
  console.log(`使用包管理器: ${packageManager}`);
  
  // 检查node_modules/tailwindcss目录是否存在
  const tailwindPath = path.join(process.cwd(), 'node_modules/tailwindcss');
  const tailwindExists = fs.existsSync(tailwindPath);
  
  // 检查node_modules/styled-jsx目录是否存在
  const styledJsxPath = path.join(process.cwd(), 'node_modules/styled-jsx');
  const styledJsxStylePath = path.join(process.cwd(), 'node_modules/styled-jsx/style');
  const styledJsxExists = fs.existsSync(styledJsxPath);
  const styledJsxStyleExists = fs.existsSync(styledJsxStylePath);
  
  // 检查postcss是否正确安装
  const postcssPath = path.join(process.cwd(), 'node_modules/postcss');
  const postcssLibPath = path.join(postcssPath, 'lib/postcss.js');
  const postcssExists = fs.existsSync(postcssPath) && fs.existsSync(postcssLibPath);
  
  // 检查node_modules/next/node_modules/postcss是否存在
  const nextPostcssPath = path.join(process.cwd(), 'node_modules/next/node_modules/postcss');
  const nextPostcssLibPath = path.join(process.cwd(), 'node_modules/next/node_modules/postcss/lib/postcss.js');
  const nextPostcssExists = fs.existsSync(nextPostcssPath);
  
  // 安装缺失的依赖
  const missingDeps = !tailwindExists || !styledJsxExists || !styledJsxStyleExists || !postcssExists;
  if (missingDeps || !nextPostcssExists) {
    console.log('发现缺失的依赖，正在安装...');
    
    // 如果postcss不存在或不完整
    if (!postcssExists) {
      console.log('修复 postcss...');
      if (packageManager === 'yarn') {
        execSync('yarn add postcss@8.4.31 --exact', { stdio: 'inherit' });
      } else {
        execSync('npm install postcss@8.4.31 --save-exact', { stdio: 'inherit' });
      }
    }
    
    if (!tailwindExists) {
      console.log('安装 tailwindcss...');
      if (packageManager === 'yarn') {
        execSync('yarn add tailwindcss autoprefixer', { stdio: 'inherit' });
      } else {
        execSync('npm install tailwindcss autoprefixer', { stdio: 'inherit' });
      }
    }
    
    if (!styledJsxExists || !styledJsxStyleExists) {
      console.log('安装 styled-jsx@5.0.0...');
      if (packageManager === 'yarn') {
        execSync('yarn add styled-jsx@5.0.0 --exact', { stdio: 'inherit' });
      } else {
        execSync('npm install styled-jsx@5.0.0 --save-exact', { stdio: 'inherit' });
      }
      
      // 尝试修复styled-jsx/style
      if (fs.existsSync(styledJsxPath) && !fs.existsSync(styledJsxStylePath)) {
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
    
    // 如果next的postcss模块不存在，尝试创建符号链接
    if (!nextPostcssExists && postcssExists) {
      console.log('修复Next.js中的postcss依赖...');
      const nextNodeModulesPath = path.join(process.cwd(), 'node_modules/next/node_modules');
      
      try {
        // 确保目录存在
        if (!fs.existsSync(nextNodeModulesPath)) {
          fs.mkdirSync(nextNodeModulesPath, { recursive: true });
        }
        
        // 如果存在但是不完整，先删除
        if (fs.existsSync(nextPostcssPath) && !fs.existsSync(nextPostcssLibPath)) {
          console.log('删除不完整的postcss...');
          fs.rmSync(nextPostcssPath, { recursive: true, force: true });
        }
        
        // 创建符号链接或复制文件
        if (!fs.existsSync(nextPostcssPath)) {
          console.log('创建postcss符号链接...');
          if (process.platform === 'win32') {
            // Windows上复制整个目录
            fs.cpSync(postcssPath, nextPostcssPath, { recursive: true });
          } else {
            // Unix系统创建符号链接
            fs.symlinkSync(postcssPath, nextPostcssPath, 'dir');
          }
          console.log('Next.js postcss依赖修复完成');
        }
      } catch (linkError) {
        console.warn('创建符号链接失败，尝试复制文件:', linkError);
        // 如果创建符号链接失败，尝试复制文件
        try {
          fs.cpSync(postcssPath, nextPostcssPath, { recursive: true });
          console.log('成功复制postcss文件到Next.js目录');
        } catch (cpError) {
          console.error('无法复制postcss文件:', cpError);
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