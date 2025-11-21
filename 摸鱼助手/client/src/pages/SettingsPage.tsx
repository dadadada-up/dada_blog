import React from 'react';

const SettingsPage = () => {
  return (
    <div className="page-container">
      <h2 className="page-title">设置</h2>
      <div className="section">
        <h3>钉钉机器人配置</h3>
        <div className="form-group">
          <label>Webhook URL:</label>
          <input 
            type="text" 
            defaultValue="https://oapi.dingtalk.com/robot/send?access_token=3d5f71dbd220d5e946f56c9e35ee8b9f1c5c168c6a785550224ca8833fdce56b"
            className="form-input"
            readOnly
          />
        </div>
        <div className="form-group">
          <label>群名称:</label>
          <input 
            type="text" 
            defaultValue="摸鱼助手"
            className="form-input"
          />
        </div>
      </div>
      
      <div className="section">
        <h3>定时任务设置</h3>
        <div className="form-group">
          <label>早间消息时间:</label>
          <input 
            type="time" 
            defaultValue="09:00"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>午间消息时间:</label>
          <input 
            type="time" 
            defaultValue="12:30"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>下午消息时间:</label>
          <input 
            type="time" 
            defaultValue="15:00"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>下班消息时间:</label>
          <input 
            type="time" 
            defaultValue="17:00"
            className="form-input"
          />
        </div>
      </div>
      
      <div className="section">
        <button className="save-button">保存设置</button>
      </div>
    </div>
  );
};

export default SettingsPage;