# 钉钉群消息推送机器人

一个基于React.js和Node.js + Express的钉钉群消息推送机器人项目。

## 项目结构

```
.
├── client/          # 前端React应用
├── server/          # 后端Node.js服务
└── README.md
```

## 技术栈

- 前端框架：React.js (TypeScript)
- 后端服务：Node.js + Express
- 消息推送：钉钉机器人Webhook API

## 功能特性

1. **定时任务页**：展示消息模板预览和发送日志
2. **调试中心页**：支持手动发送四种类型的消息并查看发送记录
3. **设置页**：配置钉钉机器人和定时任务参数

## 消息类型

- 早间休假倒计时与打气
- 午间喝水提醒
- 下午打气
- 下班前激励语

## 安装与运行

### 后端服务

```bash
cd server
npm install
npm run dev
```

服务将运行在 `http://localhost:3001`

### 前端应用

```bash
cd client
npm install
npm run dev
```

应用将运行在 `http://localhost:5173`

### 同时运行前后端

在根目录下执行：

```bash
npm install
npm run dev
```

## API接口

### 发送消息

```
POST /api/send-message
```

参数：
- `messageType`: 消息类型 (morning, noon, afternoon, evening)

### 获取调试记录

```
GET /api/debug-records
```

## 钉钉机器人配置

Webhook URL: `https://oapi.dingtalk.com/robot/send?access_token=3d5f71dbd220d5e946f56c9e35ee8b9f1c5c168c6a785550224ca8833fdce56b`

## 开发说明

1. 前端使用React Router进行页面路由
2. 使用react-toastify显示发送结果反馈
3. 后端使用内存存储调试记录（实际项目中建议使用数据库）
4. 前后端通过RESTful API进行数据交互