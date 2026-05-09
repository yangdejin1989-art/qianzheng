import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl } from './config';

function AccountSettings() {
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // 基本信息表单
  const [basicForm, setBasicForm] = useState({
    displayName: '',
    phone: '',
    email: '',
    wechat: '',
    qq: ''
  });
  
  // 密码修改表单
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
    setUserInfo(info);
    setBasicForm({
      displayName: info.displayName || '',
      phone: info.phone || '',
      email: info.email || '',
      wechat: info.wechat || '',
      qq: info.qq || ''
    });
  }, []);

  // 更新基本信息
  const handleUpdateBasicInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        buildApiUrl('/api/admin/profile'),
        { 
          displayName: basicForm.displayName,
          phone: basicForm.phone,
          email: basicForm.email,
          wechat: basicForm.wechat,
          qq: basicForm.qq
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        // 更新本地存储的用户信�?
        const updatedUserInfo = { 
          ...userInfo, 
          displayName: basicForm.displayName,
          phone: basicForm.phone,
          email: basicForm.email,
          wechat: basicForm.wechat,
          qq: basicForm.qq
        };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        setUserInfo(updatedUserInfo);
        
        setMessage('�?基本信息更新成功�?);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('�?更新失败: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 修改密码
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');

    // 验证
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage('�?请填写完整信�?);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage('�?新密码长度至�?�?);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('�?两次输入的新密码不一�?);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        buildApiUrl('/api/admin/change-password'),
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage('�?密码修改成功�?);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('�?修改失败: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '800px' }}>
      <h3 className="mb-4">个人账户设置</h3>

      {/* 账户信息卡片 */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="fas fa-user-circle me-2"></i>
            账户信息
          </h5>
        </div>
        <div className="card-body">
          <div className="mb-2">
            <label className="text-muted small">用户�?/label>
            <div className="fw-bold">{userInfo.username}</div>
          </div>
        </div>
      </div>

      {/* 基本信息设置 */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-id-card me-2"></i>
            基本信息
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleUpdateBasicInfo}>
            <div className="mb-3">
              <label className="form-label">显示名称</label>
              <input
                type="text"
                className="form-control"
                value={basicForm.displayName}
                onChange={(e) => setBasicForm({ ...basicForm, displayName: e.target.value })}
                placeholder="输入您的显示名称"
              />
              <small className="text-muted">这个名称将显示在系统�?/small>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">手机号码</label>
                <input
                  type="tel"
                  className="form-control"
                  value={basicForm.phone}
                  onChange={(e) => setBasicForm({ ...basicForm, phone: e.target.value })}
                  placeholder="输入您的手机�?
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">邮箱</label>
                <input
                  type="email"
                  className="form-control"
                  value={basicForm.email}
                  onChange={(e) => setBasicForm({ ...basicForm, email: e.target.value })}
                  placeholder="输入您的邮箱"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">微信�?/label>
                <input
                  type="text"
                  className="form-control"
                  value={basicForm.wechat}
                  onChange={(e) => setBasicForm({ ...basicForm, wechat: e.target.value })}
                  placeholder="输入您的微信�?
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">QQ�?/label>
                <input
                  type="text"
                  className="form-control"
                  value={basicForm.qq}
                  onChange={(e) => setBasicForm({ ...basicForm, qq: e.target.value })}
                  placeholder="输入您的QQ�?
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '保存�?..' : '保存基本信息'}
            </button>
          </form>
        </div>
      </div>

      {/* 密码修改 */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-key me-2"></i>
            修改密码
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleChangePassword}>
            <div className="mb-3">
              <label className="form-label">当前密码 *</label>
              <input
                type="password"
                className="form-control"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="请输入当前密�?
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">新密�?*</label>
              <input
                type="password"
                className="form-control"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="请输入新密码（至�?位）"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">确认新密�?*</label>
              <input
                type="password"
                className="form-control"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="再次输入新密�?
                required
              />
            </div>
            <button type="submit" className="btn btn-warning" disabled={loading}>
              {loading ? '修改�?..' : '修改密码'}
            </button>
          </form>
        </div>
      </div>

      {/* 权限信息已隐�?- 员工不显示权限详�?*/}

      {/* 消息提示 */}
      {message && (
        <div className={`alert ${message.includes('成功') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      {/* 安全提示 */}
      <div className="alert alert-info">
        <h6 className="alert-heading">
          <i className="fas fa-info-circle me-2"></i>
          安全提示
        </h6>
        <ul className="mb-0 small">
          <li>请定期修改密码，保护账户安全</li>
          <li>密码长度建议至少8位，包含字母和数�?/li>
          <li>不要与他人共享您的账户密�?/li>
          <li>如发现账户异常，请立即联系管理员</li>
        </ul>
      </div>
    </div>
  );
}

export default AccountSettings;

