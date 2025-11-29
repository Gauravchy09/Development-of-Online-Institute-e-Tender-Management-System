import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiUser, FiLock, FiArrowRight, FiArrowLeft, FiBriefcase, FiHome } from "react-icons/fi";

export default function Signup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Step 1
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Step 2
  const [role, setRole] = useState("");

  // Step 3 - Vendor
  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");

  // Step 3 - Institute
  const [instituteName, setInstituteName] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!email.includes("@")) return setErrorMsg("Enter a valid email");
      if (!username) return setErrorMsg("Username is required");
      if (password.length < 6) return setErrorMsg("Password must be at least 6 characters");
    }
    if (step === 2 && !role) return setErrorMsg("Please select a role");
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    let payload = { email, username, password, role };

    if (role === "VENDOR") {
      payload = {
        ...payload,
        company_name: companyName,
        gst_number: gstNumber,
        pan_number: panNumber,
        contact_person: contactPerson,
        address: vendorAddress,
        phone: vendorPhone,
      };
    } else if (role === "INSTITUTE_ADMIN") {
      payload = {
        ...payload,
        institute_name: instituteName,
        address,
        contact_email: contactEmail,
        phone_number: phoneNumber,
        registration_number: registrationNumber,
      };
    }

    try {
      const res = await fetch("https://792hpzm4-8000.inc1.devtunnels.ms/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        setErrorMsg(error.detail || "Signup failed");
        setLoading(false);
        return;
      }

      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (error) {
      setErrorMsg("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* Background Elements */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="signup-container">
        {/* Left Side - Branding */}
        <div className="brand-section">
          <div className="brand-content">
            <Link to="/" className="brand-logo">
              <span className="logo-icon">🏛️</span>
              <div className="logo-text">
                <span className="logo-primary">Tender</span>
                <span className="logo-accent">Pro</span>
              </div>
            </Link>
            
            <h1 className="brand-title">
              Start Your Journey with <span className="highlight">TenderPro</span>
            </h1>
            
            <p className="brand-subtitle">
              Join thousands of organizations transforming their tender management process with India's most trusted e-tendering platform.
            </p>

            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <span>Real-time tender tracking</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <span>Bank-grade security</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <span>Instant notifications</span>
              </div>
            </div>

            <div className="trust-badge">
              <div className="trust-stats">
                <div className="stat">
                  <strong>5,000+</strong>
                  <span>Organizations</span>
                </div>
                <div className="stat">
                  <strong>₹2,847Cr+</strong>
                  <span>Tenders Processed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="form-section">
          <div className="form-card">
            <div className="form-header">
              <h2>Create Your Account</h2>
              <p>Sign up quickly and securely in a few steps</p>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-steps">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className="step-item">
                    <div className={`step-circle ${step >= stepNum ? 'active' : ''}`}>
                      {stepNum}
                    </div>
                    <div className="step-label">
                      {stepNum === 1 && 'Account'}
                      {stepNum === 2 && 'Role'}
                      {stepNum === 3 && 'Details'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                ></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="form-step">
                  <div className="input-group">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="input-group">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="input-group">
                    <FiLock className="input-icon" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>

                  {errorMsg && (
                    <div className="error-message">
                      <div className="error-icon">⚠️</div>
                      {errorMsg}
                    </div>
                  )}

                  <button type="button" onClick={handleNext} className="signup-button">
                    Continue
                    <FiArrowRight className="button-icon" />
                  </button>
                </div>
              )}

              {/* Step 2: Role Selection */}
              {step === 2 && (
                <div className="form-step">
                  <div className="role-selection">
                    <div 
                      className={`role-card ${role === "VENDOR" ? 'selected' : ''}`}
                      onClick={() => setRole("VENDOR")}
                    >
                      <FiBriefcase className="role-icon" />
                      <div className="role-content">
                        <h3>Vendor</h3>
                        <p>Submit bids and grow your business</p>
                      </div>
                    </div>

                    <div 
                      className={`role-card ${role === "INSTITUTE_ADMIN" ? 'selected' : ''}`}
                      onClick={() => setRole("INSTITUTE_ADMIN")}
                    >
                      <FiHome className="role-icon" />
                      <div className="role-content">
                        <h3>Institute Admin</h3>
                        <p>Manage tenders for your organization</p>
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="error-message">
                      <div className="error-icon">⚠️</div>
                      {errorMsg}
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="back-button"
                    >
                      <FiArrowLeft className="button-icon" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="signup-button"
                    >
                      Continue
                      <FiArrowRight className="button-icon" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Vendor Details */}
              {step === 3 && role === "VENDOR" && (
                <div className="form-step">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Company Name *"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="input-row">
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="GST Number *"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="PAN Number *"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value)}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Contact Person *"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Address"
                      value={vendorAddress}
                      onChange={(e) => setVendorAddress(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={vendorPhone}
                      onChange={(e) => setVendorPhone(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  {errorMsg && (
                    <div className="error-message">
                      <div className="error-icon">⚠️</div>
                      {errorMsg}
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="back-button"
                    >
                      <FiArrowLeft className="button-icon" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`signup-button ${loading ? 'loading' : ''}`}
                    >
                      {loading ? (
                        <>
                          <div className="spinner"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <FiArrowRight className="button-icon" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Institute Details */}
              {step === 3 && role === "INSTITUTE_ADMIN" && (
                <div className="form-step">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Institute Name *"
                      value={instituteName}
                      onChange={(e) => setInstituteName(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Address *"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="input-group">
                    <input
                      type="email"
                      placeholder="Contact Email *"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Phone Number *"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Registration Number *"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>

                  {errorMsg && (
                    <div className="error-message">
                      <div className="error-icon">⚠️</div>
                      {errorMsg}
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="back-button"
                    >
                      <FiArrowLeft className="button-icon" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`signup-button ${loading ? 'loading' : ''}`}
                    >
                      {loading ? (
                        <>
                          <div className="spinner"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <FiArrowRight className="button-icon" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="form-footer">
              <p className="login-text">
                Already have an account?{" "}
                <Link to="/login" className="login-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .signup-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .background-shapes {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, transparent 70%);
          animation: float 20s ease-in-out infinite;
        }

        .shape-1 { width: 300px; height: 300px; top: 10%; left: 5%; animation-delay: 0s; }
        .shape-2 { width: 200px; height: 200px; bottom: 20%; right: 10%; animation-delay: 7s; }
        .shape-3 { width: 150px; height: 150px; top: 60%; left: 80%; animation-delay: 14s; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          33% { transform: translate(30px, -30px) scale(1.1); opacity: 0.5; }
          66% { transform: translate(-20px, 20px) scale(0.9); opacity: 0.4; }
        }

        .signup-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1200px;
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          min-height: 700px;
        }

        /* Brand Section - Same as login */
        .brand-section {
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(250, 204, 21, 0.1));
          padding: 3rem;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .brand-section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          pointer-events: none;
        }

        .brand-content {
          position: relative;
          z-index: 2;
          color: white;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          margin-bottom: 3rem;
        }

        .logo-icon {
          font-size: 2.5rem;
          filter: grayscale(0.2);
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .logo-primary {
          font-size: 1.8rem;
          font-weight: 900;
          background: linear-gradient(to right, #ffffff, #e0e7ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .logo-accent {
          font-size: 1rem;
          font-weight: 700;
          background: linear-gradient(to right, #facc15, #fde047);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-top: -2px;
        }

        .brand-title {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          background: linear-gradient(to right, #ffffff, #e0e7ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .highlight {
          color: #facc15;
          background: linear-gradient(to right, #facc15, #fde047);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .brand-subtitle {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #cbd5e1;
          margin-bottom: 2.5rem;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #e2e8f0;
        }

        .feature-icon {
          font-size: 1.2rem;
          width: 32px;
          text-align: center;
        }

        .trust-badge {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .trust-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .stat {
          text-align: center;
        }

        .stat strong {
          display: block;
          font-size: 1.3rem;
          color: #facc15;
          margin-bottom: 0.25rem;
        }

        .stat span {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        /* Form Section - Same as login */
        .form-section {
          background: white;
          padding: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-card {
          width: 100%;
          max-width: 400px;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .form-header h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .form-header p {
          color: #64748b;
          font-size: 1rem;
        }

        /* Progress Bar */
        .progress-container {
          margin-bottom: 2.5rem;
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          position: relative;
        }

        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
        }

        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          transition: all 0.3s ease;
          border: 3px solid #e2e8f0;
        }

        .step-circle.active {
          background: #facc15;
          color: #1e293b;
          border-color: #facc15;
        }

        .step-label {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
        }

        .progress-bar {
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          height: 3px;
          background: #e2e8f0;
          z-index: 1;
        }

        .progress-fill {
          height: 100%;
          background: #facc15;
          transition: width 0.3s ease;
          border-radius: 2px;
        }

        /* Form Styles - Same as login */
        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-step {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          font-size: 1.2rem;
          z-index: 2;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #f8fafc;
          color: #1e293b; /* FIX: Added text color */
        }

        .form-input:focus {
          outline: none;
          border-color: #60a5fa;
          background: white;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
          color: #1e293b; /* FIX: Added text color for focus state */
        }

        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        /* Role Selection */
        .role-selection {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .role-card {
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .role-card:hover {
          border-color: #60a5fa;
          transform: translateY(-2px);
        }

        .role-card.selected {
          border-color: #facc15;
          background: rgba(250, 204, 21, 0.05);
        }

        .role-icon {
          font-size: 1.5rem;
          color: #64748b;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .role-card.selected .role-icon {
          color: #facc15;
        }

        .role-content h3 {
          color: #1e293b;
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .role-content p {
          color: #64748b;
          margin: 0;
          font-size: 0.9rem;
        }

        /* Error Message - Same as login */
        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 1rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .error-icon {
          font-size: 1rem;
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .back-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #f1f5f9;
          color: #64748b;
          border: 2px solid #e2e8f0;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: #e2e8f0;
          color: #374151;
        }

        .signup-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          background: linear-gradient(135deg, #facc15, #eab308);
          color: #1e293b;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .signup-button:not(.loading):hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(250, 204, 21, 0.4);
        }

        .signup-button:disabled {
          cursor: not-allowed;
          opacity: 0.8;
        }

        .signup-button.loading {
          background: #94a3b8;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top: 2px solid #1e293b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .button-icon {
          transition: transform 0.3s ease;
        }

        .signup-button:not(.loading):hover .button-icon {
          transform: translateX(3px);
        }

        .form-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e2e8f0;
        }

        .login-text {
          color: #64748b;
        }

        .login-link {
          color: #60a5fa;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .login-link:hover {
          color: #1d4ed8;
        }

        /* Responsive Design - Same as login */
        @media (max-width: 968px) {
          .signup-container {
            grid-template-columns: 1fr;
            max-width: 500px;
          }
          
          .brand-section {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .signup-page {
            padding: 1rem;
          }
          
          .form-section {
            padding: 2rem 1.5rem;
          }
          
          .form-header h2 {
            font-size: 1.75rem;
          }
          
          .input-row {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}