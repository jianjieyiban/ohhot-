import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MyMessages.css';

const MyMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // 获取消息列表
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        setError('获取消息列表失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 标记消息为已读
  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchMessages(); // 刷新消息列表
      }
    } catch (err) {
      console.error('标记已读失败:', err);
    }
  };

  // 删除消息
  const deleteMessage = async (messageId) => {
    if (window.confirm('确定要删除这条消息吗？')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/messages/${messageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          fetchMessages(); // 刷新消息列表
          setSelectedMessage(null);
        }
      } catch (err) {
        console.error('删除消息失败:', err);
      }
    }
  };

  // 发送回复
  const sendReply = async () => {
    if (!replyContent.trim()) {
      alert('请输入回复内容');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiver_id: selectedMessage.sender_id,
          job_id: selectedMessage.job_id,
          content: replyContent,
          type: 'reply'
        })
      });
      
      if (response.ok) {
        setReplyContent('');
        alert('回复发送成功');
        fetchMessages(); // 刷新消息列表
      } else {
        alert('回复发送失败');
      }
    } catch (err) {
      alert('网络错误，请稍后重试');
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h1>我的消息</h1>
        <div className="messages-stats">
          <span>共 {messages.length} 条消息</span>
        </div>
      </div>

      <div className="messages-content">
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>暂无消息</p>
            </div>
          ) : (
            messages.map(message => (
              <div 
                key={message.id} 
                className={`message-item ${!message.is_read ? 'unread' : ''} ${selectedMessage?.id === message.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedMessage(message);
                  if (!message.is_read) {
                    markAsRead(message.id);
                  }
                }}
              >
                <div className="message-avatar">
                  {message.sender_name ? message.sender_name.charAt(0) : 'U'}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="sender-name">{message.sender_name || '未知用户'}</span>
                    <span className="message-time">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="message-preview">
                    {message.content}
                  </div>
                  {message.job_title && (
                    <div className="related-job">
                      相关职位: {message.job_title}
                    </div>
                  )}
                </div>
                {!message.is_read && <div className="unread-indicator"></div>}
              </div>
            ))
          )}
        </div>

        <div className="message-detail">
          {selectedMessage ? (
            <div className="message-detail-content">
              <div className="message-detail-header">
                <h3>消息详情</h3>
                <button 
                  className="delete-btn"
                  onClick={() => deleteMessage(selectedMessage.id)}
                >
                  删除
                </button>
              </div>
              
              <div className="message-info">
                <p><strong>发件人:</strong> {selectedMessage.sender_name || '未知用户'}</p>
                <p><strong>时间:</strong> {new Date(selectedMessage.created_at).toLocaleString()}</p>
                {selectedMessage.job_title && (
                  <p><strong>相关职位:</strong> {selectedMessage.job_title}</p>
                )}
              </div>
              
              <div className="message-body">
                {selectedMessage.content}
              </div>
              
              <div className="reply-section">
                <h4>回复消息</h4>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="请输入回复内容..."
                  rows="4"
                />
                <button 
                  className="reply-btn"
                  onClick={sendReply}
                >
                  发送回复
                </button>
              </div>
            </div>
          ) : (
            <div className="no-message-selected">
              <p>请选择一条消息查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyMessages;