
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  FiX, FiEye, FiEyeOff, FiPlus, FiRefreshCw, FiSearch, 
  FiFilter, FiEdit, FiTrash2, FiUser, 
  FiKey, FiCheck, FiAlertCircle, FiHome
} from "react-icons/fi";

// --- API URL ---
const API_URL = "https://792hpzm4-8000.inc1.devtunnels.ms/api/v1";

// Custom Hook for Password Visibility
const usePasswordVisibility = () => {
  const [visiblePasswordId, setVisiblePasswordId] = useState(null);
  const [pendingPasswordDeptId, setPendingPasswordDeptId] = useState(null);
  const [adminPasswordModalOpen, setAdminPasswordModalOpen] = useState(false);

  const showPassword = (deptId) => {
    setPendingPasswordDeptId(deptId);
    setAdminPasswordModalOpen(true);
  };

  const hidePassword = () => {
    setVisiblePasswordId(null);
  };

  const confirmPasswordView = (deptId) => {
    setVisiblePasswordId(deptId);
    setAdminPasswordModalOpen(false);
    setPendingPasswordDeptId(null);
  };

  const cancelPasswordView = () => {
    setAdminPasswordModalOpen(false);
    setPendingPasswordDeptId(null);
  };

  return {
    visiblePasswordId,
    pendingPasswordDeptId,
    adminPasswordModalOpen,
    showPassword,
    hidePassword,
    confirmPasswordView,
    cancelPasswordView
  };
};

// --- Components ---

const DepartmentCard = ({ department, onTogglePassword, visiblePasswordId, onEdit, onDelete }) => {
  const statusConfig = useMemo(() => ({
    active: { color: '#10b981', bg: '#d1fae5', text: 'Active', icon: '🟢' },
    inactive: { color: '#6b7280', bg: '#f3f4f6', text: 'Inactive', icon: '⚫' }
  }), []);

  const status = department.is_active !== false ? 'active' : 'inactive';
  const config = statusConfig[status];

  return (
    <div className="department-card">
      <div className="card-header">
        <div className="department-info">
          <div className="department-title-section">
            <h3 className="department-name">{department.dept_name}</h3>
            <span className="status-badge">
              {config.icon} {config.text}
            </span>
          </div>
          <div className="department-meta">
            <span className="department-id">ID: {department.dept_id}</span>
          </div>
        </div>
        <div className="department-actions">
          <button className="icon-btn edit-btn" onClick={() => onEdit(department)} title="Edit Block">
            <FiEdit size={14} />
          </button>
          <button className="icon-btn delete-btn" onClick={() => onDelete(department)} title="Delete Block">
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      <div className="card-content">
        <div className="info-grid">
          <div className="info-item">
            <FiUser className="info-icon" />
            <div className="info-content">
              <span className="info-label">Head Name</span>
              <span className="info-value">{department.department_head_name}</span>
            </div>
          </div>
          
          <div className="info-item">
            <FiUser className="info-icon" />
            <div className="info-content">
              <span className="info-label">Username</span>
              <span className="info-value code">{department.username}</span>
            </div>
          </div>

          <div className="info-item">
            <FiKey className="info-icon" />
            <div className="info-content">
              <span className="info-label">Password</span>
              <div className="password-display">
                <span className="password-value code">
                  {visiblePasswordId === department.dept_id ? department.password : "••••••••"}
                </span>
                <button 
                  className="password-toggle"
                  onClick={() => onTogglePassword(department.dept_id)}
                  title={visiblePasswordId === department.dept_id ? "Hide Password" : "Show Password"}
                >
                  {visiblePasswordId === department.dept_id ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className="footer-content">
          <span className="created-date">
            Created {new Date(department.created_at).toLocaleDateString()}
          </span>
          <div className="action-buttons">
            <button className="action-btn primary" onClick={() => onEdit(department)}>
              <FiEdit size={12} />
              Edit
            </button>
            <button className="action-btn secondary" onClick={() => onTogglePassword(department.dept_id)}>
              <FiKey size={12} />
              Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DepartmentsGrid = ({ departments, loading, visiblePasswordId, onTogglePassword, searchTerm, onEdit, onDelete }) => {
  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return departments;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return departments.filter(dept => 
      dept.dept_name.toLowerCase().includes(lowerSearchTerm) ||
      dept.department_head_name.toLowerCase().includes(lowerSearchTerm) ||
      dept.username.toLowerCase().includes(lowerSearchTerm)
    );
  }, [departments, searchTerm]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading blocks...</p>
        <span className="loading-subtitle">Fetching your block data</span>
      </div>
    );
  }

  if (!filteredDepartments.length && !loading) {
    return (
      <div className="empty-state">
        <div className="empty-illustration">
          <FiHome size={64} />
        </div>
        <h3>No Blocks Found</h3>
        <p>
          {searchTerm ? 
            "No blocks match your search criteria. Try adjusting your search terms." : 
            "Get started by creating your first block to organize your institute structure."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="departments-grid">
      <div className="grid-header">
        <div className="header-left">
          <h2>All Blocks</h2>
          <span className="count-badge">{filteredDepartments.length} blocks</span>
        </div>
      </div>
      
      <div className="grid-container">
        {filteredDepartments.map((department) => (
          <DepartmentCard
            key={department.dept_id}
            department={department}
            onTogglePassword={onTogglePassword}
            visiblePasswordId={visiblePasswordId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

const CreateDepartmentModal = ({ isOpen, onClose, onSubmit, loading, editData }) => {
  const [formData, setFormData] = useState({
    dept_name: "",
    department_head_name: "",
    institute_id: 0
  });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          dept_name: editData.dept_name,
          department_head_name: editData.department_head_name,
          institute_id: 0
        });
      } else {
        setFormData({ dept_name: "", department_head_name: "", institute_id: 0 });
      }
    }
  }, [isOpen, editData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{editData ? 'Edit Block' : 'Create New Block'}</h2>
            <p>{editData ? 'Update block information' : 'Add a new block to your institute'}</p>
          </div>
          <button onClick={onClose} className="close-button">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="department-form">
          <div className="form-group">
            <label className="form-label">
              Block Name *
            </label>
            <input
              type="text"
              value={formData.dept_name}
              onChange={(e) => handleChange('dept_name', e.target.value)}
              className="form-input"
              placeholder="e.g., Computer Science Block, Administration Wing"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Block Head Name *
            </label>
            <input
              type="text"
              value={formData.department_head_name}
              onChange={(e) => handleChange('department_head_name', e.target.value)}
              className="form-input"
              placeholder="e.g., Dr. John Smith"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !formData.dept_name || !formData.department_head_name}
            >
              {loading ? (
                <>
                  <div className="button-spinner"></div>
                  {editData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <FiCheck size={16} />
                  {editData ? 'Update Block' : 'Create Block'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminPasswordModal = ({ isOpen, onCancel, onConfirm, loading }) => {
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setAdminPassword("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onConfirm(adminPassword);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content security-modal" onClick={(e) => e.stopPropagation()}>
        <div className="security-icon">
          <FiKey size={32} />
        </div>
        
        <div className="modal-header">
          <h2>Admin Verification Required</h2>
          <p>For security reasons, please verify your identity to view block passwords</p>
        </div>

        <div className="form-group">
          <label className="form-label">Admin Password</label>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="form-input"
            placeholder="Enter your admin password"
            autoFocus
          />
        </div>

        <div className="modal-actions">
          <button
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={loading || !adminPassword}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Verifying...
              </>
            ) : (
              "Verify & View"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, title, description, onClick, variant = "primary" }) => (
  <div className={`action-card ${variant}`} onClick={onClick}>
    <div className="card-background"></div>
    <div className="card-icon">{icon}</div>
    <div className="card-content">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>
);

const StatsCard = ({ title, value, icon, color }) => (
  <div className="stats-card">
    <div className="stats-icon" style={{ backgroundColor: color }}>
      {icon}
    </div>
    <div className="stats-content">
      <h3>{value}</h3>
      <span className="stats-title">{title}</span>
    </div>
  </div>
);

// --- Main Page Component ---
export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const passwordVisibility = usePasswordVisibility();
  const token = localStorage.getItem("token");

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/departments/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch blocks");
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createDepartment = async (deptData) => {
    setCreating(true);
    setError(null);
    try {
      const url = editData ? `${API_URL}/departments/${editData.dept_id}` : `${API_URL}/departments/`;
      const method = editData ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(deptData),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to ${editData ? 'update' : 'create'} block`);
      }
      
      const data = await res.json();
      await fetchDepartments();
      setSuccessMsg(`Block "${data.dept_name}" ${editData ? 'updated' : 'created'} successfully!`);
      setShowCreateForm(false);
      setEditData(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const handleCreateSubmit = async (deptData) => {
    try {
      await createDepartment(deptData);
    } catch (err) {
      // Error is already set in createDepartment
    }
  };

  const handleEdit = (department) => {
    setEditData(department);
    setShowCreateForm(true);
  };

  const handleDelete = async (department) => {
    if (window.confirm(`Are you sure you want to delete "${department.dept_name}"? This action cannot be undone.`)) {
      try {
        const res = await fetch(`${API_URL}/departments/${department.dept_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Failed to delete block");
        
        await fetchDepartments();
        setSuccessMsg(`Block "${department.dept_name}" deleted successfully!`);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleAdminPasswordConfirm = async (password) => {
    setVerifying(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-admin-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      
      if (!res.ok) throw new Error("Invalid admin password");
      
      passwordVisibility.confirmPasswordView(passwordVisibility.pendingPasswordDeptId);
    } catch (err) {
      setError("Incorrect admin password. Cannot reveal block password.");
    } finally {
      setVerifying(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const stats = useMemo(() => ({
    total: departments.length,
    active: departments.filter(dept => dept.is_active !== false).length,
    inactive: departments.filter(dept => dept.is_active === false).length,
  }), [departments]);

  const filteredDepartments = useMemo(() => {
    let filtered = departments;
    
    if (activeFilter === "active") {
      filtered = filtered.filter(dept => dept.is_active !== false);
    } else if (activeFilter === "inactive") {
      filtered = filtered.filter(dept => dept.is_active === false);
    }
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(dept => 
        dept.dept_name.toLowerCase().includes(lowerSearchTerm) ||
        dept.department_head_name.toLowerCase().includes(lowerSearchTerm) ||
        dept.username.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    return filtered;
  }, [departments, searchTerm, activeFilter]);

  return (
    <div className="departments-page">
      {/* Header Section */}
      <header className="page-header">
        <div className="header-background"></div>
        <div className="header-content">
          <div className="header-text">
            <h1>🏢 Block Management</h1>
            <p>Organize and manage all academic and administrative blocks within your institute</p>
          </div>
          <div className="header-stats">
            <StatsCard
              title="Total Blocks"
              value={stats.total}
              icon={<FiHome size={20} />}
              color="#3b82f6"
            />
            <StatsCard
              title="Active Blocks"
              value={stats.active}
              icon={<FiCheck size={20} />}
              color="#10b981"
            />
            <StatsCard
              title="Inactive Blocks"
              value={stats.inactive}
              icon={<FiHome size={20} />}
              color="#6b7280"
            />
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="actions-grid">
        <ActionCard
          icon={<FiPlus size={24} />}
          title="Create New Block"
          description="Add a new academic or administrative block"
          onClick={() => { setShowCreateForm(true); setEditData(null); }}
          variant="primary"
        />
        <ActionCard
          icon={<FiRefreshCw size={24} />}
          title="Refresh List"
          description="Get the latest list of all blocks"
          onClick={fetchDepartments}
          variant="secondary"
        />
      </div>

      {/* Search and Filters */}
      <div className="controls-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search blocks by name, head, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="clear-search"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
          
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Blocks
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'active' ? 'active' : ''}`}
              onClick={() => setActiveFilter('active')}
            >
              Active
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'inactive' ? 'active' : ''}`}
              onClick={() => setActiveFilter('inactive')}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="message success">
          <FiCheck size={18} />
          <div>
            <strong>Success!</strong> {successMsg}
          </div>
        </div>
      )}
      
      {error && (
        <div className="message error">
          <FiAlertCircle size={18} />
          <div>
            <strong>Error!</strong> {error}
          </div>
        </div>
      )}

      {/* Departments Grid */}
      <DepartmentsGrid
        departments={filteredDepartments}
        loading={loading}
        visiblePasswordId={passwordVisibility.visiblePasswordId}
        onTogglePassword={passwordVisibility.showPassword}
        searchTerm={searchTerm}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modals */}
      <CreateDepartmentModal
        isOpen={showCreateForm}
        onClose={() => { setShowCreateForm(false); setEditData(null); }}
        onSubmit={handleCreateSubmit}
        loading={creating}
        editData={editData}
      />
      
      <AdminPasswordModal
        isOpen={passwordVisibility.adminPasswordModalOpen}
        onCancel={passwordVisibility.cancelPasswordView}
        onConfirm={handleAdminPasswordConfirm}
        loading={verifying}
      />

      <style jsx>{`
        .departments-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Header Styles */
        .page-header {
          position: relative;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          padding: 3rem 2rem 2rem;
          margin-bottom: 2rem;
        }

        .header-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="%23ffffff" opacity="0.03"><polygon points="0,0 1000,50 1000,100 0,100"/></svg>') bottom center/cover no-repeat;
        }

        .header-content {
          position: relative;
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 3rem;
          align-items: start;
        }

        .header-text h1 {
          font-size: 2.75rem;
          font-weight: 800;
          margin: 0 0 0.75rem 0;
          background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-text p {
          color: #cbd5e1;
          font-size: 1.125rem;
          margin: 0;
          line-height: 1.6;
          max-width: 500px;
        }

        .header-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-width: 280px;
        }

        .stats-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .stats-card:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .stats-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stats-content h3 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
          color: white;
        }

        .stats-title {
          display: block;
          font-size: 0.875rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        /* Actions Grid */
        .actions-grid {
          max-width: 1400px;
          margin: 0 auto 2rem;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .action-card {
          position: relative;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 2rem;
          cursor: pointer;
          transition: all 0.4s ease;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .action-card.primary {
          border-left: 4px solid #3b82f6;
        }

        .action-card.secondary {
          border-left: 4px solid #10b981;
        }

        .card-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .action-card:hover .card-background {
          opacity: 1;
        }

        .action-card.secondary .card-background {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0) 100%);
        }

        .card-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          margin-bottom: 1rem;
          position: relative;
        }

        .action-card.secondary .card-icon {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .card-content {
          position: relative;
        }

        .card-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .card-content p {
          color: #64748b;
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        /* Controls Section */
        .controls-section {
          max-width: 1400px;
          margin: 0 auto 2rem;
          padding: 0 2rem;
        }

        .search-container {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          z-index: 2;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          background: white;
          position: relative;
          z-index: 1;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          z-index: 2;
        }

        .filter-tabs {
          display: flex;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.25rem;
        }

        .filter-tab {
          padding: 0.5rem 1rem;
          border: none;
          background: none;
          color: #64748b;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .filter-tab.active {
          background: #3b82f6;
          color: white;
        }

        /* Messages */
        .message {
          max-width: 1400px;
          margin: 0 auto 2rem;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-weight: 500;
        }

        .message.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .message.error {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        /* Departments Grid */
        .departments-grid {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem 2rem;
        }

        .grid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .grid-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .count-badge {
          background: #3b82f6;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
        }

        /* Department Card */
        .department-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .department-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }

        .department-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.25rem;
        }

        .department-info {
          flex: 1;
        }

        .department-title-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .department-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          background: #d1fae5;
          color: #065f46;
        }

        .department-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .department-id {
          font-size: 0.75rem;
          color: #64748b;
          background: #f8fafc;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }

        .department-actions {
          display: flex;
          gap: 0.5rem;
        }

        .icon-btn {
          width: 32px;
          height: 32px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .icon-btn:hover {
          transform: scale(1.05);
        }

        .edit-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .delete-btn:hover {
          border-color: #dc2626;
          color: #dc2626;
        }

        .card-content {
          margin-bottom: 1.25rem;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .info-icon {
          color: #64748b;
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;
        }
        .info-label {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .info-value {
          display: block;
          font-size: 0.875rem;
          color: #1e293b;
          font-weight: 500;
        }

        .code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          background: #f8fafc;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }

        .password-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .password-value {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .password-toggle {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .password-toggle:hover {
          background: #f1f5f9;
          color: #374151;
        }

        .card-footer {
          border-top: 1px solid #f1f5f9;
          padding-top: 1.25rem;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .created-date {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #64748b;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          transform: translateY(-1px);
        }

        .action-btn.primary {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .action-btn.primary:hover {
          background: #2563eb;
          border-color: #2563eb;
        }

        .action-btn.secondary {
          background: #f8fafc;
          color: #475569;
          border-color: #e2e8f0;
        }

        .action-btn.secondary:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        /* Loading State */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid #f1f5f9;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-container p {
          font-size: 1.125rem;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
          font-weight: 600;
        }

        .loading-subtitle {
          font-size: 0.875rem;
          color: #64748b;
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-illustration {
          width: 96px;
          height: 96px;
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: #64748b;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          color: #1e293b;
          margin: 0 0 1rem 0;
          font-weight: 600;
        }

        .empty-state p {
          color: #64748b;
          max-width: 400px;
          line-height: 1.6;
          margin: 0;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 2rem 2rem 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .modal-title-section h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .modal-title-section p {
          color: #64748b;
          margin: 0;
          font-size: 0.9rem;
        }

        .close-button {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          background: #f1f5f9;
          color: #374151;
        }

        /* Form Styles */
        .department-form {
          padding: 1rem 2rem 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .btn-primary, .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .btn-secondary:disabled {
          color: #9ca3af;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Security Modal */
        .security-modal {
          text-align: center;
          max-width: 400px;
        }

        .security-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #fef3c7, #f59e0b);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 2rem auto 1.5rem;
          color: #92400e;
        }

        .security-modal .modal-header {
          flex-direction: column;
          text-align: center;
          border-bottom: none;
          padding-bottom: 0;
        }

        .security-modal .modal-header h2 {
          margin-bottom: 0.5rem;
        }

        .security-modal .modal-header p {
          color: #64748b;
          font-size: 0.9rem;
        }

        .security-modal .form-group {
          padding: 0 2rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          padding: 1.5rem 2rem 2rem;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .header-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .header-stats {
            flex-direction: row;
            justify-content: space-between;
          }

          .stats-card {
            flex: 1;
            min-width: auto;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 2rem 1rem 1.5rem;
          }

          .header-text h1 {
            font-size: 2rem;
          }

          .actions-grid {
            grid-template-columns: 1fr;
            padding: 0 1rem;
          }

          .controls-section {
            padding: 0 1rem;
          }

          .search-container {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input-wrapper {
            max-width: none;
          }

          .departments-grid {
            padding: 0 1rem 2rem;
          }

          .grid-container {
            grid-template-columns: 1fr;
          }

          .header-stats {
            flex-direction: column;
          }

          .modal-content {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
          }

          .modal-header {
            padding: 1.5rem 1.5rem 1rem;
          }

          .department-form {
            padding: 1rem 1.5rem 1.5rem;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .btn-primary, .btn-secondary {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .department-card {
            padding: 1.25rem;
          }

          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .department-actions {
            align-self: flex-end;
          }

          .footer-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .action-buttons {
            width: 100%;
            justify-content: space-between;
          }

          .action-btn {
            flex: 1;
            justify-content: center;
          }
        }

        
      `}</style>
    </div>
  );
}