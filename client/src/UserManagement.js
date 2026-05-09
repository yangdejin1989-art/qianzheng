import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl } from './config';

const PERMISSIONS = {
  orderManagement: '订单管理',
  packageManagement: '套餐管理',
  templateManagement: '模板管理',
  blacklistManagement: '黑名单管理',
  faqManagement: '常见问题管理',
  noticeManagement: '公告管理',
  userManagement: '用户管理'
};

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    displayName: '',
    phone: '',
    email: '',
    wechat: '',
    qq: '',
    permissions: {
      orderManagement: false,
      packageManagement: false,
      templateManagement: false,
      blacklistManagement: false,
      faqManagement: false,
      noticeManagement: false,
      userManagement: false
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(buildApiUrl('/api/admin/users'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      alert('获取用户列表失败: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      displayName: '',
      phone: '',
      email: '',
      wechat: '',
      qq: '',
      permissions: {
        orderManagement: true, // 默认给订单管理权限
        packageManagement: false,
        templateManagement: false,
        blacklistManagement: false,
        faqManagement: false,
        noticeManagement: false,
        userManagement: false
      }
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      displayName: user.displayName || '',
      phone: user.phone || '',
      email: user.email || '',
      wechat: user.wechat || '',
      qq: user.qq || '',
      permissions: user.permissions || {}
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingUser && !formData.password) {
      alert('请输入密码');
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      
      if (editingUser) {
        // 更新
        const updateData = {
          displayName: formData.displayName,
          phone: formData.phone,
          email: formData.email,
          wechat: formData.wechat,
          qq: formData.qq,
          permissions: formData.permissions
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await axios.put(buildApiUrl(`/api/admin/users/${editingUser.id}`), updateData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('更新成功！');
      } else {
        // 创建
        await axios.post(buildApiUrl('/api/admin/users'), formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('创建成功！');
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert('操作失败: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('确定要删除这个员工账户吗？')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(buildApiUrl(`/api/admin/users/${userId}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('删除成功！');
      fetchUsers();
    } catch (err) {
      alert('删除失败: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleActive = async (user) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(buildApiUrl(`/api/admin/users/${user.id}`), {
        isActive: !user.isActive
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert('操作失败: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>用户管理</h3>
        <button className="btn btn-primary" onClick={handleCreate}>
          <i className="fas fa-plus me-2"></i>创建员工账户
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>用户名</th>
                <th>显示名称</th>
                <th>角色</th>
                <th>权限</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.displayName}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-info'}`}>
                      {user.role === 'admin' ? '管理员' : '员工'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {Object.entries(user.permissions || {}).map(([key, value]) => 
                        value && (
                          <span key={key} className="badge bg-success" style={{ fontSize: '0.7rem' }}>
                            {PERMISSIONS[key]}
                          </span>
                        )
                      )}
                      {user.role === 'admin' && <span className="badge bg-warning text-dark" style={{ fontSize: '0.7rem' }}>全部权限</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {user.isActive ? '激活' : '禁用'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-outline-primary" 
                        onClick={() => handleEdit(user)}
                      >
                        编辑
                      </button>
                      {user.role !== 'admin' && (
                        <>
                          <button 
                            className={`btn btn-outline-${user.isActive ? 'warning' : 'success'}`}
                            onClick={() => toggleActive(user)}
                          >
                            {user.isActive ? '禁用' : '激活'}
                          </button>
                          <button 
                            className="btn btn-outline-danger" 
                            onClick={() => handleDelete(user.id)}
                          >
                            删除
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 创建/编辑模态框 */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? (editingUser.role === 'admin' ? '编辑管理员信息' : '编辑员工') : '创建员工账户'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">用户名*</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={!!editingUser}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">显示名称</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="输入显示名称"
                    />
                  </div>

                  {/* 联系方式 */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">手机号码</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="输入手机号"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">邮箱</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="输入邮箱"
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">微信号</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.wechat}
                        onChange={(e) => setFormData({ ...formData, wechat: e.target.value })}
                        placeholder="输入微信号"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">QQ号</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.qq}
                        onChange={(e) => setFormData({ ...formData, qq: e.target.value })}
                        placeholder="输入QQ号"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">密码{editingUser ? '（留空则不修改）' : '*'}</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      placeholder={editingUser ? '留空则不修改密码' : '设置登录密码'}
                    />
                  </div>

                  {/* 权限设置 - 只对非管理员显示 */}
                  {(!editingUser || editingUser.role !== 'admin') && (
                  <div className="mb-3">
                    <label className="form-label d-block">权限设置</label>
                    {Object.entries(PERMISSIONS).map(([key, label]) => (
                      <div key={key} className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={key}
                          checked={formData.permissions[key]}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              [key]: e.target.checked
                            }
                          })}
                        />
                        <label className="form-check-label" htmlFor={key}>
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    取消
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? '保存' : '创建'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;

