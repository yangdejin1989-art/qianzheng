import React, { useState } from 'react';
import WangEditor from './WangEditor';
import WangEditorNoUpload from './WangEditorNoUpload';
import ContentDisplay from './components/ContentDisplay';
import EnhancedContentDisplay from './components/EnhancedContentDisplay';

function TestUpload() {
  const [content, setContent] = useState('<p>测试内容</p>');
  const [contentNoUpload, setContentNoUpload] = useState('<p>无上传功能测试</p>');

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>WangEditor 图片上传测试</h2>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* 带图片上传功能的编辑器 */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3>带图片上传功能的编辑器</h3>
          <WangEditor
            value={content}
            onChange={setContent}
            placeholder="请输入内容，可以上传图片..."
            height={300}
          />
          
          <div style={{ marginTop: '20px' }}>
            <h4>预览</h4>
            <EnhancedContentDisplay 
              content={content}
              style={{ 
                border: '1px solid #ccc', 
                padding: '10px', 
                minHeight: '100px',
                backgroundColor: '#f9f9f9'
              }}
            />
          </div>
        </div>



        {/* 无图片上传功能的编辑器 */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3>无图片上传功能的编辑器</h3>
          <WangEditorNoUpload
            value={contentNoUpload}
            onChange={setContentNoUpload}
            placeholder="请输入内容，无图片上传功能..."
            height={300}
          />
          
          <div style={{ marginTop: '20px' }}>
            <h4>预览</h4>
            <EnhancedContentDisplay 
              content={contentNoUpload}
              style={{ 
                border: '1px solid #ccc', 
                padding: '10px', 
                minHeight: '100px',
                backgroundColor: '#f9f9f9'
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>HTML源码对比</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h4>带上传功能的HTML</h4>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              border: '1px solid #ddd',
              overflow: 'auto',
              maxHeight: '200px',
              fontSize: '12px'
            }}>
              {content}
            </pre>
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h4>无限制上传功能的HTML</h4>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              border: '1px solid #ddd',
              overflow: 'auto',
              maxHeight: '200px',
              fontSize: '12px'
            }}>
              {contentUnlimited}
            </pre>
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h4>无上传功能的HTML</h4>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              border: '1px solid #ddd',
              overflow: 'auto',
              maxHeight: '200px',
              fontSize: '12px'
            }}>
              {contentNoUpload}
            </pre>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
        <h3>使用说明</h3>
        <ul>
          <li><strong>左侧编辑器</strong>：支持图片上传功能，点击图片按钮可以上传图片</li>
          <li><strong>中间编辑器</strong>：无限制上传功能，完全绕过文件大小检查</li>
          <li><strong>右侧编辑器</strong>：不包含图片上传功能，只有文本编辑功能</li>
          <li><strong>图片上传</strong>：支持拖拽上传、粘贴上传、点击上传</li>
          <li><strong>文件限制</strong>：无限制版本完全无文件大小限制</li>
          <li><strong>图片优化</strong>：所有图片都会自动限制大小，防止超出画面</li>
          <li><strong>上传地址</strong>：http://localhost:5000/api/upload</li>
        </ul>
      </div>
    </div>
  );
}

export default TestUpload; 