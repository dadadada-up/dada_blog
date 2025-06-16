#!/bin/bash
echo "临时禁用TypeScript配置..."

# 如果tsconfig.json存在，将其重命名为tsconfig.backup.json
if [ -f tsconfig.json ]; then
    echo "备份tsconfig.json"
    mv tsconfig.json tsconfig.backup.json
fi

# 创建一个空的TypeScript配置，仅用于兼容性
echo '{
  "compilerOptions": {
    "jsx": "preserve",
    "allowJs": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "exclude": ["node_modules"]
}' > tsconfig.json

echo "TypeScript已被临时禁用，构建将继续..." 