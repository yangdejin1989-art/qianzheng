import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminNotesManager.css';

const AdminNotesManager = ({ applicationId }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 获取备注列表
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`/api/applications/${applicationId}/admin-notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data.adminNotes || []);
    } catch (error) {
      console.error('获取备注失败:', error);
      setMessage('获取备注失败');
    }
  };

  // 添加备注
  const addNote = async () => {
    if (!newNote.trim()) {
      setMessage('请输入备注内�?);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`/api/applications/${applicationId}/admin-notes`, 
        { content: newNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotes(response.data.adminNotes);
      setNewNote('');
      setMessage('备注添加成功');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('添加备注失败:', error);
      setMessage('添加备注失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除备注
  const deleteNote = async (noteId) => {
    if (!window.confirm('确定要删除这条备注吗�?)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(`/api/applications/${applicationId}/admin-notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotes(response.data.adminNotes);
      setMessage('备注删除成功');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('删除备注失败:', error);
      setMessage('删除备注失败');
    }
  };

  // 组件加载时获取备�?  useEffect(() => {
    if (applicationId) {
      fetchNotes();
    }
  }, [applicationId]);

  return (
    <div className="admin-notes-manager">
      <h4>📝 备注</h4>
      <div className="description">
        内部备注功能，仅管理员可见。用于记录客户沟通情况、处理进度、注意事项等内部信息，不会显示给客户�?      </div>
      
      {/* 添加备注 */}
      <div className="add-note-section">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="输入备注内容..."
          rows="3"
          className="note-textarea"
        />
        <button 
          onClick={addNote} 
          disabled={loading || !newNote.trim()}
          className="add-note-btn"
        >
          {loading ? '添加�?..' : '添加备注'}
        </button>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className="message">
          {message}
        </div>
      )}

      {/* 备注列表 */}
      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="no-notes">暂无备注</div>
        ) : (
          notes.map((note, index) => (
            <div key={note._id || index} className="note-item">
              <div className="note-content">
                {note.content}
              </div>
              <div className="note-footer">
                <span className="note-time">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
                <button 
                  onClick={() => deleteNote(note._id)}
                  className="delete-note-btn"
                  title="删除备注"
                >
                  🗑�?                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNotesManager;
