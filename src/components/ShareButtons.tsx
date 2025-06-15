'use client';

import React from 'react';
import { FaWeixin, FaLink } from 'react-icons/fa';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  // 复制链接到剪贴板
  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => alert('链接已复制到剪贴板'))
        .catch((err) => console.error('复制失败:', err));
    } else {
      // 回退方法
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert('链接已复制到剪贴板');
      } catch (err) {
        console.error('复制失败:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  // 显示微信二维码
  const shareToWeChat = () => {
    // 使用第三方服务生成二维码
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedUrl}&size=150x150`;
    
    // 创建弹窗显示二维码
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '1000';
    modal.style.flexDirection = 'column';
    
    const qrCode = document.createElement('img');
    qrCode.src = qrCodeUrl;
    qrCode.alt = '微信分享二维码';
    qrCode.style.width = '200px';
    qrCode.style.height = '200px';
    qrCode.style.backgroundColor = 'white';
    qrCode.style.padding = '10px';
    
    const closeButton = document.createElement('button');
    closeButton.innerText = '关闭';
    closeButton.style.marginTop = '20px';
    closeButton.style.padding = '5px 15px';
    closeButton.style.backgroundColor = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    
    const text = document.createElement('p');
    text.innerText = '请使用微信扫描二维码分享';
    text.style.color = 'white';
    text.style.marginBottom = '10px';
    
    modal.appendChild(text);
    modal.appendChild(qrCode);
    modal.appendChild(closeButton);
    
    closeButton.onclick = () => {
      document.body.removeChild(modal);
    };
    
    document.body.appendChild(modal);
  };

  return (
    <div className="flex space-x-4 my-4">
      <button
        onClick={shareToWeChat}
        className="text-green-600 hover:text-green-800"
        title="分享到微信"
      >
        <FaWeixin size={20} />
      </button>
      <button
        onClick={copyToClipboard}
        className="text-gray-600 hover:text-gray-800"
        title="复制链接"
      >
        <FaLink size={20} />
      </button>
    </div>
  );
} 