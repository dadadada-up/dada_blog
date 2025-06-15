'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { syncNotionData, getLastSyncInfo } from '@/lib/notion';

interface SyncLog {
  date: string;
  status: string;
  message: string;
}

export default function NotionSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{success: boolean; message: string} | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  
  // 从环境变量获取API密钥和数据库ID
  const apiKey = process.env.NEXT_PUBLIC_NOTION_API_KEY || "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"; // 仅用于界面展示
  const databaseId = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID || "1c1ed4b7aaea81ed9e46fd7f0ee61cd5"; // 仅用于界面展示
  
  // 加载同步历史记录
  useEffect(() => {
    // 获取最近的同步信息
    const lastSyncInfo = getLastSyncInfo();
    if (lastSyncInfo) {
      // 将最近的同步信息添加到日志中
      setSyncLogs([
        {
          date: new Date(lastSyncInfo.time).toLocaleString('zh-CN'),
          status: lastSyncInfo.status,
          message: lastSyncInfo.message
        },
        // 添加一些模拟数据以展示历史记录
        {
          date: '2024-01-18 08:00',
          status: '成功',
          message: '同步完成，更新3篇文章',
        },
        {
          date: '2024-01-17 08:00',
          status: '成功',
          message: '同步完成，更新1篇文章',
        },
        {
          date: '2024-01-16 08:00',
          status: '成功',
          message: '同步完成，无更新',
        },
        {
          date: '2024-01-15 08:00',
          status: '成功',
          message: '同步完成，更新2篇文章',
        }
      ]);
    }
  }, []);
  
  // 执行同步操作
  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    
    try {
      const result = await syncNotionData();
      setSyncResult(result);
      
      // 更新同步日志
      const newLog = {
        date: new Date().toLocaleString('zh-CN'),
        status: result.success ? '成功' : '失败',
        message: result.message
      };
      
      setSyncLogs([newLog, ...syncLogs]);
    } catch (error) {
      console.error('同步过程中出错:', error);
      setSyncResult({
        success: false,
        message: `同步失败: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert('已复制到剪贴板');
      },
      (err) => {
        alert('复制失败: ' + err);
      }
    );
  };
  
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">🔄 Notion数据同步</h1>
      
      {/* API配置 */}
      <div className="mb-8 bg-white p-6 rounded-lg border">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Notion API密钥：</label>
            <button
              onClick={() => copyToClipboard(apiKey)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              [复制]
            </button>
          </div>
          <div className="border rounded-md px-3 py-2 bg-gray-50">
            {apiKey.slice(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.slice(-4)}
          </div>
          <p className="text-xs text-gray-500 mt-1">密钥已隐藏，点击[复制]可复制完整密钥</p>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Notion数据库ID：</label>
            <button
              onClick={() => copyToClipboard(databaseId)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              [复制]
            </button>
          </div>
          <div className="border rounded-md px-3 py-2 bg-gray-50">
            {databaseId}
          </div>
        </div>
        
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`${
            isSyncing
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white px-4 py-2 rounded-md flex items-center`}
        >
          {isSyncing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              同步中...
            </>
          ) : (
            '立即同步'
          )}
        </button>
        
        {/* 同步结果提示 */}
        {syncResult && (
          <div className={`mt-4 p-3 rounded-md ${
            syncResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {syncResult.message}
          </div>
        )}
      </div>
      
      {/* 同步日志 */}
      <div>
        <h2 className="text-xl font-bold mb-4">📝 同步日志</h2>
        <div className="bg-white border rounded-lg overflow-hidden">
          {syncLogs.length > 0 ? (
            <ul className="divide-y">
              {syncLogs.map((log, index) => (
                <li key={index} className="p-4 flex items-center">
                  <span className="text-gray-500 min-w-[180px]">{log.date}</span>
                  <span className={`px-2 py-1 text-xs rounded-full mr-3 ${
                    log.status === '成功' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    [{log.status}]
                  </span>
                  <span>{log.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              暂无同步记录
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 