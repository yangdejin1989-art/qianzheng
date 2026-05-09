import React, { useState, useEffect, useRef } from 'react';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import '@wangeditor/editor/dist/css/style.css';
import './styles/EditorStyles.css';

function WangEditorNoUpload({ value, onChange, height = 400, placeholder = '' }) {
  const [editor, setEditor] = useState(null);
  const [html, setHtml] = useState('');
  const [editorHeight, setEditorHeight] = useState(height);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(0);

  // 确保value是字符串
  const safeValue = value || '';

  useEffect(() => {
    setHtml(safeValue);
  }, [safeValue]);

  // 工具栏配置 - 排除图片上传功能
  const toolbarConfig = {
    excludeKeys: [
      'group-video',
      'insertTable',
      'codeBlock',
      'fullScreen',
      'uploadImage'  // 排除图片上传
    ]
  };

  // 简化的编辑器配置 - 不包含图片上传
  const editorConfig = {
    placeholder: placeholder,
    MENU_CONF: {
      // 配置字体大小选项：支持10px到72px
      fontSize: {
        fontSizeList: [
          { name: '10px', value: '10px' },
          { name: '12px', value: '12px' },
          { name: '14px', value: '14px' },
          { name: '15px', value: '15px' },
          { name: '16px', value: '16px' },
          { name: '19px', value: '19px' },
          { name: '22px', value: '22px' },
          { name: '24px', value: '24px' },
          { name: '28px', value: '28px' },
          { name: '32px', value: '32px' },
          { name: '36px', value: '36px' },
          { name: '48px', value: '48px' },
          { name: '56px', value: '56px' },
          { name: '64px', value: '64px' },
          { name: '72px', value: '72px' }
        ]
      }
    }
  };

  // 编辑器创建完成时的回调
  useEffect(() => {
    if (editor == null) return;
    
    // 设置编辑器内容
    if (html !== editor.getHtml()) {
      editor.setHtml(html);
    }
  }, [editor, html]);

  // 编辑器销毁
  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

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
    const html = editor.getHtml();
    setHtml(html);
    onChange(html);
  };

  return (
    <div className="wang-editor-container" style={{ zIndex: 100, position: 'relative' }}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        className="wang-editor-toolbar"
      />
      <Editor
        defaultConfig={editorConfig}
        value={html}
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

export default WangEditorNoUpload; 