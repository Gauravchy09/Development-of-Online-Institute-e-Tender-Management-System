import React from "react";

export default function HowItWorks() {
  const steps = [
    { id: 1, title: "Register", desc: "Vendors and institutes create their accounts." },
    { id: 2, title: "Post/Find Tenders", desc: "Institutes post tenders, vendors browse and bid." },
    { id: 3, title: "Bid Evaluation", desc: "Institutes review bids transparently." },
    { id: 4, title: "Award Contract", desc: "Winners are notified and contracts awarded." },
  ];

  return (
    <>
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps-grid">
            {steps.map((step) => (
              <div key={step.id} className="step-card">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .how-it-works {
            padding: 4rem 2rem;
            background-color: #f9fafb;
          }

          .how-it-works .container {
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
            padding: 0 1rem;
          }

          .how-it-works h2 {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 2.5rem;
          }

          .steps-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .step-card {
            background-color: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .step-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 12px rgba(0,0,0,0.15);
          }

          .step-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #1d4ed8;
          }

          .step-card p {
            color: #4b5563;
            font-size: 1rem;
            line-height: 1.5;
          }

          @media (min-width: 768px) {
            .steps-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (min-width: 1024px) {
            .steps-grid {
              grid-template-columns: repeat(4, 1fr);
            }
          }
        `}</style>
      </section>
    </>
  );
}
