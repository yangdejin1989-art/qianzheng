import React, { useState } from 'react';
import './OptimizedImage.css';

/**
 * 优化的图片组件
 * 用于控制图片大小，防止超出画面
 */
function OptimizedImage({ src, alt = '', className = '', style = {} }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <div className={`optimized-image-error ${className}`} style={style}>
        <div className="error-content">
          <span>图片加载失败</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`optimized-image-container ${className}`} style={style}>
      <img
        src={src}
        alt={alt}
        className={`optimized-image ${imageLoaded ? 'loaded' : ''}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
      {!imageLoaded && !imageError && (
        <div className="image-loading">
          <div className="loading-spinner"></div>
          <span>加载中...</span>
        </div>
      )}
    </div>
  );
}

export default OptimizedImage; 
