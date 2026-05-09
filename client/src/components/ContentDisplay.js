import React from 'react';
import './ContentDisplay.css';

/**
 * 通用内容显示组件
 * 用于显示富文本内容，并自动应用图片样式限制
 */
function ContentDisplay({ content, className = '', style = {} }) {
  return (
    <div 
      className={`content-display ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: content || '' }}
    />
  );
}

export default ContentDisplay; 