// AdminLogin.js
// 后台管理登录页面
import React, { useState } from 'react';
import axios from 'axios';

function AdminLogin({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/admin/login', { username, password });
      const token = res.data.token;
      const user = res.data.user;
      if (token) {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('userInfo', JSON.stringify(user)); // 保存用户信息
      }
      onLogin(token);
    } catch (err) {
      setError(err.response?.data?.message || '登录失败，请检查账号密码');
    }
  };

  return (
    <div className="container" style={{maxWidth: 400, margin: '60px auto'}}>
      <h2 className="mb-4">后台管理登录</h2>
      <form onSubmit={handleSubmit} className="border p-4 rounded bg-white">
        <div className="mb-3">
          <label className="form-label">账号</label>
          <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">密码</label>
          <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary w-100" type="submit">登录</button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
      <button className="btn btn-link mt-3" onClick={onBack}>返回</button>
    </div>
  );
}

export default AdminLogin; 