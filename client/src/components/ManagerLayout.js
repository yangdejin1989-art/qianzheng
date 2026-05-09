// ManagerLayout.js
// 统一的管理页面布局组件
import React from 'react';

function ManagerLayout({ title, children, subtitle = null }) {
  return (
    <div className="manager-layout">
      {/* 页面标题区域 */}
      <div className="page-header mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h2 className="page-title mb-1">{title}</h2>
            {subtitle && <p className="page-subtitle text-muted mb-0">{subtitle}</p>}
          </div>
        </div>
        <hr className="mt-3 mb-4" />
      </div>

      {/* 内容区域 */}
      <div className="page-content">
        {children}
      </div>
    </div>
  );
}

export default ManagerLayout; 
