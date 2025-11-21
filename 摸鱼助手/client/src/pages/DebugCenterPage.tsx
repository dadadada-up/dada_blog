import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const DebugCenterPage = () => {
  const [selectedMessageType, setSelectedMessageType] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [debugRecords, setDebugRecords] = useState<any[]>([]);
  
  // 消息类型映射
  const messageTypes = {
    morning: { title: "早间休假倒计时与打气", buttonText: "发送早间打气" },
    noon: { title: "午间喝水提醒", buttonText: "发送午间提醒" },
    afternoon: { title: "下午打气", buttonText: "发送下午打气" },
    evening: { title: "下班前激励语", buttonText: "发送下班激励" }
  };
  
  // 发送消息
  const sendMessage = async () => {
    if (!selectedMessageType) {
      toast.error("请先选择消息类型");
      return;
    }
    
    setIsSending(true);
    
    try {
      const response = await fetch('http://localhost:3002/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageType: selectedMessageType }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("✅ 已发送至群'摸鱼助手'");
        // 刷新记录
        fetchDebugRecords();
      } else {
        toast.error("❌ 发送失败，请检查网络或Webhook配置");
      }
    } catch (error) {
      console.error("发送消息失败:", error);
      toast.error("❌ 发送失败，请检查网络或Webhook配置");
    } finally {
      setIsSending(false);
    }
  };
  
  // 获取调试记录
  const fetchDebugRecords = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/debug-records');
      const result = await response.json();
      
      if (result.success) {
        setDebugRecords(result.data);
      }
    } catch (error) {
      console.error("获取调试记录失败:", error);
    }
  };
  
  // 组件挂载时获取记录
  useEffect(() => {
    fetchDebugRecords();
  }, []);
  
  // 获取按钮文本
  const getButtonText = () => {
    if (!selectedMessageType) return "请选择消息类型";
    return messageTypes[selectedMessageType as keyof typeof messageTypes]?.buttonText || "发送消息";
  };
  
  return (
    <div className="page-container">
      <h2 className="page-title">调试中心</h2>
      
      <div className="section">
        <h3>消息类型</h3>
        <div className="message-type-cards">
          {Object.entries(messageTypes).map(([key, value]) => (
            <div 
              key={key}
              className={`message-type-card ${selectedMessageType === key ? 'selected' : ''}`}
              onClick={() => setSelectedMessageType(key)}
            >
              <h4>{value.title}</h4>
            </div>
          ))}
        </div>
      </div>
      
      <div className="section">
        <button 
          className="send-button"
          onClick={sendMessage}
          disabled={isSending || !selectedMessageType}
        >
          {isSending ? "发送中..." : getButtonText()}
        </button>
      </div>
      
      <div className="section">
        <h3>最近5条记录</h3>
        {debugRecords.length === 0 ? (
          <p className="no-records">暂无记录</p>
        ) : (
          <div className="debug-records">
            {debugRecords.map((record) => (
              <div key={record.id} className="record-item">
                <div className="record-header">
                  <span className="record-type">{record.messageTitle}</span>
                  <span className={`record-status ${record.success ? 'success' : 'failed'}`}>
                    {record.success ? '成功' : '失败'}
                  </span>
                </div>
                <div className="record-time">
                  {new Date(record.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugCenterPage;