const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 存储调试记录的内存数组（实际项目中应使用数据库）
let debugRecords = [];

// 钉钉机器人Webhook URL
const DINGTALK_WEBHOOK = 'https://oapi.dingtalk.com/robot/send?access_token=3d5f71dbd220d5e946f56c9e35ee8b9f1c5c168c6a785550224ca8833fdce56b';

// DeepSeek API配置
const DEEPSEEK_API_KEY = 'sk-bbf6c5e9427e4d9f9e3c2fea36e08fa4';
const openai = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

// 节假日数据
const holidays = [
  { name: "元旦", month: 1, day: 1 },
  { name: "春节", month: 2, day: 10 },
  { name: "清明节", month: 4, day: 4 },
  { name: "劳动节", month: 5, day: 1 },
  { name: "端午节", month: 6, day: 10 },
  { name: "中秋节", month: 9, day: 15 },
  { name: "国庆节", month: 10, day: 1 }
];

// 计算距离下一个休假日的天数（包括周末）
function daysUntilNextHoliday() {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // 创建今年所有节假日的日期对象
  const upcomingHolidays = holidays.map(holiday => {
    const date = new Date(currentYear, holiday.month - 1, holiday.day);
    return { ...holiday, date };
  });
  
  // 过滤出今年还未到的节假日
  const futureHolidays = upcomingHolidays.filter(holiday => holiday.date > today);
  
  // 计算本周末的日期（周六）
  const nextSaturday = new Date(today);
  const daysUntilSaturday = 6 - today.getDay(); // 0是周日，6是周六
  nextSaturday.setDate(today.getDate() + daysUntilSaturday);
  
  // 如果今年没有未到的节假日，则考虑明年的第一个节假日
  if (futureHolidays.length === 0) {
    const nextYearFirstHoliday = { ...holidays[0], date: new Date(currentYear + 1, holidays[0].month - 1, holidays[0].day) };
    
    // 比较下一个周六和下一个节假日哪个更近
    if (nextSaturday < nextYearFirstHoliday.date) {
      const timeDiff = nextSaturday.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return { name: "周末", days: daysDiff };
    } else {
      const timeDiff = nextYearFirstHoliday.date.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return { name: nextYearFirstHoliday.name, days: daysDiff };
    }
  }
  
  // 找到最近的一个节假日
  const nextHoliday = futureHolidays[0];
  
  // 比较下一个周六和下一个节假日哪个更近
  if (nextSaturday < nextHoliday.date) {
    const timeDiff = nextSaturday.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return { name: "周末", days: daysDiff };
  } else {
    const timeDiff = nextHoliday.date.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return { name: nextHoliday.name, days: daysDiff };
  }
}

// 格式化日期
function formatDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  return `${year}年${month}月${day}日 ${weekday}`;
}

// 生成动态消息内容
function generateMessageContent(messageType) {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentDate = formatDate(now);
  const nextHoliday = daysUntilNextHoliday();
  
  // 根据当前小时数生成不同的问候语
  const hour = now.getHours();
  let timeGreeting = '';
  if (hour < 6) timeGreeting = '🌙 夜猫子，这么晚还不睡？';
  else if (hour < 9) timeGreeting = '🌅 早起的鸟儿有虫吃！';
  else if (hour < 12) timeGreeting = '🌞 上午好，元气满满！';
  else if (hour < 14) timeGreeting = '🍽️ 午饭时间到！';
  else if (hour < 18) timeGreeting = '☕ 下午茶时间！';
  else if (hour < 22) timeGreeting = '🌇 下班倒计时！';
  else timeGreeting = '😴 该休息啦！';
  
  switch (messageType) {
    case 'morning':
      // 生成有趣的星期相关语句
      const weekdays = ['周一综合症？不存在的！', '周二加油冲鸭！', '周三努力奋斗！', '周四坚持就是胜利！', '周五摸鱼快乐！', '周六放松一下～', '周日享受生活～'];
      const todayIndex = now.getDay();
      const weekdayMessage = weekdays[todayIndex];
      
      return `【摸鱼时间】${timeGreeting}

📅 ${currentDate}
🎉 距离下一个休假日(${nextHoliday.name})还有${nextHoliday.days}天

${weekdayMessage}

🎯 今天的 KPI 也拦不住闪闪发光的你
💪 摸鱼一下，更有干劲！
\n 🎵 今日BGM推荐：元气满满进行曲`;
    
    case 'noon':
      // 根据当前分钟数生成有趣的喝水提醒
      const minutes = now.getMinutes();
      const waterTips = [
        '💧 喝水小贴士：一天8杯水，健康你我他',
        '🥤 喝水小贴士：温水最养胃，记得慢慢喝',
        '🚰 喝水小贴士：饭前饭后半小时喝水最健康',
        '🌊 喝水小贴士：小口频饮比大口猛灌更有效'
      ];
      const tip = waterTips[minutes % waterTips.length];
      
      return `【摸鱼提醒】叮咚！你的水杯在召唤你～ 🥤

⏰ ${currentTime} | ${currentDate}

${tip}

🚶 起来走动走动，活动筋骨
🧃 顺便干掉 300ml 水，给大脑也洗个澡吧
💚 摸鱼也要注意健康哦～
\n 🎵 今日午间单曲循环：放松小调`;
    
    case 'afternoon':
      // 根据当前时间生成不同的下午鼓励语
      const afternoonMessages = [
        '☕ 咖啡续命，梦想加油！',
        '⚡ 电量不足？来点下午茶充电吧！',
        '🌈 困意来袭？想想下班后的快乐时光！',
        '🚀 困了累了？想想升职加薪走上人生巅峰！'
      ];
      const afternoonMsg = afternoonMessages[(hour - 12) % afternoonMessages.length];
      
      return `【摸鱼鼓励】下午加油！ 💪

⏰ ${currentTime} | ${currentDate}

${afternoonMsg}

⏳ 再坚持一会儿，今天的王者就是你
🔥 摸鱼也要努力工作！
\n 🎵 今日提神神曲：战斗进行曲`;
    
    case 'evening':
      // 根据当前时间生成不同的下班提醒
      const eveningMessages = [
        '🎊 终于要下班啦！收拾东西准备撤退！',
        '🎉 下班时间到！快乐时光即将开始！',
        '🎈 工作结束！该好好犒劳自己了！',
        '🌙 一天辛苦了！该休息充电啦！'
      ];
      const eveningMsg = eveningMessages[(hour - 17) % eveningMessages.length];
      
      return `【摸鱼结束】下班啦！ 🎉

⏰ ${currentTime} | ${currentDate}

${eveningMsg}

🗑️ 把今天的烦恼留在工位
🎒 把快乐装进背包
😄 下班见～
💪 摸鱼了一天，辛苦了！
\n 🎵 今日下班BGM：轻松愉快进行曲`;
    
    default:
      return `【摸鱼助手】${timeGreeting}

⏰ 时间：${currentTime}
📅 日期：${currentDate}

 enjoy your work and life! 🎵`;
  }
}

// AI对话函数
async function chatWithAI(question) {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你是一个 helpful 的助手，正在钉钉群聊中与用户对话。请用简洁明了的语言回答问题。" },
        { role: "user", content: question }
      ],
      stream: false,
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('AI对话错误:', error);
    return '抱歉，我暂时无法回答这个问题，请稍后再试。';
  }
}

// 发送钉钉消息的函数
async function sendDingTalkMessage(messageType) {
  // 生成动态消息内容
  const content = generateMessageContent(messageType);
  
  const messageData = {
    msgtype: "text",
    text: {
      content: content
    }
  };

  try {
    const response = await axios.post(DINGTALK_WEBHOOK, messageData);
    return {
      success: response.status === 200,
      data: response.data
    };
  } catch (error) {
    console.error('发送钉钉消息失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// API路由

// 发送消息接口
app.post('/api/send-message', async (req, res) => {
  try {
    const { messageType } = req.body;
    
    // 发送消息
    const result = await sendDingTalkMessage(messageType);
    
    // 消息类型标题映射
    const messageTitles = {
      morning: "早间休假倒计时与打气",
      noon: "午间喝水提醒",
      afternoon: "下午打气",
      evening: "下班前激励语"
    };
    
    // 记录调试信息
    const record = {
      id: Date.now(),
      messageType: messageType,
      messageTitle: messageTitles[messageType] || messageType,
      timestamp: new Date().toISOString(),
      success: result.success,
      response: result.data || result.error
    };
    
    // 添加到记录列表开头并保持最多5条记录
    debugRecords.unshift(record);
    if (debugRecords.length > 5) {
      debugRecords = debugRecords.slice(0, 5);
    }
    
    res.json({
      success: result.success,
      message: result.success ? '消息发送成功' : '消息发送失败',
      data: record
    });
  } catch (error) {
    console.error('发送消息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 处理钉钉机器人回调消息接口
app.post('/api/dingtalk/callback', async (req, res) => {
  try {
    const { text, senderStaffId, senderNick, senderId, chatbotUserId } = req.body;
    
    // 检查消息是否包含@机器人的标识
    if (text && text.includes('@' + chatbotUserId)) {
      // 提取用户问题（去除@机器人部分）
      const question = text.replace('@' + chatbotUserId, '').trim();
      
      if (question) {
        // 调用AI对话函数
        const aiResponse = await chatWithAI(question);
        
        // 发送AI回复到钉钉群
        const messageData = {
          msgtype: "text",
          text: {
            content: `@${senderNick} ${aiResponse}`
          },
          at: {
            atUserIds: [senderStaffId || senderId]
          }
        };
        
        await axios.post(DINGTALK_WEBHOOK, messageData);
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('处理钉钉消息错误:', error);
    res.status(500).send('Error');
  }
});

// 获取调试记录接口
app.get('/api/debug-records', (req, res) => {
  res.json({
    success: true,
    data: debugRecords
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`钉钉机器人服务器运行在端口 ${PORT}`);
});

module.exports = app;