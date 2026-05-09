// SiteSettingsManager.js
// Logo与公司名称设置组件
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

const SiteSettingsManager = forwardRef(({ onSave }, ref) => {
  const [settings, setSettings] = useState({
    siteName: '',
    logoUrl: '',
    faviconUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState({ logo: false, favicon: false });

  useEffect(() => {
    fetchSettings();
  }, []);

  useImperativeHandle(ref, () => ({
    handleSave
  }));

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/site-settings');
      setSettings({
        siteName: response.data.siteName || '',
        logoUrl: response.data.logoUrl || '',
        faviconUrl: response.data.faviconUrl || ''
      });
    } catch (err) {
      console.error('获取网站设置失败:', err);
      setError('获取网站设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await axios.put('http://localhost:5000/api/site-settings', settings);
      setSuccess('设置保存成功！');
      
      // 调用父组件的保存回调
      if (onSave) {
        onSave();
      }
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('保存设置失败:', err);
      setError('保存设置失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }
    
    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('图片文件大小不能超过5MB');
      return;
    }

    try {
      setUploading(prev => ({ ...prev, [type]: true }));
      setError('');
      
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('开始上传图片:', file.name, '大小:', file.size);
      
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30秒超时
      });
      
      console.log('上传响应:', response.data);
      
      if (response.data.success) {
        const imageUrl = response.data.url || response.data.imageUrl;
        console.log('获取到图片URL:', imageUrl);
        
        setSettings(prev => ({
          ...prev,
          [type === 'logo' ? 'logoUrl' : 'faviconUrl']: imageUrl
        }));
        
        setSuccess(`${type === 'logo' ? 'Logo' : 'Favicon'}上传成功！`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        console.error('上传失败，响应:', response.data);
        setError('图片上传失败');
      }
    } catch (err) {
      console.error('图片上传失败:', err);
      console.error('错误详情:', err.response?.data || err.message);
      setError(`图片上传失败: ${err.response?.data?.message || err.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      handleImageUpload(file, type);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#666', margin: 0 }}>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#fff', minHeight: '400px' }}>
      {/* 页面标题 */}
      <div style={{ 
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '24px', 
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          🏢 Logo与公司名称设置
        </h1>
        <p style={{ 
          margin: '8px 0 0 0', 
          color: '#6b7280',
          fontSize: '14px'
        }}>
          管理网站Logo和公司名称
        </p>
      </div>

      {/* 错误和成功消息 */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          color: '#16a34a',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {success}
        </div>
      )}

      {/* 设置表单 */}
      <div style={{
        background: '#f8fafc',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        maxWidth: '600px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '18px' }}>
          🏢 基本信息
        </h3>
        
        {/* 公司名称 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600', 
            color: '#374151' 
          }}>
            公司名称 *
          </label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => handleInputChange('siteName', e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            placeholder="请输入公司名称"
          />
        </div>

        {/* Logo 上传 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: '600', 
            color: '#374151' 
          }}>
            Logo 图片
          </label>
          
          {settings.logoUrl && (
            <div style={{ marginBottom: '12px' }}>
              <img 
                src={settings.logoUrl} 
                alt="当前Logo" 
                style={{
                  maxWidth: '120px',
                  maxHeight: '60px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '4px',
                  background: '#fff'
                }}
              />
            </div>
          )}
          
          <div style={{ marginBottom: '8px' }}>
            <label style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: uploading.logo ? '#9ca3af' : '#f97316',
              color: 'white',
              borderRadius: '8px',
              cursor: uploading.logo ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: uploading.logo ? 0.6 : 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              border: 'none'
            }}>
              {uploading.logo ? '📤 上传中...' : '📤 选择Logo文件'}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'logo')}
                style={{ display: 'none' }}
                disabled={uploading.logo}
              />
            </label>
          </div>
          
          <div style={{ fontSize: '12px', color: '#6b7280', wordBreak: 'break-all' }}>
            当前URL: {settings.logoUrl || '未设置'}
          </div>
        </div>

        {/* Favicon 上传 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: '600', 
            color: '#374151' 
          }}>
            Favicon 图标
          </label>
          
          {settings.faviconUrl && (
            <div style={{ marginBottom: '12px' }}>
              <img 
                src={settings.faviconUrl} 
                alt="当前Favicon" 
                style={{
                  maxWidth: '32px',
                  maxHeight: '32px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '4px',
                  background: '#fff'
                }}
              />
            </div>
          )}
          
          <div style={{ marginBottom: '8px' }}>
            <label style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: uploading.favicon ? '#9ca3af' : '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              cursor: uploading.favicon ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: uploading.favicon ? 0.6 : 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              border: 'none'
            }}>
              {uploading.favicon ? '📤 上传中...' : '📤 选择Favicon文件'}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'favicon')}
                style={{ display: 'none' }}
                disabled={uploading.favicon}
              />
            </label>
          </div>
          
          <div style={{ fontSize: '12px', color: '#6b7280', wordBreak: 'break-all' }}>
            当前URL: {settings.faviconUrl || '未设置'}
          </div>
        </div>
      </div>
    </div>
  );
});

export default SiteSettingsManager;