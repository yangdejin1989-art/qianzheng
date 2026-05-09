// AboutPage.js
// 关于我们页面组件
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl, buildImageUrl } from './config';
import './AboutPage.css';

function AboutPage({ onBack, aboutData }) {
  const [aboutContent, setAboutContent] = useState('');
  const [pageTitle, setPageTitle] = useState('关于我们');

  // 处理HTML内容中的图片URL
  const processHtmlContent = (htmlContent) => {
    if (!htmlContent) return '';
    
    console.log('🔍 处理前的HTML内容:', htmlContent);
    
    // 替换所有硬编码的localhost图片URL
    let processedContent = htmlContent;
    
    // 替换 http://localhost:5000 开头的图片URL
    processedContent = processedContent.replace(
      /src="http:\/\/localhost:5000([^"]*)"/g,
      (match, path) => {
        const newUrl = buildImageUrl(path);
        console.log('🔄 替换localhost图片URL:', match, '->', newUrl);
        return `src="${newUrl}"`;
      }
    );
    
    // 替换 http://127.0.0.1:5000 开头的图片URL
    processedContent = processedContent.replace(
      /src="http:\/\/127\.0\.0\.1:5000([^"]*)"/g,
      (match, path) => {
        const newUrl = buildImageUrl(path);
        console.log('🔄 替换127.0.0.1图片URL:', match, '->', newUrl);
        return `src="${newUrl}"`;
      }
    );
    
    // 替换相对路径的图片URL（确保以/开头）
    processedContent = processedContent.replace(
      /src="\/([^"]*)"/g,
      (match, path) => {
        const newUrl = buildImageUrl('/' + path);
        console.log('🔄 替换相对路径图片URL:', match, '->', newUrl);
        return `src="${newUrl}"`;
      }
    );
    
    console.log('✅ 处理后的HTML内容:', processedContent);
    return processedContent;
  };

  useEffect(() => {
        // 如果有传递的特定数据，使用传递的数据
    if (aboutData && aboutData.item) {
      const processedContent = processHtmlContent(aboutData.item.content || '暂无内容');
      setAboutContent(processedContent);
      setPageTitle(aboutData.item.title || '关于我们');
    } else {
      // 否则从API获取所有关于我们的内容
      axios.get(buildApiUrl('/api/footer'))
        .then(res => {
          console.log('📡 Footer API响应数据:', res.data);
          const content = res.data.about && Array.isArray(res.data.about) 
            ? res.data.about.map(item => item.content).join('')
            : res.data.about || '暂无内容';
          console.log('📝 提取的关于我们内容:', content);
          const processedContent = processHtmlContent(content);
          setAboutContent(processedContent);
          setPageTitle('关于我们');
        })
        .catch(err => {
          console.error('获取关于我们内容失败:', err);
          setAboutContent('内容加载失败，请稍后重试。');
          setPageTitle('关于我们');
        });
    }
  }, [aboutData]);

  return (
    <div className="about-page" style={{ 
      minHeight: '100vh',
      background: 'var(--page-gradient, linear-gradient(135deg, #74efe1 0%, #012baf 100%))',
      padding: '40px 20px',
      position: 'relative'
    }}>
      <div className="about-content" style={{
        maxWidth: 800,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 12,
        padding: 40,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        {/* 页面标题 */}
        <div className="about-title" style={{
          textAlign: 'center',
          marginBottom: 40,
          borderBottom: '3px solid #3498db',
          paddingBottom: 20
        }}>
          <h1 style={{
            color: '#2c3e50',
            fontSize: 32,
            fontWeight: 700,
            margin: 0
          }}>
            {pageTitle}
          </h1>
          <p style={{
            color: '#7f8c8d',
            fontSize: 16,
            margin: '10px 0 0 0'
          }}>
            季舒签证服务有限公司
          </p>
        </div>

        {/* 内容区域 */}
        <div 
          className="about-content-text"
          style={{
            fontSize: 16,
            lineHeight: 1.8,
            color: '#333',
            marginBottom: 40
          }}
          dangerouslySetInnerHTML={{ __html: aboutContent }}
        />

        {/* 返回按钮 */}
        <div style={{ textAlign: 'center' }}>
          <button 
            className="about-back-btn"
            onClick={onBack}
            style={{
              display: 'inline-block',
              background: '#3498db',
              color: '#fff',
              textDecoration: 'none',
              padding: '12px 30px',
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 500,
              transition: 'all 0.3s ease',
              border: '2px solid #3498db',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#2980b9';
              e.target.style.borderColor = '#2980b9';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#3498db';
              e.target.style.borderColor = '#3498db';
            }}
          >
            ← 返回
          </button>
        </div>

        {/* 底部信息 */}
        <div className="about-footer" style={{
          marginTop: 40,
          paddingTop: 20,
          borderTop: '1px solid #ecf0f1',
          textAlign: 'center',
          color: '#95a5a6',
          fontSize: 14
        }}>
          © {new Date().getFullYear()} 季舒签证. 保留所有权利.
        </div>
      </div>
    </div>
  );
}

export default AboutPage; 