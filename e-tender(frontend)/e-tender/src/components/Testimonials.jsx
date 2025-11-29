import React from "react";

export default function Testimonials() {
  const testimonials = [
    { name: "Institute A", text: "This platform saved us weeks of paperwork!" },
    { name: "Vendor B", text: "Fair, fast, and transparent process. Highly recommend!" },
    { name: "Institute C", text: "Managing tenders has never been this easy." },
  ];

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <h2>What People Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <p>"{t.text}"</p>
              <h4>{t.name}</h4>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .testimonials-section {
          padding: 4rem 1.5rem;
          background-color: #f3f4f6;
          text-align: center;
        }

        .testimonials-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .testimonials-section h2 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 2rem;
          color: #111827;
        }

        .testimonials-grid {
          display: grid;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .testimonials-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .testimonial-card {
          background-color: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .testimonial-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.15);
        }

        .testimonial-card p {
          font-style: italic;
          color: #4b5563;
          margin-bottom: 1rem;
        }

        .testimonial-card h4 {
          font-weight: bold;
          color: #111827;
        }
      `}</style>
    </section>
  );
}
