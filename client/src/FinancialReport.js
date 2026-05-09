import React, { useState, useEffect } from 'react';
import { buildApiUrl } from './config';
import './FinancialReport.css';
import * as XLSX from 'xlsx';

const FinancialReport = ({ token, currentUser }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  
  // 筛选条件
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    assignedTo: 'all'
  });

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchStaffList();
    }
    fetchReport();
  }, []);

  const fetchStaffList = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/admin/staff'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStaffList(data.data);
      }
    } catch (error) {
      console.error('获取员工列表失败:', error);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (isAdmin && filters.assignedTo !== 'all') {
        params.append('assignedTo', filters.assignedTo);
      }

      const response = await fetch(
        buildApiUrl(`/api/financial-report?${params.toString()}`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setReportData(data);
      }
    } catch (error) {
      console.error('获取财务报表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    fetchReport();
  };

  const formatMoney = (amount) => {
    return `¥${(amount || 0).toFixed(2)}`;
  };

  const formatPercent = (rate) => {
    return `${rate}%`;
  };

  // 导出Excel报表
  const exportToExcel = () => {
    if (!reportData) return;

    // 创建工作簿
    const wb = XLSX.utils.book_new();

    // 格式化时间到秒
    const formatDateTime = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    };

    // 1. 订单明细数据
    const orderDetailsData = [
      ['订单明细'],
      [],
      ['申请时间', '申请编码', '姓名', '手机号', '办理方式', '签证类型', '办理类型', '支付时间', '支付方式', '支付金额', '支付人', '成本费用', '结算时间', '利润', '负责人']
    ];

    if (reportData.orderDetails && reportData.orderDetails.length > 0) {
      reportData.orderDetails.forEach(order => {
        // 如果有多笔支付，每笔支付占一行
        if (order.payments && order.payments.length > 0) {
          order.payments.forEach((payment, index) => {
            orderDetailsData.push([
              index === 0 ? formatDateTime(order.createdAt) : '',
              index === 0 ? order.applyCode : '',
              index === 0 ? order.applicantName : '',
              index === 0 ? order.phone : '',
              index === 0 ? order.networkType : '',
              index === 0 ? order.package : '',
              index === 0 ? order.customerType : '',
              formatDateTime(payment.paymentDate),
              payment.paymentType || '支付宝',
              payment.amount,
              payment.payerName,
              index === 0 ? order.cost : '',
              index === 0 ? formatDateTime(order.settledAt) : '',
              index === 0 ? order.profit : '',
              index === 0 ? order.assignedTo : ''
            ]);
          });
        } else {
          // 没有支付记录的订单
          orderDetailsData.push([
            formatDateTime(order.createdAt),
            order.applyCode,
            order.applicantName,
            order.phone,
            order.networkType,
            order.package,
            order.customerType,
            '',
            '',
            0,
            '',
            order.cost,
            formatDateTime(order.settledAt),
            order.profit,
            order.assignedTo
          ]);
        }
      });
    }

    const ws1 = XLSX.utils.aoa_to_sheet(orderDetailsData);
    
    // 设置列宽
    ws1['!cols'] = [
      { wch: 20 }, // 申请时间
      { wch: 15 }, // 申请编码
      { wch: 12 }, // 姓名
      { wch: 15 }, // 手机号
      { wch: 12 }, // 办理方式
      { wch: 15 }, // 签证类型
      { wch: 15 }, // 办理类型
      { wch: 20 }, // 支付时间
      { wch: 12 }, // 支付方式
      { wch: 12 }, // 支付金额
      { wch: 12 }, // 支付人
      { wch: 12 }, // 成本费用
      { wch: 20 }, // 结算时间
      { wch: 12 }, // 利润
      { wch: 12 }  // 负责人
    ];
    
    XLSX.utils.book_append_sheet(wb, ws1, '订单明细');

    // 2. 总体统计数据
    const summaryData = [
      ['财务报表汇总'],
      ['生成时间', formatDateTime(new Date())],
      ['筛选条件'],
      ['开始日期', filters.startDate || '不限'],
      ['结束日期', filters.endDate || '不限'],
      ['负责人', filters.assignedTo === 'all' ? '全部' : filters.assignedTo === 'unassigned' ? '未分配' : staffList.find(s => s._id === filters.assignedTo)?.displayName || filters.assignedTo],
      [],
      ['统计数据'],
      ['订单总数', reportData.summary.totalOrders],
      ['总收入', reportData.summary.totalIncome],
      ['总成本', reportData.summary.totalCost],
      ['净利润', reportData.summary.profit],
      ['利润率', reportData.summary.profitRate + '%'],
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
    
    // 设置列宽
    ws2['!cols'] = [
      { wch: 15 },
      { wch: 20 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws2, '财务汇总');

    // 3. 员工业绩统计（仅管理员）
    if (isAdmin && reportData.staffStats && reportData.staffStats.length > 0) {
      const staffData = [
        ['员工业绩统计'],
        [],
        ['员工', '订单数', '收入', '成本', '利润']
      ];

      reportData.staffStats.forEach(staff => {
        staffData.push([
          staff.staffName,
          staff.orderCount,
          staff.income,
          staff.cost,
          staff.profit
        ]);
      });

      // 添加合计行
      const totalOrders = reportData.staffStats.reduce((sum, s) => sum + s.orderCount, 0);
      const totalIncome = reportData.staffStats.reduce((sum, s) => sum + s.income, 0);
      const totalCost = reportData.staffStats.reduce((sum, s) => sum + s.cost, 0);
      const totalProfit = reportData.staffStats.reduce((sum, s) => sum + s.profit, 0);
      
      staffData.push([]);
      staffData.push([
        '合计',
        totalOrders,
        totalIncome,
        totalCost,
        totalProfit
      ]);

      const ws3 = XLSX.utils.aoa_to_sheet(staffData);
      
      // 设置列宽
      ws3['!cols'] = [
        { wch: 15 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws3, '员工业绩');
    }

    // 生成文件名
    const exportDate = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');
    const dateRange = `${filters.startDate || '不限'}-${filters.endDate || '至今'}`;
    let fileName;
    
    if (filters.assignedTo && filters.assignedTo !== 'all') {
      const staffName = filters.assignedTo === 'unassigned' 
        ? '未分配' 
        : staffList.find(s => s._id === filters.assignedTo)?.displayName || '员工';
      fileName = `${exportDate}_${staffName}_${dateRange}.xlsx`;
    } else {
      fileName = `${exportDate}_财务报表_${dateRange}.xlsx`;
    }

    // 导出文件
    XLSX.writeFile(wb, fileName);
  };

  if (loading && !reportData) {
    return (
      <div className="financial-report">
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">加载中...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="financial-report">
      <div className="report-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4>
          <i className="fas fa-chart-line me-2"></i>
          财务报表
        </h4>
        {reportData && (
          <button 
            className="btn btn-success btn-sm"
            onClick={exportToExcel}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <i className="fas fa-file-excel"></i>
            导出Excel报表
          </button>
        )}
      </div>

      {/* 筛选条件 */}
      <div className="filter-section card">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-3">
              <label className="form-label small">开始日期</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small">结束日期</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            {isAdmin && (
              <div className="col-md-3">
                <label className="form-label small">负责人</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.assignedTo}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                >
                  <option value="all">全部</option>
                  <option value="unassigned">未分配</option>
                  {staffList.map(staff => (
                    <option key={staff._id} value={staff._id}>
                      {staff.displayName || staff.username}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-primary btn-sm w-100"
                onClick={handleSearch}
                disabled={loading}
              >
                <i className="fas fa-search me-1"></i>
                {loading ? '查询中...' : '查询'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {reportData && (
        <>
          {/* 总体统计 */}
          <div className="summary-cards">
            <div className="row g-2">
              <div className="col-md-3">
                <div className="stat-card card">
                  <div className="card-body">
                    <div className="stat-icon bg-primary">
                      <i className="fas fa-file-invoice"></i>
                    </div>
                    <div className="stat-info">
                      <div className="stat-label">订单总数</div>
                      <div className="stat-value">{reportData.summary.totalOrders}</div>
                      <div className="stat-extra">&nbsp;</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card card">
                  <div className="card-body">
                    <div className="stat-icon bg-success">
                      <i className="fas fa-arrow-down"></i>
                    </div>
                    <div className="stat-info">
                      <div className="stat-label">总收入</div>
                      <div className="stat-value text-success">
                        {formatMoney(reportData.summary.totalIncome)}
                      </div>
                      <div className="stat-extra">&nbsp;</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card card">
                  <div className="card-body">
                    <div className="stat-icon bg-warning">
                      <i className="fas fa-arrow-up"></i>
                    </div>
                    <div className="stat-info">
                      <div className="stat-label">总成本</div>
                      <div className="stat-value text-warning">
                        {formatMoney(reportData.summary.totalCost)}
                      </div>
                      <div className="stat-extra">&nbsp;</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card card">
                  <div className="card-body">
                    <div className={`stat-icon ${reportData.summary.profit >= 0 ? 'bg-info' : 'bg-danger'}`}>
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="stat-info">
                      <div className="stat-label">净利润</div>
                      <div className={`stat-value ${reportData.summary.profit >= 0 ? 'text-info' : 'text-danger'}`}>
                        {formatMoney(reportData.summary.profit)}
                      </div>
                      <div className="stat-extra">
                        利润率: {formatPercent(reportData.summary.profitRate)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 员工统计 - 仅管理员可见 */}
          {isAdmin && reportData.staffStats && (
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-users me-2"></i>
                  员工业绩统计
                </h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>员工</th>
                        <th className="text-center">订单数</th>
                        <th className="text-end">收入</th>
                        <th className="text-end">成本</th>
                        <th className="text-end">利润</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.staffStats.map(staff => (
                        <tr key={staff.staffId}>
                          <td>
                            <span className="badge bg-secondary">
                              {staff.staffName}
                            </span>
                          </td>
                          <td className="text-center">{staff.orderCount}</td>
                          <td className="text-end text-success fw-bold">
                            {formatMoney(staff.income)}
                          </td>
                          <td className="text-end text-warning">
                            {formatMoney(staff.cost)}
                          </td>
                          <td className={`text-end fw-bold ${staff.profit >= 0 ? 'text-info' : 'text-danger'}`}>
                            {formatMoney(staff.profit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FinancialReport;

