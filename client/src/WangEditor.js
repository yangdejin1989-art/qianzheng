import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import '@wangeditor/editor/dist/css/style.css';
import { buildApiUrl } from './config';
import './styles/EditorStyles.css';

function WangEditor({ value, onChange, height = 400, placeholder = '', toolbarConfig = null }) {
  const [editor, setEditor] = useState(null);
  const [editorHeight, setEditorHeight] = useState(height);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(0);

  // 工具栏配置
  const finalToolbarConfig = useMemo(() => {
    return toolbarConfig || {
      excludeKeys: ['group-video', 'insertTable', 'codeBlock', 'fullScreen']
    };
  }, [toolbarConfig]);

  // 编辑器配置 - 使用useMemo避免每次渲染都重新创建
  const editorConfig = useMemo(() => ({
    placeholder: placeholder,
    contentStyle: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
        font-size: 14px; 
        line-height: 1.6; 
        color: #333; 
        margin: 0; 
        padding: 10px; 
      }
      h1, h2, h3, h4, h5, h6 { 
        margin-top: 0; 
        margin-bottom: 10px; 
        font-weight: 600; 
      }
      p { 
        margin: 0 0 10px 0; 
      }
      ul, ol { 
        margin: 0 0 10px 20px; 
        padding: 0; 
      }
      li { 
        margin-bottom: 5px; 
      }
      a { 
        color: #007bff; 
        text-decoration: none; 
      }
      a:hover { 
        text-decoration: underline; 
      }
      img { 
        max-width: 100%; 
        height: auto; 
        display: block; 
        margin: 10px auto; 
        border-radius: 4px; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
      }
      table { 
        border-collapse: collapse; 
        width: 100%; 
        margin-bottom: 10px; 
      }
      table td, table th { 
        border: 1px solid #ddd; 
        padding: 8px; 
        text-align: left; 
      }
      table th { 
        background-color: #f8f9fa; 
        font-weight: 600; 
      }
      blockquote { 
        border-left: 4px solid #007bff; 
        margin: 0 0 10px 0; 
        padding: 10px 20px; 
        background-color: #f8f9fa; 
        font-style: italic; 
      }
      code { 
        background-color: #f8f9fa; 
        padding: 2px 4px; 
        border-radius: 3px; 
        font-family: 'Courier New', monospace; 
        font-size: 0.9em; 
      }
      pre { 
        background-color: #f8f9fa; 
        padding: 10px; 
        border-radius: 5px; 
        overflow-x: auto; 
        margin: 0 0 10px 0; 
      }
    `,
    MENU_CONF: {
      fontSize: {
        fontSizeList: [
          { name: '10px', value: '10px' },
          { name: '12px', value: '12px' },
          { name: '14px', value: '14px' },
          { name: '16px', value: '16px' },
          { name: '19px', value: '19px' },
          { name: '22px', value: '22px' },
          { name: '24px', value: '24px' },
          { name: '32px', value: '32px' },
          { name: '48px', value: '48px' }
        ]
      },
      uploadImage: {
        server: buildApiUrl('/api/upload'),
        fieldName: 'image',
        maxFileSize: 100 * 1024 * 1024,
        allowedFileTypes: ['image/*'],
        onBeforeUpload(file) {
          return file;
        },
        onFailed(file, res) {
          console.error('上传失败:', res);
        },
        onError(file, err) {
          console.error('上传错误:', err);
        },
        customInsert(res, insertFn) {
          if (res?.success && res?.url) {
            const imageUrl = res.url.startsWith('http') ? res.url : buildApiUrl(res.url);
            insertFn(imageUrl, res.alt || '', res.href || '');
          }
        }
      }
    }
  }), [placeholder]);

  // 编辑器初始化
  useEffect(() => {
    if (!editor) return;
    editor.setHtml(value || '');
  }, [editor]);

  // 编辑器销毁
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, []);

  // 拖拽调整大小功能
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = editorHeight;
  };

  useEffect(() => {
    const handleResizeMove = (e) => {
      if (!isResizing) return;
      const deltaY = e.clientY - resizeStartY.current;
      const newHeight = Math.max(200, Math.min(1000, resizeStartHeight.current + deltaY));
      setEditorHeight(newHeight);
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleChange = (editor) => {
    onChange(editor.getHtml());
  };

  return (
    <div className="wang-editor-container" style={{ zIndex: 100, position: 'relative' }}>
      <Toolbar
        editor={editor}
        defaultConfig={finalToolbarConfig}
        mode="default"
        className="wang-editor-toolbar"
      />
      <Editor
        defaultConfig={editorConfig}
        onCreated={setEditor}
        onChange={handleChange}
        mode="default"
        className="wang-editor-content"
        style={{ height: editorHeight - 50 }}
      />
      <div 
        className="editor-resize-handle"
        onMouseDown={handleResizeStart}
        style={{
          height: '8px',
          background: isResizing ? '#007bff' : '#e0e0e0',
          cursor: 'ns-resize',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
          borderTop: '1px solid #ccc'
        }}
      >
        <div style={{
          width: '40px',
          height: '3px',
          background: isResizing ? '#fff' : '#999',
          borderRadius: '2px'
        }} />
      </div>
    </div>
  );
}

export default WangEditor; 
