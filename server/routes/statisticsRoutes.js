const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Package = require('../models/Package');
const FAQ = require('../models/FAQ');
const Notice = require('../models/Notice');

// 获取仪表板统计数据
router.get('/dashboard', async (req, res) => {
  try {
    // 模拟统计数据（实际项目中应该从数据库获取）
    const formCollectionData = [
      { name: '不动产登记', value: 10, color: '#ff6b6b' },
      { name: '户籍迁移', value: 8, color: '#ffa726' },
      { name: '企业申报', value: 12, color: '#42a5f5' },
      { name: '工商注册', value: 15, color: '#66bb6a' },
      { name: '新生儿落户', value: 6, color: '#ab47bc' }
    ];

    const formCategoriesData = [
      { name: '不动产登记', value: 25 },
      { name: '户籍迁移', value: 18 },
      { name: '企业申报', value: 32 },
      { name: '工商注册', value: 28 },
      { name: '新生儿落户', value: 15 }
    ];

    const usageRateData = [
      { name: '设备1', value: 80, color: '#42a5f5' },
      { name: '设备2', value: 70, color: '#66bb6a' },
      { name: '设备3', value: 50, color: '#ffca28' },
      { name: '设备4', value: 40, color: '#ef5350' },
      { name: '设备5', value: 40, color: '#ab47bc' }
    ];

    const formChannelsData = [
      { name: 'PC端', value: 60, color: '#42a5f5' },
      { name: '移动端', value: 40, color: '#66bb6a' }
    ];

    res.json({
      formCollection: formCollectionData,
      formCategories: formCategoriesData,
      usageRate: usageRateData,
      formChannels: formChannelsData
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

// 获取实时统计数据
router.get('/realtime', async (req, res) => {
  try {
    res.json({
      todayApplications: 25,
      totalApplications: 156,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('获取实时统计失败:', error);
    res.status(500).json({ error: '获取实时统计失败' });
  }
});

// 获取统计数据（根路径）
router.get('/', async (req, res) => {
  try {
    console.log('Statistics API called');
    // 获取申请统计数据
    const totalApplications = await Application.countDocuments({ deleted: false });
    const pendingApplications = await Application.countDocuments({ 
      status: '待处理', 
      deleted: false 
    });
    const completedApplications = await Application.countDocuments({ 
      status: '已完成', 
      deleted: false 
    });
    const processingApplications = await Application.countDocuments({ 
      status: '处理中', 
      deleted: false 
    });

    // 获取今日申请数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayApplications = await Application.countDocuments({ 
      createdAt: { $gte: today },
      deleted: false 
    });

    // 获取本周申请数
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const thisWeekApplications = await Application.countDocuments({ 
      createdAt: { $gte: weekStart },
      deleted: false 
    });

    // 获取本月申请数
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const thisMonthApplications = await Application.countDocuments({ 
      createdAt: { $gte: monthStart },
      deleted: false 
    });

    // 计算完成率
    const completionRate = totalApplications > 0 
      ? Math.round((completedApplications / totalApplications) * 100) 
      : 0;

    // 获取套餐统计数据
    const totalPackages = await Package.countDocuments({ visible: true });

    // 获取FAQ统计数据
    const totalFAQs = await FAQ.countDocuments({ visible: true });

    // 获取公告统计数据
    const totalNotices = await Notice.countDocuments({ visible: true });

    res.json({
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        completed: completedApplications,
        processing: processingApplications,
        today: todayApplications,
        thisWeek: thisWeekApplications,
        thisMonth: thisMonthApplications,
        completionRate: completionRate
      },
      packages: {
        total: totalPackages
      },
      faqs: {
        total: totalFAQs
      },
      notices: {
        total: totalNotices
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

module.exports = router;