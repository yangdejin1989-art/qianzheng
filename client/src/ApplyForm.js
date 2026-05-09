 // ApplyForm.js
// 签证申请表单组件
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Captcha from './components/Captcha';
import { buildApiUrl } from './config';
import './ApplyForm.css';

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

function ApplyForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phoneCountryCode: '+81',
    phone: '',
    address: '',
    mailingAddress: '',
    packageId: '',
    email: '',
    wechat: '',
    line: '',
    notes: ''
  });
  const [captcha, setCaptcha] = useState('');
  const [captchaValid, setCaptchaValid] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const errorRef = React.useRef(null);
  
  // 一起申请的人（只需要名字）
  const [companions, setCompanions] = useState([]);
  
  // 问题模板和答�?  const [questionTemplates, setQuestionTemplates] = useState([]);
  const [customerTypes, setCustomerTypes] = useState([]);
  const [showCustomerTypePicker, setShowCustomerTypePicker] = useState(false); // 移动端选择�?  const [selectedCustomerType, setSelectedCustomerType] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedVisaTypeIndex, setSelectedVisaTypeIndex] = useState(0); // 选择的签证类型索�?  
  // 材料模板和上�?  const [materialTemplate, setMaterialTemplate] = useState(null);
  const [activeMaterialPersonIndex, setActiveMaterialPersonIndex] = useState(0);
  const [materialsByPerson, setMaterialsByPerson] = useState({});

  // 移动端检�?  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 获取套餐数据
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(buildApiUrl('/api/packages'));
        console.log('套餐数据:', response.data);
        setPackages(response.data);
        // 默认选择第一个套�?        if (response.data && response.data.length > 0) {
          setFormData(prev => ({ ...prev, packageId: response.data[0]._id }));
          console.log('默认选择套餐:', response.data[0]._id);
          // 加载第一个套餐的客户类型
          loadCustomerTypes(response.data[0]._id);
        } else {
          console.log('没有套餐数据');
        }
      } catch (err) {
        console.error('获取套餐数据失败:', err);
        setError('获取套餐数据失败');
      }
    };
    fetchPackages();
  }, []);

  // 加载客户类型（从材料模板获取�?  const loadCustomerTypes = async (packageId) => {
    try {
      const response = await axios.get(buildApiUrl(`/api/material-templates/package/${packageId}`));
      if (response.data && response.data.customerTypes) {
        setCustomerTypes(response.data.customerTypes);
        setMaterialTemplate(response.data); // 保存完整的材料模�?        console.log('客户类型:', response.data.customerTypes);
      }
    } catch (err) {
      console.error('获取客户类型失败:', err);
    }
  };

  // 加载问题模板
  const loadQuestionTemplate = async (packageId, customerTypeId) => {
    try {
      const response = await axios.get(
        buildApiUrl(`/api/question-templates/package/${packageId}/customer-type/${customerTypeId}`)
      );
      console.log('问题模板API响应:', response.data);
      if (response.data && response.data.questions) {
        setQuestionTemplates(response.data.questions);
        console.log('�?加载问题模板成功:', response.data.questions.length, '个问�?);
      } else {
        console.log('⚠️ 没有找到问题模板');
        setQuestionTemplates([]);
      }
    } catch (err) {
      console.error('�?获取问题模板失败:', err);
      setQuestionTemplates([]);
    }
  };

  // 当选择套餐时，重新加载客户类型
  const handlePackageChange = (e) => {
    const packageId = e.target.value;
    setFormData(prev => ({ ...prev, packageId }));
    setSelectedCustomerType('');
    setQuestionTemplates([]);
    setQuestionAnswers({});
    setShowQuestions(false);
    setSelectedVisaTypeIndex(0); // 重置签证类型选择
    loadCustomerTypes(packageId);
  };


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

  // 关闭弹窗的处理函数（防止滚动�?  const handleClosePicker = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowCustomerTypePicker(false);
  };

  // 当选择客户类型时，加载问题模板
  const handleCustomerTypeChange = (customerTypeId) => {
    setSelectedCustomerType(customerTypeId);
    // 先关闭弹窗，防止滚动
    setShowCustomerTypePicker(false);
    // 延迟加载问题模板，避免立即触发页面变�?    if (customerTypeId && formData.packageId) {
      setTimeout(() => {
      loadQuestionTemplate(formData.packageId, customerTypeId);
      setShowQuestions(true);
      }, 100);
    } else {
      setQuestionTemplates([]);
      setShowQuestions(false);
    }
  };

  // 处理问题答案
  const handleQuestionAnswer = (questionId, answer) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // 处理材料上传（按人员�?  const handlePersonMaterialUpload = (personId, materialId, files) => {
    setMaterialsByPerson(prev => ({
      ...prev,
      [personId]: {
        ...(prev[personId] || {}),
        [materialId]: files
      }
    }));
    console.log(`上传材料 ${materialId} �?${personId}:`, files.length, '个文�?);
  };

  // 获取当前客户类型的材料清�?  const getCurrentMaterials = () => {
    if (!selectedCustomerType || !materialTemplate) return [];
    const customerType = materialTemplate.customerTypes.find(ct => ct.typeId === selectedCustomerType);
    return customerType?.materials || [];
  };

  // 表单输入变化处理
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 添加同行�?  const addCompanion = () => {
    setCompanions([...companions, '']);
  };
  
  // 更新同行人名�?  const updateCompanion = (index, name) => {
    const updated = [...companions];
    updated[index] = name;
    setCompanions(updated);
  };
  
  // 删除同行�?  const removeCompanion = (index) => {
    setCompanions(companions.filter((_, i) => i !== index));
  };

  // 验证码处�?  const handleCaptchaChange = (value, isValid) => {
    setCaptcha(value);
    setCaptchaValid(isValid);
  };

  // 显示错误并滚动到错误位置
  const showError = (errorMessage) => {
    setError(errorMessage);
    // 延迟一点时间，确保错误消息已渲�?    setTimeout(() => {
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // 添加抖动动画效果
        errorRef.current.classList.add('shake-animation');
        setTimeout(() => {
          errorRef.current?.classList.remove('shake-animation');
        }, 500);
      }
    }, 100);
  };

  // 表单提交处理
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 调试信息
    console.log('表单数据:', formData);
    console.log('验证�?', captcha);
    console.log('验证码状�?', captchaValid);
    
    // 验证必填字段
    if (!formData.name || !formData.phone || !formData.address || !formData.packageId) {
      const missingFields = [];
      if (!formData.name) missingFields.push('姓名');
      if (!formData.phone) missingFields.push('手机�?);
      if (!formData.address) missingFields.push('地址');
      if (!formData.packageId) missingFields.push('签证类型');
      
      showError(`�?表单填写不完整！\n请填写以下必填字段：${missingFields.join('�?)}`);
      return;
    }

    // 验证微信或LINE至少填一�?    if (!formData.wechat && !formData.line) {
      showError('�?联系方式不完整！\n请至少填写微信号或LINE号其中一个，方便我们与您联系');
      return;
    }

    // 验证手机号格式（国际格式�?-15位数字）
    const phoneRegex = /^\d{8,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      showError(`�?手机号格式错误！\n您输入的手机号：${formData.phone}\n请输�?-15位数字（例如�?9012345678）`);
      return;
    }
    
    // 验证邮箱格式（如果填写了邮箱�?    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showError(`�?邮箱格式错误！\n您输入的邮箱�?{formData.email}\n请输入正确的邮箱地址（例如：example@qq.com）`);
        return;
      }
    }

    // 验证验证�?    if (!captcha || captcha.length !== 4) {
      showError('�?验证码未填写！\n请输入完整的验证码（4位字符）');
      return;
    }
    
    if (!captchaValid) {
      showError('�?验证码错误！\n请重新输入正确的验证�?);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 获取选择的签证类型信�?      let visaType = '';
      let visaPrice = 0;
      let visaCurrency = 'CNY';
      
      const selectedPackage = packages.find(pkg => pkg._id === formData.packageId);
      if (selectedPackage) {
        if (selectedPackage.visaTypes && selectedPackage.visaTypes.length > 0) {
          // 有多个签证类型，使用用户选择�?          const selectedVisaType = selectedPackage.visaTypes[selectedVisaTypeIndex];
          if (selectedVisaType) {
            visaType = selectedVisaType.type || '';
            visaPrice = selectedVisaType.price || 0;
            visaCurrency = selectedVisaType.currency || 'CNY';
          }
        } else if (selectedPackage.visaType) {
          // 旧格式，只有一个签证类�?          visaType = selectedPackage.visaType;
          visaPrice = selectedPackage.price || 0;
          visaCurrency = selectedPackage.currency || 'CNY';
        }
      }
      
      // 构建问题答案数组（旧版兼容）
      const questionsAnswers = Object.keys(questionAnswers)
        .filter(questionId => questionAnswers[questionId] && questionAnswers[questionId].trim() !== '')
        .map(questionId => {
          const question = questionTemplates.find(q => q.questionId === questionId);
          return {
            questionId: questionId,
            questionText: question?.questionText || '',
            answer: questionAnswers[questionId],
            required: question?.required || false
          };
        });

      // 使用FormData来支持文件上�?      const formDataToSubmit = new FormData();
      
      // 添加基本字段
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('phone', `${formData.phoneCountryCode} ${formData.phone}`);
      formDataToSubmit.append('address', formData.address);
      if (formData.email) formDataToSubmit.append('email', formData.email);
      if (formData.wechat) formDataToSubmit.append('wechat', formData.wechat);
      if (formData.line) formDataToSubmit.append('line', formData.line);
      if (formData.notes) formDataToSubmit.append('notes', formData.notes);
      formDataToSubmit.append('package', formData.packageId);
      formDataToSubmit.append('captcha', captcha);
      
      // 添加签证类型信息
      if (visaType) formDataToSubmit.append('visaType', visaType);
      if (visaPrice > 0) formDataToSubmit.append('visaPrice', visaPrice.toString());
      if (visaCurrency) formDataToSubmit.append('visaCurrency', visaCurrency);
      
      // 添加同行�?      const validCompanions = companions.filter(name => name.trim() !== '');
      formDataToSubmit.append('companions', JSON.stringify(validCompanions));
      
      // 添加客户类型
      if (selectedCustomerType) {
        formDataToSubmit.append('customerType', JSON.stringify({
          typeId: selectedCustomerType,
          typeName: customerTypes.find(ct => ct.typeId === selectedCustomerType)?.typeName || ''
        }));
      }
      
      // 添加问题答案
      if (questionsAnswers.length > 0) {
        formDataToSubmit.append('questionsAnswers', JSON.stringify(questionsAnswers));
      }
      
      // 添加材料数据（统一数组，按人员标识�?      const currentMaterials = getCurrentMaterials();
      if (currentMaterials.length > 0 && Object.keys(materialsByPerson).length > 0) {
        const allPersonIds = ['main', ...validCompanions.map((_, i) => `comp${i + 1}`)];
        const allMaterials = [];
        let totalFileCount = 0;
        
        // 遍历所有人员，收集材料
        allPersonIds.forEach((personId, index) => {
          const personMaterials = materialsByPerson[personId] || {};
          const personName = index === 0 ? formData.name : validCompanions[index - 1];
          
          // 为每个材料类型添加该人员的数�?          currentMaterials.forEach(material => {
            const files = personMaterials[material.materialId];
            const hasFiles = files && files.length > 0;
            
            allMaterials.push({
              materialId: material.materialId,
              materialName: material.name,
              templateRequired: material.required,
              personId: personId,
              personName: personName,
              fileCount: hasFiles ? files.length : 0
            });
            
            // 添加该人员该材料的文�?            if (hasFiles) {
              Array.from(files).forEach(file => {
                formDataToSubmit.append(`material_${personId}_${material.materialId}`, file);
                totalFileCount++;
              });
            }
          });
        });
        
        formDataToSubmit.append('materials', JSON.stringify(allMaterials));
        console.log('提交材料数据:', allMaterials.length, '项（', allPersonIds.length, '人），共', totalFileCount, '个文�?);
      }
      
      const response = await axios.post(buildApiUrl('/api/apply'), formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      onSuccess(response.data.applyCode);
    } catch (err) {
      console.error('提交失败:', err);
      const errorMessage = err.response?.data?.message || '网络错误或服务器异常';
      const errorDetails = err.response?.data?.details || '';
      
      let fullErrorMessage = `�?申请提交失败！\n\n错误原因�?{errorMessage}`;
      if (errorDetails) {
        fullErrorMessage += `\n详细信息�?{errorDetails}`;
      }
      fullErrorMessage += '\n\n请检查以上问题后重试，或联系客服协助处理�?;
      
      showError(fullErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-form-container" style={{
      padding: isMobile ? '8px' : undefined
    }}>
      <div className="apply-form-card">
        <div className="apply-form-header" style={{
          padding: isMobile ? '12px 12px' : undefined
        }}>
          <h2 className="apply-form-title" style={{
            fontSize: isMobile ? '1.3rem' : undefined,
            marginBottom: isMobile ? '6px' : undefined
          }}>
            <i className="fas fa-passport me-2" style={{ fontSize: isMobile ? '1.2rem' : undefined }}></i>
            签证申请
          </h2>
          <p className="apply-form-subtitle" style={{
            fontSize: isMobile ? '0.85rem' : undefined,
            marginBottom: isMobile ? '0' : undefined
          }}>
            请填写以下信息完成申�?          </p>
        </div>
        
        <div className="apply-form-body" style={{
          padding: isMobile ? '12px' : undefined
        }}>
          <form onSubmit={handleSubmit}>
            {/* 基本信息 */}
            <div className="form-section" style={{
              padding: isMobile ? '12px 8px' : undefined,
              marginBottom: isMobile ? '12px' : undefined
            }}>
              <h4 className="section-title" style={{
                fontSize: isMobile ? '1.05rem' : undefined,
                marginBottom: isMobile ? '10px' : undefined
              }}>
                <i className="fas fa-user me-2" style={{ fontSize: isMobile ? '1rem' : undefined }}></i>
                基本信息
              </h4>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group" style={{
                    marginBottom: isMobile ? '10px' : undefined
                  }}>
                    <label className="form-label" style={{
                      fontSize: isMobile ? '0.85rem' : undefined,
                      marginBottom: isMobile ? '4px' : undefined
                    }}>
                      姓名 <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="请输入您的姓�?
                      required
                      style={{
                        fontSize: isMobile ? '0.85rem' : undefined,
                        padding: isMobile ? '8px' : undefined
                      }}
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group" style={{
                    marginBottom: isMobile ? '10px' : undefined
                  }}>
                    <label className="form-label" style={{
                      fontSize: isMobile ? '0.85rem' : undefined,
                      marginBottom: isMobile ? '4px' : undefined
                    }}>
                      手机号码 <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <select
                        name="phoneCountryCode"
                        value={formData.phoneCountryCode}
                        onChange={handleChange}
                        className="form-select"
                        style={{ 
                          maxWidth: isMobile ? '90px' : '100px',
                          minWidth: isMobile ? '90px' : '100px',
                          flex: isMobile ? '0 0 90px' : '0 0 100px',
                          fontSize: isMobile ? '0.8rem' : undefined,
                          padding: isMobile ? '8px 4px' : undefined
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
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-control"
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
                </div>
              </div>
              
              <div className="form-group" style={{
                marginBottom: isMobile ? '10px' : undefined
              }}>
                <label className="form-label" style={{
                  fontSize: isMobile ? '0.85rem' : undefined,
                  marginBottom: isMobile ? '4px' : undefined
                }}>
                  联系地址 <span className="text-danger">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control"
                  rows={isMobile ? 2 : 3}
                  placeholder="请输入详细的联系地址"
                  required
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
                  <i className="fas fa-shipping-fast me-1"></i>
                  此地址用于邮寄办理好的签证证件，请确保地址准确无误
                </small>
              </div>
            </div>

            {/* 一起申请的�?*/}
            <div className="form-section" style={{
              padding: isMobile ? '12px 8px' : undefined,
              marginBottom: isMobile ? '12px' : undefined
            }}>
              <h4 className="section-title" style={{
                fontSize: isMobile ? '1.05rem' : undefined,
                marginBottom: isMobile ? '10px' : undefined
              }}>
                <i className="fas fa-user-friends me-2" style={{ fontSize: isMobile ? '1rem' : undefined }}></i>
                一起申请的�?<small className="text-muted" style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 'normal' }}>（可选）</small>
              </h4>
              
              <p className="text-muted small" style={{ 
                marginBottom: isMobile ? '10px' : '1rem',
                fontSize: isMobile ? '0.75rem' : undefined
              }}>
                <i className="fas fa-info-circle me-1"></i>
                如有家人或朋友一起申请，请在下方填写他们的名�?              </p>
              
              {companions.map((name, index) => (
                <div key={index} className="input-group" style={{ marginBottom: isMobile ? '8px' : '0.5rem' }}>
                  <span className="input-group-text" style={{ 
                    minWidth: isMobile ? '75px' : '100px',
                    fontSize: isMobile ? '0.75rem' : undefined,
                    padding: isMobile ? '8px 6px' : undefined
                  }}>
                    <i className="fas fa-user me-1" style={{ fontSize: isMobile ? '0.7rem' : undefined }}></i>
                    同行{index + 1}
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updateCompanion(index, e.target.value)}
                    className="form-control"
                    placeholder="请输入姓�?
                    style={{
                      fontSize: isMobile ? '0.85rem' : undefined,
                      padding: isMobile ? '8px' : undefined
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeCompanion(index)}
                    className="btn btn-outline-danger"
                    style={{ 
                      fontSize: isMobile ? '1rem' : '1.2rem',
                      fontWeight: 'bold',
                      padding: isMobile ? '8px 10px' : undefined
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addCompanion}
                className="btn btn-outline-primary btn-sm"
                style={{
                  fontSize: isMobile ? '0.8rem' : undefined,
                  padding: isMobile ? '6px 10px' : undefined
                }}
              >
                <i className="fas fa-plus me-1" style={{ fontSize: isMobile ? '0.75rem' : undefined }}></i>
                添加同行�?              </button>
            </div>

            {/* 签证类型选择 */}
            <div className="form-section" style={{
              padding: isMobile ? '12px 8px' : undefined,
              marginBottom: isMobile ? '12px' : undefined
            }}>
              <h4 className="section-title" style={{
                fontSize: isMobile ? '1.05rem' : undefined,
                marginBottom: isMobile ? '10px' : undefined
              }}>
                <i className="fas fa-globe me-2" style={{ fontSize: isMobile ? '1rem' : undefined }}></i>
                签证类型选择
              </h4>
              
              <div className="form-group" style={{
                marginBottom: isMobile ? '10px' : undefined
              }}>
                <label className="form-label" style={{
                  fontSize: isMobile ? '0.85rem' : undefined,
                  marginBottom: isMobile ? '4px' : undefined
                }}>
                  选择签证类型 <span className="text-danger">*</span>
                </label>
                {packages.length === 0 ? (
                  <div className="alert alert-warning" style={{
                    fontSize: isMobile ? '0.75rem' : undefined,
                    padding: isMobile ? '8px 10px' : undefined
                  }}>
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    正在加载签证类型数据，请稍�?..
                  </div>
                ) : (
                  <select
                    name="packageId"
                    value={formData.packageId}
                    onChange={handlePackageChange}
                    className="form-control"
                    required
                    style={{
                      fontSize: isMobile ? '0.85rem' : undefined,
                      padding: isMobile ? '8px' : undefined
                    }}
                  >
                    <option value="">请选择签证类型</option>
                    {packages.map(pkg => {
                      // 优先显示 visaTypes 数组中的第一个类型和价格
                      const displayType = pkg.visaTypes && pkg.visaTypes.length > 0 
                        ? pkg.visaTypes[0].type 
                        : pkg.visaType;
                      const displayPrice = pkg.visaTypes && pkg.visaTypes.length > 0 
                        ? pkg.visaTypes[0].price 
                        : pkg.price;
                      const multipleTypes = pkg.visaTypes && pkg.visaTypes.length > 1 
                        ? ` �?{pkg.visaTypes.length}种` 
                        : '';
                      
                      return (
                        <option key={pkg._id} value={pkg._id}>
                          {pkg.name}{displayType ? ` - ${displayType}${multipleTypes}` : ''} - {pkg.speed} - {getCurrencySymbol(pkg.currency)}{displayPrice}/�?({getCurrencyName(pkg.currency)})
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* 签证类型选择（如果选择的套餐有多个签证类型�?*/}
              {formData.packageId && (() => {
                const selectedPackage = packages.find(pkg => pkg._id === formData.packageId);
                if (selectedPackage && selectedPackage.visaTypes && selectedPackage.visaTypes.length > 1) {
                  return (
                    <div className="form-group" style={{
                      marginTop: isMobile ? '10px' : '1rem',
                      marginBottom: isMobile ? '10px' : undefined
                    }}>
                      <label className="form-label" style={{
                        fontSize: isMobile ? '0.85rem' : undefined,
                        marginBottom: isMobile ? '4px' : undefined
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
                        {selectedPackage.visaTypes.map((vt, index) => (
                          <option key={index} value={index}>
                            {vt.type} - {getCurrencySymbol(vt.currency)}{vt.price} ({getCurrencyName(vt.currency)})
                          </option>
                        ))}
                      </select>
                      <small className="form-text text-muted" style={{
                        fontSize: isMobile ? '0.75rem' : undefined,
                        display: 'block',
                        marginTop: isMobile ? '4px' : '6px'
                      }}>
                        <i className="fas fa-info-circle me-1"></i>
                        请选择您需要的签证次数类型
                      </small>
                    </div>
                  );
                }
                return null;
              })()}

              {/* 客户类型选择 */}
              {customerTypes.length > 0 && (
                <div className="form-group" style={{
                  marginTop: isMobile ? '10px' : '1rem',
                  marginBottom: isMobile ? '10px' : undefined
                }}>
                  <label className="form-label" style={{
                    fontSize: isMobile ? '0.85rem' : undefined,
                    marginBottom: isMobile ? '4px' : undefined
                  }}>
                    选择办理类型
                    <small className="text-muted ms-2" style={{ fontSize: isMobile ? '0.7rem' : undefined }}>（可选，选择后可填写详细信息�?/small>
                  </label>

                  {/* 桌面端：原生下拉；移动端：自定义选择器按�?*/}
                  {!isMobile ? (
                  <select
                    value={selectedCustomerType}
                    onChange={(e) => handleCustomerTypeChange(e.target.value)}
                    className="form-control"
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
                    选择办理类型后，可填写详细信息（可选），如不填写，客服会后续联系您补充
                  </small>
                </div>
              )}
            </div>

            {/* 材料上传（可选） - 按材料类型分�?*/}
            {selectedCustomerType && getCurrentMaterials().length > 0 && (
              <div className="form-section" style={{ padding: '15px 0' }}>
                <h4 className="section-title" style={{ fontSize: '1rem', marginBottom: '10px' }}>
                  <i className="fas fa-file-upload me-2"></i>
                  签证材料上传
                  <small className="text-muted ms-2" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                    （可选）
                  </small>
                </h4>
                
                <div className="alert alert-info mb-3" style={{ fontSize: '12px', padding: '8px 12px' }}>
                  <i className="fas fa-info-circle me-1"></i>
                  可现在上传，也可稍后补充。请为每位申请人分别上传材料�?                </div>

                {/* 按材料类型分组显�?*/}
                {getCurrentMaterials().map((material, materialIndex) => {
                  const allPersons = [
                    { personId: 'main', personName: formData.name || '主申请人', isMain: true },
                    ...companions.map((name, i) => ({ 
                      personId: `comp${i + 1}`, 
                      personName: name || `同行�?${i + 1}`,
                      isMain: false 
                    }))
                  ];
                  
                  return (
                    <div key={material.materialId} className="mb-4 p-3 border rounded" style={{ background: '#f9fafb' }}>
                      {/* 材料标题 */}
                      <div className="mb-3" style={{ 
                        borderBottom: '2px solid #e5e7eb', 
                        paddingBottom: '8px'
                      }}>
                        <label className="form-label mb-0" style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1f2937' }}>
                          {materialIndex + 1}. {material.name}
                          {material.required && <span className="text-danger ms-1">*</span>}
                        </label>
                        {material.description && (
                          <div>
                            <small className="form-text text-muted" style={{ fontSize: '0.75rem' }}>
                              <i className="fas fa-info-circle me-1"></i>
                              {material.description}
                            </small>
                          </div>
                        )}
                      </div>
                      
                      {/* 每个人的上传区域 */}
                      {allPersons.map((person, personIndex) => {
                        const personMaterials = materialsByPerson[person.personId] || {};
                        const files = personMaterials[material.materialId];
                        const hasFiles = files && files.length > 0;
                        
                        return (
                          <div key={person.personId} className="mb-2" style={{ 
                            background: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            padding: '10px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {/* 人员标识 */}
                              <div style={{ minWidth: '120px' }}>
                                <span style={{ 
                                  fontSize: '0.85rem',
                                  fontWeight: person.isMain ? '600' : '500',
                                  color: person.isMain ? '#059669' : '#374151'
                                }}>
                                  {person.isMain && <i className="fas fa-user-circle me-1"></i>}
                                  {!person.isMain && <i className="fas fa-user me-1"></i>}
                                  {person.personName}
                                </span>
                              </div>
                              
                              {/* 上传按钮区域 */}
                              <div style={{ flex: 1 }}>
                                <input
                                  type="file"
                                  id={`file-${material.materialId}-${person.personId}`}
                                  className="form-control form-control-sm"
                                  accept="image/*,application/pdf"
                                  multiple={material.allowMultiple}
                                  onChange={(e) => {
                                    handlePersonMaterialUpload(person.personId, material.materialId, e.target.files);
                                  }}
                                  style={{ fontSize: '0.8rem' }}
                                />
                              </div>
                              
                              {/* 状态提�?*/}
                              <div style={{ minWidth: '100px', textAlign: 'right' }}>
                                {hasFiles ? (
                                  <small className="text-success" style={{ fontSize: '0.75rem' }}>
                                    <i className="fas fa-check-circle me-1"></i>
                                    已�?{files.length} �?                                  </small>
                                ) : (
                                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    未上�?                                  </small>
                                )}
                              </div>
                            </div>
                            
                            {/* 略缩图预�?*/}
                            {hasFiles && (
                              <div style={{ 
                                marginTop: '8px',
                                paddingTop: '8px',
                                borderTop: '1px solid #e5e7eb',
                                display: 'flex',
                                gap: '6px',
                                flexWrap: 'wrap'
                              }}>
                                {Array.from(files).map((file, fileIndex) => (
                                  <div key={fileIndex} style={{
                                    width: '60px',
                                    height: '60px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    background: '#f3f4f6'
                                  }}>
                                    {file.type.startsWith('image/') ? (
                                      <img 
                                        src={URL.createObjectURL(file)} 
                                        alt={file.name}
                                        style={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover'
                                        }}
                                        onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                                      />
                                    ) : (
                                      <div style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        color: '#6b7280'
                                      }}>
                                        <i className="fas fa-file-pdf"></i>
                                      </div>
                                    )}
                                    <div style={{
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      background: 'rgba(0,0,0,0.6)',
                                      color: 'white',
                                      fontSize: '0.65rem',
                                      padding: '2px 4px',
                                      textAlign: 'center',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {file.name}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 详细问题（可选填写） - 紧凑�?*/}
            {showQuestions && questionTemplates.length > 0 && (
              <div className="form-section" style={{ padding: '15px 0' }}>
                <h4 className="section-title" style={{ fontSize: '1rem', marginBottom: '10px' }}>
                  <i className="fas fa-clipboard-list me-2"></i>
                  详细信息
                  <small className="text-muted ms-2" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                    （可选）
                  </small>
                </h4>
                
                <div className="alert alert-info mb-2" style={{ fontSize: '12px', padding: '8px 12px' }}>
                  <i className="fas fa-info-circle me-1"></i>
                  填写越详细，办理越快捷。可稍后补充
                </div>

                {questionTemplates.map((question, index) => (
                  <div key={question.questionId} className="form-group mb-2">
                    <label className="form-label mb-1" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                      {index + 1}. {question.questionText}
                      {question.required && <span className="text-warning ms-1" style={{ fontSize: '0.75rem' }}>（建议填�?/span>}
                    </label>
                    {question.helpText && (
                      <small className="form-text text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>
                        <i className="fas fa-lightbulb me-1"></i>
                        {question.helpText}
                      </small>
                    )}
                    <input
                      type="text"
                      value={questionAnswers[question.questionId] || ''}
                      onChange={(e) => handleQuestionAnswer(question.questionId, e.target.value)}
                      className="form-control form-control-sm"
                      placeholder={question.helpText || "请输入（可选）"}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                ))}
              </div>
            )}



            {/* 联系信息 */}
            <div className="form-section" style={{
              padding: isMobile ? '12px 8px' : undefined,
              marginBottom: isMobile ? '12px' : undefined
            }}>
              <h4 className="section-title" style={{
                fontSize: isMobile ? '1.05rem' : undefined,
                marginBottom: isMobile ? '10px' : undefined
              }}>
                <i className="fas fa-comments me-2" style={{ fontSize: isMobile ? '1rem' : undefined }}></i>
                联系方式
              </h4>
              
              <div className="alert alert-info" style={{ 
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                marginBottom: isMobile ? '10px' : '1rem',
                padding: isMobile ? '8px 10px' : undefined
              }}>
                <i className="fas fa-info-circle me-2"></i>
                <strong>重要提示�?/strong>微信号或LINE号至少填写一个（必填），方便我们与您联系办理签证事宜
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group" style={{
                    marginBottom: isMobile ? '10px' : undefined
                  }}>
                    <label className="form-label" style={{
                      fontSize: isMobile ? '0.85rem' : undefined,
                      marginBottom: isMobile ? '4px' : undefined
                    }}>
                      微信�?<span className="text-danger">*</span>
                      <small className="text-muted ms-2" style={{ fontSize: isMobile ? '0.7rem' : undefined }}>（与LINE二选一�?/small>
                    </label>
                    <input
                      type="text"
                      name="wechat"
                      value={formData.wechat}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="请输入微信号"
                      style={{
                        fontSize: isMobile ? '0.85rem' : undefined,
                        padding: isMobile ? '8px' : undefined
                      }}
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group" style={{
                    marginBottom: isMobile ? '10px' : undefined
                  }}>
                    <label className="form-label" style={{
                      fontSize: isMobile ? '0.85rem' : undefined,
                      marginBottom: isMobile ? '4px' : undefined
                    }}>
                      LINE�?<span className="text-danger">*</span>
                      <small className="text-muted ms-2" style={{ fontSize: isMobile ? '0.7rem' : undefined }}>（与微信二选一�?/small>
                    </label>
                    <input
                      type="text"
                      name="line"
                      value={formData.line}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="请输入LINE�?
                      style={{
                        fontSize: isMobile ? '0.85rem' : undefined,
                        padding: isMobile ? '8px' : undefined
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{
                marginBottom: isMobile ? '10px' : undefined
              }}>
                <label className="form-label" style={{
                  fontSize: isMobile ? '0.85rem' : undefined,
                  marginBottom: isMobile ? '4px' : undefined
                }}>
                  邮箱地址
                  <small className="text-muted ms-2" style={{ fontSize: isMobile ? '0.7rem' : undefined }}>（建议填写，用于接收进度通知�?/small>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="请输入邮箱地址，我们会通过邮件发送办理进�?
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
                  填写邮箱后，您将及时收到签证办理进度的邮件通知
                </small>
              </div>
              
              <div className="form-group" style={{
                marginBottom: isMobile ? '10px' : undefined
              }}>
                <label className="form-label" style={{
                  fontSize: isMobile ? '0.85rem' : undefined,
                  marginBottom: isMobile ? '4px' : undefined
                }}>
                  备注信息
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="form-control"
                  rows={isMobile ? 2 : 3}
                  placeholder="请输入备注信息（可选）"
                  style={{
                    fontSize: isMobile ? '0.85rem' : undefined,
                    padding: isMobile ? '8px' : undefined
                  }}
                />
              </div>
            </div>

            {/* 验证�?*/}
            <div className="form-section" style={{
              padding: isMobile ? '12px 8px' : undefined,
              marginBottom: isMobile ? '12px' : undefined
            }}>
              <h4 className="section-title" style={{
                fontSize: isMobile ? '1.05rem' : undefined,
                marginBottom: isMobile ? '10px' : undefined
              }}>
                <i className="fas fa-shield-alt me-2" style={{ fontSize: isMobile ? '1rem' : undefined }}></i>
                安全验证
              </h4>
              <Captcha onCaptchaChange={handleCaptchaChange} />
            </div>

            {/* 错误信息 - 优化�?*/}
            {error && (
              <div 
                ref={errorRef}
                className="alert alert-danger error-alert-enhanced"
                style={{
                  border: isMobile ? '1px solid #dc3545' : '2px solid #dc3545',
                  borderRadius: isMobile ? '8px' : '10px',
                  padding: isMobile ? '10px 12px' : '20px',
                  marginBottom: isMobile ? '12px' : '20px',
                  backgroundColor: '#fff5f5',
                  boxShadow: isMobile ? '0 2px 8px rgba(220, 53, 69, 0.2)' : '0 4px 12px rgba(220, 53, 69, 0.3)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? '8px' : '12px' }}>
                  <div style={{
                    fontSize: isMobile ? '20px' : '32px',
                    color: '#dc3545',
                    lineHeight: 1,
                    flexShrink: 0
                  }}>
                    <i className="fas fa-exclamation-circle"></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ 
                      color: '#dc3545', 
                      fontWeight: '700', 
                      marginBottom: isMobile ? '6px' : '10px',
                      fontSize: isMobile ? '0.95rem' : '18px'
                    }}>
                      提交失败
                    </h5>
                    <div style={{
                      whiteSpace: 'pre-line',
                      fontSize: isMobile ? '0.8rem' : '15px',
                      lineHeight: '1.6',
                      color: '#333'
                    }}>
                      {error}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: isMobile ? '18px' : '24px',
                      color: '#dc3545',
                      cursor: 'pointer',
                      lineHeight: 1,
                      padding: '0',
                      opacity: 0.7
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                    onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            <div className="form-actions" style={{
              padding: isMobile ? '10px 0' : undefined
            }}>
              <button
                type="submit"
                className={`btn btn-primary ${isMobile ? '' : 'btn-lg'}`}
                disabled={loading}
                style={{
                  fontSize: isMobile ? '0.95rem' : undefined,
                  padding: isMobile ? '12px 24px' : undefined,
                  width: isMobile ? '100%' : undefined
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    提交�?..
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane me-2" style={{ fontSize: isMobile ? '0.9rem' : undefined }}></i>
                    提交申请
                  </>
                )}
              </button>
            </div>
          </form>
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
                  handleCustomerTypeChange('');
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
                      handleCustomerTypeChange(ct.typeId);
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

export default ApplyForm;
