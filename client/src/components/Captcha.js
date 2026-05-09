import React, { useState, useEffect, useRef } from 'react';
import './Captcha.css';

const Captcha = ({ onCaptchaChange }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [captchaValid, setCaptchaValid] = useState(false);
  const canvasRef = useRef(null);

  // 生成随机验证�?  const generateCaptcha = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 生成4位随机字符（数字+字母�?    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let text = '';
    for (let i = 0; i < 4; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    
    // 设置背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制文字
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 为每个字符设置不同的颜色和位�?    for (let i = 0; i < text.length; i++) {
      const x = 30 + i * 25;
      const y = 20 + Math.random() * 10;
      const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
      ctx.fillStyle = color;
      ctx.fillText(text[i], x, y);
    }
    
    // 添加干扰�?    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `hsl(${Math.random() * 360}, 70%, 70%)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // 添加干扰�?    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 70%)`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }
  };

  // 验证输入
  const validateInput = (input) => {
    const isValid = input.toUpperCase() === captchaText;
    onCaptchaChange(input, isValid);
    return isValid;
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    const isValid = value.length === 4 && value.toUpperCase() === captchaText;
    setCaptchaValid(isValid);
    onCaptchaChange(value, isValid);
  };

  // 刷新验证�?  const refreshCaptcha = () => {
    generateCaptcha();
    setUserInput('');
    setCaptchaValid(false);
    onCaptchaChange('', false);
  };

  // 组件加载时生成验证码
  useEffect(() => {
    generateCaptcha();
  }, []);

  return (
    <div className="captcha-container">
      <div className="captcha-input-group">
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="请输�?位验证码"
          maxLength={4}
          className="captcha-input"
          style={{ textAlign: 'center' }}
        />
        <canvas
          ref={canvasRef}
          width="120"
          height="40"
          className="captcha-canvas"
          onClick={refreshCaptcha}
          title="点击刷新验证�?
          style={{ 
            display: 'block',
            margin: '0 auto'
          }}
        />
        <button
          type="button"
          onClick={refreshCaptcha}
          className="captcha-refresh-btn"
          title="刷新验证�?
        >
          🔄 刷新
        </button>
      </div>
      {userInput.length > 0 && userInput.length < 4 && (
        <div className="captcha-hint">请输入完整的4位验证码</div>
      )}
      {userInput.length === 4 && !captchaValid && (
        <div className="captcha-error">验证码错误，请重新输�?/div>
      )}
      {userInput.length === 4 && captchaValid && (
        <div className="captcha-success">�?验证码正�?/div>
      )}
    </div>
  );
};

export default Captcha;
