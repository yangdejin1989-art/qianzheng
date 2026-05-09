import React, { useState, useEffect } from 'react';
import './EmailManager.css';
import { buildApiUrl } from '../config';

const EmailManager = ({ applicationId, application, onEmailSent }) => {
  const [emailConfig, setEmailConfig] = useState({
    emailUser: '',
    supportedStatuses: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sentStatusMap, setSentStatusMap] = useState({});
  const [expandedStatus, setExpandedStatus] = useState(null);

  // 获取邮件配置
  useEffect(() => {
    fetchEmailConfig();
  }, []);

  // 根据 application.emailLog 生成已发送标�?  useEffect(() => {
    if (application && Array.isArray(application.emailLog)) {
      const map = {};
      application.emailLog.forEach(log => {
        if (log && log.status) map[log.status] = true;
      });
      setSentStatusMap(map);
    }
  }, [application]);

  const fetchEmailConfig = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/email-config'));
      const data = await response.json();
      setEmailConfig(data);
    } catch (error) {
      console.error('获取邮件配置失败:', error);
    }
  };

  // 手动发送状态邮�?  const sendStatusEmail = async () => {
    if (!applicationId) {
      setMessage('�?申请ID不存�?);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(buildApiUrl(`/api/applications/${applicationId}/send-status-email`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setMessage('�?状态邮件发送成�?);
        // 更新本地已发送标�?        setSentStatusMap(prev => ({ ...prev, [application?.status]: true }));
        if (onEmailSent) onEmailSent(data.data);
      } else {
        setMessage(`�?邮件发送失�? ${data.message}`);
      }
    } catch (error) {
      console.error('发送邮件失�?', error);
      setMessage('�?邮件发送失�? 网络错误');
    } finally {
      setLoading(false);
    }
  };

  // 发送材料提醒邮�?  const sendMaterialReminderEmail = async () => {
    if (!applicationId) {
      setMessage('�?申请ID不存�?);
      return;
    }

    if (!application?.customerType) {
      setMessage('�?请先选择办理类型');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(buildApiUrl(`/api/applications/${applicationId}/send-material-reminder`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('材料提醒邮件响应:', data);

      if (data.success) {
        setMessage('�?材料提醒邮件发送成功，客户可通过邮件链接直接提交材料');
      } else {
        console.error('邮件发送失败详�?', data);
        setMessage(`�?邮件发送失�? ${data.message || data.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('发送材料提醒邮件失�?', error);
      setMessage(`�?邮件发送失�? ${error.message || '网络错误'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-manager">
      <div className="email-manager-header">
        <h3>📧 状态邮件管�?/h3>
        <div className="email-status">
          <span className="status-badge status-manual">手动发送模�?/span>
        </div>
      </div>

      <div className="email-manager-content">
        <div className="email-info">
          <p><strong>发送邮�?</strong> {emailConfig.emailUser}</p>
          <div className="sent-row">
            {emailConfig.supportedStatuses.map(st => {
              const hasSent = sentStatusMap[st];
              const statusLogs = application?.emailLog?.filter(log => log.status === st) || [];
              
              return (
                <div key={st} className="sent-item">
                  <span className="sent-name">{st}</span>
                  {hasSent ? (
                    <div className="sent-status-expandable" onClick={() => setExpandedStatus(expandedStatus === st ? null : st)}>
                      <span className="tag tag-success">已发�?/span>
                      <span className="expand-icon">{expandedStatus === st ? '�? : '�?}</span>
                    </div>
                  ) : (
                    <span className="tag tag-muted">未发�?/span>
                  )}
                  
                  {/* 展开的详细记�?*/}
                  {expandedStatus === st && statusLogs.length > 0 && (
                    <div className="sent-details">
                      {statusLogs.map((log, index) => (
                        <div key={index} className="sent-detail-item">
                          <span className="sent-time">{new Date(log.sentAt).toLocaleString()}</span>
                          <span className="sent-type">({log.type === 'auto' ? '自动' : '手动'})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p><strong>当前状�?</strong> 
            <span className={`status-badge status-${application?.status?.replace(/\s+/g, '-')}`}>
              {application?.status || '未知'}
            </span>
          </p>
        </div>

        <div className="email-actions">
          <button
            className="btn btn-primary"
            onClick={sendStatusEmail}
            disabled={loading || !applicationId}
          >
            {loading ? '发送中...' : '📧 发送状态邮�?}
          </button>
          
          {/* 材料提醒邮件按钮已移动到同行人标签页旁边 */}
        </div>

        {message && (
          <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailManager;
