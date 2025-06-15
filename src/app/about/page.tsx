import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import ReactMarkdown from 'react-markdown';
import { getAllCategories, getAllTags } from '@/lib/notion';
import Image from 'next/image';
import React from 'react';

// 博主的自我介绍（Markdown 格式）
const aboutContent = `
# 个人简介

你好！欢迎来到我的博客。我是一名资深产品经理，热爱技术，尤其关注人工智能和效率工具。我热衷于研究AI、金融理财，提升工作和生活效率。我会在这里分享知识和经验，希望对你有帮助！

## 专业技能

- **产品经理**：需求分析・产品设计・产品架构・UML
- **人工智能**：AI编程・AI智能体・AI产品经理
- **理财规划**：资产配置・保险・房地产・基金・股票
- **效率工具**：Notion・Obsidian・Logseq

## 知识管理方法论

![知识管理框架](/images/knowledge-management-framework.svg)

知识管理工具矩阵：
- Notion（中央仓库）
- Obsidian（网状链接）
- Readwise（信息聚合）

我的知识管理流程包括：
1. **输入源**：捕获AI论文、行业报告、实践案例
2. **知识仓库**：存储和组织收集的信息
3. **处理引擎**：对信息进行标签化、关联和去重
4. **价值输出**：将知识转化为博客、方案和产品设计
5. **反馈循环**：通过用户互动和效果验证优化流程

## 工作经历

我曾在大型互联网公司担任产品经理，也在互联网保险行业工作过。工作中，我经历了B端、C端、A端产品管理的全面锻炼，尤其在B端系统建设上，我曾独立负责过从0-1的大型交易系统重构，参与过多次长周期、跨多系统的项目。这些经历让我积累了丰富的产品经验，同时培养了良好的团队协作和项目管理能力。

## 联系方式

- **GitHub**: [https://github.com/dadadada-up](https://github.com/dadadada-up)
- **Email**: dadadada_up@163.com
- **WeChat**: dadadada_up

## 为什么写这个博客

- **深度思考**：写作是理清逻辑、挑战假设、固化认知的过程。
- **经验沉淀**：记录踩过的坑和验证有效的方法，为自己复盘，也为同行者提供参考。
- **开放交流**：产品之路充满未知，期待与同行、专家碰撞思想，共同探索。

## 博客聚焦方向

- **AI产品实战**：设计原则、伦理、落地挑战与规模化。
- **方法论实战**：经典框架应用、复杂场景决策、高效执行。
- **保险科技洞察**：数字化转型、创新案例（智能核保/理赔）、用户需求与合规。
- **金融产品创新**：财富科技、用户体验、风险管理。
- **效率跃迁**：高效工作流、生产力工具深度应用、目标管理。
- **跨界启发**：值得思考的产品/商业/科技洞见。

感谢您的访问，希望我们能一起不断前进！如果您有任何问题或建议，欢迎随时联系我。
`;

// 自定义组件用于处理图片渲染
const CustomImage = (props: any) => {
  return (
    <img
      src={props.src}
      alt={props.alt || ''}
      className="max-w-full h-auto rounded-lg shadow-md my-6"
    />
  );
};

export default async function About() {
  // 获取真实分类数据
  const categories = await getAllCategories();
  const tags = await getAllTags();
  
  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-8">
        {/* 主内容区 */}
        <div className="md:w-3/4">
          <div className="bg-white rounded-lg shadow p-8">
            <article className="prose prose-lg prose-blue max-w-none prose-headings:text-blue-700 prose-a:text-blue-600 prose-strong:font-bold prose-strong:text-gray-700 prose-li:my-1">
              <ReactMarkdown 
                components={{
                  img: CustomImage,
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold border-b pb-2 mb-6" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 no-underline hover:underline" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 my-4" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-4" {...props} />,
                  li: ({node, ...props}) => <li className="mb-2" {...props} />,
                  p: ({node, children, ...props}) => {
                    // 检查children中是否包含img元素
                    const containsImage = React.Children.toArray(children).some((child: any) => 
                      typeof child === 'object' && child.type === 'img'
                    );
                    
                    // 如果包含图片，使用div替代p标签
                    return containsImage ? 
                      <div className="my-4" {...props}>{children}</div> : 
                      <p className="my-4 leading-relaxed" {...props}>{children}</p>;
                  }
                }}
              >
                {aboutContent}
              </ReactMarkdown>
            </article>
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="md:w-1/4">
          <Sidebar categories={categories} tags={tags} showAuthor={false} />
        </div>
      </div>
    </Layout>
  );
} 