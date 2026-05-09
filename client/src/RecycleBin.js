import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { buildApiUrl } from './config';
import ApplicationDetail from './ApplicationDetail';

function RecycleBin({ token }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailId, setDetailId] = useState(null);
  const [filter, setFilter] = useState({
    name: '',
    phone: '',
    applyCode: '',
    startDate: '',
    endDate: ''
  });

  // 获取已删除的订单列表
  const fetchDeletedList = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filter, deleted: 'true' }; // 关键：查询已删除的订单
      Object.keys(params).forEach(key => {
        if (key === 'deleted') return; // 保留deleted参数
        if (!params[key]) delete params[key];
      });
      
      const res = await axios.get(buildApiUrl('/api/applications'), { 
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setList(res.data);
    } catch (err) {
      console.error('获取已删除订单失败:', err);
      setError('获取已删除订单失败: ' + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeletedList();
  }, []);

  // 恢复订单
  const handleRestore = async (id, applyCode) => {
    if (!window.confirm(`确定要恢复订单 ${applyCode} 吗？`)) return;
    
    try {
      const res = await axios.put(
        buildApiUrl(`/api/applications/${id}/restore`),
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (res.data.success) {
        alert('订单恢复成功！');
        fetchDeletedList(); // 刷新列表
      }
    } catch (err) {
      console.error('恢复订单失败:', err);
      alert(err.response?.data?.message || '恢复订单失败');
    }
  };

  // 彻底删除订单
  const handlePermanentDelete = async (id, applyCode) => {
    if (!window.confirm(`警告：确定要彻底删除订单 ${applyCode} 吗？\n此操作不可恢复！`)) return;
    
    try {
      const res = await axios.delete(
        buildApiUrl(`/api/applications/${id}/permanent`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (res.data.success) {
        alert('订单已彻底删除！');
        fetchDeletedList(); // 刷新列表
      }
    } catch (err) {
      console.error('彻底删除订单失败:', err);
      alert(err.response?.data?.message || '彻底删除订单失败');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(f => ({ ...f, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchDeletedList();
  };

  const handleClearFilter = () => {
    setFilter({
      name: '',
      phone: '',
      applyCode: '',
      startDate: '',
      endDate: ''
    });
    setTimeout(() => {
      fetchDeletedList();
    }, 100);
  };

  // 如果在查看详情
  if (detailId) {
    return <ApplicationDetail 
      id={detailId} 
      onBack={() => {
        setDetailId(null);
        fetchDeletedList();
      }} 
    />;
  }

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <style>
        {`
          .recycle-bin-container {
            width: 100%;
            max-width: 100%;
            height: 100%;
          }
          .recycle-bin-container table {
            width: 100%;
            border-collapse: collapse;
          }
          .recycle-bin-container th,
          .recycle-bin-container td {
            border: 1px solid #000 !important;
            padding: 0.5rem;
            font-size: 0.875rem;
          }
          .text-truncate {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .creation-time {
            text-align: center;
            font-weight: 500;
          }
        `}
      </style>

      <div className="mb-3">
        <h4 className="mb-3" style={{ color: '#dc2626', fontWeight: 'bold' }}>
          🗑️ 回收站
        </h4>
        <div className="alert alert-warning" style={{ fontSize: '0.9rem' }}>
          <strong>提示：</strong>这里显示的是已删除的订单。您可以选择恢复订单或彻底删除。彻底删除后将无法恢复！
        </div>

        {/* 筛选表单 */}
        <form onSubmit={handleFilterSubmit} className="mb-3">
          <div className="row g-2">
            <div className="col-md-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="姓名"
                name="name"
                value={filter.name}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="手机号"
                name="phone"
                value={filter.phone}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="申请编码"
                name="applyCode"
                value={filter.applyCode}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control form-control-sm"
                placeholder="开始日期"
                name="startDate"
                value={filter.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control form-control-sm"
                placeholder="结束日期"
                name="endDate"
                value={filter.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary btn-sm w-100">查询</button>
            </div>
          </div>
          <div className="row g-2 mt-1">
            <div className="col-md-12">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleClearFilter}
              >
                清空筛选
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 订单列表 */}
      <div className="flex-grow-1" style={{ overflow: 'auto', border: '1px solid #dee2e6' }}>
        {loading && <div className="text-center p-4">加载中...</div>}
        {error && <div className="alert alert-danger m-3">{error}</div>}
        {!loading && !error && list.length === 0 && (
          <div className="text-center p-4" style={{ color: '#6c757d' }}>
            回收站为空
          </div>
        )}
        {!loading && !error && list.length > 0 && (
          <div className="recycle-bin-container">
            <table className="table table-sm table-hover mb-0">
              <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ width: '120px' }}>申请编码</th>
                  <th style={{ width: '100px' }}>姓名</th>
                  <th style={{ width: '120px' }}>手机号</th>
                  <th style={{ width: '150px' }}>签证类型</th>
                  <th style={{ width: '100px' }}>状态</th>
                  <th style={{ width: '150px' }}>创建时间</th>
                  <th style={{ width: '200px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {list.map(app => (
                  <tr key={app._id}>
                    <td className="text-truncate">
                      <span 
                        style={{ cursor: 'pointer', color: '#0d6efd', textDecoration: 'underline' }}
                        onClick={() => setDetailId(app._id)}
                      >
                        {app.applyCode}
                      </span>
                    </td>
                    <td className="text-truncate">{app.name}</td>
                    <td>{app.phone}</td>
                    <td className="text-truncate">{app.package || '-'}</td>
                    <td>
                      <span className="badge bg-secondary">{app.status}</span>
                    </td>
                    <td className="creation-time">
                      {new Date(app.createdAt).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleRestore(app._id, app.applyCode)}
                        style={{ fontSize: '0.75rem' }}
                      >
                        恢复
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handlePermanentDelete(app._id, app.applyCode)}
                        style={{ fontSize: '0.75rem' }}
                      >
                        彻底删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-3 text-muted" style={{ fontSize: '0.85rem' }}>
        共 {list.length} 条已删除订单
      </div>
    </div>
  );
}

export default RecycleBin;