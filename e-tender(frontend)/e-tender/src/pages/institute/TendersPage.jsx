import React, { useState, useEffect, useMemo } from "react";
import { FiSearch, FiFilter, FiClock, FiDollarSign, FiUsers, FiFileText, FiAward, FiArrowRight, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiXCircle, FiEdit, FiHome, FiEye, FiGrid, FiList, FiDownload, FiCheck, FiX, FiCalendar, FiMapPin, FiTag, FiUser, FiBarChart2 } from "react-icons/fi";

// Custom hook for countdown timer
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

// Main Component for the Institute Admin
export default function InstituteTendersPage() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTender, setSelectedTender] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!selectedTender) {
      setLoading(true);
      fetch("https://792hpzm4-8000.inc1.devtunnels.ms/api/v1/tenders/institute", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch tenders."))
        .then(data => setTenders(data))
        .catch(err => { console.error(err); alert(err.message || "An error occurred."); })
        .finally(() => setLoading(false));
    }
  }, [selectedTender, token]);

  const publishTender = async (tenderId) => {
    try {
      const res = await fetch(`https://792hpzm4-8000.inc1.devtunnels.ms/api/v1/tenders/${tenderId}/publish`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to publish tender");
      
      const publishedTender = await res.json();
      setTenders(prev => prev.map(t => (t.tender_id === tenderId ? { ...t, is_checked: true, status: publishedTender.status } : t)));
      alert("Tender published successfully!");
    } catch (err) {
      console.error(err); alert("Error publishing tender");
    }
  };
  
  const handleAcceptBid = async (bidId, tenderId) => {
    if (!window.confirm("Are you sure you want to award this tender to this vendor? This action cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch(`https://792hpzm4-8000.inc1.devtunnels.ms/api/v1/awards/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bid_id: bidId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to award bid.");
      }
      
      const updateStateAfterAward = (prevTenders) => {
        return prevTenders.map(t => {
          if (t.tender_id === tenderId) {
            const updatedBids = t.bids.map(b => ({
              ...b,
              bid_status: b.bid_id === bidId ? 'awarded' : 'disqualified',
            }));
            const updatedTender = { ...t, bids: updatedBids, status: 'awarded' };
            if (selectedTender && selectedTender.tender_id === tenderId) {
              setSelectedTender(updatedTender);
            }
            return updatedTender;
          }
          return t;
        });
      };
      
      setTenders(updateStateAfterAward);
      alert("Bid has been successfully awarded!");

    } catch (err) {
      console.error("Error accepting bid:", err);
      alert(err.message);
    }
  };

  // Calculate stats for the header
  const stats = useMemo(() => {
    const pendingTenders = tenders.filter(t => !t.is_checked).length;
    const activeTenders = tenders.filter(t => t.is_checked && !isBiddingClosed(t.submission_deadline)).length;
    const closedTenders = tenders.filter(t => t.is_checked && isBiddingClosed(t.submission_deadline) && t.status !== 'awarded').length;
    const awardedTenders = tenders.filter(t => t.status === 'awarded').length;
    
    return {
      total: tenders.length,
      pending: pendingTenders,
      active: activeTenders,
      closed: closedTenders,
      awarded: awardedTenders
    };
  }, [tenders]);

  const filteredAndSortedTenders = useMemo(() => {
    return tenders
      .filter(tender => {
        const deadlinePassed = new Date(tender.submission_deadline) < new Date();
        switch (filterStatus) {
          case 'pending': if (tender.is_checked) return false; break;
          case 'open': if (!tender.is_checked || deadlinePassed || tender.status === 'awarded') return false; break;
          case 'closed': if (!tender.is_checked || !deadlinePassed || tender.status === 'awarded') return false; break;
          case 'awarded': if (tender.status !== 'awarded') return false; break;
          default: break;
        }
        
        const lowerSearchTerm = searchTerm.toLowerCase();
        if (!lowerSearchTerm) return true;

        return (
          tender.title.toLowerCase().includes(lowerSearchTerm) ||
          tender.tender_number.toLowerCase().includes(lowerSearchTerm) ||
          tender.department.dept_name.toLowerCase().includes(lowerSearchTerm)
        );
      })
      .sort((a, b) => {
        if (sortBy === "endingSoon") {
          if (new Date(a.submission_deadline) < new Date()) return 1;
          if (new Date(b.submission_deadline) < new Date()) return -1;
          return new Date(a.submission_deadline) - new Date(b.submission_deadline);
        }
        return new Date(b.publish_date) - new Date(a.publish_date);
      });
  }, [tenders, searchTerm, filterStatus, sortBy]);

  if (loading) return <div className="institute-tenders-page"><LoadingSkeleton viewMode={viewMode} /></div>;

  return (
    <div className="institute-tenders-page">
      {selectedTender ? (
        <TenderDetailView 
          tender={selectedTender} 
          onBack={() => setSelectedTender(null)}
          onAcceptBid={handleAcceptBid} 
        />
      ) : (
        <>
          {/* Welcome Section */}
          <div className="welcome-banner">
            <div className="welcome-content">
              <h1>Institute Tenders Management 🏛️</h1>
              <p>Manage and monitor all tender activities from your institute</p>
            </div>
            <div className="welcome-graphic">
              <div className="graphic-item">📊</div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="stats-grid">
            <StatCard
              icon={<FiTrendingUp size={24} />}
              value={stats.total}
              label="Total Tenders"
              color="blue"
            />
            <StatCard
              icon={<FiAlertCircle size={24} />}
              value={stats.pending}
              label="Pending Publication"
              color="orange"
            />
            <StatCard
              icon={<FiClock size={24} />}
              value={stats.active}
              label="Active Tenders"
              color="green"
            />
            <StatCard
              icon={<FiAward size={24} />}
              value={stats.awarded}
              label="Awarded Tenders"
              color="purple"
            />
          </div>

          {/* Main Content Grid */}
          <div className="content-grid">
            {/* Tenders List */}
            <div className="section-card tenders-section">
              <div className="section-header">
                <div>
                  <h3>Tender Management</h3>
                  <p>Review, publish and manage institute tenders</p>
                </div>
                <div className="search-controls">
                  <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search by title, number or department..." 
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
                    <option value="all">All Tenders</option>
                    <option value="pending">Pending Publication</option>
                    <option value="open">Open for Bidding</option>
                    <option value="closed">Closed for Bidding</option>
                    <option value="awarded">Awarded</option>
                  </select>
                  <select 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value)}
                    className="category-filter"
                  >
                    <option value="newest">Sort: Newest</option>
                    <option value="endingSoon">Sort: Deadline</option>
                  </select>
                  <div className="view-toggle">
                    <button 
                      onClick={() => setViewMode('grid')} 
                      className={viewMode === 'grid' ? 'active' : ''}
                    >
                      <FiGrid size={16} />
                    </button>
                    <button 
                      onClick={() => setViewMode('table')} 
                      className={viewMode === 'table' ? 'active' : ''}
                    >
                      <FiList size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {filteredAndSortedTenders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No Tenders Found</h3>
                  <p>There are no tenders matching your criteria.</p>
                  <button className="primary-btn" onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}>
                    Clear Filters
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <TenderGrid tenders={filteredAndSortedTenders} onPublish={publishTender} onViewDetail={setSelectedTender} />
              ) : (
                <TenderTable tenders={filteredAndSortedTenders} onPublish={publishTender} onViewDetail={setSelectedTender} />
              )}
            </div>

            {/* Quick Actions Sidebar */}
            <div className="section-card quick-actions-sidebar">
              <div className="section-header">
                <h3>Quick Actions</h3>
                <p>Manage your tenders efficiently</p>
              </div>
              <div className="quick-actions-list">
                <QuickActionCard
                  icon="📝"
                  title="Create New Tender"
                  description="Start a new tender process"
                  link="/institute/tenders/create"
                  color="blue"
                />
                <QuickActionCard
                  icon="📊"
                  title="Analytics Dashboard"
                  description="View tender performance"
                  link="/institute/dashboard/analytics"
                  color="purple"
                />
                <QuickActionCard
                  icon="⚡"
                  title="Pending Actions"
                  description="Tenders needing attention"
                  link="/institute/tenders?status=pending"
                  color="orange"
                />
                <QuickActionCard
                  icon="📋"
                  title="Bid Evaluation"
                  description="Review submitted bids"
                  link="/institute/tenders?status=open"
                  color="green"
                />
              </div>

              {/* Tips Section */}
              <div className="tips-section">
                <h4>💡 Management Tips</h4>
                <ul>
                  <li>Review bids carefully before awarding</li>
                  <li>Publish tenders well in advance</li>
                  <li>Monitor bidding activity regularly</li>
                  <li>Ensure all documents are attached</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .institute-tenders-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Welcome Banner */
        .welcome-banner {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
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
          min-width: 160px;
        }

        .view-toggle {
          display: flex;
          background-color: #f1f5f9;
          border-radius: 10px;
          padding: 4px;
        }

        .view-toggle button {
          background: transparent;
          border: none;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .view-toggle button.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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

        .tender-card.pending::before { background: #f59e0b; }
        .tender-card.open::before { background: #10b981; }
        .tender-card.closed::before { background: #6b7280; }
        .tender-card.awarded::before { background: #8b5cf6; }

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

        .status-badge.pending { background: #fef3c7; color: #92400e; }
        .status-badge.open { background: #d1fae5; color: #065f46; }
        .status-badge.closed { background: #f3f4f6; color: #374151; }
        .status-badge.awarded { background: #ede9fe; color: #5b21b6; }

        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
          line-height: 1.4;
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

        .progress-bar-container {
          height: 6px;
          background: #f1f5f9;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #3b82f6);
          border-radius: 10px;
          transition: width 0.5s ease;
        }

        .card-actions {
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

        .action-btn.success {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }

        .action-btn.warning {
          background: #f59e0b;
          color: white;
          border-color: #f59e0b;
        }

        .action-btn:disabled {
          background: #f3f4f6;
          color: #9ca3af;
          border-color: #e5e7eb;
          cursor: not-allowed;
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        /* Quick Actions Sidebar */
        .quick-actions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
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

        /* Tips Section */
        .tips-section {
          background: #f0f9ff;
          border: 1px solid #e0f2fe;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .tips-section h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #0369a1;
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tips-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tips-section li {
          padding: 0.5rem 0;
          color: #0c4a6e;
          font-size: 0.9rem;
          border-bottom: 1px solid #e0f2fe;
        }

        .tips-section li:last-child {
          border-bottom: none;
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

          .card-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .card-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// Helper functions
const isBiddingClosed = (deadline) => {
  return new Date(deadline) < new Date();
};

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

// Tender Card Component for Grid View
const TenderCard = ({ tender, onPublish, onViewDetail, index }) => {
  const timeLeft = useTimeLeft(tender.submission_deadline);
  
  const getStatusConfig = () => {
    if (tender.status === 'awarded') return { type: 'awarded', text: 'Awarded', badgeClass: 'awarded' };
    if (!tender.is_checked) return { type: 'pending', text: 'Pending', badgeClass: 'pending' };
    if (timeLeft.isClosed) return { type: 'closed', text: 'Closed', badgeClass: 'closed' };
    return { type: 'open', text: 'Open', badgeClass: 'open' };
  };

  const statusConfig = getStatusConfig();
  const progressPercentage = Math.max(0, (timeLeft.total / (24 * 60 * 60 * 1000 * 30)) * 100);

  return (
    <div 
      className={`tender-card ${statusConfig.type}`} 
      onClick={() => onViewDetail(tender)}
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
            <div className="stat-value-small">{tender.bids?.length || 0}</div>
          </div>
        </div>
        <div className="card-stat">
          <FiClock />
          <div>
            <div className="stat-label-small">Time Left</div>
            <div className="stat-value-small">{timeLeft.text}</div>
          </div>
        </div>
        <div className="card-stat">
          <FiHome />
          <div>
            <div className="stat-label-small">Category</div>
            <div className="stat-value-small">{tender.category?.category_name || 'General'}</div>
          </div>
        </div>
      </div>

      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="card-actions">
        {statusConfig.type === 'pending' ? (
          <button 
            className="action-btn warning"
            onClick={(e) => {
              e.stopPropagation();
              onPublish(tender.tender_id);
            }}
          >
            <FiCheck size={16} />
            Publish
          </button>
        ) : (
          <button className="action-btn primary">
            <FiEye size={16} />
            View Details
          </button>
        )}
        <button className="action-btn">
          <FiFileText size={16} />
          Documents
        </button>
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
const LoadingSkeleton = ({ viewMode }) => (
  <div className={viewMode === 'grid' ? 'skeleton-grid' : 'table-container'}>
    {viewMode === 'grid' ? (
      [...Array(6)].map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line" style={{ width: '40%', height: '1.25rem' }} />
          <div className="skeleton-line title" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
          <div className="skeleton-line" style={{ width: '80%', marginTop: '1rem' }} />
        </div>
      ))
    ) : (
      <div style={{ padding: '1rem' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton-line" style={{ marginBottom: '1rem', height: '2rem' }} />
        ))}
      </div>
    )}
  </div>
);

// Tender Grid Component
const TenderGrid = ({ tenders, onPublish, onViewDetail }) => (
  <div className="tenders-grid">
    {tenders.map((tender, index) => 
      <TenderCard 
        key={tender.tender_id} 
        tender={tender} 
        onPublish={onPublish}
        onViewDetail={onViewDetail}
        index={index}
      />
    )}
  </div>
);

// Tender Table Component
const TenderTable = ({ tenders, onPublish, onViewDetail }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Tender Title / Number</th>
            <th>Department</th>
            <th>Deadline</th>
            <th>Submissions</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenders.map(tender => {
            const timeLeft = useTimeLeft(tender.submission_deadline);
            const getStatusConfig = () => {
              if (tender.status === 'awarded') return { text: 'Awarded', badgeClass: 'awarded' };
              if (!tender.is_checked) return { text: 'Pending', badgeClass: 'pending' };
              if (timeLeft.isClosed) return { text: 'Closed', badgeClass: 'closed' };
              return { text: 'Open', badgeClass: 'open' };
            };
            const statusConfig = getStatusConfig();

            return (
              <tr key={tender.tender_id}>
                <td onClick={() => onViewDetail(tender)} className="clickable-cell">
                  <div className="td-title">{tender.title}</div>
                  <div className="td-subtitle">{tender.tender_number}</div>
                </td>
                <td>{tender.department?.dept_name}</td>
                <td className={timeLeft.isClosed ? 'deadline-closed' : 'deadline-active'}>
                  {timeLeft.text}
                </td>
                <td>{tender.bids?.length || 0}</td>
                <td>
                  <span className={`status-badge ${statusConfig.badgeClass}`}>
                    {statusConfig.text}
                  </span>
                </td>
                <td>
                  {statusConfig.badgeClass === 'pending' ? (
                    <button 
                      className="action-btn warning"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPublish(tender.tender_id);
                      }}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                      Publish
                    </button>
                  ) : (
                    <button 
                      className="action-btn primary"
                      onClick={() => onViewDetail(tender)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                      View
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Enhanced Tender Detail View Component
const TenderDetailView = ({ tender, onBack, onAcceptBid }) => {
  const timeLeft = useTimeLeft(tender.submission_deadline);
  const isTenderAwarded = useMemo(() => tender.status === 'awarded', [tender.status]);
  const lowestBid = useMemo(() => {
    if (!tender.bids || tender.bids.length === 0) return null;
    return tender.bids.reduce((min, bid) => bid.bid_amount < min.bid_amount ? bid : min, tender.bids[0]);
  }, [tender.bids]);
  
  const getStatusInfo = () => {
    if (isTenderAwarded) return { text: 'Awarded', className: 'awarded', icon: '🏆' };
    if (timeLeft.isClosed) return { text: 'Closed for Bidding', className: 'closed', icon: '🔒' };
    if (tender.is_checked) return { text: 'Open for Bidding', className: 'open', icon: '📢' };
    return { text: 'Pending Publication', className: 'pending', icon: '⏳' };
  };
  
  const statusInfo = getStatusInfo();

  return (
    <div className="detail-view-container">
      <button onClick={onBack} className="back-button">
        <FiArrowRight style={{ transform: 'rotate(180deg)' }} />
        Back to Tenders
      </button>
      
      <div className="detail-header">
        <div className="detail-title-section">
          <h1 className="detail-title">{tender.title}</h1>
          <p className="detail-subtitle">Tender No: {tender.tender_number}</p>
          <div className="detail-meta">
            <span className="meta-item">
              <FiCalendar size={16} />
              Published: {new Date(tender.publish_date).toLocaleDateString()}
            </span>
            <span className="meta-item">
              <FiMapPin size={16} />
              Department: {tender.department?.dept_name}
            </span>
            <span className="meta-item">
              <FiTag size={16} />
              Category: {tender.category?.category_name || 'General'}
            </span>
          </div>
        </div>
        <div className={`detail-status ${statusInfo.className}`}>
          <span className="status-icon">{statusInfo.icon}</span>
          <span className="status-text">{statusInfo.text}</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="detail-stats-grid">
        <div className="detail-stat-card">
          <div className="stat-icon-wrapper">
            <FiClock className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Time Remaining</h3>
            <p className={timeLeft.isClosed ? 'closed' : 'active'}>{timeLeft.text}</p>
          </div>
        </div>
        
        <div className="detail-stat-card">
          <div className="stat-icon-wrapper">
            <FiDollarSign className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Estimated Cost</h3>
            <p>₹{tender.estimated_cost?.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="detail-stat-card">
          <div className="stat-icon-wrapper">
            <FiUsers className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Bids Received</h3>
            <p>{tender.bids?.length || 0}</p>
          </div>
        </div>
        
        <div className="detail-stat-card">
          <div className="stat-icon-wrapper">
            <FiAward className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Lowest Bid</h3>
            <p className={lowestBid ? 'lowest' : 'na'}>
              {lowestBid ? `₹${lowestBid.bid_amount.toLocaleString()}` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="detail-content-grid">
        <div className="main-content">
          {/* Description Section */}
          <section className="content-section">
            <h2 className="section-title">
              <FiFileText className="section-icon" />
              Tender Description
            </h2>
            <div className="section-content">
              <p>{tender.description}</p>
            </div>
          </section>

          {/* Documents Section */}
          <section className="content-section">
            <h2 className="section-title">
              <FiDownload className="section-icon" />
              Tender Documents
            </h2>
            <div className="section-content">
              {tender.documents?.length > 0 ? (
                <div className="documents-grid">
                  {tender.documents.map(doc => (
                    <a 
                      key={doc.doc_id}
                      href={`http://127.0.0.1:8000/api/v1/tenders/documents/${doc.doc_id}/download`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="document-card"
                    >
                      <div className="document-icon">
                        <FiFileText size={24} />
                      </div>
                      <div className="document-info">
                        <h4>{doc.document_name}</h4>
                        <p>Click to download</p>
                      </div>
                      <FiDownload className="download-icon" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FiFileText size={48} className="empty-icon" />
                  <p>No documents attached to this tender</p>
                </div>
              )}
            </div>
          </section>

          {/* Bids Section */}
          <section className="content-section">
            <h2 className="section-title">
              <FiBarChart2 className="section-icon" />
              Submitted Bids ({tender.bids?.length || 0})
            </h2>
            <div className="section-content">
              {tender.bids?.length > 0 ? (
                <div className="bids-table-container">
                  <table className="bids-table">
                    <thead>
                      <tr>
                        <th>Vendor</th>
                        <th>Bid Amount</th>
                        <th>Submitted On</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tender.bids.sort((a, b) => a.bid_amount - b.bid_amount).map((bid, index) => (
                        <tr key={bid.bid_id} className={bid.bid_id === lowestBid?.bid_id ? 'lowest-bid' : ''}>
                          <td>
                            <div className="vendor-info">
                              <div className="vendor-name">{bid.vendor.company_name}</div>
                              <div className="vendor-contact">{bid.vendor.user.username}</div>
                            </div>
                          </td>
                          <td>
                            <div className="bid-amount">
                              <span className="amount">₹{bid.bid_amount.toLocaleString()}</span>
                              {bid.bid_id === lowestBid?.bid_id && (
                                <span className="lowest-badge">Lowest</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="submission-date">
                              {new Date(bid.submission_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td>
                            <span className={`bid-status ${bid.bid_status}`}>
                              {bid.bid_status}
                            </span>
                          </td>
                          <td>
                            {bid.bid_status !== 'awarded' && (
                              <button 
                                className={`accept-btn ${isTenderAwarded ? 'disabled' : ''}`}
                                onClick={() => onAcceptBid(bid.bid_id, tender.tender_id)} 
                                disabled={isTenderAwarded || !timeLeft.isClosed}
                                title={!timeLeft.isClosed ? "Bidding must be closed to award a tender" : (isTenderAwarded ? "A bid has already been awarded" : "Award to this vendor")}
                              >
                                {isTenderAwarded ? 'Decided' : 'Accept Bid'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <FiUsers size={48} className="empty-icon" />
                  <p>No bids have been submitted yet</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Key Information */}
          <section className="sidebar-section">
            <h3 className="sidebar-title">Key Information</h3>
            <div className="info-list">
              <div className="info-item">
                <label>Department</label>
                <span>{tender.department?.dept_name}</span>
              </div>
              <div className="info-item">
                <label>Category</label>
                <span>{tender.category?.category_name || 'General'}</span>
              </div>
              <div className="info-item">
                <label>Publish Date</label>
                <span>{new Date(tender.publish_date).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>Submission Deadline</label>
                <span>{new Date(tender.submission_deadline).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>Estimated Cost</label>
                <span>₹{tender.estimated_cost?.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="sidebar-section">
            <h3 className="sidebar-title">Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn primary">
                <FiDownload size={16} />
                Export Report
              </button>
              <button className="action-btn secondary">
                <FiUser size={16} />
                Contact Department
              </button>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .detail-view-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
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

        .detail-title-section {
          flex: 1;
        }

        .detail-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
        }

        .detail-subtitle {
          font-size: 1.1rem;
          color: #64748b;
          margin: 0 0 1rem 0;
        }

        .detail-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.9rem;
        }

        .detail-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .detail-status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .detail-status.open {
          background: #d1fae5;
          color: #065f46;
        }

        .detail-status.closed {
          background: #f3f4f6;
          color: #374151;
        }

        .detail-status.awarded {
          background: #ede9fe;
          color: #5b21b6;
        }

        .status-icon {
          font-size: 1.2rem;
        }

        /* Stats Grid */
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

        .stat-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon {
          color: #3b82f6;
          width: 24px;
          height: 24px;
        }

        .stat-content h3 {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          margin: 0 0 0.25rem 0;
        }

        .stat-content p {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .stat-content .closed {
          color: #ef4444;
        }

        .stat-content .active {
          color: #10b981;
        }

        .stat-content .lowest {
          color: #10b981;
        }

        .stat-content .na {
          color: #64748b;
        }

        /* Content Grid */
        .detail-content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 1024px) {
          .detail-content-grid {
            grid-template-columns: 1fr;
          }
        }

        .content-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-icon {
          color: #3b82f6;
        }

        .section-content {
          color: #64748b;
          line-height: 1.6;
        }

        /* Documents Grid */
        .documents-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .document-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
        }

        .document-card:hover {
          background: white;
          border-color: #3b82f6;
          transform: translateY(-1px);
        }

        .document-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: #dbeafe;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1d4ed8;
        }

        .document-info h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .document-info p {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }

        .download-icon {
          margin-left: auto;
          color: #64748b;
          transition: transform 0.3s ease;
        }

        .document-card:hover .download-icon {
          transform: translateY(2px);
          color: #3b82f6;
        }

        /* Bids Table */
        .bids-table-container {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
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

        .bids-table tr.lowest-bid {
          background: #f0fdf4;
        }

        .bids-table tr.lowest-bid td {
          border-color: #bbf7d0;
        }

        .vendor-info .vendor-name {
          font-weight: 600;
          color: #1e293b;
        }

        .vendor-info .vendor-contact {
          font-size: 0.8rem;
          color: #64748b;
        }

        .bid-amount {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .bid-amount .amount {
          font-weight: 700;
          color: #1e293b;
        }

        .lowest-badge {
          background: #10b981;
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .bid-status {
          padding: 0.4rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .bid-status.awarded {
          background: #d1fae5;
          color: #065f46;
        }

        .bid-status.submitted {
          background: #dbeafe;
          color: #1e40af;
        }

        .bid-status.disqualified {
          background: #f3f4f6;
          color: #374151;
        }

        .accept-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.8rem;
        }

        .accept-btn:hover:not(.disabled) {
          background: #059669;
          transform: translateY(-1px);
        }

        .accept-btn.disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        /* Sidebar */
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .sidebar-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .sidebar-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .info-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .info-item label {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
        }

        .info-item span {
          font-size: 0.9rem;
          color: #1e293b;
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .action-btn.primary {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .action-btn.secondary {
          background: white;
          color: #374151;
          border-color: #e2e8f0;
        }

        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .action-btn.primary:hover {
          background: #2563eb;
        }

        .action-btn.secondary:hover {
          background: #f8fafc;
        }

        /* Empty States */
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }

        .empty-icon {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .detail-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .detail-stats-grid {
            grid-template-columns: 1fr;
          }

          .bids-table-container {
            overflow-x: auto;
          }

          .detail-meta {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};