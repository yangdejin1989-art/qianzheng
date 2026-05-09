import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BlacklistManager.css';

const BlacklistManager = () => {
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    value: '',
    type: 'ip',
    reason: '',
    expiresAt: '',
    notes: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // 获取黑名单列表
  const fetchBlacklist = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`/api/blacklist?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlacklist(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('获取黑名单失败:', error);
      setMessage('获取黑名单失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加到黑名单
  const addToBlacklist = async (e) => {
    e.preventDefault();
    
    if (!formData.value || !formData.reason) {
      setMessage('请填写完整信息');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('/api/blacklist', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('已添加到黑名单');
      setShowAddForm(false);
      setFormData({ value: '', type: 'ip', reason: '', expiresAt: '', notes: '' });
      fetchBlacklist(1);
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('添加到黑名单失败:', error);
      setMessage(error.response?.data?.message || '添加失败');
    }
  };

  // 从黑名单移除
  const removeFromBlacklist = async (id) => {
    if (!window.confirm('确定要从黑名单中移除吗？')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/blacklist/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('已从黑名单移除');
      fetchBlacklist(pagination.page);
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('从黑名单移除失败:', error);
      setMessage('移除失败');
    }
  };

  // 处理表单变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 格式化时间
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // 检查是否过期
  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  // 组件加载时获取数据
  useEffect(() => {
    fetchBlacklist();
  }, []);

  return (
    <div className="blacklist-manager">
      <div className="blacklist-header">
        <h2>🛡️ 黑名单管理</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '取消' : '添加黑名单'}
        </button>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className="alert alert-info">
          {message}
        </div>
      )}

      {/* 添加黑名单表单 */}
      {showAddForm && (
        <div className="add-blacklist-form">
          <h4>添加黑名单</h4>
          <form onSubmit={addToBlacklist}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>类型</label>
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleFormChange}
                    className="form-control"
                  >
                    <option value="ip">IP地址</option>
                    <option value="email">邮箱</option>
                    <option value="phone">手机号</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>值</label>
                  <input
                    type="text"
                    name="value"
                    value={formData.value}
                    onChange={handleFormChange}
                    className="form-control"
                    placeholder={`请输入${formData.type === 'ip' ? 'IP地址' : formData.type === 'email' ? '邮箱' : '手机号'}`}
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>封禁原因</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleFormChange}
                className="form-control"
                placeholder="请输入封禁原因"
              />
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>过期时间（可选）</label>
                  <input
                    type="datetime-local"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleFormChange}
                    className="form-control"
                  />
                  <small className="text-muted">留空表示永久封禁</small>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>备注</label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    className="form-control"
                    placeholder="备注信息（可选）"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">添加</button>
              <button 
                type="button" 
                className="btn btn-secondary ms-2"
                onClick={() => setShowAddForm(false)}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 黑名单列表 */}
      <div className="blacklist-table">
        <h4>黑名单列表</h4>
        
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">加载中...</span>
            </div>
          </div>
        ) : blacklist.length === 0 ? (
          <div className="text-center text-muted">
            暂无黑名单记录
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>类型</th>
                  <th>值</th>
                  <th>原因</th>
                  <th>封禁时间</th>
                  <th>过期时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {blacklist.map(item => (
                  <tr key={item._id}>
                    <td>
                      <span className={`badge bg-${item.type === 'ip' ? 'danger' : item.type === 'email' ? 'warning' : 'info'}`}>
                        {item.type === 'ip' ? 'IP' : item.type === 'email' ? '邮箱' : '手机'}
                      </span>
                    </td>
                    <td>
                      <code>{item.value}</code>
                    </td>
                    <td>{item.reason}</td>
                    <td>{formatDate(item.bannedAt)}</td>
                    <td>
                      {item.expiresAt ? (
                        <span className={isExpired(item.expiresAt) ? 'text-danger' : 'text-success'}>
                          {formatDate(item.expiresAt)}
                        </span>
                      ) : (
                        <span className="text-danger">永久</span>
                      )}
                    </td>
                    <td>
                      {isExpired(item.expiresAt) ? (
                        <span className="badge bg-secondary">已过期</span>
                      ) : (
                        <span className="badge bg-danger">封禁中</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromBlacklist(item._id)}
                        title="从黑名单移除"
                      >
                        移除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* 分页 */}
        {pagination.pages > 1 && (
          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => fetchBlacklist(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  上一页
                </button>
              </li>
              <li className="page-item">
                <span className="page-link">
                  第 {pagination.page} 页，共 {pagination.pages} 页
                </span>
              </li>
              <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => fetchBlacklist(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  下一页
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default BlacklistManager;
