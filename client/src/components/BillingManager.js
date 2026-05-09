import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { buildApiUrl } from '../config';
import './BillingManager.css';

const BillingManager = ({ applicationId, currentUser, settled, onSettleChange }) => {
  // ==================== 状态定义 ====================
  
  // 账单数据状态
  const [billing, setBilling] = useState({ 
    payments: [], 
    cost: { amount: 0, note: '' } 
  });
  const [summary, setSummary] = useState({ 
    totalIncome: 0, 
    totalCost: 0, 
    profit: 0, 
    profitRate: 0 
  });
  
  // UI 状态
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSettled, setIsSettled] = useState(settled || false);
  const [settling, setSettling] = useState(false);
  
  // 判断是否为管理员
  const isAdmin = currentUser?.role === 'admin';
  
  // 支付记录表单状态
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    payerName: '',
    paymentType: '支付宝',
    note: ''
  });
  
  // 成本费用表单状态
  const [showCostForm, setShowCostForm] = useState(false);
  const [costForm, setCostForm] = useState({
    amount: 0,
    note: ''
  });

  // ==================== 生命周期 ====================
  
  // 初始化加载账单数据
  useEffect(() => {
    fetchBilling();
  }, [applicationId]);

  // 同步结算状态
  useEffect(() => {
    setIsSettled(settled || false);
  }, [settled]);

  // ==================== 表单处理函数（防止输入闪烁）====================
  
  const handlePaymentFormChange = useCallback((field, value) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCostFormChange = useCallback((field, value) => {
    setCostForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // ==================== 数据获取 ====================
  
  const fetchBilling = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(buildApiUrl(`/api/applications/${applicationId}/billing`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBilling(data.billing || { payments: [], cost: { amount: 0, note: '' } });
        setSummary(data.summary || { totalIncome: 0, totalCost: 0, profit: 0, profitRate: 0 });
      }
    } catch (error) {
      console.error('获取账单数据失败:', error);
    }
  };

  // ==================== 支付记录操作 ====================
  
  // 添加支付记录
  const handleAddPayment = async () => {
    if (!paymentForm.amount || !paymentForm.payerName) {
      setMessage('❌ 请填写金额和支付人');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(buildApiUrl(`/api/applications/${applicationId}/billing/payments`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentForm)
      });

      const data = await response.json();
      if (data.success) {
        setShowPaymentForm(false);
        setPaymentForm({
          amount: '',
          paymentDate: new Date().toISOString().split('T')[0],
          payerName: '',
          paymentType: '支付宝',
          note: ''
        });
        fetchBilling();
      } else {
        setMessage(`❌ 添加失败: ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ 添加失败: 网络错误');
    } finally {
      setLoading(false);
    }
  };

  // 删除支付记录
  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('确定要删除这条支付记录吗？')) return;

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(buildApiUrl(`/api/applications/${applicationId}/billing/payments/${paymentId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchBilling();
      } else {
        setMessage(`❌ 删除失败: ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ 删除失败: 网络错误');
    } finally {
      setLoading(false);
    }
  };

  // ==================== 成本费用操作 ====================
  
  // 更新成本
  const handleUpdateCost = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(buildApiUrl(`/api/applications/${applicationId}/billing/cost`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(costForm)
      });

      const data = await response.json();
      if (data.success) {
        setShowCostForm(false);
        fetchBilling();
      } else {
        setMessage(`❌ 更新失败: ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ 更新失败: 网络错误');
    } finally {
      setLoading(false);
    }
  };

  // ==================== 订单结算操作 ====================
  
  // 处理订单结算
  const handleSettle = async () => {
    if (!window.confirm('确认要结算此订单吗？结算后将无法再修改账单明细。')) {
      return;
    }

    setSettling(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        buildApiUrl(`/api/applications/${applicationId}/settle`),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setIsSettled(true);
        setMessage('订单结算成功！');
        if (onSettleChange) onSettleChange();
      } else {
        setMessage('结算失败：' + data.message);
      }
    } catch (err) {
      setMessage('结算失败：' + err.message);
    } finally {
      setSettling(false);
    }
  };

  // 处理取消结算
  const handleUnsettle = async () => {
    if (!window.confirm('确认要取消结算此订单吗？取消后可以重新编辑账单明细。')) {
      return;
    }

    setSettling(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        buildApiUrl(`/api/applications/${applicationId}/unsettle`),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setIsSettled(false);
        setMessage('已取消订单结算！');
        if (onSettleChange) onSettleChange();
      } else {
        setMessage('取消结算失败：' + data.message);
      }
    } catch (err) {
      setMessage('取消结算失败：' + err.message);
    } finally {
      setSettling(false);
    }
  };

  // ==================== 工具函数 ====================
  
  // 格式化金额
  const formatMoney = (amount) => {
    return `¥${parseFloat(amount || 0).toLocaleString('zh-CN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  // ==================== 渲染界面 ====================
  
  return (
    <div className="billing-manager">
      <h6 style={{ marginBottom: '10px', fontSize: '0.9rem', fontWeight: '600', color: '#1f2937' }}>
        账单明细
      </h6>

      {/* 结算状态提示 */}
      {isSettled && (
        <div className="alert alert-info" style={{ fontSize: '0.85rem', padding: '8px 12px', marginBottom: '12px' }}>
          <i className="fas fa-lock me-2"></i>
          此订单已结算，账单明细已锁定，不可编辑
        </div>
      )}

      {/* 付款明细 */}
      <div className="billing-section">
        <div className="section-header">
          <h6>付款明细</h6>
          {!isSettled && (
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => {
                setShowPaymentForm(true);
                setMessage('');
              }}
            >
              <i className="fas fa-plus me-1"></i>添加支付
            </button>
          )}
        </div>

        {billing.payments && billing.payments.length > 0 ? (
          <div className="payments-list">
            {billing.payments.map((payment, index) => (
              <div key={payment.paymentId || index} className="payment-item">
                <div className="payment-info">
                  <span 
                    className="payment-type" 
                    style={{ 
                      fontSize: '0.72rem', 
                      padding: '2px 8px', 
                      backgroundColor: payment.paymentType === '银行汇款' 
                        ? '#fef3c7' 
                        : payment.paymentType === '微信' 
                        ? '#dcfce7' 
                        : payment.paymentType === '现金' 
                        ? '#fee2e2' 
                        : '#dbeafe',
                      color: payment.paymentType === '银行汇款' 
                        ? '#92400e' 
                        : payment.paymentType === '微信' 
                        ? '#166534' 
                        : payment.paymentType === '现金' 
                        ? '#991b1b' 
                        : '#1e40af',
                      borderRadius: '3px',
                      fontWeight: '500'
                    }}
                  >
                    {payment.paymentType || '支付宝'}
                  </span>
                  <span className="payment-amount">{formatMoney(payment.amount)}</span>
                  <span className="payment-date">{formatDate(payment.paymentDate)}</span>
                  <span className="payment-payer">{payment.payerName}</span>
                  {payment.note && <span className="payment-note">备注: {payment.note}</span>}
                </div>
                {!isSettled && (
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeletePayment(payment.paymentId)}
                    disabled={loading}
                    style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">暂无支付记录</div>
        )}

        {/* ===== 添加支付记录弹窗 ===== */}
        {showPaymentForm && ReactDOM.createPortal(
          <div className="form-modal">
            <div className="form-content">
              <h6>添加支付记录</h6>
              
              {/* 支付金额 */}
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                  金额（元）*
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={paymentForm.amount}
                  onChange={(e) => handlePaymentFormChange('amount', e.target.value)}
                  placeholder="请输入金额"
                  step="0.01"
                  autoComplete="off"
                />
              </div>
              
              {/* 支付时间 */}
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                  支付时间*
                </label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={paymentForm.paymentDate}
                  onChange={(e) => handlePaymentFormChange('paymentDate', e.target.value)}
                  autoComplete="off"
                />
              </div>
              
              {/* 支付人 */}
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                  支付人*
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={paymentForm.payerName}
                  onChange={(e) => handlePaymentFormChange('payerName', e.target.value)}
                  placeholder="请输入支付人姓名"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              
              {/* 支付方式 */}
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                  支付方式*
                </label>
                <select
                  className="form-select form-select-sm"
                  value={paymentForm.paymentType}
                  onChange={(e) => handlePaymentFormChange('paymentType', e.target.value)}
                  autoComplete="off"
                >
                  <option value="支付宝">支付宝</option>
                  <option value="微信">微信</option>
                  <option value="银行汇款">银行汇款</option>
                  <option value="现金">现金</option>
                </select>
              </div>
              
              {/* 备注信息 */}
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                  备注
                </label>
                <textarea
                  className="form-control form-control-sm"
                  rows="2"
                  value={paymentForm.note}
                  onChange={(e) => handlePaymentFormChange('note', e.target.value)}
                  placeholder={paymentForm.paymentType === '银行汇款' ? '请填写银行流水号' : '备注信息（可选）'}
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              
              {/* 操作按钮 */}
              <div className="form-actions" style={{ marginTop: '12px' }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowPaymentForm(false)}
                  disabled={loading}
                >
                  取消
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleAddPayment}
                  disabled={loading}
                >
                  {loading ? '添加中...' : '确认添加'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* 成本费用 - 仅管理员可见 */}
      {isAdmin && (
        <div className="billing-section">
          <div className="section-header">
            <h6>成本费用</h6>
            {!isSettled && (
              <button 
                className="btn btn-sm btn-warning"
                onClick={() => {
                  setCostForm({
                    amount: billing.cost?.amount || 0,
                    note: billing.cost?.note || ''
                  });
                  setShowCostForm(true);
                  setMessage('');
                }}
              >
                <i className="fas fa-edit me-1"></i>编辑成本
              </button>
            )}
          </div>

          <div className="cost-display">
            <div className="cost-amount">{formatMoney(billing.cost?.amount || 0)}</div>
            {billing.cost?.note && (
              <div className="cost-note">{billing.cost.note}</div>
            )}
          </div>
          
          {/* 利润显示 */}
          <div className="profit-display">
            <div className="profit-label">利润</div>
            <div className={`profit-amount ${summary.profit >= 0 ? 'positive' : 'negative'}`}>
              {formatMoney(summary.profit)}
            </div>
          </div>

          {/* 结算按钮 - 仅管理员可见 */}
          {isAdmin && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              {isSettled ? (
                <button 
                  className="btn btn-warning w-100"
                  onClick={handleUnsettle}
                  disabled={settling}
                >
                  <i className="fas fa-undo me-2"></i>
                  {settling ? '处理中...' : '取消结算'}
                </button>
              ) : (
                <button 
                  className="btn btn-success w-100"
                  onClick={handleSettle}
                  disabled={settling}
                >
                  <i className="fas fa-check me-2"></i>
                  {settling ? '处理中...' : '结算订单'}
                </button>
              )}
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
                {isSettled ? '取消结算后可重新编辑账单' : '结算后账单将被锁定，无法修改'}
              </div>
            </div>
          )}

          {/* ===== 编辑成本费用弹窗 ===== */}
          {showCostForm && ReactDOM.createPortal(
            <div className="form-modal">
              <div className="form-content">
              <h6>编辑成本费用</h6>
              
              {/* 成本金额 */}
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                  成本金额（元）
                </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={costForm.amount}
                    onChange={(e) => handleCostFormChange('amount', e.target.value)}
                    placeholder="请输入成本金额"
                    step="0.01"
                  autoComplete="off"
                />
              </div>
              
              {/* 成本备注 */}
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                  备注
                </label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    value={costForm.note}
                    onChange={(e) => handleCostFormChange('note', e.target.value)}
                    placeholder="成本说明（可选）"
                    autoComplete="off"
                  spellCheck="false"
                />
              </div>
              
              {/* 操作按钮 */}
              <div className="form-actions" style={{ marginTop: '12px' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowCostForm(false)}
                    disabled={loading}
                  >
                    取消
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleUpdateCost}
                    disabled={loading}
                  >
                    {loading ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      )}

      {/* 消息提示 */}
      {message && (
        <div className={`alert ${message.includes('成功') ? 'alert-success' : 'alert-danger'} mt-3`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default BillingManager;

