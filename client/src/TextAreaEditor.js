import React from 'react';

function TextAreaEditor({ value, onChange, height = 350, placeholder = '' }) {
  const safeValue = value || '';

  return (
    <div style={{ height: height }}>
      <textarea
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: height - 20,
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5',
          resize: 'vertical'
        }}
      />
      <div style={{ 
        marginTop: '5px', 
        fontSize: '12px', 
        color: '#666',
        padding: '5px',
        backgroundColor: '#f9f9f9',
        borderRadius: '3px'
      }}>
        💡 提示：支持基本的文本编辑。如需富文本功能，请使用 HTML 标签，如 &lt;b&gt;粗体&lt;/b&gt;、&lt;i&gt;斜体&lt;/i&gt;、&lt;br&gt;换行等。
      </div>
    </div>
  );
}

export default TextAreaEditor; 