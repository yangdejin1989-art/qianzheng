// 主题配置文件
export const themes = {
  // 当前使用的主题：三色搭配（海涛蓝 + 荷花白 + 柠檬黄）
  current: {
    name: '瀑布青主题',
    colors: {
      background: '#DDFDE8',
      primary: '#74efe1',
      secondary: '#012baf',
      text: '#2c3e50',
      white: '#ffffff',
      border: '#e8f5e8',
      shadow: 'rgba(1, 43, 175, 0.1)',
      shadowHover: 'rgba(1, 43, 175, 0.15)',
      buttonGradient: 'linear-gradient(135deg, #74efe1 0%, #012baf 100%)',
      buttonHoverGradient: 'linear-gradient(135deg, #012baf 0%, #001a7a 100%)',
      navbarGradient: 'linear-gradient(135deg, #012baf 0%, #001a7a 100%)',
      footerGradient: 'linear-gradient(135deg, #012baf 0%, #001a7a 100%)',
      pageGradient: 'linear-gradient(135deg, #74efe1 0%, #012baf 100%)'
    }
  },

  // 之前的主题：淡黄色 + 高级灰 + 白色
  warm: {
    name: '温暖主题',
    colors: {
      background: '#ffffff',
      primary: '#f2965e',
      secondary: '#6b7280', // 高级灰色
      text: '#2c3e50',
      white: '#ffffff',
      border: '#f5f5f5',
      shadow: 'rgba(107, 114, 128, 0.1)',
      shadowHover: 'rgba(107, 114, 128, 0.15)',
      buttonGradient: 'linear-gradient(135deg, #f2965e 0%, #e67e22 100%)',
      buttonHoverGradient: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
      navbarGradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      footerGradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      pageGradient: 'linear-gradient(135deg, #f2965e 0%, #6b7280 100%)'
    }
  },

  // 商务蓝主题
  business: {
    name: '商务蓝主题',
    colors: {
      background: '#f8fafc',
      primary: '#3b82f6',
      secondary: '#1e40af',
      text: '#1f2937',
      white: '#ffffff',
      border: '#e2e8f0',
      shadow: 'rgba(59, 130, 246, 0.1)',
      shadowHover: 'rgba(59, 130, 246, 0.15)',
      buttonGradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      buttonHoverGradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
      navbarGradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
      footerGradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
      pageGradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
    }
  },

  // 清新绿主题
  fresh: {
    name: '清新绿主题',
    colors: {
      background: '#f0fdf4',
      primary: '#10b981',
      secondary: '#059669',
      text: '#064e3b',
      white: '#ffffff',
      border: '#d1fae5',
      shadow: 'rgba(16, 185, 129, 0.1)',
      shadowHover: 'rgba(16, 185, 129, 0.15)',
      buttonGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      buttonHoverGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      navbarGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      footerGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      pageGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    }
  },

  // 优雅紫主题
  elegant: {
    name: '优雅紫主题',
    colors: {
      background: '#faf5ff',
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      text: '#581c87',
      white: '#ffffff',
      border: '#e9d5ff',
      shadow: 'rgba(139, 92, 246, 0.1)',
      shadowHover: 'rgba(139, 92, 246, 0.15)',
      buttonGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      buttonHoverGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      navbarGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      footerGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      pageGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    }
  },

  // 活力橙主题
  vibrant: {
    name: '活力橙主题',
    colors: {
      background: '#fff7ed',
      primary: '#f97316',
      secondary: '#ea580c',
      text: '#9a3412',
      white: '#ffffff',
      border: '#fed7aa',
      shadow: 'rgba(249, 115, 22, 0.1)',
      shadowHover: 'rgba(249, 115, 22, 0.15)',
      buttonGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      buttonHoverGradient: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
      navbarGradient: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
      footerGradient: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
      pageGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
    }
  },

  // 三色搭配主题：海涛蓝 + 白色 + 柠檬黄
  tricolor: {
    name: '三色搭配主题',
    colors: {
      background: '#ffffff', // 纯白色
      primary: '#F8DF08',    // 柠檬黄
      secondary: '#012baf',  // 海涛蓝（深蓝色）
      text: '#2c3e50',
      white: '#ffffff',
      border: '#F8DF08',     // 柠檬黄作为边框
      shadow: 'rgba(1, 43, 175, 0.1)',
      shadowHover: 'rgba(1, 43, 175, 0.15)',
      buttonGradient: 'linear-gradient(135deg, #F8DF08 0%, #012baf 100%)',
      buttonHoverGradient: 'linear-gradient(135deg, #012baf 0%, #001a7a 100%)',
      navbarGradient: 'linear-gradient(135deg, #012baf 0%, #001a7a 100%)',
      footerGradient: 'linear-gradient(135deg, #012baf 0%, #001a7a 100%)',
      pageGradient: 'linear-gradient(135deg, #F8DF08 0%, #012baf 100%)'
    }
  },

  // 双色配色主题：孔雀蓝 + 藤萝紫 + 白色
  duotone: {
    name: '双色配色主题',
    colors: {
      background: '#ffffff', // 纯白色
      primary: '#07b0c9',    // 孔雀蓝
      secondary: '#e07898',  // 藤萝紫
      text: '#2c3e50',
      white: '#ffffff',
      border: '#07b0c9',     // 孔雀蓝作为边框
      shadow: 'rgba(7, 176, 201, 0.1)',
      shadowHover: 'rgba(7, 176, 201, 0.15)',
      buttonGradient: 'linear-gradient(135deg, #07b0c9 0%, #e07898 100%)',
      buttonHoverGradient: 'linear-gradient(135deg, #e07898 0%, #07b0c9 100%)',
      navbarGradient: 'linear-gradient(135deg, #07b0c9 0%, #e07898 100%)',
      footerGradient: 'linear-gradient(135deg, #07b0c9 0%, #e07898 100%)',
      pageGradient: 'linear-gradient(135deg, #07b0c9 0%, #e07898 100%)'
    }
  },

  // 柔和双色主题：淡蓝色 + 淡土黄色
  softDuotone: {
    name: '柔和双色主题',
    colors: {
      background: '#f0e1cd', // 淡土黄色作为背景
      primary: '#85caeb',    // 淡蓝色
      secondary: '#6bb8d9',  // 稍深的淡蓝色
      text: '#2c3e50',
      white: '#ffffff',
      border: '#85caeb',     // 淡蓝色作为边框
      shadow: 'rgba(133, 202, 235, 0.1)',
      shadowHover: 'rgba(133, 202, 235, 0.15)',
      buttonGradient: 'linear-gradient(135deg, #85caeb 0%, #6bb8d9 100%)',
      buttonHoverGradient: 'linear-gradient(135deg, #6bb8d9 0%, #5aa8c9 100%)',
      navbarGradient: 'linear-gradient(135deg, #85caeb 0%, #6bb8d9 100%)',
      footerGradient: 'linear-gradient(135deg, #85caeb 0%, #6bb8d9 100%)',
      pageGradient: 'linear-gradient(135deg, #85caeb 0%, #6bb8d9 100%)'
    }
  },

  // 高级感配色主题：深青蓝 + 中青蓝 + 浅青蓝 + 金黄 + 橙红
  premium: {
    name: '高级感配色主题',
    colors: {
      background: '#ffffff', // 纯白色背景
      primary: '#004E66',    // 深青蓝色（Color 01）
      secondary: '#51A3BC',  // 中青蓝色（Color 02）
      text: '#2c3e50',
      white: '#ffffff',
      border: '#E1EEF6',     // 浅青蓝色作为边框（Color 03）
      shadow: 'rgba(0, 78, 102, 0.1)',
      shadowHover: 'rgba(0, 78, 102, 0.15)',
      buttonGradient: 'linear-gradient(135deg, #FCBE32 0%, #FF5F2E 100%)', // 金黄到橙红
      buttonHoverGradient: 'linear-gradient(135deg, #FF5F2E 0%, #FCBE32 100%)',
      navbarGradient: 'linear-gradient(135deg, #004E66 0%, #51A3BC 100%)', // 深青蓝到中青蓝
      footerGradient: 'linear-gradient(135deg, #004E66 0%, #51A3BC 100%)',
      pageGradient: 'linear-gradient(135deg, #E1EEF6 0%, #51A3BC 100%)' // 浅青蓝到中青蓝
    }
  },

  // 纯色高级感配色主题：不使用渐变
  premiumSolid: {
    name: '纯色高级感主题',
    colors: {
      background: '#ffffff', // 纯白色背景
      primary: '#004E66',    // 深青蓝色（Color 01）
      secondary: '#51A3BC',  // 中青蓝色（Color 02）
      text: '#2c3e50',
      white: '#ffffff',
      border: '#E1EEF6',     // 浅青蓝色作为边框（Color 03）
      shadow: 'rgba(0, 78, 102, 0.1)',
      shadowHover: 'rgba(0, 78, 102, 0.15)',
      buttonGradient: '#FCBE32', // 纯金黄色
      buttonHoverGradient: '#FF5F2E', // 纯橙红色
      navbarGradient: '#004E66', // 纯深青蓝色
      footerGradient: '#004E66', // 纯深青蓝色
      pageGradient: '#E1EEF6' // 纯浅青蓝色
    }
  },

  // 简约纯色主题：只使用深青蓝色
  simpleSolid: {
    name: '简约纯色主题',
    colors: {
      background: '#ffffff', // 纯白色背景
      primary: '#004E66',    // 深青蓝色
      secondary: '#004E66',  // 深青蓝色（统一使用）
      text: '#2c3e50',
      white: '#ffffff',
      border: '#E1EEF6',     // 浅青蓝色作为边框
      shadow: 'rgba(0, 78, 102, 0.1)',
      shadowHover: 'rgba(0, 78, 102, 0.15)',
      buttonGradient: '#004E66', // 纯深青蓝色
      buttonHoverGradient: '#51A3BC', // 悬停时使用中青蓝色
      navbarGradient: '#004E66', // 纯深青蓝色
      footerGradient: '#004E66', // 纯深青蓝色
      pageGradient: '#ffffff' // 纯白色
    }
  },

  // 活力橙纯色主题：充满活力
  vibrantOrangeSolid: {
    name: '活力橙纯色主题',
    colors: {
      background: '#ffffff', // 纯白色背景
      primary: '#ff6b35',    // 活力橙色
      secondary: '#ff8c42',  // 明亮橙色
      text: '#2c3e50',
      white: '#ffffff',
      border: '#ffe4d6',     // 浅橙色边框
      shadow: 'rgba(255, 107, 53, 0.1)',
      shadowHover: 'rgba(255, 107, 53, 0.15)',
      buttonGradient: '#ff6b35', // 纯活力橙色
      buttonHoverGradient: '#ff8c42', // 悬停时使用明亮橙色
      navbarGradient: '#ff6b35', // 纯活力橙色
      footerGradient: '#ff6b35', // 纯活力橙色
      pageGradient: '#fff8f5' // 浅橙色背景
    }
  },

  // 活力粉纯色主题：青春活力
  vibrantPinkSolid: {
    name: '活力粉纯色主题',
    colors: {
      background: '#ffffff', // 纯白色背景
      primary: '#ff6b9d',    // 活力粉色
      secondary: '#ff8fab',  // 明亮粉色
      text: '#2c3e50',
      white: '#ffffff',
      border: '#ffe4f0',     // 浅粉色边框
      shadow: 'rgba(255, 107, 157, 0.1)',
      shadowHover: 'rgba(255, 107, 157, 0.15)',
      buttonGradient: '#ff6b9d', // 纯活力粉色
      buttonHoverGradient: '#ff8fab', // 悬停时使用明亮粉色
      navbarGradient: '#ff6b9d', // 纯活力粉色
      footerGradient: '#ff6b9d', // 纯活力粉色
      pageGradient: '#fff8fb' // 浅粉色背景
    }
  },

  // 活力青纯色主题：清新活力
  vibrantCyanSolid: {
    name: '活力青纯色主题',
    colors: {
      background: '#ffffff', // 纯白色背景
      primary: '#00d4aa',    // 活力青色
      secondary: '#00e6b8',  // 明亮青色
      text: '#2c3e50',
      white: '#ffffff',
      border: '#e6fffa',     // 浅青色边框
      shadow: 'rgba(0, 212, 170, 0.1)',
      shadowHover: 'rgba(0, 212, 170, 0.15)',
      buttonGradient: '#00d4aa', // 纯活力青色
      buttonHoverGradient: '#00e6b8', // 悬停时使用明亮青色
      navbarGradient: '#00d4aa', // 纯活力青色
      footerGradient: '#00d4aa', // 纯活力青色
      pageGradient: '#f0fffd' // 浅青色背景
    }
  },

  // 活力紫纯色主题：时尚活力
  vibrantPurpleSolid: {
    name: '活力紫纯色主题',
    colors: {
      background: '#ffffff', // 纯白色背景
      primary: '#a855f7',    // 活力紫色
      secondary: '#c084fc',  // 明亮紫色
      text: '#2c3e50',
      white: '#ffffff',
      border: '#f3e8ff',     // 浅紫色边框
      shadow: 'rgba(168, 85, 247, 0.1)',
      shadowHover: 'rgba(168, 85, 247, 0.15)',
      buttonGradient: '#a855f7', // 纯活力紫色
      buttonHoverGradient: '#c084fc', // 悬停时使用明亮紫色
      navbarGradient: '#a855f7', // 纯活力紫色
      footerGradient: '#a855f7', // 纯活力紫色
      pageGradient: '#faf5ff' // 浅紫色背景
    }
  },

  // 活力黄纯色主题：阳光活力
  vibrantYellowSolid: {
    name: '活力黄纯色主题',
    colors: {
      background: '#ffffff', // 纯白色背景
      primary: '#fbbf24',    // 活力黄色
      secondary: '#fcd34d',  // 明亮黄色
      text: '#2c3e50',
      white: '#ffffff',
      border: '#fef3c7',     // 浅黄色边框
      shadow: 'rgba(251, 191, 36, 0.1)',
      shadowHover: 'rgba(251, 191, 36, 0.15)',
      buttonGradient: '#fbbf24', // 纯活力黄色
      buttonHoverGradient: '#fcd34d', // 悬停时使用明亮黄色
      navbarGradient: '#fbbf24', // 纯活力黄色
      footerGradient: '#fbbf24', // 纯活力黄色
      pageGradient: '#fffbeb' // 浅黄色背景
    }
  },

  // 活力红纯色主题：热情活力
  vibrantRedSolid: {
    name: '活力红纯色主题',
    colors: {
      background: '#ffffff', // 纯白色背景
      primary: '#ef4444',    // 活力红色
      secondary: '#f87171',  // 明亮红色
      text: '#2c3e50',
      white: '#ffffff',
      border: '#fee2e2',     // 浅红色边框
      shadow: 'rgba(239, 68, 68, 0.1)',
      shadowHover: 'rgba(239, 68, 68, 0.15)',
      buttonGradient: '#ef4444', // 纯活力红色
      buttonHoverGradient: '#f87171', // 悬停时使用明亮红色
      navbarGradient: '#ef4444', // 纯活力红色
      footerGradient: '#ef4444', // 纯活力红色
      pageGradient: '#fef2f2' // 浅红色背景
    }
  }
};

// 获取当前主题
export const getCurrentTheme = () => {
  const savedTheme = localStorage.getItem('kdai-theme');
  // 检查保存的主题是否存在，如果不存在则使用默认主题
  if (savedTheme && themes[savedTheme]) {
    return themes[savedTheme];
  }
  // 清除可能存在的无效主题设置
  localStorage.removeItem('kdai-theme');
  return themes.warm; // 默认使用温暖主题
};

// 设置主题
export const setTheme = (themeName) => {
  if (themes[themeName]) {
    localStorage.setItem('kdai-theme', themeName);
    applyTheme(themes[themeName]);
  }
};

// 应用主题到CSS变量
export const applyTheme = (theme) => {
  // 安全检查：确保theme和theme.colors存在
  if (!theme || !theme.colors) {
    console.warn('Invalid theme provided, using default theme');
    theme = themes.warm; // 默认使用温暖主题
  }
  
  const root = document.documentElement;
  const colors = theme.colors;
  
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--text', colors.text);
  root.style.setProperty('--white', colors.white);
  root.style.setProperty('--border', colors.border);
  root.style.setProperty('--shadow', colors.shadow);
  root.style.setProperty('--shadow-hover', colors.shadowHover);
  root.style.setProperty('--button-gradient', colors.buttonGradient);
  root.style.setProperty('--button-hover-gradient', colors.buttonHoverGradient);
  root.style.setProperty('--navbar-gradient', colors.navbarGradient);
  root.style.setProperty('--footer-gradient', colors.footerGradient);
  root.style.setProperty('--page-gradient', colors.pageGradient);
}; 
