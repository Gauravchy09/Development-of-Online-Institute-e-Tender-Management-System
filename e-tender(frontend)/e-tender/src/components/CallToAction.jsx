export default function CallToAction() {
  return (
    <>
      <section className="cta-section">
        <h2 className="cta-title">Ready to Simplify Tendering?</h2>
        <p className="cta-text">Join hundreds of institutes and vendors using our platform today.</p>
        <a href="/signup" className="cta-button">
          Get Started
        </a>
      </section>

      <style>{`
        .cta-section {
          padding: 4rem 1.5rem;
          background-color: #2563eb; /* blue-600 */
          color: white;
          text-align: center;
        }
        .cta-title {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .cta-text {
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }
        .cta-button {
          background-color: white;
          color: #2563eb;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          text-decoration: none;
          transition: background-color 0.2s;
        }
        .cta-button:hover {
          background-color: #f3f4f6; /* gray-100 */
        }
        @media (min-width: 768px) {
          .cta-title {
            font-size: 2.5rem;
          }
          .cta-text {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </>
  );
}
