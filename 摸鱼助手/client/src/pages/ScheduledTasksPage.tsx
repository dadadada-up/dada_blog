import React from 'react';

const ScheduledTasksPage = () => {
  return (
    <div className="page-container">
      <h2 className="page-title">定时任务</h2>
      
      <div className="section">
        <h3>消息模版预览</h3>
        <div className="message-templates">
          <div className="template-card">
            <h4>早间休假倒计时与打气</h4>
            <p>早上好呀～今天是 **6月25日周二**，距离下一个小长假 **中秋节** 还有 **85天**！<br/>
            深呼吸，伸个懒腰，今天的 KPI 也拦不住闪闪发光的你～</p>
          </div>
          
          <div className="template-card">
            <h4>午间喝水提醒</h4>
            <p>叮咚！你的水杯在召唤你～<br/>
            12:30 啦，起来走动走动，顺便干掉 300 ml 水，给大脑也洗个澡吧！</p>
          </div>
          
          <div className="template-card">
            <h4>下午打气</h4>
            <p>15:00 的困意是宇宙的黑洞，但咖啡和梦想可以拯救世界！<br/>
            再坚持 2 小时，今天的王者就是你～</p>
          </div>
          
          <div className="template-card">
            <h4>下班前激励语</h4>
            <p>17:00 打卡倒计时！<br/>
            把今天的烦恼留在工位，把快乐装进背包，下班见～</p>
          </div>
        </div>
      </div>
      
      <div className="section">
        <h3>发送日志查看</h3>
        <div className="log-placeholder">
          <p>暂无发送日志</p>
        </div>
      </div>
    </div>
  );
};

export default ScheduledTasksPage;