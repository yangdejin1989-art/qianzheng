const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');

// 获取网站设置
router.get('/', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    
    // 如果没有设置，创建默认设置
    if (!settings) {
      settings = new SiteSettings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    console.error('获取网站设置失败:', error);
    res.status(500).json({ error: '获取网站设置失败' });
  }
});

// 更新网站设置
router.put('/', async (req, res) => {
  try {
    const updateData = req.body;
    
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      // 如果没有设置，创建新的
      settings = new SiteSettings(updateData);
    } else {
      // 更新现有设置
      Object.assign(settings, updateData);
    }
    
    await settings.save();
    
    res.json({ 
      success: true, 
      message: '网站设置更新成功',
      data: settings 
    });
  } catch (error) {
    console.error('更新网站设置失败:', error);
    res.status(500).json({ error: '更新网站设置失败' });
  }
});

// 重置网站设置为默认值
router.post('/reset', async (req, res) => {
  try {
    await SiteSettings.deleteMany({});
    
    const defaultSettings = new SiteSettings();
    await defaultSettings.save();
    
    res.json({ 
      success: true, 
      message: '网站设置已重置为默认值',
      data: defaultSettings 
    });
  } catch (error) {
    console.error('重置网站设置失败:', error);
    res.status(500).json({ error: '重置网站设置失败' });
  }
});

module.exports = router;
