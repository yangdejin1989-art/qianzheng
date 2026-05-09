import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl, buildImageUrl } from './config';

// 货币符号映射
const getCurrencySymbol = (currency) => {
  const symbols = {
    'CNY': '¥',
    'JPY': '¥',
    'USD': '$',
    'EUR': '�?
  };
  return symbols[currency] || '¥';
};

const getCurrencyName = (currency) => {
  const names = {
    'CNY': '人民�?,
    'JPY': '日元',
    'USD': '美元',
    'EUR': '欧元'
  };
  return names[currency] || '人民�?;
};

function PackageDetail({ packageId, onBack, onApply }) {
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyForm, setApplyForm] = useState({
    name: '',
    phoneCountryCode: '+81',
    phone: '',
    address: '',
    packageId: '',
    email: '',
    wechat: '',
    line: '',
    notes: ''
  });
  const [selectedVisaTypeIndex, setSelectedVisaTypeIndex] = useState(0); // 选择的签证类型索�?  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [successId, setSuccessId] = useState('');
  
  // 客户类型相关状�?  const [customerTypes, setCustomerTypes] = useState([]);
  const [showCustomerTypePicker, setShowCustomerTypePicker] = useState(false); // 移动端选择�?  const [selectedCustomerType, setSelectedCustomerType] = useState('');
  
  // 多人申请相关状�?  const [applicantCount, setApplicantCount] = useState(1);
  const [additionalApplicants, setAdditionalApplicants] = useState([]);

  // 移动端检�?  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 滚动锁定：当弹窗打开时完全锁定背景滚�?  useEffect(() => {
    if (showCustomerTypePicker && isMobile) {
      // 保存当前滚动位置
      const scrollY = window.scrollY;
      
      // 完全锁定背景：使�?fixed 定位，但保持视觉位置不变
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // 恢复样式，但不改变滚动位�?        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        // 注意：不调用 scrollTo，让浏览器自然恢�?      };
    }
  }, [showCustomerTypePicker, isMobile]);

  // 加载客户类型（从材料模板获取�?  const loadCustomerTypes = async (packageId) => {
    try {
      const response = await axios.get(buildApiUrl(`/api/material-templates/package/${packageId}`));
      if (response.data && response.data.customerTypes) {
        setCustomerTypes(response.data.customerTypes);
        console.log('客户类型:', response.data.customerTypes);
      }
    } catch (err) {
      console.error('获取客户类型失败:', err);
    }
  };

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await axios.get(buildApiUrl(`/api/packages/${packageId}`));
        setPackageData(response.data);
        // 设置套餐ID而不是名�?        setApplyForm(prev => ({ ...prev, packageId: response.data._id }));
        // 如果有多个签证类型，默认选择第一�?        if (response.data.visaTypes && response.data.visaTypes.length > 0) {
          setSelectedVisaTypeIndex(0);
        }
        // 加载客户类型
        loadCustomerTypes(response.data._id);
      } catch (err) {
        setError('套餐信息加载失败');
        console.error('获取套餐详情失败:', err);
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  // 关闭弹窗的处理函数（防止滚动�?  const handleClosePicker = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowCustomerTypePicker(false);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    
    // 验证必填字段
    if (!applyForm.name || !applyForm.phone || !applyForm.address || !applyForm.packageId) {
      setError('请填写所有必填字�?);
      return;
    }

    // 验证微信或LINE至少填一�?    if (!applyForm.wechat && !applyForm.line) {
      setError('请至少填写微信号或LINE号其中一个，方便我们与您联系');
      return;
    }

    // 验证手机号格式（国际格式�?-15位数字）
    const phoneRegex = /^\d{8,15}$/;
    if (!phoneRegex.test(applyForm.phone)) {
      setError('请输入正确的手机号码�?-15位数字）');
      return;
    }

    // 验证邮箱格式（如果填写了邮箱�?    if (applyForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(applyForm.email)) {
        setError('请输入正确的邮箱地址');
        return;
      }
    }

    setApplyLoading(true);
    setError('');

    try {
      // 获取选择的签证类型信�?      let visaType = '';
      let visaPrice = 0;
      let visaCurrency = 'CNY';
      
      if (packageData) {
        if (packageData.visaTypes && packageData.visaTypes.length > 0) {
          // 有多个签证类型，使用用户选择�?          const selectedVisaType = packageData.visaTypes[selectedVisaTypeIndex];
          if (selectedVisaType) {
            visaType = selectedVisaType.type || '';
            visaPrice = selectedVisaType.price || 0;
            visaCurrency = selectedVisaType.currency || 'CNY';
          }
        } else if (packageData.visaType) {
          // 旧格式，只有一个签证类�?          visaType = packageData.visaType;
          visaPrice = packageData.price || 0;
          visaCurrency = packageData.currency || 'CNY';
        }
      }
      
      // 构建提交数据
      const submitData = {
        ...applyForm,
        phone: `${applyForm.phoneCountryCode} ${applyForm.phone}`, // 合并国家代码和号�?        visaType: visaType,        // 签证次数（单次、多次等�?        visaPrice: visaPrice,      // 价格
        visaCurrency: visaCurrency // 币种
      };
      
      // 添加客户类型（如果选择了）
      if (selectedCustomerType) {
        submitData.customerType = {
          typeId: selectedCustomerType,
          typeName: customerTypes.find(ct => ct.typeId === selectedCustomerType)?.typeName || ''
        };
      }
      
      const response = await axios.post(buildApiUrl('/api/applications'), submitData);
      setSuccessId(response.data.applyCode);
      setApplySuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || '申请提交失败，请重试');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setApplyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">加载�?..</span>
          </div>
          <p className="mt-3">正在加载套餐信息...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>加载失败</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={onBack}>
            返回
          </button>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h4>套餐不存�?/h4>
          <p>您访问的套餐可能已被删除或下架�?/p>
          <button className="btn btn-primary" onClick={onBack}>
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ 
      marginTop: isMobile ? '8px' : '1rem',
      paddingLeft: isMobile ? '8px' : '15px',
      paddingRight: isMobile ? '8px' : '15px'
    }}>
      {/* 返回按钮 */}
      <div style={{ marginBottom: isMobile ? '10px' : '1.5rem' }}>
        <button 
          className={`btn btn-outline-secondary ${isMobile ? 'btn-sm' : ''}`}
          onClick={onBack}
          style={{
            fontSize: isMobile ? '0.85rem' : undefined,
            padding: isMobile ? '6px 12px' : undefined,
            borderRadius: isMobile ? '20px' : undefined
          }}
        >
          �?返回
        </button>
      </div>

      {/* 套餐详情 */}
      <div className="row">
        <div className="col-lg-8">
          {/* 套餐图片 */}
          {packageData.imageUrl && (
            <div style={{
              width: '100%',
              height: isMobile ? '200px' : '400px',
              borderRadius: isMobile ? '8px' : '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: isMobile ? '12px' : '1.5rem'
            }}>
              <img
                src={buildImageUrl(packageData.imageUrl)}
                alt={packageData.name}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  objectPosition: 'top center'
                }}
              />
            </div>
          )}

          {/* 套餐基本信息 */}
          <div className="card" style={{ marginBottom: isMobile ? '12px' : '1.5rem' }}>
            <div className="card-body" style={{ padding: isMobile ? '12px' : '1.25rem' }}>
              <h2 className="card-title" style={{ 
                fontSize: isMobile ? '1.3rem' : '2rem',
                marginBottom: isMobile ? '8px' : '0.5rem'
              }}>
                {packageData.name}
              </h2>
              <p className="text-muted" style={{ 
                marginBottom: isMobile ? '10px' : '1rem',
                fontSize: isMobile ? '0.85rem' : '1rem'
              }}>
                {packageData.speed}
              </p>
              
              <div style={{ marginBottom: isMobile ? '10px' : '1rem' }}>
                {/* 显示所有签证类型及价格 */}
                {packageData.visaTypes && packageData.visaTypes.length > 0 ? (
                  <div>
                    <h5 style={{ 
                      marginBottom: isMobile ? '8px' : '1rem',
                      fontSize: isMobile ? '1rem' : '1.25rem'
                    }}>
                      签证类型与价�?                    </h5>
                    {packageData.visaTypes.map((vt, index) => (
                      <div 
                        key={index} 
                        className={isMobile ? '' : 'd-flex align-items-center'}
                        style={{ 
                          marginBottom: isMobile ? '10px' : '1rem',
                          padding: isMobile ? '10px' : '1rem',
                          border: '1px solid #dee2e6',
                          borderRadius: '8px',
                          backgroundColor: '#f8f9fa'
                        }}
                      >
                        <div className="badge bg-info text-dark" style={{ 
                          marginBottom: isMobile ? '6px' : '0',
                          marginRight: isMobile ? '0' : '1rem',
                          fontSize: isMobile ? '0.75rem' : '0.875rem',
                          display: isMobile ? 'inline-block' : undefined
                        }}>
                          {vt.type}
                        </div>
                        <div className={isMobile ? '' : 'd-flex align-items-center'}>
                          <span className="text-danger fw-bold mb-0" style={{ 
                            fontSize: isMobile ? '1.1rem' : '1.5rem',
                            display: 'block',
                            marginBottom: isMobile ? '4px' : '0',
                            marginRight: isMobile ? '0' : '1rem'
                          }}>
                            {getCurrencySymbol(vt.currency)}{vt.price}/�?                            <span className="text-muted ms-2" style={{ 
                              fontSize: isMobile ? '0.75rem' : '1rem'
                            }}>
                              ({getCurrencyName(vt.currency)})
                            </span>
                          </span>
                          {vt.originalPrice && vt.originalPrice > vt.price && (
                            <span className="text-muted text-decoration-line-through mb-0" style={{ 
                              fontSize: isMobile ? '0.9rem' : '1.25rem'
                            }}>
                              {getCurrencySymbol(vt.currency)}{vt.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {packageData.visaType && (
                      <div className="badge bg-info text-dark mb-2" style={{ 
                        fontSize: isMobile ? '0.75rem' : '0.875rem'
                      }}>
                        {packageData.visaType}
                      </div>
                    )}
                    <div className={isMobile ? '' : 'd-flex align-items-center'}>
                      <span className="text-danger fw-bold" style={{ 
                        fontSize: isMobile ? '1.3rem' : '2rem',
                        display: 'block',
                        marginBottom: isMobile ? '4px' : '0',
                        marginRight: isMobile ? '0' : '1rem'
                      }}>
                        {getCurrencySymbol(packageData.currency)}{packageData.price}/�?                        <span className="text-muted ms-2" style={{ 
                          fontSize: isMobile ? '0.8rem' : '1.25rem'
                        }}>
                          ({getCurrencyName(packageData.currency)})
                        </span>
                      </span>
                      {packageData.originalPrice && packageData.originalPrice > packageData.price && (
                        <span className="text-muted text-decoration-line-through" style={{ 
                          fontSize: isMobile ? '1rem' : '1.25rem'
                        }}>
                          {getCurrencySymbol(packageData.currency)}{packageData.originalPrice}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {packageData.description && (
                <p className="card-text" style={{ 
                  fontSize: isMobile ? '0.85rem' : '1rem',
                  lineHeight: isMobile ? '1.5' : '1.6',
                  marginBottom: isMobile ? '10px' : '1rem'
                }}>
                  {packageData.description}
                </p>
              )}

              {/* 特色功能 */}
              {packageData.features && packageData.features.length > 0 && (
                <div style={{ marginBottom: isMobile ? '10px' : '1rem' }}>
                  <h5 style={{ 
                    fontSize: isMobile ? '1rem' : '1.25rem',
                    marginBottom: isMobile ? '8px' : '0.75rem'
                  }}>
                    服务特色
                  </h5>
                  <div className="d-flex flex-wrap" style={{ gap: isMobile ? '6px' : '8px' }}>
                    {packageData.features.map((feature, index) => (
                      <span 
                        key={index} 
                        className="badge bg-primary"
                        style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 详细说明 */}
          {packageData.details && (
            <div className="card" style={{ marginBottom: isMobile ? '12px' : '1.5rem' }}>
              <div className="card-body" style={{ padding: isMobile ? '12px' : '1.25rem' }}>
                <h5 className="card-title" style={{ 
                  fontSize: isMobile ? '1.1rem' : '1.25rem',
                  marginBottom: isMobile ? '10px' : '1rem'
                }}>
                  详细说明
                </h5>
                <div 
                  className="card-text"
                  style={{ 
                    fontSize: isMobile ? '0.85rem' : '1rem',
                    lineHeight: isMobile ? '1.6' : '1.8'
                  }}
                  dangerouslySetInnerHTML={{ __html: packageData.details }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 右侧申请区域 */}
        <div className="col-lg-4">
          <div className="card sticky-top" style={{ 
            top: isMobile ? '0' : '20px',
            marginBottom: isMobile ? '12px' : '0'
          }}>
            <div className="card-body" style={{ padding: isMobile ? '12px' : '1.25rem' }}>
              <h5 className="card-title" style={{ 
                fontSize: isMobile ? '1.1rem' : '1.25rem',
                marginBottom: isMobile ? '10px' : '1rem'
              }}>
                立即申请
              </h5>
              
              {!showApplyForm && !applySuccess ? (
                <div>
                  <p className="card-text" style={{ 
                    marginBottom: isMobile ? '10px' : '1rem',
                    fontSize: isMobile ? '0.85rem' : '1rem'
                  }}>
                    选择此签证类型，享受专业签证服务
                  </p>
                  <button 
                    className={`btn btn-primary w-100 ${isMobile ? '' : 'btn-lg'}`}
                    onClick={() => setShowApplyForm(true)}
                    style={{
                      fontSize: isMobile ? '0.9rem' : undefined,
                      padding: isMobile ? '10px' : undefined
                    }}
                  >
                    申请此签�?                  </button>
                </div>
              ) : applySuccess ? (
                <div className="text-center">
                  <div className="text-success" style={{ marginBottom: isMobile ? '10px' : '1rem' }}>
                    <i className={`fas fa-check-circle ${isMobile ? 'fa-2x' : 'fa-3x'}`}></i>
                  </div>
                  <h5 className="text-success" style={{ 
                    fontSize: isMobile ? '1rem' : '1.25rem',
                    marginBottom: isMobile ? '8px' : '1rem'
                  }}>
                    申请提交成功�?                  </h5>
                  <p style={{ 
                    fontSize: isMobile ? '0.85rem' : '1rem',
                    marginBottom: isMobile ? '6px' : '0.5rem'
                  }}>
                    您的申请编号�?strong>{successId}</strong>
                  </p>
                  <p className="small text-muted" style={{ 
                    fontSize: isMobile ? '0.75rem' : undefined
                  }}>
                    请妥善保存编号以便后续查询进�?                  </p>
                  <button 
                    className={`btn btn-outline-primary ${isMobile ? 'btn-sm' : ''}`}
                    onClick={() => {
                      setShowApplyForm(false);
                      setApplySuccess(false);
                      setSuccessId('');
                      setApplyForm({
                        name: '',
                        phoneCountryCode: '+81',
                        phone: '',
                        address: '',
                        packageId: packageData._id,
                        email: '',
                        wechat: '',
                        line: '',
                        notes: ''
                      });
                      setSelectedVisaTypeIndex(0);
                      setSelectedCustomerType('');
                    }}
                    style={{
                      fontSize: isMobile ? '0.85rem' : undefined,
                      padding: isMobile ? '6px 12px' : undefined
                    }}
                  >
                    再申请一�?                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit}>
                  <div style={{ marginBottom: isMobile ? '10px' : '1rem' }}>
                    <label className="form-label" style={{ 
                      fontSize: isMobile ? '0.85rem' : '1rem',
                      marginBottom: isMobile ? '4px' : '0.5rem'
                    }}>
                      姓名 *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={applyForm.name}
                      onChange={handleFormChange}
                      required
                      style={{
                        fontSize: isMobile ? '0.85rem' : undefined,
                        padding: isMobile ? '8px' : undefined
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: isMobile ? '10px' : '1rem' }}>
                    <label className="form-label" style={{ 
                      fontSize: isMobile ? '0.85rem' : '1rem',
                      marginBottom: isMobile ? '4px' : '0.5rem'
                    }}>
                      手机�?*
                    </label>
                    <div className="input-group">
                      <select
                        name="phoneCountryCode"
                        value={applyForm.phoneCountryCode}
                        onChange={handleFormChange}
                        className="form-select"
                        style={{ 
                          maxWidth: '100px',
                          minWidth: '100px',
                          flex: '0 0 100px'
                        }}
                      >
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+86">🇨🇳 +86</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+82">🇰🇷 +82</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+66">🇹🇭 +66</option>
                        <option value="+84">🇻🇳 +84</option>
                        <option value="+63">🇵🇭 +63</option>
                        <option value="+60">🇲🇾 +60</option>
                        <option value="+852">🇭🇰 +852</option>
                        <option value="+886">🇹🇼 +886</option>
                      </select>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={applyForm.phone}
                        onChange={handleFormChange}
                        placeholder="请输入手机号�?
                        style={{ 
                          flex: '1',
                          fontSize: isMobile ? '0.85rem' : undefined,
                          padding: isMobile ? '8px' : undefined
                        }}
                        required
                      />
                    </div>
                    <small className="form-text text-muted" style={{ 
                      display: 'block', 
                      marginTop: isMobile ? '4px' : '6px',
                      fontSize: isMobile ? '0.75rem' : undefined
                    }}>
                      <i className="fas fa-info-circle me-1"></i>
                      例如日本号码�?9012345678
                    </small>
                  </div>
                  
                  <div style={{ marginBottom: isMobile ? '10px' : '1rem' }}>
                    <label className="form-label" style={{ 
                      fontSize: isMobile ? '0.85rem' : '1rem',
                      marginBottom: isMobile ? '4px' : '0.5rem'
                    }}>
                      联系地址 *
                    </label>
                    <textarea
                      className="form-control"
                      name="address"
                      value={applyForm.address}
                      onChange={handleFormChange}
                      rows={isMobile ? 2 : 3}
                      required
                      style={{
                        fontSize: isMobile ? '0.85rem' : undefined,
                        padding: isMobile ? '8px' : undefined
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: isMobile ? '10px' : '1rem' }}>
                    <label className="form-label" style={{ 
                      fontSize: isMobile ? '0.85rem' : '1rem',
                      marginBottom: isMobile ? '4px' : '0.5rem'
                    }}>
                      套餐名称
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="packageId"
                      value={packageData.name}
                      readOnly
                      style={{
                        fontSize: isMobile ? '0.85rem' : undefined,
                        padding: isMobile ? '8px' : undefined
                      }}
                    />
                  </div>

                  {/* 签证类型选择（如果有多个签证类型�?*/}
                  {packageData && packageData.visaTypes && packageData.visaTypes.length > 1 && (
                    <div style={{ marginBottom: isMobile ? '10px' : '1rem' }}>
                      <label className="form-label" style={{ 
                        fontSize: isMobile ? '0.85rem' : '1rem',
                        marginBottom: isMobile ? '4px' : '0.5rem'
                      }}>
                        选择签证次数 <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        value={selectedVisaTypeIndex}
                        onChange={(e) => setSelectedVisaTypeIndex(parseInt(e.target.value))}
                        required
                        style={{
                          fontSize: isMobile ? '0.85rem' : undefined,
                          padding: isMobile ? '8px' : undefined
                        }}
                      >
                        {packageData.visaTypes.map((vt, index) => (
                          <option key={index} value={index}>
                            {vt.type} - {getCurrencySymbol(vt.currency)}{vt.price} ({getCurrencyName(vt.currency)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* 显示选中的签证类型信息（如果只有一个或者选择了） */}
                  {packageData && (
                    (packageData.visaTypes && packageData.visaTypes.length === 1) || 
                    (packageData.visaType)
                  ) && (
                    <div style={{ marginBottom: isMobile ? '10px' : '1rem' }}>
                      <label className="form-label" style={{ 
                        fontSize: isMobile ? '0.85rem' : '1rem',
                        marginBottom: isMobile ? '4px' : '0.5rem'
                      }}>
                        签证次数
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={
                          packageData.visaTypes && packageData.visaTypes.length === 1
                            ? `${packageData.visaTypes[0].type} - ${getCurrencySymbol(packageData.visaTypes[0].currency)}${packageData.visaTypes[0].price} (${getCurrencyName(packageData.visaTypes[0].currency)})`
                            : packageData.visaType
                              ? `${packageData.visaType} - ${getCurrencySymbol(packageData.currency)}${packageData.price} (${getCurrencyName(packageData.currency)})`
                              : '未设�?
                        }
                        readOnly
                        style={{
                          fontSize: isMobile ? '0.85rem' : undefined,
                          padding: isMobile ? '8px' : undefined,
                          backgroundColor: '#f8f9fa'
                        }}
                      />
                    </div>
                  )}

                  {/* 客户类型选择 */}
                  {customerTypes.length > 0 && (
                    <div style={{ marginBottom: isMobile ? '10px' : '1rem' }}>
                      <label className="form-label" style={{ 
                        fontSize: isMobile ? '0.85rem' : '1rem',
                        marginBottom: isMobile ? '4px' : '0.5rem'
                      }}>
                        选择办理类型
                        <small className="text-muted ms-2" style={{ fontSize: isMobile ? '0.7rem' : undefined }}>（可选）</small>
                      </label>

                      {!isMobile ? (
                        <select
                          className="form-control"
                          value={selectedCustomerType}
                          onChange={(e) => setSelectedCustomerType(e.target.value)}
                          style={{
                            fontSize: '0.95rem'
                          }}
                        >
                          <option value="">不选择（可后续补充�?/option>
                          {customerTypes.map(type => (
                            <option key={type.typeId} value={type.typeId}>
                              {type.typeName} {type.description && `- ${type.description}`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowCustomerTypePicker(true)}
                          className="form-control d-flex justify-content-between align-items-center"
                          style={{
                            textAlign: 'left',
                            fontSize: '0.95rem',
                            padding: '10px 12px',
                            background: '#fff',
                            border: '1px solid #ced4da'
                          }}
                        >
                          <span>
                            {selectedCustomerType
                              ? `${customerTypes.find(ct => ct.typeId === selectedCustomerType)?.typeName || ''}`
                              : '不选择（可后续补充�?}
                          </span>
                          <i className="fas fa-chevron-down" style={{ color: '#999', fontSize: '0.85rem' }}></i>
                        </button>
                      )}

                      <small className="form-text text-muted" style={{
                        fontSize: isMobile ? '0.75rem' : undefined,
                        display: 'block',
                        marginTop: isMobile ? '4px' : '6px'
                      }}>
                        <i className="fas fa-info-circle me-1"></i>
                        选择办理类型后，系统将自动关联相应的材料清单和问题模�?                      </small>
                    </div>
                  )}

                  <div className="alert alert-info" style={{ 
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    padding: isMobile ? '8px 10px' : '8px 12px',
                    marginBottom: isMobile ? '10px' : '1rem'
                  }}>
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>重要�?/strong>微信号或LINE号至少填写一�?                  </div>

                  <div style={{ marginBottom: isMobile ? '10px' : '1rem' }}>
                    <label className="form-label" style={{ 
                      fontSize: isMobile ? '0.85rem' : '1rem',
                      marginBottom: isMobile ? '4px' : '0.5rem'
                    }}>
                      微信�?* 
                      <small className="text-muted ms-2" style={{ 
                        fontSize: isMobile ? '0.7rem' : undefined
                      }}>
                        (与LINE二选一)
                      </small>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="wechat"
                      value={applyForm.wechat}
                      onChange={handleFormChange}
                      placeholder="请输入微信号"
                      style={{
                        fontSize: isMobile ? '0.85rem' : undefined,
                        padding: isMobile ? '8px' : undefined
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: isMobile ? '10px' : '1rem' }}>
                    <label className="form-label" style={{ 
                      fontSize: isMobile ? '0.85rem' : '1rem',
                      marginBottom: isMobile ? '4px' : '0.5rem'
                    }}>
                      LINE�?* 
                      <small className="text-muted ms-2" style={{ 
                        fontSize: isMobile ? '0.7rem' : undefined
                      }}>
                        (与微信二选一)
                      </small>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="line"
                      value={applyForm.line}
                      onChange={handleFormChange}
                      placeholder="请输入LINE�?
                      style={{
                        fontSize: isMobile ? '0.85rem' : undefined,
                        padding: isMobile ? '8px' : undefined
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: isMobile ? '10px' : '1rem' }}>
                    <label className="form-label" style={{ 
                      fontSize: isMobile ? '0.85rem' : '1rem',
                      marginBottom: isMobile ? '4px' : '0.5rem'
                    }}>
                      邮箱
                      <small className="text-muted ms-2" style={{ 
                        fontSize: isMobile ? '0.7rem' : undefined
                      }}>
                        (建议填写，用于接收进度通知)
                      </small>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={applyForm.email}
                      onChange={handleFormChange}
                      placeholder="用于接收办理进度邮件"
                      inputMode="email"
                      style={{
                        fontSize: isMobile ? '0.85rem' : undefined,
                        padding: isMobile ? '8px' : undefined
                      }}
                    />
                    <small className="form-text text-muted" style={{ 
                      fontSize: isMobile ? '0.75rem' : undefined,
                      display: 'block',
                      marginTop: isMobile ? '4px' : '6px'
                    }}>
                      <i className="fas fa-envelope me-1"></i>
                      填写邮箱后可及时收到进度通知
                    </small>
                  </div>

                  <div style={{ marginBottom: isMobile ? '10px' : '1rem' }}>
                    <label className="form-label" style={{ 
                      fontSize: isMobile ? '0.85rem' : '1rem',
                      marginBottom: isMobile ? '4px' : '0.5rem'
                    }}>
                      备注 (可�?
                    </label>
                    <textarea
                      className="form-control"
                      name="notes"
                      value={applyForm.notes}
                      onChange={handleFormChange}
                      rows={isMobile ? 2 : 3}
                      style={{
                        fontSize: isMobile ? '0.85rem' : undefined,
                        padding: isMobile ? '8px' : undefined
                      }}
                    />
                  </div>

                  {error && (
                    <div className="alert alert-danger" style={{ 
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      padding: isMobile ? '8px 10px' : undefined
                    }}>
                      {error}
                    </div>
                  )}
                  
                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className={`btn btn-primary ${isMobile ? '' : ''}`}
                      disabled={applyLoading}
                      style={{
                        fontSize: isMobile ? '0.9rem' : undefined,
                        padding: isMobile ? '10px' : undefined
                      }}
                    >
                      {applyLoading ? '提交�?..' : '提交申请'}
                    </button>
                    <button 
                      type="button" 
                      className={`btn btn-outline-secondary ${isMobile ? 'btn-sm' : ''}`}
                      onClick={() => setShowApplyForm(false)}
                      style={{
                        fontSize: isMobile ? '0.85rem' : undefined,
                        padding: isMobile ? '8px' : undefined
                      }}
                    >
                      取消
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 移动�?- 办理类型选择器弹层（放在组件根部，确保正确的层级和定位） */}
      {showCustomerTypePicker && isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out',
            touchAction: 'none' // 遮罩层完全禁用触摸操作，防止背景滚动
          }}
          onClick={handleClosePicker}
          onTouchMove={(e) => {
            // 只在遮罩层上时阻止滚动传�?            if (e.target === e.currentTarget) {
              e.preventDefault();
            }
          }}
        >
          <div
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: '100%',
              maxHeight: '85vh',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideUp 0.3s ease-out',
              transform: 'translateY(0)',
              touchAction: 'pan-y', // 弹窗内容允许垂直滚动
              WebkitOverflowScrolling: 'touch'
            }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              e.stopPropagation();
              // 记录触摸起始位置，用于判断是滚动还是点击
            }}
            onTouchMove={(e) => {
              // 允许弹窗内容滚动，但阻止事件冒泡到背�?              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
            }}
          >
            {/* 顶部拖拽指示�?*/}
            <div style={{
              padding: '8px 0',
              display: 'flex',
              justifyContent: 'center',
              cursor: 'grab',
              userSelect: 'none'
            }}>
              <div style={{
                width: '40px',
                height: '4px',
                background: '#d1d5db',
                borderRadius: '2px'
              }} />
            </div>

            {/* 标题�?*/}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f9fafb'
            }}>
              <strong style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827'
              }}>
                选择办理类型
              </strong>
              <button
                type="button"
                onClick={handleClosePicker}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  lineHeight: '1',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e5e7eb';
                  e.target.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#6b7280';
                }}
                aria-label="关闭"
              >
                ×
              </button>
            </div>

            {/* 选项列表 */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              maxHeight: 'calc(85vh - 80px)'
            }}>
              {/* 不选择选项 */}
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedCustomerType('');
                  setShowCustomerTypePicker(false);
                }}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  background: selectedCustomerType === '' ? '#f3f4f6' : '#fff'
                }}
                onMouseEnter={(e) => {
                  if (selectedCustomerType !== '') {
                    e.currentTarget.style.background = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCustomerType !== '') {
                    e.currentTarget.style.background = '#fff';
                  }
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: selectedCustomerType === '' ? '6px solid #4f46e5' : '2px solid #9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxSizing: 'border-box',
                    background: selectedCustomerType === '' ? '#fff' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                />
                <div style={{
                  fontSize: '16px',
                  lineHeight: '1.5',
                  color: '#111827',
                  fontWeight: selectedCustomerType === '' ? '500' : '400'
                }}>
                  不选择（可后续补充�?                </div>
              </div>

              {/* 其他选项 */}
              {customerTypes.map(ct => {
                const checked = selectedCustomerType === ct.typeId;
                return (
                  <div
                    key={ct.typeId}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedCustomerType(ct.typeId);
                      setShowCustomerTypePicker(false);
                    }}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      background: checked ? '#f3f4f6' : '#fff'
                    }}
                    onMouseEnter={(e) => {
                      if (!checked) {
                        e.currentTarget.style.background = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!checked) {
                        e.currentTarget.style.background = '#fff';
                      }
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: checked ? '6px solid #4f46e5' : '2px solid #9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                        boxSizing: 'border-box',
                        background: checked ? '#fff' : 'transparent',
                        transition: 'all 0.2s'
                      }}
                    />
                    <div style={{
                      flex: 1,
                      minWidth: 0
                    }}>
                      <div style={{
                        fontSize: '16px',
                        lineHeight: '1.5',
                        color: '#111827',
                        fontWeight: checked ? '500' : '400',
                        marginBottom: ct.description ? '4px' : '0'
                      }}>
                        {ct.typeName}
                      </div>
                      {ct.description && (
                        <div style={{
                          fontSize: '13px',
                          color: '#6b7280',
                          lineHeight: '1.5',
                          marginTop: '2px'
                        }}>
                          {ct.description}
                        </div>
                      )}
      </div>
                  </div>
                );
              })}
            </div>

            {/* 底部安全区域（iOS�?*/}
            <div style={{
              height: 'env(safe-area-inset-bottom)',
              background: '#fff'
            }} />
          </div>
        </div>
      )}

      {/* 添加CSS动画 */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default PackageDetail; 
