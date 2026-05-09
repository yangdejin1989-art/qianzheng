import React from 'react';

function TestNavigation() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>返回按钮功能测试</h2>
      <p>这个页面用于测试返回按钮是否能正确返回到上一页面。</p>
      
      <div style={{ marginTop: '20px' }}>
        <h3>测试步骤：</h3>
        <ol>
          <li>从首页点击"关于我们"或"公司信息"</li>
          <li>在子页面中点击"返回上一页"按钮</li>
          <li>验证是否返回到首页</li>
          <li>从首页点击某个套餐详情</li>
          <li>在套餐详情页点击"返回上一页"按钮</li>
          <li>验证是否返回到首页</li>
          <li>从首页进入后台管理</li>
          <li>在后台管理页面点击"返回上一页"按钮</li>
          <li>验证是否返回到首页</li>
        </ol>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h4>功能说明：</h4>
        <ul>
          <li>返回按钮现在会返回到用户之前访问的页面</li>
          <li>如果用户直接访问某个页面（没有历史记录），则返回首页</li>
          <li>页面历史记录会在用户导航时自动维护</li>
        </ul>
      </div>
    </div>
  );
}

export default TestNavigation; 