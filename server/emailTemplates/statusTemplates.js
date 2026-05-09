// 签证办理状态邮件模版
// 支持手动发送模式；优化后的签证业务专用模板

function renderInfoBlocks(context, statusLabel, timeLabel, timeValue) {
  const safe = (v) => (v === undefined || v === null || v === '' ? '未填写' : v);
  
  // 格式化价格显示
  const formatPrice = () => {
    if (!context.visaPrice || context.visaPrice === 0) return '未填写';
    const currency = context.visaCurrency || 'CNY';
    const symbol = currency === 'CNY' ? '¥' : currency === 'JPY' ? '¥' : currency === 'USD' ? '$' : '€';
    return `${symbol} ${context.visaPrice} (${currency})`;
  };
  
  const priceText = formatPrice();
  
  return `
    <div style="background: white; border: 2px solid #e9ecef; border-radius: 10px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #1976d2; margin-top: 0;">📋 申请信息</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 120px;"><strong>申请编码：</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #1976d2; font-weight: bold;">${safe(context.applyCode)}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>姓名：</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${safe(context.name)}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>签证套餐：</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><span style="background: #e3f2fd; color: #1565c0; padding: 3px 10px; border-radius: 12px; font-size: 13px;">${safe(context.packageName)}</span></td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>签证次数：</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><span style="background: #fff3cd; color: #856404; padding: 3px 10px; border-radius: 12px; font-size: 13px;">${safe(context.visaType)}</span></td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>办理价格：</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><span style="background: #d4edda; color: #155724; padding: 3px 10px; border-radius: 12px; font-size: 13px;">${priceText}</span></td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>办理类型：</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><span style="background: #d1ecf1; color: #0c5460; padding: 3px 10px; border-radius: 12px; font-size: 13px;">${safe(context.customerTypeName)}</span></td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>当前状态：</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><span style="background: #1976d2; color: #fff; padding: 5px 15px; border-radius: 20px; font-size: 13px;">${statusLabel}</span></td></tr>
        <tr><td style="padding: 8px 0;"><strong>${timeLabel}：</strong></td><td style="padding: 8px 0;">${safe(timeValue)}</td></tr>
      </table>
    </div>
  `;
}

function renderFeedbackSection(context, showFeedback = false) {
  // 只有明确要求显示反馈，且反馈内容不为空时才显示
  if (!showFeedback || !context.feedback || context.feedback.trim() === '') return '';
  return `
    <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 16px 20px; margin: 16px 0;">
      <h3 style="color: #856404; margin: 0 0 8px 0;">💬 重要提示</h3>
      <div style="color: #856404; line-height: 1.6; white-space: pre-wrap;">${context.feedback}</div>
    </div>
  `;
}

const statusTemplates = {
    '待处理': {
      subject: '📋 您的签证申请已提交成功',
      html: (context) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FF6B35 0%, #E65100 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="margin: 0;">📋 签证申请已收到</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;"><strong>尊敬的 ${context.name} 您好！</strong></p>
            <p style="margin: 10px 0; color: #666;">感谢您选择我们的签证办理服务，您的申请已成功提交，我们正在为您安排专属客服。</p>
          </div>

          ${renderInfoBlocks(context, '待处理', '提交时间', context.submitTime)}
          
          <div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1976d2;">📢 接下来会发生什么？</h4>
            <ul style="margin: 10px 0; padding-left: 20px; color: #1565c0; line-height: 1.8;">
              <li>我们的专属客服将在<strong>1-2个工作日内</strong>与您联系</li>
              <li>请保持手机畅通，注意查收<strong>微信/LINE好友申请</strong></li>
              <li>客服会协助您准备和提交签证材料</li>
            </ul>
          </div>
          
          <div style="background: #fff3cd; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>💡 温馨提示：</strong>请提前准备好护照、在留卡等证件，以便加快办理进度。
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">此邮件由系统发送，请勿直接回复。如有疑问，请联系客服。</p>
        </div>
      `
    },
    
    '待确认': {
      subject: '📝 请补充签证材料',
      html: (context) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="margin: 0;">📝 需要补充材料</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;"><strong>尊敬的 ${context.name} 您好！</strong></p>
            <p style="margin: 10px 0; color: #666;">您的签证申请已进入材料审核阶段，请尽快补充所需材料，以便我们为您加快办理进度。</p>
          </div>
          
          ${renderInfoBlocks(context, '待确认', '更新时间', context.updateTime)}
          ${renderFeedbackSection(context, true)}
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">📋 请准备以下材料</h4>
            <p style="margin: 10px 0 0 0; color: #856404; line-height: 1.6;">
              请根据您的签证类型准备相应材料，具体清单请通过下方链接查看，或咨询您的专属客服。
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">此邮件由系统发送，请勿直接回复。如有疑问，请联系客服。</p>
        </div>
      `
    },
    
    '处理中': {
      subject: '⚡ 材料审核通过，正在办理中',
      html: (context) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="margin: 0;">⚡ 材料审核通过</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;"><strong>尊敬的 ${context.name} 您好！</strong></p>
            <p style="margin: 10px 0; color: #666;">好消息！您的签证材料已通过审核，我们正在为您办理签证手续。</p>
          </div>
          
          ${renderInfoBlocks(context, '处理中', '更新时间', context.updateTime)}
          ${renderFeedbackSection(context, true)}
          
          <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #155724;">🎉 办理进度</h4>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #155724; line-height: 1.8;">
              <li>您的材料已通过审核</li>
              <li>我们正在为您办理签证申请手续</li>
              <li>如有任何进展，我们会及时通知您</li>
            </ul>
          </div>
          
          <div style="background: #e3f2fd; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
            <p style="margin: 0; color: #1565c0; font-size: 14px;">
              <strong>💡 温馨提示：</strong>请保持联系方式畅通，如有需要，客服可能会与您联系确认信息。
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">此邮件由系统发送，请勿直接回复。如有疑问，请联系客服。</p>
        </div>
      `
    },
    
    '已完成': {
      subject: '🎉 恭喜！您的签证办理已完成',
      html: (context) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="margin: 0;">🎉 签证办理完成</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;"><strong>尊敬的 ${context.name} 您好！</strong></p>
            <p style="margin: 10px 0; color: #666;">恭喜您！您的签证办理已全部完成，感谢您选择我们的服务。</p>
          </div>
          
          ${renderInfoBlocks(context, '已完成', '完成时间', context.updateTime)}
          ${renderFeedbackSection(context, true)}
          
          <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #155724;">✅ 办理完成</h4>
            <p style="margin: 0 0 10px 0; color: #155724;">您的签证办理手续已全部完成，请注意查收相关通知。</p>
            <p style="margin: 0; color: #155724;">如有任何问题，欢迎随时联系我们的客服团队。</p>
          </div>
          
          <div style="background: #fff3cd; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>💡 温馨提示：</strong>感谢您的信任与支持，祝您生活愉快！
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">此邮件由系统发送，请勿直接回复。如有疑问，请联系客服。</p>
        </div>
      `
    },
    
    '已取消': {
      subject: '❌ 您的签证申请已取消',
      html: (context) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="margin: 0;">❌ 申请已取消</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;"><strong>尊敬的 ${context.name} 您好！</strong></p>
            <p style="margin: 10px 0; color: #666;">您的签证申请已被取消。</p>
          </div>
          
          ${renderInfoBlocks(context, '已取消', '取消时间', context.updateTime)}
          ${renderFeedbackSection(context, true)}
          
          <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #721c24;">💬 需要帮助？</h4>
            <p style="margin: 0; color: #721c24;">如果您对取消原因有疑问，或需要重新申请，请随时联系我们的客服团队，我们将竭诚为您服务。</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">此邮件由系统发送，请勿直接回复。如有疑问，请联系客服。</p>
        </div>
      `
    }
  };
  
  // 构建邮件内容
  function buildStatusEmail(status, context) {
    const template = statusTemplates[status];
    if (!template) {
      return null;
    }
    
    // 只有在"待确认"状态下才显示补充材料的链接
    const shouldShowMaterialLink = status === '待确认' && context.linkUrl;
    
    return {
      subject: template.subject,
      html: (typeof template.html === 'function' ? template.html(context) : template.html) +
        (shouldShowMaterialLink ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${context.linkUrl}" style="background: #0d6efd; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">点击立刻补充材料/查看进度</a>
          </div>
        ` : '')
    };
  }
  
  // 获取所有可用的状态
  function getAvailableStatuses() {
    return Object.keys(statusTemplates);
  }
  
  module.exports = { 
    buildStatusEmail, 
    getAvailableStatuses,
    statusTemplates 
  };