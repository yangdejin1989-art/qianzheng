// AdminStatistics.js
// 后台数据统计组件
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl } from '../config';

function AdminStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(buildApiUrl('/api/statistics'));
      setStats(response.data);
    } catch (err) {
      console.error('获取统计数据失败:', err);
      setError('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#f8fafc',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>📊 正在加载统计数据...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#fef2f2',
        borderRadius: '8px',
        margin: '20px 0',
        border: '1px solid #fecaca'
      }}>
        <div style={{ fontSize: '18px', color: '#dc2626' }}>❌ {error}</div>
        <button 
          onClick={fetchStatistics}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        background: '#fff', 
        borderRadius: '8px', 
        padding: '24px', 
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ margin: 0, color: '#1f2937', fontSize: '24px' }}>
            📊 数据统计
          </h2>
          <button 
            onClick={fetchStatistics}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 刷新数据
          </button>
        </div>

        {stats ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            {/* 申请统计 */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                {stats.applications?.total || 0}
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>总申请数</div>
            </div>

            {/* 待处理申请 */}
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                {stats.applications?.pending || 0}
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>待处理申请</div>
            </div>

            {/* 已完成申请 */}
            <div style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                {stats.applications?.completed || 0}
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>已完成申请</div>
            </div>

            {/* 套餐统计 */}
            <div style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                {stats.packages?.total || 0}
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>套餐总数</div>
            </div>

            {/* FAQ统计 */}
            <div style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                {stats.faqs?.total || 0}
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>FAQ总数</div>
            </div>

            {/* 公告统计 */}
            <div style={{
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              color: '#333',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                {stats.notices?.total || 0}
              </div>
              <div style={{ fontSize: '16px', opacity: 0.8 }}>公告总数</div>
            </div>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#6b7280' 
          }}>
            暂无统计数据
          </div>
        )}
      </div>

      {/* 详细统计信息 */}
      {stats && (
        <div style={{ 
          background: '#fff', 
          borderRadius: '8px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>📈 详细统计</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>今日申请</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {stats.applications?.today || 0}
              </div>
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>本周申请</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {stats.applications?.thisWeek || 0}
              </div>
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>本月申请</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {stats.applications?.thisMonth || 0}
              </div>
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>完成率</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {stats.applications?.completionRate || 0}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStatistics;
