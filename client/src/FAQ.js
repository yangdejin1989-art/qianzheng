// FAQ.js
// 常见问题展示组件
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { buildApiUrl } from './config';

function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(buildApiUrl('/api/faqs'));
        // 只显示可见的FAQ，并按排序字段排序
        const visibleFaqs = response.data
          .filter(faq => faq.visible)
          .sort((a, b) => a.order - b.order);
        setFaqs(visibleFaqs);
      } catch (error) {
        console.error('获取FAQ失败:', error);
        setError('获取常见问题失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

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
        </div>
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <div className="text-muted mb-3">
            <i className="fas fa-question-circle" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
          </div>
          <h5 className="text-muted">暂无常见问题</h5>
          <p className="text-muted">请稍后再来查看</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="faq-card">
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3" style={{ fontSize: '2.5rem', color: '#1976d2' }}>
            <i className="fas fa-question-circle me-3"></i>
            常见问题
          </h2>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>
            解答您关于宽带服务的常见疑问
          </p>
        </div>
        
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="accordion" id="faqAccordion">
              {faqs.map((faq, index) => (
                <div key={faq._id} className="accordion-item border-0 mb-3 shadow-sm">
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
                        color: '#1976d2',
                        fontSize: '1.1rem',
                        padding: '1.25rem 1.5rem'
                      }}
                    >
                      <i className="fas fa-question-circle me-3 text-primary"></i>
                      {faq.question}
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
                        padding: '1.5rem',
                        lineHeight: '1.8',
                        fontSize: '1rem',
                        color: '#444'
                      }}
                    >
                      <div className="d-flex align-items-start">
                        <i className="fas fa-lightbulb text-warning me-3 mt-1"></i>
                        <div>
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
        
        <div className="text-center mt-5">
          <div className="alert alert-info" role="alert">
            <i className="fas fa-info-circle me-2"></i>
            还有其他问题？请联系我们的客服团队
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ; 
