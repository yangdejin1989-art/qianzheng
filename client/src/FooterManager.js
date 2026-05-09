// FooterManager.js
// 后台管理底部内容组件
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import WangEditor from './WangEditor';
import ManagerLayout from './components/ManagerLayout';

function FooterManager({ token, subTab }) {
  const [footer, setFooter] = useState({ 
    about: [{ title: '', content: '' }], 
    companyInfo: [{ title: '', content: '' }], 
    contacts: '',
    qrcodes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/footer');
        const data = response.data || {};
        
        // 确保数据结构完整
        const safeData = {
          about: Array.isArray(data.about) && data.about.length > 0 
            ? data.about.map(item => ({
                title: item.title || '',
                content: item.content || ''
              }))
            : [{ title: '', content: '' }],
          companyInfo: Array.isArray(data.companyInfo) && data.companyInfo.length > 0 
            ? data.companyInfo.map(item => ({
                title: item.title || '',
                content: item.content || ''
              }))
            : [{ title: '', content: '' }],
          contacts: data.contacts || '',
          qrcodes: Array.isArray(data.qrcodes) ? data.qrcodes : []
        };
        
        setFooter(safeData);
        setDataReady(true);
      } catch (err) {
        console.error('加载 Footer 数据失败:', err);
        setFooter({
          about: [{ title: '', content: '' }],
          companyInfo: [{ title: '', content: '' }],
          contacts: '',
          qrcodes: []
        });
        setDataReady(true);
      } finally {
      setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSave = async () => {
    setError('');
    try {
      console.log('准备保存的数�?', footer);
      const response = await axios.put('/api/footer', footer, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('保存成功，服务器返回:', response.data);
      alert('保存成功');
    } catch (err) {
      console.error('保存失败:', err);
      console.error('错误详情:', err.response?.data);
      setError('保存失败: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAboutChange = useCallback((idx, key, value) => {
    setFooter(prev => {
      const about = [...(prev.about || [])];
      if (!about[idx]) about[idx] = { title: '', content: '' };
      about[idx][key] = value || '';
      return { ...prev, about };
    });
  }, []);
  const handleAddAbout = () => {
    const about = [...(footer.about || [])];
    about.push({ title: '', content: '' });
    setFooter({ ...footer, about });
  };
  const handleRemoveAbout = (idx) => {
    const about = [...(footer.about || [])];
    about.splice(idx, 1);
    setFooter({ ...footer, about });
  };

  const handleCompanyInfoChange = useCallback((idx, key, value) => {
    setFooter(prev => {
      const companyInfo = [...(prev.companyInfo || [])];
      if (!companyInfo[idx]) companyInfo[idx] = { title: '', content: '' };
      companyInfo[idx][key] = value || '';
      return { ...prev, companyInfo };
    });
  }, []);
  const handleAddCompanyInfo = () => {
    const companyInfo = [...(footer.companyInfo || [])];
    companyInfo.push({ title: '', content: '' });
    setFooter({ ...footer, companyInfo });
  };
  const handleRemoveCompanyInfo = (idx) => {
    const companyInfo = [...(footer.companyInfo || [])];
    companyInfo.splice(idx, 1);
    setFooter({ ...footer, companyInfo });
  };

  const handleQrcodeUpload = async (idx, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post('/api/footer/qrcode', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      
      // 更新二维码数组中的图片URL
      const qrcodes = [...(footer.qrcodes || [])];
      if (qrcodes[idx]) {
        qrcodes[idx].imageUrl = res.data.imageUrl;
        setFooter({ ...footer, qrcodes });
      }
    } catch (error) {
      console.error('二维码上传失�?', error);
      alert('二维码上传失败，请重�?);
    }
  };

  const addQrcode = () => {
    const qrcodes = [...(footer.qrcodes || [])];
    qrcodes.push({ label: '', imageUrl: '' });
    setFooter({ ...footer, qrcodes });
  };

  const removeQrcode = (idx) => {
    const qrcodes = [...(footer.qrcodes || [])];
    qrcodes.splice(idx, 1);
    setFooter({ ...footer, qrcodes });
  };

  const updateQrcode = (idx, field, value) => {
    const qrcodes = [...(footer.qrcodes || [])];
    if (qrcodes[idx]) {
      qrcodes[idx][field] = value;
      setFooter({ ...footer, qrcodes });
    }
  };

  if (loading) return <div>加载�?..</div>;
  if (!dataReady) return <div>数据准备�?..</div>;

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* 统一的页面头�?*/}
      <div style={{ 
        background: '#fff', 
        borderRadius: '8px', 
        padding: '20px', 
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div className="row align-items-center">
          <div className="col-md-8">
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '24px' }}>
              {subTab === 'about' && '📖 关于我们'}
              {subTab === 'companyInfo' && '🏢 公司信息'}
              {subTab === 'contacts' && '📞 联系方式/二维�?}
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              {subTab === 'about' && '管理关于我们页面的内容信�?}
              {subTab === 'companyInfo' && '管理公司基本信息和介�?}
              {subTab === 'contacts' && '管理联系方式和二维码信息'}
            </p>
          </div>
          <div className="col-md-4 text-end">
            <button 
              className="btn btn-success me-2" 
              onClick={handleSave}
              style={{ fontSize: '14px', padding: '8px 20px' }}
            >
              💾 保存设置
            </button>
            {(subTab === 'about' || subTab === 'companyInfo') && (
              <button 
                className="btn btn-primary" 
                onClick={subTab === 'about' ? handleAddAbout : handleAddCompanyInfo}
                style={{ fontSize: '14px', padding: '8px 20px' }}
              >
                �?新增子项
              </button>
            )}
            {subTab === 'contacts' && (
              <button 
                className="btn btn-primary" 
                onClick={addQrcode}
                style={{ fontSize: '14px', padding: '8px 20px' }}
              >
                📱 添加二维�?              </button>
            )}
          </div>
        </div>
        {error && (
          <div className="alert alert-danger mt-3 mb-0" style={{ fontSize: '14px' }}>
            {error}
          </div>
        )}
      </div>

      {/* 关于我们页面 */}
      {subTab === 'about' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {(footer.about || []).map((item, idx) => (
            <div key={idx} style={{ 
              background: '#fff', 
              borderRadius: '8px', 
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              {/* 子项头部 */}
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
                    {idx + 1}
                  </span>
                  <div className="input-group" style={{ maxWidth: '300px' }}>
                    <span className="input-group-text" style={{ background: '#f9fafb', fontSize: '12px' }}>
                      🏷�?标题
                    </span>
                    <input 
                      className="form-control form-control-sm" 
                      placeholder="子项标题" 
                      value={item.title || ''} 
                      onChange={e=>handleAboutChange(idx, 'title', e.target.value)}
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                </div>
                <button 
                  className="btn btn-outline-danger btn-sm" 
                  onClick={()=>handleRemoveAbout(idx)}
                  style={{ fontSize: '12px', padding: '4px 8px' }}
                >
                  🗑�?删除
                </button>
              </div>

              {/* 富文本编辑器 */}
              <div style={{ padding: '16px 20px' }}>
                <WangEditor 
                  key={`about-editor-${idx}`}
                  value={item.content || ''} 
                  onChange={val=>handleAboutChange(idx, 'content', val)} 
                  placeholder="输入富文本内�?.." 
                  height={120}
                />
              </div>
            </div>
          ))}

          {/* 空状�?*/}
          {(!footer.about || footer.about.length === 0) && (
            <div style={{ 
              background: '#fff', 
              borderRadius: '8px', 
              border: '2px dashed #d1d5db',
              padding: '40px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
              <h4 style={{ color: '#6b7280', marginBottom: '8px' }}>暂无关于我们内容</h4>
              <p style={{ color: '#9ca3af', marginBottom: '20px' }}>点击上方"新增子项"按钮开始创建内�?/p>
              <button className="btn btn-primary" onClick={handleAddAbout}>
                �?添加第一个子�?              </button>
            </div>
          )}
        </div>
      )}
      {/* 公司信息页面 */}
      {subTab === 'companyInfo' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {(footer.companyInfo || []).map((item, idx) => (
            <div key={idx} style={{ 
              background: '#fff', 
              borderRadius: '8px', 
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              {/* 子项头部 */}
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
                    background: '#10b981', 
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
                    {idx + 1}
                  </span>
                  <div className="input-group" style={{ maxWidth: '300px' }}>
                    <span className="input-group-text" style={{ background: '#f9fafb', fontSize: '12px' }}>
                      🏢 标题
                    </span>
                    <input 
                      className="form-control form-control-sm" 
                      placeholder="子项标题" 
                      value={item.title || ''} 
                      onChange={e=>handleCompanyInfoChange(idx, 'title', e.target.value)}
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                </div>
                <button 
                  className="btn btn-outline-danger btn-sm" 
                  onClick={()=>handleRemoveCompanyInfo(idx)}
                  style={{ fontSize: '12px', padding: '4px 8px' }}
                >
                  🗑�?删除
                </button>
              </div>

              {/* 富文本编辑器 */}
              <div style={{ padding: '16px 20px' }}>
                <WangEditor 
                  key={`company-editor-${idx}`}
                  value={item.content || ''} 
                  onChange={val=>handleCompanyInfoChange(idx, 'content', val)} 
                  placeholder="输入富文本内�?.." 
                  height={120}
                />
              </div>
            </div>
          ))}

          {/* 空状�?*/}
          {(!footer.companyInfo || footer.companyInfo.length === 0) && (
            <div style={{ 
              background: '#fff', 
              borderRadius: '8px', 
              border: '2px dashed #d1d5db',
              padding: '40px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
              <h4 style={{ color: '#6b7280', marginBottom: '8px' }}>暂无公司信息内容</h4>
              <p style={{ color: '#9ca3af', marginBottom: '20px' }}>点击上方"新增子项"按钮开始创建内�?/p>
              <button className="btn btn-primary" onClick={handleAddCompanyInfo}>
                �?添加第一个子�?              </button>
            </div>
          )}
        </div>
      )}
      {/* 联系方式/二维码页�?*/}
      {subTab === 'contacts' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* 联系方式区域 */}
          <div style={{ 
            background: '#fff', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: '#f8fafc', 
              padding: '12px 20px', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ 
                background: '#f59e0b', 
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
                📞
              </span>
              <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px' }}>
                联系方式信息
              </span>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <WangEditor 
                key="contacts-editor"
                value={footer.contacts || ''} 
                onChange={val=>setFooter({...footer, contacts: val || ''})} 
                placeholder="输入联系方式信息（电话、邮箱、地址等）..." 
                height={100}
              />
            </div>
          </div>

          {/* 二维码区�?*/}
          <div style={{ 
            background: '#fff', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
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
                  background: '#8b5cf6', 
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
                  📱
                </span>
                <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px' }}>
                  二维码管�?({(footer.qrcodes || []).length}�?
                </span>
              </div>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={addQrcode}
                style={{ fontSize: '12px', padding: '4px 12px' }}
              >
                �?添加二维�?              </button>
            </div>

            <div style={{ padding: '16px 20px' }}>
              {(footer.qrcodes || []).length > 0 ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(footer.qrcodes || []).map((item, idx) => (
                    <div key={`qrcode-${idx}`} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      padding: '12px',
                      background: '#f9fafb'
                    }}>
                      <div className="row align-items-center">
                        <div className="col-md-4">
                          <div className="input-group input-group-sm">
                            <span className="input-group-text" style={{ background: '#f3f4f6', fontSize: '11px' }}>
                              🏷�?说明
                            </span>
                            <input 
                              className="form-control" 
                              placeholder="如：微信客服" 
                              value={item.label || ''} 
                              onChange={e=>updateQrcode(idx, 'label', e.target.value)}
                              style={{ fontSize: '13px' }}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={e=>handleQrcodeUpload(idx, e.target.files[0])} 
                            className="form-control form-control-sm"
                            style={{ fontSize: '12px' }}
                          />
                        </div>
                        <div className="col-md-3">
                          {item.imageUrl ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img 
                                src={`${item.imageUrl}`} 
                                alt="二维�? 
                                style={{
                                  width: '40px', 
                                  height: '40px', 
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  border: '1px solid #d1d5db'
                                }}
                              />
                              <span style={{ fontSize: '11px', color: '#10b981' }}>�?已上�?/span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>📷 待上�?/span>
                          )}
                        </div>
                        <div className="col-md-1">
                          <button 
                            className="btn btn-outline-danger btn-sm" 
                            onClick={()=>removeQrcode(idx)}
                            style={{ fontSize: '11px', padding: '2px 6px' }}
                          >
                            🗑�?                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center',
                  padding: '20px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📱</div>
                  <p style={{ margin: 0, fontSize: '14px' }}>暂无二维码，点击上方按钮添加</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FooterManager; 
