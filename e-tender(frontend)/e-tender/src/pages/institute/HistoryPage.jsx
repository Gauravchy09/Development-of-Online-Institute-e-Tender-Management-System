import React, { useState, useEffect, useMemo } from "react";
import { FiSearch, FiFilter, FiClock, FiDollarSign, FiUsers, FiFileText, FiAward, FiArrowRight, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiXCircle, FiEye, FiDownload, FiCalendar, FiBarChart2, FiArchive } from "react-icons/fi";

// Custom hook for time calculations
const useTimeLeft = (deadline) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, total: 0, isClosed: false, text: '' });

  useEffect(() => {
    const calculate = () => {
      const difference = +new Date(deadline) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ 
          days: 0, 
          hours: 0, 
          minutes: 0, 
          total: 0, 
          isClosed: true, 
          text: 'Closed' 
        });
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      
      let text = '';
      if (days > 0) text = `${days}d ${hours}h left`;
      else if (hours > 0) text = `${hours}h ${minutes}m left`;
      else text = `${minutes}m left`;

      setTimeLeft({
        days,
        hours,
        minutes,
        total: difference,
        isClosed: false,
        text
      });
    };
    
    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  return timeLeft;
};

// Helper functions
const isBiddingClosed = (deadline) => {
  return new Date(deadline) < new Date();
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Main History Page Component
export default function HistoryPage() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTender, setSelectedTender] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Fetch tenders with bids and award information
        const tendersRes = await fetch("http://127.0.0.1:8000/api/v1/tenders/institute", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!tendersRes.ok) throw new Error("Failed to fetch tender history");
        
        const tendersData = await tendersRes.json();
        
        // Filter for closed or awarded tenders for history
        const historicalTenders = tendersData.filter(tender => 
          tender.status === 'awarded' || isBiddingClosed(tender.submission_deadline)
        );
        
        setTenders(historicalTenders);
      } catch (err) {
        console.error("Error fetching history:", err);
        alert("Failed to load tender history");
      } finally {
        setLoading(false);
      }
    };

    if (!selectedTender) {
      fetchHistory();
    }
  }, [selectedTender, token]);

  // Calculate stats for historical data
  const stats = useMemo(() => {
    const awardedTenders = tenders.filter(t => t.status === 'awarded').length;
    const completedTenders = tenders.filter(t => 
      isBiddingClosed(t.submission_deadline) && t.status !== 'awarded'
    ).length;
    const totalBids = tenders.reduce((sum, tender) => sum + (tender.bids?.length || 0), 0);
    const totalValue = tenders.reduce((sum, tender) => sum + (tender.estimated_cost || 0), 0);
    
    return {
      total: tenders.length,
      awarded: awardedTenders,
      completed: completedTenders,
      totalBids,
      totalValue
    };
  }, [tenders]);

  // Filter and sort historical tenders
  const filteredAndSortedTenders = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    return tenders
      .filter(tender => {
        // Status filter
        if (filterStatus !== "all") {
          if (filterStatus === "awarded" && tender.status !== 'awarded') return false;
          if (filterStatus === "completed" && tender.status === 'awarded') return false;
        }

        // Period filter
        const tenderDate = new Date(tender.submission_deadline);
        switch (filterPeriod) {
          case "week":
            if (tenderDate < oneWeekAgo) return false;
            break;
          case "month":
            if (tenderDate < oneMonthAgo) return false;
            break;
          case "quarter":
            if (tenderDate < threeMonthsAgo) return false;
            break;
          default:
            break;
        }

        // Search filter
        const lowerSearchTerm = searchTerm.toLowerCase();
        if (!lowerSearchTerm) return true;

        return (
          tender.title.toLowerCase().includes(lowerSearchTerm) ||
          tender.tender_number.toLowerCase().includes(lowerSearchTerm) ||
          tender.department?.dept_name.toLowerCase().includes(lowerSearchTerm)
        );
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return new Date(a.submission_deadline) - new Date(b.submission_deadline);
        } else if (sortBy === "value") {
          return (b.estimated_cost || 0) - (a.estimated_cost || 0);
        }
        // newest (default)
        return new Date(b.submission_deadline) - new Date(a.submission_deadline);
      });
  }, [tenders, searchTerm, filterStatus, filterPeriod, sortBy]);

  if (loading) {
    return (
      <div className="history-page">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="history-page">
      {selectedTender ? (
        <TenderDetailView 
          tender={selectedTender} 
          onBack={() => setSelectedTender(null)}
        />
      ) : (
        <>
          {/* Welcome Section */}
          <div className="welcome-banner">
            <div className="welcome-content">
              <h1>Tender History & Archives 📜</h1>
              <p>Review past tenders, awards, and bidding outcomes</p>
            </div>
            <div className="welcome-graphic">
              <div className="graphic-item">📊</div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="stats-grid">
            <StatCard
              icon={<FiArchive size={24} />}
              value={stats.total}
              label="Historical Tenders"
              color="blue"
            />
            <StatCard
              icon={<FiAward size={24} />}
              value={stats.awarded}
              label="Awarded Tenders"
              color="purple"
            />
            <StatCard
              icon={<FiBarChart2 size={24} />}
              value={stats.totalBids}
              label="Total Bids Received"
              color="green"
            />
            <StatCard
              icon={<FiDollarSign size={24} />}
              value={`₹${(stats.totalValue / 100000).toFixed(1)}L`}
              label="Total Tender Value"
              color="orange"
            />
          </div>

          {/* Main Content Grid */}
          <div className="content-grid">
            {/* Tenders List */}
            <div className="section-card tenders-section">
              <div className="section-header">
                <div>
                  <h3>Tender History</h3>
                  <p>Browse through completed and awarded tenders</p>
                </div>
                <div className="search-controls">
                  <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search historical tenders..." 
                      className="search-input"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value)}
                    className="category-filter"
                  >
                    <option value="all">All Status</option>
                    <option value="awarded">Awarded</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select 
                    value={filterPeriod} 
                    onChange={e => setFilterPeriod(e.target.value)}
                    className="category-filter"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                    <option value="quarter">Past 3 Months</option>
                  </select>
                  <select 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value)}
                    className="category-filter"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="value">Highest Value</option>
                  </select>
                </div>
              </div>

              {filteredAndSortedTenders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No Historical Tenders Found</h3>
                  <p>There are no completed or awarded tenders matching your criteria.</p>
                  <button className="primary-btn" onClick={() => { 
                    setSearchTerm(''); 
                    setFilterStatus('all');
                    setFilterPeriod('all');
                  }}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="tenders-grid">
                  {filteredAndSortedTenders.map((tender, index) => 
                    <TenderCard 
                      key={tender.tender_id} 
                      tender={tender} 
                      onViewDetail={() => setSelectedTender(tender)}
                      index={index}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Quick Insights Sidebar */}
            <div className="section-card quick-actions-sidebar">
              <div className="section-header">
                <h3>Historical Insights</h3>
                <p>Key metrics and patterns</p>
              </div>
              
              <div className="insights-list">
                <InsightCard
                  icon="📈"
                  title="Bid Participation"
                  value={`${Math.round(stats.totalBids / Math.max(stats.total, 1))} avg bids/tender`}
                  trend="positive"
                />
                <InsightCard
                  icon="💰"
                  title="Award Rate"
                  value={`${Math.round((stats.awarded / Math.max(stats.total, 1)) * 100)}%`}
                  trend="neutral"
                />
                <InsightCard
                  icon="⏱️"
                  title="Completion Rate"
                  value={`${Math.round(((stats.awarded + stats.completed) / Math.max(stats.total, 1)) * 100)}%`}
                  trend="positive"
                />
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
                <h4>📋 Recent Closures</h4>
                <div className="activity-list">
                  {tenders.slice(0, 3).map(tender => (
                    <div key={tender.tender_id} className="activity-item">
                      <div className="activity-title">{tender.title}</div>
                      <div className="activity-meta">
                        <span className={`activity-status ${tender.status}`}>
                          {tender.status === 'awarded' ? 'Awarded' : 'Completed'}
                        </span>
                        <span className="activity-date">
                          {formatDate(tender.submission_deadline)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Section */}
              <div className="export-section">
                <h4>📤 Export Data</h4>
                <p>Download historical data for analysis</p>
                <div className="export-actions">
                  <button className="export-btn">
                    <FiDownload size={16} />
                    Export as CSV
                  </button>
                  <button className="export-btn">
                    <FiFileText size={16} />
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .history-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Welcome Banner */
        .welcome-banner {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
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
        .stat-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
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

        .tenders-section {
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

        .search-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: #64748b;
          width: 18px;
          height: 18px;
        }

        .search-input {
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          width: 280px;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .category-filter {
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: white;
          color: #374151;
          font-size: 0.9rem;
          cursor: pointer;
          min-width: 140px;
        }

        /* Tenders Grid */
        .tenders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
        }

        .tender-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          animation: fadeIn 0.5s ease-out backwards;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .tender-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
        }

        .tender-card.awarded::before { background: #8b5cf6; }
        .tender-card.completed::before { background: #10b981; }
        .tender-card.expired::before { background: #6b7280; }

        .tender-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .card-department {
          font-size: 0.8rem;
          font-weight: 600;
          color: #3b82f6;
          background: #dbeafe;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
        }

        .status-badge {
          padding: 0.4rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-badge.awarded { background: #ede9fe; color: #5b21b6; }
        .status-badge.completed { background: #d1fae5; color: #065f46; }
        .status-badge.expired { background: #f3f4f6; color: #374151; }

        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
          line-height: 1.4;
        }

        .card-subtitle {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0 0 1rem 0;
        }

        .card-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .card-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card-stat svg {
          width: 16px;
          height: 16px;
          color: #64748b;
        }

        .stat-label-small {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
          margin: 0;
        }

        .stat-value-small {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0.1rem 0 0 0;
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }

        .card-date {
          font-size: 0.8rem;
          color: #64748b;
        }

        .card-actions {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.8rem;
          text-decoration: none;
          display: flex;
          align-items: center;
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

        /* Insights Sidebar */
        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .insight-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .insight-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        }

        .insight-content h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .insight-content p {
          font-size: 0.95rem;
          color: #10b981;
          font-weight: 700;
          margin: 0;
        }

        .insight-content p.neutral {
          color: #6b7280;
        }

        /* Recent Activity */
        .recent-activity {
          margin-bottom: 2rem;
        }

        .recent-activity h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .activity-item {
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .activity-title {
          font-size: 0.85rem;
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 0.25rem;
          line-height: 1.3;
        }

        .activity-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .activity-status {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
        }

        .activity-status.awarded {
          background: #ede9fe;
          color: #5b21b6;
        }

        .activity-status.completed {
          background: #d1fae5;
          color: #065f46;
        }

        .activity-date {
          font-size: 0.7rem;
          color: #64748b;
        }

        /* Export Section */
        .export-section {
          background: #f0f9ff;
          border: 1px solid #e0f2fe;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .export-section h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #0369a1;
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .export-section p {
          font-size: 0.8rem;
          color: #0c4a6e;
          margin: 0 0 1rem 0;
        }

        .export-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .export-btn {
          padding: 0.75rem 1rem;
          background: white;
          border: 1px solid #e0f2fe;
          border-radius: 8px;
          color: #0369a1;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
        }

        .export-btn:hover {
          background: #0369a1;
          color: white;
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
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
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

        /* Detail View Styles */
        .detail-view-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .back-button {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 2rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0;
          transition: color 0.3s ease;
        }

        .back-button:hover {
          color: #1d4ed8;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
        }

        .detail-subtitle {
          font-size: 1rem;
          color: #64748b;
          margin: 0;
        }

        .detail-status-badge {
          padding: 0.6rem 1.25rem;
          border-radius: 9999px;
          font-weight: 600;
          color: white;
          text-align: center;
          font-size: 0.9rem;
        }

        .detail-status-badge.awarded { background: #8b5cf6; }
        .detail-status-badge.completed { background: #10b981; }
        .detail-status-badge.expired { background: #6b7280; }

        .detail-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .detail-stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .detail-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }

        .detail-stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .detail-stat-icon.blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
        .detail-stat-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
        .detail-stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .detail-stat-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }

        .detail-stat-content h4 {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          margin: 0 0 0.25rem 0;
        }

        .detail-stat-content p {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .detail-main-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .detail-section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-section p {
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        .document-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .document-list li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .document-list li:last-child {
          border-bottom: none;
        }

        .document-list a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.3s ease;
        }

        .document-list a:hover {
          color: #1d4ed8;
        }

        .empty-text {
          color: #9ca3af;
          font-style: italic;
        }

        .metadata-col {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .metadata-item {
          margin-bottom: 1.5rem;
        }

        .metadata-item:last-child {
          margin-bottom: 0;
        }

        .metadata-label {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          margin: 0 0 0.25rem 0;
        }

        .metadata-value {
          font-size: 0.95rem;
          color: #1e293b;
          font-weight: 500;
          margin: 0;
        }

        .bids-table {
          width: 100%;
          border-collapse: collapse;
        }

        .bids-table th,
        .bids-table td {
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
        }

        .bids-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
          font-size: 0.8rem;
          text-transform: uppercase;
        }

        .bids-table tr.awarded-bid {
          background: #f0fdf4;
        }

        .bids-table tr.awarded-bid td {
          border-color: #bbf7d0;
        }

        .bid-status-badge {
          padding: 0.4rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .bid-status-badge.awarded {
          background: #d1fae5;
          color: #065f46;
        }

        .bid-status-badge.submitted {
          background: #dbeafe;
          color: #1e40af;
        }

        .bid-status-badge.disqualified {
          background: #f3f4f6;
          color: #374151;
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

          .search-controls {
            flex-direction: column;
            width: 100%;
          }

          .search-input, .category-filter {
            width: 100%;
          }

          .tenders-grid {
            grid-template-columns: 1fr;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .detail-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .detail-main-content {
            grid-template-columns: 1fr;
          }

          .detail-stats-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .card-stats {
            grid-template-columns: 1fr;
          }

          .card-actions {
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

// Tender Card Component
const TenderCard = ({ tender, onViewDetail, index }) => {
  const getStatusConfig = () => {
    if (tender.status === 'awarded') return { type: 'awarded', text: 'Awarded', badgeClass: 'awarded' };
    if (isBiddingClosed(tender.submission_deadline)) return { type: 'completed', text: 'Completed', badgeClass: 'completed' };
    return { type: 'expired', text: 'Expired', badgeClass: 'expired' };
  };

  const statusConfig = getStatusConfig();
  const winningBid = tender.bids?.find(bid => bid.bid_status === 'awarded');
  const totalBids = tender.bids?.length || 0;

  return (
    <div 
      className={`tender-card ${statusConfig.type}`} 
      onClick={onViewDetail}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="card-header">
        <span className="card-department">{tender.department?.dept_name}</span>
        <span className={`status-badge ${statusConfig.badgeClass}`}>
          {statusConfig.text}
        </span>
      </div>
      
      <h3 className="card-title">{tender.title}</h3>
      <p className="card-subtitle">{tender.tender_number}</p>
      
      <div className="card-stats">
        <div className="card-stat">
          <FiDollarSign />
          <div>
            <div className="stat-label-small">Estimated Cost</div>
            <div className="stat-value-small">₹{tender.estimated_cost?.toLocaleString()}</div>
          </div>
        </div>
        <div className="card-stat">
          <FiUsers />
          <div>
            <div className="stat-label-small">Bids Received</div>
            <div className="stat-value-small">{totalBids}</div>
          </div>
        </div>
        {winningBid && (
          <div className="card-stat">
            <FiAward />
            <div>
              <div className="stat-label-small">Winning Bid</div>
              <div className="stat-value-small">₹{winningBid.bid_amount?.toLocaleString()}</div>
            </div>
          </div>
        )}
        <div className="card-stat">
          <FiCalendar />
          <div>
            <div className="stat-label-small">Closed On</div>
            <div className="stat-value-small">{formatDate(tender.submission_deadline)}</div>
          </div>
        </div>
      </div>

      <div className="card-meta">
        <div className="card-date">
          Published: {formatDate(tender.publish_date)}
        </div>
        <div className="card-actions">
          <button className="action-btn primary">
            <FiEye size={14} />
            View
          </button>
        </div>
      </div>
    </div>
  );
};

// Insight Card Component
const InsightCard = ({ icon, title, value, trend }) => (
  <div className="insight-card">
    <div className="insight-icon">
      {icon}
    </div>
    <div className="insight-content">
      <h4>{title}</h4>
      <p className={trend === 'neutral' ? 'neutral' : ''}>{value}</p>
    </div>
  </div>
);

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="skeleton-grid">
    {[...Array(6)].map((_, i) => (
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

// Tender Detail View Component
const TenderDetailView = ({ tender, onBack }) => {
    const winningBid = tender.bids?.find(bid => bid.bid_status === 'awarded');
    const totalBids = tender.bids?.length || 0;
    const lowestBid = tender.bids?.length > 0 ? 
      tender.bids.reduce((min, bid) => bid.bid_amount < min.bid_amount ? bid : min, tender.bids[0]) : null;
    
    const getStatusInfo = () => {
        if (tender.status === 'awarded') return { text: 'Awarded', className: 'awarded', icon: '🏆' };
        if (isBiddingClosed(tender.submission_deadline)) return { text: 'Completed', className: 'completed', icon: '✅' };
        return { text: 'Expired', className: 'expired', icon: '⏰' };
    };
    
    const statusInfo = getStatusInfo();

    return (
        <div className="detail-view-container">
            <button onClick={onBack} className="back-button">
                <FiArrowRight style={{ transform: 'rotate(180deg)' }} />
                Back to History
            </button>
            
            <header className="detail-header">
                <div>
                    <h1 className="detail-title">{tender.title}</h1>
                    <p className="detail-subtitle">Tender No: {tender.tender_number}</p>
                </div>
                <div className={`detail-status-badge ${statusInfo.className}`}>
                    {statusInfo.icon} {statusInfo.text}
                </div>
            </header>

            <div className="detail-stats-grid">
                <div className="detail-stat-card">
                    <div className="detail-stat-icon blue">
                        <FiDollarSign size={24} />
                    </div>
                    <div className="detail-stat-content">
                        <h4>Estimated Cost</h4>
                        <p>₹{tender.estimated_cost?.toLocaleString()}</p>
                    </div>
                </div>
                
                <div className="detail-stat-card">
                    <div className="detail-stat-icon green">
                        <FiUsers size={24} />
                    </div>
                    <div className="detail-stat-content">
                        <h4>Total Bids</h4>
                        <p>{totalBids}</p>
                    </div>
                </div>
                
                <div className="detail-stat-card">
                    <div className="detail-stat-icon orange">
                        <FiAward size={24} />
                    </div>
                    <div className="detail-stat-content">
                        <h4>{winningBid ? 'Winning Bid' : 'Lowest Bid'}</h4>
                        <p>{winningBid ? `₹${winningBid.bid_amount?.toLocaleString()}` : 
                            lowestBid ? `₹${lowestBid.bid_amount?.toLocaleString()}` : 'N/A'}</p>
                    </div>
                </div>
                
                <div className="detail-stat-card">
                    <div className="detail-stat-icon purple">
                        <FiCalendar size={24} />
                    </div>
                    <div className="detail-stat-content">
                        <h4>Closed On</h4>
                        <p>{formatDate(tender.submission_deadline)}</p>
                    </div>
                </div>
            </div>

            <div className="detail-main-content">
                <div className="main-details-col">
                    <section className="detail-section">
                        <h3 className="section-title">Tender Description</h3>
                        <p>{tender.description}</p>
                    </section>
                    
                    <section className="detail-section">
                        <h3 className="section-title">Bidding Summary</h3>
                        {tender.bids?.length > 0 ? (
                            <div className="table-container">
                                <table className="bids-table">
                                    <thead>
                                        <tr>
                                            <th>Vendor</th>
                                            <th>Bid Amount</th>
                                            <th>Submission Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tender.bids.sort((a, b) => a.bid_amount - b.bid_amount).map(bid => (
                                            <tr key={bid.bid_id} className={bid.bid_status === 'awarded' ? 'awarded-bid' : ''}>
                                                <td>
                                                    <div className="td-title">{bid.vendor.company_name}</div>
                                                    <div className="td-subtitle">{bid.vendor.user.username}</div>
                                                </td>
                                                <td>
                                                    <div className="td-title">₹{bid.bid_amount.toLocaleString()}</div>
                                                    {bid.bid_id === lowestBid?.bid_id && !winningBid && 
                                                     <div className="td-subtitle" style={{color: '#10b981', fontWeight: '600'}}>Lowest Bid</div>}
                                                </td>
                                                <td>{formatDate(bid.submission_date)}</td>
                                                <td>
                                                    <span className={`bid-status-badge ${bid.bid_status}`}>
                                                        {bid.bid_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="empty-text">No bids were submitted for this tender.</p>
                        )}
                    </section>
                </div>
                
                <aside className="metadata-col">
                    <section className="detail-section">
                        <h3 className="section-title">Tender Information</h3>
                        <div className="metadata-item">
                            <h4 className="metadata-label">Department</h4>
                            <p className="metadata-value">{tender.department?.dept_name}</p>
                        </div>
                        <div className="metadata-item">
                            <h4 className="metadata-label">Category</h4>
                            <p className="metadata-value">{tender.category?.category_name || 'General'}</p>
                        </div>
                        <div className="metadata-item">
                            <h4 className="metadata-label">Publish Date</h4>
                            <p className="metadata-value">{formatDateTime(tender.publish_date)}</p>
                        </div>
                        <div className="metadata-item">
                            <h4 className="metadata-label">Submission Deadline</h4>
                            <p className="metadata-value">{formatDateTime(tender.submission_deadline)}</p>
                        </div>
                        {winningBid && (
                            <div className="metadata-item">
                                <h4 className="metadata-label">Awarded To</h4>
                                <p className="metadata-value">{winningBid.vendor.company_name}</p>
                            </div>
                        )}
                    </section>

                    <section className="detail-section">
                        <h3 className="section-title">Tender Documents</h3>
                        {tender.documents?.length > 0 ? (
                            <ul className="document-list">
                                {tender.documents.map(doc => (
                                    <li key={doc.doc_id}>
                                        <a 
                                            href={`http://127.0.0.1:8000/api/v1/tenders/documents/${doc.doc_id}/download`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                        >
                                            <FiDownload />
                                            {doc.document_name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-text">No documents attached.</p>
                        )}
                    </section>
                </aside>
            </div>
        </div>
    );
};