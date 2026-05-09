// AllFAQPage.js
// 完整的FAQ页面，显示所有常见问题
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AllFAQPage({ onBack }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/faqs');
        // 只显示可见的FAQ，并按排序字段排序
        const visibleFaqs = response.data
          .filter(faq => faq.visible)
          .sort((a, b) => a.order - b.order);
        setFaqs(visibleFaqs);
        setFilteredFaqs(visibleFaqs);
      } catch (error) {
        console.error('获取FAQ失败:', error);
        setError('获取常见问题失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  // 搜索功能
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFaqs(faqs);
    } else {
      const filtered = faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFaqs(filtered);
    }
  }, [searchTerm, faqs]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">加载中...</span>
          </div>
          <div className="mt-3 text-muted">正在加载常见问题...</div>
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
            <i className="fas fa-question-circle me-2"></i>
            常见问题
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>找到您需要的答案</p>
        </div>
        <div className="col-auto" style={{ width: '120px' }}>
          {/* 占位符，保持标题居中 */}
        </div>
      </div>

      {/* 搜索框 */}
      <div className="row justify-content-center mb-3">
        <div className="col-md-8 col-lg-6">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0" style={{ fontSize: '0.9rem' }}>
              <i className="fas fa-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="搜索问题或答案..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
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
          {searchTerm ? `找到 ${filteredFaqs.length} 个相关问题` : `共 ${faqs.length} 个常见问题`}
        </div>
      </div>

      {/* FAQ列表 */}
      {filteredFaqs.length === 0 ? (
        <div className="text-center py-5">
          <div className="text-muted mb-3">
            <i className="fas fa-search" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
          </div>
          <h5 className="text-muted">
            {searchTerm ? '没有找到相关问题' : '暂无常见问题'}
          </h5>
          <p className="text-muted">
            {searchTerm ? '请尝试其他关键词' : '请稍后再来查看'}
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
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="accordion" id="faqAccordion">
              {filteredFaqs.map((faq, index) => (
                <div key={faq._id} className="accordion-item border-0 mb-2 shadow-sm">
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
                          <i className="fas fa-question text-primary" style={{ fontSize: '0.8rem' }}></i>
                        </div>
                        <span className="flex-grow-1 text-start">
                          {faq.question}
                        </span>
                      </div>
                    </button>
                  </h2>
                  <div 
                    id={`collapse${index}`} 
                    className="accordion-collapse collapse" 
                    aria-labelledby={`heading${index}`} 
                    data-bs-parent="#faqAccordion"
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
                        <i className="fas fa-lightbulb text-warning me-3 mt-1"></i>
                        <div className="flex-grow-1">
                          {faq.answer.split('\n').map((paragraph, pIndex) => (
                            <p key={pIndex} className="mb-2">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 底部提示信息 */}
      <div className="text-center mt-5">
        <div className="card border-0 bg-light">
          <div className="card-body py-4">
            <h5 className="card-title text-primary mb-3">
              <i className="fas fa-headset me-2"></i>
              还有其他问题？
            </h5>
            <p className="card-text text-muted mb-0">
              我们的客服团队随时为您提供帮助
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllFAQPage;
    