import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ManagerLayout from './components/ManagerLayout';

function IntroductionManager({ token }) {
  const [introduction, setIntroduction] = useState({
    title: '',
    sections: [],
    visible: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchIntroduction();
  }, []);

  const fetchIntroduction = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/introduction');
      setIntroduction(response.data);
    } catch (error) {
      console.error('获取产品简介失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('http://localhost:5000/api/introduction', introduction, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('保存成功！');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file, sectionIndex) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      console.log('开始上传图片:', file.name);
      const response = await axios.post('http://localhost:5000/api/introduction/image', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('图片上传成功:', response.data);
      const newSections = [...introduction.sections];
      newSections[sectionIndex].imageUrl = response.data.imageUrl;
      setIntroduction({ ...introduction, sections: newSections });
    } catch (error) {
      console.error('图片上传失败:', error);
      console.error('错误详情:', error.response?.data);
      alert(`图片上传失败: ${error.response?.data?.message || error.message}`);
    }
  };

  const addSection = () => {
    const newSection = {
      title: '',
      content: '',
      imageUrl: '',
      order: introduction.sections.length,
      visible: true,
      layout: 'left-image'
    };
    setIntroduction({
      ...introduction,
      sections: [...introduction.sections, newSection]
    });
  };

  const removeSection = (index) => {
    if (!window.confirm('确定要删除这个区域吗？删除后无法恢复。')) {
      return;
    }
    
    // 过滤掉要删除的section，并重新排序order字段
    const newSections = introduction.sections
      .filter((_, i) => i !== index)
      .map((section, i) => ({
        ...section,
        order: i  // 重新设置order为连续的索引
      }));
    
    setIntroduction({ ...introduction, sections: newSections });
  };

  const updateSection = (index, field, value) => {
    const newSections = [...introduction.sections];
    newSections[index][field] = value;
    setIntroduction({ ...introduction, sections: newSections });
  };

  if (loading) {
    return <div className="text-center">加载中...</div>;
  }

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* 紧凑的页面头部 */}
      <div style={{ 
        background: '#fff', 
        borderRadius: '8px', 
        padding: '20px', 
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div className="row align-items-center">
          <div className="col-md-8">
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '24px' }}>产品介绍管理</h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>管理产品介绍页面的标题、内容和图片</p>
          </div>
          <div className="col-md-4 text-end">
            <button 
              className="btn btn-success me-2" 
              onClick={handleSave}
              disabled={saving}
              style={{ fontSize: '14px', padding: '8px 20px' }}
            >
              {saving ? '保存中...' : '💾 保存设置'}
            </button>
            <button 
              className="btn btn-primary" 
              onClick={addSection}
              style={{ fontSize: '14px', padding: '8px 20px' }}
            >
              ➕ 添加区域
            </button>
          </div>
        </div>
        
        {/* 基本设置行 */}
        <div className="row mt-3">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text" style={{ background: '#f3f4f6', border: '1px solid #d1d5db' }}>
                📝 主标题
              </span>
              <input
                type="text"
                className="form-control"
                value={introduction.title}
                onChange={(e) => setIntroduction({ ...introduction, title: e.target.value })}
                placeholder="输入主标题，如：关于季舒签证"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-check" style={{ padding: '8px 16px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <input
                className="form-check-input"
                type="checkbox"
                id="visible"
                checked={introduction.visible}
                onChange={(e) => setIntroduction({ ...introduction, visible: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="visible" style={{ fontSize: '14px', fontWeight: '500' }}>
                🌟 显示产品简介
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域列表 */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {introduction.sections.map((section, index) => (
          <div key={index} style={{ 
            background: '#fff', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            {/* 区域头部 */}
            <div style={{ 
              background: '#f8fafc', 
              padding: '12px 20px', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  background: '#3b82f6', 
                  color: '#fff', 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '12px', 
                  fontWeight: 'bold' 
                }}>
                  {index + 1}
                </span>
                <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px' }}>
                  {section.title || `区域 ${index + 1}`}
                </span>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  background: '#f3f4f6',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {section.layout === 'left-image' ? '📷 图左' : 
                   section.layout === 'right-image' ? '📷 图右' : '📝 纯文本'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="form-check" style={{ margin: 0 }}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={section.visible}
                    onChange={(e) => updateSection(index, 'visible', e.target.checked)}
                    style={{ fontSize: '12px' }}
                  />
                  <label className="form-check-label" style={{ fontSize: '12px', color: '#6b7280' }}>
                    显示
                  </label>
                </div>
                <button 
                  className="btn btn-outline-danger btn-sm" 
                  onClick={() => removeSection(index)}
                  style={{ fontSize: '12px', padding: '4px 8px' }}
                >
                  🗑️ 删除
                </button>
              </div>
            </div>

            {/* 区域内容 */}
            <div style={{ padding: '16px 20px' }}>
              <div className="row g-3">
                {/* 第一行：标题和布局 */}
                <div className="col-md-6">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text" style={{ background: '#f9fafb', fontSize: '12px' }}>
                      🏷️ 标题
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      value={section.title}
                      onChange={(e) => updateSection(index, 'title', e.target.value)}
                      placeholder="如：我们的愿景"
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text" style={{ background: '#f9fafb', fontSize: '12px' }}>
                      🎨 布局
                    </span>
                    <select
                      className="form-select"
                      value={section.layout}
                      onChange={(e) => updateSection(index, 'layout', e.target.value)}
                      style={{ fontSize: '14px' }}
                    >
                      <option value="left-image">图片在左</option>
                      <option value="right-image">图片在右</option>
                      <option value="no-image">无图片</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text" style={{ background: '#f9fafb', fontSize: '12px' }}>
                      📊 排序
                    </span>
                    <input
                      type="number"
                      className="form-control"
                      value={section.order}
                      onChange={(e) => updateSection(index, 'order', parseInt(e.target.value))}
                      placeholder="0"
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                </div>

                {/* 第二行：内容 */}
                <div className="col-12">
                  <textarea
                    className="form-control"
                    rows="3"
                    value={section.content}
                    onChange={(e) => updateSection(index, 'content', e.target.value)}
                    placeholder="输入内容描述..."
                    style={{ fontSize: '14px', resize: 'vertical' }}
                  />
                </div>

                {/* 第三行：图片（如果需要） */}
                {section.layout !== 'no-image' && (
                  <div className="col-12">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <input
                          type="file"
                          className="form-control form-control-sm"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleImageUpload(e.target.files[0], index);
                            }
                          }}
                          style={{ fontSize: '13px' }}
                        />
                      </div>
                      <div className="col-md-6">
                        {section.imageUrl && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={`http://localhost:5000${section.imageUrl}`} 
                              alt="预览" 
                              style={{ 
                                width: '60px', 
                                height: '45px', 
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #e5e7eb'
                              }}
                            />
                            <span style={{ fontSize: '12px', color: '#10b981' }}>✅ 图片已上传</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 空状态 */}
        {introduction.sections.length === 0 && (
          <div style={{ 
            background: '#fff', 
            borderRadius: '8px', 
            border: '2px dashed #d1d5db',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <h4 style={{ color: '#6b7280', marginBottom: '8px' }}>暂无内容区域</h4>
            <p style={{ color: '#9ca3af', marginBottom: '20px' }}>点击上方"添加区域"按钮开始创建内容</p>
            <button className="btn btn-primary" onClick={addSection}>
              ➕ 添加第一个区域
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default IntroductionManager; 
