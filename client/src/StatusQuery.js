// StatusQuery.js
// 申请进度查询组件，支持邮箱验证码安全验证
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl, buildImageUrl } from './config';
import './StatusQuery.css';

function StatusQuery() {
  const [step, setStep] = useState(1); // 1: 输入查询信息, 2: 邮箱验证, 3: 显示结果
  const [queryType, setQueryType] = useState('phone'); // 'phone' 或 'code'
  const [countryCode, setCountryCode] = useState('+81'); // 默认日本
  const [query, setQuery] = useState({ 
    name: '', 
    phone: '', 
    applyCode: '', 
    email: '' 
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [queryToken, setQueryToken] = useState('');
  const [confirmData, setConfirmData] = useState({
    materials: {},
    materialPreviews: {},
    answers: {},
    notes: '',
    modificationReason: ''
  });
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [materialSubmitted, setMaterialSubmitted] = useState(false);
  const [activePersonIndex, setActivePersonIndex] = useState(0); // 0=主申请人, 1+=同行人

  // 支持从外部链接直达：自动使用 token 查询，并可直接展开材料表单
  useEffect(() => {
    const token = sessionStorage.getItem('statusQueryToken');
    const openMaterials = sessionStorage.getItem('statusQueryOpenMaterials') === '1';
    if (token) {
      (async () => {
        setLoading(true);
        setError('');
        try {
          await queryApplicationWithToken(token);
          if (openMaterials) {
            setShowMaterialForm(true);
          }
        } catch (err) {
          setError(err.response?.data?.message || '查询失败');
        } finally {
          setLoading(false);
          // 用过就清掉，避免后续干扰
          sessionStorage.removeItem('statusQueryToken');
          sessionStorage.removeItem('statusQueryOpenMaterials');
        }
      })();
    }
  }, []);

  // 查询表单输入变化
  const handleChange = e => {
    setQuery({ ...query, [e.target.name]: e.target.value });
  };

  // 第一步：提交查询信息
  const handleQuerySubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // 验证必填字段
    if (!query.name) {
      setError('请填写姓名');
      return;
    }
    
    if (queryType === 'phone' && !query.phone) {
      setError('请填写手机号');
      return;
    }
    
    if (queryType === 'code' && !query.applyCode) {
      setError('请填写申请编码');
      return;
    }
    
    if (!query.email) {
      setError('请填写邮箱地址用于接收验证码');
      return;
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(query.email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    
    setLoading(true);
    try {
      const requestData = {
        email: query.email,
        name: query.name,
        queryType: queryType
      };
      
      if (queryType === 'phone') {
        requestData.phone = countryCode + ' ' + query.phone;
      } else if (queryType === 'code') {
        requestData.applyCode = query.applyCode;
      }
      
      const response = await axios.post(buildApiUrl('/api/send-verification-code'), requestData);
      
      setSuccess(response.data.message);
      setStep(2);
      startCountdown();
    } catch (err) {
      setError(err.response?.data?.message || '发送验证码失败');
    } finally {
      setLoading(false);
    }
  };

  // 开始倒计时
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 重新发送验证码
  const resendCode = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const requestData = {
        email: query.email,
        name: query.name,
        queryType: queryType
      };
      
      if (queryType === 'phone') {
        requestData.phone = countryCode + ' ' + query.phone;
      } else if (queryType === 'code') {
        requestData.applyCode = query.applyCode;
      }
      
      const response = await axios.post(buildApiUrl('/api/send-verification-code'), requestData);
      
      setSuccess(response.data.message);
      setError('');
      startCountdown();
    } catch (err) {
      setError(err.response?.data?.message || '发送验证码失败');
    } finally {
      setLoading(false);
    }
  };

  // 第二步：验证邮箱验证码
  const handleVerifyCode = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!verificationCode) {
      setError('请输入验证码');
      return;
    }
    
    setLoading(true);
    try {
      const requestData = {
        email: query.email,
        code: verificationCode,
        name: query.name,
        queryType: queryType
      };
      
      if (queryType === 'phone') {
        requestData.phone = countryCode + ' ' + query.phone;
      } else if (queryType === 'code') {
        requestData.applyCode = query.applyCode;
      }
      
      const response = await axios.post(buildApiUrl('/api/verify-email-code'), requestData);
      
      setQueryToken(response.data.token);
      setSuccess('');
      
      // 使用token查询申请信息
      await queryApplicationWithToken(response.data.token);
      
    } catch (err) {
      setError(err.response?.data?.message || '验证失败');
    } finally {
      setLoading(false);
    }
  };

  // 使用token查询申请信息
  const queryApplicationWithToken = async (token) => {
    setSuccess('');
    try {
      const response = await axios.get(buildApiUrl(`/api/status?token=${token}`));
      const resultData = { ...response.data, id: response.data.id || response.data._id };
      setResult(resultData);
      setStep(3);
      
      // 如果已经有确认信息，预填充表单
      setConfirmData({
        materials: {},
        materialPreviews: {},
        answers: response.data.answers || {},
        notes: response.data.notes || '',
        modificationReason: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || '查询失败');
    }
  };

  // 返回第一步
  const goBackToStep1 = () => {
    setStep(1);
    setVerificationCode('');
    setResult(null);
    setError('');
    setSuccess('');
    setQueryToken('');
    setCountryCode('+81'); // 重置为默认日本
  };

  // 返回第二步
  const goBackToStep2 = () => {
    setStep(2);
    setResult(null);
    setError('');
    setSuccess('');
  };

  // 处理确认提交
  const handleConfirm = async () => {
    if (!result || !result.id) {
      setError('未能获取到申请单ID，无法提交。请刷新页面重试。');
      return;
    }

    if (!result.customerType) {
      setError('请等待工作人员为您选择办理类型后再提交材料');
      return;
    }
    
    try {
      // 构建所有人员列表
      const allPersons = [
        { personId: 'main', personName: result.name || '主申请人' },
        ...(result.companions || []).map((name, i) => ({ 
          personId: `comp${i}`, 
          personName: name || `同行人 ${i + 1}`
        }))
      ];
      const hasMultiplePeople = allPersons.length > 1;
      
      // 检查缺失的必填材料（改为警告而非阻止）
      const missingMaterials = [];
      if (result.customerType.materials && result.customerType.materials.length > 0) {
        result.customerType.materials.forEach(material => {
          if (material.required) {
            if (hasMultiplePeople) {
              // 多人情况：检查每个人是否都上传了
              allPersons.forEach(person => {
                const uploadKey = `${material.materialId}_${person.personId}`;
                if (!confirmData.materials[uploadKey] || confirmData.materials[uploadKey].length === 0) {
                  missingMaterials.push(`${material.name}(${person.personName})`);
                }
              });
            } else {
              // 单人情况：只检查一次
              const uploadKey = material.materialId;
              if (!confirmData.materials[uploadKey] || confirmData.materials[uploadKey].length === 0) {
                missingMaterials.push(material.name);
              }
            }
          }
        });
      }

      // 检查缺失的必填问题
      const missingAnswers = [];
      if (result.customerType.questions && result.customerType.questions.length > 0) {
        result.customerType.questions.forEach(question => {
          // 所有问题答案都是多人共用的，只检查一次
          if (question.required) {
            const answerKey = question.questionId;
            if (!confirmData.answers[answerKey] || !confirmData.answers[answerKey].trim()) {
              missingAnswers.push(question.question);
            }
          }
        });
      }

      // 如果有缺失项，弹出确认对话框
      if (missingMaterials.length > 0 || missingAnswers.length > 0) {
        let confirmMessage = '⚠️ 检测到以下必填项尚未完成：\n\n';
        
        if (missingMaterials.length > 0) {
          confirmMessage += '📄 缺失材料：\n' + missingMaterials.map(m => `  • ${m}`).join('\n') + '\n\n';
        }
        
        if (missingAnswers.length > 0) {
          confirmMessage += '❓ 未回答问题：\n' + missingAnswers.map(q => `  • ${q}`).join('\n') + '\n\n';
        }
        
        confirmMessage += '您可以：\n';
        confirmMessage += '✅ 现在提交已有材料，稍后补充缺失的部分\n';
        confirmMessage += '❌ 取消提交，继续准备材料\n\n';
        confirmMessage += '是否现在提交？';
        
        if (!window.confirm(confirmMessage)) {
          return; // 用户选择不提交
        }
      }

      if (hasSubmittedMaterials() && !confirmData.modificationReason) {
        setError('请填写修改理由');
        return;
      }
      
      setError('');
      setSuccess('正在处理中...');
      
      const formDataObj = new FormData();
      
      // 添加答案（JSON格式）
      formDataObj.append('answers', JSON.stringify(confirmData.answers || {}));
      formDataObj.append('notes', confirmData.notes || '');
      formDataObj.append('modificationReason', confirmData.modificationReason || '');
      
      // 添加材料文件
      if (confirmData.materials) {
        Object.keys(confirmData.materials).forEach(materialId => {
          const files = confirmData.materials[materialId];
          if (files && files.length > 0) {
            files.forEach((file, index) => {
              formDataObj.append(`materials_${materialId}`, file);
            });
          }
        });
      }
      
      const response = await axios.put(buildApiUrl(`/api/applications/${result.id}/confirm`), formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000
      });
      
      // 根据是否有缺失项显示不同的成功消息
      let successMsg = '✅ 材料已提交成功！';
      const hasMissingItems = missingMaterials.length > 0 || missingAnswers.length > 0;
      
      if (hasMissingItems) {
        successMsg += '\n\n📌 您还有部分必填项未完成，请后续通过"申请修改"补充：\n';
        if (missingMaterials.length > 0) {
          successMsg += '• ' + missingMaterials.join('、') + '\n';
        }
        if (missingAnswers.length > 0) {
          successMsg += '• 问题：' + missingAnswers.map(q => q.length > 20 ? q.substring(0, 20) + '...' : q).join('、') + '\n';
        }
      }
      
      successMsg += '\n我们的客服团队将在1-2个工作日内通过微信/LINE或电话与您联系！';
      
      setSuccess(successMsg);
      setShowMaterialForm(false);
      setMaterialSubmitted(true);
      
      // 重新查询最新状态
      try {
        const refreshResponse = await axios.get(buildApiUrl(`/api/status`), {
          params: {
            name: result.name,
            phone: result.phone,
            applyCode: result.applyCode
          }
        });
        const resultData = { ...refreshResponse.data, id: refreshResponse.data.id || refreshResponse.data._id };
        setResult(resultData);
      } catch (err) {
        console.error('重新查询失败:', err);
      }
    } catch (err) {
      console.error('提交失败:', err);
      setError('提交失败：' + (err.response?.data?.message || err.message || '网络错误'));
    }
  };

  // 处理取消申请
  const handleCancel = async () => {
    if (!result || !result.id) {
      setError('未能获取到申请单ID，无法取消。请刷新页面重试。');
      return;
    }
    
    try {
      setError('');
      setSuccess('正在处理中...');
      
      let newStatus = '已取消';
      if (result.status === '已完成') {
        newStatus = '待处理';
      }
      
      await axios.put(buildApiUrl(`/api/applications/${result.id}`), {
        status: newStatus
      });
      
      setSuccess('申请已取消');
      // 重新查询最新状态 - 使用原始查询方式避免token问题
      try {
        const response = await axios.get(buildApiUrl(`/api/status`), {
          params: {
            name: result.name,
            phone: result.phone,
            applyCode: result.applyCode
          }
        });
        const resultData = { ...response.data, id: response.data.id || response.data._id };
        setResult(resultData);
      } catch (err) {
        console.error('重新查询失败:', err);
        // 即使重新查询失败，也不影响用户看到成功消息
      }
    } catch (err) {
      console.error('取消申请失败:', err);
      setError('取消申请失败：' + (err.response?.data?.message || err.message || '网络错误'));
    }
  };

  // 申请修改材料
  const handleRequestModification = () => {
    setConfirmData({
      materials: {},
      materialPreviews: {},
      answers: result.answers || {},
      notes: result.notes || '',
      modificationReason: ''
    });
    setShowMaterialForm(true);
  };

  // 提交修改申请
  const submitModificationRequest = async () => {
    console.log('🚀 submitModificationRequest 被调用');
    console.log('📦 confirmData:', confirmData);
    
    if (!result || !result.id) {
      setError('未能获取到申请单ID，无法提交修改申请。请刷新页面重试。');
      return;
    }
    
    if (!result.customerType) {
      setError('请等待工作人员为您选择办理类型后再提交材料');
      return;
    }
    
    // 修改理由改为可选
    // if (!confirmData.modificationReason || !confirmData.modificationReason.trim()) {
    //   setError('请填写修改理由');
    //   return;
    // }

    try {
      setError('');
      setSuccess('正在提交修改申请...');
      
      console.log('✅ 开始创建 FormData');
      const formDataObj = new FormData();
      
      // 添加答案（JSON格式）
      formDataObj.append('answers', JSON.stringify(confirmData.answers || {}));
      formDataObj.append('notes', confirmData.notes || '');
      formDataObj.append('modificationReason', (confirmData.modificationReason || '').trim());
      
      // 添加材料文件
      if (confirmData.materials) {
        console.log('📦 准备提交的材料keys:', Object.keys(confirmData.materials));
        console.log('📦 confirmData.materials 完整内容:', confirmData.materials);
        
        Object.keys(confirmData.materials).forEach(uploadKey => {
          const files = confirmData.materials[uploadKey];
          if (files && files.length > 0) {
            console.log(`📎 材料 uploadKey=${uploadKey}: ${files.length} 个文件`);
            files.forEach((file, index) => {
              const fieldName = `materials_${uploadKey}`;
              console.log(`  ✅ 添加文件: fieldName=${fieldName}, 文件名=${file.name}, 大小=${file.size}`);
              formDataObj.append(fieldName, file);
            });
          }
        });
        
        console.log('📋 FormData 中的所有字段:');
        for (let [key, value] of formDataObj.entries()) {
          if (value instanceof File) {
            console.log(`  ${key}: [File] ${value.name}`);
          } else {
            console.log(`  ${key}: ${value}`);
          }
        }
      }
      
      console.log('📤 准备发送请求到:', `/api/applications/${result.id}/request-modification`);
      const response = await axios.post(buildApiUrl(`/api/applications/${result.id}/request-modification`), formDataObj);
      console.log('✅ 服务器响应:', response.data);
      
      setSuccess("修改申请已提交，请等待客服审核");
      setShowMaterialForm(false);
      setConfirmData({
        materials: {},
        materialPreviews: {},
        answers: {},
        notes: '',
        modificationReason: ''
      });
      // 重新查询最新状态
      try {
        const response = await axios.get(buildApiUrl(`/api/status`), {
          params: {
            name: result.name,
            phone: result.phone,
            applyCode: result.applyCode
          }
        });
        const resultData = { ...response.data, id: response.data.id || response.data._id };
        setResult(resultData);
      } catch (err) {
        console.error('重新查询失败:', err);
      }
    } catch (err) {
      console.error('❌ 提交修改申请失败:', err);
      console.error('❌ 错误详情:', err.response?.data);
      console.error('❌ 错误信息:', err.message);
      setError(err.response?.data?.message || '提交修改申请失败');
      setSuccess('');
    }
  };

  // 申请取消订单
  const handleRequestCancellation = async () => {
    if (!result || !result.id) {
      setError('未能获取到申请单ID，无法申请取消。请刷新页面重试。');
      return;
    }
    
    const reason = prompt("请说明需要取消申请的原因：");
    if (reason && reason.trim()) {
      try {
        await axios.post(buildApiUrl(`/api/applications/${result.id}/request-cancellation`), {
          reason: reason.trim()
        });
        setSuccess("取消申请已提交，请等待客服审核");
        // 重新查询最新状态 - 使用原始查询方式避免token问题
        try {
          const response = await axios.get(buildApiUrl(`/api/status`), {
            params: {
              name: result.name,
              phone: result.phone,
              applyCode: result.applyCode
            }
          });
          const resultData = { ...response.data, id: response.data.id || response.data._id };
          setResult(resultData);
        } catch (err) {
          console.error('重新查询失败:', err);
          // 即使重新查询失败，也不影响用户看到成功消息
        }
      } catch (err) {
        setError(err.response?.data?.message || '提交取消申请失败');
      }
    }
  };

  // 处理图片预览
  const handleImagePreview = (imagePath) => {
    const fullUrl = buildImageUrl(imagePath);
    window.open(fullUrl, '_blank');
  };

  // 处理修改材料
  const handleEdit = () => {
    if (showMaterialForm) {
      setShowMaterialForm(false);
    } else {
      setShowMaterialForm(true);
      // 初始化表单数据，如果之前有提交过就预填充
      setConfirmData({
        materials: {},
        materialPreviews: {},
        answers: result.answers || {},
        notes: result.notes || '',
        modificationReason: ''
      });
    }
  };

  // 判断是否应该显示材料提交表单
  const shouldShowMaterialForm = () => {
    return result && showMaterialForm;
  };

  // 判断是否应该显示操作按钮
  const shouldShowActionButtons = () => {
    return result && result.status === '待处理';
  };

  // 判断是否已提交材料
  const hasSubmittedMaterials = () => {
    console.log('🔍 检查是否有材料可提交');
    console.log('confirmData.materials:', confirmData.materials);
    console.log('confirmData.answers:', confirmData.answers);
    
    if (!result || !result.customerType) {
      console.log('❌ 没有result或customerType');
      return false;
    }
    
    // 检查是否有新上传的材料（未提交）
    if (confirmData.materials && Object.keys(confirmData.materials).length > 0) {
      console.log('✅ 有新上传的材料');
      return true;
    }
    
    // 检查是否有新填写的答案
    if (confirmData.answers && Object.keys(confirmData.answers).length > 0) {
      console.log('✅ 有新填写的答案');
      return true;
    }
    
    // 检查是否有补充说明
    if (confirmData.notes && confirmData.notes.trim()) {
      console.log('✅ 有补充说明');
      return true;
    }
    
    console.log('❌ 没有任何可提交的内容');
    return false;
  };

  // 判断是否已确认安装申请
  const hasConfirmedInstallation = () => {
    return result && result.status === '已完成';
  };

  return (
    <div className="status-query-container">
      <div className="status-query-card">
        <div className="status-query-header">
          <h2 className="status-query-title">
            <i className="fas fa-search me-2"></i>
            申请进度查询
          </h2>
          <p className="status-query-subtitle">
            {step === 1 && '请输入查询信息并验证邮箱'}
            {step === 2 && '请输入邮箱验证码'}
            {step === 3 && '查询结果'}
          </p>
        </div>
        
        <div className="status-query-body">
          {/* 步骤指示器 */}
          <div className="steps-indicator mb-4">
            <div className="d-flex justify-content-between">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">输入信息</div>
              </div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">邮箱验证</div>
              </div>
              <div className={`step ${step >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">查看结果</div>
              </div>
            </div>
          </div>

          {/* 第一步：输入查询信息 */}
          {step === 1 && (
            <form onSubmit={handleQuerySubmit}>
              {/* 查询方式选择 */}
              <div className="mb-4">
                <label className="form-label fw-bold">选择查询方式：</label>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="queryType"
                        id="queryTypePhone"
                        value="phone"
                        checked={queryType === 'phone'}
                        onChange={(e) => setQueryType(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="queryTypePhone">
                        <strong>方式一：姓名 + 手机号 + 邮箱验证</strong>
                        <br />
                        <small className="text-muted">适用于记住手机号的用户</small>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="queryType"
                        id="queryTypeCode"
                        value="code"
                        checked={queryType === 'code'}
                        onChange={(e) => setQueryType(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="queryTypeCode">
                        <strong>方式二：姓名 + 申请编码 + 邮箱验证</strong>
                        <br />
                        <small className="text-muted">适用于有申请编码的用户</small>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                {/* 姓名字段 */}
                <div className="col-12">
                  <label className="form-label">姓名：<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={query.name}
                    onChange={handleChange}
                    placeholder="请输入申请时填写的姓名"
                    required
                  />
                </div>

                {/* 根据查询方式显示不同字段 */}
                {queryType === 'phone' && (
                  <div className="col-12">
                    <label className="form-label">手机号：<span className="text-danger">*</span></label>
                    <div className="input-group">
                      <select 
                        className="form-select" 
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        style={{ maxWidth: '120px' }}
                      >
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+86">🇨🇳 +86</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+82">🇰🇷 +82</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+60">🇲🇾 +60</option>
                        <option value="+66">🇹🇭 +66</option>
                        <option value="+84">🇻🇳 +84</option>
                      </select>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={query.phone}
                        onChange={handleChange}
                        placeholder="请输入申请时填写的手机号"
                        required
                      />
                    </div>
                    <small className="text-muted">默认日本 +81</small>
                  </div>
                )}

                {queryType === 'code' && (
                  <div className="col-12">
                    <label className="form-label">申请编码：<span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="applyCode"
                      value={query.applyCode}
                      onChange={handleChange}
                      placeholder="请输入申请编码（申请成功后获得）"
                      required
                    />
                    <small className="text-muted">申请编码在申请成功后会提供给您</small>
                  </div>
                )}

                <div className="col-12">
                  <label className="form-label">邮箱地址：<span className="text-danger">*</span></label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={query.email}
                    onChange={handleChange}
                    placeholder="请输入申请时填写的邮箱地址"
                    required
                  />
                  <small className="text-muted">验证码将发送到此邮箱</small>
                </div>
              </div>
              <div className="text-center mt-3">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      发送中...
                    </>
                  ) : (
                    '发送验证码'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* 第二步：邮箱验证 */}
          {step === 2 && (
            <div>
              <div className="alert alert-info mb-3">
                <i className="fas fa-envelope me-2"></i>
                验证码已发送到 <strong>{query.email.replace(/(.{2}).*(@.*)/, '$1***$2')}</strong>
                <br />
                <small>请查收邮件并输入6位数字验证码</small>
              </div>
              
              <form onSubmit={handleVerifyCode}>
                <div className="mb-3">
                  <label className="form-label">验证码：</label>
                  <input
                    type="text"
                    className="form-control text-center"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="请输入6位验证码"
                    maxLength="6"
                    style={{ fontSize: '1.2rem', letterSpacing: '0.2rem' }}
                  />
                </div>
                
                <div className="d-flex justify-content-between align-items-center">
                  <button type="button" className="btn btn-outline-secondary" onClick={goBackToStep1}>
                    返回上一步
                  </button>
                  
                  <div className="d-flex gap-2">
                    <button 
                      type="button" 
                      className="btn btn-outline-primary" 
                      onClick={resendCode}
                      disabled={countdown > 0 || loading}
                    >
                      {countdown > 0 ? `重新发送(${countdown}s)` : '重新发送'}
                    </button>
                    
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          验证中...
                        </>
                      ) : (
                        '验证并查询'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* 第三步：显示查询结果 */}
          {step === 3 && result && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div></div>
                <button className="btn btn-outline-secondary btn-sm" onClick={goBackToStep1}>
                  重新查询
                </button>
              </div>

              {/* 动态提示信息 */}
              {result.feedback ? (
                <div className="alert alert-info text-center mb-3" style={{ border: '1px solid #dc3545' }}>
                  <i className="fas fa-comment me-2"></i>
                  <strong>{result.feedback}</strong>
                </div>
              ) : (result.status === '处理中') ? (
                <div className="alert alert-success text-center mb-3">
                  <i className="fas fa-check-circle me-2"></i>
                  <strong>材料已经合格，我司会尽快安排提交签证中心审核。如有问题或需要额外补充材料，专属客服会另外联系通知。</strong>
                </div>
              ) : (
                <>
                  {result.status === '待处理' && (
                    <div className="alert alert-info text-center mb-3">
                      <i className="fas fa-clock me-2"></i>
                      <strong>您的申请已提交成功！</strong><br />
                      我们会有专属客服将在1-2个工作日内通过微信/LINE或电话与您联系。
                    </div>
                  )}
                  {result.status === '待确认' && (
                    <div className="alert alert-success text-center mb-3">
                      <i className="fas fa-check-circle me-2"></i>
                      <strong>您的申请已通过，请提交申请人的材料给我们，以便继续后续的申请流程。</strong>
                    </div>
                  )}
                  {result.status === '处理中' && (
                    <div className="alert alert-success text-center mb-3">
                      <i className="fas fa-check-circle me-2"></i>
                      <strong>材料已经合格，我司会尽快安排提交签证中心审核。如有问题或需要额外补充材料，专属客服会另外联系通知。</strong>
                    </div>
                  )}
                  {result.status === '已完成' && (
                    <div className="alert alert-success text-center mb-3">
                      <i className="fas fa-check-circle me-2"></i>
                      <strong>🎉 恭喜！您的签证已经成功办理！</strong><br />
                      <span className="text-success">签证的证件，请联系专属客服索取。如有任何使用问题，可以咨询联系客服。</span>
                    </div>
                  )}
                </>
              )}
              
              {/* 申请信息 */}
              <div className="card mb-3">
                <div className="card-header">
                  <h5 className="mb-0">申请信息</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>姓名：</strong>{result.name}</p>
                      <p><strong>手机号：</strong>{result.phone}</p>
                      <p><strong>地址：</strong>{result.address}</p>
                      <p><strong>签证类型：</strong>{result.package}</p>
                      {result.customerType && <p><strong>办理类型：</strong>{result.customerType.typeName}</p>}
                      {result.networkType && <p><strong>办理方式：</strong>{result.networkType}</p>}
                      {result.wechat && <p><strong>微信号：</strong>{result.wechat}</p>}
                      {result.line && <p><strong>LINE号：</strong>{result.line}</p>}
                      {result.email && <p><strong>邮箱地址：</strong>{result.email}</p>}
                    </div>
                    <div className="col-md-6">
                      <p><strong>状态：</strong>
                        <span className={`badge ${
                          result.status === '待处理' ? 'bg-warning' :
                          result.status === '待确认' ? 'bg-info' :
                          result.status === '处理中' ? 'bg-primary' :
                          result.status === '已完成' ? 'bg-success' :
                          result.status === '已取消' ? 'bg-danger' :
                          'bg-secondary'
                        }`}>
                          {result.status}
                        </span>
                      </p>
                      <p><strong>申请时间：</strong>{new Date(result.createdAt).toLocaleString()}</p>
                      <p><strong>申请编码：</strong>{result.applyCode}</p>
                    </div>
                  </div>
                  
                  {/* 备注信息 */}
                  {result.notes && (
                    <div className="mt-3 pt-3 border-top">
                      <div className="row">
                        <div className="col-12">
                          <p><strong>备注信息：</strong></p>
                          <div className="alert alert-light">
                            <i className="fas fa-sticky-note me-2"></i>
                            {result.notes}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 所有申请记录列表 */}
                  {result.hasMultipleApplications && (
                    <div className="mt-3 pt-3 border-top">
                      <h6 className="mb-3">
                        <i className="fas fa-list me-2"></i>
                        所有申请记录
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-striped table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>申请编码</th>
                              <th>套餐</th>
                              <th>地址</th>
                              <th>状态</th>
                              <th>申请时间</th>
                              <th>备注</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.allApplications.map((app, index) => (
                              <tr key={app.id} className={index === 0 ? 'table-primary' : ''}>
                                <td>
                                  <strong>{app.applyCode}</strong>
                                  {index === 0 && <span className="badge bg-success ms-2">最新</span>}
                                </td>
                                <td>{app.package}</td>
                                <td>{app.address}</td>
                                <td>
                                  <span className={`badge ${
                                    app.status === '待处理' ? 'bg-warning' :
                                    app.status === '待确认' ? 'bg-info' :
                                    app.status === '处理中' ? 'bg-primary' :
                                    app.status === '已完成' ? 'bg-success' :
                                    app.status === '已取消' ? 'bg-danger' :
                                    'bg-secondary'
                                  }`}>
                                    {app.status}
                                  </span>
                                </td>
                                <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                                <td>
                                  {index === 0 ? (
                                    <span className="text-muted small">当前查看</span>
                                  ) : (
                                    <span className="text-muted small">使用编码查询详情</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* 已提交的材料信息 */}
                  {(result.idCardFront || result.idCardBack || result.passportPhoto || result.other || result.japaneseName) && (
                    <div className="mt-3 pt-3 border-top">
                      <div style={{ background: '#faece6', borderRadius: '10px 10px 0 0', padding: '12px 24px', fontWeight: 700, fontSize: '1.25rem', marginBottom: '10px', borderBottom: '1.5px solid #f5c9b0' }}>
                        提交的材料
                      </div>
                      <div className="mb-2">
                        <strong>确认时间：</strong>{new Date(result.updatedAt || result.createdAt).toLocaleString()}
                      </div>
                      <div className="mb-2">
                        <strong>日语读音：</strong>{result.japaneseName || '—'}
                      </div>
                      <div className="mb-2">
                        <strong>上传的证件照片：</strong>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-3 text-center">
                          <div className="mb-1"><strong>在留卡正面：</strong></div>
                          {result.idCardFront ? (
                            <img 
                              src={buildImageUrl(result.idCardFront)} 
                              alt="在留卡正面" 
                              className="img-fluid border rounded" 
                              style={{ maxHeight: 120, width: 'auto', cursor: 'pointer' }}
                              onClick={() => handleImagePreview(result.idCardFront)}
                              title="点击查看大图"
                            />
                          ) : (
                            <div className="text-muted">无</div>
                          )}
                        </div>
                        <div className="col-md-3 text-center">
                          <div className="mb-1"><strong>在留卡反面：</strong></div>
                          {result.idCardBack ? (
                            <img 
                              src={buildImageUrl(result.idCardBack)} 
                              alt="在留卡反面" 
                              className="img-fluid border rounded" 
                              style={{ maxHeight: 120, width: 'auto', cursor: 'pointer' }}
                              onClick={() => handleImagePreview(result.idCardBack)}
                              title="点击查看大图"
                            />
                          ) : (
                            <div className="text-muted">无</div>
                          )}
                        </div>
                        <div className="col-md-3 text-center">
                          <div className="mb-1"><strong>护照照片页：</strong></div>
                          {result.passportPhoto ? (
                            <img 
                              src={buildImageUrl(result.passportPhoto)} 
                              alt="护照照片" 
                              className="img-fluid border rounded" 
                              style={{ maxHeight: 120, width: 'auto', cursor: 'pointer' }}
                              onClick={() => handleImagePreview(result.passportPhoto)}
                              title="点击查看大图"
                            />
                          ) : (
                            <div className="text-muted">无</div>
                          )}
                        </div>
                        <div className="col-md-3 text-center">
                          <div className="mb-1"><strong>其他图片：</strong></div>
                          {result.other ? (
                            <img 
                              src={buildImageUrl(result.other)} 
                              alt="其他图片" 
                              className="img-fluid border rounded" 
                              style={{ maxHeight: 120, width: 'auto', cursor: 'pointer' }}
                              onClick={() => handleImagePreview(result.other)}
                              title="点击查看大图"
                            />
                          ) : (
                            <div className="text-muted">无</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 操作按钮 */}
                  <div className="mt-3 pt-3 border-top">
                    <div className="d-flex gap-2">
                      {shouldShowActionButtons() && (
                        <>
                          {['待处理', '待确认', '处理中'].includes(result.status) && (
                            <button className="btn btn-outline-danger" onClick={handleCancel}>
                              取消申请
                            </button>
                          )}
                        </>
                      )}
                      
                      {(result.status === '待确认' || result.status === '处理中' || result.status === '已完成') && (
                        <>
                          {!hasSubmittedMaterials() ? (
                            <>
                              <button className="btn btn-primary" onClick={handleEdit}>
                                提交材料
                              </button>
                              {['待处理', '待确认', '处理中'].includes(result.status) && (
                                <button className="btn btn-outline-danger" onClick={handleCancel}>
                                  取消
                                </button>
                              )}
                            </>
                          ) : hasConfirmedInstallation() ? (
                            <>
                              <button className="btn btn-outline-danger" onClick={handleCancel}>
                                取消申请
                              </button>
                            </>
                          ) : hasSubmittedMaterials() ? (
                            <>
                              <button className="btn btn-outline-secondary" onClick={handleRequestModification}>
                                申请修改材料
                              </button>
                              <button className="btn btn-outline-danger" onClick={handleRequestCancellation}>
                                申请取消
                              </button>
                            </>
                          ) : result.status === '处理中' ? (
                            <>
                              <div className="alert alert-info mb-3">
                                <i className="fas fa-clock me-2"></i>
                                正在处理中，请耐心等待客服联系
                              </div>
                              <button className="btn btn-outline-secondary" onClick={handleRequestModification}>
                                申请修改材料
                              </button>
                              <button className="btn btn-outline-danger" onClick={handleRequestCancellation}>
                                申请取消
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-outline-danger" onClick={handleRequestCancellation}>
                                申请取消
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>


              {/* 材料提交表单 */}
              {shouldShowMaterialForm() && (
                <div className="card mb-3">
                  <div style={{ background: '#faece6', borderRadius: '10px 10px 0 0', padding: '12px 24px', fontWeight: 700, fontSize: '1.25rem', marginBottom: '10px', borderBottom: '1.5px solid #f5c9b0' }}>
                    {hasSubmittedMaterials() ? '申请修改材料' : '提交材料信息'}
                  </div>
                  <div className="card-body">
                    {!result.customerType ? (
                      <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        <strong>请稍候</strong><br/>
                        工作人员正在为您确认办理类型，确认后您将能看到需要提交的材料清单和问题。<br/>
                        如有疑问，请联系客服。
                      </div>
                    ) : (
                      <>
                        <div className="alert alert-light mb-3">
                          <strong>办理类型：</strong>{result.customerType.typeName}
                          <p className="mb-0 mt-2 text-muted small">
                            <i className="fas fa-info-circle me-1"></i>
                            请按照要求上传材料并回答问题
                          </p>
                        </div>

                        {/* 友好提示 */}
                        <div className="alert alert-success mb-2" style={{ 
                          backgroundColor: '#d1f2eb', 
                          borderColor: '#17a2b8', 
                          borderLeft: '3px solid #17a2b8',
                          padding: '8px 12px'
                        }}>
                          <div className="d-flex align-items-start">
                            <i className="fas fa-lightbulb me-2" style={{ color: '#17a2b8', fontSize: '0.9rem' }}></i>
                            <div style={{ fontSize: '0.85rem' }}>
                              <strong>💡 温馨提示：</strong>
                              <ul className="mb-0 mt-1" style={{ paddingLeft: '18px' }}>
                                <li><strong>可以分批提交材料！</strong>如果您现在只有部分材料，可以先提交已有的，后续再补充缺失的材料。</li>
                                <li>带<span className="text-danger">*</span>号的为必填项，但您可以选择"先提交已有材料，稍后补充"。</li>
                                <li>提交后，您可以随时通过"申请修改"来补充或更新材料。</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* 同行人选项卡 */}
                        {(() => {
                          const allPersons = [
                            { personId: 'main', personName: result.name || '主申请人', isMain: true },
                            ...(result.companions || []).map((name, i) => ({ 
                              personId: `comp${i}`, 
                              personName: name || `同行人 ${i + 1}`,
                              isMain: false 
                            }))
                          ];
                          const hasMultiplePeople = allPersons.length > 1;

                          return hasMultiplePeople && (
                            <div className="mb-2">
                              <div className="d-flex gap-2 flex-wrap">
                                {allPersons.map((person, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    className={`btn btn-sm ${activePersonIndex === index ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => setActivePersonIndex(index)}
                                    style={{
                                      minWidth: '110px',
                                      fontSize: '0.85rem',
                                      padding: '4px 10px',
                                      fontWeight: activePersonIndex === index ? '600' : '400',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <i className="fas fa-user me-1" style={{ fontSize: '0.8rem' }}></i>
                                    {person.personName}
                                    {person.isMain && <span className="ms-1" style={{ fontSize: '0.75rem' }}>(主申请人)</span>}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* 材料清单 */}
                        {result.customerType.materials && result.customerType.materials.length > 0 && (() => {
                          // 构建所有人员列表
                          const allPersons = [
                            { personId: 'main', personName: result.name || '主申请人', isMain: true },
                            ...(result.companions || []).map((name, i) => ({ 
                              personId: `comp${i}`, 
                              personName: name || `同行人 ${i + 1}`,
                              isMain: false 
                            }))
                          ];

                          const hasMultiplePeople = allPersons.length > 1;
                          const currentPerson = allPersons[activePersonIndex];

                          return (
                            <div className="mb-3">
                              <h5 className="border-bottom pb-1 mb-2" style={{ fontSize: '1rem' }}>
                                <i className="fas fa-file-upload me-2"></i>申请材料
                                {hasMultiplePeople && (
                                  <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                                    {currentPerson.personName}
                                  </span>
                                )}
                                <span className="text-muted ms-2" style={{ fontSize: '0.75rem' }}>
                                  点击材料卡片可上传/管理图片
                                </span>
                              </h5>

                              <div className="d-flex flex-column gap-1">
                                {result.customerType.materials.map((material, index) => {
                                  const isPersonalMaterial = material.materialType === 'personal';
                                  
                                  // 在多人情况下，所有材料都需要为每个人单独存储
                                  // 在单人情况下，才使用简单的materialId作为key
                                  const uploadKey = hasMultiplePeople 
                                    ? `${material.materialId}_${currentPerson.personId}` 
                                    : material.materialId;
                                  
                                  const hasFiles = confirmData.materials?.[uploadKey]?.length > 0;
                                  
                                  // 检查该材料是否已经在后台提交过（且有文件）
                                  const isAlreadySubmitted = result.materials && result.materials.some(m => {
                                    // 必须有图片文件才算真正提交
                                    const hasImages = m.images && m.images.length > 0;
                                    if (!hasImages) return false;
                                    
                                    // 在多人情况下，需要同时匹配 materialId 和 personId
                                    if (hasMultiplePeople) {
                                      return m.materialId === material.materialId && m.personId === currentPerson.personId;
                                    }
                                    // 单人情况下，只需匹配 materialId
                                    return m.materialId === material.materialId;
                                  });
                                  
                                  // 如果已经提交过，就不显示
                                  if (isAlreadySubmitted) {
                                    return null;
                                  }
                                  
                                  return (
                                    <div key={material.materialId} className="card" style={{
                                      borderRadius: '4px',
                                      border: hasFiles ? '2px solid #10b981' : '1px solid #e5e7eb',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                      transition: 'all 0.2s',
                                      overflow: 'hidden',
                                      marginBottom: '0'
                                    }}>
                                      <div className="card-body p-0">
                                        <div className="d-flex align-items-center">
                                          {/* 左侧：状态标签区 */}
                                          <div style={{
                                            background: hasFiles ? '#10b981' : '#6b7280',
                                            color: 'white',
                                            padding: '6px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            minWidth: '60px',
                                            fontSize: '0.6rem',
                                            fontWeight: '600',
                                            height: '100%'
                                          }}>
                                            <div>
                                              {hasFiles ? '✓ 已提交' : '未提交'}
                                            </div>
                                            {hasMultiplePeople && isPersonalMaterial && (
                                              <div style={{
                                                background: 'rgba(255,255,255,0.2)',
                                                padding: '1px 4px',
                                                borderRadius: '2px',
                                                fontSize: '0.55rem',
                                                marginTop: '2px'
                                              }}>
                                                个人
                                              </div>
                                            )}
                                          </div>

                                          {/* 中间：标题和描述区 */}
                                          <div style={{ flex: 1, padding: '6px 10px', display: 'flex', alignItems: 'center' }}>
                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{
                                              width: '20px',
                                              height: '20px',
                                              background: '#f3f4f6',
                                              color: '#6b7280',
                                              fontSize: '0.7rem',
                                              fontWeight: '600',
                                              flexShrink: 0
                                            }}>
                                              {index + 1}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                              <div style={{ 
                                                fontSize: '0.85rem', 
                                                fontWeight: '600', 
                                                color: '#1f2937'
                                              }}>
                                                {material.name}
                                                {material.required && <span className="text-danger ms-1">*</span>}
                                              </div>
                                              {material.description && (
                                                <details open style={{ marginTop: '2px' }}>
                                                  <summary style={{ 
                                                    fontSize: '0.7rem', 
                                                    color: '#6b7280', 
                                                    cursor: 'pointer',
                                                    userSelect: 'none'
                                                  }}>
                                                    <i className="fas fa-info-circle me-1"></i>说明
                                                  </summary>
                                                  <div className="text-muted" style={{ 
                                                    fontSize: '0.7rem', 
                                                    lineHeight: '1.3',
                                                    paddingLeft: '16px',
                                                    marginTop: '2px'
                                                  }}>
                                                    {material.description}
                                                  </div>
                                                </details>
                                              )}
                                            </div>
                                          </div>

                                          {/* 右侧：图片预览和上传按钮区 */}
                                          <div style={{
                                            padding: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            minWidth: '140px',
                                            background: 'white',
                                            borderLeft: '1px solid #e5e7eb'
                                          }}>
                                            {/* 文件上传输入 */}
                                            <input
                                              type="file"
                                              id={`upload-${uploadKey}`}
                                              className="d-none"
                                              accept="image/*"
                                              multiple
                                              onChange={(e) => {
                                                const files = Array.from(e.target.files);
                                                if (files.length > 0) {
                                                  console.log(`上传材料: uploadKey=${uploadKey}, 文件数=${files.length}, 当前人员=${currentPerson.personId} (${currentPerson.personName})`);
                                                  setConfirmData(prev => ({
                                                    ...prev,
                                                    materials: {
                                                      ...prev.materials,
                                                      [uploadKey]: files
                                                    }
                                                  }));
                                                  
                                                  // 为所有图片创建预览
                                                  const previewPromises = files.map(file => {
                                                    return new Promise((resolve) => {
                                                      const reader = new FileReader();
                                                      reader.onload = (e) => resolve(e.target.result);
                                                      reader.readAsDataURL(file);
                                                    });
                                                  });
                                                  
                                                  Promise.all(previewPromises).then(previews => {
                                                    setConfirmData(prev => ({
                                                      ...prev,
                                                      materialPreviews: {
                                                        ...prev.materialPreviews,
                                                        [uploadKey]: previews
                                                      }
                                                    }));
                                                  });
                                                }
                                              }}
                                            />

                                            <div className="w-100">
                                              {confirmData.materialPreviews?.[uploadKey]?.length > 0 ? (
                                                <div>
                                                  {/* 图片网格展示 */}
                                                  <div style={{ 
                                                    display: 'grid',
                                                    gridTemplateColumns: confirmData.materialPreviews[uploadKey].length === 1 ? '1fr' : 'repeat(2, 1fr)',
                                                    gap: '3px',
                                                    marginBottom: '3px'
                                                  }}>
                                                    {confirmData.materialPreviews[uploadKey].map((preview, fileIndex) => (
                                                      <div 
                                                        key={fileIndex}
                                                        style={{ 
                                                          position: 'relative',
                                                          borderRadius: '2px',
                                                          overflow: 'hidden',
                                                          background: 'white',
                                                          border: '1px solid #e5e7eb'
                                                        }}
                                                      >
                                                        <img 
                                                          src={preview}
                                                          alt={`${material.name} ${fileIndex + 1}`}
                                                          className="img-fluid"
                                                          style={{ 
                                                            maxHeight: '40px', 
                                                            width: '100%', 
                                                            objectFit: 'cover'
                                                          }}
                                                        />
                                                        {/* 图片序号标签 */}
                                                        <div style={{
                                                          position: 'absolute',
                                                          top: '1px',
                                                          left: '1px',
                                                          background: 'rgba(0,0,0,0.7)',
                                                          color: 'white',
                                                          padding: '0px 3px',
                                                          borderRadius: '2px',
                                                          fontSize: '0.55rem'
                                                        }}>
                                                          {fileIndex + 1}
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                  <div className="text-center" style={{ fontSize: '0.6rem', color: '#6b7280', marginBottom: '3px' }}>
                                                    共 {confirmData.materialPreviews[uploadKey].length} 张
                                                  </div>
                                                  <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary w-100"
                                                    onClick={() => document.getElementById(`upload-${uploadKey}`).click()}
                                                    style={{ fontSize: '0.65rem', padding: '3px', lineHeight: '1.2' }}
                                                  >
                                                    <i className="fas fa-sync-alt me-1"></i>
                                                    重新上传
                                                  </button>
                                                </div>
                                              ) : (
                                                <button
                                                  type="button"
                                                  className="btn btn-warning w-100"
                                                  onClick={() => document.getElementById(`upload-${uploadKey}`).click()}
                                                  style={{ 
                                                    fontSize: '0.75rem', 
                                                    padding: '6px',
                                                    fontWeight: '500'
                                                  }}
                                                >
                                                  <i className="fas fa-cloud-upload-alt me-1"></i>
                                                  上传图片
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {/* 问题答案 */}
                        {result.customerType.questions && result.customerType.questions.length > 0 && (() => {
                          // 构建所有人员列表
                          const allPersons = [
                            { personId: 'main', personName: result.name || '主申请人', isMain: true },
                            ...(result.companions || []).map((name, i) => ({ 
                              personId: `comp${i}`, 
                              personName: name || `同行人 ${i + 1}`,
                              isMain: false 
                            }))
                          ];

                          const hasMultiplePeople = allPersons.length > 1;
                          const currentPerson = allPersons[activePersonIndex];

                          return (
                            <div className="mb-3">
                              <h5 className="border-bottom pb-1 mb-2" style={{ fontSize: '1rem' }}>
                                <i className="fas fa-question-circle me-2"></i>问题答案
                                {hasMultiplePeople && (
                                  <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                                    {currentPerson.personName}
                                  </span>
                                )}
                              </h5>

                              {result.customerType.questions.map((question, index) => {
                                // 所有问题答案都是多人共用的（不区分个人问题）
                                const answerKey = question.questionId;
                                
                                return (
                                  <div key={question.questionId} className="mb-2">
                                    <label className="form-label fw-bold mb-1" style={{ fontSize: '0.9rem' }}>
                                      {index + 1}. {question.question}
                                      {question.required && <span className="text-danger ms-1">*</span>}
                                      {!question.required && <span className="text-muted ms-1" style={{ fontSize: '0.8rem' }}>(可选)</span>}
                                      {hasMultiplePeople && (
                                        <span className="badge bg-info ms-2" style={{ fontSize: '0.65rem', color: '#fff', padding: '2px 6px' }}>
                                          多人共用
                                        </span>
                                      )}
                                    </label>
                                    {question.description && (
                                      <div className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>
                                        <i className="fas fa-info-circle me-1"></i>
                                        {question.description}
                                      </div>
                                    )}
                                    <textarea
                                      className="form-control form-control-sm"
                                      rows="2"
                                      value={confirmData.answers?.[answerKey] || ''}
                                      style={{ fontSize: '0.85rem' }}
                                      onChange={(e) => setConfirmData(prev => ({
                                        ...prev,
                                        answers: {
                                          ...prev.answers,
                                          [answerKey]: e.target.value
                                        }
                                      }))}
                                      placeholder="请输入您的答案"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}

                        {/* 备注 */}
                        <div className="mb-2">
                          <label className="form-label fw-bold mb-1" style={{ fontSize: '0.9rem' }}>备注：</label>
                          <textarea
                            className="form-control form-control-sm"
                            rows="2"
                            value={confirmData.notes || ''}
                            style={{ fontSize: '0.85rem' }}
                            onChange={(e) => setConfirmData({...confirmData, notes: e.target.value})}
                            placeholder="如有其他需要说明的内容，请在此填写"
                          />
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>可选</small>
                        </div>
                        
                        {hasSubmittedMaterials() && (
                          <div className="mb-2">
                            <label className="form-label fw-bold mb-1" style={{ fontSize: '0.9rem' }}>补充说明：</label>
                            <textarea
                              className="form-control form-control-sm"
                              rows="2"
                              value={confirmData.modificationReason || ''}
                              style={{ fontSize: '0.85rem' }}
                              onChange={(e) => setConfirmData({...confirmData, modificationReason: e.target.value})}
                              placeholder="如需补充说明，请在此填写"
                            />
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>可选</small>
                          </div>
                        )}
                        
                        <div className="mt-2 pt-2 border-top">
                          {!hasSubmittedMaterials() && (
                            <div className="alert alert-info mb-2" style={{ fontSize: '0.8rem', padding: '6px 10px' }}>
                              <i className="fas fa-hand-point-right me-2"></i>
                              <strong>提示：</strong>即使部分材料尚未准备好，也可以先提交已有的材料。系统会提示您缺失的项目，您可以选择继续提交。
                            </div>
                          )}
                          <div className="d-flex gap-2">
                            {hasSubmittedMaterials() ? (
                              <button className="btn btn-success" onClick={submitModificationRequest}>
                                提交修改申请
                              </button>
                            ) : (
                              <button className="btn btn-success" onClick={handleConfirm}>
                                确认并提交
                              </button>
                            )}
                            <button className="btn btn-secondary" onClick={() => setShowMaterialForm(false)}>
                              取消
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* 显示过程记录 - 只显示客户自己的操作 */}
              {result.processLog && result.processLog.filter(log => {
                // 过滤掉管理员和客服的操作，只显示客户/用户的操作
                const action = log.action || '';
                // 后台操作的关键词：管理员、客服、审核
                const isAdminAction = action.includes('管理员') || 
                                     action.includes('客服') || 
                                     action.includes('审核');
                return !isAdminAction;
              }).length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">我的操作记录</h5>
                  </div>
                  <div className="card-body">
                    <div className="timeline">
                      {result.processLog
                        .filter(log => {
                          // 只显示客户/用户的操作记录
                          const action = log.action || '';
                          // 后台操作的关键词：管理员、客服、审核
                          const isAdminAction = action.includes('管理员') || 
                                               action.includes('客服') || 
                                               action.includes('审核');
                          return !isAdminAction;
                        })
                        .map((log, index) => (
                        <div key={index} className="row mb-2">
                          <div className="col-md-3">
                            <small className="text-muted">
                              {new Date(log.timestamp).toLocaleString()}
                            </small>
                          </div>
                          <div className="col-md-9">
                            <div className="alert alert-light mb-0">
                              <strong>{log.action}</strong>
                              <br />
                              {log.description}
                              {log.images && (
                                <div className="mt-2">
                                  <div className="row">
                                    {log.images.idCardFront && (
                                      <div className="col-md-3">
                                        <div className="text-center">
                                          <small className="text-muted">在留卡正面</small>
                                          <img 
                                            src={buildImageUrl(log.images.idCardFront)} 
                                            alt="在留卡正面" 
                                            className="img-fluid border rounded" 
                                            style={{ maxHeight: 80, width: 'auto', cursor: 'pointer' }}
                                            onError={(e) => {
                                              console.error('过程记录图片加载失败:', log.images.idCardFront);
                                              e.target.style.display = 'none';
                                            }}
                                            onClick={() => handleImagePreview(log.images.idCardFront)}
                                            title="点击查看大图"
                                          />
                                        </div>
                                      </div>
                                    )}
                                    {log.images.idCardBack && (
                                      <div className="col-md-3">
                                        <div className="text-center">
                                          <small className="text-muted">在留卡反面</small>
                                          <img 
                                            src={buildImageUrl(log.images.idCardBack)} 
                                            alt="在留卡反面" 
                                            className="img-fluid border rounded" 
                                            style={{ maxHeight: 80, width: 'auto', cursor: 'pointer' }}
                                            onError={(e) => {
                                              console.error('过程记录图片加载失败:', log.images.idCardBack);
                                              e.target.style.display = 'none';
                                            }}
                                            onClick={() => handleImagePreview(log.images.idCardBack)}
                                            title="点击查看大图"
                                          />
                                        </div>
                                      </div>
                                    )}
                                    {log.images.passportPhoto && (
                                      <div className="col-md-3">
                                        <div className="text-center">
                                          <small className="text-muted">护照照片</small>
                                          <img 
                                            src={buildImageUrl(log.images.passportPhoto)} 
                                            alt="护照照片" 
                                            className="img-fluid border rounded" 
                                            style={{ maxHeight: 80, width: 'auto', cursor: 'pointer' }}
                                            onError={(e) => {
                                              console.error('过程记录图片加载失败:', log.images.passportPhoto);
                                              e.target.style.display = 'none';
                                            }}
                                            onClick={() => handleImagePreview(log.images.passportPhoto)}
                                            title="点击查看大图"
                                          />
                                        </div>
                                      </div>
                                    )}
                                    {log.images.other && (
                                      <div className="col-md-3">
                                        <div className="text-center">
                                          <small className="text-muted">其他图片</small>
                                          <img 
                                            src={buildImageUrl(log.images.other)} 
                                            alt="其他图片" 
                                            className="img-fluid border rounded" 
                                            style={{ maxHeight: 80, width: 'auto', cursor: 'pointer' }}
                                            onError={(e) => {
                                              console.error('过程记录图片加载失败:', log.images.other);
                                              e.target.style.display = 'none';
                                            }}
                                            onClick={() => handleImagePreview(log.images.other)}
                                            title="点击查看大图"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 错误和成功消息 */}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {success && <div className="alert alert-success mt-3">{success}</div>}
        </div>
      </div>
    </div>
  );
}

export default StatusQuery;
