// ... existing code ...
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { buildApiUrl, buildImageUrl } from './config';
import EmailManager from './components/EmailManager';
import AdminNotesManager from './components/AdminNotesManager';
import BillingManager from './components/BillingManager';

function ApplicationDetail({ id, onBack }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    feedback: '',
    networkType: '',
    package: '',
    visaType: '',        // 签证类型：单次、一年多次等
    visaPrice: 0,        // 价格
    visaCurrency: 'CNY', // 币种
    name: '',
    phone: '',
    address: '',
    wechat: '',
    line: '',
    email: '',
    companions: []
  });
  
  // 获取当前登录用户信息
  const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const [previewImage, setPreviewImage] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showModificationDialog, setShowModificationDialog] = useState(false);
  const [modificationAction, setModificationAction] = useState('');
  const [modificationReason, setModificationReason] = useState('');
  const [reviewData, setReviewData] = useState({
    reviewResult: 'approved',
    feedback: ''
  });
  const [packages, setPackages] = useState([]);
  const [modalPosition, setModalPosition] = useState({ left: '50%' });
  const [modalCenterY, setModalCenterY] = useState(0);
  const mainContentRef = useRef(null);
  const [activePersonIndex, setActivePersonIndex] = useState(0); // 当前选中的人员索引（0=主申请人�?  
  // 问题答案编辑相关
  const [isEditingQuestions, setIsEditingQuestions] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState([]);
  
  // 材料上传相关
  const [uploadingMaterial, setUploadingMaterial] = useState(null);
  const [materialFiles, setMaterialFiles] = useState({});
  
  // 客户类型（办理类型）选择相关
  const [customerTypes, setCustomerTypes] = useState([]);
  const [selectedCustomerType, setSelectedCustomerType] = useState('');
  const [showChangeCustomerTypeModal, setShowChangeCustomerTypeModal] = useState(false);

  // 提升 fetchApplication 到组件作用域
  const fetchApplication = useCallback(async () => {
    try {
      const response = await axios.get(buildApiUrl(`/api/applications/${id}`));
      setApplication({ ...response.data, id: response.data._id });
    } catch (err) {
      setError('获取订单详情失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  // 获取套餐列表
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(buildApiUrl('/api/packages'));
        setPackages(response.data);
      } catch (err) {
        console.error('获取套餐列表失败:', err);
      }
    };
    fetchPackages();
  }, []);
  
  // 获取客户类型列表（办理类型）
  useEffect(() => {
    const fetchCustomerTypes = async () => {
      if (!application || !application.package) return;
      
      try {
        // 根据签证类型名称找到对应的package ID
        const pkg = packages.find(p => p.name === application.package);
        if (!pkg) return;
        
        // 获取该签证类型的材料模板，其中包含客户类型列�?        const response = await axios.get(buildApiUrl(`/api/material-templates/package/${pkg._id}`));
        if (response.data && response.data.customerTypes) {
          setCustomerTypes(response.data.customerTypes);
        }
      } catch (err) {
        console.error('获取客户类型列表失败:', err);
      }
    };
    
    if (packages.length > 0) {
      fetchCustomerTypes();
    }
  }, [application, packages]);

  // 监听滚动事件，实时更新弹窗位�?  useEffect(() => {
    const handleScroll = () => {
      if (previewImage && previewImage.centerY !== undefined) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight;
        
        const modalHeight = 440;
        
        const centerY = scrollTop + viewportHeight / 2 - modalHeight / 2;
        
        setPreviewImage(prev => ({
          ...prev,
          centerY
        }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [previewImage]);

  // 监听ESC键关闭更换办理类型模态框
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && showChangeCustomerTypeModal) {
        console.log('🔑 按下ESC键，关闭更换办理类型模态框');
        setShowChangeCustomerTypeModal(false);
        setSelectedCustomerType('');
      }
    };

    if (showChangeCustomerTypeModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showChangeCustomerTypeModal]);

  // 动态计算主内容区中心点
  useEffect(() => {
    function updateModalPosition() {
      if (mainContentRef.current) {
        const rect = mainContentRef.current.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        // 主内容区中心点相对于整个页面
        const left = rect.left + scrollX + rect.width / 2;
        setModalPosition({ left });
      } else {
        setModalPosition({ left: '50%' });
      }
    }
    updateModalPosition();
    window.addEventListener('resize', updateModalPosition);
    window.addEventListener('scroll', updateModalPosition);
    return () => {
      window.removeEventListener('resize', updateModalPosition);
      window.removeEventListener('scroll', updateModalPosition);
    };
  }, []);

  // 动态计算主内容区中心点Y
  useEffect(() => {
    function updateModalCenterY() {
      if (mainContentRef.current) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight;
        const modalHeight = 320; // 估算弹窗高度
        const centerY = scrollTop + viewportHeight / 2 - modalHeight / 2;
        setModalCenterY(centerY);
      } else {
        setModalCenterY(window.innerHeight / 2 - 160);
      }
    }
    updateModalCenterY();
    window.addEventListener('resize', updateModalCenterY);
    window.addEventListener('scroll', updateModalCenterY);
    return () => {
      window.removeEventListener('resize', updateModalCenterY);
      window.removeEventListener('scroll', updateModalCenterY);
    };
  }, []);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">加载�?..</span>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-secondary" onClick={onBack}>返回</button>
      </div>
    );
  }
  if (!application) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">未找到订单信�?/div>
        <button className="btn btn-secondary" onClick={onBack}>返回</button>
      </div>
    );
  }

  // 编辑相关
  const handleEdit = () => {
    setEditData({
      status: application.status,
      feedback: application.feedback || '',
      networkType: application.networkType || '',
      package: application.package || '',
      visaType: application.visaType || '',        // 签证类型
      visaPrice: application.visaPrice || 0,       // 价格
      visaCurrency: application.visaCurrency || 'CNY', // 币种
      name: application.name || '',
      phone: application.phone || '',
      address: application.address || '',
      wechat: application.wechat || '',
      line: application.line || '',
      email: application.email || '',
      companions: application.companions ? [...application.companions] : []
    });
    setIsEditing(true);
  };
  const handleSave = async () => {
    try {
      // 检查签证类型是否改�?      const packageChanged = editData.package !== application.package;
      
      if (packageChanged && application.customerType) {
        // 如果签证类型改变且已有办理类型，需要确�?        const confirmMsg = `⚠️ 注意：您正在更改签证类型\n\n` +
          `原签证类型：${application.package}\n` +
          `新签证类型：${editData.package}\n\n` +
          `更改签证类型后，系统将：\n` +
          `�?清空当前的办理类型（${application.customerType.typeName}）\n` +
          `�?清空已配置的材料清单\n` +
          `�?清空已配置的问题答案\n\n` +
          `您需要重新为客户选择办理类型。\n\n` +
          `确认要更改吗？`;
        
        if (!window.confirm(confirmMsg)) {
          return;
        }
      }
      
      const response = await axios.put(buildApiUrl(`/api/applications/${application.id}`),
        { 
          status: editData.status, 
          feedback: editData.feedback,
          networkType: editData.networkType,
          package: editData.package,
          packageChanged: packageChanged, // 告知后端签证类型是否改变
          visaType: editData.visaType,      // 签证类型
          visaPrice: editData.visaPrice,    // 价格
          visaCurrency: editData.visaCurrency, // 币种
          name: editData.name,
          phone: editData.phone,
          address: editData.address,
          wechat: editData.wechat,
          line: editData.line,
          email: editData.email,
          companions: editData.companions
        });
      // 保留原有数据，只更新后端返回的字�?      setApplication({ ...application, ...response.data, id: response.data._id });
      setIsEditing(false);
      
      if (packageChanged) {
        alert('签证类型已更换！\n\n请为客户重新选择办理类型，系统将自动关联新的材料清单和问题模板�?);
      } else {
        alert('保存成功�?);
      }
    } catch (err) {
      alert('保存失败�? + (err.response?.data?.message || '网络错误'));
    }
  };
  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      status: application.status,
      feedback: application.feedback || '',
      networkType: application.networkType || '',
      package: application.package || '',
      visaType: application.visaType || '',
      visaPrice: application.visaPrice || 0,
      visaCurrency: application.visaCurrency || 'CNY',
      name: application.name || '',
      phone: application.phone || '',
      address: application.address || '',
      wechat: application.wechat || '',
      line: application.line || '',
      email: application.email || '',
      companions: application.companions ? [...application.companions] : []
    });
  };
  
  // 更新办理类型
  const handleCustomerTypeChange = async (typeId, isChanging = false) => {
    if (!typeId) return;
    
    const selectedType = customerTypes.find(t => t.typeId === typeId);
    if (!selectedType) return;
    
    // 根据是新选择还是更换，显示不同的确认消息
    let confirmMsg;
    if (isChanging) {
      // 检查是否有原办理类�?      if (!application.customerType || !application.customerType.typeName) {
        alert('错误：当前没有办理类型，请直接选择而不是更换�?);
        return;
      }
      
      confirmMsg = `⚠️ 注意：您正在更换办理类型\n\n` +
        `原办理类型：${application.customerType.typeName}\n` +
        `新办理类型：${selectedType.typeName}\n\n` +
        `更换办理类型后，系统将：\n` +
        `�?�?保留相同材料的图片（如护照、照片等通用材料）\n` +
        `�?�?删除仅属于原办理类型的材料\n` +
        `�?�?添加新办理类型特有的材料\n` +
        `�?�?清空所有问题答案\n\n` +
        `注：只有两种办理类型都需要的材料，其图片才会保留！\n\n` +
        `确认要更换吗？`;
    } else {
      confirmMsg = `确认为客户选择办理类型"${selectedType.typeName}"吗？\n\n选择后将自动关联相应的材料清单和问题模板。`;
    }
    
    if (!window.confirm(confirmMsg)) {
      return;
    }
    
    try {
      const customerType = {
        typeId: selectedType.typeId,
        typeName: selectedType.typeName
      };
      
      console.log('🔄 正在更新办理类型:', {
        原办理类�? application.customerType?.typeName || '�?,
        新办理类�? selectedType.typeName,
        是否为更�? isChanging
      });
      
      const response = await axios.put(buildApiUrl(`/api/applications/${application.id}`), {
        customerType,
        customerTypeChanged: isChanging // 告知后端是否为更�?      });
      
      console.log('�?办理类型更新成功:', response.data);
      
      // 保留原有数据，只更新后端返回的字�?      setApplication({ ...application, ...response.data, id: response.data._id });
      setSelectedCustomerType('');
      
      // 关闭模态框
      setShowChangeCustomerTypeModal(false);
      
      if (isChanging) {
        alert('办理类型已更换！\n\n�?相同材料的图片已保留\n�?原问题答案已清空\n�?新的材料清单和问题模板已自动关联');
      } else {
        alert('办理类型已更新！材料清单和问题模板已自动关联�?);
      }
      
      // 刷新页面以加载新的材料清单和问题模板
      await fetchApplication();
    } catch (err) {
      console.error('�?更新办理类型失败:', err);
      console.error('错误详情:', err.response?.data || err.message);
      alert('更新失败�? + (err.response?.data?.message || err.message || '网络错误'));
    }
  };

  // 图片点击放大
  const handlePreview = (imgPath) => {
    // 构建完整的图片URL
    const fullImgUrl = buildImageUrl(imgPath);
    
    // 获取当前滚动位置
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    
    // 弹窗尺寸
    const modalWidth = 640; // 600px + 40px padding
    const modalHeight = 440; // 400px + 40px padding
    
    // 计算垂直位置：基于当前滚动位�?    const centerY = scrollTop + viewportHeight / 2 - modalHeight / 2;
    
    setPreviewImage({ 
      img: fullImgUrl, 
      centerY
    });
  };
  
  const handleClosePreview = () => setPreviewImage(null);



  // 材料审核相关
  const handleReview = () => {
    setReviewData({
      reviewResult: 'approved',
      feedback: ''
    });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async () => {
    try {
      const response = await axios.put(buildApiUrl(`/api/applications/${application.id}/review`), reviewData);
      // 保留原有数据，只更新后端返回的字�?      setApplication({ ...application, ...response.data, id: response.data._id });
      setShowReviewModal(false);
      alert('审核完成�?);
    } catch (err) {
      alert('审核失败�? + (err.response?.data?.message || '网络错误'));
    }
  };

  const handleReviewCancel = () => {
    setShowReviewModal(false);
  };

  // 发送材料提醒邮�?  const sendMaterialReminderEmail = async () => {
    if (!application?.customerType) {
      alert('�?请先选择办理类型');
      return;
    }

    if (!window.confirm('确认发送材料提醒邮件给客户吗？')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        buildApiUrl(`/api/applications/${application.id}/send-material-reminder`),
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        alert('�?材料提醒邮件发送成功，客户可通过邮件链接直接提交材料');
      } else {
        alert(`�?邮件发送失�? ${response.data.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('发送材料提醒邮件失�?', error);
      alert(`�?邮件发送失�? ${error.response?.data?.message || error.message || '网络错误'}`);
    }
  };

  // 处理修改申请
  const handleReviewModification = async (action) => {
    setModificationAction(action);
    setModificationReason('');
    setShowModificationDialog(true);
  };

  const handleModificationSubmit = async () => {
    try {
      const reason = modificationAction === 'approve' ? '同意修改申请' : '拒绝修改申请';
      await axios.post(buildApiUrl(`/api/applications/${application.id}/review-modification`), {
        action: modificationAction,
        adminReason: modificationReason || '�?,
        // 新增: 拒绝时将状态设为待确认
        ...(modificationAction === 'reject' ? { setStatusToPending: true } : {})
      });
      alert(`${reason}成功`);
      setShowModificationDialog(false);
      fetchApplication(); // 只刷新当前订单详情，不跳转首�?    } catch (err) {
      alert('操作失败�? + (err.response?.data?.message || err.message));
    }
  };

  const handleModificationCancel = () => {
    setShowModificationDialog(false);
    setModificationReason('');
  };

  // 处理取消申请
  const handleReviewCancellation = async (action) => {
    try {
      const reason = action === 'approve' ? '同意取消申请' : '拒绝取消申请';
      await axios.post(buildApiUrl(`/api/applications/${application.id}/review-cancellation`), {
        action: action,
        adminReason: prompt(`请输�?{reason}的原因：`) || '�?
      });
      alert(`${reason}成功`);
      window.location.reload();
    } catch (err) {
      alert('操作失败�? + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10" ref={mainContentRef} style={{ position: 'relative' }}>
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                订单详情
                {application?.settled && (
                  <span className="badge bg-success ms-3" style={{ fontSize: '0.75rem' }}>
                    <i className="fas fa-check-circle me-1"></i>已结�?                  </span>
                )}
              </h4>
              <div>
                {!isEditing ? (
                  <>
                    <button className="btn btn-info me-2" onClick={handleEdit}>编辑</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-primary me-2" onClick={handleSave}>保存</button>
                    <button className="btn btn-secondary me-2" onClick={handleCancel}>取消</button>
                  </>
                )}
                <button className="btn btn-secondary" onClick={onBack}>返回列表</button>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h5 className="border-bottom pb-2">
                    基本信息
                    {application.companions && application.companions.length > 0 && (
                      <span className="badge bg-info ms-2" style={{ fontSize: '0.8rem' }}>
                        <i className="fas fa-user-friends me-1"></i>
                        含{application.companions.length}位同行人
                      </span>
                    )}
                  </h5>
                  <table className="table table-borderless table-sm">
                    <tbody>
                      <tr><td><strong>申请编码�?/strong></td><td>{application.applyCode}</td></tr>
                      <tr>
                        <td><strong>姓名�?/strong></td>
                        <td>
                          {isEditing ? (
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              value={editData.name} 
                              onChange={e => setEditData({...editData, name: e.target.value})}
                            />
                          ) : (
                            application.name
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>手机号：</strong></td>
                        <td>
                          {isEditing ? (
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              value={editData.phone} 
                              onChange={e => setEditData({...editData, phone: e.target.value})}
                            />
                          ) : (
                            application.phone
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>地址�?/strong></td>
                        <td>
                          {isEditing ? (
                            <textarea 
                              className="form-control form-control-sm" 
                              rows="2"
                              value={editData.address} 
                              onChange={e => setEditData({...editData, address: e.target.value})}
                            />
                          ) : (
                            application.address
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>微信号：</strong></td>
                        <td>
                          {isEditing ? (
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              value={editData.wechat} 
                              onChange={e => setEditData({...editData, wechat: e.target.value})}
                            />
                          ) : (
                            application.wechat || '未填�?
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>LINE号：</strong></td>
                        <td>
                          {isEditing ? (
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              value={editData.line} 
                              onChange={e => setEditData({...editData, line: e.target.value})}
                            />
                          ) : (
                            application.line || '未填�?
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>邮箱�?/strong></td>
                        <td>
                          {isEditing ? (
                            <input 
                              type="email" 
                              className="form-control form-control-sm" 
                              value={editData.email} 
                              onChange={e => setEditData({...editData, email: e.target.value})}
                            />
                          ) : (
                            application.email || '未填�?
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h5 className="border-bottom pb-2">服务信息</h5>
                  <table className="table table-borderless table-sm">
                    <tbody>
                      <tr>
                        <td><strong>签证套餐�?/strong></td>
                        <td>
                          {isEditing ? (
                            <select className="form-select form-select-sm" value={editData.package} onChange={e => setEditData({...editData, package: e.target.value})}>
                              <option value="">请选择签证类型</option>
                              {packages.map(pkg => (
                                <option key={pkg._id} value={pkg.name}>{pkg.name}</option>
                              ))}
                            </select>
                          ) : (
                            application.package
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>办理类型�?/strong></td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {application.customerType ? (
                              <>
                                <span className="badge bg-success" style={{ fontSize: '0.85rem' }}>
                                  <i className="fas fa-check-circle me-1"></i>
                                  {application.customerType.typeName}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                    console.log('🔄 点击更换按钮，customerTypes 数量:', customerTypes.length);
                                    
                                    // 使用React状态控制模态框显示
                                    setSelectedCustomerType('');
                                    setShowChangeCustomerTypeModal(true);
                                  }}
                                >
                                  <i className="fas fa-exchange-alt me-1"></i>
                                  更换
                                </button>
                              </>
                            ) : (
                              <span className="badge bg-warning text-dark" style={{ fontSize: '0.85rem' }}>
                                <i className="fas fa-exclamation-triangle me-1"></i>
                                客户未选择
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>签证次数�?/strong></td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={editData.visaType || ''}
                              onChange={e => setEditData({...editData, visaType: e.target.value})}
                              placeholder="例如：单次、一年多�?
                            />
                          ) : (
                            application.visaType || '未填�?
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>办理价格�?/strong></td>
                        <td>
                          {isEditing ? (
                            <div className="d-flex gap-2">
                              <select
                                className="form-select form-select-sm"
                                style={{ width: '80px' }}
                                value={editData.visaCurrency || 'CNY'}
                                onChange={e => setEditData({...editData, visaCurrency: e.target.value})}
                              >
                                <option value="CNY">¥ CNY</option>
                                <option value="JPY">¥ JPY</option>
                                <option value="USD">$ USD</option>
                                <option value="EUR">�?EUR</option>
                              </select>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={editData.visaPrice || ''}
                                onChange={e => setEditData({...editData, visaPrice: parseFloat(e.target.value) || 0})}
                                placeholder="价格"
                                min="0"
                              />
                            </div>
                          ) : (
                            application.visaPrice ?
                            `${application.visaCurrency === 'CNY' ? '¥' :
                               application.visaCurrency === 'JPY' ? '¥' :
                               application.visaCurrency === 'USD' ? '$' : '�?} ${application.visaPrice} (${application.visaCurrency})`
                            : '未填�?
                          )}
                        </td>
                      </tr>
                      <tr><td><strong>状态：</strong></td>
                        <td>
                          {isEditing ? (
                            <select className="form-select form-select-sm w-auto d-inline" value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})}>
                              <option value="待处�?>待处�?/option>
                              <option value="待确�?>待确�?/option>
                              <option value="处理�?>处理�?/option>
                              <option value="已完�?>已完�?/option>
                              <option value="已取�?>已取�?/option>
                            </select>
                          ) : (
                            <span className={`badge ${
                              application.status === '待处�? ? 'bg-warning' :
                              application.status === '待确�? ? 'bg-info' :
                              application.status === '处理�? ? 'bg-primary' :
                              application.status === '已完�? ? 'bg-success' :
                              'bg-secondary'
                            }`}>
                              {application.status}
                            </span>
                          )}
                        </td>
                      </tr>
                      
                      {/* 同行人编�?*/}
                      {isEditing && (
                        <tr>
                          <td><strong>同行人：</strong></td>
                          <td>
                            <div>
                              {editData.companions && editData.companions.length > 0 ? (
                                <div>
                                  {editData.companions.map((name, index) => (
                                    <div key={index} className="input-group input-group-sm mb-2" style={{ maxWidth: '300px' }}>
                                      <span className="input-group-text" style={{ minWidth: '80px', fontSize: '0.85rem' }}>
                                        同行�?{index + 1}
                                      </span>
                                      <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => {
                                          const newCompanions = [...editData.companions];
                                          newCompanions[index] = e.target.value;
                                          setEditData({...editData, companions: newCompanions});
                                        }}
                                        className="form-control form-control-sm"
                                        placeholder="请输入姓�?
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newCompanions = editData.companions.filter((_, i) => i !== index);
                                          setEditData({...editData, companions: newCompanions});
                                        }}
                                        className="btn btn-sm btn-danger"
                                        style={{ fontSize: '1.1rem', fontWeight: 'bold', padding: '4px 10px' }}
                                        title="删除此同行人"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted" style={{ fontSize: '0.9rem' }}>暂无同行�?/span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const newCompanions = [...(editData.companions || []), ''];
                                  setEditData({...editData, companions: newCompanions});
                                }}
                                className="btn btn-sm btn-outline-primary mt-1"
                              >
                                <i className="fas fa-plus me-1"></i>添加同行�?                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                      
                      <tr><td><strong>申请时间�?/strong></td><td>{new Date(application.createdAt).toLocaleString()}</td></tr>
                      <tr><td><strong>更新时间�?/strong></td><td>{new Date(application.updatedAt).toLocaleString()}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 同行人标签页 */}
              {application.companions && application.companions.length > 0 && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                    <h5 className="mb-0">
                    <i className="fas fa-user-friends me-2"></i>
                    同行�?                  </h5>
                    {application.customerType && (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={sendMaterialReminderEmail}
                        style={{ 
                          fontSize: '0.9rem',
                          padding: '6px 12px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <i className="fas fa-envelope me-1"></i>
                        发送材料提醒邮�?                      </button>
                    )}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    flexWrap: 'wrap',
                    marginBottom: '20px'
                  }}>
                    {/* 主申请人标签 */}
                    <button
                      onClick={() => setActivePersonIndex(0)}
                      style={{
                        padding: '8px 16px',
                        border: activePersonIndex === 0 ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        background: activePersonIndex === 0 ? '#3b82f6' : '#ffffff',
                        color: activePersonIndex === 0 ? 'white' : '#374151',
                        fontWeight: activePersonIndex === 0 ? '600' : '500',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: activePersonIndex === 0 ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        if (activePersonIndex !== 0) {
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activePersonIndex !== 0) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <i className="fas fa-user-circle"></i>
                      {application.name}（主申请人）
                    </button>
                    
                    {/* 同行人标�?*/}
                    {application.companions.map((name, index) => (
                      <button
                        key={index}
                        onClick={() => setActivePersonIndex(index + 1)}
                        style={{
                          padding: '8px 16px',
                          border: activePersonIndex === index + 1 ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                          borderRadius: '8px',
                          background: activePersonIndex === index + 1 ? '#3b82f6' : '#ffffff',
                          color: activePersonIndex === index + 1 ? 'white' : '#374151',
                          fontWeight: activePersonIndex === index + 1 ? '600' : '500',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: activePersonIndex === index + 1 ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          if (activePersonIndex !== index + 1) {
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activePersonIndex !== index + 1) {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <i className="fas fa-user"></i>
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}


              {/* 申请材料 - 紧凑布局，一�?�?- 可上传编�?*/}
              {application.customerType && application.customerType.materials && application.customerType.materials.length > 0 && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                    <h5 className="mb-0" style={{ fontSize: '1.1rem' }}>
                      <i className="fas fa-file-alt me-2"></i>
                      申请材料
                      <span className="badge bg-light text-dark ms-2" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                        {application.customerType.typeName}
                      </span>
                      <span className="badge bg-primary ms-2" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                        {activePersonIndex === 0 ? application.name : application.companions[activePersonIndex - 1]}
                      </span>
                    </h5>
                  <div className="d-flex align-items-center">
                    <small className="text-muted me-2">
                      <i className="fas fa-info-circle me-1"></i>
                      点击材料卡片可上�?管理图片
                    </small>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={sendMaterialReminderEmail}
                      title="发送材料提交邮件给客户"
                    >
                      <i className="fas fa-paper-plane me-1"></i>
                      发送材料邮�?                    </button>
                  </div>
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '12px' 
                  }}>
                    {application.customerType.materials.map((materialTemplate, index) => {
                      // 查找该人员是否已上传此材料（支持新旧两种格式�?                      const currentPersonId = activePersonIndex === 0 ? 'main' : `comp${activePersonIndex - 1}`;
                      const oldPersonId = activePersonIndex === 0 ? 'main' : `companion_${activePersonIndex - 1}`;
                      
                      // 查找新格式的记录
                      const newFormatMaterial = (application.materials || []).find(m => 
                        m.materialId === materialTemplate.materialId && m.personId === currentPersonId
                      );
                      
                      // 查找旧格式的记录
                      const oldFormatMaterial = (application.materials || []).find(m => 
                        m.materialId === materialTemplate.materialId && m.personId === oldPersonId
                      );
                      
                      // 合并新旧格式的图片（去重�?                      let mergedImages = [];
                      if (newFormatMaterial?.images) {
                        mergedImages = [...newFormatMaterial.images];
                      }
                      if (oldFormatMaterial?.images && oldPersonId !== currentPersonId) {
                        // 添加旧格式的图片，但要去�?                        oldFormatMaterial.images.forEach(img => {
                          if (!mergedImages.includes(img)) {
                            mergedImages.push(img);
                          }
                        });
                      }
                      
                      // 优先使用新格式，如果不存在则使用旧格�?                      const uploadedMaterial = newFormatMaterial || oldFormatMaterial;
                      
                      // 合并模板和已上传的数�?                      const material = {
                        ...materialTemplate,
                        ...(uploadedMaterial || {}),
                        materialId: materialTemplate.materialId,
                        materialName: materialTemplate.name,
                        images: mergedImages.length > 0 ? mergedImages : []
                      };
                      
                      return (
                      <div key={index} style={{ 
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '10px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }} onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }} onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '6px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '22px',
                            height: '22px',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            borderRadius: '50%',
                            fontWeight: '700',
                            fontSize: '0.75rem',
                            flexShrink: 0
                          }}>
                            {index + 1}
                          </span>
                          <h6 className="mb-0" style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: '600', 
                            color: '#1f2937',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {material.materialName}
                          </h6>
                          <span className={`badge ${
                            material.status === '已提�? ? 'bg-success' :
                            material.status === '已审�? ? 'bg-info' :
                            material.status === '需补充' ? 'bg-warning' :
                            'bg-secondary'
                          }`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                            {material.status}
                          </span>
                        </div>
                        
                        {/* 材料属性标�?*/}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                          {material.templateRequired && (
                            <span style={{ 
                              padding: '2px 6px', 
                              backgroundColor: '#fee2e2', 
                              color: '#991b1b',
                              borderRadius: '3px',
                              fontSize: '0.65rem',
                              fontWeight: '500'
                            }}>必填</span>
                          )}
                          {material.materialType === 'shared' ? (
                            <span style={{ 
                              padding: '2px 6px', 
                              backgroundColor: '#d1fae5', 
                              color: '#065f46',
                              borderRadius: '3px',
                              fontSize: '0.65rem',
                              fontWeight: '500'
                            }}>共享材料</span>
                          ) : (
                            <span style={{ 
                              padding: '2px 6px', 
                              backgroundColor: '#dbeafe', 
                              color: '#1e40af',
                              borderRadius: '3px',
                              fontSize: '0.65rem',
                              fontWeight: '500'
                            }}>个人材料</span>
                          )}
                          {material.needsImage && (
                            <span style={{ 
                              padding: '2px 6px', 
                              backgroundColor: '#e0e7ff', 
                              color: '#4338ca',
                              borderRadius: '3px',
                              fontSize: '0.65rem',
                              fontWeight: '500'
                            }}>需照片</span>
                          )}
                          {material.allowMultiple && (
                            <span style={{ 
                              padding: '2px 6px', 
                              backgroundColor: '#fef3c7', 
                              color: '#92400e',
                              borderRadius: '3px',
                              fontSize: '0.65rem',
                              fontWeight: '500'
                            }}>允许多张</span>
                          )}
                        </div>
                        
                        {/* 图片展示 - 一行显�?*/}
                        {material.images && material.images.length > 0 ? (
                          <div style={{ marginBottom: '6px' }}>
                            <div style={{ 
                              display: 'flex',
                              gap: '4px',
                              overflowX: 'auto',
                              padding: '4px 0',
                              scrollBehavior: 'smooth'
                            }} className="custom-scrollbar">
                              {material.images.map((imgUrl, imgIndex) => (
                                <div 
                                  key={imgIndex}
                                  style={{
                                    width: '70px',
                                    height: '70px',
                                    border: '1.5px solid #e5e7eb',
                                    borderRadius: '6px',
                                    overflow: 'visible',
                                    position: 'relative',
                                    flexShrink: 0,
                                    transition: 'border-color 0.2s, transform 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#3b82f6';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    const overlay = e.currentTarget.querySelector('.preview-overlay');
                                    if (overlay) overlay.style.opacity = '1';
                                    const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                                    if (deleteBtn) {
                                      deleteBtn.style.opacity = '1';
                                      deleteBtn.style.visibility = 'visible';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                    e.currentTarget.style.transform = 'scale(1)';
                                    const overlay = e.currentTarget.querySelector('.preview-overlay');
                                    if (overlay) overlay.style.opacity = '0';
                                    const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                                    if (deleteBtn) {
                                      deleteBtn.style.opacity = '0';
                                      deleteBtn.style.visibility = 'hidden';
                                    }
                                  }}
                                >
                                  {/* 图片内容容器 */}
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                    position: 'relative'
                                  }}>
                                    <img 
                                      src={buildImageUrl(imgUrl)} 
                                      alt={`${material.materialName} ${imgIndex + 1}`}
                                      onClick={() => setPreviewImage({ img: buildImageUrl(imgUrl), centerY: window.pageYOffset + window.innerHeight / 2 - 220 })}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        cursor: 'pointer',
                                        display: 'block'
                                      }}
                                    />
                                  </div>
                                  {/* 删除按钮 - 悬停时显�?*/}
                                  <button
                                    className="delete-btn"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (!window.confirm('确定删除这张图片吗？')) return;
                                      
                                      try {
                                        // 计算当前选中的人员ID
                                        const currentPersonId = activePersonIndex === 0 ? 'main' : `comp${activePersonIndex - 1}`;
                                        
                                        console.log('🗑�?删除图片:', {
                                          materialId: material.materialId,
                                          personId: currentPersonId,
                                          imageUrl: imgUrl
                                        });
                                        
                                        await axios.delete(buildApiUrl(`/api/applications/${id}/materials/image`), {
                                          data: { 
                                            materialId: material.materialId, 
                                            personId: currentPersonId,
                                            imageUrl: imgUrl 
                                          }
                                        });
                                        alert('图片删除成功�?);
                                        fetchApplication();
                                      } catch (err) {
                                        alert('删除失败�? + (err.response?.data?.message || err.message));
                                      }
                                    }}
                                    style={{
                                      position: 'absolute',
                                      top: '-5px',
                                      right: '-5px',
                                      background: 'rgba(239, 68, 68, 0.95)',
                                      color: 'white',
                                      border: '2px solid white',
                                      borderRadius: '50%',
                                      width: '24px',
                                      height: '24px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      fontSize: '16px',
                                      fontWeight: 'bold',
                                      padding: 0,
                                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                                      transition: 'all 0.2s',
                                      zIndex: 20,
                                      opacity: 0,
                                      visibility: 'hidden'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = 'rgba(220, 38, 38, 1)';
                                      e.currentTarget.style.transform = 'scale(1.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.95)';
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                  >
                                    ×
                                  </button>
                                  {/* 预览图标 - 悬停显示 */}
                                  <div 
                                    className="preview-overlay"
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      background: 'rgba(0,0,0,0.5)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'white',
                                      fontSize: '1.1rem',
                                      opacity: 0,
                                      transition: 'opacity 0.2s',
                                      pointerEvents: 'none'
                                    }}>
                                    <i className="fas fa-search-plus"></i>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted" style={{ 
                            padding: '8px',
                            background: '#f9fafb',
                            borderRadius: '4px',
                            textAlign: 'center',
                            fontSize: '0.75rem'
                          }}>
                            <i className="fas fa-image me-1"></i>
                            暂无图片
                          </div>
                        )}

                        {/* 备注信息 */}
                        {material.note && (
                          <div className="small text-muted" style={{ 
                            padding: '5px 8px',
                            background: '#fef3c7',
                            borderRadius: '4px',
                            marginBottom: '5px',
                            fontSize: '0.75rem'
                          }}>
                            <i className="fas fa-comment-dots me-1"></i>
                            {material.note}
                          </div>
                        )}

                        {/* 提交信息 */}
                        {material.submittedAt && (
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                            <i className="fas fa-clock me-1"></i>
                            {new Date(material.submittedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                        
                        {/* 管理员上传区�?*/}
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
                          <input
                            type="file"
                            id={`upload-${material.materialId || index}`}
                            accept="image/*,application/pdf"
                            multiple
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                              const files = Array.from(e.target.files);
                              if (files.length === 0) return;
                              
                              setUploadingMaterial(material.materialId || index);
                              
                              try {
                                // 计算当前选中的人员ID
                                const currentPersonId = activePersonIndex === 0 ? 'main' : `comp${activePersonIndex - 1}`;
                                const currentPersonName = activePersonIndex === 0 ? application.name : application.companions[activePersonIndex - 1];
                                
                                console.log('🔵 后台上传材料:', {
                                  activePersonIndex,
                                  currentPersonId,
                                  currentPersonName,
                                  materialId: material.materialId,
                                  materialName: material.materialName,
                                  filesCount: files.length
                                });
                                
                                const formData = new FormData();
                                formData.append('materialId', material.materialId);
                                formData.append('materialName', material.materialName);
                                formData.append('personId', currentPersonId);  // 添加人员ID
                                formData.append('personName', currentPersonName);  // 添加人员姓名
                                files.forEach(file => {
                                  formData.append('files', file);
                                });
                                
                                await axios.post(
                                  buildApiUrl(`/api/applications/${id}/materials/upload`),
                                  formData,
                                  {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                  }
                                );
                                
                                alert(`成功上传 ${files.length} 个文件！`);
                                fetchApplication(); // 刷新数据
                              } catch (err) {
                                alert('上传失败�? + (err.response?.data?.message || err.message));
                              } finally {
                                setUploadingMaterial(null);
                                e.target.value = ''; // 重置文件输入
                              }
                            }}
                          />
                          <button
                            className="btn btn-sm btn-outline-primary w-100"
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                            onClick={() => document.getElementById(`upload-${material.materialId || index}`).click()}
                            disabled={uploadingMaterial === (material.materialId || index)}
                          >
                            {uploadingMaterial === (material.materialId || index) ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" style={{ width: '12px', height: '12px' }}></span>
                                上传�?..
                              </>
                            ) : (
                              <>
                                <i className="fas fa-upload me-1"></i>
                                上传图片
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* 没有客户类型时显示提�?*/}
              {!application.customerType && (
                <div className="mt-3">
                  <div className="alert alert-warning" style={{ borderLeft: '4px solid #ffc107' }}>
                    <h6 className="alert-heading mb-2">
                      <i className="fas fa-info-circle me-2"></i>
                      客户未选择办理类型
                    </h6>
                    <p className="mb-2" style={{ fontSize: '0.9rem' }}>
                      客户在申请时没有选择具体的办理类型（如：学生签证、商务签证等），因此系统无法显示材料清单�?                    </p>
                    
                    {/* 办理类型选择 */}
                    {customerTypes.length > 0 && (
                      <>
                        <hr style={{ margin: '12px 0' }} />
                        <div className="mb-3">
                          <label className="form-label mb-2" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                            <i className="fas fa-hand-pointer me-2"></i>
                            快速选择办理类型�?                          </label>
                          <div className="d-flex gap-2">
                            <select 
                              className="form-select form-select-sm" 
                              value={selectedCustomerType}
                              onChange={(e) => setSelectedCustomerType(e.target.value)}
                              style={{ maxWidth: '300px' }}
                            >
                              <option value="">-- 请选择办理类型 --</option>
                              {customerTypes.map(type => (
                                <option key={type.typeId} value={type.typeId}>
                                  {type.typeName} {type.description ? `(${type.description})` : ''}
                                </option>
                              ))}
                            </select>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleCustomerTypeChange(selectedCustomerType)}
                              disabled={!selectedCustomerType}
                            >
                              <i className="fas fa-check me-1"></i>
                              确认选择
                            </button>
                          </div>
                          <small className="text-muted d-block mt-2">
                            <i className="fas fa-lightbulb me-1"></i>
                            选择后将自动关联该类型的材料清单和问题模�?                          </small>
                        </div>
                      </>
                    )}
                    
                    <hr style={{ margin: '10px 0' }} />
                    <p className="mb-0" style={{ fontSize: '0.85rem' }}>
                      <strong>其他操作�?/strong>
                    </p>
                    <ul style={{ fontSize: '0.85rem', marginBottom: '0', paddingLeft: '20px' }}>
                      <li>联系客户确认办理类型</li>
                      <li>手动记录客户需要提供的材料（使�?管理员备�?�?/li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 问题答案 - 可编辑版本（有客户类型时始终显示�?*/}
              {(application.customerType || (application.questionsAnswers && application.questionsAnswers.length > 0) || isEditingQuestions) && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                    <h5 className="mb-0" style={{ fontSize: '1.1rem' }}>
                      <i className="fas fa-question-circle me-2"></i>
                      问题答案
                      {!isEditingQuestions && application.questionsAnswers && application.questionsAnswers.filter(q => q.answer && q.answer.trim()).length === 0 && (
                        <small className="text-warning ms-2">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          客户未填写，请客服补�?                        </small>
                      )}
                      {!isEditingQuestions && application.questionsAnswers && application.questionsAnswers.filter(q => q.answer && q.answer.trim()).length > 0 && (
                        <small className="text-success ms-2">
                          <i className="fas fa-check-circle me-1"></i>
                          已填�?{application.questionsAnswers.filter(q => q.answer && q.answer.trim()).length}/{application.questionsAnswers.length} 个问�?                        </small>
                      )}
                    </h5>
                    {!isEditingQuestions ? (
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          setIsEditingQuestions(true);
                          setEditedQuestions(application.questionsAnswers || []);
                        }}
                      >
                        <i className="fas fa-edit me-1"></i>
                        {application.questionsAnswers && application.questionsAnswers.length > 0 ? '编辑' : '添加'}
                      </button>
                    ) : (
                      <div>
                        <button 
                          className="btn btn-sm btn-success me-2"
                          onClick={async () => {
                            try {
                              await axios.put(buildApiUrl(`/api/applications/${id}/questions`), {
                                questionsAnswers: editedQuestions
                              });
                              setIsEditingQuestions(false);
                              fetchApplication();
                              alert('问题答案保存成功�?);
                            } catch (err) {
                              alert('保存失败�? + (err.response?.data?.message || err.message));
                            }
                          }}
                        >
                          <i className="fas fa-save me-1"></i>
                          保存
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setIsEditingQuestions(false);
                            setEditedQuestions([]);
                          }}
                        >
                          取消
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {!isEditingQuestions ? (
                    /* 查看模式 */
                    (() => {
                      const questionsToShow = application.questionsAnswers || [];
                      return questionsToShow.length > 0 ? (
                        Object.entries(
                          questionsToShow.reduce((groups, qa) => {
                            const groupName = qa.groupName || '其他信息';
                            if (!groups[groupName]) groups[groupName] = [];
                            groups[groupName].push(qa);
                            return groups;
                          }, {})
                        ).map(([groupName, questions], groupIndex) => (
                        <div key={groupIndex} className="mb-2" style={{ 
                          background: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: '8px',
                            paddingBottom: '8px',
                            borderBottom: '1px solid #f3f4f6'
                          }}>
                            <h6 className="mb-0" style={{ 
                              fontSize: '0.95rem', 
                              fontWeight: '600',
                              color: '#1f2937'
                            }}>
                              <i className="fas fa-folder me-2 text-primary"></i>
                              {groupName}
                            </h6>
                          </div>
                          <div style={{ paddingLeft: '8px' }}>
                            {questions.map((qa, qaIndex) => (
                              <div key={qaIndex} style={{ marginBottom: '8px' }}>
                                <strong style={{ fontSize: '0.85rem', color: '#374151' }}>
                                  {qa.questionText}
                                  {qa.inheritedFrom && (
                                    <span className="badge bg-info ms-2" style={{ fontSize: '0.65rem' }}>
                                      <i className="fas fa-link me-1"></i>
                                      继承自主申请�?                                    </span>
                                  )}
                                </strong>
                                <div style={{ 
                                  padding: '6px 10px', 
                                  backgroundColor: qa.inheritedFrom ? '#fef3c7' : '#f9fafb', 
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  marginTop: '4px',
                                  border: `1px solid ${qa.inheritedFrom ? '#fbbf24' : '#e5e7eb'}`
                                }}>
                                  {qa.answer || <span className="text-muted fst-italic">未填�?/span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                      ) : (
                        <div className="alert alert-info">
                          <i className="fas fa-info-circle me-2"></i>
                          客户未填写详细信息，点击右上�?添加"按钮可补�?                        </div>
                      );
                    })()
                  ) : (
                    /* 编辑模式 */
                    <div>
                      <div className="alert alert-info mb-3">
                        <i className="fas fa-info-circle me-2"></i>
                        您可以编辑或补充客户的问题答案。新添加的问题可以编辑问题文本�?                      </div>
                      {editedQuestions.map((qa, index) => {
                        const isCustomQuestion = qa.questionId && qa.questionId.startsWith('custom_');
                        return (
                          <div key={index} className="mb-3 p-3 border rounded position-relative">
                            {isCustomQuestion ? (
                              // 自定义问题：可以编辑问题文本
                              <>
                                <label className="form-label fw-bold">问题</label>
                                <input
                                  type="text"
                                  className="form-control mb-2"
                                  value={qa.questionText || ''}
                                  onChange={(e) => {
                                    const updated = [...editedQuestions];
                                    updated[index].questionText = e.target.value;
                                    setEditedQuestions(updated);
                                  }}
                                  placeholder="请输入问�?
                                />
                                <label className="form-label fw-bold">答案</label>
                                <textarea
                                  className="form-control"
                                  rows="2"
                                  value={qa.answer || ''}
                                  onChange={(e) => {
                                    const updated = [...editedQuestions];
                                    updated[index].answer = e.target.value;
                                    setEditedQuestions(updated);
                                  }}
                                  placeholder="请输入答�?
                                />
                                <button
                                  className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                                  onClick={() => {
                                    if (window.confirm('确定要删除这个问题吗�?)) {
                                      const updated = editedQuestions.filter((_, i) => i !== index);
                                      setEditedQuestions(updated);
                                    }
                                  }}
                                  title="删除此问�?
                                >
                                  ×
                                </button>
                              </>
                            ) : (
                              // 原有问题：问题文本不可编辑，但可以删�?                              <>
                                <label className="form-label fw-bold">{qa.questionText}</label>
                                <textarea
                                  className="form-control"
                                  rows="2"
                                  value={qa.answer || ''}
                                  onChange={(e) => {
                                    const updated = [...editedQuestions];
                                    updated[index].answer = e.target.value;
                                    setEditedQuestions(updated);
                                  }}
                                  placeholder="请输入答�?
                                />
                                <button
                                  className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                                  onClick={() => {
                                    if (window.confirm('确定要删除这个问题吗�?)) {
                                      const updated = editedQuestions.filter((_, i) => i !== index);
                                      setEditedQuestions(updated);
                                    }
                                  }}
                                  title="删除此问�?
                                >
                                  ×
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          setEditedQuestions([
                            ...editedQuestions,
                            {
                              questionId: `custom_${Date.now()}`,
                              questionText: '',
                              answer: ''
                            }
                          ]);
                        }}
                      >
                        <i className="fas fa-plus me-1"></i>
                        添加新问�?                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* 没有客户类型且没有问题答案时显示提示 */}
              {!application.customerType && (!application.questionsAnswers || application.questionsAnswers.length === 0) && !isEditingQuestions && (
                <div className="mt-3">
                  <div className="alert alert-info" style={{ borderLeft: '4px solid #17a2b8' }}>
                    <h6 className="alert-heading mb-2">
                      <i className="fas fa-info-circle me-2"></i>
                      没有问题信息
                    </h6>
                    <p className="mb-2" style={{ fontSize: '0.9rem' }}>
                      客户在申请时没有选择办理类型，也没有填写任何问题信息�?                    </p>
                    <p className="mb-0" style={{ fontSize: '0.85rem' }}>
                      <strong>说明�?/strong>问题模板只在客户选择了办理类型时才会自动加载。您可以联系客户了解详细情况并手动记录在"管理员备�?中�?                    </p>
                  </div>
                </div>
              )}

              {/* 账单明细 */}
              <BillingManager 
                applicationId={id} 
                currentUser={currentUser} 
                settled={application?.settled}
                onSettleChange={fetchApplication}
              />

              {/* 管理员备�?*/}
              <AdminNotesManager applicationId={id} />

              {/* 管理员反�?*/}
              <div className="mt-4">
                <h5 className="border-bottom pb-2">管理员反�?/h5>
                <p className="text-muted small mb-2">
                  管理员反馈会发送给客户，用于告知客户处理结果、需要补充的材料或其他重要信息�?                </p>
                {isEditing ? (
                  <textarea className="form-control" rows="3" placeholder="请输入管理员反馈" value={editData.feedback} onChange={e => setEditData({...editData, feedback: e.target.value})} />
                ) : (
                  <div className="alert alert-info mb-0">{application.feedback || '暂无反馈'}</div>
                )}
              </div>

              {/* 邮件管理 */}
              <div className="mt-4">
                <EmailManager 
                  applicationId={id} 
                  application={application}
                  onEmailSent={(emailData) => {
                    console.log('邮件发送成�?', emailData);
                    // 可以在这里添加成功提示或其他逻辑
                  }}
                />
              </div>

              {/* 用户确认信息 */}
              {application.confirmTime && (
                <div className="mt-4">
                  <h5 className="border-bottom pb-2">用户确认信息</h5>
                  <div className="row">
                    <div className="col-md-6"><p><strong>确认时间�?/strong>{new Date(application.confirmTime).toLocaleString()}</p></div>
                    {application.japaneseName && <div className="col-md-6"><p><strong>日语读音�?/strong>{application.japaneseName}</p></div>}
                  </div>
                  {(application.idCardFront || application.idCardBack || application.passportPhoto || application.other) && (
                    <div className="row mt-3">
                      <div className="col-12">
                        <p><strong>上传的证件照片：</strong></p>
                        <div className="row g-2">
                          {application.idCardFront && (
                            <div className="col-md-3">
                              <p className="mb-1"><strong>在留卡正面：</strong></p>
                              <img src={buildImageUrl(application.idCardFront)} alt="在留卡正�? className="img-thumbnail pointer" style={{ maxHeight: '120px', cursor: 'pointer' }} onClick={() => handlePreview(application.idCardFront)} />
                            </div>
                          )}
                          {application.idCardBack && (
                            <div className="col-md-3">
                              <p className="mb-1"><strong>在留卡反面：</strong></p>
                              <img src={buildImageUrl(application.idCardBack)} alt="在留卡反�? className="img-thumbnail pointer" style={{ maxHeight: '120px', cursor: 'pointer' }} onClick={() => handlePreview(application.idCardBack)} />
                            </div>
                          )}
                          {application.passportPhoto && (
                            <div className="col-md-3">
                              <p className="mb-1"><strong>护照照片页：</strong></p>
                              <img src={buildImageUrl(application.passportPhoto)} alt="护照照片�? className="img-thumbnail pointer" style={{ maxHeight: '120px', cursor: 'pointer' }} onClick={() => handlePreview(application.passportPhoto)} />
                            </div>
                          )}
                          {application.other && (
                            <div className="col-md-3">
                              <p className="mb-1"><strong>其他�?/strong></p>
                              <img src={buildImageUrl(application.other)} alt="其他" className="img-thumbnail pointer" style={{ maxHeight: '120px', cursor: 'pointer' }} onClick={() => handlePreview(application.other)} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 补充材料信息 */}
              {(application.additionalMaterials || application.contactPreference || application.notes) && (
                <div className="mt-4">
                  <h5 className="border-bottom pb-2">补充材料信息</h5>
                  <div className="row">
                    {application.contactPreference && (
                      <div className="col-md-6">
                        <p><strong>联系方式偏好�?/strong>{application.contactPreference}</p>
                      </div>
                    )}
                    {application.additionalMaterials && (
                      <div className="col-12">
                        <p><strong>补充材料说明�?/strong></p>
                        <div className="alert alert-light mb-0">{application.additionalMaterials}</div>
                      </div>
                    )}
                    {application.notes && (
                      <div className="col-12">
                        <p><strong>备注�?/strong></p>
                        <div className="alert alert-light mb-0">{application.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 过程记录 */}
              {application.processLog && application.processLog.length > 0 && (
                <div className="mt-4">
                  <h5 className="border-bottom pb-2">
                    处理过程记录
                    <span className="badge bg-secondary ms-2" style={{ fontSize: '0.75rem' }}>
                      {application.processLog.length} 条记�?                    </span>
                  </h5>
                  <div 
                    className="timeline" 
                    style={{ 
                      maxHeight: '500px', 
                      overflowY: 'auto',
                      paddingRight: '10px',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      padding: '15px',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    {application.processLog
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map((log, index) => (
                      <div key={index} className="row mb-2">
                        <div className="col-md-3">
                          <small className="text-muted">{new Date(log.timestamp).toLocaleString()}</small>
                        </div>
                        <div className="col-md-9">
                          <div className="alert alert-light mb-0" style={{ backgroundColor: '#fff' }}>
                            <strong>{log.action}</strong><br />
                            {log.description}
                            {/* 显示过程记录图片缩略�?*/}
                            {log.images && Object.keys(log.images).length > 0 && (
                              <div className="mt-2 d-flex flex-wrap gap-2">
                                {Object.entries(log.images).map(([key, img]) => (
                                  <img key={key} src={buildImageUrl(img)} alt={key} className="img-thumbnail pointer" style={{ maxHeight: '60px', cursor: 'pointer' }} onClick={() => handlePreview(img)} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 待审核的修改申请 */}
              {application.pendingModification && (
                <div className="mt-4">
                  <h5 className="border-bottom pb-2 text-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    待审核的修改申请
                  </h5>
                  <div className="alert alert-warning">
                    <p><strong>修改原因�?/strong>{application.pendingModification.modificationReason}</p>
                    <p><strong>申请时间�?/strong>{new Date(application.pendingModification.timestamp).toLocaleString()}</p>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>日语读音�?/strong>{application.pendingModification.japaneseName}</p>
                    </div>
                  </div>
                  
                  {(application.pendingModification.idCardFront || application.pendingModification.idCardBack || application.pendingModification.passportPhoto || application.pendingModification.other) && (
                    <div className="row mt-3">
                      <div className="col-12">
                        <p><strong>申请的新材料�?/strong></p>
                        <div className="row g-2">
                          {application.pendingModification.idCardFront && (
                            <div className="col-md-3">
                              <p className="mb-1"><strong>在留卡正面：</strong></p>
                              <img src={buildImageUrl(application.pendingModification.idCardFront)} alt="在留卡正�? className="img-thumbnail pointer" style={{ maxHeight: '120px', cursor: 'pointer' }} onClick={() => handlePreview(application.pendingModification.idCardFront)} />
                            </div>
                          )}
                          {application.pendingModification.idCardBack && (
                            <div className="col-md-3">
                              <p className="mb-1"><strong>在留卡反面：</strong></p>
                              <img src={buildImageUrl(application.pendingModification.idCardBack)} alt="在留卡反�? className="img-thumbnail pointer" style={{ maxHeight: '120px', cursor: 'pointer' }} onClick={() => handlePreview(application.pendingModification.idCardBack)} />
                            </div>
                          )}
                          {application.pendingModification.passportPhoto && (
                            <div className="col-md-3">
                              <p className="mb-1"><strong>护照照片页：</strong></p>
                              <img src={buildImageUrl(application.pendingModification.passportPhoto)} alt="护照照片�? className="img-thumbnail pointer" style={{ maxHeight: '120px', cursor: 'pointer' }} onClick={() => handlePreview(application.pendingModification.passportPhoto)} />
                            </div>
                          )}
                          {application.pendingModification.other && (
                            <div className="col-md-3">
                              <p className="mb-1"><strong>其他�?/strong></p>
                              <img src={buildImageUrl(application.pendingModification.other)} alt="其他" className="img-thumbnail pointer" style={{ maxHeight: '120px', cursor: 'pointer' }} onClick={() => handlePreview(application.pendingModification.other)} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {application.pendingModification.notes && (
                    <div className="mt-3">
                      <p><strong>备注�?/strong></p>
                      <div className="alert alert-light mb-0">{application.pendingModification.notes}</div>
                    </div>
                  )}
                </div>
              )}

              {/* 修改申请操作按钮 */}
              {application.pendingModification && (
                <div className="mt-4">
                  <h5 className="border-bottom pb-2">修改申请审核</h5>
                  <div className="d-flex gap-2">
                    <button className="btn btn-warning" onClick={() => handleReviewModification('approve')}>
                      同意修改
                    </button>
                    <button className="btn btn-danger" onClick={() => handleReviewModification('reject')}>
                      拒绝修改
                    </button>
                  </div>
                </div>
              )}

              {/* 材料历史记录 */}
              {application.materialHistory && application.materialHistory.length > 0 && (
                <div className="mt-4">
                  <h5 className="border-bottom pb-2">材料历史记录</h5>
                  {application.materialHistory.map((history, index) => (
                    <div key={index} className="card mb-3">
                      <div className="card-header">
                        <small className="text-muted">历史版本 {index + 1} - {new Date(history.timestamp).toLocaleString()}</small>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <p><strong>日语读音�?/strong>{history.japaneseName}</p>
                          </div>
                        </div>
                        {(history.idCardFront || history.idCardBack || history.passportPhoto || history.other) && (
                          <div className="row mt-2">
                            <div className="col-12">
                              <p><strong>材料�?/strong></p>
                              <div className="row g-2">
                                {history.idCardFront && (
                                  <div className="col-md-3">
                                    <small className="text-muted">在留卡正�?/small>
                                    <img src={buildImageUrl(history.idCardFront)} alt="在留卡正�? className="img-thumbnail pointer" style={{ maxHeight: '80px', cursor: 'pointer' }} onClick={() => handlePreview(history.idCardFront)} />
                                  </div>
                                )}
                                {history.idCardBack && (
                                  <div className="col-md-3">
                                    <small className="text-muted">在留卡反�?/small>
                                    <img src={buildImageUrl(history.idCardBack)} alt="在留卡反�? className="img-thumbnail pointer" style={{ maxHeight: '80px', cursor: 'pointer' }} onClick={() => handlePreview(history.idCardBack)} />
                                  </div>
                                )}
                                {history.passportPhoto && (
                                  <div className="col-md-3">
                                    <small className="text-muted">护照照片</small>
                                    <img src={buildImageUrl(history.passportPhoto)} alt="护照照片" className="img-thumbnail pointer" style={{ maxHeight: '80px', cursor: 'pointer' }} onClick={() => handlePreview(history.passportPhoto)} />
                                  </div>
                                )}
                                {history.other && (
                                  <div className="col-md-3">
                                    <small className="text-muted">其他</small>
                                    <img src={buildImageUrl(history.other)} alt="其他" className="img-thumbnail pointer" style={{ maxHeight: '80px', cursor: 'pointer' }} onClick={() => handlePreview(history.other)} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        {history.notes && (
                          <div className="mt-2">
                            <p><strong>备注�?/strong>{history.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 对话流消息区 */}
              {application.messages && application.messages.length > 0 && (
                <div className="mt-4">
                  <h5 className="border-bottom pb-2">沟通记�?/h5>
                  <div>
                    {application.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map((msg, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'admin' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                        <div style={{
                          maxWidth: '70%',
                          background: msg.role === 'admin' ? 'linear-gradient(90deg,#ffb86c,#ff9a44)' : 'linear-gradient(90deg,#e0eaff,#b2d8ff)',
                          color: '#333',
                          borderRadius: msg.role === 'admin' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                          padding: '10px 16px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          alignSelf: msg.role === 'admin' ? 'flex-end' : 'flex-start'
                        }}>
                          <div style={{ fontSize: 13, color: '#888', marginBottom: 2, textAlign: msg.role === 'admin' ? 'right' : 'left' }}>
                            {msg.role === 'admin' ? '管理�? : '客户'}
                            <span style={{ marginLeft: 8, fontSize: 11 }}>{new Date(msg.timestamp).toLocaleString()}</span>
                          </div>
                          <div style={{ whiteSpace: 'pre-line', wordBreak: 'break-all' }}>{msg.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 操作按钮区域 - 已移除材料审核和编辑申请按钮 */}
              {application.processLog && application.processLog.some(log => log.action === '申请取消订单') && (
                <div className="mt-4">
                  <h5 className="border-bottom pb-2">操作</h5>
                  <div className="d-flex gap-2 flex-wrap">
                    <button className="btn btn-warning" onClick={() => handleReviewCancellation('approve')}>
                      同意取消
                    </button>
                    <button className="btn btn-danger" onClick={() => handleReviewCancellation('reject')}>
                      拒绝取消
                    </button>
                  </div>
                </div>
              )}

              {/* 修改申请对话�?*/}
              {showModificationDialog && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}>
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: modalCenterY,
                    transform: 'translateX(-50%)',
                    zIndex: 2100,
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                    width: '400px',
                    maxWidth: '90vw',
                    padding: '24px'
                  }}>
                    <div className="modal-header" style={{ borderBottom: '1px solid #eee' }}>
                      <h5 className="modal-title">
                        {modificationAction === 'approve' ? '同意修改申请' : '拒绝修改申请'}
                      </h5>
                      <button type="button" className="btn-close" onClick={handleModificationCancel}></button>
                    </div>
                    <div className="modal-body">
                      {modificationAction === 'approve' ? (
                        <div className="mb-3 text-center">
                          <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
                          <div>确定同意本次材料修改申请吗？</div>
                        </div>
                      ) : (
                        <div className="mb-3">
                          <label className="form-label">拒绝理由（必填）�?/label>
                          <textarea 
                            className="form-control" 
                            rows="3"
                            value={modificationReason}
                            onChange={(e) => setModificationReason(e.target.value)}
                            placeholder="请输入拒绝理�?.."
                          ></textarea>
                        </div>
                      )}
                    </div>
                    <div className="modal-footer" style={{ borderTop: '1px solid #eee' }}>
                      <button type="button" className="btn btn-secondary" onClick={handleModificationCancel}>
                        取消
                      </button>
                      <button 
                        type="button" 
                        className={modificationAction === 'approve' ? 'btn btn-primary' : 'btn btn-danger'} 
                        onClick={() => {
                          if (modificationAction === 'approve') {
                            handleModificationSubmit();
                          } else {
                            if (!modificationReason.trim()) {
                              alert('请填写拒绝理由！');
                              return;
                            }
                            handleModificationSubmit();
                          }
                        }}
                      >
                        确认
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 图片预览弹窗 - 基于滚动位置居中 */}
              {previewImage && (
                <div 
                  style={{
                    position: 'absolute',
                    top: `${previewImage.centerY}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 9999,
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                  }}
                  onClick={handleClosePreview}
                >
                  <div 
                    style={{
                      background: 'white',
                      borderRadius: '8px',
                      padding: '0',
                      width: '600px',
                      height: '400px',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative'
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    {/* 关闭按钮 */}
                    <button 
                      onClick={handleClosePreview}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        color: 'white',
                        fontSize: '16px',
                        cursor: 'pointer',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                    
                    {/* 标题 */}
                    <div style={{
                      padding: '15px 20px',
                      borderBottom: '1px solid #eee',
                      textAlign: 'center'
                    }}>
                      <h5 style={{ margin: 0, color: '#333' }}>图片预览</h5>
                    </div>
                    
                    {/* 图片容器 */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px',
                      overflow: 'hidden'
                    }}>
                      <img 
                        src={previewImage.img} 
                        alt="预览" 
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          borderRadius: '4px'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      
                      {/* 图片加载失败时的提示 */}
                      <div style={{
                        display: 'none',
                        padding: '40px',
                        color: '#666',
                        fontSize: '16px',
                        textAlign: 'center'
                      }}>
                        <i className="fas fa-image" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                        <br />
                        图片加载失败
                      </div>
                    </div>
                    
                    {/* 底部操作�?*/}
                    <div style={{
                      padding: '15px 20px',
                      borderTop: '1px solid #eee',
                      textAlign: 'center'
                    }}>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => window.open(previewImage.img, '_blank')}
                      >
                        <i className="fas fa-external-link-alt me-1"></i>
                        在新窗口打开
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 材料审核模态框 */}
              {showReviewModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">材料审核</h5>
                        <button type="button" className="btn-close" onClick={handleReviewCancel}></button>
                      </div>
                      <div className="modal-body">
                        <div className="mb-3">
                          <label className="form-label">审核结果�?/label>
                          <select 
                            className="form-select" 
                            value={reviewData.reviewResult} 
                            onChange={e => setReviewData({...reviewData, reviewResult: e.target.value})}
                          >
                            <option value="approved">审核通过</option>
                            <option value="rejected">审核不通过</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">审核反馈�?/label>
                          <textarea 
                            className="form-control" 
                            rows="3" 
                            placeholder="请输入审核反馈信�?
                            value={reviewData.feedback} 
                            onChange={e => setReviewData({...reviewData, feedback: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleReviewCancel}>取消</button>
                        <button type="button" className="btn btn-primary" onClick={handleReviewSubmit}>提交审核</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 更换办理类型模态框（React 状态控制） */}
      {showChangeCustomerTypeModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            backdropFilter: 'blur(2px)'
          }}
          onClick={() => {
            console.log('🖱�?点击遮罩层，关闭模态框');
            setShowChangeCustomerTypeModal(false);
            setSelectedCustomerType('');
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              animation: 'modalFadeIn 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 模态框头部 */}
            <div 
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px 24px',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <h5 style={{ 
                margin: 0, 
                color: 'white', 
                fontSize: '1.25rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center'
              }}>
                <i className="fas fa-exchange-alt" style={{ marginRight: '12px', fontSize: '1.1rem' }}></i>
                更换办理类型
              </h5>
              <button 
                type="button" 
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  lineHeight: '1'
                }}
                onClick={() => {
                  console.log('�?点击关闭按钮');
                  setShowChangeCustomerTypeModal(false);
                  setSelectedCustomerType('');
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            {/* 模态框主体 */}
            <div style={{
              padding: '24px',
              maxHeight: 'calc(90vh - 160px)',
              overflowY: 'auto'
            }}>
              {customerTypes.length === 0 ? (
                <div style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  padding: '16px',
                  color: '#856404'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <i className="fas fa-exclamation-triangle" style={{ 
                      fontSize: '1.5rem', 
                      marginRight: '12px',
                      marginTop: '2px',
                      color: '#ffc107'
                    }}></i>
                    <div>
                      <strong style={{ fontSize: '1.05rem', display: 'block', marginBottom: '8px' }}>
                        暂无可选的办理类型
                      </strong>
                      <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
                        当前签证类型"<strong>{application?.package}</strong>"还没有配置客户类型�?br/>
                        请联系管理员在后�?材料与问题管�?中配置客户类型（如：个人申请、家庭申请等）�?                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{
                    backgroundColor: '#e7f3ff',
                    border: '1px solid #b3d9ff',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <i className="fas fa-info-circle" style={{ 
                        fontSize: '1.3rem', 
                        marginRight: '12px',
                        marginTop: '2px',
                        color: '#0066cc'
                      }}></i>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '8px', color: '#0066cc' }}>
                          智能合并�?                        </strong>
                        <ul style={{ 
                          margin: 0, 
                          paddingLeft: '20px', 
                          fontSize: '0.95rem',
                          lineHeight: '1.8',
                          color: '#004085'
                        }}>
                          <li>�?相同材料的图片将被保留（如护照、照片等�?/li>
                          <li>�?原办理类型特有的材料将被删除</li>
                          <li>�?所有问题答案将被清�?/li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      fontWeight: '600', 
                      fontSize: '0.95rem',
                      color: '#495057',
                      marginBottom: '10px',
                      display: 'block'
                    }}>
                      当前办理类型�?                    </label>
                    <div>
                      <span style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        fontSize: '0.9rem',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        {application && application.customerType ? application.customerType.typeName : '未选择'}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '0' }}>
                    <label style={{ 
                      fontWeight: '600', 
                      fontSize: '0.95rem',
                      color: '#495057',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <i className="fas fa-arrow-right" style={{ 
                        marginRight: '8px',
                        color: '#667eea',
                        fontSize: '0.9rem'
                      }}></i>
                      选择新的办理类型�?                    </label>
                    <select 
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '0.95rem',
                        border: '2px solid #e0e0e0',
                        borderRadius: '6px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        cursor: 'pointer'
                      }}
                      value={selectedCustomerType}
                      onChange={(e) => setSelectedCustomerType(e.target.value)}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    >
                      <option value="">-- 请选择新的办理类型 --</option>
                      {customerTypes.map(type => (
                        <option key={type.typeId} value={type.typeId}>
                          {type.typeName} {type.description ? `(${type.description})` : ''}
                        </option>
                      ))}
                    </select>
                    <small style={{ 
                      display: 'block', 
                      marginTop: '8px',
                      color: '#6c757d',
                      fontSize: '0.85rem',
                      lineHeight: '1.5'
                    }}>
                      <i className="fas fa-lightbulb" style={{ marginRight: '6px', color: '#ffc107' }}></i>
                      选择后将自动加载新办理类型的材料清单和问题模�?                    </small>
                  </div>
                </>
              )}
            </div>
            
            {/* 模态框底部 */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              backgroundColor: '#f8f9fa'
            }}>
              <button 
                type="button"
                style={{
                  padding: '10px 24px',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  border: '2px solid #6c757d',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#6c757d',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={() => {
                  console.log('🚫 点击取消按钮');
                  setShowChangeCustomerTypeModal(false);
                  setSelectedCustomerType('');
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6c757d';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#6c757d';
                }}
              >
                <i className="fas fa-times"></i>
                {customerTypes.length === 0 ? '关闭' : '取消'}
              </button>
              {customerTypes.length > 0 && (
                <button 
                  type="button"
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    border: selectedCustomerType ? 'none' : '2px solid #d0d0d0',
                    borderRadius: '6px',
                    background: selectedCustomerType 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : '#f5f5f5',
                    color: selectedCustomerType ? 'white' : '#999',
                    cursor: selectedCustomerType ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: selectedCustomerType ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
                  }}
                  onClick={() => handleCustomerTypeChange(selectedCustomerType, true)}
                  disabled={!selectedCustomerType}
                  onMouseEnter={(e) => {
                    if (selectedCustomerType) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCustomerType) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                >
                  <i className="fas fa-check"></i>
                  确认更换
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationDetail;
// ... existing code ...
