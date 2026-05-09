// AllNoticesPage.js
// 完整的公告页面，显示所有公�?import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AllNoticesPage({ onBack }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotices, setFilteredNotices] = useState([]);


  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/notices');
        // 只显示可见的公告，按创建时间倒序排列
        const visibleNotices = response.data
          .filter(notice => notice.visible)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotices(visibleNotices);
        setFilteredNotices(visibleNotices);
      } catch (error) {
        console.error('获取公告失败:', error);
        setError('获取公告失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // 搜索功能
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredNotices(notices);
    } else {
      const filtered = notices.filter(notice => 
        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNotices(filtered);
    }
  }, [searchTerm, notices]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">加载�?..</span>
          </div>
          <div className="mt-3 text-muted">正在加载公告...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <div className="alert alert-warning" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
          <button className="btn btn-primary" onClick={onBack}>
            <i className="fas fa-arrow-left me-2"></i>
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-3 mb-4">
      {/* 页面头部 */}
      <div className="row align-items-center mb-4">
        <div className="col-auto">
          <button 
            className="btn btn-primary"
            onClick={onBack}
            style={{ 
              borderRadius: '8px', 
              padding: '8px 16px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            <i className="fas fa-arrow-left me-2"></i>
            返回
          </button>
        </div>
        <div className="col text-center">
          <h1 className="mb-1" style={{ color: '#1976d2', fontWeight: 'bold', fontSize: '1.8rem' }}>
            <i className="fas fa-bullhorn me-2"></i>
            公告�?          </h1>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>查看所有公告信�?/p>
        </div>
        <div className="col-auto" style={{ width: '120px' }}>
          {/* 占位符，保持标题居中 */}
        </div>
      </div>

      {/* 搜索�?*/}
      <div className="row justify-content-center mb-3">
        <div className="col-md-8 col-lg-6">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0" style={{ fontSize: '0.9rem' }}>
              <i className="fas fa-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="搜索公告标题或内�?.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                borderRadius: '0 20px 20px 0',
                boxShadow: 'none',
                borderColor: '#dee2e6',
                fontSize: '0.9rem',
                padding: '0.5rem 0.75rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="text-center mb-3">
        <div className="badge bg-light text-dark px-2 py-1" style={{ fontSize: '0.8rem' }}>
          {searchTerm ? `找到 ${filteredNotices.length} 条相关公告` : `�?${notices.length} 条公告`}
        </div>
      </div>

      {/* 公告列表 */}
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {filteredNotices.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted mb-3">
                <i className="fas fa-search" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
              </div>
              <h5 className="text-muted">
                {searchTerm ? '没有找到相关公告' : '暂无公告'}
              </h5>
              <p className="text-muted">
                {searchTerm ? '请尝试其他关键词' : '请稍后再来查�?}
              </p>
              {searchTerm && (
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => setSearchTerm('')}
                >
                  清除搜索
                </button>
              )}
            </div>
          ) : (
            <div className="accordion" id="noticeAccordion">
              {filteredNotices.map((notice, index) => (
                <div key={notice._id} className="accordion-item border-0 mb-2 shadow-sm">
                  <h2 className="accordion-header" id={`heading${index}`}>
                    <button 
                      className="accordion-button collapsed fw-bold" 
                      type="button" 
                      data-bs-toggle="collapse" 
                      data-bs-target={`#collapse${index}`} 
                      aria-expanded="false" 
                      aria-controls={`collapse${index}`}
                      style={{
                        backgroundColor: '#f8f9fa',
                        border: 'none',
                        borderRadius: '8px 8px 0 0',
                        fontSize: '1rem',
                        color: '#1976d2',
                        padding: '1rem 1.25rem'
                      }}
                    >
                      <div className="d-flex align-items-center w-100">
                        <div 
                          className="flex-shrink-0 me-3"
                          style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: '#e3f2fd',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <i className="fas fa-bullhorn text-primary" style={{ fontSize: '0.8rem' }}></i>
                        </div>
                        <span className="flex-grow-1 text-start">
                          {notice.title}
                        </span>
                        <span className="text-muted me-3" style={{ fontSize: '0.8rem' }}>
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  </h2>
                  <div 
                    id={`collapse${index}`} 
                    className="accordion-collapse collapse" 
                    aria-labelledby={`heading${index}`} 
                    data-bs-parent="#noticeAccordion"
                  >
                    <div 
                      className="accordion-body" 
                      style={{
                        backgroundColor: '#fff',
                        padding: '1.25rem',
                        lineHeight: '1.6',
                        fontSize: '0.95rem',
                        color: '#444',
                        borderRadius: '0 0 8px 8px'
                      }}
                    >
                      <div className="d-flex align-items-start">
                        <i className="fas fa-info-circle text-info me-3 mt-1"></i>
                        <div className="flex-grow-1">
                          {notice.content.split('\n').map((paragraph, pIndex) => (
                            <p key={pIndex} className="mb-2">
                              {paragraph}
                            </p>
                          ))}
                          <div className="text-end mt-3 pt-2 border-top">
                            <small className="text-muted">
                              发布时间：{new Date(notice.createdAt).toLocaleString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部提示 */}
      <div className="text-center mt-4">
        <div className="card border-0 bg-light">
          <div className="card-body py-3">
            <h6 className="card-title text-primary mb-2" style={{ fontSize: '1rem' }}>
              <i className="fas fa-info-circle me-1"></i>
              重要提醒
            </h6>
            <p className="card-text text-muted mb-0" style={{ fontSize: '0.85rem' }}>
              请及时关注公告信息，以免错过重要通知
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllNoticesPage;
