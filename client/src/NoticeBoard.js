// NoticeBoard.js
// 公告栏展示组件（手风琴样式，最多显�?条）
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    axios.get('/api/notices').then(res => {
      setNotices(res.data.filter(n => n.visible).slice(0, 8));
    });
  }, []);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10 col-sm-12">
          <div className="notice-card">
        <h2 style={{marginBottom: 20, fontSize: 28}}>公告�?/h2>
        <ul style={{listStyle:'none', padding:0, margin:0}}>
          {notices.map((notice, idx) => (
            <li key={notice._id} style={{borderBottom: idx!==notices.length-1?'1px solid #e3eaf2':'none', padding:'0'}}>
              <button
                style={{
                  width:'100%',
                  textAlign:'left',
                  background:'none',
                  border:'none',
                  outline:'none',
                  fontWeight:600,
                  fontSize:18,
                  padding:'15px 0',
                  color:'#1976d2',
                  cursor:'pointer',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'space-between',
                  transition:'color 0.2s',
                }}
                onClick={()=>setOpenIndex(openIndex===idx?null:idx)}
              >
                <span>{notice.title}</span>
                <span style={{fontSize:13, color:'#888', marginLeft:12}}>{new Date(notice.createdAt).toLocaleDateString()}</span>
              </button>
              {openIndex===idx && (
                <div style={{padding:'12px 16px 16px 16px', color:'#444', fontSize:15, lineHeight:1.6, background:'#f7f9fb', borderRadius:8, marginTop:6}}>
                  {notice.content}
                </div>
              )}
            </li>
          ))}
        </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoticeBoard; 
