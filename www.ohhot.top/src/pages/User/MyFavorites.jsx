import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './MyFavorites.css';

const MyFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 获取收藏列表
  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.data || []);
      } else {
        setError('获取收藏列表失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  // 取消收藏
  const handleRemoveFavorite = async (jobId) => {
    try {
      const response = await fetch(`/api/favorites/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // 从列表中移除
        setFavorites(prev => prev.filter(fav => fav.job_id !== jobId));
      } else {
        setError('取消收藏失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    }
  };

  // 批量取消收藏
  const handleRemoveMultiple = async (jobIds) => {
    try {
      const promises = jobIds.map(jobId => 
        fetch(`/api/favorites/${jobId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      );
      
      const results = await Promise.all(promises);
      const allSuccess = results.every(response => response.ok);
      
      if (allSuccess) {
        setFavorites(prev => prev.filter(fav => !jobIds.includes(fav.job_id)));
      } else {
        setError('部分取消收藏失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="my-favorites">
      <div className="favorites-header">
        <h2>我的收藏</h2>
        <div className="favorites-info">
          <span>共 {favorites.length} 个收藏职位</span>
          {favorites.length > 0 && (
            <button 
              className="btn-clear-all"
              onClick={() => {
                if (window.confirm('确定要清空所有收藏吗？')) {
                  const jobIds = favorites.map(fav => fav.job_id);
                  handleRemoveMultiple(jobIds);
                }
              }}
            >
              清空所有收藏
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {favorites.length === 0 ? (
        <div className="no-favorites">
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <h3>还没有收藏职位</h3>
            <p>浏览职位时，点击收藏按钮将职位添加到收藏列表</p>
            <Link to="/jobs" className="btn-primary">
              浏览职位
            </Link>
          </div>
        </div>
      ) : (
        <div className="favorites-list">
          {favorites.map(favorite => (
            <div key={favorite.id} className="favorite-card">
              <div className="favorite-content">
                <div className="job-info">
                  <h4>
                    <Link to={`/jobs/${favorite.job_id}`}>
                      {favorite.job_title}
                    </Link>
                  </h4>
                  <div className="job-meta">
                    <span className="company">{favorite.company_name}</span>
                    <span className="salary">{favorite.salary_range}</span>
                    <span className="location">{favorite.city_name}</span>
                  </div>
                  <div className="job-description">
                    {favorite.job_description && (
                      <p>{favorite.job_description.substring(0, 100)}...</p>
                    )}
                  </div>
                </div>
                
                <div className="favorite-actions">
                  <Link 
                    to={`/jobs/${favorite.job_id}`}
                    className="btn-view"
                  >
                    查看详情
                  </Link>
                  <button 
                    className="btn-remove"
                    onClick={() => {
                      if (window.confirm('确定要取消收藏吗？')) {
                        handleRemoveFavorite(favorite.job_id);
                      }
                    }}
                  >
                    取消收藏
                  </button>
                </div>
              </div>
              
              <div className="favorite-footer">
                <span>收藏时间：{new Date(favorite.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFavorites;