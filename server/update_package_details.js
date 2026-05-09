// 更新签证套餐详细信息
const mongoose = require('mongoose');
const Package = require('./models/Package');
const config = require('./config');

async function updatePackageDetails() {
  try {
    console.log('========================================');
    console.log('  更新签证套餐详细信息');
    console.log('========================================\n');
    
    await mongoose.connect(config.mongoUri);
    console.log('✅ 数据库连接成功\n');

    // ===== 韩国签证 =====
    const koreaPackage = await Package.findOne({ name: '韩国签证' });
    if (koreaPackage) {
      koreaPackage.speed = '8-10个工作日';
      koreaPackage.price = 600;
      koreaPackage.originalPrice = 800;
      koreaPackage.description = '韩国单次/五年多次旅游商务签证办理，高通过率，可加急';
      koreaPackage.features = [
        '单次/多次签证',
        '五年多次代办',
        '4-5天加急服务',
        '简化材料指导',
        '拒签退款保障'
      ];
      koreaPackage.details = `<h3>韩国签证办理服务</h3>
<p><strong>服务优势：</strong></p>
<ul>
  <li>✅ <strong>多种类型</strong>：提供单次、多次、五年多次签证办理</li>
  <li>✅ <strong>加急服务</strong>：最快4-5个工作日出签</li>
  <li>✅ <strong>高通过率</strong>：专业团队材料审核，确保资料完整准确</li>
  <li>✅ <strong>简化流程</strong>：在线提交材料，无需本人前往领馆</li>
  <li>✅ <strong>拒签保障</strong>：因材料问题导致拒签可退款</li>
</ul>

<p><strong>办理时效：</strong></p>
<ul>
  <li>普通办理：8-10个工作日</li>
  <li>加急办理：4-5个工作日（需额外费用）</li>
  <li>特急办理：2-3个工作日（仅限紧急情况）</li>
</ul>

<p><strong>签证类型：</strong></p>
<ul>
  <li><strong>单次签证</strong>：有效期3个月，停留期最长90天</li>
  <li><strong>五年多次</strong>：有效期5年，每次停留最长90天（需满足条件）</li>
</ul>

<p><strong>五年多次申请条件（满足其一）：</strong></p>
<ul>
  <li>本科及以上学历毕业生</li>
  <li>近5年内访韩2次以上且无违规记录</li>
  <li>17岁以下或60岁以上（父母或本人）</li>
  <li>大型企业正式员工或公务员</li>
</ul>

<p><strong>所需材料：</strong></p>
<ul>
  <li>有效护照（有效期6个月以上）</li>
  <li>签证申请表（完整填写并签名）</li>
  <li>35mm×45mm白底彩色照片</li>
  <li>身份证正反面复印件</li>
  <li>户口本整本复印件</li>
  <li>在职证明（公司抬头纸，加盖公章）</li>
  <li>营业执照副本复印件（加盖公章）</li>
  <li>近6个月银行流水（需盖章，余额建议3万以上）</li>
  <li>行程计划、机票和酒店预订单</li>
  <li>房产证、车辆行驶证等资产证明（可选）</li>
</ul>

<p><strong>免签政策：</strong></p>
<ul>
  <li>济州岛免签：持有效护照可免签停留30天（仅限济州岛）</li>
  <li>过境免签：持第三国签证及30天内离境机票，可停留最多30天</li>
</ul>

<p><strong>费用说明：</strong></p>
<ul>
  <li>单次签证：260元（使领馆费）+ 服务费</li>
  <li>五年多次：520元（使领馆费）+ 服务费</li>
  <li>17岁以下、60岁以上免签证费，仅收取服务费</li>
</ul>`;
      
      await koreaPackage.save();
      console.log('✅ 韩国签证信息已更新');
    }

    // ===== 台湾签证 =====
    const taiwanPackage = await Package.findOne({ name: '台湾签证' });
    if (taiwanPackage) {
      taiwanPackage.speed = '5-7个工作日';
      taiwanPackage.price = 300;
      taiwanPackage.originalPrice = 400;
      taiwanPackage.description = '台湾入台证办理，电子版入台证，简化材料，快速审批';
      taiwanPackage.features = [
        '电子版入台证',
        '代办大通证咨询',
        '3个工作日加急',
        '材料简化指导',
        '全程在线办理'
      ];
      taiwanPackage.details = `<h3>台湾入台证办理服务</h3>
<p><strong>服务优势：</strong></p>
<ul>
  <li>✅ <strong>电子证件</strong>：电子版入台证，邮箱接收，彩色打印即可使用</li>
  <li>✅ <strong>快速审批</strong>：5-7个工作日出证，可提供3日加急</li>
  <li>✅ <strong>简化材料</strong>：专业指导，减少准备时间</li>
  <li>✅ <strong>在线办理</strong>：全程线上提交，无需邮寄原件</li>
  <li>✅ <strong>通证咨询</strong>：提供大陆居民往来台湾通行证办理咨询</li>
</ul>

<p><strong>证件说明（两证一签）：</strong></p>
<ul>
  <li><strong>大通证</strong>：大陆居民往来台湾通行证（在户籍地公安局办理，7-10工作日）</li>
  <li><strong>G签注</strong>：个人旅游签注（与大通证一起办理，有效期6个月）</li>
  <li><strong>入台证</strong>：台湾地区发放的入境许可（我方代办，有效期3个月，可停留15天）</li>
</ul>

<p><strong>办理时效：</strong></p>
<ul>
  <li>普通办理：5-7个工作日</li>
  <li>加急办理：3个工作日（需额外费用）</li>
  <li>旺季可能延长至10个工作日，建议提前2周办理</li>
</ul>

<p><strong>所需材料：</strong></p>
<ul>
  <li>大陆居民往来台湾通行证（有效期6个月以上，需有G签注）</li>
  <li>身份证正反面彩色扫描件</li>
  <li>2寸白底彩色照片（35mm×45mm，露出耳朵和额头）</li>
  <li>户口本首页及本人页扫描件</li>
  <li>财力证明（四选一）：
    <ul>
      <li>① 存款证明（≥2.5万元，冻结1个月以上）</li>
      <li>② 银行流水（近1个月，余额≥2.5万元，需盖章）</li>
      <li>③ 年收入证明（≥12.5万元，加盖公章）</li>
      <li>④ 金卡或白金信用卡正反面（Visa/Master/JCB/银联）</li>
    </ul>
  </li>
  <li>紧急联系人身份证正反面（必须是直系亲属）</li>
  <li>紧急联系人户口本相关页（证明亲属关系）</li>
  <li>在职证明或学生证/在读证明（可选）</li>
</ul>

<p><strong>紧急联系人要求：</strong></p>
<ul>
  <li>必须是直系亲属（父母、配偶、子女、兄弟姐妹）</li>
  <li>需提供身份证和户口本证明关系</li>
  <li>不同户口本需额外提供关系证明（出生证、结婚证等）</li>
</ul>

<p><strong>政策提醒：</strong></p>
<ul>
  <li>大陆居民赴台个人游自2019年8月暂停，目前仅福建居民可赴金门、马祖、澎湖</li>
  <li>其他省份可选择：团队游、商务入台、医美健检、探亲入台等方式</li>
  <li>政策可能随时调整，办理前请确认最新情况</li>
</ul>

<p><strong>使用说明：</strong></p>
<ul>
  <li>入台证为彩色PDF电子版，需彩色打印在A4纸上</li>
  <li>出境时出示大通证+G签注，入台时出示入台证</li>
  <li>建议多打印几份备用，全程随身携带</li>
</ul>`;
      
      await taiwanPackage.save();
      console.log('✅ 台湾签证信息已更新');
    }

    // ===== 美国签证 =====
    const usaPackage = await Package.findOne({ name: '美国签证' });
    if (usaPackage) {
      usaPackage.speed = '15-30个工作日';
      usaPackage.price = 1500;
      usaPackage.originalPrice = 2000;
      usaPackage.description = '美国B1/B2旅游商务签证、F1学生签证办理，包含DS-160填写指导、面谈预约、材料审核、面谈辅导';
      usaPackage.features = [
        'DS-160填写指导',
        '面谈预约代办',
        '1对1面谈辅导',
        '拒签再签分析',
        '全程专业指导'
      ];
      usaPackage.details = `<h3>美国签证办理服务</h3>
<p><strong>服务优势：</strong></p>
<ul>
  <li>✅ <strong>DS-160指导</strong>：专业团队协助填写DS-160表格，确保信息准确</li>
  <li>✅ <strong>面谈预约</strong>：代办签证费缴纳和面谈预约，节省时间</li>
  <li>✅ <strong>面谈辅导</strong>：1对1面谈模拟培训，提升通过率</li>
  <li>✅ <strong>材料审核</strong>：全面审核材料，避免因材料问题被拒</li>
  <li>✅ <strong>拒签分析</strong>：拒签后提供原因分析和再签方案</li>
</ul>

<p><strong>签证类型：</strong></p>
<ul>
  <li><strong>B1商务签证</strong>：参加会议、洽谈业务、考察市场等</li>
  <li><strong>B2旅游签证</strong>：旅游观光、探亲访友、医疗等</li>
  <li><strong>B1/B2签证</strong>：商务旅游综合签证（最常见）</li>
  <li><strong>F1学生签证</strong>：赴美留学（需I-20表格）</li>
</ul>

<p><strong>办理时效：</strong></p>
<ul>
  <li>预约面谈：高峰期2-4周，淡季可能1周内</li>
  <li>面谈后审理：一般3-5个工作日</li>
  <li>护照返还：通过后5-7个工作日收到</li>
  <li>建议提前时间：至少提前1-2个月，旺季建议2-3个月</li>
  <li>紧急情况（如家人病危）可申请加急面谈</li>
</ul>

<p><strong>签证有效期：</strong></p>
<ul>
  <li>通常签发10年多次往返签证</li>
  <li>每次停留期由入境时海关决定，一般不超过6个月</li>
  <li>需在签证有效期内入境美国</li>
</ul>

<p><strong>B1/B2旅游商务签证所需材料：</strong></p>
<ul>
  <li>护照原件（有效期6个月以上，至少2页空白签证页）</li>
  <li>51mm×51mm白底彩色照片（近6个月，正面免冠，不戴眼镜）</li>
  <li>DS-160确认页（在线填写并打印，含条形码）</li>
  <li>面谈预约确认页（缴费和预约后打印）</li>
  <li>身份证正反面清晰扫描件</li>
  <li>户口本整本复印件（首页到本人页所有家庭成员）</li>
  <li>在职证明（中英文对照，注明职位、收入、准假，加盖公章）</li>
  <li>营业执照副本复印件（加盖公章）</li>
  <li>近6个月银行流水（需盖章，余额建议5万以上）</li>
  <li>资产证明（房产证、车辆行驶证等）</li>
  <li>婚姻证明（结婚证或离婚证）</li>
  <li>旅行计划（行程安排、机票预订单、酒店预订单）</li>
  <li>全家福照片（体现家庭稳定性）</li>
</ul>

<p><strong>F1学生签证额外材料：</strong></p>
<ul>
  <li>I-20表格原件（美国学校签发）</li>
  <li>SEVIS费收据（I-901费用缴纳证明，$350）</li>
  <li>录取通知书原件</li>
  <li>学历证明（毕业证、学位证、成绩单）</li>
  <li>语言成绩（托福/雅思/SAT成绩单）</li>
  <li>资金证明（覆盖第一年学费和生活费）</li>
  <li>父母在职和收入证明</li>
</ul>

<p><strong>面谈准备：</strong></p>
<ul>
  <li><strong>常见问题</strong>：赴美目的、停留时间、工作情况、家庭情况、经济能力、回国计划等</li>
  <li><strong>面谈技巧</strong>：如实回答、简洁明了、保持自信、展示强烈回国意愿</li>
  <li><strong>携带材料</strong>：所有原件和复印件，以备签证官查看</li>
</ul>

<p><strong>费用说明：</strong></p>
<ul>
  <li>B1/B2签证费：约1120元人民币（$185美元，汇率浮动）</li>
  <li>F1学生签证费：约1120元人民币（$185美元）</li>
  <li>SEVIS费（学生签证）：$350美元</li>
  <li>签证费一经缴纳不退款，有效期一年可重新预约</li>
</ul>

<p><strong>拒签处理：</strong></p>
<ul>
  <li>214(b)条款最常见，表示未能证明非移民倾向</li>
  <li>可随时重新申请，需重新缴费</li>
  <li>建议补充更强的约束力证明（工作、财产、家庭等）</li>
  <li>我方提供拒签原因分析和再签材料指导</li>
</ul>`;
      
      await usaPackage.save();
      console.log('✅ 美国签证信息已更新');
    }

    console.log('\n========================================');
    console.log('  ✅ 所有签证套餐信息更新完成！');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ 更新失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 数据库连接已关闭\n');
  }
}

// 执行更新
if (require.main === module) {
  updatePackageDetails();
}

module.exports = updatePackageDetails;

