import React, { useState, useEffect, useMemo } from "react";
import { FiSearch, FiFilter, FiClock, FiDollarSign, FiUsers, FiFileText, FiAward, FiArrowRight, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiXCircle, FiEdit, FiHome } from "react-icons/fi";

// A custom hook for a smoother countdown timer
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

// Helper function to check if bidding is closed (without using hooks)
const isBiddingClosed = (deadline) => {
  return new Date(deadline) < new Date();
};

// Helper function to calculate time left text (without using hooks)
const getTimeLeftText = (deadline) => {
  const difference = +new Date(deadline) - +new Date();
  if (difference <= 0) return 'Closed';
  
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
};

// Helper function to check if tender is new today
const isNewToday = (publishDate) => {
  const publish = new Date(publishDate);
  const today = new Date();
  return publish.toDateString() === today.toDateString();
};

// Helper function to check if tender is high priority (closing in 3 days or less)
const isHighPriority = (deadline) => {
  const difference = +new Date(deadline) - +new Date();
  if (difference <= 0) return false;
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  return days <= 3;
};

// Main Component for the Vendor
export default function VendorTendersPage() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTender, setSelectedTender] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tendersRes, myBidsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/v1/tenders/all", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://127.0.0.1:8000/api/v1/bids/", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (!tendersRes.ok || !myBidsRes.ok) throw new Error("Failed to fetch data.");
        
        const tendersData = await tendersRes.json();
        const myBidsData = await myBidsRes.json();
        
        const myBidTenderIds = new Set(myBidsData.map(bid => bid.tender_id));
        const updatedTenders = tendersData.map(tender => ({ 
          ...tender, 
          userBidSubmitted: myBidTenderIds.has(tender.tender_id) 
        }));

        setTenders(updatedTenders);
      } catch (err) {
        console.error("Error fetching data:", err);
        alert(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };
    
    if (!selectedTender) fetchData();
  }, [selectedTender, token]);

  const handleBidSubmitSuccess = (newBid) => {
    setTenders(prev => prev.map(t => t.tender_id === newBid.tender_id ? { ...t, userBidSubmitted: true } : t));
    setSelectedTender(prev => ({...prev, userBidSubmitted: true}));
  };

  const filteredTenders = useMemo(() => {
    const uniqueCategories = [...new Set(tenders.map(t => t.category?.category_name).filter(Boolean))];
    const list = tenders
      .filter(tender => {
        if (filterCategory !== "all" && tender.category?.category_name !== filterCategory) return false;
        const lowerSearchTerm = searchTerm.toLowerCase();
        return !lowerSearchTerm || 
               tender.title.toLowerCase().includes(lowerSearchTerm) ||
               tender.department.institute.institute_name.toLowerCase().includes(lowerSearchTerm);
      })
      .sort((a, b) => new Date(a.submission_deadline) - new Date(b.submission_deadline));
    return { list, uniqueCategories };
  }, [tenders, searchTerm, filterCategory]);

  // Calculate stats for the header (without using hooks inside useMemo)
  const stats = useMemo(() => {
    const activeTenders = tenders.filter(t => !isBiddingClosed(t.submission_deadline)).length;
    const highPriority = tenders.filter(t => isHighPriority(t.submission_deadline)).length;
    const newToday = tenders.filter(t => isNewToday(t.publish_date)).length;
    
    return {
      total: tenders.length,
      active: activeTenders,
      highPriority,
      newToday
    };
  }, [tenders]);

  return (
    <div className="vendor-tenders-page">
      {selectedTender ? (
        <TenderDetailView 
          tender={selectedTender} 
          onBack={() => setSelectedTender(null)}
          onBidSubmitSuccess={handleBidSubmitSuccess}
        />
      ) : (
        <>
          {/* Welcome Section */}
          <div className="welcome-banner">
            <div className="welcome-content">
              <h1>Available Tenders 🏆</h1>
              <p>Discover new opportunities and submit your bids</p>
            </div>
            <div className="welcome-graphic">
              <div className="graphic-item">📈</div>
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
              icon={<FiClock size={24} />}
              value={stats.active}
              label="Active Tenders"
              color="green"
            />
            <StatCard
              icon={<FiAlertCircle size={24} />}
              value={stats.highPriority}
              label="Urgent Deadlines"
              color="red"
            />
            <StatCard
              icon={<FiAward size={24} />}
              value={stats.newToday}
              label="New Today"
              color="purple"
            />
          </div>

          {/* Main Content Grid */}
          <div className="content-grid">
            {/* Tenders List */}
            <div className="section-card tenders-section">
              <div className="section-header">
                <div>
                  <h3>Available Tenders</h3>
                  <p>Browse and apply for new opportunities</p>
                </div>
                <div className="search-controls">
                  <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search by title or institute..." 
                      className="search-input"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    value={filterCategory} 
                    onChange={e => setFilterCategory(e.target.value)}
                    className="category-filter"
                  >
                    <option value="all">All Categories</option>
                    {filteredTenders.uniqueCategories.map(cat => 
                      <option key={cat} value={cat}>{cat}</option>
                    )}
                  </select>
                </div>
              </div>

              {loading ? (
                <LoadingSkeleton />
              ) : filteredTenders.list.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No Tenders Found</h3>
                  <p>There are no available tenders matching your criteria. Please check back later.</p>
                  <button className="primary-btn" onClick={() => { setSearchTerm(''); setFilterCategory('all'); }}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="tenders-grid">
                  {filteredTenders.list.map((tender, index) => 
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

            {/* Quick Actions Sidebar */}
            <div className="section-card quick-actions-sidebar">
              <div className="section-header">
                <h3>Quick Actions</h3>
                <p>Get things done quickly</p>
              </div>
              <div className="quick-actions-list">
                <QuickActionCard
                  icon="💼"
                  title="My Bids"
                  description="Track your submissions"
                  link="/vendor/dashboard/bids"
                  color="blue"
                />
                <QuickActionCard
                  icon="📊"
                  title="Performance"
                  description="View analytics & metrics"
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
                <QuickActionCard
                  icon="🔔"
                  title="Notifications"
                  description="View updates & alerts"
                  link="/vendor/dashboard/notifications"
                  color="green"
                />
              </div>

              {/* Tips Section */}
              <div className="tips-section">
                <h4>💡 Bid Success Tips</h4>
                <ul>
                  <li>Review all documents carefully</li>
                  <li>Submit well before deadline</li>
                  <li>Ensure accurate pricing</li>
                  <li>Include all required documents</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .vendor-tenders-page {
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

        .tender-card.open::before { background: #10b981; }
        .tender-card.closed::before { background: #6b7280; }
        .tender-card.awarded::before { background: #8b5cf6; }
        .tender-card.urgent::before { background: #ef4444; }

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

        .card-institute {
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

        .status-badge.open { background: #d1fae5; color: #065f46; }
        .status-badge.closed { background: #f3f4f6; color: #374151; }
        .status-badge.awarded { background: #ede9fe; color: #5b21b6; }
        .status-badge.urgent { background: #fee2e2; color: #dc2626; }

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
          cursor: default;
        }

        .action-btn:disabled {
          background: #f3f4f6;
          color: #9ca3af;
          border-color: #e5e7eb;
          cursor: not-allowed;
        }

        .action-btn:hover:not(:disabled):not(.success) {
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
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }

        .detail-stat-icon.closed {
          background: linear-gradient(135deg, #6b7280, #4b5563);
        }

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

        .detail-stat-content .closed {
          color: #ef4444;
        }

        .detail-main-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
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

        .document-list svg {
          width: 18px;
          height: 18px;
        }

        .empty-text {
          color: #9ca3af;
          font-style: italic;
        }

        .bid-form {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .step-indicator {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .step-indicator span {
          color: #9ca3af;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .step-indicator span.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .form-step {
          animation: fadeIn 0.3s ease;
        }

        .form-step label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .form-step input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .form-step input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .back-btn {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          flex: 1;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: #e5e7eb;
        }

        .submit-bid-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          flex: 2;
          transition: all 0.3s ease;
        }

        .submit-bid-btn:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
        }

        .submit-bid-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .bid-submitted-notice {
          background: #d1fae5;
          color: #065f46;
          padding: 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .bid-submitted-notice.closed {
          background: #f3f4f6;
          color: #374151;
        }

        .bid-submitted-notice svg {
          width: 20px;
          height: 20px;
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

          .form-actions {
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
  const timeLeft = useTimeLeft(tender.submission_deadline);
  
  const getStatusConfig = () => {
    if (tender.status === 'awarded') return { type: 'awarded', text: 'Awarded', badgeClass: 'awarded' };
    if (timeLeft.isClosed) return { type: 'closed', text: 'Closed', badgeClass: 'closed' };
    if (timeLeft.days <= 1) return { type: 'urgent', text: 'Urgent', badgeClass: 'urgent' };
    return { type: 'open', text: 'Open', badgeClass: 'open' };
  };

  const statusConfig = getStatusConfig();
  const progressPercentage = Math.max(0, (timeLeft.total / (24 * 60 * 60 * 1000 * 30)) * 100); // 30 days max

  return (
    <div 
      className={`tender-card ${statusConfig.type}`} 
      onClick={onViewDetail}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="card-header">
        <span className="card-institute">{tender.department?.institute.institute_name}</span>
        <span className={`status-badge ${statusConfig.badgeClass}`}>
          {statusConfig.text}
        </span>
      </div>
      
      <h3 className="card-title">{tender.title}</h3>
      
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
        {tender.userBidSubmitted ? (
          <button className="action-btn success" disabled>
            <FiCheckCircle size={16} />
            Bid Submitted
          </button>
        ) : timeLeft.isClosed ? (
          <button className="action-btn" disabled>
            <FiXCircle size={16} />
            Bidding Closed
          </button>
        ) : (
          <button className="action-btn primary">
            <FiArrowRight size={16} />
            Place Bid
          </button>
        )}
        <button className="action-btn">
          <FiFileText size={16} />
          Details
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
const TenderDetailView = ({ tender, onBack, onBidSubmitSuccess }) => {
    const timeLeft = useTimeLeft(tender.submission_deadline);
    const [bidAmount, setBidAmount] = useState("");
    const [bidFile, setBidFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const token = localStorage.getItem("token");

    const handleSubmitBid = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const bidRes = await fetch("http://127.0.0.1:8000/api/v1/bids/", {
                method: "POST", 
                headers: { 
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    tender_id: tender.tender_id, 
                    bid_amount: parseFloat(bidAmount) 
                }),
            });
            if (!bidRes.ok) throw new Error((await bidRes.json()).detail || "Failed to create bid.");
            const newBid = await bidRes.json();

            if (bidFile) {
                const formData = new FormData();
                formData.append("file", bidFile);
                const docRes = await fetch(`http://127.0.0.1:8000/api/v1/bids/${newBid.bid_id}/documents/`, {
                    method: "POST", 
                    headers: { Authorization: `Bearer ${token}` }, 
                    body: formData,
                });
                if (!docRes.ok) throw new Error((await docRes.json()).detail || "Failed to upload document.");
            }

            onBidSubmitSuccess(newBid);
        } catch (err) {
            console.error(err); 
            alert(`Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusConfig = () => {
        if (tender.status === 'awarded') return { type: 'awarded', text: 'Awarded', badgeClass: 'awarded' };
        if (timeLeft.isClosed) return { type: 'closed', text: 'Closed', badgeClass: 'closed' };
        if (timeLeft.days <= 1) return { type: 'urgent', text: 'Urgent', badgeClass: 'urgent' };
        return { type: 'open', text: 'Open', badgeClass: 'open' };
    };

    const statusConfig = getStatusConfig();
    
    return (
        <div className="detail-view-container">
            <button onClick={onBack} className="back-button">
                <FiArrowRight style={{ transform: 'rotate(180deg)' }} />
                Back to Tenders
            </button>
            
            <header className="detail-header">
                <div>
                    <h1 className="detail-title">{tender.title}</h1>
                    <p className="detail-subtitle">{tender.tender_number}</p>
                </div>
                <span className={`status-badge ${statusConfig.badgeClass}`}>
                    {statusConfig.text}
                </span>
            </header>

            <div className="detail-stats-grid">
                <div className={`detail-stat-card ${timeLeft.isClosed ? 'closed' : ''}`}>
                    <div className={`detail-stat-icon ${timeLeft.isClosed ? 'closed' : ''}`}>
                        <FiClock size={24} />
                    </div>
                    <div className="detail-stat-content">
                        <h4>Bidding {timeLeft.isClosed ? 'Closed' : 'Ends In'}</h4>
                        <p className={timeLeft.isClosed ? 'closed' : ''}>
                            {timeLeft.isClosed ? 'Closed' : timeLeft.text}
                        </p>
                    </div>
                </div>
                
                <div className="detail-stat-card">
                    <div className="detail-stat-icon">
                        <FiDollarSign size={24} />
                    </div>
                    <div className="detail-stat-content">
                        <h4>Estimated Cost</h4>
                        <p>₹{tender.estimated_cost?.toLocaleString()}</p>
                    </div>
                </div>
                
                <div className="detail-stat-card">
                    <div className="detail-stat-icon">
                        <FiHome size={24} />
                    </div>
                    <div className="detail-stat-content">
                        <h4>Institute</h4>
                        <p>{tender.department.institute.institute_name}</p>
                    </div>
                </div>
                
                <div className="detail-stat-card">
                    <div className="detail-stat-icon">
                        <FiUsers size={24} />
                    </div>
                    <div className="detail-stat-content">
                        <h4>Bids Received</h4>
                        <p>{tender.bids?.length || 0}</p>
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
                                            <FiFileText />
                                            {doc.document_name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-text">No documents attached.</p>
                        )}
                    </section>
                </div>
                
                <aside className="metadata-col">
                    <section className="detail-section">
                        <h3 className="section-title">Submit Your Bid</h3>
                        {tender.userBidSubmitted ? (
                            <div className="bid-submitted-notice">
                                <FiCheckCircle />
                                Your bid has been submitted.
                            </div>
                        ) : timeLeft.isClosed ? (
                            <div className="bid-submitted-notice closed">
                                <FiXCircle />
                                Bidding for this tender has closed.
                            </div>
                        ) : (
                            <form className="bid-form" onSubmit={handleSubmitBid}>
                                <div className="step-indicator">
                                    <span className={step >= 1 ? 'active' : ''}>1. Amount</span>
                                    <span className={step >= 2 ? 'active' : ''}>2. Document</span>
                                </div>
                                
                                {step === 1 && (
                                    <div className="form-step">
                                        <label>Your Bid Amount (₹)</label>
                                        <input 
                                            type="number" 
                                            placeholder="e.g., 50000" 
                                            value={bidAmount} 
                                            onChange={e => setBidAmount(e.target.value)} 
                                            required 
                                            min="1"
                                        />
                                        <button 
                                            type="button" 
                                            className="submit-bid-btn" 
                                            onClick={() => setStep(2)} 
                                            disabled={!bidAmount || parseFloat(bidAmount) <= 0}
                                        >
                                            Next Step →
                                        </button>
                                    </div>
                                )}
                                
                                {step === 2 && (
                                    <div className="form-step">
                                        <label>Attach Bid Document (Optional)</label>
                                        <input 
                                            type="file" 
                                            onChange={e => setBidFile(e.target.files[0])} 
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        />
                                        <div className="form-actions">
                                            <button 
                                                type="button" 
                                                className="back-btn" 
                                                onClick={() => setStep(1)}
                                            >
                                                ← Back
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="submit-bid-btn" 
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? "Submitting..." : "Confirm & Submit"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        )}
                    </section>
                </aside>
            </div>
        </div>
    );
};