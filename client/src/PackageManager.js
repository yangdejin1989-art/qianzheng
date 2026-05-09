import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import WangEditor from './WangEditor';
import ManagerLayout from './components/ManagerLayout';

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

function PackageManager({ token }) {
  const [packages, setPackages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    speed: '',
    visaTypes: [], // 多个签证类型及价格（包含币种�?    description: '',
    features: [],
    details: '',
    order: 0,
    visible: true,
    imageUrl: ''
  });
  const [newFeature, setNewFeature] = useState('');
  const [newVisaType, setNewVisaType] = useState({ type: '', currency: 'CNY', price: '', originalPrice: '' });
  const [editingVisaTypeIndex, setEditingVisaTypeIndex] = useState(null); // 正在编辑的签证类型索�?  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(''); // 图片预览URL
  const [error, setError] = useState('');
  const formRef = useRef(null);
  const [showForm, setShowForm] = useState(false);

  const fetchPackages = () => {
    axios.get('/api/packages').then(res => setPackages(res.data));
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // 清理预览URL，避免内存泄�?  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleAdd = () => {
    setEditing(null);
    setForm(f => ({
      ...f,
      name: '', speed: '', visaTypes: [], description: '',
      features: [], details: '', order: 0, visible: true, imageUrl: ''
    }));
    setNewFeature('');
    setNewVisaType({ type: '', currency: 'CNY', price: '', originalPrice: '' });
    setEditingVisaTypeIndex(null);
    setFile(null);
    setPreviewUrl(''); // 清空预览
    setShowForm(true);
  };
  const handleEdit = (pkg) => {
    setEditing(pkg._id);
    setForm(f => ({
      ...f,
      name: pkg.name || '',
      speed: pkg.speed || '',
      visaTypes: pkg.visaTypes || [],
      description: pkg.description || '',
      features: pkg.features || [],
      details: pkg.details || '',
      order: pkg.order || 0,
      visible: pkg.visible,
      imageUrl: pkg.imageUrl || ''
    }));
    setFile(null);
    setPreviewUrl(''); // 清空预览
    setEditingVisaTypeIndex(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定删除这个套餐�?)) {
      try {
        await axios.delete(`/api/packages/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchPackages();
      } catch (err) {
        setError('删除失败');
      }
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setForm(f => ({
        ...f,
        features: [...f.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    const features = form.features.filter((_, i) => i !== index);
    setForm(f => ({ ...f, features }));
  };

  const addVisaType = () => {
    if (newVisaType.type.trim() && newVisaType.price) {
      if (editingVisaTypeIndex !== null) {
        // 更新模式
        const updatedVisaTypes = [...form.visaTypes];
        updatedVisaTypes[editingVisaTypeIndex] = {
          type: newVisaType.type.trim(),
          currency: newVisaType.currency,
          price: Number(newVisaType.price),
          originalPrice: newVisaType.originalPrice ? Number(newVisaType.originalPrice) : undefined
        };
        setForm(f => ({ ...f, visaTypes: updatedVisaTypes }));
        setEditingVisaTypeIndex(null);
      } else {
        // 添加模式
      setForm(f => ({
        ...f,
        visaTypes: [...f.visaTypes, {
          type: newVisaType.type.trim(),
          currency: newVisaType.currency,
          price: Number(newVisaType.price),
          originalPrice: newVisaType.originalPrice ? Number(newVisaType.originalPrice) : undefined
        }]
      }));
      }
      setNewVisaType({ type: '', currency: 'CNY', price: '', originalPrice: '' });
    }
  };

  const editVisaType = (index) => {
    const vt = form.visaTypes[index];
    setNewVisaType({
      type: vt.type,
      currency: vt.currency,
      price: vt.price.toString(),
      originalPrice: vt.originalPrice ? vt.originalPrice.toString() : ''
    });
    setEditingVisaTypeIndex(index);
  };

  const cancelEditVisaType = () => {
    setNewVisaType({ type: '', currency: 'CNY', price: '', originalPrice: '' });
    setEditingVisaTypeIndex(null);
  };

  const removeVisaType = (index) => {
    const visaTypes = form.visaTypes.filter((_, i) => i !== index);
    setForm(f => ({ ...f, visaTypes }));
    // 如果正在编辑被删除的项，取消编辑
    if (editingVisaTypeIndex === index) {
      cancelEditVisaType();
    } else if (editingVisaTypeIndex !== null && editingVisaTypeIndex > index) {
      setEditingVisaTypeIndex(editingVisaTypeIndex - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.speed) {
      setError('请填写套餐名称和预计完成时间');
      return;
    }
    
    if (!form.visaTypes || form.visaTypes.length === 0) {
      setError('请至少添加一个签证类型和价格');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('speed', form.speed);
      formData.append('visaTypes', JSON.stringify(form.visaTypes || []));
      formData.append('description', form.description);
      formData.append('features', JSON.stringify(form.features));
      formData.append('details', form.details);
      formData.append('order', form.order);
      formData.append('visible', form.visible);

      if (file) {
        formData.append('image', file);
      }

      if (editing) {
        await axios.put(`/api/packages/${editing}`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}` 
          }
        });
      } else {
        await axios.post('/api/packages', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}` 
          }
        });
      }

      fetchPackages();
      setEditing(null);
      setForm(f => ({
        ...f,
        name: '',
        speed: '',
        visaTypes: [],
        description: '',
        features: [],
        details: '',
        order: 0,
        visible: true,
        imageUrl: ''
      }));
      setNewFeature('');
      setNewVisaType({ type: '', currency: 'CNY', price: '', originalPrice: '' });
      setEditingVisaTypeIndex(null);
      setFile(null);
      setPreviewUrl(''); // 清空预览
      setShowForm(false);
    } catch (err) {
      console.error('保存失败:', err);
      console.error('错误响应:', err.response?.data);
      setError(err.response?.data?.message || '操作失败�? + (err.message || '未知错误'));
    }
  };

  return (
    <div className="compact-manager">
      <ManagerLayout 
        title="套餐管理" 
        subtitle="管理宽带套餐信息，包括价格、功能特色等"
      >
        {/* 新增套餐按钮 */}
        <div className="d-flex justify-content-end mb-2">
          <button className="btn btn-primary btn-sm" style={{ fontSize: 13, padding: '4px 16px' }} onClick={handleAdd}>
            新增套餐
          </button>
        </div>
        {/* 套餐列表 */}
        <div className="list-section">
          <h4 className="section-title mb-3">套餐列表</h4>
          <div className="row">
            {packages.map(pkg => (
              <div key={pkg._id} className="col-12 col-sm-6 col-lg-4 mb-3">
                <div className="card h-100 shadow-sm" style={{ borderRadius: 6, fontSize: 13 }}>
                  {pkg.imageUrl && (
                    <img
                      src={`${pkg.imageUrl}`}
                      className="card-img-top"
                      alt={pkg.name}
                      style={{ height: '120px', objectFit: 'cover', borderTopLeftRadius: 6, borderTopRightRadius: 6 }}
                    />
                  )}
                  <div className="card-body p-2">
                    <h6 className="card-title fw-bold mb-1" style={{ fontSize: 15 }}>{pkg.name}</h6>
                    {/* 显示签证类型列表 */}
                    {pkg.visaTypes && pkg.visaTypes.length > 0 ? (
                      <div className="mb-1">
                        {pkg.visaTypes.map((vt, idx) => (
                          <div key={idx} className="d-flex align-items-center mb-1">
                            <span className="badge bg-info text-dark me-1" style={{ fontSize: 10 }}>{vt.type}</span>
                            <span className="text-danger fw-bold" style={{ fontSize: 13 }}>
                              {getCurrencySymbol(vt.currency)}{vt.price}/�?                            </span>
                            {vt.originalPrice && vt.originalPrice > vt.price && (
                              <span className="text-muted text-decoration-line-through ms-1" style={{ fontSize: 11 }}>
                                {getCurrencySymbol(vt.currency)}{vt.originalPrice}
                              </span>
                            )}
                            <span className="text-muted ms-1" style={{ fontSize: 10 }}>({getCurrencyName(vt.currency)})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {pkg.visaType && (
                          <div className="badge bg-info text-dark mb-1" style={{ fontSize: 11 }}>{pkg.visaType}</div>
                        )}
                        <div className="d-flex align-items-center mb-1">
                          <span className="text-danger fw-bold" style={{ fontSize: 15 }}>
                            {getCurrencySymbol(pkg.currency)}{pkg.price}/�?                            <span className="text-muted ms-1" style={{ fontSize: 12 }}>({getCurrencyName(pkg.currency)})</span>
                          </span>
                          {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                            <span className="text-muted text-decoration-line-through ms-2" style={{ fontSize: 12 }}>
                              {getCurrencySymbol(pkg.currency)}{pkg.originalPrice}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                    <div className="text-muted mb-1" style={{ fontSize: 12 }}>{pkg.speed}</div>
                    <div className="card-text mb-1" style={{ fontSize: 12, color: '#555' }}>{pkg.description}</div>
                    <div className="d-flex flex-wrap gap-1 mb-2">
                      {pkg.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="badge bg-light text-dark" style={{ fontSize: 11 }}>{feature}</span>
                      ))}
                      {pkg.features.length > 3 && (
                        <span className="badge bg-light text-dark" style={{ fontSize: 11 }}>+{pkg.features.length - 3}</span>
                      )}
                    </div>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        style={{ fontSize: 12, padding: '2px 10px', minWidth: 44 }}
                        onClick={() => handleEdit(pkg)}
                      >
                        编辑
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        style={{ fontSize: 12, padding: '2px 10px', minWidth: 44 }}
                        onClick={() => handleDelete(pkg._id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* 新增/编辑套餐表单（仅在showForm && ready时显示） */}
        {showForm && (
          <div className="form-section mt-2">
            <h4 className="section-title mb-3" style={{ fontSize: 15 }}>{editing ? '编辑套餐' : '新增套餐'}</h4>
            <form onSubmit={handleSubmit} className="form-container" ref={formRef}>
              <div className="row g-3">
                {/* 左侧：编辑表�?*/}
                <div className="col-lg-8">
                  <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label fw-bold mb-1" style={{ fontSize: 13 }}>套餐名称 *</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    style={{ fontSize: 13, padding: '6px 10px' }}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="如：100M光纤宽带"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold mb-1" style={{ fontSize: 13 }}>预计完成时间 *</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    style={{ fontSize: 13, padding: '6px 10px' }}
                    value={form.speed}
                    onChange={e => setForm(f => ({ ...f, speed: e.target.value }))}
                    placeholder="如：5-7个工作日"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold mb-1" style={{ fontSize: 13 }}>排序</label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    style={{ fontSize: 13, padding: '6px 10px' }}
                    value={form.order}
                    onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                    placeholder="数字越小越靠�?
                  />
                </div>
                </div>

                {/* 签证类型和价格列�?*/}
                <div className="mb-2 mt-2">
                  <label className="form-label fw-bold mb-1" style={{ fontSize: 13 }}>签证类型与价�?/label>
                  <div className="border rounded p-2" style={{ backgroundColor: '#f8f9fa' }}>
                    {form.visaTypes.map((vt, index) => (
                      <div key={index} className="d-flex align-items-center gap-2 mb-2 p-2" style={{ 
                        backgroundColor: editingVisaTypeIndex === index ? '#fff3cd' : '#fff', 
                        borderRadius: 4,
                        border: editingVisaTypeIndex === index ? '2px solid #ffc107' : 'none'
                      }}>
                        <span className="badge bg-info text-dark">{vt.type}</span>
                        <span className="text-danger fw-bold">{getCurrencySymbol(vt.currency)}{vt.price}/�?/span>
                        {vt.originalPrice && (
                          <span className="text-muted text-decoration-line-through">{getCurrencySymbol(vt.currency)}{vt.originalPrice}</span>
                        )}
                        <span className="text-muted" style={{ fontSize: 11 }}>({getCurrencyName(vt.currency)})</span>
                        <div className="ms-auto d-flex gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-warning"
                            style={{ fontSize: 11, padding: '2px 8px' }}
                            onClick={() => editVisaType(index)}
                            disabled={editingVisaTypeIndex !== null && editingVisaTypeIndex !== index}
                          >
                            编辑
                          </button>
                        <button
                          type="button"
                            className="btn btn-sm btn-danger"
                          style={{ fontSize: 11, padding: '2px 8px' }}
                          onClick={() => removeVisaType(index)}
                        >
                          删除
                        </button>
                        </div>
                      </div>
                    ))}
                    <div className="row g-2 mt-1">
                      <div className="col-3">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          style={{ fontSize: 12 }}
                          placeholder="类型（如：单次）"
                          value={newVisaType.type}
                          onChange={e => setNewVisaType({...newVisaType, type: e.target.value})}
                          onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addVisaType())}
                        />
                      </div>
                      <div className="col-2">
                        <select
                          className="form-select form-select-sm"
                          style={{ fontSize: 12 }}
                          value={newVisaType.currency}
                          onChange={e => setNewVisaType({...newVisaType, currency: e.target.value})}
                        >
                          <option value="CNY">¥ 人民�?/option>
                          <option value="JPY">¥ 日元</option>
                          <option value="USD">$ 美元</option>
                          <option value="EUR">�?欧元</option>
                        </select>
                      </div>
                      <div className="col-2">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          style={{ fontSize: 12 }}
                          placeholder="价格"
                          value={newVisaType.price}
                          onChange={e => setNewVisaType({...newVisaType, price: e.target.value})}
                          onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addVisaType())}
                        />
                      </div>
                      <div className="col-3">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          style={{ fontSize: 12 }}
                          placeholder="原价（选填�?
                          value={newVisaType.originalPrice}
                          onChange={e => setNewVisaType({...newVisaType, originalPrice: e.target.value})}
                          onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addVisaType())}
                        />
                      </div>
                      <div className="col-2">
                        <div className="d-flex gap-1">
                        <button
                          type="button"
                            className={`btn btn-sm w-100 ${editingVisaTypeIndex !== null ? 'btn-success' : 'btn-primary'}`}
                          style={{ fontSize: 12 }}
                          onClick={addVisaType}
                        >
                            {editingVisaTypeIndex !== null ? '更新' : '添加'}
                          </button>
                          {editingVisaTypeIndex !== null && (
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              style={{ fontSize: 12, padding: '0 8px' }}
                              onClick={cancelEditVisaType}
                              title="取消编辑"
                            >
                              �?                        </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {editingVisaTypeIndex !== null && (
                      <small className="text-warning d-block mt-2" style={{ fontSize: 11 }}>
                        ✏️ 正在编辑签证类型，修改后点击"更新"按钮
                      </small>
                    )}
                    {form.visaTypes.length === 0 && (
                      <small className="text-muted d-block mt-2" style={{ fontSize: 11 }}>
                        💡 提示：添加至少一个签证类型和价格，如"单次 - ¥600"
                      </small>
                    )}
                  </div>
                </div>

              <div className="mb-2">
                <label className="form-label fw-bold mb-1" style={{ fontSize: 13 }}>简短描�?/label>
                <textarea
                  className="form-control form-control-lg"
                  style={{ fontSize: 13, padding: '6px 10px' }}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="套餐的简短介�?
                  rows="2"
                />
              </div>

              <div className="mb-2">
                <label className="form-label fw-bold mb-1" style={{ fontSize: 13 }}>特色功能</label>
                <div className="d-flex mb-1">
                  <input
                    type="text"
                    className="form-control form-control-lg me-2"
                    style={{ fontSize: 13, padding: '6px 10px' }}
                    value={newFeature}
                    onChange={e => setNewFeature(e.target.value)}
                    placeholder="添加特色功能"
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <button type="button" className="btn btn-outline-primary btn-sm" style={{ fontSize: 12, padding: '2px 10px' }} onClick={addFeature}>
                    添加
                  </button>
                </div>
                <div className="d-flex flex-wrap gap-1">
                  {form.features.map((feature, index) => (
                    <span key={index} className="badge bg-primary d-flex align-items-center" style={{ fontSize: 11 }}>
                      {feature}
                      <button
                        type="button"
                        className="btn-close btn-close-white ms-2"
                        style={{ fontSize: 10 }}
                        onClick={() => removeFeature(index)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label fw-bold mb-1" style={{ fontSize: 13 }}>详细说明</label>
                <WangEditor
                  key={`editor-${editing || 'new'}-${form.details ? form.details.length : 0}`}
                  value={form.details}
                  onChange={content => setForm(f => ({ ...f, details: content }))}
                />
              </div>

              <div className="mb-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={form.visible}
                    onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))}
                    id="packageVisible"
                  />
                  <label className="form-check-label fw-bold" htmlFor="packageVisible" style={{ fontSize: 13 }}>
                    显示此套�?                  </label>
                </div>
              </div>
                </div>

                {/* 右侧：图片预�?*/}
                <div className="col-lg-4">
                  <div className="sticky-top" style={{ top: '20px' }}>
                    <label className="form-label fw-bold mb-2" style={{ fontSize: 13 }}>套餐图片</label>
                    {/* 图片预览 */}
                    {(previewUrl || form.imageUrl) ? (
                      <div style={{ position: 'relative', marginBottom: 16 }}>
                        <div style={{ 
                          width: '100%', 
                          height: 300, 
                          border: '2px solid #ddd',
                          borderRadius: 8,
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          <img 
                            src={previewUrl || `${form.imageUrl}`} 
                            alt="套餐图片" 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              objectPosition: 'top center'
                            }} 
                          />
                        </div>
                        {/* 清除图片按钮 */}
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            padding: '4px 12px',
                            fontSize: 12
                          }}
                          onClick={() => {
                            setFile(null);
                            setPreviewUrl('');
                            setForm(f => ({ ...f, imageUrl: '' }));
                            const fileInput = document.getElementById('package-image-input');
                            if (fileInput) fileInput.value = '';
                          }}
                          title="删除图片"
                        >
                          <i className="fas fa-times me-1"></i> 删除图片
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        width: '100%',
                        height: 300,
                        border: '2px dashed #ccc',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f8f9fa',
                        marginBottom: 16
                      }}>
                        <div className="text-center text-muted">
                          <i className="fas fa-image fa-3x mb-2" style={{ opacity: 0.3 }}></i>
                          <p style={{ fontSize: 13 }}>暂无图片</p>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      id="package-image-input"
                      className="form-control"
                      style={{ fontSize: 13 }}
                      accept="image/*"
                      onChange={e => {
                        const selectedFile = e.target.files[0];
                        if (selectedFile) {
                          setFile(selectedFile);
                          const url = URL.createObjectURL(selectedFile);
                          setPreviewUrl(url);
                        }
                      }}
                    />
                    <small className="text-muted d-block mt-1" style={{ fontSize: 11 }}>
                      建议尺寸�?00x600px，支�?JPG、PNG 格式
                    </small>
                  </div>
                </div>
              </div>

              <div className="mb-2 mt-3 pt-3 border-top">
                <button type="submit" className="btn btn-primary btn-lg me-2" style={{ fontSize: 13, padding: '6px 18px' }}>
                  {editing ? '保存修改' : '新增套餐'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  style={{ fontSize: 13, padding: '6px 18px' }}
                  onClick={() => {
                    setEditing(null);
                    setForm(f => ({
                      ...f,
                      name: '',
                      speed: '',
                      visaTypes: [],
                      description: '',
                      features: [],
                      details: '',
                      order: 0,
                      visible: true,
                      imageUrl: ''
                    }));
                    setNewFeature('');
                    setNewVisaType({ type: '', currency: 'CNY', price: '', originalPrice: '' });
                    setEditingVisaTypeIndex(null);
                    setFile(null);
                    setPreviewUrl(''); // 清空预览
                    setShowForm(false);
                  }}
                >
                  取消
                </button>
                {error && <span className="text-danger ms-3" style={{ fontSize: 12 }}>{error}</span>}
              </div>
            </form>
          </div>
        )}
      </ManagerLayout>
    </div>
  );
}

export default PackageManager; 
