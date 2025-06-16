#!/bin/bash
echo "调整TypeScript配置为最小兼容模式..."

# 备份原始tsconfig.json
if [ -f tsconfig.json ]; then
    echo "备份原始tsconfig.json"
    cp tsconfig.json tsconfig.original.json
    
    # 创建一个最小的有效tsconfig.json
    echo '{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["empty.ts", "src"],
  "exclude": ["node_modules"]
}' > tsconfig.json
    
    echo "创建了最小的TypeScript配置文件"
else
    echo "未找到tsconfig.json文件，创建一个最小配置"
    echo '{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["empty.ts", "src"],
  "exclude": ["node_modules"]
}' > tsconfig.json
fi

# 确保存在一个空的TypeScript文件
echo '// 空的TypeScript文件，仅用于满足构建需求
export {};' > empty.ts

echo "TypeScript配置已调整为最小兼容模式" 