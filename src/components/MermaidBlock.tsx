'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MermaidBlockProps {
  code: string;
}

const MermaidBlock: React.FC<MermaidBlockProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [mermaid, setMermaid] = useState<any>(null);

  useEffect(() => {
    // 动态导入mermaid
    const loadMermaid = async () => {
      try {
        const mermaidModule = await import('mermaid');
        const mermaidInstance = mermaidModule.default;
        
        // 配置mermaid
        mermaidInstance.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#1f2937',
            primaryBorderColor: '#e5e7eb',
            lineColor: '#6b7280',
            secondaryColor: '#f3f4f6',
            tertiaryColor: '#ffffff'
          }
        });
        
        setMermaid(mermaidInstance);
      } catch (err) {
        console.error('Failed to load mermaid:', err);
        setError('图表渲染库加载失败');
      }
    };

    loadMermaid();
  }, []);

  useEffect(() => {
    if (mermaid && mermaidRef.current && code) {
      const renderChart = async () => {
        try {
          setError(null);
          
          // 清空容器
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = '';
          }
          
          // 生成唯一ID
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          
          // 渲染图表
          const { svg } = await mermaid.render(id, code);
          
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        } catch (err) {
          console.error('Mermaid render error:', err);
          setError('图表渲染失败，请检查语法');
        }
      };

      renderChart();
    }
  }, [mermaid, code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleToggleCode = () => {
    setShowCode(!showCode);
  };

  if (error) {
    return (
      <div className="my-6 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-red-600 dark:text-red-400 font-medium">⚠️ {error}</span>
          <button
            onClick={handleToggleCode}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >
            {showCode ? '隐藏代码' : '查看代码'}
          </button>
        </div>
        {showCode && (
          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
            <code>{code}</code>
          </pre>
        )}
      </div>
    );
  }

  return (
    <div className="my-6">
      {/* 控制按钮 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">📊 Mermaid图表</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleCode}
            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {showCode ? '隐藏代码' : '查看代码'}
          </button>
          <button
            onClick={handleCopy}
            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
          >
            {copied ? '已复制!' : '复制代码'}
          </button>
        </div>
      </div>

      {/* 图表渲染区域 */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
        <div 
          ref={mermaidRef} 
          className="flex justify-center items-center min-h-[200px] mermaid-container"
        />
      </div>

      {/* 代码显示区域 */}
      {showCode && (
        <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-600 dark:text-gray-400">Mermaid源代码</span>
          </div>
          <pre className="p-3 overflow-x-auto bg-gray-100 dark:bg-gray-900 text-sm">
            <code className="text-gray-800 dark:text-gray-200">{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default MermaidBlock; 