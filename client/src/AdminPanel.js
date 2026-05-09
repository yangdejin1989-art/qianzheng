// AdminPanel.js
// 后台管理主页面
import React, { useState, useRef } from 'react';
import CarouselManager from './CarouselManager';
import FAQManager from './FAQManager';
import NoticeManager from './NoticeManager';
import IntroductionManager from './IntroductionManager';
import FooterManager from './FooterManager';
import PackageManager from './PackageManager';
import ApplicationManager from './ApplicationManager';
import ThemeManager from './ThemeManager';
import BlacklistManager from './components/BlacklistManager';
import LogManager from './components/LogManager';
import AdminStatistics from './components/AdminStatistics';
import SiteSettingsManager from './components/SiteSettingsManager';
import MaterialTemplateManager from './MaterialTemplateManager';
import UserManagement from './UserManagement';
import AccountSettings from './AccountSettings';
import FinancialReport from './FinancialReport';
import RecycleBin from './RecycleBin';

const menuList = [
  { key: 'application', label: '申请管理', icon: '●', permission: 'orderManagement' },
  { key: 'recycle-bin', label: '回收站', icon: '●', adminOnly: true }, // 只有管理员可访问
  { key: 'package', label: '签证类型管理', icon: '●', permission: 'packageManagement' },
  { key: 'question-template', label: '材料与问题管理', icon: '●', permission: 'templateManagement' },
  { key: 'introduction', label: '产品简介管理', icon: '●', permission: 'packageManagement' },
  { key: 'footer', label: '网站设置', icon: '●', hasSubMenu: true, permission: 'packageManagement' },
  { key: 'blacklist', label: '黑名单管理', icon: '●', permission: 'blacklistManagement' },
  { key: 'financial-report', label: '财务报表', icon: '●' }, // 所有角色都可访问，根据角色显示不同数据
  { key: 'logs', label: '日志管理', icon: '●', adminOnly: true }, // 只有管理员可访问
  { key: 'statistics', label: '数据统计', icon: '●', adminOnly: true }, // 只有管理员可访问
  { key: 'users', label: '用户管理', icon: '●', permission: 'userManagement' },
  { key: 'account', label: '个人设置', icon: '●', staffOnly: true }, // 只有员工显示，管理员在用户管理中编辑
];

const applicationSubTabs = [
  { key: 'all', label: '全部订单' },
  { key: 'pending', label: '待处理订单' },
  { key: 'confirm', label: '待确认订单' },
  { key: 'processing', label: '处理中订单' },
  { key: 'done', label: '已完成订单' },
  { key: 'cancel', label: '已取消订单' },
];

function AdminPanel({ token, onLogout, onBack }) {
  const [tab, setTab] = useState('application');
  const [applicationSubTab, setApplicationSubTab] = useState('all');
  const [subTab, setSubTab] = useState('about'); // 二级菜单状态
  const [expandedMenu, setExpandedMenu] = useState(null); // 展开的菜单

  const applicationManagerRef = useRef(null);
  const siteSettingsManagerRef = useRef(null);

  // 获取用户信息和权限
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const permissions = userInfo.permissions || {};
  const isAdmin = userInfo.role === 'admin';

  // 根据权限过滤菜单
  const filteredMenuList = menuList.filter(menu => {
    // 管理员不显示staffOnly的菜单
    if (menu.staffOnly && isAdmin) return false;
    // 管理员显示所有非staffOnly的菜单
    if (isAdmin) return true;
    // 员工不显示adminOnly的菜单
    if (menu.adminOnly) return false;
    // staffOnly的菜单对员工显示
    if (menu.staffOnly) return true;
    // 没有权限要求的菜单都显示
    if (!menu.permission) return true;
    // 检查是否有对应权限
    return permissions[menu.permission] === true;
  });

  const handleMenuClick = (menuKey) => {
    if (menuKey === 'footer') {
      // 如果点击的是底部内容管理，切换展开状态
      setExpandedMenu(expandedMenu === 'footer' ? null : 'footer');
      setTab('footer');
    } else if (menuKey === 'application') {
      // 如果点击的是申请管理，切换展开状态
      if (expandedMenu === 'application') {
        setExpandedMenu(null);
        // 收起时保持在申请管理页面，不切换标签页
      } else {
        setExpandedMenu('application');
        setTab('application');
      }
    } else if (menuKey === 'theme') {
      // 主题管理，切换到主题管理页面
      setTab('theme');
      setExpandedMenu(null);
    } else {
      setTab(menuKey);
      setExpandedMenu(null);
    }
  };

  const handleSubMenuClick = (subMenuKey) => {
    setSubTab(subMenuKey);
  };

  const handleSave = () => {
    if (tab === 'footer' && subTab === 'site-settings' && siteSettingsManagerRef.current) {
      siteSettingsManagerRef.current.handleSave();
    }
  };

  return (
    <div className="d-flex" style={{ background: '#f4f8fb', minHeight: '100vh' }}>
      {/* 左侧菜单栏 */}
      <div style={{ 
        width: 260, 
        minWidth: 260,
        background: '#1f2937', 
        borderRight: '1px solid #374151',
        boxShadow: '2px 0 8px rgba(0,0,0,0.3)',
        display: 'flex', 
        flexDirection: 'column', 
        padding: 0,
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 1000
      }}>
        <div style={{ 
          background: '#111827',
          borderBottom: '1px solid #374151',
          padding: '24px 0'
        }}>
          <div className="fw-bold text-center" style={{ 
            fontSize: 20, 
            letterSpacing: 0.5, 
            color: '#f9fafb'
          }}>
            后台管理系统
          </div>
          {/* 只有管理员显示用户信息 */}
          {isAdmin && (
            <div className="text-center mt-2" style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              {userInfo.displayName || userInfo.username} 
              <span className="ms-2 badge bg-danger" style={{ fontSize: '0.7rem' }}>
                管理员
              </span>
            </div>
          )}
        </div>
        <div className="flex-grow-1">
          {filteredMenuList.map(item => (
            <div key={item.key}>
              <button
                className="w-100 text-start btn border-0"
                style={{
                  borderRadius: '0',
                  background: tab === item.key ? '#374151' : 'transparent',
                  color: tab === item.key ? '#60a5fa' : '#d1d5db',
                  fontWeight: tab === item.key ? 600 : 500,
                  fontSize: 15,
                  padding: '16px 24px',
                  margin: '0',
                  letterSpacing: 0,
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxShadow: 'none',
                  borderLeft: tab === item.key ? '4px solid #60a5fa' : '4px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onClick={() => handleMenuClick(item.key)}
                onMouseOver={e => {
                  if (tab !== item.key) {
                    e.currentTarget.style.background = '#374151';
                    e.currentTarget.style.color = '#f3f4f6';
                  }
                }}
                onMouseOut={e => {
                  if (tab !== item.key) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#d1d5db';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    fontSize: '8px', 
                    color: tab === item.key ? '#60a5fa' : '#9ca3af',
                    transition: 'color 0.2s ease'
                  }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {(item.key === 'application' || item.hasSubMenu) && (
                  <span style={{ fontSize: 12, transition: 'transform 0.2s', transform: expandedMenu === item.key ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    ▶
                  </span>
                )}
              </button>
              {/* 申请管理二级菜单 */}
              {item.key === 'application' && expandedMenu === 'application' && (
                <div style={{ 
                  background: '#111827',
                  borderTop: '1px solid #374151'
                }}>
                  {applicationSubTabs.map(sub => (
                    <button
                      key={sub.key}
                      className="w-100 text-start btn btn-sm border-0"
                      style={{
                        borderRadius: '0',
                        background: applicationSubTab === sub.key ? '#1e40af' : 'transparent',
                        color: applicationSubTab === sub.key ? '#ffffff' : '#9ca3af',
                        fontWeight: applicationSubTab === sub.key ? 600 : 400,
                        fontSize: 14,
                        padding: '12px 48px',
                        margin: '0',
                        letterSpacing: 0,
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        boxShadow: 'none',
                        borderLeft: applicationSubTab === sub.key ? '4px solid #60a5fa' : '4px solid transparent',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setApplicationSubTab(sub.key);
                        // 如果ApplicationManager在详情页面，通知它返回列表
                        if (applicationManagerRef && applicationManagerRef.current) {
                          applicationManagerRef.current.handleSubTabChange(sub.key);
                        }
                      }}
                      onMouseOver={e => {
                        if (applicationSubTab !== sub.key) {
                          e.currentTarget.style.background = '#374151';
                          e.currentTarget.style.color = '#d1d5db';
                        }
                      }}
                      onMouseOut={e => {
                        if (applicationSubTab !== sub.key) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#9ca3af';
                        }
                      }}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
              {/* 其他二级菜单 */}
              {item.hasSubMenu && expandedMenu === item.key && (
                <div style={{ 
                  background: '#111827',
                  borderTop: '1px solid #374151'
                }}>
                  {[
                    { key: 'carousel', label: '轮播图管理' },
                    { key: 'faq', label: '常见问题管理' },
                    { key: 'notice', label: '公告栏管理' },
                    { key: 'theme', label: '主题管理' },
                    { key: 'about', label: '关于我们' },
                    { key: 'companyInfo', label: '公司信息' },
                    { key: 'contacts', label: '联系方式/二维码' },
                    { key: 'site-settings', label: 'Logo与公司名称' }
                  ].map(subItem => (
                    <button
                      key={subItem.key}
                      className="w-100 text-start btn btn-sm border-0"
                      style={{
                        borderRadius: '0',
                        background: subTab === subItem.key ? '#1e40af' : 'transparent',
                        color: subTab === subItem.key ? '#ffffff' : '#9ca3af',
                        fontWeight: subTab === subItem.key ? 600 : 400,
                        fontSize: 14,
                        padding: '12px 48px',
                        margin: '0',
                        letterSpacing: 0,
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        boxShadow: 'none',
                        borderLeft: subTab === subItem.key ? '4px solid #60a5fa' : '4px solid transparent',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSubMenuClick(subItem.key)}
                      onMouseOver={e => {
                        if (subTab !== subItem.key) {
                          e.currentTarget.style.background = '#374151';
                          e.currentTarget.style.color = '#d1d5db';
                        }
                      }}
                      onMouseOut={e => {
                        if (subTab !== subItem.key) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#9ca3af';
                        }
                      }}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* 右侧内容区 */}
      <div style={{ 
        flex: 1, 
        marginLeft: 260,
        padding: '32px 24px', 
        background: '#fff',
        minHeight: '100vh',
        overflow: 'visible'
      }}>
        {/* 保存按钮 - 只在site-settings页面显示 */}
        {tab === 'footer' && subTab === 'site-settings' && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000
          }}>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              💾 保存设置
            </button>
          </div>
        )}
        {tab === 'application' && <ApplicationManager 
          ref={applicationManagerRef}
          token={token} 
          subTab={applicationSubTab}
          currentUser={userInfo}
        />}
        {tab === 'recycle-bin' && <RecycleBin token={token} />}
        {tab === 'package' && <PackageManager token={token} />}
        {tab === 'question-template' && <MaterialTemplateManager token={token} />}
        {tab === 'introduction' && <IntroductionManager token={token} />}
        {tab === 'footer' && subTab === 'carousel' && <CarouselManager token={token} />}
        {tab === 'footer' && subTab === 'faq' && <FAQManager token={token} />}
        {tab === 'footer' && subTab === 'notice' && <NoticeManager token={token} />}
        {tab === 'footer' && subTab === 'theme' && <ThemeManager />}
        {tab === 'footer' && subTab !== 'carousel' && subTab !== 'faq' && subTab !== 'notice' && subTab !== 'theme' && subTab !== 'site-settings' && <FooterManager token={token} subTab={subTab} />}
        {tab === 'footer' && subTab === 'site-settings' && <SiteSettingsManager ref={siteSettingsManagerRef} onSave={handleSave} />}
        {tab === 'blacklist' && <BlacklistManager />}
        {tab === 'financial-report' && <FinancialReport token={token} currentUser={userInfo} />}
        {tab === 'logs' && <LogManager token={token} />}
        {tab === 'statistics' && <AdminStatistics />}
        {tab === 'users' && <UserManagement />}
        {tab === 'account' && <AccountSettings />}
      </div>
      {/* 固定在左下角的按钮 */}
      <div style={{
        position: 'fixed',
        left: 0,
        bottom: 0,
        width: 260,
        background: '#111827',
        borderTop: '1px solid #374151',
        borderRight: '1px solid #374151',
        zIndex: 1001,
        textAlign: 'center',
        padding: '20px 16px'
      }}>
        <button 
          className="btn btn-sm me-2" 
          onClick={onBack}
          style={{
            background: '#374151',
            border: '1px solid #4b5563',
            color: '#d1d5db',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#4b5563';
            e.currentTarget.style.color = '#f9fafb';
            e.currentTarget.style.borderColor = '#6b7280';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#374151';
            e.currentTarget.style.color = '#d1d5db';
            e.currentTarget.style.borderColor = '#4b5563';
          }}
        >
          返回
        </button>
        <button 
          className="btn btn-sm" 
          onClick={onLogout}
          style={{
            background: '#dc2626',
            border: 'none',
            color: '#fff',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#b91c1c';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#dc2626';
          }}
        >
          退出登录
        </button>
      </div>


    </div>
  );
}

export default AdminPanel; 