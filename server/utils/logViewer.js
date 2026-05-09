const fs = require('fs');
const path = require('path');

class LogViewer {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
  }

  // 获取日志文件列表
  getLogFiles() {
    try {
      const files = fs.readdirSync(this.logDir);
      return files.filter(file => file.endsWith('.log')).map(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime,
          path: filePath
        };
      });
    } catch (error) {
      console.error('获取日志文件失败:', error);
      return [];
    }
  }

  // 读取日志文件内容
  readLogFile(filename, lines = 100, level = null) {
    try {
      const filePath = path.join(this.logDir, filename);
      if (!fs.existsSync(filePath)) {
        throw new Error('日志文件不存在');
      }

      const content = fs.readFileSync(filePath, 'utf8');
      let logs = content.split('\n').filter(line => line.trim());

      // 按级别过滤
      if (level) {
        logs = logs.filter(log => {
          try {
            const logObj = JSON.parse(log);
            return logObj.level === level;
          } catch {
            return false;
          }
        });
      }

      // 返回最后N行
      return logs.slice(-lines);
    } catch (error) {
      console.error('读取日志文件失败:', error);
      return [];
    }
  }

  // 搜索日志
  searchLogs(filename, searchTerm, level = null) {
    try {
      const filePath = path.join(this.logDir, filename);
      if (!fs.existsSync(filePath)) {
        throw new Error('日志文件不存在');
      }

      const content = fs.readFileSync(filePath, 'utf8');
      let logs = content.split('\n').filter(line => line.trim());

      // 按级别过滤
      if (level) {
        logs = logs.filter(log => {
          try {
            const logObj = JSON.parse(log);
            return logObj.level === level;
          } catch {
            return false;
          }
        });
      }

      // 搜索关键词
      return logs.filter(log => log.toLowerCase().includes(searchTerm.toLowerCase()));
    } catch (error) {
      console.error('搜索日志失败:', error);
      return [];
    }
  }

  // 清理旧日志
  cleanOldLogs(daysToKeep = 30) {
    try {
      const files = this.getLogFiles();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      let cleanedCount = 0;
      files.forEach(file => {
        if (file.modified < cutoffDate) {
          fs.unlinkSync(file.path);
          cleanedCount++;
        }
      });

      return { success: true, cleanedCount };
    } catch (error) {
      console.error('清理日志失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 获取日志统计信息
  getLogStats() {
    try {
      const files = this.getLogFiles();
      const stats = {
        totalFiles: files.length,
        totalSize: 0,
        errorCount: 0,
        warningCount: 0,
        infoCount: 0,
        debugCount: 0
      };

      files.forEach(file => {
        stats.totalSize += file.size;
        
        // 统计各级别日志数量
        const content = fs.readFileSync(file.path, 'utf8');
        const logs = content.split('\n').filter(line => line.trim());
        
        logs.forEach(log => {
          try {
            const logObj = JSON.parse(log);
            switch (logObj.level) {
              case 'error':
                stats.errorCount++;
                break;
              case 'warn':
                stats.warningCount++;
                break;
              case 'info':
                stats.infoCount++;
                break;
              case 'debug':
                stats.debugCount++;
                break;
            }
          } catch {
            // 忽略解析失败的日志
          }
        });
      });

      return stats;
    } catch (error) {
      console.error('获取日志统计失败:', error);
      return null;
    }
  }

  // 导出日志
  exportLogs(filename, format = 'json', startDate = null, endDate = null) {
    try {
      const filePath = path.join(this.logDir, filename);
      if (!fs.existsSync(filePath)) {
        throw new Error('日志文件不存在');
      }

      const content = fs.readFileSync(filePath, 'utf8');
      let logs = content.split('\n').filter(line => line.trim());

      // 按日期过滤
      if (startDate || endDate) {
        logs = logs.filter(log => {
          try {
            const logObj = JSON.parse(log);
            const logDate = new Date(logObj.timestamp);
            
            if (startDate && logDate < new Date(startDate)) return false;
            if (endDate && logDate > new Date(endDate)) return false;
            
            return true;
          } catch {
            return false;
          }
        });
      }

      // 格式化输出
      if (format === 'json') {
        return logs.map(log => {
          try {
            return JSON.parse(log);
          } catch {
            return { raw: log };
          }
        });
      } else if (format === 'text') {
        return logs.join('\n');
      } else if (format === 'csv') {
        const csvLogs = ['timestamp,level,message,service'];
        logs.forEach(log => {
          try {
            const logObj = JSON.parse(log);
            csvLogs.push(`${logObj.timestamp},${logObj.level},${logObj.message},${logObj.service || ''}`);
          } catch {
            csvLogs.push(`"${log.replace(/"/g, '""')}"`);
          }
        });
        return csvLogs.join('\n');
      }

      return logs;
    } catch (error) {
      console.error('导出日志失败:', error);
      return null;
    }
  }
}

module.exports = LogViewer;