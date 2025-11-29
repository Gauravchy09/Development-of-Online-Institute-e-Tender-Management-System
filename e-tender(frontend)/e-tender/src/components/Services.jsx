import React from "react";

function ServiceCard({ title, description }) {
  return (
    <div className="service-card">
      <h2>{title}</h2>
      <p>{description}</p>

      <style>{`
        .service-card {
          background-color: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          text-align: center;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .service-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .service-card h2 {
          font-size: 1.5rem;
          font-weight: bold;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .service-card p {
          color: #4b5563;
          font-size: 1rem;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

export default function Services() {
  return (
    <section className="services-section">
      <h1>Our Services</h1>
      <div className="services-grid">
        <ServiceCard
          title="Web Development"
          description="Build responsive and modern websites tailored to your needs."
        />
        <ServiceCard
          title="Mobile Apps"
          description="Create high-performance Android & iOS applications."
        />
        <ServiceCard
          title="UI/UX Design"
          description="Design user-friendly, visually appealing, and intuitive interfaces."
        />
      </div>

      <style>{`
        .services-section {
          padding: 4rem 1.5rem;
          background-color: #f9fafb;
          border-top: 4px solid #60a5fa;
          text-align: center;
        }

        .services-section h1 {
          font-size: 2rem;
          font-weight: bold;
          color: #111827;
          margin-bottom: 3rem;
        }

        .services-grid {
          display: grid;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .services-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .services-section h1 {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </section>
  );
}
