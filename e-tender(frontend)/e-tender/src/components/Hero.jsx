// import React from "react";
// import { Link } from "react-router-dom";

// export default function Hero() {
//   return (
//     <>
//       <section className="hero-section">
//         <h1>Online Institute's E-Tender Management System</h1>
//         <p>Manage and submit tenders seamlessly with our intuitive online platform.</p>
//         <Link to="/signup">
//           <button>Get Started</button>
//         </Link>
//       </section>

//       <style>{`
//         .hero-section {
//           text-align: center;
//           padding: 6rem 2rem;
//           background: linear-gradient(135deg, #60a5fa, #1e293b);
//           color: white;
//           border-bottom-left-radius: 2rem;
//           border-bottom-right-radius: 2rem;
//         }

//         .hero-section h1 {
//           font-size: 2.5rem;
//           margin-bottom: 1rem;
//         }

//         .hero-section p {
//           font-size: 1.2rem;
//           margin-bottom: 2rem;
//           max-width: 600px;
//           margin-left: auto;
//           margin-right: auto;
//           line-height: 1.5;
//         }

//         .hero-section button {
//           background-color: white;
//           color: #1e293b;
//           border: none;
//           padding: 0.75rem 2rem;
//           font-size: 1rem;
//           cursor: pointer;
//           border-radius: 0.5rem;
//           transition: transform 0.2s, background-color 0.2s;
//         }

//         .hero-section button:hover {
//           transform: scale(1.05);
//           background-color: #f3f4f6;
//         }

//         @media (min-width: 768px) {
//           .hero-section h1 {
//             font-size: 3rem;
//           }
//           .hero-section p {
//             font-size: 1.5rem;
//           }
//         }
//       `}</style>
//     </>
//   );
// }

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  const [currentStat, setCurrentStat] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);

  const stats = [
    { value: "2,847+", label: "Tenders Processed" },
    { value: "₹184Cr+", label: "Total Value" },
    { value: "94%", label: "Success Rate" },
    { value: "1.2K+", label: "Happy Vendors" }
  ];

  const typingTexts = [
    "educational institutes",
    "government bodies", 
    "private organizations",
    "non-profit entities"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentText = typingTexts[typingIndex];
    if (typedText.length < currentText.length) {
      const timer = setTimeout(() => {
        setTypedText(currentText.slice(0, typedText.length + 1));
      }, 100);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setTypedText("");
        setTypingIndex((prev) => (prev + 1) % typingTexts.length);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [typedText, typingIndex]);

  return (
    <>
      <section className="hero-section">
        {/* Background Elements */}
        <div className="background-grid"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="hero-container">
          {/* Left: Text & CTA */}
          <div className="hero-content">
            <div className="trust-badge">
              <span className="trust-star">⭐</span>
              Trusted by 500+ organizations worldwide
            </div>

            <h1 className="hero-headline">
              Simplify Tender Management for{" "}
              <span className="highlight">
                <span className="typed-text">{typedText}</span>
                <span className="cursor">|</span>
              </span>
            </h1>

            <p className="hero-subtext">
              Join thousands who've transformed their tender processes. 
              <strong> Save 40+ hours monthly</strong> with our intuitive platform designed for real people.
            </p>

            <div className="cta-container">
              <Link to="/signup" className="hero-cta-link">
                <button className="hero-cta-button">
                  <span className="button-text">Start Free Trial</span>
                  <span className="button-subtext">No credit card required</span>
                </button>
              </Link>
              
              <div className="demo-link">
                <span>📺</span>
                <a href="#demo">Watch 2-min demo</a>
              </div>
            </div>

            {/* Social Proof */}
            <div className="social-proof">
              <div className="avatars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i} 
                    className="avatar" 
                    style={{ 
                      backgroundImage: `url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80&crop=face&facepad=3)`,
                      marginLeft: i > 1 ? '-12px' : '0',
                      zIndex: 6 - i
                    }}
                  ></div>
                ))}
                <div className="avatar-count">+428 this week</div>
              </div>
              <div className="rating">
                <div className="stars">★★★★★</div>
                <span>4.9/5 from 1,247 reviews</span>
              </div>
            </div>
          </div>

          {/* Right: Enhanced Dashboard Mockup */}
          <div className="hero-visual">
            <div className="dashboard-container">
              {/* Main Dashboard Card */}
              <div className="main-dashboard">
                <div className="dashboard-header">
                  <div className="header-left">
                    <div className="org-avatar">🏛️</div>
                    <div>
                      <div className="org-name">Ministry of Education</div>
                      <div className="org-subtitle">Active Tenders • 12</div>
                    </div>
                  </div>
                  <div className="notification-bell">🔔</div>
                </div>

                {/* Animated Stats */}
                <div className="stats-slider">
                  {stats.map((stat, index) => (
                    <div 
                      key={index}
                      className={`stat-item ${index === currentStat ? 'active' : ''}`}
                    >
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Tender Cards Stack */}
                <div className="tender-stack">
                  <div className="tender-card featured">
                    <div className="card-badge">Featured</div>
                    <div className="card-content">
                      <h4>Digital Classroom Setup</h4>
                      <p>500 smart boards & learning devices</p>
                      <div className="card-meta">
                        <span className="deadline">⏳ 3 days left</span>
                        <span className="budget">₹2.4Cr</span>
                      </div>
                    </div>
                  </div>

                  <div className="tender-card">
                    <div className="card-content">
                      <h4>Library Automation</h4>
                      <p>RFID system implementation</p>
                      <div className="card-meta">
                        <span className="deadline">⏳ 1 week left</span>
                        <span className="budget">₹87L</span>
                      </div>
                    </div>
                  </div>

                  <div className="tender-card">
                    <div className="card-content">
                      <h4>Campus WiFi Network</h4>
                      <p>High-speed internet infrastructure</p>
                      <div className="card-meta">
                        <span className="deadline">⏳ 2 weeks left</span>
                        <span className="budget">₹1.2Cr</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="progress-indicator">
                  <div className="progress-dots">
                    {[1, 2, 3].map((dot) => (
                      <div key={dot} className={`dot ${dot === 1 ? 'active' : ''}`}></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="success-badge">
                <div className="badge-icon">🎉</div>
                <div className="badge-text">Tender Awarded!</div>
              </div>

              <div className="notification-toast">
                <div className="toast-icon">📋</div>
                <div className="toast-content">
                  <div className="toast-title">New Tender Alert</div>
                  <div className="toast-subtitle">Science Lab Equipment</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero-section {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          color: white;
          padding: 6rem 2rem 8rem;
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          display: flex;
          align-items: center;
        }

        .background-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        .floating-shapes .shape {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 70%);
          animation: floatShape 20s ease-in-out infinite;
        }

        .shape-1 { width: 300px; height: 300px; top: 10%; left: 5%; animation-delay: 0s; }
        .shape-2 { width: 200px; height: 200px; bottom: 20%; right: 10%; animation-delay: 7s; }
        .shape-3 { width: 150px; height: 150px; top: 50%; left: 80%; animation-delay: 14s; }

        @keyframes floatShape {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          33% { transform: translate(30px, -30px) scale(1.1); opacity: 0.5; }
          66% { transform: translate(-20px, 20px) scale(0.9); opacity: 0.4; }
        }

        .hero-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6rem;
          position: relative;
          z-index: 2;
        }

        .hero-content {
          flex: 1;
          max-width: 600px;
        }

        .trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 0.9rem;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .trust-star {
          font-size: 1.1rem;
        }

        .hero-headline {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          background: linear-gradient(to right, #ffffff, #e0e7ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .highlight {
          position: relative;
          display: inline-block;
        }

        .typed-text {
          color: #facc15;
          background: linear-gradient(to right, #facc15, #fde047);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .cursor {
          animation: blink 1s infinite;
          color: #facc15;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .hero-subtext {
          font-size: 1.3rem;
          line-height: 1.6;
          color: #cbd5e1;
          margin-bottom: 2.5rem;
          font-weight: 400;
        }

        .cta-container {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .hero-cta-button {
          background: linear-gradient(135deg, #facc15, #eab308);
          color: #1e293b;
          border: none;
          padding: 1.2rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(250, 204, 21, 0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 200px;
        }

        .hero-cta-button:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 20px 40px rgba(250, 204, 21, 0.4);
        }

        .button-text {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .button-subtext {
          font-size: 0.8rem;
          font-weight: 500;
          opacity: 0.8;
        }

        .demo-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #cbd5e1;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .demo-link:hover {
          color: #facc15;
        }

        .social-proof {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .avatars {
          display: flex;
          align-items: center;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid #0f172a;
          background-size: cover;
          background-position: center;
        }

        .avatar-count {
          margin-left: 8px;
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        .stars {
          color: #facc15;
          font-size: 1rem;
        }

        /* Dashboard Styles */
        .hero-visual {
          flex: 1;
          display: flex;
          justify-content: center;
          perspective: 1200px;
        }

        .dashboard-container {
          position: relative;
          width: 450px;
          height: 500px;
        }

        .main-dashboard {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 2;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .org-avatar {
          font-size: 2rem;
        }

        .org-name {
          font-weight: 700;
          font-size: 1.1rem;
        }

        .org-subtitle {
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        .notification-bell {
          font-size: 1.2rem;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .notification-bell:hover {
          transform: scale(1.1);
        }

        .stats-slider {
          height: 60px;
          position: relative;
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .stat-item {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.5s ease;
          text-align: center;
        }

        .stat-item.active {
          opacity: 1;
          transform: translateY(0);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #facc15;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        .tender-stack {
          position: relative;
          height: 200px;
          margin-bottom: 1rem;
        }

        .tender-card {
          position: absolute;
          width: 100%;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .tender-card.featured {
          top: 0;
          z-index: 3;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(250, 204, 21, 0.5);
        }

        .tender-card:nth-child(2) {
          top: 10px;
          z-index: 2;
          transform: scale(0.95);
          opacity: 0.8;
        }

        .tender-card:nth-child(3) {
          top: 20px;
          z-index: 1;
          transform: scale(0.9);
          opacity: 0.6;
        }

        .card-badge {
          position: absolute;
          top: -8px;
          right: 20px;
          background: #facc15;
          color: #1e293b;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .card-content h4 {
          margin: 0 0 8px 0;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .card-content p {
          margin: 0 0 12px 0;
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
        }

        .deadline {
          color: #f97316;
        }

        .budget {
          color: #10b981;
          font-weight: 700;
        }

        .progress-indicator {
          display: flex;
          justify-content: center;
        }

        .progress-dots {
          display: flex;
          gap: 8px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .dot.active {
          background: #facc15;
          transform: scale(1.2);
        }

        .success-badge {
          position: absolute;
          top: -20px;
          right: -20px;
          background: linear-gradient(135deg, #10b981, #059669);
          padding: 12px 16px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
          animation: bounce 2s ease-in-out infinite;
          z-index: 3;
        }

        .notification-toast {
          position: absolute;
          bottom: -30px;
          left: -40px;
          background: rgba(255, 255, 255, 0.95);
          color: #1e293b;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          animation: slideIn 8s ease-in-out infinite;
          z-index: 3;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes slideIn {
          0%, 65%, 100% { transform: translateX(-100px); opacity: 0; }
          70%, 95% { transform: translateX(0); opacity: 1; }
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .hero-container {
            gap: 4rem;
          }
          .hero-headline {
            font-size: 3rem;
          }
        }

        @media (max-width: 992px) {
          .hero-container {
            flex-direction: column;
            text-align: center;
            gap: 4rem;
          }
          .hero-content {
            max-width: 100%;
          }
          .cta-container {
            justify-content: center;
          }
          .social-proof {
            justify-content: center;
          }
          .dashboard-container {
            width: 400px;
            height: 450px;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 4rem 1rem 6rem;
          }
          .hero-headline {
            font-size: 2.5rem;
          }
          .hero-subtext {
            font-size: 1.1rem;
          }
          .cta-container {
            flex-direction: column;
            gap: 1rem;
          }
          .social-proof {
            flex-direction: column;
            gap: 1rem;
          }
          .dashboard-container {
            width: 350px;
            height: 400px;
          }
          .main-dashboard {
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}