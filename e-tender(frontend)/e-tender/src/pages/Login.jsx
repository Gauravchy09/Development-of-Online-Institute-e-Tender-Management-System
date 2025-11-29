import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!identifier || !password) {
      setErrorMsg("Email/Username and password are required");
      setLoading(false);
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("username", identifier);
      formData.append("password", password);

      const res = await fetch("https://792hpzm4-8000.inc1.devtunnels.ms/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.detail || "Login failed");
        setLoading(false);
        return;
      }

      // Save token
      localStorage.setItem("token", data.access_token);

      // Decode JWT payload to get role and IDs
      const tokenPayload = parseJwt(data.access_token);
      const roles = tokenPayload.roles || [];
      localStorage.setItem("roles", JSON.stringify(roles));

      if (roles.includes("DEPARTMENT")) {
        localStorage.setItem("dept_id", tokenPayload.dept_id);
        localStorage.setItem("institute_id", tokenPayload.institute_id);
        localStorage.setItem("username", tokenPayload.username);
      } else {
        localStorage.setItem("user_id", tokenPayload.user_id);
        localStorage.setItem("username", tokenPayload.username);
      }

      const dashboardRoutes = {
        VENDOR: "/vendor/dashboard",
        INSTITUTE_ADMIN: "/institute/dashboard",
        DEPARTMENT: "/department/dashboard",
      };

      const userRole = roles.find((r) => dashboardRoutes[r]);
      if (userRole) navigate(dashboardRoutes[userRole]);
      else setErrorMsg("Unknown role, contact admin");

    } catch (error) {
      setErrorMsg("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- helper to decode JWT payload ---
  function parseJwt(token) {
    try {
      const base64Payload = token.split(".")[1];
      const payload = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(payload);
    } catch {
      return {};
    }
  }

  return (
    <div className="login-page">
      {/* Background Elements */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-container">
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
              Welcome Back to <span className="highlight">TenderPro</span>
            </h1>
            
            <p className="brand-subtitle">
              Access your dashboard to manage tenders, track submissions, and grow your business with India's most trusted e-tendering platform.
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

        {/* Right Side - Login Form */}
        <div className="form-section">
          <div className="form-card">
            <div className="form-header">
              <h2>Sign In to Your Account</h2>
              <p>Enter your credentials to access the platform</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <FiMail className="input-icon" />
                <input
                  type="text"
                  placeholder="Email or Username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="form-input"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="/forgot-password" className="forgot-link">
                  Forgot password?
                </a>
              </div>

              {errorMsg && (
                <div className="error-message">
                  <div className="error-icon">⚠️</div>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`login-button ${loading ? 'loading' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <FiArrowRight className="button-icon" />
                  </>
                )}
              </button>
            </form>

            <div className="form-footer">
              <p className="signup-text">
                Don't have an account?{" "}
                <Link to="/signup" className="signup-link">
                  Create account
                </Link>
              </p>
              
              <div className="demo-account">
                <small>Demo: admin / admin123</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
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

        .login-container {
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

        /* Brand Section */
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

        /* Form Section */
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

        .login-form {
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

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: color 0.3s ease;
        }

        .password-toggle:hover {
          color: #374151;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          cursor: pointer;
        }

        .remember-me input {
          accent-color: #60a5fa;
        }

        .forgot-link {
          color: #60a5fa;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .forgot-link:hover {
          color: #1d4ed8;
        }

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

        .login-button {
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

        .login-button:not(.loading):hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(250, 204, 21, 0.4);
        }

        .login-button:disabled {
          cursor: not-allowed;
          opacity: 0.8;
        }

        .login-button.loading {
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

        .login-button:not(.loading):hover .button-icon {
          transform: translateX(3px);
        }

        .form-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e2e8f0;
        }

        .signup-text {
          color: #64748b;
          margin-bottom: 1rem;
        }

        .signup-link {
          color: #60a5fa;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .signup-link:hover {
          color: #1d4ed8;
        }

        .demo-account {
          color: #94a3b8;
          font-size: 0.8rem;
        }

        /* Responsive Design */
        @media (max-width: 968px) {
          .login-container {
            grid-template-columns: 1fr;
            max-width: 500px;
          }
          
          .brand-section {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .login-page {
            padding: 1rem;
          }
          
          .form-section {
            padding: 2rem 1.5rem;
          }
          
          .form-header h2 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
}