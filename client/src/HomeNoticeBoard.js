// HomeNoticeBoard.js
// 首页公告栏展示组件（最多显�?条，更紧凑的排版�?
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { buildApiUrl } from './config';

function HomeNoticeBoard({ onViewMore }) {
  const [notices, setNotices] = useState([]);
  const [allNotices, setAllNotices] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    
    axios.get(buildApiUrl('/api/notices')).then(res => {
      const visibleNotices = res.data.filter(n => n.visible);
      setAllNotices(visibleNotices);
      setNotices(visibleNotices.slice(0, 8)); // 只取�?�?
    });
    
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (notices.length === 0) {
    return null; // 如果没有公告，不显示整个组件
  }

  return (
    <div className="container" style={{ marginTop: isMobile ? '8px' : '1.5rem' }}>
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10 col-sm-12">
          <div className="notice-card">
            <div className={isMobile ? '' : 'd-flex justify-content-between align-items-center'} style={{ 
              marginBottom: isMobile ? '8px' : '1rem',
              position: 'relative'
            }}>
              <h2 style={{
                marginBottom: 0, 
                fontSize: isMobile ? 20 : 24, 
                fontWeight: 'bold', 
                color: '#1976d2',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                <i className="fas fa-bullhorn me-2"></i>
                公告�?
              </h2>
              {allNotices.length > 8 && (
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={onViewMore}
                  style={{ 
                    borderRadius: '20px', 
                    fontSize: '12px',
                    ...(isMobile && {
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)'
                    })
                  }}
                >
                  更多 <i className="fas fa-chevron-right ms-1"></i>
                </button>
              )}
            </div>
            
            <ul style={{listStyle:'none', padding:0, margin:0}}>
              {notices.map((notice, idx) => (
                <li key={notice._id} style={{
                  borderBottom: idx !== notices.length-1 ? '1px solid #e8e8e8' : 'none', 
                  padding:'0'
                }}>
                  <button
                    style={{
                      width:'100%',
                      textAlign:'left',
                      background:'none',
                      border:'none',
                      outline:'none',
                      fontWeight:500,
                      fontSize: isMobile ? 14 : 16,
                      padding: isMobile ? '10px 0' : '12px 0',
                      color:'#1976d2',
                      cursor:'pointer',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'space-between',
                      transition:'all 0.2s ease',
                    }}
                    onClick={()=>setOpenIndex(openIndex===idx?null:idx)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.paddingLeft = '8px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.paddingLeft = '0';
                    }}
                  >
                    <div className="d-flex align-items-center flex-grow-1">
                      <i className="fas fa-circle me-2" style={{fontSize: '6px', color: '#ff6b6b'}}></i>
                      <span className="flex-grow-1" style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: isMobile ? '75%' : '80%'
                      }}>
                        {notice.title}
                      </span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span style={{fontSize:12, color:'#999', marginRight:8}}>
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                      <i className={`fas fa-chevron-${openIndex===idx ? 'up' : 'down'}`} 
                         style={{fontSize:12, color:'#ccc'}}></i>
                    </div>
                  </button>
                  {openIndex===idx && (
                    <div style={{
                      padding: isMobile ? '6px 10px 10px 16px' : '8px 12px 12px 20px', 
                      color:'#555', 
                      fontSize: isMobile ? 13 : 14, 
                      lineHeight: isMobile ? 1.4 : 1.5, 
                      background:'#f8f9fa', 
                      borderRadius:6, 
                      marginTop:4,
                      marginBottom: isMobile ? 6 : 8,
                      borderLeft: '3px solid #1976d2'
                    }}>
                      {notice.content}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            
            {/* 如果有更多公告，显示提示 */}
            {allNotices.length > 8 && (
              <div className="text-center mt-3">
                <small className="text-muted">
                  显示 {notices.length} / {allNotices.length} 条公�?
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeNoticeBoard;
