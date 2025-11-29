import React, { useState, useEffect, useMemo } from "react";
import { FiFilter, FiAward, FiClock, FiXCircle, FiEdit, FiTrendingUp, FiArrowRight } from "react-icons/fi";

// Main Component for the Vendor's Bids Dashboard
export default function VendorBids() {
  const [myBids, setMyBids] = useState([]);
  const [allTenders, setAllTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tendersRes, myBidsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/v1/tenders/all", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://127.0.0.1:8000/api/v1/bids/", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!tendersRes.ok || !myBidsRes.ok) throw new Error("Failed to fetch dashboard data.");

        setAllTenders(await tendersRes.json());
        setMyBids(await myBidsRes.json());
      } catch (err) {
        console.error("Error fetching data:", err);
        alert(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const bidsWithTenderInfo = useMemo(() => {
    const tendersMap = new Map(allTenders.map(t => [t.tender_id, t]));
    return myBids
      .map(bid => {
        const tender = tendersMap.get(bid.tender_id);
        if (!tender) return null;

        let statusKey = 'submitted';
        let statusText = "Awaiting Results";
        const isBiddingClosed = new Date(tender.submission_deadline) < new Date();

        if (bid.bid_status === 'awarded') {
          statusKey = 'awarded';
          statusText = "You Won!";
        } else if (tender.status === 'awarded' && bid.bid_status !== 'awarded') {
          statusKey = 'disqualified';
          statusText = "Not Selected";
        } else if (!isBiddingClosed) {
            statusKey = 'inprogress';
            statusText = "In Progress";
        }

        return { ...bid, tender, statusKey, statusText };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date));
  }, [myBids, allTenders]);

  const filteredBids = useMemo(() => {
    if (filterStatus === 'all') return bidsWithTenderInfo;
    return bidsWithTenderInfo.filter(bid => bid.statusKey === filterStatus);
  }, [bidsWithTenderInfo, filterStatus]);

  const getStatusStats = () => {
    const stats = {
      all: bidsWithTenderInfo.length,
      inprogress: bidsWithTenderInfo.filter(bid => bid.statusKey === 'inprogress').length,
      submitted: bidsWithTenderInfo.filter(bid => bid.statusKey === 'submitted').length,
      awarded: bidsWithTenderInfo.filter(bid => bid.statusKey === 'awarded').length,
      disqualified: bidsWithTenderInfo.filter(bid => bid.statusKey === 'disqualified').length,
    };
    return stats;
  };

  const statusStats = getStatusStats();

  return (
    <div className="vendor-bids-page">
      {/* Welcome Section */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>My Bid Dashboard 🎯</h1>
          <p>Track and manage all your bid submissions in one place</p>
        </div>
        <div className="welcome-graphic">
          <div className="graphic-item">📊</div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <StatCard
          icon={<FiTrendingUp size={24} />}
          value={statusStats.all}
          label="Total Bids"
          color="blue"
        />
        <StatCard
          icon={<FiEdit size={24} />}
          value={statusStats.inprogress}
          label="In Progress"
          color="purple"
        />
        <StatCard
          icon={<FiClock size={24} />}
          value={statusStats.submitted}
          label="Under Review"
          color="yellow"
        />
        <StatCard
          icon={<FiAward size={24} />}
          value={statusStats.awarded}
          label="Awarded"
          color="green"
        />
      </div>

      {/* Main Content */}
      <div className="content-grid">
        {/* Bids List */}
        <div className="section-card bids-section">
          <div className="section-header">
            <div>
              <h3>Your Bids</h3>
              <p>Manage and track your bid applications</p>
            </div>
            <div className="filter-controls">
              <FiFilter size={20} />
              <span>Filter by:</span>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Bids</option>
                <option value="inprogress">In Progress</option>
                <option value="submitted">Under Review</option>
                <option value="awarded">Awarded</option>
                <option value="disqualified">Not Selected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : filteredBids.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>{filterStatus === 'all' ? 'No Bids Found' : `No ${filterStatus} bids`}</h3>
              <p>
                {filterStatus === 'all' 
                  ? "You haven't submitted any bids yet. Start by browsing available tenders." 
                  : 'No bids match the current filter. Try selecting another status.'}
              </p>
              <button className="primary-btn">Browse Tenders</button>
            </div>
          ) : (
            <div className="bids-grid">
              {filteredBids.map((bid, index) => (
                <BidCard key={bid.bid_id} bid={bid} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Sidebar */}
        <div className="section-card quick-actions-sidebar">
          <div className="section-header">
            <h3>Quick Actions</h3>
            <p>Get things done quickly</p>
          </div>
          <div className="quick-actions-list">
            <QuickActionCard
              icon="📢"
              title="Browse New Tenders"
              description="Find new opportunities"
              link="/vendor/dashboard/tenders"
              color="blue"
            />
            <QuickActionCard
              icon="📋"
              title="Submit New Bid"
              description="Create new bid application"
              link="/vendor/dashboard/tenders"
              color="green"
            />
            <QuickActionCard
              icon="📈"
              title="Performance Analytics"
              description="View your bid success metrics"
              link="/vendor/dashboard/analytics"
              color="purple"
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
      </div>

      <style>{`
        .vendor-bids-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
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
        .stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .stat-icon.red { background: linear-gradient(135deg, #ef4444, #dc2626); }

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

        /* Content Grid */
        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
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

        .bids-section {
          min-height: 600px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .section-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .section-header p {
          color: #64748b;
          margin: 0;
          font-size: 0.9rem;
        }

        .filter-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.9rem;
        }

        .status-filter {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #374151;
          font-size: 0.9rem;
          cursor: pointer;
        }

        /* Bids Grid */
        .bids-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .bid-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          animation: fadeIn 0.5s ease-out backwards;
          position: relative;
          overflow: hidden;
        }

        .bid-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
        }

        .bid-card.inprogress::before { background: #3b82f6; }
        .bid-card.submitted::before { background: #f59e0b; }
        .bid-card.awarded::before { background: #10b981; }
        .bid-card.disqualified::before { background: #6b7280; }

        .bid-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }

        .bid-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .bid-status.inprogress { color: #3b82f6; }
        .bid-status.submitted { color: #f59e0b; }
        .bid-status.awarded { color: #10b981; }
        .bid-status.disqualified { color: #6b7280; }

        .bid-status svg {
          width: 1.25rem;
          height: 1.25rem;
        }

        .bid-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
          line-height: 1.4;
        }

        .bid-institute {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0 0 1.5rem 0;
        }

        .bid-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .bid-detail {
          display: flex;
          flex-direction: column;
        }

        .bid-detail-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .bid-detail-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .bid-actions {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          text-align: center;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .action-btn.primary {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        /* Quick Actions Sidebar */
        .quick-actions-list {
          display: flex;
          flex-direction: column;
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

        .action-icon.blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; }
        .action-icon.green { background: linear-gradient(135deg, #10b981, #059669); color: white; }
        .action-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
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

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
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
          font-size: 1.25rem;
        }

        .empty-state p {
          margin: 0 0 2rem 0;
          line-height: 1.5;
        }

        .primary-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .primary-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        /* Loading Skeleton */
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .skeleton-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .skeleton-line {
          height: 1rem;
          margin-bottom: 0.75rem;
          border-radius: 4px;
          background: #f3f4f6;
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .skeleton-line.title {
          height: 1.5rem;
          width: 70%;
          margin-top: 1rem;
        }

        .skeleton-line.short {
          width: 40%;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          50% { opacity: 0.5; }
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

          .section-header {
            flex-direction: column;
            gap: 1rem;
          }

          .bids-grid {
            grid-template-columns: 1fr;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .bid-details-grid {
            grid-template-columns: 1fr;
          }

          .bid-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

// Stat Card Component
const StatCard = ({ icon, value, label, color }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}>
      {icon}
    </div>
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

// Bid Card Component
const BidCard = ({ bid, index }) => {
  const { tender, bid_amount, submission_date, statusKey, statusText } = bid;
  
  const STATUS_CONFIG = {
    awarded: { icon: <FiAward />, color: 'awarded' },
    submitted: { icon: <FiClock />, color: 'submitted' },
    disqualified: { icon: <FiXCircle />, color: 'disqualified' },
    inprogress: { icon: <FiEdit />, color: 'inprogress' },
  };

  const config = STATUS_CONFIG[statusKey];

  return (
    <div className={`bid-card ${statusKey}`} style={{ animationDelay: `${index * 50}ms` }}>
      <div className={`bid-status ${statusKey}`}>
        {config.icon}
        <span>{statusText}</span>
      </div>
      
      <h3 className="bid-title">{tender.title}</h3>
      <p className="bid-institute">{tender.department.institute.institute_name}</p>
      
      <div className="bid-details-grid">
        <div className="bid-detail">
          <span className="bid-detail-label">Your Bid Amount</span>
          <span className="bid-detail-value">₹{bid_amount.toLocaleString()}</span>
        </div>
        <div className="bid-detail">
          <span className="bid-detail-label">Submission Date</span>
          <span className="bid-detail-value">{new Date(submission_date).toLocaleDateString('en-IN')}</span>
        </div>
        <div className="bid-detail">
          <span className="bid-detail-label">Deadline</span>
          <span className="bid-detail-value">{new Date(tender.submission_deadline).toLocaleDateString('en-IN')}</span>
        </div>
        <div className="bid-detail">
          <span className="bid-detail-label">Reference No.</span>
          <span className="bid-detail-value">{tender.tender_id}</span>
        </div>
      </div>

      <div className="bid-actions">
        <button className="action-btn">
          <FiEdit size={16} />
          View Details
        </button>
        {statusKey === 'inprogress' && (
          <button className="action-btn primary">
            <FiEdit size={16} />
            Edit Bid
          </button>
        )}
      </div>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ icon, title, description, link, color }) => (
  <a href={link} className="quick-action-card">
    <div className={`action-icon ${color}`}>
      {icon}
    </div>
    <div className="action-content">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
    <FiArrowRight className="action-arrow" />
  </a>
);

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="skeleton-grid">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="skeleton-card">
        <div className="skeleton-line" style={{ width: '40%', height: '1.25rem' }} />
        <div className="skeleton-line title" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
        <div className="skeleton-line" style={{ width: '80%', marginTop: '1rem' }} />
      </div>
    ))}
  </div>
);