import React, { useState, useEffect } from 'react';
import { themes, getCurrentTheme, setTheme } from './themes';

function ThemeSwitcher({ isVisible, onClose }) {
  const [currentThemeName, setCurrentThemeName] = useState('current');

  useEffect(() => {
    const savedTheme = localStorage.getItem('kdai-theme') || 'current';
    setCurrentThemeName(savedTheme);
  }, []);

  const handleThemeChange = (themeName) => {
    setTheme(themeName);
    setCurrentThemeName(themeName);
    // 刷新页面以应用新主题
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: 0, color: '#012baf' }}>选择主题配色</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          {Object.entries(themes).map(([key, theme]) => (
            <div
              key={key}
              onClick={() => handleThemeChange(key)}
              style={{
                padding: '16px',
                border: `2px solid ${currentThemeName === key ? theme.colors.primary : '#e5e7eb'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                background: currentThemeName === key ? `${theme.colors.primary}10` : '#ffffff',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    color: theme.colors.secondary 
                  }}>
                    {theme.name}
                  </h4>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      background: theme.colors.background,
                      border: '1px solid #ddd'
                    }}></div>
                    <span style={{ fontSize: '12px', color: '#666' }}>背景</span>
                    
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      background: theme.colors.primary
                    }}></div>
                    <span style={{ fontSize: '12px', color: '#666' }}>主色</span>
                    
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      background: theme.colors.secondary
                    }}></div>
                    <span style={{ fontSize: '12px', color: '#666' }}>辅色</span>
                  </div>
                </div>
                
                {currentThemeName === key && (
                  <div style={{
                    color: theme.colors.primary,
                    fontSize: '20px'
                  }}>
                    ✓
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666'
        }}>
          <strong>提示：</strong>选择主题后页面会自动刷新以应用新的配色方案。
        </div>
      </div>
    </div>
  );
}

export default ThemeSwitcher; 