import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyNotifications.css';

const MyNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, read
  const navigate = useNavigate();

  // 获取通知列表
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        setError('获取通知列表失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理通知点击
  const handleNotificationClick = (notification) => {
    // 如果通知未读，先标记为已读
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // 如果是申请类型通知且有related_id，跳转到申请详情页面
    if (notification.type === 'application' && notification.related_id) {
      navigate(`/admin/application-details/${notification.related_id}`);
    }
  };

  // 标记通知为已读
  const markAsRead = async (notificationId) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchNotifications(); // 刷新通知列表
      }
    } catch (err) {
      console.error('标记已读失败:', err);
    }
  };

  // 标记所有通知为已读
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchNotifications(); // 刷新通知列表
      }
    } catch (err) {
      console.error('标记所有已读失败:', err);
    }
  };

  // 删除通知
  const deleteNotification = async (notificationId) => {
    if (window.confirm('确定要删除这条通知吗？')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          fetchNotifications(); // 刷新通知列表
        }
      } catch (err) {
        console.error('删除通知失败:', err);
      }
    }
  };

  // 清空所有通知
  const clearAllNotifications = async () => {
    if (window.confirm('确定要清空所有通知吗？此操作不可撤销。')) {
      try {
        const token = localStorage.getItem('token');
        
        // 批量删除所有通知
        const deletePromises = notifications.map(notification => 
          fetch(`/api/notifications/${notification.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        );
        
        const results = await Promise.all(deletePromises);
        const allSuccess = results.every(response => response.ok);
        
        if (allSuccess) {
          fetchNotifications(); // 刷新通知列表
        } else {
          console.error('部分通知删除失败');
        }
      } catch (err) {
        console.error('清空通知失败:', err);
      }
    }
  };

  // 获取未读通知数量
  const getUnreadCount = () => {
    return notifications.filter(n => !n.is_read).length;
  };

  // 根据筛选条件过滤通知
  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.is_read);
      case 'read':
        return notifications.filter(n => n.is_read);
      default:
        return notifications;
    }
  };

  // 获取通知类型图标
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application':
        return '📝';
      case 'message':
        return '💬';
      case 'system':
        return '🔔';
      case 'job':
        return '💼';
      default:
        return '📢';
    }
  };

  // 获取通知类型标签
  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'application':
        return '申请通知';
      case 'message':
        return '消息通知';
      case 'system':
        return '系统通知';
      case 'job':
        return '职位通知';
      default:
        return '通知';
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = getUnreadCount();

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>我的通知</h1>
        <div className="notifications-stats">
          <span>共 {notifications.length} 条通知</span>
          {unreadCount > 0 && (
            <span className="unread-count">未读: {unreadCount}</span>
          )}
        </div>
      </div>

      <div className="notifications-actions">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            未读
          </button>
          <button 
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            已读
          </button>
        </div>
        
        <div className="action-buttons">
          {unreadCount > 0 && (
            <button 
              className="action-btn mark-all-read"
              onClick={markAllAsRead}
            >
              标记所有为已读
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              className="action-btn clear-all"
              onClick={clearAllNotifications}
            >
              清空所有
            </button>
          )}
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <p>暂无通知</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="notification-content">
                <div className="notification-header">
                  <span className="notification-type">
                    {getNotificationTypeLabel(notification.type)}
                  </span>
                  <span className="notification-time">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
                
                <div className="notification-title">
                  {notification.title}
                </div>
                
                <div className="notification-body">
                  {notification.content}
                </div>
                
                {notification.related_id && (
                  <div className="notification-actions">
                    <button 
                      className="read-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      标记为已读
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      删除
                    </button>
                  </div>
                )}
              </div>
              
              {!notification.is_read && <div className="unread-indicator"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyNotifications;