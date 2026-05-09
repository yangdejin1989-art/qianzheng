// 2025年最新版本 - 美国、台湾、韩国签证初始化配置
// 包含最新的材料要求、照片规格和常见问题

const mongoose = require('mongoose');
const Package = require('./models/Package');
const MaterialTemplate = require('./models/MaterialTemplate');
const QuestionTemplate = require('./models/QuestionTemplate');
const FAQ = require('./models/FAQ');

// MongoDB 连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/visa-system';

// ==================== 美国签证配置 2025 ====================
const usaMaterials = {
  tourist: {
    typeName: '旅游签证(B1/B2)',
    description: '适用于赴美旅游、探亲访友等短期停留',
    materials: [
      { 
        name: '护照原件', 
        required: true, 
        needsImage: true, 
        allowMultiple: false,
        description: '有效期必须在计划离美日期后至少6个月以上，至少有2页空白签证页（连续）' 
      },
      { 
        name: '签证照片', 
        required: true, 
        needsImage: true, 
        allowMultiple: false,
        description: '近6个月内拍摄，51mm×51mm（2英寸×2英寸），白色背景彩色照片，正面免冠，不戴眼镜' 
      },
      { 
        name: 'DS-160确认页', 
        required: true, 
        needsImage: true, 
        allowMultiple: false,
        description: '在线填写DS-160非移民签证申请表后打印的确认页，需包含条形码' 
      },
      { 
        name: '面谈预约确认页', 
        required: true, 
        needsImage: true, 
        allowMultiple: false,
        description: '完成签证费缴纳和面谈预约后的确认页' 
      },
      { 
        name: '身份证正反面', 
        required: true, 
        needsImage: true, 
        allowMultiple: false,
        description: '清晰的第二代身份证正反面扫描件或照片' 
      },
      { 
        name: '户口本整本', 
        required: true, 
        needsImage: true, 
        allowMultiple: false,
        description: '户口本首页、户主页、本人页及所有家庭成员页的清晰扫描件' 
      },
      { 
        name: '在职证明', 
        required: false, 
        needsImage: true, 
        allowMultiple: false,
        description: '公司抬头纸，需注明职位、入职时间、月薪、准假信息，领导签字并加盖公章（中英文对照）' 
      },
      { 
        name: '营业执照副本', 
        required: false, 
        needsImage: true, 
        allowMultiple: false,
        description: '加盖公章的营业执照副本复印件（彩色扫描）' 
      },
      { 
        name: '银行流水账单', 
        required: true, 
        needsImage: true, 
        allowMultiple: false,
        description: '近6个月工资卡或借记卡流水，需银行盖章，余额建议5万元以上' 
      },
      { 
        name: '资产证明', 
        required: false, 
        needsImage: true, 
        allowMultiple: true,
        description: '房产证、购房合同、车辆行驶证等资产证明复印件' 
      },
      { 
        name: '婚姻证明', 
        required: false, 
        needsImage: true, 
        allowMultiple: false,
        description: '结婚证或离婚证复印件（如适用）' 
      },
      { 
        name: '旅行计划', 
        required: false, 
        needsImage: true, 
        allowMultiple: false,
        description: '详细的旅行行程安排、机票预订单、酒店预订单' 
      },
      { 
        name: '全家福照片', 
        required: false, 
        needsImage: true, 
        allowMultiple: true,
        description: '家庭合影照片，体现家庭稳定性（2-3张）' 
      }
    ]
  },
  business: {
    typeName: '商务签证(B1)',
    description: '适用于赴美参加商务活动、会议、洽谈等',
    materials: [
      { name: '护照原件', required: true, needsImage: true, description: '有效期6个月以上，至少有2页空白签证页' },
      { name: '签证照片', required: true, needsImage: true, description: '51mm×51mm白底彩色照片，近6个月内拍摄' },
      { name: 'DS-160确认页', required: true, needsImage: true, description: '在线填写并打印，含条形码' },
      { name: '面谈预约确认页', required: true, needsImage: true, description: '签证费缴纳和预约确认' },
      { name: '身份证正反面', required: true, needsImage: true, description: '清晰扫描件' },
      { name: '在职证明', required: true, needsImage: true, description: '说明出访目的、公司抬头纸，加盖公章' },
      { name: '营业执照副本', required: true, needsImage: true, description: '加盖公章的彩色扫描件' },
      { name: '美方邀请函', required: true, needsImage: true, description: '美国公司的邀请函原件，说明访问目的、时间、费用承担等' },
      { name: '银行流水', required: true, needsImage: true, description: '近6个月银行流水，需盖章' },
      { name: '商务往来证明', required: false, needsImage: true, allowMultiple: true, description: '合作协议、邮件往来、订单等' }
    ]
  },
  student: {
    typeName: '学生签证(F1)',
    description: '适用于赴美留学的学生',
    materials: [
      { name: '护照原件', required: true, needsImage: true, description: '有效期6个月以上' },
      { name: '签证照片', required: true, needsImage: true, description: '51mm×51mm白底彩色照片' },
      { name: 'DS-160确认页', required: true, needsImage: true, description: '含条形码的确认页' },
      { name: 'I-20表格', required: true, needsImage: true, description: '美国学校签发的入学资格证明原件' },
      { name: 'SEVIS费收据', required: true, needsImage: true, description: 'I-901 SEVIS费用缴纳收据' },
      { name: '录取通知书', required: true, needsImage: true, description: '美国学校的正式录取通知书' },
      { name: '学历证明', required: true, needsImage: true, allowMultiple: true, description: '最高学历毕业证、学位证、成绩单' },
      { name: '语言成绩', required: true, needsImage: true, description: '托福/雅思/SAT等标准化考试成绩单' },
      { name: '资金证明', required: true, needsImage: true, description: '银行存款证明，覆盖第一年学费和生活费' },
      { name: '父母在职证明', required: true, needsImage: true, description: '父母双方的在职和收入证明' },
      { name: '户口本全本', required: true, needsImage: true, description: '全家户口本所有页' }
    ]
  }
};

// ==================== 台湾签证配置 2025 ====================
const taiwanMaterials = {
  tourist: {
    typeName: '个人旅游',
    description: '大陆居民赴台个人旅游（需先办理大通证）',
    materials: [
      { 
        name: '大陆居民往来台湾通行证', 
        required: true, 
        needsImage: true, 
        description: '有效的《往来台湾通行证》（大通证），有效期6个月以上，需有相应签注' 
      },
      { 
        name: '身份证正反面', 
        required: true, 
        needsImage: true, 
        description: '第二代居民身份证正反面彩色扫描件' 
      },
      { 
        name: '2寸白底彩照', 
        required: true, 
        needsImage: true, 
        description: '近期2寸白底彩色照片（35mm×45mm），需露出耳朵和额头' 
      },
      { 
        name: '户口本整本', 
        required: true, 
        needsImage: true, 
        description: '户口本首页及本人页彩色扫描件' 
      },
      { 
        name: '财力证明', 
        required: true, 
        needsImage: true, 
        description: '以下任选其一：\n① 存款证明（≥2.5万元人民币，冻结1个月以上）\n② 银行流水（近1个月，余额≥2.5万元）\n③ 年收入证明（≥12.5万元人民币，加盖公章）\n④ 金卡或白金信用卡正反面（Visa/Master/JCB/银联）' 
      },
      { 
        name: '紧急联系人身份证', 
        required: true, 
        needsImage: true, 
        description: '大陆紧急联系人（直系亲属）的身份证正反面扫描件' 
      },
      { 
        name: '紧急联系人户口本', 
        required: true, 
        needsImage: true, 
        description: '紧急联系人户口本相关页（证明与申请人的亲属关系）' 
      },
      { 
        name: '在职证明', 
        required: false, 
        needsImage: true, 
        description: '在职人员提供，需注明职位和月收入，加盖公章' 
      },
      { 
        name: '学生证或在读证明', 
        required: false, 
        needsImage: true, 
        description: '学生提供学生证或学校出具的在读证明' 
      }
    ]
  },
  business: {
    typeName: '商务入台',
    description: '适用于赴台商务交流、会议等',
    materials: [
      { name: '大陆居民往来台湾通行证', required: true, needsImage: true, description: '有效通行证' },
      { name: '身份证正反面', required: true, needsImage: true, description: '清晰彩色扫描件' },
      { name: '2寸白底彩照', required: true, needsImage: true, description: '35mm×45mm近期照片' },
      { name: '在职证明', required: true, needsImage: true, description: '需注明年收入13万元以上，职位，加盖公章' },
      { name: '营业执照副本', required: true, needsImage: true, description: '加盖公章的营业执照副本复印件' },
      { name: '台湾公司邀请函', required: true, needsImage: true, description: '台湾邀请方公司的正式邀请函' },
      { name: '台湾公司营业执照', required: true, needsImage: true, description: '台湾邀请公司的商业登记证明' },
      { name: '紧急联系人资料', required: true, needsImage: true, description: '紧急联系人身份证和户口本' }
    ]
  },
  family: {
    typeName: '探亲入台',
    description: '探望在台湾的直系亲属',
    materials: [
      { name: '大陆居民往来台湾通行证', required: true, needsImage: true, description: '有效通行证' },
      { name: '身份证正反面', required: true, needsImage: true, description: '彩色扫描件' },
      { name: '2寸白底彩照', required: true, needsImage: true, description: '近期照片' },
      { name: '台湾亲属身份证明', required: true, needsImage: true, description: '台湾亲属的身份证或台胞证复印件' },
      { name: '亲属关系证明', required: true, needsImage: true, description: '出生证明、户口本、结婚证等证明亲属关系的文件' },
      { name: '邀请函', required: true, needsImage: true, description: '台湾亲属的书面邀请函' },
      { name: '财力证明', required: true, needsImage: true, description: '存款证明或银行流水' }
    ]
  }
};

// ==================== 韩国签证配置 2025 ====================
const koreaMaterials = {
  tourist: {
    typeName: '个人旅游签证(C-3)',
    description: '单次/多次旅游签证',
    materials: [
      { 
        name: '护照原件', 
        required: true, 
        needsImage: true, 
        description: '有效期6个月以上，至少有2页空白签证页' 
      },
      { 
        name: '签证申请表', 
        required: true, 
        needsImage: true, 
        description: '完整填写并本人签名的签证申请表（可在韩国驻华使领馆网站下载）' 
      },
      { 
        name: '签证照片', 
        required: true, 
        needsImage: true, 
        description: '近6个月内拍摄，35mm×45mm白色背景彩色照片，正面免冠' 
      },
      { 
        name: '身份证正反面', 
        required: true, 
        needsImage: true, 
        description: '身份证原件及正反面复印件' 
      },
      { 
        name: '户口本整本', 
        required: true, 
        needsImage: true, 
        description: '全家户口本所有页复印件（从首页到本人页）' 
      },
      { 
        name: '在职证明', 
        required: true, 
        needsImage: true, 
        description: '公司抬头纸，注明职位、入职时间、月收入（中文即可），加盖公章' 
      },
      { 
        name: '营业执照副本', 
        required: true, 
        needsImage: true, 
        description: '加盖公章的营业执照副本复印件（彩色）' 
      },
      { 
        name: '银行流水', 
        required: true, 
        needsImage: true, 
        description: '近6个月银行工资卡流水，需银行盖章，余额建议3万元以上' 
      },
      { 
        name: '房产证', 
        required: false, 
        needsImage: true, 
        description: '房产证复印件（有助于提高签证通过率）' 
      },
      { 
        name: '车辆行驶证', 
        required: false, 
        needsImage: true, 
        description: '机动车行驶证复印件（如有）' 
      },
      { 
        name: '行程计划', 
        required: true, 
        needsImage: true, 
        description: '详细的韩国旅行行程安排、往返机票预订单、酒店预订单' 
      },
      { 
        name: '个人简历', 
        required: false, 
        needsImage: true, 
        description: '个人简历（包括教育背景、工作经历）' 
      }
    ]
  },
  family: {
    typeName: '探亲访友签证(C-3)',
    description: '探望在韩国的亲友',
    materials: [
      { name: '护照原件', required: true, needsImage: true, description: '有效期6个月以上' },
      { name: '签证申请表', required: true, needsImage: true, description: '完整填写并签名' },
      { name: '签证照片', required: true, needsImage: true, description: '35mm×45mm白底彩照' },
      { name: '身份证正反面', required: true, needsImage: true, description: '原件及复印件' },
      { name: '户口本整本', required: true, needsImage: true, description: '全家户口本复印件' },
      { name: '邀请函', required: true, needsImage: true, description: '韩国邀请人的邀请函（需公证）' },
      { name: '邀请人身份证明', required: true, needsImage: true, description: '邀请人的韩国登录证或身份证复印件' },
      { name: '邀请人居住证明', required: true, needsImage: true, description: '韩国邀请人的居住证明或房产证明' },
      { name: '关系证明', required: true, needsImage: true, description: '亲属关系证明（出生证、户口本、结婚证等）' },
      { name: '银行流水', required: true, needsImage: true, description: '近6个月银行流水，需盖章' },
      { name: '在职证明', required: false, needsImage: true, description: '在职人员提供' }
    ]
  },
  business: {
    typeName: '商务签证(C-3/C-4)',
    description: '短期商务、会议、市场调研等',
    materials: [
      { name: '护照原件', required: true, needsImage: true, description: '有效期6个月以上' },
      { name: '签证申请表', required: true, needsImage: true, description: '完整填写并签名' },
      { name: '签证照片', required: true, needsImage: true, description: '35mm×45mm白底彩照' },
      { name: '身份证正反面', required: true, needsImage: true, description: '原件及复印件' },
      { name: '营业执照副本', required: true, needsImage: true, description: '中方公司营业执照副本，加盖公章' },
      { name: '在职证明', required: true, needsImage: true, description: '说明访韩目的、时间，加盖公章' },
      { name: '韩方邀请函', required: true, needsImage: true, description: '韩国公司的正式邀请函（原件）' },
      { name: '韩方公司营业执照', required: true, needsImage: true, description: '韩国邀请公司的事业者登录证复印件' },
      { name: '商务往来证明', required: false, needsImage: true, allowMultiple: true, description: '合同、订单、往来邮件等' }
    ]
  }
};

// ==================== 问题模板配置 ====================

// 美国签证问题
const usaQuestions = {
  tourist: [
    { questionText: '您的旅行目的是什么？', required: true, helpText: '如：旅游观光、探访亲友、参加婚礼等' },
    { questionText: '计划在美国停留多长时间？', required: true, helpText: '请填写具体天数（建议不超过30天）' },
    { questionText: '预计出发日期', required: true, helpText: '格式：YYYY-MM-DD（建议至少提前1个月申请）' },
    { questionText: '预计返回日期', required: true, helpText: '格式：YYYY-MM-DD' },
    { questionText: '是否有美国亲友？', required: true, helpText: '请选择：是/否' },
    { questionText: '如有美国亲友，请提供姓名、关系和联系方式', required: false, helpText: '包括电话和地址' },
    { questionText: '您的婚姻状况', required: true, helpText: '未婚/已婚/离异/丧偶' },
    { questionText: '您的职业', required: true, helpText: '如：企业职员、教师、医生、自由职业等' },
    { questionText: '工作单位名称（中英文）', required: true, helpText: '' },
    { questionText: '职位名称（中英文）', required: true, helpText: '' },
    { questionText: '入职时间', required: true, helpText: '格式：YYYY-MM' },
    { questionText: '月收入（人民币）', required: true, helpText: '税前月收入' },
    { questionText: '单位详细地址（中英文）', required: true, helpText: '' },
    { questionText: '单位电话', required: true, helpText: '' },
    { questionText: '您的最高学历', required: true, helpText: '如：本科、硕士、博士等' },
    { questionText: '毕业院校', required: true, helpText: '' },
    { questionText: '是否去过其他国家？', required: true, helpText: '请选择：是/否' },
    { questionText: '如去过，请列举国家和时间', required: false, helpText: '特别是发达国家（欧洲、日本、澳洲等）' },
    { questionText: '是否有过美国签证申请记录？', required: true, helpText: '请选择：是/否' },
    { questionText: '如有，请说明申请时间和结果', required: false, helpText: '通过/拒签' },
    { questionText: '是否有过拒签史？', required: true, helpText: '任何国家的拒签记录都需如实填写' },
    { questionText: '如有拒签史，请说明拒签国家、时间和原因', required: false, helpText: '' },
    { questionText: '紧急联系人姓名', required: true, helpText: '在国内的紧急联系人' },
    { questionText: '紧急联系人电话', required: true, helpText: '手机号码' },
    { questionText: '紧急联系人与您的关系', required: true, helpText: '如：父母、配偶、子女等' },
    { questionText: '父亲姓名（中英文）', required: true, helpText: '' },
    { questionText: '父亲出生日期', required: true, helpText: '格式：YYYY-MM-DD' },
    { questionText: '母亲姓名（中英文）', required: true, helpText: '' },
    { questionText: '母亲出生日期', required: true, helpText: '格式：YYYY-MM-DD' }
  ],
  business: [
    { questionText: '此次商务访问的具体目的', required: true, helpText: '如：参加会议、商务洽谈、考察市场等' },
    { questionText: '美方邀请公司全称（英文）', required: true, helpText: '' },
    { questionText: '美方公司地址', required: true, helpText: '完整的街道地址' },
    { questionText: '美方联系人姓名', required: true, helpText: '' },
    { questionText: '美方联系人职位', required: true, helpText: '' },
    { questionText: '美方联系人电话', required: true, helpText: '' },
    { questionText: '美方联系人邮箱', required: true, helpText: '' },
    { questionText: '计划停留时间', required: true, helpText: '请填写具体天数' },
    { questionText: '预计出发日期', required: true, helpText: '格式：YYYY-MM-DD' },
    { questionText: '访问城市', required: true, helpText: '将要访问的所有城市' },
    { questionText: '您的职位（中英文）', required: true, helpText: '' },
    { questionText: '公司名称（中英文）', required: true, helpText: '' },
    { questionText: '公司地址（中英文）', required: true, helpText: '' },
    { questionText: '公司电话', required: true, helpText: '' },
    { questionText: '入职时间', required: true, helpText: '格式：YYYY-MM' },
    { questionText: '两公司的业务关系', required: true, helpText: '如：贸易伙伴、技术合作等' },
    { questionText: '费用承担方', required: true, helpText: '己方/美方/共同承担' },
    { questionText: '紧急联系人姓名', required: true, helpText: '' },
    { questionText: '紧急联系人电话', required: true, helpText: '' }
  ],
  student: [
    { questionText: '就读学校名称（英文全称）', required: true, helpText: '' },
    { questionText: '学校地址', required: true, helpText: '完整地址' },
    { questionText: '就读专业', required: true, helpText: '' },
    { questionText: '学位类型', required: true, helpText: '本科/硕士/博士' },
    { questionText: '入学时间', required: true, helpText: '格式：YYYY-MM' },
    { questionText: '预计毕业时间', required: true, helpText: '格式：YYYY-MM' },
    { questionText: 'SEVIS ID', required: true, helpText: 'I-20表格上的SEVIS编号' },
    { questionText: '托福/雅思成绩', required: true, helpText: '' },
    { questionText: 'SAT/GRE/GMAT成绩', required: false, helpText: '如适用' },
    { questionText: '第一年学费（美元）', required: true, helpText: '' },
    { questionText: '第一年生活费（美元）', required: true, helpText: '' },
    { questionText: '资金来源', required: true, helpText: '如：父母资助、奖学金等' },
    { questionText: '父亲姓名（中英文）', required: true, helpText: '' },
    { questionText: '父亲职业和单位', required: true, helpText: '' },
    { questionText: '父亲年收入（人民币）', required: true, helpText: '' },
    { questionText: '母亲姓名（中英文）', required: true, helpText: '' },
    { questionText: '母亲职业和单位', required: true, helpText: '' },
    { questionText: '母亲年收入（人民币）', required: true, helpText: '' },
    { questionText: '最高学历证明', required: true, helpText: '毕业院校和专业' },
    { questionText: '紧急联系人姓名', required: true, helpText: '' },
    { questionText: '紧急联系人电话', required: true, helpText: '' }
  ]
};

// 台湾签证问题
const taiwanQuestions = {
  tourist: [
    { questionText: '入台目的', required: true, helpText: '如：旅游观光' },
    { questionText: '计划入台日期', required: true, helpText: '格式：YYYY-MM-DD' },
    { questionText: '计划离台日期', required: true, helpText: '格式：YYYY-MM-DD' },
    { questionText: '计划停留天数', required: true, helpText: '最多15天' },
    { questionText: '是否有台湾亲友', required: true, helpText: '请选择：是/否' },
    { questionText: '如有台湾亲友，请提供姓名和联系方式', required: false, helpText: '包括电话号码' },
    { questionText: '职业', required: true, helpText: '如：企业职员/学生/退休等' },
    { questionText: '工作单位或学校', required: false, helpText: '在职人员或学生填写' },
    { questionText: '月收入或年收入', required: false, helpText: '在职人员填写' },
    { questionText: '个人邮箱', required: true, helpText: '用于接收电子版入台证，请填写常用邮箱' },
    { questionText: '个人手机号', required: true, helpText: '大陆手机号码' },
    { questionText: '紧急联系人姓名', required: true, helpText: '必须是直系亲属（父母/配偶/子女/兄弟姐妹）' },
    { questionText: '紧急联系人电话', required: true, helpText: '手机号码' },
    { questionText: '紧急联系人关系', required: true, helpText: '如：父母、配偶、子女、兄弟姐妹' },
    { questionText: '财力证明类型', required: true, helpText: '存款证明/银行流水/年收入证明/金卡信用卡（四选一）' },
    { questionText: '是否第一次入台', required: true, helpText: '请选择：是/否' },
    { questionText: '过往入台时间', required: false, helpText: '如曾入台，请填写最近一次时间' }
  ],
  business: [
    { questionText: '入台目的', required: true, helpText: '如：商务洽谈、参加展会、技术交流等' },
    { questionText: '台湾邀请公司名称', required: true, helpText: '完整公司名称' },
    { questionText: '台湾邀请公司地址', required: true, helpText: '' },
    { questionText: '台湾联系人姓名', required: true, helpText: '' },
    { questionText: '台湾联系人职位', required: true, helpText: '' },
    { questionText: '台湾联系人电话', required: true, helpText: '' },
    { questionText: '访问目的详细说明', required: true, helpText: '具体的商务活动内容' },
    { questionText: '计划入台日期', required: true, helpText: '格式：YYYY-MM-DD' },
    { questionText: '计划停留天数', required: true, helpText: '' },
    { questionText: '您的职位', required: true, helpText: '' },
    { questionText: '公司名称', required: true, helpText: '大陆公司全称' },
    { questionText: '公司地址', required: true, helpText: '' },
    { questionText: '年收入', required: true, helpText: '需13万元人民币以上' },
    { questionText: '个人邮箱', required: true, helpText: '用于接收入台证' },
    { questionText: '紧急联系人姓名', required: true, helpText: '' },
    { questionText: '紧急联系人电话', required: true, helpText: '' }
  ],
  family: [
    { questionText: '入台目的', required: true, helpText: '探望亲属' },
    { questionText: '台湾亲属姓名', required: true, helpText: '' },
    { questionText: '台湾亲属电话', required: true, helpText: '' },
    { questionText: '台湾亲属地址', required: true, helpText: '在台湾的详细住址' },
    { questionText: '与台湾亲属的关系', required: true, helpText: '如：父母、子女、配偶等' },
    { questionText: '计划入台日期', required: true, helpText: '格式：YYYY-MM-DD' },
    { questionText: '计划停留天数', required: true, helpText: '' },
    { questionText: '您的职业', required: true, helpText: '' },
    { questionText: '个人邮箱', required: true, helpText: '' },
    { questionText: '紧急联系人姓名', required: true, helpText: '大陆紧急联系人' },
    { questionText: '紧急联系人电话', required: true, helpText: '' }
  ]
};

// 韩国签证问题
const koreaQuestions = {
  tourist: [
    { questionText: '访韩目的', required: true, helpText: '如：旅游观光、购物等' },
    { questionText: '计划入境日期', required: true, helpText: '格式：YYYY-MM-DD' },
    { questionText: '计划离境日期', required: true, helpText: '格式：YYYY-MM-DD' },
    { questionText: '计划停留天数', required: true, helpText: '' },
    { questionText: '签证类型需求', required: true, helpText: '单次/五年多次（符合条件可申请五年多次）' },
    { questionText: '是否有韩国亲友', required: true, helpText: '请选择：是/否' },
    { questionText: '如有韩国亲友，请提供姓名和联系方式', required: false, helpText: '' },
    { questionText: '婚姻状况', required: true, helpText: '未婚/已婚/离异/丧偶' },
    { questionText: '职业', required: true, helpText: '' },
    { questionText: '工作单位名称', required: true, helpText: '学生填写学校名称，退休填写"退休"' },
    { questionText: '职位', required: false, helpText: '在职人员填写' },
    { questionText: '入职时间', required: false, helpText: '格式：YYYY-MM，在职人员填写' },
    { questionText: '月收入（人民币）', required: false, helpText: '在职人员填写' },
    { questionText: '单位地址', required: true, helpText: '详细地址' },
    { questionText: '单位电话', required: true, helpText: '' },
    { questionText: '韩国住宿地址', required: true, helpText: '酒店名称和详细地址' },
    { questionText: '访问韩国城市', required: true, helpText: '如：首尔、釜山、济州岛等' },
    { questionText: '是否去过韩国', required: true, helpText: '请选择：是/否' },
    { questionText: '如去过，请提供最近一次入境时间', required: false, helpText: '格式：YYYY-MM' },
    { questionText: '是否去过其他国家', required: true, helpText: '特别是欧美、日本、澳洲等' },
    { questionText: '紧急联系人姓名', required: true, helpText: '' },
    { questionText: '紧急联系人电话', required: true, helpText: '' },
    { questionText: '紧急联系人关系', required: true, helpText: '' }
  ],
  family: [
    { questionText: '访韩目的', required: true, helpText: '如：探望亲友' },
    { questionText: '邀请人姓名（韩文/中文）', required: true, helpText: '' },
    { questionText: '邀请人电话', required: true, helpText: '韩国电话号码' },
    { questionText: '邀请人地址', required: true, helpText: '在韩国的详细住址' },
    { questionText: '邀请人身份', required: true, helpText: '如：韩国公民/外国人登录证持有者/留学生等' },
    { questionText: '与邀请人的关系', required: true, helpText: '如：父母、子女、朋友等' },
    { questionText: '认识时间', required: true, helpText: '格式：YYYY-MM' },
    { questionText: '计划入境日期', required: true, helpText: '格式：YYYY-MM-DD' },
    { questionText: '计划停留天数', required: true, helpText: '' },
    { questionText: '您的职业', required: true, helpText: '' },
    { questionText: '工作单位或学校', required: false, helpText: '' },
    { questionText: '婚姻状况', required: true, helpText: '' },
    { questionText: '紧急联系人姓名', required: true, helpText: '在国内的紧急联系人' },
    { questionText: '紧急联系人电话', required: true, helpText: '' }
  ],
  business: [
    { questionText: '访韩目的', required: true, helpText: '如：商务洽谈、参加展会、技术交流' },
    { questionText: '韩方邀请公司名称（韩文/英文）', required: true, helpText: '' },
    { questionText: '韩方公司地址', required: true, helpText: '' },
    { questionText: '韩方联系人姓名', required: true, helpText: '' },
    { questionText: '韩方联系人职位', required: true, helpText: '' },
    { questionText: '韩方联系人电话', required: true, helpText: '' },
    { questionText: '访问目的详细说明', required: true, helpText: '' },
    { questionText: '计划入境日期', required: true, helpText: '格式：YYYY-MM-DD' },
    { questionText: '计划停留天数', required: true, helpText: '' },
    { questionText: '您的职位', required: true, helpText: '' },
    { questionText: '公司名称', required: true, helpText: '中方公司全称' },
    { questionText: '公司地址', required: true, helpText: '' },
    { questionText: '公司电话', required: true, helpText: '' },
    { questionText: '入职时间', required: true, helpText: '格式：YYYY-MM' },
    { questionText: '两公司业务关系', required: true, helpText: '如：贸易伙伴、技术合作等' },
    { questionText: '费用承担方', required: true, helpText: '己方/韩方/共同承担' },
    { questionText: '紧急联系人姓名', required: true, helpText: '' },
    { questionText: '紧急联系人电话', required: true, helpText: '' }
  ]
};

// ==================== FAQ常见问题配置 ====================

const usaFAQ = [
  {
    question: '美国签证照片有什么要求？',
    answer: `美国签证照片要求非常严格：
• 尺寸：51mm × 51mm（2英寸 × 2英寸）
• 背景：纯白色背景
• 拍摄时间：近6个月内拍摄
• 要求：正面免冠，不能戴眼镜
• 五官清晰，露出完整脸部、耳朵和额头
• 表情自然，不能笑得露齿
• 不能佩戴饰品（宗教原因除外）
• 电子版要求：JPEG格式，文件大小在240KB以内
建议到专业照相馆拍摄"美国签证照片"。`,
    category: '材料要求',
    order: 1
  },
  {
    question: 'DS-160表格如何填写？',
    answer: `DS-160是美国非移民签证电子申请表，填写步骤：
1. 访问美国使领馆官网的DS-160在线系统
2. 选择面谈的使领馆所在地
3. 准备好护照、照片电子版、旅行计划等信息
4. 逐页填写，注意随时保存（20分钟无操作会超时）
5. 填写完成后仔细检查
6. 提交并打印确认页（含条形码）

重要提示：
• 必须用英文填写
• 所有信息必须真实准确
• 保存好Application ID，以便继续填写
• 确认页上的照片必须符合要求`,
    category: '申请流程',
    order: 2
  },
  {
    question: '美国签证办理需要多长时间？',
    answer: `美国签证办理时间：
• 预约面谈：高峰期需等待2-4周，淡季可能1周内
• 面谈后：一般3-5个工作日可查询结果
• 护照返还：通过后5-7个工作日收到护照
• 建议提前时间：至少提前1-2个月开始准备
• 旺季（寒暑假）：建议提前2-3个月

加急服务：
紧急情况（如家人病危）可申请加急面谈，需提供证明材料。`,
    category: '办理时效',
    order: 3
  },
  {
    question: '面谈时签证官可能会问什么问题？',
    answer: `常见面谈问题：
1. 赴美目的：为什么去美国？
2. 行程安排：去多久？去哪些城市？
3. 职业情况：您的工作是什么？工作多久了？
4. 经济能力：谁承担旅行费用？月收入多少？
5. 家庭情况：婚姻状况？有孩子吗？
6. 出境记录：去过哪些国家？
7. 约束力：为什么会回国？

面谈技巧：
• 如实回答，不要撒谎
• 回答简洁明了，不要过度解释
• 保持自信和礼貌
• 准备好所有辅助材料
• 展示强烈的回国意愿`,
    category: '面谈指导',
    order: 4
  },
  {
    question: '美国签证费用是多少？可以退款吗？',
    answer: `美国签证费用（2025年）：
• B1/B2旅游商务签证：约1120元人民币（$185美元）
• F1学生签证：约1120元人民币（$185美元）
• 汇率会有浮动，以缴费时为准

注意事项：
• 签证费一经缴纳，无论是否获签，均不退款
• 签证费有效期：缴费后一年内可用于预约面谈
• 中信银行缴费或在线支付
• 缴费后保留收据，预约时需要

其他可能费用：
• SEVIS费（学生签证）：$350美元
• 快递费：约60元人民币（选择快递寄回护照）`,
    category: '费用说明',
    order: 5
  },
  {
    question: '如果被拒签了怎么办？',
    answer: `拒签后的处理：
1. 了解拒签原因
   • 214(b)条款：最常见，表示未能证明非移民倾向
   • 其他原因：材料不全、信息虚假等

2. 分析问题
   • 约束力不足（工作、财产、家庭等）
   • 行程不合理
   • 回答不当

3. 重新申请
   • 可以随时再次申请
   • 需重新缴纳签证费
   • 准备更充分的材料
   • 补充更强的约束力证明

4. 寻求专业帮助
   • 可咨询专业签证机构
   • 分析自身情况，改进不足

注意：拒签不是永久性的，找到问题并改进即可。`,
    category: '常见问题',
    order: 6
  }
];

const taiwanFAQ = [
  {
    question: '大陆居民赴台需要办理哪些证件？',
    answer: `大陆居民赴台需要"两证一签"：

1. 大陆居民往来台湾通行证（大通证）
   • 在户籍所在地公安局出入境管理处办理
   • 有效期5年
   • 办理时间：7-10个工作日

2. 台湾签注（G签）
   • 在办理大通证的同时申请
   • 有效期6个月，单次使用

3. 入台证
   • 由台湾移民署签发
   • 通过有资质的旅行社代办
   • 有效期3个月，可在台停留15天

办理顺序：先办大通证和签注，再办入台证。`,
    category: '证件办理',
    order: 1
  },
  {
    question: '台湾入台证的财力证明如何准备？',
    answer: `财力证明（四选一即可）：

1. 存款证明
   • 金额：≥2.5万元人民币
   • 冻结期：至少1个月（建议2-3个月）
   • 在银行办理，需银行盖章

2. 银行流水
   • 近1个月的流水
   • 余额≥2.5万元人民币
   • 需银行盖章

3. 年收入证明
   • 年收入≥12.5万元人民币
   • 公司开具，需加盖公章
   • 注明职位和收入金额

4. 信用卡
   • 金卡或以上级别
   • Visa/MasterCard/JCB/银联均可
   • 提供卡片正反面彩色复印件

建议：在职人员优先选择年收入证明或银行流水。`,
    category: '材料要求',
    order: 2
  },
  {
    question: '台湾入台证办理需要多久？',
    answer: `入台证办理时效：

正常办理：
• 工作日：5-7个工作日
• 提交完整材料后开始计算
• 不含邮寄时间

加急办理：
• 3个工作日（需额外费用）
• 仅限特殊情况

注意事项：
• 旺季（节假日、寒暑假）可能延长至10个工作日
• 建议至少提前2周办理
• 材料不全会延长办理时间

配额限制：
• 每日配额有限制
• 建议提前规划，避开高峰期`,
    category: '办理时效',
    order: 3
  },
  {
    question: '紧急联系人有什么要求？',
    answer: `紧急联系人要求：

1. 关系要求
   • 必须是直系亲属（父母、配偶、子女、兄弟姐妹）
   • 不能是朋友或其他关系

2. 所需材料
   • 紧急联系人身份证正反面
   • 紧急联系人户口本相关页
   • 证明与申请人的亲属关系

3. 关系证明
   • 同一户口本可直接体现关系
   • 不同户口本需提供：
     - 出生证明（证明与父母关系）
     - 结婚证（证明与配偶关系）
     - 派出所开具的亲属关系证明

建议：
• 优先选择父母或配偶作为紧急联系人
• 准备好完整的证明材料`,
    category: '材料要求',
    order: 4
  },
  {
    question: '入台证是电子版还是纸质版？如何使用？',
    answer: `入台证形式：

1. 电子版（彩色PDF）
   • 通过邮箱接收
   • 需彩色打印在A4纸上
   • 打印后随身携带

2. 使用方式
   • 出境：在大陆边检出示大通证+签注
   • 入台：在台湾入境时出示打印的入台证
   • 离台：出示大通证和入台证

注意事项：
• 必须彩色打印，黑白打印无效
• 打印件要清晰完整
• 建议多打印几份备用
• 全程随身携带，不要折叠
• 可保存电子版在手机中以备不时之需

有效期：
• 入台证有效期3个月
• 可在台停留15天
• 过期需重新办理`,
    category: '使用说明',
    order: 5
  },
  {
    question: '台湾个人游目前开放了吗？',
    answer: `台湾个人游政策（2025年）：

目前状态：
• 大陆居民赴台个人游自2019年8月1日起暂停
• 目前尚未全面恢复

部分开放：
• 福建居民可申请赴金门、马祖、澎湖地区个人游
• 其他省份居民仅可参加团队游

替代方案：
1. 跟团游（团进团出）
2. 商务入台（需商务邀请）
3. 医美健检（需医院邀请）
4. 探亲入台（需台湾亲属）
5. 参加会议、展览（需邀请函）

建议：
• 关注最新政策动态
• 咨询专业旅行社
• 根据实际需求选择合适的入台方式

注意：政策可能随时调整，办理前请确认最新情况。`,
    category: '政策说明',
    order: 6
  }
];

const koreaFAQ = [
  {
    question: '韩国签证照片有什么要求？',
    answer: `韩国签证照片要求：

尺寸和背景：
• 尺寸：35mm × 45mm（3.5cm × 4.5cm）
• 背景：纯白色背景
• 拍摄时间：近6个月内拍摄

照片要求：
• 正面免冠，露出完整面部
• 露出耳朵和额头
• 表情自然，嘴巴闭合
• 不能戴有色眼镜
• 眼睛睁开，直视镜头
• 不能佩戴夸张饰品

纸质和电子版：
• 纸质：高质量照片纸打印
• 电子版：如网上申请需JPEG格式
• 文件大小：100KB - 300KB

禁止事项：
• 不能使用自拍或翻拍
• 不能过度美颜和P图
• 不能戴美瞳
• 不能使用生活照

建议到专业照相馆拍摄"韩国签证照片"。`,
    category: '材料要求',
    order: 1
  },
  {
    question: '韩国五年多次往返签证的申请条件是什么？',
    answer: `韩国五年多次签证申请条件（2025年）：

基本条件（满足其一）：
1. 年龄条件
   • 17岁以下未成年人（父母同时申请）
   • 60岁以上老年人

2. 访韩记录
   • 近5年内持韩国签证访韩2次以上
   • 且无违法违规记录

3. 学历条件
   • 本科（含）以上学历毕业生
   • 需提供学历学位证书

4. 职业条件
   • 公务员（科级以上）
   • 大型企业正式员工
   • 需提供在职证明和社保

5. 财力条件
   • 近一年银行流水显示稳定收入
   • 持有房产、车产等资产证明

签证特点：
• 有效期：5年
• 每次停留：最长90天
• 可多次往返

建议：首次申请建议先申请单次，之后再申请多次。`,
    category: '签证类型',
    order: 2
  },
  {
    question: '韩国签证办理需要多长时间？',
    answer: `韩国签证办理时效：

正常办理：
• 工作日：8-10个工作日
• 从递交材料日开始计算
• 不含邮寄时间

加急办理：
• 工作日：4-5个工作日
• 需额外支付加急费
• 仅部分领区提供加急服务

特急：
• 工作日：2-3个工作日
• 仅限紧急情况
• 需提供证明材料（如机票、酒店订单）

影响因素：
• 领区不同时间可能有差异
• 旺季（节假日）可能延长
• 材料不全需补充材料会延长

建议出行时间：
• 提前至少2周开始准备材料
• 提前至少3周递交申请
• 不要购买不可退改的机票

注意：韩国签证中心周末和韩国公共假日不办公。`,
    category: '办理时效',
    order: 3
  },
  {
    question: '韩国签证费用是多少？',
    answer: `韩国签证费用（2025年）：

签证费（使领馆收取）：
• 单次签证：260元人民币
• 两次签证：390元人民币
• 多次签证（5年）：520元人民币

服务费（签证中心收取）：
• 基本服务费：约188元/人
• 快递费：60-80元（可选）
• 短信通知费：5元（可选）

加急费用：
• 加急服务：+200元左右
• 特急服务：+400元左右

其他费用：
• 照片拍摄：30-50元（如现场拍摄）
• 复印费：若干（如现场复印）
• 翻译费：视材料而定

优惠政策：
• 17岁以下、60岁以上免签证费（仅服务费）
• 团队申请可能有优惠

总费用：单次签证一般在500-600元左右。

注意：
• 拒签不退费
• 不同领区费用可能略有差异`,
    category: '费用说明',
    order: 4
  },
  {
    question: '哪些人可以免签去韩国？',
    answer: `韩国免签和免签证费政策（2025年）：

免签入境：
1. 济州岛免签
   • 持有效护照可免签入境济州岛
   • 停留时间：最多30天
   • 仅限济州岛，不能前往韩国其他地区

2. 过境免签
   • 经韩国前往第三国
   • 持有30天内离境机票
   • 持有第三国签证（美国、加拿大、日本、澳大利亚等）
   • 可在首尔等地停留最多30天

免签证费（仍需办签证）：
• 17岁以下未成年人
• 60岁以上老年人
• 仅免签证费，服务费仍需支付

免面试：
一般情况下韩国签证无需面试，递交材料即可。

注意事项：
• 即使免签入境，也要准备好往返机票、酒店预订等材料
• 免签不等于一定能入境，边检有权拒绝入境
• 有犯罪记录或曾被拒签者可能无法享受免签`,
    category: '免签政策',
    order: 5
  },
  {
    question: '韩国签证被拒签的常见原因有哪些？',
    answer: `韩国签证常见拒签原因：

1. 材料问题
   • 材料不全或不符合要求
   • 提供虚假材料
   • 照片不符合规格
   • 签证申请表填写有误

2. 经济能力不足
   • 银行流水余额不足
   • 收入证明不够
   • 无稳定工作
   • 无资产证明

3. 约束力不足
   • 单身、年轻、无业
   • 无房产、车产等固定资产
   • 户口在敏感地区（如东北三省、福建等）

4. 行程不合理
   • 行程安排与材料不符
   • 酒店、机票预订不合理

5. 有不良记录
   • 曾有非法滞留史
   • 曾在韩国有违法记录
   • 有其他国家拒签史

6. 敏感人群
   • 单身女性（尤其年轻）
   • 离异女性
   • 自由职业者
   • 无业人员

如何避免拒签：
• 提供完整真实的材料
• 增强约束力证明（资产、工作、家庭）
• 合理安排行程
• 如实填写申请表
• 曾有不良记录的如实说明并改正

拒签后：可立即重新申请，补充更充分的材料。`,
    category: '拒签问题',
    order: 6
  }
];

// ==================== 执行函数 ====================

async function initializeTemplates() {
  try {
    console.log('========================================');
    console.log('  2025年签证模板初始化程序');
    console.log('  美国 | 台湾 | 韩国');
    console.log('========================================\n');
    
    console.log('正在连接数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功！\n');

    // ===== 第一步：创建/更新签证套餐 =====
    console.log('📦 第一步：配置签证套餐...');
    
    // 美国签证
    let usaPackage = await Package.findOne({ name: '美国签证' });
    if (!usaPackage) {
      usaPackage = await Package.create({
        name: '美国签证',
        speed: '15-30个工作日',
        price: 1500,
        description: '美国B1/B2旅游商务签证、F1学生签证办理，包含DS-160填写指导、面谈预约、材料审核、面谈辅导',
        features: ['DS-160填写指导', '面谈预约代办', '1对1面谈辅导', '拒签再签分析', '全程专业指导'],
        visible: true
      });
      console.log('  ✅ 创建美国签证套餐');
    } else {
      usaPackage.description = '美国B1/B2旅游商务签证、F1学生签证办理，包含DS-160填写指导、面谈预约、材料审核、面谈辅导';
      usaPackage.features = ['DS-160填写指导', '面谈预约代办', '1对1面谈辅导', '拒签再签分析', '全程专业指导'];
      await usaPackage.save();
      console.log('  ✅ 更新美国签证套餐');
    }

    // 台湾签证
    let taiwanPackage = await Package.findOne({ name: '台湾签证' });
    if (!taiwanPackage) {
      taiwanPackage = await Package.create({
        name: '台湾签证',
        speed: '5-7个工作日',
        price: 300,
        description: '台湾入台证办理，电子版入台证，简化材料，快速审批',
        features: ['电子版入台证', '代办大通证咨询', '3个工作日加急', '材料简化指导', '全程在线办理'],
        visible: true
      });
      console.log('  ✅ 创建台湾签证套餐');
    } else {
      taiwanPackage.description = '台湾入台证办理，电子版入台证，简化材料，快速审批';
      taiwanPackage.features = ['电子版入台证', '代办大通证咨询', '3个工作日加急', '材料简化指导', '全程在线办理'];
      await taiwanPackage.save();
      console.log('  ✅ 更新台湾签证套餐');
    }

    // 韩国签证
    let koreaPackage = await Package.findOne({ name: '韩国签证' });
    if (!koreaPackage) {
      koreaPackage = await Package.create({
        name: '韩国签证',
        speed: '8-10个工作日',
        price: 600,
        description: '韩国单次/五年多次旅游商务签证办理，高通过率，可加急',
        features: ['单次/多次签证', '五年多次代办', '4-5天加急服务', '简化材料', '拒签退款'],
        visible: true
      });
      console.log('  ✅ 创建韩国签证套餐');
    } else {
      koreaPackage.description = '韩国单次/五年多次旅游商务签证办理，高通过率，可加急';
      koreaPackage.features = ['单次/多次签证', '五年多次代办', '4-5天加急服务', '简化材料', '拒签退款'];
      await koreaPackage.save();
      console.log('  ✅ 更新韩国签证套餐');
    }

    // ===== 第二步：配置材料模板 =====
    console.log('\n📋 第二步：配置材料模板...');
    await configureMaterialTemplate(usaPackage, usaMaterials, '美国签证');
    await configureMaterialTemplate(taiwanPackage, taiwanMaterials, '台湾签证');
    await configureMaterialTemplate(koreaPackage, koreaMaterials, '韩国签证');

    // ===== 第三步：配置问题模板 =====
    console.log('\n❓ 第三步：配置问题模板...');
    await configureQuestionTemplates(usaPackage, usaQuestions, '美国签证');
    await configureQuestionTemplates(taiwanPackage, taiwanQuestions, '台湾签证');
    await configureQuestionTemplates(koreaPackage, koreaQuestions, '韩国签证');

    // ===== 第四步：配置FAQ =====
    console.log('\n💡 第四步：配置常见问题FAQ...');
    await configureFAQ(usaPackage, usaFAQ, '美国签证');
    await configureFAQ(taiwanPackage, taiwanFAQ, '台湾签证');
    await configureFAQ(koreaPackage, koreaFAQ, '韩国签证');

    console.log('\n========================================');
    console.log('  ✅ 所有模板配置完成！');
    console.log('========================================');
    console.log('\n已配置内容：');
    console.log('  • 3个签证套餐');
    console.log('  • 8个客户类型材料模板');
    console.log('  • 8个问题模板');
    console.log(`  • ${usaFAQ.length + taiwanFAQ.length + koreaFAQ.length}个常见问题\n`);
    
  } catch (error) {
    console.error('\n❌ 配置过程中出错:', error);
    console.error('错误详情:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭\n');
  }
}

// ===== 辅助函数 =====

async function configureMaterialTemplate(packageObj, materialsConfig, packageName) {
  try {
    let template = await MaterialTemplate.findOne({ packageId: packageObj._id });
    
    const customerTypes = Object.keys(materialsConfig).map((key, index) => {
      const config = materialsConfig[key];
      return {
        typeId: key,
        typeName: config.typeName,
        description: config.description || '',
        order: index,
        materials: config.materials.map((mat, idx) => ({
          materialId: `${key}_mat_${idx + 1}`,
          name: mat.name,
          required: mat.required,
          needsImage: mat.needsImage,
          allowMultiple: mat.allowMultiple || false,
          description: mat.description,
          order: idx
        }))
      };
    });

    if (template) {
      template.customerTypes = customerTypes;
      await template.save();
      console.log(`  ✅ 更新 ${packageName} 材料模板（${customerTypes.length}个客户类型）`);
    } else {
      template = await MaterialTemplate.create({
        packageId: packageObj._id,
        packageName: packageObj.name,
        customerTypes
      });
      console.log(`  ✅ 创建 ${packageName} 材料模板（${customerTypes.length}个客户类型）`);
    }
  } catch (error) {
    console.error(`  ❌ 配置 ${packageName} 材料模板失败:`, error.message);
  }
}

async function configureQuestionTemplates(packageObj, questionsConfig, packageName) {
  try {
    let count = 0;
    for (const [customerTypeId, questions] of Object.entries(questionsConfig)) {
      let template = await QuestionTemplate.findOne({ 
        packageId: packageObj._id,
        customerTypeId 
      });

      const questionsData = questions.map((q, idx) => ({
        questionId: `${customerTypeId}_q_${idx + 1}`,
        questionText: q.questionText,
        required: q.required,
        helpText: q.helpText || '',
        order: idx
      }));

      if (template) {
        template.questions = questionsData;
        await template.save();
        count++;
      } else {
        const materialTemplate = await MaterialTemplate.findOne({ packageId: packageObj._id });
        const customerType = materialTemplate?.customerTypes.find(ct => ct.typeId === customerTypeId);
        
        template = await QuestionTemplate.create({
          packageId: packageObj._id,
          packageName: packageObj.name,
          customerTypeId,
          customerTypeName: customerType?.typeName || customerTypeId,
          questions: questionsData
        });
        count++;
      }
    }
    console.log(`  ✅ 配置 ${packageName} 问题模板（${count}个客户类型）`);
  } catch (error) {
    console.error(`  ❌ 配置 ${packageName} 问题模板失败:`, error.message);
  }
}

async function configureFAQ(packageObj, faqData, packageName) {
  try {
    let count = 0;
    for (const faq of faqData) {
      const existing = await FAQ.findOne({
        packageId: packageObj._id,
        question: faq.question
      });

      if (existing) {
        existing.answer = faq.answer;
        existing.category = faq.category;
        existing.order = faq.order;
        await existing.save();
      } else {
        await FAQ.create({
          packageId: packageObj._id,
          packageName: packageObj.name,
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          order: faq.order,
          visible: true
        });
        count++;
      }
    }
    console.log(`  ✅ 配置 ${packageName} FAQ（${faqData.length}个问题，新增${count}个）`);
  } catch (error) {
    console.error(`  ❌ 配置 ${packageName} FAQ失败:`, error.message);
  }
}

// 执行初始化
if (require.main === module) {
  initializeTemplates();
}

module.exports = { initializeTemplates };

