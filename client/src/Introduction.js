import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl, buildImageUrl } from './config';
import './Introduction.css';

function Introduction() {
  const [introduction, setIntroduction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntroduction();
  }, []);

  const fetchIntroduction = async () => {
    try {
      const response = await axios.get(buildApiUrl('/api/introduction'));
      setIntroduction(response.data);
    } catch (error) {
      console.error('获取产品简介失�?', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">加载�?..</span>
          </div>
        </div>
      </div>
    );
  }

  if (!introduction || !introduction.visible) {
    return null;
  }

  return (
    <div className="container" style={{ marginTop: window.innerWidth <= 768 ? '8px' : '3rem' }}>
      {/* 主标�?*/}
      <div className="text-center" style={{ marginBottom: window.innerWidth <= 768 ? '8px' : '3rem' }}>
        <h1 className="display-4 fw-bold" style={{ 
          color: 'var(--secondary, #012baf)',
          fontSize: window.innerWidth <= 768 ? '1.5rem' : undefined,
          marginBottom: 0
        }}>
          {introduction.title}
        </h1>
      </div>

      {/* 内容区域 */}
      {introduction.sections
        .filter(section => section.visible)
        .sort((a, b) => a.order - b.order)
        .map((section, index) => (
          <div key={index} className="introduction-section row align-items-center" style={{ marginBottom: window.innerWidth <= 768 ? '8px' : '3rem' }}>
            {/* 左图右文布局 */}
            {section.layout === 'left-image' && section.imageUrl && (
              <>
                <div className="introduction-image col-md-6 mb-4 mb-md-0">
                  <img 
                    src={buildImageUrl(section.imageUrl)} 
                    alt={section.title}
                    className="img-fluid rounded shadow"
                    style={{ 
                      width: '100%', 
                      height: '300px', 
                      objectFit: 'cover',
                      borderRadius: '15px'
                    }}
                  />
                </div>
                
                <div className="introduction-content col-md-6">
                  <div className="card border-0 shadow-sm h-100" style={{
                    background: 'var(--white, #ffffff)',
                    borderRadius: '15px',
                    padding: '2rem'
                  }}>
                    <h3 className="card-title mb-3" style={{ 
                      color: 'var(--primary, #74efe1)',
                      fontWeight: '600'
                    }}>
                      {section.title}
                    </h3>
                    <p className="card-text" style={{ 
                      color: 'var(--text, #2c3e50)',
                      lineHeight: '1.8',
                      fontSize: '1.1rem'
                    }}>
                      {section.content}
                    </p>
                  </div>
                </div>
              </>
            )}
            
            {/* 左文右图布局 */}
            {section.layout === 'right-image' && section.imageUrl && (
              <>
                <div className="introduction-content col-md-6 mb-4 mb-md-0">
                  <div className="card border-0 shadow-sm h-100" style={{
                    background: 'var(--white, #ffffff)',
                    borderRadius: '15px',
                    padding: '2rem'
                  }}>
                    <h3 className="card-title mb-3" style={{ 
                      color: 'var(--primary, #74efe1)',
                      fontWeight: '600'
                    }}>
                      {section.title}
                    </h3>
                    <p className="card-text" style={{ 
                      color: 'var(--text, #2c3e50)',
                      lineHeight: '1.8',
                      fontSize: '1.1rem'
                    }}>
                      {section.content}
                    </p>
                  </div>
                </div>
                
                <div className="introduction-image col-md-6 mt-4 mt-md-0">
                  <img 
                    src={buildImageUrl(section.imageUrl)} 
                    alt={section.title}
                    className="img-fluid rounded shadow"
                    style={{ 
                      width: '100%', 
                      height: '300px', 
                      objectFit: 'cover',
                      borderRadius: '15px'
                    }}
                  />
                </div>
              </>
            )}
            
            {/* 只有文字没有图片的布局 */}
            {!section.imageUrl && (
              <div className="introduction-content col-12">
                <div className="card border-0 shadow-sm h-100" style={{
                  background: 'var(--white, #ffffff)',
                  borderRadius: '15px',
                  padding: '2rem'
                }}>
                  <h3 className="card-title mb-3" style={{ 
                    color: 'var(--primary, #74efe1)',
                    fontWeight: '600'
                  }}>
                    {section.title}
                  </h3>
                  <p className="card-text" style={{ 
                    color: 'var(--text, #2c3e50)',
                    lineHeight: '1.8',
                    fontSize: '1.1rem'
                  }}>
                    {section.content}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

export default Introduction; 
