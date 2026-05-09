import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { buildApiUrl } from './config';
import ApplicationDetail from './ApplicationDetail';
import './ApplicationManager.css';

const ApplicationManager = forwardRef(({ token, subTab, currentUser }, ref) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [packages, setPackages] = useState([]);
  
  // 员工管理相关状�?  const [staffList, setStaffList] = useState([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigningApplicationId, setAssigningApplicationId] = useState(null);
  const [assigningToStaffId, setAssigningToStaffId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // 批量删除相关状�?  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  const [detailId, setDetailId] = useState(null);
  const [filter, setFilter] = useState({
    name: '',
    phone: '',
    applyCode: '',
    status: '',
    networkType: '',
    package: '',
    installStartDate: '',
    installEndDate: '',
    startDate: '',
    endDate: '',
    assignedTo: '' // 新增：负责人筛�?  });

  // 获取套餐列表
  const fetchPackages = async () => {
    try {
      const res = await axios.get(buildApiUrl('/api/packages'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPackages(res.data);
    } catch (err) {
      console.error('获取套餐列表失败:', err);
    }
  };
  
  // 获取员工列表（仅管理员）
  const fetchStaffList = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    try {
      const res = await axios.get(buildApiUrl('/api/admin/staff'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStaffList(res.data.data || []);
    } catch (err) {
      console.error('获取员工列表失败:', err);
    }
  };

  // 根据subTab自动设置状态过滤并查询
  useEffect(() => {
    const statusMap = {
      'all': '',
      'pending': '待处�?,
      'confirm': '待确�?,
      'processing': '处理�?,
      'done': '已完�?,
      'cancel': '已取�?
    };
    
    const newStatus = statusMap[subTab] || '';
    
    // 更新filter状�?    setFilter(prev => ({
      ...prev,
      status: newStatus
    }));
    
    // 直接使用新的状态值进行查询，而不是依赖filter状�?    fetchListWithStatus(newStatus);
  }, [subTab]);

  // 组件加载时获取套餐列表、员工列表和初始数据
  useEffect(() => {
    fetchPackages();
    fetchStaffList(); // 获取员工列表（仅管理员）
    fetchList(); // 初始加载数据
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = { ...filter };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      // 确保状态参数被正确传�?      if (filter.status !== undefined) {
        params.status = filter.status;
      }
      const res = await axios.get(buildApiUrl('/api/applications'), { 
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setList(res.data);
    } catch (err) {
      setError('获取申请列表失败');
    }
    setLoading(false);
  };

  // 使用指定状态值进行查询（用于标签页切换时的即时查询）
  const fetchListWithStatus = async (statusValue) => {
    setLoading(true);
    try {
      const params = { ...filter, status: statusValue };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      // 确保状态参数被正确传�?      if (statusValue !== undefined) {
        params.status = statusValue;
      }
      const res = await axios.get(buildApiUrl('/api/applications'), { 
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setList(res.data);
    } catch (err) {
      setError('获取申请列表失败');
    }
    setLoading(false);
  };

  // 移除自动查询，改为手动查�?  // useEffect(() => {
  //   fetchList();
  //   // eslint-disable-next-line
  // }, [filter]);



  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(f => ({ ...f, [name]: value }));
    // 移除自动查询，只有点击查询按钮时才执�?  };
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchList();
  };

  const handleClearFilter = () => {
    // 根据当前标签页设置对应的状态筛�?    const statusMap = {
      'all': '',
      'pending': '待处�?,
      'confirm': '待确�?,
      'processing': '处理�?,
      'done': '已完�?,
      'cancel': '已取�?
    };
    
    // 清空所有筛选条件，但保持当前标签页的状�?    setFilter({
      name: '',
      phone: '',
      applyCode: '',
      status: statusMap[subTab] || '', // 保持当前标签页的状态筛�?      networkType: '',
      package: '',
      installStartDate: '',
      installEndDate: '',
      startDate: '',
      endDate: '',
      assignedTo: '' // 清空负责人筛�?    });
    
    // 清空后立即查询，显示当前标签页对应的订单
    setTimeout(() => {
      fetchList();
    }, 100);
  };
  
  // 打开分配对话�?  const handleOpenAssignDialog = (applicationId, currentAssignedTo) => {
    setAssigningApplicationId(applicationId);
    setAssigningToStaffId(currentAssignedTo?._id || '');
    setAssignDialogOpen(true);
  };
  
  // 分配订单给员�?  const handleAssignOrder = async () => {
    if (!assigningApplicationId) return;
    
    try {
      setAssigning(true);
      const res = await axios.post(
        buildApiUrl(`/api/applications/${assigningApplicationId}/assign`),
        { assignedTo: assigningToStaffId || null },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (res.data.success) {
        alert(res.data.message);
        setAssignDialogOpen(false);
        setAssigningApplicationId(null);
        setAssigningToStaffId('');
        // 刷新列表
        fetchList();
      }
    } catch (err) {
      console.error('分配订单失败:', err);
      alert(err.response?.data?.message || '分配订单失败');
    } finally {
      setAssigning(false);
    }
  };



    // 暴露给父组件的方�?  useImperativeHandle(ref, () => ({
    handleSubTabChange: (newSubTab) => {
      // 如果在详情页面，返回列表页面
      if (detailId) {
        setDetailId(null);
      }
    }
  }));

  if (detailId) {
    return <ApplicationDetail id={detailId} onBack={() => {
      setDetailId(null);
      // 从详情页面返回时刷新列表数据
      fetchList();
    }} />;
  }

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <style>
        {`
          .table-sm td, .table-sm th {
            padding: 0.5rem;
            font-size: 0.875rem;
          }
          .text-truncate {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .text-primary:hover {
            color: #0056b3 !important;
            text-decoration: none !important;
          }
          .application-table-container { 
            width: 100%; 
            max-width: 100%;
            height: 100%;
          }
          .application-table-container table { 
            width: 100%; 
            border-collapse: collapse;
          }
          .application-table-container th,
          .application-table-container td {
            border: 1px solid #000 !important;
          }
          .creation-time {
            text-align: center;
            font-weight: 500;
          }
          /* 优化日期选择�?*/
          input[type="date"] {
            cursor: pointer;
            position: relative;
            text-align: center;
            font-size: 0.8rem;
            color: #333;
          }
          input[type="date"]::-webkit-datetime-edit-fields-wrapper {
            display: block;
          }
          input[type="date"]::-webkit-datetime-edit {
            display: block;
            text-align: center;
          }
          input[type="date"]::-webkit-calendar-picker-indicator {
            position: absolute;
            right: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            color: transparent;
            cursor: pointer;
            border: none;
            outline: none;
            z-index: 1;
          }
          input[type="date"]::-webkit-calendar-picker-indicator:hover {
            background: rgba(0,0,0,0.05);
          }
          input[type="date"]:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
          }
        `}
      </style>
      
      {/* 固定的查询筛选区�?*/}
      <div style={{ padding: '6px 0 8px 0', background: '#fff', zIndex: 20, width: '100%' }}>
        <h5 style={{ marginBottom: '6px', fontSize: '0.9rem' }}>订单申请管理</h5>
        <form onSubmit={handleFilterSubmit} style={{ fontSize: '0.75rem' }}>
          {/* 第一行：所有筛选条�?*/}
          <div className="row g-1 align-items-end mb-1">
            <div className="col-auto">
              <input className="form-control form-control-sm" name="name" value={filter.name} onChange={handleFilterChange} placeholder="姓名" style={{ width: '70px', fontSize: '0.75rem', padding: '3px 6px' }} />
            </div>
            <div className="col-auto">
              <input className="form-control form-control-sm" name="phone" value={filter.phone} onChange={handleFilterChange} placeholder="手机�? style={{ width: '95px', fontSize: '0.75rem', padding: '3px 6px' }} />
            </div>
            <div className="col-auto">
              <input className="form-control form-control-sm" name="applyCode" value={filter.applyCode} onChange={handleFilterChange} placeholder="申请编码" style={{ width: '110px', fontSize: '0.75rem', padding: '3px 6px' }} />
            </div>
            {subTab === 'all' && (
              <div className="col-auto">
                <select className="form-select form-select-sm" name="status" value={filter.status} onChange={handleFilterChange} style={{ width: '95px', fontSize: '0.75rem', padding: '3px 6px' }}>
                  <option value="">全部状�?/option>
                  <option value="待处�?>待处�?/option>
                  <option value="待确�?>待确�?/option>
                  <option value="处理�?>处理�?/option>
                  <option value="已完�?>已完�?/option>
                  <option value="已取�?>已取�?/option>
                </select>
              </div>
            )}
            <div className="col-auto">
              <select className="form-select form-select-sm" name="networkType" value={filter.networkType} onChange={handleFilterChange} style={{ width: '95px', fontSize: '0.75rem', padding: '3px 6px' }}>
                <option value="">办理方式</option>
                <option value="普通办�?>普通办�?/option>
                <option value="加急办�?>加急办�?/option>
                <option value="特急办�?>特急办�?/option>
              </select>
            </div>
            <div className="col-auto">
              <select className="form-select form-select-sm" name="package" value={filter.package} onChange={handleFilterChange} style={{ width: '100px', fontSize: '0.75rem', padding: '3px 6px' }}>
                <option value="">签证类型</option>
                {packages.map(pkg => (
                  <option key={pkg._id} value={pkg.name}>{pkg.name}</option>
                ))}
              </select>
            </div>
            {currentUser && currentUser.role === 'admin' && (
              <div className="col-auto">
                <select className="form-select form-select-sm" name="assignedTo" value={filter.assignedTo} onChange={handleFilterChange} style={{ width: '100px', fontSize: '0.75rem', padding: '3px 6px' }}>
                  <option value="">全部负责�?/option>
                  <option value="unassigned">未分�?/option>
                  {staffList.map(staff => (
                    <option key={staff._id} value={staff._id}>
                      {staff.displayName || staff.username}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-auto">
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: '#333', fontWeight: '500' }}>创建日期:</span>
                <input type="date" className="form-control form-control-sm" name="startDate" value={filter.startDate} onChange={handleFilterChange} style={{ width: '90px', fontSize: '0.7rem', padding: '3px 6px' }} />
                <span style={{ fontSize: '0.7rem', color: '#666' }}>-</span>
                <input type="date" className="form-control form-control-sm" name="endDate" value={filter.endDate} onChange={handleFilterChange} style={{ width: '90px', fontSize: '0.7rem', padding: '3px 6px' }} />
              </div>
            </div>
          </div>
          
          {/* 第二行：只有操作按钮 */}
          <div className="row g-1 align-items-end mb-1">
            <div className="col-auto">
              <button type="submit" className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>查询</button>
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleClearFilter} style={{ fontSize: '0.75rem', padding: '3px 10px' }}>清空</button>
            </div>
          </div>
        </form>
      </div>

      {/* 表格容器 */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>加载�?..</div>
        </div>
      ) : (
        <div className="application-table-container" style={{ flex: 1, width: '100%', minHeight: '500px', fontSize: '0.75rem' }}>
          <table className="table table-bordered table-hover align-middle" style={{ tableLayout: 'fixed', width: '100%', margin: 0 }}>
            <thead className="table-light" style={{ fontSize: '0.72rem' }}>
              <tr>
                {selectMode && (
                  <th style={{ width: '35px', textAlign: 'center', padding: '4px' }}>
                    <input
                      type="checkbox"
                      aria-label="全�?
                      checked={list.length > 0 && selectedIds.size === list.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(new Set(list.map(item => item._id)));
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                    />
                  </th>
                )}
                <th style={{ width: '75px', textAlign: 'center', padding: '4px 2px' }}>创建时间</th>
                <th style={{ width: '130px', padding: '4px 6px' }}>申请编码</th>
                <th style={{ width: '65px', padding: '4px 4px' }}>姓名</th>
                <th style={{ width: '105px', padding: '4px 4px' }}>手机�?/th>
                <th style={{ width: '95px', padding: '4px 4px' }}>微信/LINE</th>
                <th style={{ width: '70px', padding: '4px 4px' }}>办理方式</th>
                <th style={{ width: '95px', padding: '4px 4px' }}>签证类型</th>
                <th style={{ width: '65px', textAlign: 'center', padding: '4px 2px' }}>状�?/th>
                <th style={{ width: '70px', textAlign: 'center', padding: '4px 2px' }}>负责�?/th>
                <th style={{ width: '150px', padding: '4px 6px' }}>反馈</th>
                <th style={{ width: currentUser && currentUser.role === 'admin' ? '105px' : '75px', textAlign: 'center', padding: '4px 2px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map(item => (
                <tr key={item._id} style={{ height: '48px' }}>
                  {selectMode && (
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '4px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item._id)}
                        onChange={(e) => {
                          setSelectedIds(prev => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(item._id); else next.delete(item._id);
                            return next;
                          });
                        }}
                      />
                    </td>
                  )}
                  <td className="creation-time" style={{ fontSize: '0.7rem', whiteSpace: 'nowrap', verticalAlign: 'middle', padding: '4px 2px' }}>
                    {item.createdAt ? `${new Date(item.createdAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })} ${new Date(item.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}` : '-'}
                  </td>
                  <td style={{ verticalAlign: 'middle', padding: '4px 6px' }}>
                    <div className="text-truncate" style={{ maxWidth: '130px' }} title={item.applyCode}>
                      <span className="text-primary fw-medium" style={{ cursor: 'pointer', textDecoration: 'underline', userSelect: 'text' }} onClick={() => setDetailId(item._id)}>
                        {item.applyCode}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '4px 4px', verticalAlign: 'middle', height: '48px' }}>
                    {(() => {
                      // 合并所有姓名（主申请人 + 同行人）
                      const allNames = [item.name, ...(item.companions || [])].filter(name => name && name.trim());
                      const fullNamesText = allNames.join('�?);
                      
                      // 构建显示行数，根据实际人数动态显�?                      const rows = [];
                      if (allNames.length === 0) {
                        // 没有姓名
                        rows.push('');
                      } else if (allNames.length === 1) {
                        // 1个人：只显示1�?                        rows.push(allNames[0]);
                      } else if (allNames.length === 2) {
                        // 2个人：显�?�?                        rows.push(allNames[0], allNames[1]);
                      } else if (allNames.length === 3) {
                        // 3个人：显�?�?                        rows.push(allNames[0], allNames[1], allNames[2]);
                      } else {
                        // 4个人及以上：显示�?个姓名，�?行显示省略信�?                        rows.push(allNames[0], allNames[1], `... (+${allNames.length - 2}�?`);
                      }
                      
                      return (
                        <div 
                          style={{ 
                            maxWidth: '65px',
                            fontSize: '0.75rem',
                            lineHeight: '1.4',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center', // 整个姓名块在单元格中居中
                            alignItems: 'flex-start',
                            height: '100%'
                          }} 
                          title={fullNamesText}
                        >
                          {rows.map((name, index) => (
                            <div
                              key={index}
                              style={{
                                height: '14px',
                                lineHeight: '1.4',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                color: name.startsWith('...') ? '#666' : 'inherit',
                                fontSize: name.startsWith('...') ? '0.7rem' : '0.75rem',
                                width: '100%'
                              }}
                            >
                              {name}
                            </div>
                      ))}
                    </div>
                      );
                    })()}
                  </td>
                  <td style={{ verticalAlign: 'middle', textAlign: 'center', padding: '4px 4px' }}>{item.phone}</td>
                  <td style={{ verticalAlign: 'middle', padding: '4px 4px' }}>
                    <div className="text-truncate" style={{ maxWidth: '95px', lineHeight: '1.2' }} title={(item.wechat || item.line) ? `微信:${item.wechat || '�?} LINE:${item.line || '�?}` : '-'}>
                      {item.wechat && <div style={{ fontSize: '0.7rem' }}>�? {item.wechat}</div>}
                      {item.line && <div style={{ fontSize: '0.7rem' }}>L: {item.line}</div>}
                      {!item.wechat && !item.line && '-'}
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle', padding: '4px 4px' }}>
                    <div className="text-truncate" style={{ maxWidth: '70px' }} title={item.networkType || '-' }>
                      {item.networkType || '-'}
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle', padding: '4px 4px' }}>
                    <div className="text-truncate" style={{ maxWidth: '95px' }} title={item.package}>
                      {item.package}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '4px 2px' }}>
                    <span className={`badge ${item.status === '已完�? ? 'bg-success' : item.status === '已取�? ? 'bg-secondary' : 'bg-warning text-dark'}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{item.status}</span>
                  </td>
                  <td style={{ verticalAlign: 'middle', textAlign: 'center', padding: '4px 2px' }}>
                    <div className="text-truncate" style={{ maxWidth: '70px' }} title={item.assignedTo ? (item.assignedTo.displayName || item.assignedTo.username) : '未分�?}>
                      {item.assignedTo ? (
                        <span className="badge bg-info text-dark" style={{ fontSize: '0.68rem', padding: '2px 4px' }}>
                          {item.assignedTo.displayName || item.assignedTo.username}
                        </span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>未分�?/span>
                      )}
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle', padding: '4px 6px' }}>
                    <div className="text-truncate" style={{ maxWidth: '150px' }} title={item.feedback || '-' }>
                      {item.feedback || '-'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '3px 2px' }}>
                    <div className="d-flex gap-1 justify-content-center flex-wrap">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setDetailId(item._id)} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>详情</button>
                      {currentUser && currentUser.role === 'admin' && (
                        <button 
                          className="btn btn-sm btn-outline-success" 
                          onClick={() => handleOpenAssignDialog(item._id, item.assignedTo)}
                          style={{ fontSize: '0.68rem', padding: '2px 8px' }}
                        >
                          分配
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {/* 右下角浮动操作区 */}
      <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'flex', gap: 8, zIndex: 1000 }}>
        {!selectMode ? (
          <button
            type="button"
            className="btn btn-danger shadow"
            onClick={() => { setSelectMode(true); setSelectedIds(new Set()); }}
          >
            删除订单
          </button>
        ) : (
          <>
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }}
                disabled={deleting}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={selectedIds.size === 0 || deleting}
                onClick={async () => {
                  if (selectedIds.size === 0) return;
                  if (!window.confirm(`确认删除选中�?${selectedIds.size} 条订单吗？`)) return;
                  try {
                    setDeleting(true);
                    console.log('开始删除订单，选中的ID:', Array.from(selectedIds));
                    
                    // 逐个删除，避免并发问�?                    for (const id of selectedIds) {
                      try {
                        console.log('正在删除订单:', id);
                        const response = await axios.delete(buildApiUrl(`/api/applications/${id}`), {
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        });
                        console.log('删除成功:', id, response.data);
                      } catch (deleteErr) {
                        console.error('删除订单失败:', id, deleteErr);
                        const code = deleteErr.response?.data?.applyCode || '未知申请编码';
                        const msg = deleteErr.response?.data?.message || deleteErr.message;
                        throw new Error(`申请编码 ${code} 删除失败: ${msg}`);
                      }
                    }
                    
                    console.log('所有订单删除完�?);
                    // 刷新列表并退出选择模式
                    await fetchList();
                    setSelectMode(false);
                    setSelectedIds(new Set());
                    alert('删除成功�?);
                  } catch (err) {
                    console.error('批量删除失败:', err);
                    alert(`删除失败: ${err.message}`);
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                {deleting ? '删除�?..' : `确认删除 (${selectedIds.size})`}
              </button>
            </div>
          </>
        )}
      </div>

      {/* 订单分配对话�?*/}
      {assignDialogOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setAssignDialogOpen(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              minWidth: '400px',
              maxWidth: '500px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 style={{ marginBottom: '16px' }}>分配订单</h5>
            <div className="mb-3">
              <label className="form-label">选择负责人：</label>
              <select 
                className="form-select" 
                value={assigningToStaffId} 
                onChange={(e) => setAssigningToStaffId(e.target.value)}
              >
                <option value="">取消分配</option>
                {staffList.map(staff => (
                  <option key={staff._id} value={staff._id}>
                    {staff.displayName || staff.username} ({staff.role === 'admin' ? '管理�? : '员工'})
                  </option>
                ))}
              </select>
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button 
                className="btn btn-secondary" 
                onClick={() => setAssignDialogOpen(false)}
                disabled={assigning}
              >
                取消
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleAssignOrder}
                disabled={assigning}
              >
                {assigning ? '分配�?..' : '确认分配'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
});

export default ApplicationManager;
