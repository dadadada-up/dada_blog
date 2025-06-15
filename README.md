# Dada Blog

这是一个基于Next.js和Notion API的个人博客项目。

## 部署状态

最后更新时间: 2024-11-01
版本: 1.0.1

## 功能特点

- 基于Next.js 15.3.3构建
- 使用Notion API作为内容管理系统
- 响应式设计，适配各种设备
- 支持文章分类和标签
- 内置管理后台
- 访问统计和点赞功能

## 部署说明

本项目使用Vercel进行部署。如遇到"This deployment can not be redeployed"错误，请创建新的提交后重试。

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 技术栈

- **前端框架**: Next.js 14
- **样式方案**: TailwindCSS
- **数据源**: Notion API
- **图标**: React Icons
- **日期处理**: date-fns
- **部署平台**: Vercel/GitHub Pages

## 项目结构

```
dada-blog/
├── src/                 # 源代码目录
│   ├── app/             # 应用路由
│   │   ├── admin/       # 管理后台
│   │   │   ├── posts/   # 文章管理
│   │   │   └── sync/    # Notion同步
│   │   ├── posts/       # 文章页面
│   │   ├── categories/  # 分类页面
│   │   └── about/       # 博主页面
│   ├── components/      # 组件
│   ├── lib/             # 工具库
│   └── types/           # TypeScript类型定义
├── public/              # 静态资源
└── README.md            # 项目说明
```

## 快速开始

### 环境准备

- Node.js 18+
- Notion API密钥和数据库ID

### 安装依赖

```bash
npm install
```

### 配置环境变量

在项目根目录创建`.env.local`文件，并添加以下内容：

```
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_database_id
```

### 本地开发

```bash
npm run dev
```

### 博客访问地址
博客前台：http://localhost:3000
博客后台：http://localhost:3000/admin
前台页面包括：
首页：http://localhost:3000
全部文章：http://localhost:3000/posts
分类页面：http://localhost:3000/categories
博主页面：http://localhost:3000/about
搜索页面：http://localhost:3000/search
文章详情页：http://localhost:3000/posts/[id]
标签页面：http://localhost:3000/tags/[id]
后台页面包括：
仪表盘：http://localhost:3000/admin
文章管理：http://localhost:3000/admin/posts
Notion同步：http://localhost:3000/admin/sync

### 构建静态站点

```bash
npm run build
```

## 部署

### Vercel部署

1. 在Vercel上导入该GitHub仓库
2. 配置环境变量`NOTION_API_KEY`和`NOTION_DATABASE_ID`
3. 部署

### GitHub Pages部署

1. 构建静态站点：`npm run build`
2. 将`out`目录下的内容推送到GitHub Pages分支

## Notion数据库结构

Notion数据库需要包含以下属性：

- `文档名称`(title): 文章标题
- `分类`(select): 文章分类
- `标签`(multi_select): 文章标签
- `状态`(select): 发布状态（已发布/草稿）
- `作者`(select): 作者名称
- `发布日期`(date): 发布时间
- `更新日期`(last_edited_time): 更新时间
- `原文链接`(url): 原文引用链接（可选）

## TODO

- [ ] 实现评论系统的Giscus配置界面
- [ ] 完成Notion增量同步功能
- [ ] 添加文章访问统计功能
- [ ] 添加站点地图生成
- [ ] 优化SEO配置

## 许可证

MIT
