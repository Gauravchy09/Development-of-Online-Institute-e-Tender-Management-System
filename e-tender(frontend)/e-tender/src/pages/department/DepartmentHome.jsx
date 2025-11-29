import React, { useState, useEffect } from "react";
import { FiHome, FiFileText, FiUsers, FiDollarSign, FiTrendingUp, FiClock, FiAward, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export default function DepartmentHome({ user, stats }) {
  const [dashboardData, setDashboardData] = useState({
    activeTenders: 0,
    totalBids: 0,
    pendingApprovals: 0,
    awardedTenders: 0,
    recentActivity: [],
    performanceMetrics: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch this from your API
        const mockData = {
          activeTenders: stats?.activeTenders || 8,
          totalBids: stats?.bidsSubmitted || 24,
          pendingApprovals: stats?.pendingApprovals || 3,
          awardedTenders: stats?.completedTenders || 5,
          recentActivity: [
            { id: 1, type: 'bid_received', message: 'New bid received for Computer Lab Equipment', time: '2 hours ago' },
            { id: 2, type: 'tender_created', message: 'You created tender "Library Books Procurement"', time: '1 day ago' },
            { id: 3, type: 'deadline_approaching', message: 'Classroom Furniture tender closes in 2 days', time: '2 days ago' },
            { id: 4, type: 'tender_awarded', message: 'Science Lab Equipment tender awarded to Tech Solutions', time: '3 days ago' }
          ],
          performanceMetrics: {
            successRate: '68%',
            avgBidsPerTender: 4.2,
            totalValue: '₹24.5L',
            responseTime: '2.1 days'
          }
        };
        setDashboardData(mockData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [stats]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'bid_received': return <FiTrendingUp className="text-green-500" />;
      case 'tender_created': return <FiFileText className="text-blue-500" />;
      case 'deadline_approaching': return <FiClock className="text-amber-500" />;
      case 'tender_awarded': return <FiAward className="text-purple-500" />;
      default: return <FiAlertCircle className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="department-home">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
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
    <div className="department-home">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Welcome back, {user?.username || 'Block User'}! 👋</h1>
          <p>Here's what's happening with your block's tender activities today</p>
        </div>
        <div className="welcome-stats">
          <div className="stat-item">
            <div className="stat-value">{dashboardData.activeTenders}</div>
            <div className="stat-label">Active Tenders</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{dashboardData.totalBids}</div>
            <div className="stat-label">Total Bids</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Key Metrics */}
        <div className="metrics-grid">
          <MetricCard
            icon={<FiFileText />}
            title="Active Tenders"
            value={dashboardData.activeTenders}
            description="Currently open for bidding"
            color="blue"
          />
          <MetricCard
            icon={<FiUsers />}
            title="Total Bids"
            value={dashboardData.totalBids}
            description="Across all tenders"
            color="green"
          />
          <MetricCard
            icon={<FiClock />}
            title="Pending Approvals"
            value={dashboardData.pendingApprovals}
            description="Awaiting review"
            color="amber"
          />
          <MetricCard
            icon={<FiAward />}
            title="Awarded Tenders"
            value={dashboardData.awardedTenders}
            description="Successfully completed"
            color="purple"
          />
        </div>

        {/* Performance Metrics */}
        <div className="performance-card">
          <div className="card-header">
            <h3>Performance Overview</h3>
            <FiTrendingUp className="header-icon" />
          </div>
          <div className="performance-grid">
            <PerformanceMetric
              label="Success Rate"
              value={dashboardData.performanceMetrics.successRate}
              description="Tenders awarded"
            />
            <PerformanceMetric
              label="Avg Bids/Tender"
              value={dashboardData.performanceMetrics.avgBidsPerTender}
              description="Competition level"
            />
            <PerformanceMetric
              label="Total Value"
              value={dashboardData.performanceMetrics.totalValue}
              description="Procurement value"
            />
            <PerformanceMetric
              label="Avg Response Time"
              value={dashboardData.performanceMetrics.responseTime}
              description="To vendor queries"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <FiClock className="header-icon" />
          </div>
          <div className="activity-list">
            {dashboardData.recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="actions-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
            <FiCheckCircle className="header-icon" />
          </div>
          <div className="actions-grid">
            <QuickAction
              icon={<FiFileText />}
              title="Create Tender"
              description="Start new procurement"
              action={() => window.location.href = '/department/dashboard/tenders?view=create'}
              color="blue"
            />
            <QuickAction
              icon={<FiUsers />}
              title="View Bids"
              description="Check submissions"
              action={() => window.location.href = '/department/dashboard/tenders'}
              color="green"
            />
            <QuickAction
              icon={<FiTrendingUp />}
              title="Analytics"
              description="View reports"
              action={() => console.log('Navigate to analytics')}
              color="purple"
            />
            <QuickAction
              icon={<FiAward />}
              title="Award Tender"
              description="Finalize procurement"
              action={() => console.log('Navigate to award tender')}
              color="amber"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .department-home {
          min-height: 100vh;
          padding: 0;
        }

        /* Welcome Banner */
        .welcome-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 3rem;
          margin-bottom: 2rem;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        .welcome-content h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .welcome-content p {
          font-size: 1.2rem;
          opacity: 0.9;
          margin: 0;
        }

        .welcome-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          grid-column: 1 / -1;
        }

        /* Cards Common Styles */
        .performance-card,
        .activity-card,
        .actions-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }

        .performance-card {
          grid-column: 1;
        }

        .activity-card {
          grid-column: 2;
          grid-row: 2;
        }

        .actions-card {
          grid-column: 1;
          grid-row: 2;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .card-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .header-icon {
          color: #6366f1;
          font-size: 1.5rem;
        }

        /* Metric Card */
        .metric-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .metric-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .metric-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .metric-icon.blue { background: #dbeafe; color: #1d4ed8; }
        .metric-icon.green { background: #d1fae5; color: #065f46; }
        .metric-icon.amber { background: #fef3c7; color: #92400e; }
        .metric-icon.purple { background: #e9d5ff; color: #7e22ce; }

        .metric-title {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0.25rem 0;
        }

        .metric-description {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }

        /* Performance Metrics */
        .performance-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .performance-metric {
          text-align: center;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 10px;
        }

        .performance-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .performance-label {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .performance-description {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        /* Activity List */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .activity-item:hover {
          background: #f1f5f9;
        }

        .activity-icon {
          font-size: 1.25rem;
          margin-top: 0.125rem;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-message {
          font-size: 0.9rem;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
          font-weight: 500;
        }

        .activity-time {
          font-size: 0.75rem;
          color: #64748b;
        }

        /* Quick Actions */
        .actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .quick-action {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: #f8fafc;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }

        .quick-action:hover {
          background: white;
          border-color: #6366f1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }

        .action-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .action-icon.blue { background: #dbeafe; color: #1d4ed8; }
        .action-icon.green { background: #d1fae5; color: #065f46; }
        .action-icon.purple { background: #e9d5ff; color: #7e22ce; }
        .action-icon.amber { background: #fef3c7; color: #92400e; }

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

        /* Responsive Design */
        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .performance-card,
          .activity-card,
          .actions-card {
            grid-column: 1;
          }
          .activity-card {
            grid-row: 3;
          }
          .actions-card {
            grid-row: 4;
          }
        }

        @media (max-width: 768px) {
          .welcome-banner {
            flex-direction: column;
            text-align: center;
            gap: 2rem;
          }
          .welcome-stats {
            justify-content: center;
          }
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          .performance-grid {
            grid-template-columns: 1fr;
          }
          .actions-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .welcome-content h1 {
            font-size: 2rem;
          }
          .stat-value {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}

// Helper Components
const MetricCard = ({ icon, title, value, description, color }) => (
  <div className="metric-card">
    <div className="metric-header">
      <div className={`metric-icon ${color}`}>
        {icon}
      </div>
      <div>
        <div className="metric-title">{title}</div>
        <div className="metric-value">{value}</div>
        <p className="metric-description">{description}</p>
      </div>
    </div>
  </div>
);

const PerformanceMetric = ({ label, value, description }) => (
  <div className="performance-metric">
    <div className="performance-value">{value}</div>
    <div className="performance-label">{label}</div>
    <div className="performance-description">{description}</div>
  </div>
);

const QuickAction = ({ icon, title, description, action, color }) => (
  <div className="quick-action" onClick={action}>
    <div className={`action-icon ${color}`}>
      {icon}
    </div>
    <div className="action-content">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  </div>
);