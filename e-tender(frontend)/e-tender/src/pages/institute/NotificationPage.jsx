import React, { useState, useEffect } from "react";
import { FiBell, FiCheckCircle, FiAlertCircle, FiClock, FiAward, FiFilter, FiCheck, FiX, FiRefreshCw } from "react-icons/fi";

export default function VendorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const generatedNotifications = [];
      const now = new Date();

      // Fetch tenders
      const tendersRes = await fetch("http://127.0.0.1:8000/api/v1/tenders/all", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!tendersRes.ok) throw new Error("Failed to fetch tenders");
      const tendersData = await tendersRes.json();

      // Fetch user's bids
      let myBidsData = [];
      try {
        const bidsRes = await fetch("http://127.0.0.1:8000/api/v1/bids/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (bidsRes.ok) {
          myBidsData = await bidsRes.json();
        }
      } catch (err) {
        console.warn("Could not fetch bids:", err);
      }

      // 1. New tenders (published in last 24 hours)
      tendersData.forEach(tender => {
        const publishDate = new Date(tender.publish_date);
        const hoursOld = (now - publishDate) / (1000 * 60 * 60);
        
        if (hoursOld >= 0 && hoursOld <= 24) {
          generatedNotifications.push({
            id: `tender-new-${tender.tender_id}`,
            type: "tender",
            title: "🆕 New Tender Published",
            message: `${tender.title} has been published by ${tender.department?.institute?.institute_name || 'Institute'}`,
            timestamp: tender.publish_date,
            read: false,
            priority: "medium",
            icon: <FiBell />,
            color: "#3b82f6",
            tenderNumber: tender.tender_number
          });
        }
      });

      // 2. Tender deadlines approaching (within 3 days)
      tendersData.forEach(tender => {
        const deadline = new Date(tender.submission_deadline);
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        
        if (daysLeft > 0 && daysLeft <= 3) {
          const hasBid = myBidsData.some(bid => bid.tender_id === tender.tender_id);
          
          if (!hasBid) {
            generatedNotifications.push({
              id: `tender-deadline-${tender.tender_id}`,
              type: "tender",
              title: "⏰ Tender Deadline Approaching",
              message: `${tender.title} closes in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Submit your bid now!`,
              timestamp: new Date(now.getTime() - (24 - daysLeft) * 60 * 60 * 1000).toISOString(),
              read: false,
              priority: "high",
              icon: <FiAlertCircle />,
              color: "#ef4444",
              tenderNumber: tender.tender_number
            });
          }
        }
      });

      // 3. Closed tenders without bid
      tendersData.forEach(tender => {
        const deadline = new Date(tender.submission_deadline);
        if (deadline < now) {
          const hasBid = myBidsData.some(bid => bid.tender_id === tender.tender_id);
          
          if (!hasBid) {
            generatedNotifications.push({
              id: `tender-closed-${tender.tender_id}`,
              type: "tender",
              title: "🔒 Tender Bidding Closed",
              message: `Bidding for ${tender.title} has ended. You can view the tender details.`,
              timestamp: deadline.toISOString(),
              read: true,
              priority: "low",
              icon: <FiX />,
              color: "#6b7280",
              tenderNumber: tender.tender_number
            });
          }
        }
      });

      // 4. Bid status updates
      myBidsData.forEach(bid => {
        const statusMap = {
          awarded: { icon: '🏆', title: 'Congratulations! Bid Awarded', priority: 'high', color: '#10b981' },
          under_review: { icon: '⏳', title: 'Bid Under Review', priority: 'medium', color: '#f59e0b' },
          rejected: { icon: '❌', title: 'Bid Not Selected', priority: 'low', color: '#6b7280' },
          submitted: { icon: '✅', title: 'Bid Submitted', priority: 'low', color: '#3b82f6' }
        };

        const status = statusMap[bid.status] || statusMap.submitted;

        if (bid.status === 'awarded' || bid.status === 'under_review' || bid.status === 'rejected') {
          generatedNotifications.push({
            id: `bid-${bid.status}-${bid.bid_id}`,
            type: "bid",
            title: `${status.icon} ${status.title}`,
            message: `Your bid for "${bid.tender?.title || 'tender'}" - Amount: ₹${bid.bid_amount?.toLocaleString()}`,
            timestamp: bid.submission_date,
            read: bid.status === 'under_review' || bid.status === 'rejected' ? true : false,
            priority: status.priority,
            icon: status.icon === '✅' ? <FiCheckCircle /> : status.icon === '🏆' ? <FiAward /> : <FiClock />,
            color: status.color,
            bidAmount: bid.bid_amount,
            bidStatus: bid.status
          });
        }
      });

      // 5. System welcome notification
      generatedNotifications.push({
        id: "system-welcome",
        type: "system",
        title: "👋 Welcome Back!",
        message: "Stay informed about new tenders, deadline reminders, and bid updates in real-time.",
        timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: "low",
        icon: <FiCheckCircle />,
        color: "#8b5cf6"
      });

      // Sort by newest first
      generatedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(generatedNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message);
      setNotifications([{
        id: "error",
        type: "system",
        title: "⚠️ Error Loading Notifications",
        message: `Unable to fetch notifications: ${err.message}. Please try again.`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: "high",
        icon: <FiAlertCircle />,
        color: "#ef4444"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "unread" && notif.read) return false;
    if (filter === "read" && !notif.read) return false;
    if (categoryFilter !== "all" && notif.type !== categoryFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPriorityBadge = (priority) => {
    const config = {
      high: { bg: "#fee2e2", color: "#dc2626", text: "High" },
      medium: { bg: "#fef3c7", color: "#d97706", text: "Medium" },
      low: { bg: "#dbeafe", color: "#2563eb", text: "Low" }
    };
    return config[priority] || config.low;
  };

  return (
    <div className="vendor-notifications">
      {/* Header */}
      <div className="notifications-header">
        <div className="header-content">
          <div className="header-title">
            <FiBell size={32} />
            <div>
              <h1>Notifications</h1>
              <p>Real-time updates on tenders and bids</p>
            </div>
          </div>
          <div className="header-buttons">
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllAsRead}>
                <FiCheck size={18} />
                Mark all as read
              </button>
            )}
            <button className="refresh-btn" onClick={fetchNotifications} disabled={loading}>
              <FiRefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="notification-stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{notifications.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Unread</span>
            <span className="stat-value highlight">{unreadCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Today</span>
            <span className="stat-value">
              {notifications.filter(n => {
                const notifDate = new Date(n.timestamp);
                const today = new Date();
                return notifDate.toDateString() === today.toDateString();
              }).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <FiFilter size={18} />
          <span className="filter-label">Status:</span>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`filter-btn ${filter === "read" ? "active" : ""}`}
              onClick={() => setFilter("read")}
            >
              Read
            </button>
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-select"
          >
            <option value="all">All Categories</option>
            <option value="tender">Tenders</option>
            <option value="bid">Bids</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-content">
        {loading && notifications.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : error && notifications.length === 0 ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Unable to Load Notifications</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchNotifications}>
              Try Again
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No Notifications</h3>
            <p>
              {filter === "unread"
                ? "You're all caught up! No unread notifications."
                : categoryFilter !== "all"
                ? `No ${categoryFilter} notifications found.`
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => {
              const priorityBadge = getPriorityBadge(notification.priority);
              return (
                <div
                  key={notification.id}
                  className={`notification-card ${notification.read ? "read" : "unread"}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div
                    className="notification-icon"
                    style={{ backgroundColor: notification.color + "20", color: notification.color }}
                  >
                    {notification.icon}
                  </div>

                  <div className="notification-content">
                    <div className="notification-header-row">
                      <h3 className="notification-title">{notification.title}</h3>
                      <div className="notification-actions">
                        <span
                          className="priority-badge"
                          style={{
                            backgroundColor: priorityBadge.bg,
                            color: priorityBadge.color
                          }}
                        >
                          {priorityBadge.text}
                        </span>
                        {!notification.read && <div className="unread-dot"></div>}
                      </div>
                    </div>
                    
                    <p className="notification-message">{notification.message}</p>
                    
                    <div className="notification-footer">
                      <span className="notification-time">
                        <FiClock size={14} />
                        {getTimeAgo(notification.timestamp)}
                      </span>
                      <span className="notification-type">{notification.type}</span>
                      {notification.tenderNumber && (
                        <span className="notification-tender-ref">
                          Ref: {notification.tenderNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <FiX size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .vendor-notifications {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Header */
        .notifications-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          color: white;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-title h1 {
          font-size: 2rem;
          font-weight: 800;
          margin: 0 0 0.25rem 0;
        }

        .header-title p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.95rem;
        }

        .header-buttons {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .mark-all-btn, .refresh-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .mark-all-btn:hover, .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .notification-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
        }

        .stat-value.highlight {
          color: #fbbf24;
        }

        /* Filters */
        .filters-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          gap: 2rem;
          align-items: center;
          flex-wrap: wrap;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .filter-label {
          font-weight: 600;
          color: #64748b;
          font-size: 0.9rem;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: #64748b;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .filter-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .category-select {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
        }

        /* Notifications Content */
        .notifications-content {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .loading-state, .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          gap: 1rem;
          text-align: center;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-state p, .error-state p {
          color: #64748b;
          font-size: 1rem;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .error-state h3 {
          color: #dc2626;
          margin: 0.5rem 0;
        }

        .retry-btn {
          margin-top: 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .retry-btn:hover {
          background: #2563eb;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #64748b;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          color: #374151;
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }

        .empty-state p {
          margin: 0;
          line-height: 1.6;
        }

        /* Notifications List */
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .notification-card {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          background: white;
        }

        .notification-card.unread {
          background: #f0f9ff;
          border-color: #bae6fd;
        }

        .notification-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }

        .notification-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .notification-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .notification-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .priority-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .unread-dot {
          width: 10px;
          height: 10px;
          background: #3b82f6;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .notification-message {
          color: #64748b;
          line-height: 1.5;
          margin: 0 0 0.75rem 0;
          font-size: 0.9rem;
        }

        .notification-footer {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .notification-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #9ca3af;
          font-size: 0.8rem;
        }

        .notification-type {
          padding: 0.2rem 0.6rem;
          background: #f1f5f9;
          color: #64748b;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .notification-tender-ref {
          padding: 0.2rem 0.6rem;
          background: #e0f2fe;
          color: #0369a1;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .delete-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #fee2e2;
          color: #dc2626;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .notification-card:hover .delete-btn {
          opacity: 1;
        }

        .delete-btn:hover {
          background: #dc2626;
          color: white;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .notifications-header {
            padding: 1.5rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .header-title {
            flex-direction: column;
            align-items: flex-start;
          }

          .notification-stats {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .filters-section {
            flex-direction: column;
            align-items: flex-start;
          }

          .filter-buttons {
            flex-wrap: wrap;
          }

          .notification-card {
            flex-direction: column;
          }

          .delete-btn {
            opacity: 1;
          }

          .header-buttons {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}