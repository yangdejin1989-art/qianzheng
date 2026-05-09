import React, { useState, useEffect } from 'react';
import { themes, getCurrentTheme, setTheme } from './themes';

function ThemeManager() {
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

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#012baf', fontSize: '1.5rem', fontWeight: 'bold' }}>
          <i className="fas fa-palette me-2"></i>
          主题管理
        </h3>
        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
          选择网站的主题配色方案
        </p>
      </div>

      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
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
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (currentThemeName !== key) {
                e.currentTarget.style.borderColor = theme.colors.primary;
                e.currentTarget.style.background = `${theme.colors.primary}05`;
              }
            }}
            onMouseLeave={(e) => {
              if (currentThemeName !== key) {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.background = '#ffffff';
              }
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <h4 style={{ 
                margin: 0, 
                color: theme.colors.secondary,
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                {theme.name}
              </h4>
              
              {currentThemeName === key && (
                <div style={{
                  color: theme.colors.primary,
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: theme.colors.background,
                  border: '1px solid #ddd'
                }}></div>
                <span style={{ fontSize: '12px', color: '#666' }}>背景</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: theme.colors.primary
                }}></div>
                <span style={{ fontSize: '12px', color: '#666' }}>主色</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: theme.colors.secondary
                }}></div>
                <span style={{ fontSize: '12px', color: '#666' }}>辅色</span>
              </div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-info-circle" style={{ color: '#007bff' }}></i>
          <strong>提示：</strong>
        </div>
        <div style={{ marginTop: '4px' }}>
          选择主题后页面会自动刷新以应用新的配色方案。当前主题：<strong>{themes[currentThemeName]?.name}</strong>
        </div>
      </div>
    </div>
  );
}

export default ThemeManager;

