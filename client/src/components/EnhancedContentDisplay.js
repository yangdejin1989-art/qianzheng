import React, { useState, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';
import './ContentDisplay.css';

/**
 * 增强版内容显示组件
 * 自动优化HTML中的图片显示
 */
function EnhancedContentDisplay({ content, className = '', style = {} }) {
  const [processedContent, setProcessedContent] = useState('');

  useEffect(() => {
    if (!content) {
      setProcessedContent('');
      return;
    }

    // 创建一个临时的DOM元素来解析HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    // 找到所有的图片元素
    const images = tempDiv.querySelectorAll('img');
    
    // 为每个图片添加优化样式
    images.forEach(img => {
      // 添加优化样式类
      img.style.maxWidth = '100%';
      img.style.maxHeight = '250px';
      img.style.width = 'auto';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.margin = '10px auto';
      img.style.borderRadius = '4px';
      img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      img.style.objectFit = 'contain';
      img.style.overflow = 'hidden';
      
      // 添加响应式样式
      img.style.transition = 'opacity 0.3s ease';
      img.style.opacity = '0';
      
      // 图片加载完成后显示
      img.onload = function() {
        this.style.opacity = '1';
      };
      
      // 图片加载失败的处理
      img.onerror = function() {
        this.style.display = 'none';
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100px;
          background-color: #f8f9fa;
          border: 1px dashed #ddd;
          border-radius: 4px;
          color: #666;
          font-size: 12px;
          margin: 10px auto;
        `;
        errorDiv.innerHTML = '<span>图片加载失败</span>';
        this.parentNode.insertBefore(errorDiv, this.nextSibling);
      };
    });

    setProcessedContent(tempDiv.innerHTML);
  }, [content]);

  return (
    <div 
      className={`content-display enhanced-content-display ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

export default EnhancedContentDisplay; 
