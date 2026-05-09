// CarouselManager.js
// 轮播图管理组件
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ManagerLayout from './components/ManagerLayout';

function CarouselManager({ token }) {
  const [carousels, setCarousels] = useState([]);
  const [file, setFile] = useState(null);
  const [order, setOrder] = useState(0);
  const [visible, setVisible] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const fileInput = useRef();

  const fetchCarousels = () => {
    axios.get('http://localhost:5000/api/carousels').then(res => setCarousels(res.data));
  };
  useEffect(fetchCarousels, []);

  const handleAdd = () => {
    setFile(null);
    setOrder(0);
    setVisible(true);
    setShowForm(true);
    setError('');
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) return setError('请选择图片');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('order', order);
      formData.append('visible', visible);
      await axios.post('http://localhost:5000/api/carousels', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      setFile(null); 
      setOrder(0); 
      setVisible(true);
      setShowForm(false);
      if (fileInput.current) {
        fileInput.current.value = '';
      }
      fetchCarousels();
    } catch (err) {
      setError('上传失败');
    }
  };

  const handleCancel = () => {
    setFile(null);
    setOrder(0);
    setVisible(true);
    setShowForm(false);
    setError('');
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('确定删除？')){
      await axios.delete(`http://localhost:5000/api/carousels/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchCarousels();
    }
  };

  const handleUpdate = async (id, data) => {
    await axios.put(`http://localhost:5000/api/carousels/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
    fetchCarousels();
  };

  return (
    <div className="compact-manager">
      <ManagerLayout 
        title="轮播图管理" 
        subtitle="管理首页轮播图片"
      >
        {/* 新增轮播图按钮 */}
        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            🖼️ 新增轮播图
          </button>
        </div>

        {/* 轮播图列表 */}
        <div className="list-section mb-4">
          <h4 className="section-title mb-3">轮播图列表</h4>
          <div className="row">
            {carousels.map(c => (
              <div className="col-md-4 mb-4" key={c._id}>
                <div className="card shadow-sm" style={{border: c.visible ? '2px solid #1976d2' : '2px solid #eee'}}>
                  <img 
                    src={`http://localhost:5000${c.imageUrl}`} 
                    alt="carousel" 
                    style={{width:'100%',height:180,objectFit:'cover',borderRadius:'8px 8px 0 0'}} 
                  />
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <span className="me-2 fw-bold">排序:</span>
                        <input
                          type="number"
                          value={c.order}
                          className="form-control form-control-sm"
                          style={{width:80}}
                          onChange={e =>
                            handleUpdate(c._id, {
                              order: Number(e.target.value),
                              visible: c.visible
                            })
                          }
                        />
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={c.visible}
                          onChange={e =>
                            handleUpdate(c._id, {
                              order: c.order,
                              visible: e.target.checked
                            })
                          }
                        />
                        <label className="form-check-label fw-bold">显示</label>
                      </div>
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDelete(c._id)}>删除</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 新增轮播图表单（条件显示） */}
        {showForm && (
          <div className="form-section">
            <h4 className="section-title mb-4">新增轮播图</h4>
            
            {/* 图片上传建议说明 */}
            <div className="alert alert-info mb-4">
              <h6 className="alert-heading fw-bold">📋 图片上传建议</h6>
              <ul className="mb-0">
                <li><strong>推荐尺寸：</strong>1100 × 550 像素（宽:高=2:1）</li>
                <li><strong>支持格式：</strong>JPG/PNG 格式，建议小于1MB</li>
                <li><strong>注意事项：</strong>请确保图片主体居中，避免重要内容靠近边缘</li>
                <li><strong>自动裁剪：</strong>非2:1图片将自动裁剪，可能导致内容丢失</li>
              </ul>
            </div>

            <form onSubmit={handleUpload} className="form-container">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">选择图片 *</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInput} 
                      onChange={e=>setFile(e.target.files[0])} 
                      className="form-control form-control-lg" 
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">排序</label>
                    <input 
                      type="number" 
                      className="form-control form-control-lg" 
                      placeholder="数字越小越靠前" 
                      value={order} 
                      onChange={e=>setOrder(Number(e.target.value))} 
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    checked={visible} 
                    onChange={e=>setVisible(e.target.checked)} 
                    id="carouselVisible" 
                  />
                  <label className="form-check-label fw-bold" htmlFor="carouselVisible">
                    显示此轮播图
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <button className="btn btn-primary btn-lg me-2" type="submit">上传轮播图</button>
                <button 
                  className="btn btn-secondary btn-lg" 
                  type="button" 
                  onClick={handleCancel}
                >
                  取消
                </button>
                {error && <span className="text-danger ms-3">{error}</span>}
              </div>
            </form>
          </div>
        )}
      </ManagerLayout>
    </div>
  );
}

export default CarouselManager; 
