// NoticeManager.js
// 公告栏管理组�?import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ManagerLayout from './components/ManagerLayout';

function NoticeManager({ token }) {
  const [notices, setNotices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', visible: true });
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchNotices = () => {
    axios.get('/api/notices').then(res => setNotices(res.data));
  };
  useEffect(fetchNotices, []);

  const handleAdd = () => {
    setEditing(null);
    setForm({ title: '', content: '', visible: true });
    setShowForm(true);
    setError('');
  };

  const handleEdit = (notice) => {
    setEditing(notice._id);
    setForm({ title: notice.title, content: notice.content, visible: notice.visible });
    setShowForm(true);
    setError('');
  };
  
  const handleDelete = async (id) => {
    if(window.confirm('确定删除�?)){
      await axios.delete(`/api/notices/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchNotices();
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if(editing){
        await axios.put(`/api/notices/${editing}`, form, { headers: { Authorization: `Bearer ${token}` } });
      }else{
        await axios.post('/api/notices', form, { headers: { Authorization: `Bearer ${token}` } });
      }
      setEditing(null);
      setForm({ title: '', content: '', visible: true });
      setShowForm(false);
      fetchNotices();
    }catch(err){
      setError('操作失败');
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ title: '', content: '', visible: true });
    setShowForm(false);
    setError('');
  };
  
  return (
    <div className="compact-manager">
      <ManagerLayout title="公告栏管�? subtitle="管理公告栏内�? >
        {/* 新增公告按钮 */}
        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            📢 新增公告
          </button>
        </div>

        {/* 公告列表 */}
        <div className="list-section mb-4">
          <h4 className="section-title mb-3">公告列表</h4>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th className="fw-bold">标题</th>
                  <th className="fw-bold">内容</th>
                  <th className="fw-bold">显示</th>
                  <th className="fw-bold">操作</th>
                </tr>
              </thead>
              <tbody>
                {notices.map(notice => (
                  <tr key={notice._id}>
                    <td className="fw-bold">{notice.title}</td>
                    <td>
                      <div className="text-truncate" style={{maxWidth: '300px'}}>
                        {notice.content}
                      </div>
                    </td>
                    <td>
                      {notice.visible ? (
                        <span className="badge bg-success">�?/span>
                      ) : (
                        <span className="badge bg-secondary">�?/span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={()=>handleEdit(notice)}>
                        编辑
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDelete(notice._id)}>
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 新增/编辑公告表单（条件显示） */}
        {showForm && (
          <div className="form-section">
            <h4 className="section-title mb-4">{editing ? '编辑公告' : '新增公告'}</h4>
            <form onSubmit={handleSubmit} className="form-container">
              <div className="mb-3">
                <label className="form-label fw-bold">标题 *</label>
                <input 
                  className="form-control form-control-lg" 
                  placeholder="请输入公告标�? 
                  value={form.title} 
                  onChange={e=>setForm({...form, title: e.target.value})} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">内容 *</label>
                <textarea 
                  className="form-control form-control-lg" 
                  placeholder="请输入公告内�? 
                  value={form.content} 
                  onChange={e=>setForm({...form, content: e.target.value})} 
                  rows="6"
                  required 
                />
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    checked={form.visible} 
                    onChange={e=>setForm({...form, visible: e.target.checked})} 
                    id="noticeVisible" 
                  />
                  <label className="form-check-label fw-bold" htmlFor="noticeVisible">
                    显示此公�?                  </label>
                </div>
              </div>
              <div className="mb-3">
                <button className="btn btn-primary btn-lg me-2" type="submit">
                  {editing ? '保存修改' : '新增公告'}
                </button>
                <button 
                  className="btn btn-secondary btn-lg" 
                  type="button" 
                  onClick={handleCancel}
                >
                  取消
                </button>
                {error && <span className="text-danger ms-3">{error}</span>}
              </div>
            </form>
          </div>
        )}
      </ManagerLayout>
    </div>
  );
}

export default NoticeManager; 
