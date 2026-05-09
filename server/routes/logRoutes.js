const express = require('express');
const router = express.Router();
const LogViewer = require('../utils/logViewer');
const { logger } = require('../utils/logger');

const logViewer = new LogViewer();

// 获取日志文件列表
router.get('/files', async (req, res) => {
  try {
    const files = logViewer.getLogFiles();
    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    logger.error('获取日志文件列表失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '获取日志文件列表失败'
    });
  }
});

// 读取日志文件内容
router.get('/read/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { lines = 100, level } = req.query;
    
    const logs = logViewer.readLogFile(filename, parseInt(lines), level);
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    logger.error('读取日志文件失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '读取日志文件失败'
    });
  }
});

// 搜索日志
router.get('/search/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { term, level } = req.query;
    
    if (!term) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }
    
    const logs = logViewer.searchLogs(filename, term, level);
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    logger.error('搜索日志失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '搜索日志失败'
    });
  }
});

// 获取日志统计信息
router.get('/stats', async (req, res) => {
  try {
    const stats = logViewer.getLogStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取日志统计失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '获取日志统计失败'
    });
  }
});

// 清理旧日志
router.delete('/clean', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const result = logViewer.cleanOldLogs(parseInt(days));
    
    if (result.success) {
      logger.info('清理旧日志成功', { cleanedCount: result.cleanedCount });
      res.json({
        success: true,
        message: `成功清理 ${result.cleanedCount} 个旧日志文件`
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    logger.error('清理旧日志失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '清理旧日志失败'
    });
  }
});

// 导出日志
router.get('/export/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { format = 'json', startDate, endDate } = req.query;
    const logs = logViewer.exportLogs(filename, format, startDate, endDate);
    
    if (logs === null) {
      return res.status(404).json({
        success: false,
        message: '日志文件不存在或导出失败'
      });
    }
    
    // 设置响应头
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}-${timestamp}.${format}"`);
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.json(logs);
    } else if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.send(logs);
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.send(logs);
    }
    
    logger.info('导出日志成功', { filename, format });
  } catch (error) {
    logger.error('导出日志失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '导出日志失败'
    });
  }
});

module.exports = router;
