// FAQManager.js
// FAQ管理组件
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { buildApiUrl } from './config';
import ManagerLayout from './components/ManagerLayout';

function FAQManager({ token }) {
  const [faqs, setFaqs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '', order: 0, visible: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(buildApiUrl('/api/faqs'));
      setFaqs(response.data);
    } catch (error) {
      console.error('获取FAQ失败:', error);
      setError('获取FAQ列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleAdd = () => {
    setEditing(null);
    setForm({ question: '', answer: '', order: 0, visible: true });
    setShowForm(true);
    setError('');
  };

  const handleEdit = (faq) => {
    setEditing(faq._id);
    setForm({ question: faq.question, answer: faq.answer, order: faq.order, visible: faq.visible });
    setShowForm(true);
    setError('');
  };
  
  const handleDelete = async (id) => {
    if(window.confirm('确定删除这个FAQ吗？此操作不可撤销。')){
      try {
        setSaving(true);
        await axios.delete(buildApiUrl(`/api/faqs/${id}`), { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        await fetchFaqs();
        setError('');
      } catch (error) {
        console.error('删除失败:', error);
        setError('删除失败，请重试');
      } finally {
        setSaving(false);
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      if(editing){
        await axios.put(buildApiUrl(`/api/faqs/${editing}`), form, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      }else{
        await axios.post(buildApiUrl('/api/faqs'), form, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      }
      setEditing(null);
      setForm({ question: '', answer: '', order: 0, visible: true });
      setShowForm(false);
      await fetchFaqs();
    } catch(err) {
      console.error('操作失败:', err);
      setError('操作失败，请检查网络连接或重试');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ question: '', answer: '', order: 0, visible: true });
    setShowForm(false);
    setError('');
  };

  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  return (
    <div className="compact-manager">
      <ManagerLayout 
        title="常见问题管理" 
        subtitle="管理用户常见问题，支持排序和显示控制"
      >
        {/* 新增FAQ按钮 */}
        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            ➕ 新增FAQ
          </button>
        </div>

        {/* FAQ列表 */}
        <div className="list-section mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="section-title mb-0">FAQ列表</h4>
            <div className="text-muted">
              共 {faqs.length} 个FAQ
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">加载中...</span>
              </div>
              <div className="mt-3 text-muted">正在加载FAQ列表...</div>
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted mb-3">
                <span style={{ fontSize: '3rem', opacity: 0.3 }}>❓</span>
              </div>
              <h5 className="text-muted">暂无FAQ</h5>
              <p className="text-muted">点击上方"新增FAQ"按钮添加第一个FAQ</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover faq-table">
                <thead className="table-light">
                  <tr>
                    <th className="fw-bold question-cell">问题</th>
                    <th className="fw-bold answer-cell">答案</th>
                    <th className="fw-bold text-center order-cell">排序</th>
                    <th className="fw-bold text-center visible-cell">显示</th>
                    <th className="fw-bold text-center action-cell">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.map(faq => (
                    <tr key={faq._id}>
                      <td className="fw-bold question-cell">
                        <div className="d-flex align-items-center">
                          <span className="me-2">❓</span>
                          <span style={{ wordBreak: 'break-word' }}>{faq.question}</span>
                        </div>
                      </td>
                      <td className="answer-cell">
                        <div 
                          className="text-truncate" 
                          title={faq.answer}
                          style={{ 
                            maxWidth: '100%',
                            wordBreak: 'break-word',
                            lineHeight: '1.4'
                          }}
                        >
                          {truncateText(faq.answer, 60)}
                        </div>
                      </td>
                      <td className="text-center order-cell">
                        <span className="badge bg-secondary">{faq.order}</span>
                      </td>
                      <td className="text-center visible-cell">
                        {faq.visible ? (
                          <span className="badge bg-success">是</span>
                        ) : (
                          <span className="badge bg-secondary">否</span>
                        )}
                      </td>
                      <td className="text-center action-cell">
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-sm btn-outline-primary me-1" 
                            onClick={() => handleEdit(faq)}
                            title="编辑"
                            style={{ minWidth: '60px' }}
                          >
                            编辑
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => handleDelete(faq._id)}
                            title="删除"
                            style={{ minWidth: '60px' }}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 新增/编辑FAQ表单（条件显示） */}
        {showForm && (
          <div className="form-section">
            <h4 className="section-title mb-4">
              {editing ? (
                <span>
                  ✏️ 编辑FAQ
                </span>
              ) : (
                <span>
                  ➕ 新增FAQ
                </span>
              )}
            </h4>
            
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                ⚠️ {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="form-container">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  问题 <span className="text-danger">*</span>
                </label>
                <input 
                  className="form-control form-control-lg" 
                  placeholder="请输入问题，例如：如何申请签证？" 
                  value={form.question} 
                  onChange={e => setForm({...form, question: e.target.value})} 
                  required 
                  disabled={saving}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">
                  答案 <span className="text-danger">*</span>
                </label>
                <textarea 
                  className="form-control form-control-lg" 
                  placeholder="请输入详细答案..." 
                  value={form.answer} 
                  onChange={e => setForm({...form, answer: e.target.value})} 
                  rows="6"
                  required 
                  disabled={saving}
                />
                <div className="form-text">
                  建议答案详细完整，帮助用户解决问题
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">排序</label>
                    <input 
                      className="form-control form-control-lg" 
                      type="number" 
                      placeholder="数字越小越靠前" 
                      value={form.order} 
                      onChange={e => setForm({...form, order: Number(e.target.value)})} 
                      disabled={saving}
                    />
                    <div className="form-text">
                      数字越小，显示越靠前
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <div className="form-check mt-4">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={form.visible} 
                        onChange={e => setForm({...form, visible: e.target.checked})} 
                        id="faqVisible" 
                        disabled={saving}
                      />
                      <label className="form-check-label fw-bold" htmlFor="faqVisible">
                        👁️ 显示此FAQ
                      </label>
                      <div className="form-text">
                        取消勾选将隐藏此FAQ
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <button 
                  className="btn btn-primary btn-lg me-2" 
                  type="submit"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      {editing ? '保存中...' : '添加中...'}
                    </>
                  ) : (
                    <>
                      {editing ? '💾 ' : '➕ '}
                      {editing ? '保存修改' : '新增FAQ'}
                    </>
                  )}
                </button>
                
                <button 
                  className="btn btn-secondary btn-lg" 
                  type="button" 
                  onClick={handleCancel}
                  disabled={saving}
                >
                  ❌ 取消
                </button>
              </div>
            </form>
          </div>
        )}
      </ManagerLayout>
    </div>
  );
}

export default FAQManager; 