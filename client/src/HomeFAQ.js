// HomeFAQ.js
// 首页常见问题展示组件（只显示6个，有更多按钮）
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { buildApiUrl } from './config';

function HomeFAQ({ onViewMore }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // 响应式：小屏显示2行，桌面显示3行
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  // 预览弹窗
  const [previewFaq, setPreviewFaq] = useState(null);

  useEffect(() => {
    // 监听窗口尺寸，决定截断行数
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);

    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(buildApiUrl('/api/faqs'));
        // 只显示可见的FAQ，按排序字段排序，取前4个
        const visibleFaqs = response.data
          .filter(faq => faq.visible)
          .sort((a, b) => a.order - b.order)
          .slice(0, 4); // 只取前4个
        setFaqs(visibleFaqs);
      } catch (error) {
        console.error('获取FAQ失败:', error);
        setError('获取常见问题失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ marginTop: isMobile ? '12px' : '3rem' }}>
        <div className="text-center py-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">加载中...</span>
          </div>
          <div className="mt-2 text-muted">正在加载常见问题...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: isMobile ? '12px' : '3rem' }}>
        <div className="text-center py-3">
          <div className="alert alert-warning" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="container" style={{ marginTop: isMobile ? '12px' : '3rem' }}>
        <div className="text-center py-3">
          <div className="text-muted mb-2">
            <i className="fas fa-question-circle" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
          </div>
          <h6 className="text-muted">暂无常见问题</h6>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: isMobile ? '8px' : '1.5rem', marginBottom: isMobile ? '8px' : '1.5rem' }}>
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10 col-sm-12">
          <div className="faq-card">
            <div className="text-center" style={{ marginBottom: isMobile ? '8px' : '1rem' }}>
              <h2 className="fw-bold mb-2" style={{ 
                fontSize: isMobile ? '1.3rem' : '1.5rem', 
                color: '#1976d2',
                marginBottom: isMobile ? '4px' : '0.5rem'
              }}>
                <i className="fas fa-question-circle me-2"></i>
                常见问题
              </h2>
              <p className="text-muted mb-0" style={{ 
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                marginBottom: 0
              }}>
                解答您关于签证服务的常见疑问
              </p>
            </div>
            
            {/* 在三分之二宽度内，恢复左右各一个布局 */}
            <div className="row g-3">
              {faqs.map((faq, index) => (
                <div key={faq._id} className="col-12 col-md-6">
              <div 
                className="card h-100 shadow-sm border-0"
                title="点击查看完整内容"
                onClick={() => setPreviewFaq(faq)}
                style={{
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  border: '1px solid #e0e0e0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(25,118,210,0.25)';
                  e.currentTarget.style.borderColor = '#1565c0';
                  e.currentTarget.style.backgroundColor = '#e3f2fd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.backgroundColor = '#fff';
                }}
              >
                <div className="card-body" style={{ padding: isMobile ? '10px' : '1rem' }}>
                  <div className="d-flex align-items-start" style={{ marginBottom: isMobile ? '6px' : '0.5rem' }}>
                    <div 
                      className="flex-shrink-0 me-2"
                      style={{
                        width: isMobile ? '24px' : '30px',
                        height: isMobile ? '24px' : '30px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i className="fas fa-question text-primary" style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 
                        className="card-title mb-1 fw-bold"
                        style={{ 
                          color: '#1976d2',
                          fontSize: isMobile ? '0.85rem' : '0.9rem',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: isMobile ? 2 : 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {faq.question}
                      </h6>
                    </div>
                  </div>
                  
                  <div className="card-text">
                    <p 
                      className="text-muted mb-0"
                      style={{ 
                        fontSize: isMobile ? '0.75rem' : '0.8rem',
                        lineHeight: isMobile ? '1.3' : '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: isMobile ? 2 : 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
                
            {/* 更多按钮 */}
            <div className="text-center" style={{ marginTop: isMobile ? '10px' : '1rem' }}>
              <button 
                className="btn btn-outline-primary btn-sm px-3"
                onClick={onViewMore}
                style={{
                  borderRadius: '20px',
                  fontWeight: '500',
                  fontSize: isMobile ? '0.75rem' : '0.85rem',
                  padding: isMobile ? '6px 12px' : undefined,
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="fas fa-plus-circle me-1"></i>
                查看更多问题
              </button>
            </div>
            
            <div className="text-center" style={{ marginTop: isMobile ? '10px' : '1rem' }}>
              <div className="alert alert-light border-0 mb-0" role="alert" style={{ 
                backgroundColor: '#f8f9fa', 
                fontSize: isMobile ? '0.75rem' : '0.8rem',
                padding: isMobile ? '8px' : '0.5rem 1rem'
              }}>
                <i className="fas fa-info-circle me-1 text-info"></i>
                还有其他问题？请联系我们的客服团队
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 预览弹窗 */}
      {previewFaq && (
        <div 
          onClick={() => setPreviewFaq(null)}
          style={{
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            background: 'rgba(0,0,0,0.35)', 
            zIndex: 1050,
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: isMobile ? '90%' : '680px', 
              margin: isMobile ? '5vh auto' : '10vh auto',
              padding: isMobile ? '0 10px' : '0'
            }}
          >
            <div className="card shadow">
              <div className="card-header d-flex justify-content-between align-items-center" style={{
                padding: isMobile ? '10px 12px' : '1rem'
              }}>
                <strong style={{ 
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  flex: 1,
                  marginRight: '10px'
                }}>
                  <i className="fas fa-question-circle me-2"></i>
                  {previewFaq.question}
                </strong>
                <button 
                  className="btn btn-sm btn-outline-secondary" 
                  onClick={() => setPreviewFaq(null)}
                  style={{ 
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    padding: isMobile ? '4px 10px' : '0.25rem 0.5rem'
                  }}
                >
                  关闭
                </button>
              </div>
              <div className="card-body" style={{ 
                whiteSpace: 'pre-wrap', 
                lineHeight: isMobile ? '1.5' : '1.7',
                fontSize: isMobile ? '0.9rem' : '1rem',
                padding: isMobile ? '12px' : '1rem'
              }}>
                {previewFaq.answer}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeFAQ;
