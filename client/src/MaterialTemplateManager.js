// MaterialTemplateManager.js
// 材料模板管理组件 - 配置不同签证类型的材料清单

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './config';

function MaterialTemplateManager({ token }) {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // 展开/收起状态
  const [expandedCustomerType, setExpandedCustomerType] = useState(null);
  
  // 标签页状态（材料/问题）
  const [activeTab, setActiveTab] = useState({});
  
  // 编辑模态框状态
  const [showCustomerTypeModal, setShowCustomerTypeModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [currentCustomerType, setCurrentCustomerType] = useState(null);
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [editingCustomerTypeIndex, setEditingCustomerTypeIndex] = useState(null);
  const [editingMaterialIndex, setEditingMaterialIndex] = useState(null);
  
  // 问题模板状态（简化版 - 不使用问题组）
  const [questionTemplates, setQuestionTemplates] = useState({});

  // 加载签证类型列表
  useEffect(() => {
    loadPackages();
  }, []);

  // 当选择签证类型时，加载对应的材料模板
  useEffect(() => {
    if (selectedPackage) {
      loadTemplate();
    }
  }, [selectedPackage]);

  const loadPackages = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/packages`);
      setPackages(res.data);
    } catch (error) {
      console.error('加载签证类型失败:', error);
      showMessage('加载签证类型失败', 'error');
    }
  };

  const loadTemplate = async () => {
    if (!selectedPackage) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/material-templates/package/${selectedPackage}`);
      if (res.data) {
        setTemplate(res.data);
        // 为每个客户类型加载问题模板
        if (res.data.customerTypes && res.data.customerTypes.length > 0) {
          res.data.customerTypes.forEach((ct, index) => {
            loadQuestionTemplate(ct.typeId, index);
          });
        }
      } else {
        // 如果没有模板，创建一个新的空模板
        const pkg = packages.find(p => p._id === selectedPackage);
        setTemplate({
          packageId: selectedPackage,
          packageName: pkg?.name || '',
          customerTypes: []
        });
      }
    } catch (error) {
      console.error('加载材料模板失败:', error);
      showMessage('加载材料模板失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 加载单个客户类型的问题模板（简化版）
  const loadQuestionTemplate = async (customerTypeId, index) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/question-templates/package/${selectedPackage}/customer-type/${customerTypeId}`
      );
      if (res.data && res.data.questions) {
        setQuestionTemplates(prev => ({
          ...prev,
          [customerTypeId]: res.data.questions
        }));
      } else {
        // 创建新的空问题数组
        setQuestionTemplates(prev => ({
          ...prev,
          [customerTypeId]: []
        }));
      }
    } catch (error) {
      console.error('加载问题模板失败:', error);
      // 创建新的空问题数组
      setQuestionTemplates(prev => ({
        ...prev,
        [customerTypeId]: []
      }));
    }
  };

  // 保存问题模板（简化版）
  const saveQuestionTemplate = async (customerTypeId) => {
    const questions = questionTemplates[customerTypeId];
    if (!questions) return;

    // 获取packageName和customerTypeName
    const packageName = template?.packageName || packages.find(p => p._id === selectedPackage)?.name || '';
    const customerType = template?.customerTypes?.find(ct => ct.typeId === customerTypeId);
    const customerTypeName = customerType?.typeName || '';

    try {
      await axios.post(`${API_BASE_URL}/api/question-templates`, {
        packageId: selectedPackage,
        packageName: packageName,
        customerTypeId: customerTypeId,
        customerTypeName: customerTypeName,
        questions: questions
      });
      showMessage('问题配置保存成功', 'success');
    } catch (error) {
      console.error('保存问题配置失败:', error);
      showMessage('保存问题配置失败：' + (error.response?.data?.message || error.message), 'error');
    }
  };

  // 简化的问题管理函数
  const addQuestion = (customerTypeId) => {
    const newQuestion = {
      questionId: `q_${Date.now()}`,
      questionText: '',
      required: false,
      helpText: '',
      order: questionTemplates[customerTypeId]?.length || 0
    };
    setQuestionTemplates(prev => ({
      ...prev,
      [customerTypeId]: [...(prev[customerTypeId] || []), newQuestion]
    }));
  };

  const deleteQuestion = (customerTypeId, questionIndex) => {
    if (!window.confirm('确定要删除这个问题吗？')) return;
    setQuestionTemplates(prev => ({
      ...prev,
      [customerTypeId]: prev[customerTypeId].filter((_, idx) => idx !== questionIndex)
    }));
  };

  const updateQuestion = (customerTypeId, questionIndex, field, value) => {
    setQuestionTemplates(prev => {
      const newQuestions = [...prev[customerTypeId]];
      newQuestions[questionIndex][field] = value;
      return {
        ...prev,
        [customerTypeId]: newQuestions
      };
    });
  };

  const moveQuestion = (customerTypeId, questionIndex, direction) => {
    const targetIndex = direction === 'up' ? questionIndex - 1 : questionIndex + 1;
    const questions = questionTemplates[customerTypeId];
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    setQuestionTemplates(prev => {
      const newQuestions = [...prev[customerTypeId]];
      [newQuestions[questionIndex], newQuestions[targetIndex]] = 
        [newQuestions[targetIndex], newQuestions[questionIndex]];
      newQuestions.forEach((q, idx) => q.order = idx);
      return {
        ...prev,
        [customerTypeId]: newQuestions
      };
    });
  };

  const saveTemplate = async () => {
    if (!template) return;
    
    setLoading(true);
    try {
      // 保存材料模板
      await axios.post(
        `${API_BASE_URL}/api/material-templates`,
        template,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // 保存所有客户类型的问题模板
      for (const customerType of template.customerTypes) {
        if (questionTemplates[customerType.typeId]) {
          await saveQuestionTemplate(customerType.typeId);
        }
      }
      
      showMessage('保存成功', 'success');
      loadTemplate(); // 重新加载
    } catch (error) {
      console.error('保存失败:', error);
      showMessage(error.response?.data?.message || '保存失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  // 添加客户类型
  const handleAddCustomerType = () => {
    setCurrentCustomerType({
      typeId: '',
      typeName: '',
      description: '',
      order: template?.customerTypes?.length || 0,
      materials: []
    });
    setEditingCustomerTypeIndex(null);
    setShowCustomerTypeModal(true);
  };

  // 编辑客户类型
  const handleEditCustomerType = (index) => {
    setCurrentCustomerType({ ...template.customerTypes[index] });
    setEditingCustomerTypeIndex(index);
    setShowCustomerTypeModal(true);
  };

  // 保存客户类型
  const handleSaveCustomerType = () => {
    if (!currentCustomerType.typeId || !currentCustomerType.typeName) {
      showMessage('请填写客户类型ID和名称', 'error');
      return;
    }

    const updatedTemplate = { ...template };
    
    if (editingCustomerTypeIndex !== null) {
      // 编辑模式
      updatedTemplate.customerTypes[editingCustomerTypeIndex] = currentCustomerType;
    } else {
      // 新增模式 - 检查ID是否重复
      const exists = updatedTemplate.customerTypes.some(ct => ct.typeId === currentCustomerType.typeId);
      if (exists) {
        showMessage('该客户类型ID已存在', 'error');
        return;
      }
      updatedTemplate.customerTypes.push(currentCustomerType);
      
      // 为新客户类型初始化空的问题数组
      setQuestionTemplates(prev => ({
        ...prev,
        [currentCustomerType.typeId]: []
      }));
    }
    
    setTemplate(updatedTemplate);
    setShowCustomerTypeModal(false);
    setCurrentCustomerType(null);
    setEditingCustomerTypeIndex(null);
  };

  // 删除客户类型
  const handleDeleteCustomerType = (index) => {
    if (!window.confirm('确定删除该客户类型及其所有材料项和问题吗？')) return;
    
    const customerTypeId = template.customerTypes[index].typeId;
    const updatedTemplate = { ...template };
    updatedTemplate.customerTypes.splice(index, 1);
    setTemplate(updatedTemplate);
    
    // 同时删除该客户类型的问题模板
    setQuestionTemplates(prev => {
      const newTemplates = { ...prev };
      delete newTemplates[customerTypeId];
      return newTemplates;
    });
  };

  // 客户类型排序
  const handleMoveCustomerType = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= template.customerTypes.length) return;
    
    const updatedTemplate = { ...template };
    const temp = updatedTemplate.customerTypes[index];
    updatedTemplate.customerTypes[index] = updatedTemplate.customerTypes[newIndex];
    updatedTemplate.customerTypes[newIndex] = temp;
    
    // 更新order
    updatedTemplate.customerTypes[index].order = index;
    updatedTemplate.customerTypes[newIndex].order = newIndex;
    
    setTemplate(updatedTemplate);
  };

  // 添加材料项
  const handleAddMaterial = (customerTypeIndex) => {
    const customerType = template.customerTypes[customerTypeIndex];
    setCurrentMaterial({
      materialId: '',
      name: '',
      required: false,
      needsImage: false,
      allowMultiple: false,
      materialType: 'personal',
      description: '',
      order: customerType.materials?.length || 0
    });
    setEditingCustomerTypeIndex(customerTypeIndex);
    setEditingMaterialIndex(null);
    setShowMaterialModal(true);
  };

  // 编辑材料项
  const handleEditMaterial = (customerTypeIndex, materialIndex) => {
    const material = template.customerTypes[customerTypeIndex].materials[materialIndex];
    setCurrentMaterial({ ...material });
    setEditingCustomerTypeIndex(customerTypeIndex);
    setEditingMaterialIndex(materialIndex);
    setShowMaterialModal(true);
  };

  // 保存材料项
  const handleSaveMaterial = () => {
    if (!currentMaterial.materialId || !currentMaterial.name) {
      showMessage('请填写材料ID和名称', 'error');
      return;
    }

    const updatedTemplate = { ...template };
    const customerType = updatedTemplate.customerTypes[editingCustomerTypeIndex];
    
    if (editingMaterialIndex !== null) {
      // 编辑模式
      customerType.materials[editingMaterialIndex] = currentMaterial;
    } else {
      // 新增模式 - 检查ID是否重复
      const exists = customerType.materials.some(m => m.materialId === currentMaterial.materialId);
      if (exists) {
        showMessage('该材料ID已存在', 'error');
        return;
      }
      customerType.materials.push(currentMaterial);
    }
    
    setTemplate(updatedTemplate);
    setShowMaterialModal(false);
    setCurrentMaterial(null);
    setEditingCustomerTypeIndex(null);
    setEditingMaterialIndex(null);
  };

  // 删除材料项
  const handleDeleteMaterial = (customerTypeIndex, materialIndex) => {
    if (!window.confirm('确定删除该材料项吗？')) return;
    
    const updatedTemplate = { ...template };
    updatedTemplate.customerTypes[customerTypeIndex].materials.splice(materialIndex, 1);
    setTemplate(updatedTemplate);
  };

  // 材料项排序
  const handleMoveMaterial = (customerTypeIndex, materialIndex, direction) => {
    const newIndex = direction === 'up' ? materialIndex - 1 : materialIndex + 1;
    const materials = template.customerTypes[customerTypeIndex].materials;
    if (newIndex < 0 || newIndex >= materials.length) return;
    
    const updatedTemplate = { ...template };
    const temp = updatedTemplate.customerTypes[customerTypeIndex].materials[materialIndex];
    updatedTemplate.customerTypes[customerTypeIndex].materials[materialIndex] = 
      updatedTemplate.customerTypes[customerTypeIndex].materials[newIndex];
    updatedTemplate.customerTypes[customerTypeIndex].materials[newIndex] = temp;
    
    // 更新order
    updatedTemplate.customerTypes[customerTypeIndex].materials[materialIndex].order = materialIndex;
    updatedTemplate.customerTypes[customerTypeIndex].materials[newIndex].order = newIndex;
    
    setTemplate(updatedTemplate);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 标题 */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
          材料与问题模板管理
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          为不同签证类型配置客户类型、所需材料清单和问题表单
        </p>
      </div>

      {/* 消息提示 */}
      {message && (
        <div 
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            borderRadius: '8px',
            backgroundColor: messageType === 'success' ? '#d1fae5' : '#fee2e2',
            color: messageType === 'success' ? '#065f46' : '#991b1b',
            fontSize: '14px'
          }}
        >
          {message}
        </div>
      )}

      {/* 选择签证类型 */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontSize: '14px', 
          fontWeight: '500',
          color: '#374151'
        }}>
          选择签证类型
        </label>
        <select
          value={selectedPackage}
          onChange={(e) => setSelectedPackage(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none'
          }}
        >
          <option value="">-- 请选择签证类型 --</option>
          {packages.map(pkg => (
            <option key={pkg._id} value={pkg._id}>{pkg.name}</option>
          ))}
        </select>
      </div>

      {/* 模板内容 */}
      {template && (
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* 客户类型列表 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                客户类型列表
              </h3>
              <button
                onClick={handleAddCustomerType}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                + 添加客户类型
              </button>
            </div>

            {template.customerTypes.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                暂无客户类型，请点击"添加客户类型"开始配置
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {template.customerTypes.map((customerType, ctIndex) => (
                  <div 
                    key={ctIndex}
                    style={{
                      border: expandedCustomerType === ctIndex ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease',
                      boxShadow: expandedCustomerType === ctIndex ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    {/* 按钮式标题 - 点击展开/收起 */}
                    <div 
                      onClick={() => setExpandedCustomerType(expandedCustomerType === ctIndex ? null : ctIndex)}
                      style={{ 
                        padding: '16px',
                        cursor: 'pointer',
                        backgroundColor: expandedCustomerType === ctIndex ? '#eff6ff' : '#f9fafb',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = expandedCustomerType === ctIndex ? '#eff6ff' : '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = expandedCustomerType === ctIndex ? '#eff6ff' : '#f9fafb'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                            {customerType.typeName}
                          </h4>
                          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                            📋 {customerType.materials.length} 个材料 | ❓ {questionTemplates[customerType.typeId]?.length || 0} 个问题
                          </p>
                        </div>
                        <div style={{ fontSize: '18px', color: expandedCustomerType === ctIndex ? '#3b82f6' : '#9ca3af', transition: 'transform 0.2s ease', transform: expandedCustomerType === ctIndex ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* 展开的内容区域 */}
                    {expandedCustomerType === ctIndex && (
                      <div style={{ borderTop: '1px solid #e5e7eb' }}>
                        {/* 操作按钮区 */}
                        <div style={{ padding: '12px 16px', backgroundColor: '#f9fafb', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMoveCustomerType(ctIndex, 'up'); }}
                            disabled={ctIndex === 0}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              backgroundColor: 'white',
                              cursor: ctIndex === 0 ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              opacity: ctIndex === 0 ? 0.5 : 1
                            }}
                          >
                            ↑ 上移
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMoveCustomerType(ctIndex, 'down'); }}
                            disabled={ctIndex === template.customerTypes.length - 1}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              backgroundColor: 'white',
                              cursor: ctIndex === template.customerTypes.length - 1 ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              opacity: ctIndex === template.customerTypes.length - 1 ? 0.5 : 1
                            }}
                          >
                            ↓ 下移
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditCustomerType(ctIndex); }}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #3b82f6',
                              borderRadius: '4px',
                              backgroundColor: 'white',
                              color: '#3b82f6',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            编辑信息
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCustomerType(ctIndex); }}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #dc2626',
                              borderRadius: '4px',
                              backgroundColor: 'white',
                              color: '#dc2626',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            删除类型
                          </button>
                        </div>

                        {/* 标签页 */}
                        <div style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
                          <div style={{ display: 'flex', padding: '0 16px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab({ ...activeTab, [ctIndex]: 'materials' });
                              }}
                              style={{
                                padding: '12px 20px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: (activeTab[ctIndex] || 'materials') === 'materials' ? '#3b82f6' : '#6b7280',
                                fontWeight: (activeTab[ctIndex] || 'materials') === 'materials' ? '600' : '400',
                                fontSize: '14px',
                                cursor: 'pointer',
                                borderBottom: (activeTab[ctIndex] || 'materials') === 'materials' ? '2px solid #3b82f6' : '2px solid transparent',
                                transition: 'all 0.2s'
                              }}
                            >
                              📋 材料清单
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab({ ...activeTab, [ctIndex]: 'questions' });
                              }}
                              style={{
                                padding: '12px 20px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: activeTab[ctIndex] === 'questions' ? '#3b82f6' : '#6b7280',
                                fontWeight: activeTab[ctIndex] === 'questions' ? '600' : '400',
                                fontSize: '14px',
                                cursor: 'pointer',
                                borderBottom: activeTab[ctIndex] === 'questions' ? '2px solid #3b82f6' : '2px solid transparent',
                                transition: 'all 0.2s'
                              }}
                            >
                              ❓ 问题配置
                            </button>
                          </div>
                        </div>

                        {/* 材料清单标签页内容 */}
                        {(activeTab[ctIndex] || 'materials') === 'materials' && (
                          <div style={{
                            padding: '16px',
                            backgroundColor: 'white'
                          }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#374151',
                              marginBottom: '12px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span>材料清单</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAddMaterial(ctIndex); }}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                + 添加材料
                              </button>
                            </div>

                          {customerType.materials.length === 0 ? (
                        <div style={{
                          padding: '20px',
                          textAlign: 'center',
                          color: '#9ca3af',
                          fontSize: '13px'
                        }}>
                          暂无材料项
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {customerType.materials.map((material, mIndex) => (
                            <div
                              key={mIndex}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '4px',
                                backgroundColor: '#f9fafb',
                                fontSize: '13px'
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: '500', color: '#1f2937' }}>
                                  {material.name}
                                </span>
                                <span style={{ marginLeft: '8px', color: '#6b7280' }}>
                                  {material.required && <span style={{ 
                                    padding: '2px 6px', 
                                    backgroundColor: '#fecaca', 
                                    color: '#991b1b',
                                    borderRadius: '3px',
                                    fontSize: '11px',
                                    marginRight: '4px'
                                  }}>必填</span>}
                                  {material.materialType === 'shared' ? (
                                    <span style={{ 
                                      padding: '2px 6px', 
                                      backgroundColor: '#d1fae5', 
                                      color: '#065f46',
                                      borderRadius: '3px',
                                      fontSize: '11px',
                                      marginRight: '4px'
                                    }}>共同材料</span>
                                  ) : (
                                    <span style={{ 
                                      padding: '2px 6px', 
                                      backgroundColor: '#e0f2fe', 
                                      color: '#075985',
                                      borderRadius: '3px',
                                      fontSize: '11px',
                                      marginRight: '4px'
                                    }}>个人材料</span>
                                  )}
                                  {material.needsImage && <span style={{ 
                                    padding: '2px 6px', 
                                    backgroundColor: '#dbeafe', 
                                    color: '#1e40af',
                                    borderRadius: '3px',
                                    fontSize: '11px',
                                    marginRight: '4px'
                                  }}>需照片</span>}
                                  {material.allowMultiple && <span style={{ 
                                    padding: '2px 6px', 
                                    backgroundColor: '#e0e7ff', 
                                    color: '#4338ca',
                                    borderRadius: '3px',
                                    fontSize: '11px'
                                  }}>多张</span>}
                                </span>
                                {material.description && (
                                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                    {material.description}
                                  </div>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleMoveMaterial(ctIndex, mIndex, 'up'); }}
                                  disabled={mIndex === 0}
                                  style={{
                                    padding: '2px 6px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '3px',
                                    backgroundColor: 'white',
                                    cursor: mIndex === 0 ? 'not-allowed' : 'pointer',
                                    fontSize: '11px',
                                    opacity: mIndex === 0 ? 0.5 : 1
                                  }}
                                >
                                  ↑
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleMoveMaterial(ctIndex, mIndex, 'down'); }}
                                  disabled={mIndex === customerType.materials.length - 1}
                                  style={{
                                    padding: '2px 6px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '3px',
                                    backgroundColor: 'white',
                                    cursor: mIndex === customerType.materials.length - 1 ? 'not-allowed' : 'pointer',
                                    fontSize: '11px',
                                    opacity: mIndex === customerType.materials.length - 1 ? 0.5 : 1
                                  }}
                                >
                                  ↓
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEditMaterial(ctIndex, mIndex); }}
                                  style={{
                                    padding: '2px 8px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '3px',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }}
                                >
                                  编辑
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteMaterial(ctIndex, mIndex); }}
                                  style={{
                                    padding: '2px 8px',
                                    border: '1px solid #fca5a5',
                                    borderRadius: '3px',
                                    backgroundColor: 'white',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }}
                                >
                                  删除
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                          </div>
                        )}

                        {/* 问题配置标签页内容（简化版） */}
                        {activeTab[ctIndex] === 'questions' && questionTemplates[customerType.typeId] !== undefined && (
                          <div style={{
                            padding: '16px',
                            backgroundColor: 'white'
                          }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#374151',
                              marginBottom: '16px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span>问题配置</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); addQuestion(customerType.typeId); }}
                                style={{
                                  padding: '8px 16px',
                                  backgroundColor: '#8b5cf6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  fontWeight: '500',
                                  boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#7c3aed';
                                  e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = '#8b5cf6';
                                  e.target.style.transform = 'translateY(0)';
                                }}
                              >
                                + 添加问题
                              </button>
                            </div>

                            {/* 问题列表（简化版） */}
                            {questionTemplates[customerType.typeId].length === 0 ? (
                              <div style={{
                                padding: '40px',
                                textAlign: 'center',
                                color: '#9ca3af',
                                fontSize: '14px',
                                backgroundColor: '#f9fafb',
                                borderRadius: '8px',
                                border: '2px dashed #e5e7eb'
                              }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>❓</div>
                                <div style={{ marginBottom: '8px', fontWeight: '500', color: '#6b7280' }}>暂无问题</div>
                                <div style={{ fontSize: '13px' }}>点击上方"添加问题"按钮开始配置</div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                 {questionTemplates[customerType.typeId].map((question, qIndex) => (
                                    <div
                                      key={question.questionId}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        backgroundColor: '#f9fafb',
                                        fontSize: '13px'
                                      }}
                                    >
                                      {/* 序号 */}
                                      <div style={{
                                        minWidth: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#8b5cf6',
                                        color: 'white',
                                        borderRadius: '4px',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        flexShrink: 0
                                      }}>
                                        {qIndex + 1}
                                      </div>

                                      {/* 问题文本 */}
                                      <input
                                        type="text"
                                        placeholder="问题文本"
                                        value={question.questionText}
                                        onChange={(e) => updateQuestion(customerType.typeId, qIndex, 'questionText', e.target.value)}
                                        style={{
                                          flex: 1,
                                          minWidth: '200px',
                                          padding: '6px 10px',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '4px',
                                          fontSize: '13px',
                                          outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                      />

                                      {/* 必填 */}
                                      <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '4px 8px',
                                        border: '1px solid' + (question.required ? ' #8b5cf6' : ' #d1d5db'),
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        backgroundColor: question.required ? '#f5f3ff' : 'white',
                                        whiteSpace: 'nowrap',
                                        fontSize: '12px'
                                      }}>
                                        <input
                                          type="checkbox"
                                          checked={question.required}
                                          onChange={(e) => updateQuestion(customerType.typeId, qIndex, 'required', e.target.checked)}
                                          style={{ cursor: 'pointer' }}
                                        />
                                        必填
                                      </label>

                                      {/* 帮助文本 */}
                                      <input
                                        type="text"
                                        placeholder="帮助文本(可选)"
                                        value={question.helpText || ''}
                                        onChange={(e) => updateQuestion(customerType.typeId, qIndex, 'helpText', e.target.value)}
                                        style={{
                                          width: '150px',
                                          padding: '6px 10px',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '4px',
                                          fontSize: '13px',
                                          outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                      />

                                      {/* 操作按钮 */}
                                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                        <button
                                          onClick={() => moveQuestion(customerType.typeId, qIndex, 'up')}
                                          disabled={qIndex === 0}
                                          title="上移"
                                          style={{
                                            padding: '4px 8px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '4px',
                                            backgroundColor: 'white',
                                            cursor: qIndex === 0 ? 'not-allowed' : 'pointer',
                                            fontSize: '12px',
                                            opacity: qIndex === 0 ? 0.5 : 1
                                          }}
                                        >
                                          ↑
                                        </button>
                                        <button
                                          onClick={() => moveQuestion(customerType.typeId, qIndex, 'down')}
                                          disabled={qIndex === questionTemplates[customerType.typeId].length - 1}
                                          title="下移"
                                          style={{
                                            padding: '4px 8px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '4px',
                                            backgroundColor: 'white',
                                            cursor: qIndex === questionTemplates[customerType.typeId].length - 1 ? 'not-allowed' : 'pointer',
                                            fontSize: '12px',
                                            opacity: qIndex === questionTemplates[customerType.typeId].length - 1 ? 0.5 : 1
                                          }}
                                        >
                                          ↓
                                        </button>
                                        <button
                                          onClick={() => deleteQuestion(customerType.typeId, qIndex)}
                                          title="删除"
                                          style={{
                                            padding: '4px 8px',
                                            border: '1px solid #fca5a5',
                                            borderRadius: '4px',
                                            backgroundColor: 'white',
                                            color: '#dc2626',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                          }}
                                        >
                                          ×
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 保存按钮 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              onClick={saveTemplate}
              disabled={loading}
              style={{
                padding: '10px 24px',
                backgroundColor: loading ? '#9ca3af' : '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '保存中...' : '保存模板'}
            </button>
          </div>
        </div>
      )}

      {/* 客户类型编辑模态框 */}
      {showCustomerTypeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
              {editingCustomerTypeIndex !== null ? '编辑客户类型' : '添加客户类型'}
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                类型ID <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={currentCustomerType?.typeId || ''}
                onChange={(e) => setCurrentCustomerType({ ...currentCustomerType, typeId: e.target.value })}
                placeholder="如：student"
                disabled={editingCustomerTypeIndex !== null}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <small style={{ color: '#6b7280', fontSize: '12px' }}>
                英文ID，创建后不可修改
              </small>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                类型名称 <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={currentCustomerType?.typeName || ''}
                onChange={(e) => setCurrentCustomerType({ ...currentCustomerType, typeName: e.target.value })}
                placeholder="如：学生类"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                说明
              </label>
              <textarea
                value={currentCustomerType?.description || ''}
                onChange={(e) => setCurrentCustomerType({ ...currentCustomerType, description: e.target.value })}
                placeholder="如：在读学生"
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCustomerTypeModal(false);
                  setCurrentCustomerType(null);
                  setEditingCustomerTypeIndex(null);
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                取消
              </button>
              <button
                onClick={handleSaveCustomerType}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 材料项编辑模态框 */}
      {showMaterialModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
              {editingMaterialIndex !== null ? '编辑材料项' : '添加材料项'}
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                材料ID <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={currentMaterial?.materialId || ''}
                onChange={(e) => setCurrentMaterial({ ...currentMaterial, materialId: e.target.value })}
                placeholder="如：passport"
                disabled={editingMaterialIndex !== null}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <small style={{ color: '#6b7280', fontSize: '12px' }}>
                英文ID，创建后不可修改
              </small>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                材料名称 <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={currentMaterial?.name || ''}
                onChange={(e) => setCurrentMaterial({ ...currentMaterial, name: e.target.value })}
                placeholder="如：护照复印件"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                说明
              </label>
              <textarea
                value={currentMaterial?.description || ''}
                onChange={(e) => setCurrentMaterial({ ...currentMaterial, description: e.target.value })}
                placeholder="如：护照个人信息页，需清晰完整"
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                材料配置选项
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={currentMaterial?.required || false}
                    onChange={(e) => setCurrentMaterial({ ...currentMaterial, required: e.target.checked })}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontWeight: '500' }}>必填项</span>
                  <small style={{ marginLeft: '8px', color: '#6b7280' }}>(客户必须上传此材料)</small>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={currentMaterial?.needsImage || false}
                    onChange={(e) => setCurrentMaterial({ ...currentMaterial, needsImage: e.target.checked })}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontWeight: '500' }}>需要照片</span>
                  <small style={{ marginLeft: '8px', color: '#6b7280' }}>(限制只能上传图片格式)</small>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={currentMaterial?.allowMultiple || false}
                    onChange={(e) => setCurrentMaterial({ ...currentMaterial, allowMultiple: e.target.checked })}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontWeight: '500' }}>允许多张</span>
                  <small style={{ marginLeft: '8px', color: '#6b7280' }}>(可上传多个文件)</small>
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                材料类型
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="radio"
                    name="materialType"
                    value="personal"
                    checked={(currentMaterial?.materialType || 'personal') === 'personal'}
                    onChange={(e) => setCurrentMaterial({ ...currentMaterial, materialType: e.target.value })}
                    style={{ marginRight: '6px' }}
                  />
                  <span>个人材料</span>
                  <small style={{ marginLeft: '6px', color: '#6b7280' }}>(每人一份)</small>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="radio"
                    name="materialType"
                    value="shared"
                    checked={currentMaterial?.materialType === 'shared'}
                    onChange={(e) => setCurrentMaterial({ ...currentMaterial, materialType: e.target.value })}
                    style={{ marginRight: '6px' }}
                  />
                  <span>共同材料</span>
                  <small style={{ marginLeft: '6px', color: '#6b7280' }}>(多人共用)</small>
                </label>
              </div>
              <small style={{ color: '#6b7280', fontSize: '12px', display: 'block', marginTop: '6px' }}>
                个人材料：护照、照片等每人需各自上传<br/>
                共同材料：行程单等多人共用一份即可
              </small>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowMaterialModal(false);
                  setCurrentMaterial(null);
                  setEditingMaterialIndex(null);
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                取消
              </button>
              <button
                onClick={handleSaveMaterial}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaterialTemplateManager; 
