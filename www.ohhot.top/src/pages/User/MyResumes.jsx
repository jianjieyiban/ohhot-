import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './MyResumes.css';

const MyResumes = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingResume, setEditingResume] = useState(null);
  
  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    phone: '',
    email: '',
    education: '',
    experience: '',
    skills: '',
    introduction: ''
  });

  // 获取简历列表
  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resumes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResumes(data.data || []);
      } else {
        setError('获取简历列表失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  // 处理表单输入
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 创建或更新简历
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingResume ? `/api/resumes/${editingResume.id}` : '/api/resumes';
      const method = editingResume ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowCreateForm(false);
        setEditingResume(null);
        setFormData({
          title: '',
          name: '',
          phone: '',
          email: '',
          education: '',
          experience: '',
          skills: '',
          introduction: ''
        });
        fetchResumes();
      } else {
        setError(editingResume ? '更新简历失败' : '创建简历失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    }
  };

  // 编辑简历
  const handleEdit = (resume) => {
    setEditingResume(resume);
    setFormData({
      title: resume.title,
      name: resume.name || '',
      phone: resume.phone || '',
      email: resume.email || '',
      education: resume.education || '',
      experience: resume.experience || '',
      skills: resume.skills || '',
      introduction: resume.introduction || ''
    });
    setShowCreateForm(true);
  };

  // 删除简历
  const handleDelete = async (resumeId) => {
    if (!window.confirm('确定要删除这份简历吗？')) return;
    
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchResumes();
      } else {
        setError('删除简历失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="my-resumes">
      <div className="resumes-header">
        <h2>我的简历</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          创建新简历
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <div className="resume-form-overlay">
          <div className="resume-form">
            <h3>{editingResume ? '编辑简历' : '创建简历'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>简历标题 *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>姓名</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>电话</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>邮箱</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>教育背景</label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>工作经历</label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label>技能专长</label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>个人介绍</label>
                <textarea
                  name="introduction"
                  value={formData.introduction}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingResume ? '更新简历' : '创建简历'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingResume(null);
                    setFormData({
                      title: '',
                      name: '',
                      phone: '',
                      email: '',
                      education: '',
                      experience: '',
                      skills: '',
                      introduction: ''
                    });
                  }}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="no-resumes">
          <p>您还没有创建任何简历</p>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            创建第一份简历
          </button>
        </div>
      ) : (
        <div className="resumes-list">
          {resumes.map(resume => (
            <div key={resume.id} className="resume-card">
              <div className="resume-header">
                <h4>{resume.title}</h4>
                <div className="resume-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(resume)}
                  >
                    编辑
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(resume.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
              
              <div className="resume-content">
                {resume.name && <p><strong>姓名：</strong>{resume.name}</p>}
                {resume.phone && <p><strong>电话：</strong>{resume.phone}</p>}
                {resume.email && <p><strong>邮箱：</strong>{resume.email}</p>}
                {resume.education && (
                  <p><strong>教育背景：</strong>{resume.education}</p>
                )}
                {resume.experience && (
                  <p><strong>工作经历：</strong>{resume.experience}</p>
                )}
                {resume.skills && (
                  <p><strong>技能专长：</strong>{resume.skills}</p>
                )}
                {resume.introduction && (
                  <p><strong>个人介绍：</strong>{resume.introduction}</p>
                )}
              </div>
              
              <div className="resume-footer">
                <span>创建时间：{new Date(resume.created_at).toLocaleDateString()}</span>
                {resume.updated_at !== resume.created_at && (
                  <span>更新时间：{new Date(resume.updated_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyResumes;