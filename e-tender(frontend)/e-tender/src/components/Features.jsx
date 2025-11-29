import React, { useState, useEffect } from "react";
import { FiBell, FiFileText, FiUpload, FiBarChart2, FiShield, FiClock, FiUsers, FiCheckCircle } from "react-icons/fi";

function FeatureCard({ title, description, Icon, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`feature-card ${isVisible ? 'visible' : ''}`}>
      <div className="icon-wrapper">
        <Icon className="feature-icon" />
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
      <div className="card-glow"></div>
    </div>
  );
}

export default function Features() {
  const features = [
    {
      title: "Active Tenders",
      description: "Browse all available tenders with complete details and advanced filtering options.",
      Icon: FiFileText
    },
    {
      title: "Submit Tender",
      description: "Upload and submit your tender documents securely with our streamlined process.",
      Icon: FiUpload
    },
    {
      title: "Track Submissions",
      description: "Monitor real-time status of your submitted tenders with detailed progress tracking.",
      Icon: FiBarChart2
    },
    {
      title: "Notifications",
      description: "Get instant alerts for new tenders, deadlines, and important updates.",
      Icon: FiBell
    },
    {
      title: "Secure Platform",
      description: "Bank-level security for all your documents and sensitive information.",
      Icon: FiShield
    },
    {
      title: "Deadline Management",
      description: "Smart reminders and alerts to never miss important tender deadlines.",
      Icon: FiClock
    }
  ];

  return (
    <>
      <section className="features-section" id="features">
        {/* Background Elements */}
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="container">
          {/* Section Header */}
          <div className="section-header">
            <h2 className="features-heading">
              Platform Features
            </h2>
            <p className="features-subheading">
              Everything you need to manage tenders efficiently and effectively
            </p>
          </div>

          {/* Features Grid */}
          <div className="features-grid">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                Icon={feature.Icon}
                delay={index * 100}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="features-cta">
            <div className="cta-content">
              <FiCheckCircle className="cta-icon" />
              <div>
                <h3>Ready to Get Started?</h3>
                <p>Join thousands of organizations managing their tenders efficiently</p>
              </div>
            </div>
            <button className="cta-button">
              Get Started
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
        .features-section {
          padding: 6rem 2rem;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          position: relative;
          overflow: hidden;
        }

        .floating-shapes {
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
          background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
          animation: float 20s ease-in-out infinite;
        }

        .shape-1 { width: 200px; height: 200px; top: 10%; left: 5%; animation-delay: 0s; }
        .shape-2 { width: 150px; height: 150px; bottom: 20%; right: 10%; animation-delay: 7s; }
        .shape-3 { width: 100px; height: 100px; top: 60%; left: 80%; animation-delay: 14s; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.1); }
          66% { transform: translate(-15px, 15px) scale(0.9); }
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .features-heading {
          font-size: 3rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 1.5rem;
          background: linear-gradient(to right, #ffffff, #cbd5e1);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          line-height: 1.1;
        }

        .features-subheading {
          text-align: center;
          font-size: 1.25rem;
          color: #94a3b8;
          max-width: 600px;
          margin: 0 auto;
          font-weight: 400;
          line-height: 1.6;
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 2rem;
          margin-bottom: 4rem;
        }

        @media (min-width: 768px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .feature-card {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 1rem;
          padding: 2.5rem 2rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          transform: translateY(20px);
        }

        .feature-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .feature-card:hover {
          transform: translateY(-8px);
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .icon-wrapper {
          width: 70px;
          height: 70px;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .feature-card:hover .icon-wrapper {
          transform: scale(1.1);
          background: linear-gradient(135deg, #4f46e5, #4338ca);
        }

        .feature-icon {
          font-size: 1.75rem;
          color: white;
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 1rem;
        }

        .feature-desc {
          font-size: 0.95rem;
          color: #94a3b8;
          line-height: 1.6;
          margin: 0;
        }

        .card-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }

        .feature-card:hover .card-glow {
          opacity: 1;
        }

        /* Bottom CTA */
        .features-cta {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.05));
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 1.5rem;
          padding: 3rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
          text-align: center;
        }

        @media (min-width: 768px) {
          .features-cta {
            text-align: left;
            padding: 3rem;
          }
        }

        .cta-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex: 1;
          justify-content: center;
        }

        @media (min-width: 768px) {
          .cta-content {
            justify-content: flex-start;
          }
        }

        .cta-icon {
          font-size: 2.5rem;
          color: #6366f1;
          flex-shrink: 0;
        }

        .cta-content h3 {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .cta-content p {
          color: #cbd5e1;
          font-size: 1rem;
          margin: 0;
        }

        .cta-button {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          border: none;
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .cta-button:hover {
          background: linear-gradient(135deg, #4f46e5, #4338ca);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .features-section {
            padding: 4rem 1rem;
          }
          
          .features-heading {
            font-size: 2.5rem;
          }
          
          .features-subheading {
            font-size: 1.1rem;
          }
          
          .features-cta {
            padding: 2rem 1.5rem;
            flex-direction: column;
            text-align: center;
          }
          
          .cta-content {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          
          .feature-card {
            padding: 2rem 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .features-heading {
            font-size: 2rem;
          }
          
          .features-subheading {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}