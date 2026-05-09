// App.js
// 主页主入口，包含导航栏、轮播图、套餐卡片、表单和进度查询等主要页面逻辑
// 组件说明：
// Home：主页内容，包括轮播图、Banner、套餐卡片
// Navbar：顶部导航栏，切换页面
// App：主组件，负责页面切换和整体布局
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ApplyForm from './ApplyForm';
import StatusQuery from './StatusQuery';
import NoticeBoard from './NoticeBoard';
import HomeNoticeBoard from './HomeNoticeBoard';
import AllNoticesPage from './AllNoticesPage';
import FAQ from './FAQ';
import HomeFAQ from './HomeFAQ';
import AllFAQPage from './AllFAQPage';
import Introduction from './Introduction';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';
import Footer from './Footer';
import AboutPage from './AboutPage';
import CompanyPage from './CompanyPage';
import PackageDetail from './PackageDetail';
import StatisticsDashboard from './StatisticsDashboard';

import { getCurrentTheme, applyTheme } from './themes';
import { buildApiUrl, buildImageUrl } from './config';
import './App.css';
import './styles/ManagerStyles.css';

// 货币符号映射
const getCurrencySymbol = (currency) => {
  const symbols = {
    'CNY': '¥',
    'JPY': '¥',
    'USD': '$',
    'EUR': '€'
  };
  return symbols[currency] || '¥';
};

// 货币名称映射
const getCurrencyName = (currency) => {
  const names = {
    'CNY': '人民币',
    'JPY': '日元',
    'USD': '美元',
    'EUR': '欧元'
  };
  return names[currency] || '人民币';
};


function Home({ onApply, onPackageClick }) {
  const [carouselImages, setCarouselImages] = useState([]);
  const [packages, setPackages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [carouselHeight, setCarouselHeight] = useState(550);
  
  useEffect(() => {
    // 检测是否为移动端并计算轮播图高度
    const checkMobile = () => {
      const windowWidth = window.innerWidth;
      const isMobileDevice = windowWidth <= 768;
      setIsMobile(isMobileDevice);
      
      // 手机端：高度为宽度的二分之一
      if (isMobileDevice) {
        setCarouselHeight(windowWidth / 2);
      } else {
        setCarouselHeight(550);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // 获取轮播图
    axios.get(buildApiUrl('/api/carousels')).then(res => {
      setCarouselImages(res.data.filter(img => img.visible).sort((a, b) => a.order - b.order));
    });
    
    // 获取套餐数据
    axios.get(buildApiUrl('/api/packages')).then(res => {
      setPackages(res.data);
    }).catch(err => {
      console.error('获取套餐数据失败:', err);
    });
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div>
      {/* 轮播图放在最上方，container 外部 */}
      <div id="visaCarousel" className="carousel slide" data-bs-ride="carousel" style={{
        width: '100%',
        height: `${carouselHeight}px`,
        minHeight: `${carouselHeight}px`,
        maxHeight: `${carouselHeight}px`,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: isMobile ? '8px' : '0'
      }}>
        <div className="carousel-inner" style={{ 
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {carouselImages.map((img, idx) => (
            <div 
              className={`carousel-item${idx === 0 ? ' active' : ''}`} 
              key={img._id} 
              style={{ 
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: isMobile ? 'absolute' : 'relative',
                top: 0,
                left: 0
              }}
            >
              <img
                src={buildImageUrl(img.imageUrl)}
                alt={`轮播${idx+1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: isMobile ? 'center center' : (img.position || 'center'),
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
              />
            </div>
          ))}
        </div>
        <button 
          className="carousel-control-prev" 
          type="button" 
          data-bs-target="#visaCarousel" 
          data-bs-slide="prev"
          style={{ zIndex: 10 }}
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">上一张</span>
        </button>
        <button 
          className="carousel-control-next" 
          type="button" 
          data-bs-target="#visaCarousel" 
          data-bs-slide="next"
          style={{ zIndex: 10 }}
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">下一张</span>
        </button>
      </div>
      {/* container 内部是 Banner 和套餐卡片 */}
      <div className="container" style={{ paddingLeft: isMobile ? '6px' : '15px', paddingRight: isMobile ? '6px' : '15px', marginTop: isMobile ? '0' : '10px' }}>
        {/* Banner */}
        <div className="bg-primary text-white rounded-3" style={{ padding: isMobile ? '10px 12px' : '2rem 2.5rem' }}>
          <h1 className={isMobile ? 'h5 fw-bold mb-1' : 'display-5 fw-bold'} style={{ marginBottom: isMobile ? undefined : '0.75rem' }}>欢迎使用季舒签证服务</h1>
          <p className={isMobile ? 'mb-1' : 'lead'} style={{ fontSize: isMobile ? '0.85rem' : undefined, lineHeight: isMobile ? '1.3' : '1.5', marginBottom: isMobile ? undefined : '0.75rem' }}>专业、高效、贴心的签证办理服务，满足您的出国需求。</p>
          <button className={`btn btn-light ${isMobile ? 'btn-sm' : 'btn-lg'}`} style={{ marginTop: isMobile ? '4px' : 0, fontSize: isMobile ? '0.8rem' : undefined, padding: isMobile ? '4px 12px' : undefined }} onClick={onApply}>立即申请签证</button>
        </div>
        {/* 套餐卡片 */}
        <div className="row" style={{ marginTop: isMobile ? '8px' : '24px', marginLeft: isMobile ? 0 : '-12px', marginRight: isMobile ? 0 : '-12px' }}>
          {packages.map((pkg, index) => (
            <div key={pkg._id} className={isMobile ? 'col-12' : 'col-md-4'} style={{ paddingLeft: isMobile ? '6px' : '12px', paddingRight: isMobile ? '6px' : '12px', marginBottom: isMobile ? '6px' : '24px' }}>
              <div className="card h-100 d-flex flex-column">
                {pkg.imageUrl && (
                  <div style={{
                    width: '100%',
                    height: isMobile ? '150px' : '180px',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={buildImageUrl(pkg.imageUrl)}
                      alt={pkg.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        objectPosition: 'top center'
                      }}
                    />
                  </div>
                )}
                <div className="card-body flex-grow-1 d-flex flex-column" style={{ padding: isMobile ? '10px 12px' : '0.9rem 1rem' }}>
                  <h5 className="card-title" style={{ fontSize: isMobile ? '1rem' : '1.1rem', marginBottom: isMobile ? '4px' : '0.4rem' }}>{pkg.name}</h5>
                  <p className="text-muted" style={{ fontSize: isMobile ? '0.8rem' : '0.85rem', marginBottom: isMobile ? '6px' : '0.4rem' }}>{pkg.speed}</p>
                  <div style={{ marginBottom: isMobile ? '8px' : '0.6rem' }}>
                    {/* 显示所有签证类型和价格 */}
                    {pkg.visaTypes && pkg.visaTypes.length > 0 ? (
                      <div>
                        {pkg.visaTypes.map((vt, vtIdx) => (
                          <div key={vtIdx} style={{ 
                            marginBottom: isMobile ? '6px' : '0.35rem', 
                            paddingBottom: isMobile ? '6px' : '0.35rem', 
                            borderBottom: vtIdx < pkg.visaTypes.length - 1 ? '1px dashed #e0e0e0' : 'none' 
                          }}>
                            <div className="badge bg-info text-dark" style={{ fontSize: isMobile ? '0.7rem' : '0.7rem', marginBottom: isMobile ? '2px' : '0.2rem' }}>{vt.type}</div>
                            <div className="d-flex align-items-center flex-wrap">
                              <span className="text-danger fw-bold me-2 mb-0" style={{ fontSize: isMobile ? '1rem' : '1.15rem' }}>
                                {getCurrencySymbol(vt.currency)}{vt.price}/次
                              </span>
                              {vt.originalPrice && vt.originalPrice > vt.price && (
                                <span className="text-muted text-decoration-line-through me-2" style={{ fontSize: isMobile ? '0.75rem' : '0.85rem' }}>
                                  {getCurrencySymbol(vt.currency)}{vt.originalPrice}
                                </span>
                              )}
                              <span className="text-muted" style={{ fontSize: isMobile ? '0.65rem' : '0.7rem' }}>({getCurrencyName(vt.currency)})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {pkg.visaType && (
                          <div className="badge bg-info text-dark mb-2">{pkg.visaType}</div>
                        )}
                        <div className="d-flex align-items-center">
                          <span className="h5 text-danger fw-bold me-2">
                            {getCurrencySymbol(pkg.currency)}{pkg.price}/次
                            <span className="fs-6 text-muted ms-1">({getCurrencyName(pkg.currency)})</span>
                          </span>
                          {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                            <span className="text-muted text-decoration-line-through">
                              {getCurrencySymbol(pkg.currency)}{pkg.originalPrice}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <p className="card-text" style={{ fontSize: isMobile ? '0.8rem' : '0.875rem', marginBottom: isMobile ? '6px' : '0.5rem', lineHeight: isMobile ? '1.3' : '1.4' }}>{pkg.description}</p>
                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="list-unstyled" style={{ marginBottom: isMobile ? '8px' : '0.6rem' }}>
                      {pkg.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} style={{ marginBottom: isMobile ? '3px' : '0.2rem', fontSize: isMobile ? '0.75rem' : '0.85rem' }}>
                          <i className="fas fa-check text-success me-1" style={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-auto">
                    <button
                      className={`btn btn-primary w-100 ${isMobile ? 'btn-sm' : ''}`}
                      style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', padding: isMobile ? '6px 12px' : '0.5rem 1rem' }}
                      onClick={() => onPackageClick(pkg._id)}
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 产品简介 */}
        <Introduction />
      </div>
    </div>
  );
}

function Navbar({ onNav, current }) {
  const [siteSettings, setSiteSettings] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchSiteSettings();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const fetchSiteSettings = async () => {
    try {
      const response = await axios.get(buildApiUrl('/api/site-settings'));
      setSiteSettings(response.data);
      console.log('网站设置加载成功:', response.data);
    } catch (err) {
      console.error('获取网站设置失败:', err);
      // 使用默认设置
      setSiteSettings({
        siteName: '季舒签证',
        logoUrl: '/logo192.png'
      });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{
      background: '#F1F5FF',
      boxShadow: 'none',
      marginBottom: 0,
      paddingBottom: 0,
      borderBottom: 'none',
      position: 'relative',
      padding: isMobile ? '8px 0' : '0.5rem 0'
    }}>
      <div className="container" style={{ 
        padding: isMobile ? '0 8px' : undefined,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap'
      }}>
        {/* Logo区域 */}
        <div className="navbar-brand d-flex align-items-center" style={{
          fontWeight: 700, 
          fontSize: isMobile ? '14px' : 'clamp(18px, 4vw, 24px)',
          flex: '0 0 auto',
          marginRight: isMobile ? '8px' : 'auto',
          color: '#1a365d',
          marginBottom: 0
        }}>
          <img 
            src={siteSettings?.logoUrl || '/logo192.png'} 
            alt="Logo" 
            style={{
              width: isMobile ? '36px' : 'clamp(40px, 8vw, 60px)',
              height: isMobile ? '36px' : 'clamp(40px, 8vw, 60px)',
              minWidth: isMobile ? '36px' : '40px',
              minHeight: isMobile ? '36px' : '40px',
              marginRight: isMobile ? '6px' : 'clamp(8px, 2vw, 12px)',
              borderRadius: 6,
              objectFit: 'contain',
              flexShrink: 0,
              aspectRatio: '1 / 1'
            }}
            onError={(e) => {
              console.error('Logo加载失败:', e.target.src);
              e.target.src = '/logo192.png';
            }}
            onLoad={() => console.log('Logo加载成功:', siteSettings?.logoUrl)}
          />
          <span style={{ 
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: isMobile ? '80px' : 'none'
          }}>
            {siteSettings?.siteName || '季舒文化'}
          </span>
        </div>
        
        {/* 导航菜单 */}
        <div className="navbar-nav" style={{
          display: 'flex',
          flexDirection: 'row',
          gap: isMobile ? '0' : 'clamp(8px, 2vw, 16px)',
          alignItems: 'center',
          flex: '0 0 auto'
        }}>
          <button
            className={`btn btn-link nav-link p-0${current === 'home' ? ' active' : ''}`}
            style={{ 
              color: '#1a365d', 
              fontWeight: 600, 
              fontSize: isMobile ? '11px' : 'clamp(14px, 3vw, 18px)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              padding: isMobile ? '4px 3px' : '8px 12px',
              borderRadius: '3px',
              transition: 'all 0.2s ease',
              margin: 0
            }}
            onClick={() => onNav('home')}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(26,54,93,0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            首页
          </button>
          <button
            className={`btn btn-link nav-link p-0${current === 'admin' ? ' active' : ''}`}
            style={{ 
              color: '#1a365d', 
              fontWeight: 600, 
              fontSize: isMobile ? '11px' : 'clamp(14px, 3vw, 18px)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              padding: isMobile ? '4px 3px' : '8px 12px',
              borderRadius: '3px',
              transition: 'all 0.2s ease',
              margin: 0
            }}
            onClick={() => onNav('admin')}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(26,54,93,0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            登录
          </button>
          <button
            className={`btn btn-link nav-link p-0${current === 'apply' ? ' active' : ''}`}
            style={{ 
              color: '#1a365d', 
              fontWeight: 600, 
              fontSize: isMobile ? '11px' : 'clamp(14px, 3vw, 18px)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              padding: isMobile ? '4px 3px' : '8px 12px',
              borderRadius: '3px',
              transition: 'all 0.2s ease',
              margin: 0
            }}
            onClick={() => onNav('apply')}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(26,54,93,0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            签证申请
          </button>
          <button
            className={`btn btn-link nav-link p-0${current === 'status' ? ' active' : ''}`}
            style={{ 
              color: '#1a365d', 
              fontWeight: 600, 
              fontSize: isMobile ? '11px' : 'clamp(14px, 3vw, 18px)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              padding: isMobile ? '4px 3px' : '8px 12px',
              borderRadius: '3px',
              transition: 'all 0.2s ease',
              margin: 0
            }}
            onClick={() => onNav('status')}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(26,54,93,0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            查询进度
          </button>
        </div>
      </div>
      
      {/* 渐变分割线 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
      }}></div>
    </nav>
  );
}

function App() {
  const [page, setPage] = useState('home');
  const [successId, setSuccessId] = useState(null);
  const [adminToken, setAdminToken] = useState(null);

  const [pageData, setPageData] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  // 初始化主题和浏览器历史记录
  useEffect(() => {
    // 支持从邮件链接直接打开状态查询并携带token
    try {
      const url = new URL(window.location.href);
      const token = url.searchParams.get('token');
      const open = url.searchParams.get('open');
      const pageParam = url.searchParams.get('page');
      if (token && (!pageParam || pageParam === 'status')) {
        setPage('status');
        // 将 token 暂存到 sessionStorage，供 StatusQuery 读取
        sessionStorage.setItem('statusQueryToken', token);
        if (open === 'materials') {
          sessionStorage.setItem('statusQueryOpenMaterials', '1');
        }
      }
    } catch {}
    
    const theme = getCurrentTheme();
    applyTheme(theme);

    // 禁用浏览器默认的滚动恢复，我们手动控制
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 初始化浏览器历史记录
    if (window.history.state === null) {
      window.history.replaceState({ page: 'home', scrollY: 0 }, '', window.location.href);
    }

    // 监听浏览器的前进后退按钮
    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        console.log('返回到页面:', event.state.page, '滚动位置:', event.state.scrollY);
        
        const targetScrollY = event.state.scrollY || 0;
        
        // 切换页面
        setPage(event.state.page);
        
        // 在下一个事件循环中恢复滚动位置，确保DOM已更新
        setTimeout(() => {
          window.scrollTo(0, targetScrollY);
          console.log('恢复滚动位置到:', targetScrollY);
        }, 50);
      } else {
        // 如果没有状态，默认返回首页
        setPage('home');
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 50);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 导航到指定页面，并记录历史
  const navigateTo = (newPage, data = null) => {
    // 保存当前页面的滚动位置到浏览器历史
    const currentScrollY = window.scrollY;
    const currentState = { page, scrollY: currentScrollY };
    console.log('保存页面', page, '的滚动位置:', currentScrollY);
    window.history.replaceState(currentState, '', window.location.href);
    
    // 推入新页面到浏览器历史
    const newState = { page: newPage, scrollY: 0 };
    window.history.pushState(newState, '', window.location.href);
    
    setPage(newPage);
    if (data) setPageData(data);
    setSuccessId(null);
    
    // 前进导航时滚动到页面顶部，延迟确保DOM更新完成
    setTimeout(() => {
      window.scrollTo(0, 0);
      console.log('前进导航，滚动到顶部');
    }, 50);
  };

  // 返回上一页 - 使用浏览器原生后退
  const goBack = () => {
    // 保存当前滚动位置
    const currentScrollY = window.scrollY;
    const currentState = { page, scrollY: currentScrollY };
    console.log('返回前保存页面', page, '的滚动位置:', currentScrollY);
    window.history.replaceState(currentState, '', window.location.href);
    
    // 使用浏览器原生后退
    console.log('执行浏览器后退');
    window.history.back();
  };

  // 管理端入口
  if (page === 'admin') {
    if (!adminToken) {
      return <AdminLogin onLogin={setAdminToken} onBack={goBack} />;
    }
    return <AdminPanel token={adminToken} onLogout={() => setAdminToken(null)} onBack={goBack} />;
  }

  // 关于我们页面
  if (page === 'about') {
    return <AboutPage onBack={goBack} aboutData={pageData} />;
  }

  // 公司信息页面
  if (page === 'company') {
    return <CompanyPage onBack={goBack} companyData={pageData} />;
  }

  // 所有FAQ页面
  if (page === 'all-faq') {
    return <AllFAQPage onBack={goBack} />;
  }

  // 所有公告页面
  if (page === 'all-notices') {
    return <AllNoticesPage onBack={goBack} />;
  }

  // 统计仪表板页面
  if (page === 'statistics') {
    return <StatisticsDashboard />;
  }



  return (
    <div>
      <Navbar onNav={(p) => { 
        navigateTo(p); 
      }} current={page} />
      {page === 'home' && (
        <>
          <Home 
              onApply={() => navigateTo('apply')} 
            onPackageClick={(packageId) => {
              setSelectedPackageId(packageId);
                navigateTo('package-detail');
            }}
          />
        </>
      )}
      <main style={page === 'home' ? { marginTop: 0 } : {}}>
        {page === 'home' && (
          <>
            <HomeNoticeBoard onViewMore={() => navigateTo('all-notices')} />
            <HomeFAQ onViewMore={() => navigateTo('all-faq')} />
          </>
        )}
        {page === 'apply' && !successId && (
          <div className="container mt-4">
            <ApplyForm onSuccess={(applyCode) => {
              setSuccessId(applyCode);
            }} />
          </div>
        )}
        {page === 'apply' && successId && (
          <div className="container mt-4">
            <div className="alert alert-success text-center">
              <h2>申请提交成功！</h2>
              <p>您的申请编码：<b>{successId}</b></p>
              <div className="mt-3">
                <p className="text-muted">请妥善保存以上信息以便后续查询进度。</p>
                <p className="text-muted small">查询方式：</p>
                <ul className="text-muted small text-start d-inline-block">
                  <li>方式一：姓名 + 手机号 + 邮箱验证</li>
                  <li>方式二：姓名 + 申请编码 + 邮箱验证</li>
                </ul>
              </div>
              <button className="btn btn-secondary mt-3" onClick={() => {
                setSuccessId(null);
              }}>再提交一份</button>
            </div>
          </div>
        )}
        {page === 'status' && (
          <div className="container mt-4">
            <StatusQuery />
          </div>
        )}
        {page === 'package-detail' && (
          <PackageDetail 
            packageId={selectedPackageId}
            onBack={goBack}
            onApply={() => navigateTo('apply')}
          />
        )}
      </main>
      <Footer onNavigate={(pageName, data) => {
        navigateTo(pageName, data);
      }} />
      

    </div>
  );
}

export default App;
