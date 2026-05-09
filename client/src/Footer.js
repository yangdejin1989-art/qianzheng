// Footer.js
// 动态底部组件，支持三列布局：关于我们、公司信息、联系方式
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { buildApiUrl, buildImageUrl } from './config';

function Footer({ onNavigate }) {
  const [footer, setFooter] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 检测是否为移动端
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    console.log('Footer组件开始获取数据...');
    axios.get(buildApiUrl('/api/footer'))
      .then(res => {
        console.log('Footer数据获取成功:', res.data);
        console.log('about类型:', typeof res.data.about, Array.isArray(res.data.about));
        console.log('companyInfo类型:', typeof res.data.companyInfo, Array.isArray(res.data.companyInfo));
        console.log('contacts类型:', typeof res.data.contacts, Array.isArray(res.data.contacts));
        setFooter(res.data);
      })
      .catch(err => {
        console.error('获取底部信息失败:', err);
        console.error('错误详情:', err.response?.data || err.message);
      });
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!footer) {
    console.log('Footer数据为空，显示加载中...');
    return (
      <div style={{
        background: '#2c3e50', 
        color: '#fff', 
        padding: isMobile ? '20px 0 12px 0' : '48px 0 24px 0', 
        marginTop: isMobile ? 16 : 48,
        textAlign: 'center'
      }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--footer-gradient, linear-gradient(135deg, #012baf 0%, #001a7a 100%))', 
      color: '#fff', 
      padding: isMobile ? '20px 0 12px 0' : '32px 0 16px 0', 
      marginTop: isMobile ? 16 : 32,
      boxShadow: '0 -4px 20px rgba(1, 43, 175, 0.3)'
    }}>
      <div className="container" style={{
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        maxWidth: 1200, 
        gap: '20px 0'
      }}>
        {/* 关于我们 */}
        <div style={{
          minWidth: 180, 
          marginBottom: isMobile ? 12 : 16, 
          flex: '1 1 280px', 
          padding: isMobile ? '0 8px' : '0 12px'
        }}>
          <div style={{
            fontWeight: 700, 
            fontSize: 16, 
            marginBottom: 12, 
            borderBottom: '2px solid #3498db', 
            paddingBottom: 6
          }}>
            关于我们
          </div>
          
          {/* 子项标题列表 - 点击跳转到详情页 */}
          {footer.about && Array.isArray(footer.about) && footer.about.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {footer.about.map((item, idx) => (
          <button 
                  key={idx}
                  onClick={() => onNavigate('about', { index: idx, item: item })}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary, #74efe1)',
                    padding: '4px 0',
                    margin: '2px 12px 2px 0',
                    fontSize: '13px',
                    cursor: 'pointer',
              textDecoration: 'underline',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#3498db';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--primary, #74efe1)';
            }}
          >
                  {item.title || `关于我们 ${idx + 1}`}
          </button>
              ))}
            </div>
          )}
        </div>

        {/* 公司信息 */}
        <div style={{
          minWidth: 180, 
          marginBottom: isMobile ? 12 : 16, 
          flex: '1 1 280px', 
          padding: isMobile ? '0 8px' : '0 12px'
        }}>
          <div style={{
            fontWeight: 700, 
            fontSize: 16, 
            marginBottom: 12, 
            borderBottom: '2px solid #3498db', 
            paddingBottom: 6
          }}>
            公司信息
          </div>
          
          {/* 子项标题列表 - 点击跳转到详情页 */}
          {footer.companyInfo && Array.isArray(footer.companyInfo) && footer.companyInfo.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {footer.companyInfo.map((item, idx) => (
          <button 
                  key={idx}
                  onClick={() => onNavigate('company', { index: idx, item: item })}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary, #74efe1)',
                    padding: '4px 0',
                    margin: '2px 12px 2px 0',
                    fontSize: '13px',
                    cursor: 'pointer',
              textDecoration: 'underline',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#3498db';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--primary, #74efe1)';
            }}
          >
                  {item.title || `公司信息 ${idx + 1}`}
          </button>
              ))}
            </div>
          )}
        </div>

        {/* 联系方式 - 富文本展示 + 二维码 */}
        <div style={{
          minWidth: 180, 
          marginBottom: isMobile ? 12 : 16, 
          flex: '1 1 350px', 
          padding: isMobile ? '0 8px' : '0 12px'
        }}>
          <div style={{
            fontWeight: 700, 
            fontSize: 16, 
            marginBottom: 12, 
            borderBottom: '2px solid #3498db', 
            paddingBottom: 6
          }}>
            联系我们
          </div>
          
          {/* 联系方式富文本 */}
          {footer.contacts && (
            <div 
              style={{
                fontSize: 13,
                lineHeight: 1.2,
                  color: '#ecf0f1', 
                marginBottom: 0
              }}
              dangerouslySetInnerHTML={{ __html: footer.contacts }}
            />
          )}
          
          {/* 二维码区域 - 放在联系信息下面，自动排版 */}
          {footer.qrcodes && Array.isArray(footer.qrcodes) && footer.qrcodes.length > 0 && (
            <div style={{ 
              marginTop: 8,
              paddingTop: 8,
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#74efe1',
                marginBottom: 8
                }}>
                📱 扫码联系我们
                </div>
              
              {/* 二维码网格布局 - 自动根据个数排版 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                gap: '12px',
                justifyContent: 'center'
                  }}>
                {footer.qrcodes.map((item, i) => (
                  <div key={`qrcode-${i}`} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <img 
                    src={buildImageUrl(item.imageUrl)} 
                    alt={item.label} 
                    style={{
                        width: 80,
                        height: 80,
                      background: '#fff', 
                      borderRadius: 6, 
                      marginBottom: 6, 
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        objectFit: 'cover'
                    }} 
                  />
                  <div style={{
                    color: '#ecf0f1', 
                      fontSize: 11, 
                      fontWeight: 500,
                      textAlign: 'center',
                      maxWidth: '80px',
                      wordBreak: 'break-word',
                      lineHeight: 1.2
                  }}>
                    {item.label}
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 底部版权信息 */}
      <div style={{
        textAlign: 'center', 
        color: '#bdc3c7', 
        fontSize: isMobile ? 12 : 13, 
        marginTop: isMobile ? 12 : 24, 
        paddingTop: isMobile ? 12 : 16,
        borderTop: '1px solid #34495e'
      }}>
        &copy; {new Date().getFullYear()} 季舒签证. 保留所有权利.
      </div>
    </div>
  );
}

export default Footer; 