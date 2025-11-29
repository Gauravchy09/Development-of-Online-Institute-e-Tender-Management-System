import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiTrendingUp, FiFileText, FiClock, FiAward, FiAlertCircle, FiArrowRight } from "react-icons/fi";

export default function VendorHome({ user }) {
  const [stats, setStats] = useState({
    activeBids: 0,
    submittedBids: 0,
    wonTenders: 0,
    pendingActions: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tendersRes, myBidsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/v1/tenders/all", { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          fetch("http://127.0.0.1:8000/api/v1/bids/", { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ]);

        if (!tendersRes.ok || !myBidsRes.ok) {
          throw new Error("Failed to fetch data.");
        }
        
        const tendersData = await tendersRes.json();
        const myBidsData = await myBidsRes.json();

        // Calculate statistics
        const now = new Date();
        const activeTenders = tendersData.filter(t => new Date(t.submission_deadline) > now);
        const submittedBids = myBidsData.length;
        const wonBids = myBidsData.filter(bid => bid.status === 'awarded').length;
        
        // Get upcoming deadlines (tenders that haven't been bid on and are still open)
        const myBidTenderIds = new Set(myBidsData.map(bid => bid.tender_id));
        const openTenders = tendersData.filter(t => {
          const deadline = new Date(t.submission_deadline);
          return deadline > now && !myBidTenderIds.has(t.tender_id);
        });
        
        // Sort by deadline and take top 5
        const upcomingTenderDeadlines = openTenders
          .sort((a, b) => new Date(a.submission_deadline) - new Date(b.submission_deadline))
          .slice(0, 5)
          .map(tender => ({
            id: tender.tender_id,
            title: tender.title,
            deadline: tender.submission_deadline,
            priority: getDaysUntil(tender.submission_deadline) <= 3 ? 'high' : 
                     getDaysUntil(tender.submission_deadline) <= 7 ? 'medium' : 'low',
            tender_id: tender.tender_id
          }));

        // Calculate pending actions (bids that are under review)
        const pendingBids = myBidsData.filter(bid => bid.status === 'submitted' || bid.status === 'under_review').length;

        setStats({
          activeBids: activeTenders.length,
          submittedBids: submittedBids,
          wonTenders: wonBids,
          pendingActions: pendingBids
        });

        // Generate recent activities from bids
        const activities = myBidsData
          .sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date))
          .slice(0, 5)
          .map(bid => ({
            id: bid.bid_id,
            type: bid.status === 'awarded' ? 'payment_received' : 
                  bid.status === 'under_review' ? 'bid_updated' : 'bid_submitted',
            title: `Bid ${bid.status === 'awarded' ? 'won' : bid.status === 'under_review' ? 'under review' : 'submitted'} for ${bid.tender?.title || 'tender'}`,
            time: getTimeAgo(bid.submission_date),
            status: bid.status === 'awarded' ? 'success' : 
                   bid.status === 'under_review' ? 'warning' : 'info'
          }));

        // Add tender alerts for new tenders (published today)
        const newTenders = tendersData
          .filter(t => {
            const publishDate = new Date(t.publish_date);
            const today = new Date();
            return publishDate.toDateString() === today.toDateString();
          })
          .slice(0, 2)
          .map(tender => ({
            id: `tender-${tender.tender_id}`,
            type: 'tender_alert',
            title: `New tender: ${tender.title}`,
            time: 'Today',
            status: 'info'
          }));

        setRecentActivities([...newTenders, ...activities].slice(0, 5));
        setUpcomingDeadlines(upcomingTenderDeadlines);

      } catch (err) {
        console.error("Error fetching data:", err);
        alert(err.message || "An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const getDaysUntil = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const QuickActionCard = ({ icon, title, description, link, color }) => (
    <Link to={link} className="quick-action-card">
      <div className={`action-icon ${color}`}>
        {icon}
      </div>
      <div className="action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <FiArrowRight className="action-arrow" />
    </Link>
  );

  const StatCard = ({ icon, value, label, trend, color }) => (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {trend && <div className="stat-trend">{trend}</div>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="vendor-home">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="vendor-home">
      {/* Welcome Section */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Welcome back, {user?.username || 'Vendor'}! 🎉</h1>
          <p>Here's what's happening with your bids and tenders today</p>
        </div>
        <div className="welcome-graphic">
          <div className="graphic-item">🚀</div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <StatCard
          icon={<FiFileText size={24} />}
          value={stats.activeBids}
          label="Active Tenders"
          trend="Open for bidding"
          color="blue"
        />
        <StatCard
          icon={<FiTrendingUp size={24} />}
          value={stats.submittedBids}
          label="Total Submitted"
          trend={`${stats.submittedBids > 0 ? Math.round((stats.wonTenders / stats.submittedBids) * 100) : 0}% success rate`}
          color="green"
        />
        <StatCard
          icon={<FiAward size={24} />}
          value={stats.wonTenders}
          label="Won Tenders"
          trend="Successful bids"
          color="yellow"
        />
        <StatCard
          icon={<FiAlertCircle size={24} />}
          value={stats.pendingActions}
          label="Pending Review"
          trend={stats.pendingActions > 0 ? "Under evaluation" : "All reviewed"}
          color="red"
        />
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Quick Actions */}
        <div className="section-card">
          <div className="section-header">
            <h3>Quick Actions</h3>
            <p>Get things done quickly</p>
          </div>
          <div className="quick-actions-grid">
            <QuickActionCard
              icon="📢"
              title="Browse Tenders"
              description="Find new opportunities"
              link="/vendor/dashboard/tenders"
              color="purple"
            />
            <QuickActionCard
              icon="💼"
              title="My Bids"
              description="Track your submissions"
              link="/vendor/dashboard/bids"
              color="blue"
            />
            <QuickActionCard
              icon="📋"
              title="Submit Bid"
              description="Create new bid application"
              link="/vendor/dashboard/tenders"
              color="green"
            />
            <QuickActionCard
              icon="⚡"
              title="Priority Tenders"
              description="Time-sensitive opportunities"
              link="/vendor/dashboard/tenders?priority=high"
              color="orange"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="section-card">
          <div className="section-header">
            <h3>Recent Activity</h3>
            <Link to="/vendor/dashboard/bids" className="view-all">View All</Link>
          </div>
          <div className="activity-list">
            {recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon ${activity.status}`}>
                    {activity.type === 'bid_submitted' && '📤'}
                    {activity.type === 'tender_alert' && '🔔'}
                    {activity.type === 'bid_updated' && '🔄'}
                    {activity.type === 'payment_received' && '💰'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state-small">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="section-card">
          <div className="section-header">
            <h3>Upcoming Deadlines</h3>
            <FiClock size={20} />
          </div>
          <div className="deadlines-list">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map(deadline => {
                const daysLeft = getDaysUntil(deadline.deadline);
                return (
                  <div key={deadline.id} className="deadline-item">
                    <div className="deadline-content">
                      <div className="deadline-title">{deadline.title}</div>
                      <div className="deadline-meta">
                        <span className="days-left">{daysLeft} days left</span>
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(deadline.priority) }}
                        >
                          {deadline.priority}
                        </span>
                      </div>
                    </div>
                    <Link to="/vendor/dashboard/tenders" className="action-btn">
                      View
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="empty-state-small">
                <p>No upcoming deadlines</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="section-card metrics-card">
          <div className="section-header">
            <h3>Performance Overview</h3>
            <p>Your bidding statistics</p>
          </div>
          <div className="metrics-grid">
            <div className="metric">
              <div className="metric-value">
                {stats.submittedBids > 0 ? Math.round((stats.wonTenders / stats.submittedBids) * 100) : 0}%
              </div>
              <div className="metric-label">Bid Success Rate</div>
            </div>
            <div className="metric">
              <div className="metric-value">{stats.activeBids}</div>
              <div className="metric-label">Active Tenders</div>
            </div>
            <div className="metric">
              <div className="metric-value">{stats.pendingActions}</div>
              <div className="metric-label">Pending Review</div>
            </div>
            <div className="metric">
              <div className="metric-value">{stats.submittedBids}</div>
              <div className="metric-label">Total Bids Submitted</div>
            </div>
          </div>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .vendor-home {
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Loading State */
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
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-container p {
    color: #64748b;
    font-size: 1rem;
  }

  /* Welcome Banner */
  .welcome-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 2.5rem;
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    position: relative;
    overflow: hidden;
  }

  .welcome-content h1 {
    font-size: 2.2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    background: linear-gradient(to right, #ffffff, #e0e7ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .welcome-content p {
    font-size: 1.1rem;
    color: #e2e8f0;
    margin: 0;
  }

  .welcome-graphic {
    flex-shrink: 0;
  }

  .graphic-item {
    font-size: 4rem;
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .stat-icon.blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
  .stat-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
  .stat-icon.yellow { background: linear-gradient(135deg, #f59e0b, #d97706); }
  .stat-icon.red { background: linear-gradient(135deg, #ef4444, #dc2626); }
  .stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    line-height: 1;
  }

  .stat-label {
    color: #64748b;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .stat-trend {
    font-size: 0.8rem;
    color: #10b981;
    font-weight: 500;
  }

  /* Content Grid */
  .content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 1024px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  .section-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .section-header h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .section-header p {
    color: #64748b;
    margin: 0;
  }

  .view-all {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .view-all:hover {
    text-decoration: underline;
  }

  /* Quick Actions */
  .quick-actions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .quick-action-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
  }

  .quick-action-card:hover {
    background: white;
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(59, 130, 246, 0.1);
  }

  .action-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }

  .action-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
  .action-icon.blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; }
  .action-icon.green { background: linear-gradient(135deg, #10b981, #059669); color: white; }
  .action-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }

  .action-content h4 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.25rem 0;
  }

  .action-content p {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0;
  }

  .action-arrow {
    margin-left: auto;
    color: #64748b;
    transition: transform 0.3s ease;
  }

  .quick-action-card:hover .action-arrow {
    transform: translateX(4px);
    color: #3b82f6;
  }

  /* Activity List */
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 10px;
    transition: background-color 0.3s ease;
  }

  .activity-item:hover {
    background: #f8fafc;
  }

  .activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .activity-icon.success { background: #dcfce7; color: #16a34a; }
  .activity-icon.info { background: #dbeafe; color: #2563eb; }
  .activity-icon.warning { background: #fef3c7; color: #d97706; }

  .activity-title {
    font-weight: 500;
    color: #1e293b;
    font-size: 0.9rem;
  }

  .activity-time {
    font-size: 0.8rem;
    color: #64748b;
  }

  /* Deadlines List */
  .deadlines-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .deadline-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 10px;
    border-left: 4px solid #3b82f6;
  }

  .deadline-title {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .deadline-meta {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .days-left {
    font-size: 0.8rem;
    color: #64748b;
  }

  .priority-badge {
    padding: 2px 8px;
    border-radius: 12px;
    color: white;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .action-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
  }

  .action-btn:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  /* Empty State */
  .empty-state-small {
    text-align: center;
    padding: 2rem 1rem;
    color: #9ca3af;
  }

  .empty-state-small p {
    margin: 0;
    font-style: italic;
  }

  /* Metrics Card */
  .metrics-card {
    grid-column: 1 / -1;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .metric {
    text-align: center;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
  }

  .metric-value {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .metric-label {
    font-size: 0.9rem;
    color: #64748b;
    font-weight: 500;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .welcome-banner {
      flex-direction: column;
      text-align: center;
      padding: 2rem 1.5rem;
    }

    .welcome-content h1 {
      font-size: 1.8rem;
    }

    .stats-grid {
      grid-template-columns: 1fr 1fr;
    }

    .quick-actions-grid {
      grid-template-columns: 1fr;
    }

    .metrics-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }

    .deadline-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .action-btn {
      align-self: stretch;
    }
  }
`;