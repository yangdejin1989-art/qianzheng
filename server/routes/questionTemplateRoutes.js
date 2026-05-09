const express = require('express');
const router = express.Router();
const QuestionTemplate = require('../models/QuestionTemplate');
const Package = require('../models/Package');

// 获取所有问题模板
router.get('/', async (req, res) => {
  try {
    const templates = await QuestionTemplate.find().populate('packageId', 'name').sort('packageName');
    res.json(templates);
  } catch (error) {
    console.error('获取所有问题模板失败:', error);
    res.status(500).json({ message: '获取问题模板失败' });
  }
});

// 获取指定签证的问题模板列表
router.get('/package/:packageId', async (req, res) => {
  try {
    const { packageId } = req.params;
    const templates = await QuestionTemplate.find({ packageId }).populate('packageId', 'name');
    res.json(templates);
  } catch (error) {
    console.error('获取指定签证问题模板失败:', error);
    res.status(500).json({ message: '获取问题模板失败' });
  }
});

// 获取指定签证和客户类型的问题模板
router.get('/package/:packageId/customer-type/:customerTypeId', async (req, res) => {
  try {
    const { packageId, customerTypeId } = req.params;
    const template = await QuestionTemplate.findOne({ 
      packageId, 
      customerTypeId: customerTypeId === 'null' ? null : customerTypeId 
    }).populate('packageId', 'name');
    
    res.json(template);
  } catch (error) {
    console.error('获取问题模板失败:', error);
    res.status(500).json({ message: '获取问题模板失败' });
  }
});

// 创建或更新问题模板（整体保存）
router.post('/', async (req, res) => {
  try {
    const { packageId, packageName, customerTypeId, customerTypeName, questions } = req.body;

    if (!packageId || !packageName) {
      return res.status(400).json({ message: '缺少必填字段' });
    }

    // 查找是否已存在
    const query = { packageId };
    if (customerTypeId) {
      query.customerTypeId = customerTypeId;
    } else {
      query.customerTypeId = { $exists: false };
    }

    let template = await QuestionTemplate.findOne(query);

    if (template) {
      // 更新现有模板
      template.packageName = packageName;
      template.customerTypeId = customerTypeId;
      template.customerTypeName = customerTypeName;
      template.questions = questions || [];
      await template.save();
      res.json(template);
    } else {
      // 创建新模板
      template = new QuestionTemplate({
        packageId,
        packageName,
        customerTypeId,
        customerTypeName,
        questions: questions || []
      });
      await template.save();
      res.status(201).json(template);
    }
  } catch (error) {
    console.error('保存问题模板失败:', error);
    res.status(500).json({ message: '保存问题模板失败', error: error.message });
  }
});

// 删除问题模板
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await QuestionTemplate.findByIdAndDelete(id);
    res.json({ message: '问题模板删除成功' });
  } catch (error) {
    console.error('删除问题模板失败:', error);
    res.status(500).json({ message: '删除问题模板失败' });
  }
});

module.exports = router;





