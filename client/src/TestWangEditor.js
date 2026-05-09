import React, { useState } from 'react';
import WangEditor from './WangEditor';

function TestWangEditor() {
  const [content, setContent] = useState('<p>测试内容</p>');

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>WangEditor 测试页面</h2>
      <p>这是一个测试页面，用来验证WangEditor是否正常工作。</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>编辑器</h3>
        <WangEditor
          value={content}
          onChange={setContent}
          placeholder="请输入内容..."
          height={300}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>预览</h3>
        <div 
          style={{ 
            border: '1px solid #ccc', 
            padding: '10px', 
            minHeight: '100px',
            backgroundColor: '#f9f9f9'
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <div>
        <h3>HTML源码</h3>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          border: '1px solid #ddd',
          overflow: 'auto',
          maxHeight: '200px'
        }}>
          {content}
        </pre>
      </div>
    </div>
  );
}

export default TestWangEditor; 