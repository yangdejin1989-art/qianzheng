// materialTemplateRoutes.js
// 材料模板管理路由 - 提供材料模板的增删改查接口

const express = require('express');
const router = express.Router();
const MaterialTemplate = require('../models/MaterialTemplate');
const Package = require('../models/Package');
const { auth } = require('../middleware/auth');

// 获取所有材料模板（包含签证类型信息）
router.get('/', async (req, res) => {
  try {
    const templates = await MaterialTemplate.find()
      .populate('packageId', 'name price')
      .sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    console.error('获取材料模板列表失败:', error);
    res.status(500).json({ message: '获取材料模板列表失败' });
  }
});

// 根据签证类型ID获取材料模板
router.get('/package/:packageId', async (req, res) => {
  try {
    const { packageId } = req.params;
    const template = await MaterialTemplate.findOne({ packageId })
      .populate('packageId', 'name price');
    
    if (!template) {
      return res.json(null);
    }
    
    res.json(template);
  } catch (error) {
    console.error('获取材料模板失败:', error);
    res.status(500).json({ message: '获取材料模板失败' });
  }
});

// 根据签证类型ID和客户类型ID获取材料清单
router.get('/package/:packageId/customer-type/:typeId', async (req, res) => {
  try {
    const { packageId, typeId } = req.params;
    const template = await MaterialTemplate.findOne({ packageId });
    
    if (!template) {
      return res.status(404).json({ message: '未找到该签证的材料模板' });
    }
    
    const customerType = template.customerTypes.find(ct => ct.typeId === typeId);
    if (!customerType) {
      return res.status(404).json({ message: '未找到该客户类型' });
    }
    
    res.json(customerType);
  } catch (error) {
    console.error('获取客户类型材料清单失败:', error);
    res.status(500).json({ message: '获取材料清单失败' });
  }
});

// 创建或更新材料模板（整体保存）
// 暂时移除auth用于初始化，初始化后建议加回
router.post('/', async (req, res) => {
  try {
    const { packageId, packageName, customerTypes } = req.body;
    
    if (!packageId || !packageName) {
      return res.status(400).json({ message: '缺少必填字段' });
    }
    
    // 验证签证类型是否存在
    const packageExists = await Package.findById(packageId);
    if (!packageExists) {
      return res.status(404).json({ message: '签证类型不存在' });
    }
    
    // 查找是否已有该签证类型的模板
    let template = await MaterialTemplate.findOne({ packageId });
    
    if (template) {
      // 更新现有模板
      template.packageName = packageName;
      template.customerTypes = customerTypes || [];
      await template.save();
    } else {
      // 创建新模板
      template = new MaterialTemplate({
        packageId,
        packageName,
        customerTypes: customerTypes || []
      });
      await template.save();
    }
    
    res.json({ message: '保存成功', template });
  } catch (error) {
    console.error('保存材料模板失败:', error);
    res.status(500).json({ message: '保存材料模板失败' });
  }
});

// 删除材料模板
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const template = await MaterialTemplate.findByIdAndDelete(id);
    
    if (!template) {
      return res.status(404).json({ message: '模板不存在' });
    }
    
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除材料模板失败:', error);
    res.status(500).json({ message: '删除材料模板失败' });
  }
});

// 添加客户类型
router.post('/:id/customer-type', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { typeId, typeName, description, order } = req.body;
    
    if (!typeId || !typeName) {
      return res.status(400).json({ message: '缺少必填字段' });
    }
    
    const template = await MaterialTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: '模板不存在' });
    }
    
    // 检查typeId是否已存在
    const exists = template.customerTypes.some(ct => ct.typeId === typeId);
    if (exists) {
      return res.status(400).json({ message: '该客户类型ID已存在' });
    }
    
    template.customerTypes.push({
      typeId,
      typeName,
      description: description || '',
      order: order || template.customerTypes.length,
      materials: []
    });
    
    await template.save();
    res.json({ message: '添加成功', template });
  } catch (error) {
    console.error('添加客户类型失败:', error);
    res.status(500).json({ message: '添加客户类型失败' });
  }
});

// 更新客户类型
router.put('/:id/customer-type/:typeId', auth, async (req, res) => {
  try {
    const { id, typeId } = req.params;
    const { typeName, description, order, materials } = req.body;
    
    const template = await MaterialTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: '模板不存在' });
    }
    
    const customerType = template.customerTypes.find(ct => ct.typeId === typeId);
    if (!customerType) {
      return res.status(404).json({ message: '客户类型不存在' });
    }
    
    if (typeName) customerType.typeName = typeName;
    if (description !== undefined) customerType.description = description;
    if (order !== undefined) customerType.order = order;
    if (materials !== undefined) customerType.materials = materials;
    
    await template.save();
    res.json({ message: '更新成功', template });
  } catch (error) {
    console.error('更新客户类型失败:', error);
    res.status(500).json({ message: '更新客户类型失败' });
  }
});

// 删除客户类型
router.delete('/:id/customer-type/:typeId', auth, async (req, res) => {
  try {
    const { id, typeId } = req.params;
    
    const template = await MaterialTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: '模板不存在' });
    }
    
    template.customerTypes = template.customerTypes.filter(ct => ct.typeId !== typeId);
    await template.save();
    
    res.json({ message: '删除成功', template });
  } catch (error) {
    console.error('删除客户类型失败:', error);
    res.status(500).json({ message: '删除客户类型失败' });
  }
});

// 添加材料项
router.post('/:id/customer-type/:typeId/material', auth, async (req, res) => {
  try {
    const { id, typeId } = req.params;
    const { materialId, name, required, needsImage, allowMultiple, description, order } = req.body;
    
    if (!materialId || !name) {
      return res.status(400).json({ message: '缺少必填字段' });
    }
    
    const template = await MaterialTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: '模板不存在' });
    }
    
    const customerType = template.customerTypes.find(ct => ct.typeId === typeId);
    if (!customerType) {
      return res.status(404).json({ message: '客户类型不存在' });
    }
    
    // 检查materialId是否已存在
    const exists = customerType.materials.some(m => m.materialId === materialId);
    if (exists) {
      return res.status(400).json({ message: '该材料ID已存在' });
    }
    
    customerType.materials.push({
      materialId,
      name,
      required: required || false,
      needsImage: needsImage || false,
      allowMultiple: allowMultiple || false,
      description: description || '',
      order: order !== undefined ? order : customerType.materials.length
    });
    
    await template.save();
    res.json({ message: '添加成功', template });
  } catch (error) {
    console.error('添加材料项失败:', error);
    res.status(500).json({ message: '添加材料项失败' });
  }
});

// 更新材料项
router.put('/:id/customer-type/:typeId/material/:materialId', auth, async (req, res) => {
  try {
    const { id, typeId, materialId } = req.params;
    const { name, required, needsImage, allowMultiple, description, order } = req.body;
    
    const template = await MaterialTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: '模板不存在' });
    }
    
    const customerType = template.customerTypes.find(ct => ct.typeId === typeId);
    if (!customerType) {
      return res.status(404).json({ message: '客户类型不存在' });
    }
    
    const material = customerType.materials.find(m => m.materialId === materialId);
    if (!material) {
      return res.status(404).json({ message: '材料项不存在' });
    }
    
    if (name) material.name = name;
    if (required !== undefined) material.required = required;
    if (needsImage !== undefined) material.needsImage = needsImage;
    if (allowMultiple !== undefined) material.allowMultiple = allowMultiple;
    if (description !== undefined) material.description = description;
    if (order !== undefined) material.order = order;
    
    await template.save();
    res.json({ message: '更新成功', template });
  } catch (error) {
    console.error('更新材料项失败:', error);
    res.status(500).json({ message: '更新材料项失败' });
  }
});

// 删除材料项
router.delete('/:id/customer-type/:typeId/material/:materialId', auth, async (req, res) => {
  try {
    const { id, typeId, materialId } = req.params;
    
    const template = await MaterialTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: '模板不存在' });
    }
    
    const customerType = template.customerTypes.find(ct => ct.typeId === typeId);
    if (!customerType) {
      return res.status(404).json({ message: '客户类型不存在' });
    }
    
    customerType.materials = customerType.materials.filter(m => m.materialId !== materialId);
    await template.save();
    
    res.json({ message: '删除成功', template });
  } catch (error) {
    console.error('删除材料项失败:', error);
    res.status(500).json({ message: '删除材料项失败' });
  }
});

module.exports = router;

