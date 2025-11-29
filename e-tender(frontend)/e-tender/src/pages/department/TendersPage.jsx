import React, { useState, useEffect, useMemo } from "react";
import { FiFileText, FiFolder, FiPlus, FiSearch, FiFilter, FiGrid, FiList, FiArrowLeft, FiClock, FiDollarSign, FiAward, FiUsers, FiCheckCircle, FiXCircle, FiAlertCircle, FiDownload, FiEye } from 'react-icons/fi';

// A custom hook to calculate and update time left for deadlines
const useTimeLeft = (deadline) => {
  const [timeLeft, setTimeLeft] = useState({ text: "", isClosed: false });

  useEffect(() => {
    const calculate = () => {
      const difference = +new Date(deadline) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ text: "Bidding Closed", isClosed: true });
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0 && days === 0) parts.push(`${minutes}m`);
      setTimeLeft({ text: `Closes in ${parts.join(' ')}`, isClosed: false });
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  return timeLeft;
};

// Main Component for the Department User
export default function DepartmentTendersPage() {
  const [activeView, setActiveView] = useState(''); // '', 'create', 'view'
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tender_number: "", title: "", description: "", estimated_cost: "",
    submission_deadline: "", category_name: "",
  });
  const [filesToUpload, setFilesToUpload] = useState([]);

  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (activeView === 'view' && !selectedTender) {
      setLoading(true);
      fetch("http://127.0.0.1:8000/api/v1/tenders/my-department", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch department tenders."))
        .then(data => setTenders(data))
        .catch(err => { console.error(err); alert(err.message || "An error occurred."); })
        .finally(() => setLoading(false));
    }
  }, [activeView, selectedTender, token]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        tender_number: formData.tender_number,
        title: formData.title,
        description: formData.description,
        estimated_cost: Number(formData.estimated_cost),
        submission_deadline: new Date(formData.submission_deadline).toISOString(),
        category_name: formData.category_name || "General",
        category_id: 0,
      };

      const tenderRes = await fetch("http://127.0.0.1:8000/api/v1/tenders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!tenderRes.ok) {
        const errorData = await tenderRes.json();
        let errorMessage = "Tender creation failed.";
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail
            .map((err) => `${err.loc[1]}: ${err.msg}`)
            .join("\n");
        } else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
        throw new Error(errorMessage);
      }

      const newTender = await tenderRes.json();

      if (filesToUpload.length > 0) {
        // File upload logic here
      }
      
      alert("Tender created successfully!");
      setFormData({ 
        tender_number: "", 
        title: "", 
        description: "", 
        estimated_cost: "", 
        submission_deadline: "", 
        category_name: "" 
      });
      setFilesToUpload([]);
      if (document.getElementById('file-input')) {
        document.getElementById('file-input').value = null;
      }
      setActiveView("view");
      setTenders(prevTenders => [newTender, ...prevTenders]);

    } catch (err) {
      console.error("Submission Error:", err);
      alert(`An error occurred: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        return !lowerSearchTerm ||
          tender.title.toLowerCase().includes(lowerSearchTerm) ||
          tender.tender_number.toLowerCase().includes(lowerSearchTerm);
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

  if (loading) return (
    <div className="department-tenders-page">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading block tenders...</p>
      </div>
    </div>
  );

  return (
    <div className="department-tenders-page">
      {!activeView ? (
        <MainMenu onCardClick={setActiveView} />
      ) : activeView === 'create' ? (
        <>
          <button onClick={() => setActiveView('')} className="back-button">
            <FiArrowLeft size={16} />
            Back to Menu
          </button>
          <CreateTenderForm
            formData={formData}
            setFormData={setFormData}
            setFilesToUpload={setFilesToUpload}
            isSubmitting={isSubmitting}
            onSubmit={handleCreateSubmit}
          />
        </>
      ) : ( // activeView === 'view'
        selectedTender ? (
          <TenderDetailView tender={selectedTender} onBack={() => setSelectedTender(null)} />
        ) : (
          <>
            <PageHeader
              onBack={() => setActiveView('')}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onSearch={setSearchTerm}
              onFilter={setFilterStatus}
              onSort={setSortBy}
            />
            {filteredAndSortedTenders.length === 0 ? (
              <div className="empty-state">
                <FiFileText size={48} />
                <h3>No Tenders Found</h3>
                <p>No tenders match your current search criteria.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <TenderGrid tenders={filteredAndSortedTenders} onViewDetail={setSelectedTender} />
            ) : (
              <TenderTable tenders={filteredAndSortedTenders} onViewDetail={setSelectedTender} />
            )}
          </>
        )
      )}
      <style jsx>{`
        .department-tenders-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

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

        .loading-container p {
          color: #64748b;
          font-size: 1rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          color: #64748b;
        }

        .empty-state h3 {
          color: #374151;
          margin: 1rem 0 0.5rem 0;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          color: #64748b;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 2rem;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          border-color: #6366f1;
          color: #6366f1;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

// --- UI HELPER COMPONENTS ---

const MainMenu = ({ onCardClick }) => (
  <>
    <div className="welcome-banner">
      <div className="welcome-content">
        <h1>Block's Tender Management</h1>
        <p>Create and manage tenders for your block</p>
      </div>
    </div>
    
    <div className="options-grid">
      <div className="option-card primary" onClick={() => onCardClick("create")}>
        <div className="card-icon">
          <FiPlus size={24} />
        </div>
        <div className="card-content">
          <h3>Create New Tender</h3>
          <p>Initiate a new procurement process and upload tender documents</p>
        </div>
      </div>
      
      <div className="option-card secondary" onClick={() => onCardClick("view")}>
        <div className="card-icon">
          <FiFolder size={24} />
        </div>
        <div className="card-content">
          <h3>View My Tenders</h3>
          <p>Review status and submitted bids for all your tenders</p>
        </div>
      </div>
    </div>

    <style jsx>{`
      .welcome-banner {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 2.5rem;
        margin-bottom: 2rem;
        color: white;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      }

      .welcome-content h1 {
        font-size: 2.2rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
      }

      .welcome-content p {
        font-size: 1.1rem;
        opacity: 0.9;
        margin: 0;
      }

      .options-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
        max-width: 900px;
        margin: 0 auto;
      }

      .option-card {
        background: white;
        border-radius: 16px;
        padding: 2.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border: 1px solid #e2e8f0;
        display: flex;
        align-items: flex-start;
        gap: 1.5rem;
      }

      .option-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        border-color: #6366f1;
      }

      .option-card.primary:hover {
        border-color: #6366f1;
      }

      .option-card.secondary:hover {
        border-color: #10b981;
      }

      .card-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }

      .option-card.primary .card-icon {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
      }

      .option-card.secondary .card-icon {
        background: linear-gradient(135deg, #10b981, #059669);
      }

      .card-content h3 {
        font-size: 1.25rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 0.75rem 0;
      }

      .card-content p {
        color: #64748b;
        margin: 0;
        line-height: 1.5;
      }
    `}</style>
  </>
);

const CreateTenderForm = ({ formData, setFormData, setFilesToUpload, isSubmitting, onSubmit }) => (
  <div className="form-container">
    <div className="form-card">
      <div className="form-header">
        <div className="form-icon">
          <FiFileText size={24} />
        </div>
        <div>
          <h2>Create New Tender</h2>
          <p>Fill in the details to initiate a new tender process</p>
        </div>
      </div>
      
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Tender Number *</label>
            <input 
              type="text" 
              value={formData.tender_number} 
              onChange={(e) => setFormData({ ...formData, tender_number: e.target.value })} 
              required 
              placeholder="Enter tender reference number"
            />
          </div>
          
          <div className="form-group">
            <label>Title *</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              required 
              placeholder="Enter tender title"
            />
          </div>
          
          <div className="form-group full-width">
            <label>Description *</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              rows="4" 
              required 
              placeholder="Provide detailed description of the tender requirements"
            />
          </div>
          
          <div className="form-group">
            <label>Estimated Cost (₹) *</label>
            <input 
              type="number" 
              value={formData.estimated_cost} 
              onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })} 
              required 
              placeholder="Enter estimated amount"
            />
          </div>
          
          <div className="form-group">
            <label>Submission Deadline *</label>
            <input 
              type="datetime-local" 
              value={formData.submission_deadline} 
              onChange={(e) => setFormData({ ...formData, submission_deadline: e.target.value })} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Category Name</label>
            <input 
              type="text" 
              value={formData.category_name} 
              onChange={(e) => setFormData({ ...formData, category_name: e.target.value })} 
              placeholder="e.g., IT, Furniture, Construction"
            />
          </div>
          
          <div className="form-group full-width">
            <label>Tender Documents</label>
            <input 
              type="file" 
              id="file-input" 
              multiple 
              onChange={(e) => setFilesToUpload(e.target.files)} 
              className="file-input" 
            />
            <small>Upload relevant documents (PDF, DOC, images)</small>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-button primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="button-spinner"></div>
                Creating Tender...
              </>
            ) : (
              <>
                <FiPlus size={16} />
                Create Tender
              </>
            )}
          </button>
        </div>
      </form>
    </div>

    <style jsx>{`
      .form-container {
        max-width: 800px;
        margin: 0 auto;
      }

      .form-card {
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }

      .form-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 2rem 2rem 1rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .form-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: white;
      }

      .form-header h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 0.25rem 0;
      }

      .form-header p {
        color: #64748b;
        margin: 0;
      }

      .form-grid {
        padding: 2rem;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
      }

      .form-group.full-width {
        grid-column: 1 / -1;
      }

      .form-group label {
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
      }

      .form-group input,
      .form-group textarea {
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 0.95rem;
        transition: all 0.3s ease;
      }

      .form-group input:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .form-group textarea {
        resize: vertical;
        min-height: 100px;
      }

      .form-group small {
        color: #6b7280;
        font-size: 0.8rem;
        margin-top: 0.25rem;
      }

      .form-actions {
        padding: 1.5rem 2rem 2rem;
        border-top: 1px solid #e2e8f0;
      }

      .submit-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        padding: 1rem 2rem;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        justify-content: center;
      }

      .submit-button.primary {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: white;
      }

      .submit-button.primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
      }

      .submit-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .button-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    `}</style>
  </div>
);

const PageHeader = ({ onBack, viewMode, onViewModeChange, onSearch, onFilter, onSort }) => (
  <div className="page-header">
    <div className="header-top">
      <button onClick={onBack} className="back-button">
        <FiArrowLeft size={16} />
        Back to Menu
      </button>
      <div className="view-toggle">
        <button 
          onClick={() => onViewModeChange('grid')} 
          className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
        >
          <FiGrid size={16} />
          Grid
        </button>
        <button 
          onClick={() => onViewModeChange('table')} 
          className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
        >
          <FiList size={16} />
          Table
        </button>
      </div>
    </div>
    
    <div className="header-main">
      <h1 className="page-title">
        <FiFolder size={28} />
        My Block's Tenders
      </h1>
      <p className="page-subtitle">Manage and monitor all your block's tender activities</p>
    </div>

    <div className="header-controls">
      <div className="search-box">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search tenders by title or number..."
          onChange={(e) => onSearch(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="filter-controls">
        <select onChange={(e) => onFilter(e.target.value)} className="filter-select">
          <option value="all">All Tenders</option>
          <option value="pending">Pending Publication</option>
          <option value="open">Open for Bidding</option>
          <option value="closed">Closed for Bidding</option>
          <option value="awarded">Awarded</option>
        </select>
        
        <select onChange={(e) => onSort(e.target.value)} className="sort-select">
          <option value="newest">Newest First</option>
          <option value="endingSoon">Ending Soon</option>
        </select>
      </div>
    </div>

    <style jsx>{`
      .page-header {
        background: white;
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        margin-bottom: 2rem;
      }

      .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .view-toggle {
        display: flex;
        background: #f8fafc;
        border-radius: 10px;
        padding: 4px;
        border: 1px solid #e2e8f0;
      }

      .view-toggle-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        background: transparent;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        color: #64748b;
        transition: all 0.3s ease;
      }

      .view-toggle-btn.active {
        background: white;
        color: #6366f1;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .header-main {
        margin-bottom: 2rem;
      }

      .page-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.75rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 0.5rem 0;
      }

      .page-subtitle {
        color: #64748b;
        margin: 0;
        font-size: 1rem;
      }

      .header-controls {
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
      }

      .filter-select,
      .sort-select {
        padding: 0.75rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 10px;
        font-size: 0.9rem;
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .filter-select:focus,
      .sort-select:focus {
        outline: none;
        border-color: #6366f1;
      }

      @media (max-width: 768px) {
        .header-controls {
          flex-direction: column;
          align-items: stretch;
        }

        .search-box {
          min-width: auto;
        }

        .filter-controls {
          justify-content: space-between;
        }
      }
    `}</style>
  </div>
);

const TenderGrid = ({ tenders, onViewDetail }) => (
  <div className="tenders-grid">
    {tenders.map(tender => (
      <TenderCard key={tender.tender_id} tender={tender} onViewDetail={onViewDetail} />
    ))}
  </div>
);

const TenderCard = ({ tender, onViewDetail }) => {
  const timeLeft = useTimeLeft(tender.submission_deadline);
  
  return (
    <div className="tender-card">
      <div className="card-header">
        <div className="card-title-section">
          <h3 className="card-title">{tender.title}</h3>
          <StatusDisplay tender={tender} isBiddingClosed={timeLeft.isClosed} />
        </div>
        <p className="tender-number">{tender.tender_number}</p>
      </div>
      
      <div className="card-content">
        <div className="stats-row">
          <div className="stat">
            <FiDollarSign className="stat-icon" />
            <div className="stat-content">
              <span className="stat-label">Estimated Cost</span>
              <span className="stat-value">₹{tender.estimated_cost?.toLocaleString()}</span>
            </div>
          </div>
          <div className="stat">
            <FiUsers className="stat-icon" />
            <div className="stat-content">
              <span className="stat-label">Bids</span>
              <span className="stat-value">{tender.bids?.length || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="deadline-section">
          <FiClock className="deadline-icon" />
          <span className={`deadline-text ${timeLeft.isClosed ? 'closed' : 'active'}`}>
            {timeLeft.text}
          </span>
        </div>
      </div>
      
      <div className="card-actions">
        <button onClick={() => onViewDetail(tender)} className="view-details-btn">
          <FiFileText size={16} />
          View Details
        </button>
      </div>

      <style jsx>{`
        .tender-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .tender-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
          border-color: #6366f1;
        }

        .card-header {
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .card-title-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          line-height: 1.4;
          flex: 1;
        }

        .tender-number {
          color: #64748b;
          font-size: 0.85rem;
          margin: 0;
          font-family: 'Courier New', monospace;
        }

        .card-content {
          padding: 1rem 1.5rem;
        }

        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .stat-icon {
          color: #6366f1;
          flex-shrink: 0;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
        }

        .stat-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
        }

        .deadline-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
        }

        .deadline-icon {
          color: #64748b;
        }

        .deadline-text {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .deadline-text.active {
          color: #10b981;
        }

        .deadline-text.closed {
          color: #ef4444;
        }

        .card-actions {
          padding: 1rem 1.5rem;
          border-top: 1px solid #f1f5f9;
        }

        .view-details-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-details-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
      `}</style>
    </div>
  );
};

const TenderTable = ({ tenders, onViewDetail }) => {
  return (
    <div className="table-container">
      <table className="tenders-table">
        <thead>
          <tr>
            <th>Tender Details</th>
            <th>Deadline</th>
            <th>Bids</th>
            <th>Estimated Cost</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenders.map(tender => {
            const timeLeft = useTimeLeft(tender.submission_deadline);
            return (
              <tr key={tender.tender_id} className="table-row">
                <td onClick={() => onViewDetail(tender)} className="clickable-cell">
                  <div className="tender-info">
                    <div className="tender-title">{tender.title}</div>
                    <div className="tender-number">{tender.tender_number}</div>
                  </div>
                </td>
                <td>
                  <div className={`deadline ${timeLeft.isClosed ? 'closed' : 'active'}`}>
                    {timeLeft.text}
                  </div>
                </td>
                <td>
                  <div className="bids-count">
                    {tender.bids?.length || 0}
                  </div>
                </td>
                <td>
                  <div className="estimated-cost">
                    ₹{tender.estimated_cost?.toLocaleString()}
                  </div>
                </td>
                <td>
                  <StatusDisplay tender={tender} isBiddingClosed={timeLeft.isClosed} />
                </td>
                <td>
                  <button 
                    onClick={() => onViewDetail(tender)} 
                    className="table-action-btn"
                  >
                    <FiFileText size={14} />
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <style jsx>{`
        .table-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .tenders-table {
          width: 100%;
          border-collapse: collapse;
        }

        .tenders-table th {
          background: #f8fafc;
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
        }

        .tenders-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .table-row:hover {
          background: #f8fafc;
        }

        .table-row:last-child td {
          border-bottom: none;
        }

        .clickable-cell {
          cursor: pointer;
        }

        .tender-info {
          min-width: 200px;
        }

        .tender-title {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .tender-number {
          font-size: 0.85rem;
          color: #64748b;
          font-family: 'Courier New', monospace;
        }

        .deadline {
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          display: inline-block;
        }

        .deadline.active {
          background: #d1fae5;
          color: #065f46;
        }

        .deadline.closed {
          background: #fecaca;
          color: #dc2626;
        }

        .bids-count {
          font-weight: 600;
          color: #1e293b;
          text-align: center;
        }

        .estimated-cost {
          font-weight: 600;
          color: #1e293b;
        }

        .table-action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .table-action-btn:hover {
          background: #4f46e5;
          transform: translateY(-1px);
        }

        @media (max-width: 1024px) {
          .tenders-table {
            display: block;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

const StatusDisplay = ({ tender, isBiddingClosed }) => {
  if (tender.status === 'awarded') 
    return (
      <div className="status-badge awarded">
        <FiAward size={12} />
        Awarded
      </div>
    );
  if (tender.is_checked && isBiddingClosed) 
    return (
      <div className="status-badge closed">
        <FiXCircle size={12} />
        Closed
      </div>
    );
  if (tender.is_checked) 
    return (
      <div className="status-badge published">
        <FiCheckCircle size={12} />
        Open
      </div>
    );
  return (
    <div className="status-badge pending">
      <FiClock size={12} />
      Pending
    </div>
  );
};

const TenderDetailView = ({ tender, onBack }) => {
  const timeLeft = useTimeLeft(tender.submission_deadline);
  const isTenderAwarded = useMemo(() => tender.status === 'awarded', [tender.status]);
  
  const lowestBid = useMemo(() => {
    if (!tender.bids || tender.bids.length === 0) return null;
    return tender.bids.reduce((min, bid) => bid.bid_amount < min.bid_amount ? bid : min, tender.bids[0]);
  }, [tender.bids]);

  const getStatusInfo = () => {
    if (isTenderAwarded) return { text: 'Awarded', className: 'awarded', icon: <FiAward /> };
    if (timeLeft.isClosed) return { text: 'Closed for Bidding', className: 'closed', icon: <FiXCircle /> };
    if (tender.is_checked) return { text: 'Open for Bidding', className: 'open', icon: <FiCheckCircle /> };
    return { text: 'Pending Publication', className: 'pending', icon: <FiClock /> };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="detail-view">
      <button onClick={onBack} className="back-button">
        <FiArrowLeft size={16} />
        Back to Tender List
      </button>

      <div className="detail-header">
        <div className="header-content">
          <h1 className="detail-title">{tender.title}</h1>
          <p className="detail-subtitle">Tender No: {tender.tender_number}</p>
        </div>
        <div className={`status-badge large ${statusInfo.className}`}>
          {statusInfo.icon}
          {statusInfo.text}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          icon={<FiClock />} 
          title="Time Left" 
          value={timeLeft.text} 
          className={timeLeft.isClosed ? 'closed' : ''}
        />
        <StatCard 
          icon={<FiDollarSign />} 
          title="Estimated Cost" 
          value={`₹${tender.estimated_cost?.toLocaleString()}`}
        />
        <StatCard 
          icon={<FiUsers />} 
          title="Bids Submitted" 
          value={tender.bids?.length || 0}
        />
        <StatCard 
          icon={<FiAward />} 
          title="Lowest Bid" 
          value={lowestBid ? `₹${lowestBid.bid_amount.toLocaleString()}` : 'N/A'}
          className={lowestBid ? 'lowest' : ''}
        />
      </div>

      <div className="detail-content">
        <div className="main-section">
          <Section title="Tender Description">
            <p className="description">{tender.description}</p>
          </Section>

          <Section title="Tender Documents">
            {tender.documents?.length > 0 ? (
              <div className="documents-list">
                {tender.documents.map(doc => (
                  <a 
                    key={doc.doc_id} 
                    href={`http://127.0.0.1:8000/api/v1/tenders/documents/${doc.doc_id}/download`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="document-link"
                  >
                    <FiFileText />
                    {doc.document_name}
                  </a>
                ))}
              </div>
            ) : (
              <p className="no-documents">No documents attached</p>
            )}
          </Section>

          <Section title={`Submitted Bids (${tender.bids?.length || 0})`}>
            {tender.bids?.length > 0 ? (
              <div className="bids-table">
                <table>
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
                      <tr key={bid.bid_id} className={bid.bid_id === lowestBid?.bid_id ? 'lowest-bid' : ''}>
                        <td>
                          <div className="vendor-info">
                            <div className="company-name">{bid.vendor.company_name}</div>
                            <div className="vendor-name">{bid.vendor.user.username}</div>
                          </div>
                        </td>
                        <td>
                          <div className="bid-amount">
                            ₹{bid.bid_amount.toLocaleString()}
                            {bid.bid_id === lowestBid?.bid_id && (
                              <span className="lowest-tag">Lowest</span>
                            )}
                          </div>
                        </td>
                        <td>{new Date(bid.submission_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`bid-status ${bid.bid_status}`}>
                            {bid.bid_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-bids">No bids submitted yet</p>
            )}
          </Section>
        </div>

        <div className="sidebar">
          <Section title="Key Information">
            <InfoItem label="Category" value={tender.category?.category_name || 'General'} />
            <InfoItem label="Publish Date" value={new Date(tender.publish_date).toLocaleString()} />
            <InfoItem label="Submission Deadline" value={new Date(tender.submission_deadline).toLocaleString()} />
            <InfoItem label="Tender Status" value={statusInfo.text} />
          </Section>
        </div>
      </div>

      <style jsx>{`
        .detail-view {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
          margin-bottom: 2rem;
          padding: 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .header-content {
          flex: 1;
        }

        .detail-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }

        .detail-subtitle {
          color: #64748b;
          font-size: 1.1rem;
          margin: 0;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.large {
          padding: 0.75rem 1.5rem;
          font-size: 0.9rem;
        }

        .status-badge.published, .status-badge.open {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.closed {
          background: #fecaca;
          color: #dc2626;
        }

        .status-badge.awarded {
          background: #dbeafe;
          color: #1e40af;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .detail-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .main-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .sidebar {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          height: fit-content;
        }

        @media (max-width: 1024px) {
          .detail-content {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .detail-header {
            flex-direction: column;
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Helper components for TenderDetailView
const StatCard = ({ icon, title, value, className = '' }) => (
  <div className={`stat-card ${className}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <h4 className="stat-title">{title}</h4>
      <p className="stat-value">{value}</p>
    </div>
    <style jsx>{`
      .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: all 0.3s ease;
      }

      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      }

      .stat-card.closed .stat-value {
        color: #ef4444;
      }

      .stat-card.lowest .stat-value {
        color: #10b981;
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.25rem;
      }

      .stat-content {
        flex: 1;
      }

      .stat-title {
        font-size: 0.8rem;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 600;
        margin: 0 0 0.25rem 0;
      }

      .stat-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
      }
    `}</style>
  </div>
);

const Section = ({ title, children }) => (
  <section className="detail-section">
    <h3 className="section-title">{title}</h3>
    {children}
    <style jsx>{`
      .detail-section {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 1rem 0;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid #f1f5f9;
      }
    `}</style>
  </section>
);

const InfoItem = ({ label, value }) => (
  <div className="info-item">
    <span className="info-label">{label}</span>
    <span className="info-value">{value}</span>
    <style jsx>{`
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid #f1f5f9;
      }

      .info-item:last-child {
        border-bottom: none;
      }

      .info-label {
        font-size: 0.9rem;
        color: #64748b;
        font-weight: 500;
      }

      .info-value {
        font-size: 0.9rem;
        color: #1e293b;
        font-weight: 600;
      }
    `}</style>
  </div>
);