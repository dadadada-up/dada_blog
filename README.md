# 达达博客系统

基于Next.js和Notion API的静态博客系统，支持文章管理、分类归档、评论点赞等功能。

## 功能特点

- 🚀 基于Next.js的静态生成，性能优异
- 📝 使用Notion作为CMS，维护内容更便捷
- 📊 简洁美观的管理后台
- 🔄 支持定时/手动同步Notion数据
- 💬 集成评论系统（基于GitHub Discussions的Giscus）
- 👍 支持文章点赞（基于localStorage）
- 🔍 支持文章搜索功能
- 📱 响应式设计，移动端友好

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
cd dada-blog && npm run dev
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
