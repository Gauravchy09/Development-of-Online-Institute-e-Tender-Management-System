import React, { useState, useEffect } from "react";
import { FiBell, FiCheck, FiTrash2, FiFilter, FiSearch, FiClock, FiAlertCircle, FiInfo, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate API call to fetch notifications
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockNotifications = [
          {
            id: 1,
            type: 'bid_received',
            title: 'New Bid Received',
            message: 'Tech Solutions submitted a bid for Computer Lab Equipment tender (TEN-2024-001)',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            isRead: false,
            priority: 'high',
            actionUrl: '/department/dashboard/tenders'
          },
          {
            id: 2,
            type: 'deadline_approaching',
            title: 'Deadline Approaching',
            message: 'Classroom Furniture tender closes in 2 days. Current bids: 3',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            isRead: false,
            priority: 'medium',
            actionUrl: '/department/dashboard/tenders'
          },
          {
            id: 3,
            type: 'tender_published',
            title: 'Tender Published',
            message: 'Your tender "Library Books Procurement" has been published successfully',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            isRead: true,
            priority: 'low',
            actionUrl: '/department/dashboard/tenders'
          },
          {
            id: 4,
            type: 'bid_accepted',
            title: 'Bid Accepted',
            message: 'Your bid for Science Lab Equipment has been accepted by Admin',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            isRead: true,
            priority: 'medium',
            actionUrl: '/department/dashboard/tenders'
          },
          {
            id: 5,
            type: 'system_alert',
            title: 'System Maintenance',
            message: 'Scheduled maintenance this weekend. System may be unavailable for 2 hours.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
            isRead: true,
            priority: 'low',
            actionUrl: null
          }
        ];
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'bid_received':
        return <FiBell className="text-blue-500" />;
      case 'deadline_approaching':
        return <FiClock className="text-amber-500" />;
      case 'tender_published':
        return <FiCheckCircle className="text-green-500" />;
      case 'bid_accepted':
        return <FiInfo className="text-purple-500" />;
      case 'system_alert':
        return <FiAlertCircle className="text-gray-500" />;
      default:
        return <FiBell className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-amber-500 bg-amber-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'read' && notification.isRead);
    
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 1rem;
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #e2e8f0;
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <FiBell className="header-icon" />
            <div>
              <h1>Notifications</h1>
              <p>Stay updated with your block's tender activities</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-badge">
              <span className="stat-count">{unreadCount}</span>
              <span className="stat-label">Unread</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
          
          <div className="action-buttons">
            <button 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="action-btn primary"
            >
              <FiCheck size={16} />
              Mark All Read
            </button>
            <button 
              onClick={clearAll}
              disabled={notifications.length === 0}
              className="action-btn secondary"
            >
              <FiTrash2 size={16} />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-container">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <FiBell size={48} className="empty-icon" />
            <h3>No notifications found</h3>
            <p>
              {searchTerm || filter !== 'all' 
                ? 'No notifications match your current filters.' 
                : "You're all caught up! No new notifications."
              }
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-card ${getPriorityColor(notification.priority)} ${notification.isRead ? 'read' : 'unread'}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className="notification-time">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                  
                  <p className="notification-message">{notification.message}</p>
                  
                  {notification.actionUrl && (
                    <button 
                      onClick={() => window.location.href = notification.actionUrl}
                      className="action-link"
                    >
                      View Details
                    </button>
                  )}
                </div>
                
                <div className="notification-actions">
                  {!notification.isRead && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="action-btn icon"
                      title="Mark as read"
                    >
                      <FiCheck size={14} />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notification.id)}
                    className="action-btn icon delete"
                    title="Delete notification"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
                
                {!notification.isRead && (
                  <div className="unread-indicator"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .notifications-page {
          min-height: 100vh;
          padding: 0;
        }

        /* Header */
        .page-header {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          font-size: 2.5rem;
          color: #6366f1;
        }

        .header-title h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .header-title p {
          color: #64748b;
          margin: 0;
        }

        .header-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f8fafc;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .stat-count {
          font-size: 1.5rem;
          font-weight: 700;
          color: #6366f1;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
        }

        /* Controls */
        .controls-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          display: flex;
          gap: 1.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .filter-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #6366f1;
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn.primary {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
        }

        .action-btn.primary:hover:not(:disabled) {
          background: #4f46e5;
          transform: translateY(-1px);
        }

        .action-btn.secondary {
          background: white;
          color: #64748b;
        }

        .action-btn.secondary:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #d1d5db;
        }

        .action-btn.icon {
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: #64748b;
        }

        .action-btn.icon:hover {
          background: #f8fafc;
          color: #374151;
        }

        .action-btn.icon.delete:hover {
          color: #dc2626;
        }

        /* Notifications List */
        .notifications-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          color: #64748b;
        }

        .empty-icon {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          color: #374151;
          margin: 0 0 0.5rem 0;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
        }

        .notification-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.3s ease;
          position: relative;
          border-left: 4px solid transparent;
        }

        .notification-card:last-child {
          border-bottom: none;
        }

        .notification-card:hover {
          background: #f8fafc;
        }

        .notification-card.unread {
          background: #f8fafc;
        }

        .notification-icon {
          font-size: 1.5rem;
          margin-top: 0.25rem;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
          gap: 1rem;
        }

        .notification-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .notification-time {
          font-size: 0.8rem;
          color: #64748b;
          white-space: nowrap;
        }

        .notification-message {
          color: #64748b;
          margin: 0 0 0.75rem 0;
          line-height: 1.5;
        }

        .action-link {
          color: #6366f1;
          background: none;
          border: none;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0;
          text-decoration: underline;
        }

        .action-link:hover {
          color: #4f46e5;
        }

        .notification-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .unread-indicator {
          position: absolute;
          top: 1.5rem;
          left: 0.5rem;
          width: 8px;
          height: 8px;
          background: #6366f1;
          border-radius: 50%;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }

          .controls-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: auto;
          }

          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .action-buttons {
            justify-content: space-between;
          }

          .notification-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .notification-actions {
            align-self: flex-end;
          }
        }

        @media (max-width: 480px) {
          .page-header {
            padding: 1.5rem;
          }

          .header-title h1 {
            font-size: 1.5rem;
          }

          .notification-card {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}

// Helper function to format time ago
function formatTimeAgo(timestamp) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return timestamp.toLocaleDateString();
}