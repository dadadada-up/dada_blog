# Mermaid图表渲染测试

## 用户提供的示例图表

```mermaid
graph TD
    A[GitHub Actions] -->|定时触发| B[Python脚本]
    B -->|API请求| C[Notion API]
    C -->|返回任务数据| B
    B -->|处理数据| D[任务格式化]
    D -->|生成提醒消息| E{推送渠道}
    E -->|微信| F[PushPlus]
    E -->|备用渠道| G[WxPusher]
    H[用户配置] -->|环境变量| B
    I[数据库设计] -->|结构定义| C
    
    classDef primary fill:#f9f,stroke:#333,stroke-width:2px;
    classDef secondary fill:#bbf,stroke:#333,stroke-width:1px;
    classDef tertiary fill:#dfd,stroke:#333,stroke-width:1px;
    
    class A,B primary;
    class C,D,E secondary;
    class F,G,H,I tertiary;
```

## 功能特点

✅ **图表渲染模式**（默认）：直接显示可视化图表  
✅ **双模式切换**：可切换查看"代码+图表"模式  
✅ **代码复制功能**：一键复制Mermaid源代码  
✅ **错误处理**：渲染失败时显示友好提示  
✅ **响应式设计**：适配移动端设备  

## 更多示例

### 流程图
```mermaid
flowchart LR
    A[开始] --> B{条件判断}
    B -->|是| C[执行操作A]
    B -->|否| D[执行操作B]
    C --> E[结束]
    D --> E
```

### 时序图
```mermaid
sequenceDiagram
    participant U as 用户
    participant B as 博客系统
    participant N as Notion API
    
    U->>B: 访问文章页面
    B->>N: 获取文章内容
    N-->>B: 返回Markdown数据
    B->>B: 渲染Mermaid图表
    B-->>U: 显示完整文章
```

### 甘特图
```mermaid
gantt
    title 博客开发计划
    dateFormat  YYYY-MM-DD
    section 基础功能
    文章系统       :done, a1, 2024-01-01, 2024-01-15
    精选文章       :done, a2, 2024-01-10, 2024-01-20
    section 高级功能
    Mermaid支持    :active, a3, 2024-01-20, 2024-01-25
    评论系统       :a4, 2024-01-25, 2024-02-05
    搜索功能       :a5, 2024-02-01, 2024-02-10
```

现在这些图表都会以可视化形式展示，不再是纯文本代码！ 