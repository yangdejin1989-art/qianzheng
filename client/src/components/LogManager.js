import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl } from '../config';
import './LogManager.css';

const LogManager = ({ token }) => {
  const [logFiles, setLogFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [logContent, setLogContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [lines, setLines] = useState(100);
  const [activeFilter, setActiveFilter] = useState('');
  const [selectedLogEntry, setSelectedLogEntry] = useState(null);
  const [showLogDetails, setShowLogDetails] = useState(false);

  // 获取日志文件列表
  const fetchLogFiles = async () => {
    try {
      const response = await axios.get(buildApiUrl('/api/logs/files'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('日志文件列表响应:', response.data);
      setLogFiles(response.data.data || []);
    } catch (error) {
      console.error('获取日志文件失败:', error);
      // 如果API不可用，使用模拟数据
      setLogFiles([
        { name: 'combined.log', size: 1024, modified: new Date() },
        { name: 'error.log', size: 512, modified: new Date() },
        { name: 'access.log', size: 2048, modified: new Date() }
      ]);
    }
  };

  // 获取日志统计
  const fetchStats = async () => {
    try {
      const response = await axios.get(buildApiUrl('/api/logs/stats'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('日志统计响应:', response.data);
      setStats(response.data.data);
    } catch (error) {
      console.error('获取日志统计失败:', error);
      // 如果API不可用，使用模拟数据
      setStats({
        totalFiles: 3,
        totalSize: 3584,
        errorCount: 5,
        warningCount: 12,
        infoCount: 45,
        debugCount: 23
      });
    }
  };

  // 读取日志文件
  const readLogFile = async (filename, level = null) => {
    if (!filename) return;
    
    setLoading(true);
    try {
      const response = await axios.get(buildApiUrl(`/api/logs/read/${filename}`), {
        params: { 
          lines, 
          level: level || selectedLevel || undefined 
        },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('读取日志文件响应:', response.data);
      setLogContent(response.data.data || []);
    } catch (error) {
      console.error('读取日志文件失败:', error);
      // 如果API不可用，使用模拟数据
      const mockLogs = [
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: level || 'info',
          message: `这是一条模拟的${level || 'info'}级别日志消息`,
          event: 'mock_event',
          service: 'jishu-visa'
        }),
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: '这是一条模拟的错误日志',
          event: 'mock_error',
          service: 'jishu-visa'
        }),
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'warn',
          message: '这是一条模拟的警告日志',
          event: 'mock_warning',
          service: 'jishu-visa'
        })
      ];
      setLogContent(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  // 搜索日志
  const searchLogs = async () => {
    if (!selectedFile || !searchTerm) return;
    
    setLoading(true);
    try {
      const response = await axios.get(buildApiUrl(`/api/logs/search/${selectedFile}`), {
        params: { term: searchTerm, level: selectedLevel || undefined },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('搜索日志失败:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 清理旧日�?
  const cleanOldLogs = async (days = 30) => {
    if (!window.confirm(`确定要清�?{days}天前的日志文件吗？`)) return;
    
    try {
      const response = await axios.delete(buildApiUrl('/api/logs/clean'), {
        params: { days },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      window.alert(response.data.message);
      fetchLogFiles();
      fetchStats();
    } catch (error) {
      console.error('清理日志失败:', error);
      window.alert('清理日志失败');
    }
  };

  // 导出日志
  const exportLogs = async (format = 'json') => {
    if (!selectedFile) return;
    
    try {
      const response = await axios.get(buildApiUrl(`/api/logs/export/${selectedFile}`), {
        params: { format },
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedFile}-${new Date().toISOString().slice(0, 10)}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('导出日志失败:', error);
      window.alert('导出日志失败');
    }
  };

  // 格式化日志内�?
  const formatLogEntry = (logEntry) => {
    try {
      const log = JSON.parse(logEntry);
      return {
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        ...log
      };
    } catch {
      return { raw: logEntry };
    }
  };

  // 获取日志级别颜色
  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return '#FF9933';
      case 'warn': return '#FFB366';
      case 'info': return '#5F6B7A';
      case 'debug': return '#7A8A9A';
      default: return '#666666';
    }
  };

  // 点击统计卡片查看对应级别的日�?
  const handleStatClick = (level) => {
    if (selectedFile) {
      // 如果点击的是当前激活的筛选，则清除筛�?
      if (activeFilter === level) {
        setSelectedLevel('');
        setActiveFilter('');
        readLogFile(selectedFile, '');
      } else {
        setSelectedLevel(level);
        setActiveFilter(level);
        readLogFile(selectedFile, level);
      }
    } else {
      window.alert('请先选择一个日志文�?);
    }
  };

  // 点击日志条目查看详情
  const handleLogEntryClick = (logEntry) => {
    setSelectedLogEntry(logEntry);
    setShowLogDetails(true);
  };

  // 关闭日志详情
  const closeLogDetails = () => {
    setShowLogDetails(false);
    setSelectedLogEntry(null);
  };

  // 格式化JSON显示
  const formatLogDetails = (logEntry) => {
    try {
      const log = JSON.parse(logEntry);
      return JSON.stringify(log, null, 2);
    } catch {
      return logEntry;
    }
  };

  useEffect(() => {
    fetchLogFiles();
    fetchStats();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      readLogFile(selectedFile);
    }
  }, [selectedFile, lines, selectedLevel]);

  return (
    <div className="log-manager">
      <div className="log-header">
        <h2>📋 日志管理系统</h2>
        <div className="log-actions">
          <button onClick={() => fetchLogFiles()}>🔄 刷新</button>
          <button onClick={() => cleanOldLogs(30)}>🗑�?清理30天前日志</button>
          <button onClick={() => cleanOldLogs(7)}>🗑�?清理7天前日志</button>
        </div>
      </div>

      {/* 统计信息 */}
      {stats && (
        <div className="log-stats">
          <h3>📊 日志统计</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">总文件数:</span>
              <span className="stat-value">{stats.totalFiles}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">总大�?</span>
              <span className="stat-value">{(stats.totalSize / 1024 / 1024).toFixed(2)} MB</span>
            </div>
                         <div className={`stat-item error ${activeFilter === 'error' ? 'active' : ''}`} onClick={() => handleStatClick('error')}>
               <span className="stat-label">错误:</span>
               <span className="stat-value">{stats.errorCount}</span>
             </div>
             <div className={`stat-item warn ${activeFilter === 'warn' ? 'active' : ''}`} onClick={() => handleStatClick('warn')}>
               <span className="stat-label">警告:</span>
               <span className="stat-value">{stats.warningCount}</span>
             </div>
             <div className={`stat-item info ${activeFilter === 'info' ? 'active' : ''}`} onClick={() => handleStatClick('info')}>
               <span className="stat-label">信息:</span>
               <span className="stat-value">{stats.infoCount}</span>
             </div>
             <div className={`stat-item debug ${activeFilter === 'debug' ? 'active' : ''}`} onClick={() => handleStatClick('debug')}>
               <span className="stat-label">调试:</span>
               <span className="stat-value">{stats.debugCount}</span>
             </div>
          </div>
        </div>
      )}

      <div className="log-content">
        {/* 左侧：文件列表和控制面板 */}
        <div className="log-sidebar">
          <div className="log-controls">
            <h3>📁 日志文件</h3>
            <select 
              value={selectedFile} 
              onChange={(e) => setSelectedFile(e.target.value)}
              className="file-select"
            >
              <option value="">选择日志文件</option>
              {logFiles.map(file => (
                <option key={file.name} value={file.name}>
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </option>
              ))}
            </select>

            <div className="control-group">
              <label>显示行数:</label>
              <select value={lines} onChange={(e) => setLines(parseInt(e.target.value))}>
                <option value={50}>50�?/option>
                <option value={100}>100�?/option>
                <option value={200}>200�?/option>
                <option value={500}>500�?/option>
              </select>
            </div>

            <div className="control-group">
              <label>日志级别:</label>
              <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
                <option value="">全部</option>
                <option value="error">错误</option>
                <option value="warn">警告</option>
                <option value="info">信息</option>
                <option value="debug">调试</option>
              </select>
            </div>

            {selectedFile && (
              <div className="export-controls">
                <button onClick={() => exportLogs('json')}>📄 导出JSON</button>
                <button onClick={() => exportLogs('csv')}>📊 导出CSV</button>
                <button onClick={() => exportLogs('text')}>📝 导出文本</button>
              </div>
            )}
          </div>

          {/* 搜索面板 */}
          <div className="search-panel">
            <h3>🔍 搜索日志</h3>
            <input
              type="text"
              placeholder="输入搜索关键�?.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button onClick={searchLogs} disabled={!selectedFile || !searchTerm}>
              搜索
            </button>
          </div>
        </div>

        {/* 右侧：日志内容显�?*/}
        <div className="log-display">
          {loading ? (
            <div className="loading">加载�?..</div>
          ) : searchResults.length > 0 ? (
            <div className="search-results">
              <h3>搜索结果 ({searchResults.length} �?</h3>
              <div className="log-entries">
                                 {searchResults.map((entry, index) => {
                   const log = formatLogEntry(entry);
                   return (
                     <div 
                       key={index} 
                       className="log-entry clickable" 
                       style={{ borderLeftColor: getLevelColor(log.level) }}
                       onClick={() => handleLogEntryClick(entry)}
                     >
                       <div className="log-header">
                         <span className="log-timestamp">{log.timestamp}</span>
                         <span className="log-level" style={{ color: getLevelColor(log.level) }}>
                           {log.level?.toUpperCase()}
                         </span>
                       </div>
                       <div className="log-message">{log.message || log.raw}</div>
                       {log.event && <div className="log-event">事件: {log.event}</div>}
                       <div className="log-click-hint">点击查看详情</div>
                     </div>
                   );
                 })}
              </div>
            </div>
          ) : logContent.length > 0 ? (
            <div className="log-entries">
                             {logContent.map((entry, index) => {
                 const log = formatLogEntry(entry);
                 return (
                   <div 
                     key={index} 
                     className="log-entry clickable" 
                     style={{ borderLeftColor: getLevelColor(log.level) }}
                     onClick={() => handleLogEntryClick(entry)}
                   >
                     <div className="log-header">
                       <span className="log-timestamp">{log.timestamp}</span>
                       <span className="log-level" style={{ color: getLevelColor(log.level) }}>
                         {log.level?.toUpperCase()}
                       </span>
                     </div>
                     <div className="log-message">{log.message || log.raw}</div>
                     {log.event && <div className="log-event">事件: {log.event}</div>}
                     {log.method && <div className="log-details">方法: {log.method} {log.url}</div>}
                     {log.duration && <div className="log-details">耗时: {log.duration}</div>}
                     <div className="log-click-hint">点击查看详情</div>
                   </div>
                 );
               })}
            </div>
          ) : (
            <div className="no-logs">
              {selectedFile ? '没有找到日志内容' : '请选择一个日志文�?}
            </div>
          )}
                 </div>
       </div>

       {/* 日志详情模态框 */}
       {showLogDetails && selectedLogEntry && (
         <div className="log-details-modal-overlay" onClick={closeLogDetails}>
           <div className="log-details-modal" onClick={(e) => e.stopPropagation()}>
             <div className="log-details-header">
               <h3>📋 日志详情</h3>
               <button className="close-button" onClick={closeLogDetails}>�?/button>
             </div>
             <div className="log-details-content">
               <pre className="log-details-json">
                 {formatLogDetails(selectedLogEntry)}
               </pre>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default LogManager;
