// StatisticsDashboard.js
// 统计仪表板页�?
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StatisticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/statistics');
      setStats(response.data);
    } catch (err) {
      console.error('获取统计数据失败:', err);
      setError('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          background: 'white',
          padding: '40px', 
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', color: '#6b7280', marginBottom: '16px' }}>
            📊 正在加载统计数据...
          </div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          background: 'white',
          padding: '40px', 
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', color: '#dc2626', marginBottom: '16px' }}>
            �?{error}
          </div>
          <button 
            onClick={fetchStatistics}
            style={{
              padding: '12px 24px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              marginRight: '12px'
            }}
          >
            重试
          </button>
          <button 
            onClick={goBack}
            style={{
              padding: '12px 24px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 头部 */}
        <div style={{ 
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h1 style={{ margin: 0, color: '#1f2937', fontSize: '32px' }}>
              📊 数据统计仪表�?
            </h1>
            <div>
              <button 
                onClick={fetchStatistics}
                style={{
                  padding: '12px 24px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginRight: '12px'
                }}
              >
                🔄 刷新数据
              </button>
              <button 
                onClick={goBack}
                style={{
                  padding: '12px 24px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                �?返回
              </button>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* 总申请数 */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '3px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'content-box, border-box'
            }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '12px', color: '#667eea' }}>
                {stats.applications?.total || 0}
              </div>
              <div style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>总申请数</div>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>所有时�?/div>
            </div>

            {/* 待处理申�?*/}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '3px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'content-box, border-box'
            }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '12px', color: '#f5576c' }}>
                {stats.applications?.pending || 0}
              </div>
              <div style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>待处理申�?/div>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>需要处�?/div>
            </div>

            {/* 已完成申�?*/}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '3px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'content-box, border-box'
            }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '12px', color: '#00f2fe' }}>
                {stats.applications?.completed || 0}
              </div>
              <div style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>已完成申�?/div>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>处理完成</div>
            </div>

            {/* 套餐总数 */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '3px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'content-box, border-box'
            }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '12px', color: '#43e97b' }}>
                {stats.packages?.total || 0}
              </div>
              <div style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>套餐总数</div>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>可用套餐</div>
            </div>
          </div>
        )}

        {/* 详细统计 */}
        {stats && (
          <div style={{ 
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 24px 0', color: '#1f2937', fontSize: '24px' }}>
              📈 详细统计信息
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px' 
            }}>
              <div style={{ 
                padding: '20px', 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>今日申请</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats.applications?.today || 0}
                </div>
              </div>
              <div style={{ 
                padding: '20px', 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>本周申请</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats.applications?.thisWeek || 0}
                </div>
              </div>
              <div style={{ 
                padding: '20px', 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>本月申请</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats.applications?.thisMonth || 0}
                </div>
              </div>
              <div style={{ 
                padding: '20px', 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>完成�?/div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                  {stats.applications?.completionRate || 0}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default StatisticsDashboard;
